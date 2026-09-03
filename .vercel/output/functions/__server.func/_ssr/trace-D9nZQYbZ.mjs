import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { X as buildTraceRows, et as matchTraceRows, nt as parseTraceQuery } from "./types-CcVUDIXB.mjs";
import { K as ErrorBanner, Y as ScreenHeader } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor } from "./queries-vxOhnUUD.mjs";
import { a as WoId, n as QtId, r as SoId, t as PtId } from "./id-stack-BLCvv55O.mjs";
import { t as HistoryButton } from "./notes-list-C5MV8Vkk.mjs";
import { i as WoPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trace-D9nZQYbZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HINTS = [
	"WO-XXX-X",
	"QT-X",
	"SO-X",
	"PT-X"
];
function TraceScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	const [query, setQuery] = (0, import_react.useState)("");
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Trace" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "trace-miss",
		children: "Looking up…"
	})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	const state = floor.data;
	const parsed = parseTraceQuery(query);
	const all = buildTraceRows(state);
	const hits = parsed ? matchTraceRows(all, parsed) : [];
	const byWo = new Map(all.filter((r) => r.woNumber).map((r) => [r.woNumber, r]));
	const woNumbers = relatedWoNumbers(hits);
	const serial = parsed?.kind === "wo" || parsed?.kind === "any" ? parsed.serial : "";
	const orphans = hits.filter((r) => !r.woNumber);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "Trace",
		hint: "Look up a job, ticket or order. Each work order opens its QTs and hardware history."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "trace-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "sr-only",
				htmlFor: "trace-q",
				children: "Trace search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "trace-q",
				className: "trace-search",
				value: query,
				autoFocus: true,
				autoComplete: "off",
				spellCheck: false,
				placeholder: "WO-443-1",
				"aria-label": "Trace search",
				onChange: (e) => setQuery(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "trace-hints",
				children: HINTS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: h }, h))
			}),
			parsed && hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "trace-miss",
				children: [
					"Nothing traces to ",
					query.trim(),
					"."
				]
			}) : null,
			orphans.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrphanHit, { row }, row.key)),
			woNumbers.map((woNumber) => {
				const row = byWo.get(woNumber);
				const wo = state.workOrders.find((w) => w.woNumber === woNumber);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoHit, {
					woNumber,
					row,
					wo,
					serial: serial && hits.some((h) => h.woNumber === woNumber) ? serial : "",
					state,
					onHistory: (author, text) => mut.woHistory.mutate({
						woNumber,
						author,
						text
					})
				}, woNumber);
			})
		]
	})] });
}
function relatedWoNumbers(hits) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (n) => {
		const id = n.trim();
		if (!id || seen.has(id)) return;
		seen.add(id);
		out.push(id);
	};
	for (const row of hits) {
		add(row.woNumber);
		for (const job of row.consumed) add(job.woNumber);
		for (const job of row.usedIn) add(job.woNumber);
	}
	return out;
}
function WoHit({ woNumber, row, wo, serial, state, onHistory }) {
	const part = wo?.part || row?.part || "";
	const units = serial ? state.units.filter((u) => u.workOrderNumber === woNumber && (u.serialOrId === serial || u.unitId === serial)) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "trace-wo",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "trace-wo-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, { woNumber }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "trace-wo-sub",
					children: [
						part ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }) : null,
						wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoPill, { status: wo.status }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "trace-meta",
							children: "Not on the board"
						}),
						serial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "trace-serial",
							children: ["Serial ", serial]
						}) : null
					]
				})]
			}),
			serial && units.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "trace-miss",
				children: [
					"Serial ",
					serial,
					" is not on this work order yet."
				]
			}) : null,
			units.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "trace-unit",
				children: [
					"Unit ",
					u.serialOrId || u.unitId || "—",
					u.status ? ` · ${u.status}` : ""
				]
			}, u.id)),
			row?.sales.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "trace-wo-links",
				children: row.sales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoId, {
					soNumber: s.soNumber,
					compact: true
				}, s.soNumber))
			}) : null,
			row?.pts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "trace-wo-links",
				children: row.pts.map((pt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtId, {
					prospectNumber: pt.prospectNumber,
					compact: true
				}, pt.prospectNumber))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "trace-wo-actions",
				children: [row?.qts.length ? row.qts.map((qt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtId, {
					ticketNumber: qt.ticketNumber,
					compact: true
				}, qt.ticketNumber)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "trace-meta",
					children: "No QTs"
				}), wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "trace-history",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryButton, {
						woNumber: wo.woNumber,
						part: wo.part,
						notes: wo.hardwareHistory,
						onAdd: (n) => onHistory(n.author, n.text)
					})
				}) : null]
			})
		]
	});
}
function OrphanHit({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "trace-wo",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "trace-wo-head",
			children: row.pts[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtId, { prospectNumber: row.pts[0].prospectNumber }) : row.qts[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtId, { ticketNumber: row.qts[0].ticketNumber }) : row.sales[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoId, { soNumber: row.sales[0].soNumber }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: "Untraced"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "trace-miss",
			children: "No work order on this yet."
		})]
	});
}
var SplitComponent = TraceScreen;
//#endregion
export { SplitComponent as component };
