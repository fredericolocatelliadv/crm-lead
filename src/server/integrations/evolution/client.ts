import "server-only";

type EvolutionRequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "POST" | "PUT";
};

export type EvolutionConnectionState = "close" | "connecting" | "open" | string;

export type EvolutionInstanceSummary = {
  connectionStatus?: string;
  name?: string;
  ownerJid?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
};

export type EvolutionQrCodeResponse = {
  base64?: string;
  code?: string;
  count?: number;
  pairingCode?: string;
};

export type EvolutionSendTextResponse = {
  key?: {
    id?: string;
  };
  message?: unknown;
  messageTimestamp?: number;
  status?: string;
};

export type EvolutionSendMediaResponse = EvolutionSendTextResponse;

export type EvolutionMediaBase64Response = {
  base64?: string;
  mimetype?: string;
};

const evolutionWebhookEvents = [
  "QRCODE_UPDATED",
  "CONNECTION_UPDATE",
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "SEND_MESSAGE",
] as const;

export class EvolutionConfigurationError extends Error {
  constructor(message = "A conexão com o WhatsApp ainda não foi configurada.") {
    super(message);
    this.name = "EvolutionConfigurationError";
  }
}

export class EvolutionRequestError extends Error {
  status: number;

  constructor(status: number, message = "Não foi possível concluir a ação no WhatsApp.") {
    super(message);
    this.name = "EvolutionRequestError";
    this.status = status;
  }
}

export function getEvolutionInstanceName() {
  return process.env.EVOLUTION_INSTANCE_NAME?.trim() || "frederico-locatelli-crm";
}

function getEvolutionConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL?.trim() || "http://localhost:8080";
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();

  if (!apiKey) {
    throw new EvolutionConfigurationError();
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
  };
}

function getEvolutionWebhookUrl() {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new EvolutionConfigurationError("Webhook do WhatsApp ainda não foi configurado.");
  }

  const configuredUrl = process.env.EVOLUTION_WEBHOOK_URL?.trim();
  const appUrl = process.env.APP_URL?.trim()?.replace(/\/+$/, "") ?? "http://localhost:3000";
  const webhookPath = "/api/webhooks/evolution";
  const url = configuredUrl
    ? new URL(configuredUrl)
    : new URL(`${appUrl}${webhookPath}`);

  if (configuredUrl && (url.pathname === "/" || url.pathname === "")) {
    url.pathname = webhookPath;
  }

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    url.hostname = "host.docker.internal";
  }

  url.searchParams.set("secret", secret);

  return url.toString();
}

