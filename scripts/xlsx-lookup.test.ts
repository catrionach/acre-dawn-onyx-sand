import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { readXlsx } from "../src/lib/floor/xlsx.ts";

function componentKey(label: string) {
  return label
    .trim()
    .toUpperCase()
    .replace(/\bNO\.?\s*(?=\d)/g, "NO")
    .replace(/[^\w.()+-]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function isMarked(value: string) {
  const v = value.trim().toLowerCase();
  return v === "x" || v === "yes" || v === "y" || v === "1" || v === "true";
}

describe("component keys", () => {
  it("matches spaced PCB headers to packed report headers", () => {
    assert.equal(
      componentKey("RB Control PCB No 10018-02"),
      componentKey("RB CONTROL PCB NO10018-02"),
    );
    assert.equal(componentKey("ASSY.ANT1 (A)"), componentKey("ASSY.ANT1(A)"));
    assert.equal(componentKey("ASSY.ANT1\r\n(A)"), componentKey("ASSY.ANT1(A)"));
  });
});

describe("Build_Component_Lookup.xlsx", () => {
  const sheets = readXlsx(new Uint8Array(readFileSync("attachments/Build_Component_Lookup.xlsx")));
  const main = sheets.find((s) => (s.rows[0]?.[0] ?? "").toLowerCase() === "product");
  const batteries = sheets.find((s) => /battery/i.test(s.name));

  it("reads the product matrix and battery list", () => {
    assert.ok(main);
    assert.equal(main.rows[0][1], "RB Control PCB No 10018-02");
    assert.ok(batteries?.rows.some((r) => r[0] === "BE.D2"));
  });

  it("keeps X marks aligned on RBPB-N-PH", () => {
    assert.ok(main);
    const headers = main.rows[0] ?? [];
    const row = main.rows.find((r) => r[0] === "RBPB-N-PH");
    assert.ok(row);
    const marked: string[] = [];
    headers.forEach((h, i) => {
      if (i && isMarked(row[i] ?? "")) marked.push(componentKey(h));
    });
    assert.deepEqual(marked, [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
    ]);
  });
});

describe("443_Build_Report.xlsx", () => {
  it("reads SN_1 and matches lookup keys", () => {
    const sheets = readXlsx(new Uint8Array(readFileSync("attachments/443_Build_Report.xlsx")));
    assert.equal(sheets[0]?.name, "SN_1");
    const headers = sheets[0]?.rows[0] ?? [];
    const row = sheets[0]?.rows[1] ?? [];
    assert.equal(row[0], "443");
    assert.equal(row[2], "RBPB-N-PH");
    const byHeader = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
    assert.equal(byHeader["RB CONTROL PCB NO10018-02"], "84");
    assert.equal(byHeader["ASSY.ANT1(A)"], "1235");
    assert.equal(byHeader["BATTERY TYPE"], "BE.D3");
    assert.equal(componentKey("RB CONTROL PCB NO10018-02"), "RBCONTROLPCBNO10018-02");
  });
});
