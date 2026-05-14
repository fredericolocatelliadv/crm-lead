import { notFound } from "next/navigation";

import { createClient } from "@/server/supabase/server";

export type BlogPostStatus = "draft" | "published";

export type BlogCategory = {
  active: boolean;
  description: string | null;
  id: string;
  name: string;
  slug: string;
};

export type BlogPostItem = {
  author: string | null;
  categoryId: string | null;
  categoryName: string | null;
  content: string;
  createdAt: string;
  excerpt: string | null;
  id: string;
  imageUrl: string | null;
  publishedAt: string | null;
  slug: string | null;
  status: BlogPostStatus;
  title: string;
};

export type BlogManagerData = {
  categories: BlogCategory[];
  posts: BlogPostItem[];
};

export type BlogPostFormData = {
  categories: BlogCategory[];
  post: BlogPostItem | null;
};

type CategoryRow = {
  active: boolean;
  description: string | null;
  id: string;
  name: string;
  slug: string;
};

type CategoryRelation = { id: string; name: string } | { id: string; name: string }[] | null;

type PostRow = {
  author: string | null;
  category?: CategoryRelation;
  category_id: string | null;
  content: string;
  created_at: string;
  excerpt: string | null;
  id: string;
  image_url: string | null;
  published_at: string | null;
  slug: string | null;
  status: BlogPostStatus;
  title: string;
};

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapCategory(row: CategoryRow): BlogCategory {
  return {
    active: row.active,
    description: row.description,
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function mapPost(row: PostRow): BlogPostItem {
  return {
    author: row.author,
    categoryId: row.category_id,
    categoryName: relatedOne(row.category)?.name ?? null,
    content: row.content,
    createdAt: row.created_at,
    excerpt: row.excerpt,
    id: row.id,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    slug: row.slug,
    status: row.status,
    title: row.title,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getBlogManagerData(): Promise<BlogManagerData> {
  const supabase = await createClient();
  const [categoriesResult, postsResult] = await Promise.all([
    supabase
      .from("blog_categories")
      .select("id,name,slug,description,active")
      .order("name", { ascending: true }),
    supabase
      .from("blog_posts")
      .select(
        "id,category_id,title,slug,content,excerpt,image_url,author,status,published_at,created_at,category:blog_categories(id,name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  if (categoriesResult.error || postsResult.error) {
    throw new Error("Não foi possível carregar o blog.");
  }

  return {
    categories: ((categoriesResult.data ?? []) as CategoryRow[]).map(mapCategory),
    posts: ((postsResult.data ?? []) as PostRow[]).map(mapPost),
  };
}

export async function getBlogPostFormData(id?: string): Promise<BlogPostFormData> {
  const supabase = await createClient();
  const categoriesPromise = supabase
    .from("blog_categories")
    .select("id,name,slug,description,active")
    .order("name", { ascending: true });

  if (!id) {
    const categoriesResult = await categoriesPromise;

    if (categoriesResult.error) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    return {
      categories: ((categoriesResult.data ?? []) as CategoryRow[]).map(mapCategory),
      post: null,
    };
  }

  const [categoriesResult, postResult] = await Promise.all([
    categoriesPromise,
    supabase
      .from("blog_posts")
      .select(
        "id,category_id,title,slug,content,excerpt,image_url,author,status,published_at,created_at,category:blog_categories(id,name)",
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (categoriesResult.error || postResult.error) {
    throw new Error("Não foi possível carregar o post.");
  }

  if (!postResult.data) {
    notFound();
  }

  return {
    categories: ((categoriesResult.data ?? []) as CategoryRow[]).map(mapCategory),
    post: mapPost(postResult.data as PostRow),
  };
}

export async function getPublishedBlogPosts(limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(
      "id,category_id,title,slug,content,excerpt,image_url,author,status,published_at,created_at,category:blog_categories(id,name)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return ((data ?? []) as PostRow[]).map(mapPost);
}

export async function getPublishedBlogCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id,name,slug,description,active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return [];

  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

export async function getPublishedBlogPost(identifier: string) {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(
      "id,category_id,title,slug,content,excerpt,image_url,author,status,published_at,created_at,category:blog_categories(id,name)",
    )
    .eq("status", "published");

  query = isUuid(identifier) ? query.eq("id", identifier) : query.eq("slug", identifier);

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  return mapPost(data as PostRow);
}
