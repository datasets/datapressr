// Regenerate the SVG charts embedded in french-debt.md.
//   npm ci && node french-debt-make-charts.mjs
//
// Implements the chart plan in french-debt-outline.md (approved revision 5903277).
// Reads the france-public-finances CSVs with d3-dsv: fiscal-accounts.csv has
// quoted labels containing commas and newlines, so a naive split(",") breaks.

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
const SOFT_RED = "#f4a6a6";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };
const HALO = { stroke: "white", strokeWidth: 4, paintOrder: "stroke" };

const read = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const quarterly = read("quarterly-debt.csv");
const fiscal = read("fiscal-accounts.csv");
const functions = read("spending-functions.csv");

/** One required numeric value; throws so a missing annotation fails the build. */
function one(rows, pred, col, what) {
  const r = rows.filter(pred);
  if (r.length !== 1 || r[0][col] === "") throw new Error(`expected one ${what}, got ${r.length}`);
  return Number(r[0][col]);
}
const fisc = (geo, indicator, year) =>
  one(fiscal, (r) => r.country_code === geo && r.indicator === indicator && r.unit === "PC_GDP" && r.year === String(year), "value", `${geo} ${indicator} ${year}`);
const cofog = (code, year) =>
  one(functions, (r) => r.function_code === code && r.unit === "PC_GDP" && r.year === String(year), "value", `COFOG ${code} ${year}`);

const f1 = (v) => v.toFixed(1);
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
const written = [];
function save(name, fig) {
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
  written.push(name);
}

// --- Chart 1: debt doubled as a share of GDP, in two steps --------------------
{
  const rows = quarterly.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    pct: Number(r.gross_debt_pct_gdp),
    bn: Number(r.gross_debt_eur_billions),
  }));
  if (rows.some((r) => !Number.isFinite(r.pct))) throw new Error("missing debt ratio");
  const at = (p) => {
    const r = rows.find((d) => d.period === p);
    if (!r) throw new Error(`no row for ${p}`);
    return r;
  };
  const last = rows.at(-1);
  if (last.period !== "2026-Q2") throw new Error(`latest quarter is ${last.period}`);
  const end = (p) => ({ ...at(p), label: `End-${p.slice(0, 4)}: ${f1(at(p).pct)}%` });
  const belowStart = [end("2000-Q4")];
  const below = [end("2007-Q4"), end("2023-Q4")];
  const aboveLeft = [end("2009-Q4")];
  const belowRight = [end("2019-Q4")];
  const farLeft = [end("2020-Q4")];
  const latest = [{ ...last, label: `Mid-2026: ${f1(last.pct)}%\n€${(last.bn / 1000).toFixed(1)} trillion` }];
  const step = (from, to, x, y) => ({ date: new Date(x), y, label: `+${f1(at(to).pct - at(from).pct)} points` });

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 44,
    marginRight: 120,
    marginTop: 28,
    marginBottom: 60,
    style: FONT,
    x: { label: null },
    y: { label: "Gross government debt, % of GDP", labelArrow: "none", domain: [0, 130], grid: true },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot([...belowStart, ...below, ...aboveLeft, ...belowRight, ...farLeft], { x: "date", y: "pct", fill: INK, r: 3.5 }),
      Plot.dot(latest, { x: "date", y: "pct", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text(belowStart, { x: "date", y: "pct", text: "label", dy: 16, textAnchor: "start", fill: INK, ...HALO }),
      Plot.text(below, { x: "date", y: "pct", text: "label", dy: 16, textAnchor: "middle", fill: INK, ...HALO }),
      Plot.text(aboveLeft, { x: "date", y: "pct", text: "label", dy: -14, textAnchor: "end", fill: INK, ...HALO }),
      Plot.text(belowRight, { x: "date", y: "pct", text: "label", dx: 4, dy: 16, textAnchor: "start", fill: INK, ...HALO }),
      Plot.text(farLeft, { x: "date", y: "pct", text: "label", dx: -26, dy: -10, textAnchor: "end", fill: INK, ...HALO }),
      Plot.text(latest, { x: "date", y: "pct", text: "label", dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold", lineHeight: 1.2 }),
      Plot.text([step("2007-Q4", "2009-Q4", "2008-12-31T00:00:00Z", 79), step("2019-Q4", "2020-Q4", "2020-06-30T00:00:00Z", 107)], {
        x: "date", y: "y", text: "label", dx: -12, textAnchor: "end", fill: HIGHLIGHT, ...HALO,
      }),
      Plot.text(["Quarter-end values, INSEE release of 29 September 2026.\nThe ratio is seasonal within each year, so end-year (Q4) points are compared."], {
        frameAnchor: "bottom-left", lineAnchor: "top", dy: 26, fill: "#6b7280", fontSize: 11, lineHeight: 1.2,
      }),
    ],
  });
  save("french-debt-ratio.svg", fig);
}

