import { Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { LeadFilters, LeadOption } from "@/features/leads/types/lead";
import {
  leadPriorities,
  priorityLabels,
  statusLabels,
  sourceLabels,
} from "@/features/leads/types/lead";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type LeadListFiltersProps = {
  assignees: LeadOption[];
  filters: LeadFilters;
  legalAreas: string[];
  sources: string[];
};

export function LeadListFilters({
  assignees,
  filters,
  legalAreas,
  sources,
}: LeadListFiltersProps) {
  return (
    <form action="/crm/leads" className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-2 xl:grid-cols-6">
      <div className="md:col-span-2 xl:col-span-2">
        <label htmlFor="lead-search" className="mb-2 block text-sm font-medium">
          Buscar
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="lead-search"
            name="busca"
            placeholder="Nome, telefone ou e-mail"
            defaultValue={filters.query}
            className="pl-9"
          />
        </div>
      </div>

      <FilterSelect label="Status" name="status" defaultValue={filters.status}>
        <option value="all">Todos</option>
        {(["open", "lost"] as const).map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
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

      <FilterSelect label="Origem" name="origem" defaultValue={filters.source}>
        <option value="all">Todas</option>
        {sources.map((source) => (
          <option key={source} value={source}>
            {sourceLabels[source] ?? source}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Área jurídica" name="area" defaultValue={filters.legalArea}>
        <option value="all">Todas</option>
        {legalAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Responsável" name="responsavel" defaultValue={filters.assigneeId}>
        <option value="all">Todos</option>
        {assignees.map((assignee) => (
          <option key={assignee.id} value={assignee.id}>
            {assignee.label}
          </option>
        ))}
      </FilterSelect>

      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
        <Button type="submit">Filtrar leads</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/leads">Limpar filtros</Link>
        </Button>
      </div>
    </form>
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
