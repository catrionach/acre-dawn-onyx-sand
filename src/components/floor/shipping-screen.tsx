import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatShopDate, todayIso } from "@/lib/floor/dates";
import { displayWo } from "@/lib/floor/prospect";
import type { FloorState, SagePackLine, SalesLine } from "@/lib/floor/types";
import { parseWoNumbers, salesOrdersReadyToShip, sageExtrasForSo, lookupWoSales, sageNotesLine1, isProformaNote } from "@/lib/floor/lookups";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { CheckCell, ComboCell, TextCell, woOptions, woOptionsForPart } from "./cells";
import { ErrorBanner, LoadingTable, ScreenHeader } from "./shell";
import { SoId, WoId } from "./id-stack";
import { SoPill, WoPill } from "./status-pill";

export function ShippingScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Shipping" />
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

  return <Loaded state={floor.data} mut={mut} />;
}

function Loaded({
  state,
  mut,
}: {
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const [soNumber, setSoNumber] = useState("");
  const [woLookup, setWoLookup] = useState("");
  const ready = useMemo(() => salesOrdersReadyToShip(state), [state]);
  const so = state.salesOrders.find((s) => s.soNumber === soNumber.trim());
  const lines = so ? state.salesLines.filter((l) => l.soNumber === so.soNumber) : [];
  const sage = soNumber.trim() ? sageExtrasForSo(state, soNumber.trim()) : [];
  const sageCompany = sage[0]?.company;
  const notesLine1 = soNumber.trim() ? sageNotesLine1(state, soNumber.trim()) : "";
  const proforma = isProformaNote(notesLine1);
  const soOptions = useMemo(() => {
    const fromFloor = state.salesOrders.map((s) => ({
      value: s.soNumber,
      hint: `${s.company || "No company"} · ${s.status}`,
    }));
    const floorSet = new Set(state.salesOrders.map((s) => s.soNumber));
    const fromSage = [...new Set(state.sagePackLines.map((l) => l.soNumber))]
      .filter((n) => !floorSet.has(n))
      .map((n) => {
        const hit = state.sagePackLines.find((l) => l.soNumber === n);
        return { value: n, hint: `${hit?.company || "Sage"} · pack list only` };
      });
    return [...fromFloor, ...fromSage];
  }, [state.salesOrders, state.sagePackLines]);

  return (
    <>
      <ScreenHeader
        title="Shipping"
        hint="One pack list: Floor lines plus Sage extras. For qty 3 list three WO-numbers with commas (508, 509, 510). Despatch writes that SO onto each job’s hardware log."
      />

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold">Ready to ship</h2>
        {ready.length === 0 ? (
          <p className="text-sm text-muted">
            No open sales orders with every work order closed.
          </p>
        ) : (
          <div className="sheet-wrap">
            <table className="sheet min-w-[48rem]">
              <thead>
                <tr>
                  <th>SO</th>
                  <th>Company</th>
                  <th>Target</th>
                  <th>WOs</th>
                  <th>Status</th>
                  <th>Sage notes</th>
                </tr>
              </thead>
              <tbody>
                {ready.map(({ so: row, woNumbers }) => {
                  const notes = sageNotesLine1(state, row.soNumber);
                  const proforma = isProformaNote(notes);
                  return (
                  <tr
                    key={row.soNumber}
                    className={
                      soNumber.trim() === row.soNumber
                        ? "is-open"
                        : proforma
                          ? "is-proforma"
                          : undefined
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="block w-full px-2.5 py-1.5 text-left font-medium"
                        onClick={() => setSoNumber(row.soNumber)}
                      >
                        {row.soNumber}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="block w-full px-2.5 py-1.5 text-left"
                        onClick={() => setSoNumber(row.soNumber)}
                      >
                        {row.company || "—"}
                      </button>
                    </td>
                    <td>
                      <span className="block px-2.5">{formatShopDate(row.targetDespatch) || "—"}</span>
                    </td>
                    <td>
                      <span className="block px-2.5 font-mono text-sm">{woNumbers.join(", ")}</span>
                    </td>
                    <td className="px-2.5">
                      <SoPill status={row.status} />
                    </td>
                    <td>
                      <SageNoteCell value={notes} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Sales order number
          </span>
          <ComboCell
            value={soNumber}
            options={soOptions}
            placeholder="Sage SO"
            onSave={setSoNumber}
          />
        </label>
        {so ? (
          <div className="pb-1.5">
            <p className="font-medium">{so.company || "Sales order"}</p>
            <p className="text-sm text-muted">
              Target {formatShopDate(so.targetDespatch) || "—"}
              {so.despatchDate ? ` · last sent ${formatShopDate(so.despatchDate)}` : ""}
            </p>
            {notesLine1 ? (
              <p className={proforma ? "sage-notes-inline is-proforma" : "sage-notes-inline"}>
                Sage notes: {notesLine1}
                {proforma ? " — do not ship yet (proforma)" : ""}
              </p>
            ) : null}
          </div>
        ) : sage.length ? (
          <div className="pb-1.5">
            <p className="font-medium">{sageCompany || "Sage order"}</p>
            <p className="text-sm text-muted">Not on Sales orders yet — Sage pack list only.</p>
            {notesLine1 ? (
              <p className={proforma ? "sage-notes-inline is-proforma" : "sage-notes-inline"}>
                Sage notes: {notesLine1}
                {proforma ? " — do not ship yet (proforma)" : ""}
              </p>
            ) : null}
          </div>
        ) : null}
        {so ? <SoPill status={so.status} /> : null}
      </div>

      <WoSalesLookupPanel
        state={state}
        value={woLookup}
        onChange={setWoLookup}
        onOpenSo={setSoNumber}
      />

      {!soNumber.trim() ? (
        <p className="text-sm text-muted">Enter an SO number to pull its lines.</p>
      ) : !so && sage.length === 0 ? (
        <p className="text-sm text-danger">No sales order {soNumber.trim()}.</p>
      ) : (
        <>
          {so && lines.length === 0 && sage.length === 0 ? (
            <p className="mb-3 text-sm text-muted">
              This order has no Floor lines yet. Add them on Sales orders.
            </p>
          ) : null}
          {lines.length > 0 || sage.length > 0 ? (
            <ShipTable
              key={soNumber.trim()}
              soNumber={soNumber.trim()}
              canDespatch={Boolean(so) && !proforma}
              proforma={proforma}
              notesLine1={notesLine1}
              lines={lines}
              sage={sage}
              meta={state.sagePackMeta}
              state={state}
              mut={mut}
            />
          ) : null}
        </>
      )}
    </>
  );
}

function ShipTable({
  soNumber,
  canDespatch,
  proforma,
  notesLine1,
  lines,
  sage,
  meta,
  state,
  mut,
}: {
  soNumber: string;
  canDespatch: boolean;
  proforma: boolean;
  notesLine1: string;
  lines: SalesLine[];
  sage: SagePackLine[];
  meta: FloorState["sagePackMeta"];
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const [ticked, setTicked] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (const line of lines) if (!line.despatchDate) init[line.id] = true;
    return init;
  });
  const [wos, setWos] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (const line of lines) {
      init[line.id] = line.despatchWoNumber || line.workOrderNumber;
    }
    return init;
  });
  const [date, setDate] = useState(todayIso());

  const selected = lines.filter((l) => ticked[l.id] && !l.despatchDate);

  function ship() {
    const payload = selected
      .map((line) => ({
        id: line.id,
        despatchWoNumber: parseWoNumbers(wos[line.id] ?? "").join(", "),
      }))
      .filter((l) => l.despatchWoNumber);
    if (!payload.length) return;
    mut.shipSo.mutate({ soNumber, despatchDate: date, lines: payload });
  }

  const canShip =
    canDespatch &&
    selected.length > 0 &&
    selected.every((l) => parseWoNumbers(wos[l.id] ?? "").length > 0) &&
    !mut.shipSo.isPending;

  return (
    <>
      <div className="sheet-wrap">
        <table className="sheet min-w-[80rem]">
          <thead>
            <tr>
              <th className="w-12">Ship</th>
              <th>Part</th>
              <th>Description</th>
              <th className="qty-col">Qty</th>
              <th>Planned WO</th>
              <th>Trace</th>
              <th>Comment</th>
              <th>Sage notes</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <FloorShipRow
                key={`floor-${line.id}`}
                line={line}
                state={state}
                notesLine1={notesLine1}
                ticked={Boolean(ticked[line.id])}
                woValue={wos[line.id] ?? ""}
                onTick={(next) => setTicked((cur) => ({ ...cur, [line.id]: next }))}
                onWo={(v) => setWos((cur) => ({ ...cur, [line.id]: v }))}
              />
            ))}
            {sage.map((line) => (
              <SageShipRow key={`sage-${line.id}`} line={line} notesLine1={notesLine1} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-muted">
        {meta.filename
          ? `Sage extras from ${meta.filename} · ${meta.rowCount} lines. Replaced each week.`
          : "No Sage file yet. Upload Outstanding Sales Orders on Sales orders."}
        {" "}
        Qty 2+ : list each job with commas, e.g. 508, 509, 510.
      </p>
      {proforma ? (
        <p className="proforma-banner">
          Sage notes {notesLine1 ? `“${notesLine1}”` : "Proforma"} — this order is proforma. Do not
          ship until it is paid.
        </p>
      ) : null}
      {canDespatch && lines.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Despatch date
            </span>
            <TextCell type="date" value={date} onSave={setDate} />
          </label>
          <Button type="button" disabled={!canShip} onClick={ship}>
            Despatch
          </Button>
          <p className="pb-1.5 text-sm text-muted">
            {selected.length
              ? `${selected.length} line${selected.length === 1 ? "" : "s"} will ship. Each WO-number gets this SO on its hardware log.`
              : "Tick at least one Floor line."}
          </p>
        </div>
      ) : proforma ? (
        <p className="mt-3 text-sm text-danger">
          Despatch is blocked until Sage notes are no longer proforma.
        </p>
      ) : !canDespatch ? (
        <p className="mt-3 text-sm text-muted">
          Sage pack list only — add this SO on Sales orders to despatch Floor lines.
        </p>
      ) : null}
    </>
  );
}

function FloorShipRow({
  line,
  state,
  notesLine1,
  ticked,
  woValue,
  onTick,
  onWo,
}: {
  line: SalesLine;
  state: FloorState;
  notesLine1: string;
  ticked: boolean;
  woValue: string;
  onTick: (next: boolean) => void;
  onWo: (value: string) => void;
}) {
  const planned = state.workOrders.find((w) => w.woNumber === line.workOrderNumber);
  const partName = state.parts.find((p) => p.partNumber === line.part)?.name ?? "";
  const done = Boolean(line.despatchDate);
  const parsed = parseWoNumbers(woValue);
  const qty = line.qty;
  const mismatch = !done && qty > 1 && parsed.length > 0 && parsed.length !== qty;
  const options = woOptionsForPart(state.workOrders, line.part);
  const proforma = isProformaNote(notesLine1);

  return (
    <tr className={done ? "opacity-70" : proforma ? "is-proforma" : undefined}>
      <td>
        {done ? (
          <span className="block px-2.5 text-sm text-ok">Sent</span>
        ) : (
          <CheckCell checked={ticked} label={`Ship ${line.part}`} onSave={onTick} />
        )}
      </td>
      <td>
        <span className="block px-2.5 font-medium">{line.part || "Part?"}</span>
      </td>
      <td>
        <span className="block px-2.5 text-sm">{partName || "—"}</span>
      </td>
      <td>
        <span className="block px-2.5 font-mono">{qty}</span>
      </td>
      <td>
        <div className="px-2.5 py-1.5">
          {line.workOrderNumber ? (
            <>
              <span className="font-mono">{displayWo(line.workOrderNumber)}</span>
              {planned ? (
                <span className="ml-2 text-sm text-muted">
                  <WoPill status={planned.status} /> {planned.assignedBuild || ""}
                </span>
              ) : null}
            </>
          ) : (
            <span className="font-semibold text-warn">No plan</span>
          )}
        </div>
      </td>
      <td>
        {done ? (
          <span className="block px-2.5 font-mono">
            {parseWoNumbers(line.despatchWoNumber).map(displayWo).join(", ") ||
              line.despatchWoNumber}{" "}
            · {formatShopDate(line.despatchDate)}
          </span>
        ) : qty > 1 ? (
          <div>
            <TextCell
              value={woValue}
              placeholder={woPlaceholder(qty)}
              mono
              warn={mismatch || (qty > 1 && parsed.length === 1)}
              onSave={onWo}
            />
            <p className={`px-2.5 pb-1.5 text-xs ${mismatch ? "text-warn" : "text-muted"}`}>
              {mismatch
                ? `Qty ${qty} — list ${qty} WO-numbers, commas between them`
                : parsed.length === qty
                  ? parsed.map(displayWo).join(", ")
                  : `List ${qty} jobs: ${woPlaceholder(qty)}`}
            </p>
          </div>
        ) : (
          <ComboCell
            value={woValue}
            options={options}
            placeholder="Trace"
            onSave={onWo}
          />
        )}
      </td>
      <td>
        <span className="block px-2.5 text-sm text-muted">—</span>
      </td>
      <td>
        <SageNoteCell value={notesLine1} />
      </td>
    </tr>
  );
}

function SageShipRow({ line, notesLine1 }: { line: SagePackLine; notesLine1: string }) {
  const note = line.notes.trim() || notesLine1;
  const proforma = isProformaNote(note);
  return (
    <tr className={proforma ? "is-task is-proforma" : "is-task"}>
      <td>
        <span className="block px-2.5 text-sm text-muted">Pack</span>
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
        <span className="block px-2.5 text-muted">—</span>
      </td>
      <td>
        <span className="block px-2.5 text-muted">Sage extra</span>
      </td>
      <td>
        <span className="block px-2.5 text-sm text-muted">{line.comment || "—"}</span>
      </td>
      <td>
        <SageNoteCell value={note} />
      </td>
    </tr>
  );
}

function SageNoteCell({ value }: { value: string }) {
  const text = value.trim();
  if (!text) return <span className="block px-2.5 text-muted">—</span>;
  const proforma = isProformaNote(text);
  return (
    <div className={proforma ? "sage-notes is-proforma" : "sage-notes"}>
      <span>{text}</span>
      {proforma ? <span className="sage-notes-warn">Do not ship yet</span> : null}
    </div>
  );
}

function woPlaceholder(qty: number): string {
  const n = Math.max(qty, 2);
  return Array.from({ length: n }, (_, i) => String(508 + i)).join(", ");
}

const VIA_LABEL: Record<"planned" | "despatched" | "unit", string> = {
  planned: "supply WO",
  despatched: "on pack list",
  unit: "tagged unit",
};

function WoSalesLookupPanel({
  state,
  value,
  onChange,
  onOpenSo,
}: {
  state: FloorState;
  value: string;
  onChange: (next: string) => void;
  onOpenSo: (soNumber: string) => void;
}) {
  const hit = useMemo(() => lookupWoSales(state, value), [state, value]);
  const options = useMemo(() => woOptions(state.workOrders), [state.workOrders]);

  return (
    <section className="wo-lookup mb-4 rounded-[var(--radius-md)] border border-border bg-surface p-3">
      <label className="block max-w-sm">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          Look up a work order
        </span>
        <ComboCell
          value={value}
          options={options}
          placeholder="508 or WO-508"
          onSave={onChange}
        />
      </label>
      {!hit ? (
        <p className="mt-2 text-sm text-muted">
          Shows which sales orders use this job, and the other WOs on those orders.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <WoId woNumber={hit.woNumber} compact />
            {hit.wo ? <WoPill status={hit.wo.status} /> : null}
            <span className="text-sm text-muted">
              {hit.wo
                ? `${hit.wo.part || "No part"} · ${hit.wo.assignedBuild || "Unassigned"}`
                : "Not on Work orders"}
            </span>
          </div>
          {hit.sales.length === 0 ? (
            <p className="text-sm text-muted">No sales orders linked to this job.</p>
          ) : (
            <div className="sheet-wrap">
              <table className="sheet min-w-[40rem]">
                <thead>
                  <tr>
                    <th>SO</th>
                    <th>Company</th>
                    <th>How this WO</th>
                    <th>Other WOs on this SO</th>
                  </tr>
                </thead>
                <tbody>
                  {hit.sales.map((row) => (
                    <tr key={row.soNumber}>
                      <td>
                        <div className="flex flex-wrap items-center gap-2 px-2.5 py-1.5">
                          <SoId soNumber={row.soNumber} />
                          <button
                            type="button"
                            className="text-sm font-medium text-primary"
                            onClick={() => onOpenSo(row.soNumber)}
                          >
                            Pack list
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="block px-2.5 py-1.5">
                          {row.company || "—"}
                          {row.soStatus ? (
                            <span className="ml-2 text-xs text-muted">{row.soStatus}</span>
                          ) : null}
                        </span>
                      </td>
                      <td>
                        <span className="block px-2.5 text-sm">
                          {row.via.map((v) => VIA_LABEL[v]).join(", ")}
                        </span>
                      </td>
                      <td>
                        {row.otherWos.length === 0 ? (
                          <span className="block px-2.5 text-sm text-muted">None</span>
                        ) : (
                          <ul className="wo-lookup-others">
                            {row.otherWos.map((other) => (
                              <li key={other.woNumber} className="wo-lookup-other">
                                <WoId woNumber={other.woNumber} compact />
                                <span>
                                  {other.part || "—"}
                                  {other.status ? ` · ${other.status}` : ""}
                                </span>
                                <button
                                  type="button"
                                  className="text-sm font-medium text-primary"
                                  onClick={() => onChange(other.woNumber)}
                                >
                                  Look up
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

