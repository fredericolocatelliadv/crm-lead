import type { LeadPriority } from "@/features/leads/types/lead";
import type {
  PipelineColumn,
  PipelineFilters,
  PipelineLeadCard,
  PipelineOption,
  PipelineStage,
} from "@/features/pipeline/types/pipeline";
import { createClient } from "@/server/supabase/server";

export type PipelineBoardData = {
  assignees: PipelineOption[];
  columns: PipelineColumn[];
  filters: PipelineFilters;
  legalAreas: string[];
  stages: PipelineStage[];
};

type RelatedProfile = {
  email: string | null;
  full_name: string | null;
};

type StageRow = {
  id: string;
  is_lost: boolean;
  is_won: boolean;
  name: string;
  position: number;
  slug: string;
};

type LeadRow = {
  assignee: RelatedProfile | RelatedProfile[] | null;
  assignee_id: string | null;
  city: string | null;
  converted_at: string | null;
  created_at: string;
  email: string | null;
  id: string;
  legal_area: string | null;
  lost_at: string | null;
  name: string;
  phone: string | null;
  pipeline_stage_id: string | null;
  priority: LeadPriority;
  source: string;
};

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  id: string;
};

type ConversationRow = {
  id: string;
  lead_id: string | null;
};

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function profileLabel(profile: RelatedProfile | null) {
  return profile?.full_name || profile?.email || null;
}

function cleanFilterValue(value?: string) {
  const normalized = value?.trim();

  return normalized && normalized !== "all" ? normalized : undefined;
}

function parsePriority(value?: string): LeadPriority | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

export function parsePipelineFilters(
  searchParams?: Record<string, string | string[] | undefined>,
): PipelineFilters {
  const read = (key: string) => {
    const value = searchParams?.[key];

    return Array.isArray(value) ? value[0] : value;
  };

  return {
    assigneeId: cleanFilterValue(read("responsavel")),
    legalArea: cleanFilterValue(read("area")),
    priority: parsePriority(read("prioridade")),
  };
}

export async function getPipelineBoard(filters: PipelineFilters): Promise<PipelineBoardData> {
  const supabase = await createClient();

  const stagesQuery = supabase
    .from("pipeline_stages")
    .select("id,name,slug,position,is_won,is_lost")
    .eq("active", true)
    .order("position", { ascending: true });

  let leadsQuery = supabase
    .from("leads")
    .select(
      "id,name,email,phone,city,legal_area,source,priority,pipeline_stage_id,assignee_id,converted_at,lost_at,created_at,assignee:profiles!leads_assignee_id_fkey(full_name,email)",
    )
    .is("converted_at", null)
    .is("lost_at", null)
    .order("created_at", { ascending: false });

  if (filters.priority) leadsQuery = leadsQuery.eq("priority", filters.priority);
  if (filters.legalArea) leadsQuery = leadsQuery.eq("legal_area", filters.legalArea);
  if (filters.assigneeId) leadsQuery = leadsQuery.eq("assignee_id", filters.assigneeId);

  const [stagesResult, leadsResult, profilesResult, areaResult] = await Promise.all([
    stagesQuery,
    leadsQuery,
    supabase
      .from("profiles")
      .select("id,full_name,email")
      .eq("active", true)
      .order("full_name", { ascending: true, nullsFirst: false }),
    supabase.from("leads").select("legal_area").not("legal_area", "is", null).order("legal_area"),
  ]);

  if (stagesResult.error) {
    throw new Error("Não foi possível carregar as etapas do pipeline.");
  }

  if (leadsResult.error) {
    throw new Error("Não foi possível carregar os leads do pipeline.");
  }

  const stages: PipelineStage[] = ((stagesResult.data ?? []) as StageRow[]).map((stage) => ({
    id: stage.id,
    isLost: stage.is_lost,
    isWon: stage.is_won,
    name: stage.name,
    position: stage.position,
    slug: stage.slug,
  }));
  const operationalStages = stages.filter((stage) => !stage.isWon && !stage.isLost);

  const leadRows = (leadsResult.data ?? []) as LeadRow[];
  const customerLeadIds = new Set<string>();

  if (leadRows.length > 0) {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("lead_id")
      .in(
        "lead_id",
        leadRows.map((lead) => lead.id),
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

  const operationalLeadRows = leadRows.filter((lead) => !customerLeadIds.has(lead.id));
  const leadIds = operationalLeadRows.map((lead) => lead.id);
  const conversationByLeadId = new Map<string, string>();

  if (leadIds.length > 0) {
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("id,lead_id")
      .in("lead_id", leadIds)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (conversationsError) {
      throw new Error("Não foi possível carregar as conversas do pipeline.");
    }

    for (const conversation of (conversations ?? []) as ConversationRow[]) {
      if (conversation.lead_id && !conversationByLeadId.has(conversation.lead_id)) {
        conversationByLeadId.set(conversation.lead_id, conversation.id);
      }
    }
  }

  const leads: PipelineLeadCard[] = operationalLeadRows.map((lead) => ({
    assigneeId: lead.assignee_id,
    assigneeName: profileLabel(relatedOne(lead.assignee)),
    city: lead.city,
    conversationId: conversationByLeadId.get(lead.id) ?? null,
    convertedAt: lead.converted_at,
    createdAt: lead.created_at,
    email: lead.email,
    id: lead.id,
    legalArea: lead.legal_area,
    lostAt: lead.lost_at,
    name: lead.name,
    phone: lead.phone,
    priority: lead.priority,
    source: lead.source,
    stageId: lead.pipeline_stage_id,
  }));

  const columns: PipelineColumn[] = operationalStages.map((stage) => ({
    ...stage,
    leads: leads.filter((lead) => lead.stageId === stage.id),
  }));

  const firstStage = operationalStages[0];

  if (firstStage) {
    const unassigned = leads.filter((lead) => !lead.stageId);
    columns[0] = {
      ...columns[0],
      leads: [...columns[0].leads, ...unassigned],
    };
  }

  const assignees: PipelineOption[] = profilesResult.error
    ? []
    : ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => ({
        id: profile.id,
        label: profile.full_name || profile.email || "Usuário",
      }));

  const legalAreas = Array.from(
    new Set((areaResult.data ?? []).map((item) => item.legal_area).filter(Boolean)),
  );

  return {
    assignees,
    columns,
    filters,
    legalAreas,
    stages,
  };
}
