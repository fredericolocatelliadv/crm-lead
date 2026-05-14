import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import {
  BlogCategoryDeleteButton,
  BlogCategoryStatusButton,
  BlogPostDeleteButton,
} from "@/features/blog/components/blog-actions";
import { BlogCategoryDialog } from "@/features/blog/components/blog-category-dialog";
import type { BlogManagerData } from "@/features/blog/data/blog-content";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export function BlogManagerView({ data }: { data: BlogManagerData }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Site
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Blog e notícias
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Gerencie categorias e posts publicados no site sem alterar a identidade visual.
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/blog/novo">
            <Plus className="h-4 w-4" />
            Novo post
          </Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>
            Conteúdos do blog com status, categoria, autor e data de publicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.posts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Publicação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="min-w-72">
                        <p className="font-medium text-foreground">{post.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {post.author || "Autor não informado"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "success" : "neutral"}>
                        {post.status === "published" ? "Publicado" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.categoryName || "Sem categoria"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.publishedAt ? formatDate(post.publishedAt) : "Sem data"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/crm/blog/${post.id}/editar`}>
                            Editar
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <BlogPostDeleteButton postId={post.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum post cadastrado"
              description="Crie o primeiro post para que ele possa aparecer na área de notícias do site quando estiver publicado."
              action={
                <Button asChild>
                  <Link href="/crm/blog/novo">
                    <Plus className="h-4 w-4" />
                    Novo post
                  </Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Organização editorial dos posts do blog.</CardDescription>
          </div>
          <BlogCategoryDialog />
        </CardHeader>
        <CardContent>
          {data.categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{category.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.active ? "success" : "neutral"}>
                        {category.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "Sem descrição"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <BlogCategoryDialog category={category} />
                        <BlogCategoryStatusButton
                          active={category.active}
                          categoryId={category.id}
                        />
                        <BlogCategoryDeleteButton categoryId={category.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhuma categoria cadastrada"
              description="Cadastre categorias para organizar os posts do blog."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
