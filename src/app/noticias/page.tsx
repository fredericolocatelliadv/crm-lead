import type { Metadata } from "next";

import AllNewsPage from "@/features/blog/components/AllNewsPage";
import {
  getPublishedBlogCategories,
  getPublishedBlogPosts,
} from "@/features/blog/data/blog-content";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();
  const title = "Notícias";
  const description =
    "Conteúdos e notícias jurídicas publicados por Frederico & Locatelli Sociedade de Advogados.";

  return {
    alternates: {
      canonical: "/noticias",
    },
    description,
    openGraph: {
      description,
      images: settings.seoImageUrl ? [settings.seoImageUrl] : undefined,
      title,
      type: "website",
      url: settings.siteUrl ? `${settings.siteUrl}/noticias` : undefined,
    },
    title,
  };
}

export default async function NoticiasPage() {
  const [posts, categories] = await Promise.all([
    getPublishedBlogPosts(),
    getPublishedBlogCategories(),
  ]);

  return <AllNewsPage categories={categories.map((category) => category.name)} news={posts.map((post) => ({
    author: post.author || undefined,
    category: post.categoryName || undefined,
    content: post.content,
    created_at: post.publishedAt || post.createdAt,
    excerpt: post.excerpt,
    id: post.slug || post.id,
    image_url: post.imageUrl || undefined,
    published_at: post.publishedAt,
    slug: post.slug,
    title: post.title,
  }))} />;
}
