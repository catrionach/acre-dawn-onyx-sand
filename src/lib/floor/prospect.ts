import { normalizeWoNumber } from "./lookups";

export function normalizeProspectNumber(raw: string): string {
  return raw.trim().replace(/^pt[\s-]*/i, "").trim();
}

export function displayPt(number: string): string {
  const n = normalizeProspectNumber(number);
  return n ? `PT-${n}` : "PT";
}

/** Public CRM page for a Prospect problem — no API key. */
export function prospectProblemUrl(number: string): string {
  const n = normalizeProspectNumber(number);
  if (!n) return "";
  return `https://crm.prospect365.com/view/Problem/${encodeURIComponent(n)}`;
}

export function displayWo(number: string): string {
  const n = normalizeWoNumber(number);
  return n ? `WO-${n}` : "WO";
}

export function displayTsk(number: string): string {
  const t = number.trim();
  if (!t) return "TSK";
  const m = /^tsk[\s-]*(\d+)$/i.exec(t);
  if (m) return `TSK-${m[1]}`;
  if (/^tsk/i.test(t)) return t.toUpperCase();
  return `TSK-${t}`;
}
