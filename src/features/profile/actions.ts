"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

const PROFILE_AVATAR_BUCKET = "profile-avatars";
const MAX_PROFILE_AVATAR_SIZE = 3 * 1024 * 1024;
const ALLOWED_PROFILE_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type ProfileActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

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

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(140, "O nome deve ter no máximo 140 caracteres."),
  phone: optionalPhone,
});

type CurrentAvatarRow = {
  avatar_storage_path: string | null;
  avatar_url: string | null;
};

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function readAvatarFile(formData: FormData) {
  const file = formData.get("avatarFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validateAvatarFile(file: File): ProfileActionState | null {
  if (file.size > MAX_PROFILE_AVATAR_SIZE) {
    return {
      fieldErrors: {
        avatarFile: ["A imagem deve ter no máximo 3 MB."],
      },
      message: "Imagem maior que o limite permitido.",
      ok: false,
    };
  }

  if (!ALLOWED_PROFILE_AVATAR_TYPES.has(file.type)) {
    return {
      fieldErrors: {
        avatarFile: ["Use JPG, PNG, WebP ou AVIF."],
      },
      message: "Tipo de imagem não permitido.",
      ok: false,
    };
  }

  return null;
}

async function uploadProfileAvatar(file: File, userId: string) {
  const supabase = await createClient();
  const name = safeFileName(file.name) || "avatar";
  const storagePath = `${userId}/${randomUUID()}-${name}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Não foi possível enviar a foto do perfil.");
  }

  const { data } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

export async function updateCurrentProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireCurrentUser();
  const avatarFile = readAvatarFile(formData);
  const avatarError = avatarFile ? validateAvatarFile(avatarFile) : null;

  if (avatarError) return avatarError;

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os dados do perfil.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { data: currentAvatar } = await supabase
    .from("profiles")
    .select("avatar_url,avatar_storage_path")
    .eq("id", user.id)
    .maybeSingle<CurrentAvatarRow>();

  let avatarUrl = currentAvatar?.avatar_url ?? null;
  let avatarStoragePath = currentAvatar?.avatar_storage_path ?? null;
  let uploadedAvatarPath: string | null = null;

  if (avatarFile) {
    try {
      const upload = await uploadProfileAvatar(avatarFile, user.id);
      avatarUrl = upload.publicUrl;
      avatarStoragePath = upload.storagePath;
      uploadedAvatarPath = upload.storagePath;
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Não foi possível enviar a foto.",
        ok: false,
      };
    }
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      avatar_storage_path: avatarStoragePath,
      avatar_url: avatarUrl,
      email: user.email ?? null,
      full_name: parsed.data.fullName,
      id: user.id,
      phone: parsed.data.phone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    if (uploadedAvatarPath) {
      await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([uploadedAvatarPath]);
    }

    return {
      message: "Não foi possível salvar seu perfil.",
      ok: false,
    };
  }

  if (
    uploadedAvatarPath &&
    currentAvatar?.avatar_storage_path &&
    currentAvatar.avatar_storage_path !== uploadedAvatarPath
  ) {
    await supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .remove([currentAvatar.avatar_storage_path]);
  }

  revalidatePath("/crm", "layout");
  revalidatePath("/crm/perfil");
  revalidatePath("/crm/usuarios");

  return {
    message: "Perfil atualizado.",
    ok: true,
  };
}
