import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as TASK_STATUS_OPTIONS, k as hoursToDays, lt as sourcesFromConsumed, n as BUILDER_OPTIONS, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, i as Route$13, q as FilterChip } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, i as SelectCell, o as partOptions, r as ComboCell, t as AreaCell } from "./cells-BYPIsEx7.mjs";
import { t as PtId } from "./id-stack-BLCvv55O.mjs";
import { i as PtHistoryButton } from "./notes-list-C5MV8Vkk.mjs";
import { t as WhoNextCell } from "./who-next-Da37XhAq.mjs";
import { t as ConsumedWoCell } from "./consumed-wo-Cvf63nYH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/problems-Bb7Y-W5y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_OPTS = TASK_STATUS_OPTIONS;
var WHO_OPTS = BUILDER_OPTIONS;
function ProblemsScreen({ highlight }) {
	const floor = useFloor();
	const mut = useFloorMutations();
	const [showDone, setShowDone] = (0, import_react.useState)(true);
	const [draftNumber, setDraftNumber] = (0, import_react.useState)("");
	const [draftTitle, setDraftTitle] = (0, import_react.useState)("");
	const [draftCustomer, setDraftCustomer] = (0, import_react.useState)("");
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const [draftWho, setDraftWho] = (0, import_react.useState)("");
	const [draftDays, setDraftDays] = (0, import_react.useState)("");
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Problem tickets" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	const state = floor.data;
	const rows = state.problemTickets.filter((t) => showDone ? true : t.status !== "done");
	function add() {
		const number = draftNumber.trim();
		if (!number) return;
		const days = Number.parseFloat(draftDays);
		mut.addPt.mutate({
			prospectNumber: number,
			title: draftTitle.trim() || void 0,
			customer: draftCustomer.trim() || void 0,
			part: draftPart.trim() || void 0,
			assignedBuild: draftWho,
			hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0
		}, { onSuccess: () => {
			setDraftNumber("");
			setDraftTitle("");
			setDraftCustomer("");
			setDraftPart("");
			setDraftWho("");
			setDraftDays("");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "Problem tickets",
		hint: "Same shop columns as a work order: part, who, who next, note to production, added, started, finished, status, plus consumed WOs. Hardware history is the log on those consumed work orders. Type the Prospect number — the PT link still opens Prospect.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
			on: showDone,
			onClick: () => setShowDone(!showDone),
			children: showDone ? "Showing all" : "Hide done"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-wrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "sheet min-w-[98rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PT" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Title" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Customer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who next" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes to production" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Added" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Started" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Finished" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Consumed WO" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hardware history" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status note" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build order notes" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-16" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 17,
				className: "px-3 py-4 text-sm text-muted",
				children: "No problem tickets yet. Add a Prospect number below."
			}) }) : rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemRow, {
				t,
				state,
				highlight: highlight === t.prospectNumber,
				mut
			}, t.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "is-new",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 px-2.5 font-mono text-sm font-semibold text-muted",
							children: "PT-"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
								value: draftNumber,
								placeholder: "1842",
								mono: true,
								live: true,
								onSave: setDraftNumber
							})
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: draftTitle,
						placeholder: "Title",
						live: true,
						onSave: setDraftTitle
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: draftCustomer,
						placeholder: "Customer",
						live: true,
						onSave: setDraftCustomer
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
						value: draftPart,
						options: partOptions(state.parts),
						placeholder: "Part",
						onSave: setDraftPart
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
						value: draftWho,
						options: WHO_OPTS,
						allowEmpty: true,
						emptyLabel: "—",
						onSave: setDraftWho
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 11,
						className: "text-sm text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5",
							children: "Who next, dates, consumed WOs and history after you add."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-1 py-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							onClick: add,
							disabled: !draftNumber.trim() || mut.addPt.isPending,
							children: "Add PT"
						})
					}) })
				]
			})] })]
		})
	})] });
}
function ProblemRow({ t, state, highlight, mut }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: highlight ? "is-open" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtId, {
					prospectNumber: t.prospectNumber,
					compact: true
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				value: t.title,
				placeholder: "Title",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					title: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				value: t.customer,
				placeholder: "Customer",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					customer: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
				value: t.part,
				options: partOptions(state.parts),
				placeholder: "Part",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					part: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: t.assignedBuild,
				options: WHO_OPTS,
				allowEmpty: true,
				emptyLabel: "—",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					assignedBuild: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhoNextCell, {
					pt: t,
					mut
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: t.notesToProduction,
					placeholder: "Note to production",
					onSave: (v) => mut.patchPt.mutate({
						id: t.id,
						notesToProduction: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: formatShopDate(t.dateAdded) || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "date",
				value: t.dateStarted ?? "",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					dateStarted: v || null
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "date",
				value: t.dateFinished ?? "",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					dateFinished: v || null
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: t.status,
				options: STATUS_OPTS,
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					status: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsumedWoCell, {
					items: t.consumed,
					state,
					onSave: (consumed) => mut.patchPt.mutate({
						id: t.id,
						consumed
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "history-cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtHistoryButton, {
					prospectNumber: t.prospectNumber,
					sources: sourcesFromConsumed(t.consumed, state.workOrders),
					onAdd: (n) => mut.woHistory.mutate({
						woNumber: n.woNumber,
						author: n.author,
						text: n.text
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "number",
				min: 0,
				value: hoursToDays(t.hours),
				mono: true,
				onSave: (v) => {
					const n = Number.parseFloat(v);
					if (Number.isFinite(n) && n >= 0) mut.patchPt.mutate({
						id: t.id,
						hours: n * 8
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				value: t.prospectStatus,
				placeholder: "Status note",
				onSave: (v) => mut.patchPt.mutate({
					id: t.id,
					prospectStatus: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: t.notes,
					placeholder: "Build order notes",
					onSave: (v) => mut.patchPt.mutate({
						id: t.id,
						notes: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1 px-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Remove problem ticket",
					className: "flex size-10 items-center justify-center text-muted hover:text-danger",
					onClick: () => mut.ptDelete.mutate(t.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})
			}) })
		]
	});
}
function ProblemsPage() {
	const { pt } = Route$13.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemsScreen, { highlight: pt });
}
//#endregion
export { ProblemsPage as component };
