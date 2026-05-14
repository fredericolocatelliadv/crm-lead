"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

import type { PublicMarketingSettings } from "@/features/site/data/marketing-settings";

const CONSENT_KEY = "fl_marketing_consent";
const CONSENT_VERSION = "4";
const OPEN_COOKIE_EVENT = "fl:open-cookie-preferences";

type ConsentPreferences = {
  analytics: boolean;
  decidedAt: string;
  marketing: boolean;
  version: string;
};

const acceptedPreferences = (): ConsentPreferences => ({
  analytics: true,
  decidedAt: new Date().toISOString(),
  marketing: true,
  version: CONSENT_VERSION,
});

const rejectedPreferences = (): ConsentPreferences => ({
  analytics: false,
  decidedAt: new Date().toISOString(),
  marketing: false,
  version: CONSENT_VERSION,
});

export function MarketingTags({ settings }: { settings: PublicMarketingSettings }) {
  const pathname = usePathname();
  const isCrmRoute = pathname?.startsWith("/crm");
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    settings.cookieConsentEnabled ? null : acceptedPreferences(),
  );
  const [bannerVisible, setBannerVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [draft, setDraft] = useState<ConsentPreferences>(acceptedPreferences);

  useEffect(() => {
    if (!settings.cookieConsentEnabled) {
      const accepted = acceptedPreferences();
      setPreferences(accepted);
      setDraft(accepted);
      setBannerVisible(false);
      return;
    }

    const saved = readSavedConsent();

    if (saved) {
      setPreferences(saved);
      setDraft(saved);
      setBannerVisible(false);
      return;
    }

    const accepted = acceptedPreferences();
    setPreferences(null);
    setDraft(accepted);
    setBannerVisible(true);
  }, [settings.cookieConsentEnabled]);

  useEffect(() => {
    const openPreferences = () => {
      const saved = readSavedConsent();
      const nextDraft = saved ?? preferences ?? acceptedPreferences();
      setDraft(nextDraft);
      setCustomizing(true);
      setBannerVisible(true);
    };

    window.addEventListener(OPEN_COOKIE_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_EVENT, openPreferences);
  }, [preferences]);

  if (isCrmRoute) {
    return null;
  }

  const allowAnalytics = !settings.cookieConsentEnabled || Boolean(preferences?.analytics);
  const allowMarketing = !settings.cookieConsentEnabled || Boolean(preferences?.marketing);
  const canLoadAnyTag = allowAnalytics || allowMarketing;

  return (
    <>
      {settings.trackingEnabled && canLoadAnyTag ? (
        <MarketingScripts
          allowAnalytics={allowAnalytics}
          allowMarketing={allowMarketing}
          settings={settings}
        />
      ) : null}
      {settings.cookieConsentEnabled && bannerVisible ? (
        <CookieConsentBanner
          customizing={customizing}
          draft={draft}
          onAcceptAll={() => {
            const accepted = acceptedPreferences();
            saveConsent(accepted);
            setPreferences(accepted);
            setDraft(accepted);
            setBannerVisible(false);
            setCustomizing(false);
          }}
          onRejectOptional={() => {
            const rejected = rejectedPreferences();
            saveConsent(rejected);
            setPreferences(rejected);
            setDraft(rejected);
            setBannerVisible(false);
            setCustomizing(false);
          }}
          onSavePreferences={() => {
            const nextPreferences = {
              ...draft,
              decidedAt: new Date().toISOString(),
              version: CONSENT_VERSION,
            };
            saveConsent(nextPreferences);
            setPreferences(nextPreferences);
            setDraft(nextPreferences);
            setBannerVisible(false);
            setCustomizing(false);
          }}
          onToggle={(key) => setDraft((current) => ({ ...current, [key]: !current[key] }))}
          onCustomize={() => setCustomizing(true)}
          onCloseCustomize={() => setCustomizing(false)}
        />
      ) : null}
    </>
  );
}

