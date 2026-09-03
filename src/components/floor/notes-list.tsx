import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { ScrollText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatStamp } from "@/lib/floor/dates";
import { displayPt, displayWo } from "@/lib/floor/prospect";
import type { HistorySource } from "@/lib/floor/lookups";
import type { Note } from "@/lib/floor/types";
import { useAuthor } from "./author";

export function NotesList({
  notes,
  onAdd,
  placeholder = "Add a note",
  emptyText = "No notes yet.",
}: {
  notes: Note[];
  onAdd: (input: { author: string; text: string }) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  return (
    <div className="space-y-2">
      <NoteEntries notes={notes} emptyText={emptyText} />
      <NoteComposer placeholder={placeholder} onAdd={onAdd} />
    </div>
  );
}

export function NoteStack({
  notes,
  onAdd,
  placeholder = "Add a note",
  readOnly = false,
}: {
  notes: Note[];
  onAdd?: (input: { author: string; text: string }) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className={readOnly ? "note-stack is-readonly" : "note-stack"}>
      {notes.length ? (
        <ul>
          {notes.map((note, i) => (
            <li key={`${note.date}-${note.text}-${i}`}>
              <span>{note.text}</span>
              {note.author ? <span className="note-stack-who">{note.author}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="note-stack-empty">{readOnly ? "—" : null}</p>
      )}
      {readOnly || !onAdd ? null : (
        <NoteComposer placeholder={placeholder} onAdd={onAdd} inCell />
      )}
    </div>
  );
}

export function HistoryButton({
  woNumber,
  part,
  notes,
  onAdd,
}: {
  woNumber: string;
  part?: string;
  notes: Note[];
  onAdd: (input: { author: string; text: string }) => void;
}) {
  return (
    <HistoryTrigger
      dialogId={woNumber}
      subtitle={`WO ${woNumber}${part ? ` · ${part}` : ""}`}
      sources={[{ woNumber, part: part ?? "", notes }]}
      emptyText="Nothing logged yet. Add the first line below."
      fromTicket={false}
      onAdd={(n) => onAdd({ author: n.author, text: n.text })}
    />
  );
}

export function PtHistoryButton({
  prospectNumber,
  sources,
  onAdd,
}: {
  prospectNumber: string;
  sources: HistorySource[];
  onAdd: (input: { author: string; text: string; woNumber: string }) => void;
}) {
  const labels = sources.map((s) => {
    const wo = displayWo(s.woNumber);
    return s.part ? `${wo} · ${s.part}` : wo;
  });
  const subtitle = sources.length
    ? `${displayPt(prospectNumber)} · from consumed ${labels.join(", ")}`
    : `${displayPt(prospectNumber)} · no consumed WOs listed`;
  const emptyText = sources.length
    ? "Nothing logged on the consumed work orders yet."
    : "Add a consumed work order on this ticket, then open history again.";
  return (
    <HistoryTrigger
      dialogId={`pt-${prospectNumber}`}
      subtitle={subtitle}
      sources={sources}
      emptyText={emptyText}
      fromTicket
      onAdd={onAdd}
    />
  );
}

function HistoryTrigger({
  dialogId,
  subtitle,
  sources,
  emptyText,
  fromTicket,
  onAdd,
}: {
  dialogId: string;
  subtitle: string;
  sources: HistorySource[];
  emptyText: string;
  fromTicket: boolean;
  onAdd: (input: { author: string; text: string; woNumber: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = sources.reduce((n, s) => n + s.notes.length, 0);
  return (
    <>
      <div className="px-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <ScrollText className="size-3.5" />
          History
          {count > 0 ? <span className="mono-num text-muted">{count}</span> : null}
        </Button>
      </div>
      {open ? (
        <HistoryDialog
          dialogId={dialogId}
          subtitle={subtitle}
          sources={sources}
          emptyText={emptyText}
          fromTicket={fromTicket}
          onAdd={onAdd}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function HistoryDialog({
  dialogId,
  subtitle,
  sources,
  emptyText,
  fromTicket,
  onAdd,
  onClose,
}: {
  dialogId: string;
  subtitle: string;
  sources: HistorySource[];
  emptyText: string;
  fromTicket: boolean;
  onAdd: (input: { author: string; text: string; woNumber: string }) => void;
  onClose: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const titleId = `history-${dialogId}`;
  const writableKey = sources
    .filter((s) => !s.missing && s.woNumber)
    .map((s) => s.woNumber)
    .join("|");
  const writableIds = writableKey ? writableKey.split("|") : [];
  const [targetWo, setTargetWo] = useState(writableIds[0] ?? "");
  const grouped = fromTicket ? sources.length >= 1 : sources.length > 1;
  const noteCount = sources.reduce((n, s) => n + s.notes.length, 0);

  useEffect(() => {
    const ids = writableKey ? writableKey.split("|") : [];
    setTargetWo((cur) => (ids.includes(cur) ? cur : (ids[0] ?? "")));
  }, [writableKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [noteCount]);

  const writable = sources.filter((s) => writableIds.includes(s.woNumber));

  return createPortal(
    <div className="log-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="log-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold leading-tight">
              Hardware history
            </h2>
            <p className="truncate text-sm text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close history"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </header>
        <div ref={scroller} className="log-body">
          {sources.length === 0 ? (
            <p className="text-sm text-muted">{emptyText}</p>
          ) : grouped ? (
            sources.map((source) => (
              <section key={source.woNumber} className="log-source-block">
                <div className="log-source">
                  {source.missing ? (
                    <span>{displayWo(source.woNumber)}</span>
                  ) : (
                    <Link to="/work-orders/$woNumber" params={{ woNumber: source.woNumber }}>
                      {displayWo(source.woNumber)}
                    </Link>
                  )}
                  {source.part ? <span>{source.part}</span> : null}
                  {source.missing ? <span className="log-missing">not on the board</span> : null}
                </div>
                <NoteEntries
                  notes={source.notes}
                  emptyText={
                    source.missing
                      ? "This work order is not on the board yet."
                      : "Nothing logged on this work order yet."
                  }
                />
              </section>
            ))
          ) : (
            <NoteEntries notes={sources[0]?.notes ?? []} emptyText={emptyText} />
          )}
        </div>
        <div className="log-add">
          {writable.length ? (
            <>
              <p className="mb-2 text-xs text-muted">
                Lines are stamped with time and whoever is in Notes as. They are never overwritten.
                {fromTicket
                  ? writable.length > 1
                    ? " A line from this ticket is saved on the consumed work order you pick."
                    : " A line from this ticket is saved on the consumed work order."
                  : ""}
              </p>
              {writable.length > 1 ? (
                <label className="log-target">
                  <span>Log against</span>
                  <select
                    value={targetWo}
                    onChange={(e) => setTargetWo(e.target.value)}
                    aria-label="Work order to log against"
                  >
                    {writable.map((s) => (
                      <option key={s.woNumber} value={s.woNumber}>
                        {displayWo(s.woNumber)}
                        {s.part ? ` · ${s.part}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <NoteComposer
                placeholder="What did you do or find?"
                onAdd={(n) => {
                  if (!targetWo) return;
                  onAdd({ ...n, woNumber: targetWo });
                }}
              />
            </>
          ) : (
            <p className="text-xs text-muted">
              {sources.length
                ? "Those consumed work orders are not on the board yet, so nothing can be logged here."
                : "List a consumed work order on this ticket first. History lives on those WOs."}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function HoldReasonDialog({
  woNumber,
  part,
  onConfirm,
  onClose,
}: {
  woNumber: string;
  part?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const titleId = `hold-${woNumber}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function submit() {
    const text = reason.trim();
    if (!text) return;
    onConfirm(text);
  }

  return createPortal(
    <div className="log-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="log-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold leading-tight">
              Put on hold
            </h2>
            <p className="truncate text-sm text-muted">
              WO {woNumber}
              {part ? ` · ${part}` : ""} — stays on the build list; dates skip it until it is pending or active again.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cancel hold"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="p-4">
          <label className="qt-field">
            <span>Why is it on hold?</span>
            <textarea
              className="cell-area qt-area"
              rows={4}
              autoFocus
              value={reason}
              placeholder="Waiting for parts, artwork, customer…"
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" disabled={!reason.trim()} onClick={submit}>
              On hold
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NoteEntries({ notes, emptyText }: { notes: Note[]; emptyText: string }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {notes.map((note, i) => (
        <li
          key={`${note.date}-${i}`}
          className="rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2"
        >
          <p className="text-xs text-muted">
            {formatStamp(note.date)}
            {note.author ? ` · ${note.author}` : ""}
          </p>
          <p className="text-sm">{note.text}</p>
        </li>
      ))}
    </ul>
  );
}

function NoteComposer({
  placeholder,
  onAdd,
  inCell = false,
}: {
  placeholder: string;
  onAdd: (input: { author: string; text: string }) => void;
  inCell?: boolean;
}) {
  const { author } = useAuthor();
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({ author, text: trimmed });
    setText("");
  }

  if (inCell) {
    return (
      <textarea
        value={text}
        rows={2}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") {
            setText("");
            e.currentTarget.blur();
          }
        }}
        className="cell-area note-stack-add"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        className="h-10 flex-1 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm"
      />
      <Button type="button" size="sm" onClick={submit} disabled={!text.trim()}>
        Add
      </Button>
    </div>
  );
}
