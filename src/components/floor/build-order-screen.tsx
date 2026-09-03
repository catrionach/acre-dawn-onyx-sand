import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatShopDate,
  hoursToDays,
  isPastDate,
  todayIso,
} from "@/lib/floor/dates";
import { estimatePersonQueue, jobHours, queueItemKey } from "@/lib/floor/schedule";
import { earliestNeedForWo, sourcesFromConsumed, ticketTouchesWo } from "@/lib/floor/lookups";
import {
  BUILDER_OPTIONS,
  BUILDERS,
  TASK_STATUS_OPTIONS,
  WO_STATUS_OPTIONS,
  type BuildTask,
  type FloorState,
  type ProblemTicket,
  type QueueEntry,
  type TaskStatus,
  type WoStatus,
  type WorkOrder,
} from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { SelectCell, TextCell, AreaCell, ComboCell, partOptions } from "./cells";
import { ErrorBanner, LoadingTable, ScreenHeader } from "./shell";
import { PtId, TskId, WoId } from "./id-stack";
import { HistoryButton, HoldReasonDialog, PtHistoryButton } from "./notes-list";
import { WhoNextCell } from "./who-next";
import { ConsumedWoCell } from "./consumed-wo";
import { useAuthor } from "./author";
import { MeetingSummary } from "./meeting-summary";
import { ProspectStatusNow } from "./prospect-sync";
import { BuildRecordPanel, buildFill } from "./build-record-panel";

const STATUS_OPTS = WO_STATUS_OPTIONS;
const TASK_OPTS = TASK_STATUS_OPTIONS;
const WHO_OPTS = BUILDER_OPTIONS;
const PEOPLE = ["Simon", "David"] as const;

function isBoardListed(status: string | undefined, dateStarted: string | null | undefined) {
  if (status === "active") return true;
  return status === "on_hold" && Boolean(dateStarted);
}

function isActiveEntry(entry: QueueEntry, state: FloorState) {
  if (entry.kind === "wo") {
    const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
    return isBoardListed(wo?.status, wo?.dateStarted);
  }
  if (entry.kind === "pt") {
    const p = state.problemTickets.find((x) => x.id === entry.problemId);
    return isBoardListed(p?.status, p?.dateStarted);
  }
  const t = state.buildTasks.find((x) => x.id === entry.taskId);
  return isBoardListed(t?.status, t?.dateStarted);
}

function isPendingEntry(entry: QueueEntry, state: FloorState) {
  if (entry.kind === "wo") {
    const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
    if (!wo) return false;
    if (wo.status === "pending") return true;
    return wo.status === "on_hold" && !wo.dateStarted;
  }
  if (entry.kind === "pt") {
    const p = state.problemTickets.find((x) => x.id === entry.problemId);
    if (!p || p.status === "done" || isBoardListed(p.status, p.dateStarted)) return false;
    return true;
  }
  const t = state.buildTasks.find((x) => x.id === entry.taskId);
  if (!t || t.status === "done" || isBoardListed(t.status, t.dateStarted)) return false;
  return true;
}

export function BuildOrderScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();
  const { author } = useAuthor();
  const [holdWo, setHoldWo] = useState<string | null>(null);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader
          title="Build order"
          hint="Active jobs per person on top. Pending for everyone together at the bottom."
        />
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
    <>
      <Loaded state={floor.data} mut={mut} author={author} holdWo={holdWo} setHoldWo={setHoldWo} />
      {holdWo ? (
        <HoldReasonDialog
          woNumber={holdWo}
          part={floor.data.workOrders.find((w) => w.woNumber === holdWo)?.part}
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
    </>
  );
}

