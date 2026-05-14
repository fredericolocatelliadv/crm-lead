import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { runAiAssistantForMessage } from "@/features/ai-assistant/server/ai-orchestrator";
import type { AiAssistantResponse } from "@/features/ai-assistant/types/ai-assistant";
import { mapEvolutionStateToWhatsAppStatus } from "@/features/whatsapp/types/whatsapp";
import {
  EvolutionRequestError,
  getEvolutionInstanceName,
  getEvolutionMediaBase64,
  sendEvolutionTextMessage,
} from "@/server/integrations/evolution/client";

type JsonRecord = Record<string, unknown>;

type IncomingMessage = {
  body: string | null;
  externalId: string | null;
  fromMe: boolean;
  kind: "audio" | "document" | "image" | "system" | "text" | "video";
  media: IncomingMedia | null;
  phone: string;
  pushName: string | null;
  remoteJid: string;
  sentAt: string;
};

type IncomingMedia = {
  base64: string | null;
  fileName: string;
  kind: "audio" | "image";
  messagePayload: unknown;
  mimeType: string;
};

type ContactRecord = {
  id: string;
  name: string | null;
  phone: string | null;
};

type LeadRecord = {
  contact_id?: string | null;
  id: string;
};

type PersistedIncomingMessage = {
  contactId: string;
  conversationId: string;
  leadId: string | null;
  messageId: string;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePhone(value: string) {
  const phone = value.split("@")[0]?.replace(/\D/g, "") ?? "";

  return phone.length >= 8 ? phone : null;
}

function getNestedRecord(root: JsonRecord, keys: string[]) {
  let current: unknown = root;

  for (const key of keys) {
    if (!isRecord(current)) return null;
    current = current[key];
  }

  return isRecord(current) ? current : null;
}

function getEventName(payload: JsonRecord) {
  return (
    stringValue(payload.event) ??
    stringValue(payload.eventType) ??
    stringValue(payload.type) ??
    stringValue(payload.event_name)
  );
}

function normalizeEventName(event: string | null) {
  return event?.replace(/\./g, "_").toUpperCase() ?? null;
}

function getPayloadData(payload: JsonRecord) {
  return payload.data ?? payload;
}

function getQrCode(payload: JsonRecord) {
  const data = getPayloadData(payload);

  if (isRecord(data)) {
    return (
      stringValue(data.qrcode) ??
      stringValue(data.qr) ??
      stringValue(data.code) ??
      stringValue(data.base64)
    );
  }

  return null;
}

function getConnectionState(payload: JsonRecord) {
  const data = getPayloadData(payload);

  if (!isRecord(data)) return null;

  return (
    stringValue(data.state) ??
    stringValue(data.status) ??
    stringValue(data.connection) ??
    stringValue(getNestedRecord(data, ["instance"])?.state)
  );
}

function getMessagesPayload(payload: JsonRecord) {
  const data = getPayloadData(payload);

  if (Array.isArray(data)) return data;

  if (!isRecord(data)) return [];

  if (Array.isArray(data.messages)) return data.messages;
  if (Array.isArray(data.message)) return data.message;

  return [data];
}

function getMessageKind(messageContent: JsonRecord | null): IncomingMessage["kind"] {
  if (!messageContent) return "system";
  if (isRecord(messageContent.imageMessage)) return "image";
  if (isRecord(messageContent.audioMessage)) return "audio";
  if (isRecord(messageContent.videoMessage)) return "video";
  if (isRecord(messageContent.documentMessage)) return "document";

  return "text";
}

function getMessageBody(messageContent: JsonRecord | null, kind: IncomingMessage["kind"]) {
  if (!messageContent) return null;

  const text =
    stringValue(messageContent.conversation) ??
    stringValue(getNestedRecord(messageContent, ["extendedTextMessage"])?.text) ??
    stringValue(getNestedRecord(messageContent, ["imageMessage"])?.caption) ??
    stringValue(getNestedRecord(messageContent, ["videoMessage"])?.caption) ??
    stringValue(getNestedRecord(messageContent, ["documentMessage"])?.caption);

  if (text) return text;

  const fallback: Record<IncomingMessage["kind"], string | null> = {
    audio: "Áudio recebido",
    document: "Documento recebido",
    image: "Imagem recebida",
    system: null,
    text: null,
    video: "Vídeo recebido",
  };

  return fallback[kind];
}

function audioExtension(mimeType: string) {
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("aac")) return "aac";

  return "ogg";
}

