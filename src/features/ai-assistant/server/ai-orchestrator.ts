import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  closeAiSession,
  getOrCreateAiSession,
  recordAiClassification,
  recordAiMessage,
} from "@/features/ai-assistant/data/ai-session-repository";
import { getAiAssistantSettings } from "@/features/ai-assistant/data/ai-settings";
import { getAiConversationContext } from "@/features/ai-assistant/server/conversation-context";
import {
  GeminiRequestError,
  generateAiAssistantResponse,
  getGeminiModel,
} from "@/features/ai-assistant/server/gemini-client";
import { buildAiAssistantPrompt } from "@/features/ai-assistant/server/prompt";
import type {
  AiAssistantResponse,
  AiAssistantRunResult,
  AiConversationContext,
} from "@/features/ai-assistant/types/ai-assistant";

function shouldBlockAutomaticRun(
  context: NonNullable<Awaited<ReturnType<typeof getAiConversationContext>>>,
) {
  if (context.targetMessage.direction !== "inbound") {
    return "Mensagem enviada pela equipe não deve acionar IA.";
  }

  if (context.targetMessage.kind !== "text") {
    return "IA automática ainda não processa mídia sem transcrição.";
  }

  if (!context.targetMessage.body.trim()) {
    return "Mensagem sem texto para a IA.";
  }

  if (context.conversation.assignedTo) {
    return "Atendimento humano já assumiu a conversa.";
  }

  if (context.conversation.aiPausedAt) {
    return "IA pausada neste atendimento.";
  }

  if (context.conversation.status === "closed") {
    return "Conversa encerrada.";
  }

  return null;
}

async function registerLeadEvent(
  supabase: SupabaseClient,
  params: {
    description: string;
    leadId: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  if (!params.leadId) return;

  await supabase.from("lead_events").insert({
    description: params.description,
    event_type: "ai_assistant_classification",
    lead_id: params.leadId,
    metadata: params.metadata ?? {},
  });
}

function textValue(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function updateLeadFromAiResponse(
  supabase: SupabaseClient,
  params: {
    context: AiConversationContext;
    response: AiAssistantResponse;
  },
) {
  const lead = params.context.lead;

  if (!lead || lead.convertedAt || lead.lostAt) return;

  const updates: Record<string, string> = {
    priority: params.response.classification.priority,
  };
  const legalArea = textValue(params.response.classification.legalArea);
  const summary = textValue(params.response.classification.summary);
  const city = textValue(params.response.collectedFields.city);
  const bestContactTime = textValue(params.response.collectedFields.bestContactTime);
  const description = textValue(params.response.collectedFields.shortDescription);

  if (legalArea) updates.legal_area = legalArea;
  if (summary) updates.summary = summary;
  if (city && !lead.city) updates.city = city;
  if (bestContactTime && !lead.bestContactTime) {
    updates.best_contact_time = bestContactTime;
  }
  if (description && !lead.description) updates.description = description;

  await supabase.from("leads").update(updates).eq("id", lead.id);
}

async function updateConversationFromAiResponse(
  supabase: SupabaseClient,
  params: {
    context: AiConversationContext;
    response: AiAssistantResponse;
    shouldSendReply: boolean;
  },
) {
  const priority =
    params.response.classification.immediateAttention ||
    params.response.classification.priority === "high"
      ? "high"
      : params.response.classification.priority;
  const needsHuman =
    params.response.handoffRequired || params.response.safety.requiresHumanReview;

  await supabase
    .from("conversations")
    .update({
      priority,
      status: params.shouldSendReply && !needsHuman ? "waiting_client" : "unanswered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.context.conversation.id);
}

export async function runAiAssistantForMessage(
  supabase: SupabaseClient,
  params: {
    allowAutomaticReply?: boolean;
    conversationId: string;
    messageId: string;
  },
): Promise<AiAssistantRunResult> {
  const settings = await getAiAssistantSettings(supabase);

  if (!settings.enabled) {
    return {
      decision: "blocked",
      reason: "IA desativada no painel.",
      shouldSendReply: false,
    };
  }

  const context = await getAiConversationContext(supabase, {
    conversationId: params.conversationId,
    maxRecentMessages: settings.maxContextMessages,
    messageId: params.messageId,
  });

  if (!context) {
    return {
      decision: "skipped",
      reason: "Contexto não encontrado.",
      shouldSendReply: false,
    };
  }

  const blockReason = shouldBlockAutomaticRun(context);

  if (blockReason) {
    return {
      decision: "blocked",
      reason: blockReason,
      shouldSendReply: false,
    };
  }

  const sessionId = await getOrCreateAiSession(supabase, {
    contactId: context.contact.id,
    conversationId: context.conversation.id,
    leadId: context.lead?.id ?? null,
    metadata: {
      model: getGeminiModel(settings.model),
      operationMode: settings.operationMode,
      settingsUpdatedAt: settings.updatedAt,
      source: "whatsapp",
    },
  });

  await recordAiMessage(supabase, {
    content: context.targetMessage.body,
    role: "user",
    sessionId,
  });

  try {
    const response = await generateAiAssistantResponse(
      buildAiAssistantPrompt(context, settings),
      settings.model,
    );
    const blockedBySafety =
      response.safety.gaveLegalAdvice ||
      response.safety.impersonatedLawyer ||
      response.safety.promisedOutcome;
    const shouldSendReply =
      Boolean(params.allowAutomaticReply) &&
      settings.automaticReplyEnabled &&
      response.shouldSendReply &&
      !blockedBySafety;

    await updateLeadFromAiResponse(supabase, {
      context,
      response,
    });

    await updateConversationFromAiResponse(supabase, {
      context,
      response,
      shouldSendReply,
    });

    await recordAiMessage(supabase, {
      content: response.reply,
      role: "model",
      sessionId,
    });

    await recordAiClassification(supabase, {
      leadId: context.lead?.id ?? null,
      response,
      sessionId,
    });

    await registerLeadEvent(supabase, {
      description: response.handoffRequired
        ? "IA classificou o atendimento e solicitou encaminhamento humano."
        : "IA classificou o atendimento inicial.",
      leadId: context.lead?.id ?? null,
      metadata: {
        conversionPotential: response.classification.conversionPotential,
        immediateAttention: response.classification.immediateAttention,
        legalArea: response.classification.legalArea,
        priority: response.classification.priority,
        sessionId,
      },
    });

    if (blockedBySafety || !shouldSendReply) {
      return {
        decision: "saved_for_human",
        reason: blockedBySafety
          ? "Resposta bloqueada por regra jurídica defensiva."
          : "Resposta salva para revisão humana.",
        response,
        sessionId,
        shouldSendReply: false,
      };
    }

    return {
      decision: "ready",
      response,
      sessionId,
      shouldSendReply,
    };
  } catch (error) {
    const metadata: Record<string, unknown> = {
      error:
        error instanceof Error
          ? error.name
          : "UnknownAiAssistantError",
    };

    if (error instanceof GeminiRequestError) {
      metadata.attempts = error.attempts ?? null;
      metadata.retryable = error.retryable ?? null;
      metadata.status = error.status ?? null;
    }

    await closeAiSession(supabase, {
      metadata,
      sessionId,
      status: "failed",
    });

    return {
      decision: "failed",
      reason: "Falha na IA. Atendimento deve seguir com humano.",
      sessionId,
      shouldSendReply: false,
    };
  }
}
