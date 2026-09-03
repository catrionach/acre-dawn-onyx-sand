import { createFileRoute, useParams } from "@tanstack/react-router";
import { SalesScreen } from "@/components/floor/sales-screen";

export const Route = createFileRoute("/sales")({
  component: SalesLayout,
});

function SalesLayout() {
  const params = useParams({ strict: false });
  return <SalesScreen openId={params.soNumber} />;
}
