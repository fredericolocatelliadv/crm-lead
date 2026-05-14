import type { Metadata } from "next";

import SiteHome from "@/features/site/components/site-home";
import { SiteStructuredData } from "@/features/site/components/SiteStructuredData";
import { getPublishedBlogPosts } from "@/features/blog/data/blog-content";
import { getPublicLegalAreaOptions } from "@/features/leads/data/legal-areas";
import {
  defaultSeoDescription,
  defaultSeoTitle,
  getPublicMarketingSettings,
} from "@/features/site/data/marketing-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();
  const title = settings.seoTitle ?? defaultSeoTitle;
  const description = settings.seoDescription ?? defaultSeoDescription;

  return {
    alternates: {
      canonical: "/",
    },
    description,
    openGraph: {
      description,
      images: settings.seoImageUrl ? [settings.seoImageUrl] : undefined,
      title,
      type: "website",
      url: settings.siteUrl ?? undefined,
    },
    title,
  };
}

export default async function Home() {
  const [posts, legalAreas] = await Promise.all([
    getPublishedBlogPosts(3),
    getPublicLegalAreaOptions(),
  ]);

  return (
    <>
      <SiteStructuredData />
      <SiteHome legalAreas={legalAreas} news={posts.map((post) => ({
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
      }))} />
    </>
  );
}
