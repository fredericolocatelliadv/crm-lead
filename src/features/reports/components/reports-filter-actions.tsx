"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";

const clearedFilterValues = {
  area: "all",
  campanha: "all",
  etapa: "all",
  origem: "all",
  periodo: "30d",
  prioridade: "all",
  responsavel: "all",
  status: "all",
} as const;

function updateFormField(form: HTMLFormElement, name: keyof typeof clearedFilterValues) {
  const field = form.elements.namedItem(name);

  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
    field.value = clearedFilterValues[name];
  }
}

export function ReportsFilterActions() {
  const router = useRouter();

  function handleClearFilters(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    if (form) {
      Object.keys(clearedFilterValues).forEach((name) => {
        updateFormField(form, name as keyof typeof clearedFilterValues);
      });
    }

    router.replace("/crm/relatorios");
    router.refresh();
  }

  return (
    <div className="flex items-end gap-2 md:col-span-2 xl:col-span-8">
      <Button type="submit">Aplicar filtros</Button>
      <Button type="button" variant="outline" onClick={handleClearFilters}>
        Limpar filtros
      </Button>
    </div>
  );
}
