// Implements the independently approved france-public-finances-outline.md.
// cd site/stories && npm ci && node france-public-finances-make-charts.mjs
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as Plot from '@observablehq/plot';
import { hierarchy, treemap } from 'd3-hierarchy';
import { fiscal, functions, debt, facts, fiscalValue, functionValue } from './france-public-finances-data.mjs';
const document = new JSDOM('').window.document;
const BLUE = '#2563eb', GREEN = '#147d64', GREY = '#8794a5', INK = '#17212e';
const base = { document, width: 900, height: 350, marginTop: 24, marginBottom: 40, marginLeft: 56, marginRight: 160, style: { fontFamily: 'system-ui, sans-serif', fontSize: 14, background: 'white', color: INK } };
const one = n => n.toFixed(1);
const whole = n => Math.round(n).toLocaleString('en-GB');
const trillions = n => (n / 1000).toFixed(2);
const billions = n => n.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function save(name, plot, title, subtitle, notes, width = 900) {
  const chart = plot.tagName.toLowerCase() === 'svg' ? plot : plot.querySelector('svg');
  assert(chart);
  chart.style.fontFamily = 'system-ui, sans-serif';
  chart.style.fontSize = width === 600 ? '17px' : '14px';
  const style = plot.querySelector('style');
  if (style && !chart.contains(style)) chart.prepend(style);
  const chartHeight = Number(chart.getAttribute('height'));
  const height = 80 + chartHeight + 30 + notes.length * 23;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height)); svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
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
  assert(!svg.outerHTML.includes('NaN'), 'Non-finite chart geometry: ' + name);
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
    Plot.text(mix, { x: 'eur_billions', y: 'name', text: d => `€${whole(d.eur_billions)}bn · ${one(d.share_pct)}%`, dx: 7, textAnchor: 'start' }),
  ],
}), 'Social protection and health account for most spending', `France, 2024: €${trillions(functionValue(2024, 'TOTAL') / 1000)}tn total. Labels show amount and share of spending.`, [
  `Social protection + health: ${one(facts.social_and_health_share_pct)}%. Old age: €${whole(functionValue(2024, 'GF1002') / 1000)}bn, already inside social protection.`,
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
    Plot.text([points.at(-1)], { x: 'date', y: 'gross_debt_pct_gdp', text: d => `€${one(d.gross_debt_eur_billions / 1000)} trillion`, dx: 10, dy: 24, textAnchor: 'start' }),
  ],
}), 'Debt rose over time, with a post-pandemic fall in the ratio', 'France, quarter-end Maastricht gross debt, 2000–Q2 2026. Vertical axis starts at 50%.', [
  'Source: INSEE, 29 September 2026 release. Entire series uses that release’s revised history.',
  'Debt is a stock; annual deficits are flows. Financial transactions and GDP changes also affect this ratio.',
]);


// 5. A compact, zero-based visual comparison; geometry uses unrounded source totals.
const snapshot = [{ name: 'Revenue', value: latest.revenue_eur_billions / 1000, colour: GREEN }, { name: 'Spending', value: latest.spending_eur_billions / 1000, colour: BLUE }];
const coverage = latest.revenue_eur_billions / latest.spending_eur_billions * 100;
save('snapshot', Plot.plot({ ...base, width: 600, height: 138, marginTop: 10, marginBottom: 25, marginLeft: 94, marginRight: 94, style: { ...base.style, fontSize: 17 },
  x: { domain: [0, 1.8], axis: null }, y: { domain: ['Revenue', 'Spending'], label: null, tickSize: 0 },
  marks: [Plot.barX(snapshot, { x: 'value', y: 'name', fill: 'colour', insetTop: 8, insetBottom: 8 }), Plot.ruleX([0]), Plot.text(snapshot, { x: 'value', y: 'name', text: d => `€${d.value.toFixed(2)}tn`, dx: 8, textAnchor: 'start', fontWeight: 'bold' })],
}), `€${whole(latest.deficit_eur_billions)}bn more spent than raised`, 'France, 2025 · general government · amounts rounded', [
  `For every €100 spent: €${whole(coverage)} in receipts, €${whole(100 - coverage)} deficit.`,
  `Deficit: ${one(latest.deficit_pct_gdp)}% of GDP. Source: Eurostat annual accounts.`,
], 600);

