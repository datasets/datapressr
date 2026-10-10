// Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
// Landing page: https://gml.noaa.gov/ccgg/trends/data.html
// Retrieved: 2026-08-30 (file header: "File Creation: Wed Aug  5 10:21:49 2026")
// archive/co2_mm_mlo.csv
//
// Run: node build.ts  (offline; reads archive/ only, writes data/co2-ppm-monthly.csv)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ARCHIVE_PATH = "archive/co2_mm_mlo.csv";
const OUT_PATH = "data/co2-ppm-monthly.csv";

const SOURCE_HEADER = ["year", "month", "decimal date", "average", "deseasonalized", "ndays", "sdev", "unc"];
const COLUMNS = [
  "date",
  "decimal_date",
  "co2_ppm",
  "co2_deseasonalized_ppm",
  "n_days",
  "daily_sdev_ppm",
  "uncertainty_ppm",
];

// "No information" sentinels, per column, as documented in the file header
// (negative ndays/sdev/unc). -99.99 is NOAA's historical missing marker for the
// mole fractions; none occur in this snapshot but a refresh could carry one.
const SENTINELS: Record<string, number[]> = {
  average: [-99.99],
  deseasonalized: [-99.99],
  ndays: [-1],
  sdev: [-9.99],
  unc: [-0.99],
};

// Copied from skills/structure/references/wrangling-idioms.mjs.
function num(raw: string, sentinels: number[] = []): number | undefined {
  const s = String(raw).trim();
  if (s === "") return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`non-numeric value: ${JSON.stringify(raw)}`);
  return sentinels.includes(n) ? undefined : n;
}

// Copied from skills/structure/references/wrangling-idioms.mjs.
function toCsv(rows: Record<string, string | undefined>[], columns: string[]): string {
  const esc = (v: string | undefined) => {
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
assert(!text.includes("\r"), "source has CR line endings");

// Strip the `#` preamble and blank lines; the first remaining line is the header.
const lines = text.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
const header = lines[0].split(",");
assert(
  header.length === SOURCE_HEADER.length && header.every((h, i) => h === SOURCE_HEADER[i]),
  `source header changed: ${lines[0]}`,
);

const rows: Record<string, string | undefined>[] = [];
let prev: { year: number; month: number } | undefined;
for (const line of lines.slice(1)) {
  const cells = line.split(",");
  assert(cells.length === SOURCE_HEADER.length, `row has ${cells.length} cells: ${line}`);
  assert(!line.includes('"'), `quoted field in source (plain split no longer safe): ${line}`);
  const src = Object.fromEntries(SOURCE_HEADER.map((h, i) => [h, cells[i].trim()]));

  const year = Number(src.year);
  const month = Number(src.month);
  assert(/^\d{4}$/.test(src.year) && /^\d{1,2}$/.test(src.month) && month >= 1 && month <= 12, `bad year/month: ${line}`);

  // One row per month, ascending, no gaps.
  if (prev) {
    const expected = prev.month === 12 ? { year: prev.year + 1, month: 1 } : { year: prev.year, month: prev.month + 1 };
    assert(year === expected.year && month === expected.month, `months not contiguous at ${line}`);
  }
  prev = { year, month };

  // decimal date must fall inside its own month.
  const dec = num(src["decimal date"]);
  assert(dec !== undefined && dec >= year + (month - 1) / 12 && dec < year + month / 12, `decimal date outside month: ${line}`);

  // Keep the source's own number text (precision, trailing zeros); only map
  // sentinels to empty. Anything else negative is unexpected and fails the build.
  const keep = (col: string): string | undefined => {
    const n = num(src[col], SENTINELS[col]);
    if (n === undefined) return undefined;
    assert(n >= 0, `unexpected negative ${col} (not a documented sentinel): ${line}`);
    return src[col];
  };

  const co2 = keep("average");
  const deseas = keep("deseasonalized");
  for (const [col, v] of [["average", co2], ["deseasonalized", deseas]] as const) {
    assert(v === undefined || (Number(v) > 250 && Number(v) < 600), `implausible ${col}: ${line}`);
  }
  const nDays = keep("ndays");
  assert(nDays === undefined || (/^\d+$/.test(nDays) && Number(nDays) <= 31), `bad ndays: ${line}`);

  rows.push({
    date: `${src.year}-${String(month).padStart(2, "0")}`,
    decimal_date: src["decimal date"],
    co2_ppm: co2,
    co2_deseasonalized_ppm: deseas,
    n_days: nDays,
    daily_sdev_ppm: keep("sdev"),
    uncertainty_ppm: keep("unc"),
  });
}

// Anchors read by hand off the snapshot: first and last rows.
assert(rows[0].date === "1958-03" && rows[0].co2_ppm === "315.71", "first row moved");
assert(rows.length >= 821, `expected at least 821 months, got ${rows.length}`);

mkdirSync("data", { recursive: true });
writeFileSync(OUT_PATH, toCsv(rows, COLUMNS));
console.log(`wrote ${rows.length} rows to ${OUT_PATH} (${rows[0].date} to ${rows[rows.length - 1].date})`);
