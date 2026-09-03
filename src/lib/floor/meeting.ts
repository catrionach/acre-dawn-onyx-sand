import { addCalendarDays, formatShopWeekday, todayIso } from "./dates";
import { displayPt, displayTsk, displayWo } from "./prospect";
import { parseWoNumbers } from "./lookups";
import { BUILDERS, type FloorState, type Note } from "./types";

export const MEETING_LOOKBACK_DAYS = 21;
const QT_AUTO = /^QT-\d+\s+(opened|raised and closed)\b/i;

export type MeetingLine = {
  kind: "wo" | "task" | "pt";
  id: string;
  job: string;
  part: string;
  notes: string[];
};

export type MeetingPerson = {
  who: string;
  lines: MeetingLine[];
};

export type MeetingNote = {
  time: string;
  author: string;
  text: string;
};

export type MeetingNoteGroup = {
  woNumber: string;
  part: string;
  who: string;
  notes: MeetingNote[];
};

export type MeetingTicket = {
  ticketNumber: string;
  workOrderNumber: string;
  part: string;
  title: string;
  status: "open" | "closed";
  who: string;
};

export type MeetingClosed = {
  woNumber: string;
  part: string;
  qty: number;
  who: string;
  label: "Closed" | "Cancelled";
};

export type MeetingDay = {
  date: string;
  notes: MeetingNoteGroup[];
  tickets: MeetingTicket[];
  closed: MeetingClosed[];
};

export type MeetingBrief = {
  today: string;
  days: MeetingDay[];
  /** Active jobs, used as the backbone of each person's day list. */
  roster: MeetingPerson[];
};

