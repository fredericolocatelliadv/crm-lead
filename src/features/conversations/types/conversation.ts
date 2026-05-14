import type { BadgeProps } from "@/shared/components/ui/badge";

export const conversationStatuses = [
  "unanswered",
  "in_progress",
  "waiting_client",
  "closed",
] as const;

export const messageDeliveryStatuses = ["sending", "sent", "failed"] as const;
export const messageDirections = ["inbound", "outbound", "internal"] as const;

export type ConversationStatus = (typeof conversationStatuses)[number];
export type MessageDeliveryStatus = (typeof messageDeliveryStatuses)[number];
export type MessageDirection = (typeof messageDirections)[number];

export type ConversationPriority = "low" | "medium" | "high";

export type ConversationOption = {
  id: string;
  label: string;
};

export type ConversationFilters = {
  mine?: boolean;
  priority?: ConversationPriority;
  query?: string;
  status?: ConversationStatus;
};

export const conversationStatusLabels: Record<ConversationStatus, string> = {
  closed: "Finalizado",
  in_progress: "Em atendimento",
  unanswered: "Não respondido",
  waiting_client: "Aguardando cliente",
};

export const messageDeliveryStatusLabels: Record<MessageDeliveryStatus, string> = {
  failed: "Falhou",
  sending: "Enviando",
  sent: "Enviada",
};

export const conversationStatusBadgeVariants: Record<
  ConversationStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  closed: "neutral",
  in_progress: "info",
  unanswered: "danger",
  waiting_client: "warning",
};

export const messageDirectionLabels: Record<MessageDirection, string> = {
  inbound: "Cliente",
  internal: "Nota interna",
  outbound: "Atendimento",
};

export const priorityLabels: Record<ConversationPriority, string> = {
  high: "Alta",
  low: "Baixa",
  medium: "Média",
};

export const priorityBadgeVariants: Record<
  ConversationPriority,
  NonNullable<BadgeProps["variant"]>
> = {
  high: "warning",
  low: "neutral",
  medium: "info",
};
