"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { Save } from "lucide-react";

import type { CustomerActionState } from "@/features/customers/actions";
import type { CustomerFormValues } from "@/features/customers/data/customer-directory";
import {
  mergeLegalAreaOptions,
  type LegalAreaOption,
} from "@/features/leads/types/legal-area";
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

type CustomerFormProps = {
  action: (
    previousState: CustomerActionState,
    formData: FormData,
  ) => Promise<CustomerActionState>;
  customerId: string;
  initialValues: CustomerFormValues;
  legalAreas: LegalAreaOption[];
};

const initialState: CustomerActionState = {
  ok: false,
};

export function CustomerForm({ action, customerId, initialValues, legalAreas }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [legalArea, setLegalArea] = useState(initialValues.legalArea ?? "none");
  const areaItems = mergeLegalAreaOptions(legalAreas, initialValues.legalArea);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar cliente</CardTitle>
        <CardDescription>
          Atualize os dados comerciais básicos do cliente convertido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.message ? (
            <div className="rounded-md border border-red-600/20 bg-red-600/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {state.message}
            </div>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="legalArea" value={legalArea} />

            <Field label="Nome" error={state.fieldErrors?.name?.[0]}>
              <Input name="name" defaultValue={initialValues.name} required />
            </Field>

            <Field label="Telefone / WhatsApp" error={state.fieldErrors?.phone?.[0]}>
              <Input name="phone" defaultValue={initialValues.phone ?? ""} />
            </Field>

            <Field label="E-mail" error={state.fieldErrors?.email?.[0]}>
              <Input name="email" type="email" defaultValue={initialValues.email ?? ""} />
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
          </section>

          <Field label="Observações básicas" error={state.fieldErrors?.notes?.[0]}>
            <Textarea name="notes" defaultValue={initialValues.notes ?? ""} rows={5} />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={`/crm/clientes/${customerId}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar cliente"}
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
