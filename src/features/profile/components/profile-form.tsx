"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  updateCurrentProfile,
  type ProfileActionState,
} from "@/features/profile/actions";
import type { CurrentProfile } from "@/features/profile/types/profile";
import { roleLabels } from "@/features/users/types/roles";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

const initialState: ProfileActionState = { ok: false };

function formatBrazilianPhone(value: string) {
  const rawDigits = value.replace(/\D/g, "");
  const digits = (rawDigits.length > 11 && rawDigits.startsWith("55")
    ? rawDigits.slice(2)
    : rawDigits
  ).slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function initials(profile: CurrentProfile) {
  const source = profile.fullName || profile.email || "Usuário";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function ProfileForm({ profile }: { profile: CurrentProfile }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateCurrentProfile, initialState);
  const [phone, setPhone] = useState(profile.phone ? formatBrazilianPhone(profile.phone) : "");
  const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl ?? "");
  const [selectedAvatarName, setSelectedAvatarName] = useState("");

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(formatBrazilianPhone(event.target.value));
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedAvatarName("");
      setPreviewUrl(profile.avatarUrl ?? "");
      return;
    }

    setSelectedAvatarName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do usuário</CardTitle>
          <CardDescription>
            Essas informações aparecem para identificação interna no CRM e nos atendimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={state.fieldErrors?.fullName?.[0]}
                label="Nome completo"
                name="fullName"
                required
                defaultValue={profile.fullName ?? ""}
                placeholder="Nome que aparecerá no CRM"
              />
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Telefone / WhatsApp</span>
                <Input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                />
                {state.fieldErrors?.phone?.[0] ? (
                  <span className="block text-xs text-destructive">
                    {state.fieldErrors.phone[0]}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Foto do perfil</span>
              <div className="flex flex-col gap-4 rounded-md border bg-background/40 p-4 sm:flex-row sm:items-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-20 w-20 rounded-full border object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                    {initials(profile)}
                  </span>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    name="avatarFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleAvatarChange}
                  />
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Envie uma imagem em JPG, PNG, WebP ou AVIF com até 3 MB.
                  </span>
                  {selectedAvatarName ? (
                    <span className="block truncate text-xs font-medium text-foreground">
                      Arquivo selecionado: {selectedAvatarName}
                    </span>
                  ) : null}
                  {state.fieldErrors?.avatarFile?.[0] ? (
                    <span className="block text-xs text-destructive">
                      {state.fieldErrors.avatarFile[0]}
                    </span>
                  ) : null}
                </div>
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground sm:flex">
                  <Upload className="h-4 w-4" />
                </span>
              </div>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">E-mail de acesso</span>
                <Input value={profile.email ?? "Não informado"} disabled />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Perfil de permissão</span>
                <Input value={roleLabels[profile.role]} disabled />
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4" />
                {isPending ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prévia no CRM</CardTitle>
          <CardDescription>
            Visualização rápida de como seu usuário será identificado no painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border bg-background/40 p-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="h-12 w-12 rounded-full border object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {initials(profile)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile.fullName || profile.email || "Usuário"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.email || "E-mail não informado"}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-md border bg-background/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Permissão</span>
              <Badge variant="neutral">{roleLabels[profile.role]}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={profile.active ? "success" : "neutral"}>
                {profile.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          <div className="rounded-md border bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
            <UserRound className="mb-3 h-4 w-4 text-primary" />
            Alteração de permissão continua no menu Usuários. Esta tela serve apenas para seus
            dados de identificação.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  defaultValue,
  error,
  label,
  name,
  placeholder,
  required = false,
}: {
  defaultValue?: string;
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete="name"
      />
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
