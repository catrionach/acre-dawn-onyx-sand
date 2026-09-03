import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FloorState } from "@/lib/floor/types";
import { useFloorMutations } from "@/lib/floor/queries";
import { CheckCell, TextCell } from "./cells";

async function fileToPayload(file: File): Promise<{
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

export function BuildLookupEditor({ state }: { state: FloorState }) {
  const mut = useFloorMutations();
  const spec = state.buildSpec;
  const [q, setQ] = useState("");
  const [draftComp, setDraftComp] = useState("");
  const [draftBatt, setDraftBatt] = useState("");
  const [draftPart, setDraftPart] = useState("");

  const products = useMemo(() => {
    const set = new Set<string>([
      ...Object.keys(spec.map),
      ...state.parts.map((p) => p.partNumber),
    ]);
    const needle = q.trim().toLowerCase();
    return [...set]
      .filter((p) => (needle ? p.toLowerCase().includes(needle) : true))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [spec.map, state.parts, q]);

  const shown = q.trim() ? products : products.filter((p) => (spec.map[p] ?? []).length > 0);
  const rows = shown.length ? shown : products.slice(0, 40);

  async function upload(list: FileList | File[]) {
    const files = [...list].filter((f) => /\.(xlsx|csv)$/i.test(f.name));
    if (!files.length) return;
    const payloads = await Promise.all(files.map(fileToPayload));
    mut.loadSheet.mutate(payloads, {
      onSuccess: (result) => {
        const n =
          (result.report.inserted.build_components ?? 0) +
          (result.report.updated.build_component_lookup ?? 0);
        if (result.report.errors.length) {
          toast.error(`Lookup loaded with ${result.report.errors.length} problem(s)`);
        } else {
          toast.success(n ? "Component lookup updated" : "File loaded");
        }
      },
    });
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Build component lookup</h2>
          <p className="mt-0.5 text-sm text-muted">
            X means that field is recorded on the work order. Upload the Excel
            lookup, or tick cells here. PCB columns ask for a serial/lot;
            assemblies ask for a WO or part.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/Build_Component_Lookup.xlsx" download>
              Example file
            </a>
          </Button>
          <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium">
            <Upload className="size-3.5" />
            Upload lookup
            <input
              type="file"
              accept=".xlsx,.csv"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="mb-4 rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <h3 className="text-sm font-semibold">Batteries</h3>
        <p className="mb-2 text-sm text-muted">Dropdown on every build record. N/A is fine.</p>
        <div className="flex flex-wrap gap-1.5">
          {spec.batteries.map((code) => (
            <span key={code} className="build-chip">
              {code}
              <button
                type="button"
                className="flex size-7 items-center justify-center text-muted hover:text-danger"
                aria-label={`Remove ${code}`}
                onClick={() => mut.removeBattery.mutate(code)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </span>
          ))}
          <div className="flex min-w-40 items-center gap-1">
            <TextCell
              value={draftBatt}
              placeholder="BE.D2"
              live
              onSave={setDraftBatt}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!draftBatt.trim()}
              onClick={() => {
                mut.addBattery.mutate(draftBatt.trim(), {
                  onSuccess: () => setDraftBatt(""),
                });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter products"
          className="h-10 min-w-48 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm"
        />
        <div className="flex min-w-48 flex-1 items-center gap-1">
          <TextCell
            value={draftPart}
            placeholder="Add product row (exact part number)"
            live
            onSave={setDraftPart}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!draftPart.trim() || !spec.components[0]}
            onClick={() => {
              const part = draftPart.trim();
              const first = spec.components[0];
              if (!first) return;
              mut.setPartComponent.mutate(
                { partNumber: part, componentKey: first.key, required: true },
                { onSuccess: () => setDraftPart("") },
              );
            }}
          >
            Add product
          </Button>
        </div>
        <div className="flex min-w-48 flex-1 items-center gap-1">
          <TextCell
            value={draftComp}
            placeholder="New component column"
            live
            onSave={setDraftComp}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!draftComp.trim()}
            onClick={() => {
              mut.addComponent.mutate(draftComp.trim(), {
                onSuccess: () => setDraftComp(""),
              });
            }}
          >
            Add column
          </Button>
        </div>
      </div>

      {spec.components.length === 0 ? (
        <p className="text-sm text-muted">
          Upload the lookup workbook to fill the matrix, or add a column above.
        </p>
      ) : (
        <div className="sheet-wrap">
          <table className="sheet lookup-matrix min-w-[48rem]">
            <thead>
              <tr>
                <th className="sticky-col">Product</th>
                {spec.components.map((c) => (
                  <th key={c.key} title={c.kind}>
                    <div className="flex items-start justify-between gap-1">
                      <span className="max-w-36 whitespace-normal text-left">{c.label}</span>
                      <button
                        type="button"
                        className="text-muted hover:text-danger"
                        aria-label={`Remove ${c.label}`}
                        onClick={() => mut.removeComponent.mutate(c.key)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <span className="mt-0.5 block text-xs font-normal uppercase tracking-wide text-faint">
                      {c.kind}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={spec.components.length + 1} className="px-3 py-3 text-sm text-muted">
                    No products yet.
                  </td>
                </tr>
              ) : (
                rows.map((part) => {
                  const required = new Set(spec.map[part] ?? []);
                  return (
                    <tr key={part}>
                      <td className="sticky-col font-mono text-sm">{part}</td>
                      {spec.components.map((c) => (
                        <td key={c.key}>
                          <CheckCell
                            checked={required.has(c.key)}
                            label={`${part} ${c.label}`}
                            onSave={(on) =>
                              mut.setPartComponent.mutate({
                                partNumber: part,
                                componentKey: c.key,
                                required: on,
                              })
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
