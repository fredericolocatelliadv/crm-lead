alter table public.ai_assistant_settings
  add column if not exists operation_mode text not null default 'off',
  add column if not exists model text not null default 'gemini-2.5-flash',
  add column if not exists safety_instructions text not null default 'Nao se apresente como advogada. Nao prometa resultados, prazos, indenizacoes ou estrategias juridicas. Quando a pergunta exigir analise juridica, colete as informacoes essenciais e encaminhe para a equipe humana.';

update public.ai_assistant_settings
set
  operation_mode = case
    when enabled = true and automatic_reply_enabled = true then 'automatic'
    when enabled = true then 'assisted'
    else 'off'
  end,
  model = coalesce(nullif(model, ''), 'gemini-2.5-flash'),
  safety_instructions = coalesce(
    nullif(safety_instructions, ''),
    'Nao se apresente como advogada. Nao prometa resultados, prazos, indenizacoes ou estrategias juridicas. Quando a pergunta exigir analise juridica, colete as informacoes essenciais e encaminhe para a equipe humana.'
  );

alter table public.ai_assistant_settings
  drop constraint if exists ai_assistant_settings_operation_mode_check,
  drop constraint if exists ai_assistant_settings_model_check,
  drop constraint if exists ai_assistant_settings_safety_length;

alter table public.ai_assistant_settings
  add constraint ai_assistant_settings_operation_mode_check
    check (operation_mode in ('off', 'assisted', 'automatic')),
  add constraint ai_assistant_settings_model_check
    check (model in ('gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro')),
  add constraint ai_assistant_settings_safety_length
    check (char_length(trim(safety_instructions)) >= 20);
