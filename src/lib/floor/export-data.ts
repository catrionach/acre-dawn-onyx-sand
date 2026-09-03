import type { FloorState } from "./types";
import { SHEET_SPECS, type SheetKey } from "./load-sheets";
import { toCsv } from "./csv";
import { SCHEMA_DOC } from "./schema-doc";
import { zipStore } from "./zip-store";
import { buildRecordsToGrid, lookupToGrid } from "./build-lookup";
import { writeXlsx } from "./xlsx";

function yn(v: boolean): string {
  return v ? "yes" : "no";
}

function stamp(iso: string | null | undefined): string {
  if (!iso) return "";
  if (iso.includes("T")) return iso.replace("T", " ").slice(0, 16);
  return iso.slice(0, 10);
}

export function floorToSheets(state: FloorState): { name: string; key: SheetKey; rows: string[][] }[] {
  const byKey: Record<SheetKey, string[][]> = {
    parts: state.parts.map((p) => [
      p.partNumber,
      p.name,
      p.logger,
      p.type,
      p.counts,
      yn(p.directional),
      String(p.buildTimeHours),
      p.notes,
      yn(p.active),
    ]),
    work_orders: state.workOrders.map((w) => [
      w.woNumber,
      w.part,
      String(w.qty),
      w.status,
      w.buildTimeHours == null ? "" : String(w.buildTimeHours),
      w.assignedBuild,
      yn(w.builtInSage),
      stamp(w.dateAdded),
      stamp(w.dateStarted),
      stamp(w.dateClosed),
      stamp(w.customerNeedDate),
      w.notesToProduction,
      w.buildOrderNotes,
    ]),
    units: state.units.map((u) => [
      u.workOrderNumber,
      u.unitId,
      u.serialOrId,
      u.status,
      u.salesOrderNumber ?? "",
      stamp(u.despatchDate),
    ]),
    quality_tickets: state.tickets.map((t) => [
      t.ticketNumber,
      t.workOrderNumber,
      t.unitId ?? "",
      t.title,
      t.problem,
      t.causes?.join("; ") ?? "",
      t.part,
      yn(t.furtherAction),
      t.status,
      t.assignedTo,
      stamp(t.dateOpened),
    ]),
    sales_orders: state.salesOrders.map((s) => [
      s.soNumber,
      s.company,
      stamp(s.orderDate),
      s.leadTimeWeeks == null ? "" : String(s.leadTimeWeeks),
      stamp(s.targetDespatch),
      s.status,
      s.sageId,
      stamp(s.despatchDate),
      s.notesLine1,
    ]),
    sales_lines: state.salesLines.map((l) => [
      l.soNumber,
      l.part,
      String(l.qty),
      l.workOrderNumber,
    ]),
    hardware_history: state.workOrders.flatMap((w) =>
      w.hardwareHistory.map((n) => [w.woNumber, stamp(n.date), n.author, n.text]),
    ),
    build_order: state.buildOrder.map((wo, i) => [String(i + 1), wo]),
    build_tasks: state.buildTasks.map((t) => [
      String(t.id),
      t.title,
      t.assignedBuild,
      String(t.hours),
      t.status,
      t.buildOrderNotes,
    ]),
  };

  return SHEET_SPECS.map((spec) => ({
    name: spec.title,
    key: spec.key,
    rows: [spec.columns, ...byKey[spec.key]],
  }));
}

export function zipFromFloor(state: FloorState): Uint8Array {
  const enc = new TextEncoder();
  const partOf = (woNumber: string) =>
    state.workOrders.find((w) => w.woNumber === woNumber)?.part ?? "";
  const lookupSheets = lookupToGrid(state.buildSpec);
  const recordGrid = buildRecordsToGrid(state.buildRecords, state.buildSpec.components, partOf);
  const files = [
    { name: "_database.txt", data: enc.encode(SCHEMA_DOC) },
    ...floorToSheets(state).map((s) => ({
      name: `${s.key}.csv`,
      data: enc.encode(`\uFEFF${toCsv(s.rows)}`),
    })),
    {
      name: "Build_Component_Lookup.xlsx",
      data: writeXlsx(lookupSheets),
    },
    {
      name: "build_records.csv",
      data: enc.encode(`\uFEFF${toCsv(recordGrid)}`),
    },
  ];
  return zipStore(files);
}
