import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hoursToDays } from "@/lib/floor/dates";
import { displayTsk } from "@/lib/floor/prospect";
import { BUILDER_OPTIONS, TASK_STATUS_OPTIONS, type TaskStatus } from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { SelectCell, TextCell, AreaCell } from "./cells";
import { ErrorBanner, FilterChip, LoadingTable, ScreenHeader } from "./shell";
import { TskId } from "./id-stack";

const STATUS_OPTS = TASK_STATUS_OPTIONS;
const WHO_OPTS = BUILDER_OPTIONS;

export function TasksScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();
  const [showDone, setShowDone] = useState(true);
  const [draftNumber, setDraftNumber] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftWho, setDraftWho] = useState("");
  const [draftDays, setDraftDays] = useState("");
  const [draftStart, setDraftStart] = useState("");
  const [draftFinish, setDraftFinish] = useState("");

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Tasks" />
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
  const rows = state.buildTasks.filter((t) => (showDone ? true : t.status !== "done"));

  function add() {
    const title = draftTitle.trim();
    if (!title) return;
    const days = Number.parseFloat(draftDays);
    mut.addTask.mutate(
      {
        taskNumber: draftNumber.trim() ? displayTsk(draftNumber) : undefined,
        title,
        assignedBuild: draftWho,
        hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
        dateStarted: draftStart || null,
        dateFinished: draftFinish || null,
      },
      {
        onSuccess: () => {
          setDraftNumber("");
          setDraftTitle("");
          setDraftWho("");
          setDraftDays("");
          setDraftStart("");
          setDraftFinish("");
        },
      },
    );
  }

  return (
    <>
      <ScreenHeader
        title="Tasks"
        hint="Jobs that are not work orders — TSK-1, TSK-2. They share the Build order queue with WO and PT."
        actions={
          <FilterChip on={showDone} onClick={() => setShowDone(!showDone)}>
            {showDone ? "Showing all" : "Hide done"}
          </FilterChip>
        }
      />
      <div className="sheet-wrap is-pinned">
        <table className="sheet min-w-[64rem]">
          <thead>
            <tr>
              <th>TSK</th>
              <th>Task</th>
              <th>Who</th>
              <th>Days</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Status</th>
              <th>Build order notes</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-sm text-muted">
                  No tasks yet. Add one here or on Build order.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <TskId taskNumber={t.taskNumber} />
                  </td>
                  <td>
                    <TextCell
                      value={t.title}
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, title: v })}
                    />
                  </td>
                  <td>
                    <SelectCell
                      value={t.assignedBuild}
                      options={WHO_OPTS}
                      allowEmpty
                      emptyLabel="—"
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, assignedBuild: v })}
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
                          mut.patchTask.mutate({ id: t.id, hours: n * 8 });
                        }
                      }}
                    />
                  </td>
                  <td>
                    <TextCell
                      type="date"
                      value={t.dateStarted ?? ""}
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, dateStarted: v || null })}
                    />
                  </td>
                  <td>
                    <TextCell
                      type="date"
                      value={t.dateFinished ?? ""}
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, dateFinished: v || null })}
                    />
                  </td>
                  <td>
                    <SelectCell
                      value={t.status}
                      options={STATUS_OPTS}
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, status: v as TaskStatus })}
                    />
                  </td>
                  <td className="min-w-52">
                    <AreaCell
                      value={t.buildOrderNotes}
                      placeholder="Build order notes"
                      onSave={(v) => mut.patchTask.mutate({ id: t.id, buildOrderNotes: v })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      aria-label="Remove task"
                      className="flex size-10 items-center justify-center text-muted hover:text-danger"
                      onClick={() => mut.taskDelete.mutate(t.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            <tr className="is-new">
              <td>
                <TextCell
                  value={draftNumber}
                  placeholder={state.nextTskNumber}
                  mono
                  live
                  onSave={setDraftNumber}
                />
              </td>
              <td>
                <TextCell value={draftTitle} placeholder="Task" live onSave={setDraftTitle} />
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
              <td>
                <TextCell
                  type="number"
                  min={0}
                  value={draftDays}
                  placeholder="Days"
                  mono
                  live
                  onSave={setDraftDays}
                />
              </td>
              <td>
                <TextCell type="date" value={draftStart} live onSave={setDraftStart} />
              </td>
              <td>
                <TextCell type="date" value={draftFinish} live onSave={setDraftFinish} />
              </td>
              <td colSpan={3}>
                <div className="px-2 py-1.5">
                  <Button type="button" size="sm" onClick={add} disabled={!draftTitle.trim()}>
                    Add task
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
