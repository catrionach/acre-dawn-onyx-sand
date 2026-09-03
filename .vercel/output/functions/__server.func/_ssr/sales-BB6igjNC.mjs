import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, x as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { K as todayIso, M as isPastDate, Q as isProformaNote, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { f as ChevronRight, i as Trash2, m as ChevronDown, s as Plus } from "../_libs/lucide-react.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, q as FilterChip } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, c as woOptionsForPart, i as SelectCell, o as partOptions, r as ComboCell, t as AreaCell } from "./cells-BYPIsEx7.mjs";
import { a as WoId, r as SoId } from "./id-stack-BLCvv55O.mjs";
import { i as WoPill, n as SoPill, r as UnitPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales-BB6igjNC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_OPTS = [
	{
		value: "open",
		label: "Open"
	},
	{
		value: "waiting_on_customer",
		label: "Waiting on customer"
	},
	{
		value: "despatched",
		label: "Despatched"
	},
	{
		value: "cancelled",
		label: "Cancelled"
	}
];
function SageNotesCell({ value }) {
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
			children: "Proforma — do not ship yet"
		}) : null]
	});
}
function SalesScreen({ openId }) {
	const floor = useFloor();
	const mut = useFloorMutations();
	const navigate = useNavigate();
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Sales orders" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loaded, {
		state: floor.data,
		openId,
		showAll,
		setShowAll,
		mut,
		navigate
	});
}
async function fileToSagePayload(file) {
	const name = file.name;
	if (/\.xlsx$/i.test(name) || file.type.includes("spreadsheet")) {
		const buf = new Uint8Array(await file.arrayBuffer());
		let binary = "";
		for (let i = 0; i < buf.length; i += 1) binary += String.fromCharCode(buf[i]);
		return {
			name,
			kind: "xlsx",
			content: btoa(binary)
		};
	}
	return {
		name,
		kind: "csv",
		content: await file.text()
	};
}
function Loaded({ state, openId, showAll, setShowAll, mut, navigate }) {
	const today = todayIso();
	const [draftSo, setDraftSo] = (0, import_react.useState)("");
	const [draftCompany, setDraftCompany] = (0, import_react.useState)("");
	const [draftLead, setDraftLead] = (0, import_react.useState)("4");
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const [draftQty, setDraftQty] = (0, import_react.useState)("1");
	const [draftWo, setDraftWo] = (0, import_react.useState)("");
	const rows = state.salesOrders.filter((so) => {
		if (openId && so.soNumber === openId) return true;
		return showAll ? true : so.status === "open" || so.status === "waiting_on_customer";
	});
	function toggle(soNumber) {
		if (openId === soNumber) navigate({ to: "/sales" });
		else navigate({
			to: "/sales/$soNumber",
			params: { soNumber }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Sales orders",
			hint: "New line: Sage number, part number and qty first. Upload Sage to replace the pack list and overwrite order dates on matching sales orders from Sage’s Sales Order Date.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "sage-pack-upload",
						type: "file",
						accept: ".xlsx,.csv,.xls",
						className: "sr-only",
						disabled: mut.loadSage.isPending,
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (file) fileToSagePayload(file).then((payload) => mut.loadSage.mutate(payload));
							e.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "sage-pack-upload",
							className: mut.loadSage.isPending ? "pointer-events-none opacity-40" : void 0,
							children: mut.loadSage.isPending ? "Uploading Sage…" : "Upload Sage"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						on: showAll,
						onClick: () => setShowAll(!showAll),
						children: showAll ? "Showing all" : "Open + waiting"
					})
				]
			})
		}),
		state.sagePackMeta.filename ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-3 text-sm text-muted",
			children: [
				"Sage pack list: ",
				state.sagePackMeta.filename,
				" · ",
				state.sagePackMeta.rowCount,
				" lines. Shipping uses this until the next upload. Matching SO order dates are overwritten from Sage."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sheet-wrap is-pinned",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "sheet min-w-[70rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SO" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-16",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Trace" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Order date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Lead weeks" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Target despatch" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Despatch date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Sage notes" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes to production" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((so) => {
					const open = openId === so.soNumber;
					const overdue = isPastDate(so.targetDespatch, today) && (so.status === "open" || so.status === "waiting_on_customer");
					const lines = state.salesLines.filter((l) => l.soNumber === so.soNumber);
					const lineRows = lines.length > 0 ? lines : [null];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [lineRows.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: open && i === 0 ? "is-open" : void 0,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": open ? "Collapse" : "Expand",
								onClick: () => toggle(so.soNumber),
								className: "flex h-11 w-full items-center justify-center text-muted",
								children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
							}) : null }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoId, { soNumber: so.soNumber }) }),
							line ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
									value: line.part,
									options: partOptions(state.parts),
									placeholder: "Part",
									onSave: (v) => mut.patchLine.mutate({
										id: line.id,
										part: v
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "number",
									min: 1,
									value: String(line.qty),
									mono: true,
									onSave: (v) => {
										const n = Number.parseInt(v, 10);
										if (Number.isFinite(n) && n >= 1) mut.patchLine.mutate({
											id: line.id,
											qty: n
										});
									}
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
									value: line.workOrderNumber,
									options: woOptionsForPart(state.workOrders, line.part),
									placeholder: "Trace",
									onSave: (v) => mut.patchLine.mutate({
										id: line.id,
										workOrderNumber: v
									})
								}) })
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2.5 text-sm text-muted",
									children: "Part"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2.5 text-sm text-muted",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {})
							] }),
							i === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									value: so.company,
									onSave: (v) => mut.patchSo.mutate({
										soNumber: so.soNumber,
										company: v
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "date",
									value: so.orderDate ?? "",
									onSave: (v) => mut.patchSo.mutate({
										soNumber: so.soNumber,
										orderDate: v || null
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "number",
									min: 0,
									value: so.leadTimeWeeks == null ? "" : String(so.leadTimeWeeks),
									mono: true,
									onSave: (v) => {
										const n = Number.parseFloat(v);
										mut.patchSo.mutate({
											soNumber: so.soNumber,
											leadTimeWeeks: v === "" || !Number.isFinite(n) ? null : n
										});
									}
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "date",
									value: so.targetDespatch ?? "",
									danger: overdue,
									onSave: (v) => mut.patchSo.mutate({
										soNumber: so.soNumber,
										targetDespatch: v || null,
										targetDespatchIsOverride: Boolean(v)
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
									value: so.status,
									options: STATUS_OPTS,
									onSave: (v) => mut.patchSo.mutate({
										soNumber: so.soNumber,
										status: v
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "date",
									value: so.despatchDate ?? "",
									onSave: (v) => mut.patchSo.mutate({
										soNumber: so.soNumber,
										despatchDate: v || null
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "min-w-40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageNotesCell, { value: so.notesLine1 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "min-w-56",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
										value: so.notesToProduction,
										placeholder: "Note to production",
										onSave: (v) => mut.patchSo.mutate({
											soNumber: so.soNumber,
											notesToProduction: v
										})
									})
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 8,
								className: "text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-2.5 text-xs",
									children: "same order"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: line ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Remove line",
								className: "flex size-10 items-center justify-center text-muted hover:text-danger",
								onClick: () => mut.lineDelete.mutate(line.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}) : null })
						]
					}, line ? line.id : `empty-${so.soNumber}`)), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 14,
						className: "bg-bg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesExpand, {
							soNumber: so.soNumber,
							state,
							mut
						})
					}) }) : null] }, so.soNumber);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "is-new",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftSo,
							placeholder: "Sage number",
							mono: true,
							onSave: setDraftSo
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: draftPart,
							options: partOptions(state.parts),
							placeholder: "Part number",
							onSave: setDraftPart
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							type: "number",
							min: 1,
							value: draftQty,
							mono: true,
							placeholder: "Qty",
							onSave: setDraftQty
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: draftWo,
							options: woOptionsForPart(state.workOrders, draftPart),
							placeholder: "Trace",
							onSave: setDraftWo
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftCompany,
							placeholder: "Company (new SO)",
							onSave: setDraftCompany
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
								type: "number",
								min: 0,
								value: draftLead,
								placeholder: "Lead weeks",
								onSave: setDraftLead
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 4 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-1 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								disabled: !draftSo.trim() || !draftPart.trim(),
								onClick: () => {
									const lead = Number.parseFloat(draftLead);
									const qty = Number.parseInt(draftQty, 10);
									mut.lineAdd.mutate({
										soNumber: draftSo.trim(),
										company: draftCompany,
										leadTimeWeeks: Number.isFinite(lead) ? lead : null,
										part: draftPart,
										qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
										workOrderNumber: draftWo
									}, { onSuccess: () => {
										setDraftCompany("");
										setDraftLead("4");
										setDraftPart("");
										setDraftQty("1");
										setDraftWo("");
									} });
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Line"]
							})
						}) })
					]
				})] })]
			})
		})
	] });
}
function SalesExpand({ soNumber, state, mut }) {
	const so = state.salesOrders.find((s) => s.soNumber === soNumber);
	const lines = state.salesLines.filter((l) => l.soNumber === soNumber);
	const units = state.units.filter((u) => u.salesOrderNumber === soNumber);
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const [draftQty, setDraftQty] = (0, import_react.useState)("1");
	const [draftWo, setDraftWo] = (0, import_react.useState)("");
	if (!so) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "expand-panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold",
						children: [
							so.company || "Sales order",
							" · ",
							so.soNumber
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Ordered ",
							formatShopDate(so.orderDate) || "—",
							so.leadTimeWeeks != null ? ` · ${so.leadTimeWeeks} weeks` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoPill, { status: so.status })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-left text-xs uppercase tracking-wide text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-1",
								children: "Part"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-1 w-16",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-1",
								children: "Trace"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-1",
								children: "Status / who"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [lines.map((line) => {
						const wo = state.workOrders.find((w) => w.woNumber === line.workOrderNumber);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
									value: line.part,
									options: partOptions(state.parts),
									onSave: (v) => mut.patchLine.mutate({
										id: line.id,
										part: v
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									type: "number",
									min: 1,
									value: String(line.qty),
									mono: true,
									onSave: (v) => {
										const n = Number.parseInt(v, 10);
										if (Number.isFinite(n) && n >= 1) mut.patchLine.mutate({
											id: line.id,
											qty: n
										});
									}
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
									value: line.workOrderNumber,
									options: woOptionsForPart(state.workOrders, line.part),
									placeholder: "Trace",
									onSave: (v) => mut.patchLine.mutate({
										id: line.id,
										workOrderNumber: v
									})
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-1.5",
									children: [line.workOrderNumber ? wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoPill, { status: wo.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: wo.assignedBuild || "Unassigned"
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Unknown WO"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-warn",
										children: "No WO"
									}), line.despatchDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											"Despatched ",
											formatShopDate(line.despatchDate),
											" from WO",
											" ",
											line.despatchWoNumber
										]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Remove line",
									className: "flex size-10 items-center justify-center text-muted hover:text-danger",
									onClick: () => mut.lineDelete.mutate(line.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								}) })
							]
						}, line.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
								value: draftPart,
								options: partOptions(state.parts),
								placeholder: "Part",
								onSave: setDraftPart
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
								type: "number",
								min: 1,
								value: draftQty,
								mono: true,
								onSave: setDraftQty
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
								value: draftWo,
								options: woOptionsForPart(state.workOrders, draftPart),
								placeholder: "Trace",
								onSave: setDraftWo
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 2,
								className: "px-2 py-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: () => {
										const qty = Number.parseInt(draftQty, 10);
										mut.lineAdd.mutate({
											soNumber,
											part: draftPart,
											qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
											workOrderNumber: draftWo
										}, { onSuccess: () => {
											setDraftPart("");
											setDraftQty("1");
											setDraftWo("");
										} });
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Line"]
								})
							})
						]
					})] })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-sm font-semibold",
						children: "Units tagged to this SO"
					}),
					units.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "None. Units pick up a sales order number only when they are allocated or shipped."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-2 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono font-medium",
								children: unit.unitId
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted",
								children: ["WO ", unit.workOrderNumber]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitPill, { status: unit.status })]
						}, unit.id))
					}),
					lines.some((l) => l.workOrderNumber) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs uppercase tracking-wide text-muted",
							children: "Planned jobs"
						}), Array.from(new Set(lines.map((l) => l.workOrderNumber).filter(Boolean))).map((woNumber) => {
							const wo = state.workOrders.find((w) => w.woNumber === woNumber);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, { woNumber }),
										wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoPill, { status: wo.status }) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted",
											children: wo?.assignedBuild || ""
										})
									]
								})
							}, woNumber);
						})]
					}) : null
				]
			})]
		})
	});
}
function SalesLayout() {
	const params = useParams({ strict: false });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesScreen, { openId: params.soNumber });
}
//#endregion
export { SalesLayout as component };
