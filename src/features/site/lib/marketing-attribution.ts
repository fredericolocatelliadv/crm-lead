export type MarketingAttribution = {
  fbclid: string | null;
  gclid: string | null;
  landingPage: string | null;
  referrer: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmMedium: string | null;
  utmSource: string | null;
  utmTerm: string | null;
};

const ATTRIBUTION_KEY = "fl_marketing_attribution";

const emptyAttribution: MarketingAttribution = {
  fbclid: null,
  gclid: null,
  landingPage: null,
  referrer: null,
  utmCampaign: null,
  utmContent: null,
  utmMedium: null,
  utmSource: null,
  utmTerm: null,
};

function readParam(params: URLSearchParams, name: string) {
  const value = params.get(name)?.trim();
  return value && value.length > 0 ? value.slice(0, 500) : null;
}

function hasCampaignParams(params: URLSearchParams) {
  return [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
  ].some((param) => params.has(param));
}

function parseStoredAttribution(value: string | null): MarketingAttribution | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<MarketingAttribution>;

    return {
      fbclid: parsed.fbclid ?? null,
      gclid: parsed.gclid ?? null,
      landingPage: parsed.landingPage ?? null,
      referrer: parsed.referrer ?? null,
      utmCampaign: parsed.utmCampaign ?? null,
      utmContent: parsed.utmContent ?? null,
      utmMedium: parsed.utmMedium ?? null,
      utmSource: parsed.utmSource ?? null,
      utmTerm: parsed.utmTerm ?? null,
    };
  } catch {
    return null;
  }
}

export function captureMarketingAttribution() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const stored = parseStoredAttribution(window.sessionStorage.getItem(ATTRIBUTION_KEY));
  const shouldRefreshCampaign = hasCampaignParams(url.searchParams);

  const next: MarketingAttribution = shouldRefreshCampaign
    ? {
        fbclid: readParam(url.searchParams, "fbclid"),
        gclid: readParam(url.searchParams, "gclid"),
        landingPage: url.toString(),
        referrer: document.referrer || null,
        utmCampaign: readParam(url.searchParams, "utm_campaign"),
        utmContent: readParam(url.searchParams, "utm_content"),
        utmMedium: readParam(url.searchParams, "utm_medium"),
        utmSource: readParam(url.searchParams, "utm_source"),
        utmTerm: readParam(url.searchParams, "utm_term"),
      }
    : {
        ...(stored ?? emptyAttribution),
        landingPage: stored?.landingPage ?? url.toString(),
        referrer: stored?.referrer ?? (document.referrer || null),
      };

  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
}

export function readMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return emptyAttribution;

  captureMarketingAttribution();

  return (
    parseStoredAttribution(window.sessionStorage.getItem(ATTRIBUTION_KEY)) ?? emptyAttribution
  );
}
