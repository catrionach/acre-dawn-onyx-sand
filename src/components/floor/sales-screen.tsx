import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatShopDate, isPastDate, todayIso } from "@/lib/floor/dates";
import type { FloorState, SoStatus } from "@/lib/floor/types";
import { isProformaNote } from "@/lib/floor/lookups";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { ComboCell, partOptions, SelectCell, TextCell, AreaCell, woOptionsForPart } from "./cells";
import { ErrorBanner, FilterChip, LoadingTable, ScreenHeader } from "./shell";
import { SoId, WoId } from "./id-stack";
import { SoPill, UnitPill, WoPill } from "./status-pill";

const STATUS_OPTS = [
  { value: "open", label: "Open" },
  { value: "waiting_on_customer", label: "Waiting on customer" },
  { value: "despatched", label: "Despatched" },
  { value: "cancelled", label: "Cancelled" },
];

function SageNotesCell({ value }: { value: string }) {
  const text = value.trim();
  if (!text) return <span className="block px-2.5 text-muted">—</span>;
  const proforma = isProformaNote(text);
  return (
    <div className={proforma ? "sage-notes is-proforma" : "sage-notes"}>
      <span>{text}</span>
      {proforma ? <span className="sage-notes-warn">Proforma — do not ship yet</span> : null}
    </div>
  );
}

export function SalesScreen({ openId }: { openId?: string }) {
  const floor = useFloor();
  const mut = useFloorMutations();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Sales orders" />
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
      showAll={showAll}
      setShowAll={setShowAll}
      mut={mut}
      navigate={navigate}
    />
  );
}

async function fileToSagePayload(file: File): Promise<{
  name: string;
  kind: "csv" | "xlsx";
  content: string;
}> {
  const name = file.name;
  const isXlsx = /\.xlsx$/i.test(name) || file.type.includes("spreadsheet");
  if (isXlsx) {
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 1) binary += String.fromCharCode(buf[i]);
    return { name, kind: "xlsx", content: btoa(binary) };
  }
  return { name, kind: "csv", content: await file.text() };
}

