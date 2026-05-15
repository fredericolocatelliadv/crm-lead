"use client";

import { Download } from "lucide-react";

import { statusLabels } from "@/features/leads/types/lead";
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
        link.download = `relatorio-leads-${data.period}.csv`;
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
    ...data.sourcePerformance.map((item) => [
      "Origem",
      item.label,
      `${item.leads} leads / ${item.converted} convertidos / ${item.conversionRate}`,
    ]),
    ...data.utmSourcePerformance.map((item) => [
      "Canal UTM",
      item.label,
      `${item.leads} leads / ${item.converted} convertidos / ${item.conversionRate}`,
    ]),
    ...data.campaignPerformance.map((item) => [
      "Campanha",
      item.label,
      `${item.leads} leads / ${item.converted} convertidos / ${item.conversionRate}`,
    ]),
    ...data.areaPerformance.map((item) => [
      "Área jurídica",
      item.label,
      `${item.leads} leads / ${item.converted} convertidos / ${item.conversionRate}`,
    ]),
    ...data.pipeline.map((item) => ["Funil", item.label, String(item.value)]),
    ...data.leads.map((lead) => [
      "Lead",
      lead.name,
      [
        `status: ${statusLabels[lead.status]}`,
        `origem: ${lead.source || "não informada"}`,
        `campanha: ${lead.campaign || "sem campanha"}`,
        `área: ${lead.legalArea || "não informada"}`,
        `etapa: ${lead.stageName || "sem etapa"}`,
        `responsável: ${lead.assigneeName || "sem responsável"}`,
      ].join(" | "),
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
