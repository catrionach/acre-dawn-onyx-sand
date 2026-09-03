import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { tt as normalizeWoNumber } from "./types-CcVUDIXB.mjs";
import { r as displayWo } from "./prospect-VcFT87HP.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { r as ComboCell, s as woOptions } from "./cells-BYPIsEx7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/consumed-wo-Cvf63nYH.js
var import_jsx_runtime = require_jsx_runtime();
function partForWo(state, woNumber) {
	const n = normalizeWoNumber(woNumber) || woNumber.trim();
	if (!n) return "";
	return state.workOrders.find((w) => w.woNumber === n)?.part ?? "";
}
function ConsumedWoCell({ items, state, onSave }) {
	const known = new Set(items.map((i) => i.woNumber).filter(Boolean));
	const opts = woOptions(state.workOrders.filter((w) => !known.has(w.woNumber)));
	function add(raw) {
		const woNumber = normalizeWoNumber(raw) || raw.trim();
		if (!woNumber) return;
		if (items.some((i) => i.woNumber === woNumber)) return;
		onSave([...items, {
			woNumber,
			part: partForWo(state, woNumber)
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "consumed-cell",
		children: [items.map((item, index) => {
			const linked = Boolean(item.woNumber) && state.workOrders.some((w) => w.woNumber === item.woNumber);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "consumed-line",
				children: [
					linked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/work-orders/$woNumber",
						params: { woNumber: item.woNumber },
						className: "font-mono text-sm font-medium text-primary",
						children: displayWo(item.woNumber)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm",
						children: item.woNumber || "—"
					}),
					item.part ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: item.part
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-8 items-center justify-center text-muted hover:text-danger",
						"aria-label": `Remove consumed ${item.woNumber || "row"}`,
						onClick: () => onSave(items.filter((_, i) => i !== index)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
					})
				]
			}, `${item.woNumber}-${index}`);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
			value: "",
			options: opts,
			placeholder: "Add WO",
			onSave: add
		})]
	});
}
//#endregion
export { ConsumedWoCell as t };
