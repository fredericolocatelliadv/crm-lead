"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

const BLOG_COVER_BUCKET = "blog-covers";
const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type BlogActionState = {
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

const categorySchema = z.object({
  description: optionalText,
  id: optionalUuid,
  name: z.string().trim().min(2, "Informe o nome da categoria."),
});

const categoryStatusSchema = z.object({
  active: z.enum(["true", "false"]),
});

const postSchema = z.object({
  author: optionalText,
  categoryId: optionalUuid,
  content: z.string().trim().min(10, "Escreva o conteúdo do post."),
  currentImageUrl: optionalText,
  excerpt: optionalText,
  publishedAt: optionalText,
  slug: optionalText,
  status: z.enum(["draft", "published"], {
    error: "Selecione o status do post.",
  }),
  title: z.string().trim().min(3, "Informe o título do post."),
});

async function assertBlogWriteAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "crm:write")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function textToSafeHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function readPostForm(formData: FormData) {
  return {
    author: formData.get("author"),
    categoryId: formData.get("categoryId"),
    content: formData.get("content"),
    currentImageUrl: formData.get("currentImageUrl"),
    excerpt: formData.get("excerpt"),
    publishedAt: formData.get("publishedAt"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    title: formData.get("title"),
  };
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

function readCoverImage(formData: FormData) {
  const file = formData.get("coverImage");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validateCoverImage(file: File): BlogActionState | null {
  if (file.size > MAX_COVER_IMAGE_SIZE) {
    return {
      fieldErrors: {
        coverImage: ["A imagem deve ter no máximo 5 MB."],
      },
      message: "Imagem maior que o limite permitido.",
      ok: false,
    };
  }

  if (!ALLOWED_COVER_IMAGE_TYPES.has(file.type)) {
    return {
      fieldErrors: {
        coverImage: ["Use JPG, PNG, WebP ou AVIF."],
      },
      message: "Tipo de imagem não permitido.",
      ok: false,
    };
  }

  return null;
}

async function uploadBlogCoverImage(file: File, userId: string) {
  const supabase = await createClient();
  const name = safeFileName(file.name) || "capa";
  const storagePath = `${userId}/${randomUUID()}-${name}`;
  const { error: uploadError } = await supabase.storage
    .from(BLOG_COVER_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Não foi possível enviar a imagem de capa.");
  }

  const { data } = supabase.storage.from(BLOG_COVER_BUCKET).getPublicUrl(storagePath);

  return data.publicUrl;
}

function revalidateBlogPaths(slug?: string | null, id?: string) {
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/crm/blog");

  if (slug) revalidatePath(`/noticias/${slug}`);
  if (id) revalidatePath(`/noticias/${id}`);
}

export async function upsertBlogCategory(
  _previousState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await assertBlogWriteAccess();
  const parsed = categorySchema.safeParse({
    description: formData.get("description"),
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise a categoria.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const payload = {
    description: parsed.data.description,
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    updated_at: new Date().toISOString(),
  };

  const result = parsed.data.id
    ? await supabase.from("blog_categories").update(payload).eq("id", parsed.data.id)
    : await supabase.from("blog_categories").insert({
        ...payload,
        active: true,
      });

  if (result.error) {
    return {
      message: "Não foi possível salvar a categoria.",
      ok: false,
    };
  }

  revalidateBlogPaths();

  return {
    message: "Categoria salva.",
    ok: true,
  };
}

export async function setBlogCategoryStatus(
  categoryId: string,
  _previousState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await assertBlogWriteAccess();
  const parsed = categoryStatusSchema.safeParse({ active: formData.get("active") });

  if (!parsed.success) {
    return {
      message: "Status inválido.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_categories")
    .update({
      active: parsed.data.active === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId);

  if (error) {
    return {
      message: "Não foi possível atualizar a categoria.",
      ok: false,
    };
  }

  revalidateBlogPaths();

  return {
    message: "Categoria atualizada.",
    ok: true,
  };
}

export async function deleteBlogCategory(categoryId: string): Promise<BlogActionState> {
  await assertBlogWriteAccess();
  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", categoryId);

  if (error) {
    return {
      message: "Não foi possível excluir a categoria.",
      ok: false,
    };
  }

  revalidateBlogPaths();

  return {
    message: "Categoria excluída.",
    ok: true,
  };
}

export async function createBlogPost(
  _previousState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await assertBlogWriteAccess();
  const parsed = postSchema.safeParse(readPostForm(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise o post.",
      ok: false,
    };
  }

  const coverImage = readCoverImage(formData);
  const coverImageError = coverImage ? validateCoverImage(coverImage) : null;

  if (coverImageError) return coverImageError;

  const supabase = await createClient();
  const slug = slugify(parsed.data.slug || parsed.data.title);
  const publishedAt =
    parsed.data.status === "published"
      ? parsed.data.publishedAt || new Date().toISOString()
      : parsed.data.publishedAt;
  let imageUrl = parsed.data.currentImageUrl;

  if (coverImage) {
    try {
      imageUrl = await uploadBlogCoverImage(coverImage, user.id);
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem de capa.",
        ok: false,
      };
    }
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author: parsed.data.author,
      category_id: parsed.data.categoryId,
      content: textToSafeHtml(parsed.data.content),
      created_by: user.id,
      excerpt: parsed.data.excerpt,
      image_url: imageUrl,
      published_at: publishedAt,
      slug,
      status: parsed.data.status,
      title: parsed.data.title,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return {
      message: "Não foi possível criar o post.",
      ok: false,
    };
  }

  revalidateBlogPaths(slug, data.id);
  redirect(`/crm/blog/${data.id}/editar`);
}

export async function updateBlogPost(
  postId: string,
  _previousState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await assertBlogWriteAccess();
  const parsed = postSchema.safeParse(readPostForm(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise o post.",
      ok: false,
    };
  }

  const coverImage = readCoverImage(formData);
  const coverImageError = coverImage ? validateCoverImage(coverImage) : null;

  if (coverImageError) return coverImageError;

  const supabase = await createClient();
  const slug = slugify(parsed.data.slug || parsed.data.title);
  const publishedAt =
    parsed.data.status === "published"
      ? parsed.data.publishedAt || new Date().toISOString()
      : parsed.data.publishedAt;
  let imageUrl = parsed.data.currentImageUrl;

  if (coverImage) {
    try {
      imageUrl = await uploadBlogCoverImage(coverImage, user.id);
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem de capa.",
        ok: false,
      };
    }
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      author: parsed.data.author,
      category_id: parsed.data.categoryId,
      content: textToSafeHtml(parsed.data.content),
      excerpt: parsed.data.excerpt,
      image_url: imageUrl,
      published_at: publishedAt,
      slug,
      status: parsed.data.status,
      title: parsed.data.title,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", postId);

  if (error) {
    return {
      message: "Não foi possível salvar o post.",
      ok: false,
    };
  }

  revalidateBlogPaths(slug, postId);

  return {
    message: "Post salvo.",
    ok: true,
  };
}

export async function deleteBlogPost(postId: string): Promise<BlogActionState> {
  await assertBlogWriteAccess();
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    return {
      message: "Não foi possível remover o post.",
      ok: false,
    };
  }

  revalidateBlogPaths();

  return {
    message: "Post removido.",
    ok: true,
  };
}
