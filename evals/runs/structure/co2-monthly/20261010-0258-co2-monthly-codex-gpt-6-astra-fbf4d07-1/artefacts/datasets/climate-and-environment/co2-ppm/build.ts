// Run offline: node build.ts (Node 22+ with built-in TypeScript support).
// Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
// Retrieved: 2026-08-30. Input: archive/co2_mm_mlo.csv, never modified.
// Terms: USE OF NOAA GML DATA, quoted in the snapshot and datapackage.json.
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const root = new URL("./", import.meta.url);
const source = readFileSync(new URL("archive/co2_mm_mlo.csv", root), "utf8");
const lines = source.split(/\r?\n/).map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
assert.equal(lines.shift(), "year,month,decimal date,average,deseasonalized,ndays,sdev,unc", "Source header changed");
const columns = ["date", "decimal_year", "average_ppm", "deseasonalized_ppm", "measurement_days", "standard_deviation_ppm", "uncertainty_ppm"];

// This source is unquoted numeric CSV. Reject quotes rather than silently
// treating a future quoted field as simple comma-separated text.
// Keep numeric strings to preserve every source decimal digit and trailing zero.
function numeric(raw: string, sentinels: string[] = []): string {
  assert.match(raw, /^-?\d+(?:\.\d+)?$/, `Invalid numeric cell: ${raw}`);
  assert.ok(Number.isFinite(Number(raw)), `Non-finite cell: ${raw}`);
  if (sentinels.includes(raw)) return "";
  assert.ok(Number(raw) >= 0, `Unexpected negative value: ${raw}`);
  return raw;
}

const seen = new Set<string>();
let previousMonth: number | undefined;
const rows = lines.map((line) => {
  assert.ok(!line.includes('"'), "Quoted source CSV requires a CSV library");
  const cells = line.split(",").map((cell) => cell.trim());
  assert.equal(cells.length, 8, `Unexpected row width: ${line}`);
  const [year, month, decimal, average, deseasonalized, days, sdev, unc] = cells;
  assert.match(year, /^\d{4}$/, "Year must be non-blank and four digits");
  assert.match(month, /^\d{1,2}$/, "Month must be non-blank and numeric");
  const y = Number(year), m = Number(month);
  assert.ok(m >= 1 && m <= 12, "Month out of range");
  const date = `${year}-${month.padStart(2, "0")}-01`;
  assert.ok(!seen.has(date), `Duplicate month: ${date}`);
  seen.add(date);
  const ordinal = y * 12 + m;
  if (previousMonth !== undefined) assert.equal(ordinal, previousMonth + 1, "Months must be ordered and contiguous");
  previousMonth = ordinal;
  const decimalYear = numeric(decimal);
  assert.ok(Number(decimalYear) >= y && Number(decimalYear) < y + 1, "Decimal year disagrees with calendar year");
  const measurementDays = numeric(days, ["-1"]);
  if (measurementDays !== "") {
    assert.match(measurementDays, /^\d+$/, "Day count must be an integer");
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const maxDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
    assert.ok(Number(measurementDays) <= maxDays, "Day count exceeds days in month");
  }
  return {
    date,
    decimal_year: decimalYear,
    average_ppm: numeric(average),
    deseasonalized_ppm: numeric(deseasonalized),
    measurement_days: measurementDays,
    standard_deviation_ppm: numeric(sdev, ["-9.99"]),
    uncertainty_ppm: numeric(unc, ["-0.99"]),
  };
});

// Fixed-snapshot completeness checks: updating the archive requires deliberately
// reviewing coverage and metadata, rather than silently accepting truncation.
assert.equal(rows.length, 821, "Snapshot must contain 821 monthly records");
assert.equal(rows[0].date, "1958-03-01");
assert.equal(rows.at(-1)?.date, "2026-07-01");

// Copied from skills/structure/references/wrangling-idioms.mjs (type annotations added).
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

mkdirSync(new URL("data/", root), { recursive: true });
writeFileSync(new URL("data/co2-monthly.csv", root), toCsv(rows, columns), "utf8");
console.log(`Wrote ${rows.length} monthly records to data/co2-monthly.csv`);
