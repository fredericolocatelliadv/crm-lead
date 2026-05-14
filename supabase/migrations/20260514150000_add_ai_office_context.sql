alter table public.ai_assistant_settings
  add column if not exists office_context text not null default 'Descreva aqui informações gerais sobre o escritório: história, diferenciais, áreas atendidas, regiões de atuação, forma de atendimento e observações que ajudam a IA a contextualizar a conversa.';

update public.ai_assistant_settings
set office_context = coalesce(
  nullif(office_context, ''),
  'Descreva aqui informações gerais sobre o escritório: história, diferenciais, áreas atendidas, regiões de atuação, forma de atendimento e observações que ajudam a IA a contextualizar a conversa.'
)
where id = 1;

alter table public.ai_assistant_settings
  drop constraint if exists ai_assistant_settings_office_context_length;

alter table public.ai_assistant_settings
  add constraint ai_assistant_settings_office_context_length
    check (char_length(trim(office_context)) >= 20);
