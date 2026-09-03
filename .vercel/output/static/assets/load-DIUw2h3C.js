import{Jt as e,Kt as t,a as n,n as r,o as i,ot as a,r as o}from"./dist-Cohvkjgv.js";import{i as s,n as c,r as l}from"./queries-D62vuID9.js";var u=e(t(),1),d=[{key:`parts`,title:`parts`,columns:[`part_number`,`name`,`logger`,`type`,`counts`,`directional`,`build_time_hours`,`notes`,`active`],help:`Catalogue. directional and active: yes/no. Hours only — days are hours÷8 in the app.`,examples:[[`ASSY.TX100`,`TX100 assembly`,`TX100`,`assembly`,``,`no`,`0.4`,``,`yes`],[`RBPB-N-B`,`Remote button PCB N-B`,``,`pcb`,``,`yes`,`8`,`North-bound legend`,`yes`],[`LEADSET-103-M`,`Lead set 103 moulded`,``,`leadset`,``,`no`,`0.2`,``,`yes`]]},{key:`work_orders`,title:`work_orders`,columns:[`wo_number`,`part`,`qty`,`status`,`build_time_hours`,`assigned_build`,`built_in_sage`,`date_added`,`date_started`,`date_closed`,`customer_need_date`,`notes_to_production`,`notes_from_sales`],help:`One row per job. status: pending / active / on_hold / closed / cancelled. Dates: YYYY-MM-DD or DD/MM/YYYY. Qty does not create units. assigned_build: Simon / David / Donald or blank. build_time_hours: leave blank to use parts spec × qty; a number overwrites this job.`,examples:[[`506`,`ASSY.TX100`,`40`,`active`,``,`David`,`no`,`2026-07-28`,`2026-08-26`,``,`2026-09-05`,`Batch for stock`,``],[`1694`,`RBPB-N-B`,`1`,`pending`,``,`David`,`no`,`2026-08-12`,``,``,`2026-08-21`,`Replace returned board`,``],[`508`,`LEADSET-103-M`,`100`,`pending`,``,`Simon`,`no`,`2026-08-20`,``,``,``,``,`Fire Security ×3 and Outdoor Access ×2 on this batch.`]]},{key:`units`,title:`units`,columns:[`work_order_number`,`unit_id`,`serial_or_id`,`status`,`sales_order_number`,`despatch_date`],help:`Only if you already have serials. unit_id like 508-1. status: in build / on shelf / shipped. Leave this sheet empty if you do not track units yet.`,examples:[[`508`,`508-1`,``,`in build`,`3359`,``]]},{key:`quality_tickets`,title:`quality_tickets`,columns:[`ticket_number`,`work_order_number`,`unit_id`,`title`,`problem`,`causes`,`part`,`further_action`,`status`,`assigned_to`,`date_opened`],help:`WO is optional. Leave ticket_number blank to auto-number QT-1, QT-2… status: open / closed. part can differ from the WO. further_action: yes/no. causes: semicolon-separated (TBD; component failure; design work needed; build error; missing parts; documentation).`,examples:[[`QT-1`,`1694`,``,`Silk legend reversed`,`N-B legend reads the wrong way on the button PCB.`,`design work needed`,`RBPB-N-B`,`no`,`open`,`David`,`2026-08-21`]]},{key:`sales_orders`,title:`sales_orders`,columns:[`so_number`,`company`,`order_date`,`lead_time_weeks`,`target_despatch`,`status`,`sage_id`,`despatch_date`,`notes_line1`],help:`status: open / waiting_on_customer / despatched / cancelled. order_date: YYYY-MM-DD, DD/MM/YYYY, or Excel date. Target despatch can be left blank — Floor fills it from order date + lead weeks. Do not put parts here — parts go on sales_lines, one row per part.`,examples:[[`3359`,`Fire Security Team`,`2026-08-04`,`4`,`2026-09-01`,`open`,``],[`3367`,`Outdoor Access Trust`,`2026-08-11`,`3`,`2026-09-01`,`open`,``],[`3401`,`Natural England`,`2026-08-14`,`6`,`2026-09-25`,`waiting_on_customer`,``]]},{key:`sales_lines`,title:`sales_lines`,columns:[`so_number`,`part`,`qty`,`work_order_number`],help:`One row per part. Repeat the so_number. work_order_number is the planned WO (blank = No WO). You may also put order_date and company on this sheet — they write the sales order header.`,examples:[[`3359`,`LEADSET-103-M`,`3`,`508`],[`3359`,`RBPB-N-B`,`1`,``],[`3367`,`LEADSET-103-M`,`2`,`508`],[`3401`,`RBPB-N-B`,`1`,``]]},{key:`hardware_history`,title:`hardware_history`,columns:[`wo_number`,`date`,`author`,`text`],help:`Append-only log. date as 2026-08-21 09:15 or 21/08/2026 09:15. Duplicate lines (same date+author+text) are skipped.`,examples:[[`1694`,`2026-08-21 09:15`,`David`,`Returned board received. Silk legend reversed — holding for QT-1.`]]},{key:`build_order`,title:`build_order`,columns:[`position`,`wo_number`],help:`Per-person queue of work orders. Prefer the Build order screen. Tasks are on build_tasks.`,examples:[[`1`,`1694`],[`2`,`506`],[`3`,`496`],[`4`,`507`],[`5`,`508`]]},{key:`build_tasks`,title:`build_tasks`,columns:[`id`,`title`,`assigned_build`,`hours`,`status`,`build_order_notes`],help:`Extra bench tasks (mow the lawn, etc.). assigned_build: Simon or David. hours feed that person's schedule. status: pending / active / on_hold / done. A started (active) task keeps its start date.`,examples:[[``,`Mow the lawn`,`Simon`,`2`,`pending`],[``,`Goods in`,`David`,`1`,`pending`]]}],f=`CE Master database — A&P Chambers
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
`,p=a();async function m(e){let t=e.name;if(/\.xlsx$/i.test(t)||e.type.includes(`spreadsheet`)){let n=new Uint8Array(await e.arrayBuffer()),r=``;for(let e=0;e<n.length;e+=1)r+=String.fromCharCode(n[e]);return{name:t,kind:`xlsx`,content:btoa(r)}}return{name:t,kind:`csv`,content:await e.text()}}function h(){let e=c(),t=l(),[a,h]=(0,u.useState)(null),[g,_]=(0,u.useState)(!1),[v,y]=(0,u.useState)(!1);async function b(e){let n=[...e].filter(e=>/\.(csv|xlsx|txt)$/i.test(e.name));if(!n.length)return;let r=await Promise.all(n.map(m));t.loadSheet.mutate(r,{onSuccess:e=>h(e.report)})}return e.isLoading?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(i,{title:`Load & download`}),(0,p.jsx)(n,{})]}):e.error||!e.data?(0,p.jsx)(o,{message:e.error instanceof Error?e.error.message:`Could not load CE Master.`}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(i,{title:`Load & download`,hint:`Download today’s CSVs, or a blank template, then drop the filled files back here. You can also drop the Build Component Lookup workbook and build reports (WO / serial / part columns).`,actions:v?(0,p.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,p.jsx)(s,{type:`button`,variant:`danger`,disabled:t.wipe.isPending,onClick:()=>{t.wipe.mutate(void 0,{onSuccess:()=>{h(null),y(!1),r.success(`Database blanked`)}})},children:t.wipe.isPending?`Wiping…`:`Yes, delete everything`}),(0,p.jsx)(s,{type:`button`,variant:`ghost`,onClick:()=>y(!1),children:`Cancel`})]}):(0,p.jsx)(s,{type:`button`,variant:`danger`,onClick:()=>y(!0),children:`Blank database…`})}),(0,p.jsxs)(`section`,{className:`mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`text-sm font-semibold`,children:`Download current data`}),(0,p.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`Live rows from the database. The zip has every table plus the structure notes. If the zip is blocked, use a single table below.`}),(0,p.jsxs)(`div`,{className:`mt-3 flex flex-wrap gap-2`,children:[(0,p.jsx)(s,{asChild:!0,children:(0,p.jsx)(`a`,{href:`/export.zip`,download:`CE-Master-csv.zip`,children:`Download CSV (all files)`})}),(0,p.jsx)(s,{asChild:!0,variant:`outline`,children:(0,p.jsx)(`a`,{href:`/floor-database.txt`,download:`CE-Master-database.txt`,children:`Database structure`})})]}),(0,p.jsx)(`div`,{className:`mt-3 flex flex-wrap gap-2`,children:d.map(e=>(0,p.jsx)(s,{asChild:!0,variant:`ghost`,size:`sm`,children:(0,p.jsxs)(`a`,{href:`/dump/${e.key}`,download:`${e.key}.csv`,children:[e.key,`.csv`]})},e.key))})]}),(0,p.jsxs)(`section`,{className:`mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`text-sm font-semibold`,children:`Templates`}),(0,p.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`Blank headings plus a few sample rows, not your live shop.`}),(0,p.jsxs)(`div`,{className:`mt-3 flex flex-wrap gap-2`,children:[d.map(e=>(0,p.jsx)(s,{asChild:!0,variant:`outline`,size:`sm`,children:(0,p.jsx)(`a`,{href:`/blank/${e.key}`,download:`${e.key}-template.csv`,children:e.key})},e.key)),(0,p.jsx)(s,{asChild:!0,variant:`outline`,size:`sm`,children:(0,p.jsx)(`a`,{href:`/Build_Component_Lookup.xlsx`,download:!0,children:`Build component lookup`})}),(0,p.jsx)(s,{asChild:!0,variant:`outline`,size:`sm`,children:(0,p.jsx)(`a`,{href:`/443_Build_Report.xlsx`,download:!0,children:`Sample build report`})})]})]}),(0,p.jsxs)(`label`,{className:`load-drop ${g?`is-on`:``}`,onDragOver:e=>{e.preventDefault(),_(!0)},onDragLeave:()=>_(!1),onDrop:e=>{e.preventDefault(),_(!1),b(e.dataTransfer.files)},children:[(0,p.jsx)(`input`,{type:`file`,accept:`.csv,.xlsx,.txt`,multiple:!0,className:`sr-only`,onChange:e=>{e.target.files&&b(e.target.files),e.target.value=``}}),(0,p.jsx)(`p`,{className:`font-medium`,children:`Drop CSV or Excel files to load`}),(0,p.jsx)(`p`,{className:`text-sm text-muted`,children:t.loadSheet.isPending?`Loading…`:`Workbooks, CSVs, the component lookup, and build reports (WO / serial / part). Existing rows update; new rows add.`})]}),(0,p.jsxs)(`section`,{className:`mt-5 rounded-[var(--radius-md)] border border-danger/30 bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`text-sm font-semibold`,children:`Blank the database`}),(0,p.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`Use this after a bad load. Download a copy first if you might need it. Wipes jobs, sales, parts, tickets and history for everyone on CE Master.`}),(0,p.jsx)(`div`,{className:`mt-3 flex flex-wrap items-center gap-2`,children:v?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(s,{type:`button`,variant:`danger`,disabled:t.wipe.isPending,onClick:()=>{t.wipe.mutate(void 0,{onSuccess:()=>{h(null),y(!1),r.success(`Database blanked`)}})},children:t.wipe.isPending?`Wiping…`:`Yes, delete everything`}),(0,p.jsx)(s,{type:`button`,variant:`ghost`,onClick:()=>y(!1),children:`Cancel`})]}):(0,p.jsx)(s,{type:`button`,variant:`danger`,onClick:()=>y(!0),children:`Blank database…`})})]}),a?(0,p.jsxs)(`div`,{className:`mt-4 rounded-[var(--radius-md)] border border-border bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`mb-2 text-sm font-semibold`,children:`Last load`}),(0,p.jsxs)(`ul`,{className:`space-y-1 text-sm`,children:[Object.keys({...a.inserted,...a.updated,...a.skipped}).length===0&&a.errors.length===0?(0,p.jsx)(`li`,{className:`text-muted`,children:`Nothing to load.`}):null,Object.entries(a.inserted).map(([e,t])=>(0,p.jsxs)(`li`,{children:[e,`: `,t,` added`]},`i-${e}`)),Object.entries(a.updated).map(([e,t])=>(0,p.jsxs)(`li`,{children:[e,`: `,t,` updated`]},`u-${e}`)),Object.entries(a.skipped).map(([e,t])=>(0,p.jsxs)(`li`,{className:`text-muted`,children:[e,`: `,t,` already there`]},`s-${e}`))]}),a.errors.length?(0,p.jsx)(`ul`,{className:`mt-2 space-y-1 text-sm text-danger`,children:a.errors.map((e,t)=>(0,p.jsxs)(`li`,{children:[e.sheet,e.row?` ${e.row}`:``,`: `,e.message]},t))}):null]}):null,(0,p.jsxs)(`section`,{className:`mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`text-sm font-semibold`,children:`Database structure`}),(0,p.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`Yes — the CSV files are the live rows. This is the table layout they sit on. Same text as the Database structure download and as _database.txt inside the zip.`}),(0,p.jsx)(`pre`,{className:`schema-doc mt-3`,children:f})]}),(0,p.jsx)(`div`,{className:`mt-6 grid gap-3 lg:grid-cols-2`,children:d.map(e=>(0,p.jsxs)(`section`,{className:`rounded-[var(--radius-md)] border border-border bg-surface p-3`,children:[(0,p.jsx)(`h2`,{className:`font-mono text-sm font-semibold`,children:e.title}),(0,p.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:e.help}),(0,p.jsx)(`p`,{className:`mt-2 font-mono text-xs text-faint`,children:e.columns.join(` · `)})]},e.key))})]})}var g=h;export{g as component};