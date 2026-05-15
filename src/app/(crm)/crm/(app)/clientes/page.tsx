import { CustomerListView } from "@/features/customers/components/customer-list-view";
import {
  getCustomerList,
  parseCustomerFilters,
} from "@/features/customers/data/customer-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type CustomersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const access = await getPageAccess("customers:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar clientes convertidos." />;
  }

  const params = await searchParams;
  const filters = parseCustomerFilters(params);
  const data = await getCustomerList(filters);

  return <CustomerListView data={data} />;
}
