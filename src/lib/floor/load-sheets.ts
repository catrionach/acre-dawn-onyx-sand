import { recordsFromGrid, canonicalHeader } from "./csv";

export type SheetKey =
  | "parts"
  | "work_orders"
  | "units"
  | "quality_tickets"
  | "sales_orders"
  | "sales_lines"
  | "hardware_history"
  | "build_order"
  | "build_tasks";

export type ImportReport = {
  inserted: Record<string, number>;
  updated: Record<string, number>;
  skipped: Record<string, number>;
  errors: { sheet: string; row: string; message: string }[];
};

export type SheetSpec = {
  key: SheetKey;
  title: string;
  columns: string[];
  help: string;
  examples: string[][];
};

export const SHEET_SPECS: SheetSpec[] = [
  {
    key: "parts",
    title: "parts",
    columns: [
      "part_number",
      "name",
      "logger",
      "type",
      "counts",
      "directional",
      "build_time_hours",
      "notes",
      "active",
    ],
    help: "Catalogue. directional and active: yes/no. Hours only — days are hours÷8 in the app.",
    examples: [
      ["ASSY.TX100", "TX100 assembly", "TX100", "assembly", "", "no", "0.4", "", "yes"],
      ["RBPB-N-B", "Remote button PCB N-B", "", "pcb", "", "yes", "8", "North-bound legend", "yes"],
      ["LEADSET-103-M", "Lead set 103 moulded", "", "leadset", "", "no", "0.2", "", "yes"],
    ],
  },
  {
    key: "work_orders",
    title: "work_orders",
    columns: [
      "wo_number",
      "part",
      "qty",
      "status",
      "build_time_hours",
      "assigned_build",
      "built_in_sage",
      "date_added",
      "date_started",
      "date_closed",
      "customer_need_date",
      "notes_to_production",
      "notes_from_sales",
    ],
    help: "One row per job. status: pending / active / on_hold / closed / cancelled. Dates: YYYY-MM-DD or DD/MM/YYYY. Qty does not create units. assigned_build: Simon / David / Donald or blank. build_time_hours: leave blank to use parts spec × qty; a number overwrites this job.",
    examples: [
      [
        "506",
        "ASSY.TX100",
        "40",
        "active",
        "",
        "David",
        "no",
        "2026-07-28",
        "2026-08-26",
        "",
        "2026-09-05",
        "Batch for stock",
        "",
      ],
      [
        "1694",
        "RBPB-N-B",
        "1",
        "pending",
        "",
        "David",
        "no",
        "2026-08-12",
        "",
        "",
        "2026-08-21",
        "Replace returned board",
        "",
      ],
      [
        "508",
        "LEADSET-103-M",
        "100",
        "pending",
        "",
        "Simon",
        "no",
        "2026-08-20",
        "",
        "",
        "",
        "",
        "Fire Security ×3 and Outdoor Access ×2 on this batch.",
      ],
    ],
  },
  {
    key: "units",
    title: "units",
    columns: [
      "work_order_number",
      "unit_id",
      "serial_or_id",
      "status",
      "sales_order_number",
      "despatch_date",
    ],
    help: "Only if you already have serials. unit_id like 508-1. status: in build / on shelf / shipped. Leave this sheet empty if you do not track units yet.",
    examples: [["508", "508-1", "", "in build", "3359", ""]],
  },
  {
    key: "quality_tickets",
    title: "quality_tickets",
    columns: [
      "ticket_number",
      "work_order_number",
      "unit_id",
      "title",
      "problem",
      "causes",
      "part",
      "further_action",
      "status",
      "assigned_to",
      "date_opened",
    ],
    help: "WO is optional. Leave ticket_number blank to auto-number QT-1, QT-2… status: open / closed. part can differ from the WO. further_action: yes/no. causes: semicolon-separated (TBD; component failure; design work needed; build error; missing parts; documentation).",
    examples: [
      [
        "QT-1",
        "1694",
        "",
        "Silk legend reversed",
        "N-B legend reads the wrong way on the button PCB.",
        "design work needed",
        "RBPB-N-B",
        "no",
        "open",
        "David",
        "2026-08-21",
      ],
    ],
  },
  {
    key: "sales_orders",
    title: "sales_orders",
    columns: [
      "so_number",
      "company",
      "order_date",
      "lead_time_weeks",
      "target_despatch",
      "status",
      "sage_id",
      "despatch_date",
      "notes_line1",
    ],
    help: "status: open / waiting_on_customer / despatched / cancelled. order_date: YYYY-MM-DD, DD/MM/YYYY, or Excel date. Target despatch can be left blank — Floor fills it from order date + lead weeks. Do not put parts here — parts go on sales_lines, one row per part.",
    examples: [
      ["3359", "Fire Security Team", "2026-08-04", "4", "2026-09-01", "open", ""],
      ["3367", "Outdoor Access Trust", "2026-08-11", "3", "2026-09-01", "open", ""],
      ["3401", "Natural England", "2026-08-14", "6", "2026-09-25", "waiting_on_customer", ""],
    ],
  },
  {
    key: "sales_lines",
    title: "sales_lines",
    columns: ["so_number", "part", "qty", "work_order_number"],
    help: "One row per part. Repeat the so_number. work_order_number is the planned WO (blank = No WO). You may also put order_date and company on this sheet — they write the sales order header.",
    examples: [
      ["3359", "LEADSET-103-M", "3", "508"],
      ["3359", "RBPB-N-B", "1", ""],
      ["3367", "LEADSET-103-M", "2", "508"],
      ["3401", "RBPB-N-B", "1", ""],
    ],
  },
  {
    key: "hardware_history",
    title: "hardware_history",
    columns: ["wo_number", "date", "author", "text"],
    help: "Append-only log. date as 2026-08-21 09:15 or 21/08/2026 09:15. Duplicate lines (same date+author+text) are skipped.",
    examples: [
      [
        "1694",
        "2026-08-21 09:15",
        "David",
        "Returned board received. Silk legend reversed — holding for QT-1.",
      ],
    ],
  },
  {
    key: "build_order",
    title: "build_order",
    columns: ["position", "wo_number"],
    help: "Per-person queue of work orders. Prefer the Build order screen. Tasks are on build_tasks.",
    examples: [
      ["1", "1694"],
      ["2", "506"],
      ["3", "496"],
      ["4", "507"],
      ["5", "508"],
    ],
  },
  {
    key: "build_tasks",
    title: "build_tasks",
    columns: ["id", "title", "assigned_build", "hours", "status", "build_order_notes"],
    help: "Extra bench tasks (mow the lawn, etc.). assigned_build: Simon or David. hours feed that person's schedule. status: pending / active / on_hold / done. A started (active) task keeps its start date.",
    examples: [
      ["", "Mow the lawn", "Simon", "2", "pending"],
      ["", "Goods in", "David", "1", "pending"],
    ],
  },
];

