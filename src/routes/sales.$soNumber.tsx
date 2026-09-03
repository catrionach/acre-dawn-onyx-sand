import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sales/$soNumber")({
  component: function SalesChild() {
    return null;
  },
});
