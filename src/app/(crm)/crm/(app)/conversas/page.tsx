import { ConversationInbox } from "@/features/conversations/components/conversation-inbox";
import {
  getConversationInbox,
  parseConversationFilters,
} from "@/features/conversations/data/conversation-directory";

type ConversationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  const params = await searchParams;
  const filters = parseConversationFilters(params);
  const data = await getConversationInbox(filters);

  return <ConversationInbox data={data} />;
}
