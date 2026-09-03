export const WO_STATUSES = ["pending", "active", "on_hold", "closed", "cancelled"] as const;
export type WoStatus = (typeof WO_STATUSES)[number];

export const WO_STATUS_LABELS: Record<WoStatus, string> = {
  pending: "Pending",
  active: "Active",
  on_hold: "On hold",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const UNIT_STATUSES = ["in build", "on shelf", "shipped"] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  "in build": "In build",
  "on shelf": "On shelf",
  shipped: "Shipped",
};

export const TICKET_STATUSES = ["open", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const QT_CAUSES = [
  "TBD",
  "component failure",
  "design work needed",
  "build error",
  "missing parts",
  "documentation",
] as const;
export type QtCause = (typeof QT_CAUSES)[number];

export const SO_STATUSES = [
  "open",
  "waiting_on_customer",
  "despatched",
  "cancelled",
] as const;
export type SoStatus = (typeof SO_STATUSES)[number];

export const BUILDERS = [
  "Simon",
  "David",
  "Donald",
  "Kenzie",
  "Catriona",
  "Allan",
  "Lucas",
] as const;
export type Builder = (typeof BUILDERS)[number];

export const BUILDER_OPTIONS = BUILDERS.map((n) => ({ value: n, label: n }));

export const WO_STATUS_OPTIONS = WO_STATUSES.map((s) => ({
  value: s,
  label: WO_STATUS_LABELS[s],
}));

export const UNIT_STATUS_OPTIONS = UNIT_STATUSES.map((s) => ({
  value: s,
  label: UNIT_STATUS_LABELS[s],
}));

export const TASK_STATUSES = ["pending", "active", "on_hold", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  active: "Active",
  on_hold: "On hold",
  done: "Done",
};

export const TASK_STATUS_OPTIONS = TASK_STATUSES.map((s) => ({
  value: s,
  label: TASK_STATUS_LABELS[s],
}));

export type Note = {
  date: string;
  author: string;
  text: string;
};

export type Part = {
  partNumber: string;
  name: string;
  logger: string;
  type: string;
  counts: string;
  directional: boolean;
  buildTimeHours: number;
  notes: string;
  active: boolean;
};

export type WorkOrder = {
  woNumber: string;
  part: string;
  qty: number;
  status: WoStatus;
  buildTimeHours: number | null;
  dateAdded: string;
  dateStarted: string | null;
  dateClosed: string | null;
  assignedBuild: string;
  assignedNext: string;
  builtInSage: boolean;
  notesToProduction: string;
  /** Shop notes on the build board. DB column is still notes_from_sales. */
  buildOrderNotes: string;
  hardwareHistory: Note[];
  customerNeedDate: string | null;
};

export type Unit = {
  id: number;
  workOrderNumber: string;
  unitId: string;
  serialOrId: string;
  status: UnitStatus;
  salesOrderNumber: string | null;
  despatchDate: string | null;
  notes: Note[];
};

export type QualityTicket = {
  ticketNumber: string;
  workOrderNumber: string;
  unitId: string | null;
  part: string;
  title: string;
  problem: string;
  causes: QtCause[];
  furtherAction: boolean;
  status: TicketStatus;
  dateOpened: string;
  dateClosed: string | null;
  assignedTo: string;
  notes: Note[];
};

export type SalesOrder = {
  soNumber: string;
  company: string;
  orderDate: string | null;
  leadTimeWeeks: number | null;
  targetDespatch: string | null;
  targetDespatchIsOverride: boolean;
  status: SoStatus;
  sageId: string;
  despatchDate: string | null;
  notesToProduction: string;
  notesLine1: string;
};

export type SalesLine = {
  id: number;
  soNumber: string;
  part: string;
  qty: number;
  workOrderNumber: string;
  despatchWoNumber: string;
  despatchDate: string | null;
};

export type SagePackLine = {
  id: number;
  soNumber: string;
  company: string;
  orderDate: string | null;
  part: string;
  description: string;
  comment: string;
  qty: number;
  qtyDespatched: number;
  notes: string;
};

export type SagePackMeta = {
  uploadedAt: string | null;
  filename: string;
  rowCount: number;
};

export type BuildTask = {
  id: number;
  taskNumber: string;
  title: string;
  assignedBuild: string;
  hours: number;
  status: TaskStatus;
  dateStarted: string | null;
  dateFinished: string | null;
  buildOrderNotes: string;
};

export type ProblemTicket = {
  id: number;
  prospectNumber: string;
  title: string;
  part: string;
  assignedBuild: string;
  assignedNext: string;
  hours: number;
  status: TaskStatus;
  dateAdded: string;
  dateStarted: string | null;
  dateFinished: string | null;
  notes: string;
  notesToProduction: string;
  customer: string;
  prospectStatus: string;
  prospectStatusId: string;
  consumed: ConsumedWo[];
};

export type QueueEntry = {
  id: number;
  assignedBuild: string;
  position: number;
  kind: "wo" | "task" | "pt";
  woNumber: string;
  taskId: number | null;
  problemId: number | null;
};

export type ProspectSettings = {
  baseUrl: string;
  hasKey: boolean;
};

export type BuildComponent = {
  key: string;
  label: string;
  kind: "pcb" | "battery" | "subassembly";
  position: number;
};

export type BuildSpec = {
  components: BuildComponent[];
  batteries: string[];
  map: Record<string, string[]>;
};

export type ConsumedWo = {
  woNumber: string;
  part: string;
};

export type WoBuildRecord = {
  id: number;
  woNumber: string;
  serial: string;
  revision: string;
  battery: string;
  notes: string;
  values: Record<string, string>;
  consumed: ConsumedWo[];
};


export type FloorState = {
  parts: Part[];
  workOrders: WorkOrder[];
  units: Unit[];
  tickets: QualityTicket[];
  buildOrder: string[];
  buildQueue: QueueEntry[];
  buildTasks: BuildTask[];
  problemTickets: ProblemTicket[];
  salesOrders: SalesOrder[];
  salesLines: SalesLine[];
  sagePackLines: SagePackLine[];
  sagePackMeta: SagePackMeta;
  prospect: ProspectSettings;
  buildSpec: BuildSpec;
  buildRecords: WoBuildRecord[];
  nextWoNumber: string;
  nextQtNumber: string;
  nextTskNumber: string;
};

export type WoPatch = {
  woNumber?: string;
  part?: string;
  qty?: number;
  status?: WoStatus;
  buildTimeHours?: number | null;
  assignedBuild?: string;
  assignedNext?: string;
  builtInSage?: boolean;
  notesToProduction?: string;
  buildOrderNotes?: string;
  customerNeedDate?: string | null;
  holdReason?: string;
  historyAuthor?: string;
};

export type PartPatch = {
  nextPartNumber?: string;
  name?: string;
  logger?: string;
  type?: string;
  counts?: string;
  directional?: boolean;
  buildTimeHours?: number;
  notes?: string;
  active?: boolean;
};

export type TicketPatch = {
  workOrderNumber?: string;
  unitId?: string | null;
  part?: string;
  title?: string;
  problem?: string;
  status?: TicketStatus;
  assignedTo?: string;
};

export type SalesOrderPatch = {
  company?: string;
  orderDate?: string | null;
  leadTimeWeeks?: number | null;
  targetDespatch?: string | null;
  targetDespatchIsOverride?: boolean;
  status?: SoStatus;
};

export type SalesLinePatch = {
  part?: string;
  qty?: number;
  workOrderNumber?: string;
};

export type UnitPatch = {
  serialOrId?: string;
  status?: UnitStatus;
  salesOrderNumber?: string | null;
  despatchDate?: string | null;
};
