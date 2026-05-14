create table if not exists public.ai_assistant_settings (
  id smallint primary key default 1,
  enabled boolean not null default false,
  automatic_reply_enabled boolean not null default false,
  assistant_name text not null default 'Assistente virtual',
  personality text not null default 'Cordial, objetiva, profissional e acolhedora.',
  prompt_instructions text not null default 'Colete as informacoes essenciais do contato, organize o atendimento inicial, classifique a area juridica provavel e encaminhe para a equipe humana quando necessario.',
  response_style text not null default 'Use mensagens curtas, claras e em portugues do Brasil. Pergunte no maximo uma ou duas informacoes por vez.',
  max_context_messages integer not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint ai_assistant_settings_singleton check (id = 1),
  constraint ai_assistant_settings_name_length check (char_length(trim(assistant_name)) >= 2),
  constraint ai_assistant_settings_personality_length check (char_length(trim(personality)) >= 10),
  constraint ai_assistant_settings_prompt_length check (char_length(trim(prompt_instructions)) >= 20),
  constraint ai_assistant_settings_style_length check (char_length(trim(response_style)) >= 10),
  constraint ai_assistant_settings_context_range check (max_context_messages between 1 and 20)
);

alter table public.ai_assistant_settings enable row level security;

revoke all on table public.ai_assistant_settings from anon;
revoke all on table public.ai_assistant_settings from authenticated;
grant select, insert, update on table public.ai_assistant_settings to authenticated;

drop policy if exists ai_assistant_settings_admin_select on public.ai_assistant_settings;
drop policy if exists ai_assistant_settings_admin_insert on public.ai_assistant_settings;
drop policy if exists ai_assistant_settings_admin_update on public.ai_assistant_settings;

create policy ai_assistant_settings_admin_select
  on public.ai_assistant_settings
  for select
  to authenticated
  using (app_private.current_user_role() = 'admin'::app_role);

create policy ai_assistant_settings_admin_insert
  on public.ai_assistant_settings
  for insert
  to authenticated
  with check (app_private.current_user_role() = 'admin'::app_role);

create policy ai_assistant_settings_admin_update
  on public.ai_assistant_settings
  for update
  to authenticated
  using (app_private.current_user_role() = 'admin'::app_role)
  with check (app_private.current_user_role() = 'admin'::app_role);

insert into public.ai_assistant_settings (id)
values (1)
on conflict (id) do nothing;
