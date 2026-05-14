"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  createBlogPost,
  updateBlogPost,
  type BlogActionState,
} from "@/features/blog/actions";
import type { BlogPostFormData } from "@/features/blog/data/blog-content";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: BlogActionState = {
  ok: false,
};

export function BlogPostForm({ data }: { data: BlogPostFormData }) {
  const action = data.post ? updateBlogPost.bind(null, data.post.id) : createBlogPost;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {data.post ? "Editar post" : "Novo post"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Edite o conteúdo publicado no blog sem alterar o layout ou a identidade visual do site.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do post</CardTitle>
          <CardDescription>
            O post só aparece no site quando o status estiver como publicado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-5">
            <input name="currentImageUrl" type="hidden" defaultValue={data.post?.imageUrl ?? ""} />

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Título" error={state.fieldErrors?.title?.[0]}>
                <Input name="title" defaultValue={data.post?.title ?? ""} />
              </Field>
              <Field label="Slug" error={state.fieldErrors?.slug?.[0]}>
                <Input
                  name="slug"
                  defaultValue={data.post?.slug ?? ""}
                  placeholder="gerado pelo título se ficar vazio"
                />
              </Field>
              <Field label="Autor" error={state.fieldErrors?.author?.[0]}>
                <Input name="author" defaultValue={data.post?.author ?? ""} />
              </Field>
              <Field label="Imagem de capa" error={state.fieldErrors?.coverImage?.[0]}>
                <div className="space-y-3">
                  <Input
                    name="coverImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Envie JPG, PNG, WebP ou AVIF com até 5 MB.
                  </p>
                  {data.post?.imageUrl ? (
                    <a
                      href={data.post.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Ver imagem de capa atual
                    </a>
                  ) : null}
                </div>
              </Field>
              <Field label="Categoria" error={state.fieldErrors?.categoryId?.[0]}>
                <select
                  name="categoryId"
                  defaultValue={data.post?.categoryId ?? "none"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="none">Sem categoria</option>
                  {data.categories
                    .filter((category) => category.active || category.id === data.post?.categoryId)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Status" error={state.fieldErrors?.status?.[0]}>
                <select
                  name="status"
                  defaultValue={data.post?.status ?? "draft"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </Field>
              <Field label="Data de publicação" error={state.fieldErrors?.publishedAt?.[0]}>
                <Input
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(data.post?.publishedAt)}
                />
              </Field>
            </div>

            <Field label="Resumo" error={state.fieldErrors?.excerpt?.[0]}>
              <Textarea name="excerpt" rows={3} defaultValue={data.post?.excerpt ?? ""} />
            </Field>

            <Field label="Conteúdo" error={state.fieldErrors?.content?.[0]}>
              <Textarea
                name="content"
                rows={12}
                defaultValue={htmlToText(data.post?.content ?? "")}
              />
            </Field>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/crm/blog">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
    </label>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 16);
}

function htmlToText(value: string) {
  return value
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/?p>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
