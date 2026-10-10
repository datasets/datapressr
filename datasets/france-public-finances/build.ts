// Offline build: raw bytes, retrieval dates, source versions and licences are in archive/manifest.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
process.chdir(fileURLToPath(new URL('.', import.meta.url)));
const manifest = JSON.parse(readFileSync('archive/manifest.json', 'utf8'));
const sourceLabels = JSON.parse(readFileSync('source-labels.json', 'utf8'));
for (const source of manifest.files) {
  const bytes = readFileSync('archive/' + source.file);
  assert.equal(bytes.length, source.bytes, source.file + ': size');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file + ': SHA-256');
}
// Copied from scripts/wrangling-idioms.mjs: RFC 4180, UTF-8, LF, trailing newline.
function toCsv(rows, columns) {
  const esc = (v) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(','), ...rows.map(row => columns.map(c => esc(row[c])).join(','))].join('\n') + '\n';
}
const clean = s => s.replace(/[\u00a0\u200b]/g, ' ').replace(/\s+/g, ' ').trim();
const sorted = (rows, keys) => rows.sort((a, b) => {
  for (const k of keys) { if (a[k] < b[k]) return -1; if (a[k] > b[k]) return 1; }
  return 0;
});
function unique(rows, keys) {
  const seen = new Set();
  for (const row of rows) {
    for (const k of keys) assert.notEqual(String(row[k] ?? '').trim(), '', 'Blank key: ' + k);
    const key = JSON.stringify(keys.map(k => row[k]));
    assert(!seen.has(key), 'Duplicate key ' + key); seen.add(key);
  }
}
function decode(file, ids) {
  const j = JSON.parse(readFileSync('archive/' + file, 'utf8'));
  assert.equal(j.class, 'dataset'); assert.deepEqual(j.id, ids);
  assert.equal(j.updated, manifest.files.find(f => f.file === file).source_updated);
  for (const [dimension, labels] of Object.entries(sourceLabels[file])) {
    assert.deepEqual(j.dimension[dimension].category.label, labels, 'Source category labels changed: ' + file + '/' + dimension);
  }
  const dimensions = j.id.map((id, axis) => {
    const c = j.dimension[id].category;
    const entries = Array.isArray(c.index) ? c.index.map((v, i) => [v, i]) : Object.entries(c.index);
    assert.equal(entries.length, j.size[axis]);
    assert.deepEqual(entries.map(e => e[1]).sort((a, b) => a - b), Array.from({ length: j.size[axis] }, (_, i) => i));
    return entries.sort((a, b) => a[1] - b[1]).map(([code]) => ({ code, label: clean(c.label[code]) }));
  });
  const cells = j.size.reduce((a, b) => a * b, 1);
  for (const key of Object.keys(j.value)) assert(Number.isInteger(+key) && +key >= 0 && +key < cells, 'Out-of-range JSON-stat value');
  const rows = [];
  for (let index = 0; index < cells; index++) {
    let remainder = index;
    const row = {};
    for (let axis = j.id.length - 1; axis >= 0; axis--) {
      row[j.id[axis]] = dimensions[axis][remainder % j.size[axis]];
      remainder = Math.floor(remainder / j.size[axis]);
    }
    const value = j.value[index] ?? null;
    assert(value === null || (typeof value === 'number' && Number.isFinite(value)), 'Invalid numeric observation');
    rows.push({ ...row, value, flag: j.status?.[index] ?? '', updated: j.updated });
  }
  assert.equal(rows.filter(r => r.value !== null).length, Object.values(j.value).filter(v => v !== null).length);
  return rows;
}
const fiscal = decode('fiscal.json', ['freq', 'unit', 'sector', 'na_item', 'geo', 'time']).map(r => {
  assert.equal(r.freq.code, 'A'); assert.equal(r.sector.code, 'S13');
  assert(['MIO_EUR', 'PC_GDP'].includes(r.unit.code));
  return { country_code: r.geo.code, country: r.geo.label, year: Number(r.time.code), indicator: r.na_item.code, indicator_label: r.na_item.label, unit: r.unit.code, value: r.value, status_flag: r.flag, source_updated: r.updated };
});
const fiscalKey = ['country_code', 'year', 'indicator', 'unit'];
unique(fiscal, fiscalKey); sorted(fiscal, fiscalKey);
assert.equal(fiscal.filter(r => r.value !== null).length, 4526, 'Fiscal snapshot observation count changed; review before accepting a refresh');
const fiscalMap = new Map(fiscal.map(r => [[r.country_code, r.year, r.indicator, r.unit].join('|'), r.value]));
const get = (country, year, indicator, unit) => fiscalMap.get([country, year, indicator, unit].join('|'));
for (const country of ['FR', 'DE', 'IT', 'ES', 'EU27_2020']) {
  for (let year = 1975; year <= 2025; year++) {
    for (const unit of ['MIO_EUR', 'PC_GDP']) {
      const [te, tr, balance] = ['TE', 'TR', 'B9'].map(i => get(country, year, i, unit));
      // EU aggregates can accumulate member-country rounding; individual countries retain the tighter bound.
      const tolerance = unit === 'MIO_EUR' ? (country === 'EU27_2020' ? 27 * 0.15 + 0.01 : 0.21) : 0.11;
      if ([te, tr, balance].every(v => v !== null && v !== undefined)) assert(Math.abs(tr - te - balance) <= tolerance, `Revenue minus spending does not equal balance: ${country}, ${year}, ${unit}`);
    }
  }
}
// Literal anchors from the archived official data: detect shifted dimensions and labels.
assert.equal(get('FR', 2025, 'TE', 'MIO_EUR'), 1714137.2);
assert.equal(get('FR', 2025, 'TR', 'MIO_EUR'), 1561626.1);
assert.equal(get('FR', 2025, 'B9', 'PC_GDP'), -5.1);
assert.equal(fiscal.find(r => r.indicator === 'TE').indicator_label, 'Total general government expenditure');
assert.equal(fiscal.find(r => r.indicator === 'TR').indicator_label, 'Total general government revenue');

