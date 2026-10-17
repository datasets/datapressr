// Regenerate the SVG charts embedded in france-debt.md.
//   npm ci && node france-debt-make-charts.mjs
//
// Implements the chart plan in france-debt-outline.md. Every annotated value is
// read from the dataset rows at build time; a missing row fails the build.

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
const GREY = "#6b7280";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const fiscal = csvParse(readFileSync(join(DATA, "fiscal-accounts.csv"), "utf8"));
const quarterly = csvParse(readFileSync(join(DATA, "quarterly-debt.csv"), "utf8"));

/** One annual series (one country, one indicator, one unit), non-empty values only. */
function annual(country, indicator, unit = "PC_GDP", from = 1995, to = 2025) {
  return fiscal
    .filter((r) => r.country_code === country && r.indicator === indicator && r.unit === unit)
    .filter((r) => +r.year >= from && +r.year <= to && r.value !== "")
    .map((r) => ({ year: +r.year, date: new Date(Date.UTC(+r.year, 0, 1)), value: Number(r.value) }));
}

/** The single fiscal value for a key; throws if missing or empty. */
function fv(country, year, indicator, unit = "PC_GDP") {
  const rows = fiscal.filter(
    (r) => r.country_code === country && r.year === String(year) && r.indicator === indicator && r.unit === unit,
  );
  if (rows.length !== 1 || rows[0].value === "") throw new Error(`no value for ${country} ${year} ${indicator} ${unit}`);
  return Number(rows[0].value);
}

/** The row for one date or key; throws so a missing annotation fails the build. */
function on(rows, key, field) {
  const row = rows.find((r) => r[field] === key);
  if (!row) throw new Error(`no row for ${key}`);
  return row;
}

const pct = (v) => `${v.toFixed(1)}%`;
const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : `−${Math.abs(v).toFixed(1)}`);
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
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
  console.log(`wrote ${name}`);
}

