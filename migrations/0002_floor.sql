-- Floor — A&P Chambers production board (unowned shared rows)

create table if not exists parts (
  part_number text primary key,
  name text not null default '',
  logger text not null default '',
  type text not null default '',
  counts text not null default '',
  directional boolean not null default false,
  build_time_hours double precision not null default 0,
  notes text not null default '',
  active boolean not null default true
);

create table if not exists work_orders (
  wo_number text primary key,
  part text not null default '',
  qty integer not null default 1,
  status text not null default 'pending',
  date_added date not null default current_date,
  date_started date,
  date_closed date,
  assigned_build text not null default '',
  built_in_sage boolean not null default false,
  notes_to_production text not null default '',
  customer_need_date date
);

create table if not exists units (
  id serial primary key,
  work_order_number text not null references work_orders (wo_number) on delete cascade,
  unit_id text not null unique,
  serial_or_id text not null default '',
  status text not null default 'in build',
  sales_order_number text,
  despatch_date date,
  notes jsonb not null default '[]'::jsonb
);

create index if not exists units_wo_idx on units (work_order_number);
create index if not exists units_so_idx on units (sales_order_number);

create table if not exists quality_tickets (
  ticket_number text primary key,
  work_order_number text not null references work_orders (wo_number),
  unit_id text,
  part text not null default '',
  title text not null default '',
  problem text not null default '',
  status text not null default 'open',
  date_opened date not null default current_date,
  date_closed date,
  assigned_to text not null default '',
  notes jsonb not null default '[]'::jsonb
);

create index if not exists qt_wo_idx on quality_tickets (work_order_number);

create table if not exists build_order (
  wo_number text primary key references work_orders (wo_number) on delete cascade,
  position integer not null
);

create index if not exists build_order_position_idx on build_order (position);

create table if not exists sales_orders (
  so_number text primary key,
  company text not null default '',
  order_date date,
  lead_time_weeks double precision,
  target_despatch date,
  target_despatch_is_override boolean not null default false,
  status text not null default 'open',
  sage_id text not null default ''
);

create table if not exists sales_lines (
  id serial primary key,
  so_number text not null references sales_orders (so_number) on delete cascade,
  part text not null default '',
  qty integer not null default 1,
  work_order_number text not null default ''
);

create index if not exists sales_lines_so_idx on sales_lines (so_number);
create index if not exists sales_lines_wo_idx on sales_lines (work_order_number);

-- Shop data is loaded from Floor → Load data. No demo rows.