function Loaded({
  state,
  mut,
  author,
  setHoldWo,
}: {
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
  author: string;
  holdWo: string | null;
  setHoldWo: (v: string | null) => void;
}) {
  const extras = [
    ...new Set(
      state.buildQueue
        .map((e) => e.assignedBuild)
        .filter((w) => w && !PEOPLE.includes(w as (typeof PEOPLE)[number])),
    ),
  ].sort((a, b) => {
    const ia = BUILDERS.indexOf(a as (typeof BUILDERS)[number]);
    const ib = BUILDERS.indexOf(b as (typeof BUILDERS)[number]);
    const sa = ia === -1 ? 50 : ia;
    const sb = ib === -1 ? 50 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b);
  });
  const sections = [...PEOPLE, ...extras];

  return (
    <>
      <ScreenHeader
        title="Build order"
        hint="Active jobs per person on top. Pending for everyone together at the bottom."
      />
      {sections.map((who) => (
        <PersonBoard
          key={who}
          who={who}
          title={who}
          mode="active"
          state={state}
          mut={mut}
          author={author}
          setHoldWo={setHoldWo}
        />
      ))}
      <PersonBoard
        who="pending"
        title="Pending"
        mode="pending"
        state={state}
        mut={mut}
        author={author}
        setHoldWo={setHoldWo}
      />
      <MeetingSummary state={state} />
    </>
  );
}

