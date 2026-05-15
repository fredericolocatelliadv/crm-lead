"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { updateMarketingSettings, type SettingsActionState } from "@/features/settings/actions";
import type { SiteSettings } from "@/features/settings/data/site-management";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: SettingsActionState = { ok: false };

export function MarketingSeoSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateMarketingSettings, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  const hasGoogle = Boolean(settings.googleTagManagerId || settings.googleAnalyticsId);
  const hasMeta = Boolean(settings.metaPixelId);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <StatusBox
          label="Rastreamento"
          active={settings.trackingEnabled}
          text={settings.trackingEnabled ? "Ativo no site público" : "Pausado"}
        />
        <StatusBox
          label="Google"
          active={hasGoogle}
          text={hasGoogle ? "Configurado" : "Sem ID informado"}
        />
        <StatusBox
          label="Meta"
          active={hasMeta}
          text={hasMeta ? "Pixel informado" : "Sem Pixel informado"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ToggleField
          checked={settings.trackingEnabled}
          description="Liga ou pausa as tags de marketing no site público. Os IDs ficam salvos mesmo quando estiver pausado."
          label="Ativar rastreamento de marketing"
          name="trackingEnabled"
        />
        <ToggleField
          checked={settings.cookieConsentEnabled}
          description="Reserva a configuração para exigir consentimento antes de disparar tags de marketing."
          label="Usar consentimento de cookies"
          name="cookieConsentEnabled"
        />
      </div>

      <FormSection
        title="SEO básico"
        description="Dados usados por buscadores e redes sociais quando o site for compartilhado."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            description="URL principal do site, com https. Ex.: https://seudominio.com.br"
            error={state.fieldErrors?.siteUrl?.[0]}
            label="URL oficial do site"
            name="siteUrl"
            placeholder="https://www.exemplo.com.br"
            defaultValue={settings.siteUrl}
          />
          <SocialImageField
            description="Imagem padrão para compartilhamento em redes sociais."
            error={state.fieldErrors?.seoImageFile?.[0] ?? state.fieldErrors?.seoImageUrl?.[0]}
            label="Imagem social padrão"
            currentUrl={settings.seoImageUrl}
          />
        </div>
        <Field
          description="Título principal exibido em buscadores. Ideal manter curto e direto."
          error={state.fieldErrors?.seoTitle?.[0]}
          label="Título SEO"
          name="seoTitle"
          placeholder="Frederico & Locatelli - Sociedade de Advogados"
          defaultValue={settings.seoTitle}
        />
        <TextAreaField
          description="Resumo do escritório para resultados de busca e compartilhamento."
          error={state.fieldErrors?.seoDescription?.[0]}
          label="Descrição SEO"
          name="seoDescription"
          placeholder="Atendimento jurídico estratégico, com foco em clareza, segurança e solução."
          defaultValue={settings.seoDescription}
        />
      </FormSection>

      <FormSection
        title="Google"
        description="IDs usados pelo marketing para mensuração, análise e verificação de propriedade."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            description="Cole somente o ID. Ex.: GTM-XXXXXXX"
            error={state.fieldErrors?.googleTagManagerId?.[0]}
            label="Google Tag Manager"
            name="googleTagManagerId"
            placeholder="GTM-XXXXXXX"
            defaultValue={settings.googleTagManagerId}
          />
          <Field
            description="Use apenas quando não for medir pelo Tag Manager. Ex.: G-XXXXXXXXXX"
            error={state.fieldErrors?.googleAnalyticsId?.[0]}
            label="Google Analytics 4"
            name="googleAnalyticsId"
            placeholder="G-XXXXXXXXXX"
            defaultValue={settings.googleAnalyticsId}
          />
        </div>
        <Field
          description="Conteúdo da meta tag de verificação do Search Console."
          error={state.fieldErrors?.googleSearchConsoleVerification?.[0]}
          label="Verificação do Google Search Console"
          name="googleSearchConsoleVerification"
          placeholder="Código de verificação"
          defaultValue={settings.googleSearchConsoleVerification}
        />
      </FormSection>

      <FormSection
        title="Meta"
        description="Configurações usadas para Meta Ads, Instagram, Facebook e eventos de conversão."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            description="Cole somente o número do Pixel, sem código completo."
            error={state.fieldErrors?.metaPixelId?.[0]}
            label="Meta Pixel"
            name="metaPixelId"
            placeholder="123456789012345"
            defaultValue={settings.metaPixelId}
          />
          <Field
            description="Conteúdo da meta tag de verificação de domínio da Meta."
            error={state.fieldErrors?.metaDomainVerification?.[0]}
            label="Verificação de domínio da Meta"
            name="metaDomainVerification"
            placeholder="Código de verificação"
            defaultValue={settings.metaDomainVerification}
          />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar SEO e marketing"}
        </Button>
      </div>
    </form>
  );
}

function StatusBox({
  active,
  label,
  text,
}: {
  active: boolean;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-md border bg-background/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Badge variant={active ? "success" : "neutral"}>{active ? "Ativo" : "Pendente"}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ToggleField({
  checked,
  description,
  label,
  name,
}: {
  checked: boolean;
  description: string;
  label: string;
  name: string;
}) {
  return (
    <label className="flex min-h-24 gap-3 rounded-md border bg-background/40 p-4">
      <input
        name={name}
        type="checkbox"
        defaultChecked={checked}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-4 rounded-md border bg-background/40 p-4">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <Info className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SocialImageField({
  currentUrl,
  description,
  error,
  label,
}: {
  currentUrl?: string | null;
  description: string;
  error?: string;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input type="hidden" name="seoImageUrl" value={currentUrl ?? ""} />
      <Input name="seoImageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
      <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      {currentUrl ? (
        <span className="block overflow-hidden rounded-md border bg-background">
          <img
            src={currentUrl}
            alt="Imagem social padrão atual"
            className="aspect-[1.91/1] w-full object-cover"
          />
        </span>
      ) : null}
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function Field({
  defaultValue,
  description,
  error,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string | null;
  description: string;
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input name={name} placeholder={placeholder} defaultValue={defaultValue ?? ""} />
      <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  defaultValue,
  description,
  error,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string | null;
  description: string;
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        defaultValue={defaultValue ?? ""}
      />
      <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
