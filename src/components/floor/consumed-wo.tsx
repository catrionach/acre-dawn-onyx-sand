import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { normalizeWoNumber } from "@/lib/floor/lookups";
import { displayWo } from "@/lib/floor/prospect";
import type { ConsumedWo, FloorState } from "@/lib/floor/types";
import { ComboCell, woOptions } from "./cells";

function partForWo(state: FloorState, woNumber: string): string {
  const n = normalizeWoNumber(woNumber) || woNumber.trim();
  if (!n) return "";
  return state.workOrders.find((w) => w.woNumber === n)?.part ?? "";
}

export function ConsumedWoCell({
  items,
  state,
  onSave,
}: {
  items: ConsumedWo[];
  state: FloorState;
  onSave: (items: ConsumedWo[]) => void;
}) {
  const known = new Set(items.map((i) => i.woNumber).filter(Boolean));
  const opts = woOptions(state.workOrders.filter((w) => !known.has(w.woNumber)));

  function add(raw: string) {
    const woNumber = normalizeWoNumber(raw) || raw.trim();
    if (!woNumber) return;
    if (items.some((i) => i.woNumber === woNumber)) return;
    onSave([...items, { woNumber, part: partForWo(state, woNumber) }]);
  }

  return (
    <div className="consumed-cell">
      {items.map((item, index) => {
        const linked =
          Boolean(item.woNumber) && state.workOrders.some((w) => w.woNumber === item.woNumber);
        return (
          <div key={`${item.woNumber}-${index}`} className="consumed-line">
            {linked ? (
              <Link
                to="/work-orders/$woNumber"
                params={{ woNumber: item.woNumber }}
                className="font-mono text-sm font-medium text-primary"
              >
                {displayWo(item.woNumber)}
              </Link>
            ) : (
              <span className="font-mono text-sm">{item.woNumber || "—"}</span>
            )}
            {item.part ? <span className="text-muted">{item.part}</span> : null}
            <button
              type="button"
              className="flex size-8 items-center justify-center text-muted hover:text-danger"
              aria-label={`Remove consumed ${item.woNumber || "row"}`}
              onClick={() => onSave(items.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        );
      })}
      <ComboCell value="" options={opts} placeholder="Add WO" onSave={add} />
    </div>
  );
}
