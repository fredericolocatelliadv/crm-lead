import { ConversationInbox } from "@/features/conversations/components/conversation-inbox";
import {
  getConversationInbox,
  parseConversationFilters,
} from "@/features/conversations/data/conversation-directory";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type ConversationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  const access = await getPageAccess("conversations:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar conversas." />;
  }

  const params = await searchParams;
  const filters = parseConversationFilters(params);
  const data = await getConversationInbox(filters);

  return <ConversationInbox data={data} />;
}
