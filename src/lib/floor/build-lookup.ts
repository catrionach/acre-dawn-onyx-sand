import { canonicalHeader } from "./csv";
import { normalizeWoNumber } from "./lookups";

export const COMPONENT_KINDS = ["pcb", "battery", "subassembly"] as const;
export type ComponentKind = (typeof COMPONENT_KINDS)[number];

export type LookupComponent = {
  key: string;
  label: string;
  kind: ComponentKind;
  position: number;
};

export type ParsedLookup = {
  components: LookupComponent[];
  batteries: string[];
  map: Record<string, string[]>;
};

export type BuildReportRow = {
  woNumber: string;
  serial: string;
  part: string;
  revision: string;
  battery: string;
  notes: string;
  values: { key: string; label: string; value: string }[];
};

const META_HEADERS = new Set([
  "product",
  "work_order",
  "wo_number",
  "wo",
  "serial",
  "part_number",
  "part",
  "build_revision",
  "revision",
  "battery_type",
  "battery",
  "non_conformity_notes",
  "nonconformitynotes",
  "notes",
]);

export function componentKind(label: string): ComponentKind {
  if (/pcb/i.test(label)) return "pcb";
  if (/b[ep]\./i.test(label) || /^battery\b/i.test(label)) return "battery";
  return "subassembly";
}

