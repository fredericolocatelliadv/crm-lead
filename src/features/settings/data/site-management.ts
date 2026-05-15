import { createClient } from "@/server/supabase/server";

export type SiteSettings = {
  address: string | null;
  cookieConsentEnabled: boolean;
  email: string | null;
  facebook: string | null;
  googleAnalyticsId: string | null;
  googleSearchConsoleVerification: string | null;
  googleTagManagerId: string | null;
  instagram: string | null;
  linkedin: string | null;
  metaDomainVerification: string | null;
  metaPixelId: string | null;
  legalDocumentsUpdatedAt: string | null;
  legalDocumentsVersion: string;
  privacyContactEmail: string | null;
  privacyPolicyContent: string;
  seoDescription: string | null;
  seoImageUrl: string | null;
  seoTitle: string | null;
  siteUrl: string | null;
  termsOfUseContent: string;
  cookiePolicyContent: string;
  trackingEnabled: boolean;
  whatsapp: string | null;
  youtube: string | null;
};

export type TeamMemberItem = {
  active: boolean;
  bio: string | null;
  email: string | null;
  id: string;
  image: string | null;
  instagram: string | null;
  linkedin: string | null;
  name: string;
  oab: string | null;
  position: number;
  role: string | null;
  whatsapp: string | null;
};

export type TestimonialItem = {
  active: boolean;
  id: string;
  image: string | null;
  name: string;
  position: number;
  role: string | null;
  text: string;
};

export type FaqItem = {
  active: boolean;
  answer: string;
  id: string;
  position: number;
  question: string;
};

export type QuickReplyItem = {
  active: boolean;
  content: string;
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
};

export type BusinessHourItem = {
  closesAt: string | null;
  dayOfWeek: number;
  enabled: boolean;
  id: string;
  opensAt: string | null;
};

export type LegalAreaItem = {
  active: boolean;
  description: string | null;
  id: string;
  name: string;
  position: number;
  slug: string;
};

export type SiteManagementData = {
  businessHours: BusinessHourItem[];
  faqs: FaqItem[];
  legalAreas: LegalAreaItem[];
  quickReplies: QuickReplyItem[];
  settings: SiteSettings;
  teamMembers: TeamMemberItem[];
  testimonials: TestimonialItem[];
};

function stringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function booleanOrDefault(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function mapSiteSettings(data: Record<string, unknown> | null | undefined): SiteSettings {
  return {
    address: stringOrNull(data?.address),
    cookieConsentEnabled: booleanOrDefault(data?.cookie_consent_enabled, false),
    email: stringOrNull(data?.email),
    facebook: stringOrNull(data?.facebook),
    googleAnalyticsId: stringOrNull(data?.google_analytics_id),
    googleSearchConsoleVerification: stringOrNull(data?.google_search_console_verification),
    googleTagManagerId: stringOrNull(data?.google_tag_manager_id),
    instagram: stringOrNull(data?.instagram),
    legalDocumentsUpdatedAt: stringOrNull(data?.legal_documents_updated_at),
    legalDocumentsVersion: stringOrDefault(data?.legal_documents_version, "1.0"),
    linkedin: stringOrNull(data?.linkedin),
    metaDomainVerification: stringOrNull(data?.meta_domain_verification),
    metaPixelId: stringOrNull(data?.meta_pixel_id),
    privacyContactEmail: stringOrNull(data?.privacy_contact_email),
    privacyPolicyContent: stringOrDefault(data?.privacy_policy_content, ""),
    seoDescription: stringOrNull(data?.seo_description),
    seoImageUrl: stringOrNull(data?.seo_image_url),
    seoTitle: stringOrNull(data?.seo_title),
    siteUrl: stringOrNull(data?.site_url),
    termsOfUseContent: stringOrDefault(data?.terms_of_use_content, ""),
    cookiePolicyContent: stringOrDefault(data?.cookie_policy_content, ""),
    trackingEnabled: booleanOrDefault(data?.tracking_enabled, false),
    whatsapp: stringOrNull(data?.whatsapp),
    youtube: stringOrNull(data?.youtube),
  };
}

export async function getMarketingSettingsData(): Promise<SiteManagementData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "whatsapp,email,address,instagram,linkedin,facebook,youtube,site_url,seo_title,seo_description,seo_image_url,tracking_enabled,cookie_consent_enabled,google_tag_manager_id,google_analytics_id,meta_pixel_id,google_search_console_verification,meta_domain_verification,privacy_contact_email,legal_documents_version,legal_documents_updated_at,privacy_policy_content,terms_of_use_content,cookie_policy_content",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar SEO e marketing.");
  }

  return {
    businessHours: [],
    faqs: [],
    legalAreas: [],
    quickReplies: [],
    settings: mapSiteSettings(data),
    teamMembers: [],
    testimonials: [],
  };
}

export async function getSiteManagementData(): Promise<SiteManagementData> {
  const supabase = await createClient();
  const [
    settingsResult,
    teamResult,
    testimonialsResult,
    faqsResult,
    quickRepliesResult,
    businessHoursResult,
    legalAreasResult,
  ] = await Promise.all([
    supabase
      .from("site_settings")
      .select(
        "whatsapp,email,address,instagram,linkedin,facebook,youtube,site_url,seo_title,seo_description,seo_image_url,tracking_enabled,cookie_consent_enabled,google_tag_manager_id,google_analytics_id,meta_pixel_id,google_search_console_verification,meta_domain_verification,privacy_contact_email,legal_documents_version,legal_documents_updated_at,privacy_policy_content,terms_of_use_content,cookie_policy_content",
      )
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("team_members")
      .select("id,name,role,oab,image,bio,linkedin,email,instagram,whatsapp,position,active")
      .order("position", { ascending: true }),
    supabase
      .from("testimonials")
      .select("id,name,role,text,image,position,active")
      .order("position", { ascending: true }),
    supabase
      .from("faqs")
      .select("id,question,answer,position,active")
      .order("position", { ascending: true }),
    supabase
      .from("quick_replies")
      .select("id,title,content,active,created_at,updated_at")
      .order("title", { ascending: true }),
    supabase
      .from("business_hours")
      .select("id,day_of_week,enabled,opens_at,closes_at")
      .order("day_of_week", { ascending: true }),
    supabase
      .from("legal_areas")
      .select("id,name,slug,description,position,active")
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (
    settingsResult.error ||
    teamResult.error ||
    testimonialsResult.error ||
    faqsResult.error ||
    quickRepliesResult.error ||
    businessHoursResult.error ||
    legalAreasResult.error
  ) {
    throw new Error("Não foi possível carregar as configurações do site.");
  }

  return {
    businessHours: (businessHoursResult.data ?? []).map((hour) => ({
      closesAt: hour.closes_at,
      dayOfWeek: hour.day_of_week,
      enabled: hour.enabled,
      id: hour.id,
      opensAt: hour.opens_at,
    })),
    faqs: (faqsResult.data ?? []) as FaqItem[],
    legalAreas: (legalAreasResult.data ?? []) as LegalAreaItem[],
    quickReplies: (quickRepliesResult.data ?? []).map((reply) => ({
      active: reply.active,
      content: reply.content,
      createdAt: reply.created_at,
      id: reply.id,
      title: reply.title,
      updatedAt: reply.updated_at,
    })),
    settings: mapSiteSettings(settingsResult.data),
    teamMembers: (teamResult.data ?? []) as TeamMemberItem[],
    testimonials: (testimonialsResult.data ?? []) as TestimonialItem[],
  };
}
