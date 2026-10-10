// Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
// Landing page: https://gml.noaa.gov/ccgg/trends/data.html
// Retrieved: 2026-08-30; input: archive/co2_mm_mlo.csv
// Run offline: node build.ts (Node 22+ with built-in TypeScript support).
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("./", import.meta.url);
const text = readFileSync(new URL("archive/co2_mm_mlo.csv", root), "utf8");
const lines = text.split(/\r?\n/).map(line => line.trim())
  .filter(line => line !== "" && !line.startsWith("#"));
assert.equal(lines.shift(), "year,month,decimal date,average,deseasonalized,ndays,sdev,unc", "Unexpected source header");

// This source is unquoted numeric CSV. Reject quotes rather than misparse them.
// Return original numeric text to preserve all supplied decimal precision.
function numeric(raw: string, sentinels: number[] = [], integer = false): string {
  assert.match(raw, integer ? /^-?\d+$/ : /^-?\d+(?:\.\d+)?$/, "Invalid numeric cell");
  const n = Number(raw);
  assert.ok(Number.isFinite(n), "Non-finite number");
  if (sentinels.includes(n)) return "";
  assert.ok(n >= 0, `Unexpected negative value: ${raw}`);
  return raw;
}

const seen = new Set<string>();
let previousMonth: number | undefined;
const columns = ["date", "decimal_year", "average_ppm", "deseasonalized_ppm", "ndays", "sdev_ppm", "uncertainty_ppm"];
const rows = lines.map((line, index) => {
  assert.ok(!line.includes('"'), `Quoted input at record ${index + 1}`);
  const cells = line.split(",").map(cell => cell.trim());
  assert.equal(cells.length, 8, `Wrong width at record ${index + 1}`);
  const [year, month, decimal, average, deseasonalized, ndays, sdev, unc] = cells;
  assert.match(year, /^\d{4}$/);
  numeric(month, [], true);
  const y = Number(year), m = Number(month);
  assert.ok(m >= 1 && m <= 12, "Invalid calendar month");
  const date = `${year}-${month.padStart(2, "0")}-01`;
  assert.ok(!seen.has(date), `Duplicate month: ${date}`);
  seen.add(date);
  const ordinal = y * 12 + m;
  if (previousMonth !== undefined) assert.equal(ordinal, previousMonth + 1, "Months must be consecutive and ordered");
  previousMonth = ordinal;
  numeric(decimal);
  assert.ok(Number(decimal) >= y && Number(decimal) < y + 1, "Decimal year outside calendar year");
  const days = numeric(ndays, [-1], true);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  assert.ok(days === "" || Number(days) <= daysInMonth, "Too many observation days");
  return {
    date, decimal_year: decimal,
    average_ppm: numeric(average, [-99.99]),
    deseasonalized_ppm: numeric(deseasonalized, [-99.99]),
    ndays: days, sdev_ppm: numeric(sdev, [-9.99]),
    uncertainty_ppm: numeric(unc, [-0.99]),
  };
});
// Snapshot-specific completeness anchors: update deliberately with a new archive.
assert.equal(rows.length, 821, "Unexpected snapshot row count");
assert.equal(rows[0].date, "1958-03-01");
assert.equal(rows.at(-1)!.date, "2026-07-01");

// Copied from skills/structure/references/wrangling-idioms.mjs; types added.
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '\"\"')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}
mkdirSync(new URL("data/", root), { recursive: true });
writeFileSync(new URL("data/co2-monthly.csv", root), toCsv(rows, columns), "utf8");
console.log(`Wrote ${rows.length} monthly observations.`);
