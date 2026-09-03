import { useState } from "react";
import type { FloorState, WorkOrder } from "@/lib/floor/types";
import {
  buildTraceRows,
  matchTraceRows,
  parseTraceQuery,
  type TraceRow,
} from "@/lib/floor/lookups";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { ErrorBanner, ScreenHeader } from "./shell";
import { PtId, QtId, SoId, WoId } from "./id-stack";
import { WoPill } from "./status-pill";
import { HistoryButton } from "./notes-list";

const HINTS = ["WO-XXX-X", "QT-X", "SO-X", "PT-X"];

export function TraceScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();
  const [query, setQuery] = useState("");

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Trace" />
        <p className="trace-miss">Looking up…</p>
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
  const parsed = parseTraceQuery(query);
  const all = buildTraceRows(state);
  const hits = parsed ? matchTraceRows(all, parsed) : [];
  const byWo = new Map(all.filter((r) => r.woNumber).map((r) => [r.woNumber, r]));
  const woNumbers = relatedWoNumbers(hits);
  const serial = parsed?.kind === "wo" || parsed?.kind === "any" ? parsed.serial : "";
  const orphans = hits.filter((r) => !r.woNumber);

  return (
    <>
      <ScreenHeader title="Trace" hint="Look up a job, ticket or order. Each work order opens its QTs and hardware history." />
      <div className="trace-page">
        <label className="sr-only" htmlFor="trace-q">
          Trace search
        </label>
        <input
          id="trace-q"
          className="trace-search"
          value={query}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="WO-443-1"
          aria-label="Trace search"
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="trace-hints">
          {HINTS.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        {parsed && hits.length === 0 ? (
          <p className="trace-miss">Nothing traces to {query.trim()}.</p>
        ) : null}
        {orphans.map((row) => (
          <OrphanHit key={row.key} row={row} />
        ))}
        {woNumbers.map((woNumber) => {
          const row = byWo.get(woNumber);
          const wo = state.workOrders.find((w) => w.woNumber === woNumber);
          return (
            <WoHit
              key={woNumber}
              woNumber={woNumber}
              row={row}
              wo={wo}
              serial={serial && hits.some((h) => h.woNumber === woNumber) ? serial : ""}
              state={state}
              onHistory={(author, text) =>
                mut.woHistory.mutate({ woNumber, author, text })
              }
            />
          );
        })}
      </div>
    </>
  );
}

function relatedWoNumbers(hits: TraceRow[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (n: string) => {
    const id = n.trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };
  for (const row of hits) {
    add(row.woNumber);
    for (const job of row.consumed) add(job.woNumber);
    for (const job of row.usedIn) add(job.woNumber);
  }
  return out;
}

function WoHit({
  woNumber,
  row,
  wo,
  serial,
  state,
  onHistory,
}: {
  woNumber: string;
  row: TraceRow | undefined;
  wo: WorkOrder | undefined;
  serial: string;
  state: FloorState;
  onHistory: (author: string, text: string) => void;
}) {
  const part = wo?.part || row?.part || "";
  const units = serial
    ? state.units.filter(
        (u) =>
          u.workOrderNumber === woNumber &&
          (u.serialOrId === serial || u.unitId === serial),
      )
    : [];

  return (
    <article className="trace-wo">
      <header className="trace-wo-head">
        <WoId woNumber={woNumber} />
        <div className="trace-wo-sub">
          {part ? <span>{part}</span> : null}
          {wo ? <WoPill status={wo.status} /> : <span className="trace-meta">Not on the board</span>}
          {serial ? <span className="trace-serial">Serial {serial}</span> : null}
        </div>
      </header>
      {serial && units.length === 0 ? (
        <p className="trace-miss">Serial {serial} is not on this work order yet.</p>
      ) : null}
      {units.map((u) => (
        <p key={u.id} className="trace-unit">
          Unit {u.serialOrId || u.unitId || "—"}
          {u.status ? ` · ${u.status}` : ""}
        </p>
      ))}
      {row?.sales.length ? (
        <div className="trace-wo-links">
          {row.sales.map((s) => (
            <SoId key={s.soNumber} soNumber={s.soNumber} compact />
          ))}
        </div>
      ) : null}
      {row?.pts.length ? (
        <div className="trace-wo-links">
          {row.pts.map((pt) => (
            <PtId key={pt.prospectNumber} prospectNumber={pt.prospectNumber} compact />
          ))}
        </div>
      ) : null}
      <div className="trace-wo-actions">
        {row?.qts.length ? (
          row.qts.map((qt) => (
            <QtId key={qt.ticketNumber} ticketNumber={qt.ticketNumber} compact />
          ))
        ) : (
          <span className="trace-meta">No QTs</span>
        )}
        {wo ? (
          <div className="trace-history">
            <HistoryButton
              woNumber={wo.woNumber}
              part={wo.part}
              notes={wo.hardwareHistory}
              onAdd={(n) => onHistory(n.author, n.text)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function OrphanHit({ row }: { row: TraceRow }) {
  return (
    <article className="trace-wo">
      <header className="trace-wo-head">
        {row.pts[0] ? (
          <PtId prospectNumber={row.pts[0].prospectNumber} />
        ) : row.qts[0] ? (
          <QtId ticketNumber={row.qts[0].ticketNumber} />
        ) : row.sales[0] ? (
          <SoId soNumber={row.sales[0].soNumber} />
        ) : (
          <p className="font-semibold">Untraced</p>
        )}
      </header>
      <p className="trace-miss">No work order on this yet.</p>
    </article>
  );
}
