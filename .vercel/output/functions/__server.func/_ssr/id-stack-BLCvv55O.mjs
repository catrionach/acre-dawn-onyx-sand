import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as prospectProblemUrl, n as displayTsk, r as displayWo, t as displayPt } from "./prospect-VcFT87HP.mjs";
import { l as ExternalLink } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/id-stack-BLCvv55O.js
var import_jsx_runtime = require_jsx_runtime();
/** Virtual file labels from the old CE Master store. */
function woFileLabel(woNumber) {
	const n = Number.parseInt(woNumber, 10);
	if (Number.isFinite(n) && n >= 1e3) return `wo-${woNumber}.json`;
	return `${woNumber}.json`;
}
function qtFileLabel(ticketNumber) {
	return `${ticketNumber}.json`;
}
function soFileLabel(soNumber) {
	return `so-${soNumber}.json`;
}
function ptFileLabel(prospectNumber) {
	return `pt-${prospectNumber}.json`;
}
function WoId({ woNumber, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "id-stack is-compact" : "id-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/work-orders/$woNumber",
			params: { woNumber },
			children: displayWo(woNumber)
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "file-label",
			children: woFileLabel(woNumber)
		})]
	});
}
function SoId({ soNumber, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "id-stack is-compact" : "id-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sales/$soNumber",
			params: { soNumber },
			children: soNumber
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "file-label",
			children: soFileLabel(soNumber)
		})]
	});
}
function QtId({ ticketNumber, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "id-stack is-compact" : "id-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/tickets/$ticketNumber",
			params: { ticketNumber },
			children: ticketNumber
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "file-label",
			children: qtFileLabel(ticketNumber)
		})]
	});
}
function TskId({ taskNumber }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "id-stack is-compact",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/tasks",
			children: displayTsk(taskNumber)
		})
	});
}
function PtId({ prospectNumber, compact }) {
	const href = prospectProblemUrl(prospectNumber);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "id-stack is-compact" : "id-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "id-stack-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/problems",
				search: { pt: prospectNumber },
				children: displayPt(prospectNumber)
			}), href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer",
				className: "prospect-ext",
				title: "Open in Prospect",
				"aria-label": `Open ${displayPt(prospectNumber)} in Prospect`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })
			}) : null]
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "file-label",
			children: ptFileLabel(prospectNumber)
		})]
	});
}
//#endregion
export { WoId as a, TskId as i, QtId as n, soFileLabel as o, SoId as r, PtId as t };
