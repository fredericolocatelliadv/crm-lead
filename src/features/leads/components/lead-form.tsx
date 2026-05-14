"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { Save } from "lucide-react";

import type { LeadActionState } from "@/features/leads/actions";
import {
  mergeLegalAreaOptions,
  type LegalAreaOption,
} from "@/features/leads/types/legal-area";
import type {
  LeadFormMode,
  LeadFormValues,
  LeadOption,
  LeadPriority,
} from "@/features/leads/types/lead";
import {
  leadPriorities,
  priorityLabels,
  sourceLabels,
} from "@/features/leads/types/lead";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

type LeadFormProps = {
  action: (
    previousState: LeadActionState,
    formData: FormData,
  ) => Promise<LeadActionState>;
  assignees: LeadOption[];
  initialValues?: Partial<LeadFormValues>;
  legalAreas: LegalAreaOption[];
  mode: LeadFormMode;
  stages: LeadOption[];
};

const initialState: LeadActionState = {
  ok: false,
};

const leadSources = ["manual", "site", "whatsapp", "chatbot", "ai"] as const;

export function LeadForm({
  action,
  assignees,
  initialValues,
  legalAreas,
  mode,
  stages,
}: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [priority, setPriority] = useState<LeadPriority>(initialValues?.priority ?? "medium");
  const [source, setSource] = useState(initialValues?.source ?? "manual");
  const [stageId, setStageId] = useState(initialValues?.pipelineStageId ?? stages[0]?.id ?? "none");
  const [assigneeId, setAssigneeId] = useState(initialValues?.assigneeId ?? "none");
  const [legalArea, setLegalArea] = useState(initialValues?.legalArea ?? "none");
  const areaItems = mergeLegalAreaOptions(legalAreas, initialValues?.legalArea);

  const title = mode === "create" ? "Cadastrar lead" : "Editar lead";
  const description =
    mode === "create"
      ? "Registre manualmente um contato comercial recebido pelo escritório."
      : "Atualize as informações comerciais do lead.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.message ? (
            <div className="rounded-md border border-red-600/20 bg-red-600/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {state.message}
            </div>
          ) : null}

          <input type="hidden" name="priority" value={priority} />
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="pipelineStageId" value={stageId} />
          <input type="hidden" name="assigneeId" value={assigneeId} />
          <input type="hidden" name="legalArea" value={legalArea} />

          <section className="grid gap-4 lg:grid-cols-2">
            <Field label="Nome" error={state.fieldErrors?.name?.[0]}>
              <Input name="name" defaultValue={initialValues?.name ?? ""} required />
            </Field>

            <Field label="Telefone / WhatsApp" error={state.fieldErrors?.phone?.[0]}>
              <Input name="phone" defaultValue={initialValues?.phone ?? ""} />
            </Field>

            <Field label="E-mail" error={state.fieldErrors?.email?.[0]}>
              <Input name="email" type="email" defaultValue={initialValues?.email ?? ""} />
            </Field>

            <Field label="Cidade" error={state.fieldErrors?.city?.[0]}>
              <Input name="city" defaultValue={initialValues?.city ?? ""} />
            </Field>

            <Field label="Área jurídica" error={state.fieldErrors?.legalArea?.[0]}>
              <Select value={legalArea} onValueChange={setLegalArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informada</SelectItem>
                  {areaItems.map((area) => (
                    <SelectItem key={area.id} value={area.name}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Prioridade" error={state.fieldErrors?.priority?.[0]}>
              <Select value={priority} onValueChange={(value) => setPriority(value as LeadPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadPriorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {priorityLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Origem" error={state.fieldErrors?.source?.[0]}>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((item) => (
                    <SelectItem key={item} value={item}>
                      {sourceLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Etapa do pipeline" error={state.fieldErrors?.pipelineStageId?.[0]}>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem etapa</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Responsável" error={state.fieldErrors?.assigneeId?.[0]}>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem responsável</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Melhor horário de contato" error={state.fieldErrors?.bestContactTime?.[0]}>
              <Input
                name="bestContactTime"
                defaultValue={initialValues?.bestContactTime ?? ""}
                placeholder="Ex.: manhã, tarde, após 18h"
              />
            </Field>
          </section>

          <Field label="Descrição do caso" error={state.fieldErrors?.description?.[0]}>
            <Textarea
              name="description"
              defaultValue={initialValues?.description ?? ""}
              rows={5}
            />
          </Field>

          <Field label="Resumo interno" error={state.fieldErrors?.summary?.[0]}>
            <Textarea name="summary" defaultValue={initialValues?.summary ?? ""} rows={4} />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/crm/leads">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar lead"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
