import {
  getLeadStatus,
  getSourceLabel,
  statusLabels,
  type LeadPriority,
  type LeadStatus,
} from "@/features/leads/types/lead";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { createClient } from "@/server/supabase/server";

export type ReportsPeriod = "today" | "7d" | "30d" | "90d";

export const reportsPeriodOptions = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
] as const;

export type ReportsFilters = {
  assigneeId?: string;
  campaign?: string;
  legalArea?: string;
  priority?: LeadPriority;
  source?: string;
  stageId?: string;
  status?: LeadStatus;
};

export type ReportOption = {
  id: string;
  label: string;
};

export type ReportMetric = {
  description: string;
  label: string;
  tone: "danger" | "info" | "neutral" | "success" | "warning";
  value: string;
};

export type ReportBreakdownItem = {
  label: string;
  value: number;
};

export type ReportPerformanceItem = {
  conversionRate: string;
  converted: number;
  label: string;
  leads: number;
  lost: number;
  open: number;
};

export type ReportPipelineItem = {
  id: string;
  label: string;
  value: number;
};

export type ReportLeadItem = {
  assigneeName: string | null;
  campaign: string | null;
  contact: string | null;
  conversationId: string | null;
  createdAt: string;
  id: string;
  legalArea: string | null;
  name: string;
  priority: LeadPriority;
  source: string | null;
  stageName: string | null;
  status: LeadStatus;
};

export type ReportsOptions = {
  assignees: ReportOption[];
  campaigns: string[];
  legalAreas: string[];
  sources: string[];
  stages: ReportOption[];
};

export type ReportsOverview = {
  areaPerformance: ReportPerformanceItem[];
  campaignPerformance: ReportPerformanceItem[];
  contentPerformance: ReportBreakdownItem[];
  filters: ReportsFilters;
  leads: ReportLeadItem[];
  lostReasons: ReportBreakdownItem[];
  metrics: ReportMetric[];
  options: ReportsOptions;
  period: ReportsPeriod;
  pipeline: ReportPipelineItem[];
  sourcePerformance: ReportPerformanceItem[];
  statusBreakdown: ReportBreakdownItem[];
  timeline: ReportBreakdownItem[];
  utmSourcePerformance: ReportPerformanceItem[];
};

type RelatedProfile = { email: string | null; full_name: string | null };
type RelatedStage = { id: string; name: string | null; position: number | null };

type LeadRow = {
  assignee: RelatedProfile | RelatedProfile[] | null;
  assignee_id: string | null;
  converted_at: string | null;
  created_at: string;
  email: string | null;
  id: string;
  legal_area: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  name: string;
  phone: string | null;
  pipeline_stage_id: string | null;
  pipeline_stages: RelatedStage | RelatedStage[] | null;
  priority: LeadPriority;
  source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_medium: string | null;
  utm_source: string | null;
};

type LeadOptionRow = {
  legal_area: string | null;
  source: string | null;
  utm_campaign: string | null;
};

type ProfileRow = {
  active: boolean;
  email: string | null;
  full_name: string | null;
  id: string;
};

type PipelineStageRow = {
  active: boolean;
  id: string;
  is_lost: boolean;
  is_won: boolean;
  name: string;
  position: number;
};

type ConversationRow = {
  id: string;
  lead_id: string | null;
  updated_at: string;
};

const periodLabels: Record<ReportsPeriod, string> = {
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
  today: "hoje",
};

function cleanFilterValue(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim();

  return normalized && normalized !== "all" ? normalized : undefined;
}

function parsePriority(value?: string): LeadPriority | undefined {
  if (value === "low" || value === "medium" || value === "high") return value;
  return undefined;
}

function parseStatus(value?: string): LeadStatus | undefined {
  if (value === "open" || value === "converted" || value === "lost") return value;
  return undefined;
}

export function parseReportsFilters(searchParams?: Record<string, string | string[] | undefined>): ReportsFilters {
  return {
    assigneeId: cleanFilterValue(searchParams?.responsavel),
    campaign: cleanFilterValue(searchParams?.campanha),
    legalArea: cleanFilterValue(searchParams?.area),
    priority: parsePriority(cleanFilterValue(searchParams?.prioridade)),
    source: cleanFilterValue(searchParams?.origem),
    stageId: cleanFilterValue(searchParams?.etapa),
    status: parseStatus(cleanFilterValue(searchParams?.status)),
  };
}

