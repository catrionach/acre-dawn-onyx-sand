import { createFileRoute } from "@tanstack/react-router";
import { SCHEMA_DOC } from "@/lib/floor/schema-doc";

export const Route = createFileRoute("/floor-database.txt")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { assertPin } = await import("@/lib/floor/pin.server");
          assertPin();
        } catch {
          return new Response("PIN required", { status: 401 });
        }
        return new Response(SCHEMA_DOC, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'attachment; filename="CE-Master-database.txt"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
