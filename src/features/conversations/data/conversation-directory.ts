import { notFound } from "next/navigation";

import type { AiAssistantOperationMode } from "@/features/ai-assistant/types/ai-assistant";
import type {
  ConversationFilters,
  ConversationOption,
  ConversationPriority,
  ConversationStatus,
  MessageDeliveryStatus,
  MessageDirection,
} from "@/features/conversations/types/conversation";
import {
  getLeadStatus,
  type LeadPriority,
  type LeadStatus,
} from "@/features/leads/types/lead";
import type { PipelineStage } from "@/features/pipeline/types/pipeline";
import { requireCurrentUser } from "@/server/auth/session";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

type RelatedProfile = { email: string | null; full_name: string | null };
type RelatedContact = {
  city: string | null;
  email: string | null;
  name: string | null;
  phone: string | null;
};
type RelatedLead = {
  converted_at: string | null;
  email: string | null;
  id: string;
  legal_area: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  name: string;
  phone: string | null;
  pipeline_stage_id: string | null;
  pipeline_stages?: RelatedStage | RelatedStage[] | null;
  priority: LeadPriority;
  source: string;
};
type RelatedStage = {
  id: string;
  is_lost: boolean;
  is_won: boolean;
  name: string;
  position: number;
  slug: string;
};

type ConversationRow = {
  assigned_to: string | null;
  assignee?: RelatedProfile | RelatedProfile[] | null;
  aiPausedBy?: RelatedProfile | RelatedProfile[] | null;
  ai_pause_reason: string | null;
  ai_paused_at: string | null;
  ai_paused_by: string | null;
  channel: string;
  contact_id: string | null;
  contacts?: RelatedContact | RelatedContact[] | null;
  created_at: string;
  id: string;
  last_message_at: string | null;
  lead_id: string | null;
  leads?: RelatedLead | RelatedLead[] | null;
  priority: ConversationPriority;
  status: ConversationStatus;
  updated_at: string;
};

type MessageRow = {
  attachments?: MessageAttachmentRow[] | null;
  body: string | null;
  created_at: string;
  delivery_error: string | null;
  delivery_status: MessageDeliveryStatus;
  direction: MessageDirection;
  id: string;
  kind: string;
  metadata: Record<string, unknown>;
  retry_count: number;
  sender?: RelatedProfile | RelatedProfile[] | null;
  sent_at: string;
};

type AiClassificationRow = {
  conversion_potential: number | null;
  created_at: string;
  immediate_attention: boolean;
  legal_area: string | null;
  metadata: Record<string, unknown>;
  priority: ConversationPriority | null;
  summary: string | null;
};

type MessageAttachmentRow = {
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  id: string;
  storage_bucket: string;
  storage_path: string;
};

type LastMessageRow = MessageRow & {
  conversation_id: string;
};

export type ConversationCommercialStatus = "customer" | "lead" | "lost" | "unlinked";

export type ConversationListItem = {
  aiPauseReason: string | null;
  aiPausedAt: string | null;
  aiPausedByName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  commercialStatus: ConversationCommercialStatus;
  contactEmail: string | null;
  contactId: string | null;
  contactName: string;
  contactPhone: string | null;
  href: string;
  id: string;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  lastMessageDirection: MessageDirection | null;
  leadId: string | null;
  legalArea: string | null;
  priority: ConversationPriority;
  selected: boolean;
  status: ConversationStatus;
};

export type ConversationMessage = {
  attachments: ConversationMessageAttachment[];
  authorName: string | null;
  body: string | null;
  createdAt: string;
  deliveryError: string | null;
  deliveryStatus: MessageDeliveryStatus;
  direction: MessageDirection;
  id: string;
  isAiGenerated: boolean;
  isAudioTranscribed: boolean;
  aiSessionId: string | null;
  kind: string;
  retryCount: number;
  sentAt: string;
};

export type ConversationMessageAttachment = {
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  id: string;
  signedUrl: string | null;
};

