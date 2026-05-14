import QRCode from "qrcode";

import {
  fetchEvolutionConnectionState,
  fetchEvolutionInstance,
  getEvolutionInstanceName,
} from "@/server/integrations/evolution/client";
import { createClient } from "@/server/supabase/server";
import {
  mapEvolutionStateToWhatsAppStatus,
  type WhatsAppConnectionStatus,
} from "@/features/whatsapp/types/whatsapp";

export type WhatsAppConnectionRecord = {
  connectedAt: string | null;
  connectionStatus: WhatsAppConnectionStatus;
  disconnectedAt: string | null;
  displayName: string | null;
  id: string;
  isActive: boolean;
  lastQrAt: string | null;
  lastQrCode: string | null;
  lastSyncedAt: string | null;
  ownerJid: string | null;
  phone: string | null;
  profileName: string | null;
  profilePictureUrl: string | null;
};

export type WhatsAppConnectionEvent = {
  createdAt: string;
  description: string | null;
  id: string;
  title: string;
};

export type WhatsAppConnectionData = {
  connection: WhatsAppConnectionRecord | null;
  events: WhatsAppConnectionEvent[];
  qrCodeDataUrl: string | null;
};

type WhatsAppInstanceRow = {
  connected_at: string | null;
  connection_status: WhatsAppConnectionStatus;
  disconnected_at: string | null;
  display_name: string | null;
  id: string;
  is_active: boolean;
  last_qr_at: string | null;
  last_qr_code: string | null;
  last_synced_at: string | null;
  owner_jid: string | null;
  phone: string | null;
  profile_name: string | null;
  profile_picture_url: string | null;
};

function formatOwnerPhone(ownerJid?: string | null) {
  return ownerJid?.split("@")[0] ?? null;
}

function resolveDisplayStatus(connection: WhatsAppInstanceRow) {
  if (connection.is_active) return connection.connection_status;
  if (connection.connection_status === "not_configured") return "not_configured";

  return "disabled";
}

async function buildQrCodeDataUrl(code: string | null) {
  if (!code) return null;
  if (code.startsWith("data:image/")) return code;

  return QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 7,
  });
}

export async function getWhatsAppConnectionData(): Promise<WhatsAppConnectionData> {
  const supabase = await createClient();
  const instanceName = getEvolutionInstanceName();

  const { data: row, error } = await supabase
    .from("whatsapp_instances")
    .select(
      "id,display_name,connection_status,is_active,phone,owner_jid,profile_name,profile_picture_url,last_qr_code,last_qr_at,last_synced_at,connected_at,disconnected_at",
    )
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a conexão do WhatsApp.");
  }

  let connection = row as WhatsAppInstanceRow | null;

  if (connection?.is_active) {
    try {
      const remoteInstance = await fetchEvolutionInstance(instanceName);
      const now = new Date().toISOString();

      if (!remoteInstance) {
        const { data: updated } = await supabase
          .from("whatsapp_instances")
          .update({
            connected_at: null,
            connection_status: "not_configured",
            disconnected_at: connection.disconnected_at ?? now,
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
          .eq("id", connection.id)
          .select(
            "id,display_name,connection_status,is_active,phone,owner_jid,profile_name,profile_picture_url,last_qr_code,last_qr_at,last_synced_at,connected_at,disconnected_at",
          )
          .maybeSingle();

        connection = (updated as WhatsAppInstanceRow | null) ?? {
          ...connection,
          connected_at: null,
          connection_status: "not_configured",
          disconnected_at: connection.disconnected_at ?? now,
          is_active: false,
          last_qr_code: null,
          last_synced_at: now,
          owner_jid: null,
          phone: null,
          profile_name: null,
          profile_picture_url: null,
        };
      } else {
        const state = await fetchEvolutionConnectionState(instanceName);
        const status = mapEvolutionStateToWhatsAppStatus(state);
        const isConnected = status === "connected";
        const ownerJid = isConnected ? remoteInstance.ownerJid ?? connection.owner_jid : null;

        const { data: updated } = await supabase
          .from("whatsapp_instances")
          .update({
            connection_status: status,
            connected_at: isConnected ? connection.connected_at ?? now : null,
            disconnected_at: status === "disconnected" ? now : connection.disconnected_at,
            last_synced_at: now,
            owner_jid: ownerJid,
            phone: formatOwnerPhone(ownerJid),
            profile_name: isConnected ? remoteInstance.profileName ?? connection.profile_name : null,
            profile_picture_url: isConnected
              ? remoteInstance.profilePicUrl ?? connection.profile_picture_url
              : null,
            status,
            updated_at: now,
          })
          .eq("id", connection.id)
          .select(
            "id,display_name,connection_status,is_active,phone,owner_jid,profile_name,profile_picture_url,last_qr_code,last_qr_at,last_synced_at,connected_at,disconnected_at",
          )
          .maybeSingle();

        connection = (updated as WhatsAppInstanceRow | null) ?? connection;
      }
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

      connection = {
        ...connection,
        connection_status: "unavailable",
        last_synced_at: now,
      };
    }
  }

  const { data: events, error: eventsError } = connection
    ? await supabase
        .from("whatsapp_connection_events")
        .select("id,title,description,created_at")
        .eq("whatsapp_instance_id", connection.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [], error: null };

  if (eventsError) {
    throw new Error("Não foi possível carregar o histórico do WhatsApp.");
  }

  return {
    connection: connection
      ? {
          connectedAt: connection.connected_at,
          connectionStatus: resolveDisplayStatus(connection),
          disconnectedAt: connection.disconnected_at,
          displayName: connection.display_name,
          id: connection.id,
          isActive: connection.is_active,
          lastQrAt: connection.last_qr_at,
          lastQrCode: connection.last_qr_code,
          lastSyncedAt: connection.last_synced_at,
          ownerJid: connection.owner_jid,
          phone: connection.phone,
          profileName: connection.profile_name,
          profilePictureUrl: connection.profile_picture_url,
        }
      : null,
    events: (events ?? []).map((event) => ({
      createdAt: event.created_at,
      description: event.description,
      id: event.id,
      title: event.title,
    })),
    qrCodeDataUrl: await buildQrCodeDataUrl(connection?.last_qr_code ?? null),
  };
}
