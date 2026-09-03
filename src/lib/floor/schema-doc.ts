/** Live dump of what Floor stores. CSVs use the same names unless noted. */

export const SCHEMA_DOC = `CE Master database — A&P Chambers
==============================

Download CSV (all files) is a dump of what is in CE Master right now.
Each CSV is one table (or one list stored on a table). Upload those
same files to write rows back.

Templates are blank headings + sample rows, not the live shop.


How the tables join
-------------------

  parts.part_number
      ^
      |  (catalogue)
      |
  work_orders.part                 sales_orders.so_number
      ^                                   |
      |                                   | 1 to many
      | wo_number                         v
      +------ quality_tickets        sales_lines
      |                                   |
      +------ units                       | Trace (planned WO)
      |                                   v
      +------ build_order            work_orders.wo_number
      |
      +------ hardware_history (log on the work order)
      +------ wo_build_records (per serial: revision, battery, consumed WOs)
      +------ problem_tickets.consumed (PT history is those WOs)

The Trace tab is a view, not a table. It follows sales_lines.work_order_number,
despatch WO, units, consumed WOs on build records, problem ticket consumed
lists, and quality_tickets.work_order_number.


parts
-----
Catalogue. One row per part number.

  part_number         text, primary key
  name                text
  logger              text
  type                text
  counts              text
  directional         yes/no
  build_time_hours    number  (hours per unit; days in the UI are hours÷8)
  notes               text
  active              yes/no


work_orders
-----------
One row per job.

  wo_number           text, primary key
  part                text  (usually a parts.part_number)
  qty                 integer ≥ 1  (does not create units)
  status              pending | active | on_hold | closed | cancelled
  date_added          date
  date_started        date or blank  (set when the job first goes active)
  date_closed         date or blank
  assigned_build      Simon | David | Donald | Kenzie | Catriona | Allan | Lucas | blank
  assigned_next       who the job is passed to (Pass on moves it off the first person's list)
  built_in_sage       yes/no
  notes_to_production text  (current note — overwrites, not a log)
  notes_from_sales    text  (build order notes on the board)
  customer_need_date  date  (the app also looks up the earliest sales
                      target despatch for the WO)
  build_time_hours    number or blank
                      blank = parts.build_time_hours × qty
                      a number overwrites hours for this job only
  hardware_history    list of {date, author, text} — see hardware_history.csv
                      History on a work order is this log. History on a PT
                      shows the same log for each WO in the ticket's consumed list.


units
-----
Optional serials on a work order. Qty does not create these.

  id                  integer, internal
  work_order_number   text → work_orders.wo_number
  unit_id             text, unique  (e.g. 508-1)
  serial_or_id        text
  status              in build | on shelf | shipped
  sales_order_number  text or blank
  despatch_date       date or blank
  notes               list of {date, author, text}


quality_tickets
---------------
QT-1, QT-2… optionally against a work order.

  ticket_number       text, primary key
  work_order_number   text → work_orders.wo_number  (optional; comma-separated allowed)
  unit_id             text or blank
  part                text  (copied from the WO, can be overwritten)
  title               text
  problem             text  (summary / description)
  causes              list: TBD, component failure, design work needed,
                      build error, missing parts, documentation
  further_action      yes/no
  status              open | closed
  date_opened         date
  date_closed         date or blank  (stamped when status becomes closed)
  assigned_to         text
  notes               list of {date, author, text}


sales_orders
------------
Header of a sales order. Parts live on sales_lines.

  so_number           text, primary key
  company             text
  order_date          date
  lead_time_weeks     number
  target_despatch     date  (order date + lead weeks, unless overwritten)
  target_despatch_is_override  yes/no
  status              open | waiting_on_customer | despatched | cancelled
  sage_id             text
  despatch_date       date or blank  (set from Shipping; also on the Sales page)
  notes_line1         Sage SalesOrder.NotesLine1 — refreshed on each Sage upload
                      (Proforma here means do not ship)
  sales_notes         notes to production (overwrites; copied onto linked WOs)


sales_lines
-----------
One row per part on a sales order. Repeat so_number.

  id                  integer, internal
  so_number           text → sales_orders.so_number
  part                text
  qty                 integer ≥ 1
  work_order_number   text  (Trace — planned WO; blank = No WO)
  despatch_wo_number  text  (exact WO typed on Shipping)
  despatch_date       date  (set when that line is despatched)


hardware_history
----------------
Not its own table. Stored on work_orders.hardware_history.
CSV explodes it to one row per log line.

  wo_number           text → work_orders.wo_number
  date                stamp  (YYYY-MM-DD HH:mm)
  author              text
  text                the note


build_order / build_queue
------------------------
Each person has their own list.
Work orders (WO), tasks (TSK) and problem tickets (PT) share that list.
position 1 is first on that person's bench.
On hold stays on that person's list if the job was previously active.
An active (started) item keeps its start date and hours.


build_tasks
-----------
Year-round tasks that are not work orders (TSK-1, TSK-2…). Assignment, start and finish are optional.

  id                  serial
  task_number         TSK-1 …
  title               text
  assigned_build      Simon | David | Donald | Kenzie | Catriona | Allan | Lucas | blank
  hours               number
  status              pending | active | on_hold | done
  date_started        date
  date_finished       date
  build_order_notes   text  (multi-line notes on Build order / Tasks)


problem_tickets
---------------
Customer problems, numbered as in Prospect (PT-1842). Same shop fields as a
work order, plus consumed WOs. Title and customer are typed on this board.
The PT still links out to the Prospect ticket page. CE Master does not call
the Prospect API.

  id                  serial
  prospect_number     Prospect problem number (no PT prefix stored)
  title               text
  customer            text
  part                text  (usually a parts.part_number)
  assigned_build      Simon | David | Donald | Kenzie | Catriona | Allan | Lucas | blank
  assigned_next       who the job is passed to (Pass on moves it off the first person's list)
  hours               number  (days in the UI are hours÷8)
  status              pending | active | on_hold | done   (board queue)
  prospect_status     optional status note
  prospect_status_id  unused
  date_added          date
  date_started        date  (set when the job first goes active)
  date_finished       date  (stamped when status becomes done)
  notes               text  (build order notes)
  notes_to_production text  (current note — overwrites, not a log)
  consumed            list of {wo_number, part} — WOs used on this ticket

Hardware history is not stored on the ticket. Opening History on a PT shows
the hardware_history of each consumed work order. A new line is saved on the
consumed WO you pick. On a work order, History is that WO's own log.


sage_pack_lines
---------------
Weekly Sage Outstanding Sales Orders dump. Replaced on each upload. Used on Shipping as extras to pack (screws, instructions, subscriptions). Not long-term history.

  so_number, company, part, description, comment, qty, notes
  notes = SalesOrder.NotesLine1 from the Sage file


Load order
----------
1. parts
2. work_orders
3. units (optional)
4. quality_tickets
5. sales_orders
6. sales_lines
7. hardware_history (optional)
8. build_order (optional)
9. Build_Component_Lookup.xlsx — product × component X matrix + BatteryList
10. Build reports — WORK ORDER, SERIAL, PART NUMBER, then one column per component


Existing keys update. New keys insert. Dates: YYYY-MM-DD or DD/MM/YYYY.


build component lookup
----------------------
Uploaded from the Excel matrix (or edited on Parts spec).

  build_components     component_key, label, kind (pcb | battery | subassembly)
  build_batteries      code (BE.D2, N/A, …)
  build_component_map  part_number × component_key  (X on the matrix)
  wo_build_records     wo_number, serial, revision, battery, non-conformity notes,
                       consumed (WO + part used to build the unit)
  wo_build_values      record_id, component_key, value

Recording a value (or changing it) also appends hardware_history on the work order.
Consumed WOs are saved on the record; "Write to history log" appends them to hardware history.
`;
