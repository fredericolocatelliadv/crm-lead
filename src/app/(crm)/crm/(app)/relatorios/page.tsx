import { ReportsView } from "@/features/reports/components/reports-view";
import {
  parseReportsFilters,
  resolveReportsPeriod,
} from "@/features/reports/data/reports-overview";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type ReportsPageProps = {
  searchParams?: Promise<{
    area?: string;
    campanha?: string;
    etapa?: string;
    origem?: string;
    periodo?: string;
    prioridade?: string;
    responsavel?: string;
    status?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const access = await getPageAccess("reports:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar relatórios." />;
  }

  const params = await searchParams;
  const period = resolveReportsPeriod(params?.periodo);
  const filters = parseReportsFilters(params);

  return <ReportsView filters={filters} period={period} />;
}
