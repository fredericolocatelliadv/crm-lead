import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ExternalLink,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "@/features/leads/components/lead-badges";
import { LeadNoteDialog } from "@/features/leads/components/lead-note-dialog";
import { LeadStatusActions } from "@/features/leads/components/lead-status-actions";
import type { LeadDetailData } from "@/features/leads/data/lead-directory";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type LeadDetailViewProps = {
  data: LeadDetailData;
};

export function LeadDetailView({ data }: LeadDetailViewProps) {
  const { events, lead, notes } = data;
  const canConvert = !lead.convertedAt;
  const canMarkLost = !lead.lostAt && !lead.convertedAt;

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Lead
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {lead.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Histórico comercial, dados do contato e próximas ações do atendimento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lead.conversationId ? (
            <Button asChild variant="outline">
              <Link href={`/crm/conversas/${lead.conversationId}`}>
                <MessageCircle className="h-4 w-4" />
                Abrir conversa
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={`/crm/leads/${lead.id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar lead
            </Link>
          </Button>
          <LeadNoteDialog leadId={lead.id} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>Resumo do lead</CardTitle>
            <CardDescription>
              Informações principais para acompanhamento comercial.
            </CardDescription>
          </div>
          <LeadStatusActions
            canConvert={canConvert}
            canMarkLost={canMarkLost}
            leadId={lead.id}
          />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <InfoItem label="Status" value={<LeadStatusBadge status={lead.status} />} />
          <InfoItem label="Prioridade" value={<LeadPriorityBadge priority={lead.priority} />} />
          <InfoItem label="Origem" value={<LeadSourceBadge source={lead.source} />} />
          <InfoItem label="Etapa" value={<Badge variant="outline">{lead.stageName || "Sem etapa"}</Badge>} />
          <InfoItem icon={Phone} label="Telefone" value={lead.phone || "Não informado"} />
          <InfoItem icon={Mail} label="E-mail" value={lead.email || "Não informado"} />
          <InfoItem icon={MapPin} label="Cidade" value={lead.city || "Não informada"} />
          <InfoItem
            icon={UserRound}
            label="Responsável"
            value={lead.assigneeName || "Sem responsável"}
          />
          <InfoItem
            icon={CalendarClock}
            label="Melhor horário"
            value={lead.bestContactTime || "Não informado"}
          />
          <InfoItem label="Área jurídica" value={lead.legalArea || "Não informada"} />
          <InfoItem label="Criado por" value={lead.createdByName || "Não informado"} />
          <InfoItem label="Entrada" value={formatDateTime(lead.createdAt)} />
        </CardContent>
      </Card>

      {hasMarketingAttribution(lead) ? (
        <Card>
          <CardHeader>
            <CardTitle>Origem de marketing</CardTitle>
            <CardDescription>
              Dados de campanha preservados no momento em que o lead entrou.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <InfoItem icon={Megaphone} label="UTM source" value={lead.utmSource || "Não informado"} />
            <InfoItem label="UTM medium" value={lead.utmMedium || "Não informado"} />
            <InfoItem label="UTM campaign" value={lead.utmCampaign || "Não informado"} />
            <InfoItem label="UTM term" value={lead.utmTerm || "Não informado"} />
            <InfoItem label="UTM content" value={lead.utmContent || "Não informado"} />
            <InfoItem label="Google Click ID" value={lead.gclid || "Não informado"} />
            <InfoItem label="Facebook Click ID" value={lead.fbclid || "Não informado"} />
            <InfoItem label="Página de entrada" value={<ExternalValue value={lead.landingPage} />} />
            <InfoItem label="Referência" value={<ExternalValue value={lead.referrer} />} />
          </CardContent>
        </Card>
      ) : null}

      {hasPrivacyConsent(lead) ? (
        <Card>
          <CardHeader>
            <CardTitle>Consentimentos</CardTitle>
            <CardDescription>
              Registros vinculados à entrada do lead pelo site.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <InfoItem
              icon={ShieldCheck}
              label="Ciência da privacidade"
              value={
                lead.privacyNoticeAcceptedAt
                  ? formatDateTime(lead.privacyNoticeAcceptedAt)
                  : "Não registrada"
              }
            />
            <InfoItem
              label="Versão da política"
              value={lead.privacyPolicyVersion || "Não informada"}
            />
            <InfoItem
              label="Comunicação de marketing"
              value={lead.marketingConsent ? "Autorizada" : "Não autorizada"}
            />
            <InfoItem
              label="Data do consentimento"
              value={lead.marketingConsentAt ? formatDateTime(lead.marketingConsentAt) : "Não registrada"}
            />
          </CardContent>
        </Card>
      ) : null}

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Descrição do caso</CardTitle>
            <CardDescription>Relato inicial registrado para triagem.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextBlock value={lead.description} fallback="Nenhuma descrição registrada." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo interno</CardTitle>
            <CardDescription>Síntese comercial para continuidade do atendimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextBlock value={lead.summary} fallback="Nenhum resumo registrado." />
          </CardContent>
        </Card>
      </section>

      {lead.lostReason ? (
        <Card>
          <CardHeader>
            <CardTitle>Motivo da perda</CardTitle>
            <CardDescription>Registro comercial do encerramento sem conversão.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextBlock value={lead.lostReason} fallback="Motivo não informado." />
          </CardContent>
        </Card>
      ) : null}

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Observações internas</CardTitle>
            <CardDescription>Notas salvas pela equipe durante o atendimento.</CardDescription>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-md border bg-muted/20 p-4">
                    <p className="text-sm leading-6 text-foreground">{note.content}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {note.authorName || "Equipe"} em {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma observação interna"
                description="As observações registradas pela equipe aparecerão aqui para manter o histórico do atendimento."
              />
            )}
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Histórico do lead</CardTitle>
            <CardDescription>Eventos importantes registrados automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
                {events.map((event) => (
                  <div key={event.id} className="rounded-md border bg-muted/20 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {event.description || event.eventType}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.actorName || "Sistema"} em {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum evento registrado"
                description="As alterações importantes do lead aparecerão aqui assim que forem realizadas."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function ExternalValue({ value }: { value: string | null }) {
  if (!value) return "Não informado";

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-1 text-primary underline-offset-4 hover:underline"
    >
      <span className="truncate">{value}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

function hasMarketingAttribution(lead: LeadDetailData["lead"]) {
  return Boolean(
    lead.utmSource ||
      lead.utmMedium ||
      lead.utmCampaign ||
      lead.utmTerm ||
      lead.utmContent ||
      lead.gclid ||
      lead.fbclid ||
      lead.landingPage ||
      lead.referrer,
  );
}

function hasPrivacyConsent(lead: LeadDetailData["lead"]) {
  return Boolean(
    lead.privacyNoticeAcceptedAt ||
      lead.privacyPolicyVersion ||
      lead.marketingConsent ||
      lead.marketingConsentAt,
  );
}

function TextBlock({ fallback, value }: { fallback: string; value: string | null }) {
  return (
    <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
      {value || fallback}
    </p>
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
