import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { addCalendarDays, nowStamp, todayIso } from "./dates";
import { parseCsv } from "./csv";
import { zipFromFloor } from "./export-data";
import { parseWoNumbers } from "./lookups";
import { pinMiddleware } from "./pin";
import { displayPt, displayTsk, normalizeProspectNumber } from "./prospect";
import { parseSageSopout } from "./sage-sopout";
import {
  QT_CAUSES,
  SO_STATUSES,
  TASK_STATUSES,
  TICKET_STATUSES,
  UNIT_STATUSES,
  WO_STATUS_LABELS,
  WO_STATUSES,
  type BuildTask,
  type FloorState,
  type Note,
  type Part,
  type ProblemTicket,
  type QualityTicket,
  type ProspectSettings,
  type QtCause,
  type QueueEntry,
  type SagePackLine,
  type SagePackMeta,
  type SalesLine,
  type SalesOrder,
  type SoStatus,
  type TaskStatus,
  type TicketStatus,
  type Unit,
  type UnitStatus,
  type WorkOrder,
  type WoStatus,
  type ConsumedWo,
} from "./types";
import { readXlsx } from "./xlsx";
import { loadBuildRecords, loadBuildSpec, setBuildField, setConsumed, writeConsumedHistory, asConsumed, cleanConsumed } from "./build-store";

const woStatus = z.enum(WO_STATUSES);
const unitStatus = z.enum(UNIT_STATUSES);
const taskStatus = z.enum(TASK_STATUSES);
const ticketStatus = z.enum(TICKET_STATUSES);
const soStatus = z.enum(SO_STATUSES);
function asNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}
function asString(value: unknown): string {
  return value == null ? "" : String(value);
}
function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
function asDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : null;
}
function asStamp(value: unknown): string {
  const s = asString(value).trim();
  if (s.length >= 16 && s[10] === "T") return s.slice(0, 16);
  if (s.length >= 10) return s.slice(0, 10);
  return todayIso();
}
function asNotes(value: unknown): Note[] {
  let parsed = value;
  if (typeof value === "string")
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const text = asString(rec.text).trim();
      if (!text) return null;
      return {
        date: asStamp(rec.date),
        author: asString(rec.author),
        text,
      };
    })
    .filter((n) => n != null);
}
function asNoteText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "[]") return "";
    if (trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"')) {
      try {
        return asNoteText(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(asNoteText).filter(Boolean).join("\n");
  }
  if (typeof value === "object" && "text" in value) {
    return asString((value as { text: unknown }).text);
  }
  return asString(value);
}
function mapPart(row: Record<string, unknown>): Part {
  return {
    partNumber: asString(row.part_number),
    name: asString(row.name),
    logger: asString(row.logger),
    type: asString(row.type),
    counts: asString(row.counts),
    directional: asBool(row.directional),
    buildTimeHours: asNumber(row.build_time_hours),
    notes: asString(row.notes),
    active: asBool(row.active),
  };
}
function mapWo(row: Record<string, unknown>): WorkOrder {
  return {
    woNumber: asString(row.wo_number),
    part: asString(row.part),
    qty: Math.max(1, Math.trunc(asNumber(row.qty, 1))),
    status: oneOf(asString(row.status), WO_STATUSES, "pending"),
    buildTimeHours:
      row.build_time_hours == null || row.build_time_hours === ""
        ? null
        : asNumber(row.build_time_hours),
    dateAdded: asDate(row.date_added) ?? todayIso(),
    dateStarted: asDate(row.date_started),
    dateClosed: asDate(row.date_closed),
    assignedBuild: asString(row.assigned_build),
    assignedNext: asString(row.assigned_next),
    builtInSage: asBool(row.built_in_sage),
    notesToProduction:
      asNoteText(row.notes_to_production) || asNoteText(row.production_notes),
    buildOrderNotes: asString(row.notes_from_sales),
    hardwareHistory: asNotes(row.hardware_history),
    customerNeedDate: asDate(row.customer_need_date),
  };
}
function mapUnit(row: Record<string, unknown>): Unit {
  return {
    id: asNumber(row.id),
    workOrderNumber: asString(row.work_order_number),
    unitId: asString(row.unit_id),
    serialOrId: asString(row.serial_or_id),
    status: oneOf(asString(row.status), UNIT_STATUSES, "in build"),
    salesOrderNumber: asString(row.sales_order_number) || null,
    despatchDate: asDate(row.despatch_date),
    notes: asNotes(row.notes),
  };
}
function asCauses(value: unknown): QtCause[] {
  let parsed = value;
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw.split(/[;,]/).map((s) => s.trim());
    }
  }
  if (!Array.isArray(parsed)) return [];
  const allowed = new Set<string>(QT_CAUSES);
  const out: QtCause[] = [];
  for (const item of parsed) {
    const s = String(item).trim();
    if (allowed.has(s) && !out.includes(s as QtCause)) out.push(s as QtCause);
  }
  return out;
}
function mapTicket(row: Record<string, unknown>): QualityTicket {
  return {
    ticketNumber: asString(row.ticket_number),
    workOrderNumber: asString(row.work_order_number),
    unitId: asString(row.unit_id) || null,
    part: asString(row.part),
    title: asString(row.title),
    problem: asString(row.problem),
    causes: asCauses(row.causes),
    furtherAction: asBool(row.further_action),
    status: oneOf(asString(row.status), TICKET_STATUSES, "open"),
    dateOpened: asDate(row.date_opened) ?? todayIso(),
    dateClosed: asDate(row.date_closed),
    assignedTo: asString(row.assigned_to),
    notes: asNotes(row.notes),
  };
}
function mapSo(row: Record<string, unknown>): SalesOrder {
  return {
    soNumber: asString(row.so_number),
    company: asString(row.company),
    orderDate: asDate(row.order_date),
    leadTimeWeeks:
      row.lead_time_weeks == null || row.lead_time_weeks === ""
        ? null
        : asNumber(row.lead_time_weeks),
    targetDespatch: asDate(row.target_despatch),
    targetDespatchIsOverride: asBool(row.target_despatch_is_override),
    status: oneOf(asString(row.status), SO_STATUSES, "open"),
    sageId: asString(row.sage_id),
    despatchDate: asDate(row.despatch_date),
    notesToProduction: asNoteText(row.sales_notes),
    notesLine1: asString(row.notes_line1),
  };
}
function mapLine(row: Record<string, unknown>): SalesLine {
  return {
    id: asNumber(row.id),
    soNumber: asString(row.so_number),
    part: asString(row.part),
    qty: Math.max(1, Math.trunc(asNumber(row.qty, 1))),
    workOrderNumber: asString(row.work_order_number),
    despatchWoNumber: asString(row.despatch_wo_number),
    despatchDate: asDate(row.despatch_date),
  };
}
function mapTask(row: Record<string, unknown>): BuildTask {
  return {
    id: asNumber(row.id),
    taskNumber: asString(row.task_number) || `TSK-${asNumber(row.id)}`,
    title: asString(row.title),
    assignedBuild: asString(row.assigned_build),
    hours: asNumber(row.hours),
    status: oneOf(asString(row.status), TASK_STATUSES, "pending"),
    dateStarted: asDate(row.date_started),
    dateFinished: asDate(row.date_finished),
    buildOrderNotes: asString(row.build_order_notes),
  };
}
function mapSageLine(row: Record<string, unknown>): SagePackLine {
  return {
    id: asNumber(row.id),
    soNumber: asString(row.so_number),
    company: asString(row.company),
    orderDate: asDate(row.order_date),
    part: asString(row.part),
    description: asString(row.description),
    comment: asString(row.comment),
    qty: Math.max(0, Math.trunc(asNumber(row.qty))),
    qtyDespatched: Math.max(0, Math.trunc(asNumber(row.qty_despatched))),
    notes: asString(row.notes),
  };
}
function mapQueue(row: Record<string, unknown>): QueueEntry {
  const kindRaw = asString(row.kind);
  const kind = kindRaw === "task" || kindRaw === "pt" ? kindRaw : "wo";
  return {
    id: asNumber(row.id),
    assignedBuild: asString(row.assigned_build) || "Unassigned",
    position: asNumber(row.position),
    kind,
    woNumber: asString(row.wo_number),
    taskId: row.task_id == null || row.task_id === "" ? null : asNumber(row.task_id),
    problemId: row.problem_id == null || row.problem_id === "" ? null : asNumber(row.problem_id),
  };
}
function jobKeyOf(entry: QueueEntry): string {
  if (entry.kind === "task") return `task:${entry.taskId}`;
  if (entry.kind === "pt") return `pt:${entry.problemId}`;
  return `wo:${entry.woNumber}`;
}
function queueKeyOf(entry: QueueEntry): string {
  if (entry.kind === "wo") return `wo:${entry.woNumber}@${entry.assignedBuild}`;
  if (entry.kind === "pt") return `pt:${entry.problemId}@${entry.assignedBuild}`;
  return jobKeyOf(entry);
}
function mapProblem(row: Record<string, unknown>): ProblemTicket {
  return {
    id: asNumber(row.id),
    prospectNumber: asString(row.prospect_number),
    title: asString(row.title),
    part: asString(row.part),
    assignedBuild: asString(row.assigned_build),
    assignedNext: asString(row.assigned_next),
    hours: asNumber(row.hours),
    status: oneOf(asString(row.status), TASK_STATUSES, "pending"),
    dateAdded: asDate(row.date_added) ?? todayIso(),
    dateStarted: asDate(row.date_started),
    dateFinished: asDate(row.date_finished),
    notes: asString(row.notes),
    notesToProduction: asNoteText(row.notes_to_production),
    customer: asString(row.customer),
    prospectStatus: asString(row.prospect_status),
    prospectStatusId: asString(row.prospect_status_id),
    consumed: asConsumed(row.consumed),
  };
}
function mapProspectSettings(_row: Record<string, unknown> | undefined): ProspectSettings {
  return {
    baseUrl: "",
    hasKey: false,
  };
}
async function activeKeySet(): Promise<Set<string>> {
  const sql = await getSql();
  const wos = await sql`
    select wo_number from work_orders
    where status = ${"active"}
       or (status = ${"on_hold"} and date_started is not null)
  `;
  const tasks = await sql`
    select id from build_tasks
    where status = ${"active"}
       or (status = ${"on_hold"} and date_started is not null)
  `;
  const pts = await sql`
    select id from problem_tickets
    where status = ${"active"}
       or (status = ${"on_hold"} and date_started is not null)
  `;
  return new Set([
    ...wos.map((r) => `wo:${r.wo_number}`),
    ...tasks.map((r) => `task:${r.id}`),
    ...pts.map((r) => `pt:${r.id}`),
  ]);
}
function whoOf(assigned: string): string {
  return assigned.trim() || "Unassigned";
}
async function pinActivesFirst(who: string): Promise<void> {
  const sql = await getSql();
  const mapped = (
    await sql`
    select * from build_queue where assigned_build = ${whoOf(who)} order by position, id
  `
  ).map(mapQueue);
  const active = await activeKeySet();
  const next = [
    ...mapped.filter((e) => active.has(jobKeyOf(e))),
    ...mapped.filter((e) => !active.has(jobKeyOf(e))),
  ];
  for (let i = 0; i < next.length; i += 1)
    await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
}
function deriveBuildOrder(queue: QueueEntry[]): string[] {
  const whoRank = (who: string) => {
    if (who === "Simon") return 0;
    if (who === "David") return 1;
    if (who === "Donald") return 2;
    return 3;
  };
  return [...queue]
    .sort((a, b) => {
      const r = whoRank(a.assignedBuild) - whoRank(b.assignedBuild);
      if (r !== 0) return r;
      return a.position - b.position || a.id - b.id;
    })
    .filter((e) => e.kind === "wo" && e.woNumber)
    .map((e) => e.woNumber);
}
function isOpenStatus(status: string): boolean {
  return status === "pending" || status === "active" || status === "on_hold";
}
async function shipLine(
  sql: Sql,
  line: SalesLine,
  woField: string,
  date: string,
): Promise<void> {
  const woNumbers = parseWoNumbers(woField);
  if (!woNumbers.length) throw new Error("Enter a WO-number");
  await sql`
    update sales_lines
    set despatch_wo_number = ${woNumbers.join(", ")}, despatch_date = ${date}
    where id = ${line.id}
  `;
  const perWo = woNumbers.length === 1 ? line.qty : 1;
  for (const woNumber of woNumbers) {
    await appendDespatchHistory(sql, woNumber, line);
    const units = await sql`
      select id from units
      where work_order_number = ${woNumber}
        and (
          sales_order_number is null
          or sales_order_number = ''
          or sales_order_number = ${line.soNumber}
        )
        and status <> 'shipped'
      order by unit_id
      limit ${perWo}
    `;
    for (const unit of units)
      await sql`
        update units set
          sales_order_number = ${line.soNumber},
          despatch_date = ${date},
          status = ${"shipped"}
        where id = ${unit.id}
      `;
  }
}
async function appendDespatchHistory(sql: Sql, woNumber: string, line: SalesLine): Promise<void> {
  const rows = await sql`
    select * from work_orders where wo_number = ${woNumber} limit 1
  `;
  if (!rows[0]) return;
  const wo = mapWo(rows[0]);
  const text = `Shipped on ${line.soNumber} — ${line.part || "part"} × ${line.qty}`;
  if (
    wo.hardwareHistory.some(
      (n) => n.text === text || (/shipped on/i.test(n.text) && n.text.includes(line.soNumber)),
    )
  )
    return;
  const notes = [
    ...wo.hardwareHistory,
    {
      date: nowStamp(),
      author: "Shipping",
      text,
    },
  ];
  await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}
