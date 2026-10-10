// Regenerate the SVG charts embedded in heat-quiet-killer.md.
//   cd site/stories && npm ci && node heat-quiet-killer-make-charts.mjs
//
// Observable Plot rendered to static SVG in Node (jsdom supplies the DOM); the
// page embeds the .svg files, no JavaScript runs on it. Implements the chart
// plan in heat-quiet-killer-outline.md.
//
// Reads the us-natural-hazard-statistics dataset in this repo directly, plus
// heat-quiet-killer-src/heat-deaths-arizona.csv (the NWS's per-state heat
// summaries; see its PROVENANCE.md). Every value on a chart is read from those
// rows except two attributed constants, the NCHS death-certificate counts.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "climate-and-environment", "us-natural-hazard-statistics", "data");
const SRC = join(HERE, "heat-quiet-killer-src");
const { window } = new JSDOM("");
const document = window.document;

const GREY = "#9ca3af";
const INK = "#111827";
const HEAT = "#dc2626";
const HEAT2 = "#f87171";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

// Berko J, Ingram DD, Saha S, Parker JD. Deaths attributed to heat, cold, and
// other weather events in the United States, 2006-2010. NCHS National Health
// Statistics Reports 76, 2014, Table 1: deaths with heat (X30, T67) or cold
// (X31, T68) as underlying or contributing cause on the death certificate.
const NCHS = { from: 2006, to: 2010, heat: 3332, cold: 6660 };

/** Parse a clean (unquoted) CSV into objects. */
function csv(path) {
  const [head, ...lines] = readFileSync(path, "utf8").trim().split("\n");
  const cols = head.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

const int = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`not an integer: ${v}`);
  return n;
};
const fmt = (n) => n.toLocaleString("en-US");
const ratio = (a, b) => (a / b).toFixed(1);

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
  const out = toSvg(fig) + "\n";
  if (/NaN|Infinity|undefined/.test(out)) throw new Error(`${name}: NaN, Infinity or undefined in SVG`);
  writeFileSync(join(HERE, name), out);
}

// --- Load and cross-check ----------------------------------------------------
const events = csv(join(DATA, "hazard-statistics.csv"))
  .filter((r) => r.is_total === "false")
  .map((r) => ({ year: int(r.year), id: r.hazard_id, hazard: r.hazard, deaths: int(r.fatalities) }));
const annual = csv(join(DATA, "annual-fatalities.csv")).map((r) => ({ year: int(r.year), heat: int(r.heat) }));
const az = csv(join(SRC, "heat-deaths-arizona.csv")).map((r) => ({
  year: int(r.year),
  all: int(r.heat_all_states),
  arizona: int(r.arizona),
}));

const years = annual.map((r) => r.year);
if (az.length !== annual.length || az.some((r, i) => r.year !== years[i])) throw new Error("Arizona CSV years do not match the dataset");
for (const r of az) {
  const heat = annual.find((a) => a.year === r.year).heat;
  if (r.all !== heat) throw new Error(`${r.year}: NWS heat summary total ${r.all} != dataset heat row ${heat}`);
  if (r.arizona > r.all) throw new Error(`${r.year}: Arizona exceeds total`);
}

// Totals by hazard over all years; label = the source's most recent spelling.
const byHazard = new Map();
for (const e of events) {
  const h = byHazard.get(e.id) ?? { id: e.id, deaths: 0, year: 0, hazard: "" };
  h.deaths += e.deaths;
  if (e.year >= h.year) Object.assign(h, { year: e.year, hazard: e.hazard });
  byHazard.set(e.id, h);
}
const get = (id) => {
  const h = byHazard.get(id);
  if (!h) throw new Error(`no hazard ${id}`);
  return h;
};
const heat = get("heat").deaths;
const tornado = get("tornado").deaths;
const flash = get("flash-flood").deaths;
const combined = tornado + flash;
const azTotal = az.reduce((s, r) => s + r.arizona, 0);
const first = years[0];
const last = years.at(-1);

