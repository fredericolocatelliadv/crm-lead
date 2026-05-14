alter table public.conversations
  add column if not exists ai_paused_at timestamp with time zone,
  add column if not exists ai_paused_by uuid,
  add column if not exists ai_pause_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_ai_paused_by_fkey'
  ) then
    alter table public.conversations
      add constraint conversations_ai_paused_by_fkey
      foreign key (ai_paused_by)
      references public.profiles(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_ai_pause_reason_length'
  ) then
    alter table public.conversations
      add constraint conversations_ai_pause_reason_length
      check (
        ai_pause_reason is null
        or char_length(trim(ai_pause_reason)) <= 300
      );
  end if;
end $$;
