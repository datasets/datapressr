// Regenerate the SVG charts embedded in french-debt.md.
//   npm ci && node french-debt-make-charts.mjs
//
// Implements the approved chart plan in french-debt-outline.md. Every label
// value is read from the dataset's rows; a missing row fails the build.

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

const LINE = "#2563eb";
const LINE_LIGHT = "#60a5fa";
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

// fiscal-accounts.csv has quoted labels containing commas, so parse properly.
const read = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const fiscal = read("fiscal-accounts.csv");
const quarterly = read("quarterly-debt.csv");

/** Annual rows of one fiscal series, 1995–2025, non-empty only. One call per series. */
function fiscalSeries(country, indicator, unit = "PC_GDP") {
  return fiscal
    .filter((r) => r.country_code === country && r.indicator === indicator && r.unit === unit && r.value !== "" && +r.year >= 1995 && +r.year <= 2025)
    .map((r) => ({ year: +r.year, date: new Date(Date.UTC(+r.year, 0, 1)), value: +r.value }));
}

/** The row for one key; throws so a missing annotation fails the build. */
function on(rows, key, field = "year") {
  const row = rows.find((r) => r[field] === key);
  if (!row) throw new Error(`no row for ${key}`);
  return row;
}

const minus = (v) => v.toFixed(1).replace("-", "−");
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const bn = (v) => `€${thousands(Math.round(v))}bn`;

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

const written = [];
function save(name, fig) {
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
  written.push(name);
}

// --- Chart 1: the debt ratio is at a record, after two jumps that never unwound ---
{
  const rows = quarterly.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    value: +r.gross_debt_pct_gdp,
    eur: +r.gross_debt_eur_billions,
  }));
  const short = (p) => p.replace(/^(\d{4})-Q4$/, "end-$1").replace(/^(\d{4})-Q(\d)$/, "Q$2 $1");
  // [period, dx, dy, textAnchor, lineAnchor, show euros]
  const marks = [
    ["2000-Q1", 0, 12, "start", "top", false],
    ["2007-Q4", 0, 12, "middle", "top", false],
    ["2009-Q4", -8, -4, "end", "bottom", false],
    ["2019-Q4", -8, -6, "end", "bottom", false],
    ["2021-Q1", 0, -10, "middle", "bottom", true],
    ["2023-Q4", 0, 10, "middle", "top", true],
    ["2026-Q2", 8, 0, "start", "middle", true],
  ].map(([p, dx, dy, textAnchor, lineAnchor, showEur]) => ({ ...on(rows, p, "period"), dx, dy, textAnchor, lineAnchor, showEur }));
  const label = (d) => `${short(d.period)}: ${d.value.toFixed(1)}%` + (d.showEur ? `\n${bn(d.eur)}` : "");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 116,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Gross public debt (% of GDP, end of quarter)", labelArrow: "none", grid: true, domain: [0, 135] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "value", fill: (d) => (d.period === "2026-Q2" ? HIGHLIGHT : INK), r: 3.5 }),
      ...marks.map((m) =>
        Plot.text([m], {
          x: "date", y: "value", text: label, dx: m.dx, dy: m.dy, textAnchor: m.textAnchor, lineAnchor: m.lineAnchor,
          fill: m.period === "2026-Q2" ? HIGHLIGHT : INK, fontWeight: m.period === "2026-Q2" ? "bold" : "normal",
        }),
      ),
    ],
  });
  save("french-debt-ratio.svg", fig);
}

// --- Chart 2: France has run a deficit every year; in 2025 the widest of the four ---
{
  const countries = [
    { code: "FR", name: "France", stroke: LINE, width: 3, dash: null },
    { code: "IT", name: "Italy", stroke: LINE2, width: 1.5, dash: null },
    { code: "DE", name: "Germany", stroke: LINE2, width: 1.5, dash: null },
    { code: "ES", name: "Spain", stroke: LINE2, width: 1.5, dash: null },
    { code: "EU27_2020", name: "EU27", stroke: "#6b7280", width: 1.5, dash: "4,3" },
  ].map((c) => ({ ...c, rows: fiscalSeries(c.code, "B9") }));

  // End labels at 2025, nudged apart vertically (in % points) so they never overlap.
  const GAP = 0.7;
  const ends = countries
    .map((c) => ({ ...on(c.rows, 2025), name: c.name, fill: c.code === "FR" ? LINE : "#6b7280", bold: c.code === "FR" }))
    .sort((a, b) => b.value - a.value);
  ends.forEach((e, i) => (e.ly = i === 0 ? e.value : Math.min(e.value, ends[i - 1].ly - GAP)));
  const shift = (ends.reduce((s, e) => s + e.value, 0) - ends.reduce((s, e) => s + e.ly, 0)) / ends.length;
  ends.forEach((e) => (e.ly += shift));

  const fr = countries[0].rows;
  const lows = [on(fr, 2009), on(fr, 2020)];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 104,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Government balance (% of GDP; below zero = deficit)", labelArrow: "none", grid: true, domain: [-12, 3] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      ...countries.slice(1).map((c) => Plot.line(c.rows, { x: "date", y: "value", stroke: c.stroke, strokeWidth: c.width, strokeDasharray: c.dash })),
      Plot.line(fr, { x: "date", y: "value", stroke: LINE, strokeWidth: 3 }),
      Plot.text(ends, {
        x: "date", y: "ly", text: (d) => `${d.name} ${minus(d.value)}`, dx: 8, textAnchor: "start",
        fill: (d) => d.fill, fontWeight: (d) => (d.bold ? "bold" : "normal"),
      }),
      Plot.dot(lows, { x: "date", y: "value", fill: LINE, r: 4 }),
      // 2009: below-right, clear of Spain's 2008–09 fall; 2020: above-left, clear of Italy and Spain.
      Plot.text([lows[0]], { x: "date", y: "value", text: (d) => `${d.year}: ${minus(d.value)}`, dx: 4, dy: 14, textAnchor: "start", lineAnchor: "top", fill: LINE, fontWeight: "bold" }),
      Plot.text([lows[1]], { x: "date", y: "value", text: (d) => `${d.year}: ${minus(d.value)}`, dx: -8, dy: -4, textAnchor: "end", lineAnchor: "bottom", fill: LINE, fontWeight: "bold" }),
      Plot.text([{ date: new Date(Date.UTC(1996, 0, 1)), y: -10.2 }], {
        x: "date", y: "y", text: () => "France: no surplus in any year,\n1995–2025", textAnchor: "start", lineAnchor: "top", fill: LINE, fontWeight: "bold",
      }),
    ],
  });
  save("french-debt-balance.svg", fig);
}

