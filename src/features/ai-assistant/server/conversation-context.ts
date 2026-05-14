import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AiConversationContext,
  AiLeadPriority,
} from "@/features/ai-assistant/types/ai-assistant";

type Related<T> = T | T[] | null | undefined;

type ContactRow = {
  city: string | null;
  email: string | null;
  id: string;
  name: string | null;
  phone: string | null;
};

type LeadRow = {
  best_contact_time: string | null;
  city: string | null;
  converted_at: string | null;
  description: string | null;
  id: string;
  legal_area: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  name: string;
  priority: AiLeadPriority;
  source: string;
  summary: string | null;
};

type ConversationRow = {
  assigned_to: string | null;
  ai_paused_at: string | null;
  channel: string;
  contact_id: string | null;
  contacts: Related<ContactRow>;
  id: string;
  lead_id: string | null;
  leads: Related<LeadRow>;
  priority: AiLeadPriority;
  status: string;
};

type CustomerRow = {
  id: string;
  name: string;
};

type MessageRow = {
  body: string | null;
  direction: string;
  id: string;
  kind: string;
  sent_at: string;
};

function relatedOne<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function mapMessageDirection(direction: string): AiConversationContext["recentMessages"][number]["direction"] {
  if (direction === "inbound") return "client";
  if (direction === "outbound") return "team";
  if (direction === "internal") return "internal";

  return "assistant";
}

async function getCustomer(
  supabase: SupabaseClient,
  params: {
    contactId: string | null;
    leadId: string | null;
  },
) {
  const filters = [];

  if (params.leadId) {
    filters.push(`lead_id.eq.${params.leadId}`);
  }

  if (params.contactId) {
    filters.push(`contact_id.eq.${params.contactId}`);
  }

  if (!filters.length) return null;

  const { data } = await supabase
    .from("customers")
    .select("id,name")
    .or(filters.join(","))
    .order("converted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as CustomerRow | null;
}

export async function getAiConversationContext(
  supabase: SupabaseClient,
  params: {
    conversationId: string;
    maxRecentMessages?: number;
    messageId: string;
  },
): Promise<AiConversationContext | null> {
  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select(
      "id,contact_id,lead_id,channel,status,priority,assigned_to,ai_paused_at,contacts(id,name,phone,email,city),leads(id,name,phone,city,legal_area,description,summary,source,priority,best_contact_time,converted_at,lost_at,lost_reason)",
    )
    .eq("id", params.conversationId)
    .maybeSingle();

  if (conversationError || !conversationData) {
    throw new Error("Não foi possível carregar o contexto da conversa para IA.");
  }

  const conversation = conversationData as ConversationRow;
  const contact = relatedOne(conversation.contacts);
  const lead = relatedOne(conversation.leads);
  const customer = await getCustomer(supabase, {
    contactId: contact?.id ?? conversation.contact_id,
    leadId: lead?.id ?? conversation.lead_id,
  });

  const { data: targetMessageData, error: targetMessageError } = await supabase
    .from("messages")
    .select("id,body,direction,kind,sent_at")
    .eq("id", params.messageId)
    .eq("conversation_id", params.conversationId)
    .maybeSingle();

  if (targetMessageError || !targetMessageData) {
    throw new Error("Não foi possível carregar a mensagem para IA.");
  }

  const targetMessage = targetMessageData as MessageRow;

  const { data: recentMessagesData } = await supabase
    .from("messages")
    .select("id,body,direction,kind,sent_at")
    .eq("conversation_id", params.conversationId)
    .order("sent_at", { ascending: false })
    .limit(params.maxRecentMessages ?? 8);

  const recentMessages = ((recentMessagesData ?? []) as MessageRow[])
    .filter((message) => hasValue(message.body))
    .reverse()
    .map((message) => ({
      body: message.body ?? "",
      direction: mapMessageDirection(message.direction),
      sentAt: message.sent_at,
    }));

  return {
    contact: {
      city: contact?.city ?? lead?.city ?? null,
      emailKnown: hasValue(contact?.email),
      id: contact?.id ?? conversation.contact_id,
      name: contact?.name ?? lead?.name ?? null,
      phoneKnown: hasValue(contact?.phone),
    },
    conversation: {
      assignedTo: conversation.assigned_to,
      aiPausedAt: conversation.ai_paused_at,
      channel: conversation.channel,
      id: conversation.id,
      priority: conversation.priority,
      status: conversation.status,
    },
    customer,
    lead: lead
      ? {
          bestContactTime: lead.best_contact_time,
          city: lead.city,
          convertedAt: lead.converted_at,
          description: lead.description,
          id: lead.id,
          legalArea: lead.legal_area,
          lostAt: lead.lost_at,
          lostReason: lead.lost_reason,
          name: lead.name,
          priority: lead.priority,
          source: lead.source,
          summary: lead.summary,
        }
      : null,
    recentMessages,
    targetMessage: {
      body: targetMessage.body ?? "",
      direction: targetMessage.direction,
      id: targetMessage.id,
      kind: targetMessage.kind,
    },
  };
}
