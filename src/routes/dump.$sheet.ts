import { createFileRoute } from "@tanstack/react-router";
import { loadFloor } from "@/lib/floor/api";
import { toCsv } from "@/lib/floor/csv";
import { floorToSheets } from "@/lib/floor/export-data";
import { SHEET_SPECS, type SheetKey } from "@/lib/floor/load-sheets";

const KEYS = new Set<string>(SHEET_SPECS.map((s) => s.key));

export const Route = createFileRoute("/dump/$sheet")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const sheet = params.sheet;
        if (!KEYS.has(sheet)) {
          return new Response("Unknown sheet", { status: 404 });
        }
        try {
          const state = await loadFloor();
          const found = floorToSheets(state).find((s) => s.key === (sheet as SheetKey));
          if (!found) return new Response("Unknown sheet", { status: 404 });
          const body = `\uFEFF${toCsv(found.rows)}`;
          return new Response(body, {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="${sheet}.csv"`,
              "Cache-Control": "no-store",
            },
          });
        } catch {
          return new Response("PIN required", { status: 401 });
        }
      },
    },
  },
});
