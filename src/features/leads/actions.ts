"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

export type LeadActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

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

const leadFormSchema = z.object({
  assigneeId: optionalUuid,
  bestContactTime: optionalText,
  city: optionalText,
  description: optionalText,
  email: optionalText.pipe(z.string().email("Informe um e-mail válido.").nullable()),
  legalArea: optionalText,
  name: z.string().trim().min(2, "Informe o nome do lead."),
  phone: optionalText,
  pipelineStageId: optionalUuid,
  priority: z.enum(["low", "medium", "high"], {
    error: "Informe a prioridade do lead.",
  }),
  source: z.string().trim().min(2, "Informe a origem do lead."),
  summary: optionalText,
});

const noteSchema = z.object({
  content: z.string().trim().min(3, "Escreva uma observação antes de salvar."),
});

const lostLeadSchema = z.object({
  reason: z.string().trim().min(3, "Informe o motivo da perda."),
});

function readFormData(formData: FormData) {
  return {
    assigneeId: formData.get("assigneeId"),
    bestContactTime: formData.get("bestContactTime"),
    city: formData.get("city"),
    description: formData.get("description"),
    email: formData.get("email"),
    legalArea: formData.get("legalArea"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    pipelineStageId: formData.get("pipelineStageId"),
    priority: formData.get("priority"),
    source: formData.get("source"),
    summary: formData.get("summary"),
  };
}

async function assertLeadWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write") && !hasPermission(role, "leads:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

async function getDefaultStageId() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a etapa inicial do lead.");
  }

  return data?.id ?? null;
}

