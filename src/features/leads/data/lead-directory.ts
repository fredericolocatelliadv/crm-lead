import { notFound } from "next/navigation";

import type {
  LeadFilters,
  LeadFormValues,
  LeadOption,
  LeadPriority,
  LeadStatus,
} from "@/features/leads/types/lead";
import { getLeadStatus } from "@/features/leads/types/lead";
import { createClient } from "@/server/supabase/server";

export type LeadListItem = {
  assigneeId: string | null;
  assigneeName: string | null;
  city: string | null;
  convertedAt: string | null;
  createdAt: string;
  email: string | null;
  id: string;
  legalArea: string | null;
  lostAt: string | null;
  name: string;
  phone: string | null;
  priority: LeadPriority;
  source: string;
  stageName: string | null;
  status: LeadStatus;
};

export type LeadDetail = LeadListItem & {
  bestContactTime: string | null;
  conversationId: string | null;
  createdByName: string | null;
  description: string | null;
  fbclid: string | null;
  gclid: string | null;
  landingPage: string | null;
  lostReason: string | null;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  referrer: string | null;
  pipelineStageId: string | null;
  privacyNoticeAcceptedAt: string | null;
  privacyPolicyVersion: string | null;
  summary: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmMedium: string | null;
  utmSource: string | null;
  utmTerm: string | null;
};

export type LeadEventItem = {
  actorName: string | null;
  createdAt: string;
  description: string | null;
  eventType: string;
  id: string;
};

export type LeadNoteItem = {
  authorName: string | null;
  content: string;
  createdAt: string;
  id: string;
};

export type LeadListData = {
  assignees: LeadOption[];
  filters: LeadFilters;
  leads: LeadListItem[];
  legalAreas: string[];
  sources: string[];
  stages: LeadOption[];
};

export type LeadDetailData = {
  assignees: LeadOption[];
  events: LeadEventItem[];
  lead: LeadDetail;
  notes: LeadNoteItem[];
  stages: LeadOption[];
};

type RelatedProfile = { full_name: string | null; email: string | null };
type RelatedStage = { name: string | null };

type LeadRow = {
  assignee_id?: string | null;
  assignee?: RelatedProfile | RelatedProfile[] | null;
  best_contact_time?: string | null;
  city: string | null;
  converted_at: string | null;
  created_at: string;
  created_by_profile?: RelatedProfile | RelatedProfile[] | null;
  description?: string | null;
  email: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  id: string;
  landing_page?: string | null;
  legal_area: string | null;
  lost_at: string | null;
  lost_reason?: string | null;
  marketing_consent?: boolean | null;
  marketing_consent_at?: string | null;
  name: string;
  phone: string | null;
  pipeline_stage_id: string | null;
  pipeline_stages: RelatedStage | RelatedStage[] | null;
  priority: LeadPriority;
  privacy_notice_accepted_at?: string | null;
  privacy_policy_version?: string | null;
  referrer?: string | null;
  source: string;
  summary?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_medium?: string | null;
  utm_source?: string | null;
  utm_term?: string | null;
};

type LeadEventRow = {
  actor: RelatedProfile | RelatedProfile[] | null;
  created_at: string;
  description: string | null;
  event_type: string;
  id: string;
};

type LeadNoteRow = {
  author: RelatedProfile | RelatedProfile[] | null;
  content: string;
  created_at: string;
  id: string;
};

type ConversationRow = {
  id: string;
};

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function profileLabel(profile: RelatedProfile | null) {
  return profile?.full_name || profile?.email || null;
}

function mapLead(row: LeadRow): LeadListItem {
  return {
    assigneeId: row.assignee_id ?? null,
    assigneeName: profileLabel(relatedOne(row.assignee)),
    city: row.city,
    convertedAt: row.converted_at,
    createdAt: row.created_at,
    email: row.email,
    id: row.id,
    legalArea: row.legal_area,
    lostAt: row.lost_at,
    name: row.name,
    phone: row.phone,
    priority: row.priority,
    source: row.source,
    stageName: relatedOne(row.pipeline_stages)?.name ?? null,
    status: getLeadStatus({
      convertedAt: row.converted_at,
      lostAt: row.lost_at,
    }),
  };
}

