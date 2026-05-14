import { Bot, Clock3, Cpu, KeyRound } from "lucide-react";

import { AiAssistantSettingsForm } from "@/features/ai-assistant/components/ai-settings-form";
import {
  aiAssistantModels,
  aiAssistantOperationModes,
} from "@/features/ai-assistant/data/ai-options";
import type { AiAssistantSettings } from "@/features/ai-assistant/types/ai-assistant";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function AiAssistantSettingsView({ settings }: { settings: AiAssistantSettings }) {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const mode =
    aiAssistantOperationModes.find((item) => item.value === settings.operationMode) ??
    aiAssistantOperationModes[0];
  const model =
    aiAssistantModels.find((item) => item.value === settings.model) ?? aiAssistantModels[0];

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Inteligência artificial
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Assistente de atendimento
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Configure como a assistente deve apoiar o primeiro contato, com controle de
          operação, modelo, personalidade e diretrizes do escritório.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusPanel
          icon={Bot}
          title={mode.label}
          description={mode.description}
          tone={settings.operationMode === "off" ? "neutral" : "success"}
        />
        <StatusPanel
          icon={Cpu}
          title={model.label}
          description={model.description}
          tone="neutral"
        />
        <StatusPanel
          icon={KeyRound}
          title={geminiConfigured ? "Gemini configurado" : "Gemini pendente"}
          description={
            geminiConfigured
              ? "A chave da API está disponível no servidor."
              : "A chave da API ainda não foi configurada no ambiente."
          }
          tone={geminiConfigured ? "success" : "warning"}
        />
        <StatusPanel
          icon={Clock3}
          title="Última alteração"
          description={settings.updatedAt ? formatDate(settings.updatedAt) : "Ainda sem alteração manual."}
          tone="neutral"
        />
      </div>

      <AiAssistantSettingsForm settings={settings} />
    </div>
  );
}

function StatusPanel({
  description,
  icon: Icon,
  title,
  tone,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: "neutral" | "success" | "warning";
}) {
  const toneClass = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-black",
  }[tone];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
