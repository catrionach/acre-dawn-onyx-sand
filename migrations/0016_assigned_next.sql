alter table work_orders
  add column if not exists assigned_next text not null default '';
