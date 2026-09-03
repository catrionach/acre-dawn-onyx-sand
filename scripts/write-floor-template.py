#!/usr/bin/env python3
"""Write public/floor-load CSV + xlsx templates."""
from __future__ import annotations

import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "floor-load"
ART = ROOT / "artifacts"

SHEETS: list[tuple[str, list[str], list[list[str]], str]] = [
    (
        "parts",
        ["part_number", "name", "logger", "type", "counts", "directional", "build_time_hours", "notes", "active"],
        [
            ["ASSY.TX100", "TX100 assembly", "TX100", "assembly", "", "no", "0.4", "", "yes"],
            ["RBPB-N-B", "Remote button PCB N-B", "", "pcb", "", "yes", "8", "North-bound legend", "yes"],
            ["LEADSET-103-M", "Lead set 103 moulded", "", "leadset", "", "no", "0.2", "", "yes"],
        ],
        "",
    ),
    (
        "work_orders",
        [
            "wo_number", "part", "qty", "status", "assigned_build", "built_in_sage",
            "date_added", "date_started", "date_closed", "customer_need_date",
            "notes_to_production", "notes_from_sales",
        ],
        [
            ["506", "ASSY.TX100", "40", "active", "David", "no", "2026-07-28", "2026-08-26", "", "2026-09-05", "Batch for stock", ""],
            ["1694", "RBPB-N-B", "1", "pending", "David", "no", "2026-08-12", "", "", "2026-08-21", "Replace returned board", ""],
            ["508", "LEADSET-103-M", "100", "pending", "Simon", "no", "2026-08-20", "", "", "", "", "Fire Security x3 and Outdoor Access x2 on this batch."],
        ],
        "",
    ),
    (
        "units",
        ["work_order_number", "unit_id", "serial_or_id", "status", "sales_order_number", "despatch_date"],
        [["508", "508-1", "", "in build", "3359", ""]],
        "",
    ),
    (
        "quality_tickets",
        ["ticket_number", "work_order_number", "unit_id", "title", "problem", "status", "assigned_to", "date_opened"],
        [["QT-1", "1694", "", "Silk legend reversed", "N-B legend reads the wrong way on the button PCB.", "open", "David", "2026-08-21"]],
        "",
    ),
    (
        "sales_orders",
        ["so_number", "company", "order_date", "lead_time_weeks", "target_despatch", "status", "sage_id"],
        [
            ["3359", "Fire Security Team", "2026-08-04", "4", "2026-09-01", "open", ""],
            ["3367", "Outdoor Access Trust", "2026-08-11", "3", "2026-09-01", "open", ""],
            ["3401", "Natural England", "2026-08-14", "6", "2026-09-25", "waiting_on_customer", ""],
        ],
        "",
    ),
    (
        "sales_lines",
        ["so_number", "part", "qty", "work_order_number"],
        [
            ["3359", "LEADSET-103-M", "3", "508"],
            ["3359", "RBPB-N-B", "1", ""],
            ["3367", "LEADSET-103-M", "2", "508"],
            ["3401", "RBPB-N-B", "1", ""],
        ],
        "",
    ),
    (
        "hardware_history",
        ["wo_number", "date", "author", "text"],
        [["1694", "2026-08-21 09:15", "David", "Returned board received. Silk legend reversed - holding for QT-1."]],
        "",
    ),
    (
        "build_order",
        ["position", "wo_number"],
        [["1", "1694"], ["2", "506"], ["3", "496"], ["4", "507"], ["5", "508"]],
        "",
    ),
]

README = [
    "Floor load workbook - A&P Chambers",
    "",
    "Fill the sheets, then upload this file on Floor -> Load data.",
    "Existing rows are updated (matched on part_number, wo_number, so_number, ticket_number, unit_id).",
    "New rows are inserted. Empty cells on an update leave the current value.",
    "",
    "Load order is automatic. For a first dump, fill:",
    "  1. parts",
    "  2. work_orders",
    "  3. units (optional)",
    "  4. quality_tickets",
    "  5. sales_orders",
    "  6. sales_lines (repeat SO number, one row per part)",
    "  7. hardware_history (optional)",
    "  8. build_order (optional)",
    "",
    "Dates: YYYY-MM-DD or DD/MM/YYYY. Yes/no for tick boxes.",
    "Delete the sample rows if you do not want the demo jobs, or leave them.",
]


def csv_text(headers: list[str], rows: list[list[str]]) -> str:
    def esc(v: str) -> str:
        if any(ch in v for ch in ',"\n\r'):
            return '"' + v.replace('"', '""') + '"'
        return v
    lines = [",".join(esc(c) for c in headers)]
    for row in rows:
        lines.append(",".join(esc(c) for c in row))
    return "\r\n".join(lines) + "\r\n"


def col_name(index: int) -> str:
    n = index + 1
    s = ""
    while n:
        n, rem = divmod(n - 1, 26)
        s = chr(65 + rem) + s
    return s


def sheet_xml(rows: list[list[str]]) -> str:
    body = []
    for r, row in enumerate(rows, 1):
        cells = []
        for c, value in enumerate(row):
            t = escape(value)
            space = ' xml:space="preserve"' if value[:1].isspace() or value[-1:].isspace() else ""
            cells.append(
                f'<c r="{col_name(c)}{r}" t="inlineStr"><is><t{space}>{t}</t></is></c>'
            )
        body.append(f'<row r="{r}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<sheetData>{"".join(body)}</sheetData></worksheet>'
    )


def write_xlsx(path: Path) -> None:
    named = [("README", [[line] for line in README])]
    for key, headers, rows, _ in SHEETS:
        named.append((key, [headers, *rows]))

    content_types = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
    ]
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    ]
    sheets_xml = ['<sheets>']
    files: dict[str, str] = {}
    for i, (name, rows) in enumerate(named, 1):
        content_types.append(
            f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
        wb_rels.append(
            f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>'
        )
        sheets_xml.append(f'<sheet name="{escape(name[:31])}" sheetId="{i}" r:id="rId{i}"/>')
        files[f"xl/worksheets/sheet{i}.xml"] = sheet_xml(rows)
    content_types.append("</Types>")
    wb_rels.append("</Relationships>")
    sheets_xml.append("</sheets>")

    files["[Content_Types].xml"] = "\n".join(content_types)
    files["_rels/.rels"] = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""
    files["xl/_rels/workbook.xml.rels"] = "\n".join(wb_rels)
    files["xl/workbook.xml"] = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        + "".join(sheets_xml)
        + "</workbook>"
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name, data in files.items():
            zf.writestr(name, data.encode("utf-8"))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)
    for key, headers, rows, _ in SHEETS:
        text = "\ufeff" + csv_text(headers, rows)
        (OUT / f"{key}.csv").write_text(text, encoding="utf-8")
    write_xlsx(OUT / "Floor-load.xlsx")
    write_xlsx(ART / "Floor-load.xlsx")
    print(f"Wrote {len(SHEETS)} CSVs + Floor-load.xlsx")


if __name__ == "__main__":
    main()
