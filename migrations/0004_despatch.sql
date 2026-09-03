-- Exact WO entered at despatch is separate from the planned WO on the sales line.

alter table sales_lines
  add column if not exists despatch_wo_number text not null default '';

alter table sales_lines
  add column if not exists despatch_date date;
