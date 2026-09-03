import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as BUILDER_OPTIONS } from "./types-CcVUDIXB.mjs";
import { Z as useAuthor } from "./router-I7tyG22E.mjs";
import { r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { i as SelectCell } from "./cells-BYPIsEx7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/who-next-Da37XhAq.js
var import_jsx_runtime = require_jsx_runtime();
function WhoNextCell({ wo, pt, mut }) {
	const { author } = useAuthor();
	const floor = useFloor();
	const assignedBuild = wo?.assignedBuild ?? pt?.assignedBuild ?? "";
	const assignedNext = wo?.assignedNext ?? pt?.assignedNext ?? "";
	const next = assignedNext.trim();
	const alreadyOnNext = Boolean(next && floor.data?.buildQueue.some((e) => {
		if (wo) return e.kind === "wo" && e.woNumber === wo.woNumber && e.assignedBuild === next;
		if (pt) return e.kind === "pt" && e.problemId === pt.id && e.assignedBuild === next;
		return false;
	}));
	const busy = mut.passWo.isPending || mut.prePassWo.isPending || mut.passPt.isPending || mut.prePassPt.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "who-next",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
			value: assignedNext,
			options: BUILDER_OPTIONS,
			allowEmpty: true,
			emptyLabel: "—",
			onSave: (v) => {
				if (wo) mut.patchWo.mutate({
					woNumber: wo.woNumber,
					assignedNext: v
				});
				else if (pt) mut.patchPt.mutate({
					id: pt.id,
					assignedNext: v
				});
			}
		}), Boolean(next) && next !== assignedBuild ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "who-next-actions",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				disabled: busy,
				title: "Move this job off the current person's list onto Who next",
				onClick: () => {
					if (wo) mut.passWo.mutate({
						woNumber: wo.woNumber,
						historyAuthor: author
					});
					else if (pt) mut.passPt.mutate({ id: pt.id });
				},
				children: "Pass on"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				disabled: busy || alreadyOnNext,
				title: "Put it on Who next's list and keep it on the current person's list",
				onClick: () => {
					if (wo) mut.prePassWo.mutate({
						woNumber: wo.woNumber,
						historyAuthor: author
					});
					else if (pt) mut.prePassPt.mutate({ id: pt.id });
				},
				children: alreadyOnNext ? "On both lists" : "Pre-pass on"
			})]
		}) : null]
	});
}
//#endregion
export { WhoNextCell as t };
