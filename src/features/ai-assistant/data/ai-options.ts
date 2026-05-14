import type {
  AiAssistantModel,
  AiAssistantOperationMode,
} from "@/features/ai-assistant/types/ai-assistant";

export const aiAssistantModels = [
  {
    description: "Recomendado para atendimento: bom equilíbrio entre qualidade, custo e velocidade.",
    label: "Gemini 2.5 Flash",
    value: "gemini-2.5-flash",
  },
  {
    description: "Mais econômico e rápido para alto volume de conversas simples.",
    label: "Gemini 2.5 Flash-Lite",
    value: "gemini-2.5-flash-lite",
  },
  {
    description: "Mais criterioso para triagens complexas, com maior custo e latência.",
    label: "Gemini 2.5 Pro",
    value: "gemini-2.5-pro",
  },
] as const satisfies Array<{
  description: string;
  label: string;
  value: AiAssistantModel;
}>;

export const aiAssistantOperationModes = [
  {
    description: "A assistente não analisa nem responde atendimentos.",
    label: "Desligada",
    value: "off",
  },
  {
    description: "A IA resume, classifica e prepara sugestões para a equipe revisar antes do envio.",
    label: "Assistida",
    value: "assisted",
  },
  {
    description: "Modo principal: a IA responde no WhatsApp quando o fluxo e as diretrizes permitirem.",
    label: "Automática controlada",
    value: "automatic",
  },
] as const satisfies Array<{
  description: string;
  label: string;
  value: AiAssistantOperationMode;
}>;
