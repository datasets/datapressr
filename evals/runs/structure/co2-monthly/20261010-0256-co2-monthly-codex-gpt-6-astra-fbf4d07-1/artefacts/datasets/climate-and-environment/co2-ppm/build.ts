// Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
// Retrieved: 2026-08-30. Input: archive/co2_mm_mlo.csv (never fetched).
// Run offline with Node 22+ supporting TypeScript: node build.ts
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const base = new URL('./', import.meta.url);
const text = readFileSync(new URL('archive/co2_mm_mlo.csv', base), 'utf8');
const lines = text.split(/\r?\n/).map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));
assert.equal(lines.shift(), 'year,month,decimal date,average,deseasonalized,ndays,sdev,unc', 'Unexpected source header');
assert(lines.length > 0, 'No source observations');

// Source is unquoted numeric CSV; reject quotes rather than misparse them.
// Preserve numeric spellings, including trailing zeros, after validation.
function numeric(raw, sentinel = undefined) {
  assert(/^-?\d+(?:\.\d+)?$/.test(raw), `Invalid numeric cell: ${raw}`);
  const value = Number(raw);
  assert(Number.isFinite(value), `Non-finite value: ${raw}`);
  if (value === sentinel) return '';
  assert(value >= 0, `Unexpected negative value: ${raw}`);
  return raw;
}

// Deterministic writer copied from structure/references/wrangling-idioms.mjs.
function toCsv(rows, columns) {
  const esc = (v) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map(c => esc(row[c])).join(','));
  return lines.join('\n') + '\n';
}

const seen = new Set();
let previousMonth;
const rows = lines.map(line => {
  const cells = line.split(',').map(cell => cell.trim());
  assert.equal(cells.length, 8, 'Unexpected row width');
  const [year, month, decimal, average, deseasonalized, ndays, sdev, unc] = cells;
  assert(/^\d{4}$/.test(year), 'Missing or invalid year');
  assert(/^\d{1,2}$/.test(month) && +month >= 1 && +month <= 12, 'Missing or invalid month');
  const date = `${year}-${month.padStart(2, '0')}-01`;
  assert(!seen.has(date), `Duplicate month: ${date}`);
  seen.add(date);
  const monthIndex = +year * 12 + +month - 1;
  if (previousMonth !== undefined) assert.equal(monthIndex, previousMonth + 1, `Gap or out-of-order month: ${date}`);
  previousMonth = monthIndex;
  const decimalYear = numeric(decimal);
  assert(+decimalYear >= +year && +decimalYear < +year + 1, 'Decimal year disagrees with year');
  const days = numeric(ndays, -1);
  const maxDays = new Date(Date.UTC(+year, +month, 0)).getUTCDate();
  assert(days === '' || (/^\d+$/.test(days) && +days <= maxDays), 'Invalid measurement-day count');
  return {
    date,
    decimal_year: decimalYear,
    average_ppm: numeric(average, -99.99),
    deseasonalized_ppm: numeric(deseasonalized, -99.99),
    measurement_days: days,
    standard_deviation_ppm: numeric(sdev, -9.99),
    uncertainty_ppm: numeric(unc, -0.99),
  };
});

// Completeness anchors for this archived snapshot, including both endpoints.
assert.equal(rows.length, 821, 'Snapshot row count changed');
assert.equal(rows[0].date, '1958-03-01');
assert.equal(rows.at(-1).date, '2026-07-01');
const columns = ['date', 'decimal_year', 'average_ppm', 'deseasonalized_ppm', 'measurement_days', 'standard_deviation_ppm', 'uncertainty_ppm'];
mkdirSync(new URL('data/', base), { recursive: true });
writeFileSync(new URL('data/co2-monthly.csv', base), toCsv(rows, columns), 'utf8');
console.log(`Wrote ${rows.length} monthly observations to data/co2-monthly.csv`);
