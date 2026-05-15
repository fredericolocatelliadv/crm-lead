import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock3,
  MessageSquare,
  TrendingUp,
  UserPlus,
  XCircle,
} from "lucide-react";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { createClient } from "@/server/supabase/server";

export type DashboardPeriod = "today" | "7d" | "30d";
export type DashboardTone = "danger" | "info" | "neutral" | "success" | "warning";

export const dashboardPeriodOptions = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
] as const;

export type DashboardMetric = {
  badge: string;
  description: string;
  icon: LucideIcon;
  label: string;
  tone: DashboardTone;
  value: string;
};

export type DashboardPipelineStage = {
  id: string;
  label: string;
  tone: DashboardTone;
  value: number;
};

export type DashboardRecentLead = {
  conversationId: string | null;
  createdAt: string;
  email: string | null;
  id: string;
  legalArea: string | null;
  name: string;
  phone: string | null;
  priority: LeadPriority;
  source: string;
  stage: string | null;
};

export type DashboardConversation = {
  channel: string;
  createdAt: string;
  id: string;
  lastMessageAt: string | null;
  leadLegalArea: string | null;
  leadName: string | null;
  leadPhone: string | null;
  priority: LeadPriority;
  status: ConversationStatus;
};

export type DashboardOverview = {
  conversationsNeedingReply: DashboardConversation[];
  metrics: DashboardMetric[];
  period: DashboardPeriod;
  pipeline: DashboardPipelineStage[];
  recentLeads: DashboardRecentLead[];
};

type LeadPriority = "low" | "medium" | "high";
type ConversationStatus = "unanswered" | "in_progress" | "waiting_client" | "closed";

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

type PipelineStageRow = {
  id: string;
  is_lost: boolean;
  is_won: boolean;
  name: string;
  position: number;
};

type LeadStageRow = {
  id: string;
  pipeline_stage_id: string | null;
  priority: LeadPriority;
};

type RecentLeadRow = {
  created_at: string;
  email: string | null;
  id: string;
  legal_area: string | null;
  name: string;
  phone: string | null;
  pipeline_stages: { name: string | null } | { name: string | null }[] | null;
  priority: LeadPriority;
  source: string;
};

type LeadConversationRow = {
  created_at: string;
  id: string;
  lead_id: string | null;
  updated_at: string;
};

type ConversationRow = {
  channel: string;
  created_at: string;
  id: string;
  last_message_at: string | null;
  leads:
    | { legal_area: string | null; name: string | null; phone: string | null }
    | { legal_area: string | null; name: string | null; phone: string | null }[]
    | null;
  priority: LeadPriority;
  status: ConversationStatus;
};

type MessageRow = {
  conversation_id: string;
  direction: "inbound" | "outbound" | "internal";
  sent_at: string;
};

const priorityLabels: Record<LeadPriority, string> = {
  high: "Alta prioridade",
  low: "Baixa prioridade",
  medium: "Prioridade média",
};

const periodDescriptions: Record<DashboardPeriod, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  today: "Hoje",
};

export function resolveDashboardPeriod(value?: string): DashboardPeriod {
  if (value === "7d" || value === "30d") {
    return value;
  }

  return "today";
}

export function getDashboardPeriodLabel(period: DashboardPeriod) {
  return periodDescriptions[period];
}

export function getPriorityLabel(priority: LeadPriority) {
  return priorityLabels[priority];
}

export function getPriorityTone(priority: LeadPriority): DashboardTone {
  if (priority === "high") return "warning";
  if (priority === "low") return "neutral";

  return "info";
}

export function getConversationStatusLabel(status: ConversationStatus) {
  const labels: Record<ConversationStatus, string> = {
    closed: "Finalizada",
    in_progress: "Em atendimento",
    unanswered: "Não respondida",
    waiting_client: "Aguardando cliente",
  };

  return labels[status];
}

function getPeriodRange(period: DashboardPeriod) {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);

  if (period === "7d") {
    start.setDate(start.getDate() - 6);
  }

  if (period === "30d") {
    start.setDate(start.getDate() - 29);
  }

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  };
}

function readRelatedOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function assertDashboardQuery(result: CountResult, message: string) {
  if (result.error) {
    throw new Error(message);
  }
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
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

function buildMetrics(params: {
  conversationsOpen: number;
  converted: number;
  leadsInPeriod: number;
  lost: number;
  openOpportunities: number;
  period: DashboardPeriod;
  responseTime: string;
  urgentLeads: number;
}) {
  const conversionRate =
    params.leadsInPeriod > 0 ? (params.converted / params.leadsInPeriod) * 100 : 0;
  const periodLabel = getDashboardPeriodLabel(params.period).toLowerCase();

  return [
    {
      badge: "Entrada",
      description: `Leads registrados ${periodLabel}`,
      icon: UserPlus,
      label: params.period === "today" ? "Leads do dia" : "Novos leads",
      tone: "info",
      value: String(params.leadsInPeriod),
    },
    {
      badge: "Operação",
      description: "Leads abertos que ainda precisam de ação comercial",
      icon: Briefcase,
      label: "Oportunidades abertas",
      tone: "info",
      value: String(params.openOpportunities),
    },
    {
      badge: "Atendimento",
      description: "Conversas ainda abertas",
      icon: MessageSquare,
      label: "Conversas abertas",
      tone: "neutral",
      value: String(params.conversationsOpen),
    },
    {
      badge: "Prioridade",
      description: "Leads ativos com prioridade alta",
      icon: AlertTriangle,
      label: "Leads urgentes",
      tone: "warning",
      value: String(params.urgentLeads),
    },
    {
      badge: "Conversão",
      description: `Clientes convertidos ${periodLabel}`,
      icon: CheckCircle2,
      label: "Clientes convertidos",
      tone: "success",
      value: String(params.converted),
    },
    {
      badge: "Encerramento",
      description: `Leads perdidos ${periodLabel}`,
      icon: XCircle,
      label: "Perdidos",
      tone: "danger",
      value: String(params.lost),
    },
    {
      badge: "Resultado",
      description: "Conversão sobre entradas do período",
      icon: TrendingUp,
      label: "Taxa de conversão",
      tone: "success",
      value: formatPercent(conversionRate),
    },
    {
      badge: "Resposta",
      description: "Primeira resposta no período",
      icon: Clock3,
      label: "Tempo médio",
      tone: "neutral",
      value: params.responseTime,
    },
  ] satisfies DashboardMetric[];
}

export async function getDashboardOverview(period: DashboardPeriod): Promise<DashboardOverview> {
  const supabase = await createClient();
  const role = await getCurrentUserRole();
  const canReadConversations = hasPermission(role, "conversations:read");
  const canReadCustomers = hasPermission(role, "customers:read");
  const range = getPeriodRange(period);

  const leadsInPeriodQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", range.start)
    .lte("created_at", range.end);

  const conversationsOpenQuery = canReadConversations
    ? supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .neq("status", "closed")
    : Promise.resolve({ count: 0, data: null, error: null });

  const convertedQuery = canReadCustomers
    ? supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .gte("converted_at", range.start)
        .lte("converted_at", range.end)
    : Promise.resolve({ count: 0, data: null, error: null });

  const lostQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("lost_at", range.start)
    .lte("lost_at", range.end);

  const stagesQuery = supabase
    .from("pipeline_stages")
    .select("id,name,position,is_won,is_lost")
    .eq("active", true)
    .order("position", { ascending: true });

  const leadStagesQuery = supabase
    .from("leads")
    .select("id,pipeline_stage_id,priority")
    .is("converted_at", null)
    .is("lost_at", null);

  const recentLeadsQuery = supabase
    .from("leads")
    .select("id,name,email,phone,legal_area,source,priority,created_at,pipeline_stages(name)")
    .gte("created_at", range.start)
    .lte("created_at", range.end)
    .order("created_at", { ascending: false })
    .limit(5);

  const conversationsQuery = canReadConversations
    ? supabase
        .from("conversations")
        .select("id,channel,status,priority,last_message_at,created_at,leads(name,phone,legal_area)")
        .eq("status", "unanswered")
        .order("updated_at", { ascending: false })
        .limit(5)
    : Promise.resolve({ data: [], error: null });

  const messagesQuery = canReadConversations
    ? supabase
        .from("messages")
        .select("conversation_id,direction,sent_at")
        .gte("sent_at", range.start)
        .lte("sent_at", range.end)
        .in("direction", ["inbound", "outbound"])
        .order("sent_at", { ascending: true })
        .limit(1000)
    : Promise.resolve({ data: [], error: null });

  const [
    leadsInPeriod,
    conversationsOpen,
    converted,
    lost,
    stagesResult,
    leadStagesResult,
    recentLeadsResult,
    conversationsResult,
    messagesResult,
  ] = await Promise.all([
    leadsInPeriodQuery,
    conversationsOpenQuery,
    convertedQuery,
    lostQuery,
    stagesQuery,
    leadStagesQuery,
    recentLeadsQuery,
    conversationsQuery,
    messagesQuery,
  ]);

  assertDashboardQuery(leadsInPeriod, "Não foi possível carregar os leads do dashboard.");
  assertDashboardQuery(conversationsOpen, "Não foi possível carregar as conversas do dashboard.");
  assertDashboardQuery(converted, "Não foi possível carregar as conversões do dashboard.");
  assertDashboardQuery(lost, "Não foi possível carregar os encerramentos do dashboard.");

  if (
    stagesResult.error ||
    leadStagesResult.error ||
    recentLeadsResult.error ||
    conversationsResult.error ||
    messagesResult.error
  ) {
    throw new Error("Não foi possível carregar a visão comercial do escritório.");
  }

  const openLeadRows = (leadStagesResult.data ?? []) as LeadStageRow[];
  const customerLeadIds = new Set<string>();

  if (openLeadRows.length > 0 && canReadCustomers) {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("lead_id")
      .in(
        "lead_id",
        openLeadRows.map((lead) => lead.id),
      );

    if (customersError) {
      throw new Error("Não foi possível verificar os clientes convertidos do dashboard.");
    }

    for (const customer of customers ?? []) {
      if (customer.lead_id) {
        customerLeadIds.add(customer.lead_id);
      }
    }
  }

  const operationalLeadRows = openLeadRows.filter((lead) => !customerLeadIds.has(lead.id));
  const leadStageCounts = new Map<string, number>();

  for (const lead of operationalLeadRows) {
    if (!lead.pipeline_stage_id) continue;
    leadStageCounts.set(lead.pipeline_stage_id, (leadStageCounts.get(lead.pipeline_stage_id) ?? 0) + 1);
  }

  const pipeline: DashboardPipelineStage[] = ((stagesResult.data ?? []) as PipelineStageRow[])
    .filter((stage) => !stage.is_won && !stage.is_lost)
    .map((stage) => ({
      id: stage.id,
      label: stage.name,
      tone: stage.is_lost ? "danger" : stage.is_won ? "success" : "neutral",
      value: leadStageCounts.get(stage.id) ?? 0,
    }));

  const recentLeadRows = (recentLeadsResult.data ?? []) as RecentLeadRow[];
  const conversationByLeadId = new Map<string, string>();

  if (recentLeadRows.length > 0 && canReadConversations) {
    const { data: leadConversations, error: leadConversationsError } = await supabase
      .from("conversations")
      .select("id,lead_id,updated_at,created_at")
      .in(
        "lead_id",
        recentLeadRows.map((lead) => lead.id),
      )
      .order("updated_at", { ascending: false });

    if (leadConversationsError) {
      throw new Error("Não foi possível carregar as conversas dos leads recentes.");
    }

    for (const conversation of (leadConversations ?? []) as LeadConversationRow[]) {
      if (conversation.lead_id && !conversationByLeadId.has(conversation.lead_id)) {
        conversationByLeadId.set(conversation.lead_id, conversation.id);
      }
    }
  }

  const recentLeads: DashboardRecentLead[] = recentLeadRows.map(
    (lead) => ({
      conversationId: conversationByLeadId.get(lead.id) ?? null,
      createdAt: lead.created_at,
      email: lead.email,
      id: lead.id,
      legalArea: lead.legal_area,
      name: lead.name,
      phone: lead.phone,
      priority: lead.priority,
      source: lead.source,
      stage: readRelatedOne(lead.pipeline_stages)?.name ?? null,
    }),
  );

  const conversationsNeedingReply: DashboardConversation[] = (
    (conversationsResult.data ?? []) as ConversationRow[]
  ).map((conversation) => {
    const lead = readRelatedOne(conversation.leads);

    return {
      channel: conversation.channel,
      createdAt: conversation.created_at,
      id: conversation.id,
      lastMessageAt: conversation.last_message_at,
      leadLegalArea: lead?.legal_area ?? null,
      leadName: lead?.name ?? null,
      leadPhone: lead?.phone ?? null,
      priority: conversation.priority,
      status: conversation.status,
    };
  });

  return {
    conversationsNeedingReply,
    metrics: buildMetrics({
      conversationsOpen: conversationsOpen.count ?? 0,
      converted: converted.count ?? 0,
      leadsInPeriod: leadsInPeriod.count ?? 0,
      lost: lost.count ?? 0,
      openOpportunities: operationalLeadRows.length,
      period,
      responseTime: formatAverageResponse((messagesResult.data ?? []) as MessageRow[]),
      urgentLeads: operationalLeadRows.filter((lead) => lead.priority === "high").length,
    }),
    period,
    pipeline,
    recentLeads,
  };
}
