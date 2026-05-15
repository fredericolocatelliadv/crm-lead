import { updateCustomer } from "@/features/customers/actions";
import { CustomerForm } from "@/features/customers/components/customer-form";
import {
  customerToFormValues,
  getCustomerById,
} from "@/features/customers/data/customer-directory";
import { getLeadFormOptions } from "@/features/leads/data/lead-directory";
import { getActiveLegalAreaOptions } from "@/features/leads/data/legal-areas";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";
import { Badge } from "@/shared/components/ui/badge";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const access = await getPageAccess("customers:write");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para editar clientes convertidos." />;
  }

  const { id } = await params;
  const [data, leadOptions, legalAreas] = await Promise.all([
    getCustomerById(id),
    getLeadFormOptions(),
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
          Mantenha atualizados os dados de contato e o contexto comercial do cliente convertido.
        </p>
      </section>

      <CustomerForm
        action={updateCustomer.bind(null, id)}
        assignees={leadOptions.assignees}
        customerId={id}
        initialValues={customerToFormValues(data.customer)}
        legalAreas={legalAreas}
      />
    </div>
  );
}
