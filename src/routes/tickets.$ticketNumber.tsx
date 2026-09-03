import { createFileRoute } from "@tanstack/react-router";
import { TicketFormScreen } from "@/components/floor/ticket-form";

export const Route = createFileRoute("/tickets/$ticketNumber")({
  component: TicketPage,
});

function TicketPage() {
  const { ticketNumber } = Route.useParams();
  if (ticketNumber === "new") {
    return <TicketFormScreen />;
  }
  return <TicketFormScreen ticketNumber={ticketNumber} />;
}
