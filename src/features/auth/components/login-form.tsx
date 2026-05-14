import { Scale } from "lucide-react";

import { signInWithPassword } from "@/features/auth/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

const errorMessages: Record<string, string> = {
  invalid_credentials: "E-mail ou senha inválidos.",
  missing_credentials: "Informe e-mail e senha para acessar.",
};

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  const message = error ? errorMessages[error] : null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border bg-muted">
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">Acessar CRM</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acompanhar leads, atendimentos e conversões.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={signInWithPassword} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {message ? (
            <div className="rounded-md border border-red-600/20 bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {message}
            </div>
          ) : null}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
