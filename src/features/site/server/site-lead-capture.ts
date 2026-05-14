import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { isValidBrazilianPhone, onlyDigits } from "@/features/site/lib/phone";
import { createAdminClient } from "@/server/supabase/admin";

const contactChannelLabels = {
  email: "E-mail",
  phone: "Ligação telefônica",
  whatsapp: "WhatsApp",
} as const;

const sourceLabels = {
  site: "formulário de agendamento do site",
  site_whatsapp: "botão de WhatsApp do site",
} as const;

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.string().nullable(),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([z.string().email("Informe um e-mail válido."), z.null()]),
);

const marketingAttributionSchema = z.object({
  fbclid: optionalText,
  gclid: optionalText,
  landingPage: optionalText,
  referrer: optionalText,
  utmCampaign: optionalText,
  utmContent: optionalText,
  utmMedium: optionalText,
  utmSource: optionalText,
  utmTerm: optionalText,
});

export const siteLeadCaptureSchema = z.object({
  bestContactTime: optionalText,
  email: optionalEmail,
  legalArea: z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    },
    z.string().trim().min(2, "Selecione a área jurídica.").nullable(),
  ),
  marketingConsent: z.boolean().default(false),
  marketingAttribution: marketingAttributionSchema.optional().nullable(),
  message: z.string().trim().min(5, "Descreva brevemente o assunto."),
  name: z.string().trim().min(2, "Informe seu nome completo."),
  phone: optionalText,
  preferredContactChannel: z.enum(["whatsapp", "email", "phone"], {
    error: "Selecione a preferência de retorno.",
  }),
  privacyNoticeAccepted: z
    .boolean()
    .refine((value) => value, "Confirme a ciência sobre o uso dos dados."),
  recaptchaToken: z.string().trim().min(1, "Validação de segurança indisponível."),
  source: z.enum(["site", "site_whatsapp"]),
  website: optionalText,
  whatsappIntentId: optionalText,
}).superRefine((value, ctx) => {
  const normalizedPhone = value.phone ? normalizePhone(value.phone) : null;

  if (value.source === "site" && !normalizedPhone) {
    ctx.addIssue({
      code: "custom",
      message: "Informe seu WhatsApp ou telefone.",
      path: ["phone"],
    });
  }

  if (normalizedPhone && !isValidBrazilianPhone(normalizedPhone)) {
    ctx.addIssue({
      code: "custom",
      message: "Informe um telefone válido.",
      path: ["phone"],
    });
  }

  if (value.source === "site_whatsapp" && !value.whatsappIntentId) {
    ctx.addIssue({
      code: "custom",
      message: "Não foi possível iniciar o atendimento. Tente novamente.",
      path: ["whatsappIntentId"],
    });
  }
});

export type SiteLeadCaptureInput = z.infer<typeof siteLeadCaptureSchema>;

function normalizePhone(value: string) {
  return onlyDigits(value);
}

function formatSummary(input: SiteLeadCaptureInput) {
  const parts = [
    `Solicitação recebida pelo ${sourceLabels[input.source]}.`,
    `Preferência de retorno: ${contactChannelLabels[input.preferredContactChannel]}.`,
  ];

  if (input.legalArea) {
    parts.push(`Área jurídica: ${input.legalArea}.`);
  }

  if (input.bestContactTime) {
    parts.push(`Melhor horário: ${input.bestContactTime}.`);
  }

  return parts.join(" ");
}

function buildMarketingAttribution(input: SiteLeadCaptureInput) {
  const attribution = input.marketingAttribution ?? null;

  return {
    fbclid: attribution?.fbclid ?? null,
    gclid: attribution?.gclid ?? null,
    landing_page: attribution?.landingPage ?? null,
    marketing_attribution: {
      ...(attribution ?? {}),
      whatsappIntentId: input.whatsappIntentId ?? null,
    },
    referrer: attribution?.referrer ?? null,
    utm_campaign: attribution?.utmCampaign ?? null,
    utm_content: attribution?.utmContent ?? null,
    utm_medium: attribution?.utmMedium ?? null,
    utm_source: attribution?.utmSource ?? null,
    utm_term: attribution?.utmTerm ?? null,
  };
}

function buildPrivacyConsent(input: SiteLeadCaptureInput, version: string, now: string) {
  return {
    marketing_consent: input.marketingConsent,
    marketing_consent_at: input.marketingConsent ? now : null,
    privacy_notice_accepted_at: input.privacyNoticeAccepted ? now : null,
    privacy_policy_version: version,
  };
}

async function getDefaultPipelineStageId(supabase: SupabaseClient) {
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

async function getCurrentLegalDocumentsVersion(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("legal_documents_version")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a versão dos documentos legais.");
  }

  return data?.legal_documents_version ?? "1.0";
}

async function isActiveLegalArea(supabase: SupabaseClient, legalArea: string | null) {
  if (!legalArea) return true;

  const { data, error } = await supabase
    .from("legal_areas")
    .select("id")
    .eq("name", legalArea)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível validar a área jurídica.");
  }

  return Boolean(data);
}

