import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";
import { createClient } from "@/server/supabase/server";

function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(cleanUndefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== undefined).map(([key, entry]) => [
        key,
        cleanUndefined(entry),
      ]),
    ) as T;
  }

  return value;
}

function phoneToInternational(value: string | null | undefined) {
  if (!value) return undefined;

  const digits = value.replace(/\D/g, "");

  if (!digits) return undefined;

  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
}

function absoluteUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function SiteStructuredData() {
  const [marketingSettings, supabase] = await Promise.all([
    getPublicMarketingSettings(),
    createClient(),
  ]);

  if (!marketingSettings.siteUrl) return null;

  const { data: settings } = await supabase
    .from("site_settings")
    .select("email,address,instagram,linkedin,facebook,youtube,whatsapp")
    .eq("id", 1)
    .maybeSingle();

  const sameAs = [
    settings?.instagram,
    settings?.linkedin,
    settings?.facebook,
    settings?.youtube,
  ].filter(Boolean);
  const logo = absoluteUrl(marketingSettings.siteUrl, "/logos/logo_icon.png");
  const graph = cleanUndefined({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${marketingSettings.siteUrl}/#organization`,
        "@type": "LegalService",
        address: settings?.address
          ? {
              "@type": "PostalAddress",
              addressCountry: "BR",
              streetAddress: settings.address,
            }
          : undefined,
        description: marketingSettings.seoDescription,
        email: settings?.email ?? undefined,
        image: marketingSettings.seoImageUrl ?? logo,
        logo,
        name: "Frederico & Locatelli Sociedade de Advogados",
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        telephone: phoneToInternational(settings?.whatsapp),
        url: marketingSettings.siteUrl,
      },
      {
        "@id": `${marketingSettings.siteUrl}/#website`,
        "@type": "WebSite",
        inLanguage: "pt-BR",
        name: marketingSettings.seoTitle,
        publisher: {
          "@id": `${marketingSettings.siteUrl}/#organization`,
        },
        url: marketingSettings.siteUrl,
      },
    ],
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
