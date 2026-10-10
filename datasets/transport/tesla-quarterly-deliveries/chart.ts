// Renders the quarterly totals as a static SVG for the worked example on the site:
//   node chart.ts   (after node build.ts; offline, no dependencies)
// Reads data/tesla-quarterly-totals.csv and writes
// site/docs/examples/tesla-quarterly-deliveries.svg. Deterministic: same CSV, same bytes.
// The DataHub dataset page draws the same series from the "views" entry in datapackage.json.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "..", "site", "docs", "examples", "tesla-quarterly-deliveries.svg");

// Reference palette from the dataviz skill: categorical slots 1 and 2 on the light surface.
const C = {
  surface: "#fcfcfb", ink: "#0b0b0b", secondary: "#52514e", muted: "#898781",
  grid: "#e1e0d9", axis: "#c3c2b7", deliveries: "#2a78d6", production: "#eb6834",
};

interface Q { start: string; end: string; deliveries: number; production: number }

const [header, ...lines] = readFileSync(join(HERE, "data", "tesla-quarterly-totals.csv"), "utf8").trim().split("\n");
const cols = header.split(",");
const rows: Q[] = lines.map((line) => {
  const v = Object.fromEntries(line.split(",").map((x, i) => [cols[i], x]));
  return { start: v.period_start, end: v.period_end, deliveries: Number(v.deliveries), production: Number(v.production) };
});
if (rows.length < 2 || rows.some((r) => !Number.isInteger(r.deliveries) || !Number.isInteger(r.production))) {
  throw new Error("tesla-quarterly-totals.csv is empty or has a non-integer figure; run node build.ts first");
}

const label = (r: Q) => `Q${(Number(r.start.slice(5, 7)) + 2) / 3} ${r.start.slice(0, 4)}`;
const fmt = (n: number) => n.toLocaleString("en-GB");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const W = 820, H = 440;
const plot = { left: 64, right: W - 185, top: 112, bottom: H - 56 };
const yMax = Math.ceil(Math.max(...rows.flatMap((r) => [r.deliveries, r.production])) / 100_000) * 100_000;
const x = (i: number) => plot.left + (i / (rows.length - 1)) * (plot.right - plot.left);
const y = (v: number) => plot.bottom - (v / yMax) * (plot.bottom - plot.top);
const r1 = (n: number) => Math.round(n * 10) / 10;

const first = rows[0], last = rows[rows.length - 1];
const peakIdx = rows.reduce((best, r, i) => (r.deliveries > rows[best].deliveries ? i : best), 0);
const peak = rows[peakIdx];

const out: string[] = [];
const text = (tx: number, ty: number, s: string, attrs = "") =>
  out.push(`<text x="${r1(tx)}" y="${r1(ty)}" ${attrs}>${esc(s)}</text>`);

const title = "Tesla vehicles delivered and produced per quarter";
const subtitle = `${label(first)} to ${label(last)}, total across all models, as first reported in Tesla's SEC filings`;
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" font-family="system-ui, -apple-system, sans-serif">`);
out.push(`<title>${esc(`${title}, ${subtitle}. Deliveries rose from ${fmt(first.deliveries)} in ${label(first)} to a peak of ${fmt(peak.deliveries)} in ${label(peak)}; ${label(last)} deliveries were ${fmt(last.deliveries)} and production ${fmt(last.production)}.`)}</title>`);
out.push(`<rect width="${W}" height="${H}" fill="${C.surface}"/>`);
text(20, 32, title, `font-size="20" font-weight="600" fill="${C.ink}"`);
text(20, 56, subtitle, `font-size="13" fill="${C.secondary}"`);

// Legend, so identity never rests on colour alone; the lines are direct-labelled too.
const legend: [string, string][] = [["Deliveries", C.deliveries], ["Production", C.production]];
legend.forEach(([name, colour], i) => {
  const lx = 20 + i * 120;
  out.push(`<line x1="${lx}" y1="76" x2="${lx + 18}" y2="76" stroke="${colour}" stroke-width="2" stroke-linecap="round"/>`);
  text(lx + 24, 80, name, `font-size="13" fill="${C.secondary}"`);
});

// Recessive grid and y axis, in vehicles (thousands).
for (let v = 0; v <= yMax; v += 100_000) {
  out.push(`<line x1="${plot.left}" y1="${r1(y(v))}" x2="${plot.right}" y2="${r1(y(v))}" stroke="${v === 0 ? C.axis : C.grid}" stroke-width="1"/>`);
  text(plot.left - 8, y(v) + 4, v === 0 ? "0" : `${v / 1000}k`, `font-size="12" fill="${C.muted}" text-anchor="end"`);
}
// One x tick per year, at its first quarter.
rows.forEach((r, i) => {
  if (r.start.slice(5) !== "01-01") return;
  out.push(`<line x1="${r1(x(i))}" y1="${plot.bottom}" x2="${r1(x(i))}" y2="${plot.bottom + 5}" stroke="${C.axis}" stroke-width="1"/>`);
  text(x(i), plot.bottom + 20, r.start.slice(0, 4), `font-size="12" fill="${C.muted}" text-anchor="middle"`);
});

// Lines: production first so deliveries, the headline measure, draws on top.
for (const [metric, colour] of [["production", C.production], ["deliveries", C.deliveries]] as const) {
  const d = rows.map((r, i) => `${i ? "L" : "M"}${r1(x(i))},${r1(y(r[metric]))}`).join("");
  out.push(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
}

// Selective labels: the delivery peak and both latest values. Nothing on every point.
out.push(`<circle cx="${r1(x(peakIdx))}" cy="${r1(y(peak.deliveries))}" r="4" fill="${C.deliveries}" stroke="${C.surface}" stroke-width="2"/>`);
text(x(peakIdx) - 8, y(peak.deliveries) - 10, `Peak: ${fmt(peak.deliveries)} delivered, ${label(peak)}`, `font-size="12" fill="${C.ink}" text-anchor="end"`);
const ends = [
  { name: "Deliveries", v: last.deliveries, colour: C.deliveries },
  { name: "Production", v: last.production, colour: C.production },
].sort((a, b) => b.v - a.v);
const endY = ends.map((e) => y(e.v));
if (endY[1] - endY[0] < 34) { const mid = (endY[0] + endY[1]) / 2; endY[0] = mid - 17; endY[1] = mid + 17; }
ends.forEach((e, i) => {
  out.push(`<circle cx="${r1(x(rows.length - 1))}" cy="${r1(y(e.v))}" r="4" fill="${e.colour}" stroke="${C.surface}" stroke-width="2"/>`);
  text(plot.right + 10, endY[i] - 2, `${e.name}, ${label(last)}`, `font-size="12" fill="${C.secondary}"`);
  text(plot.right + 10, endY[i] + 13, fmt(e.v), `font-size="12" font-weight="600" fill="${C.ink}"`);
});

text(20, H - 14, "Source: Tesla Form 8-K Exhibit 99.1 via SEC EDGAR. Data: datasets/transport/tesla-quarterly-deliveries (PDDL-1.0).", `font-size="11" fill="${C.muted}"`);
out.push("</svg>");

const svg = out.join("\n") + "\n";
if (svg.includes("NaN")) throw new Error("non-finite chart geometry");
writeFileSync(OUT, svg);
console.log(`wrote ${OUT}`);
