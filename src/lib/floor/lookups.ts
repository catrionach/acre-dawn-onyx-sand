import type {
  ConsumedWo,
  FloorState,
  Note,
  ProblemTicket,
  QualityTicket,
  SagePackLine,
  SalesLine,
  SalesOrder,
  SoStatus,
  TaskStatus,
  TicketStatus,
  WorkOrder,
  WoStatus,
} from "./types";

/** Earliest target despatch among sales lines that plan this WO. */
export function earliestNeedForWo(
  woNumber: string,
  salesLines: FloorState["salesLines"],
  salesOrders: SalesOrder[],
): string | null {
  const dates: string[] = [];
  for (const line of salesLines) {
    if (line.workOrderNumber !== woNumber) continue;
    const so = salesOrders.find((s) => s.soNumber === line.soNumber);
    if (!so || so.status === "cancelled") continue;
    if (so.targetDespatch) dates.push(so.targetDespatch);
  }
  if (!dates.length) return null;
  dates.sort();
  return dates[0] ?? null;
}

export type ReadyToShip = {
  so: SalesOrder;
  woNumbers: string[];
};

/**
 * Open sales orders whose every planned WO is closed.
 * Lines with no WO, missing WOs, or unfinished WOs keep the SO off this list.
 */
export function salesOrdersReadyToShip(state: FloorState): ReadyToShip[] {
  const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
  const out: ReadyToShip[] = [];
  for (const so of state.salesOrders) {
    if (so.status === "despatched" || so.status === "cancelled") continue;
    const lines = state.salesLines.filter((l) => l.soNumber === so.soNumber);
    if (!lines.length) continue;
    if (lines.some((l) => !l.workOrderNumber.trim())) continue;
    const woNumbers = [...new Set(lines.map((l) => l.workOrderNumber.trim()))];
    if (!woNumbers.length) continue;
    if (!woNumbers.every((n) => woComplete(byWo.get(n)))) continue;
    out.push({ so, woNumbers });
  }
  return out;
}

function woComplete(wo: WorkOrder | undefined): boolean {
  return wo?.status === "closed";
}

/** Latest Sage SalesOrder.NotesLine1 for this SO (Floor copy, else pack list). */
export function sageNotesLine1(state: FloorState, soNumber: string): string {
  const so = state.salesOrders.find((s) => s.soNumber === soNumber.trim());
  if (so?.notesLine1.trim()) return so.notesLine1.trim();
  const line = state.sagePackLines.find(
    (l) => l.soNumber === soNumber.trim() && l.notes.trim(),
  );
  return line?.notes.trim() ?? "";
}

export function isProformaNote(raw: string): boolean {
  return /\bpro-?forma\b/i.test(raw);
}

function partKey(part: string): string {
  return part.trim().toUpperCase();
}

/** Strip a WO- prefix so "WO-508" and "508" match the stored number. */
export function normalizeWoNumber(raw: string): string {
  return raw.trim().replace(/^wo[\s-]*/i, "").trim();
}

/**
 * Split a shipping WO-number cell into individual jobs.
 * Commas, semicolons, slashes, "and". "508, 509, 510" or "WO-508, WO-509".
 */
