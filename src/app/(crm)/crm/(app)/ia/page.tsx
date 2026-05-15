import { AiAssistantSettingsView } from "@/features/ai-assistant/components/ai-settings-view";
import { getAiAssistantManagementData } from "@/features/ai-assistant/data/ai-settings";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

export default async function AiAssistantPage() {
  const access = await getPageAccess("ai:manage");

  if (!access.allowed) {
    return <AccessDenied description="A configuração da assistente virtual é restrita ao administrador." />;
  }

  const settings = await getAiAssistantManagementData();

  return <AiAssistantSettingsView settings={settings} />;
}
