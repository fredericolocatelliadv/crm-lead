"use server";

import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

import {
  createEvolutionInstance,
  deleteEvolutionInstance,
  EvolutionConfigurationError,
  EvolutionRequestError,
  fetchEvolutionConnectionState,
  fetchEvolutionInstance,
  getEvolutionInstanceName,
  logoutEvolutionInstance,
  requestEvolutionQrCode,
  setEvolutionWebhook,
} from "@/server/integrations/evolution/client";
import { hasPermission } from "@/server/auth/permissions";
import { requireCurrentUser } from "@/server/auth/session";
import { createClient } from "@/server/supabase/server";
import { getCurrentUserRole } from "@/features/users/data/user-directory";
import { mapEvolutionStateToWhatsAppStatus } from "@/features/whatsapp/types/whatsapp";

const REMOTE_CHECK_ATTEMPTS = 4;
const REMOTE_CHECK_DELAY_MS = 800;

export type WhatsAppActionState = {
  message?: string;
  ok: boolean;
};

async function assertWhatsAppManageAccess() {
  const [user, role] = await Promise.all([requireCurrentUser(), getCurrentUserRole()]);

  if (!hasPermission(role, "whatsapp:manage")) {
    throw new Error("Permissão insuficiente.");
  }

  return user;
}

function friendlyEvolutionError(error: unknown) {
  if (error instanceof EvolutionConfigurationError) {
    return "Configure a conexão do WhatsApp antes de continuar.";
  }

  if (error instanceof EvolutionRequestError) {
    return "Não foi possível falar com o WhatsApp agora. Tente novamente em instantes.";
  }

  return "Não foi possível concluir a ação do WhatsApp.";
}

function revalidateWhatsAppPaths() {
  revalidatePath("/crm");
  revalidatePath("/crm/whatsapp");
  revalidatePath("/crm/conversas");
}

