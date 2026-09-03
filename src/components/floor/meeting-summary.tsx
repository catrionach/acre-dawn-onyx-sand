import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addCalendarDays, formatShopWeekday, todayIso } from "@/lib/floor/dates";
import {
  buildMeetingBrief,
  formatMeetingText,
  formatMeetingHtml,
  MEETING_LOOKBACK_DAYS,
  personDay,
  type MeetingLine,
} from "@/lib/floor/meeting";
import { prospectProblemUrl } from "@/lib/floor/prospect";
import { FLOOR_KEY } from "@/lib/floor/queries";
import type { FloorState } from "@/lib/floor/types";

export function MeetingSummary({ state }: { state: FloorState }) {
  const today = todayIso();
  const minDate = addCalendarDays(today, -MEETING_LOOKBACK_DAYS);
  const [picked, setPicked] = useState(today);
  const selected = picked > today ? today : picked < minDate ? minDate : picked;
  const brief = useMemo(() => buildMeetingBrief(state, today), [state, today]);
  const people = useMemo(() => personDay(brief, selected), [brief, selected]);
  const text = useMemo(() => formatMeetingText(brief, selected), [brief, selected]);
  const [copied, setCopied] = useState(false);
  const [showText, setShowText] = useState(false);
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      await qc.refetchQueries({ queryKey: FLOOR_KEY });
      toast.success("Meeting notes refreshed");
    } finally {
      setRefreshing(false);
    }
  }

  function pick(date: string) {
    if (date < minDate || date > today) return;
    setPicked(date);
  }

  async function copy() {
    const html = formatMeetingHtml(brief, selected);
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) {
          setShowText(true);
          toast.error("Could not copy — select the text below.");
          return;
        }
      }
    }
    setCopied(true);
    toast.success("Meeting notes copied (with formatting)");
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="meeting-brief">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="person-head">Production meeting</h2>
          <p className="mt-0.5 text-sm text-muted">
            Per person, same order as the tables above. Each job is
            WO (part) or PT (title), then its build order notes. Refresh
            reloads the live queue, including pre-pass jobs.
          </p>
        </div>
        <div className="meeting-day-pick">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Previous day"
            disabled={selected <= minDate}
            onClick={() => pick(addCalendarDays(selected, -1))}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <label className="meeting-date-label">
            <span className="sr-only">Meeting day</span>
            <input
              type="date"
              className="meeting-date-input"
              value={selected}
              min={minDate}
              max={today}
              onChange={(e) => pick(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Next day"
            disabled={selected >= today}
            onClick={() => pick(addCalendarDays(selected, 1))}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          {selected !== today ? (
            <Button type="button" variant="outline" size="sm" onClick={() => pick(today)}>
              Today
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button type="button" size="sm" onClick={() => void copy()}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="meeting-panel">
        <div className="meeting-block">
          <h3 className="meeting-label">
            {formatShopWeekday(selected)}
            {selected === today ? <span className="meeting-today">Today</span> : null}
          </h3>
          <div className="meeting-people">
            {people.map((person) => (
              <div key={person.who} className="meeting-person">
                <p className="meeting-who">{person.who}</p>
                {person.lines.length === 0 ? (
                  <p className="meeting-empty">None</p>
                ) : (
                  <ul className="meeting-rows">
                    {person.lines.map((line) => (
                      <li key={`${line.kind}-${line.id}`} className="meeting-row">
                        <JobLink line={line} />
                        {line.part.trim() ? (
                          <span className="meeting-part"> ({line.part.trim()})</span>
                        ) : null}
                        {line.notes.length ? (
                          <span className="meeting-line-notes">
                            : {line.notes.filter(Boolean).join("; ")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showText ? (
        <textarea
          className="meeting-fallback"
          readOnly
          value={text}
          onFocus={(e) => e.currentTarget.select()}
        />
      ) : null}
    </section>
  );
}

function JobLink({ line }: { line: MeetingLine }) {
  if (line.kind === "wo") {
    return (
      <Link
        to="/work-orders/$woNumber"
        params={{ woNumber: line.id }}
        className="meeting-link"
      >
        {line.job}
      </Link>
    );
  }
  if (line.kind === "pt") {
    const href = prospectProblemUrl(line.id);
    return (
      <span className="id-stack-row">
        <Link to="/problems" search={{ pt: line.id }} className="meeting-link">
          {line.job}
        </Link>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="prospect-ext"
            title="Open in Prospect"
            aria-label={`Open ${line.job} in Prospect`}
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </span>
    );
  }
  return (
    <Link to="/tasks" className="meeting-link">
      {line.job}
    </Link>
  );
}
