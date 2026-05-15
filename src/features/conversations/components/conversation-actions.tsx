"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Bot,
  ImageIcon,
  MessageSquarePlus,
  Mic,
  Paperclip,
  PauseCircle,
  Play,
  Send,
  Shuffle,
  SmilePlus,
  Square,
  StickyNote,
  UserCheck,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addConversationInternalNote,
  assumeConversation,
  pauseConversationAi,
  resumeConversationAi,
  sendConversationReply,
  transferConversation,
  updateConversationStatus,
  type ConversationActionState,
} from "@/features/conversations/actions";
import type {
  ConversationAiAvailability,
  ConversationAiSummary,
  ConversationMessage,
  ConversationQuickReply,
} from "@/features/conversations/data/conversation-directory";
import type {
  ConversationOption,
  ConversationStatus,
} from "@/features/conversations/types/conversation";
import {
  conversationStatuses,
  conversationStatusLabels,
  priorityLabels,
} from "@/features/conversations/types/conversation";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const initialState: ConversationActionState = {
  ok: false,
};

const aiSummaryDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
  year: "numeric",
});

const internalNoteDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
  year: "numeric",
});

type ConversationInternalNote = Pick<
  ConversationMessage,
  "authorName" | "body" | "id" | "sentAt"
>;

function getAiStatusPresentation(params: {
  aiAvailability: ConversationAiAvailability;
  aiPausedAt: string | null;
  assigneeId: string | null;
}) {
  if (!params.aiAvailability.enabled) {
    return {
      label: "IA desativada no painel",
      variant: "neutral" as const,
    };
  }

  if (!params.aiAvailability.automaticReplyEnabled) {
    return {
      label: "IA sem envio automático",
      variant: "warning" as const,
    };
  }

  if (params.aiPausedAt) {
    return {
      label: "IA pausada",
      variant: "warning" as const,
    };
  }

  if (params.assigneeId) {
    return {
      label: "Humano assumiu",
      variant: "warning" as const,
    };
  }

  return {
    label: "IA automática ativa",
    variant: "success" as const,
  };
}

type ConversationActionProps = {
  aiAvailability: ConversationAiAvailability;
  aiPauseReason: string | null;
  aiPausedAt: string | null;
  aiPausedByName: string | null;
  aiSummary: ConversationAiSummary | null;
  assigneeId: string | null;
  assignees: ConversationOption[];
  conversationId: string;
  internalNotes: ConversationInternalNote[];
  status: ConversationStatus;
};