export type ConversationDetail = ConversationListItem & {
  aiSummary: ConversationAiSummary | null;
  city: string | null;
  channel: string;
  createdAt: string;
  lead: ConversationLeadContext | null;
  leadName: string | null;
  messages: ConversationMessage[];
};

export type ConversationAiSummary = {
  bestContactTime: string | null;
  conversionPotential: number | null;
  createdAt: string;
  handoffRequired: boolean | null;
  immediateAttention: boolean;
  legalArea: string | null;
  priority: ConversationPriority | null;
  requiresHumanReview: boolean | null;
  shouldSendReply: boolean | null;
  shortDescription: string | null;
  summary: string | null;
};

export type ConversationLeadContext = {
  convertedAt: string | null;
  customerId: string | null;
  id: string;
  lostAt: string | null;
  lostReason: string | null;
  name: string;
  pipelineStageId: string | null;
  pipelineStageName: string | null;
  priority: LeadPriority;
  source: string;
  status: LeadStatus;
};

export type ConversationQuickReply = {
  content: string;
  id: string;
  title: string;
};

export type ConversationAiAvailability = {
  automaticReplyEnabled: boolean;
  enabled: boolean;
  operationMode: AiAssistantOperationMode;
};

export type ConversationInboxData = {
  aiAvailability: ConversationAiAvailability;
  assignees: ConversationOption[];
  conversations: ConversationListItem[];
  currentUserId: string;
  filters: ConversationFilters;
  pipelineStages: PipelineStage[];
  quickReplies: ConversationQuickReply[];
  selectedConversation: ConversationDetail | null;
};

const conversationSelect =
  "id,contact_id,lead_id,channel,status,priority,assigned_to,ai_paused_at,ai_paused_by,ai_pause_reason,last_message_at,created_at,updated_at,contacts(name,phone,email,city),leads(id,name,phone,email,legal_area,source,priority,pipeline_stage_id,converted_at,lost_at,lost_reason,pipeline_stages(id,name,slug,position,is_won,is_lost)),assignee:profiles!conversations_assigned_to_fkey(full_name,email),aiPausedBy:profiles!conversations_ai_paused_by_fkey(full_name,email)";

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function profileLabel(profile: RelatedProfile | null) {
  return profile?.full_name || profile?.email || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function metadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value : null;
}

function metadataBoolean(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return typeof value === "boolean" ? value : null;
}

function nestedMetadataRecord(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return isRecord(value) ? value : {};
}

function cleanFilterValue(value?: string) {
  const normalized = value?.trim();

  return normalized && normalized !== "all" ? normalized : undefined;
}

function parseStatus(value?: string): ConversationStatus | undefined {
  if (
    value === "unanswered" ||
    value === "in_progress" ||
    value === "waiting_client" ||
    value === "closed"
  ) {
    return value;
  }

  return undefined;
}

function parsePriority(value?: string): ConversationPriority | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = searchParams?.[key];

  return Array.isArray(value) ? value[0] : value;
}

export function parseConversationFilters(
  searchParams?: Record<string, string | string[] | undefined>,
): ConversationFilters {
  return {
    mine: readSearchParam(searchParams, "meus") === "1",
    priority: parsePriority(readSearchParam(searchParams, "prioridade")),
    query: cleanFilterValue(readSearchParam(searchParams, "busca")),
    status: parseStatus(readSearchParam(searchParams, "status")),
  };
}

export function buildConversationQueryString(filters: ConversationFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("busca", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("prioridade", filters.priority);
  if (filters.mine) params.set("meus", "1");

  return params.toString();
}

function isAiAssistantOperationMode(value: unknown): value is AiAssistantOperationMode {
  return value === "assisted" || value === "automatic" || value === "off";
}

async function getConversationAiAvailability(): Promise<ConversationAiAvailability> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_assistant_settings")
    .select("enabled,automatic_reply_enabled,operation_mode")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return {
      automaticReplyEnabled: false,
      enabled: false,
      operationMode: "off",
    };
  }

  const operationMode = isAiAssistantOperationMode(data.operation_mode)
    ? data.operation_mode
    : data.enabled
      ? data.automatic_reply_enabled
        ? "automatic"
        : "assisted"
      : "off";

  return {
    automaticReplyEnabled: operationMode === "automatic",
    enabled: operationMode !== "off",
    operationMode,
  };
}

