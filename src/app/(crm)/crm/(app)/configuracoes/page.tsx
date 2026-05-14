import { SiteManagementView } from "@/features/settings/components/site-management-view";
import { getSiteManagementData } from "@/features/settings/data/site-management";

export default async function SettingsPage() {
  const data = await getSiteManagementData();

  return <SiteManagementView data={data} />;
}
