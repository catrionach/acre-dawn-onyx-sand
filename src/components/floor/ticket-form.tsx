import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatShopDate } from "@/lib/floor/dates";
import { QT_CAUSES, type QtCause, type TicketStatus } from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { parseWoNumbers } from "@/lib/floor/lookups";
import { ComboCell, partOptions, woOptions } from "./cells";
import { ErrorBanner, LoadingTable, ScreenHeader } from "./shell";
import { QtPill } from "./status-pill";
import { useAuthor } from "./author";
import { cn } from "@/lib/utils";

const CAUSE_LABEL: Record<QtCause, string> = {
  TBD: "TBD",
  "component failure": "Component failure",
  "design work needed": "Design work needed",
  "build error": "Build error",
  "missing parts": "Missing parts",
  documentation: "Documentation",
};

function CausePicker({
  value,
  onChange,
}: {
  value: QtCause[];
  onChange: (next: QtCause[]) => void;
}) {
  function toggle(cause: QtCause) {
    if (value.includes(cause)) onChange(value.filter((c) => c !== cause));
    else onChange([...value, cause]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {QT_CAUSES.map((cause) => {
        const on = value.includes(cause);
        return (
          <button
            key={cause}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(cause)}
            className={cn("cause-chip", on && "is-on")}
          >
            {CAUSE_LABEL[cause]}
          </button>
        );
      })}
    </div>
  );
}