// --- Chart 1: deaths by hazard, heat split by Arizona ---------------------------
{
  const top = [...byHazard.values()].sort((a, b) => b.deaths - a.deaths).slice(0, 8);
  if (top[0].id !== "heat") throw new Error("heat is not the top hazard");
  const name = (h) => {
    const s = h.hazard.charAt(0) + h.hazard.slice(1).toLowerCase();
    return h.id === "tropical-storm-hurricane" ? h.hazard.charAt(0) + h.hazard.slice(1).toLowerCase() : s;
  };
  const order = top.map(name);
  const bars = top.flatMap((h) =>
    h.id === "heat"
      ? [
          { name: name(h), part: "other", deaths: h.deaths - azTotal },
          { name: name(h), part: "arizona", deaths: azTotal },
        ]
      : [{ name: name(h), part: "all", deaths: h.deaths }],
  );
  const heatName = name(top[0]);
  const ends = top.map((h) => ({
    name: name(h),
    deaths: h.deaths,
    label: h.id === "heat" ? `${fmt(h.deaths)}, ${ratio(h.deaths, tornado)}× tornadoes` : fmt(h.deaths),
  }));

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 180,
    marginRight: 150,
    marginTop: 40,
    marginBottom: 40,
    style: FONT,
    x: { domain: [0, 6000], label: `Deaths, ${first}–${last}, as attributed by the NWS`, labelArrow: "none", grid: true, tickFormat: fmt },
    y: { domain: order, label: null, tickSize: 0 },
    color: { domain: ["other", "arizona", "all"], range: [HEAT, HEAT2, GREY] },
    marks: [
      Plot.barX(bars, { y: "name", x: "deaths", fill: "part", order: ["other", "arizona", "all"] }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(ends, { y: "name", x: "deaths", text: "label", dx: 6, textAnchor: "start", fill: (d) => (d.name === heatName ? HEAT : INK), fontWeight: (d) => (d.name === heatName ? "bold" : "normal") }),
      Plot.text([{ name: heatName, x: (heat - azTotal) / 2, t: `Other states ${fmt(heat - azTotal)}` }], { y: "name", x: "x", text: "t", fill: "white", fontWeight: "bold" }),
      Plot.text([{ name: heatName, x: heat - azTotal + azTotal / 2, t: `Arizona ${fmt(azTotal)}` }], { y: "name", x: "x", text: "t", fill: INK, fontWeight: "bold" }),
      Plot.ruleX([combined], { stroke: INK, strokeDasharray: "4,3" }),
      Plot.text([{ x: combined }], { x: "x", frameAnchor: "top", dy: -28, text: () => `Tornado + flash flood combined: ${fmt(combined)} (heat is ${ratio(heat, combined)}×)`, textAnchor: "middle", fill: INK }),
    ],
  });
  write("heat-quiet-killer-ranking.svg", fig);
}

