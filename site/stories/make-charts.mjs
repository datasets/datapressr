// Regenerate the SVG charts embedded in keeling-curve.md.
//   node make-charts.mjs
// Reads the committed CSVs from the co2-ppm dataset; writes *.svg next to this file.
// Hand-rolled SVG on purpose — see the "friction" note at the end of keeling-curve.md.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "climate-and-environment", "co2-ppm", "data");

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const TEXT = "#6b7280";
const REF = "#dc2626";
const REF2 = "#16a34a";

function parseCsv(file) {
  const [head, ...rows] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v])));
}

/** Generic line chart. series: [{points:[[x,y]...], stroke, width}]. refs: [{y,label,color}]. */
function svgLineChart({ width = 720, height = 380, series, xDomain, yDomain, xTicks, yTicks, xLabel, yLabel, refs = [] }) {
  const m = { t: 16, r: 16, b: 44, l: 56 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;
  const sx = (x) => m.l + ((x - x0) / (x1 - x0)) * iw;
  const sy = (y) => m.t + ih - ((y - y0) / (y1 - y0)) * ih;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12">`,
  );
  // y grid + ticks
  for (const t of yTicks) {
    parts.push(`<line x1="${m.l}" y1="${sy(t)}" x2="${m.l + iw}" y2="${sy(t)}" stroke="${LINE2}" stroke-opacity="0.25"/>`);
    parts.push(`<text x="${m.l - 8}" y="${sy(t) + 4}" text-anchor="end" fill="${TEXT}">${t}</text>`);
  }
  // x ticks
  for (const t of xTicks) {
    parts.push(`<text x="${sx(t)}" y="${m.t + ih + 20}" text-anchor="middle" fill="${TEXT}">${t}</text>`);
  }
  // axis labels
  parts.push(`<text x="${m.l + iw / 2}" y="${height - 6}" text-anchor="middle" fill="${TEXT}">${xLabel}</text>`);
  parts.push(
    `<text transform="translate(14 ${m.t + ih / 2}) rotate(-90)" text-anchor="middle" fill="${TEXT}">${yLabel}</text>`,
  );
  // reference lines
  for (const r of refs) {
    parts.push(
      `<line x1="${m.l}" y1="${sy(r.y)}" x2="${m.l + iw}" y2="${sy(r.y)}" stroke="${r.color}" stroke-dasharray="4 4" stroke-opacity="0.8"/>`,
    );
    parts.push(`<text x="${m.l + iw - 4}" y="${sy(r.y) - 5}" text-anchor="end" fill="${r.color}">${r.label}</text>`);
  }
  // series
  for (const s of series) {
    const d = s.points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");
    parts.push(`<path d="${d}" fill="none" stroke="${s.stroke}" stroke-width="${s.width}"/>`);
  }
  parts.push("</svg>");
  return parts.join("\n");
}

// --- Chart 1: annual Keeling curve, 1959-2025 -------------------------------
{
  const rows = parseCsv("co2-annual-mlo.csv").map((r) => [Number(r.year), Number(r.co2_ppm_mean)]);
  const svg = svgLineChart({
    series: [{ points: rows, stroke: LINE, width: 2 }],
    xDomain: [1959, 2025],
    yDomain: [310, 435],
    xTicks: [1960, 1975, 1990, 2005, 2020],
    yTicks: [320, 340, 360, 380, 400, 420],
    xLabel: "Year",
    yLabel: "CO₂ (ppm)",
    refs: [
      { y: 350, label: "350 ppm", color: REF2 },
      { y: 400, label: "400 ppm (crossed 2015)", color: REF },
    ],
  });
  writeFileSync(join(HERE, "keeling-annual.svg"), svg + "\n");
}

// --- Chart 2: monthly sawtooth vs trend, 2010-present ----------------------
{
  const all = parseCsv("co2-monthly-mlo.csv").filter((r) => r.date >= "2010-01");
  const toX = (d) => Number(d.slice(0, 4)) + (Number(d.slice(5, 7)) - 0.5) / 12;
  const monthly = all.map((r) => [toX(r.date), Number(r.co2_ppm)]);
  const trend = all.map((r) => [toX(r.date), Number(r.co2_ppm_deseasonalized)]);
  const svg = svgLineChart({
    series: [
      { points: monthly, stroke: LINE2, width: 1 },
      { points: trend, stroke: LINE, width: 2 },
    ],
    xDomain: [2010, 2027],
    yDomain: [385, 435],
    xTicks: [2011, 2015, 2019, 2023, 2027],
    yTicks: [390, 400, 410, 420, 430],
    xLabel: "Year",
    yLabel: "CO₂ (ppm)",
  });
  writeFileSync(join(HERE, "keeling-seasonal.svg"), svg + "\n");
}

console.log("wrote keeling-annual.svg, keeling-seasonal.svg");
