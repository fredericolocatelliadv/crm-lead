import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function AccessDenied({
  description = "Seu perfil não possui permissão para acessar esta área.",
  title = "Acesso restrito",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md border bg-muted">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm leading-6 text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
