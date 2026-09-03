import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatShopDate, hoursToDays, isPastDate, todayIso } from "@/lib/floor/dates";
import { BUILDER_OPTIONS, UNIT_STATUS_OPTIONS, WO_STATUS_OPTIONS, type FloorState, type SagePackLine, type SalesLine, type UnitStatus, type WoStatus } from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { CheckCell, ComboCell, partOptions, SelectCell, TextCell, AreaCell, woOptionsForPart } from "./cells";
import { ErrorBanner, FilterChip, LoadingTable, ScreenHeader } from "./shell";
import { WoId, SoId } from "./id-stack";
import { UnitPill } from "./status-pill";
import { HistoryButton, HoldReasonDialog, NotesList } from "./notes-list";
import { WhoNextCell } from "./who-next";
import { useAuthor } from "./author";
import { soFileLabel } from "@/lib/floor/labels";
import { earliestNeedForWo, sageLinesWithoutWo, salesLinesWithoutWo, ticketTouchesWo } from "@/lib/floor/lookups";
import { jobHours } from "@/lib/floor/schedule";
import { BuildRecordPanel, buildFill } from "./build-record-panel";

const STATUS_OPTS = WO_STATUS_OPTIONS;
const WHO_OPTS = BUILDER_OPTIONS;
const UNIT_OPTS = UNIT_STATUS_OPTIONS;

export function WorkOrdersScreen({ openId }: { openId?: string }) {
  const floor = useFloor();
  const mut = useFloorMutations();
  const navigate = useNavigate();
  const [showClosed, setShowClosed] = useState(false);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Work orders" />
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

  return (
    <Loaded
      state={floor.data}
      openId={openId}
      showClosed={showClosed}
      setShowClosed={setShowClosed}
      mut={mut}
      navigate={navigate}
    />
  );
}

function Loaded({
  state,
  openId,
  showClosed,
  setShowClosed,
  mut,
  navigate,
}: {
  state: FloorState;
  openId?: string;
  showClosed: boolean;
  setShowClosed: (v: boolean) => void;
  mut: ReturnType<typeof useFloorMutations>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const today = todayIso();
  const { author } = useAuthor();
  const [holdWo, setHoldWo] = useState<string | null>(null);
  const [draftNumber, setDraftNumber] = useState(state.nextWoNumber);
  const [draftPart, setDraftPart] = useState("");
  const [draftQty, setDraftQty] = useState("1");
  const [draftWho, setDraftWho] = useState("Simon");

  const rows = state.workOrders
    .filter((wo) =>
      showClosed
        ? true
        : wo.status === "pending" || wo.status === "active" || wo.status === "on_hold",
    )
    .sort((a, b) => a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true }));

  function toggle(woNumber: string) {
    if (openId === woNumber) {
      void navigate({ to: "/work-orders" });
    } else {
      void navigate({ to: "/work-orders/$woNumber", params: { woNumber } });
    }
  }

  function saveNew() {
    const qty = Number.parseInt(draftQty, 10);
    mut.createWo.mutate(
      {
        woNumber: draftNumber.trim() || undefined,
        part: draftPart,
        qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
        assignedBuild: draftWho || "Simon",
      },
      {
        onSuccess: () => {
          setDraftPart("");
          setDraftQty("1");
          setDraftWho("Simon");
        },
      },
    );
  }

  return (
    <>
      <ScreenHeader
        title="Work orders"
        hint="Need date comes from sales. Who next is the handoff — Pass on moves the job off this person's build list. All includes cancelled."
        actions={
          <FilterChip on={showClosed} onClick={() => setShowClosed(!showClosed)}>
            {showClosed ? "All (closed + cancelled)" : "Open + on hold"}
          </FilterChip>
        }
      />
      <div className="sheet-wrap is-pinned">
        <table className="sheet min-w-[72rem]">
          <thead>
            <tr>
              <th className="w-8" />
              <th>WO</th>
              <th>Part</th>
              <th className="w-16">Qty</th>
              <th>Build hours</th>
              <th>Who</th>
              <th>Who next</th>
              <th>Need date</th>
              <th>Status</th>
              <th>Added</th>
              <th>Started</th>
              <th className="w-14">Sage</th>
              <th>Notes to production</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((wo) => {
              const open = openId === wo.woNumber;
              const need = earliestNeedForWo(wo.woNumber, state.salesLines, state.salesOrders);
              const needRed =
                isPastDate(need, today) &&
                (wo.status === "pending" || wo.status === "active");
              return (
                <WoBlock
                  key={wo.woNumber}
                  state={state}
                  woNumber={wo.woNumber}
                  open={open}
                  needDate={need}
                  needRed={needRed}
                  onToggle={() => toggle(wo.woNumber)}
                  mut={mut}
                  author={author}
                  setHoldWo={setHoldWo}
                />
              );
            })}
            <tr className="is-new">
              <td />
              <td>
                <TextCell
                  value={draftNumber}
                  mono
                  placeholder={state.nextWoNumber}
                  onSave={setDraftNumber}
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
                <TextCell type="number" min={1} value={draftQty} mono onSave={setDraftQty} />
              </td>
              <td>
                <span className="block px-2.5 text-xs text-muted">Spec unless typed</span>
              </td>
              <td>
                <SelectCell
                  value={draftWho}
                  options={WHO_OPTS}
                  allowEmpty
                  onSave={setDraftWho}
                />
              </td>
              <td />
              <td>
                <span className="block px-2.5 text-sm text-muted">From sales</span>
              </td>
              <td colSpan={6}>
                <div className="px-2 py-1.5">
                  <Button type="button" size="sm" onClick={saveNew} disabled={!draftPart.trim()}>
                    Add work order
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {holdWo ? (
        <HoldReasonDialog
          woNumber={holdWo}
          part={state.workOrders.find((w) => w.woNumber === holdWo)?.part}
          onClose={() => setHoldWo(null)}
          onConfirm={(reason) => {
            mut.patchWo.mutate({
              woNumber: holdWo,
              status: "on_hold",
              holdReason: reason,
              historyAuthor: author,
            });
            setHoldWo(null);
          }}
        />
      ) : null}
      <NoWorkOrderPanel state={state} mut={mut} />
    </>
  );
}

