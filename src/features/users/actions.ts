"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { assertPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";
import {
  isUserRole,
  publicAssignableRoles,
  type UserRole,
} from "@/features/users/types/roles";

const SITE_IMAGES_BUCKET = "site-images";
const MAX_SITE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_SITE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type UserActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

type UpdateUserRoleResult = {
  ok: boolean;
  message: string;
};

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.string().nullable(),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([z.string().email("Informe um e-mail válido."), z.null()]),
);

const optionalUuid = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([z.string().uuid(), z.null()]),
);

const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const digits = value.replace(/\D/g, "");

    return digits.length > 0 ? digits : null;
  },
  z.union([
    z
      .string()
      .min(10, "Informe um telefone com DDD.")
      .max(13, "Informe um telefone válido."),
    z.null(),
  ]),
);

const optionalPassword = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([
    z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    z.null(),
  ]),
);

const userFormSchema = z.object({
  active: z.boolean(),
  email: z.string().trim().email("Informe um e-mail válido."),
  fullName: z
    .string()
    .trim()
    .min(2, "Informe o nome completo.")
    .max(140, "O nome deve ter no máximo 140 caracteres."),
  password: optionalPassword,
  passwordConfirmation: optionalPassword,
  phone: optionalPhone,
  role: z.enum(publicAssignableRoles, {
    error: "Selecione um perfil válido.",
  }),
  showOnSite: z.boolean(),
  teamBio: optionalText,
  teamCurrentImage: optionalText,
  teamEmail: optionalEmail,
  teamId: optionalUuid,
  teamInstagram: optionalText,
  teamLinkedin: optionalText,
  teamOab: optionalText,
  teamPosition: z.coerce.number().int().min(0).default(0),
  teamRole: optionalText,
  teamWhatsapp: optionalText,
});

function readUserForm(formData: FormData) {
  return {
    active: formData.get("active") === "on",
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    showOnSite: formData.get("showOnSite") === "on",
    teamBio: formData.get("teamBio"),
    teamCurrentImage: formData.get("teamCurrentImage"),
    teamEmail: formData.get("teamEmail"),
    teamId: formData.get("teamId"),
    teamInstagram: formData.get("teamInstagram"),
    teamLinkedin: formData.get("teamLinkedin"),
    teamOab: formData.get("teamOab"),
    teamPosition: formData.get("teamPosition"),
    teamRole: formData.get("teamRole"),
    teamWhatsapp: formData.get("teamWhatsapp"),
  };
}

function validatePasswordFields(
  data: z.infer<typeof userFormSchema>,
  mode: "create" | "update",
): UserActionState | null {
  if (mode === "create" && !data.password) {
    return {
      fieldErrors: {
        password: ["Informe a senha inicial do usuário."],
      },
      message: "Informe a senha inicial do usuário.",
      ok: false,
    };
  }

  if (data.password && data.password !== data.passwordConfirmation) {
    return {
      fieldErrors: {
        passwordConfirmation: ["A confirmação deve ser igual à senha."],
      },
      message: "A confirmação de senha não confere.",
      ok: false,
    };
  }

  if (!data.password && data.passwordConfirmation) {
    return {
      fieldErrors: {
        password: ["Informe a nova senha antes de confirmar."],
      },
      message: "Informe a senha antes da confirmação.",
      ok: false,
    };
  }

  return null;
}

function readTeamImageFile(formData: FormData) {
  const file = formData.get("teamImageFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validateTeamImage(file: File): UserActionState | null {
  if (file.size > MAX_SITE_IMAGE_SIZE) {
    return {
      fieldErrors: {
        teamImageFile: ["A imagem deve ter no máximo 5 MB."],
      },
      message: "Imagem maior que o limite permitido.",
      ok: false,
    };
  }

  if (!ALLOWED_SITE_IMAGE_TYPES.has(file.type)) {
    return {
      fieldErrors: {
        teamImageFile: ["Use JPG, PNG, WebP ou AVIF."],
      },
      message: "Tipo de imagem não permitido.",
      ok: false,
    };
  }

  return null;
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

async function uploadTeamImage(file: File, userId: string) {
  const supabase = createAdminClient();
  const name = safeFileName(file.name) || "equipe";
  const storagePath = `team/${userId}/${randomUUID()}-${name}`;
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error("Não foi possível enviar a foto da equipe.");
  }

  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

async function assertUsersManageAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);
  assertPermission(role, "users:manage");

  return user;
}

