// Regenerate the SVG charts embedded in france-debt.md.
//   npm ci && node france-debt-make-charts.mjs
//
// Implements the chart plan in france-debt-outline.md. Every annotated value is
// read from the dataset's CSV rows; a missing row throws.

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
const GAP = "#fecaca";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const read = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));
const f1 = (v) => v.toFixed(1);

/** The single row matching every key in `where`; throws if none or several. */
function one(rows, where) {
  const hit = rows.filter((r) => Object.entries(where).every(([k, v]) => r[k] === String(v)));
  if (hit.length !== 1) throw new Error(`expected 1 row for ${JSON.stringify(where)}, got ${hit.length}`);
  return hit[0];
}

/** A numeric value; throws if the source left it empty. */
function num(row) {
  if (row.value === "" || !Number.isFinite(Number(row.value))) throw new Error(`no value: ${JSON.stringify(row)}`);
  return Number(row.value);
}

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

/** A chart title and subtitle drawn inside the SVG, above the frame, from the
 * SVG's left edge (`marginLeft` is the frame's offset). */
const heading = (marginLeft, main, sub, dy) => [
  Plot.text([main], { frameAnchor: "top-left", dx: 8 - marginLeft, dy, text: (d) => d, fill: INK, fontWeight: "bold", fontSize: 13, textAnchor: "start" }),
  Plot.text([sub], { frameAnchor: "top-left", dx: 8 - marginLeft, dy: dy + 18, text: (d) => d, fill: LINE2, textAnchor: "start" }),
];

const fiscal = read("fiscal-accounts.csv");
const fiscalValue = (country_code, year, indicator, unit = "PC_GDP") =>
  num(one(fiscal, { country_code, year, indicator, unit }));

const written = [];
function save(name, fig) {
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
  written.push(name);
}

// --- Chart 1: debt doubled relative to GDP, in two steps that never reversed ----
{
  const rows = read("quarterly-debt.csv").map((r) => {
    const pct = Number(r.gross_debt_pct_gdp);
    const bn = Number(r.gross_debt_eur_billions);
    if (r.gross_debt_pct_gdp === "" || !Number.isFinite(pct) || !Number.isFinite(bn)) throw new Error(`gap at ${r.period}`);
    return { period: r.period, date: new Date(`${r.period_end}T00:00:00Z`), pct, bn };
  });
  const at = (p) => {
    const r = rows.find((d) => d.period === p);
    if (!r) throw new Error(`no row for ${p}`);
    return r;
  };
  const first = at("2000-Q1");
  const last = at("2026-Q2");
  const marks = [
    { ...first, label: `2000: ${f1(first.pct)}% · €${Math.round(first.bn)}bn`, anchor: "start", dx: 6, dy: 16 },
    { ...at("2008-Q4"), label: `end-2008: ${f1(at("2008-Q4").pct)}%`, anchor: "end", dx: -8, dy: -12 },
    { ...at("2009-Q4"), label: `end-2009: ${f1(at("2009-Q4").pct)}%`, anchor: "start", dx: 8, dy: 12 },
    { ...at("2019-Q4"), label: `end-2019: ${f1(at("2019-Q4").pct)}%`, anchor: "end", dx: -6, dy: 18 },
    { ...at("2020-Q4"), label: `end-2020: ${f1(at("2020-Q4").pct)}%`, anchor: "end", dx: -14, dy: -16 },
    { ...at("2025-Q4"), label: `end-2025: ${f1(at("2025-Q4").pct)}%`, anchor: "end", dx: -4, dy: 30 },
    { ...last, label: `mid-2026: ${f1(last.pct)}%`, anchor: "start", dx: 8, dy: -4 },
  ];
  const tn = (last.bn / 1000).toFixed(1);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 44,
    marginRight: 120,
    marginTop: 44,
    marginBottom: 32,
    style: FONT,
    x: { label: null, type: "utc" },
    y: { label: null, grid: true, domain: [0, 130] },
    marks: [
      ...heading(44, "French public debt has doubled as a share of GDP since 2000",
        "Maastricht gross debt, general government, % of GDP, quarterly (INSEE, Sept 2026 release)", -30),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(rows, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(marks, { x: "date", y: "pct", fill: HIGHLIGHT, r: 3.5 }),
      ...marks.map((m) => Plot.text([m], { x: "date", y: "pct", text: "label", textAnchor: m.anchor, dx: m.dx, dy: m.dy, fill: INK })),
      Plot.text([last], { x: "date", y: "pct", text: () => `€${tn} trillion`, textAnchor: "start", dx: 8, dy: 12, fill: INK }),
    ],
  });
  save("france-debt-ratio.svg", fig);
}

