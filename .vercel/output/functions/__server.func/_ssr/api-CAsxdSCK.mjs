import { l as __exportAll, r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { I as parseFlexibleDate, K as todayIso, O as getSql, P as nowStamp, V as readXlsx, Y as zipFromFloor, _ as componentKind, dt as parseCsv, f as WO_STATUSES, g as componentKey, h as addCalendarDays, l as TICKET_STATUSES, o as SO_STATUSES, p as WO_STATUS_LABELS, r as QT_CAUSES, rt as parseWoNumbers, s as TASK_STATUSES, tt as normalizeWoNumber, u as UNIT_STATUSES, z as pinMiddleware } from "./types-CcVUDIXB.mjs";
import { an as _enum, cn as boolean, fn as number, gn as string, pn as object, sn as array } from "../_libs/@better-auth/core+[...].mjs";
import { i as normalizeProspectNumber, n as displayTsk, t as displayPt } from "./prospect-VcFT87HP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CAsxdSCK.js
function compact(value) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function fieldOf(header) {
	const n = compact(header);
	if (!n) return null;
	if (n.includes("salesordernumber") && !n.includes("item")) return "so_number";
	if (n === "salesordernumber" || n === "sonumber") return "so_number";
	if (n.includes("accountname")) return "company";
	if (n === "salesorderdate" || n === "orderdate") return "order_date";
	if (n.endsWith("orderdate") && n.includes("sales") && !n.includes("despatch")) return "order_date";
	if (n.includes("productaccountreference") || n === "part" || n === "partnumber") return "part";
	if (n.includes("salesorderitemdescription") || n === "description") return "description";
	if (n.includes("comment1") || n.includes("comment2")) return "comment";
	if (n.includes("quantitydespatched")) return "qty_despatched";
	if (n.includes("salesorderitemquantity") || n === "quantity" || n === "qty") return "qty";
	if (n.includes("notesline1") || n === "notes") return "notes";
	return null;
}
function asQty(value) {
	const n = Number.parseFloat(value.replace(/,/g, ""));
	return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}
/** Sage SOPOUT / Outstanding Sales Orders export. */
function parseSageSopout(grid) {
	if (!grid.length) return [];
	let headerAt = -1;
	for (let i = 0; i < Math.min(grid.length, 12); i += 1) {
		const joined = grid[i].map(compact).join(" ");
		if (joined.includes("salesordernumber") && joined.includes("product")) {
			headerAt = i;
			break;
		}
		if (grid[i].some((c) => compact(c) === "salesordernumber")) {
			headerAt = i;
			break;
		}
	}
	if (headerAt < 0) return [];
	const fields = grid[headerAt].map(fieldOf);
	const commentIdx = fields.map((f, i) => f === "comment" ? i : -1).filter((i) => i >= 0);
	const out = [];
	for (const row of grid.slice(headerAt + 1)) {
		const get = (key) => {
			const i = fields.indexOf(key);
			return i >= 0 ? (row[i] ?? "").trim() : "";
		};
		const soNumber = get("so_number").replace(/\.0+$/, "");
		if (!soNumber || /^company/i.test(soNumber)) continue;
		const part = get("part");
		const description = get("description");
		if (!part && !description) continue;
		const comments = commentIdx.map((i) => (row[i] ?? "").trim()).filter(Boolean).join(" · ");
		out.push({
			soNumber,
			company: get("company"),
			orderDate: parseFlexibleDate(get("order_date")),
			part,
			description,
			comment: comments,
			qty: asQty(get("qty")),
			qtyDespatched: asQty(get("qty_despatched")),
			notes: get("notes")
		});
	}
	return out;
}
/** Default Build Component Lookup (the shop matrix). Seeded when the tables are empty. */
var LOOKUP_SEED = {
	"components": [
		{
			"key": "RBCONTROLPCBNO10018-02",
			"label": "RB Control PCB No 10018-02",
			"kind": "pcb",
			"position": 1
		},
		{
			"key": "ABRECEIVERPCBNO10038-02",
			"label": "AB Receiver PCB No 10038-02",
			"kind": "pcb",
			"position": 2
		},
		{
			"key": "MULTI-USEPCB10039-02",
			"label": "Multi-Use PCB 10039-02",
			"kind": "pcb",
			"position": 3
		},
		{
			"key": "ASSY.VLFLOOP.RX",
			"label": "ASSY.VLFLOOP.RX",
			"kind": "subassembly",
			"position": 4
		},
		{
			"key": "ASSY.VLFLOOP.TX",
			"label": "ASSY.VLFLOOP.TX",
			"kind": "subassembly",
			"position": 5
		},
		{
			"key": "TRANSMITTERNO10027-02",
			"label": "Transmitter No 10027-02",
			"kind": "subassembly",
			"position": 6
		},
		{
			"key": "ASSY.ANT1(A)",
			"label": "ASSY.ANT1 (A)",
			"kind": "subassembly",
			"position": 7
		},
		{
			"key": "ASSY.ANT1(B)",
			"label": "ASSY.ANT1 (B)",
			"kind": "subassembly",
			"position": 8
		},
		{
			"key": "ASSY.ANT2.(A)",
			"label": "ASSY.ANT2. (A)",
			"kind": "subassembly",
			"position": 9
		},
		{
			"key": "ASSY.ANT2.(B)",
			"label": "ASSY.ANT2. (B)",
			"kind": "subassembly",
			"position": 10
		},
		{
			"key": "ASSY.ANT16(A)",
			"label": "ASSY.ANT16 (A)",
			"kind": "subassembly",
			"position": 11
		},
		{
			"key": "ASSY.ANT.16(B)",
			"label": "ASSY.ANT.16 (B)",
			"kind": "subassembly",
			"position": 12
		},
		{
			"key": "COIL_PCB_10012-02-B",
			"label": "COIL_PCB_10012-02-B",
			"kind": "pcb",
			"position": 13
		},
		{
			"key": "LORAWANPCB10158-02",
			"label": "LoRaWAN PCB 10158-02",
			"kind": "pcb",
			"position": 14
		}
	],
	"batteries": [
		"BE.D2",
		"BE.D4",
		"BP.7.2V.NiMH",
		"BE.D2.C1",
		"N/A"
	],
	"map": {
		"ASSY.ANT1": [],
		"ASSY.ANT2": [],
		"ASSY.VLFLOOP": ["COIL_PCB_10012-02-B"],
		"DRBPB-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)",
			"LORAWANPCB10158-02"
		],
		"DRBPB-S-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBXC200-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT16(A)",
			"ASSY.ANT.16(B)",
			"LORAWANPCB10158-02"
		],
		"DRBXC200-N-B": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT16(A)",
			"ASSY.ANT.16(B)"
		],
		"DRBXC200-N-B-SOLAR": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT16(A)",
			"ASSY.ANT.16(B)"
		],
		"DRBXC200-S-B": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT16(A)",
			"ASSY.ANT.16(B)"
		],
		"DRBX-D-B": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBX-D-PH": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBX-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)",
			"LORAWANPCB10158-02"
		],
		"DRBX-L-Bespoke 1": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT2.(A)",
			"ASSY.ANT2.(B)",
			"LORAWANPCB10158-02"
		],
		"DRBX-L-Bespoke 2": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT2.(A)",
			"ASSY.ANT2.(B)",
			"LORAWANPCB10158-02"
		],
		"DRBX-L-PH": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)",
			"LORAWANPCB10158-02"
		],
		"DRBX-N-B": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBX-S-B": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBX-S-PH": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)",
			"ASSY.ANT1(B)"
		],
		"DRBX-S-PH-INT": [],
		"MIRB-D": [],
		"MIRB-L Standard": ["LORAWANPCB10158-02"],
		"MIRB-L-Side": ["LORAWANPCB10158-02"],
		"MIRB-N Standard": [],
		"MIRB-N-Side": [],
		"RBC-D-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBC-D-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBC-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBC-L-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBC-N-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBC-N-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBC-S-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBC-S-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-D-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-D-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBPB-L-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBPB-N-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-N-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-S-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBPB-S-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBTriple-D-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBTriple-D-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBTriple-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBTriple-L-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBTriple-S-B": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBTriple-S-PH": [
			"RBCONTROLPCBNO10018-02",
			"ABRECEIVERPCBNO10038-02",
			"MULTI-USEPCB10039-02",
			"ASSY.VLFLOOP.RX",
			"ASSY.ANT1(A)"
		],
		"RBX-D-B": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)"
		],
		"RBX-D-MPP": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)"
		],
		"RBX-D-PH": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)"
		],
		"RBX-D-PH-INT": ["MULTI-USEPCB10039-02"],
		"RBX-L-B": [
			"RBCONTROLPCBNO10018-02",
			"ASSY.ANT1(A)",
			"LORAWANPCB10158-02"
		],
		"RBX-L-PH": ["LORAWANPCB10158-02"],
		"RBX-N-B": ["RBCONTROLPCBNO10018-02", "ASSY.ANT1(A)"],
		"RBX-N-Bespoke 1": ["RBCONTROLPCBNO10018-02", "ASSY.ANT1(A)"],
		"RBX-N-PH": ["RBCONTROLPCBNO10018-02", "ASSY.ANT1(A)"],
		"RBX-N-PH-FRONT": ["RBCONTROLPCBNO10018-02", "ASSY.ANT1(A)"],
		"RBX-S-B": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)"
		],
		"RBX-S-PH": [
			"RBCONTROLPCBNO10018-02",
			"MULTI-USEPCB10039-02",
			"ASSY.ANT1(A)"
		],
		"TX100": ["TRANSMITTERNO10027-02"],
		"TX200": [],
		"TX300": ["ASSY.VLFLOOP.TX", "TRANSMITTERNO10027-02"]
	}
};
function asNotes$1(value) {
	if (!value) return [];
	if (typeof value === "string") {
		const t = value.trim();
		if (!t) return [];
		try {
			return asNotes$1(JSON.parse(t));
		} catch {
			return [];
		}
	}
	if (!Array.isArray(value)) return [];
	const out = [];
	for (const item of value) {
		if (!item || typeof item !== "object") continue;
		const rec = item;
		const text = asString$1(rec.text);
		if (!text) continue;
		out.push({
			date: asString$1(rec.date),
			author: asString$1(rec.author),
			text
		});
	}
	return out;
}
function asString$1(value) {
	if (value == null) return "";
	return String(value).trim();
}
function asNumber$1(value, fallback = 0) {
	if (value == null || value === "") return fallback;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
}
function mapComponent(row) {
	const kind = asString$1(row.kind);
	return {
		key: asString$1(row.component_key),
		label: asString$1(row.label),
		kind: kind === "pcb" || kind === "battery" ? kind : "subassembly",
		position: asNumber$1(row.position)
	};
}
function asConsumed(value) {
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
	const out = [];
	for (const item of value) {
		if (!item || typeof item !== "object") continue;
		const rec = item;
		const woNumber = normalizeWoNumber(asString$1(rec.woNumber || rec.wo_number)) || asString$1(rec.woNumber || rec.wo_number);
		const part = asString$1(rec.part);
		if (!woNumber && !part) continue;
		out.push({
			woNumber,
			part
		});
	}
	return out;
}
function cleanConsumed(items) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of items) {
		const woNumber = normalizeWoNumber(asString$1(item.woNumber)) || asString$1(item.woNumber);
		const part = asString$1(item.part);
		if (!woNumber && !part) continue;
		const key = `${woNumber}\0${part}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({
			woNumber,
			part
		});
	}
	return out;
}
function consumedHistoryLine(serial, items) {
	const rows = cleanConsumed(items);
	if (!rows.length) return null;
	return `Serial ${serial} consumed: ${rows.map((row) => {
		const wo = row.woNumber ? `WO-${row.woNumber}` : "";
		const part = row.part;
		if (wo && part) return `${wo} ${part}`;
		return wo || part;
	}).join("; ")}`;
}
function mapBuildRecord(row, values) {
	return {
		id: asNumber$1(row.id),
		woNumber: asString$1(row.wo_number),
		serial: asString$1(row.serial) || "1",
		revision: asString$1(row.revision),
		battery: asString$1(row.battery),
		notes: asString$1(row.notes),
		values,
		consumed: asConsumed(row.consumed)
	};
}
async function loadBuildSpec(sql) {
	return readBuildSpec(sql, true);
}
async function readBuildSpec(sql, allowSeed) {
	const [components, batteries, mapRows] = await Promise.all([
		sql`select * from build_components order by position, label`,
		sql`select * from build_batteries order by position, code`,
		sql`select part_number, component_key from build_component_map`
	]);
	const stale = components.some((row) => {
		const key = asString$1(row.component_key);
		return /_PCB_NO_/.test(key) || /ANT1_\(A\)/.test(key);
	});
	if (allowSeed && LOOKUP_SEED.components.length && (!components.length || stale)) {
		await replaceLookup(sql, LOOKUP_SEED);
		return readBuildSpec(sql, false);
	}
	const map = {};
	for (const row of mapRows) {
		const part = asString$1(row.part_number);
		const key = asString$1(row.component_key);
		if (!part || !key) continue;
		(map[part] ??= []).push(key);
	}
	return {
		components: components.map(mapComponent),
		batteries: batteries.map((r) => asString$1(r.code)).filter(Boolean),
		map
	};
}
async function loadBuildRecords(sql) {
	const [rows, valueRows] = await Promise.all([sql`select * from wo_build_records order by wo_number, serial`, sql`select record_id, component_key, value from wo_build_values`]);
	const byId = /* @__PURE__ */ new Map();
	for (const row of valueRows) {
		const id = asNumber$1(row.record_id);
		const bag = byId.get(id) ?? {};
		bag[asString$1(row.component_key)] = asString$1(row.value);
		byId.set(id, bag);
	}
	return rows.map((row) => mapBuildRecord(row, byId.get(asNumber$1(row.id)) ?? {}));
}
async function pushHistory(sql, woNumber, author, text) {
	const line = text.trim();
	if (!line) return;
	const rows = await sql`
    select hardware_history from work_orders where wo_number = ${woNumber} limit 1
  `;
	if (!rows[0]) return;
	const notes = [...asNotes$1(rows[0].hardware_history)];
	const last = notes[notes.length - 1];
	if (last && last.text === line && last.author === (author.trim() || last.author)) return;
	notes.push({
		date: nowStamp(),
		author: author.trim() || "Shop",
		text: line
	});
	await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}
function changeLine(serial, label, from, to) {
	const a = from.trim();
	const b = to.trim();
	if (a === b) return null;
	if (!a) return `Build serial ${serial} · ${label}: ${b}`;
	if (!b) return `Build serial ${serial} · ${label}: ${a} → (blank)`;
	return `Build serial ${serial} · ${label}: ${a} → ${b}`;
}
async function replaceLookup(sql, parsed) {
	await sql`delete from build_component_map`;
	await sql`delete from build_components`;
	await sql`delete from build_batteries`;
	for (const [i, comp] of parsed.components.entries()) await sql`
      insert into build_components (component_key, label, kind, position)
      values (${comp.key}, ${comp.label}, ${comp.kind}, ${comp.position || i + 1})
    `;
	for (const [i, code] of parsed.batteries.entries()) await sql`
      insert into build_batteries (code, position) values (${code}, ${i + 1})
    `;
	for (const [part, keys] of Object.entries(parsed.map)) for (const key of keys) await sql`
        insert into build_component_map (part_number, component_key)
        values (${part}, ${key})
        on conflict do nothing
      `;
}
async function ensureComponent(sql, key, label) {
	await sql`
    insert into build_components (component_key, label, kind, position)
    values (${key}, ${label}, ${componentKind(label)}, 999)
    on conflict (component_key) do nothing
  `;
}
async function ensureBattery(sql, code) {
	const trimmed = code.trim();
	if (!trimmed) return;
	await sql`
    insert into build_batteries (code, position)
    values (${trimmed}, 999)
    on conflict (code) do nothing
  `;
}
async function ensureWorkOrder(sql, woNumber, part, qty) {
	const rows = await sql`
    select wo_number, qty from work_orders where wo_number = ${woNumber} limit 1
  `;
	if (rows[0]) {
		if (qty > asNumber$1(rows[0].qty, 1)) await sql`update work_orders set qty = ${qty} where wo_number = ${woNumber}`;
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
async function getOrCreateRecord(sql, woNumber, serial) {
	const rows = await sql`
    select * from wo_build_records
    where wo_number = ${woNumber} and serial = ${serial}
    limit 1
  `;
	if (rows[0]) {
		const id = asNumber$1(rows[0].id);
		const vals = await sql`
      select component_key, value from wo_build_values where record_id = ${id}
    `;
		const values = {};
		for (const v of vals) values[asString$1(v.component_key)] = asString$1(v.value);
		return {
			id,
			revision: asString$1(rows[0].revision),
			battery: asString$1(rows[0].battery),
			notes: asString$1(rows[0].notes),
			values,
			consumed: asConsumed(rows[0].consumed)
		};
	}
	return {
		id: asNumber$1((await sql`
    insert into wo_build_records (wo_number, serial)
    values (${woNumber}, ${serial})
    returning id
  `)[0]?.id),
		revision: "",
		battery: "",
		notes: "",
		values: {},
		consumed: []
	};
}
async function setConsumed(sql, data) {
	const rec = await getOrCreateRecord(sql, data.woNumber, data.serial);
	const items = cleanConsumed(data.items);
	await sql`
    update wo_build_records
    set consumed = ${JSON.stringify(items)}::jsonb
    where id = ${rec.id}
  `;
	return items;
}
async function writeConsumedHistory(sql, data) {
	const items = data.items !== void 0 ? await setConsumed(sql, {
		woNumber: data.woNumber,
		serial: data.serial,
		items: data.items
	}) : (await getOrCreateRecord(sql, data.woNumber, data.serial)).consumed;
	const line = consumedHistoryLine(data.serial.trim() || "1", items);
	if (!line) throw new Error("Add a consumed WO first");
	await pushHistory(sql, data.woNumber, data.author, line);
}
async function setBuildField(sql, data) {
	const rec = await getOrCreateRecord(sql, data.woNumber, data.serial);
	const serial = data.serial.trim() || "1";
	const author = data.author;
	if (data.revision !== void 0) {
		const line = changeLine(serial, "Revision", rec.revision, data.revision);
		await sql`update wo_build_records set revision = ${data.revision} where id = ${rec.id}`;
		if (line) await pushHistory(sql, data.woNumber, author, line);
	}
	if (data.battery !== void 0) {
		const line = changeLine(serial, "Battery", rec.battery, data.battery);
		await sql`update wo_build_records set battery = ${data.battery} where id = ${rec.id}`;
		if (line) await pushHistory(sql, data.woNumber, author, line);
	}
	if (data.notes !== void 0) {
		const line = changeLine(serial, "Non-conformity", rec.notes, data.notes);
		await sql`update wo_build_records set notes = ${data.notes} where id = ${rec.id}`;
		if (line) await pushHistory(sql, data.woNumber, author, line);
	}
	if (data.componentKey !== void 0 && data.componentValue !== void 0) {
		const key = data.componentKey;
		const from = rec.values[key] ?? "";
		const line = changeLine(serial, data.componentLabel?.trim() || key, from, data.componentValue);
		await sql`
      insert into wo_build_values (record_id, component_key, value)
      values (${rec.id}, ${key}, ${data.componentValue})
      on conflict (record_id, component_key) do update set value = excluded.value
    `;
		if (line) await pushHistory(sql, data.woNumber, author, line);
	}
}
async function applyBuildReport(sql, rows, author, onError) {
	let updated = 0;
	let inserted = 0;
	let createdWo = 0;
	const labels = await sql`select component_key, label from build_components`;
	const labelByKey = new Map(labels.map((r) => [asString$1(r.component_key), asString$1(r.label)]));
	const qtyByWo = /* @__PURE__ */ new Map();
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
		if (await ensureWorkOrder(sql, wo, row.part, qtyByWo.get(wo) ?? 1) === "created") createdWo += 1;
		if ((await sql`
      select id from wo_build_records
      where wo_number = ${wo} and serial = ${row.serial}
      limit 1
    `)[0]) updated += 1;
		else inserted += 1;
		if (row.part) await sql`
        update work_orders
        set part = case when part = '' then ${row.part} else part end
        where wo_number = ${wo}
      `;
		if (row.revision) await setBuildField(sql, {
			woNumber: wo,
			serial: row.serial,
			author,
			revision: row.revision
		});
		if (row.battery) {
			await ensureBattery(sql, row.battery);
			await setBuildField(sql, {
				woNumber: wo,
				serial: row.serial,
				author,
				battery: row.battery
			});
		}
		if (row.notes) await setBuildField(sql, {
			woNumber: wo,
			serial: row.serial,
			author,
			notes: row.notes
		});
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
				componentLabel: labelByKey.get(key) || val.label
			});
		}
	}
	return {
		updated,
		inserted,
		createdWo
	};
}
var api_exports = /* @__PURE__ */ __exportAll({
	addBuildBattery_createServerFn_handler: () => addBuildBattery_createServerFn_handler,
	addBuildComponent_createServerFn_handler: () => addBuildComponent_createServerFn_handler,
	addHardwareHistory_createServerFn_handler: () => addHardwareHistory_createServerFn_handler,
	addSalesLine_createServerFn_handler: () => addSalesLine_createServerFn_handler,
	addTicketNote_createServerFn_handler: () => addTicketNote_createServerFn_handler,
	addUnitNote_createServerFn_handler: () => addUnitNote_createServerFn_handler,
	addUnit_createServerFn_handler: () => addUnit_createServerFn_handler,
	createBuildTask_createServerFn_handler: () => createBuildTask_createServerFn_handler,
	createPart_createServerFn_handler: () => createPart_createServerFn_handler,
	createProblemTicket_createServerFn_handler: () => createProblemTicket_createServerFn_handler,
	createSalesOrder_createServerFn_handler: () => createSalesOrder_createServerFn_handler,
	createTicket_createServerFn_handler: () => createTicket_createServerFn_handler,
	createWorkOrder_createServerFn_handler: () => createWorkOrder_createServerFn_handler,
	deleteBuildTask_createServerFn_handler: () => deleteBuildTask_createServerFn_handler,
	deleteProblemTicket_createServerFn_handler: () => deleteProblemTicket_createServerFn_handler,
	deleteSalesLine_createServerFn_handler: () => deleteSalesLine_createServerFn_handler,
	despatchLine_createServerFn_handler: () => despatchLine_createServerFn_handler,
	despatchSalesOrder_createServerFn_handler: () => despatchSalesOrder_createServerFn_handler,
	exportFloorZip_createServerFn_handler: () => exportFloorZip_createServerFn_handler,
	importFloor_createServerFn_handler: () => importFloor_createServerFn_handler,
	importSagePack_createServerFn_handler: () => importSagePack_createServerFn_handler,
	loadFloor_createServerFn_handler: () => loadFloor_createServerFn_handler,
	passProblemTicket_createServerFn_handler: () => passProblemTicket_createServerFn_handler,
	passWorkOrder_createServerFn_handler: () => passWorkOrder_createServerFn_handler,
	prePassProblemTicket_createServerFn_handler: () => prePassProblemTicket_createServerFn_handler,
	prePassWorkOrder_createServerFn_handler: () => prePassWorkOrder_createServerFn_handler,
	removeBuildBattery_createServerFn_handler: () => removeBuildBattery_createServerFn_handler,
	removeBuildComponent_createServerFn_handler: () => removeBuildComponent_createServerFn_handler,
	reorderBuildOrder_createServerFn_handler: () => reorderBuildOrder_createServerFn_handler,
	setPartComponentRequired_createServerFn_handler: () => setPartComponentRequired_createServerFn_handler,
	setWorkOrderBuildField_createServerFn_handler: () => setWorkOrderBuildField_createServerFn_handler,
	setWorkOrderConsumed_createServerFn_handler: () => setWorkOrderConsumed_createServerFn_handler,
	updateBuildTask_createServerFn_handler: () => updateBuildTask_createServerFn_handler,
	updatePart_createServerFn_handler: () => updatePart_createServerFn_handler,
	updateProblemTicket_createServerFn_handler: () => updateProblemTicket_createServerFn_handler,
	updateSalesLine_createServerFn_handler: () => updateSalesLine_createServerFn_handler,
	updateSalesOrder_createServerFn_handler: () => updateSalesOrder_createServerFn_handler,
	updateTicket_createServerFn_handler: () => updateTicket_createServerFn_handler,
	updateUnit_createServerFn_handler: () => updateUnit_createServerFn_handler,
	updateWorkOrder_createServerFn_handler: () => updateWorkOrder_createServerFn_handler,
	wipeFloor_createServerFn_handler: () => wipeFloor_createServerFn_handler,
	writeWorkOrderConsumedHistory_createServerFn_handler: () => writeWorkOrderConsumedHistory_createServerFn_handler
});
var woStatus = _enum(WO_STATUSES);
var unitStatus = _enum(UNIT_STATUSES);
var taskStatus = _enum(TASK_STATUSES);
var ticketStatus = _enum(TICKET_STATUSES);
var soStatus = _enum(SO_STATUSES);
function asNumber(value, fallback = 0) {
	if (value == null || value === "") return fallback;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
}
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function asString(value) {
	return value == null ? "" : String(value);
}
function oneOf(value, allowed, fallback) {
	return allowed.includes(value) ? value : fallback;
}
function asDate(value) {
	if (value == null || value === "") return null;
	const s = String(value);
	return s.length >= 10 ? s.slice(0, 10) : null;
}
function asStamp(value) {
	const s = asString(value).trim();
	if (s.length >= 16 && s[10] === "T") return s.slice(0, 16);
	if (s.length >= 10) return s.slice(0, 10);
	return todayIso();
}
function asNotes(value) {
	let parsed = value;
	if (typeof value === "string") try {
		parsed = JSON.parse(value);
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	return parsed.map((item) => {
		if (!item || typeof item !== "object") return null;
		const rec = item;
		const text = asString(rec.text).trim();
		if (!text) return null;
		return {
			date: asStamp(rec.date),
			author: asString(rec.author),
			text
		};
	}).filter((n) => n != null);
}
function asNoteText(value) {
	if (value == null) return "";
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed || trimmed === "[]") return "";
		if (trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith("\"")) try {
			return asNoteText(JSON.parse(trimmed));
		} catch {
			return value;
		}
		return value;
	}
	if (Array.isArray(value)) return value.map(asNoteText).filter(Boolean).join("\n");
	if (typeof value === "object" && "text" in value) return asString(value.text);
	return asString(value);
}
function mapPart(row) {
	return {
		partNumber: asString(row.part_number),
		name: asString(row.name),
		logger: asString(row.logger),
		type: asString(row.type),
		counts: asString(row.counts),
		directional: asBool(row.directional),
		buildTimeHours: asNumber(row.build_time_hours),
		notes: asString(row.notes),
		active: asBool(row.active)
	};
}
function mapWo(row) {
	return {
		woNumber: asString(row.wo_number),
		part: asString(row.part),
		qty: Math.max(1, Math.trunc(asNumber(row.qty, 1))),
		status: oneOf(asString(row.status), WO_STATUSES, "pending"),
		buildTimeHours: row.build_time_hours == null || row.build_time_hours === "" ? null : asNumber(row.build_time_hours),
		dateAdded: asDate(row.date_added) ?? todayIso(),
		dateStarted: asDate(row.date_started),
		dateClosed: asDate(row.date_closed),
		assignedBuild: asString(row.assigned_build),
		assignedNext: asString(row.assigned_next),
		builtInSage: asBool(row.built_in_sage),
		notesToProduction: asNoteText(row.notes_to_production) || asNoteText(row.production_notes),
		buildOrderNotes: asString(row.notes_from_sales),
		hardwareHistory: asNotes(row.hardware_history),
		customerNeedDate: asDate(row.customer_need_date)
	};
}
function mapUnit(row) {
	return {
		id: asNumber(row.id),
		workOrderNumber: asString(row.work_order_number),
		unitId: asString(row.unit_id),
		serialOrId: asString(row.serial_or_id),
		status: oneOf(asString(row.status), UNIT_STATUSES, "in build"),
		salesOrderNumber: asString(row.sales_order_number) || null,
		despatchDate: asDate(row.despatch_date),
		notes: asNotes(row.notes)
	};
}
function asCauses(value) {
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
	const allowed = new Set(QT_CAUSES);
	const out = [];
	for (const item of parsed) {
		const s = String(item).trim();
		if (allowed.has(s) && !out.includes(s)) out.push(s);
	}
	return out;
}
function mapTicket(row) {
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
		notes: asNotes(row.notes)
	};
}
function mapSo(row) {
	return {
		soNumber: asString(row.so_number),
		company: asString(row.company),
		orderDate: asDate(row.order_date),
		leadTimeWeeks: row.lead_time_weeks == null || row.lead_time_weeks === "" ? null : asNumber(row.lead_time_weeks),
		targetDespatch: asDate(row.target_despatch),
		targetDespatchIsOverride: asBool(row.target_despatch_is_override),
		status: oneOf(asString(row.status), SO_STATUSES, "open"),
		sageId: asString(row.sage_id),
		despatchDate: asDate(row.despatch_date),
		notesToProduction: asNoteText(row.sales_notes),
		notesLine1: asString(row.notes_line1)
	};
}
function mapLine(row) {
	return {
		id: asNumber(row.id),
		soNumber: asString(row.so_number),
		part: asString(row.part),
		qty: Math.max(1, Math.trunc(asNumber(row.qty, 1))),
		workOrderNumber: asString(row.work_order_number),
		despatchWoNumber: asString(row.despatch_wo_number),
		despatchDate: asDate(row.despatch_date)
	};
}
function mapTask(row) {
	return {
		id: asNumber(row.id),
		taskNumber: asString(row.task_number) || `TSK-${asNumber(row.id)}`,
		title: asString(row.title),
		assignedBuild: asString(row.assigned_build),
		hours: asNumber(row.hours),
		status: oneOf(asString(row.status), TASK_STATUSES, "pending"),
		dateStarted: asDate(row.date_started),
		dateFinished: asDate(row.date_finished),
		buildOrderNotes: asString(row.build_order_notes)
	};
}
function mapSageLine(row) {
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
		notes: asString(row.notes)
	};
}
function mapQueue(row) {
	const kindRaw = asString(row.kind);
	const kind = kindRaw === "task" || kindRaw === "pt" ? kindRaw : "wo";
	return {
		id: asNumber(row.id),
		assignedBuild: asString(row.assigned_build) || "Unassigned",
		position: asNumber(row.position),
		kind,
		woNumber: asString(row.wo_number),
		taskId: row.task_id == null || row.task_id === "" ? null : asNumber(row.task_id),
		problemId: row.problem_id == null || row.problem_id === "" ? null : asNumber(row.problem_id)
	};
}
function jobKeyOf(entry) {
	if (entry.kind === "task") return `task:${entry.taskId}`;
	if (entry.kind === "pt") return `pt:${entry.problemId}`;
	return `wo:${entry.woNumber}`;
}
function queueKeyOf(entry) {
	if (entry.kind === "wo") return `wo:${entry.woNumber}@${entry.assignedBuild}`;
	if (entry.kind === "pt") return `pt:${entry.problemId}@${entry.assignedBuild}`;
	return jobKeyOf(entry);
}
function mapProblem(row) {
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
		consumed: asConsumed(row.consumed)
	};
}
function mapProspectSettings(_row) {
	return {
		baseUrl: "",
		hasKey: false
	};
}
async function activeKeySet() {
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
	return /* @__PURE__ */ new Set([
		...wos.map((r) => `wo:${r.wo_number}`),
		...tasks.map((r) => `task:${r.id}`),
		...pts.map((r) => `pt:${r.id}`)
	]);
}
function whoOf(assigned) {
	return assigned.trim() || "Unassigned";
}
async function pinActivesFirst(who) {
	const sql = await getSql();
	const mapped = (await sql`
    select * from build_queue where assigned_build = ${whoOf(who)} order by position, id
  `).map(mapQueue);
	const active = await activeKeySet();
	const next = [...mapped.filter((e) => active.has(jobKeyOf(e))), ...mapped.filter((e) => !active.has(jobKeyOf(e)))];
	for (let i = 0; i < next.length; i += 1) await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
}
function deriveBuildOrder(queue) {
	const whoRank = (who) => {
		if (who === "Simon") return 0;
		if (who === "David") return 1;
		if (who === "Donald") return 2;
		return 3;
	};
	return [...queue].sort((a, b) => {
		const r = whoRank(a.assignedBuild) - whoRank(b.assignedBuild);
		if (r !== 0) return r;
		return a.position - b.position || a.id - b.id;
	}).filter((e) => e.kind === "wo" && e.woNumber).map((e) => e.woNumber);
}
function isOpenStatus(status) {
	return status === "pending" || status === "active" || status === "on_hold";
}
async function shipLine(sql, line, woField, date) {
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
		for (const unit of units) await sql`
        update units set
          sales_order_number = ${line.soNumber},
          despatch_date = ${date},
          status = ${"shipped"}
        where id = ${unit.id}
      `;
	}
}
async function appendDespatchHistory(sql, woNumber, line) {
	const rows = await sql`
    select * from work_orders where wo_number = ${woNumber} limit 1
  `;
	if (!rows[0]) return;
	const wo = mapWo(rows[0]);
	const text = `Shipped on ${line.soNumber} — ${line.part || "part"} × ${line.qty}`;
	if (wo.hardwareHistory.some((n) => n.text === text || /shipped on/i.test(n.text) && n.text.includes(line.soNumber))) return;
	const notes = [...wo.hardwareHistory, {
		date: nowStamp(),
		author: "Shipping",
		text
	}];
	await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}
async function stampSalesOrderDespatch(sql, soNumber, date) {
	await sql`
    update sales_orders set despatch_date = ${date}
    where so_number = ${soNumber}
  `;
	if ((await sql`
    select id from sales_lines
    where so_number = ${soNumber}
      and despatch_date is null
  `).length === 0) await sql`
      update sales_orders set status = ${"despatched"}
      where so_number = ${soNumber}
        and status in ('open', 'waiting_on_customer')
    `;
}
async function nextWoNumberValue() {
	const rows = await (await getSql())`select wo_number from work_orders`;
	const used = new Set(rows.map((r) => r.wo_number));
	let n = 508;
	while (used.has(String(n))) n += 1;
	return String(n);
}
function nextPrefixedNumber(values, prefix) {
	const re = new RegExp(`^${prefix}-(\\d+)$`, "i");
	let max = 0;
	for (const value of values) {
		const m = re.exec(value ?? "");
		if (m) max = Math.max(max, Number(m[1]));
	}
	return `${prefix}-${max + 1}`;
}
async function nextQtNumberValue() {
	return nextPrefixedNumber((await (await getSql())`
    select ticket_number from quality_tickets
  `).map((r) => asString(r.ticket_number)), "QT");
}
async function nextTskNumberValue() {
	return nextPrefixedNumber((await (await getSql())`
    select task_number from build_tasks
  `).map((r) => asString(r.task_number)), "TSK");
}
async function loadState() {
	const sql = await getSql();
	const [parts, workOrders, units, tickets, queueRows, taskRows, problemRows, salesOrders, salesLines, sageRows, sageMeta, settingsRows] = await Promise.all([
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
		sql`select * from floor_settings where id = 1 limit 1`
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
		queue = (await sql`
      select * from build_queue order by assigned_build, position, id
    `).map(mapQueue);
	}
	const onPtQueue = new Set(queue.filter((e) => e.kind === "pt").map((e) => e.problemId).filter((id) => id != null));
	const missingPt = problems.filter((p) => p.status !== "done" && !onPtQueue.has(p.id));
	if (missingPt.length) {
		for (const p of missingPt) await appendProblemToQueue(p.id, p.assignedBuild);
		queue = (await sql`
      select * from build_queue order by assigned_build, position, id
    `).map(mapQueue);
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
		sagePackMeta: sageMeta[0] ? {
			uploadedAt: asString(sageMeta[0].uploaded_at) || null,
			filename: asString(sageMeta[0].filename),
			rowCount: asNumber(sageMeta[0].row_count)
		} : {
			uploadedAt: null,
			filename: "",
			rowCount: 0
		},
		prospect: mapProspectSettings(settingsRows[0]),
		buildSpec,
		buildRecords,
		nextWoNumber: await nextWoNumberValue(),
		nextQtNumber: await nextQtNumberValue(),
		nextTskNumber: await nextTskNumberValue()
	};
}
async function getWorkOrder(woNumber) {
	const rows = await (await getSql())`
    select * from work_orders where wo_number = ${woNumber} limit 1
  `;
	return rows[0] ? mapWo(rows[0]) : null;
}
async function appendWoHistory(sql, woNumber, author, text) {
	const wo = await getWorkOrder(woNumber);
	if (!wo) return;
	const notes = [...wo.hardwareHistory, {
		date: nowStamp(),
		author,
		text
	}];
	await sql`
    update work_orders
    set hardware_history = ${JSON.stringify(notes)}::jsonb
    where wo_number = ${woNumber}
  `;
}
async function setWoNotesToProduction(sql, woNumber, text) {
	await sql`
    update work_orders set
      notes_to_production = ${text},
      production_notes = '[]'::jsonb
    where wo_number = ${woNumber}
  `;
}
async function linkedWoNumbers(sql, soNumber) {
	const lines = await sql`
    select work_order_number from sales_lines
    where so_number = ${soNumber} and coalesce(work_order_number, '') <> ''
  `;
	return [...new Set(lines.map((l) => asString(l.work_order_number).trim()).filter(Boolean))];
}
function formatTicketWos(raw) {
	return parseWoNumbers(raw).join(", ");
}
async function workOrdersFromField(raw) {
	const field = formatTicketWos(raw);
	const wos = [];
	for (const n of parseWoNumbers(field)) {
		const wo = await getWorkOrder(n);
		if (wo) wos.push(wo);
	}
	return {
		field,
		wos
	};
}
async function removeFromBuildOrder(woNumber) {
	const sql = await getSql();
	const row = await sql`
    select assigned_build from build_queue where wo_number = ${woNumber} limit 1
  `;
	await sql`delete from build_queue where wo_number = ${woNumber}`;
	if (row[0]) await reindexWho(asString(row[0].assigned_build));
}
async function reindexWho(who) {
	const sql = await getSql();
	const rows = await sql`
    select id from build_queue where assigned_build = ${who} order by position, id
  `;
	for (let i = 0; i < rows.length; i += 1) await sql`update build_queue set position = ${i} where id = ${rows[i].id}`;
}
async function nextQueuePosition(who) {
	return asNumber((await (await getSql())`
    select max(position) as max_pos from build_queue where assigned_build = ${who}
  `)[0]?.max_pos, -1) + 1;
}
async function appendProblemToQueue(problemId, assignedBuild) {
	await syncPtQueue(problemId, [assignedBuild]);
}
async function syncPtQueue(problemId, people) {
	const sql = await getSql();
	const unique = [...new Set(people.map((p) => whoOf(p)))];
	const rows = await sql`
    select id, assigned_build from build_queue where problem_id = ${problemId}
  `;
	const have = new Set(rows.map((r) => r.assigned_build));
	for (const row of rows) if (!unique.includes(asString(row.assigned_build))) {
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
async function clearPtQueue(problemId) {
	const sql = await getSql();
	const rows = await sql`
    select assigned_build from build_queue where problem_id = ${problemId}
  `;
	await sql`delete from build_queue where problem_id = ${problemId}`;
	const seen = /* @__PURE__ */ new Set();
	for (const row of rows) {
		const who = asString(row.assigned_build);
		if (seen.has(who)) continue;
		seen.add(who);
		await reindexWho(who);
	}
}
async function appendToBuildOrder(woNumber) {
	await syncWoQueue(woNumber, [(await getWorkOrder(woNumber))?.assignedBuild ?? "Simon"]);
}
async function syncWoQueue(woNumber, people) {
	const sql = await getSql();
	const unique = [...new Set(people.map((p) => whoOf(p)))];
	const rows = await sql`
    select id, assigned_build from build_queue where wo_number = ${woNumber}
  `;
	const have = new Set(rows.map((r) => r.assigned_build));
	for (const row of rows) if (!unique.includes(asString(row.assigned_build))) {
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
async function applyStatusSideEffects(wo, nextStatus) {
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
		dateClosed
	};
}
function computeTargetDespatch(orderDate, leadTimeWeeks, current, isOverride) {
	if (isOverride) return current;
	if (!orderDate || leadTimeWeeks == null) return current;
	return addCalendarDays(orderDate, Math.round(leadTimeWeeks * 7));
}
var loadFloor_createServerFn_handler = createServerRpc({
	id: "7698363a97252bb67fe34aefa39fdc9bb01e554267844d9c17d3b222a9494610",
	name: "loadFloor",
	filename: "src/lib/floor/api.ts"
}, (opts) => loadFloor.__executeServer(opts));
var loadFloor = createServerFn({ method: "GET" }).middleware([pinMiddleware]).handler(loadFloor_createServerFn_handler, async () => loadState());
var exportFloorZip_createServerFn_handler = createServerRpc({
	id: "63828aafbdc89618cee4188029fa8fc777a8df2a1f6c3ef65cca5a8bb577bdb3",
	name: "exportFloorZip",
	filename: "src/lib/floor/api.ts"
}, (opts) => exportFloorZip.__executeServer(opts));
var exportFloorZip = createServerFn({ method: "GET" }).middleware([pinMiddleware]).handler(exportFloorZip_createServerFn_handler, async () => {
	const state = await loadState();
	const bytes = zipFromFloor(state);
	let binary = "";
	for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
	return {
		filename: `CE-Master-${todayIso()}-csv.zip`,
		base64: btoa(binary)
	};
});
var createWorkOrder_createServerFn_handler = createServerRpc({
	id: "4698416b009bf9491d52783ec05830a079cac194d0fd14a63ab52731696f6deb",
	name: "createWorkOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => createWorkOrder.__executeServer(opts));
var createWorkOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().trim().min(1).optional(),
	part: string().optional(),
	qty: number().int().min(1).optional(),
	status: woStatus.optional(),
	buildTimeHours: number().nullable().optional(),
	assignedBuild: string().optional(),
	assignedNext: string().optional(),
	builtInSage: boolean().optional(),
	notesToProduction: string().optional(),
	buildOrderNotes: string().optional(),
	customerNeedDate: string().nullable().optional()
})).handler(createWorkOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const woNumber = (data.woNumber ?? await nextWoNumberValue()).trim();
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
var updateWorkOrder_createServerFn_handler = createServerRpc({
	id: "84834870ceadaa319bce6f1b86e63b1749dc3f4510e2fd86e9031fa7c1ee1902",
	name: "updateWorkOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateWorkOrder.__executeServer(opts));
var updateWorkOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	part: string().optional(),
	qty: number().int().min(1).optional(),
	status: woStatus.optional(),
	buildTimeHours: number().nullable().optional(),
	assignedBuild: string().optional(),
	assignedNext: string().optional(),
	builtInSage: boolean().optional(),
	notesToProduction: string().optional(),
	buildOrderNotes: string().optional(),
	customerNeedDate: string().nullable().optional(),
	holdReason: string().optional(),
	historyAuthor: string().optional()
})).handler(updateWorkOrder_createServerFn_handler, async ({ data }) => {
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
				text: `On hold: ${reason}`
			});
		} else if (wo.status === "on_hold") history.push({
			date: nowStamp(),
			author,
			text: `Off hold — set to ${WO_STATUS_LABELS[data.status]}.`
		});
		else history.push({
			date: nowStamp(),
			author,
			text: `Status: ${WO_STATUS_LABELS[data.status]}`
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
		const wasPre = (await (await getSql())`
        select assigned_build from build_queue where wo_number = ${data.woNumber}
      `).some((r) => r.assigned_build !== whoOf(wo.assignedBuild));
		const keep = [whoOf(nextWho)];
		const nxt = whoOf(nextNext);
		if (wasPre && nextNext.trim() && nxt !== keep[0]) keep.push(nxt);
		await syncWoQueue(data.woNumber, keep);
	}
	if (data.status && data.status !== wo.status) await pinActivesFirst(nextWho);
	return loadState();
});
var passWorkOrder_createServerFn_handler = createServerRpc({
	id: "d7b517accce96b699dc640d1c107bc92e6e175b1258e9c4ddac3fdd8da937da7",
	name: "passWorkOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => passWorkOrder.__executeServer(opts));
var passWorkOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	historyAuthor: string().optional()
})).handler(passWorkOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const wo = await getWorkOrder(data.woNumber);
	if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
	const next = wo.assignedNext.trim();
	if (!next) throw new Error("Set Who next first");
	if (next === wo.assignedBuild) throw new Error("Who next is already on this job");
	const author = data.historyAuthor?.trim() || "Floor";
	const from = wo.assignedBuild.trim() || "Unassigned";
	const history = [...wo.hardwareHistory, {
		date: nowStamp(),
		author,
		text: `Passed from ${from} to ${next}`
	}];
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
var prePassWorkOrder_createServerFn_handler = createServerRpc({
	id: "14b0c516213dbcc2dafecb1df31c2331f2fbe3d9a055b399be796cced6777240",
	name: "prePassWorkOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => prePassWorkOrder.__executeServer(opts));
var prePassWorkOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	historyAuthor: string().optional()
})).handler(prePassWorkOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const wo = await getWorkOrder(data.woNumber);
	if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
	const next = wo.assignedNext.trim();
	if (!next) throw new Error("Set Who next first");
	if (next === wo.assignedBuild) throw new Error("Who next is already on this job");
	if (!isOpenStatus(wo.status)) throw new Error("Only open jobs can be pre-passed");
	const author = data.historyAuthor?.trim() || "Floor";
	const from = wo.assignedBuild.trim() || "Unassigned";
	const history = [...wo.hardwareHistory, {
		date: nowStamp(),
		author,
		text: `Pre-passed to ${next} (kept on ${from}'s list)`
	}];
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
var reorderBuildOrder_createServerFn_handler = createServerRpc({
	id: "3afa6f029f4c21c7daf55413f5f707d0812ae85148d2851ffae45e0f326ac545",
	name: "reorderBuildOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => reorderBuildOrder.__executeServer(opts));
var reorderBuildOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	who: string().min(1),
	keys: array(string())
})).handler(reorderBuildOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const active = await activeKeySet();
	if (data.who === "pending") {
		const all = (await sql`
        select * from build_queue order by assigned_build, position, id
      `).map(mapQueue);
		const byWho = /* @__PURE__ */ new Map();
		for (const e of all) {
			const list = byWho.get(e.assignedBuild) ?? [];
			list.push(e);
			byWho.set(e.assignedBuild, list);
		}
		const byKey = new Map(all.map((e) => [queueKeyOf(e), e]));
		for (const [who, list] of byWho) {
			const actives = list.filter((e) => active.has(jobKeyOf(e)));
			const pending = [];
			const used = /* @__PURE__ */ new Set();
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
			for (let i = 0; i < next.length; i += 1) await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
		}
		return loadState();
	}
	const current = (await sql`
      select * from build_queue where assigned_build = ${whoOf(data.who)} order by position, id
    `).map(mapQueue);
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
	const next = [
		...chosenActive,
		...leftoverActive,
		...leftoverPending
	];
	for (let i = 0; i < next.length; i += 1) await sql`update build_queue set position = ${i} where id = ${next[i].id}`;
	return loadState();
});
var createBuildTask_createServerFn_handler = createServerRpc({
	id: "d80e433f145d3a846f69c1ba71fa74e1ebfcf7f3eccc664fd270d8a3b77c0144",
	name: "createBuildTask",
	filename: "src/lib/floor/api.ts"
}, (opts) => createBuildTask.__executeServer(opts));
var createBuildTask = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	title: string().min(1),
	hours: number().min(0).optional(),
	assignedBuild: string().optional(),
	taskNumber: string().optional(),
	dateStarted: string().nullable().optional(),
	dateFinished: string().nullable().optional(),
	buildOrderNotes: string().optional()
})).handler(createBuildTask_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const who = whoOf(data.assignedBuild ?? "");
	const hours = data.hours ?? 0;
	const taskNumber = data.taskNumber?.trim() ? displayTsk(data.taskNumber) : await nextTskNumberValue();
	const started = asDate(data.dateStarted ?? null);
	const finished = asDate(data.dateFinished ?? null);
	const status = started && !finished ? "active" : finished ? "done" : "pending";
	const taskId = (await sql`
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
    `)[0]?.id;
	if (taskId == null) throw new Error("Could not create task");
	await sql`
      insert into build_queue (assigned_build, position, kind, task_id)
      values (${who}, ${asNumber((await sql`
      select max(position) as max_pos from build_queue where assigned_build = ${who}
    `)[0]?.max_pos, -1) + 1}, ${"task"}, ${taskId})
    `;
	if (status === "active") await pinActivesFirst(who);
	return loadState();
});
var updateBuildTask_createServerFn_handler = createServerRpc({
	id: "cf82fffbdd24feccf542a250307cd86ebf59ffafb708fa1995d2691144a8d3bb",
	name: "updateBuildTask",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateBuildTask.__executeServer(opts));
var updateBuildTask = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	title: string().optional(),
	hours: number().min(0).optional(),
	status: taskStatus.optional(),
	assignedBuild: string().optional(),
	dateStarted: string().nullable().optional(),
	dateFinished: string().nullable().optional(),
	taskNumber: string().optional(),
	buildOrderNotes: string().optional()
})).handler(updateBuildTask_createServerFn_handler, async ({ data }) => {
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
	const assignedStore = data.assignedBuild === void 0 ? task.assignedBuild : data.assignedBuild.trim();
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
          set assigned_build = ${nextWho}, position = ${asNumber((await sql`
          select max(position) as max_pos from build_queue where assigned_build = ${nextWho}
        `)[0]?.max_pos, -1) + 1}
          where id = ${cur[0].id}
        `;
			await reindexWho(from);
		}
	}
	if (data.status && data.status !== task.status) await pinActivesFirst(nextWho);
	return loadState();
});
var createProblemTicket_createServerFn_handler = createServerRpc({
	id: "145889a39bef30f64b4ab5775dc27d52bede211bff23a0cdba2dcc5a9e2f2fb4",
	name: "createProblemTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => createProblemTicket.__executeServer(opts));
var createProblemTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	prospectNumber: string().min(1),
	title: string().optional(),
	hours: number().min(0).optional(),
	assignedBuild: string().optional(),
	assignedNext: string().optional(),
	customer: string().optional(),
	part: string().optional()
})).handler(createProblemTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const prospectNumber = normalizeProspectNumber(data.prospectNumber);
	if (!prospectNumber) throw new Error("Enter a Prospect problem number");
	if ((await sql`
      select id from problem_tickets where prospect_number = ${prospectNumber} limit 1
    `)[0]) throw new Error(`${displayPt(prospectNumber)} is already on the board`);
	const title = (data.title ?? "").trim();
	const customer = (data.customer ?? "").trim();
	const part = (data.part ?? "").trim();
	const who = data.assignedBuild?.trim() ?? "";
	const id = asNumber((await sql`
      insert into problem_tickets (
        prospect_number, title, part, assigned_build, assigned_next, hours, status,
        date_added, prospect_status, prospect_status_id, customer
      )
      values (
        ${prospectNumber}, ${title}, ${part}, ${who}, ${data.assignedNext?.trim() ?? ""}, ${data.hours ?? 0}, ${"pending"},
        ${todayIso()}, ${""}, ${""}, ${customer}
      )
      returning id
    `)[0]?.id);
	if (!id) throw new Error("Could not create problem ticket");
	await appendProblemToQueue(id, who);
	return loadState();
});
var updateProblemTicket_createServerFn_handler = createServerRpc({
	id: "5e3e837e89d7eeb3712632c4a6d33a5130e4e54d666c6aa1286990d2004c5f21",
	name: "updateProblemTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateProblemTicket.__executeServer(opts));
var updateProblemTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	prospectNumber: string().optional(),
	title: string().optional(),
	part: string().optional(),
	hours: number().min(0).optional(),
	status: taskStatus.optional(),
	assignedBuild: string().optional(),
	assignedNext: string().optional(),
	notes: string().optional(),
	notesToProduction: string().optional(),
	customer: string().optional(),
	prospectStatus: string().optional(),
	dateAdded: string().nullable().optional(),
	dateStarted: string().nullable().optional(),
	dateFinished: string().nullable().optional(),
	consumed: array(object({
		woNumber: string(),
		part: string()
	})).optional()
})).handler(updateProblemTicket_createServerFn_handler, async ({ data }) => {
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
	const assignedStore = data.assignedBuild === void 0 ? pt.assignedBuild : data.assignedBuild.trim();
	const assignedNext = data.assignedNext === void 0 ? pt.assignedNext : data.assignedNext.trim();
	const consumed = data.consumed === void 0 ? pt.consumed : cleanConsumed(data.consumed);
	const dateAdded = data.dateAdded === void 0 ? pt.dateAdded : asDate(data.dateAdded) ?? pt.dateAdded;
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
	if (nextStatus === "done") await clearPtQueue(data.id);
	else {
		const wasPre = (await sql`
        select assigned_build from build_queue where problem_id = ${data.id}
      `).some((r) => r.assigned_build !== whoOf(pt.assignedBuild));
		const keep = [nextWho];
		const nxt = whoOf(assignedNext);
		if (wasPre && assignedNext.trim() && nxt !== keep[0]) keep.push(nxt);
		await syncPtQueue(data.id, keep);
	}
	if (data.status && data.status !== pt.status) await pinActivesFirst(nextWho);
	return loadState();
});
var passProblemTicket_createServerFn_handler = createServerRpc({
	id: "b269a973cb07f1354cb01272910bee8b6d66975b4afb1b6651e4b7d8b1c7a4bc",
	name: "passProblemTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => passProblemTicket.__executeServer(opts));
var passProblemTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ id: number().int() })).handler(passProblemTicket_createServerFn_handler, async ({ data }) => {
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
var prePassProblemTicket_createServerFn_handler = createServerRpc({
	id: "ef1d9f99ca343fffc6dcd162a92821503bd859d047a4ba84c1d2a2b46796ebd1",
	name: "prePassProblemTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => prePassProblemTicket.__executeServer(opts));
var prePassProblemTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ id: number().int() })).handler(prePassProblemTicket_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`select * from problem_tickets where id = ${data.id} limit 1`;
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
var deleteProblemTicket_createServerFn_handler = createServerRpc({
	id: "6a45ef5bada12bb9f42b739ed6ad48efb1f89d1023d39337e92983f1f01b4645",
	name: "deleteProblemTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => deleteProblemTicket.__executeServer(opts));
var deleteProblemTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ id: number().int() })).handler(deleteProblemTicket_createServerFn_handler, async ({ data }) => {
	await clearPtQueue(data.id);
	await (await getSql())`delete from problem_tickets where id = ${data.id}`;
	return loadState();
});
var deleteBuildTask_createServerFn_handler = createServerRpc({
	id: "04ba642b1910688e28e8cb5835c12c1dd70f93566778124186515036e19e255e",
	name: "deleteBuildTask",
	filename: "src/lib/floor/api.ts"
}, (opts) => deleteBuildTask.__executeServer(opts));
var deleteBuildTask = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ id: number().int() })).handler(deleteBuildTask_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const cur = await sql`
      select assigned_build from build_queue where task_id = ${data.id} limit 1
    `;
	await sql`delete from build_queue where task_id = ${data.id}`;
	await sql`delete from build_tasks where id = ${data.id}`;
	if (cur[0]) await reindexWho(asString(cur[0].assigned_build));
	return loadState();
});
var addHardwareHistory_createServerFn_handler = createServerRpc({
	id: "bac858282736cfe739354c498f35df6c9bcdd167208bf959a81605ad7ed63fa7",
	name: "addHardwareHistory",
	filename: "src/lib/floor/api.ts"
}, (opts) => addHardwareHistory.__executeServer(opts));
var addHardwareHistory = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	author: string(),
	text: string().min(1)
})).handler(addHardwareHistory_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const wo = await getWorkOrder(data.woNumber);
	if (!wo) throw new Error(`Work order ${data.woNumber} not found`);
	const notes = [...wo.hardwareHistory, {
		date: nowStamp(),
		author: data.author,
		text: data.text.trim()
	}];
	await sql`
      update work_orders
      set hardware_history = ${JSON.stringify(notes)}::jsonb
      where wo_number = ${data.woNumber}
    `;
	return loadState();
});
var createPart_createServerFn_handler = createServerRpc({
	id: "522588827d1f9dc7d6125b618f85b3ab272a2820d36f48e3c162a063d211f64b",
	name: "createPart",
	filename: "src/lib/floor/api.ts"
}, (opts) => createPart.__executeServer(opts));
var createPart = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	partNumber: string().trim().min(1),
	name: string().optional(),
	logger: string().optional(),
	type: string().optional(),
	counts: string().optional(),
	directional: boolean().optional(),
	buildTimeHours: number().optional(),
	notes: string().optional(),
	active: boolean().optional()
})).handler(createPart_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if ((await sql`
      select part_number from parts where part_number = ${data.partNumber}
    `).length) throw new Error(`Part ${data.partNumber} already exists`);
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
var updatePart_createServerFn_handler = createServerRpc({
	id: "a5c33d80767a3c32c5af9f151f644732e320ddc0c7fb8c68b0ea5c211f4f59bc",
	name: "updatePart",
	filename: "src/lib/floor/api.ts"
}, (opts) => updatePart.__executeServer(opts));
var updatePart = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	partNumber: string().min(1),
	nextPartNumber: string().optional(),
	name: string().optional(),
	logger: string().optional(),
	type: string().optional(),
	counts: string().optional(),
	directional: boolean().optional(),
	buildTimeHours: number().optional(),
	notes: string().optional(),
	active: boolean().optional()
})).handler(updatePart_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`
      select * from parts where part_number = ${data.partNumber} limit 1
    `;
	if (!rows[0]) throw new Error(`Part ${data.partNumber} not found`);
	const current = mapPart(rows[0]);
	const nextNumber = (data.nextPartNumber ?? current.partNumber).trim();
	if (!nextNumber) throw new Error("Part number cannot be blank");
	if (nextNumber !== current.partNumber) {
		if ((await sql`
        select part_number from parts where part_number = ${nextNumber} limit 1
      `)[0]) throw new Error(`Part ${nextNumber} already exists`);
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
var addUnit_createServerFn_handler = createServerRpc({
	id: "3fac9595e0266337037051442bbd49e6f74279c890171f7e5ae0babed0e58274",
	name: "addUnit",
	filename: "src/lib/floor/api.ts"
}, (opts) => addUnit.__executeServer(opts));
var addUnit = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ woNumber: string().min(1) })).handler(addUnit_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!await getWorkOrder(data.woNumber)) throw new Error(`Work order ${data.woNumber} not found`);
	const existing = await sql`
      select unit_id from units where work_order_number = ${data.woNumber}
    `;
	let max = 0;
	const prefix = `${data.woNumber}-`;
	for (const row of existing) if (asString(row.unit_id).startsWith(prefix)) {
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
var updateUnit_createServerFn_handler = createServerRpc({
	id: "548e86e363999d411c30978d5f3ccd79c72d02182bffd4e33c063c269786d09f",
	name: "updateUnit",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateUnit.__executeServer(opts));
var updateUnit = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	serialOrId: string().optional(),
	status: unitStatus.optional(),
	salesOrderNumber: string().nullable().optional(),
	despatchDate: string().nullable().optional()
})).handler(updateUnit_createServerFn_handler, async ({ data }) => {
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
var addUnitNote_createServerFn_handler = createServerRpc({
	id: "a07d2d7775916b1a7ef0a7d667f794e03a315a79c4d33802bd2205ddbc75164e",
	name: "addUnitNote",
	filename: "src/lib/floor/api.ts"
}, (opts) => addUnitNote.__executeServer(opts));
var addUnitNote = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	author: string(),
	text: string().min(1)
})).handler(addUnitNote_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`
      select * from units where id = ${data.id} limit 1
    `;
	if (!rows[0]) throw new Error("Unit not found");
	const notes = [...mapUnit(rows[0]).notes, {
		date: nowStamp(),
		author: data.author,
		text: data.text
	}];
	await sql`
      update units set notes = ${JSON.stringify(notes)}::jsonb where id = ${data.id}
    `;
	return loadState();
});
var createTicket_createServerFn_handler = createServerRpc({
	id: "6fd3648797fc59d138c6e202d7466ef5bc5660869cc53492aebe2fe403753d18",
	name: "createTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => createTicket.__executeServer(opts));
var createTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	workOrderNumber: string().optional(),
	unitId: string().nullable().optional(),
	title: string().optional(),
	problem: string().optional(),
	causes: array(_enum(QT_CAUSES)).optional(),
	furtherAction: boolean().optional(),
	assignedTo: string().optional(),
	status: ticketStatus.optional(),
	part: string().optional()
})).handler(createTicket_createServerFn_handler, async ({ data }) => {
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
var updateTicket_createServerFn_handler = createServerRpc({
	id: "092a5c3c8b558ddf6b2971d996ab15839a9e786a35eba56d7761b3827e4af559",
	name: "updateTicket",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateTicket.__executeServer(opts));
var updateTicket = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	ticketNumber: string().min(1),
	workOrderNumber: string().optional(),
	unitId: string().nullable().optional(),
	part: string().optional(),
	title: string().optional(),
	problem: string().optional(),
	causes: array(_enum(QT_CAUSES)).optional(),
	furtherAction: boolean().optional(),
	status: ticketStatus.optional(),
	assignedTo: string().optional()
})).handler(updateTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`
      select * from quality_tickets where ticket_number = ${data.ticketNumber} limit 1
    `;
	if (!rows[0]) throw new Error(`Ticket ${data.ticketNumber} not found`);
	const current = mapTicket(rows[0]);
	let part = data.part ?? current.part;
	let dateClosed = current.dateClosed;
	const nextWo = data.workOrderNumber === void 0 ? current.workOrderNumber : formatTicketWos(data.workOrderNumber);
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
var addTicketNote_createServerFn_handler = createServerRpc({
	id: "35d4b086f95fec74311aae704f9bd252c7d0a46a51f14e67c2cfa6b2ab23851e",
	name: "addTicketNote",
	filename: "src/lib/floor/api.ts"
}, (opts) => addTicketNote.__executeServer(opts));
var addTicketNote = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	ticketNumber: string().min(1),
	author: string(),
	text: string().min(1)
})).handler(addTicketNote_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`
      select * from quality_tickets where ticket_number = ${data.ticketNumber} limit 1
    `;
	if (!rows[0]) throw new Error(`Ticket ${data.ticketNumber} not found`);
	const notes = [...mapTicket(rows[0]).notes, {
		date: nowStamp(),
		author: data.author,
		text: data.text
	}];
	await sql`
      update quality_tickets set notes = ${JSON.stringify(notes)}::jsonb
      where ticket_number = ${data.ticketNumber}
    `;
	return loadState();
});
var createSalesOrder_createServerFn_handler = createServerRpc({
	id: "074704fd4b51152e7a964e0d97617264dd898aae8f22336bb65642df4bc11225",
	name: "createSalesOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => createSalesOrder.__executeServer(opts));
var createSalesOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	soNumber: string().trim().min(1),
	company: string().optional(),
	orderDate: string().nullable().optional(),
	leadTimeWeeks: number().nullable().optional(),
	targetDespatch: string().nullable().optional(),
	targetDespatchIsOverride: boolean().optional(),
	status: soStatus.optional()
})).handler(createSalesOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if ((await sql`
      select so_number from sales_orders where so_number = ${data.soNumber}
    `).length) throw new Error(`Sales order ${data.soNumber} already exists`);
	const orderDate = data.orderDate ?? todayIso();
	const isOverride = data.targetDespatchIsOverride ?? false;
	const target = computeTargetDespatch(orderDate, data.leadTimeWeeks ?? null, data.targetDespatch ?? null, isOverride);
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
var updateSalesOrder_createServerFn_handler = createServerRpc({
	id: "b52eb83020d42d14a9eafd7d182a2fb63cdb8481c06e2bc31deb119693aa7ac2",
	name: "updateSalesOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateSalesOrder.__executeServer(opts));
var updateSalesOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	soNumber: string().min(1),
	company: string().optional(),
	orderDate: string().nullable().optional(),
	leadTimeWeeks: number().nullable().optional(),
	targetDespatch: string().nullable().optional(),
	targetDespatchIsOverride: boolean().optional(),
	status: soStatus.optional(),
	despatchDate: string().nullable().optional(),
	notesToProduction: string().optional()
})).handler(updateSalesOrder_createServerFn_handler, async ({ data }) => {
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
	else if (data.targetDespatch !== void 0 && data.targetDespatch !== current.targetDespatch) isOverride = true;
	if (data.orderDate !== void 0 || data.leadTimeWeeks !== void 0) {
		if (!isOverride) target = computeTargetDespatch(orderDate, lead, target, false);
	} else if (data.targetDespatchIsOverride === false) target = computeTargetDespatch(orderDate, lead, target, false);
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
	if (data.notesToProduction !== void 0) for (const woNumber of await linkedWoNumbers(sql, data.soNumber)) await setWoNotesToProduction(sql, woNumber, data.notesToProduction);
	return loadState();
});
var addSalesLine_createServerFn_handler = createServerRpc({
	id: "eb68bbaea46f209b59975eabaa241042171da10d79b12afb0931e943cb03514d",
	name: "addSalesLine",
	filename: "src/lib/floor/api.ts"
}, (opts) => addSalesLine.__executeServer(opts));
var addSalesLine = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	soNumber: string().min(1),
	part: string().optional(),
	qty: number().int().min(1).optional(),
	workOrderNumber: string().optional(),
	company: string().optional(),
	leadTimeWeeks: number().nullable().optional()
})).handler(addSalesLine_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const soNumber = data.soNumber.trim();
	if (!(await sql`
      select so_number from sales_orders where so_number = ${soNumber}
    `).length) {
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
var updateSalesLine_createServerFn_handler = createServerRpc({
	id: "2e2a2e16e34a4cb6ae6574b7274c7c3a262db175235ace0e750e90ef6d3b0e6f",
	name: "updateSalesLine",
	filename: "src/lib/floor/api.ts"
}, (opts) => updateSalesLine.__executeServer(opts));
var updateSalesLine = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	part: string().optional(),
	qty: number().int().min(1).optional(),
	workOrderNumber: string().optional()
})).handler(updateSalesLine_createServerFn_handler, async ({ data }) => {
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
var despatchLine_createServerFn_handler = createServerRpc({
	id: "cf071420ae1cac99e7aa5aea895685743e0bb69be8f1ea2e5065775fa18f475f",
	name: "despatchLine",
	filename: "src/lib/floor/api.ts"
}, (opts) => despatchLine.__executeServer(opts));
var despatchLine = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	id: number().int(),
	despatchWoNumber: string().trim().min(1),
	despatchDate: string().optional()
})).handler(despatchLine_createServerFn_handler, async ({ data }) => {
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
var despatchSalesOrder_createServerFn_handler = createServerRpc({
	id: "e2c25b442fb9f84c969a721d215a441e832fe09e35e08e263a8da95e995fe2d5",
	name: "despatchSalesOrder",
	filename: "src/lib/floor/api.ts"
}, (opts) => despatchSalesOrder.__executeServer(opts));
var despatchSalesOrder = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	soNumber: string().min(1),
	despatchDate: string().optional(),
	lines: array(object({
		id: number().int(),
		despatchWoNumber: string().trim().min(1)
	})).min(1)
})).handler(despatchSalesOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!(await sql`
      select so_number from sales_orders where so_number = ${data.soNumber} limit 1
    `)[0]) throw new Error(`Sales order ${data.soNumber} not found`);
	const date = asDate(data.despatchDate) ?? todayIso();
	for (const item of data.lines) {
		const rows = await sql`
        select * from sales_lines where id = ${item.id} limit 1
      `;
		if (!rows[0]) throw new Error("Sales line not found");
		const line = mapLine(rows[0]);
		if (line.soNumber !== data.soNumber) throw new Error("Line does not belong to this sales order");
		await shipLine(sql, line, item.despatchWoNumber.trim(), date);
	}
	await stampSalesOrderDespatch(sql, data.soNumber, date);
	return loadState();
});
var deleteSalesLine_createServerFn_handler = createServerRpc({
	id: "d8c61472d5304ea8ccd8cae02e2c59d4acaa79ed5a92ba18e2d4ecaccb5ab4a7",
	name: "deleteSalesLine",
	filename: "src/lib/floor/api.ts"
}, (opts) => deleteSalesLine.__executeServer(opts));
var deleteSalesLine = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ id: number().int() })).handler(deleteSalesLine_createServerFn_handler, async ({ data }) => {
	await (await getSql())`delete from sales_lines where id = ${data.id}`;
	return loadState();
});
var wipeFloor_createServerFn_handler = createServerRpc({
	id: "ccf459e2a361cdec016acae3348e074c7dc115d39b629b6429a926ff0ff6ec54",
	name: "wipeFloor",
	filename: "src/lib/floor/api.ts"
}, (opts) => wipeFloor.__executeServer(opts));
var wipeFloor = createServerFn({ method: "POST" }).middleware([pinMiddleware]).handler(wipeFloor_createServerFn_handler, async () => {
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
function b64ToBytes(b64) {
	return Uint8Array.from(Buffer.from(b64, "base64"));
}
var importSagePack_createServerFn_handler = createServerRpc({
	id: "b309c0f6d7ed8f2f7b4f3a8fba8ecd496f2d45987f67d7ce18e0f66d78ed5fef",
	name: "importSagePack",
	filename: "src/lib/floor/api.ts"
}, (opts) => importSagePack.__executeServer(opts));
var importSagePack = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	name: string(),
	kind: _enum(["csv", "xlsx"]),
	content: string()
})).handler(importSagePack_createServerFn_handler, async ({ data }) => {
	const grid = data.kind === "xlsx" ? readXlsx(b64ToBytes(data.content))[0]?.rows ?? [] : parseCsv(data.content);
	if (!grid.length) throw new Error("Empty file");
	const lines = parseSageSopout(grid);
	if (!lines.length) throw new Error("Not a Sage outstanding sales-order export (SOPOUT).");
	const sql = await getSql();
	const existingSos = await sql`
      select so_number, order_date, lead_time_weeks, target_despatch, target_despatch_is_override
      from sales_orders
    `;
	const floorBySo = new Map(existingSos.map((row) => [row.so_number, {
		orderDate: asDate(row.order_date),
		lead: row.lead_time_weeks == null ? null : asNumber(row.lead_time_weeks),
		target: asDate(row.target_despatch),
		isOverride: asBool(row.target_despatch_is_override)
	}]));
	const sageDateBySo = /* @__PURE__ */ new Map();
	const sageNotesBySo = /* @__PURE__ */ new Map();
	for (const line of lines) {
		if (line.orderDate && !sageDateBySo.has(line.soNumber)) sageDateBySo.set(line.soNumber, line.orderDate);
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
	for (const [soNumber, notes] of sageNotesBySo) await sql`
        update sales_orders set notes_line1 = ${notes} where so_number = ${soNumber}
      `;
	await sql`delete from sage_pack_meta`;
	await sql`
      insert into sage_pack_meta (id, filename, row_count)
      values (1, ${data.name}, ${lines.length})
    `;
	return {
		state: await loadState(),
		count: lines.length
	};
});
var setWorkOrderBuildField_createServerFn_handler = createServerRpc({
	id: "f924b78bdee3d26892934ebd919bc5d891af6a416a4630eb0d95a51d050aab45",
	name: "setWorkOrderBuildField",
	filename: "src/lib/floor/api.ts"
}, (opts) => setWorkOrderBuildField.__executeServer(opts));
var setWorkOrderBuildField = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	serial: string().min(1),
	author: string(),
	revision: string().optional(),
	battery: string().optional(),
	notes: string().optional(),
	componentKey: string().optional(),
	componentValue: string().optional(),
	componentLabel: string().optional()
})).handler(setWorkOrderBuildField_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!await getWorkOrder(data.woNumber)) throw new Error(`Work order ${data.woNumber} not found`);
	await setBuildField(sql, data);
	return loadState();
});
var setWorkOrderConsumed_createServerFn_handler = createServerRpc({
	id: "f315b1d5a58f00c6b226a237bd592c4fd02ea190aa84b862f83839d31baeb345",
	name: "setWorkOrderConsumed",
	filename: "src/lib/floor/api.ts"
}, (opts) => setWorkOrderConsumed.__executeServer(opts));
var setWorkOrderConsumed = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	serial: string().min(1),
	items: array(object({
		woNumber: string(),
		part: string()
	}))
})).handler(setWorkOrderConsumed_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!await getWorkOrder(data.woNumber)) throw new Error(`Work order ${data.woNumber} not found`);
	await setConsumed(sql, data);
	return loadState();
});
var writeWorkOrderConsumedHistory_createServerFn_handler = createServerRpc({
	id: "7e396e6ff3b9e80bf687398c4c26078b3d05fa3cc9b230673f2a715966afc429",
	name: "writeWorkOrderConsumedHistory",
	filename: "src/lib/floor/api.ts"
}, (opts) => writeWorkOrderConsumedHistory.__executeServer(opts));
var writeWorkOrderConsumedHistory = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	woNumber: string().min(1),
	serial: string().min(1),
	author: string(),
	items: array(object({
		woNumber: string(),
		part: string()
	})).optional()
})).handler(writeWorkOrderConsumedHistory_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!await getWorkOrder(data.woNumber)) throw new Error(`Work order ${data.woNumber} not found`);
	await writeConsumedHistory(sql, data);
	return loadState();
});
var setPartComponentRequired_createServerFn_handler = createServerRpc({
	id: "bc35b1cc4716a08b2c0a4fbb34325a219cb096f2e5f6a805ff4cbd3d18a3c3cc",
	name: "setPartComponentRequired",
	filename: "src/lib/floor/api.ts"
}, (opts) => setPartComponentRequired.__executeServer(opts));
var setPartComponentRequired = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({
	partNumber: string().min(1),
	componentKey: string().min(1),
	required: boolean()
})).handler(setPartComponentRequired_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (data.required) await sql`
        insert into build_component_map (part_number, component_key)
        values (${data.partNumber.trim()}, ${data.componentKey})
        on conflict do nothing
      `;
	else await sql`
        delete from build_component_map
        where part_number = ${data.partNumber.trim()}
          and component_key = ${data.componentKey}
      `;
	return loadState();
});
var addBuildComponent_createServerFn_handler = createServerRpc({
	id: "ee632f90a2f171800fc54009cc1270ef71a008998dd266465133d8f70b0d4c3b",
	name: "addBuildComponent",
	filename: "src/lib/floor/api.ts"
}, (opts) => addBuildComponent.__executeServer(opts));
var addBuildComponent = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ label: string().min(1) })).handler(addBuildComponent_createServerFn_handler, async ({ data }) => {
	const { componentKey, componentKind } = await import("./types-CcVUDIXB.mjs").then((n) => n.q).then((n) => n.b);
	const label = data.label.trim();
	const key = componentKey(label);
	if (!key) throw new Error("Enter a component name");
	const sql = await getSql();
	const pos = asNumber((await sql`select coalesce(max(position), 0) + 1 as n from build_components`)[0]?.n, 1);
	await sql`
      insert into build_components (component_key, label, kind, position)
      values (${key}, ${label}, ${componentKind(label)}, ${pos})
      on conflict (component_key) do update set label = excluded.label
    `;
	return loadState();
});
var addBuildBattery_createServerFn_handler = createServerRpc({
	id: "56c66dad529e9d1a533641412695c71fcac29fc0f05ffc1190351c96dc04fb21",
	name: "addBuildBattery",
	filename: "src/lib/floor/api.ts"
}, (opts) => addBuildBattery.__executeServer(opts));
var addBuildBattery = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ code: string().min(1) })).handler(addBuildBattery_createServerFn_handler, async ({ data }) => {
	const code = data.code.trim();
	const sql = await getSql();
	await sql`
      insert into build_batteries (code, position) values (${code}, ${asNumber((await sql`select coalesce(max(position), 0) + 1 as n from build_batteries`)[0]?.n, 1)})
      on conflict (code) do nothing
    `;
	return loadState();
});
var removeBuildBattery_createServerFn_handler = createServerRpc({
	id: "a589975789b9d572814b12c200bdc288169feb14cd67ed9b824aa4e75820c89e",
	name: "removeBuildBattery",
	filename: "src/lib/floor/api.ts"
}, (opts) => removeBuildBattery.__executeServer(opts));
var removeBuildBattery = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ code: string().min(1) })).handler(removeBuildBattery_createServerFn_handler, async ({ data }) => {
	await (await getSql())`delete from build_batteries where code = ${data.code}`;
	return loadState();
});
var removeBuildComponent_createServerFn_handler = createServerRpc({
	id: "d2fa274e0a8119bf604cd05784739efc08bc57e261d5cf9bc2a9d2659c2ce149",
	name: "removeBuildComponent",
	filename: "src/lib/floor/api.ts"
}, (opts) => removeBuildComponent.__executeServer(opts));
var removeBuildComponent = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ key: string().min(1) })).handler(removeBuildComponent_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await sql`delete from build_component_map where component_key = ${data.key}`;
	await sql`delete from build_components where component_key = ${data.key}`;
	return loadState();
});
var importFloor_createServerFn_handler = createServerRpc({
	id: "431340ca1318c4c40fc74aae3e6c2b7c9ae49d7684bf768c7a7b289070f0f269",
	name: "importFloor",
	filename: "src/lib/floor/api.ts"
}, (opts) => importFloor.__executeServer(opts));
var importFloor = createServerFn({ method: "POST" }).middleware([pinMiddleware]).validator(object({ files: array(object({
	name: string(),
	kind: _enum(["csv", "xlsx"]),
	content: string()
})) })).handler(importFloor_createServerFn_handler, async ({ data }) => {
	const { applyFloorImport } = await import("./import-data-B9egg8cf.mjs");
	return applyFloorImport(data.files, loadState);
});
//#endregion
export { applyBuildReport as n, replaceLookup as r, api_exports as t };
