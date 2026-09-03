alter table quality_tickets
  add column if not exists further_action boolean not null default false;