// --- Chart 2: spending above revenue in every year since 1995 -------------------
{
  const years = [];
  for (let y = 1995; y <= 2025; y++) years.push(y);
  const te = years.map((year) => ({ year, value: fiscalValue("FR", year, "TE") }));
  const tr = years.map((year) => ({ year, value: fiscalValue("FR", year, "TR") }));
  const b9 = years.map((year) => ({ year, value: fiscalValue("FR", year, "B9") }));
  const byYear = (rows, y) => {
    const r = rows.find((d) => d.year === y);
    if (!r) throw new Error(`no row for ${y}`);
    return r.value;
  };
  const gap = years.map((year) => ({ year, lo: byYear(tr, year), hi: byYear(te, year) }));
  const deficitYears = b9.filter((d) => d.value < 0).length;

  const spendMarks = [1995, 2007, 2009, 2019, 2020].map((year) => ({ year, value: byYear(te, year) }));
  const revMarks = [2017, 2019, 2024].map((year) => ({ year, value: byYear(tr, year) }));
  const defMarks = [2000, 2009, 2019, 2020, 2024, 2025].map((year) => ({
    year,
    value: -byYear(b9, year),
    y: (byYear(te, year) + byYear(tr, year)) / 2,
    anchor: year === 2024 ? "end" : year === 2025 ? "start" : "middle",
  }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 44,
    marginRight: 116,
    marginTop: 48,
    marginBottom: 32,
    style: FONT,
    x: { label: null, tickFormat: "d", domain: [1995, 2025] },
    y: { label: null, grid: true, domain: [48, 64] },
    marks: [
      ...heading(44, `France has spent more than it collected in all ${deficitYears} years since 1995`,
        "General government spending and revenue, % of GDP (Eurostat). Shaded gap and red figures: deficit.", -32),
      Plot.areaY(gap, { x: "year", y1: "lo", y2: "hi", fill: GAP }),
      Plot.line(te, { x: "year", y: "value", stroke: HIGHLIGHT, strokeWidth: 2 }),
      Plot.line(tr, { x: "year", y: "value", stroke: INK, strokeWidth: 2 }),
      Plot.text([te.at(-1)], { x: "year", y: "value", text: (d) => `Spending ${f1(d.value)}%`, dx: 6, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([tr.at(-1)], { x: "year", y: "value", text: (d) => `Revenue ${f1(d.value)}%`, dx: 6, textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.dot(spendMarks, { x: "year", y: "value", fill: HIGHLIGHT, r: 3 }),
      Plot.text(spendMarks.slice(0, 1), { x: "year", y: "value", text: (d) => f1(d.value), dy: -10, dx: -2, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(spendMarks.slice(1), { x: "year", y: "value", text: (d) => f1(d.value), dy: -10, fill: HIGHLIGHT }),
      Plot.dot(revMarks, { x: "year", y: "value", fill: INK, r: 3 }),
      Plot.text(revMarks, { x: "year", y: "value", text: (d) => f1(d.value), dy: 13, fill: INK }),
      Plot.text(defMarks.filter((d) => d.anchor === "middle"), { x: "year", y: "y", text: (d) => f1(d.value), fill: "#991b1b", fontWeight: "bold" }),
      Plot.text(defMarks.filter((d) => d.anchor === "end"), { x: "year", y: "y", text: (d) => f1(d.value), fill: "#991b1b", fontWeight: "bold", textAnchor: "end", dx: 2 }),
      Plot.text(defMarks.filter((d) => d.anchor === "start"), { x: "year", y: "y", text: (d) => f1(d.value), fill: "#991b1b", fontWeight: "bold", textAnchor: "start", dx: 4 }),
    ],
  });
  save("france-debt-gap.svg", fig);
}

// --- Chart 3: France taxes more than its neighbours, and spends more still -------
const GEOS = [
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "EU27_2020", name: "EU27 (aggregate)" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
];
{
  const rows = GEOS.map(({ code, name }) => ({
    name,
    tr: fiscalValue(code, 2025, "TR"),
    te: fiscalValue(code, 2025, "TE"),
    b9: fiscalValue(code, 2025, "B9"),
  }));
  const order = rows.map((d) => d.name);
  const fr = rows[0];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 300,
    marginLeft: 120,
    marginRight: 96,
    marginTop: 56,
    marginBottom: 36,
    style: FONT,
    x: { label: "% of GDP, 2025", labelArrow: "none", labelAnchor: "center", grid: true, domain: [40, 60] },
    y: { label: null, domain: order, padding: 0.3 },
    marks: [
      ...heading(120, "France collects more than its neighbours, and spends more again",
        "General government revenue and spending, % of GDP, 2025 (Eurostat)", -40),
      Plot.ruleY(rows, { y: "name", x1: "tr", x2: "te", stroke: GAP, strokeWidth: 8 }),
      Plot.dot(rows, { y: "name", x: "tr", fill: INK, r: 6 }),
      Plot.dot(rows, { y: "name", x: "te", fill: HIGHLIGHT, r: 6 }),
      Plot.text(rows, { y: "name", x: "tr", text: (d) => f1(d.tr), dx: -10, textAnchor: "end", fill: INK }),
      Plot.text(rows, { y: "name", x: "te", text: (d) => f1(d.te), dx: 10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text([fr], { y: "name", x: "tr", text: () => "Revenue", dy: -14, fill: INK, fontWeight: "bold" }),
      Plot.text([fr], { y: "name", x: "te", text: () => "Spending", dy: -14, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(rows, { y: "name", frameAnchor: "right", text: (d) => `deficit ${f1(-d.b9)}`, dx: 92, textAnchor: "end", fill: "#991b1b" }),
    ],
  });
  save("france-debt-neighbours.svg", fig);
}

// --- Chart 4: what is growing — change in spending by function, 1995 → 2024 -----
{
  const fn = read("spending-functions.csv");
  const val = (year, function_code) => num(one(fn, { year, function_code, unit: "PC_GDP" }));
  const SHORT = {
    GF01: "General public services",
    GF02: "Defence",
    GF03: "Public order and safety",
    GF04: "Economic affairs",
    GF05: "Environment",
    GF06: "Housing and amenities",
    GF07: "Health",
    GF08: "Recreation and culture",
    GF09: "Education",
    GF10: "Social protection*",
  };
  const NOTE = { GF10: "GF1002", GF01: "GF0107" };
  const NOTE_LABEL = { GF1002: "old age", GF0107: "debt interest" };
  const divisions = fn.filter((r) => r.level === "1" && r.unit === "PC_GDP" && r.year === "2024").map((r) => r.function_code);
  if (divisions.length !== 10) throw new Error(`expected 10 COFOG divisions, got ${divisions.length}`);
  const rows = divisions
    .map((code) => {
      const a = val(1995, code);
      const b = val(2024, code);
      const sub = NOTE[code];
      const note = sub ? `; ${NOTE_LABEL[sub]} ${f1(val(1995, sub))} → ${f1(val(2024, sub))}` : "";
      return { name: SHORT[code], change: Math.round((b - a) * 10) / 10, label: `${f1(a)} → ${f1(b)}${note}` };
    })
    .sort((p, q) => q.change - p.change || p.name.localeCompare(q.name));
  const total = { a: val(1995, "TOTAL"), b: val(2024, "TOTAL") };

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 170,
    marginRight: 20,
    marginTop: 56,
    marginBottom: 40,
    style: FONT,
    x: { label: "Change, percentage points of GDP, 1995 → 2024", labelArrow: "none", labelAnchor: "center", grid: true, domain: [-2.5, 4.5] },
    y: { label: null, domain: rows.map((d) => d.name), padding: 0.25 },
    marks: [
      ...heading(170, "Health and social protection grew; interest, defence and education shrank",
        `Spending by function (COFOG), % of GDP. Total ${f1(total.a)} → ${f1(total.b)}. 2024 provisional. *Excl. health.`, -40),
      Plot.barX(rows, { y: "name", x: "change", fill: (d) => (d.change > 0 ? HIGHLIGHT : LINE2) }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(rows, { y: "name", x: (d) => Math.max(d.change, 0), text: "label", dx: 6, textAnchor: "start", fill: INK }),
    ],
  });
  save("france-debt-functions.svg", fig);
}

// --- Chart 5: the deficit is mostly not interest, unlike Italy's -----------------
{
  const rows = GEOS.map(({ code, name }) => {
    const b9 = fiscalValue(code, 2025, "B9");
    const interest = fiscalValue(code, 2025, "D41PAY");
    const primary = Math.round((b9 + interest) * 10) / 10 || 0;
    return { name, b9, interest, primary };
  });
  const segs = rows.flatMap((d) => {
    const p = { name: d.name, kind: "primary", x1: 0, x2: d.primary };
    const start = d.primary < 0 ? d.primary : 0;
    const i = { name: d.name, kind: "interest", x1: start, x2: start - d.interest };
    return [p, i];
  });
  const primaryLabel = (d) => (d.primary > 0 ? `surplus ${f1(d.primary)}` : f1(-d.primary));
  const fr = rows[0];
  const eur = (year) => fiscalValue("FR", year, "D41PAY", "MIO_EUR") / 1000;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 320,
    marginLeft: 120,
    marginRight: 20,
    marginTop: 64,
    marginBottom: 40,
    style: FONT,
    x: { label: "% of GDP, 2025 (negative = deficit)", labelArrow: "none", labelAnchor: "center", grid: true, domain: [-6.5, 4] },
    y: { label: null, domain: rows.map((d) => d.name), padding: 0.3 },
    marks: [
      ...heading(120, "Most of France's deficit is there before interest is paid",
        "2025 balance: primary balance (before interest) and interest paid, % of GDP (Eurostat)", -48),
      Plot.barX(segs, { y: "name", x1: "x1", x2: "x2", fill: (d) => (d.kind === "primary" ? LINE : HIGHLIGHT) }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(rows.filter((d) => d.primary < 0), { y: "name", x: (d) => d.primary / 2, text: primaryLabel, fill: "white", fontWeight: "bold" }),
      Plot.text(rows.filter((d) => d.primary >= 0), { y: "name", x: (d) => d.primary, text: primaryLabel, dx: 6, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text(rows, { y: "name", x: (d) => Math.min(d.primary, 0) - d.interest / 2, text: (d) => f1(d.interest), fill: "white", fontWeight: "bold" }),
      Plot.text(rows, { y: "name", x: (d) => Math.min(d.primary, 0) - d.interest, text: (d) => `total ${f1(-d.b9)}`, dx: -6, textAnchor: "end", fill: INK }),
      Plot.text([fr], { y: "name", x: (d) => d.primary / 2, text: () => "Before interest", dy: -16, fill: LINE, fontWeight: "bold" }),
      Plot.text([fr], { y: "name", x: (d) => d.primary - d.interest / 2, text: () => "Interest", dy: -16, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([fr], {
        y: "name", x: 0, dx: 8, textAnchor: "start", fill: HIGHLIGHT, lineHeight: 1.2,
        text: () => `French interest paid:\n€${f1(eur(2020))}bn (2020) → €${f1(eur(2025))}bn (2025)`,
      }),
    ],
  });
  save("france-debt-interest.svg", fig);
}

console.log(`wrote ${written.join(", ")}`);
