import Link from "next/link";
import { BarChart3, CalendarDays } from "lucide-react";

import { ReportsExportButton } from "@/features/reports/components/reports-export-button";
import {
  getReportsOverview,
  getReportsPeriodLabel,
  reportsPeriodOptions,
  type ReportBreakdownItem,
  type ReportsPeriod,
} from "@/features/reports/data/reports-overview";
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

type BadgeTone = NonNullable<BadgeProps["variant"]>;

const toneMap: Record<string, BadgeTone> = {
  danger: "danger",
  info: "info",
  neutral: "neutral",
  success: "success",
  warning: "warning",
};

export async function ReportsView({ period }: { period: ReportsPeriod }) {
  const overview = await getReportsOverview(period);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Relatórios
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Visão gerencial da operação
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Acompanhe captação, atendimento e conversão nos {getReportsPeriodLabel(period)}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reportsPeriodOptions.map((option) => {
            const isActive = option.value === period;

            return (
              <Button
                key={option.value}
                asChild
                variant={isActive ? "default" : "outline"}
                size="sm"
              >
                <Link href={`/crm/relatorios?periodo=${option.value}`}>
                  <CalendarDays className="h-4 w-4" />
                  {option.label}
                </Link>
              </Button>
            );
          })}
          <ReportsExportButton data={overview} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </div>
              <Badge variant={toneMap[metric.tone]}>{metric.label}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por período</CardTitle>
            <CardDescription>Evolução diária de novos contatos comerciais.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart data={overview.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por responsável</CardTitle>
            <CardDescription>Volume de leads e conversas por usuário interno.</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.responsible.length > 0 ? (
              <div className="divide-y rounded-md border">
                {overview.responsible.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="font-medium text-foreground">{item.label}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">{item.leads} leads</Badge>
                      <Badge variant="neutral">{item.conversations} atendimentos</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum atendimento no período"
                description="Os atendimentos por responsável aparecerão quando houver leads ou conversas atribuídas."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BreakdownCard title="Leads por origem" description="Canais de entrada dos leads." data={overview.sources} />
        <BreakdownCard
          title="Leads por área jurídica"
          description="Distribuição dos contatos por área de atuação."
          data={overview.legalAreas}
        />
      </section>
    </div>
  );
}

function BreakdownCard({
  data,
  description,
  title,
}: {
  data: ReportBreakdownItem[];
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <BarList data={data} />
        ) : (
          <EmptyState
            title="Nenhum dado no período"
            description="As informações aparecerão quando houver leads compatíveis com o filtro."
          />
        )}
      </CardContent>
    </Card>
  );
}

function BarList({ data }: { data: ReportBreakdownItem[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-foreground">{item.label}</span>
            <Badge variant="neutral">{item.value}</Badge>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineChart({ data }: { data: ReportBreakdownItem[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const hasData = data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Nenhum lead no período"
        description="A evolução diária aparecerá quando houver novas entradas comerciais."
      />
    );
  }

  return (
    <div className="flex h-64 items-end gap-1 overflow-x-auto rounded-md border p-4">
      {data.map((item) => (
        <div key={item.label} className="flex min-w-8 flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-primary"
            style={{ height: `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%` }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