async function stampSalesOrderDespatch(sql: Sql, soNumber: string, date: string): Promise<void> {
  await sql`
    update sales_orders set despatch_date = ${date}
    where so_number = ${soNumber}
  `;
  if (
    (
      await sql`
    select id from sales_lines
    where so_number = ${soNumber}
      and despatch_date is null
  `
    ).length === 0
  )
    await sql`
      update sales_orders set status = ${"despatched"}
      where so_number = ${soNumber}
        and status in ('open', 'waiting_on_customer')
    `;
}
async function nextWoNumberValue(): Promise<string> {
  const rows = await (await getSql())`select wo_number from work_orders`;
  const used = new Set(rows.map((r) => r.wo_number));
  let n = 508;
  while (used.has(String(n))) n += 1;
  return String(n);
}
function nextPrefixedNumber(values: Iterable<string | null | undefined>, prefix: string): string {
  const re = new RegExp(`^${prefix}-(\\d+)$`, "i");
  let max = 0;
  for (const value of values) {
    const m = re.exec(value ?? "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${max + 1}`;
}
async function nextQtNumberValue(): Promise<string> {
  return nextPrefixedNumber(
    (
      await (await getSql())`
    select ticket_number from quality_tickets
  `
    ).map((r) => asString(r.ticket_number)),
    "QT",
  );
}
async function nextTskNumberValue(): Promise<string> {
  return nextPrefixedNumber(
    (
      await (await getSql())`
    select task_number from build_tasks
  `
    ).map((r) => asString(r.task_number)),
    "TSK",
  );
}
async function loadState(): Promise<FloorState> {
  const sql = await getSql();
  const [
    parts,
    workOrders,
    units,
    tickets,
    queueRows,
    taskRows,
    problemRows,
    salesOrders,
    salesLines,
    sageRows,
    sageMeta,
    settingsRows,
  ] = await Promise.all([
    sql`select * from parts order by part_number`,
    sql`select * from work_orders order by date_added, wo_number`,
    sql`select * from units order by unit_id`,
    sql`select * from quality_tickets order by date_opened, ticket_number`,
    sql`select * from build_queue order by assigned_build, position, id`,
    sql`select * from build_tasks order by id`,
    sql`select * from problem_tickets order by id`,
    sql`select * from sales_orders order by so_number`,
    sql`select * from sales_lines order by id`,
    sql`select * from sage_pack_lines order by so_number, id`,
    sql`select * from sage_pack_meta where id = 1 limit 1`,
    sql`select * from floor_settings where id = 1 limit 1`,
  ]);
  const [buildSpec, buildRecords] = await Promise.all([loadBuildSpec(sql), loadBuildRecords(sql)]);
  const workMapped = workOrders.map(mapWo);
  let queue = queueRows.map(mapQueue);
  const tasks = taskRows.map(mapTask);
  const problems = problemRows.map(mapProblem);
  const onQueue = new Set(queue.filter((e) => e.kind === "wo").map((e) => e.woNumber));
  const missing = workMapped.filter((w) => isOpenStatus(w.status) && !onQueue.has(w.woNumber));
  if (missing.length) {
    for (const w of missing) await appendToBuildOrder(w.woNumber);
    queue = (
      await sql`
      select * from build_queue order by assigned_build, position, id
    `
    ).map(mapQueue);
  }
  const onPtQueue = new Set(
    queue
      .filter((e) => e.kind === "pt")
      .map((e) => e.problemId)
      .filter((id) => id != null),
  );
  const missingPt = problems.filter((p) => p.status !== "done" && !onPtQueue.has(p.id));
  if (missingPt.length) {
    for (const p of missingPt) await appendProblemToQueue(p.id, p.assignedBuild);
    queue = (
      await sql`
      select * from build_queue order by assigned_build, position, id
    `
    ).map(mapQueue);
  }
  return {
    parts: parts.map(mapPart),
    workOrders: workMapped,
    units: units.map(mapUnit),
    tickets: tickets.map(mapTicket),
    buildOrder: deriveBuildOrder(queue),
    buildQueue: queue,
    buildTasks: tasks,
    problemTickets: problems,
    salesOrders: salesOrders.map(mapSo),
    salesLines: salesLines.map(mapLine),
    sagePackLines: sageRows.map(mapSageLine),
    sagePackMeta: sageMeta[0]
      ? {
          uploadedAt: asString(sageMeta[0].uploaded_at) || null,
          filename: asString(sageMeta[0].filename),
          rowCount: asNumber(sageMeta[0].row_count),
        }
      : {
          uploadedAt: null,
          filename: "",
          rowCount: 0,
        },
    prospect: mapProspectSettings(settingsRows[0]),
    buildSpec,
    buildRecords,
    nextWoNumber: await nextWoNumberValue(),
    nextQtNumber: await nextQtNumberValue(),
    nextTskNumber: await nextTskNumberValue(),
  };
}
async function getWorkOrder(woNumber: string): Promise<WorkOrder | null> {
  const rows = await (await getSql())`
    select * from work_orders where wo_number = ${woNumber} limit 1
  `;
  return rows[0] ? mapWo(rows[0]) : null;
}
async function appendWoHistory(
  sql: Sql,
  woNumber: string,
  author: string,
  text: string,
): Promise<void> {
  const wo = await getWorkOrder(woNumber);
  if (!wo) return;
  const notes = [
    ...wo.hardwareHistory,
    {
      date: nowStamp(),
      author,
      text,
    },
  ];
  await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}

async function setWoNotesToProduction(sql: Sql, woNumber: string, text: string): Promise<void> {
  await sql`
    update work_orders set
      notes_to_production = ${text},
      production_notes = '[]'::jsonb
    where wo_number = ${woNumber}
  `;
}
async function linkedWoNumbers(sql: Sql, soNumber: string): Promise<string[]> {
  const lines = await sql`
    select work_order_number from sales_lines
    where so_number = ${soNumber} and coalesce(work_order_number, '') <> ''
  `;
  return [...new Set(lines.map((l) => asString(l.work_order_number).trim()).filter(Boolean))];
}
function formatTicketWos(raw: string): string {
  return parseWoNumbers(raw).join(", ");
}
async function workOrdersFromField(raw: string): Promise<{ field: string; wos: WorkOrder[] }> {
  const field = formatTicketWos(raw);
  const wos: WorkOrder[] = [];
  for (const n of parseWoNumbers(field)) {
    const wo = await getWorkOrder(n);
    if (wo) wos.push(wo);
  }
  return {
    field,
    wos,
  };
}
async function removeFromBuildOrder(woNumber: string): Promise<void> {
  const sql = await getSql();
  const row = await sql`
    select assigned_build from build_queue where wo_number = ${woNumber} limit 1
  `;
  await sql`delete from build_queue where wo_number = ${woNumber}`;
  if (row[0]) await reindexWho(asString(row[0].assigned_build));
}
async function reindexWho(who: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql`
    select id from build_queue where assigned_build = ${who} order by position, id
  `;
  for (let i = 0; i < rows.length; i += 1)
    await sql`update build_queue set position = ${i} where id = ${rows[i].id}`;
}
async function nextQueuePosition(who: string): Promise<number> {
  return asNumber((await (await getSql())`
    select max(position) as max_pos from build_queue where assigned_build = ${who}
  `)[0]?.max_pos, -1) + 1;
}
async function appendProblemToQueue(problemId: number, assignedBuild: string): Promise<void> {
  await syncPtQueue(problemId, [assignedBuild]);
}
async function syncPtQueue(problemId: number, people: string[]): Promise<void> {
  const sql = await getSql();
  const unique = [...new Set(people.map((p) => whoOf(p)))];
  const rows = await sql`
    select id, assigned_build from build_queue where problem_id = ${problemId}
  `;
  const have = new Set(rows.map((r) => r.assigned_build));
  for (const row of rows)
    if (!unique.includes(asString(row.assigned_build))) {
      await sql`delete from build_queue where id = ${row.id}`;
      await reindexWho(asString(row.assigned_build));
    }
  for (const who of unique) {
    if (have.has(who)) continue;
    await sql`
      insert into build_queue (assigned_build, position, kind, problem_id)
      values (${who}, ${await nextQueuePosition(who)}, ${"pt"}, ${problemId})
    `;
  }
}
async function clearPtQueue(problemId: number): Promise<void> {
  const sql = await getSql();
  const rows = await sql`
    select assigned_build from build_queue where problem_id = ${problemId}
  `;
  await sql`delete from build_queue where problem_id = ${problemId}`;
  const seen = new Set<string>();
  for (const row of rows) {
    const who = asString(row.assigned_build);
    if (seen.has(who)) continue;
    seen.add(who);
    await reindexWho(who);
  }
}
async function appendToBuildOrder(woNumber: string): Promise<void> {
  await syncWoQueue(woNumber, [(await getWorkOrder(woNumber))?.assignedBuild ?? "Simon"]);
}
async function syncWoQueue(woNumber: string, people: string[]): Promise<void> {
  const sql = await getSql();
  const unique = [...new Set(people.map((p) => whoOf(p)))];
  const rows = await sql`
    select id, assigned_build from build_queue where wo_number = ${woNumber}
  `;
  const have = new Set(rows.map((r) => r.assigned_build));
  for (const row of rows)
    if (!unique.includes(asString(row.assigned_build))) {
      await sql`delete from build_queue where id = ${row.id}`;
      await reindexWho(asString(row.assigned_build));
    }
  for (const who of unique) {
    if (have.has(who)) continue;
    await sql`
      insert into build_queue (assigned_build, position, kind, wo_number)
      values (${who}, ${await nextQueuePosition(who)}, ${"wo"}, ${woNumber})
    `;
  }
}
async function applyStatusSideEffects(
  wo: WorkOrder,
  nextStatus: WoStatus,
): Promise<{ dateStarted: string | null; dateClosed: string | null }> {
  const today = todayIso();
  let dateStarted = wo.dateStarted;
  let dateClosed = wo.dateClosed;
  if (nextStatus === "active" && !dateStarted) dateStarted = today;
  if (nextStatus === "closed") dateClosed = today;
  if (wo.status === "closed" && nextStatus !== "closed") dateClosed = null;
  const wasOpen = isOpenStatus(wo.status);
  const willOpen = isOpenStatus(nextStatus);
  if (wasOpen && !willOpen) await removeFromBuildOrder(wo.woNumber);
  if (!wasOpen && willOpen) await appendToBuildOrder(wo.woNumber);
  return {
    dateStarted,
    dateClosed,
  };
}
function computeTargetDespatch(
  orderDate: string | null,
  leadTimeWeeks: number | null,
  current: string | null,
  isOverride: boolean,
): string | null {
  if (isOverride) return current;
  if (!orderDate || leadTimeWeeks == null) return current;
  return addCalendarDays(orderDate, Math.round(leadTimeWeeks * 7));
}
export const loadFloor = createServerFn({ method: "GET" })
  .middleware([pinMiddleware])
  .handler(async () => loadState());
export const exportFloorZip = createServerFn({ method: "GET" })
  .middleware([pinMiddleware])
  .handler(async () => {
    const state = await loadState();
    const bytes = zipFromFloor(state);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return {
      filename: `CE-Master-${todayIso()}-csv.zip`,
      base64: btoa(binary),
    };
  });
export const createWorkOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().trim().min(1).optional(),
      part: z.string().optional(),
      qty: z.number().int().min(1).optional(),
      status: woStatus.optional(),
      buildTimeHours: z.number().nullable().optional(),
      assignedBuild: z.string().optional(),
      assignedNext: z.string().optional(),
      builtInSage: z.boolean().optional(),
      notesToProduction: z.string().optional(),
      buildOrderNotes: z.string().optional(),
      customerNeedDate: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const woNumber = (data.woNumber ?? (await nextWoNumberValue())).trim();
    if (!woNumber) throw new Error("Work order number is required");
    if (await getWorkOrder(woNumber)) throw new Error(`Work order ${woNumber} already exists`);
    const status = data.status ?? "pending";
    const today = todayIso();
    const dateStarted = status === "active" ? today : null;
    await sql`
      insert into work_orders (
        wo_number, part, qty, status, date_added, date_started, date_closed,
        assigned_build, assigned_next, built_in_sage, notes_to_production, notes_from_sales,
        customer_need_date, build_time_hours
      ) values (
        ${woNumber},
        ${data.part ?? ""},
        ${data.qty ?? 1},
        ${status},
        ${today},
        ${dateStarted},
        ${null},
        ${data.assignedBuild ?? "Simon"},
        ${data.assignedNext ?? ""},
        ${data.builtInSage ?? false},
        ${data.notesToProduction ?? ""},
        ${data.buildOrderNotes ?? ""},
        ${data.customerNeedDate ?? null},
        ${data.buildTimeHours ?? null}
      )
    `;
    if (isOpenStatus(status)) await appendToBuildOrder(woNumber);
    return loadState();
  });
