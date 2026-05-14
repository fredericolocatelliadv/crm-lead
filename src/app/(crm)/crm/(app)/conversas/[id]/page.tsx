import { ConversationInbox } from "@/features/conversations/components/conversation-inbox";
import {
  getConversationInbox,
  parseConversationFilters,
} from "@/features/conversations/data/conversation-directory";

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
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const filters = parseConversationFilters(query);
  const data = await getConversationInbox(filters, id);

  return <ConversationInbox data={data} />;
}
