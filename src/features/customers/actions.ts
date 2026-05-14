"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

const customerFormSchema = z.object({
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
});

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
    .select("id,contact_id,lead_id,name,email,phone,notes,leads(legal_area)")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Não foi possível carregar o cliente.");
  }

  return data;
}

function getRelatedLead(value: unknown): { legal_area: string | null } | null {
  if (Array.isArray(value)) {
    return (value[0] as { legal_area: string | null } | undefined) ?? null;
  }

  return (value as { legal_area: string | null } | null) ?? null;
}

function readCustomerFormData(formData: FormData) {
  return {
    email: formData.get("email"),
    legalArea: formData.get("legalArea"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    phone: formData.get("phone"),
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

  const relatedLead = getRelatedLead(customer.leads);
  const currentLegalArea = relatedLead?.legal_area ?? null;

  if (customer.lead_id) {
    const { error: leadError } = await supabase
      .from("leads")
      .update({
        legal_area: parsed.data.legalArea,
        updated_at: now,
      })
      .eq("id", customer.lead_id);

    if (leadError) {
      return {
        message: "O cliente foi atualizado, mas não foi possível atualizar a área jurídica.",
        ok: false,
      };
    }
  }

  const changedFields = Object.entries({
    email: nextCustomer.email,
    legalArea: parsed.data.legalArea,
    name: nextCustomer.name,
    notes: nextCustomer.notes,
    phone: nextCustomer.phone,
  })
    .filter(([key, value]) => {
      if (key === "legalArea") {
        return currentLegalArea !== value;
      }

      return customer[key as keyof typeof customer] !== value;
    })
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
