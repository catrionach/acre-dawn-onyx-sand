import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { p as WO_STATUS_LABELS } from "./types-CcVUDIXB.mjs";
import { X as cn } from "./router-I7tyG22E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-pill-Dt-NHF3j.js
var import_jsx_runtime = require_jsx_runtime();
var woTone = {
	pending: "bg-info-bg text-info",
	active: "bg-ok-bg text-ok",
	on_hold: "bg-warn-bg text-warn",
	closed: "bg-surface-2 text-muted",
	cancelled: "bg-danger-bg text-danger"
};
var soTone = {
	open: "bg-ok-bg text-ok",
	waiting_on_customer: "bg-warn-bg text-warn",
	despatched: "bg-surface-2 text-muted",
	cancelled: "bg-danger-bg text-danger"
};
var qtTone = {
	open: "bg-warn-bg text-warn",
	closed: "bg-surface-2 text-muted"
};
var unitTone = {
	"in build": "bg-info-bg text-info",
	"on shelf": "bg-ok-bg text-ok",
	shipped: "bg-surface-2 text-muted"
};
var soLabel = {
	open: "Open",
	waiting_on_customer: "Waiting on customer",
	despatched: "Despatched",
	cancelled: "Cancelled"
};
function StatusPill({ children, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium capitalize", tone),
		children
	});
}
function WoPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		tone: woTone[status],
		children: WO_STATUS_LABELS[status]
	});
}
function SoPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		tone: soTone[status],
		children: soLabel[status]
	});
}
function QtPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		tone: qtTone[status],
		children: status
	});
}
function UnitPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		tone: unitTone[status],
		children: status
	});
}
//#endregion
export { WoPill as i, SoPill as n, UnitPill as r, QtPill as t };
