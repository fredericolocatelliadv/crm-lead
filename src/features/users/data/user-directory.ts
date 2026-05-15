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
  phone: string | null;
  active: boolean;
  created_at: string;
  team_member_id: string | null;
  team_members: TeamMemberRelation | TeamMemberRelation[] | null;
  user_roles: { role: string | null } | { role: string | null }[] | null;
};

type TeamMemberRelation = {
  bio: string | null;
  email: string | null;
  id: string;
  image: string | null;
  instagram: string | null;
  linkedin: string | null;
  oab: string | null;
  position: number | null;
  role: string | null;
  whatsapp: string | null;
};

function readRole(value: ProfileRow["user_roles"]): UserRole {
  const role = Array.isArray(value) ? value[0]?.role : value?.role;

  return isUserRole(role) ? role : "attendant";
}

function readTeamMember(value: ProfileRow["team_members"]) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export type UserDirectoryItem = UserProfile & {
  createdAt: string;
  teamMember: TeamMemberRelation | null;
};

export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("active,user_roles(role)")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as { active: boolean | null; user_roles: ProfileRow["user_roles"] } | null;

  if (error || profile?.active === false) {
    throw new Error("Usuário sem acesso ativo ao CRM.");
  }

  const role = readRole(profile?.user_roles ?? null);

  if (!isUserRole(role)) {
    return "attendant";
  }

  return role;
}

export async function getUserDirectory() {
  const currentUser = await requireCurrentUser();
  const currentUserRole = await getCurrentUserRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,phone,active,created_at,team_member_id,team_members(id,role,oab,image,bio,email,instagram,linkedin,whatsapp,position),user_roles(role)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar os usuários autorizados.");
  }

  const users: UserDirectoryItem[] = ((data ?? []) as unknown as ProfileRow[]).map((profile) => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    active: profile.active,
    role: readRole(profile.user_roles),
    teamMemberId: profile.team_member_id,
    teamMember: readTeamMember(profile.team_members),
    createdAt: profile.created_at,
  }));

  return {
    currentUserId: currentUser.id,
    currentUserRole,
    users,
  };
}
