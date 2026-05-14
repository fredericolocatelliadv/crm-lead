import { createClient } from "@/server/supabase/server";

export type ReportsPeriod = "7d" | "30d" | "90d";

export const reportsPeriodOptions = [
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
] as const;

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

export type ReportTimelineItem = {
  label: string;
  value: number;
};

export type ReportResponsibleItem = {
  conversations: number;
  label: string;
  leads: number;
};

export type ReportsOverview = {
  averageResponseTime: string;
  legalAreas: ReportBreakdownItem[];
  metrics: ReportMetric[];
  period: ReportsPeriod;
  responsible: ReportResponsibleItem[];
  sources: ReportBreakdownItem[];
  timeline: ReportTimelineItem[];
};

type LeadRow = {
  assignee_id: string | null;
  converted_at: string | null;
  created_at: string;
  id: string;
  legal_area: string | null;
  lost_at: string | null;
  source: string | null;
};

type ConversationRow = {
  assigned_to: string | null;
  created_at: string;
  id: string;
};

type MessageRow = {
  conversation_id: string;
  direction: "inbound" | "outbound" | "internal";
  sent_at: string;
};

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  id: string;
};

const sourceLabels: Record<string, string> = {
  ai: "IA",
  chatbot: "Chatbot",
  form: "Site",
  manual: "Manual",
  site: "Site",
  whatsapp: "WhatsApp",
};

const periodLabels: Record<ReportsPeriod, string> = {
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
};

export function resolveReportsPeriod(value?: string): ReportsPeriod {
  if (value === "7d" || value === "30d" || value === "90d") {
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

function formatSource(source: string | null) {
  if (!source) return "Não informada";

  return sourceLabels[source] ?? source;
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

function profileLabel(profile: ProfileRow | undefined) {
  if (!profile) return "Sem responsável";

  return profile.full_name || profile.email || "Usuário interno";
}

function formatAverageResponse(messages: MessageRow[]) {
  const conversations = new Map<string, { inbound?: Date; outbound?: Date }>();

  for (const message of messages) {
    const current = conversations.get(message.conversation_id) ?? {};
    const sentAt = new Date(message.sent_at);

    if (message.direction === "inbound" && !current.inbound) {
      current.inbound = sentAt;
    }

    if (
      message.direction === "outbound" &&
      current.inbound &&
      !current.outbound &&
      sentAt >= current.inbound
    ) {
      current.outbound = sentAt;
    }

    conversations.set(message.conversation_id, current);
  }

  const responseTimes = Array.from(conversations.values())
    .filter((item): item is { inbound: Date; outbound: Date } => Boolean(item.inbound && item.outbound))
    .map((item) => item.outbound.getTime() - item.inbound.getTime());

  if (responseTimes.length === 0) {
    return "--";
  }

  const averageMinutes =
    responseTimes.reduce((total, value) => total + value, 0) / responseTimes.length / 60000;

  if (averageMinutes < 60) {
    return `${Math.round(averageMinutes)} min`;
  }

  const hours = averageMinutes / 60;

  return `${hours.toFixed(hours >= 10 ? 0 : 1).replace(".", ",")} h`;
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

export async function getReportsOverview(period: ReportsPeriod): Promise<ReportsOverview> {
  const supabase = await createClient();
  const range = getPeriodRange(period);

  const leadsQuery = supabase
    .from("leads")
    .select("id,source,legal_area,assignee_id,created_at,converted_at,lost_at")
    .gte("created_at", range.startIso)
    .lte("created_at", range.endIso)
    .order("created_at", { ascending: true });

  const conversionsQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("converted_at", range.startIso)
    .lte("converted_at", range.endIso);

  const lostQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("lost_at", range.startIso)
    .lte("lost_at", range.endIso);

  const conversationsQuery = supabase
    .from("conversations")
    .select("id,assigned_to,created_at")
    .gte("created_at", range.startIso)
    .lte("created_at", range.endIso);

  const messagesQuery = supabase
    .from("messages")
    .select("conversation_id,direction,sent_at")
    .gte("sent_at", range.startIso)
    .lte("sent_at", range.endIso)
    .in("direction", ["inbound", "outbound"])
    .order("sent_at", { ascending: true })
    .limit(2000);

  const profilesQuery = supabase.from("profiles").select("id,full_name,email");

  const [leadsResult, conversionsResult, lostResult, conversationsResult, messagesResult, profilesResult] =
    await Promise.all([
      leadsQuery,
      conversionsQuery,
      lostQuery,
      conversationsQuery,
      messagesQuery,
      profilesQuery,
    ]);

  if (
    leadsResult.error ||
    conversionsResult.error ||
    lostResult.error ||
    conversationsResult.error ||
    messagesResult.error ||
    profilesResult.error
  ) {
    throw new Error("Não foi possível carregar os relatórios.");
  }

  const leads = (leadsResult.data ?? []) as LeadRow[];
  const conversations = (conversationsResult.data ?? []) as ConversationRow[];
  const messages = (messagesResult.data ?? []) as MessageRow[];
  const profiles = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );
  const conversions = conversionsResult.count ?? 0;
  const lost = lostResult.count ?? 0;
  const conversionRate = leads.length > 0 ? (conversions / leads.length) * 100 : 0;
  const averageResponseTime = formatAverageResponse(messages);
  const responsible = new Map<string, ReportResponsibleItem>();

  for (const lead of leads) {
    const key = lead.assignee_id ?? "none";
    const current =
      responsible.get(key) ??
      {
        conversations: 0,
        label: profileLabel(lead.assignee_id ? profiles.get(lead.assignee_id) : undefined),
        leads: 0,
      };

    current.leads += 1;
    responsible.set(key, current);
  }

  for (const conversation of conversations) {
    const key = conversation.assigned_to ?? "none";
    const current =
      responsible.get(key) ??
      {
        conversations: 0,
        label: profileLabel(conversation.assigned_to ? profiles.get(conversation.assigned_to) : undefined),
        leads: 0,
      };

    current.conversations += 1;
    responsible.set(key, current);
  }

  return {
    averageResponseTime,
    legalAreas: countByLabel(leads.map((lead) => lead.legal_area || "Não informada")),
    metrics: [
      {
        description: `Entradas registradas nos ${getReportsPeriodLabel(period)}.`,
        label: "Leads no período",
        tone: "info",
        value: String(leads.length),
      },
      {
        description: "Leads convertidos em clientes no período.",
        label: "Convertidos",
        tone: "success",
        value: String(conversions),
      },
      {
        description: "Leads encerrados sem conversão no período.",
        label: "Perdidos",
        tone: "danger",
        value: String(lost),
      },
      {
        description: "Conversão calculada sobre os leads criados no período.",
        label: "Taxa de conversão",
        tone: "success",
        value: formatPercent(conversionRate),
      },
      {
        description: "Conversas abertas no período selecionado.",
        label: "Atendimentos",
        tone: "neutral",
        value: String(conversations.length),
      },
      {
        description: "Tempo entre a primeira mensagem recebida e a primeira resposta.",
        label: "Tempo médio de resposta",
        tone: "warning",
        value: averageResponseTime,
      },
    ],
    period,
    responsible: Array.from(responsible.values()).sort(
      (a, b) => b.conversations + b.leads - (a.conversations + a.leads),
    ),
    sources: countByLabel(leads.map((lead) => formatSource(lead.source))),
    timeline: buildTimeline(leads, period),
  };
}
