import type { Sql } from "@/lib/db";
import { nowStamp, todayIso } from "./dates";
import {
  componentKey,
  componentKind,
  type BuildReportRow,
  type ParsedLookup,
} from "./build-lookup";
import { LOOKUP_SEED } from "./build-lookup-seed";
import { normalizeWoNumber } from "./lookups";
import type { BuildComponent, BuildSpec, ConsumedWo, Note, WoBuildRecord } from "./types";

function asNotes(value: unknown): Note[] {
  if (!value) return [];
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    try {
      return asNotes(JSON.parse(t));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const out: Note[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const text = asString(rec.text);
    if (!text) continue;
    out.push({
      date: asString(rec.date),
      author: asString(rec.author),
      text,
    });
  }
  return out;
}

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function asNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const emptyBuildSpec = (): BuildSpec => ({
  components: [],
  batteries: [],
  map: {},
});

export function mapComponent(row: Record<string, unknown>): BuildComponent {
  const kind = asString(row.kind);
  return {
    key: asString(row.component_key),
    label: asString(row.label),
    kind: kind === "pcb" || kind === "battery" ? kind : "subassembly",
    position: asNumber(row.position),
  };
}

export function asConsumed(value: unknown): ConsumedWo[] {
  if (!value) return [];
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    try {
      return asConsumed(JSON.parse(t));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const out: ConsumedWo[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const woNumber = normalizeWoNumber(asString(rec.woNumber || rec.wo_number)) || asString(rec.woNumber || rec.wo_number);
    const part = asString(rec.part);
    if (!woNumber && !part) continue;
    out.push({ woNumber, part });
  }
  return out;
}

export function cleanConsumed(items: ConsumedWo[]): ConsumedWo[] {
  const out: ConsumedWo[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const woNumber = normalizeWoNumber(asString(item.woNumber)) || asString(item.woNumber);
    const part = asString(item.part);
    if (!woNumber && !part) continue;
    const key = `${woNumber}\0${part}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ woNumber, part });
  }
  return out;
}

export function consumedHistoryLine(serial: string, items: ConsumedWo[]): string | null {
  const rows = cleanConsumed(items);
  if (!rows.length) return null;
  const bits = rows.map((row) => {
    const wo = row.woNumber ? `WO-${row.woNumber}` : "";
    const part = row.part;
    if (wo && part) return `${wo} ${part}`;
    return wo || part;
  });
  return `Serial ${serial} consumed: ${bits.join("; ")}`;
}

export function mapBuildRecord(
  row: Record<string, unknown>,
  values: Record<string, string>,
): WoBuildRecord {
  return {
    id: asNumber(row.id),
    woNumber: asString(row.wo_number),
    serial: asString(row.serial) || "1",
    revision: asString(row.revision),
    battery: asString(row.battery),
    notes: asString(row.notes),
    values,
    consumed: asConsumed(row.consumed),
  };
}


export async function loadBuildSpec(sql: Sql): Promise<BuildSpec> {
  return readBuildSpec(sql, true);
}

async function readBuildSpec(sql: Sql, allowSeed: boolean): Promise<BuildSpec> {
  const [components, batteries, mapRows] = await Promise.all([
    sql`select * from build_components order by position, label`,
    sql`select * from build_batteries order by position, code`,
    sql`select part_number, component_key from build_component_map`,
  ]);
  const stale = components.some((row) => {
    const key = asString(row.component_key);
    return /_PCB_NO_/.test(key) || /ANT1_\(A\)/.test(key);
  });
  if (allowSeed && LOOKUP_SEED.components.length && (!components.length || stale)) {
    await replaceLookup(sql, LOOKUP_SEED);
    return readBuildSpec(sql, false);
  }
  const map: Record<string, string[]> = {};
  for (const row of mapRows) {
    const part = asString(row.part_number);
    const key = asString(row.component_key);
    if (!part || !key) continue;
    (map[part] ??= []).push(key);
  }
  return {
    components: components.map(mapComponent),
    batteries: batteries.map((r) => asString(r.code)).filter(Boolean),
    map,
  };
}

export async function loadBuildRecords(sql: Sql): Promise<WoBuildRecord[]> {
  const [rows, valueRows] = await Promise.all([
    sql`select * from wo_build_records order by wo_number, serial`,
    sql`select record_id, component_key, value from wo_build_values`,
  ]);
  const byId = new Map<number, Record<string, string>>();
  for (const row of valueRows) {
    const id = asNumber(row.record_id);
    const bag = byId.get(id) ?? {};
    bag[asString(row.component_key)] = asString(row.value);
    byId.set(id, bag);
  }
  return rows.map((row) => mapBuildRecord(row, byId.get(asNumber(row.id)) ?? {}));
}

async function pushHistory(
  sql: Sql,
  woNumber: string,
  author: string,
  text: string,
): Promise<void> {
  const line = text.trim();
  if (!line) return;
  const rows = await sql`
    select hardware_history from work_orders where wo_number = ${woNumber} limit 1
  `;
  if (!rows[0]) return;
  const notes: Note[] = [...asNotes(rows[0].hardware_history)];
  const last = notes[notes.length - 1];
  if (last && last.text === line && last.author === (author.trim() || last.author)) return;
  notes.push({ date: nowStamp(), author: author.trim() || "Shop", text: line });
  await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}

function changeLine(serial: string, label: string, from: string, to: string): string | null {
  const a = from.trim();
  const b = to.trim();
  if (a === b) return null;
  if (!a) return `Build serial ${serial} · ${label}: ${b}`;
  if (!b) return `Build serial ${serial} · ${label}: ${a} → (blank)`;
  return `Build serial ${serial} · ${label}: ${a} → ${b}`;
}

export async function replaceLookup(sql: Sql, parsed: ParsedLookup): Promise<void> {
  await sql`delete from build_component_map`;
  await sql`delete from build_components`;
  await sql`delete from build_batteries`;
  for (const [i, comp] of parsed.components.entries()) {
    await sql`
      insert into build_components (component_key, label, kind, position)
      values (${comp.key}, ${comp.label}, ${comp.kind}, ${comp.position || i + 1})
    `;
  }
  for (const [i, code] of parsed.batteries.entries()) {
    await sql`
      insert into build_batteries (code, position) values (${code}, ${i + 1})
    `;
  }
  for (const [part, keys] of Object.entries(parsed.map)) {
    for (const key of keys) {
      await sql`
        insert into build_component_map (part_number, component_key)
        values (${part}, ${key})
        on conflict do nothing
      `;
    }
  }
}

export async function ensureComponent(
  sql: Sql,
  key: string,
  label: string,
): Promise<void> {
  await sql`
    insert into build_components (component_key, label, kind, position)
    values (${key}, ${label}, ${componentKind(label)}, 999)
    on conflict (component_key) do nothing
  `;
}

async function ensureBattery(sql: Sql, code: string): Promise<void> {
  const trimmed = code.trim();
  if (!trimmed) return;
  await sql`
    insert into build_batteries (code, position)
    values (${trimmed}, 999)
    on conflict (code) do nothing
  `;
}

async function ensureWorkOrder(
  sql: Sql,
  woNumber: string,
  part: string,
  qty: number,
): Promise<"existing" | "created"> {
  const rows = await sql`
    select wo_number, qty from work_orders where wo_number = ${woNumber} limit 1
  `;
  if (rows[0]) {
    const current = asNumber(rows[0].qty, 1);
    if (qty > current) {
      await sql`update work_orders set qty = ${qty} where wo_number = ${woNumber}`;
    }
    return "existing";
  }
  const today = todayIso();
  await sql`
    insert into work_orders (
      wo_number, part, qty, status, date_added, date_closed, assigned_build
    ) values (
      ${woNumber}, ${part}, ${Math.max(1, qty)}, 'closed', ${today}, ${today}, ''
    )
  `;
  return "created";
}

async function getOrCreateRecord(
  sql: Sql,
  woNumber: string,
  serial: string,
): Promise<{
  id: number;
  revision: string;
  battery: string;
  notes: string;
  values: Record<string, string>;
  consumed: ConsumedWo[];
}> {
  const rows = await sql`
    select * from wo_build_records
    where wo_number = ${woNumber} and serial = ${serial}
    limit 1
  `;
  if (rows[0]) {
    const id = asNumber(rows[0].id);
    const vals = await sql`
      select component_key, value from wo_build_values where record_id = ${id}
    `;
    const values: Record<string, string> = {};
    for (const v of vals) values[asString(v.component_key)] = asString(v.value);
    return {
      id,
      revision: asString(rows[0].revision),
      battery: asString(rows[0].battery),
      notes: asString(rows[0].notes),
      values,
      consumed: asConsumed(rows[0].consumed),
    };
  }
  const inserted = await sql`
    insert into wo_build_records (wo_number, serial)
    values (${woNumber}, ${serial})
    returning id
  `;
  return {
    id: asNumber(inserted[0]?.id),
    revision: "",
    battery: "",
    notes: "",
    values: {},
    consumed: [],
  };
}

export async function setConsumed(
  sql: Sql,
  data: { woNumber: string; serial: string; items: ConsumedWo[] },
): Promise<ConsumedWo[]> {
  const rec = await getOrCreateRecord(sql, data.woNumber, data.serial);
  const items = cleanConsumed(data.items);
  await sql`
    update wo_build_records
    set consumed = ${JSON.stringify(items)}::jsonb
    where id = ${rec.id}
  `;
  return items;
}

export async function writeConsumedHistory(
  sql: Sql,
  data: { woNumber: string; serial: string; author: string; items?: ConsumedWo[] },
): Promise<void> {
  const items =
    data.items !== undefined
      ? await setConsumed(sql, {
          woNumber: data.woNumber,
          serial: data.serial,
          items: data.items,
        })
      : (await getOrCreateRecord(sql, data.woNumber, data.serial)).consumed;
  const line = consumedHistoryLine(data.serial.trim() || "1", items);
  if (!line) throw new Error("Add a consumed WO first");
  await pushHistory(sql, data.woNumber, data.author, line);
}

export async function setBuildField(
  sql: Sql,
  data: {
    woNumber: string;
    serial: string;
    author: string;
    revision?: string;
    battery?: string;
    notes?: string;
    componentKey?: string;
    componentValue?: string;
    componentLabel?: string;
  },
): Promise<void> {
  const rec = await getOrCreateRecord(sql, data.woNumber, data.serial);
  const serial = data.serial.trim() || "1";
  const author = data.author;
  if (data.revision !== undefined) {
    const line = changeLine(serial, "Revision", rec.revision, data.revision);
    await sql`update wo_build_records set revision = ${data.revision} where id = ${rec.id}`;
    if (line) await pushHistory(sql, data.woNumber, author, line);
  }
  if (data.battery !== undefined) {
    const line = changeLine(serial, "Battery", rec.battery, data.battery);
    await sql`update wo_build_records set battery = ${data.battery} where id = ${rec.id}`;
    if (line) await pushHistory(sql, data.woNumber, author, line);
  }
  if (data.notes !== undefined) {
    const line = changeLine(serial, "Non-conformity", rec.notes, data.notes);
    await sql`update wo_build_records set notes = ${data.notes} where id = ${rec.id}`;
    if (line) await pushHistory(sql, data.woNumber, author, line);
  }
  if (data.componentKey !== undefined && data.componentValue !== undefined) {
    const key = data.componentKey;
    const from = rec.values[key] ?? "";
    const label = data.componentLabel?.trim() || key;
    const line = changeLine(serial, label, from, data.componentValue);
    await sql`
      insert into wo_build_values (record_id, component_key, value)
      values (${rec.id}, ${key}, ${data.componentValue})
      on conflict (record_id, component_key) do update set value = excluded.value
    `;
    if (line) await pushHistory(sql, data.woNumber, author, line);
  }
}

export async function applyBuildReport(
  sql: Sql,
  rows: BuildReportRow[],
  author: string,
  onError: (row: string, message: string) => void,
): Promise<{ updated: number; inserted: number; createdWo: number }> {
  let updated = 0;
  let inserted = 0;
  let createdWo = 0;
  const labels = await sql`select component_key, label from build_components`;
  const labelByKey = new Map(labels.map((r) => [asString(r.component_key), asString(r.label)]));
  const qtyByWo = new Map<string, number>();
  for (const row of rows) {
    if (!row.woNumber) continue;
    const n = Number.parseInt(row.serial, 10);
    const qty = Number.isFinite(n) && n > 0 ? n : 1;
    qtyByWo.set(row.woNumber, Math.max(qtyByWo.get(row.woNumber) ?? 1, qty));
  }

  for (const row of rows) {
    const wo = row.woNumber;
    if (!wo) {
      onError(row.part, "Missing work order number");
      continue;
    }
    const created = await ensureWorkOrder(sql, wo, row.part, qtyByWo.get(wo) ?? 1);
    if (created === "created") createdWo += 1;
    const before = await sql`
      select id from wo_build_records
      where wo_number = ${wo} and serial = ${row.serial}
      limit 1
    `;
    if (before[0]) updated += 1;
    else inserted += 1;
    if (row.part) {
      await sql`
        update work_orders
        set part = case when part = '' then ${row.part} else part end
        where wo_number = ${wo}
      `;
    }
    if (row.revision) {
      await setBuildField(sql, { woNumber: wo, serial: row.serial, author, revision: row.revision });
    }
    if (row.battery) {
      await ensureBattery(sql, row.battery);
      await setBuildField(sql, { woNumber: wo, serial: row.serial, author, battery: row.battery });
    }
    if (row.notes) {
      await setBuildField(sql, { woNumber: wo, serial: row.serial, author, notes: row.notes });
    }
    for (const val of row.values) {
      const key = val.key || componentKey(val.label);
      if (!labelByKey.has(key)) {
        await ensureComponent(sql, key, val.label);
        labelByKey.set(key, val.label);
      }
      await setBuildField(sql, {
        woNumber: wo,
        serial: row.serial,
        author,
        componentKey: key,
        componentValue: val.value,
        componentLabel: labelByKey.get(key) || val.label,
      });
    }
  }
  return { updated, inserted, createdWo };
}
