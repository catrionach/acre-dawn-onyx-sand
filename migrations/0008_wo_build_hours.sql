alter table work_orders
  add column if not exists build_time_hours double precision;
