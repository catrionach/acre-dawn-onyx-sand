const LONDON = "Europe/London";

/** Calendar date in Europe/London as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Shop timestamp in Europe/London as YYYY-MM-DDTHH:mm. */
export function nowStamp(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function formatIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addCalendarDays(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIso(date);
}

export function weekdayUtc(iso: string): number {
  return parseIso(iso).getUTCDay();
}

export function isWeekend(iso: string): boolean {
  const day = weekdayUtc(iso);
  return day === 0 || day === 6;
}

export function snapToWeekday(iso: string): string {
  let cursor = iso.slice(0, 10);
  while (isWeekend(cursor)) cursor = addCalendarDays(cursor, 1);
  return cursor;
}

export function nextWeekday(iso: string): string {
  return snapToWeekday(addCalendarDays(iso.slice(0, 10), 1));
}

/** Short UK shop date: 5 Sep 2026 */
export function formatShopDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = parseIso(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Monday 31 Aug 2026 */
export function formatShopWeekday(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = formatShopDate(iso);
  if (!date) return "";
  return `${WEEKDAYS[weekdayUtc(iso)]} ${date}`;
}

/** Shop date, plus time when the stamp includes it: 29 Aug 2026, 15:04 */
export function formatStamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = formatShopDate(iso.slice(0, 10));
  if (iso.length < 16 || iso[10] !== "T") return date;
  return `${date}, ${iso.slice(11, 16)}`;
}

export function isPastDate(iso: string | null | undefined, today: string): boolean {
  if (!iso) return false;
  return iso.slice(0, 10) < today.slice(0, 10);
}

export function hoursToDays(hours: number): string {
  if (!Number.isFinite(hours) || hours === 0) return "0";
  const days = hours / 8;
  const rounded = Math.round(days * 1000) / 1000;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Accept YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or 21 Aug 2026. */
export function parseFlexibleDate(value: string | null | undefined): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const uk = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (uk) {
    const d = uk[1].padStart(2, "0");
    const m = uk[2].padStart(2, "0");
    return `${uk[3]}-${m}-${d}`;
  }
  const named = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (named) {
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const mi = months.indexOf(named[2].slice(0, 3).toLowerCase());
    if (mi >= 0) {
      return `${named[3]}-${String(mi + 1).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
    }
  }
  const serial = Number(raw);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
    return formatIso(new Date(utc));
  }
  return null;
}

/** Date plus optional time → YYYY-MM-DDTHH:mm */
export function parseFlexibleStamp(value: string | null | undefined): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const tIso = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}):(\d{2})/);
  if (tIso) {
    return `${tIso[1]}T${tIso[2].padStart(2, "0")}:${tIso[3]}`;
  }
  const tUk = raw.match(/^(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})\s+(\d{1,2}):(\d{2})/);
  if (tUk) {
    const day = parseFlexibleDate(tUk[1]);
    if (day) return `${day}T${tUk[2].padStart(2, "0")}:${tUk[3]}`;
  }
  const named = raw.match(/^(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}),?\s+(\d{1,2}):(\d{2})/);
  if (named) {
    const day = parseFlexibleDate(named[1]);
    if (day) return `${day}T${named[2].padStart(2, "0")}:${named[3]}`;
  }
  return parseFlexibleDate(raw);
}
