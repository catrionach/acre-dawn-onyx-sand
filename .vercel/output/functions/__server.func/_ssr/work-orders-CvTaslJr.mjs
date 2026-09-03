import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, x as useParams, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { K as todayIso, M as isPastDate, Z as earliestNeedForWo, at as sageLinesWithoutWo, d as UNIT_STATUS_OPTIONS, k as hoursToDays, m as WO_STATUS_OPTIONS, n as BUILDER_OPTIONS, st as salesLinesWithoutWo, ut as ticketTouchesWo, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { f as ChevronRight, m as ChevronDown, s as Plus } from "../_libs/lucide-react.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, Z as useAuthor, q as FilterChip } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, c as woOptionsForPart, i as SelectCell, n as CheckCell, o as partOptions, r as ComboCell, t as AreaCell } from "./cells-BYPIsEx7.mjs";
import { a as WoId, o as soFileLabel, r as SoId } from "./id-stack-BLCvv55O.mjs";
import { n as HoldReasonDialog, r as NotesList, t as HistoryButton } from "./notes-list-C5MV8Vkk.mjs";
import { t as WhoNextCell } from "./who-next-Da37XhAq.mjs";
import { i as jobHours, n as buildFill, t as BuildRecordPanel } from "./build-record-panel-C2LhHbx2.mjs";
import { r as UnitPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/work-orders-CvTaslJr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_OPTS = WO_STATUS_OPTIONS;
var WHO_OPTS = BUILDER_OPTIONS;
var UNIT_OPTS = UNIT_STATUS_OPTIONS;
function WorkOrdersScreen({ openId }) {
	const floor = useFloor();
	const mut = useFloorMutations();
	const navigate = useNavigate();
	const [showClosed, setShowClosed] = (0, import_react.useState)(false);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Work orders" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loaded, {
		state: floor.data,
		openId,
		showClosed,
		setShowClosed,
		mut,
		navigate
	});
}
function Loaded({ state, openId, showClosed, setShowClosed, mut, navigate }) {
	const today = todayIso();
	const { author } = useAuthor();
	const [holdWo, setHoldWo] = (0, import_react.useState)(null);
	const [draftNumber, setDraftNumber] = (0, import_react.useState)(state.nextWoNumber);
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const [draftQty, setDraftQty] = (0, import_react.useState)("1");
	const [draftWho, setDraftWho] = (0, import_react.useState)("Simon");
	const rows = state.workOrders.filter((wo) => showClosed ? true : wo.status === "pending" || wo.status === "active" || wo.status === "on_hold").sort((a, b) => a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true }));
	function toggle(woNumber) {
		if (openId === woNumber) navigate({ to: "/work-orders" });
		else navigate({
			to: "/work-orders/$woNumber",
			params: { woNumber }
		});
	}
	function saveNew() {
		const qty = Number.parseInt(draftQty, 10);
		mut.createWo.mutate({
			woNumber: draftNumber.trim() || void 0,
			part: draftPart,
			qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
			assignedBuild: draftWho || "Simon"
		}, { onSuccess: () => {
			setDraftPart("");
			setDraftQty("1");
			setDraftWho("Simon");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Work orders",
			hint: "Need date comes from sales. Who next is the handoff — Pass on moves the job off this person's build list. All includes cancelled.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				on: showClosed,
				onClick: () => setShowClosed(!showClosed),
				children: showClosed ? "All (closed + cancelled)" : "Open + on hold"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sheet-wrap is-pinned",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "sheet min-w-[72rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "WO" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-16",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build hours" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who next" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Need date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Added" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Started" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-14",
						children: "Sage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes to production" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "History" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((wo) => {
					const open = openId === wo.woNumber;
					const need = earliestNeedForWo(wo.woNumber, state.salesLines, state.salesOrders);
					const needRed = isPastDate(need, today) && (wo.status === "pending" || wo.status === "active");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoBlock, {
						state,
						woNumber: wo.woNumber,
						open,
						needDate: need,
						needRed,
						onToggle: () => toggle(wo.woNumber),
						mut,
						author,
						setHoldWo
					}, wo.woNumber);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "is-new",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftNumber,
							mono: true,
							placeholder: state.nextWoNumber,
							onSave: setDraftNumber
						}) }),
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5 text-xs text-muted",
							children: "Spec unless typed"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
							value: draftWho,
							options: WHO_OPTS,
							allowEmpty: true,
							onSave: setDraftWho
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5 text-sm text-muted",
							children: "From sales"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-2 py-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									onClick: saveNew,
									disabled: !draftPart.trim(),
									children: "Add work order"
								})
							})
						})
					]
				})] })]
			})
		}),
		holdWo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldReasonDialog, {
			woNumber: holdWo,
			part: state.workOrders.find((w) => w.woNumber === holdWo)?.part,
			onClose: () => setHoldWo(null),
			onConfirm: (reason) => {
				mut.patchWo.mutate({
					woNumber: holdWo,
					status: "on_hold",
					holdReason: reason,
					historyAuthor: author
				});
				setHoldWo(null);
			}
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoWorkOrderPanel, {
			state,
			mut
		})
	] });
}
function WoBlock({ state, woNumber, open, needDate, needRed, onToggle, mut, author, setHoldWo }) {
	const wo = state.workOrders.find((w) => w.woNumber === woNumber);
	if (!wo) return null;
	const units = state.units.filter((u) => u.workOrderNumber === woNumber);
	const tickets = state.tickets.filter((t) => ticketTouchesWo(t.workOrderNumber, woNumber));
	const lines = state.salesLines.filter((l) => l.workOrderNumber === woNumber);
	const fill = buildFill(state, wo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: open ? "is-open" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": open ? "Collapse" : "Expand",
				onClick: onToggle,
				className: "flex h-11 w-full items-center justify-center text-muted",
				children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, { woNumber: wo.woNumber }), fill.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: `block px-2.5 pb-1 text-xs ${fill.filled === fill.total ? "text-muted" : "font-medium text-primary"}`,
				children: [
					fill.filled,
					"/",
					fill.total,
					" recorded"
				]
			}) : null] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
				value: wo.part,
				options: partOptions(state.parts),
				onSave: (v) => mut.patchWo.mutate({
					woNumber: wo.woNumber,
					part: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "number",
				min: 1,
				value: String(wo.qty),
				mono: true,
				onSave: (v) => {
					const n = Number.parseInt(v, 10);
					if (Number.isFinite(n) && n >= 1) mut.patchWo.mutate({
						woNumber: wo.woNumber,
						qty: n
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "number",
				min: 0,
				value: wo.buildTimeHours == null ? "" : String(wo.buildTimeHours),
				placeholder: String(jobHours({
					...wo,
					buildTimeHours: null
				}, state.parts)),
				mono: true,
				onSave: (v) => {
					if (v.trim() === "") {
						mut.patchWo.mutate({
							woNumber: wo.woNumber,
							buildTimeHours: null
						});
						return;
					}
					const n = Number.parseFloat(v);
					if (Number.isFinite(n) && n >= 0) mut.patchWo.mutate({
						woNumber: wo.woNumber,
						buildTimeHours: n
					});
				}
			}), wo.buildTimeHours != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block px-2.5 pb-1 text-[0.65rem] text-muted",
				children: [
					"spec ",
					jobHours({
						...wo,
						buildTimeHours: null
					}, state.parts),
					" · ",
					hoursToDays(wo.buildTimeHours),
					" d"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block px-2.5 pb-1 text-[0.65rem] text-muted",
				children: [hoursToDays(jobHours(wo, state.parts)), " d"]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: wo.assignedBuild,
				options: WHO_OPTS,
				allowEmpty: true,
				onSave: (v) => mut.patchWo.mutate({
					woNumber: wo.woNumber,
					assignedBuild: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhoNextCell, {
					wo,
					mut
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `block px-2.5 ${needRed ? "font-semibold text-danger" : ""}`,
				children: formatShopDate(needDate) || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: wo.status,
				options: STATUS_OPTS,
				onSave: (v) => {
					if (v === "on_hold") setHoldWo(wo.woNumber);
					else mut.patchWo.mutate({
						woNumber: wo.woNumber,
						status: v,
						historyAuthor: author
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: formatShopDate(wo.dateAdded)
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: formatShopDate(wo.dateStarted) || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
				checked: wo.builtInSage,
				label: `Built in Sage for ${wo.woNumber}`,
				onSave: (v) => mut.patchWo.mutate({
					woNumber: wo.woNumber,
					builtInSage: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: wo.notesToProduction,
					placeholder: "Note to production",
					onSave: (v) => mut.patchWo.mutate({
						woNumber: wo.woNumber,
						notesToProduction: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "history-cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryButton, {
					woNumber: wo.woNumber,
					part: wo.part,
					notes: wo.hardwareHistory,
					onAdd: (n) => mut.woHistory.mutate({
						woNumber: wo.woNumber,
						author: n.author,
						text: n.text
					})
				})
			})
		]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		colSpan: 14,
		className: "bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "expand-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Units"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								onClick: () => mut.unitAdd.mutate(wo.woNumber),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Unit"]
							})]
						}), units.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "None yet. Qty does not create units."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[var(--radius-sm)] border border-border p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-sm font-medium",
											children: unit.unitId
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitPill, { status: unit.status })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
												value: unit.serialOrId,
												placeholder: "Serial / ID",
												onSave: (v) => mut.patchUnit.mutate({
													id: unit.id,
													serialOrId: v
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
												value: unit.status,
												options: UNIT_OPTS,
												onSave: (v) => mut.patchUnit.mutate({
													id: unit.id,
													status: v
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
												value: unit.salesOrderNumber ?? "",
												placeholder: "Sales order",
												onSave: (v) => mut.patchUnit.mutate({
													id: unit.id,
													salesOrderNumber: v || null
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
												type: "date",
												value: unit.despatchDate ?? "",
												onSave: (v) => mut.patchUnit.mutate({
													id: unit.id,
													despatchDate: v || null
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesList, {
											notes: unit.notes,
											onAdd: (n) => mut.unitNote.mutate({
												id: unit.id,
												author: n.author,
												text: n.text
											})
										})
									})
								]
							}, unit.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Quality tickets"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tickets/new",
									search: { wo: wo.woNumber },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "QT"]
								})
							})]
						}), tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "None on this job."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1",
							children: tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tickets/$ticketNumber",
								params: { ticketNumber: t.ticketNumber },
								className: "text-sm font-medium text-primary",
								children: t.ticketNumber
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [" ", t.title || t.status]
							})] }, t.ticketNumber))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 text-sm font-semibold",
							children: "Sales lines"
						}), lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No sales orders point at this WO."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1.5",
							children: lines.map((line) => {
								const so = state.salesOrders.find((s) => s.soNumber === line.soNumber);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-[var(--radius-sm)] border border-border px-2 py-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/sales/$soNumber",
											params: { soNumber: line.soNumber },
											className: "font-medium hover:text-primary",
											children: ["SO ", line.soNumber]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-muted",
											children: [
												so?.company,
												" · ",
												line.part,
												" × ",
												line.qty
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "file-label",
											children: soFileLabel(line.soNumber)
										})
									]
								}, line.id);
							})
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildRecordPanel, {
					wo,
					state
				})
			})]
		})
	}) }) : null] });
}
function NoWorkOrderPanel({ state, mut }) {
	const missingLines = salesLinesWithoutWo(state);
	const sageExtras = sageLinesWithoutWo(state);
	if (!missingLines.length && !sageExtras.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-1 text-sm font-semibold",
				children: "Without a work order"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm text-muted",
				children: "Sales lines that still need a WO, plus Sage extras that never become a job (magnets, instructions, subscriptions). Make a TSK if it needs bench time this year — pack-list items stay on Shipping."
			}),
			missingLines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 text-xs uppercase tracking-wide text-muted",
					children: "Sales lines"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sheet-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "sheet min-w-[48rem]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SO" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-16",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Trace" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: missingLines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissingLineRow, {
							line,
							state,
							mut
						}, line.id)) })]
					})
				})]
			}) : null,
			sageExtras.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-1 text-xs uppercase tracking-wide text-muted",
				children: "Sage extras"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sheet-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "sheet min-w-[48rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SO" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Description" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-16",
							children: "Qty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-28" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sageExtras.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageNoWoRow, {
						line,
						mut
					}, line.id)) })]
				})
			})] }) : null
		]
	});
}
function MissingLineRow({ line, state, mut }) {
	const so = state.salesOrders.find((s) => s.soNumber === line.soNumber);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoId, { soNumber: line.soNumber }) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block px-2.5",
			children: so?.company || "—"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block px-2.5 font-medium",
			children: line.part || "—"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block px-2.5 font-mono",
			children: line.qty
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
			value: line.workOrderNumber,
			options: woOptionsForPart(state.workOrders, line.part),
			placeholder: "Trace WO",
			onSave: (v) => mut.patchLine.mutate({
				id: line.id,
				workOrderNumber: v
			})
		}) })
	] });
}
function SageNoWoRow({ line, mut }) {
	const title = [line.part, line.description].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "is-task",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 font-mono text-sm",
				children: line.soNumber
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: line.company || "—"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-1 py-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					disabled: !title.trim() || mut.addTask.isPending,
					onClick: () => mut.addTask.mutate({ title: `${title} (SO ${line.soNumber})` }),
					children: "Make TSK"
				})
			}) })
		]
	});
}
function WorkOrdersLayout() {
	const params = useParams({ strict: false });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkOrdersScreen, { openId: params.woNumber });
}
//#endregion
export { WorkOrdersLayout as component };
