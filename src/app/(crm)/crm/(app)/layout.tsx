import { CrmShell } from "@/features/dashboard/components/crm-shell";
import { Toaster } from "@/shared/components/ui/sonner";

export default function CrmAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmShell>
      {children}
      <Toaster />
    </CrmShell>
  );
}
