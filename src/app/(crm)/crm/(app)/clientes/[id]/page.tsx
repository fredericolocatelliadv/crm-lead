import { CustomerDetailView } from "@/features/customers/components/customer-detail-view";
import { getCustomerById } from "@/features/customers/data/customer-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const access = await getPageAccess("customers:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar clientes convertidos." />;
  }

  const { id } = await params;
  const data = await getCustomerById(id);

  return <CustomerDetailView data={data} />;
}
