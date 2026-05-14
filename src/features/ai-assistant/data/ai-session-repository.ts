import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AiAssistantResponse } from "@/features/ai-assistant/types/ai-assistant";

type AiSessionRow = {
  id: string;
};

export async function getOrCreateAiSession(
  supabase: SupabaseClient,
  params: {
    contactId: string | null;
    conversationId: string;
    leadId: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const { data: existing } = await supabase
    .from("ai_sessions")
    .select("id")
    .eq("conversation_id", params.conversationId)
    .eq("status", "open")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return (existing as AiSessionRow).id;

  const { data, error } = await supabase
    .from("ai_sessions")
    .insert({
      contact_id: params.contactId,
      conversation_id: params.conversationId,
      lead_id: params.leadId,
      metadata: params.metadata ?? {},
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Não foi possível criar a sessão da IA.");
  }

  return (data as AiSessionRow).id;
}

export async function recordAiMessage(
  supabase: SupabaseClient,
  params: {
    content: string;
    role: "model" | "system" | "user";
    sessionId: string;
  },
) {
  const { error } = await supabase.from("ai_messages").insert({
    ai_session_id: params.sessionId,
    content: params.content,
    role: params.role,
  });

  if (error) {
    throw new Error("Não foi possível salvar a mensagem da IA.");
  }
}

export async function recordAiClassification(
  supabase: SupabaseClient,
  params: {
    leadId: string | null;
    response: AiAssistantResponse;
    sessionId: string;
  },
) {
  const { error } = await supabase.from("ai_classifications").insert({
    ai_session_id: params.sessionId,
    conversion_potential: params.response.classification.conversionPotential,
    immediate_attention: params.response.classification.immediateAttention,
    lead_id: params.leadId,
    legal_area: params.response.classification.legalArea,
    metadata: {
      collectedFields: params.response.collectedFields,
      handoffRequired: params.response.handoffRequired,
      safety: params.response.safety,
      shouldSendReply: params.response.shouldSendReply,
    },
    priority: params.response.classification.priority,
    summary: params.response.classification.summary,
  });

  if (error) {
    throw new Error("Não foi possível salvar a classificação da IA.");
  }
}

export async function closeAiSession(
  supabase: SupabaseClient,
  params: {
    metadata?: Record<string, unknown>;
    sessionId: string;
    status: "closed" | "failed" | "human_review";
  },
) {
  await supabase
    .from("ai_sessions")
    .update({
      ended_at: new Date().toISOString(),
      metadata: params.metadata ?? {},
      status: params.status,
    })
    .eq("id", params.sessionId);
}
