// Source: NOAA Global Monitoring Laboratory, Trends in Atmospheric Carbon Dioxide,
// Mauna Loa monthly mean CO2
//   https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
//   (landing page https://gml.noaa.gov/ccgg/trends/data.html)
// Retrieved: 2026-08-30 (file header: "File Creation: Wed Aug  5 10:21:49 2026")
// archive/co2_mm_mlo.csv
//
// Run: node build.ts   (offline; reads archive/ only, writes data/co2-ppm-monthly.csv)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ARCHIVE_PATH = "archive/co2_mm_mlo.csv";
const OUT_PATH = "data/co2-ppm-monthly.csv";

const EXPECTED_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";

// Per-column "no information" sentinels, as documented in the file's preamble
// ("indicated by negative stdev and uncertainty"; ndays -1 for SIO data).
const NDAYS_SENTINELS = [-1];
const SDEV_SENTINELS = [-9.99];
const UNC_SENTINELS = [-0.99];

const COLUMNS = [
  "date",
  "decimal_date",
  "average_ppm",
  "deseasonalized_ppm",
  "n_days",
  "daily_sdev_ppm",
  "uncertainty_ppm",
];

// Strict numeric parser with per-column sentinels (from wrangling-idioms.mjs).
function num(raw: string, sentinels: number[] = []): number | undefined {
  const s = raw.trim();
  if (s === "") return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`non-numeric value: ${JSON.stringify(raw)}`);
  return sentinels.includes(n) ? undefined : n;
}

// Deterministic RFC 4180 CSV writer, LF endings + trailing newline (from wrangling-idioms.mjs).
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

const text = readFileSync(ARCHIVE_PATH, "utf8");
assert(!text.includes("\r"), "archive has LF line endings");

// Drop the `#` preamble and blank lines; the first remaining line is the header.
const lines = text.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
assert(lines[0] === EXPECTED_HEADER, `header is ${JSON.stringify(EXPECTED_HEADER)}, got ${JSON.stringify(lines[0])}`);

const rows: Record<string, string | undefined>[] = [];
let prevIndex: number | undefined;
for (const [i, line] of lines.slice(1).entries()) {
  const cells = line.split(",");
  assert(cells.length === 8, `data line ${i + 1} has 8 cells: ${line}`);
  const [year, month, decimal, average, deseasonalized, ndays, sdev, unc] = cells;

  const y = num(year);
  const m = num(month);
  assert(Number.isInteger(y) && /^\d{4}$/.test(year), `year is 4 digits: ${line}`);
  assert(Number.isInteger(m) && m! >= 1 && m! <= 12, `month is 1-12: ${line}`);

  // Contiguous, strictly increasing months: proves the key is unique and no month is missing.
  const index = y! * 12 + (m! - 1);
  if (prevIndex !== undefined) assert(index === prevIndex + 1, `months are contiguous at ${line}`);
  prevIndex = index;

  // Cross-check the decimal date against year/month (mid-month, within ~3 days).
  const dec = num(decimal)!;
  assert(Math.abs(dec - (y! + (m! - 0.5) / 12)) < 0.01, `decimal date agrees with year/month: ${line}`);

  // The monthly means are never missing in this file (missing months are interpolated by NOAA).
  const avg = num(average, [-99.99]);
  const des = num(deseasonalized, [-99.99]);
  assert(avg !== undefined && avg > 250 && avg < 600, `average in plausible range: ${line}`);
  assert(des !== undefined && des > 250 && des < 600, `deseasonalized in plausible range: ${line}`);

  const nd = num(ndays, NDAYS_SENTINELS);
  const sd = num(sdev, SDEV_SENTINELS);
  let un = num(unc, UNC_SENTINELS);
  assert(nd === undefined || (Number.isInteger(nd) && nd >= 0 && nd <= 31), `ndays is a day count: ${line}`);
  assert(sd === undefined || sd > 0, `sdev is positive or a sentinel: ${line}`);
  // Two rows (1975-12, 1984-04) carry the sdev sentinel with unc = 0.00. A zero
  // uncertainty is not a measurement; in a row with no sdev it is "no information" too.
  if (sd === undefined && un === 0) un = undefined;
  assert(un === undefined || un > 0, `unc is positive or a sentinel: ${line}`);

  rows.push({
    date: `${year}-${String(m).padStart(2, "0")}`,
    // Keep the source's text (and so its precision, e.g. "314.80") for every value kept.
    decimal_date: decimal,
    average_ppm: average,
    deseasonalized_ppm: deseasonalized,
    n_days: nd === undefined ? undefined : ndays,
    daily_sdev_ppm: sd === undefined ? undefined : sdev,
    uncertainty_ppm: un === undefined ? undefined : unc,
  });
}

// Anchors read off the snapshot by hand: first and last month.
assert(rows[0].date === "1958-03" && rows[0].average_ppm === "315.71", "first row is 1958-03, 315.71 ppm");
assert(rows.length >= 821, `at least 821 months (got ${rows.length})`);

mkdirSync("data", { recursive: true });
writeFileSync(OUT_PATH, toCsv(rows, COLUMNS));
console.log(`wrote ${rows.length} rows to ${OUT_PATH} (${rows[0].date} to ${rows[rows.length - 1].date})`);
