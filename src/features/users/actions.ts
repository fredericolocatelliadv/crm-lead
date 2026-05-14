"use server";

import { revalidatePath } from "next/cache";

import { assertPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { isUserRole, type UserRole } from "@/features/users/types/roles";

type UpdateUserRoleResult = {
  ok: boolean;
  message: string;
};

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UpdateUserRoleResult> {
  const currentUser = await requireCurrentUser();
  const currentUserRole = await getCurrentUserRole();
  assertPermission(currentUserRole, "users:manage");

  if (!userId || !isUserRole(role)) {
    return {
      ok: false,
      message: "Perfil inválido.",
    };
  }

  const supabase = await createClient();

  const { data: currentTargetRole, error: currentTargetRoleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (currentTargetRoleError) {
    return {
      ok: false,
      message: "Não foi possível validar o perfil atual.",
    };
  }

  if (currentUser.id === userId && role !== "admin") {
    return {
      ok: false,
      message: "Você não pode remover seu próprio acesso de administrador.",
    };
  }

  if (currentTargetRole?.role === "admin" && role !== "admin") {
    const { count, error: countError } = await supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError || (count ?? 0) <= 1) {
      return {
        ok: false,
        message: "Mantenha pelo menos um administrador ativo no CRM.",
      };
    }
  }

  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });

  if (error) {
    return {
      ok: false,
      message: "Não foi possível alterar a permissão.",
    };
  }

  revalidatePath("/crm/usuarios");

  return {
    ok: true,
    message: "Permissão atualizada.",
  };
}