export function resolveReportsPeriod(value?: string): ReportsPeriod {
  if (value === "today" || value === "7d" || value === "30d" || value === "90d") {
    return value;
  }

  return "30d";
}

export function getReportsPeriodLabel(period: ReportsPeriod) {
  return periodLabels[period];
}

function getPeriodRange(period: ReportsPeriod) {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);

  if (period === "7d") start.setDate(start.getDate() - 6);
  if (period === "30d") start.setDate(start.getDate() - 29);
  if (period === "90d") start.setDate(start.getDate() - 89);

  return {
    end,
    endIso: end.toISOString(),
    start,
    startIso: start.toISOString(),
  };
}

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function profileLabel(profile: RelatedProfile | ProfileRow | null | undefined) {
  return profile?.full_name || profile?.email || null;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatAverageDays(values: number[]) {
  if (values.length === 0) return "--";

  const average = values.reduce((total, value) => total + value, 0) / values.length;

  if (average < 1) return "menos de 1 dia";
  if (average < 2) return "1 dia";

  return `${average.toFixed(average >= 10 ? 0 : 1).replace(".", ",")} dias`;
}

function countByLabel(items: string[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
}

function buildTimeline(leads: LeadRow[], period: ReportsPeriod) {
  const range = getPeriodRange(period);
  const counts = new Map<string, number>();
  const cursor = new Date(range.start);

  while (cursor <= range.end) {
    counts.set(formatDateKey(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const lead of leads) {
    const key = lead.created_at.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([label, value]) => ({
    label: formatShortDate(label),
    value,
  }));
}

function getStatus(lead: LeadRow) {
  return getLeadStatus({
    convertedAt: lead.converted_at,
    lostAt: lead.lost_at,
  });
}

function buildPerformance(leads: LeadRow[], getLabel: (lead: LeadRow) => string) {
  const groups = new Map<string, { converted: number; leads: number; lost: number; open: number }>();

  for (const lead of leads) {
    const label = getLabel(lead);
    const current = groups.get(label) ?? { converted: 0, leads: 0, lost: 0, open: 0 };
    const status = getStatus(lead);

    current.leads += 1;
    if (status === "converted") current.converted += 1;
    if (status === "lost") current.lost += 1;
    if (status === "open") current.open += 1;

    groups.set(label, current);
  }

  return Array.from(groups.entries())
    .map(([label, item]) => ({
      ...item,
      conversionRate: item.leads > 0 ? formatPercent((item.converted / item.leads) * 100) : "0%",
      label,
    }))
    .sort((a, b) => b.leads - a.leads || a.label.localeCompare(b.label, "pt-BR"));
}

function mostFrequent(items: Array<{ label: string }>, fallback = "Sem dados") {
  return items[0]?.label ?? fallback;
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function buildQueryParams(filters: ReportsFilters) {
  const params = new URLSearchParams();
  if (filters.assigneeId) params.set("responsavel", filters.assigneeId);
  if (filters.campaign) params.set("campanha", filters.campaign);
  if (filters.legalArea) params.set("area", filters.legalArea);
  if (filters.priority) params.set("prioridade", filters.priority);
  if (filters.source) params.set("origem", filters.source);
  if (filters.stageId) params.set("etapa", filters.stageId);
  if (filters.status) params.set("status", filters.status);
  return params;
}

export function buildReportsHref(period: ReportsPeriod, filters: ReportsFilters = {}) {
  const params = buildQueryParams(filters);
  params.set("periodo", period);
  return `/crm/relatorios?${params.toString()}`;
}

function buildMetrics(params: {
  areas: ReportPerformanceItem[];
  campaigns: ReportPerformanceItem[];
  conversionDays: number[];
  conversionRate: number;
  converted: number;
  lost: number;
  lostDays: number[];
  open: number;
  period: ReportsPeriod;
  sources: ReportPerformanceItem[];
  total: number;
  urgent: number;
}) {
  return [
    {
      description: `Entradas criadas em ${getReportsPeriodLabel(params.period)}.`,
      label: "Leads no período",
      tone: "info",
      value: String(params.total),
    },
    {
      description: "Leads ainda em acompanhamento comercial.",
      label: "Leads abertos",
      tone: "neutral",
      value: String(params.open),
    },
    {
      description: "Leads que viraram clientes.",
      label: "Convertidos",
      tone: "success",
      value: String(params.converted),
    },
    {
      description: "Leads encerrados sem conversão.",
      label: "Perdidos",
      tone: "danger",
      value: String(params.lost),
    },
    {
      description: "Conversão calculada sobre os leads filtrados.",
      label: "Taxa de conversão",
      tone: "success",
      value: formatPercent(params.conversionRate),
    },
    {
      description: "Leads com prioridade alta dentro do filtro.",
      label: "Leads urgentes",
      tone: "warning",
      value: String(params.urgent),
    },
    {
      description: "Origem com maior volume no filtro atual.",
      label: "Origem principal",
      tone: "info",
      value: mostFrequent(params.sources),
    },
    {
      description: "Campanha com maior volume no filtro atual.",
      label: "Campanha principal",
      tone: "info",
      value: mostFrequent(params.campaigns),
    },
    {
      description: "Área jurídica com maior volume no filtro atual.",
      label: "Área principal",
      tone: "neutral",
      value: mostFrequent(params.areas),
    },
    {
      description: "Tempo médio entre entrada e conversão.",
      label: "Tempo até conversão",
      tone: "success",
      value: formatAverageDays(params.conversionDays),
    },
    {
      description: "Tempo médio entre entrada e perda.",
      label: "Tempo até perda",
      tone: "danger",
      value: formatAverageDays(params.lostDays),
    },
  ] satisfies ReportMetric[];
}

export async function getReportsOverview(
  period: ReportsPeriod,
  filters: ReportsFilters = {},
): Promise<ReportsOverview> {
  const supabase = await createClient();
  const role = await getCurrentUserRole();
  const canReadConversations = hasPermission(role, "conversations:read");
  const range = getPeriodRange(period);

  let leadsQuery = supabase
    .from("leads")
    .select(
      "id,name,email,phone,source,legal_area,priority,pipeline_stage_id,assignee_id,converted_at,lost_at,lost_reason,created_at,utm_source,utm_medium,utm_campaign,utm_content,pipeline_stages(id,name,position),assignee:profiles!leads_assignee_id_fkey(full_name,email)",
    )
    .gte("created_at", range.startIso)
    .lte("created_at", range.endIso)
    .order("created_at", { ascending: false });

  if (filters.source) leadsQuery = leadsQuery.eq("source", filters.source);
  if (filters.campaign) leadsQuery = leadsQuery.eq("utm_campaign", filters.campaign);
  if (filters.legalArea) leadsQuery = leadsQuery.eq("legal_area", filters.legalArea);
  if (filters.priority) leadsQuery = leadsQuery.eq("priority", filters.priority);
  if (filters.assigneeId) leadsQuery = leadsQuery.eq("assignee_id", filters.assigneeId);
  if (filters.stageId) leadsQuery = leadsQuery.eq("pipeline_stage_id", filters.stageId);
  if (filters.status === "open") leadsQuery = leadsQuery.is("converted_at", null).is("lost_at", null);
  if (filters.status === "converted") leadsQuery = leadsQuery.not("converted_at", "is", null);
  if (filters.status === "lost") leadsQuery = leadsQuery.not("lost_at", "is", null);

  const [leadsResult, optionLeadsResult, profilesResult, stagesResult] = await Promise.all([
    leadsQuery,
    supabase.from("leads").select("source,legal_area,utm_campaign").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,full_name,email,active").eq("active", true).order("full_name"),
    supabase
      .from("pipeline_stages")
      .select("id,name,position,is_won,is_lost,active")
      .eq("active", true)
      .order("position", { ascending: true }),
  ]);

  if (leadsResult.error || optionLeadsResult.error || profilesResult.error || stagesResult.error) {
    throw new Error("Não foi possível carregar os relatórios de leads.");
  }

  const leads = (leadsResult.data ?? []) as LeadRow[];
  const stages = (stagesResult.data ?? []) as PipelineStageRow[];
  const conversationsByLeadId = new Map<string, string>();

  if (leads.length > 0 && canReadConversations) {
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("id,lead_id,updated_at")
      .in(
        "lead_id",
        leads.map((lead) => lead.id),
      )
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      throw new Error("Não foi possível carregar os atalhos de conversa dos leads.");
    }

    for (const conversation of (conversations ?? []) as ConversationRow[]) {
      if (conversation.lead_id && !conversationsByLeadId.has(conversation.lead_id)) {
        conversationsByLeadId.set(conversation.lead_id, conversation.id);
      }
    }
  }

  const statusBreakdown = countByLabel(leads.map((lead) => statusLabels[getStatus(lead)]));
  const sourcePerformance = buildPerformance(leads, (lead) => getSourceLabel(lead.source));
  const campaignPerformance = buildPerformance(leads, (lead) => lead.utm_campaign || "Sem campanha");
  const utmSourcePerformance = buildPerformance(leads, (lead) => lead.utm_source || "Sem canal UTM");
  const areaPerformance = buildPerformance(leads, (lead) => lead.legal_area || "Área não informada");
  const converted = leads.filter((lead) => getStatus(lead) === "converted");
  const lost = leads.filter((lead) => getStatus(lead) === "lost");
  const open = leads.filter((lead) => getStatus(lead) === "open");
  const conversionDays = converted.map(
    (lead) => (new Date(lead.converted_at!).getTime() - new Date(lead.created_at).getTime()) / 86400000,
  );
  const lostDays = lost.map(
    (lead) => (new Date(lead.lost_at!).getTime() - new Date(lead.created_at).getTime()) / 86400000,
  );

  return {
    areaPerformance,
    campaignPerformance,
    contentPerformance: countByLabel(leads.map((lead) => lead.utm_content || "Sem criativo informado")),
    filters,
    leads: leads.map((lead) => ({
      assigneeName: profileLabel(relatedOne(lead.assignee)),
      campaign: lead.utm_campaign,
      contact: lead.phone || lead.email,
      conversationId: conversationsByLeadId.get(lead.id) ?? null,
      createdAt: lead.created_at,
      id: lead.id,
      legalArea: lead.legal_area,
      name: lead.name,
      priority: lead.priority,
      source: lead.source,
      stageName: relatedOne(lead.pipeline_stages)?.name ?? null,
      status: getStatus(lead),
    })),
    lostReasons: countByLabel(lost.map((lead) => lead.lost_reason || "Motivo não informado")),
    metrics: buildMetrics({
      areas: areaPerformance,
      campaigns: campaignPerformance,
      conversionDays,
      conversionRate: leads.length > 0 ? (converted.length / leads.length) * 100 : 0,
      converted: converted.length,
      lost: lost.length,
      lostDays,
      open: open.length,
      period,
      sources: sourcePerformance,
      total: leads.length,
      urgent: leads.filter((lead) => lead.priority === "high").length,
    }),
    options: {
      assignees: ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => ({
        id: profile.id,
        label: profileLabel(profile) ?? "Usuário interno",
      })),
      campaigns: uniqueSorted(((optionLeadsResult.data ?? []) as LeadOptionRow[]).map((lead) => lead.utm_campaign)),
      legalAreas: uniqueSorted(((optionLeadsResult.data ?? []) as LeadOptionRow[]).map((lead) => lead.legal_area)),
      sources: uniqueSorted(((optionLeadsResult.data ?? []) as LeadOptionRow[]).map((lead) => lead.source)),
      stages: stages
        .filter((stage) => !stage.is_won && !stage.is_lost)
        .map((stage) => ({ id: stage.id, label: stage.name })),
    },
    period,
    pipeline: stages
      .filter((stage) => !stage.is_won && !stage.is_lost)
      .map((stage) => ({
        id: stage.id,
        label: stage.name,
        value: open.filter((lead) => lead.pipeline_stage_id === stage.id).length,
      })),
    sourcePerformance,
    statusBreakdown,
    timeline: buildTimeline(leads, period),
    utmSourcePerformance,
  };
}
