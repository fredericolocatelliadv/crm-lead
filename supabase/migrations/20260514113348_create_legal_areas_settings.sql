create table if not exists public.legal_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint legal_areas_name_length check (char_length(trim(name)) >= 2),
  constraint legal_areas_slug_length check (char_length(trim(slug)) >= 2)
);

create unique index if not exists legal_areas_slug_key on public.legal_areas (slug);
create index if not exists legal_areas_active_position_idx on public.legal_areas (active, position, name);

alter table public.legal_areas enable row level security;

revoke all on table public.legal_areas from anon;
revoke all on table public.legal_areas from authenticated;
grant select, insert, update, delete on table public.legal_areas to authenticated;

create policy legal_areas_crm_read
  on public.legal_areas
  for select
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role, 'attendant'::app_role]));

create policy legal_areas_admin_manager_insert
  on public.legal_areas
  for insert
  to authenticated
  with check (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

create policy legal_areas_admin_manager_update
  on public.legal_areas
  for update
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]))
  with check (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

create policy legal_areas_admin_manager_delete
  on public.legal_areas
  for delete
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

insert into public.legal_areas (name, slug, position, active)
values
  ('Direito Previdenciário', 'direito-previdenciario', 10, true),
  ('Direito Bancário', 'direito-bancario', 20, true),
  ('Direito Trabalhista', 'direito-trabalhista', 30, true),
  ('Direito Civil', 'direito-civil', 40, true),
  ('Direito de Família', 'direito-de-familia', 50, true),
  ('Direito do Consumidor', 'direito-do-consumidor', 60, true),
  ('Direito Empresarial', 'direito-empresarial', 70, true)
on conflict (slug) do update set
  name = excluded.name,
  position = excluded.position,
  active = excluded.active,
  updated_at = now();
