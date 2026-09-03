import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as SHEET_SPECS, i as SCHEMA_DOC } from "./types-CcVUDIXB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/load-B7vJGd6w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fileToPayload(file) {
	const name = file.name;
	if (/\.xlsx$/i.test(name) || file.type.includes("spreadsheet")) {
		const buf = new Uint8Array(await file.arrayBuffer());
		let binary = "";
		for (let i = 0; i < buf.length; i += 1) binary += String.fromCharCode(buf[i]);
		return {
			name,
			kind: "xlsx",
			content: btoa(binary)
		};
	}
	return {
		name,
		kind: "csv",
		content: await file.text()
	};
}
function LoadScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	const [report, setReport] = (0, import_react.useState)(null);
	const [dragOn, setDragOn] = (0, import_react.useState)(false);
	const [wipeArmed, setWipeArmed] = (0, import_react.useState)(false);
	async function ingest(list) {
		const files = [...list].filter((f) => /\.(csv|xlsx|txt)$/i.test(f.name));
		if (!files.length) return;
		const payloads = await Promise.all(files.map(fileToPayload));
		mut.loadSheet.mutate(payloads, { onSuccess: (result) => setReport(result.report) });
	}
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Load & download" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Load & download",
			hint: "Download today’s CSVs, or a blank template, then drop the filled files back here. You can also drop the Build Component Lookup workbook and build reports (WO / serial / part columns).",
			actions: !wipeArmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "danger",
				onClick: () => setWipeArmed(true),
				children: "Blank database…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "danger",
					disabled: mut.wipe.isPending,
					onClick: () => {
						mut.wipe.mutate(void 0, { onSuccess: () => {
							setReport(null);
							setWipeArmed(false);
							toast.success("Database blanked");
						} });
					},
					children: mut.wipe.isPending ? "Wiping…" : "Yes, delete everything"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setWipeArmed(false),
					children: "Cancel"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Download current data"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Live rows from the database. The zip has every table plus the structure notes. If the zip is blocked, use a single table below."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/export.zip",
							download: "CE-Master-csv.zip",
							children: "Download CSV (all files)"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/floor-database.txt",
							download: "CE-Master-database.txt",
							children: "Database structure"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: SHEET_SPECS.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `/dump/${spec.key}`,
							download: `${spec.key}.csv`,
							children: [spec.key, ".csv"]
						})
					}, spec.key))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Templates"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Blank headings plus a few sample rows, not your live shop."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						SHEET_SPECS.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `/blank/${spec.key}`,
								download: `${spec.key}-template.csv`,
								children: spec.key
							})
						}, spec.key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/Build_Component_Lookup.xlsx",
								download: true,
								children: "Build component lookup"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/443_Build_Report.xlsx",
								download: true,
								children: "Sample build report"
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: `load-drop ${dragOn ? "is-on" : ""}`,
			onDragOver: (e) => {
				e.preventDefault();
				setDragOn(true);
			},
			onDragLeave: () => setDragOn(false),
			onDrop: (e) => {
				e.preventDefault();
				setDragOn(false);
				ingest(e.dataTransfer.files);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: ".csv,.xlsx,.txt",
					multiple: true,
					className: "sr-only",
					onChange: (e) => {
						if (e.target.files) ingest(e.target.files);
						e.target.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Drop CSV or Excel files to load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: mut.loadSheet.isPending ? "Loading…" : "Workbooks, CSVs, the component lookup, and build reports (WO / serial / part). Existing rows update; new rows add."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5 rounded-[var(--radius-md)] border border-danger/30 bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Blank the database"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Use this after a bad load. Download a copy first if you might need it. Wipes jobs, sales, parts, tickets and history for everyone on CE Master."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: !wipeArmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "danger",
						onClick: () => setWipeArmed(true),
						children: "Blank database…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "danger",
						disabled: mut.wipe.isPending,
						onClick: () => {
							mut.wipe.mutate(void 0, { onSuccess: () => {
								setReport(null);
								setWipeArmed(false);
								toast.success("Database blanked");
							} });
						},
						children: mut.wipe.isPending ? "Wiping…" : "Yes, delete everything"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setWipeArmed(false),
						children: "Cancel"
					})] })
				})
			]
		}),
		report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-[var(--radius-md)] border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-sm font-semibold",
					children: "Last load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-1 text-sm",
					children: [
						Object.keys({
							...report.inserted,
							...report.updated,
							...report.skipped
						}).length === 0 && report.errors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "Nothing to load."
						}) : null,
						Object.entries(report.inserted).map(([k, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							k,
							": ",
							n,
							" added"
						] }, `i-${k}`)),
						Object.entries(report.updated).map(([k, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							k,
							": ",
							n,
							" updated"
						] }, `u-${k}`)),
						Object.entries(report.skipped).map(([k, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-muted",
							children: [
								k,
								": ",
								n,
								" already there"
							]
						}, `s-${k}`))
					]
				}),
				report.errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 text-sm text-danger",
					children: report.errors.map((err, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						err.sheet,
						err.row ? ` ${err.row}` : "",
						": ",
						err.message
					] }, i))
				}) : null
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Database structure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Yes — the CSV files are the live rows. This is the table layout they sit on. Same text as the Database structure download and as _database.txt inside the zip."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "schema-doc mt-3",
					children: SCHEMA_DOC
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 lg:grid-cols-2",
			children: SHEET_SPECS.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-md)] border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-mono text-sm font-semibold",
						children: spec.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: spec.help
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-xs text-faint",
						children: spec.columns.join(" · ")
					})
				]
			}, spec.key))
		})
	] });
}
var SplitComponent = LoadScreen;
//#endregion
export { SplitComponent as component };
