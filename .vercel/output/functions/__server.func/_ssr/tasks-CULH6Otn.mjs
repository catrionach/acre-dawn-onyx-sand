import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as TASK_STATUS_OPTIONS, k as hoursToDays, n as BUILDER_OPTIONS } from "./types-CcVUDIXB.mjs";
import { n as displayTsk } from "./prospect-VcFT87HP.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, q as FilterChip } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, i as SelectCell, t as AreaCell } from "./cells-BYPIsEx7.mjs";
import { i as TskId } from "./id-stack-BLCvv55O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-CULH6Otn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_OPTS = TASK_STATUS_OPTIONS;
var WHO_OPTS = BUILDER_OPTIONS;
function TasksScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	const [showDone, setShowDone] = (0, import_react.useState)(true);
	const [draftNumber, setDraftNumber] = (0, import_react.useState)("");
	const [draftTitle, setDraftTitle] = (0, import_react.useState)("");
	const [draftWho, setDraftWho] = (0, import_react.useState)("");
	const [draftDays, setDraftDays] = (0, import_react.useState)("");
	const [draftStart, setDraftStart] = (0, import_react.useState)("");
	const [draftFinish, setDraftFinish] = (0, import_react.useState)("");
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Tasks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	const state = floor.data;
	const rows = state.buildTasks.filter((t) => showDone ? true : t.status !== "done");
	function add() {
		const title = draftTitle.trim();
		if (!title) return;
		const days = Number.parseFloat(draftDays);
		mut.addTask.mutate({
			taskNumber: draftNumber.trim() ? displayTsk(draftNumber) : void 0,
			title,
			assignedBuild: draftWho,
			hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
			dateStarted: draftStart || null,
			dateFinished: draftFinish || null
		}, { onSuccess: () => {
			setDraftNumber("");
			setDraftTitle("");
			setDraftWho("");
			setDraftDays("");
			setDraftStart("");
			setDraftFinish("");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "Tasks",
		hint: "Jobs that are not work orders — TSK-1, TSK-2. They share the Build order queue with WO and PT.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
			on: showDone,
			onClick: () => setShowDone(!showDone),
			children: showDone ? "Showing all" : "Hide done"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-wrap is-pinned",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "sheet min-w-[64rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "TSK" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Task" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Start" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Finish" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build order notes" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 9,
				className: "px-3 py-4 text-sm text-muted",
				children: "No tasks yet. Add one here or on Build order."
			}) }) : rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TskId, { taskNumber: t.taskNumber }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					value: t.title,
					onSave: (v) => mut.patchTask.mutate({
						id: t.id,
						title: v
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
					value: t.assignedBuild,
					options: WHO_OPTS,
					allowEmpty: true,
					emptyLabel: "—",
					onSave: (v) => mut.patchTask.mutate({
						id: t.id,
						assignedBuild: v
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "number",
					min: 0,
					value: hoursToDays(t.hours),
					mono: true,
					onSave: (v) => {
						const n = Number.parseFloat(v);
						if (Number.isFinite(n) && n >= 0) mut.patchTask.mutate({
							id: t.id,
							hours: n * 8
						});
					}
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "date",
					value: t.dateStarted ?? "",
					onSave: (v) => mut.patchTask.mutate({
						id: t.id,
						dateStarted: v || null
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "date",
					value: t.dateFinished ?? "",
					onSave: (v) => mut.patchTask.mutate({
						id: t.id,
						dateFinished: v || null
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
					value: t.status,
					options: STATUS_OPTS,
					onSave: (v) => mut.patchTask.mutate({
						id: t.id,
						status: v
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "min-w-52",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
						value: t.buildOrderNotes,
						placeholder: "Build order notes",
						onSave: (v) => mut.patchTask.mutate({
							id: t.id,
							buildOrderNotes: v
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Remove task",
					className: "flex size-10 items-center justify-center text-muted hover:text-danger",
					onClick: () => mut.taskDelete.mutate(t.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				}) })
			] }, t.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "is-new",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: draftNumber,
						placeholder: state.nextTskNumber,
						mono: true,
						live: true,
						onSave: setDraftNumber
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: draftTitle,
						placeholder: "Task",
						live: true,
						onSave: setDraftTitle
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
						value: draftWho,
						options: WHO_OPTS,
						allowEmpty: true,
						emptyLabel: "—",
						onSave: setDraftWho
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						type: "number",
						min: 0,
						value: draftDays,
						placeholder: "Days",
						mono: true,
						live: true,
						onSave: setDraftDays
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						type: "date",
						value: draftStart,
						live: true,
						onSave: setDraftStart
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						type: "date",
						value: draftFinish,
						live: true,
						onSave: setDraftFinish
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 3,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: add,
								disabled: !draftTitle.trim(),
								children: "Add task"
							})
						})
					})
				]
			})] })]
		})
	})] });
}
var SplitComponent = TasksScreen;
//#endregion
export { SplitComponent as component };
