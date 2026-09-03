-- Product × component lookup (from Build_Component_Lookup.xlsx)
-- and per-WO / per-serial build records.

create table if not exists build_components (
  component_key text primary key,
  label text not null,
  kind text not null default 'subassembly',
  position integer not null default 0
);

create table if not exists build_batteries (
  code text primary key,
  position integer not null default 0
);

create table if not exists build_component_map (
  part_number text not null,
  component_key text not null references build_components (component_key) on delete cascade,
  primary key (part_number, component_key)
);

create table if not exists wo_build_records (
  id serial primary key,
  wo_number text not null,
  serial text not null default '1',
  revision text not null default '',
  battery text not null default '',
  notes text not null default '',
  unique (wo_number, serial)
);

create table if not exists wo_build_values (
  record_id integer not null references wo_build_records (id) on delete cascade,
  component_key text not null,
  value text not null default '',
  primary key (record_id, component_key)
);

create index if not exists wo_build_records_wo_idx on wo_build_records (wo_number);
