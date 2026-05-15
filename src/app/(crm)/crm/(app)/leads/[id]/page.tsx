import { redirect } from "next/navigation";

import { getCustomerIdByLeadId } from "@/features/customers/data/customer-directory";
import { LeadDetailView } from "@/features/leads/components/lead-detail-view";
import { getLeadById } from "@/features/leads/data/lead-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const access = await getPageAccess("leads:write");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil pode analisar a lista de leads, mas não possui permissão para abrir o atendimento completo." />;
  }

  const { id } = await params;
  const customerId = await getCustomerIdByLeadId(id);

  if (customerId) {
    redirect(`/crm/clientes/${customerId}`);
  }

  const data = await getLeadById(id);

  return <LeadDetailView data={data} />;
}
