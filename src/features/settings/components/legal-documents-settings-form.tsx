"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Info, ShieldCheck, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  updateLegalDocumentsSettings,
  type SettingsActionState,
} from "@/features/settings/actions";
import type { SiteSettings } from "@/features/settings/data/site-management";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: SettingsActionState = { ok: false };

export function LegalDocumentsSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateLegalDocumentsSettings,
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <StatusBox
          icon={ShieldCheck}
          label="Privacidade"
          text="Texto publicado no site e vinculado aos formulários."
        />
        <StatusBox
          icon={FileText}
          label="Versão"
          text={settings.legalDocumentsVersion || "1.0"}
        />
        <StatusBox
          icon={Info}
          label="Última atualização"
          text={
            settings.legalDocumentsUpdatedAt
              ? formatDateTime(settings.legalDocumentsUpdatedAt)
              : "Ainda não registrada"
          }
        />
      </div>

      <section className="space-y-4 rounded-md border bg-background/40 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Publicação e revisão</h3>
              <Badge variant="warning">Revisão recomendada</Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Estes textos são uma base profissional para desenvolvimento. Antes de publicar
              em produção, o escritório deve revisar o conteúdo conforme sua operação real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/politica-de-privacidade" target="_blank">
                Privacidade
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/termos-de-uso" target="_blank">
                Termos
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/politica-de-cookies" target="_blank">
                Cookies
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            description="Use uma versão curta, como 1.0, 1.1 ou 2026.05. Essa versão fica salva nos leads capturados pelo site."
            error={state.fieldErrors?.legalDocumentsVersion?.[0]}
            label="Versão dos documentos"
            name="legalDocumentsVersion"
            defaultValue={settings.legalDocumentsVersion}
          />
          <Field
            description="E-mail de contato para solicitações de privacidade. Se ficar vazio, o site usa o e-mail principal."
            error={state.fieldErrors?.privacyContactEmail?.[0]}
            label="E-mail para privacidade"
            name="privacyContactEmail"
            placeholder="privacidade@exemplo.com.br"
            defaultValue={settings.privacyContactEmail}
          />
        </div>
      </section>

      <TextSection
        description="Explique quais dados são coletados, por que são tratados, com quem podem ser compartilhados e como o titular pode solicitar seus direitos."
        error={state.fieldErrors?.privacyPolicyContent?.[0]}
        label="Política de Privacidade"
        name="privacyPolicyContent"
        rows={16}
        defaultValue={settings.privacyPolicyContent}
      />

      <TextSection
        description="Explique a natureza informativa do site, os limites do atendimento inicial e as responsabilidades do usuário."
        error={state.fieldErrors?.termsOfUseContent?.[0]}
        label="Termos de Uso"
        name="termsOfUseContent"
        rows={12}
        defaultValue={settings.termsOfUseContent}
      />

      <TextSection
        description="Explique cookies necessários, cookies opcionais de medição e marketing, e como o visitante pode gerenciar preferências."
        error={state.fieldErrors?.cookiePolicyContent?.[0]}
        label="Política de Cookies"
        name="cookiePolicyContent"
        rows={12}
        defaultValue={settings.cookiePolicyContent}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar documentos legais"}
        </Button>
      </div>
    </form>
  );
}

function StatusBox({
  icon: Icon,
  label,
  text,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-md border bg-background/40 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
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

function TextSection({
  defaultValue,
  description,
  error,
  label,
  name,
  rows,
}: {
  defaultValue?: string | null;
  description: string;
  error?: string;
  label: string;
  name: string;
  rows: number;
}) {
  return (
    <section className="space-y-3 rounded-md border bg-background/40 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="min-h-64 font-mono text-sm leading-6"
      />
      <p className="text-xs leading-5 text-muted-foreground">
        Você pode usar títulos com ## e ### para organizar a página pública.
      </p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