const functions = decode('functions.json', ['freq', 'unit', 'sector', 'cofog99', 'na_item', 'geo', 'time']).map(r => {
  assert.equal(r.freq.code, 'A'); assert.equal(r.sector.code, 'S13'); assert.equal(r.na_item.code, 'TE'); assert.equal(r.geo.code, 'FR');
  const code = r.cofog99.code;
  assert(code === 'TOTAL' || /^GF\d{2}(\d{2})?$/.test(code));
  return { year: Number(r.time.code), function_code: code, function_name: r.cofog99.label, level: code === 'TOTAL' ? 0 : code.length === 4 ? 1 : 2, parent_code: code === 'TOTAL' ? '' : code.length === 4 ? 'TOTAL' : code.slice(0, 4), unit: r.unit.code, value: r.value, status_flag: r.flag, source_updated: r.updated };
});
const functionKey = ['year', 'function_code', 'unit'];
unique(functions, functionKey); sorted(functions, functionKey);
assert.equal(functions.filter(r => r.value !== null).length, 4800, 'COFOG snapshot observation count changed; review before accepting a refresh');
for (const year of new Set(functions.map(r => r.year))) {
  const rows = functions.filter(r => r.year === year && r.unit === 'MIO_EUR');
  const total = rows.find(r => r.function_code === 'TOTAL');
  const divisions = rows.filter(r => r.level === 1);
  assert.equal(divisions.length, 10);
  if (total.value !== null) {
    assert(divisions.every(r => r.value !== null), 'Incomplete COFOG divisions: ' + year);
    assert(Math.abs(divisions.reduce((a, r) => a + r.value, 0) - total.value) <= 1.1, 'COFOG division sum: ' + year);
  } else assert(divisions.every(r => r.value === null), 'Partial year must be investigated: ' + year);
}
assert.equal(functions.find(r => r.year === 2024 && r.function_code === 'GF10' && r.unit === 'MIO_EUR').value, 693028.8);
assert.equal(functions.find(r => r.function_code === 'GF10').function_name, 'Social protection');
assert.equal(functions.find(r => r.function_code === 'GF07').function_name, 'Health');

