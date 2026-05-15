"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { LeadPriority } from "@/features/leads/types/lead";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

const CUSTOMER_ATTACHMENT_BUCKET = "crm-attachments";
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type CustomerActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

const noteSchema = z.object({
  content: z.string().trim().min(3, "Escreva a observação antes de salvar."),
});

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.string().nullable(),
);

const optionalUuid = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 && trimmed !== "none" ? trimmed : null;
  },
  z.string().uuid().nullable(),
);

const customerFormSchema = z.object({
  assigneeId: optionalUuid,
  bestContactTime: optionalText,
  city: optionalText,
  description: optionalText,
  email: optionalText.pipe(z.string().email("Informe um e-mail válido.").nullable()),
  legalArea: z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();

      return trimmed.length > 0 && trimmed !== "none" ? trimmed : null;
    },
    z.string().nullable(),
  ),
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  notes: optionalText,
  phone: optionalText,
  priority: z.enum(["low", "medium", "high"], {
    error: "Informe a prioridade do cliente.",
  }),
  source: z.string().trim().min(2, "Informe a origem do cliente."),
  summary: optionalText,
});

type CustomerActionLead = {
  assignee_id: string | null;
  best_contact_time: string | null;
  city: string | null;
  description: string | null;
  email: string | null;
  legal_area: string | null;
  name: string;
  phone: string | null;
  priority: LeadPriority | null;
  source: string | null;
  summary: string | null;
};

type CustomerActionRow = {
  contactCity: string | null;
  contact_id: string | null;
  email: string | null;
  id: string;
  lead_id: string | null;
  leads?: CustomerActionLead | CustomerActionLead[] | null;
  name: string;
  notes: string | null;
  phone: string | null;
};

async function assertCustomerWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write") && !hasPermission(role, "leads:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

async function getCustomerForAction(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id,contact_id,lead_id,name,email,phone,notes,leads(name,email,phone,city,legal_area,description,source,priority,summary,best_contact_time,assignee_id)",
    )
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Não foi possível carregar o cliente.");
  }

  let contactCity: string | null = null;

  if (data.contact_id) {
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("city")
      .eq("id", data.contact_id)
      .maybeSingle();

    if (contactError) {
      throw new Error("Não foi possível carregar o contato vinculado ao cliente.");
    }

    contactCity = contact?.city ?? null;
  }

  return {
    ...(data as Omit<CustomerActionRow, "contactCity">),
    contactCity,
  };
}

function getRelatedLead(value: unknown): CustomerActionLead | null {
  if (Array.isArray(value)) {
    return (value[0] as CustomerActionLead | undefined) ?? null;
  }

  return (value as CustomerActionLead | null) ?? null;
}

