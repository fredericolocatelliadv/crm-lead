import { updateCustomer } from "@/features/customers/actions";
import { CustomerForm } from "@/features/customers/components/customer-form";
import {
  customerToFormValues,
  getCustomerById,
} from "@/features/customers/data/customer-directory";
import { getActiveLegalAreaOptions } from "@/features/leads/data/legal-areas";
import { Badge } from "@/shared/components/ui/badge";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const [data, legalAreas] = await Promise.all([
    getCustomerById(id),
    getActiveLegalAreaOptions(),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="success" className="mb-3">
          Editar cliente
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {data.customer.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Mantenha atualizados os dados comerciais básicos do cliente convertido.
        </p>
      </section>

      <CustomerForm
        action={updateCustomer.bind(null, id)}
        customerId={id}
        initialValues={customerToFormValues(data.customer)}
        legalAreas={legalAreas}
      />
    </div>
  );
}
