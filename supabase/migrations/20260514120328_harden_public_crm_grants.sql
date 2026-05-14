revoke all on table public.contacts from anon;
revoke all on table public.leads from anon;
revoke all on table public.customers from anon;
revoke all on table public.conversations from anon;
revoke all on table public.messages from anon;

drop policy if exists leads_public_insert on public.leads;

revoke all on table public.contacts from authenticated;
revoke all on table public.leads from authenticated;
revoke all on table public.customers from authenticated;
revoke all on table public.conversations from authenticated;
revoke all on table public.messages from authenticated;

grant select, insert, update, delete on table public.contacts to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.conversations to authenticated;
grant select, insert, update, delete on table public.messages to authenticated;

revoke all on table public.pipeline_stages from anon;
revoke all on table public.pipeline_stages from authenticated;
grant select, insert, update, delete on table public.pipeline_stages to authenticated;

drop policy if exists customers_attendant_conversion on public.customers;
drop policy if exists customers_crm_all on public.customers;

create policy customers_crm_all
  on public.customers
  for all
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role, 'attendant'::app_role]))
  with check (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role, 'attendant'::app_role]));

drop policy if exists pipeline_stages_admin_all on public.pipeline_stages;
drop policy if exists pipeline_stages_crm_read on public.pipeline_stages;
drop policy if exists pipeline_stages_public_read on public.pipeline_stages;
drop policy if exists pipeline_stages_crm_select on public.pipeline_stages;
drop policy if exists pipeline_stages_admin_manager_insert on public.pipeline_stages;
drop policy if exists pipeline_stages_admin_manager_update on public.pipeline_stages;
drop policy if exists pipeline_stages_admin_manager_delete on public.pipeline_stages;

create policy pipeline_stages_crm_select
  on public.pipeline_stages
  for select
  to authenticated
  using (
    app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role])
    or (
      active = true
      and app_private.current_user_role() = 'attendant'::app_role
    )
  );

create policy pipeline_stages_admin_manager_insert
  on public.pipeline_stages
  for insert
  to authenticated
  with check (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

create policy pipeline_stages_admin_manager_update
  on public.pipeline_stages
  for update
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]))
  with check (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

create policy pipeline_stages_admin_manager_delete
  on public.pipeline_stages
  for delete
  to authenticated
  using (app_private.current_user_role() = any (array['admin'::app_role, 'manager'::app_role]));

create index if not exists legal_areas_created_by_idx
  on public.legal_areas (created_by)
  where created_by is not null;

create index if not exists legal_areas_updated_by_idx
  on public.legal_areas (updated_by)
  where updated_by is not null;
