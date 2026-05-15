import { roleLabels, type UserRole } from "@/features/users/types/roles";
import { Badge } from "@/shared/components/ui/badge";

const roleBadgeVariant: Record<UserRole, "success" | "info" | "neutral"> = {
  admin: "success",
  attendant: "neutral",
  lawyer: "info",
  manager: "info",
  marketing: "neutral",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={roleBadgeVariant[role]}>{roleLabels[role]}</Badge>;
}
