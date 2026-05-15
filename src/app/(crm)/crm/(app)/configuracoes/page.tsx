import { SiteManagementView } from "@/features/settings/components/site-management-view";
import {
  getMarketingSettingsData,
  getSiteManagementData,
} from "@/features/settings/data/site-management";
import { hasPermission } from "@/server/auth/permissions";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

export default async function SettingsPage() {
  const access = await getPageAccess(["settings:manage", "marketing:manage"]);

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para alterar configurações do sistema." />;
  }

  const data = hasPermission(access.role, "settings:manage")
    ? await getSiteManagementData()
    : await getMarketingSettingsData();

  return <SiteManagementView data={data} role={access.role} />;
}
