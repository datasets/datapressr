// Regenerate the SVG charts embedded in solar-overtakes-wind.md.
//   npm ci && node solar-overtakes-wind-make-charts.mjs
//
// Implements the approved chart plan in solar-overtakes-wind-outline.md
// (revision 3, round 3 APPROVED). See charting.md in skills/story/references/.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "energy-and-commodities", "global-electricity-mix", "data");
const { window } = new JSDOM("");
const document = window.document;

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

/** Rows of global-electricity-mix.csv between two years, inclusive, as numbers. */
function series(from, to) {
  const [head, ...lines] = readFileSync(join(DATA, "global-electricity-mix.csv"), "utf8").trim().split("\n");
  const cols = head.split(",");
  return lines
    .map((l) => l.split(","))
    .map((c) => Object.fromEntries(cols.map((name, i) => [name, c[i] === "" ? null : Number(c[i])])))
    .filter((r) => r.year >= from && r.year <= to);
}

/** The row for one year; throws so a missing annotation fails the build. */
function on(rows, year) {
  const row = rows.find((r) => r.year === year);
  if (!row) throw new Error(`no row for ${year}`);
  return row;
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

function write(name, node) {
  const svg = toSvg(node) + "\n";
  if (/NaN|Infinity|undefined|=>/.test(svg)) {
    throw new Error(`${name}: built SVG contains a forbidden token (NaN/Infinity/undefined/=>)`);
  }
  writeFileSync(join(HERE, name), svg);
  console.log(`wrote ${name}`);
}

// --- Chart 1: solar's share of world electricity generation, 1985-2025 --------
{
  const rows = series(1985, 2025);
  const y2015 = on(rows, 2015);
  const y2025 = on(rows, 2025);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Solar share of world electricity generation (%)", labelArrow: "none", grid: true, domain: [0, 9.5] },
    marks: [
      Plot.line(rows, { x: "year", y: "solar_share_elec_pct", stroke: LINE, strokeWidth: 2 }),
      Plot.dot([y2015, y2025], { x: "year", y: "solar_share_elec_pct", fill: HIGHLIGHT, r: 4 }),
      Plot.text([y2015], {
        x: "year",
        y: "solar_share_elec_pct",
        text: (d) => `2015: ${d.solar_share_elec_pct.toFixed(1)}%`,
        dx: -6,
        dy: -10,
        textAnchor: "end",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
      Plot.text([y2025], {
        x: "year",
        y: "solar_share_elec_pct",
        text: (d) => `2025: ${d.solar_share_elec_pct.toFixed(1)}%`,
        dx: -6,
        dy: -12,
        textAnchor: "end",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
    ],
  });
  write("solar-overtakes-wind-share.svg", fig);
}

// --- Chart 2: solar vs wind generation, 2015-2025, with the 2025 crossover ----
{
  const rows = series(2015, 2025);
  const y2024 = on(rows, 2024);
  const y2025 = on(rows, 2025);
  const y2020 = on(rows, 2020);
  const y2021 = on(rows, 2021);
  const windJump2021 = y2021.wind_electricity_twh - y2020.wind_electricity_twh;

  // Headroom above the lines' 2025 peak (2,778.6) is reserved for the 2025
  // value labels, so they sit in clear space above both lines rather than
  // crowding the point where the two lines converge (see charting.md's
  // "labels vs. lines" rule, added after this chart's first draft put two
  // value labels directly on top of the wind line).
  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 56,
    marginRight: 90,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "Electricity generated (TWh)", labelArrow: "none", grid: true, domain: [0, 3500] },
    marks: [
      Plot.line(rows, { x: "year", y: "solar_electricity_twh", stroke: LINE, strokeWidth: 2 }),
      Plot.line(rows, { x: "year", y: "wind_electricity_twh", stroke: LINE2, strokeWidth: 2 }),
      Plot.dot([y2025], { x: "year", y: "solar_electricity_twh", fill: HIGHLIGHT, r: 4 }),
      Plot.dot([y2025], { x: "year", y: "wind_electricity_twh", fill: LINE2, r: 4 }),
      // Both 2025 labels sit well above the domain's data (max 2,778.6),
      // clear of both lines, rather than beside the points where the lines
      // nearly touch.
      Plot.text([y2025], {
        x: "year",
        y: () => 3430,
        text: (d) => `2025: solar ${d.solar_electricity_twh.toFixed(1)} TWh`,
        dx: -6,
        textAnchor: "end",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
      Plot.text([y2025], {
        x: "year",
        y: () => 3260,
        text: (d) => `2025: wind ${d.wind_electricity_twh.toFixed(1)} TWh`,
        dx: -6,
        textAnchor: "end",
        fill: LINE2,
        fontWeight: "bold",
      }),
      Plot.text([y2024], {
        x: "year",
        y: "wind_electricity_twh",
        text: (d) =>
          `2024: wind ${d.wind_electricity_twh.toFixed(1)}, solar ${on(rows, 2024).solar_electricity_twh.toFixed(1)} TWh (wind still ahead)`,
        dx: -8,
        dy: 20,
        textAnchor: "end",
        fill: INK,
      }),
      Plot.dot([y2021], { x: "year", y: "wind_electricity_twh", fill: LINE2, r: 4 }),
      Plot.text([y2021], {
        x: "year",
        y: "wind_electricity_twh",
        text: () => `wind's biggest one-year rise: +${windJump2021.toFixed(1)} TWh (2021)`,
        dx: 6,
        dy: -22,
        textAnchor: "start",
        fill: LINE2,
      }),
    ],
  });
  write("solar-overtakes-wind-vs-wind.svg", fig);
}

// --- Chart 3: 2025's generation growth, solar's share of it -------------------
{
  const rows = series(2024, 2025);
  const y2024 = on(rows, 2024);
  const y2025 = on(rows, 2025);
  const totalGrowth = y2025.electricity_generation_twh - y2024.electricity_generation_twh;
  const solarGrowth = y2025.solar_electricity_twh - y2024.solar_electricity_twh;
  const otherGrowth = totalGrowth - solarGrowth;
  const solarPct = (100 * solarGrowth) / totalGrowth;

  const bar = [
    { segment: "Solar", value: solarGrowth, order: 0, fill: LINE },
    { segment: "Everything else", value: otherGrowth, order: 1, fill: LINE2 },
  ];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 260,
    marginLeft: 20,
    marginRight: 160,
    marginTop: 40,
    marginBottom: 40,
    style: FONT,
    x: { axis: null, domain: [0, totalGrowth] },
    y: { axis: null, domain: [0, 1] },
    marks: [
      Plot.rect(bar, {
        x1: (d) => (d.order === 0 ? 0 : solarGrowth),
        x2: (d) => (d.order === 0 ? solarGrowth : totalGrowth),
        y1: 0.4,
        y2: 0.6,
        fill: "fill",
      }),
      Plot.text([{ x: solarGrowth / 2 }], {
        x: "x",
        y: 0.5,
        text: () => `Solar\n+${solarGrowth.toFixed(1)} TWh`,
        fill: "white",
        fontWeight: "bold",
        lineAnchor: "middle",
      }),
      Plot.text([{ x: solarGrowth + otherGrowth / 2 }], {
        x: "x",
        y: 0.5,
        text: () => `Everything else\n+${otherGrowth.toFixed(1)} TWh`,
        fill: INK,
        lineAnchor: "middle",
      }),
      Plot.text([{ x: totalGrowth }], {
        x: "x",
        y: 0.5,
        text: () => `2025 total: +${totalGrowth.toFixed(1)} TWh`,
        dx: -4,
        dy: -56,
        textAnchor: "end",
        fill: INK,
        fontWeight: "bold",
      }),
      Plot.text([{ x: solarGrowth / 2 }], {
        x: "x",
        y: 0.5,
        text: () => `${solarPct.toFixed(1)}% of 2025's generation growth`,
        dy: -56,
        textAnchor: "middle",
        fill: HIGHLIGHT,
        fontWeight: "bold",
      }),
    ],
  });
  write("solar-overtakes-wind-growth-share.svg", fig);
}

// --- Chart 4: fossil's shrinking (but still majority) share, 1985 vs 2025 -----
{
  const y1985 = on(series(1985, 1985), 1985);
  const y2025 = on(series(2025, 2025), 2025);
  const bars = [
    { year: "1985", value: y1985.fossil_share_elec_pct },
    { year: "2025", value: y2025.fossil_share_elec_pct },
  ];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 320,
    marginLeft: 52,
    marginRight: 24,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, type: "band", padding: 0.55 },
    y: { label: "Fossil fuels' share of world electricity generation (%)", labelArrow: "none", grid: true, domain: [0, 70] },
    marks: [
      Plot.barY(bars, { x: "year", y: "value", fill: LINE2 }),
      Plot.text(bars, {
        x: "year",
        y: "value",
        text: (d) => `${d.value.toFixed(1)}%`,
        dy: -8,
        fill: INK,
        fontWeight: "bold",
      }),
    ],
  });
  write("solar-overtakes-wind-fossil-share.svg", fig);
}
