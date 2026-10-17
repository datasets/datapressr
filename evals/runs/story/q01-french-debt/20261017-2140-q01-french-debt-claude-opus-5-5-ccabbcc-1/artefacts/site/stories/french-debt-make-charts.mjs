// Regenerate the SVG charts embedded in french-debt.md.
//   npm ci && node french-debt-make-charts.mjs
//
// Implements the approved chart plan in french-debt-outline.md. Every
// annotated value is looked up from the dataset rows by key; a missing or
// duplicate row fails the build. See skills/story/references/charting.md.

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
const BAND = "#f3f4f6";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

/** Parse one CSV resource. fiscal-accounts.csv quotes labels containing
 * commas, so a real RFC 4180 parser is needed. */
const load = (file) => csvParse(readFileSync(join(DATA, file), "utf8"));

/** Exactly one row matching every key, with a non-empty value; throws otherwise. */
function one(rows, keys, valueCol = "value") {
  const hits = rows.filter((r) => Object.entries(keys).every(([k, v]) => r[k] === String(v)));
  if (hits.length !== 1) throw new Error(`expected one row for ${JSON.stringify(keys)}, got ${hits.length}`);
  const v = hits[0][valueCol];
  if (v === "" || !Number.isFinite(Number(v))) throw new Error(`no value for ${JSON.stringify(keys)}`);
  return hits[0];
}

/** One decimal place, with a true minus sign. */
const fmt = (v) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
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

/** Title and subtitle drawn in the top margin, left-aligned with the SVG edge. */
function heading(title, subtitle, marginLeft, top) {
  return [
    Plot.text([title], { frameAnchor: "top-left", dx: 8 - marginLeft, dy: 18 - top, fill: INK, fontSize: 15, fontWeight: "bold", textAnchor: "start" }),
    Plot.text([subtitle], { frameAnchor: "top-left", dx: 8 - marginLeft, dy: 38 - top, fill: "#4b5563", textAnchor: "start" }),
  ];
}

const written = [];

