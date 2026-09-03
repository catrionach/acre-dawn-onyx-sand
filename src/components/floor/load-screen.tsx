import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SHEET_SPECS, type ImportReport } from "@/lib/floor/load-sheets";
import { SCHEMA_DOC } from "@/lib/floor/schema-doc";
import { useFloor, useFloorMutations } from "@/lib/floor/queries";
import { ErrorBanner, LoadingTable, ScreenHeader } from "./shell";

async function fileToPayload(file: File): Promise<{
  name: string;
  kind: "csv" | "xlsx";
  content: string;
}> {
  const name = file.name;
  const isXlsx = /\.xlsx$/i.test(name) || file.type.includes("spreadsheet");
  if (isXlsx) {
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 1) binary += String.fromCharCode(buf[i]);
    return { name, kind: "xlsx", content: btoa(binary) };
  }
  return { name, kind: "csv", content: await file.text() };
}

export function LoadScreen() {
  const floor = useFloor();
  const mut = useFloorMutations();
  const [report, setReport] = useState<ImportReport | null>(null);
  const [dragOn, setDragOn] = useState(false);
  const [wipeArmed, setWipeArmed] = useState(false);

  async function ingest(list: FileList | File[]) {
    const files = [...list].filter((f) => /\.(csv|xlsx|txt)$/i.test(f.name));
    if (!files.length) return;
    const payloads = await Promise.all(files.map(fileToPayload));
    mut.loadSheet.mutate(payloads, {
      onSuccess: (result) => setReport(result.report),
    });
  }

  if (floor.isLoading) {
    return (
      <>
        <ScreenHeader title="Load & download" />
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

  const stampName = "CE-Master-csv.zip";

  return (
    <>
      <ScreenHeader
        title="Load & download"
        hint="Download today’s CSVs, or a blank template, then drop the filled files back here. You can also drop the Build Component Lookup workbook and build reports (WO / serial / part columns)."
        actions={
          !wipeArmed ? (
            <Button type="button" variant="danger" onClick={() => setWipeArmed(true)}>
              Blank database…
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="danger"
                disabled={mut.wipe.isPending}
                onClick={() => {
                  mut.wipe.mutate(undefined, {
                    onSuccess: () => {
                      setReport(null);
                      setWipeArmed(false);
                      toast.success("Database blanked");
                    },
                  });
                }}
              >
                {mut.wipe.isPending ? "Wiping…" : "Yes, delete everything"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setWipeArmed(false)}>
                Cancel
              </Button>
            </div>
          )
        }
      />

      <section className="mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <h2 className="text-sm font-semibold">Download current data</h2>
        <p className="mt-1 text-sm text-muted">
          Live rows from the database. The zip has every table plus the structure
          notes. If the zip is blocked, use a single table below.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild>
            <a href="/export.zip" download={stampName}>
              Download CSV (all files)
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/floor-database.txt" download="CE-Master-database.txt">
              Database structure
            </a>
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SHEET_SPECS.map((spec) => (
            <Button asChild key={spec.key} variant="ghost" size="sm">
              <a href={`/dump/${spec.key}`} download={`${spec.key}.csv`}>
                {spec.key}.csv
              </a>
            </Button>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <h2 className="text-sm font-semibold">Templates</h2>
        <p className="mt-1 text-sm text-muted">Blank headings plus a few sample rows, not your live shop.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SHEET_SPECS.map((spec) => (
            <Button asChild key={spec.key} variant="outline" size="sm">
              <a
                href={`/blank/${spec.key}`}
                download={`${spec.key}-template.csv`}
              >
                {spec.key}
              </a>
            </Button>
          ))}
          <Button asChild variant="outline" size="sm">
            <a href="/Build_Component_Lookup.xlsx" download>
              Build component lookup
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/443_Build_Report.xlsx" download>
              Sample build report
            </a>
          </Button>
        </div>
      </section>

      <label
        className={`load-drop ${dragOn ? "is-on" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOn(true);
        }}
        onDragLeave={() => setDragOn(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOn(false);
          void ingest(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.txt"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void ingest(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="font-medium">Drop CSV or Excel files to load</p>
        <p className="text-sm text-muted">
          {mut.loadSheet.isPending
            ? "Loading…"
            : "Workbooks, CSVs, the component lookup, and build reports (WO / serial / part). Existing rows update; new rows add."}
        </p>
      </label>

      <section className="mt-5 rounded-[var(--radius-md)] border border-danger/30 bg-surface p-3">
        <h2 className="text-sm font-semibold">Blank the database</h2>
        <p className="mt-1 text-sm text-muted">
          Use this after a bad load. Download a copy first if you might need it.
          Wipes jobs, sales, parts, tickets and history for everyone on CE Master.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!wipeArmed ? (
            <Button type="button" variant="danger" onClick={() => setWipeArmed(true)}>
              Blank database…
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="danger"
                disabled={mut.wipe.isPending}
                onClick={() => {
                  mut.wipe.mutate(undefined, {
                    onSuccess: () => {
                      setReport(null);
                      setWipeArmed(false);
                      toast.success("Database blanked");
                    },
                  });
                }}
              >
                {mut.wipe.isPending ? "Wiping…" : "Yes, delete everything"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setWipeArmed(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </section>

      {report ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <h2 className="mb-2 text-sm font-semibold">Last load</h2>
          <ul className="space-y-1 text-sm">
            {Object.keys({ ...report.inserted, ...report.updated, ...report.skipped }).length ===
              0 && report.errors.length === 0 ? (
              <li className="text-muted">Nothing to load.</li>
            ) : null}
            {Object.entries(report.inserted).map(([k, n]) => (
              <li key={`i-${k}`}>
                {k}: {n} added
              </li>
            ))}
            {Object.entries(report.updated).map(([k, n]) => (
              <li key={`u-${k}`}>
                {k}: {n} updated
              </li>
            ))}
            {Object.entries(report.skipped).map(([k, n]) => (
              <li key={`s-${k}`} className="text-muted">
                {k}: {n} already there
              </li>
            ))}
          </ul>
          {report.errors.length ? (
            <ul className="mt-2 space-y-1 text-sm text-danger">
              {report.errors.map((err, i) => (
                <li key={i}>
                  {err.sheet}
                  {err.row ? ` ${err.row}` : ""}: {err.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-3">
        <h2 className="text-sm font-semibold">Database structure</h2>
        <p className="mt-1 text-sm text-muted">
          Yes — the CSV files are the live rows. This is the table layout they
          sit on. Same text as the Database structure download and as
          _database.txt inside the zip.
        </p>
        <pre className="schema-doc mt-3">{SCHEMA_DOC}</pre>
      </section>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {SHEET_SPECS.map((spec) => (
          <section
            key={spec.key}
            className="rounded-[var(--radius-md)] border border-border bg-surface p-3"
          >
            <h2 className="font-mono text-sm font-semibold">{spec.title}</h2>
            <p className="mt-1 text-sm text-muted">{spec.help}</p>
            <p className="mt-2 font-mono text-xs text-faint">{spec.columns.join(" · ")}</p>
          </section>
        ))}
      </div>
    </>
  );
}
