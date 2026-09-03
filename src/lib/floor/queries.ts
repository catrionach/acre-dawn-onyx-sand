import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FloorState } from "./types";
import {
  addHardwareHistory,
  addSalesLine,
  addTicketNote,
  addUnit,
  addUnitNote,
  createPart,
  createSalesOrder,
  createTicket,
  createWorkOrder,
  createBuildTask,
  createProblemTicket,
  deleteBuildTask,
  deleteProblemTicket,
  deleteSalesLine,
  despatchLine,
  despatchSalesOrder,
  loadFloor,
  reorderBuildOrder,
  importFloor,
  importSagePack,
  updateBuildTask,
  updatePart,
  updateProblemTicket,
  updateSalesLine,
  updateSalesOrder,
  updateTicket,
  updateUnit,
  updateWorkOrder,
  passWorkOrder,
  prePassWorkOrder,
  passProblemTicket,
  prePassProblemTicket,
  wipeFloor,
  setWorkOrderBuildField,
  setWorkOrderConsumed,
  writeWorkOrderConsumedHistory,
  setPartComponentRequired,
  addBuildComponent,
  addBuildBattery,
  removeBuildBattery,
  removeBuildComponent,
} from "./api";

export const FLOOR_KEY = ["floor"] as const;

export function useFloor() {
  return useQuery({
    queryKey: FLOOR_KEY,
    queryFn: () => loadFloor(),
    staleTime: 4_000,
  });
}

function useFloorMutation<T>(fn: (input: T) => Promise<FloorState>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (state) => {
      qc.setQueryData(FLOOR_KEY, state);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Save failed");
    },
  });
}

