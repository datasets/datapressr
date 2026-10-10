// Regenerate the SVG charts embedded in france-debt.md.
//   npm ci && node france-debt-make-charts.mjs
//
// Implements the chart plan in france-debt-outline.md. Every annotated value is
// read from the dataset rows; a missing row fails the build.

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

const fmt1 = (v) => v.toFixed(1);
const fmtBn = (v) => v.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const signed = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt1(Math.abs(v));

// --- Chart 1: debt ratio has doubled since 2000 -------------------------------
{
  const rows = read("quarterly-debt.csv").map((d) => ({
    period: d.period,
    date: new Date(`${d.period_end}T00:00:00Z`),
    pct: Number(d.gross_debt_pct_gdp),
    bn: Number(d.gross_debt_eur_billions),
  }));
  if (rows.length !== 106 || rows.some((d) => !Number.isFinite(d.pct))) throw new Error("quarterly-debt: expected 106 complete quarters");
  const on = (p) => {
    const r = rows.find((d) => d.period === p);
    if (!r) throw new Error(`no quarter ${p}`);
    return r;
  };
  const last = rows.at(-1);
  const marks = [
    { ...on("2000-Q1"), text: (d) => `2000-Q1: ${fmt1(d.pct)}%`, dy: 16, anchor: "start", dx: 4 },
    { ...on("2007-Q4"), text: (d) => `2007-Q4: ${fmt1(d.pct)}%`, dy: 16, anchor: "start", dx: 4 },
    { ...on("2019-Q4"), text: (d) => `2019-Q4: ${fmt1(d.pct)}%`, dy: 16, anchor: "start", dx: 4 },
    { ...on("2020-Q4"), text: (d) => `2020-Q4: ${fmt1(d.pct)}%`, dy: -12, anchor: "end", dx: -4 },
    { ...on("2023-Q4"), text: (d) => `2023-Q4: ${fmt1(d.pct)}%`, dy: 18, anchor: "middle", dx: 0 },
    { ...last, text: (d) => `${d.period}: ${fmt1(d.pct)}%`, dy: -26, anchor: "end", dx: 0 },
    { ...last, text: (d) => `€${fmtBn(d.bn)} bn`, dy: -12, anchor: "end", dx: 0 },
  ];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 20,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { domain: [0, 130], label: "Gross debt, % of GDP (quarter end)", labelArrow: "none", grid: true },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.ruleY([60], { stroke: LINE2, strokeDasharray: "4,3" }),
      Plot.text([60], { x: new Date("2013-01-01T00:00:00Z"), y: (d) => d, text: () => "60% Maastricht reference value", dy: -7, textAnchor: "start", fill: "#6b7280" }),
      Plot.line(rows, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "pct", fill: HIGHLIGHT, r: 3.5 }),
      ...marks.map((m) => Plot.text([m], { x: "date", y: "pct", text: m.text, dy: m.dy, dx: m.dx, textAnchor: m.anchor, fill: INK })),
    ],
  });
  writeFileSync(join(HERE, "france-debt-ratio.svg"), toSvg(fig) + "\n");
}

// --- Fiscal accounts: shared lookup -------------------------------------------
const fiscal = read("fiscal-accounts.csv");
function val(geo, year, indicator, unit = "PC_GDP") {
  const r = fiscal.find((d) => d.country_code === geo && Number(d.year) === year && d.indicator === indicator && d.unit === unit);
  if (!r || r.value === "") throw new Error(`no value ${geo} ${year} ${indicator} ${unit}`);
  return Number(r.value);
}
const YEARS = Array.from({ length: 31 }, (_, i) => 1995 + i);
const yd = (y) => new Date(Date.UTC(y, 0, 1));