function mapLeadDetail(row: LeadRow, conversationId: string | null): LeadDetail {
  return {
    ...mapLead(row),
    bestContactTime: row.best_contact_time ?? null,
    conversationId,
    createdByName: profileLabel(relatedOne(row.created_by_profile)),
    description: row.description ?? null,
    fbclid: row.fbclid ?? null,
    gclid: row.gclid ?? null,
    landingPage: row.landing_page ?? null,
    lostReason: row.lost_reason ?? null,
    marketingConsent: row.marketing_consent ?? false,
    marketingConsentAt: row.marketing_consent_at ?? null,
    pipelineStageId: row.pipeline_stage_id,
    privacyNoticeAcceptedAt: row.privacy_notice_accepted_at ?? null,
    privacyPolicyVersion: row.privacy_policy_version ?? null,
    referrer: row.referrer ?? null,
    summary: row.summary ?? null,
    utmCampaign: row.utm_campaign ?? null,
    utmContent: row.utm_content ?? null,
    utmMedium: row.utm_medium ?? null,
    utmSource: row.utm_source ?? null,
    utmTerm: row.utm_term ?? null,
  };
}

function parsePriority(value?: string): LeadPriority | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function parseStatus(value?: string): LeadStatus | undefined {
  if (value === "open" || value === "lost") {
    return value;
  }

  return undefined;
}

function cleanFilterValue(value?: string) {
  const normalized = value?.trim();

  return normalized && normalized !== "all" ? normalized : undefined;
}

export function parseLeadFilters(searchParams?: Record<string, string | string[] | undefined>): LeadFilters {
  const read = (key: string) => {
    const value = searchParams?.[key];

    return Array.isArray(value) ? value[0] : value;
  };

  return {
    assigneeId: cleanFilterValue(read("responsavel")),
    legalArea: cleanFilterValue(read("area")),
    priority: parsePriority(read("prioridade")),
    query: cleanFilterValue(read("busca")),
    source: cleanFilterValue(read("origem")),
    status: parseStatus(read("status")),
  };
}

export function buildLeadQueryString(filters: LeadFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("busca", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("prioridade", filters.priority);
  if (filters.source) params.set("origem", filters.source);
  if (filters.legalArea) params.set("area", filters.legalArea);
  if (filters.assigneeId) params.set("responsavel", filters.assigneeId);

  return params.toString();
}

async function getLeadOptions() {
  const supabase = await createClient();

  const [stagesResult, profilesResult] = await Promise.all([
    supabase
      .from("pipeline_stages")
      .select("id,name")
      .eq("active", true)
      .order("position", { ascending: true }),
    supabase
      .from("profiles")
      .select("id,full_name,email")
      .eq("active", true)
      .order("full_name", { ascending: true, nullsFirst: false }),
  ]);

  if (stagesResult.error) {
    throw new Error("Não foi possível carregar as etapas do pipeline.");
  }

  const stages: LeadOption[] = (stagesResult.data ?? []).map((stage) => ({
    id: stage.id,
    label: stage.name,
  }));

  const assignees: LeadOption[] = profilesResult.error
    ? []
    : (profilesResult.data ?? []).map((profile) => ({
        id: profile.id,
        label: profile.full_name || profile.email || "Usuário",
      }));

  return { assignees, stages };
}

export async function getLeadFormOptions() {
  return getLeadOptions();
}

export async function getLeadList(filters: LeadFilters): Promise<LeadListData> {
  const supabase = await createClient();
  const optionsPromise = getLeadOptions();

  let query = supabase
    .from("leads")
    .select(
      "id,name,email,phone,city,legal_area,source,priority,pipeline_stage_id,assignee_id,converted_at,lost_at,created_at,pipeline_stages(name),assignee:profiles!leads_assignee_id_fkey(full_name,email)",
    )
    .is("converted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.query) {
    const term = filters.query.replaceAll(",", " ");
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
  }

  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.legalArea) query = query.eq("legal_area", filters.legalArea);
  if (filters.assigneeId) query = query.eq("assignee_id", filters.assigneeId);

  if (filters.status === "lost") {
    query = query.not("lost_at", "is", null);
  }

  if (filters.status === "open") {
    query = query.is("converted_at", null).is("lost_at", null);
  }

  const [{ assignees, stages }, result, sourceResult, areaResult] = await Promise.all([
    optionsPromise,
    query,
    supabase.from("leads").select("source").not("source", "is", null).order("source"),
    supabase.from("leads").select("legal_area").not("legal_area", "is", null).order("legal_area"),
  ]);

  if (result.error) {
    throw new Error("Não foi possível carregar a lista de leads.");
  }

  const rows = (result.data ?? []) as LeadRow[];
  const customerLeadIds = new Set<string>();

  if (rows.length > 0) {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("lead_id")
      .in(
        "lead_id",
        rows.map((lead) => lead.id),
      );

    if (customersError) {
      throw new Error("Não foi possível verificar os clientes convertidos.");
    }

    for (const customer of customers ?? []) {
      if (customer.lead_id) {
        customerLeadIds.add(customer.lead_id);
      }
    }
  }

  const operationalRows = rows.filter((lead) => !customerLeadIds.has(lead.id));
  const sources = Array.from(new Set((sourceResult.data ?? []).map((item) => item.source).filter(Boolean)));
  const legalAreas = Array.from(new Set((areaResult.data ?? []).map((item) => item.legal_area).filter(Boolean)));

  return {
    assignees,
    filters,
    leads: operationalRows.map(mapLead),
    legalAreas,
    sources,
    stages,
  };
}

