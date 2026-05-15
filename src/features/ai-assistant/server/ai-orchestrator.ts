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
  transcribeAudioWithGemini,
} from "@/features/ai-assistant/server/gemini-client";
import { buildAiAssistantPrompt } from "@/features/ai-assistant/server/prompt";
import type {
  AiAssistantResponse,
  AiAssistantRunResult,
  AiConversationContext,
} from "@/features/ai-assistant/types/ai-assistant";

const MAX_INLINE_AUDIO_BYTES = 19 * 1024 * 1024;

type AudioAttachmentRow = {
  file_size: number | null;
  file_type: string | null;
  storage_bucket: string;
  storage_path: string;
};

type MessageMetadataRow = {
  body: string | null;
  metadata: Record<string, unknown> | null;
};

function shouldBlockAutomaticRun(
  context: NonNullable<Awaited<ReturnType<typeof getAiConversationContext>>>,
) {
  if (context.targetMessage.direction !== "inbound") {
    return "Mensagem enviada pela equipe não deve acionar IA.";
  }

  if (context.targetMessage.kind === "audio" && !context.targetMessage.transcribedAudio) {
    return "Áudio recebido, mas ainda sem transcrição para a IA.";
  }

  if (context.targetMessage.kind !== "text" && context.targetMessage.kind !== "audio") {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function metadataHasAudioTranscription(metadata: Record<string, unknown> | null | undefined) {
  const transcription = metadata?.audioTranscription;

  return (
    isRecord(transcription) &&
    typeof transcription.text === "string" &&
    textValue(transcription.text) !== null
  );
}

async function getAudioAttachment(
  supabase: SupabaseClient,
  messageId: string,
) {
  const { data } = await supabase
    .from("attachments")
    .select("file_size,file_type,storage_bucket,storage_path")
    .eq("message_id", messageId)
    .like("file_type", "audio/%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as AudioAttachmentRow | null;
}

async function downloadAudioAsBase64(
  supabase: SupabaseClient,
  attachment: AudioAttachmentRow,
) {
  if (attachment.file_size && attachment.file_size > MAX_INLINE_AUDIO_BYTES) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(attachment.storage_bucket)
    .download(attachment.storage_path);

  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_INLINE_AUDIO_BYTES) {
    return null;
  }

  return Buffer.from(arrayBuffer).toString("base64");
}

async function transcribeTargetAudioMessage(
  supabase: SupabaseClient,
  params: {
    leadId: string | null;
    messageId: string;
    model: string | null;
  },
) {
  const { data: messageData } = await supabase
    .from("messages")
    .select("body,metadata")
    .eq("id", params.messageId)
    .maybeSingle();
  const message = messageData as MessageMetadataRow | null;

  if (metadataHasAudioTranscription(message?.metadata)) {
    return true;
  }

  const attachment = await getAudioAttachment(supabase, params.messageId);

  if (!attachment?.file_type?.startsWith("audio/")) {
    return false;
  }

  const base64 = await downloadAudioAsBase64(supabase, attachment);

  if (!base64) {
    await registerLeadEvent(supabase, {
      description: "IA não transcreveu o áudio porque o arquivo não pôde ser baixado ou excede o limite suportado.",
      leadId: params.leadId,
      metadata: {
        messageId: params.messageId,
        reason: "audio_download_or_size_limit",
      },
    });
    return false;
  }

  try {
    const transcription = await transcribeAudioWithGemini({
      base64,
      mimeType: attachment.file_type,
      model: params.model,
    });

    if (!transcription) return false;

    await supabase
      .from("messages")
      .update({
        body: transcription,
        metadata: {
          ...(message?.metadata ?? {}),
          audioTranscription: {
            createdAt: new Date().toISOString(),
            model: getGeminiModel(params.model),
            provider: "gemini",
            text: transcription,
          },
        },
      })
      .eq("id", params.messageId);

    return true;
  } catch (error) {
    await registerLeadEvent(supabase, {
      description: "IA não conseguiu transcrever o áudio recebido.",
      leadId: params.leadId,
      metadata: {
        error: error instanceof Error ? error.name : "UnknownAudioTranscriptionError",
        messageId: params.messageId,
      },
    });

    return false;
  }
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

  let context = await getAiConversationContext(supabase, {
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

  if (context.targetMessage.kind === "audio" && !context.targetMessage.transcribedAudio) {
    const transcribed = await transcribeTargetAudioMessage(supabase, {
      leadId: context.lead?.id ?? null,
      messageId: context.targetMessage.id,
      model: settings.model,
    });

    if (transcribed) {
      context = await getAiConversationContext(supabase, {
        conversationId: params.conversationId,
        maxRecentMessages: settings.maxContextMessages,
        messageId: params.messageId,
      });
    }
  }

  if (!context) {
    return {
      decision: "skipped",
      reason: "Contexto não encontrado após transcrição do áudio.",
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
