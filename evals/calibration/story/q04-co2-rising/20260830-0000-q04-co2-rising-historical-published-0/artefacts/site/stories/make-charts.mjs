// Regenerate the SVG charts embedded in keeling-curve.md.
//   cd site/stories && npm install && node make-charts.mjs
//
// Authored with Observable Plot, rendered to static SVG in Node (jsdom supplies
// the DOM). The published page embeds the .svg as a Markdown image — no
// JavaScript runs on it. See site/docs/charting.md for why Plot. Ported from the
// original hand-rolled SVG generator (datapressr-8rk) — filenames and the
// annual/seasonal split are unchanged.
//
// Reads the committed CSVs from the co2-ppm dataset directly (this repo's own
// dataset, not a snapshot — same as story #1 originally did).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "climate-and-environment", "co2-ppm", "data");
const { window } = new JSDOM("");
const document = window.document;

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const SAFE = "#16a34a";
const EXCEEDED = "#dc2626";

function parseCsv(file) {
  const [head, ...rows] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v])));
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

// --- Chart 1: annual Keeling curve, with crossings computed from this series -
{
  const rows = parseCsv("co2-annual-mlo.csv").map((r) => ({
    year: Number(r.year),
    ppm: Number(r.co2_ppm_mean),
  }));
  const firstYear = rows[0].year;
  const lastYear = rows.at(-1).year;

  // Crossing = the first *annual mean* at or above the threshold. Computed from
  // this plotted series, not asserted — and labelled "annual mean" explicitly:
  // Mauna Loa first recorded a single *month* at these levels earlier (350 ppm
  // in May 1986, 400 ppm in May 2013) than the annual mean did, so an
  // unqualified date on this chart would be read against the wrong milestone.
  const crossing = (threshold) => rows.find((r) => r.ppm >= threshold);
  const c350 = crossing(350);
  const c400 = crossing(400);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 52,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 40,
    style: { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    x: {
      domain: [firstYear, lastYear],
      label: "Year",
      labelArrow: "none",
      tickFormat: "d",
    },
    y: {
      domain: [310, 435],
      label: "CO₂ (ppm)",
      labelArrow: "none",
      grid: true,
    },
    marks: [
      Plot.ruleY([c350.ppm], { stroke: SAFE, strokeDasharray: "4 4" }),
      Plot.text([{ l: `350 ppm — annual mean, crossed ${c350.year}` }], {
        x: lastYear,
        y: c350.ppm,
        text: "l",
        textAnchor: "end",
        dy: -6,
        fill: SAFE,
      }),
      Plot.ruleY([c400.ppm], { stroke: EXCEEDED, strokeDasharray: "4 4" }),
      Plot.text([{ l: `400 ppm — annual mean, crossed ${c400.year}` }], {
        x: lastYear,
        y: c400.ppm,
        text: "l",
        textAnchor: "end",
        dy: -6,
        fill: EXCEEDED,
      }),
      Plot.line(rows, { x: "year", y: "ppm", stroke: LINE, strokeWidth: 2 }),
    ],
  });
  writeFileSync(join(HERE, "keeling-annual.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: monthly sawtooth vs trend, 2010-present, seasonal extrema marked
{
  const all = parseCsv("co2-monthly-mlo.csv")
    .filter((r) => r.date >= "2010-01")
    .map((r) => ({
      date: r.date,
      year: Number(r.date.slice(0, 4)) + (Number(r.date.slice(5, 7)) - 0.5) / 12,
      ppm: Number(r.co2_ppm),
      trend: Number(r.co2_ppm_deseasonalized),
    }));
  const lastFullYear = String(Number(all.at(-1).date.slice(0, 4)) - (all.at(-1).date.slice(5, 7) === "12" ? 0 : 1));
  const cycle = all.filter((r) => r.date.startsWith(lastFullYear));
  const seasonalHigh = cycle.reduce((a, b) => (b.ppm > a.ppm ? b : a));
  const seasonalLow = cycle.reduce((a, b) => (b.ppm < a.ppm ? b : a));
  const monthName = (d) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 52,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 40,
    style: { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    x: {
      domain: [2010, Math.ceil(all.at(-1).year) + 1],
      label: "Year",
      labelArrow: "none",
      tickFormat: "d",
    },
    y: {
      domain: [385, 435],
      label: "CO₂ (ppm)",
      labelArrow: "none",
      grid: true,
    },
    marks: [
      Plot.line(all, { x: "year", y: "ppm", stroke: LINE2, strokeWidth: 1 }),
      Plot.line(all, { x: "year", y: "trend", stroke: LINE, strokeWidth: 2 }),
      // Anchored "end" with a negative dx rather than centred: the marked point
      // is always the most recent full year, i.e. always near the right edge of
      // a chart that keeps extending rightwards as data is added, so a
      // centred label would eventually run past the frame.
      Plot.dot([seasonalHigh], { x: "year", y: "ppm", fill: INK, r: 3 }),
      Plot.text([{ ...seasonalHigh, l: `seasonal high — ${monthName(seasonalHigh.date)} ${lastFullYear}` }], {
        x: "year",
        y: "ppm",
        text: "l",
        dy: -10,
        dx: -6,
        textAnchor: "end",
        fill: INK,
      }),
      Plot.dot([seasonalLow], { x: "year", y: "ppm", fill: INK, r: 3 }),
      Plot.text([{ ...seasonalLow, l: `seasonal low — ${monthName(seasonalLow.date)} ${lastFullYear}` }], {
        x: "year",
        y: "ppm",
        text: "l",
        dy: 14,
        dx: -6,
        textAnchor: "end",
        fill: INK,
      }),
    ],
  });
  writeFileSync(join(HERE, "keeling-seasonal.svg"), toSvg(fig) + "\n");
}

console.log("wrote keeling-annual.svg, keeling-seasonal.svg");
