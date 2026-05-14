import type { LeadPriority } from "@/features/leads/types/lead";

export type PipelineFilters = {
  assigneeId?: string;
  legalArea?: string;
  priority?: LeadPriority;
};

export type PipelineStage = {
  id: string;
  isLost: boolean;
  isWon: boolean;
  name: string;
  position: number;
  slug: string;
};

export type PipelineLeadCard = {
  assigneeId: string | null;
  assigneeName: string | null;
  city: string | null;
  conversationId: string | null;
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
  stageId: string | null;
};

export type PipelineColumn = PipelineStage & {
  leads: PipelineLeadCard[];
};

export type PipelineOption = {
  id: string;
  label: string;
};
