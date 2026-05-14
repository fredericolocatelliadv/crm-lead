"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  convertLead,
  markLeadAsLost,
  type LeadActionState,
} from "@/features/leads/actions";
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
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: LeadActionState = {
  ok: false,
};

export function LeadStatusActions({
  canConvert,
  canMarkLost,
  leadId,
}: {
  canConvert: boolean;
  canMarkLost: boolean;
  leadId: string;
}) {
  const router = useRouter();
  const [isConverting, startConvertTransition] = useTransition();

  function handleConvert() {
    startConvertTransition(async () => {
      const result = await convertLead(leadId);

      if (!result.ok) {
        toast.error(result.message || "Não foi possível converter o lead.");
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={handleConvert} disabled={!canConvert || isConverting}>
        <CheckCircle2 className="h-4 w-4" />
        {isConverting ? "Convertendo..." : "Converter em cliente"}
      </Button>
      <LostLeadDialog leadId={leadId} disabled={!canMarkLost} onSuccess={() => router.refresh()} />
    </div>
  );
}

function LostLeadDialog({
  disabled,
  leadId,
  onSuccess,
}: {
  disabled: boolean;
  leadId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    markLeadAsLost.bind(null, leadId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      onSuccess();
      return;
    }

    toast.error(state.message);
  }, [onSuccess, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <XCircle className="h-4 w-4" />
          Marcar como perdido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar lead como perdido</DialogTitle>
          <DialogDescription>
            Informe o motivo para manter o histórico comercial completo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="lost-reason" className="text-sm font-medium">
              Motivo da perda
            </label>
            <Textarea id="lost-reason" name="reason" rows={4} />
            {state.fieldErrors?.reason?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.reason[0]}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Confirmar perda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
