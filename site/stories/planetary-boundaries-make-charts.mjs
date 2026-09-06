// Regenerate the SVG charts embedded in planetary-boundaries.md.
//   cd site/stories && npm install && node planetary-boundaries-make-charts.mjs
//
// Authored with Observable Plot, rendered to static SVG in Node (jsdom supplies
// the DOM). The published page embeds the .svg as a Markdown image — no
// JavaScript runs on it. See docs/charting.md for why Plot.
//
// Reads the archived source snapshot in planetary-boundaries-src/.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "planetary-boundaries-src");
const { window } = new JSDOM("");
const document = window.document;

const EXCEEDED = "#dc2626";
const SAFE = "#16a34a";
const LINE = "#2563eb";
const INK = "#111827";

function parseCsv(file) {
  const [head, ...rows] = readFileSync(join(SRC, file), "utf8").trim().split("\n");
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

// --- Chart 1: the scoreboard -------------------------------------------------
// Framework normalisation (Steffen et al. 2015, the "wagon wheel"):
//   x = (current - preindustrial) / (boundary - preindustrial)
// Pre-industrial (Holocene) = 0, the boundary = 1, x > 1 = outside the safe
// operating space. Direction is handled automatically: where less is worse
// (ocean acidification, ozone, forest cover) both numerator and denominator are
// negative, so a safe value still lands below 1.
//
// Pre-industrial baselines are the earliest / designated rows in
// boundary-evolution.csv (cited per row). Novel entities has boundary = 0 and
// baseline = 0, so the ratio is undefined — it is drawn as a "beyond, not
// quantified" row, which is also how the framework treats it.
const BASELINE = {
  "1.0": 280.0, // 1850, ppm CO2
  "2.0": 3.47739013, // 1850, aragonite saturation (Omega)
  "3.0": 284.6, // 1850, Dobson units
  "4.0": 0.03, // 1850, aerosol optical depth
  "5.1": 0.0, // 1850, Tg P / yr
  "5.2": 0.0, // 1850, Tg N / yr
  "6.1": 9.4, // 1869-1890 flat baseline, % ice-free land
  "6.2": 9.8, // 1869-1890 flat baseline, % ice-free land
  "7.0": 100.0, // 1850, % original forest cover remaining
  "8.1": 1.0, // 1850, extinctions per million species-years (Holocene background)
  "8.2": 2.146690518783534, // 1850, % of net primary production appropriated
};

const DISPLAY = {
  "1.0": "Climate change",
  "2.0": "Ocean acidification",
  "3.0": "Stratospheric ozone",
  "4.0": "Atmospheric aerosols",
  "5.1": "Biogeochemical: phosphorus",
  "5.2": "Biogeochemical: nitrogen",
  "6.1": "Freshwater: blue water",
  "6.2": "Freshwater: green water",
  "7.0": "Land-system change",
  "8.1": "Biosphere: genetic diversity",
  "8.2": "Biosphere: functional diversity",
  "9.0": "Novel entities",
};

{
  const XMAX = 6;
  const rows = parseCsv("boundaries.csv").map((r) => {
    const base = BASELINE[r.id];
    const norm =
      base === undefined
        ? null
        : (Number(r.current_value) - base) / (Number(r.boundary_value) - base);
    return { label: DISPLAY[r.id] ?? r.name, norm, special: base === undefined };
  });
  rows.sort((a, b) => {
    if (a.special !== b.special) return a.special ? -1 : 1;
    return b.norm - a.norm;
  });
  const order = rows.map((d) => d.label);
  const quant = rows.filter((d) => !d.special);
  const special = rows.filter((d) => d.special);

  const fig = Plot.plot({
    document,
    width: 780,
    marginLeft: 184,
    marginRight: 56,
    marginTop: 30,
    marginBottom: 44,
    height: 30 + rows.length * 30 + 44,
    style: { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    x: {
      domain: [-0.6, XMAX],
      ticks: [0, 1, 2, 3, 4, 5, 6],
      tickFormat: (d) => `${d}×`,
      label: "distance from the pre-industrial state, in boundary units  (1× = the boundary)",
      labelAnchor: "center",
      labelArrow: "none",
    },
    y: { domain: order, label: null, tickSize: 0, padding: 0.34 },
    marks: [
      Plot.rectX([{ x1: -0.6, x2: 1 }], { x1: "x1", x2: "x2", fill: SAFE, fillOpacity: 0.08 }),
      Plot.text([{ l: "safe operating space" }], {
        text: "l",
        frameAnchor: "bottom-left",
        dx: 4,
        dy: 20,
        fill: SAFE,
        fontSize: 11,
      }),
      Plot.barX(quant, {
        x1: (d) => Math.min(0, d.norm),
        x2: (d) => Math.max(0, d.norm),
        y: "label",
        fill: (d) => (d.norm > 1 ? EXCEEDED : SAFE),
        rx: 1.5,
        clip: true,
      }),
      Plot.text(quant, {
        x: (d) => Math.min(XMAX, d.norm),
        y: "label",
        text: (d) => (d.norm > XMAX ? `→ ${d.norm.toFixed(1)}×` : `${d.norm.toFixed(1)}×`),
        textAnchor: "start",
        dx: 6,
        fill: (d) => (d.norm > 1 ? EXCEEDED : SAFE),
      }),
      Plot.text(special, {
        x: 1,
        y: "label",
        text: () => "beyond — boundary is zero, extent not quantified",
        textAnchor: "start",
        dx: 6,
        fill: EXCEEDED,
      }),
      Plot.ruleX([1], { stroke: INK, strokeWidth: 1.5 }),
      Plot.text([{ l: "planetary boundary" }], {
        x: 1,
        text: "l",
        frameAnchor: "top",
        dy: -14,
        fill: INK,
      }),
    ],
  });
  writeFileSync(join(HERE, "planetary-boundaries-scoreboard.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: ozone, dipping and recovering --------------------------------
{
  const oz = parseCsv("boundary-evolution.csv")
    .filter((r) => r.boundary_id === "3.0")
    .map((r) => ({ year: Number(r.year), du: Number(r.value) }))
    .filter((d) => d.year >= 1900)
    .sort((a, b) => a.year - b.year);

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 52,
    marginRight: 20,
    marginTop: 28,
    marginBottom: 40,
    style: { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    x: {
      domain: [1900, 2030],
      ticks: [1900, 1930, 1960, 1990, 2020],
      tickFormat: "d",
      label: "Year",
      labelArrow: "none",
    },
    y: {
      domain: [270, 300],
      ticks: [270, 276, 282, 288, 294, 300],
      label: "Stratospheric ozone (Dobson units)",
      labelArrow: "none",
      grid: true,
    },
    marks: [
      Plot.rectY([{ y1: 270, y2: 276 }], { y1: "y1", y2: "y2", fill: EXCEEDED, fillOpacity: 0.06 }),
      Plot.ruleY([276], { stroke: EXCEEDED, strokeDasharray: "4 4" }),
      Plot.text([{ l: "boundary — 276 DU" }], {
        y: 276,
        text: "l",
        frameAnchor: "right",
        dx: -4,
        dy: -6,
        fill: EXCEEDED,
      }),
      Plot.ruleX([1987], { stroke: "#6b7280", strokeDasharray: "3 3" }),
      Plot.text([{ l: "Montreal Protocol" }], {
        x: 1987,
        text: "l",
        frameAnchor: "top",
        dx: 5,
        dy: 4,
        textAnchor: "start",
        fill: "#6b7280",
      }),
      Plot.line(oz, { x: "year", y: "du", stroke: LINE, strokeWidth: 2 }),
      Plot.dot(oz, { x: "year", y: "du", fill: LINE, r: 3 }),
    ],
  });
  writeFileSync(join(HERE, "planetary-boundaries-ozone.svg"), toSvg(fig) + "\n");
}

console.log("wrote planetary-boundaries-scoreboard.svg, planetary-boundaries-ozone.svg");