export function parseWoNumbers(raw: string): string[] {
  const chunks = raw
    .split(/[,;|/]+|\s+and\s+|&/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const bits =
      /\s/.test(chunk) && !/^wo[\s-]/i.test(chunk)
        ? chunk.split(/\s+/).filter(Boolean)
        : [chunk];
    for (const bit of bits) {
      const n = normalizeWoNumber(bit);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

export function formatWoList(raw: string): string {
  const nums = parseWoNumbers(raw);
  return nums.length ? nums.join(", ") : raw.trim();
}

export function ticketTouchesWo(workOrderField: string, woNumber: string): boolean {
  const needle = normalizeWoNumber(woNumber);
  if (!needle) return false;
  return parseWoNumbers(workOrderField).includes(needle);
}

/** Pack-list codes that are never built as a WO. */
const SAGE_EXTRA_RE =
  /^(SUBSC|INSTR|INSTALL|MAGNET|SK\d|BIT|SWU|REPORT|TORX|5LOBE|SOFTWARE)/i;

/** Sage pack lines for an SO that are not already Floor sales lines. */
export function sageExtrasForSo(state: FloorState, soNumber: string): SagePackLine[] {
  const so = soNumber.trim();
  const floorParts = new Set(
    state.salesLines.filter((l) => l.soNumber === so).map((l) => partKey(l.part)),
  );
  return state.sagePackLines.filter((l) => {
    if (l.soNumber !== so) return false;
    if (!floorParts.size) return true;
    return !floorParts.has(partKey(l.part));
  });
}

/** Floor sales lines with no planned work order. */
export function salesLinesWithoutWo(state: FloorState): SalesLine[] {
  return state.salesLines.filter((l) => !l.workOrderNumber.trim());
}

/**
 * Sage extras that do not match a work-order part or a sales line that already
 * has a WO. Catalogue parts belong on a WO, not a TSK. If the catalogue is
 * empty, only well-known pack codes (install, subs, magnets, instructions).
 */
export function sageLinesWithoutWo(state: FloorState): SagePackLine[] {
  const catalogue = new Set(state.parts.map((p) => partKey(p.partNumber)).filter(Boolean));
  const woParts = new Set(state.workOrders.map((w) => partKey(w.part)).filter(Boolean));
  const linedWithWo = new Set(
    state.salesLines
      .filter((l) => l.workOrderNumber.trim())
      .map((l) => partKey(l.part))
      .filter(Boolean),
  );
  const catalogueEmpty = catalogue.size === 0;
  return state.sagePackLines.filter((l) => {
    const p = partKey(l.part);
    if (!p) return false;
    if (woParts.has(p) || linedWithWo.has(p)) return false;
    if (catalogue.has(p)) return false;
    if (catalogueEmpty && !SAGE_EXTRA_RE.test(p)) return false;
    return true;
  });
}

export type LinkedWo = {
  woNumber: string;
  part: string;
  status: string;
  assignedBuild: string;
  via: ("planned" | "despatched" | "unit")[];
};

export type WoSalesLink = {
  soNumber: string;
  company: string;
  soStatus: string;
  via: ("planned" | "despatched" | "unit")[];
  otherWos: LinkedWo[];
};

export type WoSalesLookup = {
  woNumber: string;
  wo: WorkOrder | undefined;
  sales: WoSalesLink[];
};

function mergeVia(
  into: ("planned" | "despatched" | "unit")[],
  extra: ("planned" | "despatched" | "unit")[],
): ("planned" | "despatched" | "unit")[] {
  const set = new Set(into);
  for (const v of extra) set.add(v);
  return [...set];
}

function linkedWoFromState(state: FloorState, woNumber: string): LinkedWo {
  const wo = state.workOrders.find((w) => w.woNumber === woNumber);
  return {
    woNumber,
    part: wo?.part ?? "",
    status: wo?.status ?? "",
    assignedBuild: wo?.assignedBuild ?? "",
    via: [],
  };
}

/** Sales orders that mention this WO, plus the other jobs on those orders. */
export function lookupWoSales(state: FloorState, raw: string): WoSalesLookup | null {
  const woNumber = normalizeWoNumber(raw);
  if (!woNumber) return null;
  const wo = state.workOrders.find((w) => w.woNumber === woNumber);

  const soMap = new Map<
    string,
    { via: ("planned" | "despatched" | "unit")[]; others: Map<string, LinkedWo> }
  >();

  const touchSo = (soNumber: string, via: ("planned" | "despatched" | "unit")[]) => {
    const so = soNumber.trim();
    if (!so) return;
    let bag = soMap.get(so);
    if (!bag) {
      bag = { via: [], others: new Map() };
      soMap.set(so, bag);
    }
    bag.via = mergeVia(bag.via, via);
  };

  const touchOther = (
    soNumber: string,
    otherWo: string,
    via: ("planned" | "despatched" | "unit")[],
  ) => {
    const n = normalizeWoNumber(otherWo);
    if (!n || n === woNumber) return;
    const bag = soMap.get(soNumber.trim());
    if (!bag) return;
    const cur = bag.others.get(n) ?? linkedWoFromState(state, n);
    cur.via = mergeVia(cur.via, via);
    bag.others.set(n, cur);
  };

  for (const line of state.salesLines) {
    const planned = normalizeWoNumber(line.workOrderNumber);
    const despatched = parseWoNumbers(line.despatchWoNumber);
    const hitsPlanned = planned === woNumber;
    const hitsDespatch = despatched.includes(woNumber);
    if (hitsPlanned || hitsDespatch) {
      const via: ("planned" | "despatched" | "unit")[] = [];
      if (hitsPlanned) via.push("planned");
      if (hitsDespatch) via.push("despatched");
      touchSo(line.soNumber, via);
    }
  }

  for (const unit of state.units) {
    if (normalizeWoNumber(unit.workOrderNumber) !== woNumber) continue;
    if (!unit.salesOrderNumber?.trim()) continue;
    touchSo(unit.salesOrderNumber, ["unit"]);
  }

  for (const line of state.salesLines) {
    if (!soMap.has(line.soNumber)) continue;
    if (line.workOrderNumber.trim()) {
      touchOther(line.soNumber, line.workOrderNumber, ["planned"]);
    }
    for (const n of parseWoNumbers(line.despatchWoNumber)) {
      touchOther(line.soNumber, n, ["despatched"]);
    }
  }
  for (const unit of state.units) {
    const so = unit.salesOrderNumber?.trim();
    if (!so || !soMap.has(so)) continue;
    touchOther(so, unit.workOrderNumber, ["unit"]);
  }

  const sales: WoSalesLink[] = [...soMap.entries()]
    .map(([soNumber, bag]) => {
      const so = state.salesOrders.find((s) => s.soNumber === soNumber);
      const sage = state.sagePackLines.find((l) => l.soNumber === soNumber);
      return {
        soNumber,
        company: so?.company || sage?.company || "",
        soStatus: so?.status || (sage ? "pack list" : ""),
        via: bag.via,
        otherWos: [...bag.others.values()].sort((a, b) =>
          a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true }),
        ),
      };
    })
    .sort((a, b) => a.soNumber.localeCompare(b.soNumber, undefined, { numeric: true }));

  return { woNumber, wo, sales };
}

export type HistorySource = {
  woNumber: string;
  part: string;
  notes: Note[];
  missing?: boolean;
};

/** Hardware history for each WO listed on a PT (or build record) consumed column. */
export function sourcesFromConsumed(
  consumed: ConsumedWo[],
  workOrders: WorkOrder[],
): HistorySource[] {
  const byWo = new Map(workOrders.map((w) => [w.woNumber, w]));
  const out: HistorySource[] = [];
  const seen = new Set<string>();
  for (const item of consumed) {
    const woNumber = item.woNumber.trim();
    if (!woNumber || seen.has(woNumber)) continue;
    seen.add(woNumber);
    const wo = byWo.get(woNumber);
    out.push({
      woNumber,
      part: item.part || wo?.part || "",
      notes: wo?.hardwareHistory ?? [],
      missing: !wo,
    });
  }
  return out;
}

export type TraceSale = {
  soNumber: string;
  company: string;
  status: SoStatus | "";
};

export type TraceJob = {
  woNumber: string;
  part: string;
};

export type TracePt = {
  prospectNumber: string;
  title: string;
  status: TaskStatus;
};

export type TraceQt = {
  ticketNumber: string;
  title: string;
  status: TicketStatus;
};

export type TraceRow = {
  key: string;
  woNumber: string;
  part: string;
  woStatus: WoStatus | "";
  sales: TraceSale[];
  consumed: TraceJob[];
  usedIn: TraceJob[];
  pts: TracePt[];
  qts: TraceQt[];
  gap: boolean;
};

function pushUnique<T>(bag: T[], item: T, key: (t: T) => string): void {
  const k = key(item);
  if (!k || bag.some((x) => key(x) === k)) return;
  bag.push(item);
}

function sortJobs(items: TraceJob[]): TraceJob[] {
  return [...items].sort((a, b) =>
    a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true }),
  );
}

