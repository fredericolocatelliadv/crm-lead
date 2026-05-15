import { ShieldCheck, Users } from "lucide-react";

import { RoleBadge } from "@/features/users/components/role-badge";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserRoleDialog } from "@/features/users/components/user-role-dialog";
import { UserStatusButton } from "@/features/users/components/user-status-button";
import { getUserDirectory } from "@/features/users/data/user-directory";
import {
  publicAssignableRoles,
  roleLabels,
  type UserRole,
} from "@/features/users/types/roles";
import { hasPermission } from "@/server/auth/permissions";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge } from "@/shared/components/ui/badge";
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

const roleDescriptions: Record<UserRole, string> = {
  admin: "Controle de acesso, configurações e operação completa.",
  attendant: "Perfil legado para atendimento comercial.",
  lawyer: "Atende leads, conversas, pipeline, clientes, blog e relatórios.",
  manager: "Perfil legado para gestão operacional.",
  marketing: "Cuida de conteúdo, campanhas, SEO e análise de captação.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UsersPage() {
  const access = await getPageAccess("users:manage");

  if (!access.allowed) {
    return <AccessDenied description="Somente administradores podem gerenciar usuários e permissões." />;
  }

  const { currentUserId, currentUserRole, users } = await getUserDirectory();
  const canManageUsers = hasPermission(currentUserRole, "users:manage");

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="neutral" className="mb-3">
            Acesso interno
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Usuários e permissões
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Controle quem pode acessar o CRM e quais áreas cada perfil pode operar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
            Seu perfil: <span className="font-medium text-foreground">{roleLabels[currentUserRole]}</span>
          </div>
          {canManageUsers ? <UserFormDialog /> : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {publicAssignableRoles.map((role) => (
          <Card key={role}>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <CardTitle>{roleLabels[role]}</CardTitle>
              <CardDescription>{roleDescriptions[role]}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle>Usuários autorizados</CardTitle>
          <CardDescription>
            Lista de perfis internos liberados para acessar o CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Equipe do site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const displayName = user.fullName || user.email || "Usuário";
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{displayName}</span>
                            {isCurrentUser ? <Badge variant="neutral">Você</Badge> : null}
                          </div>
                          {user.email ? (
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        {user.teamMemberId ? (
                          <Badge variant="info">Exibido no site</Badge>
                        ) : (
                          <Badge variant="neutral">Interno</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "success" : "neutral"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <UserFormDialog user={user} />
                          <UserRoleDialog
                            currentRole={user.role}
                            disabled={!canManageUsers || isCurrentUser}
                            userId={user.id}
                            userName={displayName}
                          />
                          <UserStatusButton
                            active={user.active}
                            disabled={!canManageUsers || isCurrentUser}
                            userId={user.id}
                            userName={displayName}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum usuário autorizado encontrado"
              description="Quando houver perfis internos cadastrados, eles aparecerão aqui."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