function dayKey(stamp: string | null | undefined): string | null {
  if (!stamp) return null;
  const day = stamp.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function timeOf(stamp: string): string {
  if (stamp.length >= 16 && stamp[10] === "T") return stamp.slice(11, 16);
  return "";
}

function isAutoQtNote(note: Note): boolean {
  return QT_AUTO.test(note.text.trim());
}

function emptyDay(date: string): MeetingDay {
  return { date, notes: [], tickets: [], closed: [] };
}

function personLabel(who: string): string {
  return who.trim() || "Unassigned";
}

function compareWho(a: string, b: string): number {
  const ia = BUILDERS.indexOf(a as (typeof BUILDERS)[number]);
  const ib = BUILDERS.indexOf(b as (typeof BUILDERS)[number]);
  const sa = a === "Unassigned" || a === "" ? 100 : ia === -1 ? 50 : ia;
  const sb = b === "Unassigned" || b === "" ? 100 : ib === -1 ? 50 : ib;
  if (sa !== sb) return sa - sb;
  return a.localeCompare(b);
}

function emptyLine(
  kind: MeetingLine["kind"],
  id: string,
  job: string,
  part: string,
  notes: string[] = [],
): MeetingLine {
  return { kind, id, job, part: part.trim(), notes: [...notes] };
}

function splitBuildNotes(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isBoardListed(status: string, dateStarted: string | null): boolean {
  if (status === "active") return true;
  return status === "on_hold" && Boolean(dateStarted);
}

function holdTag(status: string): string[] {
  return status === "on_hold" ? ["On hold"] : [];
}

export function buildMeetingBrief(state: FloorState, today = todayIso()): MeetingBrief {
  const since = addCalendarDays(today, -MEETING_LOOKBACK_DAYS);
  const days = new Map<string, MeetingDay>();
  const ensure = (date: string) => {
    let day = days.get(date);
    if (!day) {
      day = emptyDay(date);
      days.set(date, day);
    }
    return day;
  };
  ensure(today);

  const noteBags = new Map<string, MeetingNoteGroup>();
  const pushHistoryNote = (wo: (typeof state.workOrders)[number], note: Note) => {
    if (isAutoQtNote(note)) return;
    const date = dayKey(note.date);
    if (!date || date < since || date > today) return;
    const bagKey = `${date}|${wo.woNumber}`;
    let group = noteBags.get(bagKey);
    if (!group) {
      group = {
        woNumber: wo.woNumber,
        part: wo.part,
        who: personLabel(wo.assignedBuild),
        notes: [],
      };
      noteBags.set(bagKey, group);
      ensure(date).notes.push(group);
    }
    if (group.notes.some((n) => n.text === note.text.trim() && n.author === note.author.trim())) {
      return;
    }
    group.notes.push({
      time: timeOf(note.date),
      author: note.author.trim(),
      text: note.text.trim(),
    });
  };

  for (const wo of state.workOrders) {
    for (const note of wo.hardwareHistory) pushHistoryNote(wo, note);
  }

  for (const group of noteBags.values()) {
    group.notes.sort((a, b) => a.time.localeCompare(b.time) || a.text.localeCompare(b.text));
  }
  for (const day of days.values()) {
    day.notes.sort((a, b) => a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true }));
  }

  const woWho = new Map(state.workOrders.map((w) => [w.woNumber, personLabel(w.assignedBuild)]));
  for (const ticket of state.tickets) {
    const date = dayKey(ticket.dateOpened);
    if (!date || date < since || date > today) continue;
    const wos = parseWoNumbers(ticket.workOrderNumber);
    const who = wos.length
      ? wos.map((n) => woWho.get(n)).find(Boolean) || "Unassigned"
      : "Unassigned";
    ensure(date).tickets.push({
      ticketNumber: ticket.ticketNumber,
      workOrderNumber: ticket.workOrderNumber,
      part: ticket.part,
      title: ticket.title.trim(),
      status: ticket.status,
      who,
    });
  }
  for (const day of days.values()) {
    day.tickets.sort((a, b) =>
      a.ticketNumber.localeCompare(b.ticketNumber, undefined, { numeric: true }),
    );
  }

  for (const wo of state.workOrders) {
    if (wo.status !== "closed") continue;
    const date = dayKey(wo.dateClosed);
    if (!date || date < since || date > today) continue;
    ensure(date).closed.push({
      woNumber: wo.woNumber,
      part: wo.part,
      qty: wo.qty,
      who: personLabel(wo.assignedBuild),
      label: "Closed",
    });
  }
  for (const day of days.values()) {
    day.closed.sort((a, b) => a.woNumber.localeCompare(b.woNumber, undefined, { numeric: true }));
  }

  const dayList = [...days.values()]
    .filter((d) => d.date === today || d.notes.length || d.tickets.length || d.closed.length)
    .sort((a, b) => b.date.localeCompare(a.date));

  const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
  const byTask = new Map(state.buildTasks.map((t) => [t.id, t]));
  const byPt = new Map(state.problemTickets.map((p) => [p.id, p]));
  const linesByWho = new Map<string, MeetingLine[]>();
  const seenOnWho = new Map<string, Set<string>>();
  const pushLine = (who: string, line: MeetingLine) => {
    const key = personLabel(who);
    const list = linesByWho.get(key) ?? [];
    const seen = seenOnWho.get(key) ?? new Set<string>();
    const id = `${line.kind}:${line.id}`;
    if (seen.has(id)) return;
    seen.add(id);
    list.push(line);
    linesByWho.set(key, list);
    seenOnWho.set(key, seen);
  };

  const queued = [...state.buildQueue].sort((a, b) => {
    const who = compareWho(a.assignedBuild, b.assignedBuild);
    if (who) return who;
    return a.position - b.position || a.id - b.id;
  });
  for (const entry of queued) {
    if (entry.kind === "wo") {
      const wo = byWo.get(entry.woNumber);
      if (!wo || !isBoardListed(wo.status, wo.dateStarted)) continue;
      pushLine(
        entry.assignedBuild,
        emptyLine("wo", wo.woNumber, displayWo(wo.woNumber), wo.part, [
          ...holdTag(wo.status),
          ...splitBuildNotes(wo.buildOrderNotes),
        ]),
      );
    } else if (entry.kind === "pt") {
      const pt = entry.problemId != null ? byPt.get(entry.problemId) : undefined;
      if (!pt || !isBoardListed(pt.status, pt.dateStarted)) continue;
      const notes = [
        ...holdTag(pt.status),
        ...splitBuildNotes(pt.notes),
      ];
      pushLine(
        entry.assignedBuild,
        emptyLine(
          "pt",
          pt.prospectNumber,
          displayPt(pt.prospectNumber),
          pt.part || pt.title || "Problem",
          notes,
        ),
      );
    } else {
      const task = entry.taskId != null ? byTask.get(entry.taskId) : undefined;
      if (!task || !isBoardListed(task.status, task.dateStarted)) continue;
      pushLine(
        entry.assignedBuild,
        emptyLine("task", task.taskNumber, displayTsk(task.taskNumber), task.title || "Task", [
          ...holdTag(task.status),
          ...splitBuildNotes(task.buildOrderNotes),
        ]),
      );
    }
  }

  const whoSet = new Set<string>([...BUILDERS, ...linesByWho.keys()]);
  const roster: MeetingPerson[] = [...whoSet]
    .filter((w) => w !== "Unassigned" || (linesByWho.get(w)?.length ?? 0) > 0)
    .sort(compareWho)
    .map((who) => ({
      who,
      lines: linesByWho.get(who) ?? [],
    }));

  return { today, days: dayList, roster };
}

export function meetingDay(brief: MeetingBrief, date: string): MeetingDay {
  return brief.days.find((d) => d.date === date) ?? emptyDay(date);
}

function findOrAdd(
  list: MeetingLine[],
  kind: MeetingLine["kind"],
  id: string,
  job: string,
  part: string,
): MeetingLine {
  let line = list.find((l) => l.kind === kind && l.id === id);
  if (!line) {
    line = emptyLine(kind, id, job, part);
    list.push(line);
  } else if (!line.part && part) {
    line.part = part;
  }
  return line;
}

