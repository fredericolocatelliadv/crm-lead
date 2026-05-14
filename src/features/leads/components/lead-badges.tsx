import {
  getSourceLabel,
  priorityBadgeVariants,
  priorityLabels,
  statusBadgeVariants,
  statusLabels,
  type LeadPriority,
  type LeadStatus,
} from "@/features/leads/types/lead";
import { Badge } from "@/shared/components/ui/badge";

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge variant={priorityBadgeVariants[priority]}>
      {priorityLabels[priority]}
    </Badge>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusBadgeVariants[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

export function LeadSourceBadge({ source }: { source: string | null }) {
  return <Badge variant="neutral">{getSourceLabel(source)}</Badge>;
}
