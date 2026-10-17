// Regenerate the SVG charts embedded in french-debt.md.
//   npm ci && node french-debt-make-charts.mjs
//
// Implements the approved chart plan in french-debt-outline.md. Every labelled
// value is read from the dataset's CSVs; a missing row fails the build.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { csvParse } from "d3-dsv";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "france-public-finances", "data");
const { window } = new JSDOM("");
const document = window.document;

const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const fiscal = csvParse(readFileSync(join(DATA, "fiscal-accounts.csv"), "utf8"));
const debt = csvParse(readFileSync(join(DATA, "quarterly-debt.csv"), "utf8"));

/** One % of GDP value from fiscal-accounts; throws if missing or empty. */
function pct(geo, year, indicator) {
  const row = fiscal.find(
    (r) => r.country_code === geo && r.year === String(year) && r.indicator === indicator && r.unit === "PC_GDP",
  );
  if (!row || row.value === "") throw new Error(`no value for ${geo} ${year} ${indicator}`);
  return Number(row.value);
}

/** One quarter of quarterly-debt; throws if missing. */
function quarter(period) {
  const row = debt.find((r) => r.period === period);
  if (!row) throw new Error(`no row for ${period}`);
  return row;
}

const fmt = (v) => v.toFixed(1);
const signed = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const round1 = (v) => Math.round(v * 10) / 10;

/** Render a Plot figure/svg node to a standalone SVG string. */
function toSvg(node) {
  const svg = node.tagName.toLowerCase() === "svg" ? node : node.querySelector("svg");
  if (svg !== node) {
    const style = node.querySelector("style");
    if (style && !svg.contains(style)) svg.insertBefore(style, svg.firstChild);
  }
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return svg.outerHTML;
}

function write(name, fig) {
  const svg = toSvg(fig);
  if (/NaN|Infinity|undefined|=>/.test(svg)) throw new Error(`${name}: suspicious text in SVG`);
  writeFileSync(join(HERE, name), svg + "\n");
  console.log(`wrote ${name}`);
}

const title = (text) =>
  Plot.text([text], { text: (d) => d, frameAnchor: "top-left", dy: -30, dx: -40, textAnchor: "start", fontWeight: "bold", fill: INK, fontSize: 13 });

