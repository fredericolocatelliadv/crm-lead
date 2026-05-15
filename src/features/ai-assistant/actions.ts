"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  aiAssistantModels,
  aiAssistantOperationModes,
} from "@/features/ai-assistant/data/ai-options";
import { generateAiAssistantResponse } from "@/features/ai-assistant/server/gemini-client";
import { buildAiAssistantPrompt } from "@/features/ai-assistant/server/prompt";
import type {
  AiAssistantResponse,
  AiAssistantSettings,
  AiConversationContext,
} from "@/features/ai-assistant/types/ai-assistant";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";

export type AiAssistantSettingsActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
};

export type AiAssistantSimulationActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  ok: boolean;
  result?: AiAssistantResponse & {
    model: string;
  };
};

const modelValues = aiAssistantModels.map((model) => model.value) as [
  (typeof aiAssistantModels)[number]["value"],
  ...(typeof aiAssistantModels)[number]["value"][],
];
const operationModeValues = aiAssistantOperationModes.map((mode) => mode.value) as [
  (typeof aiAssistantOperationModes)[number]["value"],
  ...(typeof aiAssistantOperationModes)[number]["value"][],
];

const aiAssistantSettingsSchema = z.object({
  assistantName: z.string().trim().min(2, "Informe o nome da assistente.").max(80),
  maxContextMessages: z.coerce
    .number()
    .int()
    .min(1, "Use pelo menos 1 mensagem.")
    .max(20, "Use no máximo 20 mensagens."),
  model: z.enum(modelValues),
  officeContext: z
    .string()
    .trim()
    .min(20, "Descreva o escritório com mais detalhes.")
    .max(6000, "O texto sobre o escritório deve ser mais curto."),
  operationMode: z.enum(operationModeValues),
  personality: z
    .string()
    .trim()
    .min(10, "Descreva a personalidade com mais detalhes.")
    .max(1200, "A personalidade deve ser mais curta."),
  promptInstructions: z
    .string()
    .trim()
    .min(20, "Informe instruções suficientes para orientar a IA.")
    .max(4000, "As instruções devem ser mais curtas."),
  responseStyle: z
    .string()
    .trim()
    .min(10, "Informe o estilo de resposta.")
    .max(1200, "O estilo de resposta deve ser mais curto."),
  safetyInstructions: z
    .string()
    .trim()
    .min(20, "Informe as diretrizes de segurança do atendimento.")
    .max(2500, "As diretrizes devem ser mais curtas."),
});

const aiAssistantSimulationSchema = aiAssistantSettingsSchema.extend({
  simulationMessage: z
    .string()
    .trim()
    .min(3, "Informe uma mensagem para testar.")
    .max(1200, "Use uma mensagem de teste mais curta."),
});

async function assertAiSettingsAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "ai:manage")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

function buildSettingsFromInput(
  data: z.infer<typeof aiAssistantSettingsSchema>,
): AiAssistantSettings {
  return {
    assistantName: data.assistantName,
    automaticReplyEnabled: data.operationMode === "automatic",
    enabled: data.operationMode !== "off",
    maxContextMessages: data.maxContextMessages,
    model: data.model,
    officeContext: data.officeContext,
    operationMode: data.operationMode,
    personality: data.personality,
    promptInstructions: data.promptInstructions,
    responseStyle: data.responseStyle,
    safetyInstructions: data.safetyInstructions,
    updatedAt: null,
  };
}

function buildSimulationContext(message: string): AiConversationContext {
  const now = new Date().toISOString();

  return {
    contact: {
      city: null,
      emailKnown: false,
      id: null,
      name: null,
      phoneKnown: true,
    },
    conversation: {
      assignedTo: null,
      aiPausedAt: null,
      channel: "whatsapp",
      id: "simulacao",
      priority: "medium",
      status: "open",
    },
    customer: null,
    lead: null,
    recentMessages: [
      {
        body: message,
        direction: "client",
        sentAt: now,
      },
    ],
    targetMessage: {
      body: message,
      direction: "inbound",
      id: "simulacao",
      kind: "text",
    },
  };
}

function parseSettingsFormData(formData: FormData) {
  return {
    assistantName: formData.get("assistantName"),
    maxContextMessages: formData.get("maxContextMessages"),
    model: formData.get("model"),
    officeContext: formData.get("officeContext"),
    operationMode: formData.get("operationMode"),
    personality: formData.get("personality"),
    promptInstructions: formData.get("promptInstructions"),
    responseStyle: formData.get("responseStyle"),
    safetyInstructions: formData.get("safetyInstructions"),
  };
}

export async function updateAiAssistantSettings(
  _previousState: AiAssistantSettingsActionState,
  formData: FormData,
): Promise<AiAssistantSettingsActionState> {
  const user = await assertAiSettingsAccess();
  const parsed = aiAssistantSettingsSchema.safeParse(parseSettingsFormData(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise as configurações da IA.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const enabled = parsed.data.operationMode !== "off";
  const automaticReplyEnabled = parsed.data.operationMode === "automatic";
  const { error } = await supabase.from("ai_assistant_settings").upsert({
    id: 1,
    assistant_name: parsed.data.assistantName,
    automatic_reply_enabled: automaticReplyEnabled,
    enabled,
    max_context_messages: parsed.data.maxContextMessages,
    model: parsed.data.model,
    office_context: parsed.data.officeContext,
    operation_mode: parsed.data.operationMode,
    personality: parsed.data.personality,
    prompt_instructions: parsed.data.promptInstructions,
    response_style: parsed.data.responseStyle,
    safety_instructions: parsed.data.safetyInstructions,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  if (error) {
    return {
      message: "Não foi possível salvar as configurações da IA.",
      ok: false,
    };
  }

  revalidatePath("/crm/ia");

  return {
    message: "Configurações da IA salvas.",
    ok: true,
  };
}

export async function simulateAiAssistantResponse(
  _previousState: AiAssistantSimulationActionState,
  formData: FormData,
): Promise<AiAssistantSimulationActionState> {
  await assertAiSettingsAccess();

  const parsed = aiAssistantSimulationSchema.safeParse({
    ...parseSettingsFormData(formData),
    simulationMessage: formData.get("simulationMessage"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revise os campos antes de testar a assistente.",
      ok: false,
    };
  }

  const settings = buildSettingsFromInput(parsed.data);

  try {
    const response = await generateAiAssistantResponse(
      buildAiAssistantPrompt(
        buildSimulationContext(parsed.data.simulationMessage),
        settings,
      ),
      settings.model,
    );

    return {
      message: "Teste concluído.",
      ok: true,
      result: {
        ...response,
        model:
          aiAssistantModels.find((model) => model.value === settings.model)?.label ??
          settings.model,
      },
    };
  } catch {
    return {
      message:
        "Não foi possível executar o teste agora. Confira se a IA está configurada no servidor e tente novamente.",
      ok: false,
    };
  }
}