// --- Chart 2: a deficit every year; most of it is not interest ----------------
{
  const rows = YEARS.map((year) => {
    const balance = val("FR", year, "B9");
    const interest = val("FR", year, "D41PAY");
    // Both are published to 0.1 pp, so round the sum to the same precision.
    return { year, balance, interest, primary: Math.round((balance + interest) * 10) / 10, interestEur: val("FR", year, "D41PAY", "MIO_EUR") };
  });
  const at = (y) => rows.find((d) => d.year === y);
  let runStart = 2025;
  while (at(runStart - 1) && at(runStart - 1).primary < 0) runStart--;
  if (rows.some((d) => d.balance >= 0)) throw new Error("expected a deficit in every year");

  const barNotes = [
    { r: at(2000), dy: 12 },
    { r: at(2009), dy: 12 },
    { r: at(2020), dy: 12 },
    { r: at(2025), dy: 12 },
  ];
  const primNotes = [
    { r: at(2000), text: (d) => `excl. interest ${signed(d.primary)}`, dy: -10 },
    { r: at(2025), text: (d) => `excl. interest ${signed(d.primary)}`, dy: -10 },
  ];
  const intNotes = [at(2020), at(2025)];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: 52,
    marginRight: 20,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { type: "band", label: null, tickFormat: (y) => (y % 5 === 0 ? String(y) : "") },
    y: { domain: [-10, 4], label: "% of GDP", labelArrow: "none", grid: true },
    marks: [
      Plot.barY(rows, { x: "year", y: "balance", fill: "#fca5a5" }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "year", y: "primary", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(rows, { x: "year", y: "primary", fill: LINE, r: 2.5 }),
      Plot.text(barNotes, { x: (d) => d.r.year, y: (d) => d.r.balance, text: (d) => signed(d.r.balance), dy: 10, fill: HIGHLIGHT, fontWeight: "bold" }),
      ...primNotes.map((n) => Plot.text([n.r], { x: "year", y: "primary", text: n.text, dy: n.dy, fill: LINE, textAnchor: n.r.year === 2025 ? "end" : "middle" })),
      ...intNotes.map((d, i) =>
        Plot.text([d], { x: () => 2025, y: 3.6 - i * 0.6, text: () => `Interest ${d.year}: ${fmt1(d.interest)}% of GDP (€${fmtBn(d.interestEur / 1000)} bn)`, textAnchor: "end", fill: INK }),
      ),
      Plot.text([{ year: 1995 }], { x: "year", y: 3.6, text: () => "Bars: overall balance (deficit < 0)", textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text([{ year: 1995 }], { x: "year", y: 3.0, text: () => "Line: balance excluding interest (primary balance)", textAnchor: "start", fill: LINE }),
      Plot.text([{ year: 1995 }], { x: "year", y: -9.6, text: () => `Deficit every year 1995–2025; primary deficit every year since ${runStart}`, textAnchor: "start", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-deficit.svg"), toSvg(fig) + "\n");
}

// --- Chart 3: spending vs revenue, France vs EU27 -----------------------------
{
  const series = [
    { geo: "FR", indicator: "TE", name: "France spending", stroke: LINE, dash: null },
    { geo: "FR", indicator: "TR", name: "France revenue", stroke: LINE, dash: "5,3" },
    { geo: "EU27_2020", indicator: "TE", name: "EU27 spending", stroke: LINE2, dash: null },
    { geo: "EU27_2020", indicator: "TR", name: "EU27 revenue", stroke: LINE2, dash: "5,3" },
  ].map((s) => ({ ...s, rows: YEARS.map((year) => ({ year, date: yd(year), value: val(s.geo, year, s.indicator) })) }));

  const fr2019 = series.slice(0, 2).map((s) => ({ ...s.rows.find((r) => r.year === 2019), stroke: s.stroke }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 150,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { domain: [40, 64], label: "% of GDP", labelArrow: "none", grid: true },
    marks: [
      ...series.map((s) => Plot.line(s.rows, { x: "date", y: "value", stroke: s.stroke, strokeWidth: 2, strokeDasharray: s.dash })),
      ...series.map((s) =>
        Plot.text([s.rows.at(-1)], { x: "date", y: "value", text: (d) => `${s.name} ${fmt1(d.value)}`, dx: 6, textAnchor: "start", fill: s.stroke === LINE ? LINE : "#6b7280", fontWeight: "bold" }),
      ),
      Plot.dot(fr2019, { x: "date", y: "value", fill: HIGHLIGHT, r: 3.5 }),
      Plot.text([fr2019[0]], { x: "date", y: "value", text: (d) => `2019: ${fmt1(d.value)}`, dy: -12, fill: HIGHLIGHT }),
      Plot.text([fr2019[1]], { x: "date", y: "value", text: (d) => `2019: ${fmt1(d.value)}`, dy: 14, fill: HIGHLIGHT }),
      Plot.text([{ date: yd(2009), value: 62.5 }], { x: "date", y: "value", text: () => "Solid: spending · dashed: revenue · 2025 values at right", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "france-debt-spending-revenue.svg"), toSvg(fig) + "\n");
}

console.log("wrote france-debt-ratio.svg, france-debt-deficit.svg, france-debt-spending-revenue.svg");
