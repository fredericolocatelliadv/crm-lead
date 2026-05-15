import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  Clock3,
  FileText,
  ImageIcon,
  MessageCircle,
  Mic,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { retryConversationMessage } from "@/features/conversations/actions";
import {
  ConversationDetailActions,
  ConversationReplyComposer,
} from "@/features/conversations/components/conversation-actions";
import {
  ConversationPriorityBadge,
  ConversationStatusBadge,
} from "@/features/conversations/components/conversation-badges";
import { ConversationMessageViewport } from "@/features/conversations/components/conversation-message-viewport";
import type {
  ConversationAiAvailability,
  ConversationDetail as ConversationDetailType,
  ConversationMessage,
  ConversationMessageAttachment,
  ConversationQuickReply,
} from "@/features/conversations/data/conversation-directory";
import type { ConversationOption } from "@/features/conversations/types/conversation";
import {
  messageDeliveryStatusLabels,
  messageDirectionLabels,
} from "@/features/conversations/types/conversation";
import {
  LeadPriorityBadge,
  LeadSourceBadge,
  LeadStatusBadge,
} from "@/features/leads/components/lead-badges";
import { MoveLeadDialog } from "@/features/pipeline/components/move-lead-dialog";
import type { PipelineStage } from "@/features/pipeline/types/pipeline";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ConversationDetailProps = {
  aiAvailability: ConversationAiAvailability;
  assignees: ConversationOption[];
  conversation: ConversationDetailType | null;
  pipelineStages: PipelineStage[];
  quickReplies: ConversationQuickReply[];
};

const messageDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const urlPattern = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const trailingUrlPunctuationPattern = /[),.;:!?]+$/;

function formatMessageDate(value: string) {
  return messageDateFormatter.format(new Date(value));
}

function normalizeMessageUrl(value: string) {
  return value.startsWith("www.") ? `https://${value}` : value;
}

function splitTrailingUrlPunctuation(value: string) {
  const punctuation = value.match(trailingUrlPunctuationPattern)?.[0] ?? "";

  return {
    punctuation,
    url: punctuation ? value.slice(0, -punctuation.length) : value,
  };
}

function formatFileSize(value: number | null) {
  if (!value) return null;
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageText({ body }: { body: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(urlPattern)) {
    const rawValue = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(body.slice(lastIndex, index));
    }

    const { punctuation, url } = splitTrailingUrlPunctuation(rawValue);

    parts.push(
      <a
        key={`${index}-${url}`}
        href={normalizeMessageUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium underline underline-offset-2 hover:opacity-80"
      >
        {url}
      </a>,
    );

    if (punctuation) {
      parts.push(punctuation);
    }

    lastIndex = index + rawValue.length;
  }

  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
  }

  return <>{parts}</>;
}

