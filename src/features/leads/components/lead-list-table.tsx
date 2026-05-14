import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "@/features/leads/components/lead-badges";
import type { LeadListItem } from "@/features/leads/data/lead-directory";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type LeadListTableProps = {
  leads: LeadListItem[];
};

export function LeadListTable({ leads }: LeadListTableProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Contatos comerciais em acompanhamento no escritório.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Origem</TableHead>
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
                        {lead.phone || lead.email || "Contato não informado"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lead.legalArea || "Área jurídica não informada"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <LeadPriorityBadge priority={lead.priority} />
                  </TableCell>
                  <TableCell>
                    <LeadSourceBadge source={lead.source} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.stageName || "Sem etapa"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assigneeName || "Sem responsável"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/crm/leads/${lead.id}`}>
                        Abrir
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nenhum lead encontrado"
            description="Quando houver contatos comerciais compatíveis com os filtros, eles aparecerão nesta lista."
          />
        )}
      </CardContent>
    </Card>
  );
}
