import { Link, useRouterState } from "@tanstack/react-router";
import { formatShopDate, todayIso } from "@/lib/floor/dates";
import { cn } from "@/lib/utils";
import { AuthorSelect } from "./author";

const NAV = [
  { to: "/sales", label: "Sales orders" },
  { to: "/work-orders", label: "Work orders" },
  { to: "/", label: "Build order" },
  { to: "/shipping", label: "Shipping" },
  { to: "/tasks", label: "Tasks" },
  { to: "/problems", label: "Problem tickets" },
  { to: "/tickets", label: "QTs" },
  { to: "/parts", label: "Parts spec" },
  { to: "/trace", label: "Trace" },
  { to: "/load", label: "Load data", quiet: true },
] as const;

function pathMatches(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const today = todayIso();

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2.5 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <p className="font-semibold tracking-tight text-lg leading-tight text-primary">CE Master</p>
              <p className="truncate text-sm text-muted">A&P Chambers</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden text-sm text-muted sm:block">{formatShopDate(today)}</p>
              <AuthorSelect />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
            {NAV.map((item) => {
              const on = pathMatches(pathname, item.to);
              const quiet = "quiet" in item && item.quiet;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 rounded-[var(--radius-sm)] px-3.5 h-10 inline-flex items-center text-sm font-medium",
                    on
                      ? "bg-primary text-primary-fg"
                      : quiet
                        ? "text-faint hover:bg-surface-2 hover:text-muted"
                        : "text-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5">{children}</main>
    </div>
  );
}

export function ScreenHeader({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight leading-tight">{title}</h1>
        {hint ? <p className="mt-0.5 text-sm text-muted">{hint}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={cn("filter-chip", on && "is-on")} onClick={onClick}>
      {children}
    </button>
  );
}

export function LoadingTable() {
  return (
    <div className="sheet-wrap p-4">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-[var(--radius-xs)] bg-surface-2"
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