// 6. The nine children form the parent; zero values have no invented area.
const shortNames = { GF1001: 'Sickness & disability', GF1002: 'Old age', GF1003: 'Survivors', GF1004: 'Family & children', GF1005: 'Unemployment', GF1006: 'Housing support', GF1007: 'Social exclusion', GF1008: 'Research', GF1009: 'Other protection' };
const children = functions.filter(r => r.year === 2024 && r.parent_code === 'GF10' && r.unit === 'MIO_EUR').map(r => ({ ...r, name: shortNames[r.function_code], amount: r.value / 1000 }));
assert.equal(children.length, 9);assert(children.every(r => Number.isFinite(r.value)));
assert(Math.abs(children.reduce((s,r) => s+r.value,0) - functionValue(2024, 'GF10')) < 1);
const tree = treemap().size([860, 355]).paddingInner(3).round(false)(hierarchy({ children }).sum(d => d.amount || 0).sort((a,b) => b.value-a.value));
const tiles = tree.leaves().filter(d=>d.value>0).map(d=>({ ...d.data, x0:d.x0, x1:d.x1, y0:d.y0, y1:d.y1 }));
const treeColours = ['#2563eb','#417dbc','#5790bb','#72a1bd','#86b3c6','#a8cbd3','#c2dce1','#dee9ec'];
const normalTiles = tiles.filter(d=>d.function_code !== 'GF1009');
const tiny = tiles.filter(d=>d.function_code === 'GF1009');
const oldShare = functionValue(2024,'GF1002') / functionValue(2024,'GF10') * 100;
const oldTotalShare = functionValue(2024,'GF1002') / functionValue(2024,'TOTAL') * 100;
save('social', Plot.plot({ ...base, height: 365, marginTop: 0, marginBottom: 10, marginLeft: 20, marginRight: 20,
  x: { domain: [0,860], axis: null }, y: { domain: [355,0], axis: null },
  color: { domain: tiles.map(d=>d.function_code), range: treeColours },
  marks: [
    Plot.rect(tiles,{ x1:'x0',x2:'x1',y1:'y0',y2:'y1',fill:'function_code',title:d=>`${d.name}: €${one(d.amount)}bn` }),
    Plot.text(normalTiles,{ x:d=>(d.x0+d.x1)/2,y:d=>(d.y0+d.y1)/2,text:'name',dy:-12,fontSize:d=>(d.x1-d.x0)<130?12:15,fontWeight:'bold',fill:d=>d.function_code==='GF1002'?'white':INK }),
    Plot.text(normalTiles,{ x:d=>(d.x0+d.x1)/2,y:d=>(d.y0+d.y1)/2,text:d=>`€${whole(d.amount)}bn`,dy:13,fontSize:19,fill:d=>d.function_code==='GF1002'?'white':INK }),
    Plot.text(tiny,{ x:d=>(d.x0+d.x1)/2,y:d=>(d.y0+d.y1)/2,text:()=>'*',fontWeight:'bold',fontSize:18 }),
  ],
}), 'Inside social protection: old age takes the largest share', `France, 2024 · €${whole(functionValue(2024,'GF10')/1000)}bn · old age: ${whole(oldShare)}% of this total, ${whole(oldTotalShare)}% of all public spending`, [
  `* Other protection: €${one(functionValue(2024,'GF1009')/1000)}bn. Research: €0 (no rectangle). Areas use unrounded amounts.`,
  'Health is a separate budget purpose. Survivors and old age remain separate categories.',
  'Source: Eurostat COFOG. Social exclusion and other protection: categories not elsewhere classified.',
]);

