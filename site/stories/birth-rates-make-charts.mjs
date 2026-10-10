// Regenerate the SVG charts embedded in birth-rates.md.
//   cd site/stories && npm ci && node birth-rates-make-charts.mjs
//
// Authored with Observable Plot, rendered to static SVG in Node (jsdom supplies
// the DOM). The published page embeds the .svg files as Markdown images; no
// JavaScript runs on them. See skills/story/references/charting.md.
//
// Reads the UN World Population Prospects 2024 extracts snapshotted in
// birth-rates-src/ (see PROVENANCE.md there) and implements the chart plan in
// birth-rates-outline.md. Every annotated number is computed from the rows.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { csvParse } from "d3-dsv";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "birth-rates-src");
const { window } = new JSDOM("");
const document = window.document;

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const MUTED = "#6b7280";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };
const REPLACEMENT = 2.1;
const ULTRA_LOW = 1.4;
const FIRST = 1950;
const LAST = 2023;

function load(file, numeric) {
  return csvParse(readFileSync(join(SRC, file), "utf8"), (r) => {
    for (const k of numeric) {
      r[k] = Number(r[k]);
      if (!Number.isFinite(r[k])) throw new Error(`${file}: non-numeric ${k} in ${JSON.stringify(r)}`);
    }
    return r;
  });
}

const countries = load("wpp2024-countries.csv", ["year", "tfr", "population_thousands"]);
const regions = load("wpp2024-regions.csv", ["year", "tfr", "births_thousands", "population_thousands"]);

/** Rows of one place, by year; throws if any year is missing. */
const byPlace = new Map();
for (const r of countries) {
  if (!byPlace.has(r.iso3)) byPlace.set(r.iso3, []);
  byPlace.get(r.iso3).push(r);
}
for (const [iso3, rows] of byPlace) {
  rows.sort((a, b) => a.year - b.year);
  if (rows.length !== LAST - FIRST + 1) throw new Error(`${iso3}: ${rows.length} years`);
}
const PLACES = byPlace.size;
if (PLACES !== 237) throw new Error(`expected 237 places, got ${PLACES}`);

function at(iso3, year) {
  const row = byPlace.get(iso3)?.find((r) => r.year === year);
  if (!row) throw new Error(`no row for ${iso3} ${year}`);
  return row;
}
function region(location, year) {
  const row = regions.find((r) => r.location === location && r.year === year);
  if (!row) throw new Error(`no row for ${location} ${year}`);
  return row;
}

const pct = (v, d = 0) => `${v.toFixed(d)}%`;
const tfr = (v) => v.toFixed(2);
const signed = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : `+${v.toFixed(2)}`);

/** Render a Plot figure/svg node to a standalone SVG string; refuse NaN/Infinity. */
function toSvg(node) {
  const svg = node.tagName.toLowerCase() === "svg" ? node : node.querySelector("svg");
  if (svg !== node) {
    const style = node.querySelector("style");
    if (style && !svg.contains(style)) svg.insertBefore(style, svg.firstChild);
  }
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const out = svg.outerHTML;
  if (/NaN|Infinity|undefined|=>/.test(out)) throw new Error("SVG contains NaN, Infinity, undefined or a stringified function");
  return out;
}
function write(name, fig) {
  writeFileSync(join(HERE, name), toSvg(fig) + "\n");
}

const yearAxis = { label: null, tickFormat: "d" };