export function ConversationReplyComposer({
  conversationId,
  quickReplies,
}: {
  conversationId: string;
  quickReplies: ConversationQuickReply[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaPreviewUrlRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
  const [selectedReply, setSelectedReply] = useState("none");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<ConversationActionState>(initialState);
  const currentMedia = recordedAudio ?? selectedFile;

  const setPreviewUrl = useCallback((url: string | null) => {
    if (mediaPreviewUrlRef.current) URL.revokeObjectURL(mediaPreviewUrlRef.current);
    mediaPreviewUrlRef.current = url;
    setMediaPreviewUrl(url);
  }, []);

  const clearMedia = useCallback(() => {
    setPreviewUrl(null);
    setRecordedAudio(null);
    setSelectedFile(null);
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setPreviewUrl]);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setBody("");
      clearMedia();
      setSelectedReply("none");
      formRef.current?.reset();
      router.refresh();
      return;
    }

    toast.error(state.message);
    if (state.refresh) {
      setBody("");
      clearMedia();
      setSelectedReply("none");
      formRef.current?.reset();
      router.refresh();
    }
  }, [clearMedia, router, state]);

  useEffect(() => {
    return () => {
      if (mediaPreviewUrlRef.current) URL.revokeObjectURL(mediaPreviewUrlRef.current);
    };
  }, []);

  function applyQuickReply(replyId: string) {
    setSelectedReply(replyId);

    if (replyId === "none") return;

    const reply = quickReplies.find((item) => item.id === replyId);
    if (reply) setBody(reply.content);
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const nextBody = `${body.slice(0, start)}${emoji}${body.slice(end)}`;
    const nextPosition = start + emoji.length;

    setBody(nextBody);
    setEmojiOpen(false);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function selectFile(file: File | null) {
    clearMedia();

    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("audio/")) {
      setErrorMessage("Selecione uma imagem ou um áudio.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function startRecording() {
    clearMedia();

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErrorMessage("Este navegador não permite gravar áudio por aqui.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const extension = type.includes("ogg") ? "ogg" : "webm";
        const file = new File([blob], `audio-${Date.now()}.${extension}`, { type });

        stream.getTracks().forEach((track) => track.stop());
        setRecordedAudio(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setErrorMessage("Não foi possível iniciar a gravação do áudio.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isRecording) {
      setErrorMessage("Finalize a gravação antes de enviar.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    if (recordedAudio) {
      formData.set("media", recordedAudio);
    } else if (selectedFile) {
      formData.set("media", selectedFile);
    } else if (!selectedFile) {
      formData.delete("media");
    }

    startTransition(async () => {
      const result = await sendConversationReply(conversationId, initialState, formData);
      setState(result);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submitReply}
      className="shrink-0 space-y-3 border-t bg-card p-4"
    >
      {quickReplies.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="conversation-quick-reply" className="text-sm font-medium">
            Resposta rápida
          </label>
          <Select value={selectedReply} onValueChange={applyQuickReply}>
            <SelectTrigger id="conversation-quick-reply">
              <SelectValue placeholder="Selecionar resposta rápida" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem resposta rápida</SelectItem>
              {quickReplies.map((reply) => (
                <SelectItem key={reply.id} value={reply.id}>
                  {reply.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {currentMedia ? (
        <div className="flex items-center gap-3 rounded-md border bg-background p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {currentMedia.type.startsWith("image/") ? (
              <ImageIcon className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {currentMedia.type.startsWith("image/") ? "Imagem selecionada" : "Áudio pronto"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{currentMedia.name}</p>
            {currentMedia.type.startsWith("audio/") && mediaPreviewUrl ? (
              <audio controls preload="metadata" className="mt-2 h-9 w-full max-w-md">
                <source src={mediaPreviewUrl} type={currentMedia.type} />
              </audio>
            ) : null}
          </div>
          {currentMedia.type.startsWith("image/") && mediaPreviewUrl ? (
            <img
              src={mediaPreviewUrl}
              alt="Imagem selecionada"
              className="h-16 w-16 rounded-md border object-cover"
            />
          ) : null}
          <Button type="button" variant="ghost" size="icon" onClick={clearMedia} title="Remover arquivo">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        name="media"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,audio/aac,audio/mp4,audio/mpeg,audio/ogg,audio/wav,audio/webm"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
      />

      <div className="flex items-end gap-2 rounded-md border bg-background p-2">
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Inserir emoji"
            onClick={() => setEmojiOpen((current) => !current)}
            disabled={isPending || isRecording}
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
          {emojiOpen ? (
            <div className="absolute bottom-12 left-0 z-50 overflow-hidden rounded-md border bg-background shadow-lg">
              <EmojiPicker
                height={360}
                width={320}
                lazyLoadEmojis
                searchPlaceholder="Buscar emoji"
                previewConfig={{ showPreview: false }}
                onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
              />
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Anexar imagem ou áudio"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || isRecording}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          title={isRecording ? "Parar gravação" : "Gravar áudio"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isPending}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Textarea
          ref={textareaRef}
          id="conversation-reply"
          name="body"
          rows={1}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Mensagem"
          className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="icon" disabled={isPending || isRecording}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {isRecording ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-300">
          Gravando áudio...
        </p>
      ) : null}
      {errorMessage || state.fieldErrors?.body?.[0] || state.fieldErrors?.media?.[0] ? (
        <p className="text-xs text-red-600 dark:text-red-300">
          {errorMessage ?? state.fieldErrors?.body?.[0] ?? state.fieldErrors?.media?.[0]}
        </p>
      ) : null}
    </form>
  );
}

export function ConversationDetailActions(props: ConversationActionProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!props.assigneeId ? <AssumeDialog conversationId={props.conversationId} /> : null}
      <AiStatusBadge
        aiAvailability={props.aiAvailability}
        aiPausedAt={props.aiPausedAt}
        assigneeId={props.assigneeId}
      />
      <AiSummaryDialog
        aiAvailability={props.aiAvailability}
        aiPauseReason={props.aiPauseReason}
        aiPausedAt={props.aiPausedAt}
        aiPausedByName={props.aiPausedByName}
        aiSummary={props.aiSummary}
        assigneeId={props.assigneeId}
      />
      <AiAutomationDialog
        aiAvailability={props.aiAvailability}
        aiPausedAt={props.aiPausedAt}
        assigneeId={props.assigneeId}
        conversationId={props.conversationId}
      />
      <StatusDialog
        conversationId={props.conversationId}
        currentStatus={props.status}
      />
      <TransferDialog {...props} />
      <InternalNoteDialog
        conversationId={props.conversationId}
        notes={props.internalNotes}
      />
    </div>
  );
}

function AiStatusBadge({
  aiAvailability,
  aiPausedAt,
  assigneeId,
}: Pick<ConversationActionProps, "aiAvailability" | "aiPausedAt" | "assigneeId">) {
  const status = getAiStatusPresentation({
    aiAvailability,
    aiPausedAt,
    assigneeId,
  });

  return (
    <Badge variant={status.variant} className="gap-1.5 py-1">
      <Bot className="h-3.5 w-3.5" />
      {status.label}
    </Badge>
  );
}

function AiSummaryDialog({
  aiAvailability,
  aiPauseReason,
  aiPausedAt,
  aiPausedByName,
  aiSummary,
  assigneeId,
}: Pick<
  ConversationActionProps,
  | "aiAvailability"
  | "aiPauseReason"
  | "aiPausedAt"
  | "aiPausedByName"
  | "aiSummary"
  | "assigneeId"
>) {
  const aiStatus = getAiStatusPresentation({
    aiAvailability,
    aiPausedAt,
    assigneeId,
  });
  const hasHumanReview = aiSummary?.handoffRequired || aiSummary?.requiresHumanReview;
  const conversionPotential =
    typeof aiSummary?.conversionPotential === "number"
      ? `${aiSummary.conversionPotential}%`
      : "Não informado";
  const automaticReply =
    aiSummary?.shouldSendReply === null || aiSummary?.shouldSendReply === undefined
      ? "Não informado"
      : aiSummary.shouldSendReply
        ? "Permitida"
        : "Bloqueada";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Bot className="h-4 w-4" />
          Resumo da IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resumo da IA</DialogTitle>
          <DialogDescription>
            Veja a última leitura da assistente sobre este atendimento sem ocupar espaço no chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={aiStatus.variant}>{aiStatus.label}</Badge>
            {hasHumanReview ? <Badge variant="warning">Revisão humana</Badge> : null}
            {aiSummary?.immediateAttention ? <Badge variant="danger">Urgente</Badge> : null}
          </div>

          {aiSummary ? (
            <>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm leading-6 text-foreground">
                  {aiSummary.summary ??
                    "A IA classificou o atendimento, mas ainda não gerou um resumo textual."}
                </p>
                {aiSummary.shortDescription ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Caso informado: {aiSummary.shortDescription}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <AiSummaryMetric
                  label="Área provável"
                  value={aiSummary.legalArea ?? "Não identificada"}
                />
                <AiSummaryMetric
                  label="Prioridade"
                  value={aiSummary.priority ? priorityLabels[aiSummary.priority] : "Não identificada"}
                />
                <AiSummaryMetric label="Potencial" value={conversionPotential} />
                <AiSummaryMetric
                  label="Melhor horário"
                  value={aiSummary.bestContactTime ?? "Não informado"}
                />
                <AiSummaryMetric label="Envio automático" value={automaticReply} />
                <AiSummaryMetric
                  label="Última análise"
                  value={aiSummaryDateFormatter.format(new Date(aiSummary.createdAt))}
                />
              </div>
            </>
          ) : (
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              A IA ainda não registrou uma classificação para esta conversa.
            </div>
          )}

          {aiPausedAt ? (
            <div className="rounded-md border bg-background p-3 text-sm">
              <p className="font-semibold text-foreground">Controle humano ativo</p>
              <p className="mt-1 text-muted-foreground">
                {aiPauseReason ?? "A equipe pausou a IA para conduzir este atendimento."}
              </p>
              {aiPausedByName ? (
                <p className="mt-1 text-xs text-muted-foreground">Pausada por: {aiPausedByName}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AiSummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function AssumeDialog({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    assumeConversation.bind(null, conversationId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="default" size="sm">
          <UserCheck className="h-4 w-4" />
          Assumir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assumir atendimento</DialogTitle>
          <DialogDescription>
            A conversa ficará sob sua responsabilidade e a IA deixará de responder automaticamente neste atendimento.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assumindo..." : "Assumir atendimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AiAutomationDialog({
  aiAvailability,
  aiPausedAt,
  assigneeId,
  conversationId,
}: {
  aiAvailability: ConversationAiAvailability;
  aiPausedAt: string | null;
  assigneeId: string | null;
  conversationId: string;
}) {
  if (!aiAvailability.enabled) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <Bot className="h-4 w-4" />
        IA desativada
      </Button>
    );
  }

  if (!aiAvailability.automaticReplyEnabled) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <Bot className="h-4 w-4" />
        IA assistida
      </Button>
    );
  }

  return aiPausedAt || assigneeId ? (
    <ResumeAiDialog
      conversationId={conversationId}
      isHumanAssigned={Boolean(assigneeId)}
    />
  ) : (
    <PauseAiDialog conversationId={conversationId} />
  );
}

function PauseAiDialog({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    pauseConversationAi.bind(null, conversationId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PauseCircle className="h-4 w-4" />
          Pausar IA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pausar IA nesta conversa</DialogTitle>
          <DialogDescription>
            As novas mensagens continuarão entrando no CRM, mas a IA não responderá até a equipe retomar.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ai-pause-reason" className="text-sm font-medium">
              Motivo interno
            </label>
            <Textarea
              id="ai-pause-reason"
              name="reason"
              rows={3}
              placeholder="Ex.: atendimento sensível, cliente pediu humano, análise da equipe."
            />
            {state.fieldErrors?.reason?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.reason[0]}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Pausando..." : "Pausar IA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResumeAiDialog({
  conversationId,
  isHumanAssigned,
}: {
  conversationId: string;
  isHumanAssigned: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    resumeConversationAi.bind(null, conversationId),
    initialState,
  );
  const triggerLabel = isHumanAssigned ? "Devolver para IA" : "Retomar IA";

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Play className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isHumanAssigned ? "Devolver atendimento para IA" : "Retomar IA nesta conversa"}
          </DialogTitle>
          <DialogDescription>
            A conversa será devolvida para a automação e deixará de ficar assumida por uma pessoa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Retomando..." : "Devolver para IA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({
  conversationId,
  currentStatus,
}: {
  conversationId: string;
  currentStatus: ConversationStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [state, formAction, isPending] = useActionState(
    updateConversationStatus.bind(null, conversationId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Alterar status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar status do atendimento</DialogTitle>
          <DialogDescription>
            Atualize a situação operacional desta conversa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="status" value={status} />
          <div className="space-y-2">
            <label htmlFor="conversation-status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ConversationStatus)}
            >
              <SelectTrigger id="conversation-status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {conversationStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {conversationStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  assigneeId,
  assignees,
  conversationId,
}: ConversationActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState(assigneeId ?? "none");
  const [state, formAction, isPending] = useActionState(
    transferConversation.bind(null, conversationId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Shuffle className="h-4 w-4" />
          Transferir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir atendimento</DialogTitle>
          <DialogDescription>
            Defina o responsável que deve acompanhar esta conversa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="assignedTo" value={assignedTo} />

          <div className="space-y-2">
            <label htmlFor="conversation-assignee" className="text-sm font-medium">
              Responsável
            </label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="conversation-assignee">
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Transferindo..." : "Salvar transferência"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InternalNoteDialog({
  conversationId,
  notes,
}: {
  conversationId: string;
  notes: ConversationInternalNote[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(notes.length > 0 ? "notes" : "create");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addConversationInternalNote.bind(null, conversationId),
    initialState,
  );
  const noteCountLabel =
    notes.length === 1 ? "1 nota salva" : `${notes.length} notas salvas`;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setActiveTab(notes.length > 0 ? "notes" : "create");
    }
  }

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    setActiveTab("create");
    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <MessageSquarePlus className="h-4 w-4" />
          Notas internas
          {notes.length > 0 ? (
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {notes.length}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notas internas</DialogTitle>
          <DialogDescription>
            Consulte as observações salvas neste atendimento ou registre uma nova orientação para a equipe.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Ver notas</TabsTrigger>
            <TabsTrigger value="create">Criar nota</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            <div className="rounded-md border bg-muted/20">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-semibold text-foreground">Notas salvas</p>
                <p className="text-xs text-muted-foreground">{noteCountLabel}</p>
              </div>
              {notes.length > 0 ? (
                <div className="max-h-[360px] overflow-y-auto p-3">
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <article key={note.id} className="rounded-md border bg-background p-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <StickyNote className="h-3.5 w-3.5" />
                          <span>{note.authorName ?? "Equipe"}</span>
                          <span>&middot;</span>
                          <time dateTime={note.sentAt}>
                            {internalNoteDateFormatter.format(new Date(note.sentAt))}
                          </time>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground [overflow-wrap:anywhere]">
                          {note.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  Nenhuma nota interna foi salva neste atendimento.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="conversation-note" className="text-sm font-medium">
                  Observação
                </label>
                <Textarea id="conversation-note" name="content" rows={5} />
                {state.fieldErrors?.content?.[0] ? (
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {state.fieldErrors.content[0]}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar nota"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
