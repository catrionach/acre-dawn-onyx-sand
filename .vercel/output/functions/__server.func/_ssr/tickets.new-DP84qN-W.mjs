import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as Route$2 } from "./router-I7tyG22E.mjs";
import { t as TicketFormScreen } from "./ticket-form-BLoucF0t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets.new-DP84qN-W.js
var import_jsx_runtime = require_jsx_runtime();
function NewTicketPage() {
	const { wo } = Route$2.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketFormScreen, { defaultWo: wo ?? "" });
}
//#endregion
export { NewTicketPage as component };
