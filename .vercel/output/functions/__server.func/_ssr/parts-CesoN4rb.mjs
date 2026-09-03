import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { k as hoursToDays } from "./types-CcVUDIXB.mjs";
import { i as Trash2, n as Upload } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as LoadingTable, K as ErrorBanner, Y as ScreenHeader } from "./router-I7tyG22E.mjs";
import { i as useFloorMutations, r as useFloor, t as Button } from "./queries-vxOhnUUD.mjs";
import { a as TextCell, n as CheckCell } from "./cells-BYPIsEx7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parts-CesoN4rb.js
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
function BuildLookupEditor({ state }) {
	const mut = useFloorMutations();
	const spec = state.buildSpec;
	const [q, setQ] = (0, import_react.useState)("");
	const [draftComp, setDraftComp] = (0, import_react.useState)("");
	const [draftBatt, setDraftBatt] = (0, import_react.useState)("");
	const [draftPart, setDraftPart] = (0, import_react.useState)("");
	const products = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set([...Object.keys(spec.map), ...state.parts.map((p) => p.partNumber)]);
		const needle = q.trim().toLowerCase();
		return [...set].filter((p) => needle ? p.toLowerCase().includes(needle) : true).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
	}, [
		spec.map,
		state.parts,
		q
	]);
	const shown = q.trim() ? products : products.filter((p) => (spec.map[p] ?? []).length > 0);
	const rows = shown.length ? shown : products.slice(0, 40);
	async function upload(list) {
		const files = [...list].filter((f) => /\.(xlsx|csv)$/i.test(f.name));
		if (!files.length) return;
		const payloads = await Promise.all(files.map(fileToPayload));
		mut.loadSheet.mutate(payloads, { onSuccess: (result) => {
			const n = (result.report.inserted.build_components ?? 0) + (result.report.updated.build_component_lookup ?? 0);
			if (result.report.errors.length) toast.error(`Lookup loaded with ${result.report.errors.length} problem(s)`);
			else toast.success(n ? "Component lookup updated" : "File loaded");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: "Build component lookup"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted",
					children: "X means that field is recorded on the work order. Upload the Excel lookup, or tick cells here. PCB columns ask for a serial/lot; assemblies ask for a WO or part."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/Build_Component_Lookup.xlsx",
							download: true,
							children: "Example file"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }),
							"Upload lookup",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".xlsx,.csv",
								className: "sr-only",
								onChange: (e) => {
									if (e.target.files) upload(e.target.files);
									e.target.value = "";
								}
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-[var(--radius-md)] border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold",
						children: "Batteries"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm text-muted",
						children: "Dropdown on every build record. N/A is fine."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [spec.batteries.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "build-chip",
							children: [code, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex size-7 items-center justify-center text-muted hover:text-danger",
								"aria-label": `Remove ${code}`,
								onClick: () => mut.removeBattery.mutate(code),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							})]
						}, code)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-40 items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
								value: draftBatt,
								placeholder: "BE.D2",
								live: true,
								onSave: setDraftBatt
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								disabled: !draftBatt.trim(),
								onClick: () => {
									mut.addBattery.mutate(draftBatt.trim(), { onSuccess: () => setDraftBatt("") });
								},
								children: "Add"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-end gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Filter products",
						className: "h-10 min-w-48 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-48 flex-1 items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftPart,
							placeholder: "Add product row (exact part number)",
							live: true,
							onSave: setDraftPart
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !draftPart.trim() || !spec.components[0],
							onClick: () => {
								const part = draftPart.trim();
								const first = spec.components[0];
								if (!first) return;
								mut.setPartComponent.mutate({
									partNumber: part,
									componentKey: first.key,
									required: true
								}, { onSuccess: () => setDraftPart("") });
							},
							children: "Add product"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-48 flex-1 items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftComp,
							placeholder: "New component column",
							live: true,
							onSave: setDraftComp
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !draftComp.trim(),
							onClick: () => {
								mut.addComponent.mutate(draftComp.trim(), { onSuccess: () => setDraftComp("") });
							},
							children: "Add column"
						})]
					})
				]
			}),
			spec.components.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Upload the lookup workbook to fill the matrix, or add a column above."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sheet-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "sheet lookup-matrix min-w-[48rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "sticky-col",
						children: "Product"
					}), spec.components.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
						title: c.kind,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-36 whitespace-normal text-left",
								children: c.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-muted hover:text-danger",
								"aria-label": `Remove ${c.label}`,
								onClick: () => mut.removeComponent.mutate(c.key),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs font-normal uppercase tracking-wide text-faint",
							children: c.kind
						})]
					}, c.key))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: spec.components.length + 1,
						className: "px-3 py-3 text-sm text-muted",
						children: "No products yet."
					}) }) : rows.map((part) => {
						const required = new Set(spec.map[part] ?? []);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "sticky-col font-mono text-sm",
							children: part
						}), spec.components.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
							checked: required.has(c.key),
							label: `${part} ${c.label}`,
							onSave: (on) => mut.setPartComponent.mutate({
								partNumber: part,
								componentKey: c.key,
								required: on
							})
						}) }, c.key))] }, part);
					}) })]
				})
			})
		]
	});
}
function PartsScreen() {
	const floor = useFloor();
	const mut = useFloorMutations();
	const [q, setQ] = (0, import_react.useState)("");
	const [draftNumber, setDraftNumber] = (0, import_react.useState)("");
	const [draftName, setDraftName] = (0, import_react.useState)("");
	const [draftLogger, setDraftLogger] = (0, import_react.useState)("");
	const [draftType, setDraftType] = (0, import_react.useState)("");
	const [draftCounts, setDraftCounts] = (0, import_react.useState)("");
	const [draftDirectional, setDraftDirectional] = (0, import_react.useState)(false);
	const [draftHours, setDraftHours] = (0, import_react.useState)("");
	const [draftNotes, setDraftNotes] = (0, import_react.useState)("");
	const [draftActive, setDraftActive] = (0, import_react.useState)(true);
	const parts = (0, import_react.useMemo)(() => {
		const list = floor.data?.parts ?? [];
		const needle = q.trim().toLowerCase();
		if (!needle) return list;
		return list.filter((p) => [
			p.partNumber,
			p.name,
			p.logger,
			p.type,
			p.notes
		].some((v) => v.toLowerCase().includes(needle)));
	}, [floor.data?.parts, q]);
	if (floor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, { title: "Parts spec" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingTable, {})] });
	if (floor.error || !floor.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBanner, { message: floor.error instanceof Error ? floor.error.message : "Could not load CE Master." });
	function addPart() {
		const hours = Number.parseFloat(draftHours);
		mut.addPart.mutate({
			partNumber: draftNumber.trim(),
			name: draftName,
			logger: draftLogger,
			type: draftType,
			counts: draftCounts,
			directional: draftDirectional,
			buildTimeHours: Number.isFinite(hours) ? hours : 0,
			notes: draftNotes,
			active: draftActive
		}, { onSuccess: () => {
			setDraftNumber("");
			setDraftName("");
			setDraftLogger("");
			setDraftType("");
			setDraftCounts("");
			setDraftDirectional(false);
			setDraftHours("");
			setDraftNotes("");
			setDraftActive(true);
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Parts spec",
			hint: "Every catalogue field is editable. Below that, the build component lookup says which PCB, battery and assembly fields to record on each part.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search parts",
				className: "h-10 w-full min-w-48 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm sm:w-64"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sheet-wrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "sheet min-w-[72rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Part number" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Logger" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Counts" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-16",
						children: "Dir."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Build hours" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-16",
						children: "Active"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [parts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.partNumber,
						mono: true,
						onSave: (v) => {
							const next = v.trim();
							if (!next || next === part.partNumber) return;
							mut.patchPart.mutate({
								partNumber: part.partNumber,
								nextPartNumber: next
							});
						}
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.name,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							name: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.logger,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							logger: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.type,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							type: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.counts,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							counts: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
						checked: part.directional,
						label: `Directional ${part.partNumber}`,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							directional: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						type: "number",
						min: 0,
						value: String(part.buildTimeHours),
						mono: true,
						onSave: (v) => {
							const n = Number.parseFloat(v);
							if (Number.isFinite(n) && n >= 0) mut.patchPart.mutate({
								partNumber: part.partNumber,
								buildTimeHours: n
							});
						}
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono-num block px-2.5 text-muted",
						children: hoursToDays(part.buildTimeHours)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
						value: part.notes,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							notes: v
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
						checked: part.active,
						label: `Active ${part.partNumber}`,
						onSave: (v) => mut.patchPart.mutate({
							partNumber: part.partNumber,
							active: v
						})
					}) })
				] }, part.partNumber)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "is-new",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftNumber,
							placeholder: "Part number",
							mono: true,
							onSave: setDraftNumber
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftName,
							placeholder: "Name",
							onSave: setDraftName
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftLogger,
							placeholder: "Logger",
							onSave: setDraftLogger
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftType,
							placeholder: "Type",
							onSave: setDraftType
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftCounts,
							placeholder: "Counts",
							onSave: setDraftCounts
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
							checked: draftDirectional,
							label: "Directional new part",
							onSave: setDraftDirectional
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							type: "number",
							min: 0,
							value: draftHours,
							mono: true,
							placeholder: "Hours",
							onSave: setDraftHours
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextCell, {
							value: draftNotes,
							placeholder: "Notes",
							onSave: setDraftNotes
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
								checked: draftActive,
								label: "Active new part",
								onSave: setDraftActive
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: addPart,
								disabled: !draftNumber.trim(),
								children: "Add"
							})]
						}) })
					]
				})] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildLookupEditor, { state: floor.data })
	] });
}
var SplitComponent = PartsScreen;
//#endregion
export { SplitComponent as component };
