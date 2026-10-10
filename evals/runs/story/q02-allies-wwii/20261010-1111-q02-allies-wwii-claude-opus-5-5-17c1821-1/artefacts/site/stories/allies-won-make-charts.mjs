// Regenerate the SVG charts embedded in allies-won.md.
//   npm ci && node allies-won-make-charts.mjs
//
// Reads only the tidy CSVs in allies-won-src/tidy/ (built from the snapshots by
// allies-won-src/derive.mjs) and the Goldsmith transcription. No network.
// Chart plan: allies-won-outline.md.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { csvParse } from "d3-dsv";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "allies-won-src");
const { window } = new JSDOM("");
const document = window.document;

const INK = "#111827";
const MUTED = "#6b7280";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const read = (rel) => csvParse(readFileSync(join(SRC, rel), "utf8"));

/** The single row matching every key in `where`; throws so a missing annotation fails the build. */
function one(rows, where) {
  const found = rows.filter((r) => Object.entries(where).every(([k, v]) => String(r[k]) === String(v)));
  if (found.length !== 1) throw new Error(`expected one row for ${JSON.stringify(where)}, got ${found.length}`);
  return found[0];
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

const title = (text, extra = {}) => Plot.text([text], { ...extra, frameAnchor: "top-left", dy: -44, dx: -4, fontSize: 14, fontWeight: "bold", fill: INK, textAnchor: "start" });
const note = (text, dy, extra = {}) => Plot.text([text], { ...extra, frameAnchor: "bottom-left", dy, dx: -4, fill: MUTED, textAnchor: "start", lineAnchor: "top", fontSize: 11 });

// --- Chart 1: munitions output by coalition, stacked by country --------------
{
  const gold = read("transcribed/goldsmith-1946-munitions-via-harrison-1988-table1.csv");
  const totals = read("tidy/munitions-by-coalition-goldsmith-1946.csv");
  const PERIODS = ["1935-39 average", "1940", "1941", "1942", "1943", "1944"];
  const PERIOD_LABEL = { "1935-39 average": "1935–39 avg." };
  const COUNTRIES = [
    { country: "USA", coalition: "Allies", colour: "#1e3a8a", text: "white" },
    { country: "USSR", coalition: "Allies", colour: "#2563eb", text: "white" },
    { country: "UK", coalition: "Allies", colour: "#60a5fa", text: INK },
    { country: "Canada", coalition: "Allies", colour: "#bfdbfe", text: INK },
    { country: "Germany", coalition: "Axis", colour: "#374151", text: "white" },
    { country: "Japan", coalition: "Axis", colour: "#9ca3af", text: INK },
  ];
  // Stack by hand so segment order and label positions are explicit.
  const segments = [];
  for (const period of PERIODS) {
    for (const coalition of ["Allies", "Axis"]) {
      let y = 0;
      for (const c of COUNTRIES.filter((c) => c.coalition === coalition)) {
        const v = Number(one(gold, { country: c.country, period }).munitions_usd_bn_1944_prices);
        segments.push({ period: PERIOD_LABEL[period] ?? period, coalition, ...c, value: v, y1: y, y2: y + v });
        y += v;
      }
    }
  }
  const tot = PERIODS.flatMap((period) => {
    const r = one(totals, { period });
    const p = PERIOD_LABEL[period] ?? period;
    return [
      { period: p, coalition: "Allies", value: Number(r.allies_usd_bn_1944_prices) },
      { period: p, coalition: "Axis", value: Number(r.axis_usd_bn_1944_prices) },
    ];
  });
  const ratios = PERIODS.map((period) => {
    const r = one(totals, { period });
    return { period: PERIOD_LABEL[period] ?? period, ratio: Number(r.allies_to_axis), top: Math.max(Number(r.allies_usd_bn_1944_prices), Number(r.axis_usd_bn_1944_prices)) };
  });
  const in1944 = segments.filter((s) => s.period === "1944" && s.value >= 5);
  const key = COUNTRIES.map((c, i) => ({ ...c, x: 8 + i * 62 }));
  // Single-datum marks go in the first facet only (otherwise Plot repeats them per facet).
  const FIRST = { fx: () => PERIOD_LABEL["1935-39 average"] };

  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: 52,
    marginRight: 12,
    marginTop: 64,
    marginBottom: 74,
    style: FONT,
    fx: { label: null, domain: PERIODS.map((p) => PERIOD_LABEL[p] ?? p), padding: 0.12, axis: "bottom" },
    x: { domain: ["Allies", "Axis"], axis: null, padding: 0.12 },
    y: { domain: [0, 82], label: "$ billion a year, US 1944 munitions prices", labelArrow: "none", grid: true, ticks: [0, 20, 40, 60, 80] },
    marks: [
      Plot.barY(segments, { fx: "period", x: "coalition", y1: "y1", y2: "y2", fill: "colour", stroke: "white", strokeWidth: 0.5 }),
      Plot.text(in1944, { fx: "period", x: "coalition", y: (d) => (d.y1 + d.y2) / 2, text: (d) => (d.country === "Germany" ? "Ger." : d.country), fill: "text", fontSize: 10 }),
      Plot.text(tot, { fx: "period", x: "coalition", y: "value", text: (d) => d.value.toFixed(1), dy: -7, fill: INK, fontSize: 11 }),
      Plot.text(tot, { fx: "period", x: "coalition", y: 0, text: (d) => d.coalition, dy: 9, fill: MUTED, fontSize: 10 }),
      Plot.text(ratios, { fx: "period", y: (d) => d.top, text: (d) => `${d.ratio.toFixed(1)}×`, dy: -24, fill: HIGHLIGHT, fontWeight: "bold", fontSize: 13 }),
      Plot.ruleY([0], { stroke: INK }),
      title("Allied and Axis munitions output, 1935–44 (Allies ÷ Axis in red)", FIRST),
      Plot.text(key, { fx: () => PERIOD_LABEL["1935-39 average"], frameAnchor: "top-left", dx: (d) => d.x - 8, dy: -22, text: (d) => `■ ${d.country}`, fill: (d) => d.colour, stroke: (d) => (d.colour === "#bfdbfe" ? "#93c5fd" : "none"), strokeWidth: 0.3, textAnchor: "start", fontWeight: "bold" }),
      note("Allies: USA, Canada, UK, USSR. Axis: Germany, Japan (Italy is not in the source). The USA and USSR are counted in all years,\nthough the USSR entered the war in June 1941 and the USA in December 1941. Combat munitions by value.\nSource: R. W. Goldsmith (1946), as tabulated in M. Harrison, Economic History Review 41 (1988), table 1.", 30, FIRST),
    ],
  });
  writeFileSync(join(HERE, "allies-won-munitions.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: Allied and Axis GDP, 1938-45 -----------------------------------
{
  const rows = read("tidy/gdp-coalition-totals-harrison-1998.csv").map((r) => ({
    year: Number(r.year), allies: Number(r.allies_gdp_bn_1990_intl_usd), axis: Number(r.axis_gdp_bn_1990_intl_usd), ratio: Number(r.allies_to_axis),
  }));
  const check = read("tidy/gdp-us-uk-vs-axis-two-sources.csv");
  const h42 = Number(one(check, { year: 1942, source: "Harrison 1998 (1990 int. $)" }).ratio);
  const m42 = Number(one(check, { year: 1942, source: "Maddison Project 2023 (2011 int. $)" }).ratio);
  const at = (y) => one(rows, { year: y });
  const ratioYears = [1938, 1941, 1942, 1944, 1945].map(at);
  const long = rows.flatMap((r) => [{ year: r.year, side: "Allies", value: r.allies }, { year: r.year, side: "Axis", value: r.axis }]);
  const COL = { Allies: "#2563eb", Axis: "#374151" };
  const fmt = (v) => Math.round(v).toLocaleString("en-GB");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 56,
    marginRight: 64,
    marginTop: 56,
    marginBottom: 74,
    style: FONT,
    x: { domain: [1937.6, 1945.4], ticks: [1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945], tickFormat: (d) => String(d), label: null },
    y: { domain: [0, 2600], label: "GDP, $ billion, 1990 international dollars", labelArrow: "none", grid: true },
    marks: [
      Plot.rectX([{ x1: 1937.6, x2: 1941.5 }], { x1: "x1", x2: "x2", y1: 0, y2: 2600, fill: "#f3f4f6" }),
      Plot.text(["USA and USSR counted before\nthey entered the war (1941)"], { x: 1939.55, y: 2480, fill: MUTED, fontSize: 11, lineAnchor: "top" }),
      Plot.line(long, { x: "year", y: "value", stroke: (d) => COL[d.side], strokeWidth: 2.5 }),
      Plot.dot(long, { x: "year", y: "value", fill: (d) => COL[d.side], r: 3 }),
      Plot.text([rows.at(-1)], { x: "year", y: "allies", text: () => "Allies", dx: 8, textAnchor: "start", fill: COL.Allies, fontWeight: "bold" }),
      Plot.text([rows.at(-1)], { x: "year", y: "axis", text: () => "Axis", dx: 8, textAnchor: "start", fill: COL.Axis, fontWeight: "bold" }),
      Plot.text(ratioYears, { x: "year", y: "allies", text: (d) => `${d.ratio.toFixed(1)}×`, dy: -14, fill: HIGHLIGHT, fontWeight: "bold", fontSize: 13 }),
      Plot.text([at(1942)], { x: "year", y: "allies", text: (d) => fmt(d.allies), dy: 14, dx: 4, textAnchor: "start", fill: COL.Allies }),
      Plot.text([at(1942)], { x: "year", y: "axis", text: (d) => fmt(d.axis), dy: 14, fill: COL.Axis }),
      Plot.text([at(1944)], { x: "year", y: "allies", text: (d) => fmt(d.allies), dy: 14, dx: 4, textAnchor: "start", fill: COL.Allies }),
      Plot.text([at(1944)], { x: "year", y: "axis", text: (d) => fmt(d.axis), dy: 14, fill: COL.Axis }),
      Plot.text([`Same countries, two estimates, 1942:\nUS + UK ÷ Germany + Italy + Japan\n${h42.toFixed(2)}× (Harrison 1998)\n${m42.toFixed(2)}× (Maddison Project 2023)`], { x: 1937.75, y: 560, textAnchor: "start", lineAnchor: "top", fill: INK, fontSize: 11 }),
      Plot.ruleY([0], { stroke: INK }),
      title("Allied and Axis GDP, 1938–45 (Allies ÷ Axis in red)"),
      note("Allies: USA, UK, USSR, France (1938–40, 1945), Italy (1944–45). Axis: Germany, Austria, Italy (to 1943), Japan,\noccupied France (1940–44). Source: M. Harrison (ed.), The Economics of World War II (1998), table 1-3, corrected\nspreadsheet; cross-check: Maddison Project Database 2023 (2011 int. $) via Our World in Data.", 30),
    ],
  });
  writeFileSync(join(HERE, "allies-won-gdp.svg"), toSvg(fig) + "\n");
}

