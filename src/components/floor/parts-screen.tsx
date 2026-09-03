import { useMemo, useState } from "react";
import { hoursToDays } from "@/lib/floor/dates";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { Button } from "@/components/ui/button";
import { CheckCell, TextCell } from "./cells";
import { ErrorBanner, LoadingTable, ScreenHeader } from "./shell";
import { BuildLookupEditor } from "./build-lookup-editor";

export function PartsScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();
  const [q, setQ] = useState("");
  const [draftNumber, setDraftNumber] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftLogger, setDraftLogger] = useState("");
  const [draftType, setDraftType] = useState("");
  const [draftCounts, setDraftCounts] = useState("");
  const [draftDirectional, setDraftDirectional] = useState(false);
  const [draftHours, setDraftHours] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftActive, setDraftActive] = useState(true);

  const parts = useMemo(() => {
    const list = floor.data?.parts ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((p) =>
      [p.partNumber, p.name, p.logger, p.type, p.notes].some((v) =>
        v.toLowerCase().includes(needle),
      ),
    );
  }, [floor.data?.parts, q]);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Parts spec" />
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

  function addPart() {
    const hours = Number.parseFloat(draftHours);
    mut.addPart.mutate(
      {
        partNumber: draftNumber.trim(),
        name: draftName,
        logger: draftLogger,
        type: draftType,
        counts: draftCounts,
        directional: draftDirectional,
        buildTimeHours: Number.isFinite(hours) ? hours : 0,
        notes: draftNotes,
        active: draftActive,
      },
      {
        onSuccess: () => {
          setDraftNumber("");
          setDraftName("");
          setDraftLogger("");
          setDraftType("");
          setDraftCounts("");
          setDraftDirectional(false);
          setDraftHours("");
          setDraftNotes("");
          setDraftActive(true);
        },
      },
    );
  }

  return (
    <>
      <ScreenHeader
        title="Parts spec"
        hint="Every catalogue field is editable. Below that, the build component lookup says which PCB, battery and assembly fields to record on each part."
        actions={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search parts"
            className="h-10 w-full min-w-48 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm sm:w-64"
          />
        }
      />
      <div className="sheet-wrap">
        <table className="sheet min-w-[72rem]">
          <thead>
            <tr>
              <th>Part number</th>
              <th>Name</th>
              <th>Logger</th>
              <th>Type</th>
              <th>Counts</th>
              <th className="w-16">Dir.</th>
              <th>Build hours</th>
              <th>Days</th>
              <th>Notes</th>
              <th className="w-16">Active</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.partNumber}>
                <td>
                  <TextCell
                    value={part.partNumber}
                    mono
                    onSave={(v) => {
                      const next = v.trim();
                      if (!next || next === part.partNumber) return;
                      mut.patchPart.mutate({
                        partNumber: part.partNumber,
                        nextPartNumber: next,
                      });
                    }}
                  />
                </td>
                <td>
                  <TextCell
                    value={part.name}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, name: v })
                    }
                  />
                </td>
                <td>
                  <TextCell
                    value={part.logger}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, logger: v })
                    }
                  />
                </td>
                <td>
                  <TextCell
                    value={part.type}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, type: v })
                    }
                  />
                </td>
                <td>
                  <TextCell
                    value={part.counts}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, counts: v })
                    }
                  />
                </td>
                <td>
                  <CheckCell
                    checked={part.directional}
                    label={`Directional ${part.partNumber}`}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, directional: v })
                    }
                  />
                </td>
                <td>
                  <TextCell
                    type="number"
                    min={0}
                    value={String(part.buildTimeHours)}
                    mono
                    onSave={(v) => {
                      const n = Number.parseFloat(v);
                      if (Number.isFinite(n) && n >= 0) {
                        mut.patchPart.mutate({
                          partNumber: part.partNumber,
                          buildTimeHours: n,
                        });
                      }
                    }}
                  />
                </td>
                <td>
                  <span className="mono-num block px-2.5 text-muted">
                    {hoursToDays(part.buildTimeHours)}
                  </span>
                </td>
                <td>
                  <TextCell
                    value={part.notes}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, notes: v })
                    }
                  />
                </td>
                <td>
                  <CheckCell
                    checked={part.active}
                    label={`Active ${part.partNumber}`}
                    onSave={(v) =>
                      mut.patchPart.mutate({ partNumber: part.partNumber, active: v })
                    }
                  />
                </td>
              </tr>
            ))}
            <tr className="is-new">
              <td>
                <TextCell
                  value={draftNumber}
                  placeholder="Part number"
                  mono
                  onSave={setDraftNumber}
                />
              </td>
              <td>
                <TextCell value={draftName} placeholder="Name" onSave={setDraftName} />
              </td>
              <td>
                <TextCell value={draftLogger} placeholder="Logger" onSave={setDraftLogger} />
              </td>
              <td>
                <TextCell value={draftType} placeholder="Type" onSave={setDraftType} />
              </td>
              <td>
                <TextCell value={draftCounts} placeholder="Counts" onSave={setDraftCounts} />
              </td>
              <td>
                <CheckCell
                  checked={draftDirectional}
                  label="Directional new part"
                  onSave={setDraftDirectional}
                />
              </td>
              <td>
                <TextCell
                  type="number"
                  min={0}
                  value={draftHours}
                  mono
                  placeholder="Hours"
                  onSave={setDraftHours}
                />
              </td>
              <td />
              <td>
                <TextCell value={draftNotes} placeholder="Notes" onSave={setDraftNotes} />
              </td>
              <td>
                <div className="flex items-center gap-2 px-1">
                  <CheckCell
                    checked={draftActive}
                    label="Active new part"
                    onSave={setDraftActive}
                  />
                  <Button type="button" size="sm" onClick={addPart} disabled={!draftNumber.trim()}>
                    Add
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BuildLookupEditor state={floor.data} />
    </>
  );
}
