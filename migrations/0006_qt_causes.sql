alter table quality_tickets
  add column if not exists causes jsonb not null default '[]'::jsonb;