function Loaded({
  state,
  openId,
  showAll,
  setShowAll,
  mut,
  navigate,
}: {
  state: FloorState;
  openId?: string;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  mut: ReturnType<typeof useFloorMutations>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const today = todayIso();
  const [draftSo, setDraftSo] = useState("");
  const [draftCompany, setDraftCompany] = useState("");
  const [draftLead, setDraftLead] = useState("4");
  const [draftPart, setDraftPart] = useState("");
  const [draftQty, setDraftQty] = useState("1");
  const [draftWo, setDraftWo] = useState("");
  const rows = state.salesOrders.filter((so) => {
    if (openId && so.soNumber === openId) return true;
    return showAll ? true : so.status === "open" || so.status === "waiting_on_customer";
  });

  function toggle(soNumber: string) {
    if (openId === soNumber) void navigate({ to: "/sales" });
    else void navigate({ to: "/sales/$soNumber", params: { soNumber } });
  }

  return (
    <>
      <ScreenHeader
        title="Sales orders"
        hint="New line: Sage number, part number and qty first. Upload Sage to replace the pack list and overwrite order dates on matching sales orders from Sage’s Sales Order Date."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="sage-pack-upload"
              type="file"
              accept=".xlsx,.csv,.xls"
              className="sr-only"
              disabled={mut.loadSage.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void fileToSagePayload(file).then((payload) => mut.loadSage.mutate(payload));
                }
                e.target.value = "";
              }}
            />
            <Button asChild variant="outline" size="sm">
              <label
                htmlFor="sage-pack-upload"
                className={mut.loadSage.isPending ? "pointer-events-none opacity-40" : undefined}
              >
                {mut.loadSage.isPending ? "Uploading Sage…" : "Upload Sage"}
              </label>
            </Button>
            <FilterChip on={showAll} onClick={() => setShowAll(!showAll)}>
              {showAll ? "Showing all" : "Open + waiting"}
            </FilterChip>
          </div>
        }
      />
      {state.sagePackMeta.filename ? (
        <p className="mb-3 text-sm text-muted">
          Sage pack list: {state.sagePackMeta.filename} · {state.sagePackMeta.rowCount} lines.
          Shipping uses this until the next upload. Matching SO order dates are overwritten from Sage.
        </p>
      ) : null}
      <div className="sheet-wrap is-pinned">
        <table className="sheet min-w-[70rem]">
          <thead>
            <tr>
              <th className="w-8" />
              <th>SO</th>
              <th>Part</th>
              <th className="w-16">Qty</th>
              <th>Trace</th>
              <th>Company</th>
              <th>Order date</th>
              <th>Lead weeks</th>
              <th>Target despatch</th>
              <th>Status</th>
              <th>Despatch date</th>
              <th>Sage notes</th>
              <th>Notes to production</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((so) => {
              const open = openId === so.soNumber;
              const overdue =
                isPastDate(so.targetDespatch, today) &&
                (so.status === "open" || so.status === "waiting_on_customer");
              const lines = state.salesLines.filter((l) => l.soNumber === so.soNumber);
              const lineRows = lines.length > 0 ? lines : [null];
              return (
                <Fragment key={so.soNumber}>
                  {lineRows.map((line, i) => (
                    <tr
                      key={line ? line.id : `empty-${so.soNumber}`}
                      className={open && i === 0 ? "is-open" : undefined}
                    >
                      <td>
                        {i === 0 ? (
                          <button
                            type="button"
                            aria-label={open ? "Collapse" : "Expand"}
                            onClick={() => toggle(so.soNumber)}
                            className="flex h-11 w-full items-center justify-center text-muted"
                          >
                            {open ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        ) : null}
                      </td>
                      <td>
                        <SoId soNumber={so.soNumber} />
                      </td>
                      {line ? (
                        <>
                          <td>
                            <ComboCell
                              value={line.part}
                              options={partOptions(state.parts)}
                              placeholder="Part"
                              onSave={(v) => mut.patchLine.mutate({ id: line.id, part: v })}
                            />
                          </td>
                          <td>
                            <TextCell
                              type="number"
                              min={1}
                              value={String(line.qty)}
                              mono
                              onSave={(v) => {
                                const n = Number.parseInt(v, 10);
                                if (Number.isFinite(n) && n >= 1) {
                                  mut.patchLine.mutate({ id: line.id, qty: n });
                                }
                              }}
                            />
                          </td>
                          <td>
                            <ComboCell
                              value={line.workOrderNumber}
                              options={woOptionsForPart(state.workOrders, line.part)}
                              placeholder="Trace"
                              onSave={(v) =>
                                mut.patchLine.mutate({ id: line.id, workOrderNumber: v })
                              }
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2.5 text-sm text-muted">Part</td>
                          <td className="px-2.5 text-sm text-muted">Qty</td>
                          <td />
                        </>
                      )}
                      {i === 0 ? (
                        <>
                          <td>
                            <TextCell
                              value={so.company}
                              onSave={(v) =>
                                mut.patchSo.mutate({ soNumber: so.soNumber, company: v })
                              }
                            />
                          </td>
                          <td>
                            <TextCell
                              type="date"
                              value={so.orderDate ?? ""}
                              onSave={(v) =>
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  orderDate: v || null,
                                })
                              }
                            />
                          </td>
                          <td>
                            <TextCell
                              type="number"
                              min={0}
                              value={so.leadTimeWeeks == null ? "" : String(so.leadTimeWeeks)}
                              mono
                              onSave={(v) => {
                                const n = Number.parseFloat(v);
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  leadTimeWeeks: v === "" || !Number.isFinite(n) ? null : n,
                                });
                              }}
                            />
                          </td>
                          <td>
                            <TextCell
                              type="date"
                              value={so.targetDespatch ?? ""}
                              danger={overdue}
                              onSave={(v) =>
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  targetDespatch: v || null,
                                  targetDespatchIsOverride: Boolean(v),
                                })
                              }
                            />
                          </td>
                          <td>
                            <SelectCell
                              value={so.status}
                              options={STATUS_OPTS}
                              onSave={(v) =>
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  status: v as SoStatus,
                                })
                              }
                            />
                          </td>
                          <td>
                            <TextCell
                              type="date"
                              value={so.despatchDate ?? ""}
                              onSave={(v) =>
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  despatchDate: v || null,
                                })
                              }
                            />
                          </td>
                          <td className="min-w-40">
                            <SageNotesCell value={so.notesLine1} />
                          </td>
                          <td className="min-w-56">
                            <AreaCell
                              value={so.notesToProduction}
                              placeholder="Note to production"
                              onSave={(v) =>
                                mut.patchSo.mutate({
                                  soNumber: so.soNumber,
                                  notesToProduction: v,
                                })
                              }
                            />
                          </td>
                        </>
                      ) : (
                        <td colSpan={8} className="text-muted">
                          <span className="block px-2.5 text-xs">same order</span>
                        </td>
                      )}
                      <td>
                        {line ? (
                          <button
                            type="button"
                            aria-label="Remove line"
                            className="flex size-10 items-center justify-center text-muted hover:text-danger"
                            onClick={() => mut.lineDelete.mutate(line.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {open ? (
                    <tr>
                      <td colSpan={14} className="bg-bg">
                        <SalesExpand soNumber={so.soNumber} state={state} mut={mut} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            <tr className="is-new">
              <td />
              <td>
                <TextCell
                  value={draftSo}
                  placeholder="Sage number"
                  mono
                  onSave={setDraftSo}
                />
              </td>
              <td>
                <ComboCell
                  value={draftPart}
                  options={partOptions(state.parts)}
                  placeholder="Part number"
                  onSave={setDraftPart}
                />
              </td>
              <td>
                <TextCell
                  type="number"
                  min={1}
                  value={draftQty}
                  mono
                  placeholder="Qty"
                  onSave={setDraftQty}
                />
              </td>
              <td>
                <ComboCell
                  value={draftWo}
                  options={woOptionsForPart(state.workOrders, draftPart)}
                  placeholder="Trace"
                  onSave={setDraftWo}
                />
              </td>
              <td>
                <TextCell value={draftCompany} placeholder="Company (new SO)" onSave={setDraftCompany} />
              </td>
              <td colSpan={2}>
                <TextCell
                  type="number"
                  min={0}
                  value={draftLead}
                  placeholder="Lead weeks"
                  onSave={setDraftLead}
                />
              </td>
              <td colSpan={4} />
              <td />
              <td>
                <div className="px-1 py-1.5">
                  <Button
                    type="button"
                    size="sm"
                    disabled={!draftSo.trim() || !draftPart.trim()}
                    onClick={() => {
                      const lead = Number.parseFloat(draftLead);
                      const qty = Number.parseInt(draftQty, 10);
                      mut.lineAdd.mutate(
                        {
                          soNumber: draftSo.trim(),
                          company: draftCompany,
                          leadTimeWeeks: Number.isFinite(lead) ? lead : null,
                          part: draftPart,
                          qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
                          workOrderNumber: draftWo,
                        },
                        {
                          onSuccess: () => {
                            setDraftCompany("");
                            setDraftLead("4");
                            setDraftPart("");
                            setDraftQty("1");
                            setDraftWo("");
                          },
                        },
                      );
                    }}
                  >
                    <Plus className="size-3.5" />
                    Line
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

function SalesExpand({
  soNumber,
  state,
  mut,
}: {
  soNumber: string;
  state: FloorState;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const so = state.salesOrders.find((s) => s.soNumber === soNumber);
  const lines = state.salesLines.filter((l) => l.soNumber === soNumber);
  const units = state.units.filter((u) => u.salesOrderNumber === soNumber);
  const [draftPart, setDraftPart] = useState("");
  const [draftQty, setDraftQty] = useState("1");
  const [draftWo, setDraftWo] = useState("");

  if (!so) return null;

  return (
    <div className="expand-panel">
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">
              {so.company || "Sales order"} · {so.soNumber}
            </h2>
            <p className="text-xs text-muted">
              Ordered {formatShopDate(so.orderDate) || "—"}
              {so.leadTimeWeeks != null ? ` · ${so.leadTimeWeeks} weeks` : ""}
            </p>
          </div>
          <SoPill status={so.status} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="pb-1">Part</th>
              <th className="pb-1 w-16">Qty</th>
              <th className="pb-1">Trace</th>
              <th className="pb-1">Status / who</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const wo = state.workOrders.find((w) => w.woNumber === line.workOrderNumber);
              return (
                <tr key={line.id} className="border-t border-border">
                  <td>
                    <ComboCell
                      value={line.part}
                      options={partOptions(state.parts)}
                      onSave={(v) => mut.patchLine.mutate({ id: line.id, part: v })}
                    />
                  </td>
                  <td>
                    <TextCell
                      type="number"
                      min={1}
                      value={String(line.qty)}
                      mono
                      onSave={(v) => {
                        const n = Number.parseInt(v, 10);
                        if (Number.isFinite(n) && n >= 1) mut.patchLine.mutate({ id: line.id, qty: n });
                      }}
                    />
                  </td>
                  <td>
                    <ComboCell
                      value={line.workOrderNumber}
                      options={woOptionsForPart(state.workOrders, line.part)}
                      placeholder="Trace"
                      onSave={(v) => mut.patchLine.mutate({ id: line.id, workOrderNumber: v })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    {line.workOrderNumber ? (
                      wo ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <WoPill status={wo.status} />
                          <span className="text-muted">{wo.assignedBuild || "Unassigned"}</span>
                        </div>
                      ) : (
                        <span className="text-muted">Unknown WO</span>
                      )
                    ) : (
                      <span className="font-semibold text-warn">No WO</span>
                    )}
                    {line.despatchDate ? (
                      <p className="text-xs text-muted">
                        Despatched {formatShopDate(line.despatchDate)} from WO{" "}
                        {line.despatchWoNumber}
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <button
                      type="button"
                      aria-label="Remove line"
                      className="flex size-10 items-center justify-center text-muted hover:text-danger"
                      onClick={() => mut.lineDelete.mutate(line.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-border">
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
                <ComboCell
                  value={draftWo}
                  options={woOptionsForPart(state.workOrders, draftPart)}
                  placeholder="Trace"
                  onSave={setDraftWo}
                />
              </td>
              <td colSpan={2} className="px-2 py-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const qty = Number.parseInt(draftQty, 10);
                    mut.lineAdd.mutate(
                      {
                        soNumber,
                        part: draftPart,
                        qty: Number.isFinite(qty) && qty >= 1 ? qty : 1,
                        workOrderNumber: draftWo,
                      },
                      {
                        onSuccess: () => {
                          setDraftPart("");
                          setDraftQty("1");
                          setDraftWo("");
                        },
                      },
                    );
                  }}
                >
                  <Plus className="size-3.5" />
                  Line
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <h2 className="mb-2 text-sm font-semibold">Units tagged to this SO</h2>
        {units.length === 0 ? (
          <p className="text-sm text-muted">
            None. Units pick up a sales order number only when they are allocated or shipped.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-2 py-2 text-sm"
              >
                <div>
                  <p className="font-mono font-medium">{unit.unitId}</p>
                  <p className="text-muted">WO {unit.workOrderNumber}</p>
                </div>
                <UnitPill status={unit.status} />
              </li>
            ))}
          </ul>
        )}
        {lines.some((l) => l.workOrderNumber) ? (
          <div className="mt-3 space-y-2">
            <h3 className="text-xs uppercase tracking-wide text-muted">Planned jobs</h3>
            {Array.from(new Set(lines.map((l) => l.workOrderNumber).filter(Boolean))).map(
              (woNumber) => {
                const wo = state.workOrders.find((w) => w.woNumber === woNumber);
                return (
                  <div key={woNumber} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <WoId woNumber={woNumber} />
                      {wo ? <WoPill status={wo.status} /> : null}
                      <span className="text-sm text-muted">{wo?.assignedBuild || ""}</span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : null}
      </section>
    </div>
    </div>
  );
}
