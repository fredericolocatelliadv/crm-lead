import Link from "next/link";
import type { ReactNode } from "react";

import { leadPriorities, priorityLabels } from "@/features/leads/types/lead";
import type { PipelineFilters, PipelineOption } from "@/features/pipeline/types/pipeline";
import { Button } from "@/shared/components/ui/button";

type PipelineFiltersProps = {
  assignees: PipelineOption[];
  filters: PipelineFilters;
  legalAreas: string[];
};

export function PipelineFilters({
  assignees,
  filters,
  legalAreas,
}: PipelineFiltersProps) {
  return (
    <form action="/crm/pipeline" className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-3 xl:grid-cols-5">
      <FilterSelect label="Prioridade" name="prioridade" defaultValue={filters.priority}>
        <option value="all">Todas</option>
        {leadPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priorityLabels[priority]}
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

      <div className="flex items-end gap-2 md:col-span-3 xl:col-span-2">
        <Button type="submit">Filtrar pipeline</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/pipeline">Limpar filtros</Link>
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
