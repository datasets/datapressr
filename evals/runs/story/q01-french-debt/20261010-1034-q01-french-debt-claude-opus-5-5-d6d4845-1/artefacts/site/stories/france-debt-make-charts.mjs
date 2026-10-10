// Regenerate the SVG charts embedded in france-debt.md.
//   npm ci && node france-debt-make-charts.mjs
//
// Implements the chart plan in france-debt-outline.md (approved at d49b088).
// Every annotated number is read from the dataset rows; a missing row throws.

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
const functions = read("spending-functions.csv");
const debt = read("quarterly-debt.csv");

/** One value, or throw so a missing annotation fails the build. */
function must(rows, pred, what) {
  const row = rows.find(pred);
  if (!row || row.value === "" || row.value === undefined) throw new Error(`no value for ${what}`);
  return row;
}
const fv = (geo, indicator, unit, year) =>
  Number(must(fiscal, (r) => r.country_code === geo && r.indicator === indicator && r.unit === unit && r.year === String(year), `${geo} ${indicator} ${unit} ${year}`).value);
/** A French annual series 1995–2025 from its own rows; throws on a gap. */
const frSeries = (indicator) => {
  const out = [];
  for (let year = 1995; year <= 2025; year++) out.push({ year, value: fv("FR", indicator, "PC_GDP", year) });
  return out;
};
const pct = (v) => v.toFixed(1);
const bn = (mio) => `€${(mio / 1000).toFixed(1)}bn`;

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

