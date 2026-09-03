import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TicketStatus, WorkOrder } from "@/lib/floor/types";
import { ComboCell, TextCell, woOptions } from "./cells";

export function QtRaiseForm({
  defaultWo,
  workOrders,
  author,
  pending,
  onCreate,
  onCancel,
}: {
  defaultWo: string;
  workOrders: WorkOrder[];
  author: string;
  pending?: boolean;
  onCreate: (input: {
    workOrderNumber: string;
    title: string;
    assignedTo: string;
    status: TicketStatus;
  }) => void;
  onCancel?: () => void;
}) {
  const [wo, setWo] = useState(defaultWo);
  const [title, setTitle] = useState("");
  const [closeNow, setCloseNow] = useState(false);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[8rem]">
        <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-muted">WO</span>
        <ComboCell
          value={wo}
          options={woOptions(workOrders)}
          placeholder="Work order"
          onSave={setWo}
        />
      </div>
      <div className="min-w-[12rem] flex-1">
        <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-muted">Title</span>
        <TextCell value={title} placeholder="What's wrong" onSave={setTitle} />
      </div>
      <label className="flex items-center gap-1.5 pb-2 text-sm">
        <input
          type="checkbox"
          checked={closeNow}
          onChange={(e) => setCloseNow(e.target.checked)}
          className="size-4 accent-primary"
        />
        Close now
      </label>
      <span className="pb-2 text-xs text-muted">{closeNow ? "Date = today" : ""}</span>
      <Button
        type="button"
        size="sm"
        disabled={!wo.trim() || pending}
        onClick={() =>
          onCreate({
            workOrderNumber: wo.trim(),
            title,
            assignedTo: author,
            status: closeNow ? "closed" : "open",
          })
        }
      >
        Add QT
      </Button>
      {onCancel ? (
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
