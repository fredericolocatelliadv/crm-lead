alter table public.site_settings
  add column if not exists site_url text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_image_url text,
  add column if not exists tracking_enabled boolean not null default false,
  add column if not exists cookie_consent_enabled boolean not null default false,
  add column if not exists google_tag_manager_id text,
  add column if not exists google_analytics_id text,
  add column if not exists meta_pixel_id text,
  add column if not exists google_search_console_verification text,
  add column if not exists meta_domain_verification text;

alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists landing_page text,
  add column if not exists referrer text,
  add column if not exists marketing_attribution jsonb not null default '{}'::jsonb;

create index if not exists leads_utm_source_idx
  on public.leads (utm_source)
  where utm_source is not null;

create index if not exists leads_utm_campaign_idx
  on public.leads (utm_campaign)
  where utm_campaign is not null;

create index if not exists leads_gclid_idx
  on public.leads (gclid)
  where gclid is not null;

create index if not exists leads_fbclid_idx
  on public.leads (fbclid)
  where fbclid is not null;
