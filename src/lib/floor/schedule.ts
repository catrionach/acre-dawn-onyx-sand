import type { BuildTask, Part, ProblemTicket, QueueEntry, WorkOrder } from "./types";
import { nextWeekday, snapToWeekday } from "./dates";

export type JobEstimate = {
  woNumber: string;
  hours: number;
  start: string;
  complete: string;
};

export type ItemEstimate = {
  key: string;
  hours: number;
  start: string;
  complete: string;
};

function partHours(partNumber: string, parts: Part[]): number {
  const match = parts.find((p) => p.partNumber === partNumber);
  return match ? match.buildTimeHours : 0;
}

/** Hours for a job: WO overwrite, else parts spec × qty. */
export function jobHours(wo: WorkOrder, parts: Part[]): number {
  if (wo.buildTimeHours != null) return wo.buildTimeHours;
  return partHours(wo.part, parts) * wo.qty;
}

/** Days of work, 8 hours Mon–Fri. Zero hours finishes the same start day. */
export function finishOn(startIso: string, hours: number): string {
  const start = snapToWeekday(startIso);
  if (hours <= 0) return start;
  const days = Math.ceil(hours / 8);
  let cursor = start;
  for (let i = 1; i < days; i += 1) cursor = nextWeekday(cursor);
  return cursor;
}

export function queueItemKey(entry: QueueEntry): string {
  if (entry.kind === "task") return `task:${entry.taskId}`;
  if (entry.kind === "pt") return `pt:${entry.problemId}@${entry.assignedBuild}`;
  return `wo:${entry.woNumber}@${entry.assignedBuild}`;
}

/**
 * One person's chain. On-hold / done are skipped.
 * An item already started keeps its start date and hours — later tasks on
 * another person never move it.
 */
export function estimatePersonQueue(
  entries: QueueEntry[],
  workOrders: WorkOrder[],
  tasks: BuildTask[],
  parts: Part[],
  today: string,
  problems: ProblemTicket[] = [],
): Map<string, ItemEstimate> {
  const byWo = new Map(workOrders.map((w) => [w.woNumber, w]));
  const byTask = new Map(tasks.map((t) => [t.id, t]));
  const byPt = new Map(problems.map((p) => [p.id, p]));
  const out = new Map<string, ItemEstimate>();
  let previousComplete: string | null = null;

  const ordered = [...entries].sort((a, b) => a.position - b.position);
  for (const entry of ordered) {
    let hours = 0;
    let status = "";
    let dateStarted: string | null = null;
    if (entry.kind === "wo") {
      const wo = byWo.get(entry.woNumber);
      if (!wo) continue;
      if (wo.status === "on_hold" || wo.status === "closed" || wo.status === "cancelled") continue;
      hours = jobHours(wo, parts);
      status = wo.status;
      dateStarted = wo.dateStarted;
    } else if (entry.kind === "pt") {
      const pt = entry.problemId != null ? byPt.get(entry.problemId) : undefined;
      if (!pt) continue;
      if (pt.status === "on_hold" || pt.status === "done") continue;
      hours = pt.hours > 0 ? pt.hours : partHours(pt.part, parts);
      status = pt.status;
      dateStarted = pt.dateStarted;
    } else {
      const task = entry.taskId != null ? byTask.get(entry.taskId) : undefined;
      if (!task) continue;
      if (task.status === "on_hold" || task.status === "done") continue;
      hours = task.hours;
      status = task.status;
      dateStarted = task.dateStarted;
    }

    const key = queueItemKey(entry);
    const started = status === "active" && Boolean(dateStarted);
    let start: string;
    if (started) {
      start = snapToWeekday(dateStarted as string);
    } else if (previousComplete == null) {
      start = snapToWeekday(today);
    } else {
      start = nextWeekday(previousComplete);
    }
    const complete = finishOn(start, hours);
    out.set(key, { key, hours, start, complete });
    previousComplete = complete;
  }
  return out;
}

/**
 * Single production chain along the build-order list.
 * Top job starts today, or date_started if already active.
 * Next job starts the next weekday after the one above finishes.
 */
export function estimateBuildOrder(
  buildOrder: string[],
  workOrders: WorkOrder[],
  parts: Part[],
  today: string,
): Map<string, JobEstimate> {
  const byNumber = new Map(workOrders.map((wo) => [wo.woNumber, wo]));
  const out = new Map<string, JobEstimate>();
  let previousComplete: string | null = null;

  for (const woNumber of buildOrder) {
    const wo = byNumber.get(woNumber);
    if (!wo) continue;
    if (wo.status === "on_hold") continue;
    const hours = jobHours(wo, parts);
    let start: string;
    if (previousComplete == null) {
      start =
        wo.status === "active" && wo.dateStarted
          ? snapToWeekday(wo.dateStarted)
          : snapToWeekday(today);
    } else {
      start = nextWeekday(previousComplete);
    }
    const complete = finishOn(start, hours);
    out.set(woNumber, { woNumber, hours, start, complete });
    previousComplete = complete;
  }

  return out;
}
