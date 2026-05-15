import { getCurrentUserRole } from "@/features/users/data/user-directory";
import type { Permission, UserRole } from "@/features/users/types/roles";
import { hasPermission } from "@/server/auth/permissions";

export async function getPageAccess(permissions: Permission | Permission[]) {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const role = await getCurrentUserRole().catch(() => null);

  if (!role) {
    return {
      allowed: false,
      role: "attendant" as UserRole,
    };
  }

  return {
    allowed: required.some((permission) => hasPermission(role, permission)),
    role,
  };
}

export function canAccessAny(role: UserRole, permissions: Permission | Permission[]) {
  const required = Array.isArray(permissions) ? permissions : [permissions];

  return required.some((permission) => hasPermission(role, permission));
}
