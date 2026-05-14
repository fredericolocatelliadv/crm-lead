"use client";

import { useActionState, useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { addLeadNote, type LeadActionState } from "@/features/leads/actions";
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

export function LeadNoteDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addLeadNote.bind(null, leadId),
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
      return;
    }

    toast.error(state.message);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquarePlus className="h-4 w-4" />
          Adicionar observação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar observação interna</DialogTitle>
          <DialogDescription>
            Registre uma informação operacional para a equipe acompanhar este lead.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="lead-note" className="text-sm font-medium">
              Observação
            </label>
            <Textarea id="lead-note" name="content" rows={5} />
            {state.fieldErrors?.content?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.content[0]}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar observação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
