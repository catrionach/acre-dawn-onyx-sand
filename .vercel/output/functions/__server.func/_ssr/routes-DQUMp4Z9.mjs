import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient } from "../_libs/react+tanstack__react-query.mjs";
import { K as todayIso, M as isPastDate, T as formatShopWeekday, Z as earliestNeedForWo, c as TASK_STATUS_OPTIONS, h as addCalendarDays, k as hoursToDays, lt as sourcesFromConsumed, m as WO_STATUS_OPTIONS, n as BUILDER_OPTIONS, rt as parseWoNumbers, t as BUILDERS, ut as ticketTouchesWo, w as formatShopDate } from "./types-CcVUDIXB.mjs";
import { a as prospectProblemUrl, n as displayTsk, r as displayWo, t as displayPt } from "./prospect-VcFT87HP.mjs";
import { c as GripVertical, d as ChevronUp, f as ChevronRight, h as Check, i as Trash2, l as ExternalLink, m as ChevronDown, o as RefreshCw, p as ChevronLeft, s as Plus, u as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader, Z as useAuthor } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, n as FLOOR_KEY, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, i as SelectCell, o as partOptions, r as ComboCell, t as AreaCell } from "./cells-BYPIsEx7.mjs";
import { a as WoId, i as TskId, t as PtId } from "./id-stack-BLCvv55O.mjs";
import { i as PtHistoryButton, n as HoldReasonDialog, t as HistoryButton } from "./notes-list-C5MV8Vkk.mjs";
import { t as WhoNextCell } from "./who-next-Da37XhAq.mjs";
import { t as ConsumedWoCell } from "./consumed-wo-Cvf63nYH.mjs";
import { a as queueItemKey, i as jobHours, n as buildFill, r as estimatePersonQueue, t as BuildRecordPanel } from "./build-record-panel-C2LhHbx2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DQUMp4Z9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QT_AUTO = /^QT-\d+\s+(opened|raised and closed)\b/i;
function dayKey(stamp) {
	if (!stamp) return null;
	const day = stamp.slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}
