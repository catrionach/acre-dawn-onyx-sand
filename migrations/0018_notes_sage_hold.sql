-- Problem tickets: notes to production (same shape as work orders).
alter table problem_tickets
  add column if not exists notes_to_production jsonb not null default '[]'::jsonb;

-- Tasks: build-order notes (multi-line, like work orders).
alter table build_tasks
  add column if not exists build_order_notes text not null default '';

-- Sage SalesOrder.NotesLine1, refreshed on each SOPOUT upload.
alter table sales_orders
  add column if not exists notes_line1 text not null default '';

-- Wire the shop Prospect PAT when none is saved yet.
update floor_settings
set prospect_api_key = '0a628785fd7c21c8629d31ca04302600'
where id = 1
  and trim(coalesce(prospect_api_key, '')) = '';
