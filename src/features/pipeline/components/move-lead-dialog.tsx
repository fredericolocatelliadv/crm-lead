"use client";

import { useActionState, useEffect, useState } from "react";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { moveLeadStage, type MoveLeadStageState } from "@/features/pipeline/actions";
import type { PipelineStage } from "@/features/pipeline/types/pipeline";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: MoveLeadStageState = {
  ok: false,
};

type MoveLeadDialogProps = {
  currentStageId: string | null;
  leadId: string;
  leadName: string;
  stages: PipelineStage[];
  triggerLabel?: string;
};

export function MoveLeadDialog({
  currentStageId,
  leadId,
  leadName,
  stages,
  triggerLabel = "Mover",
}: MoveLeadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stageId, setStageId] = useState(currentStageId ?? stages[0]?.id ?? "");
  const [state, formAction, isPending] = useActionState(
    moveLeadStage.bind(null, leadId),
    initialState,
  );
  const selectedStage = stages.find((stage) => stage.id === stageId);

  useEffect(() => {
    if (!open) {
      setStageId(currentStageId ?? stages[0]?.id ?? "");
    }
  }, [currentStageId, open, stages]);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <MoveRight className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover lead no pipeline</DialogTitle>
          <DialogDescription>
            Escolha a nova etapa para {leadName}. Movimentos importantes serão registrados no histórico.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="stageId" value={stageId} />

          <div className="space-y-2">
            <label htmlFor={`stage-${leadId}`} className="text-sm font-medium">
              Etapa
            </label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger id={`stage-${leadId}`}>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.stageId?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.stageId[0]}
              </p>
            ) : null}
          </div>

          {selectedStage?.isLost ? (
            <div className="space-y-2">
              <label htmlFor={`lost-reason-${leadId}`} className="text-sm font-medium">
                Motivo da perda
              </label>
              <Textarea id={`lost-reason-${leadId}`} name="lostReason" rows={4} />
              {state.fieldErrors?.lostReason?.[0] ? (
                <p className="text-xs text-red-600 dark:text-red-300">
                  {state.fieldErrors.lostReason[0]}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !stageId}>
              {isPending ? "Movendo..." : "Salvar movimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
