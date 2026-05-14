"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  upsertFaq,
  upsertTeamMember,
  upsertTestimonial,
  type SettingsActionState,
} from "@/features/settings/actions";
import type {
  FaqItem,
  TeamMemberItem,
  TestimonialItem,
} from "@/features/settings/data/site-management";
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

const initialState: SettingsActionState = { ok: false };

export function TeamMemberDialog({ member }: { member?: TeamMemberItem }) {
  return (
    <ContentDialog
      action={upsertTeamMember}
      edit={Boolean(member)}
      title={member ? "Editar membro da equipe" : "Novo membro da equipe"}
      description="Gerencie os dados exibidos na seção de equipe do site."
      triggerLabel={member ? "Editar" : "Novo membro"}
    >
      <input type="hidden" name="id" defaultValue={member?.id ?? ""} />
      <input type="hidden" name="currentImage" defaultValue={member?.image ?? ""} />
      <Grid>
        <Field label="Nome" name="name" defaultValue={member?.name} />
        <Field label="Cargo" name="role" defaultValue={member?.role ?? ""} />
        <Field label="OAB" name="oab" defaultValue={member?.oab ?? ""} />
        <Field label="Posição" name="position" type="number" defaultValue={member?.position ?? 0} />
        <ImageField currentImage={member?.image} />
        <Field label="E-mail" name="email" defaultValue={member?.email ?? ""} />
        <Field label="LinkedIn" name="linkedin" defaultValue={member?.linkedin ?? ""} />
        <Field label="Instagram" name="instagram" defaultValue={member?.instagram ?? ""} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={member?.whatsapp ?? ""} />
      </Grid>
      <TextField label="Bio" name="bio" defaultValue={member?.bio ?? ""} />
    </ContentDialog>
  );
}

export function TestimonialDialog({ testimonial }: { testimonial?: TestimonialItem }) {
  return (
    <ContentDialog
      action={upsertTestimonial}
      edit={Boolean(testimonial)}
      title={testimonial ? "Editar depoimento" : "Novo depoimento"}
      description="Gerencie depoimentos exibidos no site."
      triggerLabel={testimonial ? "Editar" : "Novo depoimento"}
    >
      <input type="hidden" name="id" defaultValue={testimonial?.id ?? ""} />
      <input type="hidden" name="currentImage" defaultValue={testimonial?.image ?? ""} />
      <Grid>
        <Field label="Nome" name="name" defaultValue={testimonial?.name} />
        <Field label="Descrição" name="role" defaultValue={testimonial?.role ?? ""} />
        <ImageField currentImage={testimonial?.image} />
        <Field
          label="Posição"
          name="position"
          type="number"
          defaultValue={testimonial?.position ?? 0}
        />
      </Grid>
      <TextField label="Depoimento" name="text" defaultValue={testimonial?.text ?? ""} />
    </ContentDialog>
  );
}

export function FaqDialog({ faq }: { faq?: FaqItem }) {
  return (
    <ContentDialog
      action={upsertFaq}
      edit={Boolean(faq)}
      title={faq ? "Editar pergunta frequente" : "Nova pergunta frequente"}
      description="Gerencie as perguntas exibidas na seção de FAQ."
      triggerLabel={faq ? "Editar" : "Nova pergunta"}
    >
      <input type="hidden" name="id" defaultValue={faq?.id ?? ""} />
      <Grid>
        <Field label="Pergunta" name="question" defaultValue={faq?.question} />
        <Field label="Posição" name="position" type="number" defaultValue={faq?.position ?? 0} />
      </Grid>
      <TextField label="Resposta" name="answer" defaultValue={faq?.answer ?? ""} />
    </ContentDialog>
  );
}

function ContentDialog({
  action,
  children,
  description,
  edit,
  title,
  triggerLabel,
}: {
  action: (
    previousState: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
  children: React.ReactNode;
  description: string;
  edit: boolean;
  title: string;
  triggerLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);

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
        <Button variant={edit ? "outline" : "default"} size={edit ? "sm" : "default"}>
          {edit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {children}
          {state.fieldErrors?.imageFile?.[0] ? (
            <p className="text-xs text-red-600 dark:text-red-300">
              {state.fieldErrors.imageFile[0]}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue?: number | string | null;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <Input name={name} type={type} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

function ImageField({ currentImage }: { currentImage?: string | null }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">Imagem</span>
      <Input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
      <span className="block text-xs leading-5 text-muted-foreground">
        Envie JPG, PNG, WebP ou AVIF com até 5 MB.
      </span>
      {currentImage ? (
        <a
          href={currentImage}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver imagem atual
        </a>
      ) : null}
    </label>
  );
}

function TextField({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <Textarea name={name} rows={5} defaultValue={defaultValue ?? ""} />
    </label>
  );
}