function MarketingScripts({
  allowAnalytics,
  allowMarketing,
  settings,
}: {
  allowAnalytics: boolean;
  allowMarketing: boolean;
  settings: PublicMarketingSettings;
}) {
  const shouldLoadGtm = Boolean(settings.googleTagManagerId && (allowAnalytics || allowMarketing));
  const shouldLoadGa4Directly = Boolean(
    allowAnalytics && settings.googleAnalyticsId && !settings.googleTagManagerId,
  );
  const shouldLoadMetaPixel = Boolean(allowMarketing && settings.metaPixelId);

  return (
    <>
      <Script id="marketing-consent-state" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: '${allowAnalytics ? "granted" : "denied"}',
            ad_storage: '${allowMarketing ? "granted" : "denied"}',
            ad_user_data: '${allowMarketing ? "granted" : "denied"}',
            ad_personalization: '${allowMarketing ? "granted" : "denied"}'
          });
          window.dataLayer.push({
            event: 'cookie_consent_update',
            analytics_storage: '${allowAnalytics ? "granted" : "denied"}',
            ad_storage: '${allowMarketing ? "granted" : "denied"}'
          });
        `}
      </Script>

      {shouldLoadGtm ? (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}`}
              height="0"
              width="0"
              className="hidden invisible"
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {shouldLoadGa4Directly ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.googleAnalyticsId}');
            `}
          </Script>
        </>
      ) : null}

      {shouldLoadMetaPixel ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              className="hidden"
              alt=""
              src={`https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}

function CookieConsentBanner({
  customizing,
  draft,
  onAcceptAll,
  onCloseCustomize,
  onCustomize,
  onRejectOptional,
  onSavePreferences,
  onToggle,
}: {
  customizing: boolean;
  draft: ConsentPreferences;
  onAcceptAll: () => void;
  onCloseCustomize: () => void;
  onCustomize: () => void;
  onRejectOptional: () => void;
  onSavePreferences: () => void;
  onToggle: (key: "analytics" | "marketing") => void;
}) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-zinc-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Usamos cookies para funcionamento do site e, com sua autorização, para medição e marketing.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={onRejectOptional}
              className="border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-white/30"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={onCustomize}
              className="border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-white/30"
            >
              Personalizar
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="bg-[#D6A84F] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>

      {customizing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 text-white backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="w-full max-w-lg border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="cookie-preferences-title" className="text-base font-semibold text-white">
                  Preferências de cookies
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Cookies necessários ficam sempre ativos. Escolha abaixo os cookies opcionais.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseCustomize}
                className="border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <PreferenceItem
                checked
                disabled
                description="Segurança, formulários e funcionamento básico do site."
                label="Necessários"
              />
              <PreferenceItem
                checked={draft.analytics}
                description="Mede visitas e desempenho das páginas."
                label="Medição"
                onChange={() => onToggle("analytics")}
              />
              <PreferenceItem
                checked={draft.marketing}
                description="Mede campanhas do Google, Meta e conversões de leads."
                label="Marketing"
                onChange={() => onToggle("marketing")}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onRejectOptional}
                className="border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-white/30"
              >
                Recusar opcionais
              </button>
              <button
                type="button"
                onClick={onSavePreferences}
                className="bg-[#D6A84F] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PreferenceItem({
  checked,
  description,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onChange?: () => void;
}) {
  return (
    <label className="flex gap-3 border border-white/10 bg-black/30 p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        readOnly={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-[#D6A84F]"
      />
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-zinc-400">{description}</span>
      </span>
    </label>
  );
}

function readSavedConsent(): ConsentPreferences | null {
  const saved = window.localStorage.getItem(CONSENT_KEY);
  if (!saved) return null;

  if (saved === "accepted" || saved === "rejected") {
    window.localStorage.removeItem(CONSENT_KEY);
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<ConsentPreferences>;

    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }

    if (parsed.version !== CONSENT_VERSION) {
      window.localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return {
      analytics: parsed.analytics,
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
      marketing: parsed.marketing,
      version: parsed.version ?? CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

function saveConsent(preferences: ConsentPreferences) {
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
}
