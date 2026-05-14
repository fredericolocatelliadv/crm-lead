import { redirect } from "next/navigation";

import { getCustomerIdByLeadId } from "@/features/customers/data/customer-directory";
import { LeadDetailView } from "@/features/leads/components/lead-detail-view";
import { getLeadById } from "@/features/leads/data/lead-directory";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const customerId = await getCustomerIdByLeadId(id);

  if (customerId) {
    redirect(`/crm/clientes/${customerId}`);
  }

  const data = await getLeadById(id);

  return <LeadDetailView data={data} />;
}
