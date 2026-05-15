alter table public.attachments
  add column if not exists saved_to_profile_at timestamptz,
  add column if not exists saved_to_profile_by uuid references public.profiles(id) on delete set null;

create index if not exists attachments_saved_profile_lead_idx
  on public.attachments (lead_id, saved_to_profile_at desc)
  where saved_to_profile_at is not null and lead_id is not null;

create index if not exists attachments_saved_profile_customer_idx
  on public.attachments (customer_id, saved_to_profile_at desc)
  where saved_to_profile_at is not null and customer_id is not null;
