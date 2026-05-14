import type { UserRole } from "@/features/users/types/roles";

export type CurrentProfile = {
  active: boolean;
  avatarStoragePath: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  email: string | null;
  fullName: string | null;
  id: string;
  phone: string | null;
  role: UserRole;
  updatedAt: string | null;
};