function normalizeAudioMimeType(mimeType: string) {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("mpeg")) return "audio/mpeg";
  if (normalized.includes("mp4")) return "audio/mp4";
  if (normalized.includes("webm")) return "audio/webm";
  if (normalized.includes("wav")) return "audio/wav";
  if (normalized.includes("aac")) return "audio/aac";

  return "audio/ogg";
}

function imageExtension(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("avif")) return "avif";

  return "jpg";
}

function normalizeImageMimeType(mimeType: string) {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("png")) return "image/png";
  if (normalized.includes("webp")) return "image/webp";
  if (normalized.includes("avif")) return "image/avif";

  return "image/jpeg";
}

function normalizeMediaMimeType(kind: IncomingMedia["kind"], mimeType: string) {
  return kind === "audio" ? normalizeAudioMimeType(mimeType) : normalizeImageMimeType(mimeType);
}

function getBase64FromPayload(value: JsonRecord, mediaMessage: JsonRecord | null) {
  return (
    stringValue(value.base64) ??
    stringValue(getNestedRecord(value, ["data"])?.base64) ??
    stringValue(mediaMessage?.base64)
  );
}

function getIncomingMedia(value: JsonRecord, kind: IncomingMessage["kind"]) {
  if (kind !== "audio" && kind !== "image") return null;

  const mediaMessage = getNestedRecord(value, [
    "message",
    kind === "audio" ? "audioMessage" : "imageMessage",
  ]);
  const fallbackMimeType = kind === "audio" ? "audio/ogg" : "image/jpeg";
  const mimeType = normalizeMediaMimeType(
    kind,
    stringValue(mediaMessage?.mimetype) ?? fallbackMimeType,
  );
  const externalId = stringValue(getNestedRecord(value, ["key"])?.id) ?? kind;
  const fileName = `${kind}-${externalId}.${
    kind === "audio" ? audioExtension(mimeType) : imageExtension(mimeType)
  }`;

  return {
    base64: getBase64FromPayload(value, mediaMessage),
    fileName,
    kind,
    messagePayload: {
      key: {
        id: externalId,
      },
    },
    mimeType,
  } satisfies IncomingMedia;
}

function getMessageDate(message: JsonRecord) {
  const timestamp =
    numberValue(message.messageTimestamp) ??
    numberValue(message.messageTimestampLow) ??
    numberValue(message.timestamp);

  if (!timestamp) return new Date().toISOString();

  return new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp).toISOString();
}

function parseIncomingMessage(value: unknown): IncomingMessage | null {
  if (!isRecord(value)) return null;

  const key = getNestedRecord(value, ["key"]);
  const remoteJid =
    stringValue(key?.remoteJid) ??
    stringValue(value.remoteJid) ??
    stringValue(value.from) ??
    stringValue(value.chatId);

  if (!remoteJid || remoteJid.endsWith("@g.us")) return null;

  const phone = normalizePhone(remoteJid);
  if (!phone) return null;

  const messageContent = getNestedRecord(value, ["message"]);
  const kind = getMessageKind(messageContent);

  return {
    body: getMessageBody(messageContent, kind),
    externalId: stringValue(key?.id) ?? stringValue(value.id) ?? null,
    fromMe: Boolean(key?.fromMe ?? value.fromMe),
    kind,
    media: getIncomingMedia(value, kind),
    phone,
    pushName: stringValue(value.pushName) ?? stringValue(value.senderName),
    remoteJid,
    sentAt: getMessageDate(value),
  };
}

async function findConnection(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("whatsapp_instances")
    .select("id,connection_status,is_active")
    .eq("instance_name", getEvolutionInstanceName())
    .maybeSingle();

  return data;
}

