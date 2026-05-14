"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateSiteSettings, type SettingsActionState } from "@/features/settings/actions";
import type { SiteSettings } from "@/features/settings/data/site-management";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: SettingsActionState = { ok: false };

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="WhatsApp público" name="whatsapp" defaultValue={settings.whatsapp} />
        <Field label="E-mail público" name="email" defaultValue={settings.email} />
        <Field label="Instagram" name="instagram" defaultValue={settings.instagram} />
        <Field label="LinkedIn" name="linkedin" defaultValue={settings.linkedin} />
        <Field label="Facebook" name="facebook" defaultValue={settings.facebook} />
        <Field label="YouTube" name="youtube" defaultValue={settings.youtube} />
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium">Endereço</span>
        <Textarea name="address" rows={3} defaultValue={settings.address ?? ""} />
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <Input name={name} defaultValue={defaultValue ?? ""} />
    </label>
  );
}
