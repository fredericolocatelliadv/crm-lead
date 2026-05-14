import {
  conversationStatusBadgeVariants,
  conversationStatusLabels,
  priorityBadgeVariants,
  priorityLabels,
  type ConversationPriority,
  type ConversationStatus,
} from "@/features/conversations/types/conversation";
import { Badge } from "@/shared/components/ui/badge";

export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  return (
    <Badge variant={conversationStatusBadgeVariants[status]}>
      {conversationStatusLabels[status]}
    </Badge>
  );
}

export function ConversationPriorityBadge({
  priority,
}: {
  priority: ConversationPriority;
}) {
  return <Badge variant={priorityBadgeVariants[priority]}>{priorityLabels[priority]}</Badge>;
}
