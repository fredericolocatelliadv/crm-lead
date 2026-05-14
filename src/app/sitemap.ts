import type { MetadataRoute } from "next";

import { getPublishedBlogPosts } from "@/features/blog/data/blog-content";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicMarketingSettings();

  if (!settings.siteUrl) return [];

  const posts = await getPublishedBlogPosts();
  const now = new Date();

  return [
    {
      changeFrequency: "weekly",
      lastModified: now,
      priority: 1,
      url: buildUrl(settings.siteUrl, "/"),
    },
    {
      changeFrequency: "weekly",
      lastModified: now,
      priority: 0.8,
      url: buildUrl(settings.siteUrl, "/noticias"),
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.4,
      url: buildUrl(settings.siteUrl, "/politica-de-privacidade"),
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.4,
      url: buildUrl(settings.siteUrl, "/termos-de-uso"),
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.4,
      url: buildUrl(settings.siteUrl, "/politica-de-cookies"),
    },
    ...posts.map((post) => ({
      changeFrequency: "monthly" as const,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt),
      priority: 0.6,
      url: buildUrl(settings.siteUrl!, `/noticias/${post.slug ?? post.id}`),
    })),
  ];
}