export function ConversationDetail({
  aiAvailability,
  assignees,
  conversation,
  pipelineStages,
  quickReplies,
}: ConversationDetailProps) {
  const lastMessage = conversation?.messages.at(-1) ?? null;
  const internalNotes =
    conversation?.messages
      .filter((message) => message.direction === "internal")
      .reverse() ?? [];

  if (!conversation) {
    return (
      <section className="rounded-md border bg-card p-4">
        <EmptyState
          icon={MessageCircle}
          title="Selecione uma conversa"
          description="Escolha um atendimento na caixa ao lado para ver o histórico, registrar resposta e organizar o responsável."
        />
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-14rem)] min-h-[640px] flex-col overflow-hidden rounded-md border bg-card">
      <div className="shrink-0 border-b p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ConversationStatusBadge status={conversation.status} />
              <ConversationPriorityBadge priority={conversation.priority} />
              <Badge variant="neutral">{conversation.channel}</Badge>
            </div>
            <h2 className="mt-3 truncate text-xl font-semibold text-foreground">
              {conversation.contactName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {conversation.contactPhone ? <span>{conversation.contactPhone}</span> : null}
              {conversation.contactEmail ? <span>{conversation.contactEmail}</span> : null}
              {conversation.city ? <span>{conversation.city}</span> : null}
              {conversation.legalArea ? <span>{conversation.legalArea}</span> : null}
            </div>
          </div>

          <ConversationDetailActions
            aiPausedAt={conversation.aiPausedAt}
            aiPauseReason={conversation.aiPauseReason}
            aiPausedByName={conversation.aiPausedByName}
            aiAvailability={aiAvailability}
            aiSummary={conversation.aiSummary}
            assigneeId={conversation.assigneeId}
            assignees={assignees}
            conversationId={conversation.id}
            internalNotes={internalNotes}
            status={conversation.status}
          />
        </div>

        <ConversationCommercialContext
          conversation={conversation}
          pipelineStages={pipelineStages}
        />
      </div>

      <ConversationMessageViewport
        conversationId={conversation.id}
        lastMessageId={lastMessage?.id ?? null}
        messageCount={conversation.messages.length}
      >
        {conversation.messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Nenhuma mensagem registrada"
            description="As mensagens deste atendimento aparecerão aqui em ordem cronológica."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </ConversationMessageViewport>

      <ConversationReplyComposer
        conversationId={conversation.id}
        quickReplies={quickReplies}
      />
    </section>
  );
}

function ConversationCommercialContext({
  conversation,
  pipelineStages,
}: {
  conversation: ConversationDetailType;
  pipelineStages: PipelineStage[];
}) {
  const lead = conversation.lead;
  const isConvertedCustomer = lead?.status === "converted";
  const stageLabel =
    lead?.pipelineStageName ??
    (lead?.status === "converted"
      ? "Convertido"
      : lead?.status === "lost"
        ? "Perdido"
        : "Etapa não definida");
  const stageVariant =
    lead?.status === "converted" ? "success" : lead?.status === "lost" ? "danger" : "outline";
  const showStageBadge = lead?.status === "open";
  const recordHref =
    isConvertedCustomer && lead?.customerId ? `/crm/clientes/${lead.customerId}` : `/crm/leads/${lead?.id}`;

  return (
    <div className="mt-4 rounded-md border bg-background p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Contexto comercial
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {lead ? (
              <>
                {isConvertedCustomer ? (
                  <Badge variant="success">Cliente convertido</Badge>
                ) : (
                  <LeadStatusBadge status={lead.status} />
                )}
                {showStageBadge ? <Badge variant={stageVariant}>{stageLabel}</Badge> : null}
                <LeadPriorityBadge priority={lead.priority} />
                <LeadSourceBadge source={lead.source} />
              </>
            ) : (
              <Badge variant="neutral">Sem lead vinculado</Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Responsável: {conversation.assigneeName ?? "Sem responsável"}</span>
            {lead?.lostReason ? <span>Motivo da perda: {lead.lostReason}</span> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {lead ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={recordHref}>
                  {isConvertedCustomer ? "Abrir cliente" : "Abrir lead"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              {!isConvertedCustomer && pipelineStages.length > 0 ? (
                <MoveLeadDialog
                  currentStageId={lead.pipelineStageId}
                  leadId={lead.id}
                  leadName={lead.name}
                  stages={pipelineStages}
                  triggerLabel="Alterar etapa"
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isOutbound = message.direction === "outbound";
  const isInternal = message.direction === "internal";

  return (
    <article
      className={cn(
        "flex w-full",
        isOutbound && "justify-end",
        isInternal && "justify-center",
      )}
    >
      <div
        className={cn(
          "max-w-[min(760px,88%)] rounded-md border px-4 py-3 shadow-sm",
          message.kind === "audio" && "w-full min-w-[320px] sm:min-w-[420px]",
          message.direction === "inbound" && "bg-background",
          isOutbound && "border-primary/30 bg-primary text-primary-foreground",
          isInternal &&
            "border-amber-600/35 bg-amber-500/15 text-foreground dark:bg-amber-400/10",
        )}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
          {isInternal ? <StickyNote className="h-3.5 w-3.5" /> : null}
          <span>{messageDirectionLabels[message.direction]}</span>
          {message.isAiGenerated ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5",
                isOutbound
                  ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                  : "border-border bg-muted text-foreground",
              )}
            >
              <Bot className="h-3 w-3" />
              IA automática
            </span>
          ) : null}
          {message.isAudioTranscribed ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5",
                isOutbound
                  ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                  : "border-border bg-muted text-foreground",
              )}
            >
              <Mic className="h-3 w-3" />
              Transcrição do áudio
            </span>
          ) : null}
          {message.authorName ? <span>&middot; {message.authorName}</span> : null}
          <span
            className={cn(
              "font-medium",
              isOutbound ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {formatMessageDate(message.sentAt)}
          </span>
        </div>
        {message.body ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">
            <MessageText body={message.body} />
          </p>
        ) : message.attachments.length === 0 ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">
            Mensagem sem texto.
          </p>
        ) : null}
        {message.attachments.length > 0 ? (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment) => (
              <MessageAttachment
                key={attachment.id}
                attachment={attachment}
                direction={message.direction}
              />
            ))}
          </div>
        ) : null}
        {isOutbound ? <MessageDeliveryStatus message={message} /> : null}
      </div>
    </article>
  );
}

