import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  componentKind,
  fieldHint,
  fieldPlaceholder,
  requiredKeysForPart,
  serialsForWorkOrder,
} from "@/lib/floor/build-lookup";
import { normalizeWoNumber } from "@/lib/floor/lookups";
import { displayWo } from "@/lib/floor/prospect";
import type { ConsumedWo, FloorState, WorkOrder } from "@/lib/floor/types";
import { useFloorMutations } from "@/lib/floor/queries";
import { Button } from "@/components/ui/button";
import { AreaCell, ComboCell, partOptions, TextCell, woOptions } from "./cells";
import { useAuthor } from "./author";

function keysForWo(state: FloorState, wo: WorkOrder): string[] {
  const keys = [...requiredKeysForPart(state.buildSpec.map, wo.part)];
  const seen = new Set(keys);
  for (const rec of state.buildRecords) {
    if (rec.woNumber !== wo.woNumber) continue;
    for (const k of Object.keys(rec.values)) {
      if (rec.values[k]?.trim() && !seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
  }
  return keys;
}

export function buildFill(state: FloorState, wo: WorkOrder): { filled: number; total: number } {
  const keys = keysForWo(state, wo);
  const serials = serialsForWorkOrder(
    wo.qty,
    state.buildRecords.filter((r) => r.woNumber === wo.woNumber).map((r) => r.serial),
    state.units
      .filter((u) => u.workOrderNumber === wo.woNumber)
      .map((u) => u.serialOrId || u.unitId),
  );
  const hasBattery = state.buildSpec.batteries.length > 0;
  let filled = 0;
  let total = 0;
  for (const serial of serials) {
    const rec = state.buildRecords.find((r) => r.woNumber === wo.woNumber && r.serial === serial);
    total += 1;
    if ((rec?.revision ?? "").trim()) filled += 1;
    if (hasBattery) {
      total += 1;
      if ((rec?.battery ?? "").trim()) filled += 1;
    }
    for (const key of keys) {
      total += 1;
      if ((rec?.values[key] ?? "").trim()) filled += 1;
    }
    const consumed = rec?.consumed ?? [];
    if (consumed.length) {
      total += 1;
      filled += 1;
    }
  }
  return { filled, total };
}

function linkOptions(state: FloorState, label: string) {
  const stem = label
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim()
    .toLowerCase();
  const parts = partOptions(state.parts).map((o) => ({
    ...o,
    score:
      o.value.toLowerCase() === stem ||
      o.value.toLowerCase().includes(stem) ||
      stem.includes(o.value.toLowerCase())
        ? 0
        : 2,
  }));
  const wos = woOptions(state.workOrders).map((o) => {
    const found = state.workOrders.find((w) => w.woNumber === o.value);
    const part = (found?.part ?? "").toLowerCase();
    const score =
      part === stem || part.includes(stem) || (stem && stem.includes(part) && part.length > 3)
        ? 0
        : 1;
    return { ...o, score };
  });
  return [...wos, ...parts].sort(
    (a, b) => a.score - b.score || a.value.localeCompare(b.value, undefined, { numeric: true }),
  );
}

function partForWo(state: FloorState, woNumber: string): string {
  const n = normalizeWoNumber(woNumber) || woNumber.trim();
  if (!n) return "";
  return state.workOrders.find((w) => w.woNumber === n)?.part ?? "";
}

export function BuildRecordPanel({
  wo,
  state,
}: {
  wo: WorkOrder;
  state: FloorState;
}) {
  const mut = useFloorMutations();
  const { author } = useAuthor();
  const spec = state.buildSpec;
  const keys = keysForWo(state, wo);
  const components = keys.map((k) => {
    const found = spec.components.find((c) => c.key === k);
    return found ?? { key: k, label: k, kind: componentKind(k), position: 999 };
  });
  const serials = serialsForWorkOrder(
    wo.qty,
    state.buildRecords.filter((r) => r.woNumber === wo.woNumber).map((r) => r.serial),
    state.units
      .filter((u) => u.workOrderNumber === wo.woNumber)
      .map((u) => u.serialOrId || u.unitId),
  );
  const who = author.trim() || "Shop";
  const woSet = new Set(state.workOrders.map((w) => w.woNumber));

  return (
    <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
      <h2 className="text-sm font-semibold">Build record</h2>
      {spec.components.length === 0 ? (
        <p className="mt-0.5 mb-3 text-sm text-muted">
          No component lookup yet. Upload it on{" "}
          <Link to="/parts" className="text-primary">
            Parts spec
          </Link>
          . You can still list consumed work orders below.
        </p>
      ) : components.length === 0 ? (
        <p className="mt-0.5 mb-3 text-sm text-muted">
          {wo.part || "This part"} has no required components. Mark them with X on Parts spec.
          Consumed WOs can still be listed.
        </p>
      ) : (
        <p className="mt-0.5 mb-3 text-sm text-muted">
          Fields marked X for <span className="font-medium text-ink">{wo.part}</span>. PCBs take a
          serial or lot; assemblies take another WO or a part. List consumed WOs, then write them
          to hardware history.
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {serials.map((serial) => {
          const rec = state.buildRecords.find(
            (r) => r.woNumber === wo.woNumber && r.serial === serial,
          );
          const batteries = [...spec.batteries];
          if (rec?.battery && !batteries.includes(rec.battery)) batteries.unshift(rec.battery);
          return (
            <div key={serial} className="rounded-[var(--radius-sm)] border border-border p-2">
              <p className="mb-2 font-mono text-sm font-semibold">Serial {serial}</p>
              {components.length ? (
                <div className="grid gap-1">
                  <label className="build-field">
                    <span>
                      Revision
                      <em className="build-kind">rev</em>
                    </span>
                    <TextCell
                      value={rec?.revision ?? ""}
                      placeholder="Build revision"
                      onSave={(v) =>
                        mut.setBuildField.mutate({
                          woNumber: wo.woNumber,
                          serial,
                          author: who,
                          revision: v,
                        })
                      }
                    />
                  </label>
                  {batteries.length ? (
                    <label className="build-field">
                      <span>
                        Battery
                        <em className="build-kind">type</em>
                      </span>
                      <ComboCell
                        value={rec?.battery ?? ""}
                        options={batteries.map((b) => ({ value: b }))}
                        placeholder="Battery"
                        onSave={(v) =>
                          mut.setBuildField.mutate({
                            woNumber: wo.woNumber,
                            serial,
                            author: who,
                            battery: v,
                          })
                        }
                      />
                    </label>
                  ) : null}
                  {components.map((comp) => {
                    const value = rec?.values[comp.key] ?? "";
                    const linked = woSet.has(value.trim());
                    return (
                      <label key={comp.key} className="build-field">
                        <span>
                          {comp.label}
                          <em className="build-kind">{fieldHint(comp.kind)}</em>
                        </span>
                        <div>
                          {comp.kind === "pcb" ? (
                            <TextCell
                              value={value}
                              placeholder={fieldPlaceholder(comp.kind)}
                              mono
                              onSave={(v) =>
                                mut.setBuildField.mutate({
                                  woNumber: wo.woNumber,
                                  serial,
                                  author: who,
                                  componentKey: comp.key,
                                  componentValue: v,
                                  componentLabel: comp.label,
                                })
                              }
                            />
                          ) : (
                            <ComboCell
                              value={value}
                              options={linkOptions(state, comp.label)}
                              placeholder={fieldPlaceholder(comp.kind)}
                              onSave={(v) =>
                                mut.setBuildField.mutate({
                                  woNumber: wo.woNumber,
                                  serial,
                                  author: who,
                                  componentKey: comp.key,
                                  componentValue: v,
                                  componentLabel: comp.label,
                                })
                              }
                            />
                          )}
                          {linked ? (
                            <Link
                              to="/work-orders/$woNumber"
                              params={{ woNumber: value.trim() }}
                              className="mt-0.5 inline-block text-xs font-medium text-primary"
                            >
                              Open {displayWo(value.trim())}
                            </Link>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                  <label className="build-field">
                    <span>Non-conformity</span>
                    <AreaCell
                      value={rec?.notes ?? ""}
                      placeholder="Notes"
                      onSave={(v) =>
                        mut.setBuildField.mutate({
                          woNumber: wo.woNumber,
                          serial,
                          author: who,
                          notes: v,
                        })
                      }
                    />
                  </label>
                </div>
              ) : null}
              <ConsumedBlock
                parentWo={wo.woNumber}
                serial={serial}
                items={rec?.consumed ?? []}
                state={state}
                mut={mut}
                who={who}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ConsumedBlock({
  parentWo,
  serial,
  items,
  state,
  mut,
  who,
}: {
  parentWo: string;
  serial: string;
  items: ConsumedWo[];
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
  who: string;
}) {
  const [rows, setRows] = useState<ConsumedWo[]>(() =>
    items.length ? items : [{ woNumber: "", part: "" }],
  );
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    const serverItems: ConsumedWo[] = itemsKey === "[]" ? [] : (JSON.parse(itemsKey) as ConsumedWo[]);
    setRows((prev) => {
      const empties = prev.filter((r) => !r.woNumber.trim() && !r.part.trim());
      const next = serverItems.length ? serverItems.map((r) => ({ ...r })) : [];
      if (empties.length) next.push(...empties.map((r) => ({ ...r })));
      if (!next.length) next.push({ woNumber: "", part: "" });
      return next;
    });
  }, [itemsKey]);

  const woOpts = woOptions(state.workOrders.filter((w) => w.woNumber !== parentWo));
  const partOpts = partOptions(state.parts);

  function persist(next: ConsumedWo[]) {
    setRows(next.length ? next : [{ woNumber: "", part: "" }]);
    mut.setConsumed.mutate({
      woNumber: parentWo,
      serial,
      items: next,
    });
  }

  function setRow(index: number, patch: Partial<ConsumedWo>) {
    persist(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function setWo(index: number, raw: string) {
    const woNumber = normalizeWoNumber(raw) || raw.trim();
    const lookedUp = partForWo(state, woNumber);
    const current = rows[index];
    setRow(index, {
      woNumber,
      part: lookedUp || current?.part || "",
    });
  }

  return (
    <div className="consumed-block">
      <div className="consumed-head">
        <h3 className="text-sm font-semibold">Consumed work orders</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mut.writeConsumedHistory.isPending}
          onClick={() => {
            const payload = rows.filter((r) => r.woNumber.trim() || r.part.trim());
            if (!payload.length) {
              toast.error("Add a consumed WO first");
              return;
            }
            mut.writeConsumedHistory.mutate(
              {
                woNumber: parentWo,
                serial,
                author: who,
                items: payload,
              },
              {
                onSuccess: () => toast.success("Written to hardware history"),
              },
            );
          }}
        >
          Write to history log
        </Button>
      </div>
      <p className="mb-2 text-sm text-muted">
        WOs used to build this unit. Type a WO and the part fills in. You can still type the part
        yourself.
      </p>
      <table className="consumed-table">
        <thead>
          <tr>
            <th>WO</th>
            <th>Part</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const linked = Boolean(row.woNumber) && state.workOrders.some((w) => w.woNumber === row.woNumber);
            return (
              <tr key={`${row.woNumber}-${index}`}>
                <td>
                  <ComboCell
                    value={row.woNumber}
                    options={woOpts}
                    placeholder="WO number"
                    onSave={(v) => setWo(index, v)}
                  />
                  {linked ? (
                    <Link
                      to="/work-orders/$woNumber"
                      params={{ woNumber: row.woNumber }}
                      className="mt-0.5 inline-block text-xs font-medium text-primary"
                    >
                      Open {displayWo(row.woNumber)}
                    </Link>
                  ) : null}
                </td>
                <td>
                  <ComboCell
                    value={row.part}
                    options={partOpts}
                    placeholder="Part"
                    onSave={(v) => setRow(index, { part: v.trim() })}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="flex size-10 items-center justify-center text-muted hover:text-danger"
                    aria-label="Remove consumed WO"
                    disabled={!row.woNumber && !row.part && rows.length === 1}
                    onClick={() => persist(rows.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRows((r) => [...r, { woNumber: "", part: "" }])}
        >
          <Plus className="size-3.5" />
          Add WO
        </Button>
      </div>
    </div>
  );
}