// --- Chart 2: borrowing every year, and more than the interest bill since 2002 -
{
  const years = Array.from({ length: 31 }, (_, i) => 1995 + i);
  const rows = years.map((year) => ({ year, borrowing: -fisc("FR", "B9", year), interest: fisc("FR", "D41PAY", year) }));
  const deficitYears = rows.filter((r) => r.borrowing > 0).length;
  const over3 = rows.filter((r) => r.borrowing > 3).length;
  const worseThanEu = years.filter((y) => fisc("FR", "B9", y) < fisc("EU27_2020", "B9", y)).length;
  const firstPrimaryDeficitRun = years.find((y) => years.filter((z) => z >= y).every((z) => rows[z - 1995].borrowing > rows[z - 1995].interest));
  const row = (y) => rows[y - 1995];
  const borrowLabels = [2000, 2009, 2020, 2025].map((y) => ({ year: y, v: row(y).borrowing, label: f1(row(y).borrowing) }));
  const interestLabels = [1996, 2020, 2025].map((y) => ({ year: y, v: row(y).interest, label: f1(row(y).interest) }));
  const interestAbove = interestLabels.filter((d) => d.year === 1996);
  const interestBelow = interestLabels.filter((d) => d.year !== 1996);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 430,
    marginLeft: 44,
    marginRight: 20,
    marginTop: 28,
    marginBottom: 64,
    style: FONT,
    x: { type: "band", label: null, ticks: [1995, 2000, 2005, 2010, 2015, 2020, 2025], tickFormat: "d", padding: 0.15 },
    y: { label: "% of GDP", labelArrow: "none", domain: [0, 11], ticks: [0, 2, 4, 6, 8, 10], grid: true },
    marks: [
      Plot.barY(rows, { x: "year", y: "borrowing", fill: SOFT_RED }),
      Plot.ruleY([3], { stroke: INK, strokeDasharray: "4,3" }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "year", y: "interest", stroke: INK, strokeWidth: 2 }),
      Plot.dot(interestLabels, { x: "year", y: "v", fill: INK, r: 3 }),
      Plot.text(interestAbove, { x: "year", y: "v", text: "label", dy: -12, fill: INK, ...HALO }),
      Plot.text(interestBelow, { x: "year", y: "v", text: "label", dy: 12, fill: INK, ...HALO }),
      Plot.text(borrowLabels, { x: "year", y: "v", text: "label", dy: -8, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([{ year: 1995, y: 10.6, label: `Net borrowing (deficit): ${deficitYears} of ${rows.length} years, above 3% in ${over3}` }], {
        x: "year", y: "y", text: "label", textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold", dx: -8,
      }),
      Plot.text([{ year: 1995, y: 9.9, label: "Interest paid" }], { x: "year", y: "y", text: "label", textAnchor: "start", fill: INK, fontWeight: "bold", dx: -8 }),
      Plot.text([{ year: 1995, y: 9.2, label: `Borrowing above interest every year since ${firstPrimaryDeficitRun}` }], {
        x: "year", y: "y", text: "label", textAnchor: "start", fill: INK, dx: -8,
      }),
      Plot.text([{ year: 2011, y: 3, label: "3% Maastricht reference" }], {
        x: "year", y: "y", text: "label", dy: -8, textAnchor: "start", fill: INK, ...HALO,
      }),
      Plot.text([`France, general government, % of GDP. Eurostat gov_10a_main, update 21 July 2026.\nFrance's deficit was larger than the EU27's in ${worseThanEu} of ${rows.length} years.`], {
        frameAnchor: "bottom-left", lineAnchor: "top", dy: 26, fill: "#6b7280", fontSize: 11, lineHeight: 1.2,
      }),
    ],
  });
  save("french-debt-borrowing.svg", fig);
}