export function useFloorMutations() {
  const qc = useQueryClient();
  const createWo = useFloorMutation((input: Parameters<typeof createWorkOrder>[0]["data"]) =>
    createWorkOrder({ data: input }),
  );
  const patchWo = useFloorMutation((input: Parameters<typeof updateWorkOrder>[0]["data"]) =>
    updateWorkOrder({ data: input }),
  );
  const passWo = useFloorMutation((input: Parameters<typeof passWorkOrder>[0]["data"]) =>
    passWorkOrder({ data: input }),
  );
  const prePassWo = useFloorMutation((input: Parameters<typeof prePassWorkOrder>[0]["data"]) =>
    prePassWorkOrder({ data: input }),
  );
  const passPt = useFloorMutation((input: Parameters<typeof passProblemTicket>[0]["data"]) =>
    passProblemTicket({ data: input }),
  );
  const prePassPt = useFloorMutation((input: Parameters<typeof prePassProblemTicket>[0]["data"]) =>
    prePassProblemTicket({ data: input }),
  );
  const reorder = useFloorMutation(
    (input: { who: string; keys: string[] }) => reorderBuildOrder({ data: input }),
  );
  const addTask = useFloorMutation((input: Parameters<typeof createBuildTask>[0]["data"]) =>
    createBuildTask({ data: input }),
  );
  const patchTask = useFloorMutation((input: Parameters<typeof updateBuildTask>[0]["data"]) =>
    updateBuildTask({ data: input }),
  );
  const taskDelete = useFloorMutation((id: number) => deleteBuildTask({ data: { id } }));
  const addPt = useFloorMutation((input: Parameters<typeof createProblemTicket>[0]["data"]) =>
    createProblemTicket({ data: input }),
  );
  const patchPt = useFloorMutation((input: Parameters<typeof updateProblemTicket>[0]["data"]) =>
    updateProblemTicket({ data: input }),
  );
  const ptDelete = useFloorMutation((id: number) => deleteProblemTicket({ data: { id } }));
  const woHistory = useFloorMutation((input: Parameters<typeof addHardwareHistory>[0]["data"]) =>
    addHardwareHistory({ data: input }),
  );
  const addPart = useFloorMutation((input: Parameters<typeof createPart>[0]["data"]) =>
    createPart({ data: input }),
  );
  const patchPart = useFloorMutation((input: Parameters<typeof updatePart>[0]["data"]) =>
    updatePart({ data: input }),
  );
  const unitAdd = useFloorMutation((woNumber: string) => addUnit({ data: { woNumber } }));
  const patchUnit = useFloorMutation((input: Parameters<typeof updateUnit>[0]["data"]) =>
    updateUnit({ data: input }),
  );
  const unitNote = useFloorMutation((input: Parameters<typeof addUnitNote>[0]["data"]) =>
    addUnitNote({ data: input }),
  );
  const qtCreate = useFloorMutation((input: Parameters<typeof createTicket>[0]["data"]) =>
    createTicket({ data: input }),
  );
  const patchQt = useFloorMutation((input: Parameters<typeof updateTicket>[0]["data"]) =>
    updateTicket({ data: input }),
  );
  const qtNote = useFloorMutation((input: Parameters<typeof addTicketNote>[0]["data"]) =>
    addTicketNote({ data: input }),
  );
  const soCreate = useFloorMutation((input: Parameters<typeof createSalesOrder>[0]["data"]) =>
    createSalesOrder({ data: input }),
  );
  const patchSo = useFloorMutation((input: Parameters<typeof updateSalesOrder>[0]["data"]) =>
    updateSalesOrder({ data: input }),
  );
  const lineAdd = useFloorMutation((input: Parameters<typeof addSalesLine>[0]["data"]) =>
    addSalesLine({ data: input }),
  );
  const patchLine = useFloorMutation((input: Parameters<typeof updateSalesLine>[0]["data"]) =>
    updateSalesLine({ data: input }),
  );
  const lineDelete = useFloorMutation((id: number) => deleteSalesLine({ data: { id } }));
  const despatch = useFloorMutation((input: Parameters<typeof despatchLine>[0]["data"]) =>
    despatchLine({ data: input }),
  );
  const shipSo = useFloorMutation((input: Parameters<typeof despatchSalesOrder>[0]["data"]) =>
    despatchSalesOrder({ data: input }),
  );
  const wipe = useFloorMutation(() => wipeFloor());
  const loadSage = useMutation({
    mutationFn: (file: Parameters<typeof importSagePack>[0]["data"]) =>
      importSagePack({ data: file }),
    onSuccess: (result) => {
      qc.setQueryData(FLOOR_KEY, result.state);
      toast.success(`Sage pack list: ${result.count} lines (replaced)`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Sage upload failed");
    },
  });
  const loadSheet = useMutation({
    mutationFn: (files: Parameters<typeof importFloor>[0]["data"]["files"]) =>
      importFloor({ data: { files } }),
    onSuccess: (result) => {
      qc.setQueryData(FLOOR_KEY, result.state);
      const n =
        Object.values(result.report.inserted).reduce((a, b) => a + b, 0) +
        Object.values(result.report.updated).reduce((a, b) => a + b, 0);
      if (result.report.errors.length) {
        toast.error(
          `Loaded ${n} rows, ${result.report.errors.length} problem${result.report.errors.length === 1 ? "" : "s"}`,
        );
      } else {
        toast.success(`Loaded ${n} row${n === 1 ? "" : "s"}`);
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Load failed");
    },
  });
  const setBuildField = useFloorMutation(
    (input: Parameters<typeof setWorkOrderBuildField>[0]["data"]) =>
      setWorkOrderBuildField({ data: input }),
  );
  const setConsumed = useFloorMutation(
    (input: Parameters<typeof setWorkOrderConsumed>[0]["data"]) =>
      setWorkOrderConsumed({ data: input }),
  );
  const writeConsumedHistory = useFloorMutation(
    (input: Parameters<typeof writeWorkOrderConsumedHistory>[0]["data"]) =>
      writeWorkOrderConsumedHistory({ data: input }),
  );
  const setPartComponent = useFloorMutation(
    (input: Parameters<typeof setPartComponentRequired>[0]["data"]) =>
      setPartComponentRequired({ data: input }),
  );
  const addComponent = useFloorMutation((label: string) => addBuildComponent({ data: { label } }));
  const addBattery = useFloorMutation((code: string) => addBuildBattery({ data: { code } }));
  const removeBattery = useFloorMutation((code: string) => removeBuildBattery({ data: { code } }));
  const removeComponent = useFloorMutation((key: string) =>
    removeBuildComponent({ data: { key } }),
  );

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
    loadSheet,
    loadSage,
    setBuildField,
    setConsumed,
    writeConsumedHistory,
    setPartComponent,
    addComponent,
    addBattery,
    removeBattery,
    removeComponent,
  };
}
