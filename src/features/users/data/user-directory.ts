import { createClient } from "@/server/supabase/server";
import { requireCurrentUser } from "@/server/auth/session";
import {
  isUserRole,
  type UserProfile,
  type UserRole,
} from "@/features/users/types/roles";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  active: boolean;
  created_at: string;
  user_roles: { role: string | null } | { role: string | null }[] | null;
};

function readRole(value: ProfileRow["user_roles"]): UserRole {
  const role = Array.isArray(value) ? value[0]?.role : value?.role;

  return isUserRole(role) ? role : "attendant";
}

export type UserDirectoryItem = UserProfile & {
  createdAt: string;
};

export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !isUserRole(data?.role)) {
    return "attendant";
  }

  return data.role;
}

export async function getUserDirectory() {
  const currentUser = await requireCurrentUser();
  const currentUserRole = await getCurrentUserRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,active,created_at,user_roles(role)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar os usuários autorizados.");
  }

  const users: UserDirectoryItem[] = ((data ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    active: profile.active,
    role: readRole(profile.user_roles),
    createdAt: profile.created_at,
  }));

  return {
    currentUserId: currentUser.id,
    currentUserRole,
    users,
  };
}
