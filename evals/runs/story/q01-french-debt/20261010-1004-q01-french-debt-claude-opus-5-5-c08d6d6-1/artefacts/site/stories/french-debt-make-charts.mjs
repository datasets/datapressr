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
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

// The fiscal CSV has quoted, multi-line labels, so parse it properly.
const read = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const fiscal = read("fiscal-accounts.csv");
const quarterly = read("quarterly-debt.csv");

/** Annual rows of one geography, indicator and unit, empty values dropped. */
function annual(country, indicator, unit) {
  return fiscal
    .filter((r) => r.country_code === country && r.indicator === indicator && r.unit === unit && r.value !== "")
    .map((r) => ({ year: Number(r.year), date: new Date(Date.UTC(Number(r.year), 0, 1)), value: Number(r.value) }));
}

/** The row matching key === wanted; throws so a missing annotation fails the build. */
function on(rows, key, wanted) {
  const row = rows.find((r) => r[key] === wanted);
  if (!row) throw new Error(`no row for ${key}=${wanted}`);
  return row;
}

const pct = (v) => `${v.toFixed(1)}%`;
const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : `−${Math.abs(v).toFixed(1)}`);
const bn = (v) => `€${v.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}bn`;

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

// --- Chart 1: the debt ratio nearly doubled, stepping up at each shock -------
{
  const rows = quarterly.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    value: Number(r.gross_debt_pct_gdp),
    eur: Number(r.gross_debt_eur_billions),
  }));
  if (rows.length !== 106 || rows.some((r) => !Number.isFinite(r.value))) throw new Error("quarterly series changed");
  const first = on(rows, "period", "2000-Q1");
  const last = on(rows, "period", "2026-Q2");
  // [period, label anchor, dy] — label below or above the dot to avoid the line.
  const marks = [
    ["2008-Q4", "end", 20],
    ["2019-Q4", "end", 16],
    ["2021-Q1", "start", -12],
    ["2023-Q4", "middle", 18],
  ].map(([p, anchor, dy]) => ({ ...on(rows, "period", p), anchor, dy }));
  // The Covid step: one label for both ends, in the empty space above the 2010s.
  const covid = [on(rows, "period", "2020-Q1"), on(rows, "period", "2020-Q3")];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Gross Maastricht debt, % of GDP (quarter end)", labelArrow: "none", grid: true, domain: [0, 130] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot([first, last], { x: "date", y: "value", fill: HIGHLIGHT, r: 4 }),
      Plot.text([first], { x: "date", y: "value", text: (d) => `${d.period}: ${pct(d.value)}\n${bn(d.eur)}`, dy: 22, textAnchor: "start", fill: HIGHLIGHT, lineHeight: 1.2 }),
      Plot.text([last], { x: "date", y: "value", text: (d) => `${d.period}: ${pct(d.value)}\n${bn(d.eur)}`, dx: 8, dy: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold", lineHeight: 1.2 }),
      Plot.dot([...marks, ...covid], { x: "date", y: "value", fill: INK, r: 3 }),
      ...marks.map((m) =>
        Plot.text([m], { x: "date", y: "value", text: (d) => `${d.period}: ${pct(d.value)}`, dy: m.dy, dx: m.anchor === "end" ? -6 : m.anchor === "start" ? 6 : 0, textAnchor: m.anchor, fill: INK }),
      ),
      Plot.text([covid[1]], { x: "date", y: "value", text: () => `${covid[0].period} → ${covid[1].period}: ${pct(covid[0].value)} → ${pct(covid[1].value)}`, dx: -14, dy: -6, textAnchor: "end", fill: INK }),
    ],
  });
  save("french-debt-ratio.svg", fig);
}

