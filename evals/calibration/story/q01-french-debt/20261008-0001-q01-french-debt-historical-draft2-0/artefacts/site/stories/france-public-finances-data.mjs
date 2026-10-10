// Shared data loading and checked arithmetic for the outline and charts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { csvParse } from 'd3-dsv';
const root = new URL('../../datasets/france-public-finances/data/', import.meta.url);
function read(file, numeric) {
  return csvParse(readFileSync(new URL(file, root), 'utf8'), row => {
    for (const key of numeric) {
      row[key] = row[key] === '' ? null : Number(row[key]);
      assert(row[key] === null || Number.isFinite(row[key]), 'Invalid number ' + key);
    }
    return row;
  });
}
export const fiscal = read('fiscal-accounts.csv', ['year', 'value']);
export const functions = read('spending-functions.csv', ['year', 'level', 'value']);
export const debt = read('quarterly-debt.csv', ['gross_debt_eur_billions', 'net_debt_eur_billions', 'gross_debt_pct_gdp']);
export function fiscalValue(year, indicator, unit = 'PC_GDP', country = 'FR') {
  const rows = fiscal.filter(r => r.year === year && r.indicator === indicator && r.unit === unit && r.country_code === country);
  assert.equal(rows.length, 1); assert.notEqual(rows[0].value, null);
  return rows[0].value;
}
export function functionValue(year, code, unit = 'MIO_EUR') {
  const rows = functions.filter(r => r.year === year && r.function_code === code && r.unit === unit);
  assert.equal(rows.length, 1); assert.notEqual(rows[0].value, null);
  return rows[0].value;
}
const balances = fiscal.filter(r => r.country_code === 'FR' && r.indicator === 'B9' && r.unit === 'PC_GDP' && r.value !== null);
assert.equal(balances.length, 31); assert(balances.every(r => r.value < 0));
export const facts = {
  balance_coverage: [balances[0].year, balances.at(-1).year],
  deficit_years: balances.length,
  fiscal_2025: { spending_eur_billions: fiscalValue(2025, 'TE', 'MIO_EUR') / 1000, revenue_eur_billions: fiscalValue(2025, 'TR', 'MIO_EUR') / 1000, deficit_eur_billions: -fiscalValue(2025, 'B9', 'MIO_EUR') / 1000, spending_pct_gdp: fiscalValue(2025, 'TE'), revenue_pct_gdp: fiscalValue(2025, 'TR'), deficit_pct_gdp: -fiscalValue(2025, 'B9') },
  latest_debt: debt.at(-1),
  deficits: balances.filter(r => r.year >= 2019).map(r => ({ year: r.year, deficit_pct_gdp: -r.value })),
  spending_2024: functions.filter(r => r.year === 2024 && r.level === 1 && r.unit === 'MIO_EUR').map(r => ({ code: r.function_code, name: r.function_name, eur_billions: r.value / 1000, share_pct: r.value / functionValue(2024, 'TOTAL') * 100 })).sort((a, b) => b.eur_billions - a.eur_billions),
  social_and_health_share_pct: (functionValue(2024, 'GF10') + functionValue(2024, 'GF07')) / functionValue(2024, 'TOTAL') * 100,
  revenue_change_2022_2024_pp: fiscalValue(2024, 'TR') - fiscalValue(2022, 'TR'),
  spending_change_2022_2024_pp: fiscalValue(2024, 'TE') - fiscalValue(2022, 'TE'),
  social_protection_pct_gdp: { 2014: functionValue(2014, 'GF10', 'PC_GDP'), 2024: functionValue(2024, 'GF10', 'PC_GDP') },
};
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) console.log(JSON.stringify(facts, null, 2));
