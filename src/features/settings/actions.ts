"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

type SiteContentTable = "team_members" | "testimonials" | "faqs";

const SITE_IMAGES_BUCKET = "site-images";
const MAX_SITE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_SITE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type SettingsActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.string().nullable(),
);

const optionalUuid = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 && trimmed !== "none" ? trimmed : null;
  },
  z.string().uuid().nullable(),
);

const numberField = z.coerce.number().int().min(0).default(0);

const siteSettingsSchema = z.object({
  address: optionalText,
  email: optionalText,
  facebook: optionalText,
  instagram: optionalText,
  linkedin: optionalText,
  whatsapp: optionalText,
  youtube: optionalText,
});

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([z.string().url("Informe uma URL válida."), z.null()]),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([z.string().email("Informe um e-mail válido."), z.null()]),
);

const optionalLimitedText = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    },
    z.union([z.string().max(max, message), z.null()]),
  );

const optionalNormalizedId = (regex: RegExp, message: string, max = 120) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed.toUpperCase() : null;
    },
    z.union([z.string().max(max).regex(regex, message), z.null()]),
  );

const marketingSettingsSchema = z.object({
  cookieConsentEnabled: z.coerce.boolean(),
  googleAnalyticsId: optionalNormalizedId(
    /^G-[A-Z0-9]+$/,
    "Use o ID de mensuração do GA4, como G-XXXXXXXXXX.",
    32,
  ),
  googleSearchConsoleVerification: optionalLimitedText(
    256,
    "O código de verificação deve ter no máximo 256 caracteres.",
  ),
  googleTagManagerId: optionalNormalizedId(
    /^GTM-[A-Z0-9]+$/,
    "Use o ID do Google Tag Manager, como GTM-XXXXXXX.",
    32,
  ),
  metaDomainVerification: optionalLimitedText(
    256,
    "A verificação da Meta deve ter no máximo 256 caracteres.",
  ),
  metaPixelId: z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    },
    z.union([
      z.string().max(30).regex(/^\d{5,30}$/, "Use apenas o ID numérico do Pixel da Meta."),
      z.null(),
    ]),
  ),
  seoDescription: optionalLimitedText(
    220,
    "A descrição deve ter no máximo 220 caracteres.",
  ),
  seoImageUrl: optionalUrl,
  seoTitle: optionalLimitedText(90, "O título deve ter no máximo 90 caracteres."),
  siteUrl: optionalUrl,
  trackingEnabled: z.coerce.boolean(),
});

const legalDocumentText = (label: string) =>
  z
    .string()
    .trim()
    .min(80, `${label} precisa ter um texto mais completo.`)
    .max(20000, `${label} deve ter no máximo 20.000 caracteres.`);

const legalDocumentsSchema = z.object({
  cookiePolicyContent: legalDocumentText("A política de cookies"),
  legalDocumentsVersion: z
    .string()
    .trim()
    .min(1, "Informe a versão dos documentos.")
    .max(20, "A versão deve ter no máximo 20 caracteres."),
  privacyContactEmail: optionalEmail,
  privacyPolicyContent: legalDocumentText("A política de privacidade"),
  termsOfUseContent: legalDocumentText("Os termos de uso"),
});

const teamSchema = z.object({
  bio: optionalText,
  currentImage: optionalText,
  email: optionalText,
  id: optionalUuid,
  instagram: optionalText,
  linkedin: optionalText,
  name: z.string().trim().min(2, "Informe o nome."),
  oab: optionalText,
  position: numberField,
  role: optionalText,
  whatsapp: optionalText,
});

const testimonialSchema = z.object({
  currentImage: optionalText,
  id: optionalUuid,
  name: z.string().trim().min(2, "Informe o nome."),
  position: numberField,
  role: optionalText,
  text: z.string().trim().min(5, "Informe o depoimento."),
});

const faqSchema = z.object({
  answer: z.string().trim().min(5, "Informe a resposta."),
  id: optionalUuid,
  position: numberField,
  question: z.string().trim().min(5, "Informe a pergunta."),
});

