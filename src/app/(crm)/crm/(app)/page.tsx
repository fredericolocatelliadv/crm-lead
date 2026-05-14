import { CrmDashboard } from "@/features/dashboard/components/crm-dashboard";
import { resolveDashboardPeriod } from "@/features/dashboard/data/dashboard-overview";

type CrmPageProps = {
  searchParams?: Promise<{
    periodo?: string;
  }>;
};

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const period = resolveDashboardPeriod(params?.periodo);

  return <CrmDashboard period={period} />;
}
