import { CustomerListView } from "@/features/customers/components/customer-list-view";
import {
  getCustomerList,
  parseCustomerFilters,
} from "@/features/customers/data/customer-directory";

type CustomersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const filters = parseCustomerFilters(params);
  const data = await getCustomerList(filters);

  return <CustomerListView data={data} />;
}
