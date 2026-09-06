// Regenerate the SVG charts embedded in planetary-boundaries.md.
//   node planetary-boundaries-make-charts.mjs
// Reads the archived source snapshot in planetary-boundaries-src/; writes *.svg
// next to this file. Hand-rolled SVG on purpose — see the friction notes in
// planetary-boundaries-outline.md.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "planetary-boundaries-src");

const EXCEEDED = "#dc2626";
const SAFE = "#16a34a";
const LINE = "#2563eb";
const TEXT = "#6b7280";
const AXIS = "#9ca3af";
const INK = "#111827";

function parseCsv(file) {
  const [head, ...rows] = readFileSync(join(SRC, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v])));
}

// --- Chart 1: the scoreboard ---------------------------------------------------
// Framework normalisation (Steffen et al. 2015, "wagon wheel"):
//   x = (current - preindustrial) / (boundary - preindustrial)
// Pre-industrial (Holocene) = 0, the boundary = 1, x > 1 = outside the safe
// operating space. Direction is handled automatically: for indicators where
// less is worse (ocean acidification, ozone, forest cover) both the numerator
// and denominator are negative, so a safe value still lands below 1.
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
  const rows = parseCsv("boundaries.csv").map((r) => {
    const base = BASELINE[r.id];
    const norm =
      base === undefined
        ? null
        : (Number(r.current_value) - base) / (Number(r.boundary_value) - base);
    return { label: DISPLAY[r.id] ?? r.name, norm, special: base === undefined };
  });

  // Special rows first (novel entities), then quantified rows by descent.
  rows.sort((a, b) => {
    if (a.special !== b.special) return a.special ? -1 : 1;
    return b.norm - a.norm;
  });

  writeFileSync(
    join(HERE, "planetary-boundaries-scoreboard.svg"),
    svgBarChart({
      rows,
      xDomain: [-0.6, 6],
      xTicks: [0, 1, 2, 3, 4, 5, 6],
    }) + "\n",
  );
}

/** Horizontal bar chart with a boundary line at x = 1 and a tinted safe zone. */
function svgBarChart({ rows, xDomain, xTicks, width = 784, rowH = 30 }) {
  const pad = { t: 34, r: 58, b: 40, l: 176 };
  const ih = rows.length * rowH;
  const height = pad.t + ih + pad.b;
  const iw = width - pad.l - pad.r;
  const [x0, x1] = xDomain;
  const sx = (x) => pad.l + ((Math.max(x0, Math.min(x1, x)) - x0) / (x1 - x0)) * iw;
  const p = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12">`,
  ];
  // safe operating space
  p.push(
    `<rect x="${sx(x0)}" y="${pad.t}" width="${sx(1) - sx(x0)}" height="${ih}" fill="${SAFE}" fill-opacity="0.08"/>`,
  );
  for (const t of xTicks) {
    p.push(
      `<line x1="${sx(t)}" y1="${pad.t}" x2="${sx(t)}" y2="${pad.t + ih}" stroke="${AXIS}" stroke-opacity="0.18"/>`,
    );
    p.push(
      `<text x="${sx(t)}" y="${pad.t + ih + 18}" text-anchor="middle" fill="${TEXT}">${t}×</text>`,
    );
  }
  rows.forEach((r, i) => {
    const cy = pad.t + i * rowH + rowH / 2;
    p.push(
      `<text x="${pad.l - 12}" y="${cy + 4}" text-anchor="end" fill="${INK}">${r.label}</text>`,
    );
    if (r.special) {
      p.push(
        `<rect x="${sx(1)}" y="${cy - 8}" width="${sx(x1) - sx(1)}" height="16" fill="${EXCEEDED}" fill-opacity="0.16"/>`,
      );
      p.push(
        `<text x="${sx(1) + 8}" y="${cy + 4}" fill="${EXCEEDED}">beyond — boundary is zero, extent not quantified</text>`,
      );
      return;
    }
    const end = sx(r.norm);
    const zero = sx(0);
    const color = r.norm > 1 ? EXCEEDED : SAFE;
    p.push(
      `<rect x="${Math.min(zero, end)}" y="${cy - 8}" width="${Math.max(1, Math.abs(end - zero))}" height="16" rx="1.5" fill="${color}"/>`,
    );
    const clipped = r.norm > x1;
    p.push(
      `<text x="${(clipped ? sx(x1) : end) + 7}" y="${cy + 4}" fill="${color}">${clipped ? "→ " : ""}${r.norm.toFixed(1)}×</text>`,
    );
  });
  p.push(
    `<line x1="${sx(1)}" y1="${pad.t - 8}" x2="${sx(1)}" y2="${pad.t + ih}" stroke="${INK}" stroke-width="1.5"/>`,
  );
  p.push(
    `<text x="${sx(1)}" y="${pad.t - 12}" text-anchor="middle" fill="${INK}">planetary boundary (1×)</text>`,
  );
  p.push(
    `<text x="${sx(x0) + 4}" y="${pad.t + ih + 18}" fill="${SAFE}">← safe operating space</text>`,
  );
  p.push("</svg>");
  return p.join("\n");
}

