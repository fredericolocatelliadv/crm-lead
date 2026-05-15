"use client";

import { useState, useTransition } from "react";
import { Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

import { updateUserStatus } from "@/features/users/actions";
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

export function UserStatusButton({
  active,
  disabled,
  userId,
  userName,
}: {
  active: boolean;
  disabled?: boolean;
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nextActive = !active;

  function handleConfirm() {
    startTransition(async () => {
      const result = await updateUserStatus(userId, nextActive);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          {active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {active ? "Inativar" : "Ativar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{active ? "Inativar usuário" : "Reativar usuário"}</DialogTitle>
          <DialogDescription>
            {active
              ? `${userName} deixará de acessar o CRM. O histórico e os registros vinculados serão preservados.`
              : `${userName} voltará a acessar o CRM conforme o perfil de permissão configurado.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Salvando..." : active ? "Inativar usuário" : "Reativar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
