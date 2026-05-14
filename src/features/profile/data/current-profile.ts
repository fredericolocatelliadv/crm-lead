import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";
import { isUserRole, type UserRole } from "@/features/users/types/roles";
import type { CurrentProfile } from "@/features/profile/types/profile";

type ProfileRow = {
  active: boolean | null;
  avatar_storage_path: string | null;
  avatar_url: string | null;
  created_at: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  updated_at: string | null;
  user_roles: { role: string | null } | { role: string | null }[] | null;
};

function readRole(value: ProfileRow["user_roles"]): UserRole {
  const role = Array.isArray(value) ? value[0]?.role : value?.role;

  return isUserRole(role) ? role : "attendant";
}

function mapProfile(row: ProfileRow, fallbackEmail: string | null): CurrentProfile {
  return {
    active: row.active ?? true,
    avatarStoragePath: row.avatar_storage_path,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    email: row.email ?? fallbackEmail,
    fullName: row.full_name,
    id: row.id,
    phone: row.phone,
    role: readRole(row.user_roles),
    updatedAt: row.updated_at,
  };
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const user = await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,avatar_url,avatar_storage_path,active,created_at,updated_at,user_roles(role)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar seu perfil.");
  }

  if (!data) {
    return {
      active: true,
      avatarStoragePath: null,
      avatarUrl: null,
      createdAt: null,
      email: user.email ?? null,
      fullName: null,
      id: user.id,
      phone: null,
      role: "attendant",
      updatedAt: null,
    };
  }

  return mapProfile(data as ProfileRow, user.email ?? null);
}
