import type { Metadata } from "next";

import SingleNewsPage from "@/features/blog/components/SingleNewsPage";
import {
  getPublishedBlogPost,
  getPublishedBlogPosts,
  type BlogPostItem,
} from "@/features/blog/data/blog-content";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";
import type { News } from "@/shared/types/content";

interface NewsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toNews(post: BlogPostItem): News {
  return {
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
  };
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const [post, settings] = await Promise.all([
    getPublishedBlogPost(id),
    getPublicMarketingSettings(),
  ]);

  if (!post) {
    return {
      title: "Notícia não encontrada",
    };
  }

  const slug = post.slug ?? post.id;
  const description = post.excerpt || stripHtml(post.content).slice(0, 160);
  const url = settings.siteUrl ? `${settings.siteUrl}/noticias/${slug}` : undefined;

  return {
    alternates: {
      canonical: `/noticias/${slug}`,
    },
    description,
    openGraph: {
      description,
      images: post.imageUrl ? [post.imageUrl] : settings.seoImageUrl ? [settings.seoImageUrl] : undefined,
      publishedTime: post.publishedAt ?? post.createdAt,
      title: post.title,
      type: "article",
      url,
    },
    title: post.title,
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const [post, posts] = await Promise.all([
    getPublishedBlogPost(id),
    getPublishedBlogPosts(4),
  ]);

  return (
    <SingleNewsPage
      news={post ? toNews(post) : null}
      relatedNews={post ? posts.filter((item) => item.id !== post.id).map(toNews) : []}
    />
  );
}
