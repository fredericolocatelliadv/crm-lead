type LeadConversionEvent = {
  formType: "appointment" | "whatsapp";
  legalArea?: string | null;
  source: "site" | "site_whatsapp";
};

type DataLayerEvent = {
  event: string;
  form_type: string;
  lead_source: string;
  legal_area?: string;
  page_path: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadConversion(event: LeadConversionEvent) {
  if (typeof window === "undefined") return;

  const payload: DataLayerEvent = {
    event: "generate_lead",
    form_type: event.formType,
    lead_source: event.source,
    page_path: window.location.pathname,
  };

  if (event.legalArea) {
    payload.legal_area = event.legalArea;
  }

  window.dataLayer?.push(payload);
  window.gtag?.("event", "generate_lead", {
    form_type: payload.form_type,
    lead_source: payload.lead_source,
    legal_area: payload.legal_area,
  });
  window.fbq?.("track", "Lead", {
    content_category: payload.legal_area ?? "Não informada",
    content_name: payload.form_type,
  });
}
