"use client";

import { Download } from "lucide-react";

import type { ReportsOverview } from "@/features/reports/data/reports-overview";
import { Button } from "@/shared/components/ui/button";

export function ReportsExportButton({ data }: { data: ReportsOverview }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        const csv = buildCsv(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `relatorios-crm-${data.period}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}

function buildCsv(data: ReportsOverview) {
  const rows = [
    ["Seção", "Indicador", "Valor"],
    ...data.metrics.map((metric) => ["Resumo", metric.label, metric.value]),
    ...data.sources.map((item) => ["Origem", item.label, String(item.value)]),
    ...data.legalAreas.map((item) => ["Área jurídica", item.label, String(item.value)]),
    ...data.responsible.map((item) => [
      "Responsável",
      item.label,
      `${item.leads} leads / ${item.conversations} atendimentos`,
    ]),
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}