const doc = new JSDOM(readFileSync('archive/insee-quarterly-debt.html', 'utf8')).window.document;
function table(caption, headers) {
  const tables = [...doc.querySelectorAll('table')].filter(t => clean(t.querySelector('caption')?.textContent ?? '') === caption);
  assert.equal(tables.length, 1, 'Expected exactly one INSEE table: ' + caption);
  const rows = [...tables[0].rows].map(r => [...r.cells].map(c => clean(c.textContent)));
  assert.deepEqual(rows.shift(), headers, 'INSEE table headers');
  assert.equal(rows.length, 106, 'Quarterly coverage changed: review the snapshot and anchors');
  return rows.map(cells => {
    assert.equal(cells.length, headers.length);
    const match = /^(\d{4})-T([1-4])$/.exec(cells[0]); assert(match, 'Invalid quarter ' + cells[0]);
    const values = cells.slice(1).map(s => { assert(/^\d+(\.\d+)?$/.test(s), 'Invalid debt numeric value ' + s); return Number(s); });
    return { period: match[1] + '-Q' + match[2], year: +match[1], quarter: +match[2], values };
  });
}
const ratios = table('Dette au sens de Maastricht des administrations publiques en points de PIB (*)', ['', 'Dette au sens de Maastricht des administrations publiques en points de PIB (*)']);
const amounts = table('Dette au sens de Maastricht et dette nette', ['', 'Dette de Maastricht', 'Dette nette']);
unique(ratios, ['period']); unique(amounts, ['period']);
assert.deepEqual(ratios.map(r => r.period).sort(), amounts.map(r => r.period).sort());
const ratioMap = new Map(ratios.map(r => [r.period, r.values[0]]));
const debt = sorted(amounts.map(r => ({ period: r.period, period_end: `${r.year}-${['03-31', '06-30', '09-30', '12-31'][r.quarter - 1]}`, gross_debt_eur_billions: r.values[0], net_debt_eur_billions: r.values[1], gross_debt_pct_gdp: ratioMap.get(r.period), source_release_date: '2026-09-29' })), ['period']);
assert.deepEqual([debt[0].period, debt[0].gross_debt_eur_billions, debt[0].gross_debt_pct_gdp], ['2000-Q1', 854.8, 60.5]);
assert.deepEqual([debt.at(-1).period, debt.at(-1).gross_debt_eur_billions, debt.at(-1).net_debt_eur_billions, debt.at(-1).gross_debt_pct_gdp], ['2026-Q2', 3595.5, 3366.8, 119]);
for (let i = 0; i < debt.length; i++) {
  assert.equal(debt[i].period, `${2000 + Math.floor(i / 4)}-Q${i % 4 + 1}`, 'Missing or shifted quarter');
  assert(debt[i].net_debt_eur_billions <= debt[i].gross_debt_eur_billions);
}
function field(name, type, description) { return { name, type, description }; }
const eurostatValueFields = [field('unit', 'string', 'MIO_EUR: millions of current euros; PC_GDP: percentage of GDP. Never sum across units.'), field('value', 'number', 'Official observation; empty means not supplied, never zero. Values retain source precision.'), field('status_flag', 'string', 'Eurostat observation flag, preserved verbatim; p indicates provisional, m missing value, b a break in series, e estimated. Empty means no flag was supplied, not necessarily final data.'), field('source_updated', 'string', 'Eurostat dataset update timestamp, as supplied; denotes the snapshot vintage, not an observation date.')];
const resources = [
  { name: 'fiscal-accounts', title: 'Annual government revenue, expenditure and balances', path: 'data/fiscal-accounts.csv', mediatype: 'text/csv', schema: { fields: [field('country_code', 'string', 'Eurostat geography: FR, DE, ES, IT or EU27_2020. The EU is an aggregate, not another country to add to the others.'), field('country', 'string', 'Official geography label.'), field('year', 'year', 'Annual accounting period.'), field('indicator', 'string', 'ESA 2010 code. TE expenditure; TR total revenue; B9 balance (negative is deficit); D41PAY interest; D2REC, D5REC, D91REC taxes; D61REC net social contributions; D995REC collection adjustment. Other indicators describe economic types of spending and overlap with functional spending.'), field('indicator_label', 'string', 'Eurostat indicator label; components and aggregates must not all be summed together.'), ...eurostatValueFields], primaryKey: fiscalKey } },
  { name: 'spending-functions', title: 'French public spending by function (COFOG)', path: 'data/spending-functions.csv', mediatype: 'text/csv', schema: { fields: [field('year', 'year', 'Annual accounting period; 2025 appears in the API dimension but has no French observations in this snapshot.'), field('function_code', 'string', 'COFOG code, with TOTAL plus division and group codes.'), field('function_name', 'string', 'Official function label. Social protection excludes health in COFOG.'), field('level', 'integer', '0 total; 1 division; 2 group. Sum only mutually exclusive categories at the same level.'), field('parent_code', 'string', 'Parent COFOG code, empty for TOTAL.'), ...eurostatValueFields], primaryKey: functionKey } },
  { name: 'quarterly-debt', title: 'French Maastricht debt, quarterly (latest INSEE vintage)', path: 'data/quarterly-debt.csv', mediatype: 'text/csv', schema: { fields: [field('period', 'string', 'Quarter in YYYY-Qn format.'), field('period_end', 'date', 'Quarter-end date; debt is a stock, not an annual spending flow.'), field('gross_debt_eur_billions', 'number', 'Consolidated general government Maastricht gross debt, nominal billions of euros.'), field('net_debt_eur_billions', 'number', 'INSEE net debt: gross debt less financial assets in the corresponding instruments; not net worth and not net of all public assets.'), field('gross_debt_pct_gdp', 'number', 'Gross debt as percentage of annual GDP, using INSEE quarterly denominator methodology; not percentage of one quarter GDP.'), field('source_release_date', 'date', 'Date of the INSEE release containing the full revised series.')], primaryKey: ['period'] } },
];
for (const [i, rows] of [fiscal, functions, debt].entries()) {
  writeFileSync(resources[i].path, toCsv(rows, resources[i].schema.fields.map(f => f.name)));
  console.log(`${resources[i].path}: ${rows.length} rows; ${rows.filter(r => r.value === null).length} empty observations`);
}
const pkg = JSON.parse(readFileSync('datapackage.json', 'utf8'));
Object.assign(pkg, {
  status: pkg.status === 'stub' ? 'archived' : pkg.status,
  licenses: [
    { name: 'Eurostat reuse policy', title: 'Eurostat statistical data reuse with source acknowledgement', path: 'https://ec.europa.eu/eurostat/help/copyright-notice' },
    { name: 'etalab-2.0', title: 'Licence Ouverte / Open Licence 2.0 (INSEE)', path: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/' },
  ],
  sources: [
    { title: 'Eurostat: government revenue, expenditure and main aggregates (gov_10a_main)', path: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_main/default/table?lang=en' },
    { title: 'Eurostat: general government expenditure by function (gov_10a_exp)', path: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en' },
    { title: 'INSEE: quarterly Maastricht debt, Q2 2026, release 29 September 2026', path: 'https://www.insee.fr/fr/statistiques/9053525' },
  ], resources,
});
writeFileSync('datapackage.json', JSON.stringify(pkg, null, 2) + '\n');
