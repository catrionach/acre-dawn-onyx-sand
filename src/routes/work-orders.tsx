import { createFileRoute, useParams } from "@tanstack/react-router";
import { WorkOrdersScreen } from "@/components/floor/work-orders-screen";

export const Route = createFileRoute("/work-orders")({
  component: WorkOrdersLayout,
});

function WorkOrdersLayout() {
  const params = useParams({ strict: false });
  return <WorkOrdersScreen openId={params.woNumber} />;
}
