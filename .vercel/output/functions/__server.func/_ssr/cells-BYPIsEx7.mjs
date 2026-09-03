import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { X as cn } from "./router-I7tyG22E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cells-BYPIsEx7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TextCell({ value, onSave, placeholder, type = "text", className, mono, danger, warn, min, live, inputMode }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => setDraft(value), [value]);
	function commit() {
		if (draft !== value) onSave(draft);
	}
	function onKey(e) {
		if (e.key === "Enter") e.currentTarget.blur();
		if (e.key === "Escape") {
			setDraft(value);
			e.currentTarget.blur();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		value: draft,
		min,
		inputMode,
		placeholder,
		onChange: (e) => {
			setDraft(e.target.value);
			if (live) onSave(e.target.value);
		},
		onBlur: commit,
		onKeyDown: onKey,
		className: cn("cell-input", mono && "mono-num", danger && "is-danger", warn && "is-warn", className)
	});
}
function AreaCell({ value, onSave, placeholder, className }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => setDraft(value), [value]);
	function commit() {
		if (draft !== value) onSave(draft);
	}
	function onKey(e) {
		if (e.key === "Escape") {
			setDraft(value);
			e.currentTarget.blur();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		value: draft,
		placeholder,
		rows: 3,
		onChange: (e) => setDraft(e.target.value),
		onBlur: commit,
		onKeyDown: onKey,
		className: cn("cell-area", className)
	});
}
function SelectCell({ value, options, onSave, allowEmpty, emptyLabel = "—", danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		value,
		onChange: (e) => {
			if (e.target.value !== value) onSave(e.target.value);
		},
		className: cn("cell-select", danger && "is-danger"),
		children: [allowEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			children: emptyLabel
		}) : null, options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: opt.value,
			children: opt.label
		}, opt.value))]
	});
}
function CheckCell({ checked, onSave, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: "cell-check",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			"aria-label": label,
			onChange: (e) => onSave(e.target.checked),
			className: "size-4 accent-primary"
		})
	});
}
function ComboCell({ value, onSave, options, placeholder }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const wrapRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => setDraft(value), [value]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = draft.trim().toLowerCase();
		if (!q) return options.slice(0, 12);
		return options.filter((o) => o.value.toLowerCase().includes(q) || o.hint && o.hint.toLowerCase().includes(q)).slice(0, 12);
	}, [draft, options]);
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (!wrapRef.current?.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	function commit(next) {
		setDraft(next);
		setOpen(false);
		if (next !== value) onSave(next);
	}
	function onKey(e) {
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
	function onChange(e) {
		setDraft(e.target.value);
		setOpen(true);
		setActive(0);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: draft,
			placeholder,
			onChange,
			onFocus: () => {},
			onClick: () => setOpen(true),
			onBlur: () => {
				if (draft !== value) onSave(draft);
				setOpen(false);
			},
			onKeyDown: onKey,
			className: "cell-input",
			autoComplete: "off"
		}), open && filtered.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "suggest-list",
			children: filtered.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: cn("suggest-item", i === active && "is-active"),
				onMouseDown: (e) => {
					e.preventDefault();
					commit(opt.value);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: opt.value
				}), opt.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 text-muted",
					children: opt.hint
				}) : null]
			}, opt.value))
		}) : null]
	});
}
function partOptions(parts) {
	return parts.filter((p) => p.active).map((p) => ({
		value: p.partNumber,
		hint: p.name
	}));
}
function woOptions(workOrders) {
	return workOrders.map((wo) => ({
		value: wo.woNumber,
		hint: `${wo.part} · ${wo.status}`
	}));
}
/** WOs that can supply this part — pending/active first. Empty part → all jobs. */
function woOptionsForPart(workOrders, part) {
	const needle = part.trim().toLowerCase();
	const matching = needle ? workOrders.filter((w) => w.part.trim().toLowerCase() === needle) : workOrders;
	const pool = matching.length ? matching : workOrders;
	const rank = (w) => w.status === "pending" || w.status === "active" ? 0 : 1;
	return [...pool].sort((a, b) => {
		const r = rank(a) - rank(b);
		if (r !== 0) return r;
		return a.woNumber.localeCompare(b.woNumber, void 0, { numeric: true });
	}).map((wo) => ({
		value: wo.woNumber,
		hint: `${wo.part} × ${wo.qty} · ${wo.status}${wo.assignedBuild ? ` · ${wo.assignedBuild}` : ""}`
	}));
}
//#endregion
export { TextCell as a, woOptionsForPart as c, SelectCell as i, CheckCell as n, partOptions as o, ComboCell as r, woOptions as s, AreaCell as t };