function buildConversationHref(id: string, filters: ConversationFilters) {
  const query = buildConversationQueryString(filters);

  return query ? `/crm/conversas/${id}?${query}` : `/crm/conversas/${id}`;
}

function conversationName(row: ConversationRow) {
  const contact = relatedOne(row.contacts);
  const lead = relatedOne(row.leads);

  return contact?.name || lead?.name || contact?.phone || lead?.phone || "Contato sem nome";
}

function mapPipelineStage(stage: RelatedStage): PipelineStage {
  return {
    id: stage.id,
    isLost: stage.is_lost,
    isWon: stage.is_won,
    name: stage.name,
    position: stage.position,
    slug: stage.slug,
  };
}

function mapLeadContext(
  lead: RelatedLead | null,
  customerId: string | null,
): ConversationLeadContext | null {
  if (!lead) return null;

  const stage = relatedOne(lead.pipeline_stages);
  const convertedAt = lead.converted_at;
  const lostAt = lead.lost_at;

  return {
    convertedAt,
    customerId,
    id: lead.id,
    lostAt,
    lostReason: lead.lost_reason,
    name: lead.name,
    pipelineStageId: lead.pipeline_stage_id,
    pipelineStageName: stage?.name ?? null,
    priority: lead.priority,
    source: lead.source,
    status: customerId ? "converted" : getLeadStatus({ convertedAt, lostAt }),
  };
}

function mapConversation(
  row: ConversationRow,
  filters: ConversationFilters,
  selectedId: string | null,
  lastMessage?: LastMessageRow,
  customerId?: string | null,
): ConversationListItem {
  const contact = relatedOne(row.contacts);
  const lead = relatedOne(row.leads);
  const assignee = relatedOne(row.assignee);
  const aiPausedBy = relatedOne(row.aiPausedBy);
  const commercialStatus: ConversationCommercialStatus = customerId
    ? "customer"
    : lead?.lost_at
      ? "lost"
      : lead
        ? "lead"
        : "unlinked";

  return {
    aiPauseReason: row.ai_pause_reason,
    aiPausedAt: row.ai_paused_at,
    aiPausedByName: profileLabel(aiPausedBy),
    assigneeId: row.assigned_to,
    assigneeName: profileLabel(assignee),
    commercialStatus,
    contactEmail: contact?.email ?? lead?.email ?? null,
    contactId: row.contact_id,
    contactName: conversationName(row),
    contactPhone: contact?.phone ?? lead?.phone ?? null,
    href: buildConversationHref(row.id, filters),
    id: row.id,
    lastMessageAt: lastMessage?.sent_at ?? row.last_message_at,
    lastMessageBody: lastMessage?.body ?? null,
    lastMessageDirection: lastMessage?.direction ?? null,
    leadId: row.lead_id,
    legalArea: lead?.legal_area ?? null,
    priority: row.priority,
    selected: row.id === selectedId,
    status: row.status,
  };
}

async function signAttachment(
  row: MessageAttachmentRow,
): Promise<ConversationMessageAttachment> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(row.storage_bucket)
    .createSignedUrl(row.storage_path, 60 * 60);

  return {
    fileName: row.file_name,
    fileSize: row.file_size,
    fileType: row.file_type,
    id: row.id,
    signedUrl: data?.signedUrl ?? null,
  };
}

