import { Inbox, Phone } from "lucide-react";
import Link from "next/link";

import {
  ConversationPriorityBadge,
  ConversationStatusBadge,
} from "@/features/conversations/components/conversation-badges";
import type {
  ConversationCommercialStatus,
  ConversationListItem,
} from "@/features/conversations/data/conversation-directory";
import { messageDirectionLabels } from "@/features/conversations/types/conversation";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge, type BadgeProps } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type ConversationListProps = {
  conversations: ConversationListItem[];
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function formatLastMessageDate(value: string | null) {
  if (!value) return "Sem mensagem";

  return timeFormatter.format(new Date(value));
}

const commercialStatusLabels: Record<ConversationCommercialStatus, string> = {
  customer: "Cliente",
  lead: "Lead em aberto",
  lost: "Lead perdido",
  unlinked: "Sem lead",
};

const commercialStatusVariants: Record<
  ConversationCommercialStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  customer: "success",
  lead: "info",
  lost: "danger",
  unlinked: "neutral",
};

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold text-foreground">Caixa de atendimento</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversas comerciais em andamento.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Inbox}
            title="Nenhuma conversa encontrada"
            description="Quando houver atendimentos compatíveis com os filtros, eles aparecerão nesta lista."
          />
        </div>
      ) : (
        <div className="max-h-[720px] overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={conversation.href}
              className={cn(
                "block rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40",
                conversation.selected && "border-primary/60 bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {conversation.contactName}
                  </p>
                  {conversation.contactPhone ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {conversation.contactPhone}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatLastMessageDate(conversation.lastMessageAt)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={commercialStatusVariants[conversation.commercialStatus]}>
                  {commercialStatusLabels[conversation.commercialStatus]}
                </Badge>
                <ConversationStatusBadge status={conversation.status} />
                <ConversationPriorityBadge priority={conversation.priority} />
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                {conversation.lastMessageDirection
                  ? `${messageDirectionLabels[conversation.lastMessageDirection]}: `
                  : ""}
                {conversation.lastMessageBody || "Histórico ainda sem mensagens."}
              </p>

              <div className="mt-3 text-xs text-muted-foreground">
                <span className="truncate">
                  Responsável: {conversation.assigneeName ?? "Sem responsável"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