// --- Chart 2: France ran a deficit every year; Germany sometimes didn't -----
{
  const fr = annual("FR", "B9", "PC_GDP");
  const de = annual("DE", "B9", "PC_GDP");
  const eu = annual("EU27_2020", "B9", "PC_GDP");
  const frDeficits = fr.filter((r) => r.value < 0).length;
  const deSurpluses = de.filter((r) => r.value >= 0).length;
  const frMarks = [2000, 2009, 2020, 2024].map((y) => on(fr, "year", y));
  const deMark = on(de, "year", 2018);
  const ends = [
    { row: fr.at(-1), name: "France", color: LINE, dy: 0 },
    { row: eu.at(-1), name: "EU27", color: INK, dy: 6 },
    { row: de.at(-1), name: "Germany", color: LINE2, dy: -6 },
  ];
  if (ends.some((e) => e.row.year !== 2025)) throw new Error("series does not end in 2025");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 36,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Government balance, % of GDP (negative = deficit)", labelArrow: "none", grid: true, domain: [-9.5, 2.5] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(eu, { x: "date", y: "value", stroke: INK, strokeWidth: 1, strokeDasharray: "4,3" }),
      Plot.line(de, { x: "date", y: "value", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(fr, { x: "date", y: "value", stroke: LINE, strokeWidth: 2.5 }),
      ...ends.map((e) =>
        Plot.text([e.row], { x: "date", y: "value", text: (d) => `${e.name} ${signed(d.value)}`, dx: 8, dy: e.dy, textAnchor: "start", fill: e.color, fontWeight: e.name === "France" ? "bold" : "normal" }),
      ),
      Plot.dot(frMarks, { x: "date", y: "value", fill: LINE, r: 3.5 }),
      ...frMarks.map((m) => {
        // 2000 sits among the other lines, 2020 at the floor: label them clear.
        const at = { 2000: { dy: -22, dx: 0, a: "middle" }, 2020: { dy: 0, dx: -8, a: "end" } }[m.year] ?? { dy: 14, dx: 0, a: "middle" };
        return Plot.text([m], { x: "date", y: "value", text: (d) => `${d.year}: ${signed(d.value)}`, dy: at.dy, dx: at.dx, textAnchor: at.a, fill: LINE });
      }),
      Plot.dot([deMark], { x: "date", y: "value", fill: LINE2, r: 3.5 }),
      Plot.text([deMark], { x: "date", y: "value", text: (d) => `Germany ${d.year}: ${signed(d.value)}\nsurplus in ${deSurpluses} years`, dy: -18, textAnchor: "middle", fill: "#6b7280", lineHeight: 1.2 }),
      Plot.text([`France: a deficit in all ${frDeficits} years, ${fr[0].year}–${fr.at(-1).year}`], { frameAnchor: "top-left", dy: -26, fill: LINE, fontWeight: "bold" }),
    ],
  });
  save("french-debt-balance.svg", fig);
}

// --- Chart 3: France collects the most and spends more still (2025) ---------
{
  const names = { FR: "France", IT: "Italy", DE: "Germany", EU27_2020: "EU27", ES: "Spain" };
  const rows = Object.keys(names).map((c) => {
    const get = (i) => on(annual(c, i, "PC_GDP"), "year", 2025).value;
    return { name: names[c], tr: get("TR"), te: get("TE"), b9: get("B9") };
  });
  rows.sort((a, b) => b.te - a.te);
  const order = rows.map((r) => r.name);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 300,
    marginLeft: 72,
    marginRight: 100,
    marginTop: 40,
    marginBottom: 40,
    style: FONT,
    x: { label: "% of GDP, 2025", labelArrow: "none", labelAnchor: "center", domain: [40, 60], grid: true },
    y: { label: null, domain: order, tickSize: 0 },
    marks: [
      Plot.ruleY(rows, { y: "name", x1: "tr", x2: "te", stroke: LINE2, strokeWidth: 3 }),
      Plot.dot(rows, { y: "name", x: "tr", fill: "#16a34a", r: 6 }),
      Plot.dot(rows, { y: "name", x: "te", fill: LINE, r: 6 }),
      Plot.text(rows, { y: "name", x: "tr", text: (d) => d.tr.toFixed(1), dx: -10, textAnchor: "end", fill: "#16a34a" }),
      Plot.text(rows, { y: "name", x: "te", text: (d) => d.te.toFixed(1), dx: 10, textAnchor: "start", fill: LINE }),
      Plot.text(rows, { y: "name", text: (d) => `balance ${signed(d.b9)}`, frameAnchor: "right", dx: 92, textAnchor: "end", fill: (d) => (d.name === "France" ? HIGHLIGHT : INK), fontWeight: (d) => (d.name === "France" ? "bold" : "normal") }),
      Plot.text(["● revenue"], { frameAnchor: "top-left", dy: -30, fill: "#16a34a", fontWeight: "bold" }),
      Plot.text(["● spending"], { frameAnchor: "top-left", dx: 80, dy: -30, fill: LINE, fontWeight: "bold" }),
    ],
  });
  save("french-debt-revenue-spending.svg", fig);
}

// --- Chart 4: the interest bill more than doubled after 2020 ----------------
{
  const eur = annual("FR", "D41PAY", "MIO_EUR").map((r) => ({ ...r, value: r.value / 1000 }));
  const share = annual("FR", "D41PAY", "PC_GDP");
  const marks = [
    { year: 1995, dy: -38, anchor: "start" },
    { year: 2020, dy: 28, anchor: "middle" },
    { year: 2025, dy: -8, anchor: "end" },
  ].map((m) => ({ ...on(eur, "year", m.year), share: on(share, "year", m.year).value, ...m }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "France: interest paid, € billions (current euros)", labelArrow: "none", grid: true, domain: [0, 70] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(eur, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "value", fill: HIGHLIGHT, r: 4 }),
      ...marks.map((m) =>
        Plot.text([m], { x: "date", y: "value", text: (d) => `${d.year}: ${bn(d.value)}\n${pct(d.share)} of GDP`, dy: m.dy, dx: m.anchor === "end" ? -10 : 0, textAnchor: m.anchor, fill: HIGHLIGHT, lineHeight: 1.2 }),
      ),
    ],
  });
  save("french-debt-interest.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
