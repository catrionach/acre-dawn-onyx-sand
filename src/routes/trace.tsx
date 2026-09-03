import { createFileRoute } from "@tanstack/react-router";
import { TraceScreen } from "@/components/floor/trace-screen";

export const Route = createFileRoute("/trace")({
  component: TraceScreen,
});