export const updateWorkOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      part: z.string().optional(),
      qty: z.number().int().min(1).optional(),
      status: woStatus.optional(),
      buildTimeHours: z.number().nullable().optional(),
      assignedBuild: z.string().optional(),
      assignedNext: z.string().optional(),
      builtInSage: z.boolean().optional(),
      notesToProduction: z.string().optional(),
      buildOrderNotes: z.string().optional(),
      customerNeedDate: z.string().nullable().optional(),
      holdReason: z.string().optional(),
      historyAuthor: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    let dateStarted = wo.dateStarted;
    let dateClosed = wo.dateClosed;
    const nextStatus = data.status ?? wo.status;
    if (data.status && data.status !== wo.status) {
      const side = await applyStatusSideEffects(wo, data.status);
      dateStarted = side.dateStarted;
      dateClosed = side.dateClosed;
    }
    const history = [...wo.hardwareHistory];
    if (data.status && data.status !== wo.status) {
      const author = data.historyAuthor?.trim() || "Floor";
      if (data.status === "on_hold") {
        const reason = (data.holdReason ?? "").trim() || "No reason given";
        history.push({
          date: nowStamp(),
          author,
          text: `On hold: ${reason}`,
        });
      } else if (wo.status === "on_hold")
        history.push({
          date: nowStamp(),
          author,
          text: `Off hold — set to ${WO_STATUS_LABELS[data.status]}.`,
        });
      else
        history.push({
          date: nowStamp(),
          author,
          text: `Status: ${WO_STATUS_LABELS[data.status]}`,
        });
    }
    await sql`
      update work_orders set
        part = ${data.part ?? wo.part},
        qty = ${data.qty ?? wo.qty},
        status = ${nextStatus},
        build_time_hours = ${data.buildTimeHours === void 0 ? wo.buildTimeHours : data.buildTimeHours},
        date_started = ${dateStarted},
        date_closed = ${dateClosed},
        assigned_build = ${data.assignedBuild ?? wo.assignedBuild},
        assigned_next = ${data.assignedNext === void 0 ? wo.assignedNext : data.assignedNext},
        built_in_sage = ${data.builtInSage ?? wo.builtInSage},
        notes_to_production = ${data.notesToProduction ?? wo.notesToProduction},
        production_notes = '[]'::jsonb,
        notes_from_sales = ${data.buildOrderNotes ?? wo.buildOrderNotes},
        customer_need_date = ${data.customerNeedDate === void 0 ? wo.customerNeedDate : data.customerNeedDate},
        hardware_history = ${JSON.stringify(history)}::jsonb
      where wo_number = ${data.woNumber}
    `;
    const nextWho = data.assignedBuild ?? wo.assignedBuild;
    const nextNext = data.assignedNext === void 0 ? wo.assignedNext : data.assignedNext;
    if (isOpenStatus(nextStatus)) {
      const wasPre = (
        await (await getSql())`
        select assigned_build from build_queue where wo_number = ${data.woNumber}
      `
      ).some((r) => r.assigned_build !== whoOf(wo.assignedBuild));
      const keep = [whoOf(nextWho)];
      const nxt = whoOf(nextNext);
      if (wasPre && nextNext.trim() && nxt !== keep[0]) keep.push(nxt);
      await syncWoQueue(data.woNumber, keep);
    }
    if (data.status && data.status !== wo.status) await pinActivesFirst(nextWho);
    return loadState();
  });
