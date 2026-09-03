alter table sales_orders
  add column if not exists sales_notes jsonb not null default '[]'::jsonb;

alter table work_orders
  add column if not exists production_notes jsonb not null default '[]'::jsonb;
