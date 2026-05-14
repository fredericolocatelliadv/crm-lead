import { ReportsView } from "@/features/reports/components/reports-view";
import { resolveReportsPeriod } from "@/features/reports/data/reports-overview";

type ReportsPageProps = {
  searchParams?: Promise<{
    periodo?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const period = resolveReportsPeriod(params?.periodo);

  return <ReportsView period={period} />;
}