/** Active jobs plus that day's notes, QTs and closures, grouped by person. */
export function personDay(brief: MeetingBrief, date: string): MeetingPerson[] {
  const day = meetingDay(brief, date);
  const byWho = new Map<string, MeetingLine[]>();
  const listFor = (who: string) => {
    const key = personLabel(who);
    let list = byWho.get(key);
    if (!list) {
      list = [];
      byWho.set(key, list);
    }
    return list;
  };

  for (const person of brief.roster) {
    byWho.set(
      person.who,
      person.lines.map((l) => ({ ...l, notes: [...l.notes] })),
    );
  }

  const appendOnWo = (woNumber: string, part: string, fallbackWho: string, text: string) => {
    if (!text) return;
    let hit = false;
    for (const list of byWho.values()) {
      const line = list.find((l) => l.kind === "wo" && l.id === woNumber);
      if (!line) continue;
      if (!line.notes.includes(text)) line.notes.push(text);
      if (!line.part && part) line.part = part;
      hit = true;
    }
    if (hit) return;
    const line = findOrAdd(
      listFor(fallbackWho),
      "wo",
      woNumber,
      displayWo(woNumber),
      part,
    );
    if (!line.notes.includes(text)) line.notes.push(text);
  };

  for (const group of day.notes) {
    for (const note of group.notes) {
      const text = formatNoteText(note.text);
      if (text) appendOnWo(group.woNumber, group.part, group.who, text);
    }
  }

  for (const ticket of day.tickets) {
    const wos = parseWoNumbers(ticket.workOrderNumber);
    const title = ticket.title ? `  ${ticket.title}` : "";
    const text = `${ticket.ticketNumber}${title}  (${ticket.status})`;
    if (wos.length) {
      for (const n of wos) {
        appendOnWo(n, ticket.part, ticket.who || "Unassigned", text);
      }
    } else {
      const line = findOrAdd(
        listFor(ticket.who || "Unassigned"),
        "wo",
        ticket.ticketNumber,
        ticket.ticketNumber,
        ticket.part || ticket.title,
      );
      if (!line.notes.includes(text)) line.notes.push(`QT ${ticket.status}`);
    }
  }

  for (const job of day.closed) {
    appendOnWo(job.woNumber, job.part, job.who, job.label);
  }

  const names = new Set<string>([...BUILDERS, ...byWho.keys()]);
  return [...names]
    .filter((w) => w !== "Unassigned" || (byWho.get(w)?.length ?? 0) > 0)
    .sort(compareWho)
    .map((who) => ({
      who,
      lines: byWho.get(who) ?? [],
    }));
}

function formatNoteText(text: string): string {
  const status = text.match(/^Status:\s*(.+)$/i);
  if (status) return `→ ${status[1]}`;
  const passed = text.match(/^Passed from .+ to (.+)$/i);
  if (passed) return `Passed to ${passed[1]}`;
  return text;
}

function formatLine(line: MeetingLine): string {
  const head = line.part.trim() ? `${line.job} (${line.part.trim()})` : line.job;
  const notes = line.notes.filter(Boolean).join("; ");
  return notes ? `  ${head}: ${notes}` : `  ${head}`;
}

export function formatMeetingText(brief: MeetingBrief, date = brief.today): string {
  const people = personDay(brief, date);
  const lines: string[] = ["CE Master — production meeting", formatShopWeekday(date), ""];
  for (const person of people) {
    lines.push(person.who);
    if (!person.lines.length) lines.push("  (none)");
    else for (const line of person.lines) lines.push(formatLine(line));
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

/** HTML copy for Word / Outlook — same job / part / notes columns as the screen. */
export function formatMeetingHtml(brief: MeetingBrief, date = brief.today): string {
  const people = personDay(brief, date);
  const blocks: string[] = [
    `<p><strong>CE Master — production meeting</strong><br>${escapeHtml(formatShopWeekday(date))}</p>`,
  ];
  for (const person of people) {
    blocks.push(`<p style="margin:12px 0 4px"><strong>${escapeHtml(person.who)}</strong></p>`);
    if (!person.lines.length) {
      blocks.push(`<p style="margin:0 0 8px 16px;color:#666">(none)</p>`);
      continue;
    }
    const rows = person.lines
      .map((line) => {
        const head = line.part.trim()
          ? `${escapeHtml(line.job)} (${escapeHtml(line.part.trim())})`
          : escapeHtml(line.job);
        const notes = line.notes.filter(Boolean).map(escapeHtml).join("; ");
        const body = notes ? `${head}: ${notes}` : head;
        return `<p style="margin:0 0 4px 16px">${body}</p>`;
      })
      .join("");
    blocks.push(rows);
  }
  return `<div style="font-family:Calibri,Segoe UI,sans-serif;font-size:14px;line-height:1.4;color:#111">${blocks.join("")}</div>`;
}
