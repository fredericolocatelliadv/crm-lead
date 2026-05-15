"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ConversationStatus } from "@/features/conversations/types/conversation";
import { getEffectiveWhatsAppConnection } from "@/features/whatsapp/server/effective-connection";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import {
  EvolutionRequestError,
  sendEvolutionMediaMessage,
  sendEvolutionTextMessage,
} from "@/server/integrations/evolution/client";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

export type ConversationActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
  refresh?: boolean;
};

const CONVERSATION_ATTACHMENT_BUCKET = "crm-attachments";
const MAX_REPLY_MEDIA_SIZE = 10 * 1024 * 1024;
const ALLOWED_REPLY_MEDIA_TYPES = new Set([
  "audio/aac",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const optionalUuid = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 && trimmed !== "none" ? trimmed : null;
  },
  z.string().uuid("Selecione uma opção válida.").nullable(),
);

const replySchema = z.object({
  body: z.string().trim(),
});

const noteSchema = z.object({
  content: z.string().trim().min(3, "Escreva a observação antes de salvar."),
});

const statusSchema = z.object({
  status: z.enum(["unanswered", "in_progress", "waiting_client", "closed"], {
    error: "Selecione um status válido.",
  }),
});

const transferSchema = z.object({
  assignedTo: optionalUuid,
});

const pauseAiSchema = z.object({
  reason: z.string().trim().max(300, "Use uma justificativa mais curta.").optional(),
});

type RelatedPhone = { phone: string | null };

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

async function assertConversationWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write") && !hasPermission(role, "conversations:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

async function getConversationForAction(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id,contact_id,lead_id,status,assigned_to,ai_paused_at,contacts(phone),leads(phone)")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Não foi possível carregar a conversa.");
  }

  return data;
}

function getConversationPhone(conversation: Awaited<ReturnType<typeof getConversationForAction>>) {
  const contact = relatedOne(conversation.contacts as RelatedPhone | RelatedPhone[] | null);
  const lead = relatedOne(conversation.leads as RelatedPhone | RelatedPhone[] | null);

  return contact?.phone ?? lead?.phone ?? null;
}

async function getCustomerIdByLeadId(leadId: string | null) {
  if (!leadId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar o cliente convertido.");
  }

  return data?.id ?? null;
}

function getReplyMediaFile(formData: FormData) {
  const file = formData.get("media");

  return file instanceof File && file.size > 0 ? file : null;
}

function getReplyMediaKind(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";

  return null;
}