// --- Chart 1: places below replacement, 1950-2023 ----------------------------
{
  const years = [];
  for (let y = FIRST; y <= LAST; y++) {
    const rows = [...byPlace.values()].map((s) => s[y - FIRST]);
    const below = rows.filter((r) => r.tfr < REPLACEMENT);
    const pop = rows.reduce((a, r) => a + r.population_thousands, 0);
    const popBelow = below.reduce((a, r) => a + r.population_thousands, 0);
    const ultra = rows.filter((r) => r.tfr < ULTRA_LOW);
    // Robustness: places of 1 million+ people that year; and the share without China and India.
    const big = rows.filter((r) => r.population_thousands >= 1000);
    const rest = rows.filter((r) => r.iso3 !== "CHN" && r.iso3 !== "IND");
    const restPop = rest.reduce((a, r) => a + r.population_thousands, 0);
    const restBelow = rest.filter((r) => r.tfr < REPLACEMENT).reduce((a, r) => a + r.population_thousands, 0);
    years.push({
      year: y,
      below: below.length,
      ultra: ultra.length,
      share: (100 * popBelow) / pop,
      ultraShare: (100 * ultra.reduce((a, r) => a + r.population_thousands, 0)) / pop,
      big: big.length,
      bigBelow: big.filter((r) => r.tfr < REPLACEMENT).length,
      restShare: (100 * restBelow) / restPop,
    });
  }
  const y1990 = years.find((d) => d.year === 1990);
  const y2023 = years.find((d) => d.year === LAST);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 150,
    marginTop: 28,
    marginBottom: 36,
    style: FONT,
    x: { ...yearAxis, domain: [FIRST, LAST] },
    y: { domain: [0, PLACES], label: `Countries and territories (of ${PLACES})`, labelArrow: "none", grid: true, ticks: [0, 50, 100, 150, 200, 237] },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.ruleY([PLACES / 2], { stroke: MUTED, strokeDasharray: "4,3" }),
      Plot.text([{ year: FIRST + 1, v: PLACES / 2 }], { x: "year", y: "v", text: () => "Half of all places", dy: -8, textAnchor: "start", fill: MUTED }),
      Plot.line(years, { x: "year", y: "ultra", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(years, { x: "year", y: "below", stroke: LINE, strokeWidth: 2.5 }),
      Plot.text([y2023], { x: "year", y: "below", text: (d) => `Below 2.1: ${d.below}`, dx: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([y2023], { x: "year", y: "below", text: (d) => `${pct(d.share)} of world population`, dx: 8, dy: 15, textAnchor: "start", fill: LINE }),
      Plot.text([y2023], { x: "year", y: "ultra", text: (d) => `Below 1.4: ${d.ultra}`, dx: 8, textAnchor: "start", fill: MUTED, fontWeight: "bold" }),
      Plot.text([y2023], { x: "year", y: "ultra", text: (d) => `${pct(d.ultraShare)} of world population`, dx: 8, dy: 15, textAnchor: "start", fill: MUTED }),
      // Robustness notes in the empty upper left.
      Plot.text([{ year: FIRST + 1, v: 228 }], { x: "year", y: "v", text: () => "Places of 1 million+ people below 2.1:", textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([{ year: FIRST + 1, v: 228 }], { x: "year", y: "v", text: () => `${y1990.bigBelow} of ${y1990.big} in 1990; ${y2023.bigBelow} of ${y2023.big} in ${LAST}`, dy: 15, textAnchor: "start", fill: INK }),
      Plot.text([{ year: FIRST + 1, v: 190 }], { x: "year", y: "v", text: () => "Outside China and India, share of people below 2.1:", textAnchor: "start", fill: INK, fontWeight: "bold" }),
      Plot.text([{ year: FIRST + 1, v: 190 }], { x: "year", y: "v", text: () => `${pct(y1990.restShare)} in 1990; ${pct(y2023.restShare)} in ${LAST}`, dy: 15, textAnchor: "start", fill: INK }),
      Plot.dot([y1990, y2023], { x: "year", y: "below", fill: LINE, r: 4 }),
      Plot.dot([y1990, y2023], { x: "year", y: "ultra", fill: LINE2, r: 3.5 }),
      Plot.text([y1990], { x: "year", y: "below", text: (d) => `1990: ${d.below} places,`, dx: -8, dy: -22, textAnchor: "end", fill: LINE }),
      Plot.text([y1990], { x: "year", y: "below", text: (d) => `${pct(d.share)} of world population`, dx: -8, dy: -8, textAnchor: "end", fill: LINE }),
      Plot.text([y1990], { x: "year", y: "ultra", text: (d) => `${d.ultra}`, dy: -10, fill: MUTED }),
    ],
  });
  write("birth-rates-below-replacement.svg", fig);
}

// --- Chart 2: years from five children per woman to below 2.1 ----------------
{
  const SHORT = {
    "Iran (Islamic Republic of)": "Iran",
    "China, Hong Kong SAR": "Hong Kong",
    "China, Taiwan Province of China": "Taiwan",
    "Republic of Korea": "South Korea",
    "Kosovo (under UNSC res. 1244)": "Kosovo",
    "Venezuela (Bolivarian Republic of)": "Venezuela",
    "United Arab Emirates": "UAE",
    "Bosnia and Herzegovina": "Bosnia & Herz.",
    "Trinidad and Tobago": "Trinidad & Tobago",
  };
  const MARKED = new Set(["IRN", "SGP", "CHN", "KOR", "BRA", "MEX", "IND", "LKA"]);
  const falls = [];
  for (const [iso3, s] of byPlace) {
    if (s.at(-1).population_thousands < 1000) continue;
    const i21 = s.findIndex((r) => r.tfr < REPLACEMENT);
    if (i21 < 0) continue;
    let i5 = -1;
    for (let i = i21; i >= 0; i--) if (s[i].tfr >= 5) { i5 = i; break; }
    if (i5 < 0) continue;
    falls.push({ iso3, name: SHORT[s[0].location] ?? s[0].location, y5: s[i5].year, y21: s[i21].year, years: s[i21].year - s[i5].year, marked: MARKED.has(iso3), back: s.slice(i21).some((r) => r.tfr >= REPLACEMENT) });
  }
  falls.sort((a, b) => a.years - b.years || a.y21 - b.y21);
  const sorted = falls.map((d) => d.years).sort((a, b) => a - b);
  const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  for (const iso3 of MARKED) if (!falls.some((d) => d.iso3 === iso3)) throw new Error(`no fall for ${iso3}`);
  const colour = (d) => (d.marked ? LINE : LINE2);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 54 + 40 + falls.length * 16,
    marginLeft: 120,
    marginRight: 70,
    marginTop: 54,
    marginBottom: 40,
    style: FONT,
    x: { ...yearAxis, domain: [FIRST, LAST], grid: true, label: "Last year at 5 or more children per woman → first year below 2.1", labelAnchor: "center", labelArrow: "none" },
    y: { domain: falls.map((d) => d.name), label: null, tickSize: 0 },
    marks: [
      Plot.ruleY(falls, { y: "name", x1: "y5", x2: "y21", stroke: colour, strokeWidth: 4 }),
      Plot.text(falls.filter((d) => !d.marked), { y: "name", x: "y21", text: (d) => `${d.years} yrs${d.back ? " *" : ""}`, dx: 6, textAnchor: "start", fill: MUTED }),
      Plot.text(falls.filter((d) => d.marked), { y: "name", x: "y21", text: (d) => `${d.years} yrs${d.back ? " *" : ""}`, dx: 6, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text(falls.filter((d) => d.marked), { y: "name", x: "y5", text: (d) => `${d.y5}–${d.y21}`, dx: -6, textAnchor: "end", fill: LINE }),
      Plot.text([`${falls.length} countries with 1 million+ people. Median: ${median} years`], { frameAnchor: "top-left", dy: -36, fill: INK, fontWeight: "bold" }),
      Plot.text([`* ${falls.filter((d) => d.back).length} of them later rose back above 2.1 for at least a year`], { frameAnchor: "top-left", dy: -20, fill: MUTED }),
    ],
  });
  write("birth-rates-speed.svg", fig);
}

// --- Chart 3: 2010 vs 2023, named countries ----------------------------------
{
  const PICK = { KOR: "South Korea", CHN: "China", CHL: "Chile", FIN: "Finland", NOR: "Norway", SWE: "Sweden", FRA: "France", GBR: "United Kingdom", USA: "United States", ITA: "Italy", JPN: "Japan", BRA: "Brazil", MEX: "Mexico", IND: "India", DEU: "Germany", HUN: "Hungary" };
  const rows = Object.entries(PICK).map(([iso3, name]) => {
    const a = at(iso3, 2010).tfr;
    const b = at(iso3, LAST).tfr;
    return { name, a, b, change: b - a };
  });
  // Two groups: below 2.1 in 2010 (sorted by 2023 value), then those above 2.1 in 2010.
  const GROUP2 = "Above 2.1 in 2010:";
  const g1 = rows.filter((d) => d.a < REPLACEMENT).sort((p, q) => p.b - q.b);
  const g2 = rows.filter((d) => d.a >= REPLACEMENT).sort((p, q) => p.b - q.b);
  const domain = [...g1.map((d) => d.name), GROUP2, ...g2.map((d) => d.name)];
  const below2010 = [...byPlace.keys()].filter((k) => at(k, 2010).tfr < REPLACEMENT);
  const lower = below2010.filter((k) => at(k, LAST).tfr < at(k, 2010).tfr);
  const by2019 = lower.filter((k) => at(k, 2019).tfr < at(k, 2010).tfr);
  const colour = (d) => (d.change < 0 ? HIGHLIGHT : LINE);
  const falls = rows.filter((d) => d.change < 0);
  const rises = rows.filter((d) => d.change >= 0);
  const XMAX = 2.85;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 66 + 40 + domain.length * 22,
    marginLeft: 110,
    marginRight: 60,
    marginTop: 66,
    marginBottom: 40,
    style: FONT,
    x: { domain: [0.5, XMAX], label: "Children per woman (total fertility rate)", labelAnchor: "center", labelArrow: "none", grid: true },
    y: { domain, label: null, tickSize: 0 },
    marks: [
      Plot.ruleX([REPLACEMENT], { stroke: INK, strokeDasharray: "4,3" }),
      Plot.text([REPLACEMENT], { x: (d) => d, frameAnchor: "top", dy: -14, text: () => "Replacement: 2.1", fill: INK }),
      Plot.ruleY(rows, { y: "name", x1: "a", x2: "b", stroke: LINE2, strokeWidth: 2 }),
      Plot.dot(rows, { y: "name", x: "a", fill: MUTED, r: 4 }),
      Plot.dot(rows, { y: "name", x: "b", fill: colour, r: 4 }),
      Plot.text(rows, { y: "name", x: () => XMAX, text: (d) => signed(d.change), dx: 8, textAnchor: "start", fill: colour, fontWeight: "bold" }),
      // Values at both ends, each on the outside of its dot (dx and textAnchor are constants in Plot).
      Plot.text(falls, { y: "name", x: "b", text: (d) => tfr(d.b), dx: -8, textAnchor: "end", fill: HIGHLIGHT }),
      Plot.text(falls, { y: "name", x: "a", text: (d) => tfr(d.a), dx: 8, textAnchor: "start", fill: MUTED }),
      Plot.text(rises, { y: "name", x: "b", text: (d) => tfr(d.b), dx: 8, textAnchor: "start", fill: LINE }),
      Plot.text(rises, { y: "name", x: "a", text: (d) => tfr(d.a), dx: -8, textAnchor: "end", fill: MUTED }),
      Plot.text(["● 2010"], { frameAnchor: "top-left", dy: -58, dx: 0, fill: MUTED, fontWeight: "bold" }),
      Plot.text(["● 2023, lower"], { frameAnchor: "top-left", dy: -58, dx: 56, fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text(["● 2023, higher"], { frameAnchor: "top-left", dy: -58, dx: 150, fill: LINE, fontWeight: "bold" }),
      Plot.text(["Change"], { frameAnchor: "top-right", dy: -14, dx: 50, fill: INK, fontWeight: "bold" }),
      Plot.text([`${lower.length} of the ${below2010.length} places below 2.1 in 2010 were lower in ${LAST}; ${by2019.length} of them already by 2019`], { frameAnchor: "top-left", dy: -38, fill: INK }),
    ],
  });
  write("birth-rates-since-2010.svg", fig);
}

// --- Chart 4: share of the world's births by region, 1950-2023 ---------------
{
  const NAMES = {
    "Sub-Saharan Africa": "Sub-Saharan Africa",
    "Central and Southern Asia": "Central & Southern Asia",
    "Eastern and South-Eastern Asia": "East & South-East Asia",
    "Northern Africa and Western Asia": "N. Africa & W. Asia",
    "Europe and Northern America": "Europe & N. America",
    "Latin America and the Caribbean": "Latin America & Caribbean",
    "Australia/New Zealand": "Oceania",
    "Oceania (excluding Australia and New Zealand)": "Oceania",
  };
  const series = [];
  for (let y = FIRST; y <= LAST; y++) {
    const world = region("World", y);
    const parts = regions.filter((r) => r.year === y && r.location !== "World");
    if (parts.length !== 8) throw new Error(`${y}: ${parts.length} regions`);
    const births = parts.reduce((a, r) => a + r.births_thousands, 0);
    const pop = parts.reduce((a, r) => a + r.population_thousands, 0);
    if (Math.abs(births / world.births_thousands - 1) > 0.001 || Math.abs(pop / world.population_thousands - 1) > 0.001) throw new Error(`${y}: regions do not sum to World`);
    const sums = new Map();
    for (const r of parts) sums.set(NAMES[r.location], (sums.get(NAMES[r.location]) ?? 0) + r.births_thousands);
    for (const [name, b] of sums) series.push({ name, year: y, share: (100 * b) / world.births_thousands });
  }
  const pick = (name, year) => {
    const row = series.find((d) => d.name === name && d.year === year);
    if (!row) throw new Error(`no share for ${name} ${year}`);
    return row;
  };
  const SSA = "Sub-Saharan Africa";
  const ESEA = "East & South-East Asia";
  const ssaTfr = region("Sub-Saharan Africa", LAST).tfr;
  const popShare = (y) => (100 * region("Sub-Saharan Africa", y).population_thousands) / region("World", y).population_thousands;
  const worldTfr = region("World", LAST).tfr;
  const colourOf = (name) => (name === SSA ? HIGHLIGHT : name === ESEA ? INK : LINE2);

  // End labels, nudged apart (in share units) so they do not overlap.
  const ends = series.filter((d) => d.year === LAST).sort((a, b) => b.share - a.share).map((d) => ({ ...d, ly: d.share }));
  const GAP = 1.6;
  for (let i = 1; i < ends.length; i++) if (ends[i - 1].ly - ends[i].ly < GAP) ends[i].ly = ends[i - 1].ly - GAP;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: 52,
    marginRight: 210,
    marginTop: 28,
    marginBottom: 36,
    style: FONT,
    x: { ...yearAxis, domain: [FIRST, LAST] },
    y: { domain: [0, 40], label: "Share of the world's births (%)", labelArrow: "none", grid: true },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(series.filter((d) => d.name !== SSA && d.name !== ESEA), { x: "year", y: "share", z: "name", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(series.filter((d) => d.name === ESEA), { x: "year", y: "share", stroke: INK, strokeWidth: 2.5 }),
      Plot.line(series.filter((d) => d.name === SSA), { x: "year", y: "share", stroke: HIGHLIGHT, strokeWidth: 2.5 }),
      Plot.text(ends.filter((d) => d.name !== SSA && d.name !== ESEA), { x: "year", y: "ly", text: (d) => `${d.name} ${pct(d.share, 1)}`, dx: 8, textAnchor: "start", fill: LINE2 }),
      Plot.text(ends.filter((d) => d.name === SSA || d.name === ESEA), { x: "year", y: "ly", text: (d) => `${d.name} ${pct(d.share, 1)}`, dx: 8, textAnchor: "start", fill: (d) => colourOf(d.name), fontWeight: "bold" }),
      Plot.dot([pick(SSA, 1990), pick(ESEA, 1990)], { x: "year", y: "share", fill: (d) => colourOf(d.name), r: 4 }),
      Plot.dot([pick(SSA, LAST), pick(ESEA, LAST)], { x: "year", y: "share", fill: (d) => colourOf(d.name), r: 4 }),
      Plot.text([pick(SSA, 1950)], { x: "year", y: "share", text: (d) => pct(d.share, 1), dy: -10, textAnchor: "start", fill: HIGHLIGHT }),
      Plot.text([pick(SSA, 1990)], { x: "year", y: "share", text: (d) => `1990: ${pct(d.share, 1)}`, dy: 16, textAnchor: "middle", fill: HIGHLIGHT }),
      Plot.text([pick(ESEA, 1990)], { x: "year", y: "share", text: (d) => `1990: ${pct(d.share, 1)}`, dy: -12, textAnchor: "middle", fill: INK }),
      Plot.text([{ year: 1980, share: 38.6 }], { x: "year", y: "share", text: () => `Sub-Saharan Africa in ${LAST}: ${tfr(ssaTfr)} children per woman (world ${tfr(worldTfr)});`, textAnchor: "start", fill: HIGHLIGHT, dy: -14 }),
      Plot.text([{ year: 1980, share: 38.6 }], { x: "year", y: "share", text: () => `share of world population: ${pct(popShare(1990), 1)} in 1990, ${pct(popShare(LAST), 1)} in ${LAST}`, textAnchor: "start", fill: HIGHLIGHT }),
    ],
  });
  write("birth-rates-births-share.svg", fig);
}

console.log("wrote birth-rates-below-replacement.svg, birth-rates-speed.svg, birth-rates-since-2010.svg, birth-rates-births-share.svg");
