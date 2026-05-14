import { rolePermissions, type Permission, type UserRole } from "@/features/users/types/roles";

export function hasPermission(role: UserRole, permission: Permission) {
  return (rolePermissions[role] as readonly string[]).includes(permission);
}

export function assertPermission(role: UserRole, permission: Permission) {
  if (!hasPermission(role, permission)) {
    throw new Error("Permissão insuficiente.");
  }
}
