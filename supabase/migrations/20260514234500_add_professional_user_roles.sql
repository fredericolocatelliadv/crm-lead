alter type public.app_role add value if not exists 'lawyer';
alter type public.app_role add value if not exists 'marketing';

alter table public.profiles
  add column if not exists team_member_id uuid references public.team_members(id) on delete set null;

create index if not exists profiles_team_member_id_idx
  on public.profiles (team_member_id)
  where team_member_id is not null;

create or replace function app_private.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = ''
as $$
  select ur.role
  from public.user_roles ur
  join public.profiles p on p.id = ur.user_id
  where ur.user_id = auth.uid()
    and p.active = true
  limit 1;
$$;

drop policy if exists profiles_select_internal on public.profiles;
drop policy if exists profiles_update_internal on public.profiles;

create policy profiles_select_internal
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer', 'marketing'])
  );

create policy profiles_update_internal
  on public.profiles
  for update
  to authenticated
  using (
    id = (select auth.uid())
    or app_private.current_user_role()::text = 'admin'
  )
  with check (
    id = (select auth.uid())
    or app_private.current_user_role()::text = 'admin'
  );

drop policy if exists contacts_crm_all on public.contacts;
create policy contacts_crm_select
  on public.contacts
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer', 'marketing']));

create policy contacts_operational_insert
  on public.contacts
  for insert
  to authenticated
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy contacts_operational_update
  on public.contacts
  for update
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy contacts_operational_delete
  on public.contacts
  for delete
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager']));

drop policy if exists leads_crm_all on public.leads;
create policy leads_crm_select
  on public.leads
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer', 'marketing']));

create policy leads_operational_insert
  on public.leads
  for insert
  to authenticated
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy leads_operational_update
  on public.leads
  for update
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy leads_operational_delete
  on public.leads
  for delete
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager']));

drop policy if exists conversations_crm_all on public.conversations;
create policy conversations_operational_all
  on public.conversations
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists messages_crm_all on public.messages;
create policy messages_operational_all
  on public.messages
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists customers_crm_all on public.customers;
create policy customers_operational_all
  on public.customers
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists notes_crm_all on public.notes;
create policy notes_operational_all
  on public.notes
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists attachments_crm_all on public.attachments;
create policy attachments_operational_all
  on public.attachments
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists lead_events_crm_all on public.lead_events;
create policy lead_events_operational_all
  on public.lead_events
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists ai_sessions_crm_all on public.ai_sessions;
drop policy if exists ai_messages_crm_all on public.ai_messages;
drop policy if exists ai_classifications_crm_all on public.ai_classifications;

create policy ai_sessions_operational_all
  on public.ai_sessions
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy ai_messages_operational_all
  on public.ai_messages
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

create policy ai_classifications_operational_all
  on public.ai_classifications
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists blog_posts_crm_all on public.blog_posts;
drop policy if exists blog_categories_crm_all on public.blog_categories;

create policy blog_posts_crm_all
  on public.blog_posts
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'lawyer', 'marketing']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'lawyer', 'marketing']));

create policy blog_categories_crm_all
  on public.blog_categories
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'lawyer', 'marketing']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager', 'lawyer', 'marketing']));

drop policy if exists pipeline_stages_crm_select on public.pipeline_stages;
create policy pipeline_stages_crm_select
  on public.pipeline_stages
  for select
  to authenticated
  using (
    app_private.current_user_role()::text = any (array['admin', 'manager'])
    or (
      active = true
      and app_private.current_user_role()::text = any (array['attendant', 'lawyer', 'marketing'])
    )
  );

drop policy if exists legal_areas_crm_read on public.legal_areas;
create policy legal_areas_crm_read
  on public.legal_areas
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer', 'marketing']));

drop policy if exists business_hours_crm_read on public.business_hours;
create policy business_hours_crm_read
  on public.business_hours
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists quick_replies_crm_all on public.quick_replies;
create policy quick_replies_crm_all
  on public.quick_replies
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager']));

drop policy if exists departments_crm_all on public.departments;
create policy departments_crm_all
  on public.departments
  for all
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer', 'marketing']))
  with check (app_private.current_user_role()::text = any (array['admin', 'manager']));

drop policy if exists whatsapp_instances_crm_read on public.whatsapp_instances;
create policy whatsapp_instances_crm_read
  on public.whatsapp_instances
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));

drop policy if exists whatsapp_connection_events_crm_read on public.whatsapp_connection_events;
create policy whatsapp_connection_events_crm_read
  on public.whatsapp_connection_events
  for select
  to authenticated
  using (app_private.current_user_role()::text = any (array['admin', 'manager', 'attendant', 'lawyer']));
