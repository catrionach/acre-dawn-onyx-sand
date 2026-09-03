import { inflateRawSync } from "node:zlib";

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const CRC = crcTable();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) c = CRC[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}
function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Uncompressed ZIP (Excel accepts stored files). */
export function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  const enc = new TextEncoder();
  for (const file of files) {
    const name = enc.encode(file.name);
    const crc = crc32(file.data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      name,
      file.data,
    ]);
    locals.push(local);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    centrals.push(central);
    offset += local.length;
  }
  const centralDir = concat(centrals);
  const eocd = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return concat([...locals, centralDir, eocd]);
}

function readU32(buf: Uint8Array, i: number): number {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint32(i, true);
}
function readU16(buf: Uint8Array, i: number): number {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint16(i, true);
}

export function unzip(buf: Uint8Array): Record<string, Uint8Array> {
  let eocd = -1;
  const start = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= start; i -= 1) {
    if (readU32(buf, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip/xlsx file");
  const entries = readU16(buf, eocd + 10);
  let offset = readU32(buf, eocd + 16);
  const files: Record<string, Uint8Array> = {};
  const dec = new TextDecoder();
  for (let n = 0; n < entries; n += 1) {
    if (readU32(buf, offset) !== 0x02014b50) break;
    const method = readU16(buf, offset + 10);
    const compSize = readU32(buf, offset + 20);
    const nameLen = readU16(buf, offset + 28);
    const extraLen = readU16(buf, offset + 30);
    const commentLen = readU16(buf, offset + 32);
    const localOff = readU32(buf, offset + 42);
    const name = dec.decode(buf.subarray(offset + 46, offset + 46 + nameLen));
    const localNameLen = readU16(buf, localOff + 26);
    const localExtra = readU16(buf, localOff + 28);
    const dataStart = localOff + 30 + localNameLen + localExtra;
    const compressed = buf.subarray(dataStart, dataStart + compSize);
    files[name] =
      method === 0
        ? compressed
        : method === 8
          ? new Uint8Array(inflateRawSync(compressed))
          : compressed;
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function colName(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheetXml(rows: string[][]): string {
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const t = xmlEscape(value ?? "");
          const space = /^\s|\s$/.test(value ?? "") ? ' xml:space="preserve"' : "";
          return `<c r="${colName(c)}${r + 1}" t="inlineStr"><is><t${space}>${t}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

export function writeXlsx(sheets: { name: string; rows: string[][] }[]): Uint8Array {
  const enc = new TextEncoder();
  const files: { name: string; data: Uint8Array }[] = [];
  const sheetEntries = sheets.map((s, i) => ({
    name: s.name.slice(0, 31).replace(/[:\\/?*[\]]/g, " "),
    path: `xl/worksheets/sheet${i + 1}.xml`,
    rid: `rId${i + 1}`,
    rows: s.rows,
  }));

  files.push({
    name: "[Content_Types].xml",
    data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetEntries
  .map(
    (s) =>
      `<Override PartName="/${s.path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  )
  .join("")}
</Types>`),
  });
  files.push({
    name: "_rels/.rels",
    data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
  });
  files.push({
    name: "xl/_rels/workbook.xml.rels",
    data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetEntries
  .map(
    (s) =>
      `<Relationship Id="${s.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${s.path.split("/").pop()}"/>`,
  )
  .join("")}
</Relationships>`),
  });
  files.push({
    name: "xl/workbook.xml",
    data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${sheetEntries
  .map(
    (s, i) =>
      `<sheet name="${xmlEscape(s.name)}" sheetId="${i + 1}" r:id="${s.rid}"/>`,
  )
  .join("")}
</sheets>
</workbook>`),
  });
  for (const s of sheetEntries) {
    files.push({ name: s.path, data: enc.encode(sheetXml(s.rows)) });
  }
  return zipStore(files);
}

function colIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const texts = [...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((x) =>
      decodeXml(x[1]),
    );
    out.push(texts.join(""));
  }
  return out;
}

function decodeXml(value: string): string {
  const amp = "&";
  return value
    .replace(new RegExp(amp + "lt;", "g"), "<")
    .replace(new RegExp(amp + "gt;", "g"), ">")
    .replace(new RegExp(amp + "quot;", "g"), '"')
    .replace(new RegExp(amp + "apos;", "g"), "'")
    .replace(new RegExp(amp + "amp;", "g"), amp);
}

function parseSheetGrid(xml: string, shared: string[]): string[][] {
  const normalized = xml.replace(/<c\b([^>]*)\/>/g, "<c$1></c>");
  const rows: string[][] = [];
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(normalized))) {
    const cells: string[] = [];
    const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/gi;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRe.exec(rowMatch[1]))) {
      const attrs = cellMatch[1];
      const inner = cellMatch[2];
      const ref = attrs.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? "";
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? "";
      let value = "";
      if (type === "s") {
        const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "0";
        value = shared[Number(v)] ?? "";
      } else if (type === "inlineStr") {
        const texts = [...inner.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((x) =>
          decodeXml(x[1]),
        );
        value = texts.join("");
      } else if (type === "b") {
        const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "0";
        value = v === "1" || v === "true" ? "TRUE" : "FALSE";
      } else {
        const v = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1];
        value = v ? decodeXml(v) : "";
      }
      value = value.replace(/[\r\n]+/g, " ").replace(/[ \t]+/g, " ").trim();
      const idx = colIndex(ref);
      while (cells.length < idx) cells.push("");
      cells[idx] = value;
    }
    rows.push(cells);
  }
  return rows;
}

function zipEntry(files: Record<string, Uint8Array>, path: string): Uint8Array | undefined {
  const clean = path.replace(/^\/+/, "").replace(/^\.\//, "");
  return files[clean] ?? files[`/${clean}`] ?? files[path];
}

function sheetZipPath(target: string): string {
  const clean = target.replace(/^\/+/, "").replace(/^\.\//, "");
  if (clean.startsWith("xl/")) return clean;
  return `xl/${clean}`;
}

export function readXlsx(buf: Uint8Array): { name: string; rows: string[][] }[] {
  const files = unzip(buf);
  const dec = new TextDecoder();
  const sharedXml = zipEntry(files, "xl/sharedStrings.xml");
  const shared = sharedXml ? parseSharedStrings(dec.decode(sharedXml)) : [];
  const wb = dec.decode(zipEntry(files, "xl/workbook.xml") ?? new Uint8Array());
  const rels = dec.decode(zipEntry(files, "xl/_rels/workbook.xml.rels") ?? new Uint8Array());
  const relMap: Record<string, string> = {};
  for (const tag of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = tag[0].match(/\bId="([^"]+)"/)?.[1];
    const target = tag[0].match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target) relMap[id] = target;
  }
  const sheets: { name: string; rows: string[][] }[] = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = m[0].match(/\bname="([^"]+)"/)?.[1];
    const rid = m[0].match(/\br:id="([^"]+)"/)?.[1];
    if (!name || !rid) continue;
    const target = relMap[rid];
    if (!target) continue;
    const xml = zipEntry(files, sheetZipPath(target));
    if (!xml) continue;
    sheets.push({ name, rows: parseSheetGrid(dec.decode(xml), shared) });
  }
  return sheets;
}

