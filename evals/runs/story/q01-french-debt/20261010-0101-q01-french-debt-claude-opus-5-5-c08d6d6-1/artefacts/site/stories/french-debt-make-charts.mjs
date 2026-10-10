// Regenerate the SVG charts embedded in french-debt.md.
//   npm ci && node french-debt-make-charts.mjs
//
// Implements the chart plan in french-debt-outline.md. See
// skills/story/references/charting.md.

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
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const csv = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const fiscal = csv("fiscal-accounts.csv");
const debt = csv("quarterly-debt.csv");

/** Annual rows of one fiscal indicator for one geography; empty values dropped. */
function annual(geo, indicator, unit) {
  return fiscal
    .filter((r) => r.country_code === geo && r.indicator === indicator && r.unit === unit && r.value !== "")
    .map((r) => ({ year: Number(r.year), value: Number(r.value) }));
}

/** One fiscal value; throws so a missing annotation fails the build. */
function value(geo, indicator, unit, year) {
  const r = fiscal.find((r) => r.country_code === geo && r.indicator === indicator && r.unit === unit && r.year === String(year));
  if (!r || r.value === "") throw new Error(`no ${geo} ${indicator} ${unit} ${year}`);
  return Number(r.value);
}

/** The row for one key; throws so a missing annotation fails the build. */
function on(rows, key, k) {
  const row = rows.find((r) => r[key] === k);
  if (!row) throw new Error(`no row for ${k}`);
  return row;
}

const fmt1 = (x) => x.toFixed(1).replace("-", "\u2212");
const fmtBn = (x) => x.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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
function write(name, fig) {
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
  written.push(name);
}

// --- Chart 1: debt doubled relative to GDP, in steps ---------------------------
{
  const rows = debt.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    pct: Number(r.gross_debt_pct_gdp),
    bn: Number(r.gross_debt_eur_billions),
  }));
  const marks = [
    { period: "2000-Q1", dy: 16, anchor: "start", dx: 0 },
    { period: "2008-Q4", dy: -14, anchor: "end", dx: -4 },
    { period: "2019-Q4", dy: 16, anchor: "start", dx: 4 },
    { period: "2020-Q3", dy: -14, anchor: "end", dx: -4 },
  ].map((m) => ({ ...on(rows, "period", m.period), ...m }));
  const last = rows.at(-1);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 44,
    marginRight: 120,
    marginTop: 28,
    marginBottom: 32,
    style: FONT,
    x: { label: null },
    y: { label: "Gross public debt, % of GDP", labelArrow: "none", grid: true, domain: [0, 130] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "pct", fill: LINE, r: 3.5 }),
      // One mark per label: Plot takes dx, dy and textAnchor as constants only.
      ...marks.map((m) => Plot.text([m], { x: "date", y: "pct", text: (d) => `${d.period}: ${fmt1(d.pct)}%`, dy: m.dy, dx: m.dx, textAnchor: m.anchor, fill: INK })),
      Plot.dot([last], { x: "date", y: "pct", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([last], { x: "date", y: "pct", text: (d) => `${d.period}: ${fmt1(d.pct)}%\n€${fmtBn(d.bn)}bn`, dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
    ],
  });
  write("french-debt-ratio.svg", fig);
}

