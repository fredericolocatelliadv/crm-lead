"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteSiteContent, setSiteContentStatus } from "@/features/settings/actions";
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

type SiteContentTable = "team_members" | "testimonials" | "faqs";

const contentLabels: Record<SiteContentTable, string> = {
  faqs: "pergunta frequente",
  team_members: "membro da equipe",
  testimonials: "depoimento",
};

export function SiteContentStatusButton({
  active,
  id,
  table,
}: {
  active: boolean;
  id: string;
  table: SiteContentTable;
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
          const result = await setSiteContentStatus(table, id, { ok: false }, formData);

          if (!result.ok) {
            toast.error(result.message || "Não foi possível atualizar o conteúdo.");
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

export function SiteContentDeleteButton({
  id,
  table,
}: {
  id: string;
  table: SiteContentTable;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const label = contentLabels[table];

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
          <DialogTitle>Excluir {label}</DialogTitle>
          <DialogDescription>
            Esta ação remove o registro da área pública do site.
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
                const result = await deleteSiteContent(table, id);

                if (!result.ok) {
                  toast.error(result.message || "Não foi possível excluir o conteúdo.");
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