export async function getLeadById(id: string): Promise<LeadDetailData> {
  const supabase = await createClient();
  const optionsPromise = getLeadOptions();

  const leadResult = await supabase
    .from("leads")
    .select(
      "id,name,email,phone,city,legal_area,description,source,priority,pipeline_stage_id,summary,best_contact_time,assignee_id,converted_at,lost_at,lost_reason,created_at,utm_source,utm_medium,utm_campaign,utm_term,utm_content,gclid,fbclid,landing_page,referrer,privacy_policy_version,privacy_notice_accepted_at,marketing_consent,marketing_consent_at,pipeline_stages(name),assignee:profiles!leads_assignee_id_fkey(full_name,email),created_by_profile:profiles!leads_created_by_fkey(full_name,email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (leadResult.error) {
    throw new Error("Não foi possível carregar o lead.");
  }

  if (!leadResult.data) {
    notFound();
  }

  const [options, eventsResult, notesResult, conversationResult] = await Promise.all([
    optionsPromise,
    supabase
      .from("lead_events")
      .select("id,event_type,description,created_at,actor:profiles!lead_events_actor_id_fkey(full_name,email)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id,content,created_at,author:profiles!notes_author_id_fkey(full_name,email)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id")
      .eq("lead_id", id)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (eventsResult.error || notesResult.error || conversationResult.error) {
    throw new Error("Não foi possível carregar o histórico do lead.");
  }

  const conversation = conversationResult.data as ConversationRow | null;
  const lead = mapLeadDetail(leadResult.data as LeadRow, conversation?.id ?? null);
  const stages = [...options.stages];

  if (
    lead.pipelineStageId &&
    !stages.some((stage) => stage.id === lead.pipelineStageId)
  ) {
    stages.push({
      id: lead.pipelineStageId,
      label: lead.stageName ? `${lead.stageName} (inativa)` : "Etapa atual inativa",
    });
  }

  return {
    assignees: options.assignees,
    events: ((eventsResult.data ?? []) as LeadEventRow[]).map((event) => ({
      actorName: profileLabel(relatedOne(event.actor)),
      createdAt: event.created_at,
      description: event.description,
      eventType: event.event_type,
      id: event.id,
    })),
    lead,
    notes: ((notesResult.data ?? []) as LeadNoteRow[]).map((note) => ({
      authorName: profileLabel(relatedOne(note.author)),
      content: note.content,
      createdAt: note.created_at,
      id: note.id,
    })),
    stages,
  };
}

export function leadToFormValues(lead: LeadDetail): LeadFormValues {
  return {
    assigneeId: lead.assigneeId,
    bestContactTime: lead.bestContactTime,
    city: lead.city,
    description: lead.description,
    email: lead.email,
    legalArea: lead.legalArea,
    name: lead.name,
    phone: lead.phone,
    pipelineStageId: lead.pipelineStageId,
    priority: lead.priority,
    source: lead.source,
    summary: lead.summary,
  };
}
