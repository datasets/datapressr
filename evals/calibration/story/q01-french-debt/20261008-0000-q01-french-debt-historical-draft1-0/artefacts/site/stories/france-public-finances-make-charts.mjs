// Implements the independently approved france-public-finances-outline.md.
// cd site/stories && npm ci && node france-public-finances-make-charts.mjs
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as Plot from '@observablehq/plot';
import { fiscal, functions, debt, facts, fiscalValue, functionValue } from './france-public-finances-data.mjs';
const document = new JSDOM('').window.document;
const BLUE = '#2563eb', GREEN = '#147d64', GREY = '#8794a5', INK = '#17212e';
const base = { document, width: 900, height: 350, marginTop: 24, marginBottom: 40, marginLeft: 56, marginRight: 160, style: { fontFamily: 'system-ui, sans-serif', fontSize: 14, background: 'white', color: INK } };
const one = n => n.toFixed(1);
const billions = n => n.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function save(name, plot, title, subtitle, notes) {
  const chart = plot.tagName.toLowerCase() === 'svg' ? plot : plot.querySelector('svg');
  assert(chart);
  const style = plot.querySelector('style');
  if (style && !chart.contains(style)) chart.prepend(style);
  const chartHeight = Number(chart.getAttribute('height'));
  const height = 80 + chartHeight + 30 + notes.length * 23;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', '900'); svg.setAttribute('height', String(height)); svg.setAttribute('viewBox', `0 0 900 ${height}`);
  svg.setAttribute('role', 'img');
  const label = document.createElementNS(svg.namespaceURI, 'title'); label.textContent = title + '. ' + subtitle; svg.append(label);
  const rect = document.createElementNS(svg.namespaceURI, 'rect'); rect.setAttribute('width', '100%'); rect.setAttribute('height', '100%'); rect.setAttribute('fill', 'white'); svg.append(rect);
  function text(content, y, size, weight = 'normal', colour = INK) {
    const t = document.createElementNS(svg.namespaceURI, 'text');
    for (const [key, value] of Object.entries({ x: 20, y, fill: colour, 'font-family': 'system-ui, sans-serif', 'font-size': size, 'font-weight': weight })) t.setAttribute(key, String(value));
    t.textContent = content; svg.append(t);
  }
  text(title, 31, 23, 'bold'); text(subtitle, 57, 14, 'normal', '#536173');
  chart.setAttribute('y', '80'); svg.append(chart);
  notes.forEach((line, i) => text(line, 80 + chartHeight + 23 + i * 23, 13));
  writeFileSync(new URL(`france-public-finances-${name}.svg`, import.meta.url), svg.outerHTML + '\n');
}

// 1. Independent annual series: never coerce missing values to zero or silently bridge a gap.
const series = indicator => {
  const rows = fiscal.filter(r => r.country_code === 'FR' && r.unit === 'PC_GDP' && r.indicator === indicator && r.year >= 1995);
  assert.equal(rows.length, 31); assert(rows.every(r => Number.isFinite(r.value)));
  rows.forEach((r, i) => assert.equal(r.year, 1995 + i));
  return rows;
};
const spending = series('TE'), revenue = series('TR');
const latest = facts.fiscal_2025;
save('gap', Plot.plot({ ...base,
  x: { label: null, domain: [1995, 2025], tickFormat: d => String(d), ticks: 7 },
  y: { label: '% of GDP', labelArrow: 'none', domain: [45, 64], grid: true },
  marks: [
    Plot.line(spending, { x: 'year', y: 'value', stroke: BLUE, strokeWidth: 2.7 }),
    Plot.line(revenue, { x: 'year', y: 'value', stroke: GREEN, strokeWidth: 2.7 }),
    ...[[spending, BLUE, 'Spending'], [revenue, GREEN, 'Revenue']].flatMap(([rows, colour, label]) => [
      Plot.dot([rows.at(-1)], { x: 'year', y: 'value', r: 4, fill: colour }),
      Plot.text([rows.at(-1)], { x: 'year', y: 'value', text: d => `${label} ${one(d.value)}%`, dx: 12, textAnchor: 'start', fill: colour, fontWeight: 'bold' }),
    ]),
    Plot.text([{ year: 2025, value: (latest.spending_pct_gdp + latest.revenue_pct_gdp) / 2 }], { x: 'year', y: 'value', text: () => `Gap: ${one(latest.deficit_pct_gdp)}% GDP`, dx: 12, textAnchor: 'start', fill: INK }),
  ],
}), 'Public spending exceeds revenue throughout the record', 'France, general government, 1995–2025. Vertical axis starts at 45%.', [
  `2025: spending €${billions(latest.spending_eur_billions)}bn; revenue €${billions(latest.revenue_eur_billions)}bn; deficit €${billions(latest.deficit_eur_billions)}bn.`,
  `2022 → 2024: revenue ${one(fiscalValue(2022, 'TR'))}% → ${one(fiscalValue(2024, 'TR'))}% (−${one(-facts.revenue_change_2022_2024_pp)} points); spending ${one(fiscalValue(2022, 'TE'))}% → ${one(fiscalValue(2024, 'TE'))}% (−${one(-facts.spending_change_2022_2024_pp)} points).`,
  'Source: Eurostat gov_10a_main, July 2026 snapshot. Revenue includes social contributions and other receipts.',
]);

