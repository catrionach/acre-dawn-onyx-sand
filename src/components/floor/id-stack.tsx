import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { soFileLabel, qtFileLabel, woFileLabel, ptFileLabel } from "@/lib/floor/labels";
import { displayPt, displayTsk, displayWo, prospectProblemUrl } from "@/lib/floor/prospect";

export function WoId({ woNumber, compact }: { woNumber: string; compact?: boolean }) {
  return (
    <div className={compact ? "id-stack is-compact" : "id-stack"}>
      <Link to="/work-orders/$woNumber" params={{ woNumber }}>
        {displayWo(woNumber)}
      </Link>
      {compact ? null : <span className="file-label">{woFileLabel(woNumber)}</span>}
    </div>
  );
}

export function SoId({ soNumber, compact }: { soNumber: string; compact?: boolean }) {
  return (
    <div className={compact ? "id-stack is-compact" : "id-stack"}>
      <Link to="/sales/$soNumber" params={{ soNumber }}>
        {soNumber}
      </Link>
      {compact ? null : <span className="file-label">{soFileLabel(soNumber)}</span>}
    </div>
  );
}

export function QtId({ ticketNumber, compact }: { ticketNumber: string; compact?: boolean }) {
  return (
    <div className={compact ? "id-stack is-compact" : "id-stack"}>
      <Link to="/tickets/$ticketNumber" params={{ ticketNumber }}>
        {ticketNumber}
      </Link>
      {compact ? null : <span className="file-label">{qtFileLabel(ticketNumber)}</span>}
    </div>
  );
}

export function TskId({ taskNumber }: { taskNumber: string }) {
  return (
    <div className="id-stack is-compact">
      <Link to="/tasks">{displayTsk(taskNumber)}</Link>
    </div>
  );
}

export function PtId({ prospectNumber, compact }: { prospectNumber: string; compact?: boolean }) {
  const href = prospectProblemUrl(prospectNumber);
  return (
    <div className={compact ? "id-stack is-compact" : "id-stack"}>
      <div className="id-stack-row">
        <Link to="/problems" search={{ pt: prospectNumber }}>
          {displayPt(prospectNumber)}
        </Link>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="prospect-ext"
            title="Open in Prospect"
            aria-label={`Open ${displayPt(prospectNumber)} in Prospect`}
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
      {compact ? null : <span className="file-label">{ptFileLabel(prospectNumber)}</span>}
    </div>
  );
}