function readCustomerFormData(formData: FormData) {
  return {
    assigneeId: formData.get("assigneeId"),
    bestContactTime: formData.get("bestContactTime"),
    city: formData.get("city"),
    description: formData.get("description"),
    email: formData.get("email"),
    legalArea: formData.get("legalArea"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    phone: formData.get("phone"),
    priority: formData.get("priority"),
    source: formData.get("source"),
    summary: formData.get("summary"),
  };
}

async function registerCustomerEvent(params: {
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
    throw new Error("Não foi possível registrar o histórico comercial.");
  }
}

function revalidateCustomerPaths(customerId: string, leadId?: string | null) {
  revalidatePath("/crm");
  revalidatePath("/crm/clientes");
  revalidatePath(`/crm/clientes/${customerId}`);
  revalidatePath(`/crm/clientes/${customerId}/editar`);
  revalidatePath("/crm/conversas");
  revalidatePath("/crm/leads");

  if (leadId) {
    revalidatePath(`/crm/leads/${leadId}`);
  }
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

export async function addCustomerNote(
  customerId: string,
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const user = await assertCustomerWriteAccess();
  const parsed = noteSchema.safeParse({ content: formData.get("content") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a observação.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const customer = await getCustomerForAction(customerId);
  const { error } = await supabase.from("notes").insert({
    author_id: user.id,
    content: parsed.data.content,
    customer_id: customer.id,
    internal: true,
    lead_id: customer.lead_id,
  });

  if (error) {
    return {
      message: "Não foi possível salvar a observação.",
      ok: false,
    };
  }

  await registerCustomerEvent({
    actorId: user.id,
    description: "Observação adicionada ao cliente convertido.",
    eventType: "customer_note_added",
    leadId: customer.lead_id,
  });

  revalidateCustomerPaths(customer.id, customer.lead_id);

  return {
    message: "Observação salva.",
    ok: true,
  };
}

export async function updateCustomer(
  customerId: string,
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const user = await assertCustomerWriteAccess();
  const parsed = customerFormSchema.safeParse(readCustomerFormData(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os dados do cliente.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const customer = await getCustomerForAction(customerId);
  const now = new Date().toISOString();
  const relatedLead = getRelatedLead(customer.leads);
  const nextCustomer = {
    email: parsed.data.email,
    name: parsed.data.name,
    notes: parsed.data.notes,
    phone: parsed.data.phone,
    updated_at: now,
  };

  const { error } = await supabase.from("customers").update(nextCustomer).eq("id", customer.id);

  if (error) {
    return {
      message: "Não foi possível salvar os dados do cliente.",
      ok: false,
    };
  }

  if (customer.contact_id) {
    const { error: contactError } = await supabase
      .from("contacts")
      .update({
        city: parsed.data.city,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        updated_at: now,
      })
      .eq("id", customer.contact_id);

    if (contactError) {
      return {
        message: "O cliente foi atualizado, mas não foi possível atualizar o contato vinculado.",
        ok: false,
      };
    }
  }

  if (customer.lead_id) {
    const nextLead = {
      assignee_id: parsed.data.assigneeId,
      best_contact_time: parsed.data.bestContactTime,
      city: parsed.data.city,
      description: parsed.data.description,
      email: parsed.data.email,
      legal_area: parsed.data.legalArea,
      name: parsed.data.name,
      phone: parsed.data.phone,
      priority: parsed.data.priority,
      source: parsed.data.source,
      summary: parsed.data.summary,
      updated_at: now,
    };

    const { error: leadError } = await supabase
      .from("leads")
      .update(nextLead)
      .eq("id", customer.lead_id);

    if (leadError) {
      return {
        message: "O cliente foi atualizado, mas não foi possível atualizar o lead vinculado.",
        ok: false,
      };
    }
  }

  const currentValues = {
    assigneeId: relatedLead?.assignee_id ?? null,
    bestContactTime: relatedLead?.best_contact_time ?? null,
    city: customer.contactCity ?? relatedLead?.city ?? null,
    description: relatedLead?.description ?? null,
    email: customer.email,
    legalArea: relatedLead?.legal_area ?? null,
    name: customer.name,
    notes: customer.notes,
    phone: customer.phone,
    priority: relatedLead?.priority ?? "medium",
    source: relatedLead?.source ?? "manual",
    summary: relatedLead?.summary ?? null,
  };

  const changedFields = Object.entries({
    assigneeId: parsed.data.assigneeId,
    bestContactTime: parsed.data.bestContactTime,
    city: parsed.data.city,
    description: parsed.data.description,
    email: nextCustomer.email,
    legalArea: parsed.data.legalArea,
    name: nextCustomer.name,
    notes: nextCustomer.notes,
    phone: nextCustomer.phone,
    priority: parsed.data.priority,
    source: parsed.data.source,
    summary: parsed.data.summary,
  })
    .filter(([key, value]) => currentValues[key as keyof typeof currentValues] !== value)
    .map(([key]) => key);

  await registerCustomerEvent({
    actorId: user.id,
    description:
      changedFields.length > 0
        ? "Dados do cliente atualizados."
        : "Edição do cliente salva sem alteração de dados.",
    eventType: "customer_updated",
    leadId: customer.lead_id,
    metadata: { changedFields },
  });

  revalidateCustomerPaths(customer.id, customer.lead_id);
  redirect(`/crm/clientes/${customer.id}`);
}

export async function uploadCustomerAttachment(
  customerId: string,
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const user = await assertCustomerWriteAccess();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      fieldErrors: {
        file: ["Selecione um arquivo para anexar."],
      },
      message: "Selecione um arquivo.",
      ok: false,
    };
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return {
      fieldErrors: {
        file: ["O arquivo deve ter no máximo 10 MB."],
      },
      message: "Arquivo maior que o limite permitido.",
      ok: false,
    };
  }

  if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
    return {
      fieldErrors: {
        file: ["Use PDF, imagem, DOC ou DOCX."],
      },
      message: "Tipo de arquivo não permitido.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const customer = await getCustomerForAction(customerId);
  const name = safeFileName(file.name) || "anexo";
  const storagePath = `${customer.id}/${randomUUID()}-${name}`;
  const { error: uploadError } = await supabase.storage
    .from(CUSTOMER_ATTACHMENT_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      message: "Não foi possível enviar o anexo.",
      ok: false,
    };
  }

  const { error: attachmentError } = await supabase.from("attachments").insert({
    customer_id: customer.id,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    lead_id: customer.lead_id,
    storage_bucket: CUSTOMER_ATTACHMENT_BUCKET,
    storage_path: storagePath,
    uploaded_by: user.id,
  });

  if (attachmentError) {
    await supabase.storage.from(CUSTOMER_ATTACHMENT_BUCKET).remove([storagePath]);

    return {
      message: "O arquivo foi enviado, mas não foi possível registrar o anexo.",
      ok: false,
    };
  }

  await registerCustomerEvent({
    actorId: user.id,
    description: "Anexo adicionado ao cliente convertido.",
    eventType: "customer_attachment_added",
    leadId: customer.lead_id,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    },
  });

  revalidateCustomerPaths(customer.id, customer.lead_id);

  return {
    message: "Anexo salvo.",
    ok: true,
  };
}
