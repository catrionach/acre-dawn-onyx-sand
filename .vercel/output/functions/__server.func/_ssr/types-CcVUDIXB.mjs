import { r as __exportAll } from "../_runtime.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, l as __exportAll$1, n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { gn as string, pn as object } from "../_libs/@better-auth/core+[...].mjs";
import { inflateRawSync } from "node:zlib";
//#region node_modules/.nitro/vite/services/ssr/assets/csv-DEBD8aOf.js
function parseCsv(text) {
	const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const rows = [];
	let row = [];
	let cell = "";
	let i = 0;
	let inQuotes = false;
	while (i < src.length) {
		const ch = src[i];
		if (inQuotes) {
			if (ch === "\"") {
				if (src[i + 1] === "\"") {
					cell += "\"";
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
		if (ch === "\"") {
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
	return maybeSemicolon(rows.filter((r) => r.some((c) => c.trim() !== "")));
}
/** Excel in the UK often saves CSV with semicolons. */
function maybeSemicolon(rows) {
	if (rows.length < 2) return rows;
	if (rows.filter((r) => r.length === 1 && r[0].includes(";")).length < rows.length / 2) return rows;
	return rows.map((r) => r.length === 1 && r[0].includes(";") ? splitSemi(r[0]) : r);
}
function splitSemi(line) {
	return line.split(";").map((c) => c.trim());
}
function toCsv(rows) {
	return rows.map((row) => row.map((cell) => {
		const v = cell ?? "";
		if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, "\"\"")}"`;
		return v;
	}).join(",")).join("\r\n");
}
function normalizeHeader(value) {
	return value.trim().toLowerCase().replace(/^\uFEFF/, "").replace(/[\s-]+/g, "_").replace(/[^\w]/g, "");
}
var HEADER_ALIASES = {
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
	sageid: "sage_id"
};
function canonicalHeader(value) {
	const n = normalizeHeader(value);
	return HEADER_ALIASES[n] ?? n;
}
function recordsFromGrid(grid) {
	if (grid.length < 2) return [];
	const headers = grid[0].map(canonicalHeader);
	const out = [];
	for (const row of grid.slice(1)) {
		const rec = {};
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
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/lookups-oMKag-Fw.js
/** Earliest target despatch among sales lines that plan this WO. */
function earliestNeedForWo(woNumber, salesLines, salesOrders) {
	const dates = [];
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
/**
* Open sales orders whose every planned WO is closed.
* Lines with no WO, missing WOs, or unfinished WOs keep the SO off this list.
*/
function salesOrdersReadyToShip(state) {
	const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
	const out = [];
	for (const so of state.salesOrders) {
		if (so.status === "despatched" || so.status === "cancelled") continue;
		const lines = state.salesLines.filter((l) => l.soNumber === so.soNumber);
		if (!lines.length) continue;
		if (lines.some((l) => !l.workOrderNumber.trim())) continue;
		const woNumbers = [...new Set(lines.map((l) => l.workOrderNumber.trim()))];
		if (!woNumbers.length) continue;
		if (!woNumbers.every((n) => woComplete(byWo.get(n)))) continue;
		out.push({
			so,
			woNumbers
		});
	}
	return out;
}
function woComplete(wo) {
	return wo?.status === "closed";
}
/** Latest Sage SalesOrder.NotesLine1 for this SO (Floor copy, else pack list). */
function sageNotesLine1(state, soNumber) {
	const so = state.salesOrders.find((s) => s.soNumber === soNumber.trim());
	if (so?.notesLine1.trim()) return so.notesLine1.trim();
	return state.sagePackLines.find((l) => l.soNumber === soNumber.trim() && l.notes.trim())?.notes.trim() ?? "";
}
function isProformaNote(raw) {
	return /\bpro-?forma\b/i.test(raw);
}
function partKey(part) {
	return part.trim().toUpperCase();
}
/** Strip a WO- prefix so "WO-508" and "508" match the stored number. */
function normalizeWoNumber(raw) {
	return raw.trim().replace(/^wo[\s-]*/i, "").trim();
}
/**
* Split a shipping WO-number cell into individual jobs.
* Commas, semicolons, slashes, "and". "508, 509, 510" or "WO-508, WO-509".
*/
function parseWoNumbers(raw) {
	const chunks = raw.split(/[,;|/]+|\s+and\s+|&/i).map((s) => s.trim()).filter(Boolean);
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const chunk of chunks) {
		const bits = /\s/.test(chunk) && !/^wo[\s-]/i.test(chunk) ? chunk.split(/\s+/).filter(Boolean) : [chunk];
		for (const bit of bits) {
			const n = normalizeWoNumber(bit);
			if (!n || seen.has(n)) continue;
			seen.add(n);
			out.push(n);
		}
	}
	return out;
}
function ticketTouchesWo(workOrderField, woNumber) {
	const needle = normalizeWoNumber(woNumber);
	if (!needle) return false;
	return parseWoNumbers(workOrderField).includes(needle);
}
/** Pack-list codes that are never built as a WO. */
var SAGE_EXTRA_RE = /^(SUBSC|INSTR|INSTALL|MAGNET|SK\d|BIT|SWU|REPORT|TORX|5LOBE|SOFTWARE)/i;
/** Sage pack lines for an SO that are not already Floor sales lines. */
function sageExtrasForSo(state, soNumber) {
	const so = soNumber.trim();
	const floorParts = new Set(state.salesLines.filter((l) => l.soNumber === so).map((l) => partKey(l.part)));
	return state.sagePackLines.filter((l) => {
		if (l.soNumber !== so) return false;
		if (!floorParts.size) return true;
		return !floorParts.has(partKey(l.part));
	});
}
/** Floor sales lines with no planned work order. */
function salesLinesWithoutWo(state) {
	return state.salesLines.filter((l) => !l.workOrderNumber.trim());
}
/**
* Sage extras that do not match a work-order part or a sales line that already
* has a WO. Catalogue parts belong on a WO, not a TSK. If the catalogue is
* empty, only well-known pack codes (install, subs, magnets, instructions).
*/
function sageLinesWithoutWo(state) {
	const catalogue = new Set(state.parts.map((p) => partKey(p.partNumber)).filter(Boolean));
	const woParts = new Set(state.workOrders.map((w) => partKey(w.part)).filter(Boolean));
	const linedWithWo = new Set(state.salesLines.filter((l) => l.workOrderNumber.trim()).map((l) => partKey(l.part)).filter(Boolean));
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
function mergeVia(into, extra) {
	const set = new Set(into);
	for (const v of extra) set.add(v);
	return [...set];
}
function linkedWoFromState(state, woNumber) {
	const wo = state.workOrders.find((w) => w.woNumber === woNumber);
	return {
		woNumber,
		part: wo?.part ?? "",
		status: wo?.status ?? "",
		assignedBuild: wo?.assignedBuild ?? "",
		via: []
	};
}
/** Sales orders that mention this WO, plus the other jobs on those orders. */
function lookupWoSales(state, raw) {
	const woNumber = normalizeWoNumber(raw);
	if (!woNumber) return null;
	const wo = state.workOrders.find((w) => w.woNumber === woNumber);
	const soMap = /* @__PURE__ */ new Map();
	const touchSo = (soNumber, via) => {
		const so = soNumber.trim();
		if (!so) return;
		let bag = soMap.get(so);
		if (!bag) {
			bag = {
				via: [],
				others: /* @__PURE__ */ new Map()
			};
			soMap.set(so, bag);
		}
		bag.via = mergeVia(bag.via, via);
	};
	const touchOther = (soNumber, otherWo, via) => {
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
			const via = [];
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
		if (line.workOrderNumber.trim()) touchOther(line.soNumber, line.workOrderNumber, ["planned"]);
		for (const n of parseWoNumbers(line.despatchWoNumber)) touchOther(line.soNumber, n, ["despatched"]);
	}
	for (const unit of state.units) {
		const so = unit.salesOrderNumber?.trim();
		if (!so || !soMap.has(so)) continue;
		touchOther(so, unit.workOrderNumber, ["unit"]);
	}
	return {
		woNumber,
		wo,
		sales: [...soMap.entries()].map(([soNumber, bag]) => {
			const so = state.salesOrders.find((s) => s.soNumber === soNumber);
			const sage = state.sagePackLines.find((l) => l.soNumber === soNumber);
			return {
				soNumber,
				company: so?.company || sage?.company || "",
				soStatus: so?.status || (sage ? "pack list" : ""),
				via: bag.via,
				otherWos: [...bag.others.values()].sort((a, b) => a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true }))
			};
		}).sort((a, b) => a.soNumber.localeCompare(b.soNumber, void 0, { numeric: true }))
	};
}
/** Hardware history for each WO listed on a PT (or build record) consumed column. */
function sourcesFromConsumed(consumed, workOrders) {
	const byWo = new Map(workOrders.map((w) => [w.woNumber, w]));
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of consumed) {
		const woNumber = item.woNumber.trim();
		if (!woNumber || seen.has(woNumber)) continue;
		seen.add(woNumber);
		const wo = byWo.get(woNumber);
		out.push({
			woNumber,
			part: item.part || wo?.part || "",
			notes: wo?.hardwareHistory ?? [],
			missing: !wo
		});
	}
	return out;
}
function pushUnique(bag, item, key) {
	const k = key(item);
	if (!k || bag.some((x) => key(x) === k)) return;
	bag.push(item);
}
function sortJobs(items) {
	return [...items].sort((a, b) => a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true }));
}
function sortSales(items) {
	return [...items].sort((a, b) => a.soNumber.localeCompare(b.soNumber, void 0, { numeric: true }));
}
function woKeySort(a, b) {
	if (!a && b) return 1;
	if (a && !b) return -1;
	return a.localeCompare(b, void 0, { numeric: true });
}
/** Sales orders, work orders, consumed jobs, problem tickets and QTs as one map. */
function buildTraceRows(state) {
	const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
	const soBy = new Map(state.salesOrders.map((s) => [s.soNumber, s]));
	const salesByWo = /* @__PURE__ */ new Map();
	const addSale = (woNumber, soNumber) => {
		const wo = normalizeWoNumber(woNumber);
		const so = soNumber.trim();
		if (!wo || !so) return;
		const found = soBy.get(so);
		const sage = state.sagePackLines.find((l) => l.soNumber === so);
		const bag = salesByWo.get(wo) ?? [];
		pushUnique(bag, {
			soNumber: so,
			company: found?.company || sage?.company || "",
			status: found?.status ?? ""
		}, (s) => s.soNumber);
		salesByWo.set(wo, bag);
	};
	const untracedLines = [];
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
	for (const unit of state.units) addSale(unit.workOrderNumber, unit.salesOrderNumber ?? "");
	const consumedByWo = /* @__PURE__ */ new Map();
	const usedInByWo = /* @__PURE__ */ new Map();
	const addConsumed = (parentRaw, child) => {
		const parent = normalizeWoNumber(parentRaw);
		const childWo = normalizeWoNumber(child.woNumber);
		if (!parent || !childWo) return;
		const childPart = child.part || byWo.get(childWo)?.part || "";
		const consumed = consumedByWo.get(parent) ?? [];
		pushUnique(consumed, {
			woNumber: childWo,
			part: childPart
		}, (j) => j.woNumber);
		consumedByWo.set(parent, consumed);
		const used = usedInByWo.get(childWo) ?? [];
		pushUnique(used, {
			woNumber: parent,
			part: byWo.get(parent)?.part || ""
		}, (j) => j.woNumber);
		usedInByWo.set(childWo, used);
	};
	for (const rec of state.buildRecords) for (const item of rec.consumed) addConsumed(rec.woNumber, item);
	const ptsByWo = /* @__PURE__ */ new Map();
	const untracedPts = [];
	for (const pt of state.problemTickets) {
		const wos = [...new Set(pt.consumed.map((c) => normalizeWoNumber(c.woNumber)).filter(Boolean))];
		if (!wos.length) {
			untracedPts.push(pt);
			continue;
		}
		const entry = {
			prospectNumber: pt.prospectNumber,
			title: pt.title,
			status: pt.status
		};
		for (const n of wos) {
			const bag = ptsByWo.get(n) ?? [];
			pushUnique(bag, entry, (p) => p.prospectNumber);
			ptsByWo.set(n, bag);
		}
	}
	const qtsByWo = /* @__PURE__ */ new Map();
	const untracedQts = [];
	for (const qt of state.tickets) {
		const wos = parseWoNumbers(qt.workOrderNumber);
		if (!wos.length) {
			untracedQts.push(qt);
			continue;
		}
		const entry = {
			ticketNumber: qt.ticketNumber,
			title: qt.title,
			status: qt.status
		};
		for (const n of wos) {
			const bag = qtsByWo.get(n) ?? [];
			pushUnique(bag, entry, (q) => q.ticketNumber);
			qtsByWo.set(n, bag);
		}
	}
	const rows = [.../* @__PURE__ */ new Set([
		...byWo.keys(),
		...salesByWo.keys(),
		...consumedByWo.keys(),
		...usedInByWo.keys(),
		...ptsByWo.keys(),
		...qtsByWo.keys()
	])].map((woNumber) => {
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
			gap: sales.length === 0
		};
	});
	for (const line of untracedLines) {
		const so = soBy.get(line.soNumber);
		rows.push({
			key: `so-${line.id}`,
			woNumber: "",
			part: line.part,
			woStatus: "",
			sales: [{
				soNumber: line.soNumber,
				company: so?.company || "",
				status: so?.status ?? ""
			}],
			consumed: [],
			usedIn: [],
			pts: [],
			qts: [],
			gap: true
		});
	}
	for (const pt of untracedPts) rows.push({
		key: `pt-${pt.id}`,
		woNumber: "",
		part: pt.part,
		woStatus: "",
		sales: [],
		consumed: [],
		usedIn: [],
		pts: [{
			prospectNumber: pt.prospectNumber,
			title: pt.title,
			status: pt.status
		}],
		qts: [],
		gap: true
	});
	for (const qt of untracedQts) rows.push({
		key: `qt-${qt.ticketNumber}`,
		woNumber: "",
		part: qt.part,
		woStatus: "",
		sales: [],
		consumed: [],
		usedIn: [],
		pts: [],
		qts: [{
			ticketNumber: qt.ticketNumber,
			title: qt.title,
			status: qt.status
		}],
		gap: true
	});
	return rows.sort((a, b) => {
		const byWoNum = woKeySort(a.woNumber, b.woNumber);
		if (byWoNum) return byWoNum;
		return a.key.localeCompare(b.key, void 0, { numeric: true });
	});
}
function stripPrefix(raw, prefix) {
	return raw.trim().replace(new RegExp(`^${prefix}[\\s-]*`, "i"), "").trim();
}
function sameId(a, b) {
	return a.trim().toLowerCase() === b.trim().toLowerCase();
}
/** WO-443-2, QT-1, SO-9001, PT-1842 — or a bare number. */
function parseTraceQuery(raw) {
	const t = raw.trim();
	if (!t) return null;
	const prefixed = /^(wo|qt|so|pt)[\s-]+(.+)$/i.exec(t);
	if (prefixed) {
		const kind = prefixed[1].toLowerCase();
		const rest = prefixed[2].trim();
		if (kind === "wo") {
			const serial = /^(\d+)[\s-]+(.+)$/.exec(rest);
			if (serial) return {
				kind: "wo",
				id: serial[1],
				serial: serial[2].trim()
			};
			return {
				kind: "wo",
				id: normalizeWoNumber(rest),
				serial: ""
			};
		}
		if (kind === "qt") return {
			kind: "qt",
			id: stripPrefix(rest, "qt"),
			serial: ""
		};
		if (kind === "so") return {
			kind: "so",
			id: stripPrefix(rest, "so"),
			serial: ""
		};
		return {
			kind: "pt",
			id: stripPrefix(rest, "pt"),
			serial: ""
		};
	}
	const woSerial = /^(\d+)[\s-]+(.+)$/.exec(t);
	if (woSerial) return {
		kind: "wo",
		id: woSerial[1],
		serial: woSerial[2].trim()
	};
	return {
		kind: "any",
		id: t.replace(/^(wo|qt|so|pt)[\s-]*/i, "").trim(),
		serial: ""
	};
}
function qtKey(ticketNumber) {
	return ticketNumber.trim().replace(/^qt[\s-]*/i, "").toLowerCase();
}
function matchTraceRows(rows, parsed) {
	const id = parsed.id;
	if (!id) return [];
	return rows.filter((row) => {
		const woHit = Boolean(row.woNumber) && sameId(row.woNumber, normalizeWoNumber(id));
		const soHit = row.sales.some((s) => sameId(s.soNumber, stripPrefix(id, "so")));
		const ptHit = row.pts.some((p) => sameId(p.prospectNumber, stripPrefix(id, "pt")) || sameId(p.prospectNumber, id));
		const qtHit = row.qts.some((q) => qtKey(q.ticketNumber) === qtKey(id) || sameId(q.ticketNumber, id));
		if (parsed.kind === "wo") return woHit;
		if (parsed.kind === "so") return soHit;
		if (parsed.kind === "pt") return ptHit;
		if (parsed.kind === "qt") return qtHit;
		return woHit || soHit || ptHit || qtHit;
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/types-CcVUDIXB.js
var types_CcVUDIXB_exports = /* @__PURE__ */ __exportAll({
	A: () => serialsForWorkOrder,
	B: () => isPastDate,
	C: () => fieldHint,
	D: () => parseBuildReportGrid,
	E: () => isLookupWorkbook,
	F: () => addCalendarDays,
	G: () => snapToWeekday,
	H: () => nowStamp,
	I: () => formatShopDate,
	J: () => getPglite,
	K: () => todayIso,
	L: () => formatShopWeekday,
	M: () => SHEET_SPECS,
	N: () => detectSheetKey,
	O: () => parseLookupSheets,
	P: () => recordsForSheet,
	R: () => formatStamp,
	S: () => componentKind,
	T: () => isBuildReportGrid,
	U: () => parseFlexibleDate,
	V: () => nextWeekday,
	W: () => parseFlexibleStamp,
	Y: () => getSql,
	_: () => floorToSheets,
	a: () => TASK_STATUSES,
	b: () => build_lookup_exports,
	c: () => UNIT_STATUSES,
	d: () => WO_STATUS_LABELS,
	f: () => WO_STATUS_OPTIONS,
	g: () => createSsrRpc,
	h: () => unlockFloor,
	i: () => SO_STATUSES,
	j: () => SCHEMA_DOC,
	k: () => requiredKeysForPart,
	l: () => UNIT_STATUS_OPTIONS,
	m: () => pinStatus,
	n: () => BUILDER_OPTIONS,
	o: () => TASK_STATUS_OPTIONS,
	p: () => pinMiddleware,
	q: () => ensureDbReady,
	r: () => QT_CAUSES,
	s: () => TICKET_STATUSES,
	t: () => BUILDERS,
	u: () => WO_STATUSES,
	v: () => zipFromFloor,
	w: () => fieldPlaceholder,
	x: () => componentKey,
	y: () => readXlsx,
	z: () => hoursToDays
});
var _0001_auth_default = "-- Better Auth schema (identity + sessions for \"Sign in with Grok\").\n--\n-- Generated by the Better Auth CLI for its Postgres adapter — DO NOT EDIT by\n-- hand. `@/lib/auth/server` runs Better Auth against these tables when\n-- DATABASE_URL is set. The columns are camelCase and MUST stay double-quoted so\n-- Postgres preserves the case Better Auth queries by.\n--\n-- Migrations in this folder are the single source of truth for your schema. They\n-- apply to Neon during the Vercel build (`npm run build`) and to the local\n-- PGLite fallback automatically on startup, so dev matches production. Applied\n-- files are recorded by name in `_migrations` and NEVER run again.\n--\n-- Put YOUR app's schema in NEW ordered files (0002_*.sql, 0003_*.sql, …), never\n-- in this one. For app tables, prefer snake_case and give per-user tables a\n-- `user_id TEXT NOT NULL` column (TEXT, not UUID — the preview dev user id is\n-- the string 'dev-user'), then scope every query to the authenticated user\n-- server-side (see the `neon` + `auth` skills and src/lib/auth/verify.server.ts).\n\ncreate table if not exists \"user\" (\n  \"id\" text not null primary key,\n  \"name\" text not null,\n  \"email\" text not null unique,\n  \"emailVerified\" boolean not null,\n  \"image\" text,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz default CURRENT_TIMESTAMP not null\n);\n\ncreate table if not exists \"session\" (\n  \"id\" text not null primary key,\n  \"expiresAt\" timestamptz not null,\n  \"token\" text not null unique,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz not null,\n  \"ipAddress\" text,\n  \"userAgent\" text,\n  \"userId\" text not null references \"user\" (\"id\") on delete cascade\n);\n\ncreate table if not exists \"account\" (\n  \"id\" text not null primary key,\n  \"accountId\" text not null,\n  \"providerId\" text not null,\n  \"userId\" text not null references \"user\" (\"id\") on delete cascade,\n  \"accessToken\" text,\n  \"refreshToken\" text,\n  \"idToken\" text,\n  \"accessTokenExpiresAt\" timestamptz,\n  \"refreshTokenExpiresAt\" timestamptz,\n  \"scope\" text,\n  \"password\" text,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz not null\n);\n\ncreate table if not exists \"verification\" (\n  \"id\" text not null primary key,\n  \"identifier\" text not null,\n  \"value\" text not null,\n  \"expiresAt\" timestamptz not null,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz default CURRENT_TIMESTAMP not null\n);\n\ncreate index if not exists \"session_userId_idx\" on \"session\" (\"userId\");\ncreate index if not exists \"account_userId_idx\" on \"account\" (\"userId\");\ncreate index if not exists \"verification_identifier_idx\" on \"verification\" (\"identifier\");\n";
var _0002_floor_default = "-- Floor — A&P Chambers production board (unowned shared rows)\n\ncreate table if not exists parts (\n  part_number text primary key,\n  name text not null default '',\n  logger text not null default '',\n  type text not null default '',\n  counts text not null default '',\n  directional boolean not null default false,\n  build_time_hours double precision not null default 0,\n  notes text not null default '',\n  active boolean not null default true\n);\n\ncreate table if not exists work_orders (\n  wo_number text primary key,\n  part text not null default '',\n  qty integer not null default 1,\n  status text not null default 'pending',\n  date_added date not null default current_date,\n  date_started date,\n  date_closed date,\n  assigned_build text not null default '',\n  built_in_sage boolean not null default false,\n  notes_to_production text not null default '',\n  customer_need_date date\n);\n\ncreate table if not exists units (\n  id serial primary key,\n  work_order_number text not null references work_orders (wo_number) on delete cascade,\n  unit_id text not null unique,\n  serial_or_id text not null default '',\n  status text not null default 'in build',\n  sales_order_number text,\n  despatch_date date,\n  notes jsonb not null default '[]'::jsonb\n);\n\ncreate index if not exists units_wo_idx on units (work_order_number);\ncreate index if not exists units_so_idx on units (sales_order_number);\n\ncreate table if not exists quality_tickets (\n  ticket_number text primary key,\n  work_order_number text not null references work_orders (wo_number),\n  unit_id text,\n  part text not null default '',\n  title text not null default '',\n  problem text not null default '',\n  status text not null default 'open',\n  date_opened date not null default current_date,\n  date_closed date,\n  assigned_to text not null default '',\n  notes jsonb not null default '[]'::jsonb\n);\n\ncreate index if not exists qt_wo_idx on quality_tickets (work_order_number);\n\ncreate table if not exists build_order (\n  wo_number text primary key references work_orders (wo_number) on delete cascade,\n  position integer not null\n);\n\ncreate index if not exists build_order_position_idx on build_order (position);\n\ncreate table if not exists sales_orders (\n  so_number text primary key,\n  company text not null default '',\n  order_date date,\n  lead_time_weeks double precision,\n  target_despatch date,\n  target_despatch_is_override boolean not null default false,\n  status text not null default 'open',\n  sage_id text not null default ''\n);\n\ncreate table if not exists sales_lines (\n  id serial primary key,\n  so_number text not null references sales_orders (so_number) on delete cascade,\n  part text not null default '',\n  qty integer not null default 1,\n  work_order_number text not null default ''\n);\n\ncreate index if not exists sales_lines_so_idx on sales_lines (so_number);\ncreate index if not exists sales_lines_wo_idx on sales_lines (work_order_number);\n\n-- Shop data is loaded from Floor → Load data. No demo rows.";
var _0003_sales_notes_history_default = "-- Notes from Sales (plain column) + Hardware History (append-only stamped log)\n\nalter table work_orders\n  add column if not exists notes_from_sales text not null default '';\n\nalter table work_orders\n  add column if not exists hardware_history jsonb not null default '[]'::jsonb;\n";
var _0004_despatch_default = "-- Exact WO entered at despatch is separate from the planned WO on the sales line.\n\nalter table sales_lines\n  add column if not exists despatch_wo_number text not null default '';\n\nalter table sales_lines\n  add column if not exists despatch_date date;\n";
var _0005_so_despatch_date_default = "alter table sales_orders\n  add column if not exists despatch_date date;\n";
var _0006_qt_causes_default = "alter table quality_tickets\n  add column if not exists causes jsonb not null default '[]'::jsonb;\n";
var _0007_qt_further_action_default = "alter table quality_tickets\n  add column if not exists further_action boolean not null default false;\n";
var _0008_wo_build_hours_default = "alter table work_orders\n  add column if not exists build_time_hours double precision;\n";
var _0009_qt_optional_wo_default = "alter table quality_tickets\n  alter column work_order_number drop not null;\n";
var _0010_clear_demo_default = "-- Wipe demo / seed rows. Shop loads its own data from Floor → Load data.\ndelete from quality_tickets;\ndelete from units;\ndelete from sales_lines;\ndelete from build_order;\ndelete from sales_orders;\ndelete from work_orders;\ndelete from parts;\n";
var _0011_person_queues_default = "-- Per-person build queues (Simon / David / …) plus free-form tasks.\n\ncreate table if not exists build_tasks (\n  id serial primary key,\n  title text not null default '',\n  assigned_build text not null default 'Simon',\n  hours double precision not null default 0,\n  status text not null default 'pending',\n  date_started date\n);\n\ncreate table if not exists build_queue (\n  id serial primary key,\n  assigned_build text not null default 'Simon',\n  position integer not null default 0,\n  kind text not null,\n  wo_number text references work_orders (wo_number) on delete cascade,\n  task_id integer references build_tasks (id) on delete cascade\n);\n\ncreate index if not exists build_queue_who_pos on build_queue (assigned_build, position);\ncreate unique index if not exists build_queue_wo_uidx on build_queue (wo_number) where wo_number is not null;\n\ninsert into build_queue (assigned_build, position, kind, wo_number)\nselect\n  case\n    when coalesce(nullif(w.assigned_build, ''), '') = '' then 'Unassigned'\n    else w.assigned_build\n  end,\n  row_number() over (\n    partition by case\n      when coalesce(nullif(w.assigned_build, ''), '') = '' then 'Unassigned'\n      else w.assigned_build\n    end\n    order by b.position, w.wo_number\n  ) - 1,\n  'wo',\n  b.wo_number\nfrom build_order b\njoin work_orders w on w.wo_number = b.wo_number\nwhere not exists (\n  select 1 from build_queue q where q.wo_number = b.wo_number\n);\n";
var _0012_sage_and_tasks_default = "-- Weekly Sage pack list (replaced on each upload) + TSK numbers / finish date on tasks.\n\ncreate table if not exists sage_pack_lines (\n  id serial primary key,\n  so_number text not null,\n  company text not null default '',\n  order_date date,\n  part text not null default '',\n  description text not null default '',\n  comment text not null default '',\n  qty integer not null default 0,\n  qty_despatched integer not null default 0,\n  notes text not null default ''\n);\n\ncreate index if not exists sage_pack_so_idx on sage_pack_lines (so_number);\n\ncreate table if not exists sage_pack_meta (\n  id integer primary key check (id = 1),\n  uploaded_at timestamptz not null default now(),\n  filename text not null default '',\n  row_count integer not null default 0\n);\n\nalter table build_tasks\n  add column if not exists task_number text;\n\nalter table build_tasks\n  add column if not exists date_finished date;\n\nupdate build_tasks\nset task_number = 'TSK-' || id::text\nwhere task_number is null or task_number = '';\n\ncreate unique index if not exists build_tasks_number_uidx\n  on build_tasks (task_number)\n  where task_number is not null and task_number <> '';\n";
var _0013_problem_tickets_default = "-- Customer problem tickets from Prospect, plus API settings.\n\ncreate table if not exists floor_settings (\n  id integer primary key check (id = 1),\n  prospect_base_url text not null default '',\n  prospect_api_key text not null default ''\n);\n\ninsert into floor_settings (id, prospect_base_url, prospect_api_key)\nvalues (1, '', '')\non conflict (id) do nothing;\n\ncreate table if not exists problem_tickets (\n  id serial primary key,\n  prospect_number text not null,\n  title text not null default '',\n  assigned_build text not null default '',\n  hours double precision not null default 0,\n  status text not null default 'pending',\n  date_started date,\n  date_finished date,\n  notes text not null default ''\n);\n\ncreate unique index if not exists problem_tickets_prospect_uidx\n  on problem_tickets (prospect_number);\n\nalter table build_queue\n  add column if not exists problem_id integer references problem_tickets (id) on delete cascade;\n\ncreate unique index if not exists build_queue_pt_uidx\n  on build_queue (problem_id)\n  where problem_id is not null;\n";
var _0014_pt_prospect_status_default = "-- Prospect CRM workflow status on problem tickets.\n\nalter table problem_tickets\n  add column if not exists prospect_status text not null default '';\n\nalter table problem_tickets\n  add column if not exists prospect_status_id text not null default '';\n";
var _0015_sales_production_notes_default = "alter table sales_orders\n  add column if not exists sales_notes jsonb not null default '[]'::jsonb;\n\nalter table work_orders\n  add column if not exists production_notes jsonb not null default '[]'::jsonb;\n";
var _0016_assigned_next_default = "alter table work_orders\n  add column if not exists assigned_next text not null default '';\n";
var _0017_queue_wo_per_person_default = "drop index if exists build_queue_wo_uidx;\n\ncreate unique index if not exists build_queue_who_wo_uidx\n  on build_queue (assigned_build, wo_number)\n  where wo_number is not null;\n";
var _0018_notes_sage_hold_default = "-- Problem tickets: notes to production (same shape as work orders).\nalter table problem_tickets\n  add column if not exists notes_to_production jsonb not null default '[]'::jsonb;\n\n-- Tasks: build-order notes (multi-line, like work orders).\nalter table build_tasks\n  add column if not exists build_order_notes text not null default '';\n\n-- Sage SalesOrder.NotesLine1, refreshed on each SOPOUT upload.\nalter table sales_orders\n  add column if not exists notes_line1 text not null default '';\n\n-- Wire the shop Prospect PAT when none is saved yet.\nupdate floor_settings\nset prospect_api_key = '0a628785fd7c21c8629d31ca04302600'\nwhere id = 1\n  and trim(coalesce(prospect_api_key, '')) = '';\n";
var _0019_pt_customer_default = "-- Customer / company name from Prospect (Division.Name).\n\nalter table problem_tickets\n  add column if not exists customer text not null default '';\n";
var _0020_build_components_default = "-- Product × component lookup (from Build_Component_Lookup.xlsx)\n-- and per-WO / per-serial build records.\n\ncreate table if not exists build_components (\n  component_key text primary key,\n  label text not null,\n  kind text not null default 'subassembly',\n  position integer not null default 0\n);\n\ncreate table if not exists build_batteries (\n  code text primary key,\n  position integer not null default 0\n);\n\ncreate table if not exists build_component_map (\n  part_number text not null,\n  component_key text not null references build_components (component_key) on delete cascade,\n  primary key (part_number, component_key)\n);\n\ncreate table if not exists wo_build_records (\n  id serial primary key,\n  wo_number text not null,\n  serial text not null default '1',\n  revision text not null default '',\n  battery text not null default '',\n  notes text not null default '',\n  unique (wo_number, serial)\n);\n\ncreate table if not exists wo_build_values (\n  record_id integer not null references wo_build_records (id) on delete cascade,\n  component_key text not null,\n  value text not null default '',\n  primary key (record_id, component_key)\n);\n\ncreate index if not exists wo_build_records_wo_idx on wo_build_records (wo_number);\n";
var _0021_consumed_wos_default = "-- Per-serial list of work orders consumed into a build.\n-- Also drop any stored Prospect API key — CE Master no longer calls Prospect.\n\nalter table wo_build_records\n  add column if not exists consumed jsonb not null default '[]'::jsonb;\n\nupdate floor_settings\n  set prospect_api_key = ''\n  where coalesce(prospect_api_key, '') <> '';\n";
var _0022_pt_job_fields_default = "-- Problem tickets: the same shop fields as a work order, plus consumed WOs.\n\nalter table problem_tickets\n  add column if not exists part text not null default '';\n\nalter table problem_tickets\n  add column if not exists assigned_next text not null default '';\n\nalter table problem_tickets\n  add column if not exists date_added date;\n\nupdate problem_tickets\nset date_added = coalesce(date_started, current_date)\nwhere date_added is null;\n\nalter table problem_tickets\n  alter column date_added set default current_date;\n\nalter table problem_tickets\n  alter column date_added set not null;\n\nalter table problem_tickets\n  add column if not exists consumed jsonb not null default '[]'::jsonb;\n\ndrop index if exists build_queue_pt_uidx;\n\ncreate unique index if not exists build_queue_who_pt_uidx\n  on build_queue (assigned_build, problem_id)\n  where problem_id is not null;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.n);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_auth.sql": _0001_auth_default,
			"/migrations/0002_floor.sql": _0002_floor_default,
			"/migrations/0003_sales_notes_history.sql": _0003_sales_notes_history_default,
			"/migrations/0004_despatch.sql": _0004_despatch_default,
			"/migrations/0005_so_despatch_date.sql": _0005_so_despatch_date_default,
			"/migrations/0006_qt_causes.sql": _0006_qt_causes_default,
			"/migrations/0007_qt_further_action.sql": _0007_qt_further_action_default,
			"/migrations/0008_wo_build_hours.sql": _0008_wo_build_hours_default,
			"/migrations/0009_qt_optional_wo.sql": _0009_qt_optional_wo_default,
			"/migrations/0010_clear_demo.sql": _0010_clear_demo_default,
			"/migrations/0011_person_queues.sql": _0011_person_queues_default,
			"/migrations/0012_sage_and_tasks.sql": _0012_sage_and_tasks_default,
			"/migrations/0013_problem_tickets.sql": _0013_problem_tickets_default,
			"/migrations/0014_pt_prospect_status.sql": _0014_pt_prospect_status_default,
			"/migrations/0015_sales_production_notes.sql": _0015_sales_production_notes_default,
			"/migrations/0016_assigned_next.sql": _0016_assigned_next_default,
			"/migrations/0017_queue_wo_per_person.sql": _0017_queue_wo_per_person_default,
			"/migrations/0018_notes_sage_hold.sql": _0018_notes_sage_hold_default,
			"/migrations/0019_pt_customer.sql": _0019_pt_customer_default,
			"/migrations/0020_build_components.sql": _0020_build_components_default,
			"/migrations/0021_consumed_wos.sql": _0021_consumed_wos_default,
			"/migrations/0022_pt_job_fields.sql": _0022_pt_job_fields_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* The shared PGLite instance (preview only), with `migrations/*.sql` applied.
* Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
* Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
*/
async function getPglite() {
	if (dbSource !== "pglite") throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
	await getSql();
	const pg = await globalRef.__pgliteInstance__;
	if (!pg) throw new Error("PGLite instance failed to initialize");
	return pg;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var LONDON = "Europe/London";
/** Calendar date in Europe/London as YYYY-MM-DD. */
function todayIso(now = /* @__PURE__ */ new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: LONDON,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(now);
}
/** Shop timestamp in Europe/London as YYYY-MM-DDTHH:mm. */
function nowStamp(now = /* @__PURE__ */ new Date()) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: LONDON,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(now);
	const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
function parseIso(iso) {
	const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
	return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}
function formatIso(date) {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function addCalendarDays(iso, days) {
	const date = parseIso(iso);
	date.setUTCDate(date.getUTCDate() + days);
	return formatIso(date);
}
function weekdayUtc(iso) {
	return parseIso(iso).getUTCDay();
}
function isWeekend(iso) {
	const day = weekdayUtc(iso);
	return day === 0 || day === 6;
}
function snapToWeekday(iso) {
	let cursor = iso.slice(0, 10);
	while (isWeekend(cursor)) cursor = addCalendarDays(cursor, 1);
	return cursor;
}
function nextWeekday(iso) {
	return snapToWeekday(addCalendarDays(iso.slice(0, 10), 1));
}
/** Short UK shop date: 5 Sep 2026 */
function formatShopDate(iso) {
	if (!iso) return "";
	const date = parseIso(iso);
	return `${date.getUTCDate()} ${[
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
var WEEKDAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
/** Monday 31 Aug 2026 */
function formatShopWeekday(iso) {
	if (!iso) return "";
	const date = formatShopDate(iso);
	if (!date) return "";
	return `${WEEKDAYS[weekdayUtc(iso)]} ${date}`;
}
/** Shop date, plus time when the stamp includes it: 29 Aug 2026, 15:04 */
function formatStamp(iso) {
	if (!iso) return "";
	const date = formatShopDate(iso.slice(0, 10));
	if (iso.length < 16 || iso[10] !== "T") return date;
	return `${date}, ${iso.slice(11, 16)}`;
}
function isPastDate(iso, today) {
	if (!iso) return false;
	return iso.slice(0, 10) < today.slice(0, 10);
}
function hoursToDays(hours) {
	if (!Number.isFinite(hours) || hours === 0) return "0";
	const days = hours / 8;
	const rounded = Math.round(days * 1e3) / 1e3;
	return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
/** Accept YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or 21 Aug 2026. */
function parseFlexibleDate(value) {
	if (value == null) return null;
	const raw = String(value).trim();
	if (!raw) return null;
	const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	const uk = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
	if (uk) {
		const d = uk[1].padStart(2, "0");
		const m = uk[2].padStart(2, "0");
		return `${uk[3]}-${m}-${d}`;
	}
	const named = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
	if (named) {
		const mi = [
			"jan",
			"feb",
			"mar",
			"apr",
			"may",
			"jun",
			"jul",
			"aug",
			"sep",
			"oct",
			"nov",
			"dec"
		].indexOf(named[2].slice(0, 3).toLowerCase());
		if (mi >= 0) return `${named[3]}-${String(mi + 1).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
	}
	const serial = Number(raw);
	if (Number.isFinite(serial) && serial > 2e4 && serial < 8e4) {
		const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 864e5;
		return formatIso(new Date(utc));
	}
	return null;
}
/** Date plus optional time → YYYY-MM-DDTHH:mm */
function parseFlexibleStamp(value) {
	if (value == null) return null;
	const raw = String(value).trim();
	if (!raw) return null;
	const tIso = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}):(\d{2})/);
	if (tIso) return `${tIso[1]}T${tIso[2].padStart(2, "0")}:${tIso[3]}`;
	const tUk = raw.match(/^(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})\s+(\d{1,2}):(\d{2})/);
	if (tUk) {
		const day = parseFlexibleDate(tUk[1]);
		if (day) return `${day}T${tUk[2].padStart(2, "0")}:${tUk[3]}`;
	}
	const named = raw.match(/^(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}),?\s+(\d{1,2}):(\d{2})/);
	if (named) {
		const day = parseFlexibleDate(named[1]);
		if (day) return `${day}T${named[2].padStart(2, "0")}:${named[3]}`;
	}
	return parseFlexibleDate(raw);
}
var SHEET_SPECS = [
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
			"active"
		],
		help: "Catalogue. directional and active: yes/no. Hours only — days are hours÷8 in the app.",
		examples: [
			[
				"ASSY.TX100",
				"TX100 assembly",
				"TX100",
				"assembly",
				"",
				"no",
				"0.4",
				"",
				"yes"
			],
			[
				"RBPB-N-B",
				"Remote button PCB N-B",
				"",
				"pcb",
				"",
				"yes",
				"8",
				"North-bound legend",
				"yes"
			],
			[
				"LEADSET-103-M",
				"Lead set 103 moulded",
				"",
				"leadset",
				"",
				"no",
				"0.2",
				"",
				"yes"
			]
		]
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
			"notes_from_sales"
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
				""
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
				""
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
				"Fire Security ×3 and Outdoor Access ×2 on this batch."
			]
		]
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
			"despatch_date"
		],
		help: "Only if you already have serials. unit_id like 508-1. status: in build / on shelf / shipped. Leave this sheet empty if you do not track units yet.",
		examples: [[
			"508",
			"508-1",
			"",
			"in build",
			"3359",
			""
		]]
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
			"date_opened"
		],
		help: "WO is optional. Leave ticket_number blank to auto-number QT-1, QT-2… status: open / closed. part can differ from the WO. further_action: yes/no. causes: semicolon-separated (TBD; component failure; design work needed; build error; missing parts; documentation).",
		examples: [[
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
			"2026-08-21"
		]]
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
			"notes_line1"
		],
		help: "status: open / waiting_on_customer / despatched / cancelled. order_date: YYYY-MM-DD, DD/MM/YYYY, or Excel date. Target despatch can be left blank — Floor fills it from order date + lead weeks. Do not put parts here — parts go on sales_lines, one row per part.",
		examples: [
			[
				"3359",
				"Fire Security Team",
				"2026-08-04",
				"4",
				"2026-09-01",
				"open",
				""
			],
			[
				"3367",
				"Outdoor Access Trust",
				"2026-08-11",
				"3",
				"2026-09-01",
				"open",
				""
			],
			[
				"3401",
				"Natural England",
				"2026-08-14",
				"6",
				"2026-09-25",
				"waiting_on_customer",
				""
			]
		]
	},
	{
		key: "sales_lines",
		title: "sales_lines",
		columns: [
			"so_number",
			"part",
			"qty",
			"work_order_number"
		],
		help: "One row per part. Repeat the so_number. work_order_number is the planned WO (blank = No WO). You may also put order_date and company on this sheet — they write the sales order header.",
		examples: [
			[
				"3359",
				"LEADSET-103-M",
				"3",
				"508"
			],
			[
				"3359",
				"RBPB-N-B",
				"1",
				""
			],
			[
				"3367",
				"LEADSET-103-M",
				"2",
				"508"
			],
			[
				"3401",
				"RBPB-N-B",
				"1",
				""
			]
		]
	},
	{
		key: "hardware_history",
		title: "hardware_history",
		columns: [
			"wo_number",
			"date",
			"author",
			"text"
		],
		help: "Append-only log. date as 2026-08-21 09:15 or 21/08/2026 09:15. Duplicate lines (same date+author+text) are skipped.",
		examples: [[
			"1694",
			"2026-08-21 09:15",
			"David",
			"Returned board received. Silk legend reversed — holding for QT-1."
		]]
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
			["5", "508"]
		]
	},
	{
		key: "build_tasks",
		title: "build_tasks",
		columns: [
			"id",
			"title",
			"assigned_build",
			"hours",
			"status",
			"build_order_notes"
		],
		help: "Extra bench tasks (mow the lawn, etc.). assigned_build: Simon or David. hours feed that person's schedule. status: pending / active / on_hold / done. A started (active) task keeps its start date.",
		examples: [[
			"",
			"Mow the lawn",
			"Simon",
			"2",
			"pending"
		], [
			"",
			"Goods in",
			"David",
			"1",
			"pending"
		]]
	}
];
function detectSheetKey(name, headers) {
	const n = name.toLowerCase().replace(/[\s-]+/g, "_");
	if (n.includes("readme") || n === "instructions") return "readme";
	for (const spec of SHEET_SPECS) if (n === spec.key || n.includes(spec.key) || n === spec.title) return spec.key;
	const h = new Set(headers.map(canonicalHeader));
	if (h.has("build_time_hours") || h.has("part_number") && h.has("logger")) return "parts";
	if (h.has("notes_from_sales") || h.has("customer_need_date") || h.has("notes_to_production")) return "work_orders";
	if (h.has("serial_or_id") || h.has("unit_id") && h.has("work_order_number") && !h.has("ticket_number")) {
		if (!(h.has("part_number") || h.has("part")) || h.has("unit_id")) return "units";
	}
	if (h.has("ticket_number") || h.has("problem")) return "quality_tickets";
	if (h.has("company") || h.has("lead_time_weeks")) return "sales_orders";
	if (h.has("author") && h.has("text")) return "hardware_history";
	if (h.has("position") && (h.has("wo_number") || h.has("work_order_number"))) return "build_order";
	if (h.has("so_number") && h.has("qty") && (h.has("part") || h.has("part_number"))) return "sales_lines";
	return null;
}
function recordsForSheet(grid) {
	return recordsFromGrid(grid);
}
/** Live dump of what Floor stores. CSVs use the same names unless noted. */
var SCHEMA_DOC = `CE Master database — A&P Chambers
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
function crcTable$1() {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
}
var CRC$1 = crcTable$1();
function crc32$1(data) {
	let c = 4294967295;
	for (let i = 0; i < data.length; i += 1) c = CRC$1[(c ^ data[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function u16$1(n) {
	const b = /* @__PURE__ */ new Uint8Array(2);
	new DataView(b.buffer).setUint16(0, n, true);
	return b;
}
function u32$1(n) {
	const b = /* @__PURE__ */ new Uint8Array(4);
	new DataView(b.buffer).setUint32(0, n, true);
	return b;
}
function concat$1(parts) {
	const len = parts.reduce((s, p) => s + p.length, 0);
	const out = new Uint8Array(len);
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}
/** Uncompressed ZIP (Excel accepts stored files). Safe in the browser. */
function zipStore$1(files) {
	const locals = [];
	const centrals = [];
	let offset = 0;
	const enc = new TextEncoder();
	for (const file of files) {
		const name = enc.encode(file.name);
		const crc = crc32$1(file.data);
		const local = concat$1([
			u32$1(67324752),
			u16$1(20),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u32$1(crc),
			u32$1(file.data.length),
			u32$1(file.data.length),
			u16$1(name.length),
			u16$1(0),
			name,
			file.data
		]);
		locals.push(local);
		const central = concat$1([
			u32$1(33639248),
			u16$1(20),
			u16$1(20),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u32$1(crc),
			u32$1(file.data.length),
			u32$1(file.data.length),
			u16$1(name.length),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u16$1(0),
			u32$1(0),
			u32$1(offset),
			name
		]);
		centrals.push(central);
		offset += local.length;
	}
	const centralDir = concat$1(centrals);
	const eocd = concat$1([
		u32$1(101010256),
		u16$1(0),
		u16$1(0),
		u16$1(files.length),
		u16$1(files.length),
		u32$1(centralDir.length),
		u32$1(offset),
		u16$1(0)
	]);
	return concat$1([
		...locals,
		centralDir,
		eocd
	]);
}
var build_lookup_exports = /* @__PURE__ */ __exportAll$1({
	buildRecordsToGrid: () => buildRecordsToGrid,
	componentKey: () => componentKey,
	componentKind: () => componentKind,
	fieldHint: () => fieldHint,
	fieldPlaceholder: () => fieldPlaceholder,
	isBuildReportGrid: () => isBuildReportGrid,
	isLookupWorkbook: () => isLookupWorkbook,
	isMarked: () => isMarked,
	lookupToGrid: () => lookupToGrid,
	parseBuildReportGrid: () => parseBuildReportGrid,
	parseLookupSheets: () => parseLookupSheets,
	requiredKeysForPart: () => requiredKeysForPart,
	serialsForWorkOrder: () => serialsForWorkOrder
});
var META_HEADERS = /* @__PURE__ */ new Set([
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
	"notes"
]);
function componentKind(label) {
	if (/pcb/i.test(label)) return "pcb";
	if (/b[ep]\./i.test(label) || /^battery\b/i.test(label)) return "battery";
	return "subassembly";
}
/** Stable id so "No 10018-02" and "NO10018-02" / "ANT1 (A)" and "ANT1(A)" match. */
function componentKey(label) {
	return label.trim().toUpperCase().replace(/\bNO\.?\s*(?=\d)/g, "NO").replace(/[^\w.()+-]+/g, "").replace(/_+/g, "_").replace(/^_|_$/g, "");
}
function isMarked(value) {
	const v = value.trim().toLowerCase();
	return v === "x" || v === "yes" || v === "y" || v === "1" || v === "true";
}
function looksLikeLookupHeaders(headers) {
	const head = headers.map((h) => h.trim().toLowerCase());
	return head[0] === "product" && head.some((h) => /pcb|assy|antenna|coil|lora/i.test(h));
}
function isLookupWorkbook(name, sheets) {
	const file = name.toLowerCase().replace(/[\s-]+/g, "_");
	if (file.includes("component_lookup") || file.includes("build_component")) return true;
	if (sheets.some((s) => /battery/i.test(s.name) && looksLikeLookupHeaders(sheets[0]?.rows[0] ?? []))) return true;
	if (sheets.some((s) => looksLikeLookupHeaders(s.rows[0] ?? []))) return true;
	return looksLikeLookupHeaders(sheets[0]?.rows[0] ?? []);
}
function isBuildReportGrid(headers) {
	const h = new Set(headers.map((x) => canonicalHeader(x)));
	const wo = h.has("wo_number") || h.has("work_order") || h.has("wo");
	const serial = h.has("serial") || h.has("serial_or_id");
	const part = h.has("part_number") || h.has("part");
	if (!wo || !serial || !part) return false;
	if (h.has("unit_id") && !h.has("revision") && !h.has("build_revision") && !h.has("battery_type")) return false;
	return true;
}
function parseLookupSheets(sheets) {
	const batterySheet = sheets.find((s) => /battery/i.test(s.name));
	const batteries = [];
	if (batterySheet) for (const row of batterySheet.rows.slice(1)) {
		const code = (row[0] ?? "").trim();
		if (code && !/^battery/i.test(code)) batteries.push(code);
	}
	const main = sheets.find((s) => looksLikeLookupHeaders(s.rows[0] ?? [])) ?? sheets.find((s) => (s.rows[0]?.[0] ?? "").trim().toLowerCase() === "product") ?? sheets[0];
	const headers = main?.rows[0] ?? [];
	const components = [];
	const seen = /* @__PURE__ */ new Set();
	for (let i = 1; i < headers.length; i += 1) {
		const label = (headers[i] ?? "").replace(/\s+/g, " ").trim();
		if (!label) continue;
		const key = componentKey(label);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		components.push({
			key,
			label,
			kind: componentKind(label),
			position: i
		});
	}
	const map = {};
	for (const row of main?.rows.slice(1) ?? []) {
		const part = (row[0] ?? "").trim();
		if (!part) continue;
		const keys = [];
		for (let i = 1; i < headers.length; i += 1) {
			const label = (headers[i] ?? "").replace(/\s+/g, " ").trim();
			if (!label) continue;
			if (isMarked(row[i] ?? "")) keys.push(componentKey(label));
		}
		map[part] = keys;
	}
	return {
		components,
		batteries,
		map
	};
}
function headerField(header) {
	const n = canonicalHeader(header);
	if (n === "work_order" || n === "wo") return "wo_number";
	if (n === "part") return "part_number";
	if (n === "serial" || n === "serial_or_id") return "serial";
	if (n === "revision" || n === "build_revision") return "revision";
	if (n === "battery" || n === "battery_type") return "battery";
	if (n === "non_conformity_notes" || n === "notes" || n === "nonconformitynotes") return "notes";
	return n;
}
function cleanCell(value) {
	const t = value.trim();
	if (/^\d+\.0+$/.test(t)) return t.replace(/\.0+$/, "");
	return t;
}
function parseBuildReportGrid(grid) {
	if (grid.length < 2) return [];
	const headers = grid[0] ?? [];
	const out = [];
	for (const row of grid.slice(1)) {
		let woNumber = "";
		let serial = "";
		let part = "";
		let revision = "";
		let battery = "";
		let notes = "";
		const values = [];
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
				if (v) values.push({
					key: componentKey(raw),
					label: raw.replace(/\s+/g, " ").trim(),
					value: v
				});
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
			values
		});
	}
	return out;
}
function requiredKeysForPart(map, part) {
	if (map[part]) return map[part];
	const needle = part.trim().toLowerCase();
	for (const [k, v] of Object.entries(map)) if (k.trim().toLowerCase() === needle) return v;
	return [];
}
function serialsForWorkOrder(qty, existing, unitSerials) {
	const set = /* @__PURE__ */ new Set();
	const n = Math.max(1, Math.trunc(qty) || 1);
	for (let i = 1; i <= n; i += 1) set.add(String(i));
	for (const s of existing) if (s.trim()) set.add(s.trim());
	for (const s of unitSerials) if (s.trim()) set.add(s.trim());
	return [...set].sort((a, b) => {
		const na = Number.parseInt(a, 10);
		const nb = Number.parseInt(b, 10);
		if (Number.isFinite(na) && Number.isFinite(nb) && String(na) === a && String(nb) === b) return na - nb;
		return a.localeCompare(b, void 0, { numeric: true });
	});
}
function fieldPlaceholder(kind) {
	if (kind === "pcb") return "PCB serial / lot";
	if (kind === "battery") return "Battery";
	return "WO number or part";
}
function fieldHint(kind) {
	if (kind === "pcb") return "serial";
	if (kind === "battery") return "type";
	return "WO or part";
}
function lookupToGrid(spec) {
	const headers = ["Product", ...spec.components.map((c) => c.label)];
	const parts = Object.keys(spec.map).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
	const rows = [headers];
	for (const part of parts) {
		const keys = new Set(spec.map[part] ?? []);
		rows.push([part, ...spec.components.map((c) => keys.has(c.key) ? "X" : "")]);
	}
	return [{
		name: "Sheet1",
		rows
	}, {
		name: "BatteryList",
		rows: [["Battery List"], ...spec.batteries.map((b) => [b])]
	}];
}
function buildRecordsToGrid(records, components, partOf) {
	const extraKeys = [];
	const known = new Set(components.map((c) => c.key));
	for (const rec of records) for (const key of Object.keys(rec.values)) if (!known.has(key) && rec.values[key]?.trim() && !extraKeys.includes(key)) extraKeys.push(key);
	const cols = [...components.map((c) => ({
		key: c.key,
		label: c.label
	})), ...extraKeys.map((key) => ({
		key,
		label: key
	}))];
	const rows = [[
		"WORK ORDER",
		"SERIAL",
		"PART NUMBER",
		"BUILD REVISION",
		...cols.map((c) => c.label),
		"BATTERY TYPE",
		"NON CONFORMITY NOTES"
	]];
	const sorted = [...records].sort((a, b) => {
		const w = a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true });
		if (w) return w;
		return a.serial.localeCompare(b.serial, void 0, { numeric: true });
	});
	for (const rec of sorted) rows.push([
		rec.woNumber,
		rec.serial,
		partOf(rec.woNumber),
		rec.revision,
		...cols.map((c) => rec.values[c.key] ?? ""),
		rec.battery,
		rec.notes
	]);
	return rows;
}
function crcTable() {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
}
var CRC = crcTable();
function crc32(data) {
	let c = 4294967295;
	for (let i = 0; i < data.length; i += 1) c = CRC[(c ^ data[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function u16(n) {
	const b = /* @__PURE__ */ new Uint8Array(2);
	new DataView(b.buffer).setUint16(0, n, true);
	return b;
}
function u32(n) {
	const b = /* @__PURE__ */ new Uint8Array(4);
	new DataView(b.buffer).setUint32(0, n, true);
	return b;
}
function concat(parts) {
	const len = parts.reduce((s, p) => s + p.length, 0);
	const out = new Uint8Array(len);
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}
/** Uncompressed ZIP (Excel accepts stored files). */
function zipStore(files) {
	const locals = [];
	const centrals = [];
	let offset = 0;
	const enc = new TextEncoder();
	for (const file of files) {
		const name = enc.encode(file.name);
		const crc = crc32(file.data);
		const local = concat([
			u32(67324752),
			u16(20),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(crc),
			u32(file.data.length),
			u32(file.data.length),
			u16(name.length),
			u16(0),
			name,
			file.data
		]);
		locals.push(local);
		const central = concat([
			u32(33639248),
			u16(20),
			u16(20),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(crc),
			u32(file.data.length),
			u32(file.data.length),
			u16(name.length),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(0),
			u32(offset),
			name
		]);
		centrals.push(central);
		offset += local.length;
	}
	const centralDir = concat(centrals);
	const eocd = concat([
		u32(101010256),
		u16(0),
		u16(0),
		u16(files.length),
		u16(files.length),
		u32(centralDir.length),
		u32(offset),
		u16(0)
	]);
	return concat([
		...locals,
		centralDir,
		eocd
	]);
}
function readU32(buf, i) {
	return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint32(i, true);
}
function readU16(buf, i) {
	return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint16(i, true);
}
function unzip(buf) {
	let eocd = -1;
	const start = Math.max(0, buf.length - 22 - 65535);
	for (let i = buf.length - 22; i >= start; i -= 1) if (readU32(buf, i) === 101010256) {
		eocd = i;
		break;
	}
	if (eocd < 0) throw new Error("Not a zip/xlsx file");
	const entries = readU16(buf, eocd + 10);
	let offset = readU32(buf, eocd + 16);
	const files = {};
	const dec = new TextDecoder();
	for (let n = 0; n < entries; n += 1) {
		if (readU32(buf, offset) !== 33639248) break;
		const method = readU16(buf, offset + 10);
		const compSize = readU32(buf, offset + 20);
		const nameLen = readU16(buf, offset + 28);
		const extraLen = readU16(buf, offset + 30);
		const commentLen = readU16(buf, offset + 32);
		const localOff = readU32(buf, offset + 42);
		const name = dec.decode(buf.subarray(offset + 46, offset + 46 + nameLen));
		const localNameLen = readU16(buf, localOff + 26);
		const localExtra = readU16(buf, localOff + 28);
		const dataStart = localOff + 30 + localNameLen + localExtra;
		const compressed = buf.subarray(dataStart, dataStart + compSize);
		files[name] = method === 0 ? compressed : method === 8 ? new Uint8Array(inflateRawSync(compressed)) : compressed;
		offset += 46 + nameLen + extraLen + commentLen;
	}
	return files;
}
function xmlEscape(value) {
	return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function colName(index) {
	let n = index + 1;
	let s = "";
	while (n > 0) {
		const rem = (n - 1) % 26;
		s = String.fromCharCode(65 + rem) + s;
		n = Math.floor((n - 1) / 26);
	}
	return s;
}
function sheetXml(rows) {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, r) => {
		const cells = row.map((value, c) => {
			const t = xmlEscape(value ?? "");
			const space = /^\s|\s$/.test(value ?? "") ? " xml:space=\"preserve\"" : "";
			return `<c r="${colName(c)}${r + 1}" t="inlineStr"><is><t${space}>${t}</t></is></c>`;
		}).join("");
		return `<row r="${r + 1}">${cells}</row>`;
	}).join("")}</sheetData></worksheet>`;
}
function writeXlsx(sheets) {
	const enc = new TextEncoder();
	const files = [];
	const sheetEntries = sheets.map((s, i) => ({
		name: s.name.slice(0, 31).replace(/[:\\/?*[\]]/g, " "),
		path: `xl/worksheets/sheet${i + 1}.xml`,
		rid: `rId${i + 1}`,
		rows: s.rows
	}));
	files.push({
		name: "[Content_Types].xml",
		data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetEntries.map((s) => `<Override PartName="/${s.path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`)
	});
	files.push({
		name: "_rels/.rels",
		data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`)
	});
	files.push({
		name: "xl/_rels/workbook.xml.rels",
		data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetEntries.map((s) => `<Relationship Id="${s.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${s.path.split("/").pop()}"/>`).join("")}
</Relationships>`)
	});
	files.push({
		name: "xl/workbook.xml",
		data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${sheetEntries.map((s, i) => `<sheet name="${xmlEscape(s.name)}" sheetId="${i + 1}" r:id="${s.rid}"/>`).join("")}
</sheets>
</workbook>`)
	});
	for (const s of sheetEntries) files.push({
		name: s.path,
		data: enc.encode(sheetXml(s.rows))
	});
	return zipStore(files);
}
function colIndex(ref) {
	const letters = ref.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? "A";
	let n = 0;
	for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
	return n - 1;
}
function parseSharedStrings(xml) {
	const out = [];
	const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
	let m;
	while (m = siRe.exec(xml)) {
		const texts = [...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((x) => decodeXml(x[1]));
		out.push(texts.join(""));
	}
	return out;
}
function decodeXml(value) {
	return value.replace(/* @__PURE__ */ new RegExp("&lt;", "g"), "<").replace(/* @__PURE__ */ new RegExp("&gt;", "g"), ">").replace(/* @__PURE__ */ new RegExp("&quot;", "g"), "\"").replace(/* @__PURE__ */ new RegExp("&apos;", "g"), "'").replace(/* @__PURE__ */ new RegExp("&amp;", "g"), "&");
}
function parseSheetGrid(xml, shared) {
	const normalized = xml.replace(/<c\b([^>]*)\/>/g, "<c$1></c>");
	const rows = [];
	const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
	let rowMatch;
	while (rowMatch = rowRe.exec(normalized)) {
		const cells = [];
		const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/gi;
		let cellMatch;
		while (cellMatch = cellRe.exec(rowMatch[1])) {
			const attrs = cellMatch[1];
			const inner = cellMatch[2];
			const ref = attrs.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? "";
			const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? "";
			let value = "";
			if (type === "s") {
				const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "0";
				value = shared[Number(v)] ?? "";
			} else if (type === "inlineStr") value = [...inner.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((x) => decodeXml(x[1])).join("");
			else if (type === "b") {
				const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "0";
				value = v === "1" || v === "true" ? "TRUE" : "FALSE";
			} else {
				const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1];
				value = v ? decodeXml(v) : "";
			}
			value = value.replace(/[\r\n]+/g, " ").replace(/[ \t]+/g, " ").trim();
			const idx = colIndex(ref);
			while (cells.length < idx) cells.push("");
			cells[idx] = value;
		}
		rows.push(cells);
	}
	return rows;
}
function zipEntry(files, path) {
	const clean = path.replace(/^\/+/, "").replace(/^\.\//, "");
	return files[clean] ?? files[`/${clean}`] ?? files[path];
}
function sheetZipPath(target) {
	const clean = target.replace(/^\/+/, "").replace(/^\.\//, "");
	if (clean.startsWith("xl/")) return clean;
	return `xl/${clean}`;
}
function readXlsx(buf) {
	const files = unzip(buf);
	const dec = new TextDecoder();
	const sharedXml = zipEntry(files, "xl/sharedStrings.xml");
	const shared = sharedXml ? parseSharedStrings(dec.decode(sharedXml)) : [];
	const wb = dec.decode(zipEntry(files, "xl/workbook.xml") ?? /* @__PURE__ */ new Uint8Array());
	const rels = dec.decode(zipEntry(files, "xl/_rels/workbook.xml.rels") ?? /* @__PURE__ */ new Uint8Array());
	const relMap = {};
	for (const tag of rels.matchAll(/<Relationship\b[^>]*>/g)) {
		const id = tag[0].match(/\bId="([^"]+)"/)?.[1];
		const target = tag[0].match(/\bTarget="([^"]+)"/)?.[1];
		if (id && target) relMap[id] = target;
	}
	const sheets = [];
	for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
		const name = m[0].match(/\bname="([^"]+)"/)?.[1];
		const rid = m[0].match(/\br:id="([^"]+)"/)?.[1];
		if (!name || !rid) continue;
		const target = relMap[rid];
		if (!target) continue;
		const xml = zipEntry(files, sheetZipPath(target));
		if (!xml) continue;
		sheets.push({
			name,
			rows: parseSheetGrid(dec.decode(xml), shared)
		});
	}
	return sheets;
}
function yn(v) {
	return v ? "yes" : "no";
}
function stamp(iso) {
	if (!iso) return "";
	if (iso.includes("T")) return iso.replace("T", " ").slice(0, 16);
	return iso.slice(0, 10);
}
function floorToSheets(state) {
	const byKey = {
		parts: state.parts.map((p) => [
			p.partNumber,
			p.name,
			p.logger,
			p.type,
			p.counts,
			yn(p.directional),
			String(p.buildTimeHours),
			p.notes,
			yn(p.active)
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
			w.buildOrderNotes
		]),
		units: state.units.map((u) => [
			u.workOrderNumber,
			u.unitId,
			u.serialOrId,
			u.status,
			u.salesOrderNumber ?? "",
			stamp(u.despatchDate)
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
			stamp(t.dateOpened)
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
			s.notesLine1
		]),
		sales_lines: state.salesLines.map((l) => [
			l.soNumber,
			l.part,
			String(l.qty),
			l.workOrderNumber
		]),
		hardware_history: state.workOrders.flatMap((w) => w.hardwareHistory.map((n) => [
			w.woNumber,
			stamp(n.date),
			n.author,
			n.text
		])),
		build_order: state.buildOrder.map((wo, i) => [String(i + 1), wo]),
		build_tasks: state.buildTasks.map((t) => [
			String(t.id),
			t.title,
			t.assignedBuild,
			String(t.hours),
			t.status,
			t.buildOrderNotes
		])
	};
	return SHEET_SPECS.map((spec) => ({
		name: spec.title,
		key: spec.key,
		rows: [spec.columns, ...byKey[spec.key]]
	}));
}
function zipFromFloor(state) {
	const enc = new TextEncoder();
	const partOf = (woNumber) => state.workOrders.find((w) => w.woNumber === woNumber)?.part ?? "";
	const lookupSheets = lookupToGrid(state.buildSpec);
	const recordGrid = buildRecordsToGrid(state.buildRecords, state.buildSpec.components, partOf);
	return zipStore$1([
		{
			name: "_database.txt",
			data: enc.encode(SCHEMA_DOC)
		},
		...floorToSheets(state).map((s) => ({
			name: `${s.key}.csv`,
			data: enc.encode(`\uFEFF${toCsv(s.rows)}`)
		})),
		{
			name: "Build_Component_Lookup.xlsx",
			data: writeXlsx(lookupSheets)
		},
		{
			name: "build_records.csv",
			data: enc.encode(`\uFEFF${toCsv(recordGrid)}`)
		}
	]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var pinMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const { assertPin } = await import("./pin.server-BeLv6Hd3.mjs");
	assertPin();
	return next();
});
var pinStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("ad5fb5a4776025a660e7c94d5c83e0a8b103063b57a5ddda6667e54ae16e4f5a"));
var unlockFloor = createServerFn({ method: "POST" }).validator(object({ pin: string() })).handler(createSsrRpc("3afa1be5fc641d6425b9417d948ae052d869d388142643aec3efd8115464b857"));
var WO_STATUSES = [
	"pending",
	"active",
	"on_hold",
	"closed",
	"cancelled"
];
var WO_STATUS_LABELS = {
	pending: "Pending",
	active: "Active",
	on_hold: "On hold",
	closed: "Closed",
	cancelled: "Cancelled"
};
var UNIT_STATUSES = [
	"in build",
	"on shelf",
	"shipped"
];
var UNIT_STATUS_LABELS = {
	"in build": "In build",
	"on shelf": "On shelf",
	shipped: "Shipped"
};
var TICKET_STATUSES = ["open", "closed"];
var QT_CAUSES = [
	"TBD",
	"component failure",
	"design work needed",
	"build error",
	"missing parts",
	"documentation"
];
var SO_STATUSES = [
	"open",
	"waiting_on_customer",
	"despatched",
	"cancelled"
];
var BUILDERS = [
	"Simon",
	"David",
	"Donald",
	"Kenzie",
	"Catriona",
	"Allan",
	"Lucas"
];
var BUILDER_OPTIONS = BUILDERS.map((n) => ({
	value: n,
	label: n
}));
var WO_STATUS_OPTIONS = WO_STATUSES.map((s) => ({
	value: s,
	label: WO_STATUS_LABELS[s]
}));
var UNIT_STATUS_OPTIONS = UNIT_STATUSES.map((s) => ({
	value: s,
	label: UNIT_STATUS_LABELS[s]
}));
var TASK_STATUSES = [
	"pending",
	"active",
	"on_hold",
	"done"
];
var TASK_STATUS_LABELS = {
	pending: "Pending",
	active: "Active",
	on_hold: "On hold",
	done: "Done"
};
var TASK_STATUS_OPTIONS = TASK_STATUSES.map((s) => ({
	value: s,
	label: TASK_STATUS_LABELS[s]
}));
//#endregion
export { lookupWoSales as $, isBuildReportGrid as A, pinStatus as B, floorToSheets as C, getPglite as D, formatStamp as E, parseBuildReportGrid as F, snapToWeekday as G, recordsForSheet as H, parseFlexibleDate as I, unlockFloor as J, todayIso as K, parseFlexibleStamp as L, isPastDate as M, nextWeekday as N, getSql as O, nowStamp as P, isProformaNote as Q, parseLookupSheets as R, fieldPlaceholder as S, formatShopWeekday as T, requiredKeysForPart as U, readXlsx as V, serialsForWorkOrder as W, buildTraceRows as X, zipFromFloor as Y, earliestNeedForWo as Z, componentKind as _, SHEET_SPECS as a, sageLinesWithoutWo as at, ensureDbReady as b, TASK_STATUS_OPTIONS as c, salesOrdersReadyToShip as ct, UNIT_STATUS_OPTIONS as d, parseCsv as dt, matchTraceRows as et, WO_STATUSES as f, toCsv as ft, componentKey as g, addCalendarDays as h, SCHEMA_DOC as i, sageExtrasForSo as it, isLookupWorkbook as j, hoursToDays as k, TICKET_STATUSES as l, sourcesFromConsumed as lt, WO_STATUS_OPTIONS as m, BUILDER_OPTIONS as n, parseTraceQuery as nt, SO_STATUSES as o, sageNotesLine1 as ot, WO_STATUS_LABELS as p, types_CcVUDIXB_exports as q, QT_CAUSES as r, parseWoNumbers as rt, TASK_STATUSES as s, salesLinesWithoutWo as st, BUILDERS as t, normalizeWoNumber as tt, UNIT_STATUSES as u, ticketTouchesWo as ut, createSsrRpc as v, formatShopDate as w, fieldHint as x, detectSheetKey as y, pinMiddleware as z };