function sortSales(items: TraceSale[]): TraceSale[] {
  return [...items].sort((a, b) =>
    a.soNumber.localeCompare(b.soNumber, undefined, { numeric: true }),
  );
}

function woKeySort(a: string, b: string): number {
  if (!a && b) return 1;
  if (a && !b) return -1;
  return a.localeCompare(b, undefined, { numeric: true });
}

/** Sales orders, work orders, consumed jobs, problem tickets and QTs as one map. */
export function buildTraceRows(state: FloorState): TraceRow[] {
  const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
  const soBy = new Map(state.salesOrders.map((s) => [s.soNumber, s]));

  const salesByWo = new Map<string, TraceSale[]>();
  const addSale = (woNumber: string, soNumber: string) => {
    const wo = normalizeWoNumber(woNumber);
    const so = soNumber.trim();
    if (!wo || !so) return;
    const found = soBy.get(so);
    const sage = state.sagePackLines.find((l) => l.soNumber === so);
    const bag = salesByWo.get(wo) ?? [];
    pushUnique(
      bag,
      {
        soNumber: so,
        company: found?.company || sage?.company || "",
        status: found?.status ?? "",
      },
      (s) => s.soNumber,
    );
    salesByWo.set(wo, bag);
  };

  const untracedLines: SalesLine[] = [];
  for (const line of state.salesLines) {
    const planned = normalizeWoNumber(line.workOrderNumber);
    const shipped = parseWoNumbers(line.despatchWoNumber);
    if (!planned && !shipped.length) {
      untracedLines.push(line);
      continue;
    }
    if (planned) addSale(planned, line.soNumber);
    for (const n of shipped) addSale(n, line.soNumber);
  }
  for (const unit of state.units) {
    addSale(unit.workOrderNumber, unit.salesOrderNumber ?? "");
  }

  const consumedByWo = new Map<string, TraceJob[]>();
  const usedInByWo = new Map<string, TraceJob[]>();
  const addConsumed = (parentRaw: string, child: ConsumedWo) => {
    const parent = normalizeWoNumber(parentRaw);
    const childWo = normalizeWoNumber(child.woNumber);
    if (!parent || !childWo) return;
    const childPart = child.part || byWo.get(childWo)?.part || "";
    const consumed = consumedByWo.get(parent) ?? [];
    pushUnique(consumed, { woNumber: childWo, part: childPart }, (j) => j.woNumber);
    consumedByWo.set(parent, consumed);
    const used = usedInByWo.get(childWo) ?? [];
    pushUnique(
      used,
      { woNumber: parent, part: byWo.get(parent)?.part || "" },
      (j) => j.woNumber,
    );
    usedInByWo.set(childWo, used);
  };
  for (const rec of state.buildRecords) {
    for (const item of rec.consumed) addConsumed(rec.woNumber, item);
  }

  const ptsByWo = new Map<string, TracePt[]>();
  const untracedPts: ProblemTicket[] = [];
  for (const pt of state.problemTickets) {
    const wos = [
      ...new Set(pt.consumed.map((c) => normalizeWoNumber(c.woNumber)).filter(Boolean)),
    ];
    if (!wos.length) {
      untracedPts.push(pt);
      continue;
    }
    const entry: TracePt = {
      prospectNumber: pt.prospectNumber,
      title: pt.title,
      status: pt.status,
    };
    for (const n of wos) {
      const bag = ptsByWo.get(n) ?? [];
      pushUnique(bag, entry, (p) => p.prospectNumber);
      ptsByWo.set(n, bag);
    }
  }

  const qtsByWo = new Map<string, TraceQt[]>();
  const untracedQts: QualityTicket[] = [];
  for (const qt of state.tickets) {
    const wos = parseWoNumbers(qt.workOrderNumber);
    if (!wos.length) {
      untracedQts.push(qt);
      continue;
    }
    const entry: TraceQt = {
      ticketNumber: qt.ticketNumber,
      title: qt.title,
      status: qt.status,
    };
    for (const n of wos) {
      const bag = qtsByWo.get(n) ?? [];
      pushUnique(bag, entry, (q) => q.ticketNumber);
      qtsByWo.set(n, bag);
    }
  }

  const woNumbers = new Set<string>([
    ...byWo.keys(),
    ...salesByWo.keys(),
    ...consumedByWo.keys(),
    ...usedInByWo.keys(),
    ...ptsByWo.keys(),
    ...qtsByWo.keys(),
  ]);

  const rows: TraceRow[] = [...woNumbers].map((woNumber) => {
    const wo = byWo.get(woNumber);
    const sales = sortSales(salesByWo.get(woNumber) ?? []);
    const consumed = sortJobs(consumedByWo.get(woNumber) ?? []);
    const usedIn = sortJobs(usedInByWo.get(woNumber) ?? []);
    const pts = ptsByWo.get(woNumber) ?? [];
    const qts = qtsByWo.get(woNumber) ?? [];
    return {
      key: `wo-${woNumber}`,
      woNumber,
      part: wo?.part || consumed[0]?.part || "",
      woStatus: wo?.status ?? "",
      sales,
      consumed,
      usedIn,
      pts,
      qts,
      gap: sales.length === 0,
    };
  });

  for (const line of untracedLines) {
    const so = soBy.get(line.soNumber);
    rows.push({
      key: `so-${line.id}`,
      woNumber: "",
      part: line.part,
      woStatus: "",
      sales: [
        {
          soNumber: line.soNumber,
          company: so?.company || "",
          status: so?.status ?? "",
        },
      ],
      consumed: [],
      usedIn: [],
      pts: [],
      qts: [],
      gap: true,
    });
  }

  for (const pt of untracedPts) {
    rows.push({
      key: `pt-${pt.id}`,
      woNumber: "",
      part: pt.part,
      woStatus: "",
      sales: [],
      consumed: [],
      usedIn: [],
      pts: [
        {
          prospectNumber: pt.prospectNumber,
          title: pt.title,
          status: pt.status,
        },
      ],
      qts: [],
      gap: true,
    });
  }

  for (const qt of untracedQts) {
    rows.push({
      key: `qt-${qt.ticketNumber}`,
      woNumber: "",
      part: qt.part,
      woStatus: "",
      sales: [],
      consumed: [],
      usedIn: [],
      pts: [],
      qts: [
        {
          ticketNumber: qt.ticketNumber,
          title: qt.title,
          status: qt.status,
        },
      ],
      gap: true,
    });
  }

  return rows.sort((a, b) => {
    const byWoNum = woKeySort(a.woNumber, b.woNumber);
    if (byWoNum) return byWoNum;
    return a.key.localeCompare(b.key, undefined, { numeric: true });
  });
}