async function evolutionRequest<T>(
  path: string,
  options: EvolutionRequestOptions = {},
): Promise<T> {
  const config = getEvolutionConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      apikey: config.apiKey,
    },
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    throw new EvolutionRequestError(response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function createEvolutionInstance(instanceName = getEvolutionInstanceName()) {
  try {
    await evolutionRequest("/instance/create", {
      body: {
        alwaysOnline: false,
        groupsIgnore: true,
        instanceName,
        integration: "WHATSAPP-BAILEYS",
        qrcode: false,
        readMessages: false,
        readStatus: false,
        rejectCall: false,
        syncFullHistory: false,
      },
      method: "POST",
    });
  } catch (error) {
    if (error instanceof EvolutionRequestError && [400, 403, 409].includes(error.status)) {
      return;
    }

    throw error;
  }
}

export async function fetchEvolutionInstance(instanceName = getEvolutionInstanceName()) {
  let result: EvolutionInstanceSummary[] | EvolutionInstanceSummary;

  try {
    result = await evolutionRequest<EvolutionInstanceSummary[] | EvolutionInstanceSummary>(
      `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`,
    );
  } catch (error) {
    if (error instanceof EvolutionRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }

  return Array.isArray(result) ? result[0] ?? null : result;
}

export async function fetchEvolutionConnectionState(instanceName = getEvolutionInstanceName()) {
  const result = await evolutionRequest<{
    instance?: { instanceName?: string; state?: EvolutionConnectionState };
  }>(`/instance/connectionState/${encodeURIComponent(instanceName)}`);

  return result.instance?.state ?? "close";
}

export async function requestEvolutionQrCode(instanceName = getEvolutionInstanceName()) {
  return evolutionRequest<EvolutionQrCodeResponse>(
    `/instance/connect/${encodeURIComponent(instanceName)}`,
  );
}

export async function logoutEvolutionInstance(instanceName = getEvolutionInstanceName()) {
  try {
    await evolutionRequest(`/instance/logout/${encodeURIComponent(instanceName)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof EvolutionRequestError && error.status === 404) {
      return;
    }

    throw error;
  }
}

export async function deleteEvolutionInstance(instanceName = getEvolutionInstanceName()) {
  try {
    await evolutionRequest(`/instance/delete/${encodeURIComponent(instanceName)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof EvolutionRequestError && error.status === 404) {
      return;
    }

    throw error;
  }
}

export async function setEvolutionWebhook(instanceName = getEvolutionInstanceName()) {
  const webhook = {
    enabled: true,
    events: evolutionWebhookEvents,
    url: getEvolutionWebhookUrl(),
    webhookBase64: true,
    webhookByEvents: false,
  };
  const path = `/webhook/set/${encodeURIComponent(instanceName)}`;

  try {
    await evolutionRequest(path, {
      body: webhook,
      method: "POST",
    });
  } catch (error) {
    if (error instanceof EvolutionRequestError && error.status === 400) {
      await evolutionRequest(path, {
        body: { webhook },
        method: "POST",
      });
      return;
    }

    throw error;
  }
}

export async function sendEvolutionTextMessage(params: {
  instanceName?: string;
  text: string;
  to: string;
}) {
  const phone = params.to.replace(/\D/g, "");

  if (!phone) {
    throw new EvolutionRequestError(400, "Telefone inválido.");
  }

  return evolutionRequest<EvolutionSendTextResponse>(
    `/message/sendText/${encodeURIComponent(params.instanceName ?? getEvolutionInstanceName())}`,
    {
      body: {
        number: phone,
        text: params.text,
      },
      method: "POST",
    },
  );
}

export async function sendEvolutionMediaMessage(params: {
  caption?: string | null;
  file: File;
  fileName: string;
  instanceName?: string;
  mediaType: "audio" | "document" | "image";
  to: string;
}) {
  const phone = params.to.replace(/\D/g, "");

  if (!phone) {
    throw new EvolutionRequestError(400, "Telefone inválido.");
  }

  const media = Buffer.from(await params.file.arrayBuffer()).toString("base64");

  if (params.mediaType === "audio") {
    return evolutionRequest<EvolutionSendMediaResponse>(
      `/message/sendWhatsAppAudio/${encodeURIComponent(
        params.instanceName ?? getEvolutionInstanceName(),
      )}`,
      {
        body: {
          audio: media,
          number: phone,
        },
        method: "POST",
      },
    );
  }

  return evolutionRequest<EvolutionSendMediaResponse>(
    `/message/sendMedia/${encodeURIComponent(params.instanceName ?? getEvolutionInstanceName())}`,
    {
      body: {
        caption: params.caption?.trim() ?? "",
        fileName: params.fileName,
        media,
        mediatype: params.mediaType,
        mimetype: params.file.type || getFallbackMimeType(params.fileName, params.mediaType),
        number: phone,
      },
      method: "POST",
    },
  );
}

function getFallbackMimeType(fileName: string, mediaType: "document" | "image") {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (mediaType === "image") {
    if (extension === "avif") return "image/avif";
    if (extension === "heic") return "image/heic";
    if (extension === "heif") return "image/heif";
    if (extension === "png") return "image/png";
    if (extension === "webp") return "image/webp";

    return "image/jpeg";
  }

  if (extension === "csv") return "text/csv";
  if (extension === "doc") return "application/msword";
  if (extension === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (extension === "pdf") return "application/pdf";
  if (extension === "txt") return "text/plain";
  if (extension === "xls") return "application/vnd.ms-excel";
  if (extension === "xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return "application/octet-stream";
}

export async function getEvolutionMediaBase64(params: {
  convertToMp4?: boolean;
  instanceName?: string;
  message: unknown;
}) {
  return evolutionRequest<EvolutionMediaBase64Response>(
    `/chat/getBase64FromMediaMessage/${encodeURIComponent(
      params.instanceName ?? getEvolutionInstanceName(),
    )}`,
    {
      body: {
        convertToMp4: params.convertToMp4 ?? false,
        message: params.message,
      },
      method: "POST",
    },
  );
}
