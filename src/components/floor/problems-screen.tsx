import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatShopDate, hoursToDays } from "@/lib/floor/dates";
import { BUILDER_OPTIONS, TASK_STATUS_OPTIONS, type FloorState, type ProblemTicket, type TaskStatus } from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { sourcesFromConsumed } from "@/lib/floor/lookups";
import { ComboCell, partOptions, SelectCell, TextCell, AreaCell } from "./cells";
import { ErrorBanner, FilterChip, LoadingTable, ScreenHeader } from "./shell";
import { PtId } from "./id-stack";
import { WhoNextCell } from "./who-next";
import { ConsumedWoCell } from "./consumed-wo";
import { PtHistoryButton } from "./notes-list";

const STATUS_OPTS = TASK_STATUS_OPTIONS;
const WHO_OPTS = BUILDER_OPTIONS;

export function ProblemsScreen({ highlight }: { highlight?: string }) {
  const floor = useFloor();
  const mut = useFloorMutations();
  const [showDone, setShowDone] = useState(true);
  const [draftNumber, setDraftNumber] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftCustomer, setDraftCustomer] = useState("");
  const [draftPart, setDraftPart] = useState("");
  const [draftWho, setDraftWho] = useState("");
  const [draftDays, setDraftDays] = useState("");

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Problem tickets" />
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
  const rows = state.problemTickets.filter((t) => (showDone ? true : t.status !== "done"));

  function add() {
    const number = draftNumber.trim();
    if (!number) return;
    const days = Number.parseFloat(draftDays);
    mut.addPt.mutate(
      {
        prospectNumber: number,
        title: draftTitle.trim() || undefined,
        customer: draftCustomer.trim() || undefined,
        part: draftPart.trim() || undefined,
        assignedBuild: draftWho,
        hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
      },
      {
        onSuccess: () => {
          setDraftNumber("");
          setDraftTitle("");
          setDraftCustomer("");
          setDraftPart("");
          setDraftWho("");
          setDraftDays("");
        },
      },
    );
  }

  return (
    <>
      <ScreenHeader
        title="Problem tickets"
        hint="Same shop columns as a work order: part, who, who next, note to production, added, started, finished, status, plus consumed WOs. Hardware history is the log on those consumed work orders. Type the Prospect number — the PT link still opens Prospect."
        actions={
          <FilterChip on={showDone} onClick={() => setShowDone(!showDone)}>
            {showDone ? "Showing all" : "Hide done"}
          </FilterChip>
        }
      />

      <div className="sheet-wrap">
        <table className="sheet min-w-[98rem]">
          <thead>
            <tr>
              <th>PT</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Part</th>
              <th>Who</th>
              <th>Who next</th>
              <th>Notes to production</th>
              <th>Added</th>
              <th>Started</th>
              <th>Finished</th>
              <th>Status</th>
              <th>Consumed WO</th>
              <th>Hardware history</th>
              <th>Days</th>
              <th>Status note</th>
              <th>Build order notes</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={17} className="px-3 py-4 text-sm text-muted">
                  No problem tickets yet. Add a Prospect number below.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <ProblemRow
                  key={t.id}
                  t={t}
                  state={state}
                  highlight={highlight === t.prospectNumber}
                  mut={mut}
                />
              ))
            )}
            <tr className="is-new">
              <td>
                <div className="flex items-center gap-0.5">
                  <span className="shrink-0 px-2.5 font-mono text-sm font-semibold text-muted">PT-</span>
                  <div className="min-w-0 flex-1">
                    <TextCell
                      value={draftNumber}
                      placeholder="1842"
                      mono
                      live
                      onSave={setDraftNumber}
                    />
                  </div>
                </div>
              </td>
              <td>
                <TextCell
                  value={draftTitle}
                  placeholder="Title"
                  live
                  onSave={setDraftTitle}
                />
              </td>
              <td>
                <TextCell
                  value={draftCustomer}
                  placeholder="Customer"
                  live
                  onSave={setDraftCustomer}
                />
              </td>
              <td>
                <ComboCell
                  value={draftPart}
                  options={partOptions(state.parts)}
                  placeholder="Part"
                  onSave={setDraftPart}
                />
              </td>
              <td>
                <SelectCell
                  value={draftWho}
                  options={WHO_OPTS}
                  allowEmpty
                  emptyLabel="—"
                  onSave={setDraftWho}
                />
              </td>
              <td colSpan={11} className="text-sm text-muted">
                <span className="block px-2.5">Who next, dates, consumed WOs and history after you add.</span>
              </td>
              <td>
                <div className="px-1 py-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={add}
                    disabled={!draftNumber.trim() || mut.addPt.isPending}
                  >
                    Add PT
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProblemRow({
  t,
  state,
  highlight,
  mut,
}: {
  t: ProblemTicket;
  state: FloorState;
  highlight: boolean;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  return (
    <tr className={highlight ? "is-open" : undefined}>
      <td>
        <div className="flex items-center gap-1">
          <PtId prospectNumber={t.prospectNumber} compact />
        </div>
      </td>
      <td>
        <TextCell
          value={t.title}
          placeholder="Title"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, title: v })}
        />
      </td>
      <td>
        <TextCell
          value={t.customer}
          placeholder="Customer"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, customer: v })}
        />
      </td>
      <td>
        <ComboCell
          value={t.part}
          options={partOptions(state.parts)}
          placeholder="Part"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, part: v })}
        />
      </td>
      <td>
        <SelectCell
          value={t.assignedBuild}
          options={WHO_OPTS}
          allowEmpty
          emptyLabel="—"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, assignedBuild: v })}
        />
      </td>
      <td className="min-w-36">
        <WhoNextCell pt={t} mut={mut} />
      </td>
      <td className="min-w-52">
        <AreaCell
          value={t.notesToProduction}
          placeholder="Note to production"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, notesToProduction: v })}
        />
      </td>
      <td>
        <span className="block px-2.5">{formatShopDate(t.dateAdded) || "—"}</span>
      </td>
      <td>
        <TextCell
          type="date"
          value={t.dateStarted ?? ""}
          onSave={(v) => mut.patchPt.mutate({ id: t.id, dateStarted: v || null })}
        />
      </td>
      <td>
        <TextCell
          type="date"
          value={t.dateFinished ?? ""}
          onSave={(v) => mut.patchPt.mutate({ id: t.id, dateFinished: v || null })}
        />
      </td>
      <td>
        <SelectCell
          value={t.status}
          options={STATUS_OPTS}
          onSave={(v) => mut.patchPt.mutate({ id: t.id, status: v as TaskStatus })}
        />
      </td>
      <td className="min-w-44">
        <ConsumedWoCell
          items={t.consumed}
          state={state}
          onSave={(consumed) => mut.patchPt.mutate({ id: t.id, consumed })}
        />
      </td>
      <td className="history-cell">
        <PtHistoryButton
          prospectNumber={t.prospectNumber}
          sources={sourcesFromConsumed(t.consumed, state.workOrders)}
          onAdd={(n) =>
            mut.woHistory.mutate({ woNumber: n.woNumber, author: n.author, text: n.text })
          }
        />
      </td>
      <td>
        <TextCell
          type="number"
          min={0}
          value={hoursToDays(t.hours)}
          mono
          onSave={(v) => {
            const n = Number.parseFloat(v);
            if (Number.isFinite(n) && n >= 0) {
              mut.patchPt.mutate({ id: t.id, hours: n * 8 });
            }
          }}
        />
      </td>
      <td>
        <TextCell
          value={t.prospectStatus}
          placeholder="Status note"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, prospectStatus: v })}
        />
      </td>
      <td className="min-w-52">
        <AreaCell
          value={t.notes}
          placeholder="Build order notes"
          onSave={(v) => mut.patchPt.mutate({ id: t.id, notes: v })}
        />
      </td>
      <td>
        <div className="flex items-center gap-1 px-1">
          <button
            type="button"
            aria-label="Remove problem ticket"
            className="flex size-10 items-center justify-center text-muted hover:text-danger"
            onClick={() => mut.ptDelete.mutate(t.id)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
