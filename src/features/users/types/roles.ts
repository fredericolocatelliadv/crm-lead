export const userRoles = ["admin", "lawyer", "marketing"] as const;
export const legacyUserRoles = ["manager", "attendant"] as const;
export const allUserRoles = [...userRoles, ...legacyUserRoles] as const;

export type UserRole = (typeof allUserRoles)[number];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && allUserRoles.includes(role as UserRole);
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  active: boolean;
  phone?: string | null;
  teamMemberId?: string | null;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  attendant: "Atendente",
  lawyer: "Advogado",
  manager: "Gestor",
  marketing: "Especialista de Marketing",
};

export type Permission =
  | "ai:manage"
  | "blog:read"
  | "blog:write"
  | "conversations:read"
  | "conversations:write"
  | "crm:read"
  | "crm:write"
  | "customers:read"
  | "customers:write"
  | "leads:read"
  | "leads:write"
  | "marketing:manage"
  | "pipeline:read"
  | "pipeline:write"
  | "reports:read"
  | "settings:manage"
  | "settings:read"
  | "users:manage"
  | "whatsapp:manage"
  | "whatsapp:read";

const operationalPermissions = [
  "blog:read",
  "blog:write",
  "conversations:read",
  "conversations:write",
  "crm:read",
  "crm:write",
  "customers:read",
  "customers:write",
  "leads:read",
  "leads:write",
  "pipeline:read",
  "pipeline:write",
  "reports:read",
  "whatsapp:read",
] as const satisfies readonly Permission[];

export const rolePermissions: Record<UserRole, readonly Permission[]> = {
  admin: [
    "ai:manage",
    "blog:read",
    "blog:write",
    "conversations:read",
    "conversations:write",
    "crm:read",
    "crm:write",
    "customers:read",
    "customers:write",
    "leads:read",
    "leads:write",
    "marketing:manage",
    "pipeline:read",
    "pipeline:write",
    "reports:read",
    "settings:manage",
    "settings:read",
    "users:manage",
    "whatsapp:manage",
    "whatsapp:read",
  ],
  attendant: [
    "conversations:read",
    "conversations:write",
    "crm:read",
    "leads:read",
    "leads:write",
    "pipeline:read",
    "pipeline:write",
    "whatsapp:read",
  ],
  lawyer: operationalPermissions,
  manager: [
    ...operationalPermissions,
    "marketing:manage",
    "settings:read",
    "whatsapp:manage",
  ],
  marketing: [
    "blog:read",
    "blog:write",
    "crm:read",
    "leads:read",
    "marketing:manage",
    "reports:read",
    "settings:read",
  ],
};

export const publicAssignableRoles = userRoles;
