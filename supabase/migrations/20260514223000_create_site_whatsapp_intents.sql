create table if not exists public.site_whatsapp_intents (
  id uuid primary key default gen_random_uuid(),
  intent_id text not null unique,
  name text not null,
  message text not null,
  email text,
  legal_area text,
  best_contact_time text,
  marketing_consent boolean not null default false,
  marketing_attribution jsonb not null default '{}'::jsonb,
  privacy_policy_version text,
  privacy_notice_accepted_at timestamp with time zone,
  marketing_consent_at timestamp with time zone,
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  consumed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint site_whatsapp_intents_intent_id_format
    check (intent_id ~ '^FL-[A-Z0-9]{8,16}$'),
  constraint site_whatsapp_intents_name_length
    check (char_length(trim(name)) >= 2),
  constraint site_whatsapp_intents_message_length
    check (char_length(trim(message)) >= 5)
);

alter table public.site_whatsapp_intents enable row level security;

revoke all on table public.site_whatsapp_intents from anon;
revoke all on table public.site_whatsapp_intents from authenticated;

create index if not exists site_whatsapp_intents_consumed_at_idx
  on public.site_whatsapp_intents (consumed_at);

create index if not exists site_whatsapp_intents_created_at_idx
  on public.site_whatsapp_intents (created_at desc);
