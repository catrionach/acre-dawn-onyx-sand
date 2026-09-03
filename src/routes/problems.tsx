import { createFileRoute } from "@tanstack/react-router";
import { ProblemsScreen } from "@/components/floor/problems-screen";

type ProblemsSearch = { pt?: string };

export const Route = createFileRoute("/problems")({
  validateSearch: (search: Record<string, unknown>): ProblemsSearch => ({
    pt: typeof search.pt === "string" ? search.pt : undefined,
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const { pt } = Route.useSearch();
  return <ProblemsScreen highlight={pt} />;
}