// --- Chart 1: debt rose in steps and never returned to its earlier level ------
{
  const rows = quarterly.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    value: Number(r.gross_debt_pct_gdp),
    eur: Number(r.gross_debt_eur_billions),
  }));
  if (rows.length !== 106 || rows.some((r) => !Number.isFinite(r.value))) throw new Error("quarterly debt series changed");
  const q = (p) => on(rows, p, "period");
  const start = q("2000-Q1");
  const pre09 = q("2008-Q4");
  const post09 = q("2009-Q4");
  const pre20 = q("2019-Q4");
  const post20 = q("2020-Q4");
  const dip = q("2023-Q4");
  const last = q("2026-Q2");
  const step = (a, b) => round1(b.value - a.value).toFixed(1);
  const label = (r) => `${r.period.replace("-", " ")}: ${pct(r.value)}`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 44,
    marginRight: 120,
    marginTop: 28,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [new Date("2000-01-01T00:00:00Z"), new Date("2026-12-31T00:00:00Z")] },
    y: { label: "French gross public debt, % of GDP (quarter-end)", labelArrow: "none", grid: true, domain: [0, 130] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot([start, pre09, post09, pre20, post20, dip, last], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      // labels above the point
      Plot.text([start, dip], { x: "date", y: "value", text: label, dy: 14, textAnchor: "start", fill: INK }),
      Plot.text([post09, post20], { x: "date", y: "value", text: label, dx: -6, dy: -10, textAnchor: "end", fill: INK }),
      Plot.text([pre09, pre20], { x: "date", y: "value", text: label, dx: 6, dy: 14, textAnchor: "start", fill: INK }),
      Plot.text([last], { x: "date", y: "value", text: (r) => `${r.period.replace("-", " ")}: ${pct(r.value)}`, dx: 8, dy: -8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([last], { x: "date", y: "value", text: (r) => `€${(r.eur / 1000).toFixed(1)} trillion`, dx: 8, dy: 8, textAnchor: "start", fill: LINE }),
      // the steps, computed from the rows
      Plot.text([{ date: new Date("2009-01-01T00:00:00Z"), y: 77 }], { x: "date", y: "y", text: () => `+${step(pre09, post09)} pts in 2009`, dx: -8, textAnchor: "end", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([{ date: new Date("2014-07-01T00:00:00Z"), y: 80 }], { x: "date", y: "y", text: () => `+${step(post09, pre20)} pts over 2010–19`, textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([{ date: new Date("2020-03-01T00:00:00Z"), y: 106 }], { x: "date", y: "y", text: () => `+${step(pre20, post20)} pts in 2020`, dx: -8, textAnchor: "end", fill: HIGHLIGHT, fontWeight: "bold" }),
    ],
  });
  write("france-debt-chart-debt.svg", fig);
}

// --- Chart 2: France's budget balance never reached zero ----------------------
{
  const fr = annual("FR", "B9");
  const de = annual("DE", "B9");
  const eu = annual("EU27_2020", "B9");
  if (fr.length !== 31 || fr.some((r) => r.value >= 0)) throw new Error("France balance no longer negative in every year");
  const y = (rows, year) => on(rows, year, "year");
  const frSmall = y(fr, 2000);
  const frBig = y(fr, 2020);
  const fr24 = y(fr, 2024);
  const deTop = y(de, 2018);
  if (eu.length !== 31 || eu.some((r) => r.value >= 0)) throw new Error("EU27 balance no longer negative in every year");
  // 2025 end values, dodged so the labels don't overlap (dots stay at the true value)
  const end = [
    { name: "Spain", value: fv("ES", 2025, "B9"), fill: GREY },
    { name: "Germany", value: fv("DE", 2025, "B9"), fill: GREY },
    { name: "EU27, Italy", value: fv("EU27_2020", 2025, "B9"), fill: GREY },
    { name: "France", value: fv("FR", 2025, "B9"), fill: LINE },
  ];
  if (fv("IT", 2025, "B9") !== fv("EU27_2020", 2025, "B9")) throw new Error("Italy and EU27 2025 differ; split the label");
  end.sort((a, b) => b.value - a.value);
  let prev = Infinity;
  for (const e of end) {
    e.labelY = Math.min(e.value, prev - 0.6);
    prev = e.labelY;
    e.date = new Date("2025-01-01T00:00:00Z");
  }
  const others = [{ date: end[0].date, value: fv("ES", 2025, "B9") }, { date: end[0].date, value: fv("IT", 2025, "B9") }];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 44,
    marginRight: 120,
    marginTop: 28,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [new Date("1995-01-01T00:00:00Z"), new Date("2025-01-01T00:00:00Z")] },
    y: { label: "Government budget balance, % of GDP (below zero = deficit)", labelArrow: "none", grid: true, domain: [-10, 3] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(eu, { x: "date", y: "value", stroke: LINE2, strokeWidth: 1.5, strokeDasharray: "4,3" }),
      Plot.line(de, { x: "date", y: "value", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(fr, { x: "date", y: "value", stroke: LINE, strokeWidth: 2.5 }),
      Plot.dot(others, { x: "date", y: "value", fill: GREY, r: 3 }),
      Plot.dot([frSmall, frBig, fr24, y(fr, 2025)], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.dot([deTop], { x: "date", y: "value", fill: GREY, r: 3 }),
      Plot.text([frSmall], { x: "date", y: "value", text: (r) => `France ${r.year}: ${signed(r.value)}`, dy: -12, textAnchor: "middle", fill: LINE }),
      Plot.text([frBig], { x: "date", y: "value", text: (r) => `${r.year}: ${signed(r.value)}`, dy: 14, textAnchor: "middle", fill: LINE }),
      Plot.text([fr24], { x: "date", y: "value", text: (r) => `${r.year}: ${signed(r.value)}`, dy: 16, textAnchor: "middle", fill: LINE }),
      Plot.text([deTop], { x: "date", y: "value", text: (r) => `Germany ${r.year}: ${signed(r.value)}`, dy: -10, textAnchor: "middle", fill: GREY }),
      Plot.text(end.filter((e) => e.name !== "France"), { x: "date", y: "labelY", text: (e) => `${e.name} ${signed(e.value)}`, dx: 8, textAnchor: "start", fill: GREY }),
      Plot.text(end.filter((e) => e.name === "France"), { x: "date", y: "labelY", text: (e) => `${e.name} ${signed(e.value)}`, dx: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([{ date: new Date("2025-01-01T00:00:00Z"), y: 0 }], { x: "date", y: "y", text: () => "balanced budget", dx: 8, textAnchor: "start", fill: INK }),
    ],
  });
  write("france-debt-chart-balance.svg", fig);
}

// --- Chart 3: France raises more than the EU27 average and spends more still --
{
  const gap = (ind) => round1(fv("FR", 2025, ind) - fv("EU27_2020", 2025, ind));
  const types = [
    { key: "D62PAY", label: "Social benefits in cash" },
    { key: "D1PAY", label: "Public-sector pay" },
    { key: "D632PAY", label: "Social transfers in kind" },
    { key: "P51G", label: "Investment" },
    { key: "D3PAY", label: "Subsidies" },
    { key: "D41PAY", label: "Interest" },
    { key: "P2", label: "Goods and services bought" },
  ].map((t) => ({ ...t, value: gap(t.key) }));
  types.sort((a, b) => b.value - a.value);
  const te = gap("TE");
  const residual = round1(te - types.reduce((s, t) => s + t.value, 0));
  const totals = [
    { label: "Revenue", value: gap("TR"), note: `${fv("FR", 2025, "TR").toFixed(1)}% vs ${fv("EU27_2020", 2025, "TR").toFixed(1)}%`, fill: LINE },
    { label: "Spending", value: te, note: `${fv("FR", 2025, "TE").toFixed(1)}% vs ${fv("EU27_2020", 2025, "TE").toFixed(1)}%`, fill: HIGHLIGHT },
  ];
  const SPACER = "spacer";
  const parts = [...types, { key: "other", label: "Everything else", value: residual }].map((t) => ({
    ...t,
    fill: t.value < 0 ? LINE2 : HIGHLIGHT,
    opacity: 0.6,
  }));
  const all = [...totals.map((t) => ({ ...t, opacity: 1 })), ...parts];
  const domain = [...totals.map((t) => t.label), SPACER, ...parts.map((t) => t.label)];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 180,
    marginRight: 150,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: "France minus EU27 average, percentage points of GDP, 2025", labelAnchor: "center", labelArrow: "none", domain: [-1, 8], grid: true },
    y: { label: null, domain, tickFormat: (d) => (d === SPACER ? "" : d), tickSize: 0 },
    marks: [
      Plot.barX(all, { x: "value", y: "label", fill: "fill", fillOpacity: "opacity" }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(all.filter((d) => d.value >= 0), { x: "value", y: "label", text: (d) => signed(d.value), dx: 6, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text(all.filter((d) => d.value < 0), { x: 0, y: "label", text: (d) => signed(d.value), dx: 6, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text(totals, { x: "value", y: "label", text: (d) => `(${d.note})`, dx: 40, textAnchor: "start", fill: INK }),
      Plot.text([{ label: SPACER }], { x: 0, y: "label", text: () => "Spending gap, by type:", dx: -8, textAnchor: "end", fill: INK, fontWeight: "bold" }),
    ],
  });
  write("france-debt-chart-gap.svg", fig);
}

// --- Chart 4: the interest bill has turned up, from a low base ----------------
{
  const fr = annual("FR", "D41PAY");
  const y = (year) => on(fr, year, "year");
  const bn = (year) => (fv("FR", year, "D41PAY", "MIO_EUR") / 1000).toFixed(1);
  const peak = y(1996);
  if (Math.max(...fr.map((r) => r.value)) !== peak.value) throw new Error("1996 is no longer the peak");
  const low = y(2020);
  const last = y(2025);
  const d2025 = new Date("2025-01-01T00:00:00Z");
  const others = [
    { name: "Italy", date: d2025, value: fv("IT", 2025, "D41PAY") },
    { name: "EU27", date: d2025, value: fv("EU27_2020", 2025, "D41PAY") },
  ];
  const label = (r) => `${r.year}: ${pct(r.value)} (€${bn(r.year)}bn)`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 44,
    marginRight: 110,
    marginTop: 28,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [new Date("1995-01-01T00:00:00Z"), d2025] },
    y: { label: "Interest paid by French government, % of GDP", labelArrow: "none", grid: true, domain: [0, 4.5] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(fr, { x: "date", y: "value", stroke: LINE, strokeWidth: 2.5 }),
      Plot.dot([peak, low, last], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.text([peak], { x: "date", y: "value", text: label, dy: -12, textAnchor: "start", fill: LINE }),
      Plot.text([low], { x: "date", y: "value", text: label, dy: 16, textAnchor: "middle", fill: LINE }),
      Plot.text([last], { x: "date", y: "value", text: (r) => `France ${label(r)}`, dx: -8, dy: -14, textAnchor: "end", fill: LINE, fontWeight: "bold" }),
      Plot.dot(others, { x: "date", y: "value", fill: GREY, r: 3.5 }),
      Plot.text(others, { x: "date", y: "value", text: (d) => `${d.name} 2025: ${pct(d.value)}`, dx: 8, textAnchor: "start", fill: GREY }),
    ],
  });
  write("france-debt-chart-interest.svg", fig);
}