// --- Chart 3: USSR ÷ Germany on five measures, 1942 and 1944 -----------------
{
  const rows = read("tidy/ussr-vs-germany.csv");
  const MEASURES = [
    { measure: "GDP", label: "GDP", fmt: (v) => `$${Math.round(v)}bn` },
    { measure: "Armed forces", label: "Armed forces", fmt: (v) => `${(v / 1000).toFixed(2)}m` },
    { measure: "Munitions output (value)", label: "Munitions, by value", fmt: (v) => `$${v}bn` },
    { measure: "Combat aircraft (number)", label: "Combat aircraft, count", fmt: (v) => `${v}k` },
    { measure: "Tanks and SP guns (number)", label: "Tanks & SP guns, count", fmt: (v) => `${v}k` },
  ];
  const pts = MEASURES.flatMap((m) => [1942, 1944].map((year) => {
    const r = one(rows, { measure: m.measure, year });
    return { label: m.label, year, ratio: Number(r.ussr_to_germany), ussr: Number(r.ussr), germany: Number(r.germany), fmt: m.fmt };
  }));
  const pairs = MEASURES.map((m) => {
    const a = pts.find((p) => p.label === m.label && p.year === 1942);
    const b = pts.find((p) => p.label === m.label && p.year === 1944);
    return { label: m.label, x1: a.ratio, x2: b.ratio };
  });
  const COL = { 1942: HIGHLIGHT, 1944: "#374151" };

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 160,
    marginRight: 24,
    marginTop: 64,
    marginBottom: 64,
    style: FONT,
    x: { domain: [0, 4.6], label: "USSR ÷ Germany (1 = equal)", labelArrow: "none", grid: true, ticks: [0, 1, 2, 3, 4], tickFormat: (d) => `${d}×` },
    y: { domain: MEASURES.map((m) => m.label), label: null, padding: 0.2 },
    marks: [
      Plot.ruleX([1], { stroke: INK, strokeWidth: 1.5 }),
      Plot.text(["equal"], { x: 1, frameAnchor: "top", dy: -6, fill: INK, fontSize: 11 }),
      Plot.ruleY(pairs, { y: "label", x1: "x1", x2: "x2", stroke: "#d1d5db", strokeWidth: 3 }),
      Plot.dot(pts, { x: "ratio", y: "label", fill: (d) => COL[d.year], r: 6 }),
      Plot.text(pts.filter((p) => p.year === 1942), { x: "ratio", y: "label", text: (d) => `${d.ratio.toFixed(2)}× (${d.fmt(d.ussr)} vs ${d.fmt(d.germany)})`, dy: -13, fill: COL[1942], fontSize: 11 }),
      Plot.text(pts.filter((p) => p.year === 1944), { x: "ratio", y: "label", text: (d) => `${d.ratio.toFixed(2)}×`, dy: 14, fill: COL[1944], fontSize: 11 }),
      title("The USSR against Germany: smaller economy, more weapons (in 1942)"),
      Plot.text(["● 1942"], { frameAnchor: "top-left", dy: -24, dx: -4, fill: COL[1942], fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["● 1944"], { frameAnchor: "top-left", dy: -24, dx: 52, fill: COL[1944], fontWeight: "bold", textAnchor: "start" }),
      note("Labels: USSR vs Germany. GDP in 1990 international $ and armed forces: Harrison (1998) tables 1-3, 1-5. Munitions by value\n(US 1944 prices): Goldsmith (1946) via Harrison (1988) table 1. Counts: Harrison (1998) table 1-6, from the Soviet official history.", 34),
    ],
  });
  writeFileSync(join(HERE, "allies-won-ussr-germany.svg"), toSvg(fig) + "\n");
}