// 2. Only mutually exclusive COFOG divisions; shares use the same resource's total.
const mix = facts.spending_2024;
assert.equal(mix.length, 10);
assert(Math.abs(mix.reduce((s, r) => s + r.eur_billions, 0) - functionValue(2024, 'TOTAL') / 1000) <= 0.0011);
save('spending', Plot.plot({ ...base, height: 440, marginLeft: 278, marginRight: 145,
  x: { domain: [0, 750], label: 'Billions of euros, current prices', labelArrow: 'none', grid: true, ticks: 5 },
  y: { label: null, domain: mix.map(r => r.name), tickSize: 0 },
  marks: [
    Plot.barX(mix, { x: 'eur_billions', y: 'name', fill: d => d.code === 'GF10' ? BLUE : d.code === 'GF07' ? GREEN : GREY }),
    Plot.ruleX([0]),
    Plot.text(mix, { x: 'eur_billions', y: 'name', text: d => `€${one(d.eur_billions)}bn · ${one(d.share_pct)}%`, dx: 7, textAnchor: 'start' }),
  ],
}), 'Social protection and health account for most spending', `France, 2024: €${billions(functionValue(2024, 'TOTAL') / 1000)}bn total. Labels show amount and share of spending.`, [
  `Social protection + health: ${one(facts.social_and_health_share_pct)}%. Old age: €${one(functionValue(2024, 'GF1002') / 1000)}bn, already inside social protection.`,
  `Scale is not growth: social protection was ${one(functionValue(2014, 'GF10', 'PC_GDP'))}% of GDP in 2014 and ${one(functionValue(2024, 'GF10', 'PC_GDP'))}% in 2024.`,
  'Source: Eurostat COFOG, September 2026 snapshot. 2024 is provisional; 2025 French values are unavailable.',
]);

// 3. Deficit magnitudes derived from the signed annual balance, not rounded TR minus TE.
assert.equal(facts.deficits.length, 7);
assert(facts.deficits.every(r => r.deficit_pct_gdp > 0));
save('deficits', Plot.plot({ ...base, height: 280, marginRight: 35,
  x: { label: null, type: 'band', tickFormat: d => String(d) },
  y: { label: 'Deficit, % of GDP', labelArrow: 'none', domain: [0, 10], grid: true },
  marks: [
    Plot.barY(facts.deficits, { x: 'year', y: 'deficit_pct_gdp', fill: d => d.year === 2025 ? BLUE : GREY, insetLeft: 16, insetRight: 16 }),
    Plot.ruleY([0]),
    Plot.text(facts.deficits, { x: 'year', y: 'deficit_pct_gdp', text: d => one(d.deficit_pct_gdp) + '%', dy: -12, fontWeight: 'bold' }),
  ],
}), 'The deficit narrowed in 2025', 'France, annual general government deficit. Positive bars show the size of the shortfall.', [
  'Source: Eurostat gov_10a_main, July 2026 snapshot. Observed annual accounts; no 2026 forecast included.',
]);

// 4. One coherent quarterly vintage; debt amounts appear only as an annotation, not a second axis.
assert.equal(debt.length, 106);
const debtSeries = debt.map((r, i) => {
  assert.equal(r.period, `${2000 + Math.floor(i / 4)}-Q${i % 4 + 1}`);
  return { ...r, date: new Date(r.period_end + 'T00:00:00Z') };
});
const periods = ['2007-Q4', '2019-Q4', '2020-Q4', '2023-Q4', '2026-Q2'];
const points = periods.map(period => { const row = debtSeries.find(r => r.period === period); assert(row); return row; });
save('debt', Plot.plot({ ...base, height: 345, marginRight: 190,
  x: { type: 'utc', label: null, ticks: 7, tickFormat: d => String(d.getUTCFullYear()) },
  y: { label: 'Gross debt, % of GDP', labelArrow: 'none', domain: [50, 130], grid: true },
  marks: [
    Plot.line(debtSeries, { x: 'date', y: 'gross_debt_pct_gdp', stroke: BLUE, strokeWidth: 2.7 }),
    Plot.dot(points, { x: 'date', y: 'gross_debt_pct_gdp', fill: BLUE, r: 3.5 }),
    ...points.map((p, i) => Plot.text([p], { x: 'date', y: 'gross_debt_pct_gdp', text: d => `${d.period === '2026-Q2' ? 'Q2 2026' : d.period.slice(0, 4)}: ${one(d.gross_debt_pct_gdp)}%`, dx: i === 4 ? 10 : i === 1 ? -14 : 0, dy: [22, 22, -22, 25, 0][i], textAnchor: i === 4 ? 'start' : i === 1 ? 'end' : 'middle', fontWeight: 'bold', fill: BLUE })),
    Plot.text([points.at(-1)], { x: 'date', y: 'gross_debt_pct_gdp', text: d => `€${billions(d.gross_debt_eur_billions)}bn`, dx: 10, dy: 24, textAnchor: 'start' }),
  ],
}), 'Debt rose over time, with a post-pandemic fall in the ratio', 'France, quarter-end Maastricht gross debt, 2000–Q2 2026. Vertical axis starts at 50%.', [
  'Source: INSEE, 29 September 2026 release. Entire series uses that release’s revised history.',
  'Debt is a stock; annual deficits are flows. Financial transactions and GDP changes also affect this ratio.',
]);
console.log('Built four French public finance charts.');