// --- Chart 1: spending above revenue in every year, 1995–2025 ----------------
{
  const years = Array.from({ length: 31 }, (_, i) => 1995 + i);
  const rows = years.map((year) => ({ year, te: pct("FR", year, "TE"), tr: pct("FR", year, "TR"), b9: pct("FR", year, "B9") }));
  if (rows.some((r) => !(r.te > r.tr) || !(r.b9 < 0))) throw new Error("chart 1: expected a deficit every year");
  const at = (year) => rows.find((r) => r.year === year);
  const marked = [2000, 2009, 2020].map(at);
  for (const r of [...marked, at(2025)]) {
    if (Math.abs(r.tr - r.te - r.b9) > 0.15) throw new Error(`chart 1: TR − TE disagrees with B9 in ${r.year}`);
  }
  const first = at(1995);
  const last = at(2025);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 40,
    marginRight: 116,
    marginTop: 44,
    marginBottom: 40,
    style: FONT,
    x: { label: null, tickFormat: "d", domain: [1995, 2025], ticks: [1995, 2000, 2005, 2010, 2015, 2020, 2025] },
    y: { label: "% of GDP", labelArrow: "none", grid: true, domain: [45, 65] },
    marks: [
      title("French government spending and revenue, % of GDP, 1995–2025"),
      Plot.areaY(rows, { x: "year", y1: "tr", y2: "te", fill: HIGHLIGHT, fillOpacity: 0.15 }),
      Plot.line(rows, { x: "year", y: "te", stroke: HIGHLIGHT, strokeWidth: 2 }),
      Plot.line(rows, { x: "year", y: "tr", stroke: INK, strokeWidth: 2 }),
      // The deficit years the prose cites: a rule spanning the gap, labelled from B9.
      Plot.ruleX(marked, { x: "year", y1: "tr", y2: "te", stroke: HIGHLIGHT, strokeWidth: 1.5 }),
      Plot.dot(marked, { x: "year", y: "te", fill: HIGHLIGHT, r: 3 }),
      // 2000 is labelled below the revenue line: above it the spending line crosses the text.
      Plot.text(marked.slice(0, 1), { x: "year", y: "tr", text: (d) => `${d.year}: deficit ${fmt(-d.b9)}%`, dx: -10, dy: 28, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(marked.slice(1), { x: "year", y: "te", text: (d) => `${d.year}: deficit ${fmt(-d.b9)}%`, dy: -12, textAnchor: "middle", fill: HIGHLIGHT }),
      // 1995 starting values.
      Plot.text([first], { x: "year", y: "te", text: (d) => `${fmt(d.te)}%`, dy: -10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text([first], { x: "year", y: "tr", text: (d) => `${fmt(d.tr)}%`, dy: 14, textAnchor: "start", fill: INK }),
      // Direct labels at the right end, with the 2025 deficit between them.
      Plot.text([last], { x: "year", y: "te", text: (d) => `Spending ${fmt(d.te)}%`, dx: 6, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([last], { x: "year", y: "tr", text: (d) => `Revenue ${fmt(d.tr)}%`, dx: 6, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([last], { x: "year", y: (d) => (d.te + d.tr) / 2, text: (d) => `Deficit ${fmt(-d.b9)}%`, dx: 6, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(["Source: Eurostat gov_10a_main (21 July 2026). General government."], { text: (d) => d, frameAnchor: "bottom-right", dy: 30, dx: 112, textAnchor: "end", fill: LINE2, fontSize: 10 }),
    ],
  });
  write("french-debt-gap.svg", fig);
}

// --- Chart 2: the debt ratio steps up in each shock, 2000-Q1 to 2026-Q2 -------
{
  const rows = debt.map((r) => ({ period: r.period, date: new Date(`${r.period_end}T00:00:00Z`), pct: Number(r.gross_debt_pct_gdp), bn: Number(r.gross_debt_eur_billions) }));
  const expected = Array.from({ length: rows.length }, (_, i) => `${2000 + Math.floor(i / 4)}-Q${(i % 4) + 1}`);
  if (rows.length !== 106 || rows.some((r, i) => r.period !== expected[i])) throw new Error("chart 2: expected 106 consecutive quarters from 2000-Q1");
  if (rows.some((r) => !Number.isFinite(r.pct))) throw new Error("chart 2: missing ratio");
  const pick = (period, label) => {
    const r = quarter(period);
    return { date: new Date(`${r.period_end}T00:00:00Z`), pct: Number(r.gross_debt_pct_gdp), bn: Number(r.gross_debt_eur_billions), label };
  };
  const start = pick("2000-Q1", "Q1 2000");
  const below = [pick("2007-Q4", "end-2007"), pick("2023-Q4", "end-2023")];
  const aboveLeft = [pick("2009-Q4", "end-2009"), pick("2020-Q4", "end-2020")];
  const end2019 = pick("2019-Q4", "end-2019");
  const latest = pick("2026-Q2", "Q2 2026");
  const shocks = [
    { x1: new Date("2008-01-01T00:00:00Z"), x2: new Date("2009-12-31T00:00:00Z"), label: "Financial crisis" },
    { x1: new Date("2020-01-01T00:00:00Z"), x2: new Date("2020-12-31T00:00:00Z"), label: "Covid" },
  ];
  const label = (d) => `${d.label}: ${fmt(d.pct)}%`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 40,
    marginRight: 120,
    marginTop: 44,
    marginBottom: 40,
    style: FONT,
    x: { label: null, type: "utc", domain: [new Date("2000-01-01T00:00:00Z"), new Date("2026-12-31T00:00:00Z")] },
    y: { label: "% of GDP", labelArrow: "none", grid: true, domain: [50, 125] },
    marks: [
      title("French public debt, % of GDP, end of each quarter, 2000–2026"),
      Plot.rectX(shocks, { x1: "x1", x2: "x2", y1: 50, y2: 125, fill: LINE2, fillOpacity: 0.18 }),
      Plot.text(shocks, { x: "x1", y: 125, text: "label", dx: 3, dy: 10, textAnchor: "start", fill: "#6b7280", fontSize: 11 }),
      Plot.line(rows, { x: "date", y: "pct", stroke: HIGHLIGHT, strokeWidth: 2 }),
      Plot.dot([start, ...below, ...aboveLeft, end2019, latest], { x: "date", y: "pct", fill: HIGHLIGHT, r: 3.5 }),
      Plot.text([start], { x: "date", y: "pct", text: label, dy: 16, textAnchor: "start", fill: INK }),
      Plot.text(below, { x: "date", y: "pct", text: label, dy: 18, textAnchor: "middle", fill: INK }),
      Plot.text(aboveLeft, { x: "date", y: "pct", text: label, dx: -6, dy: -16, textAnchor: "end", fill: INK }),
      Plot.text([end2019], { x: "date", y: "pct", text: label, dx: -2, dy: 20, textAnchor: "end", fill: INK }),
      Plot.text([latest], { x: "date", y: "pct", text: label, dx: 7, dy: -4, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([latest], { x: "date", y: "pct", text: (d) => `€${(d.bn / 1000).toFixed(1)} trillion`, dx: 7, dy: 11, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(["Source: INSEE, quarterly Maastricht debt, 29 Sept 2026. Gross debt; not seasonally adjusted."], { text: (d) => d, frameAnchor: "bottom-right", dy: 30, dx: 116, textAnchor: "end", fill: LINE2, fontSize: 10 }),
    ],
  });
  write("french-debt-ratio.svg", fig);
}

// --- Chart 3: France raises the most revenue and spends more still (2025) ------
{
  const geos = [
    ["FR", "France"],
    ["IT", "Italy"],
    ["DE", "Germany"],
    ["EU27_2020", "EU27 average*"],
    ["ES", "Spain"],
  ];
  const rows = geos.map(([code, name]) => ({ name, tr: pct(code, 2025, "TR"), te: pct(code, 2025, "TE"), b9: pct(code, 2025, "B9") }));
  for (let i = 1; i < rows.length; i++) if (rows[i].te > rows[i - 1].te) throw new Error("chart 3: rows not sorted by spending");
  const france = rows[0];
  if (rows.some((r) => r.tr > france.tr)) throw new Error("chart 3: France is not the highest revenue");
  const order = rows.map((r) => r.name);
  const XMAX = 60;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 316,
    marginLeft: 104,
    marginRight: 96,
    marginTop: 64,
    marginBottom: 56,
    style: FONT,
    x: { label: "% of GDP, 2025", labelArrow: "none", labelAnchor: "center", grid: true, domain: [40, XMAX] },
    y: { label: null, domain: order, tickSize: 0 },
    marks: [
      title("Revenue and spending, % of GDP, 2025"),
      Plot.link(rows, { x1: "tr", x2: "te", y1: "name", y2: "name", stroke: HIGHLIGHT, strokeWidth: 3, strokeOpacity: 0.35 }),
      Plot.dot(rows, { x: "tr", y: "name", fill: INK, r: 5.5 }),
      Plot.dot(rows, { x: "te", y: "name", fill: HIGHLIGHT, r: 5.5 }),
      Plot.text(rows, { x: "tr", y: "name", text: (d) => fmt(d.tr), dx: -10, textAnchor: "end", fill: INK }),
      Plot.text(rows, { x: "te", y: "name", text: (d) => fmt(d.te), dx: 10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(rows, { x: XMAX, y: "name", text: (d) => `${fmt(-d.b9)}`, dx: 30, textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      // Coloured column headers act as the key.
      Plot.text([france], { x: "tr", y: "name", text: () => "Revenue", dy: -22, textAnchor: "middle", fill: INK, fontWeight: "bold" }),
      Plot.text([france], { x: "te", y: "name", text: () => "Spending", dy: -22, textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([france], { x: XMAX, y: "name", text: () => "Deficit", dx: 30, dy: -22, textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(["* The EU27 average includes France. Source: Eurostat gov_10a_main (21 July 2026)."], { text: (d) => d, frameAnchor: "bottom-left", dy: 50, dx: -100, textAnchor: "start", fill: LINE2, fontSize: 10 }),
    ],
  });
  write("french-debt-peers.svg", fig);
}

// --- Chart 4: where France's extra spending goes (2025, France minus EU27) ----
{
  const items = [
    ["D62PAY", "Cash benefits (pensions etc.)"],
    ["D1PAY", "Public-sector pay"],
    ["D632PAY", "In-kind benefits (e.g. reimbursed care)"],
    ["D3PAY", "Subsidies"],
    ["P51G", "Investment"],
    ["D41PAY", "Interest"],
    ["P2", "Goods and services bought"],
  ];
  const fr = (i) => pct("FR", 2025, i);
  const eu = (i) => pct("EU27_2020", 2025, i);
  const rows = items.map(([code, label]) => ({ label, fr: fr(code), eu: eu(code), diff: round1(fr(code) - eu(code)) }));
  const frOther = round1(fr("TE") - items.reduce((s, [c]) => s + fr(c), 0));
  const euOther = round1(eu("TE") - items.reduce((s, [c]) => s + eu(c), 0));
  rows.sort((a, b) => b.diff - a.diff);
  rows.push({ label: "All other spending", fr: frOther, eu: euOther, diff: round1(frOther - euOther) });
  const total = round1(fr("TE") - eu("TE"));
  const sum = rows.reduce((s, r) => s + r.diff, 0);
  if (Math.abs(sum - total) > 0.05) throw new Error(`chart 4: differences sum to ${sum}, TE difference is ${total}`);
  const pos = rows.filter((r) => r.diff >= 0);
  const neg = rows.filter((r) => r.diff < 0);
  const label = (d) => `${signed(d.diff)}  (${fmt(d.fr)} vs ${fmt(d.eu)})`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 356,
    marginLeft: 250,
    marginRight: 24,
    marginTop: 64,
    marginBottom: 56,
    style: FONT,
    x: { label: "Percentage points of GDP, France minus EU27 average, 2025", labelArrow: "none", labelAnchor: "center", domain: [-1.5, 4.5], grid: true },
    y: { label: null, domain: rows.map((r) => r.label), tickSize: 0, padding: 0.25 },
    marks: [
      Plot.text([`France spends ${fmt(total)} points of GDP more than the EU27 average`], { text: (d) => d, frameAnchor: "top-left", dy: -40, dx: -246, textAnchor: "start", fontWeight: "bold", fill: INK, fontSize: 13 }),
      Plot.text([`France ${fmt(fr("TE"))}% vs EU27 ${fmt(eu("TE"))}% of GDP. In brackets: each item, France vs EU27, % of GDP.`], { text: (d) => d, frameAnchor: "top-left", dy: -20, dx: -246, textAnchor: "start", fill: "#4b5563" }),
      Plot.barX(pos, { x: "diff", y: "label", fill: HIGHLIGHT }),
      Plot.barX(neg, { x: "diff", y: "label", fill: LINE2 }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(pos, { x: "diff", y: "label", text: label, dx: 5, textAnchor: "start", fill: INK }),
      Plot.text(neg, { x: 0, y: "label", text: label, dx: 5, textAnchor: "start", fill: INK }),
      Plot.text(["Economic types of spending (ESA 2010); “all other” is total spending minus the seven items. Source: Eurostat gov_10a_main."], { text: (d) => d, frameAnchor: "bottom-left", dy: 50, dx: -246, textAnchor: "start", fill: LINE2, fontSize: 10 }),
    ],
  });
  write("french-debt-extra-spending.svg", fig);
}
