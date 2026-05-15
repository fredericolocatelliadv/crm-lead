import { createLead } from "@/features/leads/actions";
import { LeadForm } from "@/features/leads/components/lead-form";
import { getActiveLegalAreaOptions } from "@/features/leads/data/legal-areas";
import { getLeadFormOptions } from "@/features/leads/data/lead-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";
import { Badge } from "@/shared/components/ui/badge";

export default async function NewLeadPage() {
  const access = await getPageAccess("leads:write");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para cadastrar leads." />;
  }

  const [{ assignees, stages }, legalAreas] = await Promise.all([
    getLeadFormOptions(),
    getActiveLegalAreaOptions(),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Novo lead
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Cadastrar lead
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Registre um contato comercial recebido fora das automações.
        </p>
      </section>

      <LeadForm
        action={createLead}
        assignees={assignees}
        legalAreas={legalAreas}
        mode="create"
        stages={stages}
      />
    </div>
  );
}