export const passWorkOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      historyAuthor: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    const next = wo.assignedNext.trim();
    if (!next) throw new Error("Set Who next first");
    if (next === wo.assignedBuild) throw new Error("Who next is already on this job");
    const author = data.historyAuthor?.trim() || "Floor";
    const from = wo.assignedBuild.trim() || "Unassigned";
    const history = [
      ...wo.hardwareHistory,
      {
        date: nowStamp(),
        author,
        text: `Passed from ${from} to ${next}`,
      },
    ];
    await sql`
      update work_orders set
        assigned_build = ${next},
        assigned_next = ${""},
        hardware_history = ${JSON.stringify(history)}::jsonb
      where wo_number = ${data.woNumber}
    `;
    if (isOpenStatus(wo.status)) await syncWoQueue(data.woNumber, [next]);
    await pinActivesFirst(from);
    await pinActivesFirst(next);
    return loadState();
  });
export const prePassWorkOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      historyAuthor: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    const next = wo.assignedNext.trim();
    if (!next) throw new Error("Set Who next first");
    if (next === wo.assignedBuild) throw new Error("Who next is already on this job");
    if (!isOpenStatus(wo.status)) throw new Error("Only open jobs can be pre-passed");
    const author = data.historyAuthor?.trim() || "Floor";
    const from = wo.assignedBuild.trim() || "Unassigned";
    const history = [
      ...wo.hardwareHistory,
      {
        date: nowStamp(),
        author,
        text: `Pre-passed to ${next} (kept on ${from}'s list)`,
      },
    ];
    await sql`
      update work_orders
      set hardware_history = ${JSON.stringify(history)}::jsonb
      where wo_number = ${data.woNumber}
    `;
    await syncWoQueue(data.woNumber, [from, next]);
    await pinActivesFirst(from);
    await pinActivesFirst(next);
    return loadState();
  });
export const reorderBuildOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      who: z.string().min(1),
      keys: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const active = await activeKeySet();
    if (data.who === "pending") {
      const all = (
        await sql`
        select * from build_queue order by assigned_build, position, id
      `
      ).map(mapQueue);
      const byWho = new Map<string, QueueEntry[]>();
      for (const e of all) {
        const list = byWho.get(e.assignedBuild) ?? [];
        list.push(e);
        byWho.set(e.assignedBuild, list);
      }
      const byKey = new Map(all.map((e) => [queueKeyOf(e), e]));
      for (const [who, list] of byWho) {
        const actives = list.filter((e) => active.has(jobKeyOf(e)));
        const pending: QueueEntry[] = [];
        const used = new Set<number>();
        for (const key of data.keys) {
          const hit = byKey.get(key);
          if (!hit || hit.assignedBuild !== who) continue;
          if (active.has(jobKeyOf(hit))) continue;
          pending.push(hit);
          used.add(hit.id);
        }
        for (const e of list) {
          if (active.has(jobKeyOf(e)) || used.has(e.id)) continue;
          pending.push(e);
        }
        const next = [...actives, ...pending];
        for (let i = 0; i < next.length; i += 1)
          await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
      }
      return loadState();
    }
    const current = (
      await sql`
      select * from build_queue where assigned_build = ${whoOf(data.who)} order by position, id
    `
    ).map(mapQueue);
    const byKey = new Map(current.map((e) => [queueKeyOf(e), e]));
    const chosen = [];
    for (const key of data.keys) {
      const hit = byKey.get(key);
      if (hit) {
        chosen.push(hit);
        byKey.delete(key);
      }
    }
    const leftovers = current.filter((e) => byKey.has(queueKeyOf(e)));
    const chosenActive = chosen.filter((e) => active.has(jobKeyOf(e)));
    const leftoverActive = leftovers.filter((e) => active.has(jobKeyOf(e)));
    const leftoverPending = leftovers.filter((e) => !active.has(jobKeyOf(e)));
    const next = [...chosenActive, ...leftoverActive, ...leftoverPending];
    for (let i = 0; i < next.length; i += 1)
      await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
    return loadState();
  });
