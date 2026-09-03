import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { $ as lookupWoSales, K as todayIso, Q as isProformaNote, ct as salesOrdersReadyToShip, it as sageExtrasForSo, ot as sageNotesLine1, rt as parseWoNumbers, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { r as displayWo } from "./prospect-VcFT87HP.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, c as woOptionsForPart, n as CheckCell, r as ComboCell, s as woOptions } from "./cells-BYPIsEx7.mjs";
import { a as WoId, r as SoId } from "./id-stack-BLCvv55O.mjs";
import { i as WoPill, n as SoPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shipping-BQWK2hUu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShippingScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Shipping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loaded, {
		state: floor.data,
		mut
	});
}
function Loaded({ state, mut }) {
	const [soNumber, setSoNumber] = (0, import_react.useState)("");
	const [woLookup, setWoLookup] = (0, import_react.useState)("");
	const ready = (0, import_react.useMemo)(() => salesOrdersReadyToShip(state), [state]);
	const so = state.salesOrders.find((s) => s.soNumber === soNumber.trim());
	const lines = so ? state.salesLines.filter((l) => l.soNumber === so.soNumber) : [];
	const sage = soNumber.trim() ? sageExtrasForSo(state, soNumber.trim()) : [];
	const sageCompany = sage[0]?.company;
	const notesLine1 = soNumber.trim() ? sageNotesLine1(state, soNumber.trim()) : "";
	const proforma = isProformaNote(notesLine1);
	const soOptions = (0, import_react.useMemo)(() => {
		const fromFloor = state.salesOrders.map((s) => ({
			value: s.soNumber,
			hint: `${s.company || "No company"} · ${s.status}`
		}));
		const floorSet = new Set(state.salesOrders.map((s) => s.soNumber));
		const fromSage = [...new Set(state.sagePackLines.map((l) => l.soNumber))].filter((n) => !floorSet.has(n)).map((n) => {
			return {
				value: n,
				hint: `${state.sagePackLines.find((l) => l.soNumber === n)?.company || "Sage"} · pack list only`
			};
		});
		return [...fromFloor, ...fromSage];
	}, [state.salesOrders, state.sagePackLines]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Shipping",
			hint: "One pack list: Floor lines plus Sage extras. For qty 3 list three WO-numbers with commas (508, 509, 510). Despatch writes that SO onto each job’s hardware log."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-sm font-semibold",
				children: "Ready to ship"
			}), ready.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No open sales orders with every work order closed."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sheet-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "sheet min-w-[48rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SO" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Target" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "WOs" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Sage notes" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ready.map(({ so: row, woNumbers }) => {
						const notes = sageNotesLine1(state, row.soNumber);
						const proforma = isProformaNote(notes);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: soNumber.trim() === row.soNumber ? "is-open" : proforma ? "is-proforma" : void 0,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "block w-full px-2.5 py-1.5 text-left font-medium",
									onClick: () => setSoNumber(row.soNumber),
									children: row.soNumber
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "block w-full px-2.5 py-1.5 text-left",
									onClick: () => setSoNumber(row.soNumber),
									children: row.company || "—"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-2.5",
									children: formatShopDate(row.targetDespatch) || "—"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-2.5 font-mono text-sm",
									children: woNumbers.join(", ")
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoPill, { status: row.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageNoteCell, { value: notes }) })
							]
						}, row.soNumber);
					}) })]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-[12rem] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-xs uppercase tracking-wide text-muted",
						children: "Sales order number"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
						value: soNumber,
						options: soOptions,
						placeholder: "Sage SO",
						onSave: setSoNumber
					})]
				}),
				so ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: so.company || "Sales order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Target ",
								formatShopDate(so.targetDespatch) || "—",
								so.despatchDate ? ` · last sent ${formatShopDate(so.despatchDate)}` : ""
							]
						}),
						notesLine1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: proforma ? "sage-notes-inline is-proforma" : "sage-notes-inline",
							children: [
								"Sage notes: ",
								notesLine1,
								proforma ? " — do not ship yet (proforma)" : ""
							]
						}) : null
					]
				}) : sage.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: sageCompany || "Sage order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Not on Sales orders yet — Sage pack list only."
						}),
						notesLine1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: proforma ? "sage-notes-inline is-proforma" : "sage-notes-inline",
							children: [
								"Sage notes: ",
								notesLine1,
								proforma ? " — do not ship yet (proforma)" : ""
							]
						}) : null
					]
				}) : null,
				so ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoPill, { status: so.status }) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoSalesLookupPanel, {
			state,
			value: woLookup,
			onChange: setWoLookup,
			onOpenSo: setSoNumber
		}),
		!soNumber.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Enter an SO number to pull its lines."
		}) : !so && sage.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-danger",
			children: [
				"No sales order ",
				soNumber.trim(),
				"."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [so && lines.length === 0 && sage.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "This order has no Floor lines yet. Add them on Sales orders."
		}) : null, lines.length > 0 || sage.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShipTable, {
			soNumber: soNumber.trim(),
			canDespatch: Boolean(so) && !proforma,
			proforma,
			notesLine1,
			lines,
			sage,
			meta: state.sagePackMeta,
			state,
			mut
		}, soNumber.trim()) : null] })
	] });
}
function ShipTable({ soNumber, canDespatch, proforma, notesLine1, lines, sage, meta, state, mut }) {
	const [ticked, setTicked] = (0, import_react.useState)(() => {
		const init = {};
		for (const line of lines) if (!line.despatchDate) init[line.id] = true;
		return init;
	});
	const [wos, setWos] = (0, import_react.useState)(() => {
		const init = {};
		for (const line of lines) init[line.id] = line.despatchWoNumber || line.workOrderNumber;
		return init;
	});
	const [date, setDate] = (0, import_react.useState)(todayIso());
	const selected = lines.filter((l) => ticked[l.id] && !l.despatchDate);
	function ship() {
		const payload = selected.map((line) => ({
			id: line.id,
			despatchWoNumber: parseWoNumbers(wos[line.id] ?? "").join(", ")
		})).filter((l) => l.despatchWoNumber);
		if (!payload.length) return;
		mut.shipSo.mutate({
			soNumber,
			despatchDate: date,
			lines: payload
		});
	}
	const canShip = canDespatch && selected.length > 0 && selected.every((l) => parseWoNumbers(wos[l.id] ?? "").length > 0) && !mut.shipSo.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sheet-wrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "sheet min-w-[80rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-12",
						children: "Ship"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "qty-col",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Planned WO" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Trace" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Comment" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Sage notes" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorShipRow, {
					line,
					state,
					notesLine1,
					ticked: Boolean(ticked[line.id]),
					woValue: wos[line.id] ?? "",
					onTick: (next) => setTicked((cur) => ({
						...cur,
						[line.id]: next
					})),
					onWo: (v) => setWos((cur) => ({
						...cur,
						[line.id]: v
					}))
				}, `floor-${line.id}`)), sage.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageShipRow, {
					line,
					notesLine1
				}, `sage-${line.id}`))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				meta.filename ? `Sage extras from ${meta.filename} · ${meta.rowCount} lines. Replaced each week.` : "No Sage file yet. Upload Outstanding Sales Orders on Sales orders.",
				" ",
				"Qty 2+ : list each job with commas, e.g. 508, 509, 510."
			]
		}),
		proforma ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "proforma-banner",
			children: [
				"Sage notes ",
				notesLine1 ? `“${notesLine1}”` : "Proforma",
				" — this order is proforma. Do not ship until it is paid."
			]
		}) : null,
		canDespatch && lines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-end gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-xs uppercase tracking-wide text-muted",
					children: "Despatch date"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "date",
					value: date,
					onSave: setDate
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: !canShip,
					onClick: ship,
					children: "Despatch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pb-1.5 text-sm text-muted",
					children: selected.length ? `${selected.length} line${selected.length === 1 ? "" : "s"} will ship. Each WO-number gets this SO on its hardware log.` : "Tick at least one Floor line."
				})
			]
		}) : proforma ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: "Despatch is blocked until Sage notes are no longer proforma."
		}) : !canDespatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Sage pack list only — add this SO on Sales orders to despatch Floor lines."
		}) : null
	] });
}
function FloorShipRow({ line, state, notesLine1, ticked, woValue, onTick, onWo }) {
	const planned = state.workOrders.find((w) => w.woNumber === line.workOrderNumber);
	const partName = state.parts.find((p) => p.partNumber === line.part)?.name ?? "";
	const done = Boolean(line.despatchDate);
	const parsed = parseWoNumbers(woValue);
	const qty = line.qty;
	const mismatch = !done && qty > 1 && parsed.length > 0 && parsed.length !== qty;
	const options = woOptionsForPart(state.workOrders, line.part);
	const proforma = isProformaNote(notesLine1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: done ? "opacity-70" : proforma ? "is-proforma" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-sm text-ok",
				children: "Sent"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
				checked: ticked,
				label: `Ship ${line.part}`,
				onSave: onTick
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 font-medium",
				children: line.part || "Part?"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-sm",
				children: partName || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 font-mono",
				children: qty
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2.5 py-1.5",
				children: line.workOrderNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					children: displayWo(line.workOrderNumber)
				}), planned ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoPill, { status: planned.status }),
						" ",
						planned.assignedBuild || ""
					]
				}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-warn",
					children: "No plan"
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block px-2.5 font-mono",
				children: [
					parseWoNumbers(line.despatchWoNumber).map(displayWo).join(", ") || line.despatchWoNumber,
					" ",
					"· ",
					formatShopDate(line.despatchDate)
				]
			}) : qty > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				value: woValue,
				placeholder: woPlaceholder(qty),
				mono: true,
				warn: mismatch || qty > 1 && parsed.length === 1,
				onSave: onWo
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `px-2.5 pb-1.5 text-xs ${mismatch ? "text-warn" : "text-muted"}`,
				children: mismatch ? `Qty ${qty} — list ${qty} WO-numbers, commas between them` : parsed.length === qty ? parsed.map(displayWo).join(", ") : `List ${qty} jobs: ${woPlaceholder(qty)}`
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
				value: woValue,
				options,
				placeholder: "Trace",
				onSave: onWo
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-sm text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageNoteCell, { value: notesLine1 }) })
		]
	});
}
function SageShipRow({ line, notesLine1 }) {
	const note = line.notes.trim() || notesLine1;
	const proforma = isProformaNote(note);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: proforma ? "is-task is-proforma" : "is-task",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-sm text-muted",
				children: "Pack"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 font-mono text-sm",
				children: line.part || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: line.description || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 font-mono",
				children: line.qty
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "Sage extra"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-sm text-muted",
				children: line.comment || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageNoteCell, { value: note }) })
		]
	});
}
function SageNoteCell({ value }) {
	const text = value.trim();
	if (!text) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "block px-2.5 text-muted",
		children: "—"
	});
	const proforma = isProformaNote(text);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: proforma ? "sage-notes is-proforma" : "sage-notes",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: text }), proforma ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sage-notes-warn",
			children: "Do not ship yet"
		}) : null]
	});
}
function woPlaceholder(qty) {
	const n = Math.max(qty, 2);
	return Array.from({ length: n }, (_, i) => String(508 + i)).join(", ");
}
var VIA_LABEL = {
	planned: "supply WO",
	despatched: "on pack list",
	unit: "tagged unit"
};
function WoSalesLookupPanel({ state, value, onChange, onOpenSo }) {
	const hit = (0, import_react.useMemo)(() => lookupWoSales(state, value), [state, value]);
	const options = (0, import_react.useMemo)(() => woOptions(state.workOrders), [state.workOrders]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "wo-lookup mb-4 rounded-[var(--radius-md)] border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-xs uppercase tracking-wide text-muted",
				children: "Look up a work order"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
				value,
				options,
				placeholder: "508 or WO-508",
				onSave: onChange
			})]
		}), !hit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Shows which sales orders use this job, and the other WOs on those orders."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, {
						woNumber: hit.woNumber,
						compact: true
					}),
					hit.wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoPill, { status: hit.wo.status }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: hit.wo ? `${hit.wo.part || "No part"} · ${hit.wo.assignedBuild || "Unassigned"}` : "Not on Work orders"
					})
				]
			}), hit.sales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No sales orders linked to this job."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sheet-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "sheet min-w-[40rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SO" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "How this WO" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Other WOs on this SO" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: hit.sales.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 px-2.5 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoId, { soNumber: row.soNumber }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm font-medium text-primary",
								onClick: () => onOpenSo(row.soNumber),
								children: "Pack list"
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block px-2.5 py-1.5",
							children: [row.company || "—", row.soStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-muted",
								children: row.soStatus
							}) : null]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5 text-sm",
							children: row.via.map((v) => VIA_LABEL[v]).join(", ")
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.otherWos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5 text-sm text-muted",
							children: "None"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "wo-lookup-others",
							children: row.otherWos.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "wo-lookup-other",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, {
										woNumber: other.woNumber,
										compact: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [other.part || "—", other.status ? ` · ${other.status}` : ""] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-sm font-medium text-primary",
										onClick: () => onChange(other.woNumber),
										children: "Look up"
									})
								]
							}, other.woNumber))
						}) })
					] }, row.soNumber)) })]
				})
			})]
		})]
	});
}
var SplitComponent = ShippingScreen;
//#endregion
export { SplitComponent as component };
