import { redirect } from "next/navigation";

import { getCustomerIdByLeadId } from "@/features/customers/data/customer-directory";
import { updateLead } from "@/features/leads/actions";
import { LeadForm } from "@/features/leads/components/lead-form";
import { getActiveLegalAreaOptions } from "@/features/leads/data/legal-areas";
import { getLeadById, leadToFormValues } from "@/features/leads/data/lead-directory";
import { Badge } from "@/shared/components/ui/badge";

type EditLeadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  const customerId = await getCustomerIdByLeadId(id);

  if (customerId) {
    redirect(`/crm/clientes/${customerId}/editar`);
  }

  const [data, legalAreas] = await Promise.all([
    getLeadById(id),
    getActiveLegalAreaOptions(),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Editar lead
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {data.lead.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Atualize os dados comerciais e mantenha o histórico do atendimento.
        </p>
      </section>

      <LeadForm
        action={updateLead.bind(null, id)}
        assignees={data.assignees}
        initialValues={leadToFormValues(data.lead)}
        legalAreas={legalAreas}
        mode="edit"
        stages={data.stages}
      />
    </div>
  );
}
