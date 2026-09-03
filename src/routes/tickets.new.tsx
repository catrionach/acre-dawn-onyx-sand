import { createFileRoute } from "@tanstack/react-router";
import { TicketFormScreen } from "@/components/floor/ticket-form";

export const Route = createFileRoute("/tickets/new")({
  validateSearch: (s: Record<string, unknown>): { wo?: string } => {
    const wo = typeof s.wo === "string" ? s.wo.trim() : "";
    return wo ? { wo } : {};
  },
  component: NewTicketPage,
});

function NewTicketPage() {
  const { wo } = Route.useSearch();
  return <TicketFormScreen defaultWo={wo ?? ""} />;
}
