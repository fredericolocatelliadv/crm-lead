import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  fetchEvolutionConnectionState,
  fetchEvolutionInstance,
  getEvolutionInstanceName,
} from "@/server/integrations/evolution/client";
import { mapEvolutionStateToWhatsAppStatus } from "@/features/whatsapp/types/whatsapp";

type WhatsAppInstanceRow = {
  connection_status: string | null;
  id: string;
  is_active: boolean | null;
};

export type EffectiveWhatsAppConnection = {
  active: boolean;
  connected: boolean;
  message: string;
  remoteChecked: boolean;
};

function formatOwnerPhone(ownerJid?: string | null) {
  return ownerJid?.split("@")[0] ?? null;
}

export async function getEffectiveWhatsAppConnection(
  supabase: SupabaseClient,
): Promise<EffectiveWhatsAppConnection> {
  const { data } = await supabase
    .from("whatsapp_instances")
    .select("id,connection_status,is_active")
    .eq("is_default", true)
    .maybeSingle();

  const connection = data as WhatsAppInstanceRow | null;

  if (!connection) {
    return {
      active: false,
      connected: false,
      message: "O WhatsApp ainda não foi configurado.",
      remoteChecked: false,
    };
  }

  if (!connection.is_active || connection.connection_status === "disabled") {
    return {
      active: false,
      connected: false,
      message: "O WhatsApp está desativado no CRM.",
      remoteChecked: false,
    };
  }

  try {
    const instanceName = getEvolutionInstanceName();
    const remoteInstance = await fetchEvolutionInstance(instanceName);
    const now = new Date().toISOString();

    if (!remoteInstance) {
      await supabase
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
        })
        .eq("id", connection.id);

      return {
        active: false,
        connected: false,
        message: "O WhatsApp ainda não foi configurado.",
        remoteChecked: true,
      };
    }

    const state = await fetchEvolutionConnectionState(instanceName);
    const status = mapEvolutionStateToWhatsAppStatus(state);
    const isConnected = status === "connected";
    const ownerJid = isConnected ? remoteInstance.ownerJid ?? null : null;

    await supabase
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
      })
      .eq("id", connection.id);

    if (status === "connected") {
      return {
        active: true,
        connected: true,
        message: "WhatsApp conectado.",
        remoteChecked: true,
      };
    }

    return {
      active: true,
      connected: false,
      message: "O WhatsApp não está conectado ao celular.",
      remoteChecked: true,
    };
  } catch {
    const now = new Date().toISOString();

    await supabase
      .from("whatsapp_instances")
      .update({
        connection_status: "unavailable",
        last_synced_at: now,
        status: "unavailable",
        updated_at: now,
      })
      .eq("id", connection.id);

    return {
      active: true,
      connected: false,
      message: "Não foi possível confirmar a conexão com o WhatsApp.",
      remoteChecked: true,
    };
  }
}