export const createBuildTask = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      title: z.string().min(1),
      hours: z.number().min(0).optional(),
      assignedBuild: z.string().optional(),
      taskNumber: z.string().optional(),
      dateStarted: z.string().nullable().optional(),
      dateFinished: z.string().nullable().optional(),
      buildOrderNotes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const who = whoOf(data.assignedBuild ?? "");
    const hours = data.hours ?? 0;
    const taskNumber = data.taskNumber?.trim()
      ? displayTsk(data.taskNumber)
      : await nextTskNumberValue();
    const started = asDate(data.dateStarted ?? null);
    const finished = asDate(data.dateFinished ?? null);
    const status = started && !finished ? "active" : finished ? "done" : "pending";
    const taskId = (
      await sql`
      insert into build_tasks (task_number, title, assigned_build, hours, status, date_started, date_finished, build_order_notes)
      values (
        ${taskNumber},
        ${data.title.trim()},
        ${data.assignedBuild?.trim() ?? ""},
        ${hours},
        ${status},
        ${started},
        ${finished},
        ${data.buildOrderNotes ?? ""}
      )
      returning id
    `
    )[0]?.id;
    if (taskId == null) throw new Error("Could not create task");
    await sql`
      insert into build_queue (assigned_build, position, kind, task_id)
      values (${who}, ${
        asNumber(
          (
            await sql`
      select max(position) as max_pos from build_queue where assigned_build = ${who}
    `
          )[0]?.max_pos,
          -1,
        ) + 1
      }, ${"task"}, ${taskId})
    `;
    if (status === "active") await pinActivesFirst(who);
    return loadState();
  });
export const updateBuildTask = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      title: z.string().optional(),
      hours: z.number().min(0).optional(),
      status: taskStatus.optional(),
      assignedBuild: z.string().optional(),
      dateStarted: z.string().nullable().optional(),
      dateFinished: z.string().nullable().optional(),
      taskNumber: z.string().optional(),
      buildOrderNotes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from build_tasks where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Task not found");
    const task = mapTask(rows[0]);
    let dateStarted = data.dateStarted === void 0 ? task.dateStarted : asDate(data.dateStarted);
    let dateFinished = data.dateFinished === void 0 ? task.dateFinished : asDate(data.dateFinished);
    const nextStatus = data.status ?? task.status;
    if (nextStatus === "active" && !dateStarted) dateStarted = todayIso();
    if (nextStatus === "done" && !dateFinished) dateFinished = todayIso();
    const nextWho = whoOf(data.assignedBuild ?? task.assignedBuild);
    const assignedStore =
      data.assignedBuild === void 0 ? task.assignedBuild : data.assignedBuild.trim();
    await sql`
      update build_tasks set
        task_number = ${data.taskNumber?.trim() ? displayTsk(data.taskNumber) : task.taskNumber},
        title = ${data.title ?? task.title},
        hours = ${data.hours ?? task.hours},
        status = ${nextStatus},
        date_started = ${dateStarted},
        date_finished = ${dateFinished},
        assigned_build = ${assignedStore},
        build_order_notes = ${data.buildOrderNotes ?? task.buildOrderNotes}
      where id = ${data.id}
    `;
    if (nextWho !== task.assignedBuild) {
      const cur = await sql`
        select id, assigned_build from build_queue where task_id = ${data.id} limit 1
      `;
      if (cur[0] && asString(cur[0].assigned_build) !== nextWho) {
        const from = asString(cur[0].assigned_build);
        await sql`
          update build_queue
          set assigned_build = ${nextWho}, position = ${
            asNumber(
              (
                await sql`
          select max(position) as max_pos from build_queue where assigned_build = ${nextWho}
        `
              )[0]?.max_pos,
              -1,
            ) + 1
          }
          where id = ${cur[0].id}
        `;
        await reindexWho(from);
      }
    }
    if (data.status && data.status !== task.status) await pinActivesFirst(nextWho);
    return loadState();
  });
export const createProblemTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      prospectNumber: z.string().min(1),
      title: z.string().optional(),
      hours: z.number().min(0).optional(),
      assignedBuild: z.string().optional(),
      assignedNext: z.string().optional(),
      customer: z.string().optional(),
      part: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const prospectNumber = normalizeProspectNumber(data.prospectNumber);
    if (!prospectNumber) throw new Error("Enter a Prospect problem number");
    if (
      (
        await sql`
      select id from problem_tickets where prospect_number = ${prospectNumber} limit 1
    `
      )[0]
    )
      throw new Error(`${displayPt(prospectNumber)} is already on the board`);
    const title = (data.title ?? "").trim();
    const customer = (data.customer ?? "").trim();
    const part = (data.part ?? "").trim();
    const who = data.assignedBuild?.trim() ?? "";
    const next = data.assignedNext?.trim() ?? "";
    const hours = data.hours ?? 0;
    const today = todayIso();
    const id = asNumber((
      await sql`
      insert into problem_tickets (
        prospect_number, title, part, assigned_build, assigned_next, hours, status,
        date_added, prospect_status, prospect_status_id, customer
      )
      values (
        ${prospectNumber}, ${title}, ${part}, ${who}, ${next}, ${hours}, ${"pending"},
        ${today}, ${""}, ${""}, ${customer}
      )
      returning id
    `
      )[0]?.id);
    if (!id) throw new Error("Could not create problem ticket");
    await appendProblemToQueue(id, who);
    return loadState();
  });
export const updateProblemTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      prospectNumber: z.string().optional(),
      title: z.string().optional(),
      part: z.string().optional(),
      hours: z.number().min(0).optional(),
      status: taskStatus.optional(),
      assignedBuild: z.string().optional(),
      assignedNext: z.string().optional(),
      notes: z.string().optional(),
      notesToProduction: z.string().optional(),
      customer: z.string().optional(),
      prospectStatus: z.string().optional(),
      dateAdded: z.string().nullable().optional(),
      dateStarted: z.string().nullable().optional(),
      dateFinished: z.string().nullable().optional(),
      consumed: z.array(z.object({ woNumber: z.string(), part: z.string() })).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from problem_tickets where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Problem ticket not found");
    const pt = mapProblem(rows[0]);
    let dateStarted = data.dateStarted === void 0 ? pt.dateStarted : asDate(data.dateStarted);
    let dateFinished = data.dateFinished === void 0 ? pt.dateFinished : asDate(data.dateFinished);
    const nextStatus = data.status ?? pt.status;
    if (nextStatus === "active" && !dateStarted) dateStarted = todayIso();
    if (nextStatus === "done" && !dateFinished) dateFinished = todayIso();
    if (pt.status === "done" && nextStatus !== "done") dateFinished = dateFinished;
    const nextWho = whoOf(data.assignedBuild ?? pt.assignedBuild);
    const assignedStore =
      data.assignedBuild === void 0 ? pt.assignedBuild : data.assignedBuild.trim();
    const assignedNext =
      data.assignedNext === void 0 ? pt.assignedNext : data.assignedNext.trim();
    const consumed = data.consumed === void 0 ? pt.consumed : cleanConsumed(data.consumed);
    const dateAdded =
      data.dateAdded === void 0 ? pt.dateAdded : asDate(data.dateAdded) ?? pt.dateAdded;
    await sql`
      update problem_tickets set
        prospect_number = ${data.prospectNumber !== void 0 ? normalizeProspectNumber(data.prospectNumber) || pt.prospectNumber : pt.prospectNumber},
        title = ${data.title ?? pt.title},
        part = ${data.part !== void 0 ? data.part.trim() : pt.part},
        hours = ${data.hours ?? pt.hours},
        status = ${nextStatus},
        date_added = ${dateAdded},
        date_started = ${dateStarted},
        date_finished = ${dateFinished},
        assigned_build = ${assignedStore},
        assigned_next = ${assignedNext},
        notes = ${data.notes ?? pt.notes},
        notes_to_production = ${JSON.stringify(data.notesToProduction ?? pt.notesToProduction)}::jsonb,
        customer = ${data.customer !== void 0 ? data.customer.trim() : pt.customer},
        prospect_status = ${data.prospectStatus !== void 0 ? data.prospectStatus.trim() : pt.prospectStatus},
        consumed = ${JSON.stringify(consumed)}::jsonb
      where id = ${data.id}
    `;
    if (nextStatus === "done") {
      await clearPtQueue(data.id);
    } else {
      const wasPre = (
        await sql`
        select assigned_build from build_queue where problem_id = ${data.id}
      `
      ).some((r) => r.assigned_build !== whoOf(pt.assignedBuild));
      const keep = [nextWho];
      const nxt = whoOf(assignedNext);
      if (wasPre && assignedNext.trim() && nxt !== keep[0]) keep.push(nxt);
      await syncPtQueue(data.id, keep);
    }
    if (data.status && data.status !== pt.status) await pinActivesFirst(nextWho);
    return loadState();
  });
