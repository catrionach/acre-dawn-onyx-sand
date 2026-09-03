import { tt as normalizeWoNumber } from "./types-CcVUDIXB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospect-VcFT87HP.js
function normalizeProspectNumber(raw) {
	return raw.trim().replace(/^pt[\s-]*/i, "").trim();
}
function displayPt(number) {
	const n = normalizeProspectNumber(number);
	return n ? `PT-${n}` : "PT";
}
/** Public CRM page for a Prospect problem — no API key. */
function prospectProblemUrl(number) {
	const n = normalizeProspectNumber(number);
	if (!n) return "";
	return `https://crm.prospect365.com/view/Problem/${encodeURIComponent(n)}`;
}
function displayWo(number) {
	const n = normalizeWoNumber(number);
	return n ? `WO-${n}` : "WO";
}
function displayTsk(number) {
	const t = number.trim();
	if (!t) return "TSK";
	const m = /^tsk[\s-]*(\d+)$/i.exec(t);
	if (m) return `TSK-${m[1]}`;
	if (/^tsk/i.test(t)) return t.toUpperCase();
	return `TSK-${t}`;
}
//#endregion
export { prospectProblemUrl as a, normalizeProspectNumber as i, displayTsk as n, displayWo as r, displayPt as t };
