alter table public.ai_assistant_settings
  add column if not exists audio_transcription_enabled_when_ai_off boolean not null default false;

update public.ai_assistant_settings
set audio_transcription_enabled_when_ai_off = false
where operation_mode <> 'off'
  and audio_transcription_enabled_when_ai_off is true;