function getReplyMediaFallbackBody(kind: "audio" | "image") {
  return kind === "audio" ? "Áudio enviado" : "Imagem enviada";
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

async function uploadConversationAttachment(params: {
  file: File;
  kind: "audio" | "image";
  leadId: string | null;
  messageId: string;
  userId: string;
}) {
  const supabase = await createClient();
  const fileName = safeFileName(params.file.name) || `${params.kind}-${randomUUID()}`;
  const storagePath = `whatsapp/${params.kind}/${params.messageId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(CONVERSATION_ATTACHMENT_BUCKET)
    .upload(storagePath, params.file, {
      contentType: params.file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    return "Não foi possível salvar o arquivo enviado.";
  }

  const { error: attachmentError } = await supabase.from("attachments").insert({
    file_name: params.file.name,
    file_size: params.file.size,
    file_type: params.file.type || null,
    lead_id: params.leadId,
    message_id: params.messageId,
    storage_bucket: CONVERSATION_ATTACHMENT_BUCKET,
    storage_path: storagePath,
    uploaded_by: params.userId,
  });

  if (attachmentError) {
    await supabase.storage.from(CONVERSATION_ATTACHMENT_BUCKET).remove([storagePath]);

    return "O arquivo foi enviado, mas não foi possível registrar o anexo.";
  }

  return null;
}

async function registerConversationEvent(params: {
  actorId: string;
  description: string;
  eventType: string;
  leadId: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!params.leadId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("lead_events").insert({
    actor_id: params.actorId,
    description: params.description,
    event_type: params.eventType,
    lead_id: params.leadId,
    metadata: params.metadata ?? {},
  });

  if (error) {
    throw new Error("Não foi possível registrar o histórico do lead.");
  }
}

async function syncLeadAssigneeFromConversation(params: {
  actorId: string;
  assigneeId: string | null;
  leadId: string | null;
  reason: string;
}) {
  if (!params.leadId) return;

  const supabase = createAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("assignee_id")
    .eq("id", params.leadId)
    .maybeSingle();

  if (leadError) {
    throw new Error("Não foi possível validar o responsável do lead.");
  }

  if (!lead || lead.assignee_id === params.assigneeId) return;

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      assignee_id: params.assigneeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.leadId);

  if (updateError) {
    throw new Error("Não foi possível sincronizar o responsável do lead.");
  }

  await supabase.from("lead_events").insert({
    actor_id: params.actorId,
    description: params.assigneeId
      ? "Responsável do lead sincronizado com o atendimento."
      : "Responsável do lead removido pelo atendimento.",
    event_type: "lead_assignee_synced",
    lead_id: params.leadId,
    metadata: {
      assigneeId: params.assigneeId,
      previousAssigneeId: lead.assignee_id,
      reason: params.reason,
    },
  });
}

async function sendOpenAiSessionsToHumanReview(
  conversationId: string,
  metadata: Record<string, unknown>,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ai_sessions")
    .update({
      ended_at: new Date().toISOString(),
      metadata,
      status: "human_review",
    })
    .eq("conversation_id", conversationId)
    .eq("status", "open");

  if (error) {
    throw new Error("Não foi possível pausar a sessão da IA.");
  }
}

function revalidateConversationPaths(conversationId: string, leadId?: string | null) {
  revalidatePath("/crm");
  revalidatePath("/crm/conversas");
  revalidatePath(`/crm/conversas/${conversationId}`);

  if (leadId) {
    revalidatePath("/crm/leads");
    revalidatePath("/crm/pipeline");
    revalidatePath(`/crm/leads/${leadId}`);
  }
}

async function markMessageFailed(params: {
  conversationId: string;
  error: string;
  leadId: string | null;
  messageId: string;
}) {
  const supabase = await createClient();

  await supabase
    .from("messages")
    .update({
      delivery_error: params.error,
      delivery_status: "failed",
    })
    .eq("id", params.messageId);

  revalidateConversationPaths(params.conversationId, params.leadId);
}

async function markMessageSent(params: {
  conversationId: string;
  externalId: string | null;
  leadId: string | null;
  messageId: string;
}) {
  const supabase = await createClient();

  await supabase
    .from("messages")
    .update({
      delivery_error: null,
      delivery_status: "sent",
      external_id: params.externalId,
    })
    .eq("id", params.messageId);

  revalidateConversationPaths(params.conversationId, params.leadId);
}

async function sendReplyToWhatsApp(params: {
  body: string;
  media?: File | null;
  mediaKind?: "audio" | "image" | null;
  phone: string;
}) {
  if (params.media && params.mediaKind) {
    const sent = await sendEvolutionMediaMessage({
      caption: params.body,
      file: params.media,
      fileName: safeFileName(params.media.name) || params.media.name,
      mediaType: params.mediaKind,
      to: params.phone,
    });

    return sent.key?.id ?? null;
  }

  const sent = await sendEvolutionTextMessage({
    text: params.body,
    to: params.phone,
  });

  return sent.key?.id ?? null;
}

export async function sendConversationReply(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await assertConversationWriteAccess();
  const media = getReplyMediaFile(formData);
  const mediaKind = media ? getReplyMediaKind(media) : null;
  const parsed = replySchema.safeParse({ body: formData.get("body") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a mensagem.",
      ok: false,
    };
  }

  if (!parsed.data.body && !media) {
    return {
      fieldErrors: {
        body: ["Escreva uma mensagem ou selecione um arquivo."],
      },
      message: "Informe o conteúdo da resposta.",
      ok: false,
    };
  }

  if (media && !mediaKind) {
    return {
      fieldErrors: {
        media: ["Envie uma imagem ou um áudio."],
      },
      message: "Tipo de arquivo não permitido.",
      ok: false,
    };
  }

  if (media && media.size > MAX_REPLY_MEDIA_SIZE) {
    return {
      fieldErrors: {
        media: ["O arquivo deve ter no máximo 10 MB."],
      },
      message: "Arquivo maior que o limite permitido.",
      ok: false,
    };
  }

  if (media && !ALLOWED_REPLY_MEDIA_TYPES.has(media.type)) {
    return {
      fieldErrors: {
        media: ["Use imagem JPG, PNG, WEBP ou áudio compatível."],
      },
      message: "Tipo de arquivo não permitido.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const whatsapp = await getEffectiveWhatsAppConnection(supabase);
  const messageBody = parsed.data.body || (mediaKind ? getReplyMediaFallbackBody(mediaKind) : "");

  const { data: savedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      body: messageBody,
      contact_id: conversation.contact_id,
      conversation_id: conversation.id,
      delivery_error: null,
      delivery_status: whatsapp.connected ? "sending" : "sent",
      direction: "outbound",
      kind: mediaKind ?? "text",
      last_send_attempt_at: now,
      lead_id: conversation.lead_id,
      sender_profile_id: user.id,
      sent_at: now,
    })
    .select("id")
    .single();

  if (messageError || !savedMessage) {
    return {
      message: "Não foi possível salvar a resposta.",
      ok: false,
    };
  }

  if (media && mediaKind) {
    const attachmentError = await uploadConversationAttachment({
      file: media,
      kind: mediaKind,
      leadId: conversation.lead_id,
      messageId: savedMessage.id,
      userId: user.id,
    });

    if (attachmentError) {
      await markMessageFailed({
        conversationId: conversation.id,
        error: attachmentError,
        leadId: conversation.lead_id,
        messageId: savedMessage.id,
      });

      return {
        message: attachmentError,
        ok: false,
        refresh: true,
      };
    }
  }

  if (whatsapp.connected) {
    const phone = getConversationPhone(conversation);

    if (!phone) {
      const errorMessage = "Esta conversa não possui telefone para envio pelo WhatsApp.";

      await markMessageFailed({
        conversationId: conversation.id,
        error: errorMessage,
        leadId: conversation.lead_id,
        messageId: savedMessage.id,
      });

      return {
        message: errorMessage,
        ok: false,
        refresh: true,
      };
    }

    try {
      const externalId = await sendReplyToWhatsApp({
        body: parsed.data.body,
        media,
        mediaKind,
        phone,
      });

      await markMessageSent({
        conversationId: conversation.id,
        externalId,
        leadId: conversation.lead_id,
        messageId: savedMessage.id,
      });
    } catch (error) {
      if (error instanceof EvolutionRequestError) {
        const errorMessage = "Não foi possível enviar a mensagem pelo WhatsApp.";

        await markMessageFailed({
          conversationId: conversation.id,
          error: errorMessage,
          leadId: conversation.lead_id,
          messageId: savedMessage.id,
        });

        return {
          message: `${errorMessage} Tente novamente.`,
          ok: false,
          refresh: true,
        };
      }

      throw error;
    }
  }

  const nextAssigneeId = conversation.assigned_to ?? user.id;
  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      assigned_to: nextAssigneeId,
      last_message_at: now,
      status: "waiting_client",
      updated_at: now,
    })
    .eq("id", conversation.id);

  if (updateError) {
    return {
      message: "A resposta foi salva, mas não foi possível atualizar a conversa.",
      ok: false,
    };
  }

  await syncLeadAssigneeFromConversation({
    actorId: user.id,
    assigneeId: nextAssigneeId,
    leadId: conversation.lead_id,
    reason: "conversation_reply",
  });

  await registerConversationEvent({
    actorId: user.id,
    description: !whatsapp.connected
      ? "Resposta salva no histórico do atendimento."
      : mediaKind
        ? `${getReplyMediaFallbackBody(mediaKind)} pelo WhatsApp.`
        : "Resposta enviada pelo WhatsApp.",
    eventType: !whatsapp.connected ? "conversation_reply_added" : "whatsapp_reply_sent",
    leadId: conversation.lead_id,
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: !whatsapp.connected ? "Resposta salva no histórico." : "Mensagem enviada pelo WhatsApp.",
    ok: true,
  };
}

export async function retryConversationMessage(messageId: string) {
  const user = await assertConversationWriteAccess();
  const supabase = await createClient();
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("id,body,kind,direction,delivery_status,retry_count,conversation_id,lead_id")
    .eq("id", messageId)
    .maybeSingle();

  if (messageError || !message) return;
  if (message.direction !== "outbound" || message.delivery_status !== "failed") return;

  const conversation = await getConversationForAction(message.conversation_id);
  const whatsapp = await getEffectiveWhatsAppConnection(supabase);
  const now = new Date().toISOString();

  await supabase
    .from("messages")
    .update({
      delivery_error: null,
      delivery_status: "sending",
      last_send_attempt_at: now,
      retry_count: (message.retry_count ?? 0) + 1,
    })
    .eq("id", message.id);

  if (!whatsapp.connected) {
    await markMessageFailed({
      conversationId: conversation.id,
      error: whatsapp.message,
      leadId: conversation.lead_id,
      messageId: message.id,
    });
    return;
  }

  const phone = getConversationPhone(conversation);

  if (!phone) {
    await markMessageFailed({
      conversationId: conversation.id,
      error: "Esta conversa não possui telefone para envio pelo WhatsApp.",
      leadId: conversation.lead_id,
      messageId: message.id,
    });
    return;
  }

  const mediaKind =
    message.kind === "audio" || message.kind === "image" ? message.kind : null;
  let media: File | null = null;

  if (mediaKind) {
    const { data: attachment } = await supabase
      .from("attachments")
      .select("file_name,file_type,storage_bucket,storage_path")
      .eq("message_id", message.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!attachment) {
      await markMessageFailed({
        conversationId: conversation.id,
        error: "Não foi possível localizar o arquivo desta mensagem.",
        leadId: conversation.lead_id,
        messageId: message.id,
      });
      return;
    }

    const { data: blob, error: downloadError } = await supabase.storage
      .from(attachment.storage_bucket)
      .download(attachment.storage_path);

    if (downloadError || !blob) {
      await markMessageFailed({
        conversationId: conversation.id,
        error: "Não foi possível carregar o arquivo para reenviar.",
        leadId: conversation.lead_id,
        messageId: message.id,
      });
      return;
    }

    media = new File([blob], attachment.file_name, {
      type: attachment.file_type ?? undefined,
    });
  }

  try {
    const externalId = await sendReplyToWhatsApp({
      body: message.body ?? "",
      media,
      mediaKind,
      phone,
    });

    await markMessageSent({
      conversationId: conversation.id,
      externalId,
      leadId: conversation.lead_id,
      messageId: message.id,
    });

    const nextAssigneeId = conversation.assigned_to ?? user.id;

    await supabase
      .from("conversations")
      .update({
        assigned_to: nextAssigneeId,
        last_message_at: now,
        status: "waiting_client",
        updated_at: now,
      })
      .eq("id", conversation.id);

    await syncLeadAssigneeFromConversation({
      actorId: user.id,
      assigneeId: nextAssigneeId,
      leadId: conversation.lead_id,
      reason: "conversation_message_retry",
    });

    await registerConversationEvent({
      actorId: user.id,
      description: "Mensagem reenviada pelo WhatsApp.",
      eventType: "whatsapp_reply_retried",
      leadId: conversation.lead_id,
    });
  } catch (error) {
    if (error instanceof EvolutionRequestError) {
      await markMessageFailed({
        conversationId: conversation.id,
        error: "Não foi possível reenviar a mensagem pelo WhatsApp.",
        leadId: conversation.lead_id,
        messageId: message.id,
      });
      return;
    }

    throw error;
  }

  revalidateConversationPaths(conversation.id, conversation.lead_id);
}

export async function addConversationInternalNote(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await assertConversationWriteAccess();
  const parsed = noteSchema.safeParse({ content: formData.get("content") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a observação.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const customerId = await getCustomerIdByLeadId(conversation.lead_id);

  const { error: messageError } = await supabase.from("messages").insert({
    body: parsed.data.content,
    contact_id: conversation.contact_id,
    conversation_id: conversation.id,
    direction: "internal",
    kind: "text",
    lead_id: conversation.lead_id,
    sender_profile_id: user.id,
    sent_at: now,
  });

  if (messageError) {
    return {
      message: "Não foi possível salvar a nota interna.",
      ok: false,
    };
  }

  const { error: noteError } = await supabase.from("notes").insert({
    author_id: user.id,
    content: parsed.data.content,
    conversation_id: conversation.id,
    customer_id: customerId,
    internal: true,
    lead_id: conversation.lead_id,
  });

  if (noteError) {
    return {
      message: "A nota entrou no histórico, mas não foi possível registrar a observação.",
      ok: false,
    };
  }

  await supabase
    .from("conversations")
    .update({ updated_at: now })
    .eq("id", conversation.id);

  await registerConversationEvent({
    actorId: user.id,
    description: "Observação interna adicionada ao atendimento.",
    eventType: "conversation_note_added",
    leadId: conversation.lead_id,
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);
  if (customerId) {
    revalidatePath(`/crm/clientes/${customerId}`);
  }

  return {
    message: "Observação interna salva.",
    ok: true,
  };
}

export async function updateConversationStatus(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await assertConversationWriteAccess();
  const parsed = statusSchema.safeParse({ status: formData.get("status") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise o status.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const nextStatus = parsed.data.status as ConversationStatus;

  const { error } = await supabase
    .from("conversations")
    .update({
      status: nextStatus,
      updated_at: now,
    })
    .eq("id", conversation.id);

  if (error) {
    return {
      message: "Não foi possível alterar o status da conversa.",
      ok: false,
    };
  }

  await registerConversationEvent({
    actorId: user.id,
    description: "Status do atendimento atualizado.",
    eventType: "conversation_status_changed",
    leadId: conversation.lead_id,
    metadata: {
      previousStatus: conversation.status,
      status: nextStatus,
    },
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: "Status atualizado.",
    ok: true,
  };
}

export async function transferConversation(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await assertConversationWriteAccess();
  const parsed = transferSchema.safeParse({
    assignedTo: formData.get("assignedTo"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a transferência.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const updates: Record<string, string | null> = {
    assigned_to: parsed.data.assignedTo,
    status: conversation.status === "unanswered" ? "in_progress" : conversation.status,
    updated_at: now,
  };

  if (parsed.data.assignedTo) {
    updates.ai_pause_reason = "Atendimento transferido para responsável.";
    updates.ai_paused_at = conversation.ai_paused_at ?? now;
    updates.ai_paused_by = user.id;
  }

  const { error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversation.id);

  if (error) {
    return {
      message: "Não foi possível transferir o atendimento.",
      ok: false,
    };
  }

  if (parsed.data.assignedTo) {
    await sendOpenAiSessionsToHumanReview(conversation.id, {
      actorId: user.id,
      assignedTo: parsed.data.assignedTo,
      pausedAt: now,
      reason: "conversation_transferred",
    });
  }

  await syncLeadAssigneeFromConversation({
    actorId: user.id,
    assigneeId: parsed.data.assignedTo,
    leadId: conversation.lead_id,
    reason: "conversation_transferred",
  });

  await registerConversationEvent({
    actorId: user.id,
    description: "Atendimento transferido.",
    eventType: "conversation_transferred",
    leadId: conversation.lead_id,
    metadata: {
      assignedTo: parsed.data.assignedTo,
      previousAssignedTo: conversation.assigned_to,
    },
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: "Atendimento transferido.",
    ok: true,
  };
}

export async function assumeConversation(
  conversationId: string,
  _previousState: ConversationActionState,
): Promise<ConversationActionState> {
  void _previousState;

  const user = await assertConversationWriteAccess();
  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const pauseReason = "Atendimento assumido pela equipe.";

  const { error } = await supabase
    .from("conversations")
    .update({
      ai_pause_reason: pauseReason,
      ai_paused_at: conversation.ai_paused_at ?? now,
      ai_paused_by: user.id,
      assigned_to: user.id,
      status: "in_progress",
      updated_at: now,
    })
    .eq("id", conversation.id);

  if (error) {
    return {
      message: "Não foi possível assumir o atendimento.",
      ok: false,
    };
  }

  await sendOpenAiSessionsToHumanReview(conversation.id, {
    actorId: user.id,
    pausedAt: now,
    reason: "conversation_assumed",
  });

  await syncLeadAssigneeFromConversation({
    actorId: user.id,
    assigneeId: user.id,
    leadId: conversation.lead_id,
    reason: "conversation_assumed",
  });

  await registerConversationEvent({
    actorId: user.id,
    description: "Atendimento assumido pela equipe. A IA foi pausada nesta conversa.",
    eventType: "conversation_assumed",
    leadId: conversation.lead_id,
    metadata: {
      previousAssignedTo: conversation.assigned_to,
    },
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: "Atendimento assumido. A IA foi pausada nesta conversa.",
    ok: true,
  };
}

export async function pauseConversationAi(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await assertConversationWriteAccess();
  const parsed = pauseAiSchema.safeParse({
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a pausa da IA.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();
  const reason = parsed.data.reason?.trim() || "Pausada manualmente pela equipe.";

  const { error } = await supabase
    .from("conversations")
    .update({
      ai_pause_reason: reason,
      ai_paused_at: conversation.ai_paused_at ?? now,
      ai_paused_by: user.id,
      updated_at: now,
    })
    .eq("id", conversation.id);

  if (error) {
    return {
      message: "Não foi possível pausar a IA nesta conversa.",
      ok: false,
    };
  }

  await sendOpenAiSessionsToHumanReview(conversation.id, {
    actorId: user.id,
    pausedAt: now,
    reason: "ai_paused",
  });

  await registerConversationEvent({
    actorId: user.id,
    description: "IA pausada nesta conversa.",
    eventType: "ai_conversation_paused",
    leadId: conversation.lead_id,
    metadata: {
      reason,
    },
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: "IA pausada nesta conversa.",
    ok: true,
  };
}

export async function resumeConversationAi(
  conversationId: string,
  _previousState: ConversationActionState,
): Promise<ConversationActionState> {
  void _previousState;

  const user = await assertConversationWriteAccess();
  const supabase = await createClient();
  const conversation = await getConversationForAction(conversationId);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("conversations")
    .update({
      ai_pause_reason: null,
      ai_paused_at: null,
      ai_paused_by: null,
      updated_at: now,
    })
    .eq("id", conversation.id);

  if (error) {
    return {
      message: "Não foi possível retomar a IA nesta conversa.",
      ok: false,
    };
  }

  await registerConversationEvent({
    actorId: user.id,
    description: "IA retomada nesta conversa.",
    eventType: "ai_conversation_resumed",
    leadId: conversation.lead_id,
    metadata: {
      previousPausedAt: conversation.ai_paused_at,
    },
  });

  revalidateConversationPaths(conversation.id, conversation.lead_id);

  return {
    message: "IA retomada nesta conversa.",
    ok: true,
  };
}