async function registerConnectionEvent(
  supabase: SupabaseClient,
  params: {
    description?: string;
    instanceId: string | null;
    title: string;
    type: string;
  },
) {
  await supabase.from("whatsapp_connection_events").insert({
    description: params.description ?? null,
    event_type: params.type,
    title: params.title,
    whatsapp_instance_id: params.instanceId,
  });
}

async function handleQrCodeEvent(supabase: SupabaseClient, payload: JsonRecord) {
  const connection = await findConnection(supabase);
  const qrCode = getQrCode(payload);

  if (!connection || !qrCode) return;

  const now = new Date().toISOString();
  await supabase
    .from("whatsapp_instances")
    .update({
      connection_status: "connecting",
      last_qr_at: now,
      last_qr_code: qrCode,
      last_synced_at: now,
      status: "connecting",
      updated_at: now,
    })
    .eq("id", connection.id);

  await registerConnectionEvent(supabase, {
    instanceId: connection.id,
    title: "QR Code atualizado",
    type: "qr_code_updated",
  });
}

async function handleConnectionEvent(supabase: SupabaseClient, payload: JsonRecord) {
  const connection = await findConnection(supabase);
  const state = getConnectionState(payload);

  if (!connection || !state || connection.connection_status === "disabled") return;

  const status = mapEvolutionStateToWhatsAppStatus(state);
  const now = new Date().toISOString();

  await supabase
    .from("whatsapp_instances")
    .update({
      connected_at: status === "connected" ? now : null,
      connection_status: status,
      disconnected_at: status === "disconnected" ? now : null,
      last_synced_at: now,
      status,
      updated_at: now,
    })
    .eq("id", connection.id);

  await registerConnectionEvent(supabase, {
    instanceId: connection.id,
    title: status === "connected" ? "WhatsApp conectado" : "Conexão atualizada",
    type: "connection_updated",
  });
}

async function getDefaultPipelineStageId(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function getOrCreateContact(supabase: SupabaseClient, message: IncomingMessage) {
  const { data: existing } = await supabase
    .from("contacts")
    .select("id,name,phone")
    .eq("phone", message.phone)
    .maybeSingle();

  if (existing) {
    if (!existing.name && message.pushName) {
      await supabase.from("contacts").update({ name: message.pushName }).eq("id", existing.id);
    }

    return { ...existing, name: existing.name ?? message.pushName };
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      name: message.pushName ?? "Contato do WhatsApp",
      phone: message.phone,
    })
    .select("id,name,phone")
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from("contacts")
      .select("id,name,phone")
      .eq("phone", message.phone)
      .maybeSingle();

    if (retry) return retry;
    throw error;
  }

  return data;
}

function contactLeadFilter(contact: ContactRecord) {
  const filters = [`contact_id.eq.${contact.id}`];

  if (contact.phone) {
    filters.push(`phone.eq.${contact.phone}`);
  }

  return filters.join(",");
}

