import { WhatsAppConnectionView } from "@/features/whatsapp/components/whatsapp-connection-view";
import { getWhatsAppConnectionData } from "@/features/whatsapp/data/connection";

export default async function WhatsAppPage() {
  const data = await getWhatsAppConnectionData();

  return <WhatsAppConnectionView data={data} />;
}
