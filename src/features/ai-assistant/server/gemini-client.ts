import "server-only";

import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

import {
  aiAssistantResponseJsonSchema,
  parseAiAssistantResponse,
} from "@/features/ai-assistant/schemas/ai-response-schema";
import type {
  AiAssistantModel,
  AiAssistantResponse,
} from "@/features/ai-assistant/types/ai-assistant";

const GEMINI_TIMEOUT_MS = 25_000;
const GEMINI_RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const GEMINI_MAX_ATTEMPTS = 3;
const DEFAULT_GEMINI_MODEL: AiAssistantModel = "gemini-2.5-flash";
const ALLOWED_GEMINI_MODELS = new Set<string>([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
]);

export class GeminiConfigurationError extends Error {
  constructor(message = "Gemini não configurado.") {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export class GeminiResponseError extends Error {
  constructor(message = "A resposta da IA não passou na validação.") {
    super(message);
    this.name = "GeminiResponseError";
  }
}

export class GeminiRequestError extends Error {
  attempts?: number;
  retryable?: boolean;
  status?: number;

  constructor(message = "Não foi possível chamar a IA agora.") {
    super(message);
    this.name = "GeminiRequestError";
  }
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiConfigurationError();
  }

  return apiKey;
}

export function getGeminiModel(configuredModel?: string | null) {
  const model = configuredModel?.trim() || process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  return ALLOWED_GEMINI_MODELS.has(model) ? model : DEFAULT_GEMINI_MODEL;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new GeminiRequestError("Tempo de resposta da IA esgotado.")), timeoutMs);
    }),
  ]);
}

function parseJsonResponse(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new GeminiResponseError("A IA retornou um formato inválido.");
  }
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  const status = "status" in error ? Number(error.status) : NaN;

  return Number.isFinite(status) ? status : undefined;
}

function isRetryableGeminiError(error: unknown) {
  const status = getErrorStatus(error);

  return typeof status === "number" && GEMINI_RETRYABLE_STATUSES.has(status);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAiAssistantResponse(
  prompt: string,
  model?: string | null,
): Promise<AiAssistantResponse> {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  const selectedModel = getGeminiModel(model);

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseJsonSchema: aiAssistantResponseJsonSchema,
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
              },
            ],
          },
        }),
        GEMINI_TIMEOUT_MS,
      );

      const parsedJson = parseJsonResponse(response.text ?? "");
      const parsed = parseAiAssistantResponse(parsedJson);

      if (!parsed.success) {
        throw new GeminiResponseError();
      }

      return parsed.data;
    } catch (error) {
      if (
        error instanceof GeminiConfigurationError ||
        error instanceof GeminiRequestError ||
        error instanceof GeminiResponseError
      ) {
        throw error;
      }

      const retryable = isRetryableGeminiError(error);
      const status = getErrorStatus(error);

      if (retryable && attempt < GEMINI_MAX_ATTEMPTS) {
        await delay(500 * attempt);
        continue;
      }

      const requestError = new GeminiRequestError();
      requestError.attempts = attempt;
      requestError.retryable = retryable;
      requestError.status = status;
      throw requestError;
    }
  }

  throw new GeminiRequestError();
}