function MessageDeliveryStatus({ message }: { message: ConversationMessage }) {
  const isFailed = message.deliveryStatus === "failed";
  const isSending = message.deliveryStatus === "sending";

  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center justify-end gap-2 text-xs font-medium",
        isFailed ? "text-red-100" : "text-primary-foreground/80",
      )}
    >
      <span className="inline-flex items-center gap-1">
        {isFailed ? <AlertCircle className="h-3.5 w-3.5" /> : null}
        {isSending ? <Clock3 className="h-3.5 w-3.5" /> : null}
        {message.deliveryStatus === "sent" ? <Check className="h-3.5 w-3.5" /> : null}
        {messageDeliveryStatusLabels[message.deliveryStatus]}
      </span>
      {isFailed ? (
        <form action={retryConversationMessage.bind(null, message.id)}>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function MessageAttachment({
  attachment,
  direction,
}: {
  attachment: ConversationMessageAttachment;
  direction: ConversationMessage["direction"];
}) {
  const isAudio = attachment.fileType?.startsWith("audio/");
  const isImage = attachment.fileType?.startsWith("image/");
  const audioDirectionLabel = direction === "outbound" ? "enviado" : "recebido";
  const documentDirectionLabel = direction === "outbound" ? "enviado" : "recebido";
  const imageDirectionLabel = direction === "outbound" ? "enviada" : "recebida";
  const fileSize = formatFileSize(attachment.fileSize);

  if (isAudio && attachment.signedUrl) {
    return (
      <div className="w-full rounded-md border bg-background/70 p-4 text-foreground">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
          <Mic className="h-3.5 w-3.5" />
          Áudio {audioDirectionLabel}
        </p>
        <audio controls preload="metadata" className="h-10 w-full min-w-[260px] sm:min-w-[360px]">
          <source src={attachment.signedUrl} type={attachment.fileType ?? undefined} />
        </audio>
      </div>
    );
  }

  if (isImage && attachment.signedUrl) {
    return (
      <a
        href={attachment.signedUrl}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-md border bg-background/70 text-foreground transition-colors hover:border-primary/50"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs font-semibold">
          <ImageIcon className="h-3.5 w-3.5" />
          Imagem {imageDirectionLabel}
        </div>
        <img
          src={attachment.signedUrl}
          alt={attachment.fileName}
          className="max-h-[360px] w-full max-w-[520px] object-contain"
        />
      </a>
    );
  }

  if (attachment.signedUrl) {
    return (
      <a
        href={attachment.signedUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-md border bg-background/70 p-3 text-foreground transition-colors hover:border-primary/50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Documento {documentDirectionLabel}</p>
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[attachment.fileType, fileSize].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-background/70 p-3 text-foreground">
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground">Arquivo sem link disponível.</p>
      </div>
    </div>
  );
}