export function TicketFormScreen({
  ticketNumber,
  defaultWo = "",
}: {
  ticketNumber?: string;
  defaultWo?: string;
}) {
  const floor = useFloor();
  const mut = useFloorMutations();
  const navigate = useNavigate();
  const { author } = useAuthor();
  const isNew = !ticketNumber;
  const [draftTitle, setDraftTitle] = useState("");
  const [draftWo, setDraftWo] = useState(defaultWo);
  const [draftSummary, setDraftSummary] = useState("");
  const [draftCauses, setDraftCauses] = useState<QtCause[]>(["TBD"]);
  const [draftStatus, setDraftStatus] = useState<TicketStatus>("open");
  const [draftPart, setDraftPart] = useState("");
  const [draftAction, setDraftAction] = useState(false);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Quality ticket" />
        <LoadingTable />
      </>
    );
  }
  if (floor.error || !floor.data) {
    return (
      <ErrorBanner
        message={floor.error instanceof Error ? floor.error.message : "Could not load CE Master."}
      />
    );
  }

  const state = floor.data;
  const ticket = ticketNumber
    ? state.tickets.find((t) => t.ticketNumber === ticketNumber)
    : undefined;

  if (ticketNumber && !ticket) {
    return (
      <>
        <ScreenHeader title="Quality ticket" />
        <ErrorBanner message={`Ticket ${ticketNumber} was not found.`} />
        <p className="mt-3">
          <Link to="/tickets" className="text-sm font-medium text-primary">
            Back to QTs
          </Link>
        </p>
      </>
    );
  }

  const woNumber = ticket ? ticket.workOrderNumber : draftWo || defaultWo;
  const firstWo = parseWoNumbers(woNumber)[0] ?? "";
  const wo = state.workOrders.find((w) => w.woNumber === firstWo);

  function save(patch: {
    title?: string;
    workOrderNumber?: string;
    part?: string;
    problem?: string;
    causes?: QtCause[];
    furtherAction?: boolean;
    status?: TicketStatus;
  }) {
    if (!ticket) return;
    mut.patchQt.mutate({ ticketNumber: ticket.ticketNumber, ...patch });
  }

  function create() {
    const workOrderNumber = (draftWo || defaultWo).trim();
    const nextId = state.nextQtNumber;
    mut.qtCreate.mutate(
      {
        workOrderNumber: workOrderNumber || undefined,
        title: draftTitle,
        problem: draftSummary,
        part: draftPart,
        causes: draftCauses.length ? draftCauses : ["TBD"],
        furtherAction: draftAction,
        assignedTo: author,
        status: draftStatus,
      },
      {
        onSuccess: () => {
          void navigate({
            to: "/tickets/$ticketNumber",
            params: { ticketNumber: nextId },
          });
        },
      },
    );
  }

  return (
    <>
      <ScreenHeader
        title={ticket ? ticket.ticketNumber : "New quality ticket"}
        hint={ticket ? `${ticket.part || wo?.part || ""} · opened ${formatShopDate(ticket.dateOpened)}` : "WO is optional. Use 437 or 437, 438 for specific jobs. Causes can be more than one."}
        actions={
          <Link to="/tickets" className="text-sm font-medium text-primary">
            All QTs
          </Link>
        }
      />

      <form
        className="qt-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (isNew) create();
        }}
      >
        <label className="qt-field">
          <span>QT title</span>
          {ticket ? (
            <input
              key={`${ticket.ticketNumber}-title`}
              className="cell-input qt-input"
              defaultValue={ticket.title}
              placeholder="What's wrong"
              onBlur={(e) => {
                if (e.target.value !== ticket.title) save({ title: e.target.value });
              }}
            />
          ) : (
            <input
              className="cell-input qt-input"
              value={draftTitle}
              placeholder="What's wrong"
              onChange={(e) => setDraftTitle(e.target.value)}
            />
          )}
        </label>

        <label className="qt-field">
          <span>WO</span>
          <div className="qt-input-wrap">
            <ComboCell
              value={woNumber}
              options={woOptions(state.workOrders)}
              placeholder="437 or 437, 438"
              onSave={(v) => {
                const nums = parseWoNumbers(v);
                const nextWo = state.workOrders.find((w) => w.woNumber === nums[0]);
                if (ticket) {
                  const patch: { workOrderNumber: string; part?: string } = {
                    workOrderNumber: v,
                  };
                  if (nextWo && (!ticket.part || ticket.part === wo?.part)) {
                    patch.part = nextWo.part;
                  }
                  save(patch);
                } else {
                  setDraftWo(v);
                  if (nextWo && (!draftPart || draftPart === wo?.part)) {
                    setDraftPart(nextWo.part);
                  }
                }
              }}
            />
          </div>
          {wo ? (
            <p className="qt-hint">
              {wo.part} × {wo.qty} · {wo.status} · {wo.assignedBuild || "Unassigned"}
              {parseWoNumbers(woNumber).length > 1 ? " · plus other WOs" : ""}
            </p>
          ) : (
            <p className="qt-hint">One job (437) or several, commas between them.</p>
          )}
        </label>

        <label className="qt-field">
          <span>Part number</span>
          <div className="qt-input-wrap">
            <ComboCell
              value={ticket ? ticket.part : draftPart || wo?.part || ""}
              options={partOptions(state.parts)}
              placeholder="Part number"
              onSave={(v) => {
                if (ticket) save({ part: v });
                else setDraftPart(v);
              }}
            />
          </div>
        </label>

        <label className="qt-field">
          <span>Summary / description</span>
          {ticket ? (
            <textarea
              key={`${ticket.ticketNumber}-summary`}
              className="cell-area qt-area"
              rows={6}
              defaultValue={ticket.problem}
              placeholder="What happened, what we saw"
              onBlur={(e) => {
                if (e.target.value !== ticket.problem) save({ problem: e.target.value });
              }}
            />
          ) : (
            <textarea
              className="cell-area qt-area"
              rows={6}
              value={draftSummary}
              placeholder="What happened, what we saw"
              onChange={(e) => setDraftSummary(e.target.value)}
            />
          )}
        </label>

        <div className="qt-field">
          <span>Causes</span>
          <CausePicker
            value={ticket ? ticket.causes : draftCauses}
            onChange={(next) => {
              if (ticket) save({ causes: next });
              else setDraftCauses(next);
            }}
          />
        </div>

        <label className="qt-check">
          <input
            type="checkbox"
            checked={ticket ? ticket.furtherAction : draftAction}
            onChange={(e) => {
              if (ticket) save({ furtherAction: e.target.checked });
              else setDraftAction(e.target.checked);
            }}
            className="size-4 accent-primary"
          />
          <span>Further action</span>
        </label>

        <div className="qt-field">
          <span>Status</span>
          <div className="flex flex-wrap items-center gap-2">
            {(["open", "closed"] as TicketStatus[]).map((s) => {
              const current = ticket ? ticket.status : draftStatus;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={current === s}
                  className={cn("cause-chip", current === s && "is-on")}
                  onClick={() => {
                    if (ticket) save({ status: s });
                    else setDraftStatus(s);
                  }}
                >
                  {s === "open" ? "Open" : "Closed"}
                </button>
              );
            })}
            {ticket ? <QtPill status={ticket.status} /> : null}
            {ticket?.dateClosed ? (
              <span className="text-sm text-muted">Closed {formatShopDate(ticket.dateClosed)}</span>
            ) : null}
          </div>
        </div>

        {isNew ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={mut.qtCreate.isPending}>
              {mut.qtCreate.isPending ? "Saving…" : "Create ticket"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => void navigate({ to: "/tickets" })}>
              Cancel
            </Button>
          </div>
        ) : null}
      </form>
    </>
  );
}
