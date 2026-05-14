import { CrmShell } from "@/features/dashboard/components/crm-shell";
import { getCurrentProfile } from "@/features/profile/data/current-profile";
import { Toaster } from "@/shared/components/ui/sonner";

export default async function CrmAppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <CrmShell profile={profile}>
      {children}
      <Toaster />
    </CrmShell>
  );
}
