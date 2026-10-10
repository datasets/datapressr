// Renders deaths per year from the three leading causes as a static SVG for the worked example
// on the site:
//   node chart.ts   (after node build.ts; offline, no dependencies)
// Reads data/annual-fatalities.csv and writes site/docs/examples/nws-hazard-leading-causes.svg.
// Deterministic: same CSV, same bytes. The DataHub dataset page draws the same series from the
// "views" entry in datapackage.json.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "..", "site", "docs", "examples", "nws-hazard-leading-causes.svg");

// Reference palette from the dataviz skill, light surface: categorical slots 1-3, which validate
// all-pairs. Heat takes the warm slot. Aqua is under 3:1 against the surface, so every series
// is also direct-labelled and the example page carries the figures as a table.
const C = { surface: "#fcfcfb", ink: "#0b0b0b", secondary: "#52514e", muted: "#898781", grid: "#e1e0d9", axis: "#c3c2b7" };
const SERIES = [
  { key: "heat", label: "Heat", color: "#eb6834" },
  { key: "tornado", label: "Tornado", color: "#2a78d6" },
  { key: "flash_flood", label: "Flash flood", color: "#1baf7a" },
] as const;

type Row = { year: number; all_hazards: number; heat: number; tornado: number; flash_flood: number };

const [header, ...lines] = readFileSync(join(HERE, "data", "annual-fatalities.csv"), "utf8").trim().split("\n");
const cols = header.split(",");
const rows: Row[] = lines.map((line) => {
  const v = Object.fromEntries(line.split(",").map((x, i) => [cols[i], Number(x)]));
  return { year: v.year, all_hazards: v.all_hazards, heat: v.heat, tornado: v.tornado, flash_flood: v.flash_flood };
});
if (rows.length < 2 || rows.some((r) => Object.values(r).some((n) => !Number.isInteger(n)))) {
  throw new Error("annual-fatalities.csv is empty or has a non-integer figure; run node build.ts first");
}

const fmt = (n: number) => n.toLocaleString("en-GB");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const W = 820, H = 440;
const plot = { left: 56, right: W - 140, top: 112, bottom: H - 48 };
const first = rows[0].year, last = rows.at(-1)!.year;
const yMax = Math.ceil(Math.max(...rows.flatMap((r) => SERIES.map((s) => r[s.key]))) / 100) * 100;
const x = (year: number) => plot.left + ((year - first) / (last - first)) * (plot.right - plot.left);
const y = (v: number) => plot.bottom - (v / yMax) * (plot.bottom - plot.top);
const r1 = (n: number) => Math.round(n * 10) / 10;

const out: string[] = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" role="img" aria-labelledby="t d">`);
out.push(`<title id="t">U.S. weather deaths per year from heat, tornadoes and flash floods, ${first}–${last}</title>`);
out.push(`<desc id="d">Line chart of deaths per year attributed by the National Weather Service to heat, tornadoes and flash floods, the three deadliest event types over ${first}–${last}. Heat is the deadliest of the three in most years and was far higher in 2020–2024 than before; the preliminary 2025 figure is lower.</desc>`);
out.push(`<rect width="${W}" height="${H}" fill="${C.surface}"/>`);
out.push(`<text x="${plot.left}" y="30" font-size="17" font-weight="600" fill="${C.ink}">Heat is the deadliest U.S. weather hazard in most years</text>`);
out.push(`<text x="${plot.left}" y="52" font-size="13" fill="${C.secondary}">Deaths per year from the three event types with the most deaths over ${first}–${last}.</text>`);
out.push(`<text x="${plot.left}" y="70" font-size="13" fill="${C.secondary}">Source: NWS annual Summary of U.S. Natural Hazard Statistics (Storm Data). ${last} is preliminary.</text>`);

// Legend, one row above the plot (direct labels at the line ends as well).
let lx = plot.left;
for (const s of SERIES) {
  out.push(`<line x1="${lx}" y1="92" x2="${lx + 18}" y2="92" stroke="${s.color}" stroke-width="2" stroke-linecap="round"/>`);
  out.push(`<text x="${lx + 24}" y="96" font-size="12" fill="${C.secondary}">${esc(s.label)}</text>`);
  lx += 24 + s.label.length * 7 + 22;
}

// Grid and y axis.
for (let v = 0; v <= yMax; v += 100) {
  out.push(`<line x1="${plot.left}" y1="${r1(y(v))}" x2="${plot.right}" y2="${r1(y(v))}" stroke="${v === 0 ? C.axis : C.grid}" stroke-width="1"/>`);
  out.push(`<text x="${plot.left - 8}" y="${r1(y(v) + 4)}" font-size="11" text-anchor="end" fill="${C.muted}">${fmt(v)}</text>`);
}
// x axis ticks every 4 years, plus the last year.
const ticks = rows.map((r) => r.year).filter((yr) => (yr - first) % 4 === 0 || yr === last);
for (const yr of ticks) {
  if (yr !== last && last - yr < 3) continue;
  out.push(`<text x="${r1(x(yr))}" y="${plot.bottom + 20}" font-size="11" text-anchor="middle" fill="${C.muted}">${yr}</text>`);
}

// Lines, with a surface ring on each point and a native tooltip.
for (const s of SERIES) {
  const d = rows.map((r, i) => `${i ? "L" : "M"}${r1(x(r.year))},${r1(y(r[s.key]))}`).join("");
  out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
  for (const r of rows) {
    out.push(`<circle cx="${r1(x(r.year))}" cy="${r1(y(r[s.key]))}" r="3" fill="${s.color}" stroke="${C.surface}" stroke-width="1.5"><title>${r.year} · ${esc(s.label)}: ${fmt(r[s.key])} deaths</title></circle>`);
  }
}

// Direct labels at the line ends, nudged apart so they cannot collide.
const ends = SERIES.map((s) => ({ s, yy: y(rows.at(-1)![s.key]) })).sort((a, b) => a.yy - b.yy);
for (let i = 1; i < ends.length; i++) if (ends[i].yy - ends[i - 1].yy < 15) ends[i].yy = ends[i - 1].yy + 15;
for (const { s, yy } of ends) {
  out.push(`<text x="${plot.right + 10}" y="${r1(yy + 4)}" font-size="12" font-weight="600" fill="${C.ink}">${esc(s.label)} <tspan font-weight="400" fill="${C.secondary}">${fmt(rows.at(-1)![s.key])}</tspan></text>`);
}

// Two annotations: the largest single value of each of heat and tornado.
const peak = (key: "heat" | "tornado") => rows.reduce((a, b) => (b[key] > a[key] ? b : a));
const ph = peak("heat"), pt = peak("tornado");
out.push(`<text x="${r1(x(ph.year) - 8)}" y="${r1(y(ph.heat) - 2)}" font-size="12" text-anchor="end" fill="${C.ink}">${ph.year}: ${fmt(ph.heat)} heat deaths</text>`);
out.push(`<text x="${r1(x(pt.year) - 8)}" y="${r1(y(pt.tornado) + 4)}" font-size="12" text-anchor="end" fill="${C.ink}">${pt.year}: ${fmt(pt.tornado)} tornado deaths (Joplin, April outbreak)</text>`);

out.push(`</svg>`);
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`wrote ${OUT.slice(OUT.indexOf("site/"))} (${rows.length} years)`);