function formatOwnerPhone(ownerJid?: string | null) {
  return ownerJid?.split("@")[0] ?? null;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForRemoteConnectionStatus(
  predicate: (status: string) => boolean,
  instanceName = getEvolutionInstanceName(),
) {
  for (let attempt = 0; attempt < REMOTE_CHECK_ATTEMPTS; attempt += 1) {
    let status: string;

    try {
      const state = await fetchEvolutionConnectionState(instanceName);
      status = mapEvolutionStateToWhatsAppStatus(state);
    } catch {
      status = "disconnected";
    }

    if (predicate(status)) {
      return status;
    }

    await wait(REMOTE_CHECK_DELAY_MS);
  }

  return null;
}

async function waitUntilEvolutionInstanceIsRemoved(instanceName = getEvolutionInstanceName()) {
  for (let attempt = 0; attempt < REMOTE_CHECK_ATTEMPTS; attempt += 1) {
    const instance = await fetchEvolutionInstance(instanceName);

    if (!instance) {
      return true;
    }

    await wait(REMOTE_CHECK_DELAY_MS);
  }

  return false;
}

async function registerConnectionEvent(params: {
  createdBy: string;
  description?: string;
  instanceId: string;
  title: string;
  type: string;
}) {
  const supabase = await createClient();
  await supabase.from("whatsapp_connection_events").insert({
    created_by: params.createdBy,
    description: params.description ?? null,
    event_type: params.type,
    title: params.title,
    whatsapp_instance_id: params.instanceId,
  });
}

async function getOrCreateConnectionRecord(userId: string) {
  const supabase = await createClient();
  const instanceName = getEvolutionInstanceName();
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("whatsapp_instances")
    .select("id,is_active,connection_status")
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (existingError) {
    throw new Error("Não foi possível carregar a conexão do WhatsApp.");
  }

  if (existing) return existing;

  const { data, error } = await supabase
    .from("whatsapp_instances")
    .insert({
      connection_status: "not_configured",
      display_name: "WhatsApp do escritório",
      instance_name: instanceName,
      is_active: true,
      is_default: true,
      metadata: {},
      name: "WhatsApp do escritório",
      status: "not_configured",
      created_by: userId,
      updated_by: userId,
      updated_at: now,
    })
    .select("id,is_active,connection_status")
    .single();

  if (error) {
    throw new Error("Não foi possível preparar a conexão do WhatsApp.");
  }

  await registerConnectionEvent({
    createdBy: userId,
    instanceId: data.id,
    title: "Conexão preparada",
    type: "connection_prepared",
  });

  return data;
}

async function updateConnectionFromRemote(recordId: string, userId: string) {
  const supabase = await createClient();
  const instanceName = getEvolutionInstanceName();
  const remoteInstance = await fetchEvolutionInstance(instanceName);
  const now = new Date().toISOString();

  if (!remoteInstance) {
    const { error } = await supabase
      .from("whatsapp_instances")
      .update({
        connected_at: null,
        connection_status: "not_configured",
        disconnected_at: now,
        is_active: false,
        last_qr_code: null,
        last_synced_at: now,
        owner_jid: null,
        phone: null,
        profile_name: null,
        profile_picture_url: null,
        status: "not_configured",
        updated_at: now,
        updated_by: userId,
      })
      .eq("id", recordId);

    if (error) {
      throw new Error("Não foi possível atualizar o estado do WhatsApp.");
    }

    return "not_configured";
  }

  const state = await fetchEvolutionConnectionState(instanceName);
  const status = mapEvolutionStateToWhatsAppStatus(state);
  const isConnected = status === "connected";
  const ownerJid = isConnected ? remoteInstance.ownerJid ?? null : null;

  const { error } = await supabase
    .from("whatsapp_instances")
    .update({
      connected_at: isConnected ? now : null,
      connection_status: status,
      disconnected_at: status === "disconnected" ? now : null,
      last_synced_at: now,
      owner_jid: ownerJid,
      phone: formatOwnerPhone(ownerJid),
      profile_name: isConnected ? remoteInstance.profileName ?? null : null,
      profile_picture_url: isConnected ? remoteInstance.profilePicUrl ?? null : null,
      status,
      updated_at: now,
      updated_by: userId,
    })
    .eq("id", recordId);

  if (error) {
    throw new Error("Não foi possível atualizar o estado do WhatsApp.");
  }

  return status;
}

export async function connectWhatsApp(
  _previousState: WhatsAppActionState,
): Promise<WhatsAppActionState> {
  void _previousState;
  const user = await assertWhatsAppManageAccess();

  try {
    const record = await getOrCreateConnectionRecord(user.id);
    await createEvolutionInstance();

    const qrCode = await requestEvolutionQrCode();
    const rawCode = qrCode.code || qrCode.base64 || null;

    if (!rawCode) {
      return {
        message: "Não foi possível gerar o código de conexão.",
        ok: false,
      };
    }

    await QRCode.toDataURL(rawCode);

    let webhookConfigured = true;

    try {
      await setEvolutionWebhook();
    } catch {
      webhookConfigured = false;
    }

    const supabase = await createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("whatsapp_instances")
      .update({
        connection_status: "connecting",
        is_active: true,
        last_qr_at: now,
        last_qr_code: rawCode,
        last_synced_at: now,
        status: "connecting",
        updated_at: now,
        updated_by: user.id,
      })
      .eq("id", record.id);

    if (error) {
      return {
        message: "O código foi gerado, mas não foi possível salvar a conexão.",
        ok: false,
      };
    }

    await registerConnectionEvent({
      createdBy: user.id,
      description: webhookConfigured
        ? "Aguardando leitura pelo celular."
        : "QR Code gerado, mas o recebimento de mensagens ainda precisa ser verificado.",
      instanceId: record.id,
      title: "Código de conexão gerado",
      type: "qr_requested",
    });

    revalidateWhatsAppPaths();

    return {
      message: webhookConfigured
        ? "Código de conexão gerado."
        : "Código gerado. Verifique a configuração do recebimento de mensagens.",
      ok: true,
    };
  } catch (error) {
    return {
      message: friendlyEvolutionError(error),
      ok: false,
    };
  }
}

export async function refreshWhatsAppConnection(
  _previousState: WhatsAppActionState,
): Promise<WhatsAppActionState> {
  void _previousState;
  const user = await assertWhatsAppManageAccess();

  try {
    const record = await getOrCreateConnectionRecord(user.id);
    const status = await updateConnectionFromRemote(record.id, user.id);

    await registerConnectionEvent({
      createdBy: user.id,
      instanceId: record.id,
      title: status === "connected" ? "WhatsApp conectado" : "Conexão atualizada",
      type: "connection_refreshed",
    });

    revalidateWhatsAppPaths();

    return {
      message: status === "connected" ? "WhatsApp conectado." : "Conexão atualizada.",
      ok: true,
    };
  } catch (error) {
    return {
      message: friendlyEvolutionError(error),
      ok: false,
    };
  }
}

export async function disableWhatsAppConnection(): Promise<WhatsAppActionState> {
  const user = await assertWhatsAppManageAccess();
  const record = await getOrCreateConnectionRecord(user.id);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("whatsapp_instances")
    .update({
      connection_status: "disabled",
      is_active: false,
      status: "disabled",
      updated_at: now,
      updated_by: user.id,
    })
    .eq("id", record.id);

  if (error) {
    return { message: "Não foi possível desativar o WhatsApp.", ok: false };
  }

  await registerConnectionEvent({
    createdBy: user.id,
    description: "O histórico foi mantido no CRM.",
    instanceId: record.id,
    title: "WhatsApp desativado",
    type: "connection_disabled",
  });

  revalidateWhatsAppPaths();
  return { message: "WhatsApp desativado.", ok: true };
}

export async function reactivateWhatsAppConnection(): Promise<WhatsAppActionState> {
  try {
    const user = await assertWhatsAppManageAccess();
    const record = await getOrCreateConnectionRecord(user.id);
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("whatsapp_instances")
      .update({
        connection_status: "disconnected",
        is_active: true,
        status: "disconnected",
        updated_at: now,
        updated_by: user.id,
      })
      .eq("id", record.id);

    if (error) {
      return { message: "Não foi possível reativar o WhatsApp.", ok: false };
    }

    const status = await updateConnectionFromRemote(record.id, user.id);

    await registerConnectionEvent({
      createdBy: user.id,
      description:
        status === "connected"
          ? "A conexão já estava disponível para envio pelo CRM."
          : "Será necessário conectar novamente pelo QR Code antes de enviar mensagens.",
      instanceId: record.id,
      title: "WhatsApp reativado",
      type: "connection_reactivated",
    });

    revalidateWhatsAppPaths();
    return {
      message:
        status === "connected"
          ? "WhatsApp reativado e conectado."
          : "WhatsApp reativado. Gere um novo QR Code para conectar.",
      ok: true,
    };
  } catch (error) {
    return {
      message: friendlyEvolutionError(error),
      ok: false,
    };
  }
}

export async function disconnectWhatsAppConnection(): Promise<WhatsAppActionState> {
  const user = await assertWhatsAppManageAccess();

  try {
    const record = await getOrCreateConnectionRecord(user.id);
    await logoutEvolutionInstance();
    const remoteStatus = await waitForRemoteConnectionStatus((status) => status === "disconnected");

    if (remoteStatus !== "disconnected") {
      return {
        message: "O serviço de conexão ainda não confirmou a desconexão. Tente novamente em instantes.",
        ok: false,
      };
    }

    const supabase = await createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("whatsapp_instances")
      .update({
        connection_status: "disconnected",
        disconnected_at: now,
        is_active: true,
        last_qr_code: null,
        owner_jid: null,
        phone: null,
        status: "disconnected",
        updated_at: now,
        updated_by: user.id,
      })
      .eq("id", record.id);

    if (error) {
      return { message: "O WhatsApp saiu do celular, mas o CRM não atualizou.", ok: false };
    }

    await registerConnectionEvent({
      createdBy: user.id,
      description: "O histórico foi mantido no CRM.",
      instanceId: record.id,
      title: "WhatsApp desconectado",
      type: "connection_logged_out",
    });

    revalidateWhatsAppPaths();
    return { message: "WhatsApp desconectado.", ok: true };
  } catch (error) {
    return {
      message: friendlyEvolutionError(error),
      ok: false,
    };
  }
}

export async function deleteWhatsAppConnection(): Promise<WhatsAppActionState> {
  const user = await assertWhatsAppManageAccess();

  try {
    const record = await getOrCreateConnectionRecord(user.id);
    await logoutEvolutionInstance();
    await deleteEvolutionInstance();
    const wasRemoved = await waitUntilEvolutionInstanceIsRemoved();

    if (!wasRemoved) {
      return {
        message: "O serviço de conexão ainda não confirmou a exclusão. Tente novamente em instantes.",
        ok: false,
      };
    }

    const supabase = await createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("whatsapp_instances")
      .update({
        connection_status: "not_configured",
        disconnected_at: now,
        is_active: false,
        last_qr_code: null,
        owner_jid: null,
        phone: null,
        profile_name: null,
        profile_picture_url: null,
        status: "not_configured",
        updated_at: now,
        updated_by: user.id,
      })
      .eq("id", record.id);

    if (error) {
      return { message: "A conexão foi excluída, mas o CRM não atualizou.", ok: false };
    }

    await registerConnectionEvent({
      createdBy: user.id,
      description: "Mensagens e histórico comercial permanecem salvos.",
      instanceId: record.id,
      title: "Conexão excluída",
      type: "connection_deleted",
    });

    revalidateWhatsAppPaths();
    return { message: "Conexão excluída.", ok: true };
  } catch (error) {
    return {
      message: friendlyEvolutionError(error),
      ok: false,
    };
  }
}
