import { cn } from "@/lib/utils";
import type { SoStatus, TicketStatus, UnitStatus, WoStatus } from "@/lib/floor/types";
import { WO_STATUS_LABELS } from "@/lib/floor/types";

const woTone: Record<WoStatus, string> = {
  pending: "bg-info-bg text-info",
  active: "bg-ok-bg text-ok",
  on_hold: "bg-warn-bg text-warn",
  closed: "bg-surface-2 text-muted",
  cancelled: "bg-danger-bg text-danger",
};

const soTone: Record<SoStatus, string> = {
  open: "bg-ok-bg text-ok",
  waiting_on_customer: "bg-warn-bg text-warn",
  despatched: "bg-surface-2 text-muted",
  cancelled: "bg-danger-bg text-danger",
};

const qtTone: Record<TicketStatus, string> = {
  open: "bg-warn-bg text-warn",
  closed: "bg-surface-2 text-muted",
};

const unitTone: Record<UnitStatus, string> = {
  "in build": "bg-info-bg text-info",
  "on shelf": "bg-ok-bg text-ok",
  shipped: "bg-surface-2 text-muted",
};

const soLabel: Record<SoStatus, string> = {
  open: "Open",
  waiting_on_customer: "Waiting on customer",
  despatched: "Despatched",
  cancelled: "Cancelled",
};

export function StatusPill({
  children,
  tone,
}: {
  children: string;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium capitalize",
        tone,
      )}
    >
      {children}
    </span>
  );
}

export function WoPill({ status }: { status: WoStatus }) {
  return <StatusPill tone={woTone[status]}>{WO_STATUS_LABELS[status]}</StatusPill>;
}

export function SoPill({ status }: { status: SoStatus }) {
  return <StatusPill tone={soTone[status]}>{soLabel[status]}</StatusPill>;
}

export function QtPill({ status }: { status: TicketStatus }) {
  return <StatusPill tone={qtTone[status]}>{status}</StatusPill>;
}

export function UnitPill({ status }: { status: UnitStatus }) {
  return <StatusPill tone={unitTone[status]}>{status}</StatusPill>;
}
