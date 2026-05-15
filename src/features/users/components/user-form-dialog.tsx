"use client";

import { useActionState, useEffect, useState, type ComponentProps } from "react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createInternalUser,
  updateInternalUser,
  type UserActionState,
} from "@/features/users/actions";
import type { UserDirectoryItem } from "@/features/users/data/user-directory";
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
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: UserActionState = { ok: false };

export function UserFormDialog({ user }: { user?: UserDirectoryItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(
    user && publicAssignableRoles.includes(user.role as (typeof publicAssignableRoles)[number])
      ? user.role
      : "lawyer",
  );
  const [showOnSite, setShowOnSite] = useState(Boolean(user?.teamMemberId));
  const action = user ? updateInternalUser.bind(null, user.id) : createInternalUser;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isLawyer = role === "lawyer";

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
        <Button variant={user ? "outline" : "default"} size="sm">
          {user ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {user ? "Editar" : "Novo usuário"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            Cadastre acessos internos do CRM e, quando for advogado, defina se ele aparece na equipe do site.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="teamId" value={user?.teamMemberId ?? ""} />
          <input type="hidden" name="teamCurrentImage" value={user?.teamMember?.image ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              error={state.fieldErrors?.fullName?.[0]}
              label="Nome completo"
              name="fullName"
              defaultValue={user?.fullName ?? ""}
              required
            />
            <Field
              error={state.fieldErrors?.email?.[0]}
              label="E-mail de acesso"
              name="email"
              type="email"
              defaultValue={user?.email ?? ""}
              required
            />
            <Field
              error={state.fieldErrors?.phone?.[0]}
              label="Telefone"
              name="phone"
              defaultValue={user?.phone ?? ""}
              placeholder="11999999999"
            />
            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium">
                Perfil
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value as UserRole;
                  setRole(nextRole);
                  if (nextRole !== "lawyer") setShowOnSite(false);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {publicAssignableRoles.map((item) => (
                  <option key={item} value={item}>
                    {roleLabels[item]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-md border bg-muted/20 p-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Acesso ao sistema</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {user
                  ? "Preencha uma nova senha apenas quando precisar redefinir o acesso deste usuário."
                  : "Defina a senha inicial que será entregue ao usuário para acessar o CRM."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                autoComplete="new-password"
                error={state.fieldErrors?.password?.[0]}
                label={user ? "Nova senha" : "Senha inicial"}
                minLength={8}
                name="password"
                placeholder="Mínimo de 8 caracteres"
                required={!user}
                type="password"
              />
              <Field
                autoComplete="new-password"
                error={state.fieldErrors?.passwordConfirmation?.[0]}
                label={user ? "Confirmar nova senha" : "Confirmar senha inicial"}
                minLength={8}
                name="passwordConfirmation"
                placeholder="Repita a senha"
                required={!user}
                type="password"
              />
            </div>
          </div>

          <label className="flex gap-3 rounded-md border bg-muted/30 p-4">
            <input
              type="checkbox"
              name="active"
              defaultChecked={user?.active ?? true}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Usuário ativo</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                Usuários inativos não devem conseguir operar o CRM.
              </span>
            </span>
          </label>

          {isLawyer ? (
            <div className="space-y-4 rounded-md border p-4">
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  name="showOnSite"
                  checked={showOnSite}
                  onChange={(event) => setShowOnSite(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Exibir este advogado no site
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    Quando marcado, os dados abaixo serão usados na seção de equipe do site público.
                  </span>
                </span>
              </label>

              {showOnSite ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      error={state.fieldErrors?.teamRole?.[0]}
                      label="Cargo no site"
                      name="teamRole"
                      defaultValue={user?.teamMember?.role ?? "Advogado"}
                    />
                    <Field
                      error={state.fieldErrors?.teamOab?.[0]}
                      label="OAB"
                      name="teamOab"
                      defaultValue={user?.teamMember?.oab ?? ""}
                    />
                    <Field
                      error={state.fieldErrors?.teamEmail?.[0]}
                      label="E-mail público"
                      name="teamEmail"
                      type="email"
                      defaultValue={user?.teamMember?.email ?? user?.email ?? ""}
                    />
                    <Field
                      error={state.fieldErrors?.teamWhatsapp?.[0]}
                      label="WhatsApp público"
                      name="teamWhatsapp"
                      defaultValue={user?.teamMember?.whatsapp ?? user?.phone ?? ""}
                    />
                    <Field
                      error={state.fieldErrors?.teamInstagram?.[0]}
                      label="Instagram"
                      name="teamInstagram"
                      defaultValue={user?.teamMember?.instagram ?? ""}
                    />
                    <Field
                      error={state.fieldErrors?.teamLinkedin?.[0]}
                      label="LinkedIn"
                      name="teamLinkedin"
                      defaultValue={user?.teamMember?.linkedin ?? ""}
                    />
                    <Field
                      error={state.fieldErrors?.teamPosition?.[0]}
                      label="Posição"
                      name="teamPosition"
                      type="number"
                      defaultValue={String(user?.teamMember?.position ?? 0)}
                    />
                    <Field
                      error={state.fieldErrors?.teamImageFile?.[0]}
                      label="Foto"
                      name="teamImageFile"
                      type="file"
                    />
                  </div>
                  <TextAreaField
                    error={state.fieldErrors?.teamBio?.[0]}
                    label="Bio pública"
                    name="teamBio"
                    defaultValue={user?.teamMember?.bio ?? ""}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : user ? "Salvar usuário" : "Cadastrar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  error,
  label,
  name,
  ...props
}: ComponentProps<typeof Input> & {
  error?: string;
  label: string;
  name: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <Input id={name} name={name} {...props} />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  error,
  label,
  name,
  ...props
}: ComponentProps<typeof Textarea> & {
  error?: string;
  label: string;
  name: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <Textarea id={name} name={name} {...props} />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