export const passProblemTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`select * from problem_tickets where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Problem ticket not found");
    const pt = mapProblem(rows[0]);
    const next = pt.assignedNext.trim();
    if (!next) throw new Error("Set Who next first");
    if (next === pt.assignedBuild) throw new Error("Who next is already on this job");
    const from = pt.assignedBuild.trim() || "Unassigned";
    await sql`
      update problem_tickets
      set assigned_build = ${next}, assigned_next = ${""}
      where id = ${data.id}
    `;
    if (pt.status !== "done") await syncPtQueue(data.id, [next]);
    await pinActivesFirst(from);
    await pinActivesFirst(next);
    return loadState();
  });
export const prePassProblemTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`select * from problem_tickets where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Problem ticket not found");
    const pt = mapProblem(rows[0]);
    const next = pt.assignedNext.trim();
    if (!next) throw new Error("Set Who next first");
    if (next === pt.assignedBuild) throw new Error("Who next is already on this job");
    if (pt.status === "done") throw new Error("Only open tickets can be pre-passed");
    const from = pt.assignedBuild.trim() || "Unassigned";
    await syncPtQueue(data.id, [from, next]);
    await pinActivesFirst(from);
    await pinActivesFirst(next);
    return loadState();
  });
export const deleteProblemTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    await clearPtQueue(data.id);
    await (await getSql())`delete from problem_tickets where id = ${data.id}`;
    return loadState();
  });
export const deleteBuildTask = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const cur = await sql`
      select assigned_build from build_queue where task_id = ${data.id} limit 1
    `;
    await sql`delete from build_queue where task_id = ${data.id}`;
    await sql`delete from build_tasks where id = ${data.id}`;
    if (cur[0]) await reindexWho(asString(cur[0].assigned_build));
    return loadState();
  });
export const addHardwareHistory = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      author: z.string(),
      text: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    const notes = [
      ...wo.hardwareHistory,
      {
        date: nowStamp(),
        author: data.author,
        text: data.text.trim(),
      },
    ];
    await sql`
      update work_orders
      set hardware_history = ${JSON.stringify(notes)}::jsonb
      where wo_number = ${data.woNumber}
    `;
    return loadState();
  });
export const createPart = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      partNumber: z.string().trim().min(1),
      name: z.string().optional(),
      logger: z.string().optional(),
      type: z.string().optional(),
      counts: z.string().optional(),
      directional: z.boolean().optional(),
      buildTimeHours: z.number().optional(),
      notes: z.string().optional(),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (
      (
        await sql`
      select part_number from parts where part_number = ${data.partNumber}
    `
      ).length
    )
      throw new Error(`Part ${data.partNumber} already exists`);
    await sql`
      insert into parts (
        part_number, name, logger, type, counts, directional, build_time_hours, notes, active
      ) values (
        ${data.partNumber},
        ${data.name ?? ""},
        ${data.logger ?? ""},
        ${data.type ?? ""},
        ${data.counts ?? ""},
        ${data.directional ?? false},
        ${data.buildTimeHours ?? 0},
        ${data.notes ?? ""},
        ${data.active ?? true}
      )
    `;
    return loadState();
  });
export const updatePart = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      partNumber: z.string().min(1),
      nextPartNumber: z.string().optional(),
      name: z.string().optional(),
      logger: z.string().optional(),
      type: z.string().optional(),
      counts: z.string().optional(),
      directional: z.boolean().optional(),
      buildTimeHours: z.number().optional(),
      notes: z.string().optional(),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from parts where part_number = ${data.partNumber} limit 1
    `;
    if (!rows[0]) throw new Error(`Part ${data.partNumber} not found`);
    const current = mapPart(rows[0]);
    const nextNumber = (data.nextPartNumber ?? current.partNumber).trim();
    if (!nextNumber) throw new Error("Part number cannot be blank");
    if (nextNumber !== current.partNumber) {
      if (
        (
          await sql`
        select part_number from parts where part_number = ${nextNumber} limit 1
      `
        )[0]
      )
        throw new Error(`Part ${nextNumber} already exists`);
    }
    await sql`
      update parts set
        part_number = ${nextNumber},
        name = ${data.name ?? current.name},
        logger = ${data.logger ?? current.logger},
        type = ${data.type ?? current.type},
        counts = ${data.counts ?? current.counts},
        directional = ${data.directional ?? current.directional},
        build_time_hours = ${data.buildTimeHours ?? current.buildTimeHours},
        notes = ${data.notes ?? current.notes},
        active = ${data.active ?? current.active}
      where part_number = ${data.partNumber}
    `;
    if (nextNumber !== current.partNumber) {
      await sql`update work_orders set part = ${nextNumber} where part = ${data.partNumber}`;
      await sql`update sales_lines set part = ${nextNumber} where part = ${data.partNumber}`;
      await sql`update quality_tickets set part = ${nextNumber} where part = ${data.partNumber}`;
    }
    return loadState();
  });
export const addUnit = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ woNumber: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (!(await getWorkOrder(data.woNumber)))
      throw new Error(`Work order ${data.woNumber} not found`);
    const existing = await sql`
      select unit_id from units where work_order_number = ${data.woNumber}
    `;
    let max = 0;
    const prefix = `${data.woNumber}-`;
    for (const row of existing)
      if (asString(row.unit_id).startsWith(prefix)) {
        const n = Number.parseInt(asString(row.unit_id).slice(prefix.length), 10);
        if (Number.isFinite(n)) max = Math.max(max, n);
      }
    const unitId = `${data.woNumber}-${max + 1}`;
    await sql`
      insert into units (work_order_number, unit_id, status, notes)
      values (${data.woNumber}, ${unitId}, ${"in build"}, ${"[]"}::jsonb)
    `;
    return loadState();
  });
export const updateUnit = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      serialOrId: z.string().optional(),
      status: unitStatus.optional(),
      salesOrderNumber: z.string().nullable().optional(),
      despatchDate: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from units where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Unit not found");
    const current = mapUnit(rows[0]);
    await sql`
      update units set
        serial_or_id = ${data.serialOrId ?? current.serialOrId},
        status = ${data.status ?? current.status},
        sales_order_number = ${data.salesOrderNumber === void 0 ? current.salesOrderNumber : data.salesOrderNumber},
        despatch_date = ${data.despatchDate === void 0 ? current.despatchDate : data.despatchDate}
      where id = ${data.id}
    `;
    return loadState();
  });
export const addUnitNote = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      author: z.string(),
      text: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from units where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Unit not found");
    const notes = [
      ...mapUnit(rows[0]).notes,
      {
        date: nowStamp(),
        author: data.author,
        text: data.text,
      },
    ];
    await sql`
      update units set notes = ${JSON.stringify(notes)}::jsonb where id = ${data.id}
    `;
    return loadState();
  });
export const createTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      workOrderNumber: z.string().optional(),
      unitId: z.string().nullable().optional(),
      title: z.string().optional(),
      problem: z.string().optional(),
      causes: z.array(z.enum(QT_CAUSES)).optional(),
      furtherAction: z.boolean().optional(),
      assignedTo: z.string().optional(),
      status: ticketStatus.optional(),
      part: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const { field: woField, wos } = await workOrdersFromField(data.workOrderNumber ?? "");
    if (woField && !wos.length) throw new Error(`Work order ${woField} not found`);
    const ticketNumber = await nextQtNumberValue();
    const status = data.status === "closed" ? "closed" : "open";
    const opened = todayIso();
    const closed = status === "closed" ? opened : null;
    const title = (data.title ?? "").trim();
    const causes = JSON.stringify(data.causes?.length ? data.causes : ["TBD"]);
    const part = (data.part ?? "").trim() || wos[0]?.part || "";
    await sql`
      insert into quality_tickets (
        ticket_number, work_order_number, unit_id, part, title, problem,
        causes, further_action, status, date_opened, date_closed, assigned_to, notes
      ) values (
        ${ticketNumber},
        ${woField || null},
        ${data.unitId ?? null},
        ${part},
        ${title},
        ${data.problem ?? ""},
        ${causes}::jsonb,
        ${data.furtherAction ?? false},
        ${status},
        ${opened},
        ${closed},
        ${data.assignedTo ?? ""},
        ${"[]"}::jsonb
      )
    `;
    const verb = status === "closed" ? "raised and closed" : "opened";
    const text = title ? `${ticketNumber} ${verb}: ${title}` : `${ticketNumber} ${verb}`;
    const author = data.assignedTo?.trim() || "Floor";
    for (const wo of wos) await appendWoHistory(sql, wo.woNumber, author, text);
    return loadState();
  });
export const updateTicket = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      ticketNumber: z.string().min(1),
      workOrderNumber: z.string().optional(),
      unitId: z.string().nullable().optional(),
      part: z.string().optional(),
      title: z.string().optional(),
      problem: z.string().optional(),
      causes: z.array(z.enum(QT_CAUSES)).optional(),
      furtherAction: z.boolean().optional(),
      status: ticketStatus.optional(),
      assignedTo: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from quality_tickets where ticket_number = ${data.ticketNumber} limit 1
    `;
    if (!rows[0]) throw new Error(`Ticket ${data.ticketNumber} not found`);
    const current = mapTicket(rows[0]);
    let part = data.part ?? current.part;
    let dateClosed = current.dateClosed;
    const nextWo =
      data.workOrderNumber === void 0
        ? current.workOrderNumber
        : formatTicketWos(data.workOrderNumber);
    if (data.workOrderNumber !== void 0 && nextWo !== current.workOrderNumber) {
      const { wos: found } = await workOrdersFromField(nextWo);
      if (nextWo && !found.length) throw new Error(`Work order ${nextWo} not found`);
      if (data.part === void 0 && found[0]) part = found[0].part;
      const author = data.assignedTo?.trim() || "Floor";
      const label = nextWo || "none";
      const text = `${current.ticketNumber} work order set to ${label}`;
      for (const wo of found) await appendWoHistory(sql, wo.woNumber, author, text);
    }
    if (data.status === "closed" && current.status !== "closed") dateClosed = todayIso();
    if (data.status === "open" && current.status === "closed") dateClosed = null;
    await sql`
      update quality_tickets set
        work_order_number = ${nextWo || null},
        unit_id = ${data.unitId === void 0 ? current.unitId : data.unitId},
        part = ${part},
        title = ${data.title ?? current.title},
        problem = ${data.problem ?? current.problem},
        causes = ${JSON.stringify(data.causes ?? current.causes)}::jsonb,
        further_action = ${data.furtherAction ?? current.furtherAction},
        status = ${data.status ?? current.status},
        date_closed = ${dateClosed},
        assigned_to = ${data.assignedTo ?? current.assignedTo}
      where ticket_number = ${data.ticketNumber}
    `;
    return loadState();
  });
