"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { upsertBlogCategory, type BlogActionState } from "@/features/blog/actions";
import type { BlogCategory } from "@/features/blog/data/blog-content";
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

const initialState: BlogActionState = {
  ok: false,
};

export function BlogCategoryDialog({ category }: { category?: BlogCategory }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertBlogCategory, initialState);

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
        <Button variant={category ? "outline" : "default"} size={category ? "sm" : "default"}>
          {category ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {category ? "Editar" : "Nova categoria"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            Organize os posts sem alterar a estrutura visual do site público.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={category?.id ?? ""} />

          <div className="space-y-2">
            <label
              htmlFor={`category-name-${category?.id ?? "new"}`}
              className="text-sm font-medium"
            >
              Nome
            </label>
            <Input
              id={`category-name-${category?.id ?? "new"}`}
              name="name"
              defaultValue={category?.name}
            />
            {state.fieldErrors?.name?.[0] ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`category-description-${category?.id ?? "new"}`}
              className="text-sm font-medium"
            >
              Descrição
            </label>
            <Textarea
              id={`category-description-${category?.id ?? "new"}`}
              name="description"
              rows={3}
              defaultValue={category?.description ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
