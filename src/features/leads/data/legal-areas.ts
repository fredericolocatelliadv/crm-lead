import { createClient } from "@/server/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import {
  fallbackLegalAreaOptions,
  type LegalAreaOption,
} from "@/features/leads/types/legal-area";

export async function getActiveLegalAreaOptions(): Promise<LegalAreaOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_areas")
    .select("id,name,description,position")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return fallbackLegalAreaOptions.map((name, index) => ({
      description: null,
      id: name,
      name,
      position: (index + 1) * 10,
    }));
  }

  return ((data ?? []) as LegalAreaOption[]).length > 0
    ? (data ?? []) as LegalAreaOption[]
    : fallbackLegalAreaOptions.map((name, index) => ({
        description: null,
        id: name,
        name,
        position: (index + 1) * 10,
      }));
}

export async function getPublicLegalAreaOptions(): Promise<LegalAreaOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("legal_areas")
    .select("id,name,description,position")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data || data.length === 0) {
    return fallbackLegalAreaOptions.map((name, index) => ({
      description: null,
      id: name,
      name,
      position: (index + 1) * 10,
    }));
  }

  return data as LegalAreaOption[];
}