// --- Chart 2: heat deaths per year, Arizona and everywhere else -----------------
{
  const stacked = az.flatMap((r) => [
    { year: r.year, part: "other", deaths: r.all - r.arizona },
    { year: r.year, part: "arizona", deaths: r.arizona },
  ]);
  const yr = (y) => {
    const r = az.find((a) => a.year === y);
    if (!r) throw new Error(`no row for ${y}`);
    return r;
  };
  // Label positions are set by hand so no label sits on a neighbouring bar;
  // the values come from the rows. A thin rule joins a lifted label to its bar.
  const notes = [
    { r: yr(2005), y: 300, anchor: "middle", t: (r) => `2005: Arizona ${r.arizona}` },
    { r: yr(2019), y: null, anchor: "end", t: (r) => `2019: Arizona ${r.arizona} of ${r.all}` },
    { r: yr(2020), y: 440, anchor: "end", t: (r) => `2020: ${r.all - r.arizona} outside Arizona` },
    { r: yr(2023), y: null, anchor: "end", t: (r) => `2023: Arizona ${r.arizona} of ${r.all}` },
    { r: yr(last), y: 615, anchor: "end", t: (r) => `${last}: ${r.all}, preliminary` },
  ].map(({ r, y, anchor, t }) => ({ year: r.year, all: r.all, y: y ?? r.all, lifted: y !== null, anchor, label: t(r) }));
  const leaders = notes.filter((n) => n.lifted);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 16,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { domain: years, label: null, tickFormat: (y) => (y % 4 === 1 ? String(y) : ""), tickSize: 0 },
    y: { domain: [0, 640], label: "Heat deaths per year (NWS)", labelArrow: "none", grid: true },
    color: { domain: ["other", "arizona"], range: [GREY, HEAT] },
    marks: [
      Plot.barY(stacked, { x: "year", y: "deaths", fill: "part", order: ["other", "arizona"], inset: 1 }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.ruleX(leaders, { x: "year", y1: (d) => d.all + 6, y2: (d) => d.y - 14, stroke: INK, strokeWidth: 0.75 }),
      Plot.text(notes.filter((d) => d.anchor === "end"), { x: "year", y: "y", text: "label", dy: -8, dx: 6, textAnchor: "end", fill: INK }),
      Plot.text(notes.filter((d) => d.anchor === "middle"), { x: "year", y: "y", text: "label", dy: -8, textAnchor: "middle", fill: INK }),
      Plot.text([{ year: 2007, y: 470 }], { x: "year", y: "y", text: () => "Arizona", textAnchor: "start", fill: HEAT, fontWeight: "bold" }),
      Plot.text([{ year: 2007, y: 440 }], { x: "year", y: "y", text: () => "All other states", textAnchor: "start", fill: GREY, fontWeight: "bold" }),
    ],
  });
  write("heat-quiet-killer-arizona.svg", fig);
}

// --- Chart 3: heat and cold, NWS vs death certificates, 2006–2010 -------------
{
  const nws = (id) => {
    const rows = events.filter((e) => e.id === id && e.year >= NCHS.from && e.year <= NCHS.to);
    if (rows.length !== NCHS.to - NCHS.from + 1) throw new Error(`${id}: expected one row per year ${NCHS.from}-${NCHS.to}`);
    return rows.reduce((s, e) => s + e.deaths, 0);
  };
  const heatNws = nws("heat");
  const coldNws = nws("cold");
  const rows = [
    { name: "Heat: NWS Storm Data", deaths: heatNws, fill: GREY, label: fmt(heatNws) },
    { name: "Heat: death certificates", deaths: NCHS.heat, fill: HEAT, label: `${fmt(NCHS.heat)}, ${ratio(NCHS.heat, heatNws)}× the NWS count` },
    { name: "Cold: NWS Storm Data", deaths: coldNws, fill: GREY, label: fmt(coldNws) },
    { name: "Cold: death certificates", deaths: NCHS.cold, fill: "#2563eb", label: `${fmt(NCHS.cold)}, ${Math.round(NCHS.cold / coldNws)}× the NWS count` },
  ];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 240,
    marginLeft: 170,
    marginRight: 170,
    marginTop: 20,
    marginBottom: 40,
    style: FONT,
    x: { domain: [0, 7000], label: `US deaths, ${NCHS.from}–${NCHS.to}. Death certificates: NCHS (Berko et al. 2014)`, labelArrow: "none", grid: true, tickFormat: fmt },
    y: { domain: rows.map((r) => r.name), label: null, tickSize: 0 },
    marks: [
      Plot.barX(rows, { y: "name", x: "deaths", fill: "fill" }),
      Plot.ruleX([0], { stroke: INK }),
      Plot.text(rows, { y: "name", x: "deaths", text: "label", dx: 6, textAnchor: "start", fill: INK }),
    ],
  });
  write("heat-quiet-killer-certificates.svg", fig);
}

console.log("wrote heat-quiet-killer-ranking.svg, heat-quiet-killer-arizona.svg, heat-quiet-killer-certificates.svg");
