import Link from "next/link";
import { CalendarDays, MessageCircle, UserRound } from "lucide-react";

import {
  dashboardPeriodOptions,
  getConversationStatusLabel,
  getDashboardOverview,
  getDashboardPeriodLabel,
  getPriorityLabel,
  getPriorityTone,
  type DashboardPeriod,
} from "@/features/dashboard/data/dashboard-overview";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge, type BadgeProps } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type BadgeTone = NonNullable<BadgeProps["variant"]>;
type SemanticTone = "danger" | "info" | "neutral" | "success" | "warning";

const toneMap: Record<SemanticTone, BadgeTone> = {
  danger: "danger",
  info: "info",
  neutral: "neutral",
  success: "success",
  warning: "warning",
};

const sourceLabels: Record<string, string> = {
  ai: "IA",
  chatbot: "Chatbot",
  form: "Site",
  manual: "Manual",
  site: "Site",
  site_whatsapp: "WhatsApp do site",
  whatsapp: "WhatsApp",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatSource(source: string) {
  return sourceLabels[source] ?? source;
}

export async function CrmDashboard({ period }: { period: DashboardPeriod }) {
  const overview = await getDashboardOverview(period);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Comercial
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Visão comercial do escritório
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Acompanhe entradas, atendimentos, conversões e gargalos do fluxo comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dashboardPeriodOptions.map((option) => {
            const isActive = option.value === period;

            return (
              <Button
                key={option.value}
                asChild
                variant={isActive ? "default" : "outline"}
                size="sm"
              >
                <Link href={option.value === "today" ? "/crm" : `/crm?periodo=${option.value}`}>
                  <CalendarDays className="h-4 w-4" />
                  {option.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {overview.metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </div>
                <div className="rounded-md border bg-muted p-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                <Badge variant={toneMap[metric.tone]} className="mt-4">
                  {metric.badge}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leads recentes</CardTitle>
            <CardDescription>
              Entradas comerciais em {getDashboardPeriodLabel(period).toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.recentLeads.length > 0 ? (
              <div className="divide-y rounded-md border">
                {overview.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                        <Badge variant={toneMap[getPriorityTone(lead.priority)]}>
                          {getPriorityLabel(lead.priority)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lead.legalArea || "Área não informada"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lead.phone || lead.email || "Contato não informado"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Badge variant="neutral">{formatSource(lead.source)}</Badge>
                      {lead.stage ? <Badge variant="outline">{lead.stage}</Badge> : null}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(lead.createdAt)}
                      </span>
                      {lead.conversationId ? (
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Abrir conversa"
                        >
                          <Link
                            href={`/crm/conversas/${lead.conversationId}`}
                            aria-label={`Abrir conversa de ${lead.name}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserRound}
                title="Nenhum lead recente"
                description="Os novos contatos comerciais aparecerão aqui assim que entrarem no período selecionado."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversas que precisam de resposta</CardTitle>
            <CardDescription>
              Atendimentos não respondidos que exigem ação da equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.conversationsNeedingReply.length > 0 ? (
              <div className="divide-y rounded-md border">
                {overview.conversationsNeedingReply.map((conversation) => (
                  <div key={conversation.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {conversation.leadName || "Contato sem nome"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {conversation.leadLegalArea || "Área não informada"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={toneMap[getPriorityTone(conversation.priority)]}>
                          {getPriorityLabel(conversation.priority)}
                        </Badge>
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Abrir conversa"
                        >
                          <Link
                            href={`/crm/conversas/${conversation.id}`}
                            aria-label={`Abrir conversa de ${conversation.leadName || "contato sem nome"}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="danger">{getConversationStatusLabel(conversation.status)}</Badge>
                      <Badge variant="neutral">{formatSource(conversation.channel)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(conversation.lastMessageAt ?? conversation.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Nenhuma conversa pendente"
                description="Conversas não respondidas aparecerão aqui para a equipe priorizar o atendimento."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline operacional</CardTitle>
            <CardDescription>
              Oportunidades abertas por etapa, sem clientes convertidos ou leads perdidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
            {overview.pipeline.map((stage) => (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-md border bg-muted/20 p-3",
                  stage.value > 0 ? "border-primary/30" : null,
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{stage.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage.value === 1
                      ? "1 oportunidade nesta etapa"
                      : `${stage.value} oportunidades nesta etapa`}
                  </p>
                </div>
                <Badge variant={toneMap[stage.tone]}>{stage.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atendimentos prioritários</CardTitle>
            <CardDescription>
              Casos que precisam de atenção imediata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.conversationsNeedingReply.length > 0 ? (
              <div className="space-y-3">
                {overview.conversationsNeedingReply.slice(0, 3).map((conversation) => (
                  <div key={conversation.id} className="rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {conversation.leadName || "Contato sem nome"}
                      </p>
                      <Badge variant={toneMap[getPriorityTone(conversation.priority)]}>
                        {getPriorityLabel(conversation.priority)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {getConversationStatusLabel(conversation.status)} desde{" "}
                      {formatDateTime(conversation.lastMessageAt ?? conversation.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum atendimento prioritário"
                description="Casos urgentes, conversas pendentes e retornos atrasados aparecerão aqui para ação rápida."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
