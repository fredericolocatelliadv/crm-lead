import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import type { CustomerListItem } from "@/features/customers/data/customer-directory";
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

type CustomerListTableProps = {
  customers: CustomerListItem[];
};

export function CustomerListTable({ customers }: CustomerListTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes convertidos</CardTitle>
        <CardDescription>
          Leads que fecharam contrato e permanecem com histórico comercial preservado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Conversão</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="min-w-64">
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {customer.phone || customer.email || "Contato não informado"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {customer.legalArea || "Não informada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.convertedAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.convertedByName || "Não informado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/crm/clientes/${customer.id}`}>
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
            icon={Building2}
            title="Nenhum cliente convertido encontrado"
            description="Quando um lead for convertido em cliente, ele aparecerá nesta lista com o histórico comercial preservado."
          />
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
