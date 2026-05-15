import { Clock3, Phone, QrCode, ShieldCheck, UserRound } from "lucide-react";

import {
  WhatsAppDangerActions,
  WhatsAppPrimaryActions,
} from "@/features/whatsapp/components/whatsapp-actions";
import type { WhatsAppConnectionData } from "@/features/whatsapp/data/connection";
import {
  whatsAppStatusLabels,
  type WhatsAppConnectionStatus,
} from "@/features/whatsapp/types/whatsapp";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

function StatusBadge({ status }: { status: WhatsAppConnectionStatus }) {
  const className = {
    connected:
      "border-emerald-700/30 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950",
    connecting: "border-amber-700/30 bg-amber-500 text-amber-950",
    disabled: "border-slate-700/30 bg-slate-600 text-white",
    disconnected: "border-red-700/30 bg-red-600 text-white",
    not_configured: "border-slate-700/30 bg-slate-600 text-white",
    unavailable: "border-red-700/30 bg-red-600 text-white",
  } satisfies Record<WhatsAppConnectionStatus, string>;

  return (
    <Badge className={cn("px-3 py-1 text-sm font-semibold", className[status])}>
      {whatsAppStatusLabels[status]}
    </Badge>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Ainda não registrado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPhone(value: string | null) {
  if (!value) return "Não informado";

  const digits = value.replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 12 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

function getConnectionUseLabel(status: WhatsAppConnectionStatus) {
  const labels = {
    connected: "Disponível para atendimento",
    connecting: "Aguardando leitura do QR Code",
    disabled: "Pausado pela equipe",
    disconnected: "Desconectado do celular",
    not_configured: "Ainda não configurado",
    unavailable: "Aguardando nova verificação",
  } satisfies Record<WhatsAppConnectionStatus, string>;

  return labels[status];
}

export function WhatsAppConnectionView({
  canManage = true,
  data,
}: {
  canManage?: boolean;
  data: WhatsAppConnectionData;
}) {
  const status = data.connection?.connectionStatus ?? "not_configured";
  const hasConnection = Boolean(data.connection && status !== "not_configured");
  const showQrCode = status === "connecting" && data.qrCodeDataUrl;
  const showPrimaryActions = status !== "connected" && status !== "disabled";
  const connectionDetails = [
    {
      icon: Phone,
      label: "Número conectado",
      value: formatPhone(status === "connected" ? data.connection?.phone ?? null : null),
    },
    {
      icon: UserRound,
      label: "Nome do perfil",
      value:
        status === "connected" ? data.connection?.profileName || "Não informado" : "Não informado",
    },
    {
      icon: ShieldCheck,
      label: "Uso no CRM",
      value: getConnectionUseLabel(status),
    },
    {
      icon: Clock3,
      label: "Última verificação",
      value: formatDateTime(data.connection?.lastSyncedAt ?? null),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Atendimento
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            WhatsApp
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Conecte o WhatsApp do escritório ao CRM.
          </p>
        </div>
        <StatusBadge status={status} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conexão do WhatsApp</CardTitle>
            <CardDescription>
              {canManage
                ? "Controle o canal usado para enviar mensagens pelo atendimento."
                : "Acompanhe o canal usado para enviar mensagens pelo atendimento."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showQrCode ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-md border bg-white p-4">
                  <img
                    src={data.qrCodeDataUrl ?? ""}
                    alt="QR Code para conectar o WhatsApp"
                    className="h-auto w-full max-w-[300px]"
                  />
                </div>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Abra o WhatsApp no celular, acesse aparelhos conectados e leia o QR Code.
                </p>
              </div>
            ) : status === "connected" ? (
              <div className="rounded-md border border-emerald-700/25 bg-emerald-500/10 p-5 text-center">
                <p className="text-lg font-semibold text-foreground">WhatsApp conectado</p>
              </div>
            ) : status === "disabled" ? (
              <div className="rounded-md border bg-muted/40 p-5 text-center">
                <p className="text-lg font-semibold text-foreground">WhatsApp desativado</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  O CRM não enviará mensagens por este canal até a reativação.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-8 text-center">
                <QrCode className="h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">WhatsApp não conectado</p>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Gere um QR Code para conectar o celular que será usado no atendimento.
                </p>
              </div>
            )}

            {canManage ? (
              <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-start">
                {showPrimaryActions ? <WhatsAppPrimaryActions status={status} /> : null}
                <WhatsAppDangerActions hasConnection={hasConnection} status={status} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados da conexão</CardTitle>
            <CardDescription>
              Informações úteis para acompanhar o canal usado pela equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {connectionDetails.map((item) => (
                <div key={item.label} className="flex gap-3 rounded-md border bg-muted/20 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
