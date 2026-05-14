import type { MetadataRoute } from "next";

import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicMarketingSettings();

  return {
    rules: [
      {
        allow: "/",
        disallow: ["/crm/"],
        userAgent: "*",
      },
    ],
    sitemap: settings.siteUrl ? `${settings.siteUrl}/sitemap.xml` : undefined,
  };
}
