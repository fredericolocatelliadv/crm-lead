"use client";

import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/shared/lib/supabase/browser";

export interface AppSettings {
  address?: string;
  cookieConsentEnabled?: boolean;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  trackingEnabled?: boolean;
  whatsapp?: string;
  youtube?: string;
}

interface SettingsRow {
  address?: string;
  cookie_consent_enabled?: boolean;
  email?: string;
  facebook?: string;
  id?: number;
  instagram?: string;
  linkedin?: string;
  tracking_enabled?: boolean;
  whatsapp?: string;
  youtube?: string;
}

export function formatWhatsApp(whatsapp?: string): string {
  if (!whatsapp) return "";
  const numbers = whatsapp.replace(/\D/g, "");

  if (numbers.length === 13) {
    return `+${numbers.substring(0, 2)} (${numbers.substring(2, 4)}) ${numbers.substring(4, 9)}-${numbers.substring(9, 13)}`;
  }

  return whatsapp;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("id,whatsapp,email,address,instagram,linkedin,facebook,youtube,tracking_enabled,cookie_consent_enabled")
          .single<SettingsRow>();

        if (error) throw error;
        setSettings({
          address: data.address,
          cookieConsentEnabled: data.cookie_consent_enabled,
          email: data.email,
          facebook: data.facebook,
          instagram: data.instagram,
          linkedin: data.linkedin,
          trackingEnabled: data.tracking_enabled,
          whatsapp: data.whatsapp,
          youtube: data.youtube,
        });
      } catch {
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
