"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

export type MoveLeadStageState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

const moveLeadSchema = z.object({
  lostReason: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value : undefined),
    z.string().trim().optional(),
  ),
  stageId: z.string().uuid("Selecione uma etapa válida."),
});

async function assertPipelineWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write") && !hasPermission(role, "leads:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

async function registerPipelineEvent(params: {
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

export async function moveLeadStage(
  leadId: string,
  _previousState: MoveLeadStageState,
  formData: FormData,
): Promise<MoveLeadStageState> {
  const user = await assertPipelineWriteAccess();
  const parsed = moveLeadSchema.safeParse({
    lostReason: formData.get("lostReason"),
    stageId: formData.get("stageId"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a movimentação do lead.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const [leadResult, stageResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id,contact_id,name,email,phone,pipeline_stage_id,converted_at,lost_at")
      .eq("id", leadId)
      .maybeSingle(),
    supabase
      .from("pipeline_stages")
      .select("id,name,is_won,is_lost")
      .eq("id", parsed.data.stageId)
      .eq("active", true)
      .maybeSingle(),
  ]);

  if (leadResult.error || !leadResult.data) {
    return {
      message: "Não foi possível carregar o lead para movimentação.",
      ok: false,
    };
  }

  if (stageResult.error || !stageResult.data) {
    return {
      message: "Não foi possível validar a etapa escolhida.",
      ok: false,
    };
  }

  const lead = leadResult.data;
  const stage = stageResult.data;
  const now = new Date().toISOString();
  const lostReason = parsed.data.lostReason?.trim();
  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("customers")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (existingCustomerError) {
    return {
      message: "Não foi possível verificar se este contato já é cliente.",
      ok: false,
    };
  }

  if (lead.converted_at || existingCustomer) {
    return {
      message: "Este contato já é cliente. Atualize o atendimento pela página do cliente.",
      ok: false,
    };
  }

  if (stage.is_lost && !lostReason) {
    return {
      fieldErrors: {
        lostReason: ["Informe o motivo para encerrar o lead como perdido."],
      },
      message: "Informe o motivo da perda.",
      ok: false,
    };
  }

  const nextLead = {
    converted_at: stage.is_won ? lead.converted_at ?? now : null,
    lost_at: stage.is_lost ? now : null,
    lost_reason: stage.is_lost ? lostReason : null,
    pipeline_stage_id: stage.id,
    updated_at: now,
  };

  const { error: updateError } = await supabase
    .from("leads")
    .update(nextLead)
    .eq("id", leadId);

  if (updateError) {
    return {
      message: "Não foi possível mover o lead.",
      ok: false,
    };
  }

  if (stage.is_won) {
    if (!existingCustomer) {
      const { error: customerError } = await supabase.from("customers").insert({
        contact_id: lead.contact_id,
        converted_at: nextLead.converted_at,
        converted_by: user.id,
        email: lead.email,
        lead_id: lead.id,
        name: lead.name,
        phone: lead.phone,
      });

      if (customerError) {
        return {
          message: "O lead foi movido, mas não foi possível criar o cliente convertido.",
          ok: false,
        };
      }
    }
  }

  await registerPipelineEvent({
    actorId: user.id,
    description: stage.is_won
      ? "Lead movido para Convertido e registrado como cliente."
      : stage.is_lost
        ? "Lead movido para Perdido."
        : `Lead movido para ${stage.name}.`,
    eventType: stage.is_won
      ? "lead_converted"
      : stage.is_lost
        ? "lead_lost"
        : "pipeline_stage_changed",
    leadId,
    metadata: {
      lostReason: stage.is_lost ? lostReason : undefined,
      previousStageId: lead.pipeline_stage_id,
      stageId: stage.id,
      stageName: stage.name,
    },
  });

  revalidatePath("/crm");
  revalidatePath("/crm/clientes");
  revalidatePath("/crm/conversas");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/pipeline");

  return {
    message: stage.is_won
      ? "Lead convertido em cliente."
      : stage.is_lost
        ? "Lead marcado como perdido."
        : "Lead movido no pipeline.",
    ok: true,
  };
}
