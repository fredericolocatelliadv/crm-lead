import { WhatsAppConnectionView } from "@/features/whatsapp/components/whatsapp-connection-view";
import { getWhatsAppConnectionData } from "@/features/whatsapp/data/connection";
import { hasPermission } from "@/server/auth/permissions";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

export default async function WhatsAppPage() {
  const access = await getPageAccess("whatsapp:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acompanhar o canal de WhatsApp." />;
  }

  const data = await getWhatsAppConnectionData();

  return <WhatsAppConnectionView canManage={hasPermission(access.role, "whatsapp:manage")} data={data} />;
}
