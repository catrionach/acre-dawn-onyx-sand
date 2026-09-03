import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/work-orders/$woNumber")({
  component: function WorkOrderChild() {
    return null;
  },
});
