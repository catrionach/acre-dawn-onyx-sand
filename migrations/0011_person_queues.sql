-- Per-person build queues (Simon / David / …) plus free-form tasks.

create table if not exists build_tasks (
  id serial primary key,
  title text not null default '',
  assigned_build text not null default 'Simon',
  hours double precision not null default 0,
  status text not null default 'pending',
  date_started date
);

create table if not exists build_queue (
  id serial primary key,
  assigned_build text not null default 'Simon',
  position integer not null default 0,
  kind text not null,
  wo_number text references work_orders (wo_number) on delete cascade,
  task_id integer references build_tasks (id) on delete cascade
);

create index if not exists build_queue_who_pos on build_queue (assigned_build, position);
create unique index if not exists build_queue_wo_uidx on build_queue (wo_number) where wo_number is not null;

insert into build_queue (assigned_build, position, kind, wo_number)
select
  case
    when coalesce(nullif(w.assigned_build, ''), '') = '' then 'Unassigned'
    else w.assigned_build
  end,
  row_number() over (
    partition by case
      when coalesce(nullif(w.assigned_build, ''), '') = '' then 'Unassigned'
      else w.assigned_build
    end
    order by b.position, w.wo_number
  ) - 1,
  'wo',
  b.wo_number
from build_order b
join work_orders w on w.wo_number = b.wo_number
where not exists (
  select 1 from build_queue q where q.wo_number = b.wo_number
);
