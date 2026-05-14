import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Inbox, Mail, MessageCircle, Phone, UserRound } from "lucide-react";

import { LeadPriorityBadge, LeadSourceBadge } from "@/features/leads/components/lead-badges";
import { MoveLeadDialog } from "@/features/pipeline/components/move-lead-dialog";
import type { PipelineColumn, PipelineLeadCard } from "@/features/pipeline/types/pipeline";
import type { PipelineBoardData } from "@/features/pipeline/data/pipeline-board";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type PipelineBoardProps = {
  data: PipelineBoardData;
};

export function PipelineBoard({ data }: PipelineBoardProps) {
  const totalLeads = data.columns.reduce((total, column) => total + column.leads.length, 0);

  if (totalLeads === 0) {
    return (
      <section className="rounded-md border border-dashed bg-muted/20 p-10 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <Inbox className="h-5 w-5" />
        </div>
        <p className="font-medium text-foreground">Nenhum lead em andamento</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Leads convertidos ficam em Clientes. Leads perdidos ficam no histórico comercial encerrado.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-x-auto pb-3">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${data.columns.length}, minmax(220px, 1fr))`,
          minWidth: `${Math.max(data.columns.length, 1) * 250}px`,
        }}
      >
        {data.columns.map((column) => (
          <PipelineColumnView key={column.id} column={column} stages={data.stages} />
        ))}
      </div>

      {totalLeads === 0 ? (
        <div className="mt-4 rounded-md border border-dashed bg-muted/20 p-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md border bg-background text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="font-medium text-foreground">Nenhum lead no pipeline</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Os leads aparecerão nas etapas comerciais assim que forem cadastrados ou capturados pelo site.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PipelineColumnView({
  column,
  stages,
}: {
  column: PipelineColumn;
  stages: PipelineBoardData["stages"];
}) {
  return (
    <div className="flex min-h-[520px] flex-col rounded-md border bg-card">
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{column.name}</h2>
          <Badge variant={column.isWon ? "success" : column.isLost ? "danger" : "neutral"}>
            {column.leads.length}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {column.leads.length > 0 ? (
          column.leads.map((lead) => (
            <PipelineLeadCardView key={lead.id} lead={lead} stages={stages} />
          ))
        ) : (
          <div className="flex min-h-32 flex-1 items-center justify-center rounded-md border border-dashed bg-muted/10 p-4 text-center text-sm text-muted-foreground">
            Sem leads nesta etapa.
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineLeadCardView({
  lead,
  stages,
}: {
  lead: PipelineLeadCard;
  stages: PipelineBoardData["stages"];
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div>
          <Link
            href={`/crm/leads/${lead.id}`}
            className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
          >
            {lead.name}
          </Link>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {lead.legalArea || "Área jurídica não informada"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <LeadPriorityBadge priority={lead.priority} />
          <LeadSourceBadge source={lead.source} />
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <InfoLine icon={Phone} value={lead.phone || "Telefone não informado"} />
          {lead.email ? <InfoLine icon={Mail} value={lead.email} /> : null}
          <InfoLine icon={UserRound} value={lead.assigneeName || "Sem responsável"} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/crm/leads/${lead.id}`}>
              Abrir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {lead.conversationId ? (
              <Button asChild variant="outline" size="icon" title="Abrir conversa">
                <Link href={`/crm/conversas/${lead.conversationId}`} aria-label="Abrir conversa">
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <MoveLeadDialog
              currentStageId={lead.stageId}
              leadId={lead.id}
              leadName={lead.name}
              stages={stages}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoLine({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}
