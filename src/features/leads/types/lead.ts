import type { BadgeProps } from "@/shared/components/ui/badge";

export const leadPriorities = ["low", "medium", "high"] as const;
export const leadStatuses = ["open", "converted", "lost"] as const;

export type LeadPriority = (typeof leadPriorities)[number];
export type LeadStatus = (typeof leadStatuses)[number];

export type LeadOption = {
  id: string;
  label: string;
};

export type LeadFilters = {
  assigneeId?: string;
  legalArea?: string;
  priority?: LeadPriority;
  query?: string;
  source?: string;
  status?: LeadStatus;
};

export type LeadFormMode = "create" | "edit";

export type LeadFormValues = {
  assigneeId?: string | null;
  bestContactTime?: string | null;
  city?: string | null;
  description?: string | null;
  email?: string | null;
  legalArea?: string | null;
  name: string;
  phone?: string | null;
  pipelineStageId?: string | null;
  priority: LeadPriority;
  source: string;
  summary?: string | null;
};

export const priorityLabels: Record<LeadPriority, string> = {
  high: "Alta",
  low: "Baixa",
  medium: "Média",
};

export const priorityBadgeVariants: Record<LeadPriority, NonNullable<BadgeProps["variant"]>> = {
  high: "warning",
  low: "neutral",
  medium: "info",
};

export const statusLabels: Record<LeadStatus, string> = {
  converted: "Convertido",
  lost: "Perdido",
  open: "Em aberto",
};

export const statusBadgeVariants: Record<LeadStatus, NonNullable<BadgeProps["variant"]>> = {
  converted: "success",
  lost: "danger",
  open: "info",
};

export const sourceLabels: Record<string, string> = {
  ai: "IA",
  chatbot: "Chatbot",
  form: "Site",
  manual: "Manual",
  site: "Site",
  site_whatsapp: "WhatsApp do site",
  whatsapp: "WhatsApp",
  website: "Site",
};

export function getLeadStatus(lead: { convertedAt: string | null; lostAt: string | null }): LeadStatus {
  if (lead.convertedAt) return "converted";
  if (lead.lostAt) return "lost";

  return "open";
}

export function getSourceLabel(source: string | null | undefined) {
  if (!source) return "Não informada";

  return sourceLabels[source] ?? source;
}
