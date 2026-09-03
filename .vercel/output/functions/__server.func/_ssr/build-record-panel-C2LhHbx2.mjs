import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { G as snapToWeekday, N as nextWeekday, S as fieldPlaceholder, U as requiredKeysForPart, W as serialsForWorkOrder, _ as componentKind, tt as normalizeWoNumber, x as fieldHint } from "./types-CcVUDIXB.mjs";
import { r as displayWo } from "./prospect-VcFT87HP.mjs";
import { i as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Z as useAuthor } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, o as partOptions, r as ComboCell, s as woOptions, t as AreaCell } from "./cells-BYPIsEx7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/build-record-panel-C2LhHbx2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function partHours(partNumber, parts) {
	const match = parts.find((p) => p.partNumber === partNumber);
	return match ? match.buildTimeHours : 0;
}
/** Hours for a job: WO overwrite, else parts spec × qty. */
function jobHours(wo, parts) {
	if (wo.buildTimeHours != null) return wo.buildTimeHours;
	return partHours(wo.part, parts) * wo.qty;
}
/** Days of work, 8 hours Mon–Fri. Zero hours finishes the same start day. */
function finishOn(startIso, hours) {
	const start = snapToWeekday(startIso);
	if (hours <= 0) return start;
	const days = Math.ceil(hours / 8);
	let cursor = start;
	for (let i = 1; i < days; i += 1) cursor = nextWeekday(cursor);
	return cursor;
}
function queueItemKey(entry) {
	if (entry.kind === "task") return `task:${entry.taskId}`;
	if (entry.kind === "pt") return `pt:${entry.problemId}@${entry.assignedBuild}`;
	return `wo:${entry.woNumber}@${entry.assignedBuild}`;
}
/**
* One person's chain. On-hold / done are skipped.
* An item already started keeps its start date and hours — later tasks on
* another person never move it.
*/
function estimatePersonQueue(entries, workOrders, tasks, parts, today, problems = []) {
	const byWo = new Map(workOrders.map((w) => [w.woNumber, w]));
	const byTask = new Map(tasks.map((t) => [t.id, t]));
	const byPt = new Map(problems.map((p) => [p.id, p]));
	const out = /* @__PURE__ */ new Map();
	let previousComplete = null;
	const ordered = [...entries].sort((a, b) => a.position - b.position);
	for (const entry of ordered) {
		let hours = 0;
		let status = "";
		let dateStarted = null;
		if (entry.kind === "wo") {
			const wo = byWo.get(entry.woNumber);
			if (!wo) continue;
			if (wo.status === "on_hold" || wo.status === "closed" || wo.status === "cancelled") continue;
			hours = jobHours(wo, parts);
			status = wo.status;
			dateStarted = wo.dateStarted;
		} else if (entry.kind === "pt") {
			const pt = entry.problemId != null ? byPt.get(entry.problemId) : void 0;
			if (!pt) continue;
			if (pt.status === "on_hold" || pt.status === "done") continue;
			hours = pt.hours > 0 ? pt.hours : partHours(pt.part, parts);
			status = pt.status;
			dateStarted = pt.dateStarted;
		} else {
			const task = entry.taskId != null ? byTask.get(entry.taskId) : void 0;
			if (!task) continue;
			if (task.status === "on_hold" || task.status === "done") continue;
			hours = task.hours;
			status = task.status;
			dateStarted = task.dateStarted;
		}
		const key = queueItemKey(entry);
		const started = status === "active" && Boolean(dateStarted);
		let start;
		if (started) start = snapToWeekday(dateStarted);
		else if (previousComplete == null) start = snapToWeekday(today);
		else start = nextWeekday(previousComplete);
		const complete = finishOn(start, hours);
		out.set(key, {
			key,
			hours,
			start,
			complete
		});
		previousComplete = complete;
	}
	return out;
}
function keysForWo(state, wo) {
	const keys = [...requiredKeysForPart(state.buildSpec.map, wo.part)];
	const seen = new Set(keys);
	for (const rec of state.buildRecords) {
		if (rec.woNumber !== wo.woNumber) continue;
		for (const k of Object.keys(rec.values)) if (rec.values[k]?.trim() && !seen.has(k)) {
			seen.add(k);
			keys.push(k);
		}
	}
	return keys;
}
function buildFill(state, wo) {
	const keys = keysForWo(state, wo);
	const serials = serialsForWorkOrder(wo.qty, state.buildRecords.filter((r) => r.woNumber === wo.woNumber).map((r) => r.serial), state.units.filter((u) => u.workOrderNumber === wo.woNumber).map((u) => u.serialOrId || u.unitId));
	const hasBattery = state.buildSpec.batteries.length > 0;
	let filled = 0;
	let total = 0;
	for (const serial of serials) {
		const rec = state.buildRecords.find((r) => r.woNumber === wo.woNumber && r.serial === serial);
		total += 1;
		if ((rec?.revision ?? "").trim()) filled += 1;
		if (hasBattery) {
			total += 1;
			if ((rec?.battery ?? "").trim()) filled += 1;
		}
		for (const key of keys) {
			total += 1;
			if ((rec?.values[key] ?? "").trim()) filled += 1;
		}
		if ((rec?.consumed ?? []).length) {
			total += 1;
			filled += 1;
		}
	}
	return {
		filled,
		total
	};
}
function linkOptions(state, label) {
	const stem = label.replace(/\s*\([^)]*\)\s*$/g, "").trim().toLowerCase();
	const parts = partOptions(state.parts).map((o) => ({
		...o,
		score: o.value.toLowerCase() === stem || o.value.toLowerCase().includes(stem) || stem.includes(o.value.toLowerCase()) ? 0 : 2
	}));
	return [...woOptions(state.workOrders).map((o) => {
		const part = (state.workOrders.find((w) => w.woNumber === o.value)?.part ?? "").toLowerCase();
		const score = part === stem || part.includes(stem) || stem && stem.includes(part) && part.length > 3 ? 0 : 1;
		return {
			...o,
			score
		};
	}), ...parts].sort((a, b) => a.score - b.score || a.value.localeCompare(b.value, void 0, { numeric: true }));
}
function partForWo(state, woNumber) {
	const n = normalizeWoNumber(woNumber) || woNumber.trim();
	if (!n) return "";
	return state.workOrders.find((w) => w.woNumber === n)?.part ?? "";
}
function BuildRecordPanel({ wo, state }) {
	const mut = useFloorMutations();
	const { author } = useAuthor();
	const spec = state.buildSpec;
	const components = keysForWo(state, wo).map((k) => {
		return spec.components.find((c) => c.key === k) ?? {
			key: k,
			label: k,
			kind: componentKind(k),
			position: 999
		};
	});
	const serials = serialsForWorkOrder(wo.qty, state.buildRecords.filter((r) => r.woNumber === wo.woNumber).map((r) => r.serial), state.units.filter((u) => u.workOrderNumber === wo.woNumber).map((u) => u.serialOrId || u.unitId));
	const who = author.trim() || "Shop";
	const woSet = new Set(state.workOrders.map((w) => w.woNumber));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Build record"
			}),
			spec.components.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 mb-3 text-sm text-muted",
				children: [
					"No component lookup yet. Upload it on",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/parts",
						className: "text-primary",
						children: "Parts spec"
					}),
					". You can still list consumed work orders below."
				]
			}) : components.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 mb-3 text-sm text-muted",
				children: [wo.part || "This part", " has no required components. Mark them with X on Parts spec. Consumed WOs can still be listed."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 mb-3 text-sm text-muted",
				children: [
					"Fields marked X for ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-ink",
						children: wo.part
					}),
					". PCBs take a serial or lot; assemblies take another WO or a part. List consumed WOs, then write them to hardware history."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: serials.map((serial) => {
					const rec = state.buildRecords.find((r) => r.woNumber === wo.woNumber && r.serial === serial);
					const batteries = [...spec.batteries];
					if (rec?.battery && !batteries.includes(rec.battery)) batteries.unshift(rec.battery);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[var(--radius-sm)] border border-border p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 font-mono text-sm font-semibold",
								children: ["Serial ", serial]
							}),
							components.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "build-field",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Revision", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "build-kind",
											children: "rev"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
											value: rec?.revision ?? "",
											placeholder: "Build revision",
											onSave: (v) => mut.setBuildField.mutate({
												woNumber: wo.woNumber,
												serial,
												author: who,
												revision: v
											})
										})]
									}),
									batteries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "build-field",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Battery", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "build-kind",
											children: "type"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
											value: rec?.battery ?? "",
											options: batteries.map((b) => ({ value: b })),
											placeholder: "Battery",
											onSave: (v) => mut.setBuildField.mutate({
												woNumber: wo.woNumber,
												serial,
												author: who,
												battery: v
											})
										})]
									}) : null,
									components.map((comp) => {
										const value = rec?.values[comp.key] ?? "";
										const linked = woSet.has(value.trim());
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "build-field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [comp.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
												className: "build-kind",
												children: fieldHint(comp.kind)
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [comp.kind === "pcb" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
												value,
												placeholder: fieldPlaceholder(comp.kind),
												mono: true,
												onSave: (v) => mut.setBuildField.mutate({
													woNumber: wo.woNumber,
													serial,
													author: who,
													componentKey: comp.key,
													componentValue: v,
													componentLabel: comp.label
												})
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
												value,
												options: linkOptions(state, comp.label),
												placeholder: fieldPlaceholder(comp.kind),
												onSave: (v) => mut.setBuildField.mutate({
													woNumber: wo.woNumber,
													serial,
													author: who,
													componentKey: comp.key,
													componentValue: v,
													componentLabel: comp.label
												})
											}), linked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/work-orders/$woNumber",
												params: { woNumber: value.trim() },
												className: "mt-0.5 inline-block text-xs font-medium text-primary",
												children: ["Open ", displayWo(value.trim())]
											}) : null] })]
										}, comp.key);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "build-field",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Non-conformity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
											value: rec?.notes ?? "",
											placeholder: "Notes",
											onSave: (v) => mut.setBuildField.mutate({
												woNumber: wo.woNumber,
												serial,
												author: who,
												notes: v
											})
										})]
									})
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsumedBlock, {
								parentWo: wo.woNumber,
								serial,
								items: rec?.consumed ?? [],
								state,
								mut,
								who
							})
						]
					}, serial);
				})
			})
		]
	});
}
function ConsumedBlock({ parentWo, serial, items, state, mut, who }) {
	const [rows, setRows] = (0, import_react.useState)(() => items.length ? items : [{
		woNumber: "",
		part: ""
	}]);
	const itemsKey = JSON.stringify(items);
	(0, import_react.useEffect)(() => {
		const serverItems = itemsKey === "[]" ? [] : JSON.parse(itemsKey);
		setRows((prev) => {
			const empties = prev.filter((r) => !r.woNumber.trim() && !r.part.trim());
			const next = serverItems.length ? serverItems.map((r) => ({ ...r })) : [];
			if (empties.length) next.push(...empties.map((r) => ({ ...r })));
			if (!next.length) next.push({
				woNumber: "",
				part: ""
			});
			return next;
		});
	}, [itemsKey]);
	const woOpts = woOptions(state.workOrders.filter((w) => w.woNumber !== parentWo));
	const partOpts = partOptions(state.parts);
	function persist(next) {
		setRows(next.length ? next : [{
			woNumber: "",
			part: ""
		}]);
		mut.setConsumed.mutate({
			woNumber: parentWo,
			serial,
			items: next
		});
	}
	function setRow(index, patch) {
		persist(rows.map((row, i) => i === index ? {
			...row,
			...patch
		} : row));
	}
	function setWo(index, raw) {
		const woNumber = normalizeWoNumber(raw) || raw.trim();
		const lookedUp = partForWo(state, woNumber);
		const current = rows[index];
		setRow(index, {
			woNumber,
			part: lookedUp || current?.part || ""
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "consumed-block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "consumed-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Consumed work orders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					disabled: mut.writeConsumedHistory.isPending,
					onClick: () => {
						const payload = rows.filter((r) => r.woNumber.trim() || r.part.trim());
						if (!payload.length) {
							toast.error("Add a consumed WO first");
							return;
						}
						mut.writeConsumedHistory.mutate({
							woNumber: parentWo,
							serial,
							author: who,
							items: payload
						}, { onSuccess: () => toast.success("Written to hardware history") });
					},
					children: "Write to history log"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm text-muted",
				children: "WOs used to build this unit. Type a WO and the part fills in. You can still type the part yourself."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "consumed-table",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "WO" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, index) => {
					const linked = Boolean(row.woNumber) && state.workOrders.some((w) => w.woNumber === row.woNumber);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: row.woNumber,
							options: woOpts,
							placeholder: "WO number",
							onSave: (v) => setWo(index, v)
						}), linked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/work-orders/$woNumber",
							params: { woNumber: row.woNumber },
							className: "mt-0.5 inline-block text-xs font-medium text-primary",
							children: ["Open ", displayWo(row.woNumber)]
						}) : null] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: row.part,
							options: partOpts,
							placeholder: "Part",
							onSave: (v) => setRow(index, { part: v.trim() })
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-10 items-center justify-center text-muted hover:text-danger",
							"aria-label": "Remove consumed WO",
							disabled: !row.woNumber && !row.part && rows.length === 1,
							onClick: () => persist(rows.filter((_, i) => i !== index)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						}) })
					] }, `${row.woNumber}-${index}`);
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: () => setRows((r) => [...r, {
						woNumber: "",
						part: ""
					}]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Add WO"]
				})
			})
		]
	});
}
//#endregion
export { queueItemKey as a, jobHours as i, buildFill as n, estimatePersonQueue as r, BuildRecordPanel as t };