// --- Chart 2: ozone, dipping and recovering ----------------------------------
{
  const oz = parseCsv("boundary-evolution.csv")
    .filter((r) => r.boundary_id === "3.0")
    .map((r) => [Number(r.year), Number(r.value)])
    .filter(([y]) => y >= 1900)
    .sort((a, b) => a[0] - b[0]);
  writeFileSync(
    join(HERE, "planetary-boundaries-ozone.svg"),
    svgLineChart({
      series: [{ points: oz, stroke: LINE, width: 2, dots: true }],
      xDomain: [1900, 2030],
      yDomain: [270, 300],
      xTicks: [1900, 1930, 1960, 1990, 2020],
      yTicks: [270, 276, 282, 288, 294, 300],
      xLabel: "Year",
      yLabel: "Stratospheric ozone (Dobson units)",
      refs: [{ y: 276, label: "boundary — 276 DU", color: EXCEEDED }],
      marks: [{ x: 1987, label: "Montreal Protocol" }],
    }) + "\n",
  );
}

/** Generic line chart. series: [{points:[[x,y]...], stroke, width, dots}].
 *  refs: [{y,label,color}]. marks: [{x,label}] (vertical). */
function svgLineChart({
  width = 720,
  height = 380,
  series,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  refs = [],
  marks = [],
}) {
  const m = { t: 16, r: 16, b: 44, l: 64 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;
  const sx = (x) => m.l + ((x - x0) / (x1 - x0)) * iw;
  const sy = (y) => m.t + ih - ((y - y0) / (y1 - y0)) * ih;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12">`,
  ];
  // shade below the boundary (the depleted side)
  for (const r of refs) {
    parts.push(
      `<rect x="${m.l}" y="${sy(r.y)}" width="${iw}" height="${m.t + ih - sy(r.y)}" fill="${r.color}" fill-opacity="0.06"/>`,
    );
  }
  for (const t of yTicks) {
    parts.push(
      `<line x1="${m.l}" y1="${sy(t)}" x2="${m.l + iw}" y2="${sy(t)}" stroke="${AXIS}" stroke-opacity="0.25"/>`,
    );
    parts.push(`<text x="${m.l - 8}" y="${sy(t) + 4}" text-anchor="end" fill="${TEXT}">${t}</text>`);
  }
  for (const t of xTicks) {
    parts.push(
      `<text x="${sx(t)}" y="${m.t + ih + 20}" text-anchor="middle" fill="${TEXT}">${t}</text>`,
    );
  }
  parts.push(
    `<text x="${m.l + iw / 2}" y="${height - 6}" text-anchor="middle" fill="${TEXT}">${xLabel}</text>`,
  );
  parts.push(
    `<text transform="translate(16 ${m.t + ih / 2}) rotate(-90)" text-anchor="middle" fill="${TEXT}">${yLabel}</text>`,
  );
  for (const mk of marks) {
    parts.push(
      `<line x1="${sx(mk.x)}" y1="${m.t}" x2="${sx(mk.x)}" y2="${m.t + ih}" stroke="${TEXT}" stroke-dasharray="3 3"/>`,
    );
    parts.push(
      `<text x="${sx(mk.x) + 5}" y="${m.t + 12}" fill="${TEXT}">${mk.label}</text>`,
    );
  }
  for (const r of refs) {
    parts.push(
      `<line x1="${m.l}" y1="${sy(r.y)}" x2="${m.l + iw}" y2="${sy(r.y)}" stroke="${r.color}" stroke-dasharray="4 4" stroke-opacity="0.85"/>`,
    );
    parts.push(
      `<text x="${m.l + iw - 4}" y="${sy(r.y) - 5}" text-anchor="end" fill="${r.color}">${r.label}</text>`,
    );
  }
  for (const s of series) {
    const d = s.points
      .map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`)
      .join(" ");
    parts.push(`<path d="${d}" fill="none" stroke="${s.stroke}" stroke-width="${s.width}"/>`);
    if (s.dots) {
      for (const [x, y] of s.points) {
        parts.push(`<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="${s.stroke}"/>`);
      }
    }
  }
  parts.push("</svg>");
  return parts.join("\n");
}
