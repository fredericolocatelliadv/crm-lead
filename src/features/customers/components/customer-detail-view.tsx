import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CalendarCheck,
  FileText,
  Mail,
  MessageCircle,
  Paperclip,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  CustomerAttachmentDialog,
  CustomerNoteDialog,
} from "@/features/customers/components/customer-actions";
import type { CustomerDetailData } from "@/features/customers/data/customer-directory";
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

type CustomerDetailViewProps = {
  data: CustomerDetailData;
};

export function CustomerDetailView({ data }: CustomerDetailViewProps) {
  const { customer } = data;

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Badge variant="success" className="mb-3">
            Cliente convertido
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {customer.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Histórico comercial, vínculo com o lead original e registros básicos pós-conversão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customer.conversationId ? (
            <Button asChild variant="outline">
              <Link href={`/crm/conversas/${customer.conversationId}`}>
                <MessageCircle className="h-4 w-4" />
                Abrir conversa
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={`/crm/clientes/${customer.id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar cliente
            </Link>
          </Button>
          <CustomerNoteDialog customerId={customer.id} />
          <CustomerAttachmentDialog customerId={customer.id} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do cliente</CardTitle>
          <CardDescription>
            Dados essenciais da conversão, sem controle processual ou gestão jurídica interna.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <InfoItem icon={Phone} label="Telefone" value={customer.phone || "Não informado"} />
          <InfoItem icon={Mail} label="E-mail" value={customer.email || "Não informado"} />
          <InfoItem
            icon={CalendarCheck}
            label="Data de conversão"
            value={formatDateTime(customer.convertedAt)}
          />
          <InfoItem
            icon={UserRound}
            label="Responsável pela conversão"
            value={customer.convertedByName || "Não informado"}
          />
          <InfoItem label="Área jurídica" value={customer.legalArea || "Não informada"} />
          <InfoItem label="Origem do lead" value={customer.leadSource || "Não informada"} />
          <InfoItem label="Entrada do lead" value={customer.leadCreatedAt ? formatDateTime(customer.leadCreatedAt) : "Não informada"} />
          <InfoItem
            icon={ShieldCheck}
            label="Escopo"
            value="Histórico comercial"
          />
        </CardContent>
      </Card>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <Card className="min-h-0">
          <CardHeader>
            <div>
              <CardTitle>Origem comercial</CardTitle>
              <CardDescription>
                Vínculo comercial que originou este cliente.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextBlock
              title="Resumo comercial"
              value={customer.leadSummary}
              fallback="Nenhum resumo registrado no lead original."
            />
            <TextBlock
              title="Descrição inicial"
              value={customer.leadDescription}
              fallback="Nenhuma descrição registrada no lead original."
            />
            <TextBlock
              title="Observações do cliente"
              value={customer.registryNotes}
              fallback="Nenhuma observação básica registrada no cadastro do cliente."
            />
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Observações básicas</CardTitle>
            <CardDescription>
              Notas comerciais registradas no cliente e no lead original.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.notes.length > 0 ? (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                {customer.notes.map((note) => (
                  <div key={note.id} className="rounded-md border bg-muted/20 p-4">
                    <div className="mb-2">
                      <Badge variant={note.source === "Cliente" ? "info" : "neutral"}>
                        {note.source}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-foreground">{note.content}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {note.authorName || "Equipe"} em {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma observação registrada"
                description="As observações comerciais adicionadas pela equipe aparecerão aqui."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Anexos básicos</CardTitle>
            <CardDescription>
              Documentos simples ligados ao histórico comercial do cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.attachments.length > 0 ? (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                {customer.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-3 rounded-md border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {attachment.fileName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} •{" "}
                        {attachment.uploadedByName || "Equipe"} em{" "}
                        {formatDateTime(attachment.uploadedAt)}
                      </p>
                    </div>
                    {attachment.downloadUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={attachment.downloadUrl} target="_blank" rel="noreferrer">
                          Abrir
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Paperclip}
                title="Nenhum anexo registrado"
                description="Anexos básicos adicionados para este cliente aparecerão aqui."
              />
            )}
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Histórico comercial</CardTitle>
            <CardDescription>
              Eventos relevantes herdados do fluxo de conversão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.events.length > 0 ? (
              <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
                {customer.events.map((event) => (
                  <div key={event.id} className="rounded-md border bg-muted/20 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {event.description || event.eventType}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.actorName || "Sistema"} em {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="Nenhum evento registrado"
                description="Eventos comerciais importantes aparecerão aqui conforme o atendimento evoluir."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function TextBlock({
  fallback,
  title,
  value,
}: {
  fallback: string;
  title: string;
  value: string | null;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {value || fallback}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(value: number | null) {
  if (!value) return "Tamanho não informado";

  if (value < 1024 * 1024) {
    return `${Math.ceil(value / 1024)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
