"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { updateUserRole } from "@/features/users/actions";
import {
  publicAssignableRoles,
  roleLabels,
  type UserRole,
} from "@/features/users/types/roles";
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

interface UserRoleDialogProps {
  currentRole: UserRole;
  disabled?: boolean;
  userId: string;
  userName: string;
}

export function UserRoleDialog({
  currentRole,
  disabled = false,
  userId,
  userName,
}: UserRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(
    publicAssignableRoles.includes(currentRole as (typeof publicAssignableRoles)[number])
      ? currentRole
      : "lawyer",
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);

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
          <ShieldCheck className="h-4 w-4" />
          Alterar perfil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar perfil de acesso</DialogTitle>
          <DialogDescription>
            Defina o nível de permissão para {userName}. Essa alteração afeta o
            acesso interno ao CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="user-role" className="text-sm font-medium">
            Perfil
          </label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger id="user-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {publicAssignableRoles.map((item) => (
                <SelectItem key={item} value={item}>
                  {roleLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar perfil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
