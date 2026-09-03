import { parseFlexibleDate } from "./dates";

export type SagePackLine = {
  soNumber: string;
  company: string;
  orderDate: string | null;
  part: string;
  description: string;
  comment: string;
  qty: number;
  qtyDespatched: number;
  notes: string;
};

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function fieldOf(header: string): string | null {
  const n = compact(header);
  if (!n) return null;
  if (n.includes("salesordernumber") && !n.includes("item")) return "so_number";
  if (n === "salesordernumber" || n === "sonumber") return "so_number";
  if (n.includes("accountname")) return "company";
  if (n === "salesorderdate" || n === "orderdate") return "order_date";
  if (n.endsWith("orderdate") && n.includes("sales") && !n.includes("despatch")) {
    return "order_date";
  }
  if (n.includes("productaccountreference") || n === "part" || n === "partnumber") return "part";
  if (n.includes("salesorderitemdescription") || n === "description") return "description";
  if (n.includes("comment1") || n.includes("comment2")) return "comment";
  if (n.includes("quantitydespatched")) return "qty_despatched";
  if (n.includes("salesorderitemquantity") || n === "quantity" || n === "qty") return "qty";
  if (n.includes("notesline1") || n === "notes") return "notes";
  return null;
}

function asQty(value: string): number {
  const n = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}

/** Sage SOPOUT / Outstanding Sales Orders export. */
export function parseSageSopout(grid: string[][]): SagePackLine[] {
  if (!grid.length) return [];
  let headerAt = -1;
  for (let i = 0; i < Math.min(grid.length, 12); i += 1) {
    const joined = grid[i].map(compact).join(" ");
    if (joined.includes("salesordernumber") && joined.includes("product")) {
      headerAt = i;
      break;
    }
    if (grid[i].some((c) => compact(c) === "salesordernumber")) {
      headerAt = i;
      break;
    }
  }
  if (headerAt < 0) return [];

  const fields = grid[headerAt].map(fieldOf);
  const commentIdx = fields
    .map((f, i) => (f === "comment" ? i : -1))
    .filter((i) => i >= 0);

  const out: SagePackLine[] = [];
  for (const row of grid.slice(headerAt + 1)) {
    const get = (key: string) => {
      const i = fields.indexOf(key);
      return i >= 0 ? (row[i] ?? "").trim() : "";
    };
    const soNumber = get("so_number").replace(/\.0+$/, "");
    if (!soNumber || /^company/i.test(soNumber)) continue;
    const part = get("part");
    const description = get("description");
    if (!part && !description) continue;
    const comments = commentIdx
      .map((i) => (row[i] ?? "").trim())
      .filter(Boolean)
      .join(" · ");
    out.push({
      soNumber,
      company: get("company"),
      orderDate: parseFlexibleDate(get("order_date")),
      part,
      description,
      comment: comments,
      qty: asQty(get("qty")),
      qtyDespatched: asQty(get("qty_despatched")),
      notes: get("notes"),
    });
  }
  return out;
}

export function isSageSopout(grid: string[][]): boolean {
  const head = grid.slice(0, 8).flat().map(compact).join(" ");
  return (
    head.includes("salesordernumber") &&
    (head.includes("salesorderitem") || head.includes("sopout") || head.includes("outstanding"))
  );
}