// --- Chart 2: a deficit every year, deeper than the EU's -----------------------
{
  const fr = annual("FR", "B9", "PC_GDP");
  const eu = annual("EU27_2020", "B9", "PC_GDP");
  const inDeficit = fr.filter((d) => d.value < 0).length;
  const labelled = [2000, 2009, 2020, 2025].map((y) => on(fr, "year", y));
  const eu25 = on(eu, "year", 2025);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 44,
    marginRight: 64,
    marginTop: 36,
    marginBottom: 32,
    style: FONT,
    x: { label: null, tickFormat: (d) => String(d), domain: [1994.5, 2025.5] },
    y: { label: "General government balance, % of GDP (negative = deficit)", labelArrow: "none", grid: true, domain: [-10, 1] },
    marks: [
      Plot.rectY(fr, { x1: (d) => d.year - 0.4, x2: (d) => d.year + 0.4, y: "value", fill: LINE }),
      Plot.line(eu, { x: "year", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.text(labelled, { x: "year", y: "value", text: (d) => fmt1(d.value), dy: 9, lineAnchor: "top", fill: INK }),
      Plot.text([eu25], { x: "year", y: "value", text: (d) => `EU27 ${fmt1(d.value)}`, dx: 14, textAnchor: "start", fill: LINE2, fontWeight: "bold" }),
      Plot.text([labelled.at(-1)], { x: "year", y: -6.5, text: () => "France", dx: 18, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([{ year: 1995 }], { x: "year", y: 1, text: () => `France: in deficit ${inDeficit} of ${fr.length} years, ${fr[0].year}–${fr.at(-1).year}`, textAnchor: "start", dy: -2, fill: INK, fontWeight: "bold" }),
    ],
  });
  write("french-debt-deficit.svg", fig);
}

// --- Chart 3: the highest revenue, and higher spending -------------------------
{
  const geos = [
    ["FR", "France"],
    ["IT", "Italy"],
    ["DE", "Germany"],
    ["EU27_2020", "EU27"],
    ["ES", "Spain"],
  ];
  const rows = geos
    .map(([code, name]) => ({
      name,
      tr: value(code, "TR", "PC_GDP", 2025),
      te: value(code, "TE", "PC_GDP", 2025),
      b9: value(code, "B9", "PC_GDP", 2025),
    }))
    .sort((a, b) => b.te - a.te);
  const order = rows.map((d) => d.name);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 300,
    marginLeft: 72,
    marginRight: 110,
    marginTop: 36,
    marginBottom: 40,
    style: FONT,
    x: { label: "% of GDP, 2025", labelArrow: "none", domain: [40, 60], grid: true },
    y: { label: null, domain: order },
    marks: [
      Plot.ruleY(rows, { y: "name", x1: "tr", x2: "te", stroke: HIGHLIGHT, strokeWidth: 3 }),
      Plot.dot(rows, { y: "name", x: "tr", fill: LINE2, r: 5 }),
      Plot.dot(rows, { y: "name", x: "te", fill: INK, r: 5 }),
      Plot.text(rows, { y: "name", x: "tr", text: (d) => fmt1(d.tr), dx: -9, textAnchor: "end", fill: "#6b7280" }),
      Plot.text(rows, { y: "name", x: "te", text: (d) => fmt1(d.te), dx: 9, textAnchor: "start", fill: INK }),
      Plot.text(rows, { y: "name", x: 60, text: (d) => `deficit ${fmt1(-d.b9)}`, dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([rows[0]], { y: "name", x: "tr", text: () => "revenue", dy: -14, fill: "#6b7280", fontWeight: "bold" }),
      Plot.text([rows[0]], { y: "name", x: "te", text: () => "spending", dy: -14, fill: INK, fontWeight: "bold" }),
    ],
  });
  write("french-debt-compare.svg", fig);
}

// --- Chart 4: the interest bill doubled since 2020 -----------------------------
{
  const eur = annual("FR", "D41PAY", "MIO_EUR").map((d) => ({ ...d, bn: d.value / 1000 }));
  const labelled = [
    { year: 1995, dy: -16, anchor: "start", dx: 0 },
    { year: 2020, dy: 22, anchor: "middle", dx: 0 },
    { year: 2025, dy: 0, anchor: "start", dx: 8 },
  ].map((m) => ({ ...on(eur, "year", m.year), pct: value("FR", "D41PAY", "PC_GDP", m.year), ...m }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 360,
    marginLeft: 44,
    marginRight: 150,
    marginTop: 28,
    marginBottom: 32,
    style: FONT,
    x: { label: null, tickFormat: (d) => String(d) },
    y: { label: "Interest paid by French government, € billions (nominal)", labelArrow: "none", grid: true, domain: [0, 75] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(eur, { x: "year", y: "bn", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(labelled, { x: "year", y: "bn", fill: (d) => (d.year === 2025 ? HIGHLIGHT : LINE), r: 4 }),
      ...labelled.map((m) =>
        Plot.text([m], {
          x: "year",
          y: "bn",
          text: (d) => `${d.year}: €${fmt1(d.bn)}bn\n${fmt1(d.pct)}% of GDP`,
          dy: m.dy,
          dx: m.dx,
          textAnchor: m.anchor,
          fill: m.year === 2025 ? HIGHLIGHT : INK,
          fontWeight: m.year === 2025 ? "bold" : "normal",
        }),
      ),
    ],
  });
  write("french-debt-interest.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
