// Oil prices — Europe Brent and Cushing/OK WTI spot prices, from EIA
//
// Source:    U.S. Energy Information Administration, Spot Prices
//            https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm
//            Raw .xls workbooks + retrieval details: archive/PROVENANCE.md
// Retrieved: 2026-09-05  (snapshots in archive/)
// License:   U.S. government work, public domain; EIA asks for acknowledgement.
//            Compilation released as PDDL-1.0. See README.md.
//
// Run:  node build.ts    (Node 22+, native TS; one dependency: `xlsx` — legacy
//                          BIFF8 .xls is not readable by exceljs)
//
// Output (deterministic, one row per observation, ascending by date):
//   data/brent-daily.csv  data/brent-weekly.csv  data/brent-monthly.csv  data/brent-year.csv
//   data/wti-daily.csv    data/wti-weekly.csv    data/wti-monthly.csv    data/wti-year.csv
//
// Notes / gotchas this build handles deliberately:
//   * Excel serial dates are timezone-naive. Reading them as JS Date objects
//     (SheetJS `cellDates:true`) shifts every date by the local UTC offset — here
//     that turned 1987-05-20 into 1987-05-19. We read raw serials and convert with
//     XLSX.SSF.parse_date_code, which is offset-free.
//   * The data sheet has three preamble rows (title, Sourcekey, header) before the
//     first observation. We assert the header cell rather than assume the offset.
//   * Non-trading days are simply absent from the source (no blank-price rows).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const DATA = join(HERE, "data");

/** RFC 4180 CSV writer — quotes any field containing comma, quote, CR or LF. */
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown): string => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

/** Excel serial number -> ISO date string, with no timezone shift. */
function serialToIso(serial: number): string {
  const d = XLSX.SSF.parse_date_code(serial);
  if (!d) throw new Error(`bad Excel date serial: ${JSON.stringify(serial)}`);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.y}-${p(d.m)}-${p(d.d)}`;
}

type Obs = { date: string; price: number };

/** Read one EIA workbook's "Data 1" sheet into sorted {date, price} rows. */
function readSeries(file: string): Obs[] {
  const wb = XLSX.readFile(join(ARCHIVE, file));
  const sheet = wb.Sheets["Data 1"];
  if (!sheet) throw new Error(`${file}: no "Data 1" sheet (found ${wb.SheetNames.join(", ")})`);
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, blankrows: false });

  // Row 0: "Back to Contents" | title. Row 1: "Sourcekey" | code. Row 2: header.
  const header = grid[2] as unknown[];
  if (String(header?.[0]).trim() !== "Date") {
    throw new Error(`${file}: expected "Date" in cell A3, got ${JSON.stringify(header?.[0])} — sheet layout changed`);
  }

  const out: Obs[] = [];
  for (const row of grid.slice(3)) {
    const [rawDate, rawPrice] = row as [unknown, unknown];
    if (rawDate === undefined || rawDate === "") continue;
    if (typeof rawDate !== "number") throw new Error(`${file}: non-numeric date cell ${JSON.stringify(rawDate)}`);
    if (rawPrice === undefined || rawPrice === "") continue; // no blank-price rows expected, but skip if any
    const price = Number(rawPrice);
    if (!Number.isFinite(price)) throw new Error(`${file}: non-numeric price ${JSON.stringify(rawPrice)}`);
    out.push({ date: serialToIso(rawDate), price });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

const SERIES: { file: string; out: string; minRows: number }[] = [
  { file: "RBRTEd.xls", out: "brent-daily.csv", minRows: 9000 },
  { file: "RBRTEw.xls", out: "brent-weekly.csv", minRows: 1900 },
  { file: "RBRTEm.xls", out: "brent-monthly.csv", minRows: 440 },
  { file: "RBRTEa.xls", out: "brent-year.csv", minRows: 35 },
  { file: "RWTCd.xls", out: "wti-daily.csv", minRows: 9000 },
  { file: "RWTCw.xls", out: "wti-weekly.csv", minRows: 1900 },
  { file: "RWTCm.xls", out: "wti-monthly.csv", minRows: 440 },
  { file: "RWTCa.xls", out: "wti-year.csv", minRows: 35 },
];

function main(): void {
  const summary: string[] = [];
  for (const { file, out, minRows } of SERIES) {
    const rows = readSeries(file);
    if (rows.length < minRows) throw new Error(`${file}: only ${rows.length} rows (expected >= ${minRows})`);
    const csvRows = rows.map((r) => ({ Date: r.date, Price: r.price }));
    writeFileSync(join(DATA, out), toCsv(csvRows, ["Date", "Price"]));
    summary.push(`${out} (${rows.length} rows, ${rows[0].date} → ${rows.at(-1)!.date})`);
  }
  console.log("wrote:\n  " + summary.join("\n  "));
}

main();
