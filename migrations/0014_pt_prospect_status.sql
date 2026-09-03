-- Prospect CRM workflow status on problem tickets.

alter table problem_tickets
  add column if not exists prospect_status text not null default '';

alter table problem_tickets
  add column if not exists prospect_status_id text not null default '';
