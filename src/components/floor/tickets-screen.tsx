import { Link, useNavigate } from "@tanstack/react-router";
import { formatShopDate } from "@/lib/floor/dates";
import { displayWo } from "@/lib/floor/prospect";
import { parseWoNumbers } from "@/lib/floor/lookups";
import { useFloor } from "@/lib/floor/queries";
import { ErrorBanner, FilterChip, LoadingTable, ScreenHeader } from "./shell";
import { QtId } from "./id-stack";
import { QtPill } from "./status-pill";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export function TicketsScreen() {
  const floor = useFloor();
  const navigate = useNavigate();
  const [showClosed, setShowClosed] = useState(false);

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Quality tickets" />
        <LoadingTable />
      </>
    );
  }
  if (floor.error || !floor.data) {
    return (
      <ErrorBanner
        message={floor.error instanceof Error ? floor.error.message : "Could not load CE Master."}
      />
    );
  }

  const state = floor.data;
  const rows = state.tickets.filter((t) => (showClosed ? true : t.status === "open"));

  return (
    <>
      <ScreenHeader
        title="Quality tickets"
        hint="Open a ticket to fill title, optional WO, description and causes."
        actions={
          <div className="flex flex-wrap gap-2">
            <FilterChip on={showClosed} onClick={() => setShowClosed(!showClosed)}>
              {showClosed ? "Showing all" : "Open"}
            </FilterChip>
            <Button asChild size="sm">
              <Link to="/tickets/new">
                <Plus className="size-3.5" />
                New QT
              </Link>
            </Button>
          </div>
        }
      />
      <div className="sheet-wrap">
        <table className="sheet min-w-[48rem]">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Title</th>
              <th>WO</th>
              <th>Part</th>
              <th>Causes</th>
              <th>Action</th>
              <th>Status</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-sm text-muted">
                  No tickets.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.ticketNumber}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/tickets/$ticketNumber",
                      params: { ticketNumber: t.ticketNumber },
                    })
                  }
                >
                  <td>
                    <QtId ticketNumber={t.ticketNumber} />
                  </td>
                  <td>
                    <span className="block px-2.5 py-1.5 font-medium">{t.title || "—"}</span>
                  </td>
                  <td>
                    <span className="block px-2.5 font-mono">
                      {parseWoNumbers(t.workOrderNumber).map(displayWo).join(", ") || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="block px-2.5 font-mono">{t.part || "—"}</span>
                  </td>
                  <td>
                    <span className="block px-2.5 text-sm">
                      {t.causes.length ? t.causes.join(", ") : "TBD"}
                    </span>
                  </td>
                  <td>
                    <span className="block px-2.5 text-sm">
                      {t.furtherAction ? "Yes" : "—"}
                    </span>
                  </td>
                  <td className="px-2.5">
                    <QtPill status={t.status} />
                  </td>
                  <td>
                    <span className="block px-2.5">{formatShopDate(t.dateOpened)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
