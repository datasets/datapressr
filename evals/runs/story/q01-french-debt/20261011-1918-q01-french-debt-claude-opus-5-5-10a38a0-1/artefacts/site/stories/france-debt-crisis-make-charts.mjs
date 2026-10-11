// Regenerate the SVG charts embedded in france-debt-crisis.md.
//   npm ci && node france-debt-crisis-make-charts.mjs
//
// Implements the chart plan in france-debt-crisis-outline.md. Every annotated
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

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const read = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const fiscal = read("fiscal-accounts.csv");
const debt = read("quarterly-debt.csv");

/** One fiscal value; throws if the row or its value is missing. */
function fv(geo, year, indicator, unit) {
  const row = fiscal.find((r) => r.country_code === geo && r.year === String(year) && r.indicator === indicator && r.unit === unit);
  if (!row || row.value === "") throw new Error(`no value for ${geo} ${year} ${indicator} ${unit}`);
  return Number(row.value);
}

/** The quarterly debt row for one period; throws if missing. */
function quarter(period) {
  const row = debtRows.find((r) => r.period === period);
  if (!row) throw new Error(`no row for ${period}`);
  return row;
}

const years = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const one = (x) => x.toFixed(1);
const bn = (x) => `€${Math.round(x).toLocaleString("en-GB")}bn`;
const tn = (x) => `€${(x / 1000).toFixed(1)}tn`;

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

/** A bold chart title in the top margin. */
const title = (text) => Plot.text([text], { frameAnchor: "top-left", dy: -56, dx: -40, text: (d) => d, fill: INK, fontWeight: "bold", fontSize: 14, textAnchor: "start" });
/** The y-axis unit, under the title (Plot's own y label sits above it). */
const unit = (text) => Plot.text([text], { frameAnchor: "top-left", dy: -20, dx: -40, text: (d) => d, fill: INK, textAnchor: "start" });

const debtRows = debt.map((r) => ({
  period: r.period,
  date: new Date(`${r.period_end}T00:00:00Z`),
  pct: Number(r.gross_debt_pct_gdp),
  eur: Number(r.gross_debt_eur_billions),
}));