// --- Chart 3: the gap is spending above a revenue line already higher than the EU's ---
{
  const series = [
    { key: "fr-te", label: "France spending", rows: fiscalSeries("FR", "TE"), stroke: LINE, width: 2.5, dash: null, fill: LINE },
    { key: "fr-tr", label: "France revenue", rows: fiscalSeries("FR", "TR"), stroke: LINE_LIGHT, width: 2.5, dash: null, fill: LINE_LIGHT },
    { key: "eu-te", label: "EU27 spending", rows: fiscalSeries("EU27_2020", "TE"), stroke: LINE2, width: 1.5, dash: null, fill: "#6b7280" },
    { key: "eu-tr", label: "EU27 revenue", rows: fiscalSeries("EU27_2020", "TR"), stroke: LINE2, width: 1.5, dash: "4,3", fill: "#6b7280" },
  ];
  const [frTe, frTr] = series;
  // Same country, same resource, same annual key: pair TE and TR per year for the shaded gap.
  const gap = frTe.rows.map((te) => ({ year: te.year, date: te.date, te: te.value, tr: on(frTr.rows, te.year).value }));
  const peaks = [on(frTe.rows, 2009), on(frTe.rows, 2020)];
  const ends = series.map((s) => ({ ...on(s.rows, 2025), label: s.label, fill: s.fill }));
  const gapLabel = on(gap, 2012);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 160,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "General government, % of GDP", labelArrow: "none", grid: true, domain: [40, 64] },
    marks: [
      Plot.areaY(gap, { x: "date", y1: "tr", y2: "te", fill: HIGHLIGHT, fillOpacity: 0.12 }),
      ...series.map((s) => Plot.line(s.rows, { x: "date", y: "value", stroke: s.stroke, strokeWidth: s.width, strokeDasharray: s.dash })),
      Plot.text(ends, { x: "date", y: "value", text: (d) => `${d.label} ${d.value.toFixed(1)}%`, dx: 8, textAnchor: "start", fill: (d) => d.fill, fontWeight: "bold" }),
      Plot.dot(peaks, { x: "date", y: "value", fill: LINE, r: 4 }),
      Plot.text(peaks, { x: "date", y: "value", text: (d) => `${d.year}: ${d.value.toFixed(1)}%`, dy: -10, lineAnchor: "bottom", fill: LINE, fontWeight: "bold" }),
      Plot.text([gapLabel], { x: "date", y: (d) => (d.te + d.tr) / 2, text: () => "France's deficit", fill: HIGHLIGHT, fontWeight: "bold" }),
    ],
  });
  save("french-debt-revenue-spending.svg", fig);
}

// --- Chart 4: the interest bill is rising again, though below its 1990s share ---
{
  const pct = fiscalSeries("FR", "D41PAY");
  const eur = fiscalSeries("FR", "D41PAY", "MIO_EUR");
  // [year, dx, dy, textAnchor, lineAnchor]
  const marks = [
    [1995, 8, -10, "start", "bottom"],
    [2020, 0, 12, "middle", "top"],
    [2025, 0, -12, "end", "bottom"],
  ].map(([y, dx, dy, textAnchor, lineAnchor]) => ({ ...on(pct, y), eur: on(eur, y).value / 1000, dx, dy, textAnchor, lineAnchor }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 340,
    marginLeft: 52,
    marginRight: 40,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "France: interest paid on public debt (% of GDP)", labelArrow: "none", grid: true, domain: [0, 4] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(pct, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "value", fill: (d) => (d.year === 2025 ? HIGHLIGHT : INK), r: 4 }),
      ...marks.map((m) =>
        Plot.text([m], {
          x: "date", y: "value", text: (d) => `${d.year}: ${d.value.toFixed(1)}% · €${d.eur.toFixed(1)}bn`,
          dx: m.dx, dy: m.dy, textAnchor: m.textAnchor, lineAnchor: m.lineAnchor,
          fill: m.year === 2025 ? HIGHLIGHT : INK, fontWeight: "bold",
        }),
      ),
    ],
  });
  save("french-debt-interest.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