function PersonBoard({
  who,
  title,
  mode,
  state,
  mut,
  author,
  setHoldWo,
}: {
  who: string;
  title: string;
  mode: "active" | "pending";
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
  author: string;
  setHoldWo: (v: string | null) => void;
}) {
  const today = todayIso();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftHours, setDraftHours] = useState("");
  const [draftWho, setDraftWho] = useState("Simon");
  const [draftPt, setDraftPt] = useState("");
  const [draftPtTitle, setDraftPtTitle] = useState("");
  const [draftPtPart, setDraftPtPart] = useState("");
  const [draftPtHours, setDraftPtHours] = useState("");
  const [draftPtWho, setDraftPtWho] = useState("Simon");
  const drag = useRef<{ id: string; gap: number | null } | null>(null);

  const entries = useMemo(() => {
    const all = [...state.buildQueue].sort((a, b) => {
      const ra = PEOPLE.indexOf(a.assignedBuild as (typeof PEOPLE)[number]);
      const rb = PEOPLE.indexOf(b.assignedBuild as (typeof PEOPLE)[number]);
      const sa = ra === -1 ? 99 : ra;
      const sb = rb === -1 ? 99 : rb;
      if (sa !== sb) return sa - sb;
      return a.position - b.position || a.id - b.id;
    });
    if (mode === "active") {
      return all.filter((e) => e.assignedBuild === who && isActiveEntry(e, state));
    }
    return all.filter((e) => isPendingEntry(e, state));
  }, [state, who, mode]);

  const estimates = useMemo(() => {
    const out = new Map<string, { hours: number; start: string; complete: string; key: string }>();
    const names = [...new Set(state.buildQueue.map((e) => e.assignedBuild))];
    for (const name of names) {
      const person = state.buildQueue
        .filter((e) => e.assignedBuild === name)
        .sort((a, b) => a.position - b.position || a.id - b.id);
      const est = estimatePersonQueue(
        person,
        state.workOrders,
        state.buildTasks,
        state.parts,
        today,
        state.problemTickets,
      );
      for (const [k, v] of est) out.set(k, v);
    }
    return out;
  }, [state.buildQueue, state.workOrders, state.buildTasks, state.problemTickets, state.parts, today]);

  const keys = entries.map(queueItemKey);
  const lastVisibleIndex = entries.length - 1;

  function commit(id: string, targetIndex: number) {
    const next = placeAtIndex(keys, id, targetIndex);
    if (next) mut.reorder.mutate({ who: mode === "pending" ? "pending" : who, keys: next });
  }

  function gapFromPoint(clientX: number, clientY: number): number | null {
    const node = document.elementFromPoint(clientX, clientY);
    const row = node?.closest("tr[data-qid]");
    if (!(row instanceof HTMLElement)) return null;
    if (mode !== "pending" && row.dataset.who !== who) return null;
    const targetId = row.dataset.qid;
    if (!targetId) return null;
    const targetIdx = keys.indexOf(targetId);
    if (targetIdx < 0) return null;
    const rect = row.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2 ? targetIdx : targetIdx + 1;
  }

  function onHandlePointerDown(e: PointerEvent<HTMLButtonElement>, id: string) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const from = keys.indexOf(id);
    drag.current = { id, gap: from };
    setDragId(id);
    setDropIndex(from);
  }

  function onHandlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const gap = gapFromPoint(e.clientX, e.clientY);
    if (gap == null) return;
    drag.current.gap = gap;
    setDropIndex(gap);
  }

  function onHandlePointerUp() {
    const session = drag.current;
    drag.current = null;
    setDragId(null);
    setDropIndex(null);
    if (!session || session.gap == null) return;
    const from = keys.indexOf(session.id);
    commit(session.id, gapToIndex(from, session.gap));
  }

  function addTask() {
    const title = draftTitle.trim();
    if (!title) return;
    const days = Number.parseFloat(draftHours);
    mut.addTask.mutate(
      {
        title,
        hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
        assignedBuild: mode === "pending" ? draftWho : who,
      },
      {
        onSuccess: () => {
          setDraftTitle("");
          setDraftHours("");
        },
      },
    );
  }

  async function addPt() {
    const number = draftPt.trim();
    if (!number) return;
    const title = draftPtTitle.trim();
    const days = Number.parseFloat(draftPtHours);
    mut.addPt.mutate(
      {
        prospectNumber: number,
        title: title || undefined,
        part: draftPtPart.trim() || undefined,
        hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
        assignedBuild: mode === "pending" ? draftPtWho : who,
      },
      {
        onSuccess: () => {
          setDraftPt("");
          setDraftPtTitle("");
          setDraftPtPart("");
          setDraftPtHours("");
        },
      },
    );
  }

  return (
    <section className="person-board">
      <h2 className="person-head">{title}</h2>
      <div className={dragId ? "sheet-wrap is-reordering" : "sheet-wrap"}>
        <table className="sheet">
          <thead>
            <tr>
              <th className="sticky-col queue-head">Queue</th>
              <th>Job / task</th>
              <th>Part</th>
              <th className="qty-col">Qty</th>
              <th>Who</th>
              <th>Who next</th>
              <th>Need date</th>
              <th>Est days</th>
              <th>Est complete</th>
              <th>Status</th>
              <th>Build order notes</th>
              <th>Notes to production</th>
              <th>Build record</th>
              <th>Hardware history</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={15}>
                  <p className="px-4 py-6 text-sm text-muted">
                    {mode === "active"
                      ? `No active job for ${title}.`
                      : "No pending work."}
                  </p>
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const key = queueItemKey(entry);
                const est = estimates.get(key);
                const isDrag = dragId === key;
                const dropBefore = Boolean(dragId) && dropIndex === index && !isDrag;
                const dropAfter =
                  Boolean(dragId) &&
                  !isDrag &&
                  index === lastVisibleIndex &&
                  dropIndex != null &&
                  dropIndex > lastVisibleIndex;
                if (entry.kind === "task") {
                  const task = state.buildTasks.find((t) => t.id === entry.taskId);
                  if (!task) return null;
                  return (
                    <TaskRow
                      key={key}
                      task={task}
                      qid={key}
                      who={entry.assignedBuild}
                      index={index}
                      last={index === lastVisibleIndex}
                      estComplete={est ? formatShopDate(est.complete) : "—"}
                      isDrag={isDrag}
                      dropBefore={dropBefore}
                      dropAfter={dropAfter}
                      onHandlePointerDown={onHandlePointerDown}
                      onHandlePointerMove={onHandlePointerMove}
                      onHandlePointerUp={onHandlePointerUp}
                      onMove={(n) => commit(key, n)}
                      mut={mut}
                    />
                  );
                }
                if (entry.kind === "pt") {
                  const pt = state.problemTickets.find((p) => p.id === entry.problemId);
                  if (!pt) return null;
                  return (
                    <PtRow
                      key={key}
                      pt={pt}
                      qid={key}
                      who={entry.assignedBuild}
                      index={index}
                      last={index === lastVisibleIndex}
                      state={state}
                      estComplete={est ? formatShopDate(est.complete) : "—"}
                      isDrag={isDrag}
                      dropBefore={dropBefore}
                      dropAfter={dropAfter}
                      onHandlePointerDown={onHandlePointerDown}
                      onHandlePointerMove={onHandlePointerMove}
                      onHandlePointerUp={onHandlePointerUp}
                      onMove={(n) => commit(key, n)}
                      mut={mut}
                    />
                  );
                }
                const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
                if (!wo) return null;
                return (
                  <WoRow
                    key={key}
                    wo={wo}
                    qid={key}
                    who={entry.assignedBuild}
                    index={index}
                    last={index === lastVisibleIndex}
                    state={state}
                    est={est}
                    today={today}
                    isDrag={isDrag}
                    dropBefore={dropBefore}
                    dropAfter={dropAfter}
                    onHandlePointerDown={onHandlePointerDown}
                    onHandlePointerMove={onHandlePointerMove}
                    onHandlePointerUp={onHandlePointerUp}
                    onMove={(n) => commit(key, n)}
                    mut={mut}
                    author={author}
                    setHoldWo={setHoldWo}
                  />
                );
              })
            )}
            {mode === "pending" ? (
            <>
            <tr className="is-new">
              <td />
              <td>
                <span className="block px-2.5 py-2 font-mono text-sm font-semibold text-muted">TSK</span>
              </td>
              <td>
                <TextCell
                  value={draftTitle}
                  placeholder="Task — e.g. mow the lawn"
                  live
                  onSave={setDraftTitle}
                />
              </td>
              <td />
              <td>
                <SelectCell
                  value={draftWho}
                  options={WHO_OPTS}
                  onSave={setDraftWho}
                />
              </td>
              <td />
              <td />
              <td>
                <TextCell
                  type="number"
                  min={0}
                  value={draftHours}
                  placeholder="Days"
                  mono
                  live
                  onSave={setDraftHours}
                />
              </td>
              <td colSpan={6} />
              <td>
                <div className="px-1 py-1.5">
                  <Button type="button" size="sm" onClick={addTask} disabled={!draftTitle.trim()}>
                    Add TSK
                  </Button>
                </div>
              </td>
            </tr>
            <tr className="is-new">
              <td />
              <td>
                <div className="flex items-center gap-0.5">
                  <span className="shrink-0 px-2.5 font-mono text-sm font-semibold text-muted">PT-</span>
                  <div className="min-w-0 flex-1">
                    <TextCell
                      value={draftPt}
                      placeholder="1842"
                      mono
                      live
                      onSave={(v) => setDraftPt(v)}
                    />
                  </div>
                </div>
              </td>
              <td>
                <ComboCell
                  value={draftPtPart}
                  options={partOptions(state.parts)}
                  placeholder="Part"
                  onSave={setDraftPtPart}
                />
              </td>
              <td />
              <td>
                <SelectCell
                  value={draftPtWho}
                  options={WHO_OPTS}
                  onSave={setDraftPtWho}
                />
              </td>
              <td />
              <td />
              <td>
                <TextCell
                  type="number"
                  min={0}
                  value={draftPtHours}
                  placeholder="Days"
                  mono
                  live
                  onSave={setDraftPtHours}
                />
              </td>
              <td colSpan={6} />
              <td>
                <div className="px-1 py-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void addPt()}
                    disabled={!draftPt.trim() || mut.addPt.isPending}
                  >
                    Add PT
                  </Button>
                </div>
              </td>
            </tr>
            </>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WoRow({
  wo,
  qid,
  who,
  index,
  last,
  state,
  est,
  today,
  isDrag,
  dropBefore,
  dropAfter,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onMove,
  mut,
  author,
  setHoldWo,
}: {
  wo: WorkOrder;
  qid: string;
  who: string;
  index: number;
  last: boolean;
  state: FloorState;
  est?: { hours: number; complete: string };
  today: string;
  isDrag: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onHandlePointerDown: (e: PointerEvent<HTMLButtonElement>, id: string) => void;
  onHandlePointerMove: (e: PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: () => void;
  onMove: (index: number) => void;
  mut: ReturnType<typeof useFloorMutations>;
  author: string;
  setHoldWo: (v: string | null) => void;
}) {
  const need = earliestNeedForWo(wo.woNumber, state.salesLines, state.salesOrders);
  const needRed =
    isPastDate(need, today) && (wo.status === "pending" || wo.status === "active");
  const held = wo.status === "on_hold";
  const prePass = who !== wo.assignedBuild;
  const [recordOpen, setRecordOpen] = useState(false);
  const fill = buildFill(state, wo);
  return (
    <>
    <tr
      data-qid={qid}
      data-who={who}
      className={
        isDrag
          ? "is-dragging"
          : dropBefore
            ? "is-drop-before"
            : dropAfter
              ? "is-drop-after"
              : held
                ? "is-held"
                : undefined
      }
    >
      <td className="sticky-col">
        <QueueControls
          qid={qid}
          index={index}
          last={last}
          isDrag={isDrag}
          onHandlePointerDown={onHandlePointerDown}
          onHandlePointerMove={onHandlePointerMove}
          onHandlePointerUp={onHandlePointerUp}
          onMove={onMove}
        />
      </td>
      <td>
        <WoId woNumber={wo.woNumber} compact />
        {prePass ? (
          <span className="prepass-tag">Pre-pass from {wo.assignedBuild || "Unassigned"}</span>
        ) : null}
      </td>
      <td>
        <span className="block px-2.5 py-2 font-medium">{wo.part}</span>
      </td>
      <td className="qty-col">
        <TextCell
          type="text"
          value={String(wo.qty)}
          mono
          inputMode="numeric"
          onSave={(v) => {
            const n = Number.parseInt(v.replace(/,/g, ""), 10);
            if (Number.isFinite(n) && n >= 1) mut.patchWo.mutate({ woNumber: wo.woNumber, qty: n });
          }}
        />
      </td>
      <td>
        <SelectCell
          value={wo.assignedBuild}
          options={WHO_OPTS}
          allowEmpty
          emptyLabel="—"
          onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, assignedBuild: v })}
        />
      </td>
      <td className="min-w-36">
        <WhoNextCell wo={wo} mut={mut} />
      </td>
      <td>
        <span className={`block px-2.5 ${needRed ? "font-semibold text-danger" : ""}`}>
          {formatShopDate(need) || "—"}
        </span>
      </td>
      <td className={wo.buildTimeHours != null ? "is-override" : undefined}>
        <TextCell
          type="number"
          min={0}
          value={hoursToDays(jobHours(wo, state.parts))}
          mono
          placeholder="Days"
          onSave={(v) => {
            if (v.trim() === "") {
              mut.patchWo.mutate({ woNumber: wo.woNumber, buildTimeHours: null });
              return;
            }
            const days = Number.parseFloat(v);
            if (!Number.isFinite(days) || days < 0) return;
            const hours = days * 8;
            const spec = jobHours({ ...wo, buildTimeHours: null }, state.parts);
            mut.patchWo.mutate({
              woNumber: wo.woNumber,
              buildTimeHours: Math.abs(hours - spec) < 0.05 ? null : hours,
            });
          }}
        />
      </td>
      <td>
        <span className="block px-2.5">{est ? formatShopDate(est.complete) : "—"}</span>
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
      <td className="min-w-52">
        <AreaCell
          value={wo.buildOrderNotes}
          placeholder="Build order notes"
          onSave={(v) => mut.patchWo.mutate({ woNumber: wo.woNumber, buildOrderNotes: v })}
        />
      </td>
      <td className="min-w-44">
        <p className="whitespace-pre-wrap px-2.5 py-1.5 text-sm">
          {wo.notesToProduction.trim() || "—"}
        </p>
      </td>
      <td>
        <div className="px-1.5 py-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={fill.total && fill.filled < fill.total ? "text-primary" : undefined}
            onClick={() => setRecordOpen((v) => !v)}
          >
            {fill.total ? `${fill.filled}/${fill.total}` : "Record"}
          </Button>
        </div>
      </td>
      <td className="history-cell">
        <HistoryButton
          woNumber={wo.woNumber}
          part={wo.part}
          notes={wo.hardwareHistory}
          onAdd={(n) => mut.woHistory.mutate({ woNumber: wo.woNumber, author: n.author, text: n.text })}
        />
      </td>
      <td>
        <div className="flex flex-col gap-1 px-1.5 py-1">
          {state.tickets
            .filter((t) => ticketTouchesWo(t.workOrderNumber, wo.woNumber))
            .map((t) => (
              <Button key={t.ticketNumber} asChild size="sm" variant="ghost">
                <Link to="/tickets/$ticketNumber" params={{ ticketNumber: t.ticketNumber }}>
                  {t.ticketNumber}
                </Link>
              </Button>
            ))}
          <Button asChild size="sm" variant="outline">
            <Link to="/tickets/new" search={{ wo: wo.woNumber }}>
              <Plus className="size-3.5" />
              QT
            </Link>
          </Button>
        </div>
      </td>
    </tr>
    {recordOpen ? (
      <tr>
        <td colSpan={15} className="bg-bg">
          <div className="expand-panel">
            <BuildRecordPanel wo={wo} state={state} />
          </div>
        </td>
      </tr>
    ) : null}
    </>
  );
}