// --- Chart 3: highest revenue of the five, and higher spending still (2025) ---
{
  const geos = [
    ["FR", "France"],
    ["IT", "Italy"],
    ["DE", "Germany"],
    ["EU27_2020", "EU27 (aggregate)"],
    ["ES", "Spain"],
  ];
  const rows = geos
    .map(([code, name]) => ({ name, revenue: fisc(code, "TR", 2025), spending: fisc(code, "TE", 2025), balance: fisc(code, "B9", 2025) }))
    .sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  const order = rows.map((r) => r.name);
  const fr = rows.filter((r) => r.name === "France");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 310,
    marginLeft: 120,
    marginRight: 100,
    marginTop: 40,
    marginBottom: 70,
    style: FONT,
    x: { label: "Share of GDP, 2025 (%)", labelArrow: "none", labelAnchor: "center", domain: [40, 60], grid: true },
    y: { label: null, domain: order, padding: 0.4 },
    marks: [
      Plot.link(rows, { x1: "revenue", x2: "spending", y1: "name", y2: "name", stroke: LINE2, strokeWidth: 3 }),
      Plot.dot(rows, { x: "revenue", y: "name", fill: INK, r: 6 }),
      Plot.dot(rows, { x: "spending", y: "name", fill: HIGHLIGHT, r: 6 }),
      Plot.text(rows, { x: "revenue", y: "name", text: (d) => f1(d.revenue), dx: -10, textAnchor: "end", fill: INK }),
      Plot.text(rows, { x: "spending", y: "name", text: (d) => f1(d.spending), dx: 10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(rows, { x: 60, y: "name", text: (d) => `deficit ${f1(-d.balance)}`, dx: 12, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text(fr, { x: "revenue", y: "name", text: () => "Revenue", dy: -16, fill: INK, fontWeight: "bold" }),
      Plot.text(fr, { x: "spending", y: "name", text: () => "Spending", dy: -16, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(["General government, Eurostat gov_10a_main. Deficit is the official net borrowing (B9);\nit can differ from spending minus revenue by 0.1 point because of rounding."], {
        frameAnchor: "bottom-left", lineAnchor: "top", dx: -110, dy: 38, fill: "#6b7280", fontSize: 11, lineHeight: 1.2,
      }),
    ],
  });
  save("french-debt-revenue-spending.svg", fig);
}

// --- Chart 4: what grew as a share of GDP, 1995 to 2024 -----------------------
{
  // Mutually exclusive COFOG set: divisions 01-09 plus the groups of 10 (social protection).
  const codes = [...new Set(functions.filter((r) => (r.level === "1" && r.function_code !== "GF10") || r.parent_code === "GF10").map((r) => r.function_code))].sort();
  if (codes.length !== 18) throw new Error(`expected 18 COFOG categories, got ${codes.length}`);
  const rename = {
    GF01: "General public services (incl. interest)",
    GF1007: "Social exclusion (not elsewhere classified)",
  };
  const all = codes.map((code) => {
    const name = rename[code] ?? functions.find((r) => r.function_code === code).function_name;
    return { code, name, change: round1(cofog(code, 2024) - cofog(code, 1995)) };
  });
  const rows = all.filter((r) => Math.abs(r.change) >= 0.3).sort((a, b) => b.change - a.change || a.code.localeCompare(b.code));
  const rest = all.length - rows.length;
  const up = rows.filter((r) => r.change > 0);
  const down = rows.filter((r) => r.change < 0);
  const interest = round1(cofog("GF0107", 2024) - cofog("GF0107", 1995));
  const gf01 = rows.filter((r) => r.code === "GF01");
  const totalFlag = functions.find((r) => r.function_code === "TOTAL" && r.unit === "PC_GDP" && r.year === "2024").status_flag;
  const note1 = `${rest} other categories changed by less than 0.3 points. Total spending ${f1(cofog("TOTAL", 1995))}% → ${f1(cofog("TOTAL", 2024))}% of GDP.`;
  const note2 = `Social protection was ${f1(cofog("GF10", 2024))}% of GDP in 2024, of which old age ${f1(cofog("GF1002", 2024))}. Eurostat gov_10a_exp (COFOG)${totalFlag === "p" ? "; 2024 provisional" : ""}.`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 460,
    marginLeft: 300,
    marginRight: 40,
    marginTop: 28,
    marginBottom: 76,
    style: FONT,
    x: { label: "Change in spending, 1995 to 2024 (points of GDP)", labelArrow: "none", labelAnchor: "center", domain: [-2.5, 3], grid: true, tickFormat: (v) => signed(v) },
    y: { label: null, domain: rows.map((r) => r.name), padding: 0.25 },
    marks: [
      Plot.barX(up, { x: "change", y: "name", fill: HIGHLIGHT }),
      Plot.barX(down, { x: "change", y: "name", fill: LINE2 }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(up, { x: "change", y: "name", text: (d) => signed(d.change), dx: 4, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(down, { x: "change", y: "name", text: (d) => signed(d.change), dx: -4, textAnchor: "end", fill: INK }),
      Plot.text(gf01, { x: 0, y: "name", text: () => `of which debt interest ${signed(interest)}`, dx: 6, textAnchor: "start", fill: INK }),
      Plot.text([note1], { frameAnchor: "bottom-left", lineAnchor: "top", dx: -290, dy: 44, fill: "#6b7280", fontSize: 11 }),
      Plot.text([note2], { frameAnchor: "bottom-left", lineAnchor: "top", dx: -290, dy: 60, fill: "#6b7280", fontSize: 11 }),
    ],
  });
  save("french-debt-spending-change.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
