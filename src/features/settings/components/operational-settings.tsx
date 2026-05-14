"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteQuickReply,
  deleteLegalArea,
  setQuickReplyStatus,
  setLegalAreaStatus,
  updateBusinessHours,
  upsertQuickReply,
  upsertLegalArea,
  type SettingsActionState,
} from "@/features/settings/actions";
import type {
  BusinessHourItem,
  LegalAreaItem,
  QuickReplyItem,
} from "@/features/settings/data/site-management";
import { Badge } from "@/shared/components/ui/badge";
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

const initialState: SettingsActionState = { ok: false };

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function QuickReplyDialog({ reply }: { reply?: QuickReplyItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertQuickReply, initialState);

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
        <Button variant={reply ? "outline" : "default"} size={reply ? "sm" : "default"}>
          {reply ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {reply ? "Editar" : "Nova resposta"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {reply ? "Editar resposta rápida" : "Nova resposta rápida"}
          </DialogTitle>
          <DialogDescription>
            Cadastre mensagens reutilizáveis para agilizar o atendimento nas conversas.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={reply?.id ?? ""} />
          <label className="block space-y-2">
            <span className="text-sm font-medium">Título</span>
            <Input name="title" defaultValue={reply?.title ?? ""} />
            {state.fieldErrors?.title?.[0] ? (
              <span className="block text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.title[0]}
              </span>
            ) : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Resposta</span>
            <Textarea name="content" rows={6} defaultValue={reply?.content ?? ""} />
            {state.fieldErrors?.content?.[0] ? (
              <span className="block text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.content[0]}
              </span>
            ) : null}
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar resposta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LegalAreaDialog({ area }: { area?: LegalAreaItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertLegalArea, initialState);

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
        <Button variant={area ? "outline" : "default"} size={area ? "sm" : "default"}>
          {area ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {area ? "Editar" : "Nova área"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{area ? "Editar área jurídica" : "Nova área jurídica"}</DialogTitle>
          <DialogDescription>
            Defina as áreas que aparecem nos formulários do site, leads e clientes.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={area?.id ?? ""} />
          <label className="block space-y-2">
            <span className="text-sm font-medium">Nome</span>
            <Input name="name" defaultValue={area?.name ?? ""} />
            {state.fieldErrors?.name?.[0] ? (
              <span className="block text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.name[0]}
              </span>
            ) : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Descrição interna</span>
            <Textarea name="description" rows={4} defaultValue={area?.description ?? ""} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Posição</span>
            <Input name="position" type="number" min={0} defaultValue={area?.position ?? 0} />
            {state.fieldErrors?.position?.[0] ? (
              <span className="block text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.position[0]}
              </span>
            ) : null}
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar área"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LegalAreaStatusButton({
  active,
  id,
}: {
  active: boolean;
  id: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("active", active ? "false" : "true");
          const result = await setLegalAreaStatus(id, { ok: false }, formData);

          if (!result.ok) {
            toast.error(result.message || "Não foi possível atualizar a área jurídica.");
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}

export function LegalAreaDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={isPending}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir área jurídica</DialogTitle>
          <DialogDescription>
            Áreas já usadas em leads não serão excluídas. Desative para remover de novos formulários.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteLegalArea(id);

                if (!result.ok) {
                  toast.error(result.message || "Não foi possível excluir a área jurídica.");
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuickReplyStatusButton({
  active,
  id,
}: {
  active: boolean;
  id: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("active", active ? "false" : "true");
          const result = await setQuickReplyStatus(id, { ok: false }, formData);

          if (!result.ok) {
            toast.error(result.message || "Não foi possível atualizar a resposta rápida.");
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}

export function QuickReplyDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={isPending}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir resposta rápida</DialogTitle>
          <DialogDescription>
            Esta ação remove a resposta da lista usada pela equipe nas conversas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteQuickReply(id);

                if (!result.ok) {
                  toast.error(result.message || "Não foi possível excluir a resposta rápida.");
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BusinessHoursForm({ hours }: { hours: BusinessHourItem[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateBusinessHours, initialState);
  const byDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="overflow-hidden rounded-md border">
        {weekDays.map((dayName, day) => {
          const hour = byDay.get(day);

          return (
            <div
              key={dayName}
              className="grid gap-4 border-b p-4 last:border-b-0 md:grid-cols-[minmax(180px,1fr)_140px_140px] md:items-center"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name={`enabled-${day}`}
                  defaultChecked={hour?.enabled ?? (day > 0 && day < 6)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{dayName}</span>
                  <span className="block text-xs text-muted-foreground">
                    Atendimento disponível neste dia
                  </span>
                </span>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Abertura</span>
                <Input
                  type="time"
                  name={`opensAt-${day}`}
                  defaultValue={formatTime(hour?.opensAt) ?? "09:00"}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Fechamento</span>
                <Input
                  type="time"
                  name={`closesAt-${day}`}
                  defaultValue={formatTime(hour?.closesAt) ?? "18:00"}
                />
              </label>
            </div>
          );
        })}
      </div>

      {state.message && !state.ok ? (
        <p className="text-sm text-red-600 dark:text-red-300">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar horários"}
        </Button>
      </div>
    </form>
  );
}

export function OperationalStatusBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? "success" : "neutral"}>{active ? "Ativo" : "Inativo"}</Badge>;
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : null;
}
