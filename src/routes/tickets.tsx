import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TicketsScreen } from "@/components/floor/tickets-screen";

export const Route = createFileRoute("/tickets")({
  component: TicketsLayout,
});

function TicketsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/tickets") return <Outlet />;
  return <TicketsScreen />;
}
