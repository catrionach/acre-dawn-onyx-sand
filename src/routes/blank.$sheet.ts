import { createFileRoute } from "@tanstack/react-router";
import { toCsv } from "@/lib/floor/csv";
import { SHEET_SPECS } from "@/lib/floor/load-sheets";

export const Route = createFileRoute("/blank/$sheet")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { assertPin } = await import("@/lib/floor/pin.server");
          assertPin();
        } catch {
          return new Response("PIN required", { status: 401 });
        }
        const spec = SHEET_SPECS.find((s) => s.key === params.sheet);
        if (!spec) return new Response("Unknown sheet", { status: 404 });
        const body = toCsv([spec.columns, ...spec.examples]);
        return new Response(body, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${spec.key}-template.csv"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
