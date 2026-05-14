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
    settings: {
      address: settingsResult.data?.address ?? null,
      cookieConsentEnabled: settingsResult.data?.cookie_consent_enabled ?? false,
      email: settingsResult.data?.email ?? null,
      facebook: settingsResult.data?.facebook ?? null,
      googleAnalyticsId: settingsResult.data?.google_analytics_id ?? null,
      googleSearchConsoleVerification:
        settingsResult.data?.google_search_console_verification ?? null,
      googleTagManagerId: settingsResult.data?.google_tag_manager_id ?? null,
      instagram: settingsResult.data?.instagram ?? null,
      legalDocumentsUpdatedAt: settingsResult.data?.legal_documents_updated_at ?? null,
      legalDocumentsVersion: settingsResult.data?.legal_documents_version ?? "1.0",
      linkedin: settingsResult.data?.linkedin ?? null,
      metaDomainVerification: settingsResult.data?.meta_domain_verification ?? null,
      metaPixelId: settingsResult.data?.meta_pixel_id ?? null,
      privacyContactEmail: settingsResult.data?.privacy_contact_email ?? null,
      privacyPolicyContent: settingsResult.data?.privacy_policy_content ?? "",
      seoDescription: settingsResult.data?.seo_description ?? null,
      seoImageUrl: settingsResult.data?.seo_image_url ?? null,
      seoTitle: settingsResult.data?.seo_title ?? null,
      siteUrl: settingsResult.data?.site_url ?? null,
      termsOfUseContent: settingsResult.data?.terms_of_use_content ?? "",
      cookiePolicyContent: settingsResult.data?.cookie_policy_content ?? "",
      trackingEnabled: settingsResult.data?.tracking_enabled ?? false,
      whatsapp: settingsResult.data?.whatsapp ?? null,
      youtube: settingsResult.data?.youtube ?? null,
    },
    teamMembers: (teamResult.data ?? []) as TeamMemberItem[],
    testimonials: (testimonialsResult.data ?? []) as TestimonialItem[],
  };
}