async function mapMessage(row: MessageRow): Promise<ConversationMessage> {
  const attachments = Array.isArray(row.attachments)
    ? await Promise.all(row.attachments.map(signAttachment))
    : [];
  const metadata = row.metadata ?? {};
  const isAiGenerated =
    metadataBoolean(metadata, "ai") === true ||
    metadataString(metadata, "source") === "ai_assistant";
  const audioTranscription = nestedMetadataRecord(metadata, "audioTranscription");

  return {
    attachments,
    aiSessionId: metadataString(metadata, "sessionId"),
    authorName: profileLabel(relatedOne(row.sender)),
    body: row.body,
    createdAt: row.created_at,
    deliveryError: row.delivery_error,
    deliveryStatus: row.delivery_status,
    direction: row.direction,
    id: row.id,
    isAiGenerated,
    isAudioTranscribed: Boolean(metadataString(audioTranscription, "text")),
    kind: row.kind,
    retryCount: row.retry_count,
    sentAt: row.sent_at,
  };
}

function mapAiSummary(row: AiClassificationRow): ConversationAiSummary {
  const metadata = row.metadata ?? {};
  const collectedFields = nestedMetadataRecord(metadata, "collectedFields");
  const safety = nestedMetadataRecord(metadata, "safety");

  return {
    bestContactTime: metadataString(collectedFields, "bestContactTime"),
    conversionPotential: row.conversion_potential,
    createdAt: row.created_at,
    handoffRequired: metadataBoolean(metadata, "handoffRequired"),
    immediateAttention: row.immediate_attention,
    legalArea: row.legal_area,
    priority: row.priority,
    requiresHumanReview: metadataBoolean(safety, "requiresHumanReview"),
    shouldSendReply: metadataBoolean(metadata, "shouldSendReply"),
    shortDescription: metadataString(collectedFields, "shortDescription"),
    summary: row.summary,
  };
}

async function getConversationOptions(): Promise<{
  assignees: ConversationOption[];
  pipelineStages: PipelineStage[];
  quickReplies: ConversationQuickReply[];
}> {
  const supabase = await createClient();
  const [profilesResult, quickRepliesResult, pipelineStagesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email")
      .eq("active", true)
      .order("full_name", { ascending: true, nullsFirst: false }),
    supabase
      .from("quick_replies")
      .select("id,title,content")
      .eq("active", true)
      .order("title", { ascending: true }),
    supabase
      .from("pipeline_stages")
      .select("id,name,slug,position,is_won,is_lost")
      .eq("active", true)
      .order("position", { ascending: true }),
  ]);

  const assignees = profilesResult.error
    ? []
    : (profilesResult.data ?? []).map((profile) => ({
        id: profile.id,
        label: profile.full_name || profile.email || "Usuário",
      }));

  const quickReplies = quickRepliesResult.error
    ? []
    : (quickRepliesResult.data ?? []).map((reply) => ({
        content: reply.content,
        id: reply.id,
        title: reply.title,
      }));

  const pipelineStages = pipelineStagesResult.error
    ? []
    : ((pipelineStagesResult.data ?? []) as RelatedStage[]).map(mapPipelineStage);

  return { assignees, pipelineStages, quickReplies };
}