// --- Chart 1: debt doubled as a share of GDP ---------------------------------
{
  const rows = debt.map((r) => ({
    period: r.period,
    date: new Date(`${r.period_end}T00:00:00Z`),
    value: Number(r.gross_debt_pct_gdp),
    eur: Number(r.gross_debt_eur_billions),
  }));
  if (rows.some((r) => !Number.isFinite(r.value))) throw new Error("gap in quarterly debt");
  const at = (p) => {
    const row = rows.find((r) => r.period === p);
    if (!row) throw new Error(`no row for ${p}`);
    return row;
  };
  const last = at("2026-Q2");
  // [period, label, dx, dy, anchor]
  const notes = [
    ["2000-Q4", (d) => `End-2000: ${pct(d.value)}%`, 0, 18, "start"],
    ["2008-Q4", (d) => `2008-Q4: ${pct(d.value)}%`, 6, 18, "start"],
    ["2019-Q4", (d) => `2019-Q4: ${pct(d.value)}%`, 6, 18, "start"],
    ["2021-Q1", (d) => `2021-Q1: ${pct(d.value)}%`, -8, -14, "end"],
    ["2023-Q4", (d) => `2023-Q4: ${pct(d.value)}%`, 0, 20, "middle"],
  ];
  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, domain: [new Date("2000-01-01T00:00:00Z"), new Date("2026-06-30T00:00:00Z")] },
    y: { label: "Gross public debt, % of GDP (quarter end)", labelArrow: "none", grid: true, domain: [0, 125] },
    marks: [
      Plot.ruleY([0]),
      Plot.line(rows, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      ...notes.flatMap(([p, text, dx, dy, anchor]) => [
        Plot.dot([at(p)], { x: "date", y: "value", fill: INK, r: 3.5 }),
        Plot.text([at(p)], { x: "date", y: "value", text, dx, dy, textAnchor: anchor, fill: INK }),
      ]),
      Plot.dot([last], { x: "date", y: "value", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([last], {
        x: "date",
        y: "value",
        text: (d) => `${d.period}: ${pct(d.value)}%\n€${(d.eur / 1000).toFixed(1)} trillion`,
        dx: 8,
        textAnchor: "start",
        lineAnchor: "middle",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
    ],
  });
  save("france-debt-ratio.svg", fig);
}

// --- Chart 2: spending above revenue every year --------------------------------
{
  const te = frSeries("TE");
  const tr = frSeries("TR");
  const b9 = frSeries("B9");
  const deficitYears = b9.filter((d) => d.value < 0).length;
  // Band between the two lines: same resource, same country, keyed by year.
  const band = te.map((d) => {
    const r = tr.find((x) => x.year === d.year);
    if (!r) throw new Error(`no TR for ${d.year}`);
    return { year: d.year, te: d.value, tr: r.value };
  });
  const y = (s, year) => s.find((d) => d.year === year);
  const teMax = te.reduce((a, b) => (b.value > a.value ? b : a));
  const trMax = tr.reduce((a, b) => (b.value > a.value ? b : a));
  const smallest = b9.reduce((a, b) => (b.value > a.value ? b : a));
  const largest = b9.reduce((a, b) => (b.value < a.value ? b : a));
  const b9eur2025 = fv("FR", "B9", "MIO_EUR", 2025);
  const deficitNotes = [
    { year: smallest.year, y: 49.4, text: `Deficit ${pct(-smallest.value)}% (${smallest.year}, smallest)`, anchor: "middle" },
    { year: largest.year, y: 49.4, text: `${pct(-largest.value)}% (${largest.year}, largest)`, anchor: "end" },
    { year: 2025, y: 48.4, text: `${pct(-y(b9, 2025).value)}% in 2025 = ${bn(-b9eur2025)}`, anchor: "end" },
  ];
  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, tickFormat: "d", domain: [1995, 2025] },
    y: { label: "% of GDP (axis does not start at zero)", labelArrow: "none", grid: true, domain: [47.5, 63] },
    marks: [
      Plot.areaY(band, { x: "year", y1: "tr", y2: "te", fill: HIGHLIGHT, fillOpacity: 0.15 }),
      Plot.line(te, { x: "year", y: "value", stroke: HIGHLIGHT, strokeWidth: 2 }),
      Plot.line(tr, { x: "year", y: "value", stroke: INK, strokeWidth: 2 }),
      Plot.text([y(te, 2025)], { x: "year", y: "value", text: (d) => `Spending ${pct(d.value)}%`, dx: 6, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([y(tr, 2025)], { x: "year", y: "value", text: (d) => `Revenue ${pct(d.value)}%`, dx: 6, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([y(te, 1995)], { x: "year", y: "value", text: (d) => pct(d.value), dy: -10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text([y(tr, 1995)], { x: "year", y: "value", text: (d) => pct(d.value), dy: 14, textAnchor: "start", fill: INK }),
      Plot.dot([teMax], { x: "year", y: "value", fill: HIGHLIGHT, r: 3.5 }),
      Plot.text([teMax], { x: "year", y: "value", text: (d) => `${d.year}: ${pct(d.value)}%`, dy: -10, fill: HIGHLIGHT }),
      Plot.dot([trMax], { x: "year", y: "value", fill: INK, r: 3.5 }),
      Plot.text([trMax], { x: "year", y: "value", text: (d) => `Revenue peak, ${d.year}: ${pct(d.value)}%`, dy: -12, textAnchor: "end", fill: INK }),
      Plot.text([{ year: 1996, y: 62.3 }], {
        x: "year",
        y: "y",
        text: () => `Shaded: deficit in ${deficitYears} of ${b9.length} years, 1995–2025`,
        textAnchor: "start",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
      ...deficitNotes.map((n) => Plot.text([n], { x: "year", y: "y", text: "text", textAnchor: n.anchor, fill: HIGHLIGHT })),
    ],
  });
  save("france-debt-gap.svg", fig);
}

// --- Chart 3: France raises the most and spends more still (2025) -----------------
{
  const geos = [
    ["FR", "France"],
    ["IT", "Italy"],
    ["DE", "Germany"],
    ["EU27_2020", "EU27 average"],
    ["ES", "Spain"],
  ];
  const rows = geos.map(([code, name]) => ({
    name,
    te: fv(code, "TE", "PC_GDP", 2025),
    tr: fv(code, "TR", "PC_GDP", 2025),
    b9: fv(code, "B9", "PC_GDP", 2025),
  }));
  rows.sort((a, b) => b.te - a.te);
  const order = rows.map((r) => r.name);
  const fig = Plot.plot({
    document,
    width: 720,
    height: 300,
    marginLeft: 100,
    marginRight: 150,
    marginTop: 36,
    marginBottom: 40,
    style: FONT,
    x: { label: "% of GDP, 2025", labelArrow: "none", grid: true, domain: [40, 60] },
    y: { label: null, domain: order },
    marks: [
      Plot.link(rows, { x1: "tr", x2: "te", y1: "name", y2: "name", stroke: HIGHLIGHT, strokeOpacity: 0.35, strokeWidth: 6 }),
      Plot.dot(rows, { x: "tr", y: "name", fill: INK, r: 5 }),
      Plot.dot(rows, { x: "te", y: "name", fill: HIGHLIGHT, r: 5 }),
      Plot.text(rows, { x: "tr", y: "name", text: (d) => pct(d.tr), dx: -9, textAnchor: "end", fill: INK }),
      Plot.text(rows, { x: "te", y: "name", text: (d) => pct(d.te), dx: 9, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(rows, {
        x: 60,
        y: "name",
        text: (d) => `deficit ${pct(-d.b9)}%`,
        dx: 10,
        textAnchor: "start",
        fill: HIGHLIGHT,
        fontWeight: (d) => (d.name === "France" ? "bold" : "normal"),
      }),
      Plot.text([rows[0]], { x: "tr", y: "name", text: () => "Revenue", dy: -14, fill: INK, fontWeight: "bold" }),
      Plot.text([rows[0]], { x: "te", y: "name", text: () => "Spending", dy: -14, fill: HIGHLIGHT, fontWeight: "bold" }),
    ],
  });
  save("france-debt-neighbours.svg", fig);
}

// --- Chart 4: what the spending is, by function, 1995 vs 2024 ----------------------
{
  const rowsFor = [
    ["GF10", "Social protection (excl. health)"],
    ["GF1002", "↳ of which: old age"],
    ["GF07", "Health"],
    ["GF01", "General public services"],
    ["GF04", "Economic affairs"],
    ["GF09", "Education"],
    ["GF02", "Defence"],
    ["GF03", "Public order and safety"],
    ["GF08", "Recreation and culture"],
    ["GF06", "Housing and amenities"],
    ["GF05", "Environment"],
  ];
  const fn = (code, year) =>
    must(functions, (r) => r.function_code === code && r.unit === "PC_GDP" && r.year === String(year), `COFOG ${code} ${year}`);
  const rows = rowsFor.map(([code, name]) => {
    const a = fn(code, 1995);
    const b = fn(code, 2024);
    return { code, name, v1995: Number(a.value), v2024: Number(b.value), flag: b.status_flag };
  });
  const total = { v1995: Number(fn("TOTAL", 1995).value), v2024: Number(fn("TOTAL", 2024).value) };
  const provisional = rows.every((r) => r.flag === "p");
  const up = (d) => d.v2024 > d.v1995;
  const sign = (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1);
  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 200,
    marginRight: 140,
    marginTop: 36,
    marginBottom: 56,
    style: FONT,
    x: { label: null, grid: true, domain: [0, 25] },
    y: { label: null, domain: rows.map((r) => r.name) },
    marks: [
      Plot.link(rows, { x1: "v1995", x2: "v2024", y1: "name", y2: "name", stroke: (d) => (up(d) ? HIGHLIGHT : LINE2), strokeWidth: 2 }),
      Plot.dot(rows, { x: "v1995", y: "name", fill: LINE2, r: 4.5 }),
      Plot.dot(rows, { x: "v2024", y: "name", fill: (d) => (up(d) ? HIGHLIGHT : INK), r: 4.5 }),
      Plot.text(rows, {
        x: 25,
        y: "name",
        text: (d) => `${pct(d.v1995)} → ${pct(d.v2024)}  (${sign(Math.round((d.v2024 - d.v1995) * 10) / 10)})`,
        dx: 12,
        textAnchor: "start",
        fill: (d) => (up(d) ? HIGHLIGHT : INK),
      }),
      Plot.text([rows[0]], { x: "v1995", y: "name", text: () => "1995", dx: -4, dy: -14, textAnchor: "end", fill: LINE2, fontWeight: "bold" }),
      Plot.text([rows[0]], { x: "v2024", y: "name", text: () => "2024", dx: 4, dy: -14, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([rows[0]], { x: 25, y: "name", text: () => "1995 → 2024", dx: 12, dy: -14, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([{}], {
        frameAnchor: "bottom-right",
        dy: 40,
        dx: 130,
        text: () =>
          `Values are % of GDP. All functions: ${pct(total.v1995)}% → ${pct(total.v2024)}%${provisional ? " · 2024 provisional" : ""} · health is not in social protection`,
        textAnchor: "end",
        fill: INK,
      }),
    ],
  });
  save("france-debt-functions.svg", fig);
}

// --- Chart 5: the cost of carrying the debt -------------------------------------
{
  const rows = frSeries("D41PAY");
  const notes = [
    { year: 1995, text: (v, e) => `1995: ${pct(v)}% (${e})`, dx: 6, dy: -12, anchor: "start" },
    { year: 2020, text: (v, e) => `2020: ${pct(v)}% (${e})`, dx: 0, dy: 20, anchor: "middle" },
    { year: 2025, text: (v, e) => `2025: ${pct(v)}%\n${e}`, dx: 8, dy: 0, anchor: "start" },
  ].map((n) => {
    const v = rows.find((d) => d.year === n.year).value;
    return { ...n, value: v, label: n.text(v, bn(fv("FR", "D41PAY", "MIO_EUR", n.year))) };
  });
  const fig = Plot.plot({
    document,
    width: 720,
    height: 360,
    marginLeft: 52,
    marginRight: 110,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, tickFormat: "d", domain: [1995, 2025] },
    y: { label: "Interest paid by government, % of GDP", labelArrow: "none", grid: true, domain: [0, 4] },
    marks: [
      Plot.ruleY([0]),
      Plot.line(rows, { x: "year", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(notes, { x: "year", y: "value", fill: (d) => (d.year === 2025 ? HIGHLIGHT : INK), r: 4 }),
      ...notes.map((n) =>
        Plot.text([n], {
          x: "year",
          y: "value",
          text: "label",
          dx: n.dx,
          dy: n.dy,
          textAnchor: n.anchor,
          lineAnchor: "middle",
          fill: n.year === 2025 ? HIGHLIGHT : INK,
          fontWeight: n.year === 2025 ? "bold" : "normal",
        }),
      ),
    ],
  });
  save("france-debt-interest.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