export function traceRowMatches(row: TraceRow, raw: string): boolean {
  const needle = raw.trim().toLowerCase();
  if (!needle) return true;
  const stripped = needle.replace(/^(wo|so|pt|qt)[\s-]*/, "");
  const hay = [
    row.woNumber,
    row.part,
    ...row.sales.flatMap((s) => [s.soNumber, s.company]),
    ...row.consumed.flatMap((j) => [j.woNumber, j.part]),
    ...row.usedIn.flatMap((j) => [j.woNumber, j.part]),
    ...row.pts.flatMap((p) => [p.prospectNumber, p.title]),
    ...row.qts.flatMap((t) => [t.ticketNumber, t.title]),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle) || (Boolean(stripped) && hay.includes(stripped));
}

export type TraceQueryKind = "wo" | "so" | "pt" | "qt";

export type ParsedTraceQuery = {
  kind: TraceQueryKind | "any";
  id: string;
  serial: string;
};

function stripPrefix(raw: string, prefix: string): string {
  return raw.trim().replace(new RegExp(`^${prefix}[\\s-]*`, "i"), "").trim();
}

function sameId(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** WO-443-2, QT-1, SO-9001, PT-1842 — or a bare number. */
export function parseTraceQuery(raw: string): ParsedTraceQuery | null {
  const t = raw.trim();
  if (!t) return null;
  const prefixed = /^(wo|qt|so|pt)[\s-]+(.+)$/i.exec(t);
  if (prefixed) {
    const kind = prefixed[1].toLowerCase() as TraceQueryKind;
    const rest = prefixed[2].trim();
    if (kind === "wo") {
      const serial = /^(\d+)[\s-]+(.+)$/.exec(rest);
      if (serial) return { kind: "wo", id: serial[1], serial: serial[2].trim() };
      return { kind: "wo", id: normalizeWoNumber(rest), serial: "" };
    }
    if (kind === "qt") return { kind: "qt", id: stripPrefix(rest, "qt"), serial: "" };
    if (kind === "so") return { kind: "so", id: stripPrefix(rest, "so"), serial: "" };
    return { kind: "pt", id: stripPrefix(rest, "pt"), serial: "" };
  }
  const woSerial = /^(\d+)[\s-]+(.+)$/.exec(t);
  if (woSerial) return { kind: "wo", id: woSerial[1], serial: woSerial[2].trim() };
  return { kind: "any", id: t.replace(/^(wo|qt|so|pt)[\s-]*/i, "").trim(), serial: "" };
}

function qtKey(ticketNumber: string): string {
  return ticketNumber.trim().replace(/^qt[\s-]*/i, "").toLowerCase();
}

export function matchTraceRows(rows: TraceRow[], parsed: ParsedTraceQuery): TraceRow[] {
  const id = parsed.id;
  if (!id) return [];
  return rows.filter((row) => {
    const woHit = Boolean(row.woNumber) && sameId(row.woNumber, normalizeWoNumber(id));
    const soHit = row.sales.some((s) => sameId(s.soNumber, stripPrefix(id, "so")));
    const ptHit = row.pts.some(
      (p) =>
        sameId(p.prospectNumber, stripPrefix(id, "pt")) ||
        sameId(p.prospectNumber, id),
    );
    const qtHit = row.qts.some(
      (q) => qtKey(q.ticketNumber) === qtKey(id) || sameId(q.ticketNumber, id),
    );
    if (parsed.kind === "wo") return woHit;
    if (parsed.kind === "so") return soHit;
    if (parsed.kind === "pt") return ptHit;
    if (parsed.kind === "qt") return qtHit;
    return woHit || soHit || ptHit || qtHit;
  });
}


