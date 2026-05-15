import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Filter,
  MessageCircle,
  Target,
} from "lucide-react";

import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "@/features/leads/components/lead-badges";
import {
  getSourceLabel,
  leadPriorities,
  priorityLabels,
  statusLabels,
} from "@/features/leads/types/lead";
import { ReportsExportButton } from "@/features/reports/components/reports-export-button";
import { ReportsFilterActions } from "@/features/reports/components/reports-filter-actions";
import {
  buildReportsHref,
  getReportsOverview,
  getReportsPeriodLabel,
  reportsPeriodOptions,
  type ReportBreakdownItem,
  type ReportLeadItem,
  type ReportMetric,
  type ReportPerformanceItem,
  type ReportsFilters,
  type ReportsOptions,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

type BadgeTone = NonNullable<BadgeProps["variant"]>;

const toneMap: Record<ReportMetric["tone"], BadgeTone> = {
  danger: "danger",
  info: "info",
  neutral: "neutral",
  success: "success",
  warning: "warning",
};

export async function ReportsView({
  filters,
  period,
}: {
  filters: ReportsFilters;
  period: ReportsPeriod;
}) {
  const overview = await getReportsOverview(period, filters);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Relatórios
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Relatórios comerciais de leads
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Analise entradas, campanhas, áreas jurídicas, funil e status dos leads em {getReportsPeriodLabel(period)}.
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
                <Link href={buildReportsHref(option.value, filters)}>
                  <CalendarDays className="h-4 w-4" />
                  {option.label}
                </Link>
              </Button>
            );
          })}
          <ReportsExportButton data={overview} />
        </div>
      </section>

      <ReportFilters
        filters={overview.filters}
        options={overview.options}
        period={period}
      />

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="campanhas">Origem e campanhas</TabsTrigger>
          <TabsTrigger value="areas">Áreas jurídicas</TabsTrigger>
          <TabsTrigger value="funil">Funil do lead</TabsTrigger>
          <TabsTrigger value="lista">Lista analítica</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-6">
          <SummaryTab
            metrics={overview.metrics}
            statusBreakdown={overview.statusBreakdown}
            timeline={overview.timeline}
          />
        </TabsContent>

        <TabsContent value="campanhas" className="mt-6">
          <CampaignTab
            campaignPerformance={overview.campaignPerformance}
            contentPerformance={overview.contentPerformance}
            sourcePerformance={overview.sourcePerformance}
            utmSourcePerformance={overview.utmSourcePerformance}
          />
        </TabsContent>

        <TabsContent value="areas" className="mt-6">
          <AreasTab areaPerformance={overview.areaPerformance} />
        </TabsContent>

        <TabsContent value="funil" className="mt-6">
          <FunnelTab
            lostReasons={overview.lostReasons}
            pipeline={overview.pipeline}
            statusBreakdown={overview.statusBreakdown}
          />
        </TabsContent>

        <TabsContent value="lista" className="mt-6">
          <AnalyticalListTab leads={overview.leads} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportFilters({
  filters,
  options,
  period,
}: {
  filters: ReportsFilters;
  options: ReportsOptions;
  period: ReportsPeriod;
}) {
  return (
    <form action="/crm/relatorios" className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-2 xl:grid-cols-8">
      <div className="flex items-center gap-2 md:col-span-2 xl:col-span-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <Filter className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Filtros do relatório</p>
          <p className="text-xs text-muted-foreground">Os filtros abaixo afetam todas as abas.</p>
        </div>
      </div>

      <FilterSelect label="Período" name="periodo" defaultValue={period}>
        {reportsPeriodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Origem" name="origem" defaultValue={filters.source}>
        <option value="all">Todas</option>
        {options.sources.map((source) => (
          <option key={source} value={source}>
            {getSourceLabel(source)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Campanha" name="campanha" defaultValue={filters.campaign}>
        <option value="all">Todas</option>
        {options.campaigns.map((campaign) => (
          <option key={campaign} value={campaign}>
            {campaign}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Área jurídica" name="area" defaultValue={filters.legalArea}>
        <option value="all">Todas</option>
        {options.legalAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Status" name="status" defaultValue={filters.status}>
        <option value="all">Todos</option>
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Prioridade" name="prioridade" defaultValue={filters.priority}>
        <option value="all">Todas</option>
        {leadPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priorityLabels[priority]}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Etapa" name="etapa" defaultValue={filters.stageId}>
        <option value="all">Todas</option>
        {options.stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Responsável" name="responsavel" defaultValue={filters.assigneeId}>
        <option value="all">Todos</option>
        {options.assignees.map((assignee) => (
          <option key={assignee.id} value={assignee.id}>
            {assignee.label}
          </option>
        ))}
      </FilterSelect>

      <ReportsFilterActions />
    </form>
  );
}

function SummaryTab({
  metrics,
  statusBreakdown,
  timeline,
}: {
  metrics: ReportMetric[];
  statusBreakdown: ReportBreakdownItem[];
  timeline: ReportBreakdownItem[];
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.slice(0, 8).map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de leads</CardTitle>
            <CardDescription>Entradas comerciais por dia dentro do período filtrado.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart data={timeline} />
          </CardContent>
        </Card>

        <BreakdownCard
          data={statusBreakdown}
          description="Distribuição atual dos leads filtrados."
          title="Status dos leads"
        />
      </section>
    </div>
  );
}

function CampaignTab({
  campaignPerformance,
  contentPerformance,
  sourcePerformance,
  utmSourcePerformance,
}: {
  campaignPerformance: ReportPerformanceItem[];
  contentPerformance: ReportBreakdownItem[];
  sourcePerformance: ReportPerformanceItem[];
  utmSourcePerformance: ReportPerformanceItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <PerformanceCard
        data={sourcePerformance}
        description="Origem operacional registrada no lead."
        title="Leads por origem"
      />
      <PerformanceCard
        data={utmSourcePerformance}
        description="Canais UTM informados nos links das campanhas."
        title="Leads por canal UTM"
      />
      <PerformanceCard
        data={campaignPerformance}
        description="Campanhas que mais trouxeram leads e conversões."
        title="Performance por campanha"
      />
      <BreakdownCard
        data={contentPerformance}
        description="Variações de criativo/anúncio informadas em utm_content."
        title="Criativos e anúncios"
      />
    </div>
  );
}

function AreasTab({ areaPerformance }: { areaPerformance: ReportPerformanceItem[] }) {
  return (
    <PerformanceCard
      data={areaPerformance}
      description="Volume, conversões e perdas por área jurídica."
      title="Performance por área jurídica"
    />
  );
}

function FunnelTab({
  lostReasons,
  pipeline,
  statusBreakdown,
}: {
  lostReasons: ReportBreakdownItem[];
  pipeline: ReportBreakdownItem[];
  statusBreakdown: ReportBreakdownItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <BreakdownCard
        data={pipeline}
        description="Leads abertos distribuídos pelas etapas comerciais."
        title="Leads abertos por etapa"
      />
      <BreakdownCard
        data={statusBreakdown}
        description="Leads abertos, convertidos e perdidos."
        title="Situação do funil"
      />
      <BreakdownCard
        data={lostReasons}
        description="Principais motivos registrados nos leads perdidos."
        title="Motivos de perda"
      />
    </div>
  );
}

function AnalyticalListTab({ leads }: { leads: ReportLeadItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista analítica de leads</CardTitle>
        <CardDescription>
          Leads compatíveis com os filtros, com origem, campanha, etapa e acesso rápido ao registro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="min-w-64">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lead.contact || "Contato não informado"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Entrada em {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <LeadStatusBadge status={lead.status} />
                      <LeadPriorityBadge priority={lead.priority} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <LeadSourceBadge source={lead.source} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.campaign || "Sem campanha"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.legalArea || "Não informada"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.stageName || "Sem etapa"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assigneeName || "Sem responsável"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {lead.conversationId ? (
                        <Button asChild variant="outline" size="icon" title="Abrir conversa">
                          <Link href={`/crm/conversas/${lead.conversationId}`} aria-label={`Abrir conversa de ${lead.name}`}>
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/crm/leads/${lead.id}`}>
                          Abrir
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nenhum lead encontrado"
            description="Ajuste os filtros para visualizar os leads do relatório."
          />
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric }: { metric: ReportMetric }) {
  return (
    <Card>
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
  );
}

function PerformanceCard({
  data,
  description,
  title,
}: {
  data: ReportPerformanceItem[];
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
          <PerformanceTable data={data} />
        ) : (
          <EmptyState
            icon={Target}
            title="Nenhum dado no filtro"
            description="As informações aparecerão quando houver leads compatíveis com o período e filtros selecionados."
          />
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceTable({ data }: { data: ReportPerformanceItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grupo</TableHead>
          <TableHead>Leads</TableHead>
          <TableHead>Convertidos</TableHead>
          <TableHead>Perdidos</TableHead>
          <TableHead>Abertos</TableHead>
          <TableHead>Conversão</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.label}>
            <TableCell className="font-medium text-foreground">{item.label}</TableCell>
            <TableCell>{item.leads}</TableCell>
            <TableCell>
              <Badge variant="success">{item.converted}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="danger">{item.lost}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="neutral">{item.open}</Badge>
            </TableCell>
            <TableCell className="font-medium">{item.conversionRate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
            title="Nenhum dado no filtro"
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

function FilterSelect({
  children,
  defaultValue,
  label,
  name,
}: {
  children: ReactNode;
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? "all"}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
