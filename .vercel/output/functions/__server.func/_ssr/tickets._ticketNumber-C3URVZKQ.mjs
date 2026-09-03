import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as Route$3 } from "./router-I7tyG22E.mjs";
import { t as TicketFormScreen } from "./ticket-form-BLoucF0t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets._ticketNumber-C3URVZKQ.js
var import_jsx_runtime = require_jsx_runtime();
function TicketPage() {
	const { ticketNumber } = Route$3.useParams();
	if (ticketNumber === "new") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketFormScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketFormScreen, { ticketNumber });
}
//#endregion
export { TicketPage as component };