// 7. Evolution in a common denominator, plus all subgroup endpoints on a common zero scale.
const history = code => {
  const rows = functions.filter(r=>r.function_code===code&&r.unit==='PC_GDP'&&r.year>=1995&&r.year<=2024);
  assert.equal(rows.length,30);rows.forEach((r,i)=>{assert.equal(r.year,1995+i);assert(Number.isFinite(r.value));});return rows;
};
const socialHistory=history('GF10'), healthHistory=history('GF07');
const aggregate=Plot.plot({ ...base,height:270,marginRight:195,
  x:{domain:[1995,2024],tickFormat:String,label:null,ticks:7}, y:{domain:[0,30],label:'% of GDP',labelArrow:'none',grid:true},
  marks:[
    Plot.line(socialHistory,{x:'year',y:'value',stroke:BLUE,strokeWidth:2.8}),
    Plot.line(healthHistory,{x:'year',y:'value',stroke:GREEN,strokeWidth:2.8}),
    ...[[socialHistory,BLUE,'Social protection'],[healthHistory,GREEN,'Health']].flatMap(([rows,colour,name])=>[
      Plot.dot(rows.filter(r=>[1995,2014,2020,2024].includes(r.year)),{x:'year',y:'value',fill:colour,r:3}),
      ...rows.filter(r=>[1995,2014,2020].includes(r.year)).map(r=>Plot.text([r],{x:'year',y:'value',text:d=>`${d.year}: ${one(d.value)}%`,dy:name==='Health'?20:-15,dx:r.year===1995?4:0,textAnchor:r.year===1995?'start':'middle',fill:colour,fontSize:13})),
      Plot.text([rows.at(-1)],{x:'year',y:'value',text:d=>`${name} ${one(d.value)}%`,dx:8,textAnchor:'start',fill:colour,fontWeight:'bold'}),
    ]),
  ],
});
const subgroup = children.sort((a,b)=>b.value-a.value).map(r=>({name:r.name,before:functionValue(2014,r.function_code,'PC_GDP'),after:functionValue(2024,r.function_code,'PC_GDP')}));
const compare=Plot.plot({...base,height:345,marginTop:30,marginLeft:195,marginRight:165,
  x:{domain:[0,15],label:'% of GDP',labelArrow:'none',grid:true,ticks:6},y:{domain:subgroup.map(r=>r.name),label:null,tickSize:0},
  marks:[Plot.ruleY(subgroup,{y:'name',x1:'before',x2:'after',stroke:'#9ba8b6',strokeWidth:3}),Plot.dot(subgroup,{x:'before',y:'name',r:5,fill:'white',stroke:GREY,strokeWidth:2}),Plot.dot(subgroup,{x:'after',y:'name',r:3.5,fill:BLUE}),Plot.text(subgroup,{x:()=>15,y:'name',text:d=>`${one(d.before)} → ${one(d.after)}%`,dx:12,textAnchor:'start'})],
});
const combined=document.createElementNS('http://www.w3.org/2000/svg','svg');combined.setAttribute('width','900');combined.setAttribute('height','670');
aggregate.setAttribute('y','0');aggregate.style.fontSize='14px';combined.append(aggregate);
const subheading=document.createElementNS(combined.namespaceURI,'text');subheading.setAttribute('x','20');subheading.setAttribute('y','300');subheading.setAttribute('font-family','system-ui, sans-serif');subheading.setAttribute('font-size','16');subheading.setAttribute('font-weight','bold');subheading.textContent='Inside social protection · 2014 ○ → 2024 ● · share of GDP';combined.append(subheading);
compare.setAttribute('y','315');compare.style.fontSize='14px';combined.append(compare);
const nominalChange=functionValue(2024,'GF10')-functionValue(2014,'GF10');
const oldChange=functionValue(2024,'GF1002')-functionValue(2014,'GF1002');
save('evolution',combined,'More euros does not always mean a larger share of the economy','France · annual spending as a share of GDP · full history and a ten-year comparison',[
  `2014 → 2024: social protection €${whole(functionValue(2014,'GF10')/1000)}bn → €${whole(functionValue(2024,'GF10')/1000)}bn (+${whole(nominalChange/functionValue(2014,'GF10')*100)}%, current prices).`,
  `Old age accounts for €${whole(oldChange/1000)}bn (${whole(oldChange/nominalChange*100)}%) of the €${whole(nominalChange/1000)}bn nominal increase.`,
  'GDP shares are not inflation-adjusted spending volumes. Source: Eurostat COFOG, September 2026 snapshot.',
]);
console.log('Built seven French public finance charts.');