function TaskRow({
  task,
  qid,
  who,
  index,
  last,
  estComplete,
  isDrag,
  dropBefore,
  dropAfter,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onMove,
  mut,
}: {
  task: BuildTask;
  qid: string;
  who: string;
  index: number;
  last: boolean;
  estComplete: string;
  isDrag: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onHandlePointerDown: (e: PointerEvent<HTMLButtonElement>, id: string) => void;
  onHandlePointerMove: (e: PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: () => void;
  onMove: (index: number) => void;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const held = task.status === "on_hold" || task.status === "done";
  return (
    <tr
      data-qid={qid}
      data-who={who}
      className={
        isDrag
          ? "is-dragging"
          : dropBefore
            ? "is-drop-before"
            : dropAfter
              ? "is-drop-after"
              : held
                ? "is-held"
                : "is-task"
      }
    >
      <td className="sticky-col">
        <QueueControls
          qid={qid}
          index={index}
          last={last}
          isDrag={isDrag}
          onHandlePointerDown={onHandlePointerDown}
          onHandlePointerMove={onHandlePointerMove}
          onHandlePointerUp={onHandlePointerUp}
          onMove={onMove}
        />
      </td>
      <td>
        <TskId taskNumber={task.taskNumber} />
      </td>
      <td>
        <TextCell
          value={task.title}
          placeholder="Task"
          onSave={(v) => mut.patchTask.mutate({ id: task.id, title: v })}
        />
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <SelectCell
          value={task.assignedBuild}
          options={WHO_OPTS}
          allowEmpty
          emptyLabel="—"
          onSave={(v) => mut.patchTask.mutate({ id: task.id, assignedBuild: v })}
        />
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <TextCell
          type="number"
          min={0}
          value={hoursToDays(task.hours)}
          mono
          onSave={(v) => {
            const n = Number.parseFloat(v);
            if (Number.isFinite(n) && n >= 0) mut.patchTask.mutate({ id: task.id, hours: n * 8 });
          }}
        />
      </td>
      <td>
        <span className="block px-2.5">{estComplete}</span>
      </td>
      <td>
        <SelectCell
          value={task.status}
          options={TASK_OPTS}
          onSave={(v) => mut.patchTask.mutate({ id: task.id, status: v as TaskStatus })}
        />
      </td>
      <td className="min-w-52">
        <AreaCell
          value={task.buildOrderNotes}
          placeholder="Build order notes"
          onSave={(v) => mut.patchTask.mutate({ id: task.id, buildOrderNotes: v })}
        />
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <button
          type="button"
          aria-label="Remove task"
          className="flex size-10 items-center justify-center text-muted hover:text-danger"
          onClick={() => mut.taskDelete.mutate(task.id)}
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function PtRow({
  pt,
  qid,
  who,
  index,
  last,
  state,
  estComplete,
  isDrag,
  dropBefore,
  dropAfter,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onMove,
  mut,
}: {
  pt: ProblemTicket;
  qid: string;
  who: string;
  index: number;
  last: boolean;
  state: FloorState;
  estComplete: string;
  isDrag: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onHandlePointerDown: (e: PointerEvent<HTMLButtonElement>, id: string) => void;
  onHandlePointerMove: (e: PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: () => void;
  onMove: (index: number) => void;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const held = pt.status === "on_hold" || pt.status === "done";
  const prePass = who !== pt.assignedBuild;
  return (
    <tr
      data-qid={qid}
      data-who={who}
      className={
        isDrag
          ? "is-dragging"
          : dropBefore
            ? "is-drop-before"
            : dropAfter
              ? "is-drop-after"
              : held
                ? "is-held"
                : "is-task"
      }
    >
      <td className="sticky-col">
        <QueueControls
          qid={qid}
          index={index}
          last={last}
          isDrag={isDrag}
          onHandlePointerDown={onHandlePointerDown}
          onHandlePointerMove={onHandlePointerMove}
          onHandlePointerUp={onHandlePointerUp}
          onMove={onMove}
        />
      </td>
      <td>
        <PtId prospectNumber={pt.prospectNumber} compact />
        {prePass ? (
          <span className="prepass-tag">Pre-pass from {pt.assignedBuild || "Unassigned"}</span>
        ) : null}
        <ProspectStatusNow pt={pt} />
      </td>
      <td>
        <ComboCell
          value={pt.part}
          options={partOptions(state.parts)}
          placeholder="Part"
          onSave={(v) => mut.patchPt.mutate({ id: pt.id, part: v })}
        />
        {pt.title.trim() ? (
          <span className="block px-2.5 pb-1 text-[0.65rem] text-muted">{pt.title}</span>
        ) : null}
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <SelectCell
          value={pt.assignedBuild}
          options={WHO_OPTS}
          allowEmpty
          emptyLabel="—"
          onSave={(v) => mut.patchPt.mutate({ id: pt.id, assignedBuild: v })}
        />
      </td>
      <td className="min-w-36">
        <WhoNextCell pt={pt} mut={mut} />
      </td>
      <td>
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <TextCell
          type="number"
          min={0}
          value={hoursToDays(pt.hours)}
          mono
          onSave={(v) => {
            const n = Number.parseFloat(v);
            if (Number.isFinite(n) && n >= 0) mut.patchPt.mutate({ id: pt.id, hours: n * 8 });
          }}
        />
      </td>
      <td>
        <span className="block px-2.5">{estComplete}</span>
      </td>
      <td>
        <SelectCell
          value={pt.status}
          options={TASK_OPTS}
          onSave={(v) => mut.patchPt.mutate({ id: pt.id, status: v as TaskStatus })}
        />
      </td>
      <td className="min-w-52">
        <AreaCell
          value={pt.notes}
          placeholder="Build order notes"
          onSave={(v) => mut.patchPt.mutate({ id: pt.id, notes: v })}
        />
      </td>
      <td className="min-w-44">
        <AreaCell
          value={pt.notesToProduction}
          placeholder="Note to production"
          onSave={(v) => mut.patchPt.mutate({ id: pt.id, notesToProduction: v })}
        />
      </td>
      <td className="min-w-44">
        <ConsumedWoCell
          items={pt.consumed}
          state={state}
          onSave={(consumed) => mut.patchPt.mutate({ id: pt.id, consumed })}
        />
      </td>
      <td className="history-cell">
        <PtHistoryButton
          prospectNumber={pt.prospectNumber}
          sources={sourcesFromConsumed(pt.consumed, state.workOrders)}
          onAdd={(n) =>
            mut.woHistory.mutate({ woNumber: n.woNumber, author: n.author, text: n.text })
          }
        />
      </td>
      <td>
        <button
          type="button"
          aria-label="Remove problem ticket"
          className="flex size-10 items-center justify-center text-muted hover:text-danger"
          onClick={() => mut.ptDelete.mutate(pt.id)}
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function QueueControls({
  qid,
  index,
  last,
  isDrag,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onMove,
}: {
  qid: string;
  index: number;
  last: boolean;
  isDrag: boolean;
  onHandlePointerDown: (e: PointerEvent<HTMLButtonElement>, id: string) => void;
  onHandlePointerMove: (e: PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: () => void;
  onMove: (index: number) => void;
}) {
  return (
    <div className="queue-cell">
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className={isDrag ? "queue-handle is-dragging" : "queue-handle"}
        onPointerDown={(e) => onHandlePointerDown(e, qid)}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="mono-num queue-num">{index + 1}</span>
      <div className="queue-step">
        <button
          type="button"
          className="queue-arrow"
          disabled={index === 0}
          aria-label="Move up"
          onClick={() => onMove(index - 1)}
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          className="queue-arrow"
          disabled={last}
          aria-label="Move down"
          onClick={() => onMove(index + 1)}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function gapToIndex(from: number, gap: number): number {
  if (gap <= from) return gap;
  return gap - 1;
}

function placeAtIndex(keys: string[], id: string, targetIndex: number): string[] | null {
  const from = keys.indexOf(id);
  if (from < 0) return null;
  const clamped = Math.max(0, Math.min(targetIndex, keys.length - 1));
  if (clamped === from) return null;
  const next = keys.filter((k) => k !== id);
  next.splice(clamped, 0, id);
  return next;
}