export const addTicketNote = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      ticketNumber: z.string().min(1),
      author: z.string(),
      text: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from quality_tickets where ticket_number = ${data.ticketNumber} limit 1
    `;
    if (!rows[0]) throw new Error(`Ticket ${data.ticketNumber} not found`);
    const notes = [
      ...mapTicket(rows[0]).notes,
      {
        date: nowStamp(),
        author: data.author,
        text: data.text,
      },
    ];
    await sql`
      update quality_tickets set notes = ${JSON.stringify(notes)}::jsonb
      where ticket_number = ${data.ticketNumber}
    `;
    return loadState();
  });
export const createSalesOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      soNumber: z.string().trim().min(1),
      company: z.string().optional(),
      orderDate: z.string().nullable().optional(),
      leadTimeWeeks: z.number().nullable().optional(),
      targetDespatch: z.string().nullable().optional(),
      targetDespatchIsOverride: z.boolean().optional(),
      status: soStatus.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (
      (
        await sql`
      select so_number from sales_orders where so_number = ${data.soNumber}
    `
      ).length
    )
      throw new Error(`Sales order ${data.soNumber} already exists`);
    const orderDate = data.orderDate ?? todayIso();
    const isOverride = data.targetDespatchIsOverride ?? false;
    const target = computeTargetDespatch(
      orderDate,
      data.leadTimeWeeks ?? null,
      data.targetDespatch ?? null,
      isOverride,
    );
    await sql`
      insert into sales_orders (
        so_number, company, order_date, lead_time_weeks, target_despatch,
        target_despatch_is_override, status, sage_id
      ) values (
        ${data.soNumber},
        ${data.company ?? ""},
        ${orderDate},
        ${data.leadTimeWeeks ?? null},
        ${target},
        ${isOverride},
        ${data.status ?? "open"},
        ${""}
      )
    `;
    return loadState();
  });
export const updateSalesOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      soNumber: z.string().min(1),
      company: z.string().optional(),
      orderDate: z.string().nullable().optional(),
      leadTimeWeeks: z.number().nullable().optional(),
      targetDespatch: z.string().nullable().optional(),
      targetDespatchIsOverride: z.boolean().optional(),
      status: soStatus.optional(),
      despatchDate: z.string().nullable().optional(),
      notesToProduction: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from sales_orders where so_number = ${data.soNumber} limit 1
    `;
    if (!rows[0]) throw new Error(`Sales order ${data.soNumber} not found`);
    const current = mapSo(rows[0]);
    const orderDate = data.orderDate === void 0 ? current.orderDate : data.orderDate;
    const lead = data.leadTimeWeeks === void 0 ? current.leadTimeWeeks : data.leadTimeWeeks;
    let isOverride = current.targetDespatchIsOverride;
    let target = data.targetDespatch === void 0 ? current.targetDespatch : data.targetDespatch;
    if (data.targetDespatchIsOverride !== void 0) isOverride = data.targetDespatchIsOverride;
    else if (data.targetDespatch !== void 0 && data.targetDespatch !== current.targetDespatch)
      isOverride = true;
    if (data.orderDate !== void 0 || data.leadTimeWeeks !== void 0) {
      if (!isOverride) target = computeTargetDespatch(orderDate, lead, target, false);
    } else if (data.targetDespatchIsOverride === false)
      target = computeTargetDespatch(orderDate, lead, target, false);
    const ntp = data.notesToProduction ?? current.notesToProduction;
    await sql`
      update sales_orders set
        company = ${data.company ?? current.company},
        order_date = ${orderDate},
        lead_time_weeks = ${lead},
        target_despatch = ${target},
        target_despatch_is_override = ${isOverride},
        status = ${data.status ?? current.status},
        despatch_date = ${data.despatchDate === void 0 ? current.despatchDate : data.despatchDate},
        sales_notes = ${JSON.stringify(ntp)}::jsonb
      where so_number = ${data.soNumber}
    `;
    if (data.notesToProduction !== undefined) {
      for (const woNumber of await linkedWoNumbers(sql, data.soNumber)) {
        await setWoNotesToProduction(sql, woNumber, data.notesToProduction);
      }
    }
    return loadState();
  });
export const addSalesLine = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      soNumber: z.string().min(1),
      part: z.string().optional(),
      qty: z.number().int().min(1).optional(),
      workOrderNumber: z.string().optional(),
      company: z.string().optional(),
      leadTimeWeeks: z.number().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const soNumber = data.soNumber.trim();
    if (
      !(
        await sql`
      select so_number from sales_orders where so_number = ${soNumber}
    `
      ).length
    ) {
      const orderDate = todayIso();
      const lead = data.leadTimeWeeks ?? null;
      const target = computeTargetDespatch(orderDate, lead, null, false);
      await sql`
        insert into sales_orders (
          so_number, company, order_date, lead_time_weeks, target_despatch,
          target_despatch_is_override, status, sage_id
        ) values (
          ${soNumber},
          ${data.company ?? ""},
          ${orderDate},
          ${lead},
          ${target},
          ${false},
          ${"open"},
          ${""}
        )
      `;
    }
    await sql`
      insert into sales_lines (so_number, part, qty, work_order_number)
      values (
        ${soNumber},
        ${data.part ?? ""},
        ${data.qty ?? 1},
        ${data.workOrderNumber ?? ""}
      )
    `;
    return loadState();
  });
