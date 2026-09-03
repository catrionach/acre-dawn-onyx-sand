-- Notes from Sales (plain column) + Hardware History (append-only stamped log)

alter table work_orders
  add column if not exists notes_from_sales text not null default '';

alter table work_orders
  add column if not exists hardware_history jsonb not null default '[]'::jsonb;