const statusSchema = z.object({
  active: z.enum(["true", "false"]),
});

const quickReplySchema = z.object({
  content: z.string().trim().min(2, "Informe o texto da resposta rápida."),
  id: optionalUuid,
  title: z.string().trim().min(2, "Informe o título da resposta rápida."),
});

const legalAreaSchema = z.object({
  description: optionalText,
  id: optionalUuid,
  name: z.string().trim().min(2, "Informe o nome da área jurídica."),
  position: numberField,
});

async function assertContentWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

async function assertSiteSettingsAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "settings:manage")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

function revalidateSitePaths() {
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/noticias");
  revalidatePath("/politica-de-privacidade");
  revalidatePath("/termos-de-uso");
  revalidatePath("/politica-de-cookies");
  revalidatePath("/crm/configuracoes");
}

function readTeamForm(formData: FormData) {
  return {
    bio: formData.get("bio"),
    currentImage: formData.get("currentImage"),
    email: formData.get("email"),
    id: formData.get("id"),
    instagram: formData.get("instagram"),
    linkedin: formData.get("linkedin"),
    name: formData.get("name"),
    oab: formData.get("oab"),
    position: formData.get("position"),
    role: formData.get("role"),
    whatsapp: formData.get("whatsapp"),
  };
}

function readTestimonialForm(formData: FormData) {
  return {
    currentImage: formData.get("currentImage"),
    id: formData.get("id"),
    name: formData.get("name"),
    position: formData.get("position"),
    role: formData.get("role"),
    text: formData.get("text"),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readLegalAreaForm(formData: FormData) {
  return {
    description: formData.get("description"),
    id: formData.get("id"),
    name: formData.get("name"),
    position: formData.get("position"),
  };
}

function readImageFile(formData: FormData) {
  const file = formData.get("imageFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
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

function validateSiteImage(file: File): SettingsActionState | null {
  if (file.size > MAX_SITE_IMAGE_SIZE) {
    return {
      fieldErrors: {
        imageFile: ["A imagem deve ter no máximo 5 MB."],
      },
      message: "Imagem maior que o limite permitido.",
      ok: false,
    };
  }

  if (!ALLOWED_SITE_IMAGE_TYPES.has(file.type)) {
    return {
      fieldErrors: {
        imageFile: ["Use JPG, PNG, WebP ou AVIF."],
      },
      message: "Tipo de imagem não permitido.",
      ok: false,
    };
  }

  return null;
}

async function uploadSiteImage(file: File, folder: "team" | "testimonials", userId: string) {
  const supabase = await createClient();
  const name = safeFileName(file.name) || "imagem";
  const storagePath = `${folder}/${userId}/${randomUUID()}-${name}`;
  const { error: uploadError } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Não foi possível enviar a imagem.");
  }

  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

export async function updateSiteSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertSiteSettingsAccess();
  const parsed = siteSettingsSchema.safeParse({
    address: formData.get("address"),
    email: formData.get("email"),
    facebook: formData.get("facebook"),
    instagram: formData.get("instagram"),
    linkedin: formData.get("linkedin"),
    whatsapp: formData.get("whatsapp"),
    youtube: formData.get("youtube"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise as configurações.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    ...parsed.data,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  if (error) {
    return {
      message: "Não foi possível salvar as configurações.",
      ok: false,
    };
  }

  revalidateSitePaths();

  return {
    message: "Configurações salvas.",
    ok: true,
  };
}

export async function updateMarketingSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertSiteSettingsAccess();
  const parsed = marketingSettingsSchema.safeParse({
    cookieConsentEnabled: formData.get("cookieConsentEnabled") === "on",
    googleAnalyticsId: formData.get("googleAnalyticsId"),
    googleSearchConsoleVerification: formData.get("googleSearchConsoleVerification"),
    googleTagManagerId: formData.get("googleTagManagerId"),
    metaDomainVerification: formData.get("metaDomainVerification"),
    metaPixelId: formData.get("metaPixelId"),
    seoDescription: formData.get("seoDescription"),
    seoImageUrl: formData.get("seoImageUrl"),
    seoTitle: formData.get("seoTitle"),
    siteUrl: formData.get("siteUrl"),
    trackingEnabled: formData.get("trackingEnabled") === "on",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise as configurações de SEO e marketing.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    cookie_consent_enabled: parsed.data.cookieConsentEnabled,
    google_analytics_id: parsed.data.googleAnalyticsId,
    google_search_console_verification: parsed.data.googleSearchConsoleVerification,
    google_tag_manager_id: parsed.data.googleTagManagerId,
    id: 1,
    meta_domain_verification: parsed.data.metaDomainVerification,
    meta_pixel_id: parsed.data.metaPixelId,
    seo_description: parsed.data.seoDescription,
    seo_image_url: parsed.data.seoImageUrl,
    seo_title: parsed.data.seoTitle,
    site_url: parsed.data.siteUrl,
    tracking_enabled: parsed.data.trackingEnabled,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  if (error) {
    return {
      message: "Não foi possível salvar SEO e marketing.",
      ok: false,
    };
  }

  revalidateSitePaths();

  return {
    message: "SEO e marketing salvos.",
    ok: true,
  };
}

export async function updateLegalDocumentsSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertSiteSettingsAccess();
  const parsed = legalDocumentsSchema.safeParse({
    cookiePolicyContent: formData.get("cookiePolicyContent"),
    legalDocumentsVersion: formData.get("legalDocumentsVersion"),
    privacyContactEmail: formData.get("privacyContactEmail"),
    privacyPolicyContent: formData.get("privacyPolicyContent"),
    termsOfUseContent: formData.get("termsOfUseContent"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os documentos legais.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("site_settings").upsert({
    cookie_policy_content: parsed.data.cookiePolicyContent,
    id: 1,
    legal_documents_updated_at: now,
    legal_documents_version: parsed.data.legalDocumentsVersion,
    privacy_contact_email: parsed.data.privacyContactEmail,
    privacy_policy_content: parsed.data.privacyPolicyContent,
    terms_of_use_content: parsed.data.termsOfUseContent,
    updated_at: now,
    updated_by: user.id,
  });

  if (error) {
    return {
      message: "Não foi possível salvar os documentos legais.",
      ok: false,
    };
  }

  revalidateSitePaths();

  return {
    message: "Documentos legais salvos.",
    ok: true,
  };
}

export async function upsertTeamMember(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertContentWriteAccess();
  const parsed = teamSchema.safeParse(readTeamForm(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise o membro da equipe.",
      ok: false,
    };
  }

  const imageFile = readImageFile(formData);
  const imageError = imageFile ? validateSiteImage(imageFile) : null;

  if (imageError) return imageError;

  const supabase = await createClient();
  let image = parsed.data.currentImage;
  let uploadedPath: string | null = null;

  if (imageFile) {
    try {
      const upload = await uploadSiteImage(imageFile, "team", user.id);
      image = upload.publicUrl;
      uploadedPath = upload.storagePath;
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
        ok: false,
      };
    }
  }

  const values = {
    bio: parsed.data.bio,
    email: parsed.data.email,
    image,
    instagram: parsed.data.instagram,
    linkedin: parsed.data.linkedin,
    name: parsed.data.name,
    oab: parsed.data.oab,
    position: parsed.data.position,
    role: parsed.data.role,
    whatsapp: parsed.data.whatsapp,
  };
  const payload = { ...values, updated_at: new Date().toISOString() };
  const result = parsed.data.id
    ? await supabase.from("team_members").update(payload).eq("id", parsed.data.id)
    : await supabase.from("team_members").insert({ ...payload, active: true });

  if (result.error) {
    if (uploadedPath) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([uploadedPath]);
    }

    return { message: "Não foi possível salvar o membro da equipe.", ok: false };
  }

  revalidateSitePaths();
  return { message: "Membro da equipe salvo.", ok: true };
}

export async function upsertTestimonial(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertContentWriteAccess();
  const parsed = testimonialSchema.safeParse(readTestimonialForm(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise o depoimento.",
      ok: false,
    };
  }

  const imageFile = readImageFile(formData);
  const imageError = imageFile ? validateSiteImage(imageFile) : null;

  if (imageError) return imageError;

  const supabase = await createClient();
  let image = parsed.data.currentImage;
  let uploadedPath: string | null = null;

  if (imageFile) {
    try {
      const upload = await uploadSiteImage(imageFile, "testimonials", user.id);
      image = upload.publicUrl;
      uploadedPath = upload.storagePath;
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
        ok: false,
      };
    }
  }

  const values = {
    image,
    name: parsed.data.name,
    position: parsed.data.position,
    role: parsed.data.role,
    text: parsed.data.text,
  };
  const payload = { ...values, updated_at: new Date().toISOString() };
  const result = parsed.data.id
    ? await supabase.from("testimonials").update(payload).eq("id", parsed.data.id)
    : await supabase.from("testimonials").insert({ ...payload, active: true });

  if (result.error) {
    if (uploadedPath) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([uploadedPath]);
    }

    return { message: "Não foi possível salvar o depoimento.", ok: false };
  }

  revalidateSitePaths();
  return { message: "Depoimento salvo.", ok: true };
}

export async function upsertFaq(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await assertContentWriteAccess();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a pergunta frequente.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const values = {
    answer: parsed.data.answer,
    position: parsed.data.position,
    question: parsed.data.question,
  };
  const payload = { ...values, updated_at: new Date().toISOString() };
  const result = parsed.data.id
    ? await supabase.from("faqs").update(payload).eq("id", parsed.data.id)
    : await supabase.from("faqs").insert({ ...payload, active: true });

  if (result.error) {
    return { message: "Não foi possível salvar a pergunta frequente.", ok: false };
  }

  revalidateSitePaths();
  return { message: "Pergunta frequente salva.", ok: true };
}

export async function setSiteContentStatus(
  table: SiteContentTable,
  id: string,
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await assertContentWriteAccess();
  const parsed = statusSchema.safeParse({ active: formData.get("active") });

  if (!parsed.success) {
    return { message: "Status inválido.", ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({
      active: parsed.data.active === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar o conteúdo.", ok: false };
  }

  revalidateSitePaths();
  return { message: "Conteúdo atualizado.", ok: true };
}

export async function deleteSiteContent(
  table: SiteContentTable,
  id: string,
): Promise<SettingsActionState> {
  await assertContentWriteAccess();
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    return { message: "Não foi possível excluir o conteúdo.", ok: false };
  }

  revalidateSitePaths();
  return { message: "Conteúdo excluído.", ok: true };
}

export async function upsertQuickReply(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertContentWriteAccess();
  const parsed = quickReplySchema.safeParse({
    content: formData.get("content"),
    id: formData.get("id"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a resposta rápida.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const payload = {
    content: parsed.data.content,
    title: parsed.data.title,
    updated_at: new Date().toISOString(),
  };
  const result = parsed.data.id
    ? await supabase.from("quick_replies").update(payload).eq("id", parsed.data.id)
    : await supabase.from("quick_replies").insert({
        ...payload,
        active: true,
        created_by: user.id,
      });

  if (result.error) {
    return { message: "Não foi possível salvar a resposta rápida.", ok: false };
  }

  revalidateSitePaths();
  revalidatePath("/crm/conversas");

  return { message: "Resposta rápida salva.", ok: true };
}

export async function setQuickReplyStatus(
  id: string,
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await assertContentWriteAccess();
  const parsed = statusSchema.safeParse({ active: formData.get("active") });

  if (!parsed.success) {
    return { message: "Status inválido.", ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("quick_replies")
    .update({
      active: parsed.data.active === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar a resposta rápida.", ok: false };
  }

  revalidateSitePaths();
  revalidatePath("/crm/conversas");

  return { message: "Resposta rápida atualizada.", ok: true };
}

export async function deleteQuickReply(id: string): Promise<SettingsActionState> {
  await assertContentWriteAccess();
  const supabase = await createClient();
  const { error } = await supabase.from("quick_replies").delete().eq("id", id);

  if (error) {
    return { message: "Não foi possível excluir a resposta rápida.", ok: false };
  }

  revalidateSitePaths();
  revalidatePath("/crm/conversas");

  return { message: "Resposta rápida excluída.", ok: true };
}

export async function upsertLegalArea(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertSiteSettingsAccess();
  const parsed = legalAreaSchema.safeParse(readLegalAreaForm(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a área jurídica.",
      ok: false,
    };
  }

  const slug = slugify(parsed.data.name);

  if (!slug) {
    return {
      fieldErrors: {
        name: ["Informe um nome válido."],
      },
      message: "Revise a área jurídica.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const payload = {
    description: parsed.data.description,
    name: parsed.data.name,
    position: parsed.data.position,
    slug,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };
  const result = parsed.data.id
    ? await supabase.from("legal_areas").update(payload).eq("id", parsed.data.id)
    : await supabase.from("legal_areas").insert({
        ...payload,
        active: true,
        created_by: user.id,
      });

  if (result.error) {
    return {
      message: "Não foi possível salvar a área jurídica. Verifique se já existe uma área com esse nome.",
      ok: false,
    };
  }

  revalidateSitePaths();
  revalidatePath("/crm/leads");
  revalidatePath("/crm/pipeline");

  return { message: "Área jurídica salva.", ok: true };
}

export async function setLegalAreaStatus(
  id: string,
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertSiteSettingsAccess();
  const parsed = statusSchema.safeParse({ active: formData.get("active") });

  if (!parsed.success) {
    return { message: "Status inválido.", ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("legal_areas")
    .update({
      active: parsed.data.active === "true",
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar a área jurídica.", ok: false };
  }

  revalidateSitePaths();
  revalidatePath("/crm/leads");
  revalidatePath("/crm/pipeline");

  return { message: "Área jurídica atualizada.", ok: true };
}

export async function deleteLegalArea(id: string): Promise<SettingsActionState> {
  await assertSiteSettingsAccess();
  const supabase = await createClient();
  const { data: area } = await supabase
    .from("legal_areas")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (!area?.name) {
    return { message: "Área jurídica não encontrada.", ok: false };
  }

  const { count, error: usageError } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("legal_area", area.name);

  if (usageError) {
    return { message: "Não foi possível verificar o uso da área jurídica.", ok: false };
  }

  if ((count ?? 0) > 0) {
    return {
      message: "Esta área já está em uso. Desative para remover dos novos formulários.",
      ok: false,
    };
  }

  const { error } = await supabase.from("legal_areas").delete().eq("id", id);

  if (error) {
    return { message: "Não foi possível excluir a área jurídica.", ok: false };
  }

  revalidateSitePaths();
  revalidatePath("/crm/leads");
  revalidatePath("/crm/pipeline");

  return { message: "Área jurídica excluída.", ok: true };
}

export async function updateBusinessHours(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await assertContentWriteAccess();
  const rows = Array.from({ length: 7 }, (_, day) => {
    const enabled = formData.get(`enabled-${day}`) === "on";
    const opensAt = String(formData.get(`opensAt-${day}`) ?? "").trim() || null;
    const closesAt = String(formData.get(`closesAt-${day}`) ?? "").trim() || null;

    return {
      closes_at: enabled ? closesAt : null,
      day_of_week: day,
      enabled,
      opens_at: enabled ? opensAt : null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };
  });

  const invalidRow = rows.find(
    (row) => row.enabled && (!row.opens_at || !row.closes_at || row.opens_at >= row.closes_at),
  );

  if (invalidRow) {
    return {
      message: "Revise os horários de atendimento.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "day_of_week" });

  if (error) {
    return { message: "Não foi possível salvar os horários de atendimento.", ok: false };
  }

  revalidateSitePaths();

  return { message: "Horários de atendimento salvos.", ok: true };
}