async function ensureAtLeastOneOtherActiveAdmin(targetUserId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("user_roles")
    .select("user_id, profiles!inner(active)", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("profiles.active", true)
    .neq("user_id", targetUserId);

  return !error && (count ?? 0) > 0;
}

async function saveLinkedTeamMember(params: {
  currentTeamId: string | null;
  data: z.infer<typeof userFormSchema>;
  imageFile: File | null;
  userId: string;
}) {
  if (params.data.role !== "lawyer" || !params.data.showOnSite) {
    if (params.currentTeamId) {
      await createAdminClient()
        .from("team_members")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("id", params.currentTeamId);
    }

    return null;
  }

  let image = params.data.teamCurrentImage;

  if (params.imageFile) {
    const upload = await uploadTeamImage(params.imageFile, params.userId);
    image = upload.publicUrl;
  }

  const payload = {
    active: true,
    bio: params.data.teamBio,
    email: params.data.teamEmail ?? params.data.email,
    image,
    instagram: params.data.teamInstagram,
    linkedin: params.data.teamLinkedin,
    name: params.data.fullName,
    oab: params.data.teamOab,
    position: params.data.teamPosition,
    role: params.data.teamRole ?? "Advogado",
    updated_at: new Date().toISOString(),
    whatsapp: params.data.teamWhatsapp ?? params.data.phone,
  };

  const supabase = createAdminClient();
  const result = params.currentTeamId
    ? await supabase.from("team_members").update(payload).eq("id", params.currentTeamId).select("id").single()
    : await supabase.from("team_members").insert(payload).select("id").single();

  if (result.error || !result.data?.id) {
    throw new Error("Não foi possível salvar os dados públicos do advogado.");
  }

  return result.data.id as string;
}

async function saveInternalUser(params: {
  data: z.infer<typeof userFormSchema>;
  userId: string;
}) {
  const supabase = createAdminClient();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      active: params.data.active,
      email: params.data.email,
      full_name: params.data.fullName,
      id: params.userId,
      phone: params.data.phone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error("Não foi possível salvar os dados do usuário.");
  }

  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      role: params.data.role,
      updated_at: new Date().toISOString(),
      user_id: params.userId,
    },
    { onConflict: "user_id" },
  );

  if (roleError) {
    throw new Error("Não foi possível salvar a permissão do usuário.");
  }
}

async function updateProfileTeamLink(userId: string, teamMemberId: string | null) {
  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      team_member_id: teamMemberId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error("Não foi possível vincular o usuário à equipe do site.");
  }
}

export async function createInternalUser(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await assertUsersManageAccess();

  const parsed = userFormSchema.safeParse(readUserForm(formData));
  const imageFile = readTeamImageFile(formData);
  const imageError = imageFile ? validateTeamImage(imageFile) : null;

  if (imageError) return imageError;

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os dados do usuário.",
      ok: false,
    };
  }

  const admin = createAdminClient();
  const passwordError = validatePasswordFields(parsed.data, "create");

  if (passwordError) return passwordError;

  const createdUser = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
    password: parsed.data.password ?? undefined,
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  if (createdUser.error || !createdUser.data.user?.id) {
    return {
      message: "Não foi possível criar o acesso deste usuário.",
      ok: false,
    };
  }

  const userId = createdUser.data.user.id;

  try {
    await saveInternalUser({ data: parsed.data, userId });
    const teamMemberId = await saveLinkedTeamMember({
      currentTeamId: null,
      data: parsed.data,
      imageFile,
      userId,
    });
    await updateProfileTeamLink(userId, teamMemberId);
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);

    return {
      message: error instanceof Error ? error.message : "Não foi possível cadastrar o usuário.",
      ok: false,
    };
  }

  revalidatePath("/crm/usuarios");
  revalidatePath("/", "layout");

  return {
    message: "Usuário cadastrado com senha inicial definida.",
    ok: true,
  };
}

