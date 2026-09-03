import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as removeBuildBattery, B as updateSalesOrder, C as importFloor, D as passWorkOrder, E as passProblemTicket, F as setWorkOrderConsumed, G as writeWorkOrderConsumedHistory, H as updateUnit, I as updateBuildTask, L as updatePart, M as reorderBuildOrder, N as setPartComponentRequired, O as prePassProblemTicket, P as setWorkOrderBuildField, R as updateProblemTicket, S as despatchSalesOrder, T as loadFloor, U as updateWorkOrder, V as updateTicket, W as wipeFloor, X as cn, _ as createWorkOrder, a as addBuildBattery, b as deleteSalesLine, c as addSalesLine, d as addUnitNote, f as createBuildTask, g as createTicket, h as createSalesOrder, j as removeBuildComponent, k as prePassWorkOrder, l as addTicketNote, m as createProblemTicket, o as addBuildComponent, p as createPart, s as addHardwareHistory, u as addUnit, v as deleteBuildTask, w as importSagePack, x as despatchLine, y as deleteProblemTicket, z as updateSalesLine } from "./router-I7tyG22E.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-vxOhnUUD.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90 rounded-[var(--radius-sm)]",
			outline: "border border-border bg-surface text-ink hover:bg-surface-2 rounded-[var(--radius-sm)]",
			ghost: "text-ink hover:bg-surface-2 rounded-[var(--radius-sm)]",
			danger: "bg-danger-bg text-danger hover:opacity-90 rounded-[var(--radius-sm)]"
		},
		size: {
			default: "h-10 px-3.5 text-sm",
			sm: "h-9 px-2.5 text-xs",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var FLOOR_KEY = ["floor"];
function useFloor() {
	return useQuery({
		queryKey: FLOOR_KEY,
		queryFn: () => loadFloor(),
		staleTime: 4e3
	});
}
function useFloorMutation(fn) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: fn,
		onSuccess: (state) => {
			qc.setQueryData(FLOOR_KEY, state);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Save failed");
		}
	});
}
function useFloorMutations() {
	const qc = useQueryClient();
	const createWo = useFloorMutation((input) => createWorkOrder({ data: input }));
	const patchWo = useFloorMutation((input) => updateWorkOrder({ data: input }));
	const passWo = useFloorMutation((input) => passWorkOrder({ data: input }));
	const prePassWo = useFloorMutation((input) => prePassWorkOrder({ data: input }));
	const passPt = useFloorMutation((input) => passProblemTicket({ data: input }));
	const prePassPt = useFloorMutation((input) => prePassProblemTicket({ data: input }));
	const reorder = useFloorMutation((input) => reorderBuildOrder({ data: input }));
	const addTask = useFloorMutation((input) => createBuildTask({ data: input }));
	const patchTask = useFloorMutation((input) => updateBuildTask({ data: input }));
	const taskDelete = useFloorMutation((id) => deleteBuildTask({ data: { id } }));
	const addPt = useFloorMutation((input) => createProblemTicket({ data: input }));
	const patchPt = useFloorMutation((input) => updateProblemTicket({ data: input }));
	const ptDelete = useFloorMutation((id) => deleteProblemTicket({ data: { id } }));
	const woHistory = useFloorMutation((input) => addHardwareHistory({ data: input }));
	const addPart = useFloorMutation((input) => createPart({ data: input }));
	const patchPart = useFloorMutation((input) => updatePart({ data: input }));
	const unitAdd = useFloorMutation((woNumber) => addUnit({ data: { woNumber } }));
	const patchUnit = useFloorMutation((input) => updateUnit({ data: input }));
	const unitNote = useFloorMutation((input) => addUnitNote({ data: input }));
	const qtCreate = useFloorMutation((input) => createTicket({ data: input }));
	const patchQt = useFloorMutation((input) => updateTicket({ data: input }));
	const qtNote = useFloorMutation((input) => addTicketNote({ data: input }));
	const soCreate = useFloorMutation((input) => createSalesOrder({ data: input }));
	const patchSo = useFloorMutation((input) => updateSalesOrder({ data: input }));
	const lineAdd = useFloorMutation((input) => addSalesLine({ data: input }));
	const patchLine = useFloorMutation((input) => updateSalesLine({ data: input }));
	const lineDelete = useFloorMutation((id) => deleteSalesLine({ data: { id } }));
	const despatch = useFloorMutation((input) => despatchLine({ data: input }));
	const shipSo = useFloorMutation((input) => despatchSalesOrder({ data: input }));
	const wipe = useFloorMutation(() => wipeFloor());
	const loadSage = useMutation({
		mutationFn: (file) => importSagePack({ data: file }),
		onSuccess: (result) => {
			qc.setQueryData(FLOOR_KEY, result.state);
			toast.success(`Sage pack list: ${result.count} lines (replaced)`);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Sage upload failed");
		}
	});
	return {
		createWo,
		patchWo,
		passWo,
		prePassWo,
		passPt,
		prePassPt,
		reorder,
		addTask,
		patchTask,
		taskDelete,
		addPt,
		patchPt,
		ptDelete,
		woHistory,
		addPart,
		patchPart,
		unitAdd,
		patchUnit,
		unitNote,
		qtCreate,
		patchQt,
		qtNote,
		soCreate,
		patchSo,
		lineAdd,
		patchLine,
		lineDelete,
		despatch,
		shipSo,
		wipe,
		loadSheet: useMutation({
			mutationFn: (files) => importFloor({ data: { files } }),
			onSuccess: (result) => {
				qc.setQueryData(FLOOR_KEY, result.state);
				const n = Object.values(result.report.inserted).reduce((a, b) => a + b, 0) + Object.values(result.report.updated).reduce((a, b) => a + b, 0);
				if (result.report.errors.length) toast.error(`Loaded ${n} rows, ${result.report.errors.length} problem${result.report.errors.length === 1 ? "" : "s"}`);
				else toast.success(`Loaded ${n} row${n === 1 ? "" : "s"}`);
			},
			onError: (err) => {
				toast.error(err instanceof Error ? err.message : "Load failed");
			}
		}),
		loadSage,
		setBuildField: useFloorMutation((input) => setWorkOrderBuildField({ data: input })),
		setConsumed: useFloorMutation((input) => setWorkOrderConsumed({ data: input })),
		writeConsumedHistory: useFloorMutation((input) => writeWorkOrderConsumedHistory({ data: input })),
		setPartComponent: useFloorMutation((input) => setPartComponentRequired({ data: input })),
		addComponent: useFloorMutation((label) => addBuildComponent({ data: { label } })),
		addBattery: useFloorMutation((code) => addBuildBattery({ data: { code } })),
		removeBattery: useFloorMutation((code) => removeBuildBattery({ data: { code } })),
		removeComponent: useFloorMutation((key) => removeBuildComponent({ data: { key } }))
	};
}
//#endregion
export { useFloorMutations as i, FLOOR_KEY as n, useFloor as r, Button as t };