// --- Chart 1: debt as a share of GDP, quarterly ------------------------------
{
  const start = quarter("2000-Q1");
  const end = quarter("2026-Q2");
  const peak = quarter("2021-Q1");
  const below = [quarter("2019-Q4")];
  const belowLeft = quarter("2023-Q4");
  const belowRight = quarter("2025-Q4");
  const deficits = years(2001, 2025).reduce((sum, y) => sum - fv("FR", y, "B9", "MIO_EUR"), 0) / 1000;
  const rise = quarter("2025-Q4").eur - quarter("2000-Q4").eur;
  const note = `Deficits 2001–2025 add up to ${tn(deficits)}.\nDebt rose ${tn(rise)}, end-2000 to end-2025.`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 120,
    marginTop: 60,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { domain: [0, 130], label: null, grid: true },
    marks: [
      title("French public debt, % of GDP, quarterly"),
      unit("Gross debt (% of GDP)"),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(debtRows, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot([start, peak, ...below, belowLeft, belowRight, end], { x: "date", y: "pct", fill: HIGHLIGHT, r: 4 }),
      Plot.text([start], { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%\n${bn(d.eur)}`, dy: 22, dx: 4, textAnchor: "start", fill: INK }),
      Plot.text([peak], { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%`, dx: -6, dy: -10, textAnchor: "end", fill: INK }),
      Plot.text(below, { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%`, dy: 16, textAnchor: "middle", fill: INK }),
      Plot.text([belowLeft], { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%`, dy: 16, textAnchor: "end", fill: INK }),
      Plot.text([belowRight], { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%`, dy: 16, textAnchor: "start", fill: INK }),
      Plot.text([end], { x: "date", y: "pct", text: (d) => `${d.period}: ${one(d.pct)}%\n${tn(d.eur)}`, dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([note], { frameAnchor: "bottom-right", dx: -12, dy: -12, text: (d) => d, textAnchor: "end", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-crisis-debt.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: spending vs revenue, France, % of GDP --------------------------
{
  const rows = years(1995, 2025).map((year) => ({
    year,
    te: fv("FR", year, "TE", "PC_GDP"),
    tr: fv("FR", year, "TR", "PC_GDP"),
    b9: fv("FR", year, "B9", "PC_GDP"),
  }));
  const at = (year) => rows.find((r) => r.year === year);
  const below = [at(2000)];
  const above = [at(2009), at(2020)];
  const recent = [{ year: 2025, y: Math.min(at(2024).tr, at(2025).tr), text: `Deficit ${one(-at(2024).b9)} (2024)\n→ ${one(-at(2025).b9)} (2025)` }];
  const y2019 = at(2019);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 60,
    marginBottom: 40,
    style: FONT,
    x: { label: null, tickFormat: "d", domain: [1995, 2025] },
    y: { domain: [45, 65], label: null, grid: true },
    marks: [
      title("France: public spending vs revenue, % of GDP, 1995–2025"),
      unit("% of GDP (axis starts at 45)"),
      Plot.areaY(rows, { x: "year", y1: "tr", y2: "te", fill: HIGHLIGHT, fillOpacity: 0.18 }),
      Plot.line(rows, { x: "year", y: "te", stroke: INK, strokeWidth: 2 }),
      Plot.line(rows, { x: "year", y: "tr", stroke: LINE, strokeWidth: 2 }),
      Plot.text([at(2025)], { x: "year", y: "te", text: (d) => `Spending ${one(d.te)}`, dx: 8, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([at(2025)], { x: "year", y: "tr", text: (d) => `Revenue ${one(d.tr)}`, dx: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.dot([y2019], { x: "year", y: "te", fill: INK, r: 3.5 }),
      Plot.dot([y2019], { x: "year", y: "tr", fill: LINE, r: 3.5 }),
      Plot.text([y2019], { x: "year", y: "tr", text: (d) => `2019: spending ${one(d.te)}\nrevenue ${one(d.tr)}`, dy: 30, fill: INK }),
      Plot.text(below, { x: "year", y: "tr", text: (d) => `${d.year}: deficit ${one(-d.b9)}\n(smallest)`, dy: 24, fill: HIGHLIGHT }),
      Plot.text(above, { x: "year", y: "te", text: (d) => `${d.year}: deficit ${one(-d.b9)}`, dy: -12, fill: HIGHLIGHT }),
      Plot.text(recent, { x: "year", y: "y", text: "text", dy: 66, textAnchor: "end", fill: HIGHLIGHT }),
      Plot.text(["Shaded: deficit in every year, 1995–2025"], { frameAnchor: "bottom-left", dx: 8, dy: -8, text: (d) => d, textAnchor: "start", fill: HIGHLIGHT }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-crisis-gap.svg"), toSvg(fig) + "\n");
}

// --- Chart 3: France minus EU27, 2025, percentage points of GDP --------------
{
  const diff = (i) => Math.round((fv("FR", 2025, i, "PC_GDP") - fv("EU27_2020", 2025, i, "PC_GDP")) * 10) / 10;
  const parts = [
    ["D62PAY", "Cash social benefits"],
    ["D1PAY", "Public employee pay"],
    ["D632PAY", "Benefits in kind bought in"],
    ["D3PAY", "Subsidies"],
    ["P51G", "Investment"],
    ["D41PAY", "Interest"],
    ["P2", "Goods and services used"],
  ].map(([code, label]) => ({ label, value: diff(code) }));
  const other = { label: "Other spending", value: Math.round((diff("TE") - parts.reduce((s, p) => s + p.value, 0)) * 10) / 10 };
  const spending = [...parts, other].sort((a, b) => b.value - a.value);
  const totals = [
    { label: "All spending", value: diff("TE") },
    { label: "All revenue", value: diff("TR") },
  ];
  const rows = [...totals.map((d) => ({ ...d, kind: "total" })), ...spending.map((d) => ({ ...d, kind: d.value >= 0 ? "up" : "down" }))];
  const order = rows.map((d) => d.label);
  const geos = [["FR", "France"], ["IT", "Italy"], ["EU27_2020", "EU"], ["DE", "Germany"], ["ES", "Spain"]];
  const caption = [
    `2025 deficit, % of GDP: ${geos.map(([g, n]) => `${n} ${one(-fv(g, 2025, "B9", "PC_GDP"))}`).join(" · ")}`,
    `2025 revenue, % of GDP: ${geos.map(([g, n]) => `${n} ${one(fv(g, 2025, "TR", "PC_GDP"))}`).join(" · ")}`,
  ];
  const sign = (v) => (v > 0 ? `+${one(v)}` : `−${one(-v)}`);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 460,
    marginLeft: 190,
    marginRight: 40,
    marginTop: 60,
    marginBottom: 84,
    style: FONT,
    x: { domain: [-1.5, 9], label: "France minus EU27, percentage points of GDP", labelArrow: "none", labelAnchor: "center", labelOffset: 34, grid: true },
    y: { domain: order, label: null, tickSize: 0 },
    color: { domain: ["total", "up", "down"], range: [INK, LINE, LINE2] },
    marks: [
      title("France vs the EU27 average, 2025: spending and revenue"),
      Plot.barX(rows, { x: "value", y: "label", fill: "kind" }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(rows.filter((d) => d.value >= 0), { x: "value", y: "label", text: (d) => sign(d.value), dx: 4, textAnchor: "start", fill: INK }),
      Plot.text(rows.filter((d) => d.value < 0), { x: "value", y: "label", text: (d) => sign(d.value), dx: -4, textAnchor: "end", fill: INK }),
      Plot.text([caption.join("\n")], { frameAnchor: "bottom-left", dx: -180, dy: 80, text: (d) => d, textAnchor: "start", lineAnchor: "bottom", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-crisis-vs-eu.svg"), toSvg(fig) + "\n");
}

// --- Chart 4: interest paid, € billions --------------------------------------
{
  const rows = years(1995, 2025).map((year) => ({
    year,
    eur: fv("FR", year, "D41PAY", "MIO_EUR") / 1000,
    pct: fv("FR", year, "D41PAY", "PC_GDP"),
    recent: year >= 2021,
  }));
  const at = (year) => rows.find((r) => r.year === year);
  const label = (d) => `${d.year}: €${one(d.eur)}bn\n${one(d.pct)}% of GDP`;
  const primary = -(fv("FR", 2025, "B9", "PC_GDP") + fv("FR", 2025, "D41PAY", "PC_GDP"));
  const note = `2025 deficit excluding interest: ${one(primary)}% of GDP`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 40,
    marginTop: 60,
    marginBottom: 56,
    style: FONT,
    x: { label: null, tickFormat: (y) => (y % 5 === 0 ? String(y) : ""), tickSize: 0, padding: 0.15 },
    y: { domain: [0, 80], label: null, grid: true },
    color: { domain: [false, true], range: [LINE2, HIGHLIGHT] },
    marks: [
      title("France: interest paid on public debt, € billions, 1995–2025"),
      unit("€ billions, current prices"),
      Plot.barY(rows, { x: "year", y: "eur", fill: "recent" }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.text([at(1995)], { x: "year", y: "eur", text: label, dx: -8, dy: -36, textAnchor: "start", fill: INK }),
      Plot.text([at(2021)], { x: "year", y: "eur", text: label, dx: 8, dy: -46, textAnchor: "end", fill: INK }),
      Plot.text([at(2025)], { x: "year", y: "eur", text: label, dy: -30, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([note], { frameAnchor: "top-left", dx: 12, dy: 6, text: (d) => d, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(["Eurostat D41PAY. INSEE shows €64.7bn for 2025 on a different FISIM treatment."], { frameAnchor: "bottom-left", dx: -40, dy: 44, text: (d) => d, textAnchor: "start", fill: LINE2 }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-crisis-interest.svg"), toSvg(fig) + "\n");
}

console.log("wrote france-debt-crisis-{debt,gap,vs-eu,interest}.svg");
