"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Power, QrCode, Trash2, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  connectWhatsApp,
  deleteWhatsAppConnection,
  disableWhatsAppConnection,
  disconnectWhatsAppConnection,
  reactivateWhatsAppConnection,
  refreshWhatsAppConnection,
  type WhatsAppActionState,
} from "@/features/whatsapp/actions";
import type { WhatsAppConnectionStatus } from "@/features/whatsapp/types/whatsapp";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

const initialState: WhatsAppActionState = { ok: false };

export function WhatsAppPrimaryActions({
  status,
}: {
  status: WhatsAppConnectionStatus;
}) {
  const router = useRouter();
  const [connectState, connectAction, isConnecting] = useActionState(
    connectWhatsApp,
    initialState,
  );
  const [refreshState, refreshAction] = useActionState(refreshWhatsAppConnection, initialState);
  const handledConnectMessage = useRef<string | null>(null);
  const handledRefreshMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!connectState.message || handledConnectMessage.current === connectState.message) return;

    handledConnectMessage.current = connectState.message;

    if (connectState.ok) {
      toast.success(connectState.message);
      router.refresh();
      return;
    }

    toast.error(connectState.message);
  }, [connectState, router]);

  useEffect(() => {
    if (!refreshState.message || handledRefreshMessage.current === refreshState.message) return;

    handledRefreshMessage.current = refreshState.message;

    if (refreshState.ok) {
      if (refreshState.message === "WhatsApp conectado.") {
        toast.success(refreshState.message);
      }

      router.refresh();
      return;
    }

    toast.error(refreshState.message);
  }, [refreshState, router]);

  useEffect(() => {
    if (status !== "connecting") return;

    const interval = window.setInterval(() => {
      const form = document.getElementById("whatsapp-refresh-form") as HTMLFormElement | null;
      form?.requestSubmit();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [status]);

  return (
    <>
      <form action={connectAction}>
        <Button type="submit" disabled={isConnecting}>
          <QrCode className="h-4 w-4" />
          {isConnecting ? "Preparando..." : "Gerar QR Code"}
        </Button>
      </form>
      <form id="whatsapp-refresh-form" action={refreshAction} className="hidden" />
    </>
  );
}

export function WhatsAppDangerActions({
  hasConnection,
  status,
}: {
  hasConnection: boolean;
  status: WhatsAppConnectionStatus;
}) {
  if (status === "disabled") {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        <ActionButton
          action={reactivateWhatsAppConnection}
          icon={Power}
          title="Reativar WhatsApp"
          description="O CRM voltará a usar esta conexão para atendimento."
          details={[
            "Se o celular ainda estiver conectado, o envio volta a funcionar.",
            "Se o celular tiver sido desconectado, será necessário ler um novo QR Code.",
            "O histórico de conversas permanece preservado.",
          ]}
          label="Reativar"
          confirmLabel="Reativar WhatsApp"
        />
        <ActionButton
          action={deleteWhatsAppConnection}
          icon={Trash2}
          title="Excluir conexão"
          description="A conexão será removida do serviço que liga o WhatsApp ao CRM."
          details={[
            "O telefone deixa de ficar vinculado a esta conexão.",
            "Para usar WhatsApp novamente, será necessário gerar e ler um novo QR Code.",
            "Mensagens, clientes, leads e histórico já salvos no CRM serão mantidos.",
          ]}
          label="Excluir"
          confirmLabel="Excluir conexão"
          destructive
        />
      </div>
    );
  }

  if (status !== "connected") {
    if (!hasConnection) {
      return null;
    }

    return (
      <div className="flex flex-wrap justify-center gap-2">
        <ActionButton
          action={disableWhatsAppConnection}
          icon={Power}
          title="Desativar WhatsApp"
          description="O CRM deixará de usar esta conexão até que ela seja reativada."
          details={[
            "A equipe não enviará mensagens pelo CRM enquanto estiver desativado.",
            "A conexão não será apagada.",
            "O histórico já salvo no CRM permanece preservado.",
          ]}
          label="Desativar"
          confirmLabel="Desativar WhatsApp"
        />
        <ActionButton
          action={deleteWhatsAppConnection}
          icon={Trash2}
          title="Excluir conexão"
          description="A conexão será removida do serviço que liga o WhatsApp ao CRM."
          details={[
            "O telefone deixa de ficar vinculado a esta conexão.",
            "Para usar WhatsApp novamente, será necessário gerar e ler um novo QR Code.",
            "Mensagens, clientes, leads e histórico já salvos no CRM serão mantidos.",
          ]}
          label="Excluir"
          confirmLabel="Excluir conexão"
          destructive
        />
      </div>
    );
  }

  if (!hasConnection) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ActionButton
        action={disconnectWhatsAppConnection}
        icon={Unplug}
        title="Desconectar WhatsApp"
        description="O WhatsApp será removido dos aparelhos conectados deste atendimento."
        details={[
          "O CRM para de enviar mensagens até uma nova leitura de QR Code.",
          "A conexão continua cadastrada para facilitar uma nova conexão depois.",
          "Mensagens, clientes, leads e histórico já salvos serão mantidos.",
        ]}
        label="Desconectar"
        confirmLabel="Desconectar WhatsApp"
      />
      <ActionButton
        action={disableWhatsAppConnection}
        icon={Power}
        title="Desativar WhatsApp"
        description="O CRM deixará de usar esta conexão sem remover o telefone do celular."
        details={[
          "A equipe não enviará mensagens pelo CRM enquanto estiver desativado.",
          "A conexão permanece guardada para reativação.",
          "Use esta opção para pausar o canal sem refazer a conexão.",
        ]}
        label="Desativar"
        confirmLabel="Desativar WhatsApp"
      />
      <ActionButton
        action={deleteWhatsAppConnection}
        icon={Trash2}
        title="Excluir conexão"
        description="A conexão será removida do serviço que liga o WhatsApp ao CRM."
        details={[
          "O telefone deixa de ficar vinculado a esta conexão.",
          "Para usar WhatsApp novamente, será necessário gerar e ler um novo QR Code.",
          "Mensagens, clientes, leads e histórico já salvos no CRM serão mantidos.",
        ]}
        label="Excluir"
        confirmLabel="Excluir conexão"
        destructive
      />
    </div>
  );
}

function ActionButton({
  action,
  confirmLabel,
  description,
  details,
  destructive = false,
  icon: Icon,
  label,
  title,
}: {
  action: () => Promise<WhatsAppActionState>;
  confirmLabel?: string;
  description: string;
  details?: string[];
  destructive?: boolean;
  icon: typeof Power;
  label: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={destructive ? "destructive" : "outline"} disabled={isPending}>
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p>{description}</p>
              {details?.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await action();

                if (!result.ok) {
                  toast.error(result.message || "Não foi possível concluir a ação.");
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Aguarde..." : confirmLabel ?? label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
