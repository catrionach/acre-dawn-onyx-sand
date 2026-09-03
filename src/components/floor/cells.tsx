import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { Part, WorkOrder } from "@/lib/floor/types";

type SaveText = (value: string) => void;

export function TextCell({
  value,
  onSave,
  placeholder,
  type = "text",
  className,
  mono,
  danger,
  warn,
  min,
  live,
  inputMode,
}: {
  value: string;
  onSave: SaveText;
  placeholder?: string;
  type?: "text" | "number" | "date";
  className?: string;
  mono?: boolean;
  danger?: boolean;
  warn?: boolean;
  min?: number | string;
  live?: boolean;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  function commit() {
    if (draft !== value) onSave(draft);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setDraft(value);
      e.currentTarget.blur();
    }
  }

  return (
    <input
      type={type}
      value={draft}
      min={min}
      inputMode={inputMode}
      placeholder={placeholder}
      onChange={(e) => {
        setDraft(e.target.value);
        if (live) onSave(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={onKey}
      className={cn(
        "cell-input",
        mono && "mono-num",
        danger && "is-danger",
        warn && "is-warn",
        className,
      )}
    />
  );
}

export function AreaCell({
  value,
  onSave,
  placeholder,
  className,
}: {
  value: string;
  onSave: SaveText;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  function commit() {
    if (draft !== value) onSave(draft);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      setDraft(value);
      e.currentTarget.blur();
    }
  }

  return (
    <textarea
      value={draft}
      placeholder={placeholder}
      rows={3}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      className={cn("cell-area", className)}
    />
  );
}

export function SelectCell({
  value,
  options,
  onSave,
  allowEmpty,
  emptyLabel = "—",
  danger,
}: {
  value: string;
  options: { value: string; label: string }[];
  onSave: SaveText;
  allowEmpty?: boolean;
  emptyLabel?: string;
  danger?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value !== value) onSave(e.target.value);
      }}
      className={cn("cell-select", danger && "is-danger")}
    >
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function CheckCell({
  checked,
  onSave,
  label,
}: {
  checked: boolean;
  onSave: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="cell-check">
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onSave(e.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}

export function ComboCell({
  value,
  onSave,
  options,
  placeholder,
}: {
  value: string;
  onSave: SaveText;
  options: { value: string; hint?: string }[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(value), [value]);

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return options.slice(0, 12);
    return options
      .filter(
        (o) =>
          o.value.toLowerCase().includes(q) ||
          (o.hint && o.hint.toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [draft, options]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function commit(next: string) {
    setDraft(next);
    setOpen(false);
    if (next !== value) onSave(next);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[active]) commit(filtered[active].value);
      else commit(draft);
    } else if (e.key === "Escape") {
      setDraft(value);
      setOpen(false);
      e.currentTarget.blur();
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value);
    setOpen(true);
    setActive(0);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={draft}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => {
          /* open on click/type, not mere focus, so expand panels stay quiet */
        }}
        onClick={() => setOpen(true)}
        onBlur={() => {
          if (draft !== value) onSave(draft);
          setOpen(false);
        }}
        onKeyDown={onKey}
        className="cell-input"
        autoComplete="off"
      />
      {open && filtered.length > 0 ? (
        <div className="suggest-list">
          {filtered.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              className={cn("suggest-item", i === active && "is-active")}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(opt.value);
              }}
            >
              <span className="font-medium">{opt.value}</span>
              {opt.hint ? (
                <span className="ml-2 text-muted">{opt.hint}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function partOptions(parts: Part[]): { value: string; hint?: string }[] {
  return parts
    .filter((p) => p.active)
    .map((p) => ({
      value: p.partNumber,
      hint: p.name,
    }));
}

export function woOptions(workOrders: WorkOrder[]): { value: string; hint?: string }[] {
  return workOrders.map((wo) => ({
    value: wo.woNumber,
    hint: `${wo.part} · ${wo.status}`,
  }));
}

/** WOs that can supply this part — pending/active first. Empty part → all jobs. */
export function woOptionsForPart(
  workOrders: WorkOrder[],
  part: string,
): { value: string; hint?: string }[] {
  const needle = part.trim().toLowerCase();
  const matching = needle
    ? workOrders.filter((w) => w.part.trim().toLowerCase() === needle)
    : workOrders;
  const pool = matching.length ? matching : workOrders;
  const rank = (w: WorkOrder) => (w.status === "pending" || w.status === "active" ? 0 : 1);
  return [...pool]
    .sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      return a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true });
    })
    .map((wo) => ({
      value: wo.woNumber,
      hint: `${wo.part} × ${wo.qty} · ${wo.status}${wo.assignedBuild ? ` · ${wo.assignedBuild}` : ""}`,
    }));
}
