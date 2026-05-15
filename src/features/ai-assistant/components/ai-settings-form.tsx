"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleHelp, Mic, Save, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  simulateAiAssistantResponse,
  updateAiAssistantSettings,
  type AiAssistantSimulationActionState,
  type AiAssistantSettingsActionState,
} from "@/features/ai-assistant/actions";
import {
  aiAssistantModels,
  aiAssistantOperationModes,
} from "@/features/ai-assistant/data/ai-options";
import type { AiAssistantSettings } from "@/features/ai-assistant/types/ai-assistant";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

const initialState: AiAssistantSettingsActionState = { ok: false };
const initialSimulationState: AiAssistantSimulationActionState = { ok: false };

export function AiAssistantSettingsForm({ settings }: { settings: AiAssistantSettings }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateAiAssistantSettings,
    initialState,
  );
  const [simulationState, simulationFormAction, isSimulationPending] = useActionState(
    simulateAiAssistantResponse,
    initialSimulationState,
  );
  const selectedModel =
    aiAssistantModels.find((model) => model.value === settings.model) ?? aiAssistantModels[0];
  const [operationMode, setOperationMode] = useState(settings.operationMode);
  const [audioTranscriptionEnabled, setAudioTranscriptionEnabled] = useState(
    settings.audioTranscriptionEnabledWhenAiOff,
  );
  const canConfigureAudioTranscription = operationMode === "off";
  const effectiveAudioTranscriptionEnabled =
    canConfigureAudioTranscription && audioTranscriptionEnabled;

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  useEffect(() => {
    if (!simulationState.message) return;

    if (simulationState.ok) {
      toast.success(simulationState.message);
      return;
    }

    toast.error(simulationState.message);
  }, [simulationState]);

  const getFieldError = (field: string) =>
    state.fieldErrors?.[field]?.[0] ?? simulationState.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="grid gap-5">
      <Tabs defaultValue="operacao" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-md border bg-card p-1">
          <TabsTrigger value="operacao">Operação</TabsTrigger>
          <TabsTrigger value="comportamento">Comportamento</TabsTrigger>
          <TabsTrigger value="contexto">Contexto</TabsTrigger>
          <TabsTrigger value="teste">Teste</TabsTrigger>
        </TabsList>

        <TabsContent forceMount value="operacao" className="mt-5 grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Modo de operação</CardTitle>
              <CardDescription>
                Escolha o quanto a assistente participa do atendimento pelo WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-3">
              {aiAssistantOperationModes.map((mode) => (
                <label
                  key={mode.value}
                  className={cn(
                    "flex min-h-32 cursor-pointer gap-3 rounded-md border bg-background p-4 transition-colors hover:bg-accent/60",
                    settings.operationMode === mode.value && "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name="operationMode"
                    value={mode.value}
                    defaultChecked={settings.operationMode === mode.value}
                    onChange={() => setOperationMode(mode.value)}
                    className="mt-1 h-4 w-4 border-border accent-primary"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      {mode.label}
                      {mode.value === "automatic" ? (
                        <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-white">
                          Principal
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                      {mode.description}
                    </span>
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          <input
            type="hidden"
            name="audioTranscriptionEnabledWhenAiOff"
            value={effectiveAudioTranscriptionEnabled ? "on" : "off"}
          />
          <Card>
            <CardHeader>
              <CardTitle>Transcrição de áudio</CardTitle>
              <CardDescription>
                Use Gemini para mostrar no chat o texto dos áudios recebidos quando a assistente estiver desligada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border bg-background p-4 transition-colors",
                  canConfigureAudioTranscription
                    ? "hover:bg-accent/60"
                    : "cursor-not-allowed opacity-65",
                  effectiveAudioTranscriptionEnabled && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="checkbox"
                  checked={effectiveAudioTranscriptionEnabled}
                  disabled={!canConfigureAudioTranscription}
                  onChange={(event) => setAudioTranscriptionEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 border-border accent-primary disabled:cursor-not-allowed"
                />
                <span className="grid gap-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    <Mic className="h-4 w-4" />
                    Transcrever áudios recebidos
                  </span>
                  <span className="text-xs leading-5 text-muted-foreground">
                    {canConfigureAudioTranscription
                      ? "Quando ligado, áudios recebidos pelo WhatsApp são transcritos sem enviar resposta automática."
                      : "Com a assistente ligada, os áudios já entram no fluxo normal de transcrição da IA."}
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Modelo e histórico</CardTitle>
                <CardDescription>
                  Controle o modelo usado e quantas mensagens recentes entram na análise.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                  <label className="space-y-2">
                    <FieldLabel
                      label="Modelo Gemini"
                      helpTitle="Modelo Gemini"
                      helpDescription="O modelo define custo, velocidade e capacidade de análise. Para atendimento comercial, o Gemini 2.5 Flash equilibra qualidade e resposta rápida."
                    />
                    <Select name="model" defaultValue={settings.model}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiAssistantModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {selectedModel.description}
                    </p>
                    <FieldError message={getFieldError("model")} />
                  </label>

                  <label className="space-y-2">
                    <FieldLabel
                      label="Histórico"
                      helpTitle="Histórico usado pela IA"
                      helpDescription="Define quantas mensagens recentes entram no contexto. Um número maior ajuda a entender a conversa, mas pode aumentar custo e ruído."
                    />
                    <Input
                      name="maxContextMessages"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={settings.maxContextMessages}
                    />
                    <FieldError message={getFieldError("maxContextMessages")} />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo atual</CardTitle>
                <CardDescription>
                  Leitura rápida do comportamento configurado para a assistente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow label="Modo" value={operationModeLabel(operationMode)} />
                <SummaryRow
                  label="Transcrição"
                  value={
                    operationMode !== "off"
                      ? "Incluída na IA ativa"
                      : effectiveAudioTranscriptionEnabled
                        ? "Ligada"
                        : "Desligada"
                  }
                />
                <SummaryRow label="Modelo" value={selectedModel.label} />
                <SummaryRow label="Nome" value={settings.assistantName} />
                <SummaryRow
                  label="Histórico"
                  value={`${settings.maxContextMessages} mensagens`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent forceMount value="comportamento" className="mt-5 grid gap-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Identidade</CardTitle>
                <CardDescription>
                  Defina como a assistente se apresenta e conversa com o contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <label className="space-y-2">
                  <FieldLabel
                    label="Nome da assistente"
                    helpTitle="Nome da assistente"
                    helpDescription="É o nome usado para identificar a assistente e orientar o tom do atendimento. Evite nomes que façam a IA parecer uma advogada real."
                  />
                  <Input name="assistantName" defaultValue={settings.assistantName} />
                  <FieldError message={getFieldError("assistantName")} />
                </label>

                <label className="space-y-2">
                  <FieldLabel
                    label="Tom e personalidade"
                    helpTitle="Tom e personalidade"
                    helpDescription="Descreva a postura da assistente: acolhedora, objetiva, formal, consultiva, direta ou mais humanizada. Isso influencia o jeito da resposta, não as regras do escritório."
                  />
                  <Textarea name="personality" rows={7} defaultValue={settings.personality} />
                  <FieldError message={getFieldError("personality")} />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estilo das respostas</CardTitle>
                <CardDescription>
                  Ajuste o tamanho, a linguagem e o ritmo das mensagens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="space-y-2">
                  <FieldLabel
                    label="Como a IA deve escrever"
                    helpTitle="Estilo das respostas"
                    helpDescription="Controle tamanho e forma das mensagens. Exemplo: responder em frases curtas, perguntar no máximo duas informações por vez e manter linguagem simples."
                  />
                  <Textarea name="responseStyle" rows={10} defaultValue={settings.responseStyle} />
                  <FieldError message={getFieldError("responseStyle")} />
                </label>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent forceMount value="contexto" className="mt-5 grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o escritório</CardTitle>
              <CardDescription>
                Contexto institucional usado pela IA para entender quem está atendendo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="space-y-2">
                <FieldLabel
                  label="Informações do escritório"
                  helpTitle="Sobre o escritório"
                  helpDescription="Use este campo para explicar história, diferenciais, regiões atendidas, áreas fortes, forma de atendimento e observações institucionais. Não use este espaço para regras; as regras ficam em limites e cuidados."
                />
                <Textarea
                  name="officeContext"
                  rows={9}
                  defaultValue={settings.officeContext}
                />
                <FieldError message={getFieldError("officeContext")} />
              </label>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Roteiro do atendimento</CardTitle>
                <CardDescription>
                  Defina o que a IA deve coletar antes de encaminhar para a equipe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="space-y-2">
                  <FieldLabel
                    label="Primeiro atendimento"
                    helpTitle="Roteiro do primeiro atendimento"
                    helpDescription="Use este campo para dizer quais informações a IA deve levantar: nome, cidade, área provável, urgência, resumo do caso e melhor horário de retorno."
                  />
                  <Textarea
                    name="promptInstructions"
                    rows={8}
                    defaultValue={settings.promptInstructions}
                  />
                  <FieldError message={getFieldError("promptInstructions")} />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites e cuidados</CardTitle>
                <CardDescription>
                  Defina quando a IA deve parar e encaminhar para um humano.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="space-y-2">
                  <FieldLabel
                    label="Diretrizes do escritório"
                    helpTitle="Limites e cuidados"
                    helpDescription="Este texto é editável pelo escritório. Deixe claro o que a assistente pode ou não pode falar, quando deve encaminhar ao humano e quais assuntos exigem atenção especial."
                  />
                  <Textarea
                    name="safetyInstructions"
                    rows={8}
                    defaultValue={settings.safetyInstructions}
                  />
                  <FieldError message={getFieldError("safetyInstructions")} />
                </label>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent forceMount value="teste" className="mt-5 grid gap-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Teste da assistente</CardTitle>
                <CardDescription>
                  Simule uma mensagem recebida pelo WhatsApp antes de liberar a automação.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <label className="space-y-2">
                  <FieldLabel
                    label="Mensagem do contato"
                    helpTitle="Mensagem de teste"
                    helpDescription="Escreva como se fosse uma mensagem real recebida no WhatsApp. O teste usa as configurações atuais da tela e não altera atendimentos reais."
                  />
                  <Textarea
                    name="simulationMessage"
                    rows={8}
                    defaultValue="Olá, preciso de ajuda com um problema jurídico. Pode me orientar?"
                  />
                  <FieldError message={simulationState.fieldErrors?.simulationMessage?.[0]} />
                </label>

                <Button
                  type="submit"
                  formAction={simulationFormAction}
                  disabled={isSimulationPending}
                  variant="secondary"
                  className="justify-self-start"
                >
                  <SendHorizontal className="h-4 w-4" />
                  {isSimulationPending ? "Testando..." : "Testar resposta"}
                </Button>

                <p className="text-xs leading-5 text-muted-foreground">
                  A simulação usa o modelo, personalidade, contexto, roteiro e limites
                  preenchidos nesta tela, mesmo antes de salvar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado do teste</CardTitle>
                <CardDescription>
                  Veja a resposta, a classificação e os alertas que a equipe receberia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulationResult
                  isPending={isSimulationPending}
                  state={simulationState}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 flex justify-end border-t bg-background/95 py-4 backdrop-blur">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar configuração da IA"}
        </Button>
      </div>
    </form>
  );
}

function SimulationResult({
  isPending,
  state,
}: {
  isPending: boolean;
  state: AiAssistantSimulationActionState;
}) {
  const result = state.result;

  if (isPending) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Gerando resposta de teste com as configurações atuais.
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
        Escreva uma mensagem de teste e clique em testar resposta. O resultado aparecerá
        aqui sem criar lead, conversa ou mensagem real.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-background p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Resposta sugerida
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
          {result.reply}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ResultMetric label="Modelo" value={result.model} />
        <ResultMetric
          label="Envio automático"
          value={result.shouldSendReply ? "Permitido pela IA" : "Não recomendado"}
        />
        <ResultMetric
          label="Encaminhamento humano"
          value={result.handoffRequired ? "Necessário" : "Não solicitado"}
        />
        <ResultMetric
          label="Prioridade"
          value={priorityLabel(result.classification.priority)}
        />
        <ResultMetric
          label="Área provável"
          value={optionalDisplay(result.classification.legalArea)}
        />
        <ResultMetric
          label="Potencial"
          value={`${result.classification.conversionPotential}%`}
        />
      </div>

      <div className="rounded-md border bg-background p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Resumo da classificação
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {optionalDisplay(result.classification.summary)}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ResultMetric label="Nome coletado" value={optionalDisplay(result.collectedFields.name)} />
        <ResultMetric label="Cidade" value={optionalDisplay(result.collectedFields.city)} />
        <ResultMetric
          label="Urgência"
          value={optionalDisplay(result.collectedFields.urgency)}
        />
        <ResultMetric
          label="Melhor horário"
          value={optionalDisplay(result.collectedFields.bestContactTime)}
        />
      </div>

      <div className="rounded-md border bg-background p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Segurança do atendimento
        </p>
        <div className="mt-3 grid gap-2 text-sm text-foreground md:grid-cols-2">
          <span>Revisão humana: {yesNo(result.safety.requiresHumanReview)}</span>
          <span>Promessa de resultado: {yesNo(result.safety.promisedOutcome)}</span>
          <span>Atuou como advogada: {yesNo(result.safety.impersonatedLawyer)}</span>
          <span>Orientação jurídica final: {yesNo(result.safety.gaveLegalAdvice)}</span>
        </div>
      </div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function optionalDisplay(value: string | null) {
  return value && value.trim().length > 0 ? value : "Não identificado";
}

function priorityLabel(value: "high" | "low" | "medium") {
  const labels = {
    high: "Alta",
    low: "Baixa",
    medium: "Média",
  } satisfies Record<typeof value, string>;

  return labels[value];
}

function yesNo(value: boolean) {
  return value ? "sim" : "não";
}

function FieldLabel({
  helpDescription,
  helpTitle,
  label,
}: {
  helpDescription: string;
  helpTitle: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
      {label}
      <HelpDialog title={helpTitle} description={helpDescription} />
    </span>
  );
}

function HelpDialog({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Entender ${title}`}
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="leading-6">{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <span className="block text-xs text-red-600 dark:text-red-300">{message}</span>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function operationModeLabel(value: AiAssistantSettings["operationMode"]) {
  return (
    aiAssistantOperationModes.find((mode) => mode.value === value)?.label ??
    aiAssistantOperationModes[0].label
  );
}
