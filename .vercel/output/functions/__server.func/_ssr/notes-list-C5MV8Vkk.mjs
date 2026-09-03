import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { l as require_react_dom, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { E as formatStamp } from "./types-CcVUDIXB.mjs";
import { r as displayWo, t as displayPt } from "./prospect-VcFT87HP.mjs";
import { a as ScrollText, t as X } from "../_libs/lucide-react.mjs";
import { Z as useAuthor } from "./router-I7tyG22E.mjs";
import { t as Button } from "./queries-vxOhnUUD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notes-list-C5MV8Vkk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function NotesList({ notes, onAdd, placeholder = "Add a note", emptyText = "No notes yet." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteEntries, {
			notes,
			emptyText
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteComposer, {
			placeholder,
			onAdd
		})]
	});
}
function HistoryButton({ woNumber, part, notes, onAdd }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTrigger, {
		dialogId: woNumber,
		subtitle: `WO ${woNumber}${part ? ` · ${part}` : ""}`,
		sources: [{
			woNumber,
			part: part ?? "",
			notes
		}],
		emptyText: "Nothing logged yet. Add the first line below.",
		fromTicket: false,
		onAdd: (n) => onAdd({
			author: n.author,
			text: n.text
		})
	});
}
function PtHistoryButton({ prospectNumber, sources, onAdd }) {
	const labels = sources.map((s) => {
		const wo = displayWo(s.woNumber);
		return s.part ? `${wo} · ${s.part}` : wo;
	});
	const subtitle = sources.length ? `${displayPt(prospectNumber)} · from consumed ${labels.join(", ")}` : `${displayPt(prospectNumber)} · no consumed WOs listed`;
	const emptyText = sources.length ? "Nothing logged on the consumed work orders yet." : "Add a consumed work order on this ticket, then open history again.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTrigger, {
		dialogId: `pt-${prospectNumber}`,
		subtitle,
		sources,
		emptyText,
		fromTicket: true,
		onAdd
	});
}
function HistoryTrigger({ dialogId, subtitle, sources, emptyText, fromTicket, onAdd }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const count = sources.reduce((n, s) => n + s.notes.length, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-1.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: "sm",
			variant: "outline",
			"aria-haspopup": "dialog",
			"aria-expanded": open,
			onClick: () => setOpen(true),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-3.5" }),
				"History",
				count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono-num text-muted",
					children: count
				}) : null
			]
		})
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryDialog, {
		dialogId,
		subtitle,
		sources,
		emptyText,
		fromTicket,
		onAdd,
		onClose: () => setOpen(false)
	}) : null] });
}
function HistoryDialog({ dialogId, subtitle, sources, emptyText, fromTicket, onAdd, onClose }) {
	const scroller = (0, import_react.useRef)(null);
	const titleId = `history-${dialogId}`;
	const writableKey = sources.filter((s) => !s.missing && s.woNumber).map((s) => s.woNumber).join("|");
	const writableIds = writableKey ? writableKey.split("|") : [];
	const [targetWo, setTargetWo] = (0, import_react.useState)(writableIds[0] ?? "");
	const grouped = fromTicket ? sources.length >= 1 : sources.length > 1;
	const noteCount = sources.reduce((n, s) => n + s.notes.length, 0);
	(0, import_react.useEffect)(() => {
		const ids = writableKey ? writableKey.split("|") : [];
		setTargetWo((cur) => ids.includes(cur) ? cur : ids[0] ?? "");
	}, [writableKey]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [noteCount]);
	const writable = sources.filter((s) => writableIds.includes(s.woNumber));
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "log-overlay",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			className: "log-panel",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: titleId,
							className: "text-base font-semibold leading-tight",
							children: "Hardware history"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted",
							children: subtitle
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close history",
						onClick: onClose,
						className: "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-2 hover:text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: scroller,
					className: "log-body",
					children: sources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: emptyText
					}) : grouped ? sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "log-source-block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "log-source",
							children: [
								source.missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: displayWo(source.woNumber) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/work-orders/$woNumber",
									params: { woNumber: source.woNumber },
									children: displayWo(source.woNumber)
								}),
								source.part ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: source.part }) : null,
								source.missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "log-missing",
									children: "not on the board"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteEntries, {
							notes: source.notes,
							emptyText: source.missing ? "This work order is not on the board yet." : "Nothing logged on this work order yet."
						})]
					}, source.woNumber)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteEntries, {
						notes: sources[0]?.notes ?? [],
						emptyText
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "log-add",
					children: writable.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 text-xs text-muted",
							children: ["Lines are stamped with time and whoever is in Notes as. They are never overwritten.", fromTicket ? writable.length > 1 ? " A line from this ticket is saved on the consumed work order you pick." : " A line from this ticket is saved on the consumed work order." : ""]
						}),
						writable.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "log-target",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Log against" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: targetWo,
								onChange: (e) => setTargetWo(e.target.value),
								"aria-label": "Work order to log against",
								children: writable.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: s.woNumber,
									children: [displayWo(s.woNumber), s.part ? ` · ${s.part}` : ""]
								}, s.woNumber))
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteComposer, {
							placeholder: "What did you do or find?",
							onAdd: (n) => {
								if (!targetWo) return;
								onAdd({
									...n,
									woNumber: targetWo
								});
							}
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: sources.length ? "Those consumed work orders are not on the board yet, so nothing can be logged here." : "List a consumed work order on this ticket first. History lives on those WOs."
					})
				})
			]
		})
	}), document.body);
}
function HoldReasonDialog({ woNumber, part, onConfirm, onClose }) {
	const [reason, setReason] = (0, import_react.useState)("");
	const titleId = `hold-${woNumber}`;
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "log-overlay",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			className: "log-panel",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: titleId,
						className: "text-base font-semibold leading-tight",
						children: "Put on hold"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-sm text-muted",
						children: [
							"WO ",
							woNumber,
							part ? ` · ${part}` : "",
							" — stays on the build list; dates skip it until it is pending or active again."
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Cancel hold",
					onClick: onClose,
					className: "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-2 hover:text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "qt-field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Why is it on hold?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "cell-area qt-area",
						rows: 4,
						autoFocus: true,
						value: reason,
						placeholder: "Waiting for parts, artwork, customer…",
						onChange: (e) => setReason(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
						}
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						disabled: !reason.trim(),
						onClick: submit,
						children: "On hold"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onClose,
						children: "Cancel"
					})]
				})]
			})]
		})
	}), document.body);
}
function NoteEntries({ notes, emptyText }) {
	if (notes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: emptyText
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1.5",
		children: notes.map((note, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [formatStamp(note.date), note.author ? ` · ${note.author}` : ""]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: note.text
			})]
		}, `${note.date}-${i}`))
	});
}
function NoteComposer({ placeholder, onAdd, inCell = false }) {
	const { author } = useAuthor();
	const [text, setText] = (0, import_react.useState)("");
	function submit() {
		const trimmed = text.trim();
		if (!trimmed) return;
		onAdd({
			author,
			text: trimmed
		});
		setText("");
	}
	if (inCell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		value: text,
		rows: 2,
		placeholder,
		"aria-label": placeholder,
		onChange: (e) => setText(e.target.value),
		onBlur: submit,
		onKeyDown: (e) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				submit();
			}
			if (e.key === "Escape") {
				setText("");
				e.currentTarget.blur();
			}
		},
		className: "cell-area note-stack-add"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 sm:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: text,
			onChange: (e) => setText(e.target.value),
			onKeyDown: (e) => {
				if (e.key === "Enter") submit();
			},
			placeholder,
			className: "h-10 flex-1 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "sm",
			onClick: submit,
			disabled: !text.trim(),
			children: "Add"
		})]
	});
}
//#endregion
export { PtHistoryButton as i, HoldReasonDialog as n, NotesList as r, HistoryButton as t };
