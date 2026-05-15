import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getCurrentUserRole } from "@/features/users/data/user-directory";
import type {
  AiAssistantModel,
  AiAssistantOperationMode,
  AiAssistantSettings,
} from "@/features/ai-assistant/types/ai-assistant";
import {
  aiAssistantModels,
  aiAssistantOperationModes,
} from "@/features/ai-assistant/data/ai-options";
import { hasPermission } from "@/server/auth/permissions";
import { createClient } from "@/server/supabase/server";

type AiAssistantSettingsRow = {
  assistant_name: string;
  audio_transcription_enabled_when_ai_off: boolean | null;
  automatic_reply_enabled: boolean;
  enabled: boolean;
  max_context_messages: number;
  model: string | null;
  office_context: string | null;
  operation_mode: string | null;
  personality: string;
  prompt_instructions: string;
  response_style: string;
  safety_instructions: string | null;
  updated_at: string | null;
};

export const defaultAiAssistantSettings: AiAssistantSettings = {
  assistantName: "Assistente virtual",
  audioTranscriptionEnabledWhenAiOff: false,
  automaticReplyEnabled: false,
  enabled: false,
  maxContextMessages: 8,
  model: "gemini-2.5-flash",
  officeContext:
    "Descreva aqui informações gerais sobre o escritório: história, diferenciais, áreas atendidas, regiões de atuação, forma de atendimento e observações que ajudam a IA a contextualizar a conversa.",
  operationMode: "off",
  personality: "Cordial, objetiva, profissional e acolhedora.",
  promptInstructions:
    "Colete as informações essenciais do contato, organize o atendimento inicial, classifique a área jurídica provável e encaminhe para a equipe humana quando necessário.",
  responseStyle:
    "Use mensagens curtas, claras e em português do Brasil. Pergunte no máximo uma ou duas informações por vez.",
  safetyInstructions:
    "Não se apresente como advogada. Não prometa resultados, prazos, indenizações ou estratégias jurídicas. Quando a pergunta exigir análise jurídica, colete as informações essenciais e encaminhe para a equipe humana.",
  updatedAt: null,
};

function isAiAssistantModel(value: unknown): value is AiAssistantModel {
  return aiAssistantModels.some((model) => model.value === value);
}

function isAiAssistantOperationMode(value: unknown): value is AiAssistantOperationMode {
  return aiAssistantOperationModes.some((mode) => mode.value === value);
}

function mapAiAssistantSettings(row: AiAssistantSettingsRow | null): AiAssistantSettings {
  if (!row) return defaultAiAssistantSettings;

  const operationMode = isAiAssistantOperationMode(row.operation_mode)
    ? row.operation_mode
    : row.enabled
      ? row.automatic_reply_enabled
        ? "automatic"
        : "assisted"
      : "off";

  return {
    assistantName: row.assistant_name,
    audioTranscriptionEnabledWhenAiOff:
      operationMode === "off" && row.audio_transcription_enabled_when_ai_off === true,
    automaticReplyEnabled: operationMode === "automatic",
    enabled: operationMode !== "off",
    maxContextMessages: row.max_context_messages,
    model: isAiAssistantModel(row.model) ? row.model : defaultAiAssistantSettings.model,
    officeContext: row.office_context ?? defaultAiAssistantSettings.officeContext,
    operationMode,
    personality: row.personality,
    promptInstructions: row.prompt_instructions,
    responseStyle: row.response_style,
    safetyInstructions:
      row.safety_instructions ?? defaultAiAssistantSettings.safetyInstructions,
    updatedAt: row.updated_at,
  };
}

export async function getAiAssistantSettings(
  supabaseClient?: SupabaseClient,
): Promise<AiAssistantSettings> {
  const supabase = supabaseClient ?? (await createClient());
  const { data, error } = await supabase
    .from("ai_assistant_settings")
    .select(
      "enabled,automatic_reply_enabled,audio_transcription_enabled_when_ai_off,operation_mode,model,assistant_name,personality,prompt_instructions,response_style,safety_instructions,office_context,max_context_messages,updated_at",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar as configurações da IA.");
  }

  return mapAiAssistantSettings((data as AiAssistantSettingsRow | null) ?? null);
}

export async function getAiAssistantManagementData() {
  const role = await getCurrentUserRole();

  if (!hasPermission(role, "ai:manage")) {
    throw new Error("Permissão insuficiente para configurar a IA.");
  }

  return getAiAssistantSettings();
}
