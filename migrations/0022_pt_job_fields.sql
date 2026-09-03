-- Problem tickets: the same shop fields as a work order, plus consumed WOs.

alter table problem_tickets
  add column if not exists part text not null default '';

alter table problem_tickets
  add column if not exists assigned_next text not null default '';

alter table problem_tickets
  add column if not exists date_added date;

update problem_tickets
set date_added = coalesce(date_started, current_date)
where date_added is null;

alter table problem_tickets
  alter column date_added set default current_date;

alter table problem_tickets
  alter column date_added set not null;

alter table problem_tickets
  add column if not exists consumed jsonb not null default '[]'::jsonb;

drop index if exists build_queue_pt_uidx;

create unique index if not exists build_queue_who_pt_uidx
  on build_queue (assigned_build, problem_id)
  where problem_id is not null;