function WoBlock({
  state,
  woNumber,
  open,
  needDate,
  needRed,
  onToggle,
  mut,
  author,
  setHoldWo,
}: {
  state: FloorState;
  woNumber: string;
  open: boolean;
  needDate: string | null;
  needRed: boolean;
  onToggle: () => void;
  mut: ReturnType<typeof useFloorMutations>;
  author: string;
  setHoldWo: (wo: string | null) => void;
}) {
  const wo = state.workOrders.find((w) => w.woNumber === woNumber);
  if (!wo) return null;
  const units = state.units.filter((u) => u.workOrderNumber === woNumber);
  const tickets = state.tickets.filter((t) => ticketTouchesWo(t.workOrderNumber, woNumber));
  const lines = state.salesLines.filter((l) => l.workOrderNumber === woNumber);
  const fill = buildFill(state, wo);

  return (
    <>
      <tr className={open ? "is-open" : undefined}>
        <td>
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={onToggle}
            className="flex h-11 w-full items-center justify-center text-muted"
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </td>
        <td>
          <WoId woNumber={wo.woNumber} />
          {fill.total ? (
            <span
              className={`block px-2.5 pb-1 text-xs ${
                fill.filled === fill.total ? "text-muted" : "font-medium text-primary"
              }`}
            >
              {fill.filled}/{fill.total} recorded
            </span>
          ) : null}
        </td>
        <td>
          <ComboCell
            value={wo.part}
            options={partOptions(state.parts)}
            onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, part: v })}
          />
        </td>
        <td>
          <TextCell
            type="number"
            min={1}
            value={String(wo.qty)}
            mono
            onSave={(v) => {
              const n = Number.parseInt(v, 10);
              if (Number.isFinite(n) && n >= 1) mut.patchWo.mutate({ woNumber: wo.woNumber, qty: n });
            }}
          />
        </td>
        <td>
          <TextCell
            type="number"
            min={0}
            value={wo.buildTimeHours == null ? "" : String(wo.buildTimeHours)}
            placeholder={String(jobHours({ ...wo, buildTimeHours: null }, state.parts))}
            mono
            onSave={(v) => {
              if (v.trim() === "") {
                mut.patchWo.mutate({ woNumber: wo.woNumber, buildTimeHours: null });
                return;
              }
              const n = Number.parseFloat(v);
              if (Number.isFinite(n) && n >= 0) {
                mut.patchWo.mutate({ woNumber: wo.woNumber, buildTimeHours: n });
              }
            }}
          />
          {wo.buildTimeHours != null ? (
            <span className="block px-2.5 pb-1 text-[0.65rem] text-muted">
              spec {jobHours({ ...wo, buildTimeHours: null }, state.parts)} · {hoursToDays(wo.buildTimeHours)} d
            </span>
          ) : (
            <span className="block px-2.5 pb-1 text-[0.65rem] text-muted">
              {hoursToDays(jobHours(wo, state.parts))} d
            </span>
          )}
        </td>
        <td>
          <SelectCell
            value={wo.assignedBuild}
            options={WHO_OPTS}
            allowEmpty
            onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, assignedBuild: v })}
          />
        </td>
        <td className="min-w-36">
          <WhoNextCell wo={wo} mut={mut} />
        </td>
        <td>
          <span className={`block px-2.5 ${needRed ? "font-semibold text-danger" : ""}`}>
            {formatShopDate(needDate) || "—"}
          </span>
        </td>
        <td>
          <SelectCell
            value={wo.status}
            options={STATUS_OPTS}
            onSave={(v) => {
              if (v === "on_hold") setHoldWo(wo.woNumber);
              else
                mut.patchWo.mutate({
                  woNumber: wo.woNumber,
                  status: v as WoStatus,
                  historyAuthor: author,
                });
            }}
          />
        </td>
        <td>
          <span className="block px-2.5">{formatShopDate(wo.dateAdded)}</span>
        </td>
        <td>
          <span className="block px-2.5">{formatShopDate(wo.dateStarted) || "—"}</span>
        </td>
        <td>
          <CheckCell
            checked={wo.builtInSage}
            label={`Built in Sage for ${wo.woNumber}`}
            onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, builtInSage: v })}
          />
        </td>
        <td className="min-w-56">
          <AreaCell
            value={wo.notesToProduction}
            placeholder="Note to production"
            onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, notesToProduction: v })}
          />
        </td>
        <td className="history-cell">
          <HistoryButton
            woNumber={wo.woNumber}
            part={wo.part}
            notes={wo.hardwareHistory}
            onAdd={(n) =>
              mut.woHistory.mutate({ woNumber: wo.woNumber, author: n.author, text: n.text })
            }
          />
        </td>
      </tr>
      {open ? (
        <tr>
          <td colSpan={14} className="bg-bg">
            <div className="expand-panel">
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Units</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => mut.unitAdd.mutate(wo.woNumber)}
                  >
                    <Plus className="size-3.5" />
                    Unit
                  </Button>
                </div>
                {units.length === 0 ? (
                  <p className="text-sm text-muted">None yet. Qty does not create units.</p>
                ) : (
                  <div className="space-y-2">
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        className="rounded-[var(--radius-sm)] border border-border p-2"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="font-mono text-sm font-medium">{unit.unitId}</p>
                          <UnitPill status={unit.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <TextCell
                            value={unit.serialOrId}
                            placeholder="Serial / ID"
                            onSave={(v) => mut.patchUnit.mutate({ id: unit.id, serialOrId: v })}
                          />
                          <SelectCell
                            value={unit.status}
                            options={UNIT_OPTS}
                            onSave={(v) =>
                              mut.patchUnit.mutate({
                                id: unit.id,
                                status: v as UnitStatus,
                              })
                            }
                          />
                          <TextCell
                            value={unit.salesOrderNumber ?? ""}
                            placeholder="Sales order"
                            onSave={(v) =>
                              mut.patchUnit.mutate({
                                id: unit.id,
                                salesOrderNumber: v || null,
                              })
                            }
                          />
                          <TextCell
                            type="date"
                            value={unit.despatchDate ?? ""}
                            onSave={(v) =>
                              mut.patchUnit.mutate({
                                id: unit.id,
                                despatchDate: v || null,
                              })
                            }
                          />
                        </div>
                        <div className="mt-2">
                          <NotesList
                            notes={unit.notes}
                            onAdd={(n) =>
                              mut.unitNote.mutate({ id: unit.id, author: n.author, text: n.text })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">Quality tickets</h2>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/tickets/new" search={{ wo: wo.woNumber }}>
                      <Plus className="size-3.5" />
                      QT
                    </Link>
                  </Button>
                </div>
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted">None on this job.</p>
                ) : (
                  <ul className="space-y-1">
                    {tickets.map((t) => (
                      <li key={t.ticketNumber}>
                        <Link
                          to="/tickets/$ticketNumber"
                          params={{ ticketNumber: t.ticketNumber }}
                          className="text-sm font-medium text-primary"
                        >
                          {t.ticketNumber}
                        </Link>
                        <span className="text-sm text-muted">
                          {" "}
                          {t.title || t.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
                <h2 className="mb-2 text-sm font-semibold">Sales lines</h2>
                {lines.length === 0 ? (
                  <p className="text-sm text-muted">No sales orders point at this WO.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {lines.map((line) => {
                      const so = state.salesOrders.find((s) => s.soNumber === line.soNumber);
                      return (
                        <li
                          key={line.id}
                          className="rounded-[var(--radius-sm)] border border-border px-2 py-2 text-sm"
                        >
                          <Link
                            to="/sales/$soNumber"
                            params={{ soNumber: line.soNumber }}
                            className="font-medium hover:text-primary"
                          >
                            SO {line.soNumber}
                          </Link>
                          <p className="text-muted">
                            {so?.company} · {line.part} × {line.qty}
                          </p>
                          <p className="file-label">{soFileLabel(line.soNumber)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
            <div className="mt-4">
              <BuildRecordPanel wo={wo} state={state} />
            </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function NoWorkOrderPanel({
  state,
  mut,
}: {
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const missingLines = salesLinesWithoutWo(state);
  const sageExtras = sageLinesWithoutWo(state);
  if (!missingLines.length && !sageExtras.length) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-1 text-sm font-semibold">Without a work order</h2>
      <p className="mb-3 text-sm text-muted">
        Sales lines that still need a WO, plus Sage extras that never become a
        job (magnets, instructions, subscriptions). Make a TSK if it needs bench
        time this year — pack-list items stay on Shipping.
      </p>
      {missingLines.length ? (
        <div className="mb-4">
          <h3 className="mb-1 text-xs uppercase tracking-wide text-muted">
            Sales lines
          </h3>
          <div className="sheet-wrap">
            <table className="sheet min-w-[48rem]">
              <thead>
                <tr>
                  <th>SO</th>
                  <th>Company</th>
                  <th>Part</th>
                  <th className="w-16">Qty</th>
                  <th>Trace</th>
                </tr>
              </thead>
              <tbody>
                {missingLines.map((line) => (
                  <MissingLineRow key={line.id} line={line} state={state} mut={mut} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {sageExtras.length ? (
        <div>
          <h3 className="mb-1 text-xs uppercase tracking-wide text-muted">
            Sage extras
          </h3>
          <div className="sheet-wrap">
            <table className="sheet min-w-[48rem]">
              <thead>
                <tr>
                  <th>SO</th>
                  <th>Company</th>
                  <th>Part</th>
                  <th>Description</th>
                  <th className="w-16">Qty</th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody>
                {sageExtras.map((line) => (
                  <SageNoWoRow key={line.id} line={line} mut={mut} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MissingLineRow({
  line,
  state,
  mut,
}: {
  line: SalesLine;
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const so = state.salesOrders.find((s) => s.soNumber === line.soNumber);
  return (
    <tr>
      <td>
        <SoId soNumber={line.soNumber} />
      </td>
      <td>
        <span className="block px-2.5">{so?.company || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5 font-medium">{line.part || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5 font-mono">{line.qty}</span>
      </td>
      <td>
        <ComboCell
          value={line.workOrderNumber}
          options={woOptionsForPart(state.workOrders, line.part)}
          placeholder="Trace WO"
          onSave={(v) => mut.patchLine.mutate({ id: line.id, workOrderNumber: v })}
        />
      </td>
    </tr>
  );
}

function SageNoWoRow({
  line,
  mut,
}: {
  line: SagePackLine;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const title = [line.part, line.description].filter(Boolean).join(" · ");
  return (
    <tr className="is-task">
      <td>
        <span className="block px-2.5 font-mono text-sm">{line.soNumber}</span>
      </td>
      <td>
        <span className="block px-2.5">{line.company || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5 font-mono text-sm">{line.part || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5">{line.description || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5 font-mono">{line.qty}</span>
      </td>
      <td>
        <div className="px-1 py-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!title.trim() || mut.addTask.isPending}
            onClick={() =>
              mut.addTask.mutate({
                title: `${title} (SO ${line.soNumber})`,
              })
            }
          >
            Make TSK
          </Button>
        </div>
      </td>
    </tr>
  );
}
