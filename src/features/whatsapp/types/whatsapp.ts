export type WhatsAppConnectionStatus =
  | "connected"
  | "connecting"
  | "disabled"
  | "disconnected"
  | "not_configured"
  | "unavailable";

export const whatsAppStatusLabels: Record<WhatsAppConnectionStatus, string> = {
  connected: "Conectado",
  connecting: "Aguardando leitura",
  disabled: "Desativado",
  disconnected: "Desconectado",
  not_configured: "Não configurado",
  unavailable: "Indisponível",
};

export function mapEvolutionStateToWhatsAppStatus(
  state: string | null | undefined,
): WhatsAppConnectionStatus {
  if (state === "open") return "connected";
  if (state === "connecting") return "connecting";
  if (state === "close") return "disconnected";

  return "unavailable";
}
