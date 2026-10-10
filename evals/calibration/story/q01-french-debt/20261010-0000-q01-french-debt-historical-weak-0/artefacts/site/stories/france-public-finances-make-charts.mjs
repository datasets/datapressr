// Negative control for critic calibration (datapressr-hcn.8): deliberately weak "chart soup".
// Run from site/stories in a workspace that has datasets/france-public-finances at f0082af.
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import * as Plot from '@observablehq/plot';
import { csvParse } from 'd3-dsv';

const document = new JSDOM('').window.document;
const data = (name) => csvParse(readFileSync(new URL(`../../datasets/france-public-finances/data/${name}.csv`, import.meta.url), 'utf8'), (r) => ({ ...r, year: r.year ? +r.year : undefined, value: r.value === '' || r.value === undefined ? null : +r.value }));
const fiscal = data('fiscal-accounts');
const functions = data('spending-functions');
const debt = csvParse(readFileSync(new URL('../../datasets/france-public-finances/data/quarterly-debt.csv', import.meta.url), 'utf8'), d3row => ({ ...d3row, gross: +d3row.gross_debt_eur_billions, net: +d3row.net_debt_eur_billions }));

function save(name, plot) {
  const svg = plot.tagName.toLowerCase() === 'svg' ? plot : plot.querySelector('svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  writeFileSync(new URL(`france-public-finances-${name}.svg`, import.meta.url), svg.outerHTML + '\n');
}

const fr = fiscal.filter((r) => r.country_code === 'FR' && r.value !== null);

// 1. Every French indicator as a share of GDP, one line each.
save('indicators', Plot.plot({ document, width: 700, height: 400, y: { label: 'value' }, marks: [Plot.lineY(fr.filter((r) => r.unit === 'PC_GDP'), { x: 'year', y: 'value', stroke: 'indicator' })] }));

// 2. Revenue and expenditure in million euros for every country.
save('countries', Plot.plot({ document, width: 700, height: 400, marks: [Plot.lineY(fiscal.filter((r) => r.unit === 'MIO_EUR' && (r.indicator === 'TE' || r.indicator === 'TR') && r.value !== null), { x: 'year', y: 'value', stroke: 'country_code', z: (r) => r.country_code + r.indicator })] }));

// 3. Spending by function, 2024, million euros, top-level codes.
const f24 = functions.filter((r) => r.year === 2024 && r.level === '1' && r.unit === 'MIO_EUR');
save('functions', Plot.plot({ document, width: 700, height: 360, marginLeft: 60, marks: [Plot.barY(f24, { x: 'function_code', y: 'value', fill: 'function_code' }), Plot.text(f24, { x: 'function_code', y: 'value', text: (r) => String(r.value), dy: -6 })] }));

// 4. Quarterly gross and net debt.
const long = debt.flatMap((r) => [{ period: r.period, kind: 'gross', v: r.gross }, { period: r.period, kind: 'net', v: r.net }]);
save('debt', Plot.plot({ document, width: 700, height: 360, x: { tickRotate: -90 }, marks: [Plot.barY(long, { x: 'period', y: 'v', fill: 'kind' })] }));

// 5. Deficits for every country.
save('deficits', Plot.plot({ document, width: 700, height: 360, marks: [Plot.dot(fiscal.filter((r) => r.indicator === 'B9' && r.unit === 'PC_GDP' && r.value !== null && r.year >= 2000), { x: 'year', y: 'value', fill: 'country_code' })] }));

// 6. Second-level spending codes, 2024, share of GDP.
const f2 = functions.filter((r) => r.year === 2024 && r.level === '2' && r.unit === 'PC_GDP' && r.value !== null);
save('subfunctions', Plot.plot({ document, width: 700, height: 360, x: { tickRotate: -90 }, marginBottom: 60, marks: [Plot.barY(f2, { x: 'function_code', y: 'value' })] }));
