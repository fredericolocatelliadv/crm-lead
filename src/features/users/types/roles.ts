export const userRoles = ["admin", "manager", "attendant"] as const;

export type UserRole = (typeof userRoles)[number];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && userRoles.includes(role as UserRole);
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  active: boolean;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  attendant: "Atendente",
};

export const rolePermissions = {
  admin: ["crm:read", "crm:write", "users:manage", "settings:manage"],
  manager: ["crm:read", "crm:write", "reports:read"],
  attendant: ["crm:read", "leads:write", "conversations:write"],
} as const;

export type Permission = (typeof rolePermissions)[UserRole][number];
