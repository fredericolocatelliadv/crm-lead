import { CrmDashboard } from "@/features/dashboard/components/crm-dashboard";
import { resolveDashboardPeriod } from "@/features/dashboard/data/dashboard-overview";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type CrmPageProps = {
  searchParams?: Promise<{
    periodo?: string;
  }>;
};

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const access = await getPageAccess("crm:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu usuário não está ativo para acessar o CRM." />;
  }

  const params = await searchParams;
  const period = resolveDashboardPeriod(params?.periodo);

  return <CrmDashboard period={period} />;
}