export const updateSalesLine = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      part: z.string().optional(),
      qty: z.number().int().min(1).optional(),
      workOrderNumber: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from sales_lines where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Sales line not found");
    const current = mapLine(rows[0]);
    await sql`
      update sales_lines set
        part = ${data.part ?? current.part},
        qty = ${data.qty ?? current.qty},
        work_order_number = ${data.workOrderNumber === void 0 ? current.workOrderNumber : data.workOrderNumber}
      where id = ${data.id}
    `;
    return loadState();
  });
export const despatchLine = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      despatchWoNumber: z.string().trim().min(1),
      despatchDate: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from sales_lines where id = ${data.id} limit 1
    `;
    if (!rows[0]) throw new Error("Sales line not found");
    const line = mapLine(rows[0]);
    const date = asDate(data.despatchDate) ?? todayIso();
    await shipLine(sql, line, data.despatchWoNumber.trim(), date);
    await stampSalesOrderDespatch(sql, line.soNumber, date);
    return loadState();
  });
export const despatchSalesOrder = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      soNumber: z.string().min(1),
      despatchDate: z.string().optional(),
      lines: z
        .array(
          z.object({
            id: z.number().int(),
            despatchWoNumber: z.string().trim().min(1),
          }),
        )
        .min(1),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (
      !(
        await sql`
      select so_number from sales_orders where so_number = ${data.soNumber} limit 1
    `
      )[0]
    )
      throw new Error(`Sales order ${data.soNumber} not found`);
    const date = asDate(data.despatchDate) ?? todayIso();
    for (const item of data.lines) {
      const rows = await sql`
        select * from sales_lines where id = ${item.id} limit 1
      `;
      if (!rows[0]) throw new Error("Sales line not found");
      const line = mapLine(rows[0]);
      if (line.soNumber !== data.soNumber)
        throw new Error("Line does not belong to this sales order");
      await shipLine(sql, line, item.despatchWoNumber.trim(), date);
    }
    await stampSalesOrderDespatch(sql, data.soNumber, date);
    return loadState();
  });
export const deleteSalesLine = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    await (await getSql())`delete from sales_lines where id = ${data.id}`;
    return loadState();
  });
export const wipeFloor = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .handler(async () => {
    const sql = await getSql();
    await sql`delete from wo_build_values`;
    await sql`delete from wo_build_records`;
    await sql`delete from sage_pack_lines`;
    await sql`delete from sage_pack_meta`;
    await sql`delete from quality_tickets`;
    await sql`delete from units`;
    await sql`delete from sales_lines`;
    await sql`delete from build_queue`;
    await sql`delete from build_tasks`;
    await sql`delete from problem_tickets`;
    await sql`delete from build_order`;
    await sql`delete from sales_orders`;
    await sql`delete from work_orders`;
    await sql`delete from parts`;
    return loadState();
  });
function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}
export const importSagePack = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      name: z.string(),
      kind: z.enum(["csv", "xlsx"]),
      content: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const grid =
      data.kind === "xlsx"
        ? (readXlsx(b64ToBytes(data.content))[0]?.rows ?? [])
        : parseCsv(data.content);
    if (!grid.length) throw new Error("Empty file");
    const lines = parseSageSopout(grid);
    if (!lines.length) throw new Error("Not a Sage outstanding sales-order export (SOPOUT).");
    const sql = await getSql();
    const existingSos = await sql`
      select so_number, order_date, lead_time_weeks, target_despatch, target_despatch_is_override
      from sales_orders
    `;
    const floorBySo = new Map(
      existingSos.map((row) => [
        row.so_number,
        {
          orderDate: asDate(row.order_date),
          lead: row.lead_time_weeks == null ? null : asNumber(row.lead_time_weeks),
          target: asDate(row.target_despatch),
          isOverride: asBool(row.target_despatch_is_override),
        },
      ]),
    );
    const sageDateBySo = new Map();
    const sageNotesBySo = new Map();
    for (const line of lines) {
      if (line.orderDate && !sageDateBySo.has(line.soNumber))
        sageDateBySo.set(line.soNumber, line.orderDate);
      const note = line.notes.trim();
      if (note && !sageNotesBySo.has(line.soNumber)) sageNotesBySo.set(line.soNumber, note);
    }
    await sql`delete from sage_pack_lines`;
    for (const line of lines) {
      const orderDate = line.orderDate ?? floorBySo.get(line.soNumber)?.orderDate ?? null;
      await sql`
        insert into sage_pack_lines (
          so_number, company, order_date, part, description, comment, qty, qty_despatched, notes
        ) values (
          ${line.soNumber},
          ${line.company},
          ${orderDate},
          ${line.part},
          ${line.description},
          ${line.comment},
          ${line.qty},
          ${line.qtyDespatched},
          ${line.notes}
        )
      `;
    }
    for (const [soNumber, sageDate] of sageDateBySo) {
      const floor = floorBySo.get(soNumber);
      if (!floor) continue;
      await sql`
        update sales_orders
        set order_date = ${sageDate}, target_despatch = ${computeTargetDespatch(sageDate, floor.lead, floor.target, floor.isOverride)}
        where so_number = ${soNumber}
      `;
    }
    for (const [soNumber, notes] of sageNotesBySo)
      await sql`
        update sales_orders set notes_line1 = ${notes} where so_number = ${soNumber}
      `;
    await sql`delete from sage_pack_meta`;
    await sql`
      insert into sage_pack_meta (id, filename, row_count)
      values (1, ${data.name}, ${lines.length})
    `;
    return {
      state: await loadState(),
      count: lines.length,
    };
  });
export const setWorkOrderBuildField = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      serial: z.string().min(1),
      author: z.string(),
      revision: z.string().optional(),
      battery: z.string().optional(),
      notes: z.string().optional(),
      componentKey: z.string().optional(),
      componentValue: z.string().optional(),
      componentLabel: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    await setBuildField(sql, data);
    return loadState();
  });

export const setWorkOrderConsumed = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      serial: z.string().min(1),
      items: z.array(z.object({ woNumber: z.string(), part: z.string() })),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    await setConsumed(sql, data);
    return loadState();
  });

export const writeWorkOrderConsumedHistory = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      woNumber: z.string().min(1),
      serial: z.string().min(1),
      author: z.string(),
      items: z.array(z.object({ woNumber: z.string(), part: z.string() })).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wo = await getWorkOrder(data.woNumber);
    if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
    await writeConsumedHistory(sql, data);
    return loadState();
  });

export const setPartComponentRequired = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      partNumber: z.string().min(1),
      componentKey: z.string().min(1),
      required: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (data.required) {
      await sql`
        insert into build_component_map (part_number, component_key)
        values (${data.partNumber.trim()}, ${data.componentKey})
        on conflict do nothing
      `;
    } else {
      await sql`
        delete from build_component_map
        where part_number = ${data.partNumber.trim()}
          and component_key = ${data.componentKey}
      `;
    }
    return loadState();
  });

export const addBuildComponent = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ label: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { componentKey, componentKind } = await import("./build-lookup");
    const label = data.label.trim();
    const key = componentKey(label);
    if (!key) throw new Error("Enter a component name");
    const sql = await getSql();
    const pos = asNumber(
      (
        await sql`select coalesce(max(position), 0) + 1 as n from build_components`
      )[0]?.n,
      1,
    );
    await sql`
      insert into build_components (component_key, label, kind, position)
      values (${key}, ${label}, ${componentKind(label)}, ${pos})
      on conflict (component_key) do update set label = excluded.label
    `;
    return loadState();
  });

export const addBuildBattery = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ code: z.string().min(1) }))
  .handler(async ({ data }) => {
    const code = data.code.trim();
    const sql = await getSql();
    const pos = asNumber(
      (await sql`select coalesce(max(position), 0) + 1 as n from build_batteries`)[0]?.n,
      1,
    );
    await sql`
      insert into build_batteries (code, position) values (${code}, ${pos})
      on conflict (code) do nothing
    `;
    return loadState();
  });

export const removeBuildBattery = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ code: z.string().min(1) }))
  .handler(async ({ data }) => {
    await (await getSql())`delete from build_batteries where code = ${data.code}`;
    return loadState();
  });

export const removeBuildComponent = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(z.object({ key: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from build_component_map where component_key = ${data.key}`;
    await sql`delete from build_components where component_key = ${data.key}`;
    return loadState();
  });

export const importFloor = createServerFn({ method: "POST" })
  .middleware([pinMiddleware])
  .validator(
    z.object({
      files: z.array(
        z.object({
          name: z.string(),
          kind: z.enum(["csv", "xlsx"]),
          content: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const { applyFloorImport } = await import("./import-data");
    return applyFloorImport(data.files, loadState);
  });