export const README_LINES = [
  "Floor load workbook — A&P Chambers",
  "",
  "Fill the sheets, then upload this file on Floor → Load data.",
  "Existing rows are updated (matched on part_number, wo_number, so_number, ticket_number, unit_id).",
  "New rows are inserted. Empty cells on an update leave the current value.",
  "",
  "Load order is automatic. For a first dump, fill:",
  "  1. parts",
  "  2. work_orders",
  "  3. units (optional)",
  "  4. quality_tickets",
  "  5. sales_orders",
  "  6. sales_lines (repeat the SO number — one row per part)",
  "  7. hardware_history (optional)",
  "  8. build_order (optional)",
  "  9. Build_Component_Lookup.xlsx (product × component X matrix + BatteryList)",
  " 10. Build reports — WORK ORDER, SERIAL, PART NUMBER, then one column per component",
  "",
  "Dates: YYYY-MM-DD or DD/MM/YYYY. Yes/no for tick boxes.",
  "Delete the sample rows if you do not want the demo jobs, or leave them.",
  "Do not use JSON files. This workbook is the mass-load path.",
];

export function detectSheetKey(
  name: string,
  headers: string[],
): SheetKey | "readme" | null {
  const n = name.toLowerCase().replace(/[\s-]+/g, "_");
  if (n.includes("readme") || n === "instructions") return "readme";
  for (const spec of SHEET_SPECS) {
    if (n === spec.key || n.includes(spec.key) || n === spec.title) return spec.key;
  }
  const h = new Set(headers.map(canonicalHeader));
  if (h.has("build_time_hours") || (h.has("part_number") && h.has("logger"))) {
    return "parts";
  }
  if (h.has("notes_from_sales") || h.has("customer_need_date") || h.has("notes_to_production")) {
    return "work_orders";
  }
  if (h.has("serial_or_id") || (h.has("unit_id") && h.has("work_order_number") && !h.has("ticket_number"))) {
    if (!(h.has("part_number") || h.has("part")) || h.has("unit_id")) return "units";
  }
  if (h.has("ticket_number") || h.has("problem")) return "quality_tickets";
  if (h.has("company") || h.has("lead_time_weeks")) return "sales_orders";
  if (h.has("author") && h.has("text")) return "hardware_history";
  if (h.has("position") && (h.has("wo_number") || h.has("work_order_number"))) {
    return "build_order";
  }
  if (h.has("so_number") && h.has("qty") && (h.has("part") || h.has("part_number"))) {
    return "sales_lines";
  }
  return null;
}

export function recordsForSheet(grid: string[][]): Record<string, string>[] {
  return recordsFromGrid(grid);
}
