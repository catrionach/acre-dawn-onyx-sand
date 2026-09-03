import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, f as useRouterState, h as Outlet, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { rt as parseWoNumbers, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { r as displayWo } from "./prospect-VcFT87HP.mjs";
import { s as Plus } from "../_libs/lucide-react.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, q as FilterChip } from "./router-I7tyG22E.mjs";
import { r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { n as QtId } from "./id-stack-BLCvv55O.mjs";
import { t as QtPill } from "./status-pill-Dt-NHF3j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-B5Be1VzN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TicketsScreen() {
	const floor = useFloor();
	const navigate = useNavigate();
	const [showClosed, setShowClosed] = (0, import_react.useState)(false);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Quality tickets" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	const rows = floor.data.tickets.filter((t) => showClosed ? true : t.status === "open");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "Quality tickets",
		hint: "Open a ticket to fill title, optional WO, description and causes.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				on: showClosed,
				onClick: () => setShowClosed(!showClosed),
				children: showClosed ? "Showing all" : "Open"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tickets/new",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "New QT"]
				})
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-wrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "sheet min-w-[48rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ticket" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Title" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "WO" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Causes" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Opened" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 8,
				className: "px-3 py-4 text-sm text-muted",
				children: "No tickets."
			}) }) : rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "cursor-pointer",
				onClick: () => void navigate({
					to: "/tickets/$ticketNumber",
					params: { ticketNumber: t.ticketNumber }
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtId, { ticketNumber: t.ticketNumber }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5 py-1.5 font-medium",
						children: t.title || "—"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5 font-mono",
						children: parseWoNumbers(t.workOrderNumber).map(displayWo).join(", ") || "—"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5 font-mono",
						children: t.part || "—"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5 text-sm",
						children: t.causes.length ? t.causes.join(", ") : "TBD"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5 text-sm",
						children: t.furtherAction ? "Yes" : "—"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtPill, { status: t.status })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block px-2.5",
						children: formatShopDate(t.dateOpened)
					}) })
				]
			}, t.ticketNumber)) })]
		})
	})] });
}
function TicketsLayout() {
	if (useRouterState({ select: (s) => s.location.pathname }) !== "/tickets") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketsScreen, {});
}
//#endregion
export { TicketsLayout as component };
