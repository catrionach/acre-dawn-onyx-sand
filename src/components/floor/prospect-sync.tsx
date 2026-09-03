import type { ProblemTicket } from "@/lib/floor/types";

export function ProspectStatusNow({ pt }: { pt: ProblemTicket }) {
  return (
    <p className={pt.prospectStatus ? "prospect-status-now" : "prospect-status-now is-empty"}>
      {pt.prospectStatus || "No status note"}
    </p>
  );
}
