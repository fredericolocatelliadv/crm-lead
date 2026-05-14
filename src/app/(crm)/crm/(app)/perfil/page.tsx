import { UserRound } from "lucide-react";

import { ProfileForm } from "@/features/profile/components/profile-form";
import { getCurrentProfile } from "@/features/profile/data/current-profile";
import { Badge } from "@/shared/components/ui/badge";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Perfil
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Meu perfil
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Alimente seus dados de identificação para que o CRM mostre corretamente quem
            realizou atendimentos, notas e ações comerciais.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
          <UserRound className="h-4 w-4 text-primary" />
          Dados do usuário logado
        </div>
      </section>

      <ProfileForm profile={profile} />
    </div>
  );
}
