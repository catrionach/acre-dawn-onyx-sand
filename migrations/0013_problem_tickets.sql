-- Customer problem tickets from Prospect, plus API settings.

create table if not exists floor_settings (
  id integer primary key check (id = 1),
  prospect_base_url text not null default '',
  prospect_api_key text not null default ''
);

insert into floor_settings (id, prospect_base_url, prospect_api_key)
values (1, '', '')
on conflict (id) do nothing;

create table if not exists problem_tickets (
  id serial primary key,
  prospect_number text not null,
  title text not null default '',
  assigned_build text not null default '',
  hours double precision not null default 0,
  status text not null default 'pending',
  date_started date,
  date_finished date,
  notes text not null default ''
);

create unique index if not exists problem_tickets_prospect_uidx
  on problem_tickets (prospect_number);

alter table build_queue
  add column if not exists problem_id integer references problem_tickets (id) on delete cascade;

create unique index if not exists build_queue_pt_uidx
  on build_queue (problem_id)
  where problem_id is not null;
