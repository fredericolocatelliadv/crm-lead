import { Plus } from "lucide-react";
import Link from "next/link";

import { LeadListFilters } from "@/features/leads/components/lead-list-filters";
import { LeadListTable } from "@/features/leads/components/lead-list-table";
import { getLeadList, parseLeadFilters } from "@/features/leads/data/lead-directory";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type LeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const filters = parseLeadFilters(params);
  const data = await getLeadList(filters);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Comercial
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Acompanhe contatos comerciais, prioridade, origem, etapa e responsável.
          </p>
        </div>

        <Button asChild>
          <Link href="/crm/leads/novo">
            <Plus className="h-4 w-4" />
            Novo lead
          </Link>
        </Button>
      </section>

      <LeadListFilters
        assignees={data.assignees}
        filters={data.filters}
        legalAreas={data.legalAreas}
        sources={data.sources}
      />

      <LeadListTable leads={data.leads} />
    </div>
  );
}
