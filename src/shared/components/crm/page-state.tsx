import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface EmptyStateProps {
  action?: React.ReactNode;
  description: string;
  icon?: LucideIcon;
  title: string;
}

export function EmptyState({
  action,
  description,
  icon: Icon = Inbox,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  description?: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  description = "Tente novamente em instantes. Se o problema continuar, verifique o acesso e as permissões da operação.",
  onRetry,
  title = "Não foi possível carregar esta área",
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-red-600/20 bg-red-600/10 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {onRetry ? (
          <Button type="button" className="mt-5" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PageLoadingState() {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-24" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-80 max-w-full" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-20 rounded-md" />
            <Skeleton className="h-20 rounded-md" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
