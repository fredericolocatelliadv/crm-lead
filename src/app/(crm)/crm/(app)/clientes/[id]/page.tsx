import { CustomerDetailView } from "@/features/customers/components/customer-detail-view";
import { getCustomerById } from "@/features/customers/data/customer-directory";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const data = await getCustomerById(id);

  return <CustomerDetailView data={data} />;
}
