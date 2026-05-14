"use client";

import { useActionState, useEffect, useState } from "react";
import { FileUp, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addCustomerNote,
  uploadCustomerAttachment,
  type CustomerActionState,
} from "@/features/customers/actions";
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
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: CustomerActionState = {
  ok: false,
};

export function CustomerNoteDialog({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addCustomerNote.bind(null, customerId),
    initialState,
  );

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
        <Button variant="outline">
          <MessageSquarePlus className="h-4 w-4" />
          Adicionar observação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar observação</DialogTitle>
          <DialogDescription>
            Registre uma informação comercial básica sobre este cliente.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="customer-note" className="text-sm font-medium">
              Observação
            </label>
            <Textarea id="customer-note" name="content" rows={5} />
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

export function CustomerAttachmentDialog({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    uploadCustomerAttachment.bind(null, customerId),
    initialState,
  );

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
        <Button variant="outline">
          <FileUp className="h-4 w-4" />
          Adicionar anexo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar anexo</DialogTitle>
          <DialogDescription>
            Envie um documento básico ligado ao cliente convertido.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="customer-attachment" className="text-sm font-medium">
              Arquivo
            </label>
            <Input
              id="customer-attachment"
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            />
            {state.fieldErrors?.file?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.file[0]}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                PDF, imagem, DOC ou DOCX com até 10 MB.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Salvar anexo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
