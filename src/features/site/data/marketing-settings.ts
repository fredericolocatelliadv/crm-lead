import "server-only";

import { cache } from "react";

import { createClient } from "@/server/supabase/server";

export type PublicMarketingSettings = {
  cookieConsentEnabled: boolean;
  googleAnalyticsId: string | null;
  googleSearchConsoleVerification: string | null;
  googleTagManagerId: string | null;
  metaDomainVerification: string | null;
  metaPixelId: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  seoTitle: string | null;
  siteUrl: string | null;
  trackingEnabled: boolean;
};

export const defaultSeoTitle = "Frederico & Locatelli - Sociedade de Advogados";
export const defaultSeoDescription =
  "Atendimento jurídico estratégico para pessoas e empresas, com foco em clareza, segurança e solução.";

function normalizeUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export const getPublicMarketingSettings = cache(async (): Promise<PublicMarketingSettings> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "site_url,seo_title,seo_description,seo_image_url,tracking_enabled,cookie_consent_enabled,google_tag_manager_id,google_analytics_id,meta_pixel_id,google_search_console_verification,meta_domain_verification",
    )
    .eq("id", 1)
    .maybeSingle();

  const envSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return {
    cookieConsentEnabled: data?.cookie_consent_enabled ?? false,
    googleAnalyticsId: data?.google_analytics_id ?? null,
    googleSearchConsoleVerification: data?.google_search_console_verification ?? null,
    googleTagManagerId: data?.google_tag_manager_id ?? null,
    metaDomainVerification: data?.meta_domain_verification ?? null,
    metaPixelId: data?.meta_pixel_id ?? null,
    seoDescription: data?.seo_description ?? defaultSeoDescription,
    seoImageUrl: normalizeUrl(data?.seo_image_url),
    seoTitle: data?.seo_title ?? defaultSeoTitle,
    siteUrl: normalizeUrl(data?.site_url) ?? normalizeUrl(envSiteUrl),
    trackingEnabled: data?.tracking_enabled ?? false,
  };
});