function matchesQuery(row: ConversationRow, query: string | undefined) {
  if (!query) return true;

  const contact = relatedOne(row.contacts);
  const lead = relatedOne(row.leads);
  const term = query.toLowerCase();
  const haystack = [
    contact?.name,
    contact?.phone,
    contact?.email,
    lead?.name,
    lead?.phone,
    lead?.email,
    lead?.legal_area,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

export async function getConversationInbox(
  filters: ConversationFilters,
  selectedId?: string,
): Promise<ConversationInboxData> {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();
  const optionsPromise = getConversationOptions();
  const aiAvailabilityPromise = getConversationAiAvailability();

  let query = supabase
    .from("conversations")
    .select(conversationSelect)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(120);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.mine) query = query.eq("assigned_to", currentUser.id);

  const [options, aiAvailability, conversationsResult] = await Promise.all([
    optionsPromise,
    aiAvailabilityPromise,
    query,
  ]);

  if (conversationsResult.error) {
    throw new Error("Não foi possível carregar as conversas.");
  }

  const rows = ((conversationsResult.data ?? []) as ConversationRow[]).filter((row) =>
    matchesQuery(row, filters.query),
  );
  const ids = rows.map((row) => row.id);
  const leadIds = rows
    .map((row) => relatedOne(row.leads)?.id ?? row.lead_id)
    .filter((id): id is string => Boolean(id));
  const lastMessages = new Map<string, LastMessageRow>();
  const customerByLeadId = new Map<string, string>();

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("messages")
      .select("id,conversation_id,direction,kind,body,delivery_status,delivery_error,retry_count,sent_at,created_at")
      .in("conversation_id", ids)
      .order("sent_at", { ascending: false });

    if (error) {
      throw new Error("Não foi possível carregar o resumo das mensagens.");
    }

    for (const message of (data ?? []) as LastMessageRow[]) {
      if (!lastMessages.has(message.conversation_id)) {
        lastMessages.set(message.conversation_id, message);
      }
    }
  }

  if (leadIds.length > 0) {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id,lead_id")
      .in("lead_id", Array.from(new Set(leadIds)));

    if (customersError) {
      throw new Error("Não foi possível verificar os clientes vinculados.");
    }

    for (const customer of customers ?? []) {
      if (customer.lead_id) {
        customerByLeadId.set(customer.lead_id, customer.id);
      }
    }
  }

  const conversations = rows.map((row) =>
    mapConversation(
      row,
      filters,
      selectedId ?? null,
      lastMessages.get(row.id),
      customerByLeadId.get(relatedOne(row.leads)?.id ?? row.lead_id ?? ""),
    ),
  );

  if (!selectedId) {
    return {
      ...options,
      aiAvailability,
      conversations,
      currentUserId: currentUser.id,
      filters,
      selectedConversation: null,
    };
  }

  let selectedRow: ConversationRow | null =
    rows.find((row) => row.id === selectedId) ?? null;

  if (!selectedRow) {
    const { data: directSelectedRow, error: selectedError } = await supabase
      .from("conversations")
      .select(conversationSelect)
      .eq("id", selectedId)
      .maybeSingle();

    if (selectedError || !directSelectedRow) {
      notFound();
    }

    selectedRow = directSelectedRow as ConversationRow;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(
      "id,direction,kind,body,metadata,delivery_status,delivery_error,retry_count,sent_at,created_at,sender:profiles!messages_sender_profile_id_fkey(full_name,email),attachments(id,file_name,file_size,file_type,storage_bucket,storage_path)",
    )
    .eq("conversation_id", selectedId)
    .order("sent_at", { ascending: true });

  if (messagesError) {
    throw new Error("Não foi possível carregar o histórico da conversa.");
  }

  const contact = relatedOne(selectedRow.contacts);
  const lead = relatedOne(selectedRow.leads);
  let customerId: string | null = lead
    ? customerByLeadId.get(lead.id) ?? null
    : null;
  let aiSummary: ConversationAiSummary | null = null;

  if (lead && !customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (customerError) {
      throw new Error("Não foi possível carregar o cliente vinculado.");
    }

    customerId = customer?.id ?? null;
  }

  if (lead) {
    const { data: classification, error: classificationError } = await supabase
      .from("ai_classifications")
      .select(
        "legal_area,priority,conversion_potential,immediate_attention,summary,metadata,created_at",
      )
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (classificationError) {
      throw new Error("Não foi possível carregar o resumo da IA.");
    }

    aiSummary = classification ? mapAiSummary(classification as AiClassificationRow) : null;
  }

  const base = mapConversation(
    selectedRow,
    filters,
    selectedId,
    lastMessages.get(selectedId),
    customerId,
  );

  return {
    ...options,
    aiAvailability,
    conversations,
    currentUserId: currentUser.id,
    filters,
    selectedConversation: {
      ...base,
      aiSummary,
      channel: selectedRow.channel,
      city: contact?.city ?? null,
      createdAt: selectedRow.created_at,
      lead: mapLeadContext(lead, customerId),
      leadName: lead?.name ?? null,
      messages: await Promise.all(((messages ?? []) as MessageRow[]).map(mapMessage)),
    },
  };
}
