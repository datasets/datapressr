// Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
// Landing page: https://gml.noaa.gov/ccgg/trends/data.html
// Retrieved: 2026-08-30 (file header: "File Creation: Wed Aug  5 10:21:49 2026")
// archive/co2_mm_mlo.csv
//
// Reads the archived snapshot and nothing else; writes data/co2-ppm-monthly.csv.
// Run: node build.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ARCHIVE_PATH = join(here, "archive/co2_mm_mlo.csv");
const OUT_PATH = join(here, "data/co2-ppm-monthly.csv");

const EXPECTED_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";

// NOAA's "no information" markers, per column (file header: "indicated by
// negative stdev and uncertainty ... indicated by negative numbers").
const NDAYS_SENTINEL = "-1";
const SDEV_SENTINEL = "-9.99";
const UNC_SENTINEL = "-0.99";

// Two rows carry unc = 0.00 next to the missing-sdev sentinel: not a measured
// uncertainty but a gap NOAA didn't mark with -0.99. Emptied, and pinned here
// so a change upstream is noticed rather than absorbed.
const UNC_ZERO_WITHOUT_SDEV = ["1975-12", "1984-04"];

const COLUMNS = [
  "date",
  "decimal_date",
  "co2_ppm",
  "co2_deseasonalized_ppm",
  "days_measured",
  "daily_stdev_ppm",
  "uncertainty_ppm",
];

type Row = Record<string, string>;

function fail(msg: string): never {
  throw new Error(msg);
}

// Validate a numeric cell and return the source text verbatim, so the
// published value keeps the source's precision (315.70, not 315.7).
function numText(raw: string, where: string): string {
  if (!/^-?\d+(\.\d+)?$/.test(raw)) fail(`${where}: not a plain decimal: ${JSON.stringify(raw)}`);
  return raw;
}

function toCsv(rows: Row[], columns: string[]): string {
  const esc = (v: string | undefined) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

const text = readFileSync(ARCHIVE_PATH, "utf8");
if (text.includes("\r")) fail("unexpected CR line endings in source");

// Strip blank and #-comment lines rather than counting preamble lines.
const lines = text.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
if (lines[0] !== EXPECTED_HEADER) fail(`source header changed: ${JSON.stringify(lines[0])}`);

const out: Row[] = [];
const uncZeroSeen: string[] = [];
let prevMonthIndex: number | undefined;

for (const [i, line] of lines.slice(1).entries()) {
  const cells = line.split(",");
  const where = `data row ${i + 1} (${line})`;
  if (cells.length !== 8) fail(`${where}: expected 8 fields, got ${cells.length}`);
  const [year, month, decimalDate, average, deseasonalized, ndays, sdev, unc] = cells;

  if (!/^\d{4}$/.test(year)) fail(`${where}: bad year`);
  if (!/^\d{1,2}$/.test(month) || +month < 1 || +month > 12) fail(`${where}: bad month`);
  const date = `${year}-${month.padStart(2, "0")}`;

  // Contiguous, strictly increasing months: also proves the key is unique.
  const monthIndex = +year * 12 + (+month - 1);
  if (prevMonthIndex !== undefined && monthIndex !== prevMonthIndex + 1) fail(`${where}: month not contiguous with previous row`);
  prevMonthIndex = monthIndex;

  numText(decimalDate, where);
  if (Math.floor(+decimalDate) !== +year) fail(`${where}: decimal date disagrees with year`);
  const expectedDecimal = +year + (+month - 0.5) / 12;
  if (Math.abs(+decimalDate - expectedDecimal) > 0.01) fail(`${where}: decimal date not mid-month`);

  // The CO2 values themselves have no sentinel in this snapshot; a negative or
  // implausible one means the source changed its conventions.
  for (const [label, v] of [["average", average], ["deseasonalized", deseasonalized]] as const) {
    numText(v, where);
    if (+v < 250 || +v > 600) fail(`${where}: ${label} ${v} outside plausible ppm range`);
  }

  if (ndays !== NDAYS_SENTINEL && !/^\d+$/.test(ndays)) fail(`${where}: bad ndays`);
  if (+ndays > 31) fail(`${where}: ndays > 31`);
  numText(sdev, where);
  numText(unc, where);
  // Any negative other than the documented sentinel is an unknown convention.
  if (sdev.startsWith("-") && sdev !== SDEV_SENTINEL) fail(`${where}: unexpected negative sdev`);
  if (unc.startsWith("-") && unc !== UNC_SENTINEL) fail(`${where}: unexpected negative unc`);

  let uncOut: string | undefined = unc === UNC_SENTINEL ? undefined : unc;
  if (+unc === 0) {
    if (sdev !== SDEV_SENTINEL) fail(`${where}: unc 0.00 with a measured sdev`);
    uncZeroSeen.push(date);
    uncOut = undefined;
  }

  out.push({
    date,
    decimal_date: decimalDate,
    co2_ppm: average,
    co2_deseasonalized_ppm: deseasonalized,
    days_measured: ndays === NDAYS_SENTINEL ? undefined : ndays,
    daily_stdev_ppm: sdev === SDEV_SENTINEL ? undefined : sdev,
    uncertainty_ppm: uncOut,
  } as Row);
}

if (JSON.stringify(uncZeroSeen) !== JSON.stringify(UNC_ZERO_WITHOUT_SDEV)) {
  fail(`unc = 0.00 rows changed: ${uncZeroSeen.join(", ")}`);
}

// Anchors read off the archive by hand: first and last data rows.
const first = out[0];
const last = out[out.length - 1];
if (first.date !== "1958-03" || first.co2_ppm !== "315.71" || first.co2_deseasonalized_ppm !== "314.44") {
  fail(`first row changed: ${JSON.stringify(first)}`);
}
if (last.date !== "2026-07" || last.co2_ppm !== "429.12" || last.days_measured !== "21") {
  fail(`last row changed: ${JSON.stringify(last)}`);
}
if (out.length !== 821) fail(`expected 821 monthly rows, got ${out.length}`);

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, toCsv(out, COLUMNS));
console.log(`wrote ${out.length} rows to data/co2-ppm-monthly.csv (${first.date} to ${last.date})`);