async function getStageIdByFlag(flag: "is_lost" | "is_won") {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq(flag, true)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function registerLeadEvent(params: {
  actorId: string;
  description: string;
  eventType: string;
  leadId: string;
  metadata?: Record<string, unknown>;
}) {
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

export async function createLead(
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await assertLeadWriteAccess();
  const parsed = leadFormSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os campos do lead.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const stageId = parsed.data.pipelineStageId ?? (await getDefaultStageId());

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      city: parsed.data.city,
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
    })
    .select("id")
    .single();

  if (contactError) {
    return {
      message: "Não foi possível cadastrar o contato do lead.",
      ok: false,
    };
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      assignee_id: parsed.data.assigneeId,
      best_contact_time: parsed.data.bestContactTime,
      city: parsed.data.city,
      contact_id: contact.id,
      created_by: user.id,
      description: parsed.data.description,
      email: parsed.data.email,
      legal_area: parsed.data.legalArea,
      name: parsed.data.name,
      phone: parsed.data.phone,
      pipeline_stage_id: stageId,
      priority: parsed.data.priority,
      source: parsed.data.source,
      summary: parsed.data.summary,
    })
    .select("id")
    .single();

  if (error) {
    return {
      message: "Não foi possível cadastrar o lead.",
      ok: false,
    };
  }

  await registerLeadEvent({
    actorId: user.id,
    description: "Lead criado manualmente no CRM.",
    eventType: "lead_created",
    leadId: lead.id,
  });

  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${lead.id}`);
}

export async function updateLead(
  leadId: string,
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await assertLeadWriteAccess();
  const parsed = leadFormSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os campos do lead.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { data: currentLead, error: currentError } = await supabase
    .from("leads")
    .select("contact_id,name,email,phone,city,legal_area,description,source,priority,pipeline_stage_id,summary,best_contact_time,assignee_id")
    .eq("id", leadId)
    .maybeSingle();

  if (currentError || !currentLead) {
    return {
      message: "Não foi possível validar o lead antes da edição.",
      ok: false,
    };
  }

  const nextLead = {
    assignee_id: parsed.data.assigneeId,
    best_contact_time: parsed.data.bestContactTime,
    city: parsed.data.city,
    description: parsed.data.description,
    email: parsed.data.email,
    legal_area: parsed.data.legalArea,
    name: parsed.data.name,
    phone: parsed.data.phone,
    pipeline_stage_id: parsed.data.pipelineStageId,
    priority: parsed.data.priority,
    source: parsed.data.source,
    summary: parsed.data.summary,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("leads").update(nextLead).eq("id", leadId);

  if (error) {
    return {
      message: "Não foi possível salvar as alterações do lead.",
      ok: false,
    };
  }

  if (currentLead.contact_id) {
    const { error: contactError } = await supabase
      .from("contacts")
      .update({
        city: parsed.data.city,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        updated_at: nextLead.updated_at,
      })
      .eq("id", currentLead.contact_id);

    if (contactError) {
      return {
        message: "O lead foi atualizado, mas não foi possível sincronizar o contato vinculado.",
        ok: false,
      };
    }
  }

  const changedFields = Object.entries(nextLead)
    .filter(([key]) => key !== "updated_at")
    .filter(([key, value]) => currentLead[key as keyof typeof currentLead] !== value)
    .map(([key]) => key);

  await registerLeadEvent({
    actorId: user.id,
    description:
      changedFields.length > 0
        ? "Dados do lead atualizados."
        : "Edição salva sem alteração de dados.",
    eventType: "lead_updated",
    leadId,
    metadata: { changedFields },
  });

  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);
  redirect(`/crm/leads/${leadId}`);
}

export async function addLeadNote(
  leadId: string,
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await assertLeadWriteAccess();
  const parsed = noteSchema.safeParse({ content: formData.get("content") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a observação.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    author_id: user.id,
    content: parsed.data.content,
    internal: true,
    lead_id: leadId,
  });

  if (error) {
    return {
      message: "Não foi possível salvar a observação.",
      ok: false,
    };
  }

  await registerLeadEvent({
    actorId: user.id,
    description: "Observação interna adicionada.",
    eventType: "note_added",
    leadId,
  });

  revalidatePath(`/crm/leads/${leadId}`);

  return {
    message: "Observação salva.",
    ok: true,
  };
}

export async function markLeadAsLost(
  leadId: string,
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await assertLeadWriteAccess();
  const parsed = lostLeadSchema.safeParse({ reason: formData.get("reason") });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Informe o motivo da perda.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const stageId = await getStageIdByFlag("is_lost");
  const { error } = await supabase
    .from("leads")
    .update({
      converted_at: null,
      lost_at: new Date().toISOString(),
      lost_reason: parsed.data.reason,
      pipeline_stage_id: stageId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) {
    return {
      message: "Não foi possível marcar o lead como perdido.",
      ok: false,
    };
  }

  await registerLeadEvent({
    actorId: user.id,
    description: "Lead marcado como perdido.",
    eventType: "lead_lost",
    leadId,
    metadata: { reason: parsed.data.reason },
  });

  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);

  return {
    message: "Lead marcado como perdido.",
    ok: true,
  };
}

export async function convertLead(
  leadId: string,
): Promise<LeadActionState> {
  const user = await assertLeadWriteAccess();
  const supabase = await createClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id,contact_id,name,email,phone,converted_at")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return {
      message: "Não foi possível carregar o lead para conversão.",
      ok: false,
    };
  }

  const convertedAt = lead.converted_at ?? new Date().toISOString();
  const stageId = await getStageIdByFlag("is_won");

  const { error: leadUpdateError } = await supabase
    .from("leads")
    .update({
      converted_at: convertedAt,
      lost_at: null,
      lost_reason: null,
      pipeline_stage_id: stageId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (leadUpdateError) {
    return {
      message: "Não foi possível converter o lead.",
      ok: false,
    };
  }

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (!existingCustomer) {
    const { error: customerError } = await supabase.from("customers").insert({
      contact_id: lead.contact_id,
      converted_at: convertedAt,
      converted_by: user.id,
      email: lead.email,
      lead_id: lead.id,
      name: lead.name,
      phone: lead.phone,
    });

    if (customerError) {
      return {
        message: "O lead foi atualizado, mas não foi possível criar o cliente convertido.",
        ok: false,
      };
    }
  }

  await registerLeadEvent({
    actorId: user.id,
    description: "Lead convertido em cliente.",
    eventType: "lead_converted",
    leadId,
  });

  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);

  return {
    message: "Lead convertido em cliente.",
    ok: true,
  };
}