async function getOrCreateContact(
  supabase: SupabaseClient,
  input: SiteLeadCaptureInput,
  normalizedPhone: string,
) {
  const { data: existing, error: existingError } = await supabase
    .from("contacts")
    .select("id,name,email,phone")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (existingError) {
    throw new Error("Não foi possível verificar o contato.");
  }

  if (existing) {
    await supabase
      .from("contacts")
      .update({
        email: input.email,
        name: input.name,
        phone: normalizedPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return existing;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      email: input.email,
      name: input.name,
      phone: normalizedPhone,
    })
    .select("id")
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from("contacts")
      .select("id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (retry) return retry;
    throw new Error("Não foi possível criar o contato.");
  }

  return data;
}

async function findOpenLead(
  supabase: SupabaseClient,
  contactId: string,
  normalizedPhone: string,
) {
  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .or(`contact_id.eq.${contactId},phone.eq.${normalizedPhone}`)
    .is("converted_at", null)
    .is("lost_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar leads existentes.");
  }

  return data;
}

async function registerLeadEvent(
  supabase: SupabaseClient,
  params: {
    leadId: string;
    marketingConsent: boolean;
    privacyPolicyVersion: string;
    source: SiteLeadCaptureInput["source"];
    preferredContactChannel: SiteLeadCaptureInput["preferredContactChannel"];
  },
) {
  await supabase.from("lead_events").insert({
    description:
      params.source === "site_whatsapp"
        ? "Contato iniciado pelo botão de WhatsApp do site."
        : "Solicitação de agendamento recebida pelo formulário do site.",
    event_type:
      params.source === "site_whatsapp"
        ? "site_whatsapp_requested"
        : "site_appointment_requested",
    lead_id: params.leadId,
    metadata: {
      marketingConsent: params.marketingConsent,
      privacyPolicyVersion: params.privacyPolicyVersion,
      preferredContactChannel: params.preferredContactChannel,
      source: params.source,
    },
  });
}

async function captureSiteWhatsappIntent(params: {
  input: SiteLeadCaptureInput;
  legalDocumentsVersion: string;
  now: string;
  supabase: SupabaseClient;
}) {
  const { input, legalDocumentsVersion, now, supabase } = params;
  const whatsappIntentId = input.whatsappIntentId;

  if (!whatsappIntentId) {
    throw new Error("Não foi possível iniciar o atendimento.");
  }

  const marketingAttribution = buildMarketingAttribution(input);
  const privacyConsent = buildPrivacyConsent(input, legalDocumentsVersion, now);

  const { error } = await supabase
    .from("site_whatsapp_intents")
    .upsert(
      {
        best_contact_time: input.bestContactTime,
        consumed_at: null,
        contact_id: null,
        email: input.email,
        intent_id: whatsappIntentId,
        lead_id: null,
        legal_area: input.legalArea,
        marketing_attribution: marketingAttribution.marketing_attribution,
        message: input.message,
        name: input.name,
        ...privacyConsent,
        updated_at: now,
      },
      { onConflict: "intent_id" },
    );

  if (error) {
    throw new Error("Não foi possível criar o atendimento.");
  }

  return { leadId: null };
}

export async function captureSiteLead(input: SiteLeadCaptureInput) {
  if (input.website) {
    return { leadId: null };
  }

  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null;

  if (input.source === "site" && !normalizedPhone) {
    throw new Error("Informe um telefone válido.");
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const legalAreaIsActive = await isActiveLegalArea(supabase, input.legalArea);

  if (!legalAreaIsActive) {
    throw new Error("Informe uma área jurídica válida.");
  }

  const [stageId, legalDocumentsVersion] = await Promise.all([
    getDefaultPipelineStageId(supabase),
    getCurrentLegalDocumentsVersion(supabase),
  ]);

  if (!normalizedPhone) {
    return captureSiteWhatsappIntent({
      input,
      legalDocumentsVersion,
      now,
      supabase,
    });
  }

  const contact = await getOrCreateContact(supabase, input, normalizedPhone);
  const summary = formatSummary(input);
  const marketingAttribution = buildMarketingAttribution(input);
  const privacyConsent = buildPrivacyConsent(input, legalDocumentsVersion, now);
  const existingLead = await findOpenLead(supabase, contact.id, normalizedPhone);

  if (existingLead?.id) {
    const { error } = await supabase
      .from("leads")
      .update({
        best_contact_time: input.bestContactTime,
        contact_id: contact.id,
        description: input.message,
        email: input.email,
        legal_area: input.legalArea,
        name: input.name,
        phone: normalizedPhone,
        priority: "medium",
        ...privacyConsent,
        source: input.source,
        summary,
        ...marketingAttribution,
        updated_at: now,
      })
      .eq("id", existingLead.id);

    if (error) {
      throw new Error("Não foi possível atualizar o lead.");
    }

    await registerLeadEvent(supabase, {
      leadId: existingLead.id,
      marketingConsent: input.marketingConsent,
      preferredContactChannel: input.preferredContactChannel,
      privacyPolicyVersion: legalDocumentsVersion,
      source: input.source,
    });

    return { leadId: existingLead.id };
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      best_contact_time: input.bestContactTime,
      contact_id: contact.id,
      description: input.message,
      email: input.email,
      legal_area: input.legalArea,
      name: input.name,
      phone: normalizedPhone,
      pipeline_stage_id: stageId,
      priority: "medium",
      ...privacyConsent,
      source: input.source,
      summary,
      ...marketingAttribution,
    })
    .select("id")
    .single();

  if (error || !lead) {
    throw new Error("Não foi possível criar o lead.");
  }

  await registerLeadEvent(supabase, {
    leadId: lead.id,
    marketingConsent: input.marketingConsent,
    preferredContactChannel: input.preferredContactChannel,
    privacyPolicyVersion: legalDocumentsVersion,
    source: input.source,
  });

  return { leadId: lead.id };
}