/** Stable id so "No 10018-02" and "NO10018-02" / "ANT1 (A)" and "ANT1(A)" match. */
export function componentKey(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/\bNO\.?\s*(?=\d)/g, "NO")
    .replace(/[^\w.()+-]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function isMarked(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "x" || v === "yes" || v === "y" || v === "1" || v === "true";
}

function looksLikeLookupHeaders(headers: string[]): boolean {
  const head = headers.map((h) => h.trim().toLowerCase());
  return head[0] === "product" && head.some((h) => /pcb|assy|antenna|coil|lora/i.test(h));
}

export function isLookupWorkbook(
  name: string,
  sheets: { name: string; rows: string[][] }[],
): boolean {
  const file = name.toLowerCase().replace(/[\s-]+/g, "_");
  if (file.includes("component_lookup") || file.includes("build_component")) return true;
  if (sheets.some((s) => /battery/i.test(s.name) && looksLikeLookupHeaders(sheets[0]?.rows[0] ?? []))) {
    return true;
  }
  if (sheets.some((s) => looksLikeLookupHeaders(s.rows[0] ?? []))) return true;
  return looksLikeLookupHeaders(sheets[0]?.rows[0] ?? []);
}

export function isBuildReportGrid(headers: string[]): boolean {
  const h = new Set(headers.map((x) => canonicalHeader(x)));
  const wo = h.has("wo_number") || h.has("work_order") || h.has("wo");
  const serial = h.has("serial") || h.has("serial_or_id");
  const part = h.has("part_number") || h.has("part");
  if (!wo || !serial || !part) return false;
  if (h.has("unit_id") && !h.has("revision") && !h.has("build_revision") && !h.has("battery_type")) {
    return false;
  }
  return true;
}

export function parseLookupSheets(sheets: { name: string; rows: string[][] }[]): ParsedLookup {
  const batterySheet = sheets.find((s) => /battery/i.test(s.name));
  const batteries: string[] = [];
  if (batterySheet) {
    for (const row of batterySheet.rows.slice(1)) {
      const code = (row[0] ?? "").trim();
      if (code && !/^battery/i.test(code)) batteries.push(code);
    }
  }

  const main =
    sheets.find((s) => looksLikeLookupHeaders(s.rows[0] ?? [])) ??
    sheets.find((s) => (s.rows[0]?.[0] ?? "").trim().toLowerCase() === "product") ??
    sheets[0];
  const headers = main?.rows[0] ?? [];
  const components: LookupComponent[] = [];
  const seen = new Set<string>();
  for (let i = 1; i < headers.length; i += 1) {
    const label = (headers[i] ?? "").replace(/\s+/g, " ").trim();
    if (!label) continue;
    const key = componentKey(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    components.push({ key, label, kind: componentKind(label), position: i });
  }

  const map: Record<string, string[]> = {};
  for (const row of main?.rows.slice(1) ?? []) {
    const part = (row[0] ?? "").trim();
    if (!part) continue;
    const keys: string[] = [];
    for (let i = 1; i < headers.length; i += 1) {
      const label = (headers[i] ?? "").replace(/\s+/g, " ").trim();
      if (!label) continue;
      if (isMarked(row[i] ?? "")) keys.push(componentKey(label));
    }
    map[part] = keys;
  }
  return { components, batteries, map };
}

function headerField(header: string): string {
  const n = canonicalHeader(header);
  if (n === "work_order" || n === "wo") return "wo_number";
  if (n === "part") return "part_number";
  if (n === "serial" || n === "serial_or_id") return "serial";
  if (n === "revision" || n === "build_revision") return "revision";
  if (n === "battery" || n === "battery_type") return "battery";
  if (n === "non_conformity_notes" || n === "notes" || n === "nonconformitynotes") return "notes";
  return n;
}

function cleanCell(value: string): string {
  const t = value.trim();
  if (/^\d+\.0+$/.test(t)) return t.replace(/\.0+$/, "");
  return t;
}

export function parseBuildReportGrid(grid: string[][]): BuildReportRow[] {
  if (grid.length < 2) return [];
  const headers = grid[0] ?? [];
  const out: BuildReportRow[] = [];
  for (const row of grid.slice(1)) {
    let woNumber = "";
    let serial = "";
    let part = "";
    let revision = "";
    let battery = "";
    let notes = "";
    const values: BuildReportRow["values"] = [];
    headers.forEach((raw, i) => {
      const v = cleanCell(row[i] ?? "");
      const field = headerField(raw);
      if (field === "wo_number") woNumber = normalizeWoNumber(v) || v;
      else if (field === "serial") serial = v.replace(/\.0+$/, "") || "1";
      else if (field === "part_number") part = v;
      else if (field === "revision") revision = v;
      else if (field === "battery") battery = v;
      else if (field === "notes") notes = v;
      else if (raw.trim() && !META_HEADERS.has(canonicalHeader(raw))) {
        if (v) values.push({ key: componentKey(raw), label: raw.replace(/\s+/g, " ").trim(), value: v });
      }
    });
    if (!woNumber && !part) continue;
    out.push({
      woNumber,
      serial: serial || "1",
      part,
      revision,
      battery,
      notes,
      values,
    });
  }
  return out;
}

export function requiredKeysForPart(map: Record<string, string[]>, part: string): string[] {
  if (map[part]) return map[part];
  const needle = part.trim().toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (k.trim().toLowerCase() === needle) return v;
  }
  return [];
}

export function serialsForWorkOrder(
  qty: number,
  existing: string[],
  unitSerials: string[],
): string[] {
  const set = new Set<string>();
  const n = Math.max(1, Math.trunc(qty) || 1);
  for (let i = 1; i <= n; i += 1) set.add(String(i));
  for (const s of existing) if (s.trim()) set.add(s.trim());
  for (const s of unitSerials) if (s.trim()) set.add(s.trim());
  return [...set].sort((a, b) => {
    const na = Number.parseInt(a, 10);
    const nb = Number.parseInt(b, 10);
    if (Number.isFinite(na) && Number.isFinite(nb) && String(na) === a && String(nb) === b) {
      return na - nb;
    }
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function fieldPlaceholder(kind: ComponentKind): string {
  if (kind === "pcb") return "PCB serial / lot";
  if (kind === "battery") return "Battery";
  return "WO number or part";
}

export function fieldHint(kind: ComponentKind): string {
  if (kind === "pcb") return "serial";
  if (kind === "battery") return "type";
  return "WO or part";
}

export function lookupToGrid(spec: ParsedLookup): { name: string; rows: string[][] }[] {
  const headers = ["Product", ...spec.components.map((c) => c.label)];
  const parts = Object.keys(spec.map).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const rows: string[][] = [headers];
  for (const part of parts) {
    const keys = new Set(spec.map[part] ?? []);
    rows.push([part, ...spec.components.map((c) => (keys.has(c.key) ? "X" : ""))]);
  }
  return [
    { name: "Sheet1", rows },
    { name: "BatteryList", rows: [["Battery List"], ...spec.batteries.map((b) => [b])] },
  ];
}

export function buildRecordsToGrid(
  records: {
    woNumber: string;
    serial: string;
    revision: string;
    battery: string;
    notes: string;
    values: Record<string, string>;
  }[],
  components: LookupComponent[],
  partOf: (woNumber: string) => string,
): string[][] {
  const extraKeys: string[] = [];
  const known = new Set(components.map((c) => c.key));
  for (const rec of records) {
    for (const key of Object.keys(rec.values)) {
      if (!known.has(key) && rec.values[key]?.trim() && !extraKeys.includes(key)) extraKeys.push(key);
    }
  }
  const cols = [
    ...components.map((c) => ({ key: c.key, label: c.label })),
    ...extraKeys.map((key) => ({ key, label: key })),
  ];
  const headers = [
    "WORK ORDER",
    "SERIAL",
    "PART NUMBER",
    "BUILD REVISION",
    ...cols.map((c) => c.label),
    "BATTERY TYPE",
    "NON CONFORMITY NOTES",
  ];
  const rows: string[][] = [headers];
  const sorted = [...records].sort((a, b) => {
    const w = a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true });
    if (w) return w;
    return a.serial.localeCompare(b.serial, undefined, { numeric: true });
  });
  for (const rec of sorted) {
    rows.push([
      rec.woNumber,
      rec.serial,
      partOf(rec.woNumber),
      rec.revision,
      ...cols.map((c) => rec.values[c.key] ?? ""),
      rec.battery,
      rec.notes,
    ]);
  }
  return rows;
}