export async function updateInternalUser(
  userId: string,
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const currentUser = await assertUsersManageAccess();

  if (!userId) {
    return { message: "Usuário inválido.", ok: false };
  }

  const parsed = userFormSchema.safeParse(readUserForm(formData));
  const imageFile = readTeamImageFile(formData);
  const imageError = imageFile ? validateTeamImage(imageFile) : null;

  if (imageError) return imageError;

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os dados do usuário.",
      ok: false,
    };
  }

  const passwordError = validatePasswordFields(parsed.data, "update");

  if (passwordError) return passwordError;

  if (currentUser.id === userId && parsed.data.role !== "admin") {
    return {
      message: "Você não pode remover seu próprio acesso de administrador.",
      ok: false,
    };
  }

  if (parsed.data.role !== "admin") {
    const hasOtherAdmin = await ensureAtLeastOneOtherActiveAdmin(userId);

    if (!hasOtherAdmin) {
      return {
        message: "Mantenha pelo menos um administrador ativo no CRM.",
        ok: false,
      };
    }
  }

  const admin = createAdminClient();
  const authUpdate = await admin.auth.admin.updateUserById(userId, {
    email: parsed.data.email,
    ...(parsed.data.password ? { password: parsed.data.password } : {}),
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  if (authUpdate.error) {
    return {
      message: "Não foi possível atualizar o login do usuário.",
      ok: false,
    };
  }

  try {
    await saveInternalUser({ data: parsed.data, userId });
    const teamMemberId = await saveLinkedTeamMember({
      currentTeamId: parsed.data.teamId,
      data: parsed.data,
      imageFile,
      userId,
    });
    await updateProfileTeamLink(userId, teamMemberId);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Não foi possível atualizar o usuário.",
      ok: false,
    };
  }

  revalidatePath("/crm/usuarios");
  revalidatePath("/crm", "layout");
  revalidatePath("/", "layout");

  return {
    message: "Usuário atualizado.",
    ok: true,
  };
}

export async function updateUserStatus(
  userId: string,
  active: boolean,
): Promise<UpdateUserRoleResult> {
  const currentUser = await assertUsersManageAccess();

  if (!userId) {
    return { message: "Usuário inválido.", ok: false };
  }

  if (currentUser.id === userId && !active) {
    return {
      message: "Você não pode desativar o seu próprio usuário.",
      ok: false,
    };
  }

  if (!active) {
    const hasOtherAdmin = await ensureAtLeastOneOtherActiveAdmin(userId);

    if (!hasOtherAdmin) {
      return {
        message: "Mantenha pelo menos um administrador ativo no CRM.",
        ok: false,
      };
    }
  }

  const { error } = await createAdminClient()
    .from("profiles")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return {
      message: active ? "Não foi possível reativar o usuário." : "Não foi possível inativar o usuário.",
      ok: false,
    };
  }

  revalidatePath("/crm/usuarios");
  revalidatePath("/crm", "layout");

  return {
    message: active ? "Usuário reativado." : "Usuário inativado.",
    ok: true,
  };
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UpdateUserRoleResult> {
  const currentUser = await assertUsersManageAccess();

  if (!userId || !isUserRole(role)) {
    return {
      ok: false,
      message: "Perfil inválido.",
    };
  }

  if (!publicAssignableRoles.includes(role as (typeof publicAssignableRoles)[number])) {
    return {
      ok: false,
      message: "Selecione um perfil operacional válido.",
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
    const hasOtherAdmin = await ensureAtLeastOneOtherActiveAdmin(userId);

    if (!hasOtherAdmin) {
      return {
        ok: false,
        message: "Mantenha pelo menos um administrador ativo no CRM.",
      };
    }
  }

  const { error } = await createAdminClient()
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });

  if (error) {
    return {
      ok: false,
      message: "Não foi possível alterar a permissão.",
    };
  }

  revalidatePath("/crm/usuarios");
  revalidatePath("/crm", "layout");

  return {
    ok: true,
    message: "Permissão atualizada.",
  };
}
