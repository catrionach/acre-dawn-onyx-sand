-- Per-serial list of work orders consumed into a build.
-- Also drop any stored Prospect API key — CE Master no longer calls Prospect.

alter table wo_build_records
  add column if not exists consumed jsonb not null default '[]'::jsonb;

update floor_settings
  set prospect_api_key = ''
  where coalesce(prospect_api_key, '') <> '';
