import { z } from "zod";

import type { AiAssistantResponse } from "@/features/ai-assistant/types/ai-assistant";

const nullableText = z.string().trim().min(1).nullable();

export const aiAssistantResponseSchema = z.object({
  reply: z.string().trim().min(1).max(700),
  shouldSendReply: z.boolean(),
  handoffRequired: z.boolean(),
  collectedFields: z.object({
    name: nullableText,
    phone: nullableText,
    city: nullableText,
    legalArea: nullableText,
    shortDescription: nullableText,
    urgency: nullableText,
    bestContactTime: nullableText,
  }),
  classification: z.object({
    legalArea: nullableText,
    priority: z.enum(["low", "medium", "high"]),
    conversionPotential: z.number().int().min(0).max(100),
    immediateAttention: z.boolean(),
    summary: nullableText,
  }),
  safety: z.object({
    gaveLegalAdvice: z.boolean(),
    promisedOutcome: z.boolean(),
    impersonatedLawyer: z.boolean(),
    requiresHumanReview: z.boolean(),
  }),
}) satisfies z.ZodType<AiAssistantResponse>;

export const aiAssistantResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "reply",
    "shouldSendReply",
    "handoffRequired",
    "collectedFields",
    "classification",
    "safety",
  ],
  propertyOrdering: [
    "reply",
    "shouldSendReply",
    "handoffRequired",
    "collectedFields",
    "classification",
    "safety",
  ],
  properties: {
    reply: {
      type: "string",
      description: "Mensagem curta, segura e cordial para o contato.",
    },
    shouldSendReply: {
      type: "boolean",
      description: "Se a resposta pode ser enviada automaticamente.",
    },
    handoffRequired: {
      type: "boolean",
      description: "Se a conversa deve ser encaminhada para humano.",
    },
    collectedFields: {
      type: "object",
      additionalProperties: false,
      required: [
        "name",
        "phone",
        "city",
        "legalArea",
        "shortDescription",
        "urgency",
        "bestContactTime",
      ],
      propertyOrdering: [
        "name",
        "phone",
        "city",
        "legalArea",
        "shortDescription",
        "urgency",
        "bestContactTime",
      ],
      properties: {
        name: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        city: { type: ["string", "null"] },
        legalArea: { type: ["string", "null"] },
        shortDescription: { type: ["string", "null"] },
        urgency: { type: ["string", "null"] },
        bestContactTime: { type: ["string", "null"] },
      },
    },
    classification: {
      type: "object",
      additionalProperties: false,
      required: [
        "legalArea",
        "priority",
        "conversionPotential",
        "immediateAttention",
        "summary",
      ],
      propertyOrdering: [
        "legalArea",
        "priority",
        "conversionPotential",
        "immediateAttention",
        "summary",
      ],
      properties: {
        legalArea: { type: ["string", "null"] },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        conversionPotential: { type: "integer", minimum: 0, maximum: 100 },
        immediateAttention: { type: "boolean" },
        summary: { type: ["string", "null"] },
      },
    },
    safety: {
      type: "object",
      additionalProperties: false,
      required: [
        "gaveLegalAdvice",
        "promisedOutcome",
        "impersonatedLawyer",
        "requiresHumanReview",
      ],
      propertyOrdering: [
        "gaveLegalAdvice",
        "promisedOutcome",
        "impersonatedLawyer",
        "requiresHumanReview",
      ],
      properties: {
        gaveLegalAdvice: { type: "boolean" },
        promisedOutcome: { type: "boolean" },
        impersonatedLawyer: { type: "boolean" },
        requiresHumanReview: { type: "boolean" },
      },
    },
  },
} as const;

export function parseAiAssistantResponse(value: unknown) {
  return aiAssistantResponseSchema.safeParse(value);
}
