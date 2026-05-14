import { AiAssistantSettingsView } from "@/features/ai-assistant/components/ai-settings-view";
import { getAiAssistantManagementData } from "@/features/ai-assistant/data/ai-settings";

export default async function AiAssistantPage() {
  const settings = await getAiAssistantManagementData();

  return <AiAssistantSettingsView settings={settings} />;
}
