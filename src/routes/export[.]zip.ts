import { createFileRoute } from "@tanstack/react-router";
import { loadFloor } from "@/lib/floor/api";
import { todayIso } from "@/lib/floor/dates";
import { zipFromFloor } from "@/lib/floor/export-data";

export const Route = createFileRoute("/export.zip")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const state = await loadFloor();
          const bytes = zipFromFloor(state);
          const filename = `CE-Master-${todayIso()}-csv.zip`;
          return new Response(Buffer.from(bytes), {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="${filename}"`,
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