// --- Chart 4: war deaths by country, low and high estimates ------------------
{
  const rows = read("tidy/deaths-wikipedia-2026-09.csv").map((r) => ({ ...r, low: Number(r.low) / 1e6, high: Number(r.high) / 1e6 }));
  const totals = rows.filter((r) => r.measure === "total").sort((a, b) => b.high - a.high || a.country.localeCompare(b.country));
  const rowLabel = (r) => (r.side === "Axis" ? `${r.country} (Axis)` : r.country);
  const order = totals.map(rowLabel);
  const data = rows.map((r) => ({ ...r, row: rowLabel(r) }));
  const fmt = (v) => (v >= 1 ? String(Number(v.toFixed(1))) : v.toFixed(2));
  const range = (d) => (d.low === d.high ? `${fmt(d.high)}m` : `${fmt(d.low)}–${fmt(d.high)}m`);
  const COL = { total: "#fca5a5", military: "#991b1b" };
  const LABEL = { total: "#b91c1c", military: "#991b1b" };
  const half = (measure) => (measure === "total" ? { insetTop: 3, insetBottom: 17 } : { insetTop: 17, insetBottom: 3 });

  const marks = [];
  for (const measure of ["total", "military"]) {
    const d = data.filter((r) => r.measure === measure);
    marks.push(
      Plot.barX(d.filter((r) => r.high > r.low), { y: "row", x1: "low", x2: "high", fill: COL[measure], ...half(measure) }),
      Plot.tickX(d, { y: "row", x: "low", stroke: COL[measure], strokeWidth: 2, ...half(measure) }),
      Plot.tickX(d, { y: "row", x: "high", stroke: COL[measure], strokeWidth: 2, ...half(measure) }),
      Plot.text(d, { y: "row", x: "high", text: range, dx: 6, dy: measure === "total" ? -7 : 7, textAnchor: "start", fill: LABEL[measure], fontSize: 11 }),
    );
  }

  const fig = Plot.plot({
    document,
    width: 720,
    height: 520,
    marginLeft: 120,
    marginRight: 60,
    marginTop: 64,
    marginBottom: 74,
    style: FONT,
    x: { domain: [0, 28], label: "Deaths, millions (bar = range between low and high estimates)", labelArrow: "none", grid: true },
    y: { domain: order, label: null, padding: 0.1 },
    marks: [
      ...marks,
      Plot.ruleX([0], { stroke: INK }),
      title("War deaths by country: low and high estimates"),
      Plot.text(["■ All deaths, military and civilian"], { frameAnchor: "top-left", dy: -24, dx: -4, fill: LABEL.total, fontWeight: "bold", textAnchor: "start" }),
      Plot.text(["■ Military deaths"], { frameAnchor: "top-left", dy: -24, dx: 236, fill: COL.military, fontWeight: "bold", textAnchor: "start" }),
      note("Ranges as compiled in Wikipedia, \"World War II casualties\" (revision of 26 Sept 2026, CC BY-SA). Soviet military: Krivosheev (8.7m)\nto Hartmann (11.4m); Soviet total: Zemskov (20m) to Andreev et al. (27m); German military: Statistisches Jahrbuch 1960 (4.4m)\nto Overmans (5.3m). China 1937–45. Totals include victims of occupation, genocide, famine and disease.", 30),
    ],
  });
  writeFileSync(join(HERE, "allies-won-deaths.svg"), toSvg(fig) + "\n");
}

console.log("wrote allies-won-munitions.svg, allies-won-gdp.svg, allies-won-ussr-germany.svg, allies-won-deaths.svg");
