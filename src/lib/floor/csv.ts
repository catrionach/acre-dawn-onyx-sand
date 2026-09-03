export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const filtered = rows.filter((r) => r.some((c) => c.trim() !== ""));
  return maybeSemicolon(filtered);
}

/** Excel in the UK often saves CSV with semicolons. */
function maybeSemicolon(rows: string[][]): string[][] {
  if (rows.length < 2) return rows;
  const single = rows.filter((r) => r.length === 1 && r[0].includes(";"));
  if (single.length < rows.length / 2) return rows;
  return rows.map((r) => (r.length === 1 && r[0].includes(";") ? splitSemi(r[0]) : r));
}

function splitSemi(line: string): string[] {
  return line.split(";").map((c) => c.trim());
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const v = cell ?? "";
          if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
          return v;
        })
        .join(","),
    )
    .join("\r\n");
}

export function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w]/g, "");
}

const HEADER_ALIASES: Record<string, string> = {
  wo: "wo_number",
  wonumber: "wo_number",
  work_order: "wo_number",
  work_order_number: "wo_number",
  workordernumber: "wo_number",
  part_no: "part_number",
  partno: "part_number",
  part: "part",
  partnumber: "part_number",
  so: "so_number",
  sonumber: "so_number",
  sage_number: "so_number",
  sagenumber: "so_number",
  sage_so: "so_number",
  sales_order: "so_number",
  sales_order_number: "so_number",
  item: "part",
  product: "part",
  sku: "part",
  qty: "qty",
  quantity: "qty",
  who: "assigned_build",
  assigned: "assigned_build",
  assignedbuild: "assigned_build",
  assigned_to: "assigned_to",
  assignedto: "assigned_to",
  sage: "built_in_sage",
  builtinsage: "built_in_sage",
  need_date: "customer_need_date",
  customerneeddate: "customer_need_date",
  notes_from_sales: "notes_from_sales",
  notesfromsales: "notes_from_sales",
  production_notes: "notes_to_production",
  notes_to_production: "notes_to_production",
  notestoproduction: "notes_to_production",
  build_hours: "build_time_hours",
  buildtimehours: "build_time_hours",
  hours: "build_time_hours",
  ticket: "ticket_number",
  ticketnumber: "ticket_number",
  unit: "unit_id",
  unitid: "unit_id",
  serial: "serial_or_id",
  serial_or_id: "serial_or_id",
  lead_weeks: "lead_time_weeks",
  leadtimeweeks: "lead_time_weeks",
  target: "target_despatch",
  targetdespatch: "target_despatch",
  orderdate: "order_date",
  ordered: "order_date",
  date_ordered: "order_date",
  ordered_date: "order_date",
  order: "order_date",
  dateadded: "date_added",
  datestarted: "date_started",
  dateclosed: "date_closed",
  dateopened: "date_opened",
  despatchdate: "despatch_date",
  sageid: "sage_id",
};

export function canonicalHeader(value: string): string {
  const n = normalizeHeader(value);
  return HEADER_ALIASES[n] ?? n;
}

export function recordsFromGrid(grid: string[][]): Record<string, string>[] {
  if (grid.length < 2) return [];
  const headers = grid[0].map(canonicalHeader);
  const out: Record<string, string>[] = [];
  for (const row of grid.slice(1)) {
    const rec: Record<string, string> = {};
    let any = false;
    headers.forEach((h, i) => {
      if (!h) return;
      const v = (row[i] ?? "").trim();
      rec[h] = v;
      if (v) any = true;
    });
    if (any) out.push(rec);
  }
  return out;
}
