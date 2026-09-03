import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as QT_CAUSES, rt as parseWoNumbers, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { J as LoadingTable, K as ErrorBanner, X as cn, Y as ScreenHeader, Z as useAuthor } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { o as partOptions, r as ComboCell, s as woOptions } from "./cells-BYPIsEx7.mjs";
import { t as QtPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ticket-form-BLoucF0t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CAUSE_LABEL = {
	TBD: "TBD",
	"component failure": "Component failure",
	"design work needed": "Design work needed",
	"build error": "Build error",
	"missing parts": "Missing parts",
	documentation: "Documentation"
};
function CausePicker({ value, onChange }) {
	function toggle(cause) {
		if (value.includes(cause)) onChange(value.filter((c) => c !== cause));
		else onChange([...value, cause]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: QT_CAUSES.map((cause) => {
			const on = value.includes(cause);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": on,
				onClick: () => toggle(cause),
				className: cn("cause-chip", on && "is-on"),
				children: CAUSE_LABEL[cause]
			}, cause);
		})
	});
}
function TicketFormScreen({ ticketNumber, defaultWo = "" }) {
	const floor = useFloor();
	const mut = useFloorMutations();
	const navigate = useNavigate();
	const { author } = useAuthor();
	const isNew = !ticketNumber;
	const [draftTitle, setDraftTitle] = (0, import_react.useState)("");
	const [draftWo, setDraftWo] = (0, import_react.useState)(defaultWo);
	const [draftSummary, setDraftSummary] = (0, import_react.useState)("");
	const [draftCauses, setDraftCauses] = (0, import_react.useState)(["TBD"]);
	const [draftStatus, setDraftStatus] = (0, import_react.useState)("open");
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const [draftAction, setDraftAction] = (0, import_react.useState)(false);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Quality ticket" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	const state = floor.data;
	const ticket = ticketNumber ? state.tickets.find((t) => t.ticketNumber === ticketNumber) : void 0;
	if (ticketNumber && !ticket) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Quality ticket" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: `Ticket ${ticketNumber} was not found.` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tickets",
				className: "text-sm font-medium text-primary",
				children: "Back to QTs"
			})
		})
	] });
	const woNumber = ticket ? ticket.workOrderNumber : draftWo || defaultWo;
	const firstWo = parseWoNumbers(woNumber)[0] ?? "";
	const wo = state.workOrders.find((w) => w.woNumber === firstWo);
	function save(patch) {
		if (!ticket) return;
		mut.patchQt.mutate({
			ticketNumber: ticket.ticketNumber,
			...patch
		});
	}
	function create() {
		const workOrderNumber = (draftWo || defaultWo).trim();
		const nextId = state.nextQtNumber;
		mut.qtCreate.mutate({
			workOrderNumber: workOrderNumber || void 0,
			title: draftTitle,
			problem: draftSummary,
			part: draftPart,
			causes: draftCauses.length ? draftCauses : ["TBD"],
			furtherAction: draftAction,
			assignedTo: author,
			status: draftStatus
		}, { onSuccess: () => {
			navigate({
				to: "/tickets/$ticketNumber",
				params: { ticketNumber: nextId }
			});
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: ticket ? ticket.ticketNumber : "New quality ticket",
		hint: ticket ? `${ticket.part || wo?.part || ""} · opened ${formatShopDate(ticket.dateOpened)}` : "WO is optional. Use 437 or 437, 438 for specific jobs. Causes can be more than one.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/tickets",
			className: "text-sm font-medium text-primary",
			children: "All QTs"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "qt-form",
		onSubmit: (e) => {
			e.preventDefault();
			if (isNew) create();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "qt-field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "QT title" }), ticket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "cell-input qt-input",
					defaultValue: ticket.title,
					placeholder: "What's wrong",
					onBlur: (e) => {
						if (e.target.value !== ticket.title) save({ title: e.target.value });
					}
				}, `${ticket.ticketNumber}-title`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "cell-input qt-input",
					value: draftTitle,
					placeholder: "What's wrong",
					onChange: (e) => setDraftTitle(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "qt-field",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "WO" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "qt-input-wrap",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: woNumber,
							options: woOptions(state.workOrders),
							placeholder: "437 or 437, 438",
							onSave: (v) => {
								const nums = parseWoNumbers(v);
								const nextWo = state.workOrders.find((w) => w.woNumber === nums[0]);
								if (ticket) {
									const patch = { workOrderNumber: v };
									if (nextWo && (!ticket.part || ticket.part === wo?.part)) patch.part = nextWo.part;
									save(patch);
								} else {
									setDraftWo(v);
									if (nextWo && (!draftPart || draftPart === wo?.part)) setDraftPart(nextWo.part);
								}
							}
						})
					}),
					wo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "qt-hint",
						children: [
							wo.part,
							" × ",
							wo.qty,
							" · ",
							wo.status,
							" · ",
							wo.assignedBuild || "Unassigned",
							parseWoNumbers(woNumber).length > 1 ? " · plus other WOs" : ""
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "qt-hint",
						children: "One job (437) or several, commas between them."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "qt-field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Part number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "qt-input-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
						value: ticket ? ticket.part : draftPart || wo?.part || "",
						options: partOptions(state.parts),
						placeholder: "Part number",
						onSave: (v) => {
							if (ticket) save({ part: v });
							else setDraftPart(v);
						}
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "qt-field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Summary / description" }), ticket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "cell-area qt-area",
					rows: 6,
					defaultValue: ticket.problem,
					placeholder: "What happened, what we saw",
					onBlur: (e) => {
						if (e.target.value !== ticket.problem) save({ problem: e.target.value });
					}
				}, `${ticket.ticketNumber}-summary`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "cell-area qt-area",
					rows: 6,
					value: draftSummary,
					placeholder: "What happened, what we saw",
					onChange: (e) => setDraftSummary(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "qt-field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Causes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CausePicker, {
					value: ticket ? ticket.causes : draftCauses,
					onChange: (next) => {
						if (ticket) save({ causes: next });
						else setDraftCauses(next);
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "qt-check",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: ticket ? ticket.furtherAction : draftAction,
					onChange: (e) => {
						if (ticket) save({ furtherAction: e.target.checked });
						else setDraftAction(e.target.checked);
					},
					className: "size-4 accent-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Further action" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "qt-field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						["open", "closed"].map((s) => {
							const current = ticket ? ticket.status : draftStatus;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": current === s,
								className: cn("cause-chip", current === s && "is-on"),
								onClick: () => {
									if (ticket) save({ status: s });
									else setDraftStatus(s);
								},
								children: s === "open" ? "Open" : "Closed"
							}, s);
						}),
						ticket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtPill, { status: ticket.status }) : null,
						ticket?.dateClosed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted",
							children: ["Closed ", formatShopDate(ticket.dateClosed)]
						}) : null
					]
				})]
			}),
			isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: mut.qtCreate.isPending,
					children: mut.qtCreate.isPending ? "Saving…" : "Create ticket"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => void navigate({ to: "/tickets" }),
					children: "Cancel"
				})]
			}) : null
		]
	})] });
}
//#endregion
export { TicketFormScreen as t };
