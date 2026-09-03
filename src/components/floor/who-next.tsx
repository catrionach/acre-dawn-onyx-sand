import { Button } from "@/components/ui/button";
import { BUILDER_OPTIONS, type ProblemTicket, type WorkOrder } from "@/lib/floor/types";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { SelectCell } from "./cells";
import { useAuthor } from "./author";

export function WhoNextCell({
  wo,
  pt,
  mut,
}: {
  wo?: WorkOrder;
  pt?: ProblemTicket;
  mut: ReturnType<typeof useFloorMutations>;
}) {
  const { author } = useAuthor();
  const floor = useFloor();
  const assignedBuild = wo?.assignedBuild ?? pt?.assignedBuild ?? "";
  const assignedNext = wo?.assignedNext ?? pt?.assignedNext ?? "";
  const next = assignedNext.trim();
  const alreadyOnNext = Boolean(
    next &&
      floor.data?.buildQueue.some((e) => {
        if (wo)
          return e.kind === "wo" && e.woNumber === wo.woNumber && e.assignedBuild === next;
        if (pt) return e.kind === "pt" && e.problemId === pt.id && e.assignedBuild === next;
        return false;
      }),
  );
  const busy =
    mut.passWo.isPending ||
    mut.prePassWo.isPending ||
    mut.passPt.isPending ||
    mut.prePassPt.isPending;
  const canPass = Boolean(next) && next !== assignedBuild;
  return (
    <div className="who-next">
      <SelectCell
        value={assignedNext}
        options={BUILDER_OPTIONS}
        allowEmpty
        emptyLabel="—"
        onSave={(v) => {
          if (wo) mut.patchWo.mutate({ woNumber: wo.woNumber, assignedNext: v });
          else if (pt) mut.patchPt.mutate({ id: pt.id, assignedNext: v });
        }}
      />
      {canPass ? (
        <div className="who-next-actions">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            title="Move this job off the current person's list onto Who next"
            onClick={() => {
              if (wo) mut.passWo.mutate({ woNumber: wo.woNumber, historyAuthor: author });
              else if (pt) mut.passPt.mutate({ id: pt.id });
            }}
          >
            Pass on
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || alreadyOnNext}
            title="Put it on Who next's list and keep it on the current person's list"
            onClick={() => {
              if (wo) mut.prePassWo.mutate({ woNumber: wo.woNumber, historyAuthor: author });
              else if (pt) mut.prePassPt.mutate({ id: pt.id });
            }}
          >
            {alreadyOnNext ? "On both lists" : "Pre-pass on"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