async function findOpenLeadByContact(supabase: SupabaseClient, contact: ContactRecord) {
  const { data } = await supabase
    .from("leads")
    .select("id,contact_id")
    .or(contactLeadFilter(contact))
    .is("converted_at", null)
    .is("lost_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as LeadRecord | null;
}

async function findCustomerLeadByContact(supabase: SupabaseClient, contact: ContactRecord) {
  const customerFilters = [`contact_id.eq.${contact.id}`];

  if (contact.phone) {
    customerFilters.push(`phone.eq.${contact.phone}`);
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("lead_id")
    .or(customerFilters.join(","))
    .not("lead_id", "is", null)
    .order("converted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (customer?.lead_id) {
    return { id: customer.lead_id } satisfies LeadRecord;
  }

  const { data: convertedLead } = await supabase
    .from("leads")
    .select("id,contact_id")
    .or(contactLeadFilter(contact))
    .not("converted_at", "is", null)
    .order("converted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return convertedLead as LeadRecord | null;
}

async function findLostLeadByContact(supabase: SupabaseClient, contact: ContactRecord) {
  const { data } = await supabase
    .from("leads")
    .select("id,contact_id")
    .or(contactLeadFilter(contact))
    .is("converted_at", null)
    .not("lost_at", "is", null)
    .order("lost_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as LeadRecord | null;
}

async function ensureLeadUsesContact(
  supabase: SupabaseClient,
  lead: LeadRecord,
  contact: ContactRecord,
) {
  if (lead.contact_id === contact.id) return lead;

  await supabase.from("leads").update({ contact_id: contact.id }).eq("id", lead.id);

  return {
    ...lead,
    contact_id: contact.id,
  };
}

async function createLeadFromIncomingMessage(
  supabase: SupabaseClient,
  contact: ContactRecord,
) {
  const pipelineStageId = await getDefaultPipelineStageId(supabase);
  const { data, error } = await supabase
    .from("leads")
    .insert({
      contact_id: contact.id,
      name: contact.name ?? contact.phone ?? "Contato do WhatsApp",
      phone: contact.phone,
      pipeline_stage_id: pipelineStageId,
      priority: "medium",
      source: "whatsapp",
      summary: "Lead criado automaticamente a partir de uma mensagem recebida pelo WhatsApp.",
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("lead_events").insert({
    description: "Lead criado a partir de mensagem recebida pelo WhatsApp.",
    event_type: "whatsapp_lead_created",
    lead_id: data.id,
    metadata: {},
  });

  return data;
}

async function resolveLeadForMessage(
  supabase: SupabaseClient,
  contact: ContactRecord,
  message: IncomingMessage,
) {
  const existing =
    (await findCustomerLeadByContact(supabase, contact)) ??
    (await findOpenLeadByContact(supabase, contact)) ??
    (await findLostLeadByContact(supabase, contact));

  if (existing) return ensureLeadUsesContact(supabase, existing, contact);

  if (message.fromMe) {
    return null;
  }

  return createLeadFromIncomingMessage(supabase, contact);
}

async function getOrCreateConversation(
  supabase: SupabaseClient,
  contactId: string,
  leadId: string | null,
  message: IncomingMessage,
) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id,lead_id")
    .eq("contact_id", contactId)
    .eq("channel", "whatsapp")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (leadId && existing.lead_id !== leadId) {
      await supabase
        .from("conversations")
        .update({
          lead_id: leadId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }

    return existing;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      channel: "whatsapp",
      contact_id: contactId,
      last_message_at: message.sentAt,
      lead_id: leadId,
      priority: "medium",
      status: message.fromMe ? "waiting_client" : "unanswered",
    })
    .select("id")
    .single();

  if (error) throw error;

  return data;
}

async function messageAlreadyExists(supabase: SupabaseClient, externalId: string | null) {
  if (!externalId) return false;

  const { data } = await supabase
    .from("messages")
    .select("id")
    .eq("external_id", externalId)
    .maybeSingle();

  return Boolean(data);
}

function decodeBase64File(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  const base64 = match ? match[2] : value;
  const mimeType = match?.[1] ?? null;

  return {
    buffer: Buffer.from(base64, "base64"),
    mimeType,
  };
}

async function resolveIncomingMedia(media: IncomingMedia) {
  if (media.base64) {
    return {
      base64: media.base64,
      mimeType: media.mimeType,
    };
  }

  const response = await getEvolutionMediaBase64({
    convertToMp4: false,
    message: media.messagePayload,
  });

  return {
    base64: response.base64 ?? null,
    mimeType: normalizeMediaMimeType(media.kind, response.mimetype ?? media.mimeType),
  };
}

async function attachMediaToMessage(
  supabase: SupabaseClient,
  params: {
    leadId: string | null;
    media: IncomingMedia;
    messageId: string;
  },
) {
  const media = await resolveIncomingMedia(params.media);
  const base64 = media.base64;

  if (!base64) return;

  const decoded = decodeBase64File(base64);
  const mimeType = normalizeMediaMimeType(
    params.media.kind,
    decoded.mimeType ?? media.mimeType,
  );
  const storagePath = `whatsapp/${params.media.kind}/${params.messageId}/${params.media.fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("crm-attachments")
    .upload(storagePath, decoded.buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  await supabase.from("attachments").insert({
    file_name: params.media.fileName,
    file_size: decoded.buffer.byteLength,
    file_type: mimeType,
    lead_id: params.leadId,
    message_id: params.messageId,
    storage_bucket: "crm-attachments",
    storage_path: storagePath,
  });
}

async function persistMessage(
  supabase: SupabaseClient,
  message: IncomingMessage,
): Promise<PersistedIncomingMessage | null> {
  if (await messageAlreadyExists(supabase, message.externalId)) return null;

  const contact = await getOrCreateContact(supabase, message);
  const lead = await resolveLeadForMessage(supabase, contact, message);
  const conversation = await getOrCreateConversation(
    supabase,
    contact.id,
    lead?.id ?? null,
    message,
  );

  const { data: savedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      body: message.body,
      contact_id: contact.id,
      conversation_id: conversation.id,
      delivery_status: "sent",
      direction: message.fromMe ? "outbound" : "inbound",
      external_id: message.externalId,
      kind: message.kind,
      lead_id: lead?.id ?? null,
      metadata: {
        remoteJid: message.remoteJid,
      },
      sent_at: message.sentAt,
    })
    .select("id")
    .single();

  if (messageError) throw messageError;

  if (message.media && savedMessage?.id) {
    await attachMediaToMessage(supabase, {
      leadId: lead?.id ?? null,
      media: message.media,
      messageId: savedMessage.id,
    });
  }

  await supabase
    .from("conversations")
    .update({
      last_message_at: message.sentAt,
      status: message.fromMe ? "waiting_client" : "unanswered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  if (!message.fromMe && lead) {
    await supabase.from("lead_events").insert({
      description: "Mensagem recebida pelo WhatsApp.",
      event_type: "whatsapp_message_received",
      lead_id: lead.id,
      metadata: {
        messageId: message.externalId,
      },
    });
  }

  return {
    contactId: contact.id,
    conversationId: conversation.id,
    leadId: lead?.id ?? null,
    messageId: savedMessage.id,
  };
}

async function canSendAutomaticAiReply(supabase: SupabaseClient) {
  const connection = await findConnection(supabase);

  return Boolean(
    connection?.is_active &&
      connection.connection_status !== "disabled" &&
      connection.connection_status !== "not_configured",
  );
}

function getConversationStatusAfterAiReply(response: AiAssistantResponse) {
  return response.handoffRequired || response.safety.requiresHumanReview
    ? "unanswered"
    : "waiting_client";
}

function getConversationPriorityAfterAiReply(response: AiAssistantResponse) {
  return response.classification.immediateAttention ||
    response.classification.priority === "high"
    ? "high"
    : response.classification.priority;
}

async function registerAiReplyEvent(
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
    event_type: "ai_assistant_reply",
    lead_id: params.leadId,
    metadata: params.metadata ?? {},
  });
}

async function markAiReplyFailed(
  supabase: SupabaseClient,
  params: {
    conversationId: string;
    error: string;
    leadId: string | null;
    messageId: string;
    response: AiAssistantResponse;
    sessionId: string | undefined;
  },
) {
  const now = new Date().toISOString();

  await supabase
    .from("messages")
    .update({
      delivery_error: params.error,
      delivery_status: "failed",
    })
    .eq("id", params.messageId);

  await supabase
    .from("conversations")
    .update({
      priority: getConversationPriorityAfterAiReply(params.response),
      status: "unanswered",
      updated_at: now,
    })
    .eq("id", params.conversationId);

  await registerAiReplyEvent(supabase, {
    description: "IA gerou uma resposta, mas o envio automático pelo WhatsApp falhou.",
    leadId: params.leadId,
    metadata: {
      error: params.error,
      sessionId: params.sessionId,
    },
  });
}

async function sendAutomaticAiReply(
  supabase: SupabaseClient,
  params: {
    contactId: string;
    conversationId: string;
    leadId: string | null;
    phone: string;
    response: AiAssistantResponse;
    sessionId: string | undefined;
  },
) {
  const reply = params.response.reply.trim();

  if (!reply) return;

  const now = new Date().toISOString();
  const { data: savedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      body: reply,
      contact_id: params.contactId,
      conversation_id: params.conversationId,
      delivery_error: null,
      delivery_status: "sending",
      direction: "outbound",
      kind: "text",
      last_send_attempt_at: now,
      lead_id: params.leadId,
      metadata: {
        ai: true,
        automated: true,
        sessionId: params.sessionId,
        source: "ai_assistant",
      },
      sent_at: now,
    })
    .select("id")
    .single();

  if (messageError || !savedMessage) {
    await registerAiReplyEvent(supabase, {
      description: "IA gerou uma resposta, mas o CRM não conseguiu salvar o envio automático.",
      leadId: params.leadId,
      metadata: {
        sessionId: params.sessionId,
      },
    });
    return;
  }

  try {
    const sent = await sendEvolutionTextMessage({
      text: reply,
      to: params.phone,
    });
    const externalId = sent.key?.id ?? null;

    await supabase
      .from("messages")
      .update({
        delivery_error: null,
        delivery_status: "sent",
        external_id: externalId,
      })
      .eq("id", savedMessage.id);

    await supabase
      .from("conversations")
      .update({
        last_message_at: now,
        priority: getConversationPriorityAfterAiReply(params.response),
        status: getConversationStatusAfterAiReply(params.response),
        updated_at: now,
      })
      .eq("id", params.conversationId);

    await registerAiReplyEvent(supabase, {
      description: "IA respondeu automaticamente pelo WhatsApp.",
      leadId: params.leadId,
      metadata: {
        externalId,
        handoffRequired: params.response.handoffRequired,
        sessionId: params.sessionId,
      },
    });
  } catch (error) {
    await markAiReplyFailed(supabase, {
      conversationId: params.conversationId,
      error:
        error instanceof EvolutionRequestError
          ? "Não foi possível enviar a resposta automática pelo WhatsApp."
          : "Falha inesperada ao enviar a resposta automática pelo WhatsApp.",
      leadId: params.leadId,
      messageId: savedMessage.id,
      response: params.response,
      sessionId: params.sessionId,
    });
  }
}

async function runAiAutomationForIncomingMessage(
  supabase: SupabaseClient,
  params: {
    message: IncomingMessage;
    persisted: PersistedIncomingMessage;
  },
) {
  if (params.message.fromMe) return;

  const allowAutomaticReply = await canSendAutomaticAiReply(supabase);
  const result = await runAiAssistantForMessage(supabase, {
    allowAutomaticReply,
    conversationId: params.persisted.conversationId,
    messageId: params.persisted.messageId,
  });

  if (!result.shouldSendReply || !result.response) return;

  await sendAutomaticAiReply(supabase, {
    contactId: params.persisted.contactId,
    conversationId: params.persisted.conversationId,
    leadId: params.persisted.leadId,
    phone: params.message.phone,
    response: result.response,
    sessionId: result.sessionId,
  });
}

async function handleMessagesEvent(supabase: SupabaseClient, payload: JsonRecord) {
  const messages = getMessagesPayload(payload)
    .map(parseIncomingMessage)
    .filter((message): message is IncomingMessage => Boolean(message));

  for (const message of messages) {
    const persisted = await persistMessage(supabase, message);

    if (persisted) {
      await runAiAutomationForIncomingMessage(supabase, {
        message,
        persisted,
      });
    }
  }
}

export async function processEvolutionWebhook(
  supabase: SupabaseClient,
  payload: unknown,
) {
  if (!isRecord(payload)) return;

  const event = normalizeEventName(getEventName(payload));

  if (event === "QRCODE_UPDATED") {
    await handleQrCodeEvent(supabase, payload);
    return;
  }

  if (event === "CONNECTION_UPDATE") {
    await handleConnectionEvent(supabase, payload);
    return;
  }

  if (event === "MESSAGES_UPSERT" || event === "SEND_MESSAGE") {
    await handleMessagesEvent(supabase, payload);
  }
}
