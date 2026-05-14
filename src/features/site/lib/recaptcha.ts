"use client";

export type RecaptchaAction = "SITE_APPOINTMENT" | "SITE_WHATSAPP";

type GrecaptchaEnterprise = {
  enterprise: {
    execute: (siteKey: string, options: { action: RecaptchaAction }) => Promise<string>;
    ready: (callback: () => void) => void;
  };
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaEnterprise;
  }
}

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
}

export async function executeRecaptcha(action: RecaptchaAction) {
  const siteKey = getRecaptchaSiteKey();

  if (!siteKey) {
    throw new Error("reCAPTCHA não configurado.");
  }

  if (!window.grecaptcha?.enterprise) {
    throw new Error("reCAPTCHA indisponível.");
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.enterprise.ready(() => {
      window.grecaptcha?.enterprise
        .execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}