// --- Chart 1: the debt ratio rose in steps that were not fully reversed ------
{
  const debt = load("quarterly-debt.csv").map((r) => {
    const pct = Number(r.gross_debt_pct_gdp);
    if (r.gross_debt_pct_gdp === "" || !Number.isFinite(pct)) throw new Error(`gap at ${r.period}`);
    return { period: r.period, date: new Date(`${r.period_end}T00:00:00Z`), pct, eur: Number(r.gross_debt_eur_billions) };
  });
  const at = (p) => {
    const row = debt.find((r) => r.period === p);
    if (!row) throw new Error(`no row for ${p}`);
    return row;
  };
  const first = at("2000-Q1");
  const last = at("2026-Q2");
  const pct = (r) => `${r.pct.toFixed(1)}%`;

  const M = { top: 64, left: 44, right: 112, bottom: 32 };
  const bands = [
    { x1: new Date("2008-01-01T00:00:00Z"), x2: new Date("2009-12-31T00:00:00Z"), label: "2008–09\nfinancial crisis" },
    { x1: new Date("2020-01-01T00:00:00Z"), x2: new Date("2020-12-31T00:00:00Z"), label: "2020\npandemic" },
  ];
  // [row, label, dx, dy, anchor]
  const notes = [
    [first, `${pct(first)}\nearly 2000`, 0, 22, "start"],
    [at("2007-Q4"), `${pct(at("2007-Q4"))}\nend-2007`, 0, 22, "middle"],
    [at("2009-Q4"), `${pct(at("2009-Q4"))}\nend-2009`, 8, 20, "start"],
    [at("2019-Q4"), `${pct(at("2019-Q4"))}\nend-2019`, -8, 18, "end"],
    [at("2020-Q4"), `${pct(at("2020-Q4"))}\nend-2020`, -12, -20, "end"],
    [at("2023-Q4"), `${pct(at("2023-Q4"))}\nend-2023`, 0, 22, "middle"],
  ];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: M.left,
    marginRight: M.right,
    marginTop: M.top,
    marginBottom: M.bottom,
    style: FONT,
    x: { label: null, type: "utc" },
    y: { domain: [0, 140], label: "Gross debt, % of GDP", labelArrow: "none", grid: true, ticks: [0, 20, 40, 60, 80, 100, 120, 140] },
    marks: [
      ...heading(
        "French public debt almost doubled relative to GDP since 2000",
        "Maastricht gross debt, general government, at quarter end, % of annual GDP.",
        M.left,
        M.top,
      ),
      Plot.rect(bands, { x1: "x1", x2: "x2", y1: 0, y2: 140, fill: BAND }),
      Plot.text(bands, { x: "x2", y: 140, text: "label", dx: 4, dy: 4, textAnchor: "start", lineAnchor: "top", fill: "#6b7280", fontSize: 11 }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(debt, { x: "date", y: "pct", stroke: LINE, strokeWidth: 2 }),
      ...notes.flatMap(([row, label, dx, dy, anchor]) => [
        Plot.dot([row], { x: "date", y: "pct", fill: INK, r: 3.5 }),
        Plot.text([row], { x: "date", y: "pct", text: () => label, dx, dy, textAnchor: anchor, fill: INK }),
      ]),
      Plot.dot([last], { x: "date", y: "pct", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([last], {
        x: "date",
        y: "pct",
        text: () => `${pct(last)}\nmid-2026\n€${(last.eur / 1000).toFixed(1)} trillion`,
        dx: 9,
        textAnchor: "start",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
    ],
  });
  writeFileSync(join(HERE, "french-debt-ratio.svg"), toSvg(fig) + "\n");
  written.push("french-debt-ratio.svg");
}

const fiscal = load("fiscal-accounts.csv");
const fv = (geo, indicator, unit, year) => Number(one(fiscal, { country_code: geo, indicator, unit, year }).value);

// --- Chart 2: a deficit every year; mostly not interest ----------------------
{
  const years = Array.from({ length: 31 }, (_, i) => 1995 + i);
  const totals = years.map((year) => {
    const b9 = fv("FR", "B9", "PC_GDP", year);
    const interest = fv("FR", "D41PAY", "PC_GDP", year);
    return { year, b9, interest, primary: round1(b9 + interest) };
  });
  // Interest first so it sits next to zero; primary stacks beyond it.
  const parts = [
    ...totals.map((t) => ({ year: t.year, value: -t.interest, color: LINE2 })),
    ...totals.map((t) => ({ year: t.year, value: round1(t.primary), color: t.primary >= 0 ? LINE : HIGHLIGHT })),
  ];
  for (const t of totals) if (round1(-t.interest + t.primary) !== t.b9) throw new Error(`stack != B9 in ${t.year}`);
  const T = (y) => totals.find((t) => t.year === y);
  const lastSurplus = totals.filter((t) => t.primary > 0).at(-1);
  if (lastSurplus.year !== 2001) throw new Error(`last primary surplus moved to ${lastSurplus.year}`);
  const eur = (y) => Math.round(fv("FR", "D41PAY", "MIO_EUR", y) / 1000);
  const t2020 = T(2020);
  const t2025 = T(2025);

  const M = { top: 76, left: 44, right: 150, bottom: 30 };
  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: M.left,
    marginRight: M.right,
    marginTop: M.top,
    marginBottom: M.bottom,
    style: FONT,
    color: { type: "identity" },
    x: { label: null, padding: 0.15, ticks: [1995, 2000, 2005, 2010, 2015, 2020, 2025], tickFormat: "d" },
    y: { domain: [-10, 3], label: "% of GDP", labelArrow: "none", grid: true, ticks: [-10, -8, -6, -4, -2, 0, 2] },
    marks: [
      ...heading(
        "France has run a deficit every year since at least 1995",
        "General government balance, % of GDP, split into two parts. The black tick is the total.",
        M.left,
        M.top,
      ),
      Plot.text(["Interest paid"], { frameAnchor: "top-left", dx: 8 - M.left, dy: 58 - M.top, fill: "#6b7280", fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["Deficit before interest"], { frameAnchor: "top-left", dx: 100 - M.left, dy: 58 - M.top, fill: HIGHLIGHT, fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["Surplus before interest"], { frameAnchor: "top-left", dx: 275 - M.left, dy: 58 - M.top, fill: LINE, fontWeight: "bold", textAnchor: "start" }),
      Plot.barY(parts, { x: "year", y: "value", fill: "color" }),
      Plot.tickY(totals, { x: "year", y: "b9", stroke: INK, strokeWidth: 2 }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.text([lastSurplus], {
        x: "year",
        y: "primary",
        text: (d) => `Last surplus before interest: ${d.year}, +${d.primary.toFixed(1)}`,
        dx: -6,
        dy: -10,
        textAnchor: "start",
        fill: LINE,
      }),
      Plot.text([T(2000)], { x: "year", y: (d) => -d.interest, text: (d) => `${d.year}: ${fmt(d.b9)}`, dy: 20, textAnchor: "middle", fill: INK }),
      Plot.text([T(2009)], { x: "year", y: "b9", text: (d) => `${d.year}: ${fmt(d.b9)}`, dx: -14, textAnchor: "end", fill: INK }),
      Plot.text([t2020], {
        x: "year",
        y: "b9",
        text: (d) => `${d.year}: ${fmt(d.b9)}\nof which interest ${d.interest.toFixed(1)} (€${eur(2020)}bn)`,
        dx: -14,
        textAnchor: "end",
        fill: INK,
      }),
      Plot.text([T(2024)], { x: "year", y: 0, text: (d) => `${d.year}: ${fmt(d.b9)}`, dy: -10, textAnchor: "middle", fill: INK }),
      Plot.text([t2025], {
        x: "year",
        y: "b9",
        text: (d) => `${d.year}: ${fmt(d.b9)}\n= interest ${d.interest.toFixed(1)} (€${eur(2025)}bn)\n+ deficit before\n   interest ${Math.abs(d.primary).toFixed(1)}`,
        dx: 16,
        textAnchor: "start",
        fill: INK,
        fontWeight: "bold",
      }),
    ],
  });
  writeFileSync(join(HERE, "french-debt-deficit.svg"), toSvg(fig) + "\n");
  written.push("french-debt-deficit.svg");
}

// --- Chart 3: France collects the most and spends more still (2025) ----------
{
  const GEOS = [
    ["FR", "France"],
    ["IT", "Italy"],
    ["DE", "Germany"],
    ["EU27_2020", "EU-27 (aggregate)"],
    ["ES", "Spain"],
  ];
  const rows = GEOS.map(([code, name]) => {
    const tr = fv(code, "TR", "PC_GDP", 2025);
    const te = fv(code, "TE", "PC_GDP", 2025);
    const b9 = fv(code, "B9", "PC_GDP", 2025);
    const interest = fv(code, "D41PAY", "PC_GDP", 2025);
    return { code, name, tr, te, b9, primary: round1(b9 + interest) };
  }).sort((a, b) => b.te - a.te);
  const order = rows.map((r) => r.name);
  const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : v === 0 ? "0.0" : fmt(v));

  const M = { top: 84, left: 128, right: 186, bottom: 38 };
  const COL1 = 63.2;
  const COL2 = 67.2;
  const head = [{ x: COL1, label: "Deficit" }, { x: COL2, label: "Before\ninterest" }];
  const fig = Plot.plot({
    document,
    width: 720,
    height: 340,
    marginLeft: M.left,
    marginRight: M.right,
    marginTop: M.top,
    marginBottom: M.bottom,
    style: FONT,
    x: { domain: [40, 60], label: "% of GDP, 2025 (axis starts at 40)", labelArrow: "none", grid: true, ticks: [40, 45, 50, 55, 60] },
    y: { domain: order, label: null, padding: 0.3 },
    marks: [
      ...heading("France collects the most, and spends more still", "General government, 2025, % of GDP. Right: deficit, and balance before interest.", M.left, M.top),
      Plot.text(["Revenue"], { frameAnchor: "top-left", dx: 8 - M.left, dy: 58 - M.top, fill: INK, fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["Spending"], { frameAnchor: "top-left", dx: 72 - M.left, dy: 58 - M.top, fill: HIGHLIGHT, fontWeight: "bold", textAnchor: "start" }),
      Plot.ruleY(rows, { y: "name", x1: "tr", x2: "te", stroke: "#d1d5db", strokeWidth: 6 }),
      Plot.dot(rows, { y: "name", x: "tr", fill: INK, r: 6 }),
      Plot.dot(rows, { y: "name", x: "te", fill: HIGHLIGHT, r: 6 }),
      Plot.text(rows, { y: "name", x: "tr", text: (d) => d.tr.toFixed(1), dx: -10, textAnchor: "end", fill: INK }),
      Plot.text(rows, { y: "name", x: "te", text: (d) => d.te.toFixed(1), dx: 10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text(head, { x: "x", text: "label", frameAnchor: "top", dy: -14, lineAnchor: "bottom", textAnchor: "middle", fill: "#4b5563", fontWeight: "bold" }),
      Plot.text(rows.filter((r) => r.code !== "FR"), { y: "name", x: () => COL1, text: (d) => d.b9.toFixed(1).replace("-", ""), textAnchor: "middle", fill: INK }),
      Plot.text(rows.filter((r) => r.code === "FR"), { y: "name", x: () => COL1, text: (d) => d.b9.toFixed(1).replace("-", ""), textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(rows.filter((r) => r.code !== "FR"), { y: "name", x: () => COL2, text: (d) => signed(d.primary), textAnchor: "middle", fill: INK }),
      Plot.text(rows.filter((r) => r.code === "FR"), { y: "name", x: () => COL2, text: (d) => signed(d.primary), textAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
    ],
  });
  writeFileSync(join(HERE, "french-debt-peers.svg"), toSvg(fig) + "\n");
  written.push("french-debt-peers.svg");
}

// --- Chart 4: what the spending is, 1995 vs 2024 ------------------------------
{
  const funcs = load("spending-functions.csv");
  const sv = (code, year) => {
    const r = one(funcs, { function_code: code, unit: "PC_GDP", year });
    return { value: Number(r.value), flag: r.status_flag, name: r.function_name };
  };
  const divisions = [...new Set(funcs.filter((r) => r.level === "1").map((r) => r.function_code))];
  if (divisions.length !== 10) throw new Error(`expected 10 COFOG divisions, got ${divisions.length}`);
  const SHORT = { GF06: "Housing and amenities", GF08: "Recreation and culture", GF10: "Social protection" };
  const rows = divisions
    .map((code) => {
      const a = sv(code, 1995);
      const b = sv(code, 2024);
      return { code, name: SHORT[code] ?? a.name, v1995: a.value, v2024: b.value };
    })
    .sort((a, b) => b.v2024 - a.v2024);
  const total95 = sv("TOTAL", 1995);
  const total24 = sv("TOTAL", 2024);
  if (total24.flag !== "p") throw new Error("2024 total no longer provisional: update the subtitle");
  const oldAge = [sv("GF1002", 1995).value, sv("GF1002", 2024).value];
  const debtInt = [sv("GF0107", 1995).value, sv("GF0107", 2024).value];
  const SUB = { GF10: `of which old age ${oldAge[0].toFixed(1)} → ${oldAge[1].toFixed(1)}`, GF01: `of which debt interest ${debtInt[0].toFixed(1)} → ${debtInt[1].toFixed(1)}` };
  const labelled = rows.map((r) => ({ ...r, label: `${r.v1995.toFixed(1)} → ${r.v2024.toFixed(1)}${SUB[r.code] ? `\n${SUB[r.code]}` : ""}`, right: Math.max(r.v1995, r.v2024) }));

  const M = { top: 84, left: 200, right: 190, bottom: 56 };
  const fig = Plot.plot({
    document,
    width: 720,
    height: 490,
    marginLeft: M.left,
    marginRight: M.right,
    marginTop: M.top,
    marginBottom: M.bottom,
    style: FONT,
    x: { domain: [0, 25], label: null, grid: true, ticks: [0, 5, 10, 15, 20, 25] },
    y: { domain: rows.map((r) => r.name), label: null, padding: 0.2 },
    marks: [
      ...heading(
        "Old-age benefits and health took a bigger share; the total barely moved",
        `Public spending by function (COFOG), % of GDP. Total ${total95.value.toFixed(1)} in 1995, ${total24.value.toFixed(1)} in 2024.`,
        M.left,
        M.top,
      ),
      Plot.text(["1995"], { frameAnchor: "top-left", dx: 8 - M.left, dy: 58 - M.top, fill: "#6b7280", fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["2024"], { frameAnchor: "top-left", dx: 48 - M.left, dy: 58 - M.top, fill: INK, fontWeight: "bold", textAnchor: "start" }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.ruleY(rows, { y: "name", x1: "v1995", x2: "v2024", stroke: "#d1d5db", strokeWidth: 4 }),
      Plot.dot(rows, { y: "name", x: "v1995", fill: LINE2, r: 5 }),
      Plot.dot(rows, { y: "name", x: "v2024", fill: INK, r: 5 }),
      Plot.text(labelled, { y: "name", x: "right", text: "label", dx: 10, textAnchor: "start", lineAnchor: "middle", fill: INK }),
      Plot.text(["Social protection excludes health. 2024 values are provisional; 2025 is not yet published."], { frameAnchor: "bottom-left", dx: 8 - M.left, dy: 48, fill: "#6b7280", textAnchor: "start" }),
    ],
  });
  writeFileSync(join(HERE, "french-debt-functions.svg"), toSvg(fig) + "\n");
  written.push("french-debt-functions.svg");
}

console.log(`wrote ${written.join(", ")}`);
