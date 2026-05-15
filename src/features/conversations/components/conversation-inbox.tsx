import { ConversationDetail } from "@/features/conversations/components/conversation-detail";
import { ConversationFilters } from "@/features/conversations/components/conversation-filters";
import { ConversationList } from "@/features/conversations/components/conversation-list";
import { ConversationRealtime } from "@/features/conversations/components/conversation-realtime";
import type { ConversationInboxData } from "@/features/conversations/data/conversation-directory";
import { Badge } from "@/shared/components/ui/badge";

type ConversationInboxProps = {
  data: ConversationInboxData;
};

export function ConversationInbox({ data }: ConversationInboxProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ConversationRealtime selectedConversationId={data.selectedConversation?.id ?? null} />

      <section>
        <Badge variant="neutral" className="mb-3">
          Atendimento
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Conversas
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Centralize atendimentos comerciais, responsáveis e histórico de mensagens.
        </p>
      </section>

      <ConversationFilters filters={data.filters} />

      <div className="grid min-h-0 gap-4 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <ConversationList conversations={data.conversations} />
        <ConversationDetail
          aiAvailability={data.aiAvailability}
          assignees={data.assignees}
          conversation={data.selectedConversation}
          pipelineStages={data.pipelineStages}
          quickReplies={data.quickReplies}
        />
      </div>
    </div>
  );
}
