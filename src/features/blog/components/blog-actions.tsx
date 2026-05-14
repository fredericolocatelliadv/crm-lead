"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteBlogCategory,
  deleteBlogPost,
  setBlogCategoryStatus,
} from "@/features/blog/actions";
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

export function BlogPostDeleteButton({ postId }: { postId: string }) {
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
          const result = await deleteBlogPost(postId);

          if (!result.ok) {
            toast.error(result.message || "Não foi possível remover o post.");
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
      Remover
    </Button>
  );
}

export function BlogCategoryStatusButton({
  active,
  categoryId,
}: {
  active: boolean;
  categoryId: string;
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
          const result = await setBlogCategoryStatus(categoryId, { ok: false }, formData);

          if (!result.ok) {
            toast.error(result.message || "Não foi possível atualizar a categoria.");
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

export function BlogCategoryDeleteButton({ categoryId }: { categoryId: string }) {
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
          <DialogTitle>Excluir categoria</DialogTitle>
          <DialogDescription>
            Os posts vinculados continuarão cadastrados e ficarão marcados como sem categoria.
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
                const result = await deleteBlogCategory(categoryId);

                if (!result.ok) {
                  toast.error(result.message || "Não foi possível excluir a categoria.");
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Excluindo..." : "Excluir categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
