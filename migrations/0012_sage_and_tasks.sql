-- Weekly Sage pack list (replaced on each upload) + TSK numbers / finish date on tasks.

create table if not exists sage_pack_lines (
  id serial primary key,
  so_number text not null,
  company text not null default '',
  order_date date,
  part text not null default '',
  description text not null default '',
  comment text not null default '',
  qty integer not null default 0,
  qty_despatched integer not null default 0,
  notes text not null default ''
);

create index if not exists sage_pack_so_idx on sage_pack_lines (so_number);

create table if not exists sage_pack_meta (
  id integer primary key check (id = 1),
  uploaded_at timestamptz not null default now(),
  filename text not null default '',
  row_count integer not null default 0
);

alter table build_tasks
  add column if not exists task_number text;

alter table build_tasks
  add column if not exists date_finished date;

update build_tasks
set task_number = 'TSK-' || id::text
where task_number is null or task_number = '';

create unique index if not exists build_tasks_number_uidx
  on build_tasks (task_number)
  where task_number is not null and task_number <> '';
