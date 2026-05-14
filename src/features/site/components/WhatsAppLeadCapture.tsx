"use client";

import { Send, X } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";

import { readMarketingAttribution } from "@/features/site/lib/marketing-attribution";
import { trackLeadConversion } from "@/features/site/lib/marketing-events";
import { executeRecaptcha } from "@/features/site/lib/recaptcha";
import { useSettings } from "@/features/settings/hooks/use-settings";

type WhatsAppLeadCaptureProps = {
  buttonClassName: string;
  children: ReactNode;
  floating?: boolean;
  tooltip?: string;
  whatsappNumber?: string;
};

type QuickWhatsAppValues = {
  message: string;
  marketingConsent: boolean;
  name: string;
  website: string;
};

const initialValues: QuickWhatsAppValues = {
  message: "",
  marketingConsent: false,
  name: "",
  website: "",
};

function createWhatsAppIntentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `FL-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  }

  return `FL-${Date.now().toString(36).toUpperCase()}`;
}

function buildWhatsAppUrl(whatsappNumber: string, values: QuickWhatsAppValues, intentId: string) {
  const phone = whatsappNumber.replace(/\D/g, "");
  const text = [
    `Olá, meu nome é ${values.name}.`,
    values.message,
    "",
    `Protocolo: ${intentId}`,
  ]
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppLeadCapture({
  buttonClassName,
  children,
  floating = false,
  tooltip,
  whatsappNumber: whatsappNumberOverride,
}: WhatsAppLeadCaptureProps) {
  const { settings } = useSettings();
  const whatsappNumber = whatsappNumberOverride || settings?.whatsapp || "5511999999999";
  const [formData, setFormData] = useState<QuickWhatsAppValues>(initialValues);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
      setFormData({ ...formData, [name]: event.target.checked });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const whatsappIntentId = createWhatsAppIntentId();
    setStatus("submitting");

    try {
      const recaptchaToken = await executeRecaptcha("SITE_WHATSAPP");
      const response = await fetch("/api/leads/site", {
        body: JSON.stringify({
          bestContactTime: "",
          email: "",
          legalArea: "",
          marketingAttribution: readMarketingAttribution(),
          marketingConsent: formData.marketingConsent,
          message: formData.message,
          name: formData.name,
          phone: "",
          privacyNoticeAccepted: true,
          preferredContactChannel: "whatsapp",
          recaptchaToken,
          source: "site_whatsapp",
          website: formData.website,
          whatsappIntentId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) throw new Error("Não foi possível iniciar o atendimento.");

      const whatsappUrl = buildWhatsAppUrl(whatsappNumber, formData, whatsappIntentId);
      setFormData(initialValues);
      setOpen(false);
      setStatus("idle");
      trackLeadConversion({
        formType: "whatsapp",
        legalArea: null,
        source: "site_whatsapp",
      });

      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      if (!opened) {
        window.location.assign(whatsappUrl);
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
        aria-label={floating ? "Falar pelo WhatsApp" : undefined}
      >
        {tooltip ? (
          <span className="absolute right-full mr-4 hidden sm:block bg-zinc-900 text-white text-sm px-4 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-white/10 pointer-events-none">
            {tooltip}
          </span>
        ) : null}
        {children}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gold/30 bg-black p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/10 bg-zinc-950 text-zinc-300 transition-colors hover:border-gold/60 hover:text-gold"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="serif mb-2 pr-12 text-2xl font-light text-gold">
              Falar pelo WhatsApp
            </h3>
            <p className="mb-6 text-sm font-light text-zinc-400">
              Informe seu nome e a mensagem. O WhatsApp será aberto para você enviar a conversa pelo seu próprio número.
            </p>

            {status === "error" ? (
              <div className="mb-5 border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                Não foi possível iniciar o atendimento. Revise os dados e tente novamente.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label htmlFor="whatsapp-name" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
                  Nome
                </label>
                <input
                  id="whatsapp-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={status === "submitting"}
                  className="w-full border border-white/10 bg-zinc-950 p-4 text-white outline-none transition-colors focus:border-gold disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="whatsapp-message" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
                  Mensagem
                </label>
                <textarea
                  id="whatsapp-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  disabled={status === "submitting"}
                  className="w-full resize-none border border-white/10 bg-zinc-950 p-4 text-white outline-none transition-colors focus:border-gold disabled:opacity-50"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs leading-5 text-zinc-500">
                  Ao enviar, você declara ciência de que seus dados serão usados para retorno do atendimento,
                  conforme a{" "}
                  <Link href="/politica-de-privacidade" className="text-gold underline-offset-4 hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
                <label className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    className="mt-1 h-4 w-4 accent-gold"
                  />
                  <span>
                    Aceito receber comunicações informativas do escritório.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(226,185,97,0.2)] transition-opacity duration-300 hover:opacity-90 disabled:opacity-70"
              >
                {status === "submitting" ? "Enviando..." : <><Send className="h-4 w-4" /> Iniciar conversa</>}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
