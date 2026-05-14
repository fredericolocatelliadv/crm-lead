alter table public.site_settings
  alter column cookie_consent_enabled set default true;

update public.site_settings
set
  cookie_consent_enabled = true,
  updated_at = now()
where id = 1
  and cookie_consent_enabled is false;