function timeOf(stamp) {
	if (stamp.length >= 16 && stamp[10] === "T") return stamp.slice(11, 16);
	return "";
}
function isAutoQtNote(note) {
	return QT_AUTO.test(note.text.trim());
}
function emptyDay(date) {
	return {
		date,
		notes: [],
		tickets: [],
		closed: []
	};
}
function personLabel(who) {
	return who.trim() || "Unassigned";
}
function compareWho(a, b) {
	const ia = BUILDERS.indexOf(a);
	const ib = BUILDERS.indexOf(b);
	const sa = a === "Unassigned" || a === "" ? 100 : ia === -1 ? 50 : ia;
	const sb = b === "Unassigned" || b === "" ? 100 : ib === -1 ? 50 : ib;
	if (sa !== sb) return sa - sb;
	return a.localeCompare(b);
}
function emptyLine(kind, id, job, part, notes = []) {
	return {
		kind,
		id,
		job,
		part: part.trim(),
		notes: [...notes]
	};
}
function splitBuildNotes(raw) {
	return raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
function isBoardListed$1(status, dateStarted) {
	if (status === "active") return true;
	return status === "on_hold" && Boolean(dateStarted);
}
function holdTag(status) {
	return status === "on_hold" ? ["On hold"] : [];
}
function buildMeetingBrief(state, today = todayIso()) {
	const since = addCalendarDays(today, -21);
	const days = /* @__PURE__ */ new Map();
	const ensure = (date) => {
		let day = days.get(date);
		if (!day) {
			day = emptyDay(date);
			days.set(date, day);
		}
		return day;
	};
	ensure(today);
	const noteBags = /* @__PURE__ */ new Map();
	const pushHistoryNote = (wo, note) => {
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
				notes: []
			};
			noteBags.set(bagKey, group);
			ensure(date).notes.push(group);
		}
		if (group.notes.some((n) => n.text === note.text.trim() && n.author === note.author.trim())) return;
		group.notes.push({
			time: timeOf(note.date),
			author: note.author.trim(),
			text: note.text.trim()
		});
	};
	for (const wo of state.workOrders) for (const note of wo.hardwareHistory) pushHistoryNote(wo, note);
	for (const group of noteBags.values()) group.notes.sort((a, b) => a.time.localeCompare(b.time) || a.text.localeCompare(b.text));
	for (const day of days.values()) day.notes.sort((a, b) => a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true }));
	const woWho = new Map(state.workOrders.map((w) => [w.woNumber, personLabel(w.assignedBuild)]));
	for (const ticket of state.tickets) {
		const date = dayKey(ticket.dateOpened);
		if (!date || date < since || date > today) continue;
		const wos = parseWoNumbers(ticket.workOrderNumber);
		const who = wos.length ? wos.map((n) => woWho.get(n)).find(Boolean) || "Unassigned" : "Unassigned";
		ensure(date).tickets.push({
			ticketNumber: ticket.ticketNumber,
			workOrderNumber: ticket.workOrderNumber,
			part: ticket.part,
			title: ticket.title.trim(),
			status: ticket.status,
			who
		});
	}
	for (const day of days.values()) day.tickets.sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber, void 0, { numeric: true }));
	for (const wo of state.workOrders) {
		if (wo.status !== "closed") continue;
		const date = dayKey(wo.dateClosed);
		if (!date || date < since || date > today) continue;
		ensure(date).closed.push({
			woNumber: wo.woNumber,
			part: wo.part,
			qty: wo.qty,
			who: personLabel(wo.assignedBuild),
			label: "Closed"
		});
	}
	for (const day of days.values()) day.closed.sort((a, b) => a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true }));
	const dayList = [...days.values()].filter((d) => d.date === today || d.notes.length || d.tickets.length || d.closed.length).sort((a, b) => b.date.localeCompare(a.date));
	const byWo = new Map(state.workOrders.map((w) => [w.woNumber, w]));
	const byTask = new Map(state.buildTasks.map((t) => [t.id, t]));
	const byPt = new Map(state.problemTickets.map((p) => [p.id, p]));
	const linesByWho = /* @__PURE__ */ new Map();
	const seenOnWho = /* @__PURE__ */ new Map();
	const pushLine = (who, line) => {
		const key = personLabel(who);
		const list = linesByWho.get(key) ?? [];
		const seen = seenOnWho.get(key) ?? /* @__PURE__ */ new Set();
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
	for (const entry of queued) if (entry.kind === "wo") {
		const wo = byWo.get(entry.woNumber);
		if (!wo || !isBoardListed$1(wo.status, wo.dateStarted)) continue;
		pushLine(entry.assignedBuild, emptyLine("wo", wo.woNumber, displayWo(wo.woNumber), wo.part, [...holdTag(wo.status), ...splitBuildNotes(wo.buildOrderNotes)]));
	} else if (entry.kind === "pt") {
		const pt = entry.problemId != null ? byPt.get(entry.problemId) : void 0;
		if (!pt || !isBoardListed$1(pt.status, pt.dateStarted)) continue;
		const notes = [...holdTag(pt.status), ...splitBuildNotes(pt.notes)];
		pushLine(entry.assignedBuild, emptyLine("pt", pt.prospectNumber, displayPt(pt.prospectNumber), pt.part || pt.title || "Problem", notes));
	} else {
		const task = entry.taskId != null ? byTask.get(entry.taskId) : void 0;
		if (!task || !isBoardListed$1(task.status, task.dateStarted)) continue;
		pushLine(entry.assignedBuild, emptyLine("task", task.taskNumber, displayTsk(task.taskNumber), task.title || "Task", [...holdTag(task.status), ...splitBuildNotes(task.buildOrderNotes)]));
	}
	return {
		today,
		days: dayList,
		roster: [.../* @__PURE__ */ new Set([...BUILDERS, ...linesByWho.keys()])].filter((w) => w !== "Unassigned" || (linesByWho.get(w)?.length ?? 0) > 0).sort(compareWho).map((who) => ({
			who,
			lines: linesByWho.get(who) ?? []
		}))
	};
}
function meetingDay(brief, date) {
	return brief.days.find((d) => d.date === date) ?? emptyDay(date);
}
function findOrAdd(list, kind, id, job, part) {
	let line = list.find((l) => l.kind === kind && l.id === id);
	if (!line) {
		line = emptyLine(kind, id, job, part);
		list.push(line);
	} else if (!line.part && part) line.part = part;
	return line;
}
/** Active jobs plus that day's notes, QTs and closures, grouped by person. */
function personDay(brief, date) {
	const day = meetingDay(brief, date);
	const byWho = /* @__PURE__ */ new Map();
	const listFor = (who) => {
		const key = personLabel(who);
		let list = byWho.get(key);
		if (!list) {
			list = [];
			byWho.set(key, list);
		}
		return list;
	};
	for (const person of brief.roster) byWho.set(person.who, person.lines.map((l) => ({
		...l,
		notes: [...l.notes]
	})));
	const appendOnWo = (woNumber, part, fallbackWho, text) => {
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
		const line = findOrAdd(listFor(fallbackWho), "wo", woNumber, displayWo(woNumber), part);
		if (!line.notes.includes(text)) line.notes.push(text);
	};
	for (const group of day.notes) for (const note of group.notes) {
		const text = formatNoteText(note.text);
		if (text) appendOnWo(group.woNumber, group.part, group.who, text);
	}
	for (const ticket of day.tickets) {
		const wos = parseWoNumbers(ticket.workOrderNumber);
		const title = ticket.title ? `  ${ticket.title}` : "";
		const text = `${ticket.ticketNumber}${title}  (${ticket.status})`;
		if (wos.length) for (const n of wos) appendOnWo(n, ticket.part, ticket.who || "Unassigned", text);
		else {
			const line = findOrAdd(listFor(ticket.who || "Unassigned"), "wo", ticket.ticketNumber, ticket.ticketNumber, ticket.part || ticket.title);
			if (!line.notes.includes(text)) line.notes.push(`QT ${ticket.status}`);
		}
	}
	for (const job of day.closed) appendOnWo(job.woNumber, job.part, job.who, job.label);
	return [.../* @__PURE__ */ new Set([...BUILDERS, ...byWho.keys()])].filter((w) => w !== "Unassigned" || (byWho.get(w)?.length ?? 0) > 0).sort(compareWho).map((who) => ({
		who,
		lines: byWho.get(who) ?? []
	}));
}
function formatNoteText(text) {
	const status = text.match(/^Status:\s*(.+)$/i);
	if (status) return `→ ${status[1]}`;
	const passed = text.match(/^Passed from .+ to (.+)$/i);
	if (passed) return `Passed to ${passed[1]}`;
	return text;
}
function formatLine(line) {
	const head = line.part.trim() ? `${line.job} (${line.part.trim()})` : line.job;
	const notes = line.notes.filter(Boolean).join("; ");
	return notes ? `  ${head}: ${notes}` : `  ${head}`;
}
function formatMeetingText(brief, date = brief.today) {
	const people = personDay(brief, date);
	const lines = [
		"CE Master — production meeting",
		formatShopWeekday(date),
		""
	];
	for (const person of people) {
		lines.push(person.who);
		if (!person.lines.length) lines.push("  (none)");
		else for (const line of person.lines) lines.push(formatLine(line));
		lines.push("");
	}
	return `${lines.join("\n").trimEnd()}\n`;
}
function escapeHtml(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/** HTML copy for Word / Outlook — same job / part / notes columns as the screen. */
function formatMeetingHtml(brief, date = brief.today) {
	const people = personDay(brief, date);
	const blocks = [`<p><strong>CE Master — production meeting</strong><br>${escapeHtml(formatShopWeekday(date))}</p>`];
	for (const person of people) {
		blocks.push(`<p style="margin:12px 0 4px"><strong>${escapeHtml(person.who)}</strong></p>`);
		if (!person.lines.length) {
			blocks.push(`<p style="margin:0 0 8px 16px;color:#666">(none)</p>`);
			continue;
		}
		const rows = person.lines.map((line) => {
			const head = line.part.trim() ? `${escapeHtml(line.job)} (${escapeHtml(line.part.trim())})` : escapeHtml(line.job);
			const notes = line.notes.filter(Boolean).map(escapeHtml).join("; ");
			return `<p style="margin:0 0 4px 16px">${notes ? `${head}: ${notes}` : head}</p>`;
		}).join("");
		blocks.push(rows);
	}
	return `<div style="font-family:Calibri,Segoe UI,sans-serif;font-size:14px;line-height:1.4;color:#111">${blocks.join("")}</div>`;
}
function MeetingSummary({ state }) {
	const today = todayIso();
	const minDate = addCalendarDays(today, -21);
	const [picked, setPicked] = (0, import_react.useState)(today);
	const selected = picked > today ? today : picked < minDate ? minDate : picked;
	const brief = (0, import_react.useMemo)(() => buildMeetingBrief(state, today), [state, today]);
	const people = (0, import_react.useMemo)(() => personDay(brief, selected), [brief, selected]);
	const text = (0, import_react.useMemo)(() => formatMeetingText(brief, selected), [brief, selected]);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [showText, setShowText] = (0, import_react.useState)(false);
	const qc = useQueryClient();
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	async function refresh() {
		setRefreshing(true);
		try {
			await qc.refetchQueries({ queryKey: FLOOR_KEY });
			toast.success("Meeting notes refreshed");
		} finally {
			setRefreshing(false);
		}
	}
	function pick(date) {
		if (date < minDate || date > today) return;
		setPicked(date);
	}
	async function copy() {
		const html = formatMeetingHtml(brief, selected);
		try {
			if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) await navigator.clipboard.write([new ClipboardItem({
				"text/html": new Blob([html], { type: "text/html" }),
				"text/plain": new Blob([text], { type: "text/plain" })
			})]);
			else await navigator.clipboard.writeText(text);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "meeting-brief",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "person-head",
					children: "Production meeting"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted",
					children: "Per person, same order as the tables above. Each job is WO (part) or PT (title), then its build order notes. Refresh reloads the live queue, including pre-pass jobs."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "meeting-day-pick",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							"aria-label": "Previous day",
							disabled: selected <= minDate,
							onClick: () => pick(addCalendarDays(selected, -1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "meeting-date-label",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Meeting day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								className: "meeting-date-input",
								value: selected,
								min: minDate,
								max: today,
								onChange: (e) => pick(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							"aria-label": "Next day",
							disabled: selected >= today,
							onClick: () => pick(addCalendarDays(selected, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
						}),
						selected !== today ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => pick(today),
							children: "Today"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							disabled: refreshing,
							onClick: () => void refresh(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${refreshing ? "animate-spin" : ""}` }), "Refresh"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							onClick: () => void copy(),
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "meeting-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "meeting-block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "meeting-label",
						children: [formatShopWeekday(selected), selected === today ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "meeting-today",
							children: "Today"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "meeting-people",
						children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "meeting-person",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "meeting-who",
								children: person.who
							}), person.lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "meeting-empty",
								children: "None"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "meeting-rows",
								children: person.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "meeting-row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobLink, { line }),
										line.part.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "meeting-part",
											children: [
												" (",
												line.part.trim(),
												")"
											]
										}) : null,
										line.notes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "meeting-line-notes",
											children: [": ", line.notes.filter(Boolean).join("; ")]
										}) : null
									]
								}, `${line.kind}-${line.id}`))
							})]
						}, person.who))
					})]
				})
			}),
			showText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "meeting-fallback",
				readOnly: true,
				value: text,
				onFocus: (e) => e.currentTarget.select()
			}) : null
		]
	});
}
function JobLink({ line }) {
	if (line.kind === "wo") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/work-orders/$woNumber",
		params: { woNumber: line.id },
		className: "meeting-link",
		children: line.job
	});
	if (line.kind === "pt") {
		const href = prospectProblemUrl(line.id);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "id-stack-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/problems",
				search: { pt: line.id },
				className: "meeting-link",
				children: line.job
			}), href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer",
				className: "prospect-ext",
				title: "Open in Prospect",
				"aria-label": `Open ${line.job} in Prospect`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })
			}) : null]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/tasks",
		className: "meeting-link",
		children: line.job
	});
}
function ProspectStatusNow({ pt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: pt.prospectStatus ? "prospect-status-now" : "prospect-status-now is-empty",
		children: pt.prospectStatus || "No status note"
	});
}
var STATUS_OPTS = WO_STATUS_OPTIONS;
var TASK_OPTS = TASK_STATUS_OPTIONS;
var WHO_OPTS = BUILDER_OPTIONS;
var PEOPLE = ["Simon", "David"];
function isBoardListed(status, dateStarted) {
	if (status === "active") return true;
	return status === "on_hold" && Boolean(dateStarted);
}
function isActiveEntry(entry, state) {
	if (entry.kind === "wo") {
		const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
		return isBoardListed(wo?.status, wo?.dateStarted);
	}
	if (entry.kind === "pt") {
		const p = state.problemTickets.find((x) => x.id === entry.problemId);
		return isBoardListed(p?.status, p?.dateStarted);
	}
	const t = state.buildTasks.find((x) => x.id === entry.taskId);
	return isBoardListed(t?.status, t?.dateStarted);
}
function isPendingEntry(entry, state) {
	if (entry.kind === "wo") {
		const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
		if (!wo) return false;
		if (wo.status === "pending") return true;
		return wo.status === "on_hold" && !wo.dateStarted;
	}
	if (entry.kind === "pt") {
		const p = state.problemTickets.find((x) => x.id === entry.problemId);
		if (!p || p.status === "done" || isBoardListed(p.status, p.dateStarted)) return false;
		return true;
	}
	const t = state.buildTasks.find((x) => x.id === entry.taskId);
	if (!t || t.status === "done" || isBoardListed(t.status, t.dateStarted)) return false;
	return true;
}
function BuildOrderScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	const { author } = useAuthor();
	const [holdWo, setHoldWo] = (0, import_react.useState)(null);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "Build order",
		hint: "Active jobs per person on top. Pending for everyone together at the bottom."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loaded, {
		state: floor.data,
		mut,
		author,
		holdWo,
		setHoldWo
	}), holdWo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldReasonDialog, {
		woNumber: holdWo,
		part: floor.data.workOrders.find((w) => w.woNumber === holdWo)?.part,
		onClose: () => setHoldWo(null),
		onConfirm: (reason) => {
			mut.patchWo.mutate({
				woNumber: holdWo,
				status: "on_hold",
				holdReason: reason,
				historyAuthor: author
			});
			setHoldWo(null);
		}
	}) : null] });
}
function Loaded({ state, mut, author, setHoldWo }) {
	const extras = [...new Set(state.buildQueue.map((e) => e.assignedBuild).filter((w) => w && !PEOPLE.includes(w)))].sort((a, b) => {
		const ia = BUILDERS.indexOf(a);
		const ib = BUILDERS.indexOf(b);
		const sa = ia === -1 ? 50 : ia;
		const sb = ib === -1 ? 50 : ib;
		if (sa !== sb) return sa - sb;
		return a.localeCompare(b);
	});
	const sections = [...PEOPLE, ...extras];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Build order",
			hint: "Active jobs per person on top. Pending for everyone together at the bottom."
		}),
		sections.map((who) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonBoard, {
			who,
			title: who,
			mode: "active",
			state,
			mut,
			author,
			setHoldWo
		}, who)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonBoard, {
			who: "pending",
			title: "Pending",
			mode: "pending",
			state,
			mut,
			author,
			setHoldWo
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingSummary, { state })
	] });
}
function PersonBoard({ who, title, mode, state, mut, author, setHoldWo }) {
	const today = todayIso();
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [dropIndex, setDropIndex] = (0, import_react.useState)(null);
	const [draftTitle, setDraftTitle] = (0, import_react.useState)("");
	const [draftHours, setDraftHours] = (0, import_react.useState)("");
	const [draftWho, setDraftWho] = (0, import_react.useState)("Simon");
	const [draftPt, setDraftPt] = (0, import_react.useState)("");
	const [draftPtTitle, setDraftPtTitle] = (0, import_react.useState)("");
	const [draftPtPart, setDraftPtPart] = (0, import_react.useState)("");
	const [draftPtHours, setDraftPtHours] = (0, import_react.useState)("");
	const [draftPtWho, setDraftPtWho] = (0, import_react.useState)("Simon");
	const drag = (0, import_react.useRef)(null);
	const entries = (0, import_react.useMemo)(() => {
		const all = [...state.buildQueue].sort((a, b) => {
			const ra = PEOPLE.indexOf(a.assignedBuild);
			const rb = PEOPLE.indexOf(b.assignedBuild);
			const sa = ra === -1 ? 99 : ra;
			const sb = rb === -1 ? 99 : rb;
			if (sa !== sb) return sa - sb;
			return a.position - b.position || a.id - b.id;
		});
		if (mode === "active") return all.filter((e) => e.assignedBuild === who && isActiveEntry(e, state));
		return all.filter((e) => isPendingEntry(e, state));
	}, [
		state,
		who,
		mode
	]);
	const estimates = (0, import_react.useMemo)(() => {
		const out = /* @__PURE__ */ new Map();
		const names = [...new Set(state.buildQueue.map((e) => e.assignedBuild))];
		for (const name of names) {
			const person = state.buildQueue.filter((e) => e.assignedBuild === name).sort((a, b) => a.position - b.position || a.id - b.id);
			const est = estimatePersonQueue(person, state.workOrders, state.buildTasks, state.parts, today, state.problemTickets);
			for (const [k, v] of est) out.set(k, v);
		}
		return out;
	}, [
		state.buildQueue,
		state.workOrders,
		state.buildTasks,
		state.problemTickets,
		state.parts,
		today
	]);
	const keys = entries.map(queueItemKey);
	const lastVisibleIndex = entries.length - 1;
	function commit(id, targetIndex) {
		const next = placeAtIndex(keys, id, targetIndex);
		if (next) mut.reorder.mutate({
			who: mode === "pending" ? "pending" : who,
			keys: next
		});
	}
	function gapFromPoint(clientX, clientY) {
		const row = document.elementFromPoint(clientX, clientY)?.closest("tr[data-qid]");
		if (!(row instanceof HTMLElement)) return null;
		if (mode !== "pending" && row.dataset.who !== who) return null;
		const targetId = row.dataset.qid;
		if (!targetId) return null;
		const targetIdx = keys.indexOf(targetId);
		if (targetIdx < 0) return null;
		const rect = row.getBoundingClientRect();
		return clientY < rect.top + rect.height / 2 ? targetIdx : targetIdx + 1;
	}
	function onHandlePointerDown(e, id) {
		if (e.button !== 0) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		const from = keys.indexOf(id);
		drag.current = {
			id,
			gap: from
		};
		setDragId(id);
		setDropIndex(from);
	}
	function onHandlePointerMove(e) {
		if (!drag.current) return;
		const gap = gapFromPoint(e.clientX, e.clientY);
		if (gap == null) return;
		drag.current.gap = gap;
		setDropIndex(gap);
	}
	function onHandlePointerUp() {
		const session = drag.current;
		drag.current = null;
		setDragId(null);
		setDropIndex(null);
		if (!session || session.gap == null) return;
		const from = keys.indexOf(session.id);
		commit(session.id, gapToIndex(from, session.gap));
	}
	function addTask() {
		const title = draftTitle.trim();
		if (!title) return;
		const days = Number.parseFloat(draftHours);
		mut.addTask.mutate({
			title,
			hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
			assignedBuild: mode === "pending" ? draftWho : who
		}, { onSuccess: () => {
			setDraftTitle("");
			setDraftHours("");
		} });
	}
	async function addPt() {
		const number = draftPt.trim();
		if (!number) return;
		const title = draftPtTitle.trim();
		const days = Number.parseFloat(draftPtHours);
		mut.addPt.mutate({
			prospectNumber: number,
			title: title || void 0,
			part: draftPtPart.trim() || void 0,
			hours: Number.isFinite(days) && days >= 0 ? days * 8 : 0,
			assignedBuild: mode === "pending" ? draftPtWho : who
		}, { onSuccess: () => {
			setDraftPt("");
			setDraftPtTitle("");
			setDraftPtPart("");
			setDraftPtHours("");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "person-board",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "person-head",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: dragId ? "sheet-wrap is-reordering" : "sheet-wrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "sheet",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "sticky-col queue-head",
						children: "Queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Job / task" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "qty-col",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Who next" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Need date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Est days" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Est complete" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build order notes" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes to production" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build record" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hardware history" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-16" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 15,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-6 text-sm text-muted",
						children: mode === "active" ? `No active job for ${title}.` : "No pending work."
					})
				}) }) : entries.map((entry, index) => {
					const key = queueItemKey(entry);
					const est = estimates.get(key);
					const isDrag = dragId === key;
					const dropBefore = Boolean(dragId) && dropIndex === index && !isDrag;
					const dropAfter = Boolean(dragId) && !isDrag && index === lastVisibleIndex && dropIndex != null && dropIndex > lastVisibleIndex;
					if (entry.kind === "task") {
						const task = state.buildTasks.find((t) => t.id === entry.taskId);
						if (!task) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
							task,
							qid: key,
							who: entry.assignedBuild,
							index,
							last: index === lastVisibleIndex,
							estComplete: est ? formatShopDate(est.complete) : "—",
							isDrag,
							dropBefore,
							dropAfter,
							onHandlePointerDown,
							onHandlePointerMove,
							onHandlePointerUp,
							onMove: (n) => commit(key, n),
							mut
						}, key);
					}
					if (entry.kind === "pt") {
						const pt = state.problemTickets.find((p) => p.id === entry.problemId);
						if (!pt) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtRow, {
							pt,
							qid: key,
							who: entry.assignedBuild,
							index,
							last: index === lastVisibleIndex,
							state,
							estComplete: est ? formatShopDate(est.complete) : "—",
							isDrag,
							dropBefore,
							dropAfter,
							onHandlePointerDown,
							onHandlePointerMove,
							onHandlePointerUp,
							onMove: (n) => commit(key, n),
							mut
						}, key);
					}
					const wo = state.workOrders.find((w) => w.woNumber === entry.woNumber);
					if (!wo) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoRow, {
						wo,
						qid: key,
						who: entry.assignedBuild,
						index,
						last: index === lastVisibleIndex,
						state,
						est,
						today,
						isDrag,
						dropBefore,
						dropAfter,
						onHandlePointerDown,
						onHandlePointerMove,
						onHandlePointerUp,
						onMove: (n) => commit(key, n),
						mut,
						author,
						setHoldWo
					}, key);
				}), mode === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "is-new",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2.5 py-2 font-mono text-sm font-semibold text-muted",
							children: "TSK"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftTitle,
							placeholder: "Task — e.g. mow the lawn",
							live: true,
							onSave: setDraftTitle
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
							value: draftWho,
							options: WHO_OPTS,
							onSave: setDraftWho
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							type: "number",
							min: 0,
							value: draftHours,
							placeholder: "Days",
							mono: true,
							live: true,
							onSave: setDraftHours
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 6 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-1 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: addTask,
								disabled: !draftTitle.trim(),
								children: "Add TSK"
							})
						}) })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "is-new",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 px-2.5 font-mono text-sm font-semibold text-muted",
								children: "PT-"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
									value: draftPt,
									placeholder: "1842",
									mono: true,
									live: true,
									onSave: (v) => setDraftPt(v)
								})
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
							value: draftPtPart,
							options: partOptions(state.parts),
							placeholder: "Part",
							onSave: setDraftPtPart
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
							value: draftPtWho,
							options: WHO_OPTS,
							onSave: setDraftPtWho
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							type: "number",
							min: 0,
							value: draftPtHours,
							placeholder: "Days",
							mono: true,
							live: true,
							onSave: setDraftPtHours
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 6 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-1 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: () => void addPt(),
								disabled: !draftPt.trim() || mut.addPt.isPending,
								children: "Add PT"
							})
						}) })
					]
				})] }) : null] })]
			})
		})]
	});
}
function WoRow({ wo, qid, who, index, last, state, est, today, isDrag, dropBefore, dropAfter, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp, onMove, mut, author, setHoldWo }) {
	const need = earliestNeedForWo(wo.woNumber, state.salesLines, state.salesOrders);
	const needRed = isPastDate(need, today) && (wo.status === "pending" || wo.status === "active");
	const held = wo.status === "on_hold";
	const prePass = who !== wo.assignedBuild;
	const [recordOpen, setRecordOpen] = (0, import_react.useState)(false);
	const fill = buildFill(state, wo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		"data-qid": qid,
		"data-who": who,
		className: isDrag ? "is-dragging" : dropBefore ? "is-drop-before" : dropAfter ? "is-drop-after" : held ? "is-held" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "sticky-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueControls, {
					qid,
					index,
					last,
					isDrag,
					onHandlePointerDown,
					onHandlePointerMove,
					onHandlePointerUp,
					onMove
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WoId, {
				woNumber: wo.woNumber,
				compact: true
			}), prePass ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "prepass-tag",
				children: ["Pre-pass from ", wo.assignedBuild || "Unassigned"]
			}) : null] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 py-2 font-medium",
				children: wo.part
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "qty-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "text",
					value: String(wo.qty),
					mono: true,
					inputMode: "numeric",
					onSave: (v) => {
						const n = Number.parseInt(v.replace(/,/g, ""), 10);
						if (Number.isFinite(n) && n >= 1) mut.patchWo.mutate({
							woNumber: wo.woNumber,
							qty: n
						});
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: wo.assignedBuild,
				options: WHO_OPTS,
				allowEmpty: true,
				emptyLabel: "—",
				onSave: (v) => mut.patchWo.mutate({
					woNumber: wo.woNumber,
					assignedBuild: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhoNextCell, {
					wo,
					mut
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `block px-2.5 ${needRed ? "font-semibold text-danger" : ""}`,
				children: formatShopDate(need) || "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: wo.buildTimeHours != null ? "is-override" : void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
					type: "number",
					min: 0,
					value: hoursToDays(jobHours(wo, state.parts)),
					mono: true,
					placeholder: "Days",
					onSave: (v) => {
						if (v.trim() === "") {
							mut.patchWo.mutate({
								woNumber: wo.woNumber,
								buildTimeHours: null
							});
							return;
						}
						const days = Number.parseFloat(v);
						if (!Number.isFinite(days) || days < 0) return;
						const hours = days * 8;
						const spec = jobHours({
							...wo,
							buildTimeHours: null
						}, state.parts);
						mut.patchWo.mutate({
							woNumber: wo.woNumber,
							buildTimeHours: Math.abs(hours - spec) < .05 ? null : hours
						});
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: est ? formatShopDate(est.complete) : "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: wo.status,
				options: STATUS_OPTS,
				onSave: (v) => {
					if (v === "on_hold") setHoldWo(wo.woNumber);
					else mut.patchWo.mutate({
						woNumber: wo.woNumber,
						status: v,
						historyAuthor: author
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: wo.buildOrderNotes,
					placeholder: "Build order notes",
					onSave: (v) => mut.patchWo.mutate({
						woNumber: wo.woNumber,
						buildOrderNotes: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "whitespace-pre-wrap px-2.5 py-1.5 text-sm",
					children: wo.notesToProduction.trim() || "—"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-1.5 py-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					className: fill.total && fill.filled < fill.total ? "text-primary" : void 0,
					onClick: () => setRecordOpen((v) => !v),
					children: fill.total ? `${fill.filled}/${fill.total}` : "Record"
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "history-cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryButton, {
					woNumber: wo.woNumber,
					part: wo.part,
					notes: wo.hardwareHistory,
					onAdd: (n) => mut.woHistory.mutate({
						woNumber: wo.woNumber,
						author: n.author,
						text: n.text
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1 px-1.5 py-1",
				children: [state.tickets.filter((t) => ticketTouchesWo(t.workOrderNumber, wo.woNumber)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "ghost",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tickets/$ticketNumber",
						params: { ticketNumber: t.ticketNumber },
						children: t.ticketNumber
					})
				}, t.ticketNumber)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tickets/new",
						search: { wo: wo.woNumber },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "QT"]
					})
				})]
			}) })
		]
	}), recordOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		colSpan: 15,
		className: "bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "expand-panel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildRecordPanel, {
				wo,
				state
			})
		})
	}) }) : null] });
}
function TaskRow({ task, qid, who, index, last, estComplete, isDrag, dropBefore, dropAfter, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp, onMove, mut }) {
	const held = task.status === "on_hold" || task.status === "done";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		"data-qid": qid,
		"data-who": who,
		className: isDrag ? "is-dragging" : dropBefore ? "is-drop-before" : dropAfter ? "is-drop-after" : held ? "is-held" : "is-task",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "sticky-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueControls, {
					qid,
					index,
					last,
					isDrag,
					onHandlePointerDown,
					onHandlePointerMove,
					onHandlePointerUp,
					onMove
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TskId, { taskNumber: task.taskNumber }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				value: task.title,
				placeholder: "Task",
				onSave: (v) => mut.patchTask.mutate({
					id: task.id,
					title: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: task.assignedBuild,
				options: WHO_OPTS,
				allowEmpty: true,
				emptyLabel: "—",
				onSave: (v) => mut.patchTask.mutate({
					id: task.id,
					assignedBuild: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "number",
				min: 0,
				value: hoursToDays(task.hours),
				mono: true,
				onSave: (v) => {
					const n = Number.parseFloat(v);
					if (Number.isFinite(n) && n >= 0) mut.patchTask.mutate({
						id: task.id,
						hours: n * 8
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: estComplete
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: task.status,
				options: TASK_OPTS,
				onSave: (v) => mut.patchTask.mutate({
					id: task.id,
					status: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: task.buildOrderNotes,
					placeholder: "Build order notes",
					onSave: (v) => mut.patchTask.mutate({
						id: task.id,
						buildOrderNotes: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Remove task",
				className: "flex size-10 items-center justify-center text-muted hover:text-danger",
				onClick: () => mut.taskDelete.mutate(task.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
			}) })
		]
	});
}
function PtRow({ pt, qid, who, index, last, state, estComplete, isDrag, dropBefore, dropAfter, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp, onMove, mut }) {
	const held = pt.status === "on_hold" || pt.status === "done";
	const prePass = who !== pt.assignedBuild;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		"data-qid": qid,
		"data-who": who,
		className: isDrag ? "is-dragging" : dropBefore ? "is-drop-before" : dropAfter ? "is-drop-after" : held ? "is-held" : "is-task",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "sticky-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueControls, {
					qid,
					index,
					last,
					isDrag,
					onHandlePointerDown,
					onHandlePointerMove,
					onHandlePointerUp,
					onMove
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtId, {
					prospectNumber: pt.prospectNumber,
					compact: true
				}),
				prePass ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "prepass-tag",
					children: ["Pre-pass from ", pt.assignedBuild || "Unassigned"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProspectStatusNow, { pt })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboCell, {
				value: pt.part,
				options: partOptions(state.parts),
				placeholder: "Part",
				onSave: (v) => mut.patchPt.mutate({
					id: pt.id,
					part: v
				})
			}), pt.title.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 pb-1 text-[0.65rem] text-muted",
				children: pt.title
			}) : null] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: pt.assignedBuild,
				options: WHO_OPTS,
				allowEmpty: true,
				emptyLabel: "—",
				onSave: (v) => mut.patchPt.mutate({
					id: pt.id,
					assignedBuild: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhoNextCell, {
					pt,
					mut
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5 text-muted",
				children: "—"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
				type: "number",
				min: 0,
				value: hoursToDays(pt.hours),
				mono: true,
				onSave: (v) => {
					const n = Number.parseFloat(v);
					if (Number.isFinite(n) && n >= 0) mut.patchPt.mutate({
						id: pt.id,
						hours: n * 8
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block px-2.5",
				children: estComplete
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCell, {
				value: pt.status,
				options: TASK_OPTS,
				onSave: (v) => mut.patchPt.mutate({
					id: pt.id,
					status: v
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: pt.notes,
					placeholder: "Build order notes",
					onSave: (v) => mut.patchPt.mutate({
						id: pt.id,
						notes: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaCell, {
					value: pt.notesToProduction,
					placeholder: "Note to production",
					onSave: (v) => mut.patchPt.mutate({
						id: pt.id,
						notesToProduction: v
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "min-w-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsumedWoCell, {
					items: pt.consumed,
					state,
					onSave: (consumed) => mut.patchPt.mutate({
						id: pt.id,
						consumed
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "history-cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PtHistoryButton, {
					prospectNumber: pt.prospectNumber,
					sources: sourcesFromConsumed(pt.consumed, state.workOrders),
					onAdd: (n) => mut.woHistory.mutate({
						woNumber: n.woNumber,
						author: n.author,
						text: n.text
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Remove problem ticket",
				className: "flex size-10 items-center justify-center text-muted hover:text-danger",
				onClick: () => mut.ptDelete.mutate(pt.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
			}) })
		]
	});
}
function QueueControls({ qid, index, last, isDrag, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp, onMove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "queue-cell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Drag to reorder",
				title: "Drag to reorder",
				className: isDrag ? "queue-handle is-dragging" : "queue-handle",
				onPointerDown: (e) => onHandlePointerDown(e, qid),
				onPointerMove: onHandlePointerMove,
				onPointerUp: onHandlePointerUp,
				onPointerCancel: onHandlePointerUp,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono-num queue-num",
				children: index + 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "queue-step",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "queue-arrow",
					disabled: index === 0,
					"aria-label": "Move up",
					onClick: () => onMove(index - 1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "queue-arrow",
					disabled: last,
					"aria-label": "Move down",
					onClick: () => onMove(index + 1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })
				})]
			})
		]
	});
}
function gapToIndex(from, gap) {
	if (gap <= from) return gap;
	return gap - 1;
}
function placeAtIndex(keys, id, targetIndex) {
	const from = keys.indexOf(id);
	if (from < 0) return null;
	const clamped = Math.max(0, Math.min(targetIndex, keys.length - 1));
	if (clamped === from) return null;
	const next = keys.filter((k) => k !== id);
	next.splice(clamped, 0, id);
	return next;
}
var SplitComponent = BuildOrderScreen;
//#endregion
export { SplitComponent as component };
