export type AiLeadPriority = "high" | "low" | "medium";
export type AiAssistantModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-pro";
export type AiAssistantOperationMode = "assisted" | "automatic" | "off";

export type AiAssistantCollectedFields = {
  bestContactTime: string | null;
  city: string | null;
  legalArea: string | null;
  name: string | null;
  phone: string | null;
  shortDescription: string | null;
  urgency: string | null;
};

export type AiAssistantClassification = {
  conversionPotential: number;
  immediateAttention: boolean;
  legalArea: string | null;
  priority: AiLeadPriority;
  summary: string | null;
};

export type AiAssistantSafety = {
  gaveLegalAdvice: boolean;
  impersonatedLawyer: boolean;
  promisedOutcome: boolean;
  requiresHumanReview: boolean;
};

export type AiAssistantResponse = {
  classification: AiAssistantClassification;
  collectedFields: AiAssistantCollectedFields;
  handoffRequired: boolean;
  reply: string;
  safety: AiAssistantSafety;
  shouldSendReply: boolean;
};

export type AiAssistantSettings = {
  assistantName: string;
  automaticReplyEnabled: boolean;
  enabled: boolean;
  maxContextMessages: number;
  model: AiAssistantModel;
  operationMode: AiAssistantOperationMode;
  officeContext: string;
  personality: string;
  promptInstructions: string;
  responseStyle: string;
  safetyInstructions: string;
  updatedAt: string | null;
};

export type AiConversationContext = {
  contact: {
    city: string | null;
    emailKnown: boolean;
    id: string | null;
    name: string | null;
    phoneKnown: boolean;
  };
  conversation: {
    assignedTo: string | null;
    aiPausedAt: string | null;
    channel: string;
    id: string;
    priority: AiLeadPriority;
    status: string;
  };
  customer: {
    id: string;
    name: string;
  } | null;
  lead: {
    bestContactTime: string | null;
    city: string | null;
    convertedAt: string | null;
    description: string | null;
    id: string;
    legalArea: string | null;
    lostAt: string | null;
    lostReason: string | null;
    name: string;
    priority: AiLeadPriority;
    source: string;
    summary: string | null;
  } | null;
  recentMessages: Array<{
    body: string;
    direction: "assistant" | "client" | "internal" | "team";
    sentAt: string;
  }>;
  targetMessage: {
    body: string;
    direction: string;
    id: string;
    kind: string;
    transcribedAudio: boolean;
  };
};

export type AiAssistantRunResult = {
  decision:
    | "blocked"
    | "failed"
    | "ready"
    | "saved_for_human"
    | "skipped";
  reason?: string;
  response?: AiAssistantResponse;
  sessionId?: string;
  shouldSendReply: boolean;
};
