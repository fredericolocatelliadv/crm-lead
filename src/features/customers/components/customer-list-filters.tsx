import { Search } from "lucide-react";
import Link from "next/link";

import type { CustomerFilters } from "@/features/customers/data/customer-directory";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type CustomerListFiltersProps = {
  filters: CustomerFilters;
};

export function CustomerListFilters({ filters }: CustomerListFiltersProps) {
  return (
    <form
      action="/crm/clientes"
      className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div>
        <label htmlFor="customer-search" className="mb-2 block text-sm font-medium">
          Buscar
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-search"
            name="busca"
            placeholder="Nome, telefone, e-mail ou área"
            defaultValue={filters.query}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit">Filtrar clientes</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/clientes">Limpar filtros</Link>
        </Button>
      </div>
    </form>
  );
}
