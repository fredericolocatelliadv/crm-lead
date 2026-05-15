import { ConversationInbox } from "@/features/conversations/components/conversation-inbox";
import {
  getConversationInbox,
  parseConversationFilters,
} from "@/features/conversations/data/conversation-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type ConversationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConversationDetailPage({
  params,
  searchParams,
}: ConversationDetailPageProps) {
  const access = await getPageAccess("conversations:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar conversas." />;
  }

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const filters = parseConversationFilters(query);
  const data = await getConversationInbox(filters, id);

  return <ConversationInbox data={data} />;
}
