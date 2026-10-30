// Offline reproduction, from this folder:
// python3 2026-temperature-record-src/calculate.py
// npm ci && node 2026-temperature-record-make-charts.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "2026-temperature-record-src");
const statistics = JSON.parse(readFileSync(join(SRC, "statistics.json"), "utf8"));
const csv = readFileSync(join(SRC, "global-monthly.csv"), "utf8");
assert.equal(createHash("sha256").update(csv).digest("hex"), statistics.source_sha256);
const [header, ...lines] = csv.trim().split(/\r?\n/).filter(line => !line.startsWith("#"));
const fields = header.split(",");
const rows = lines.map(line => Object.fromEntries(line.split(",").map((v, i) => [fields[i], v])));
assert.equal(rows.length, statistics.checks.rows);
assert(rows.every(r => Number.isFinite(Number(r["ano_91-20"]))));
for (let year = 1940; year <= 2025; year++) {
  assert.deepEqual(rows.filter(r => r.month.startsWith(String(year)) && Number(r.month.slice(5, 7)) >= 10).map(r => r.month.slice(5, 7)), ["10", "11", "12"]);
}
const { months, days } = statistics.modes;
function finite(value) {
  if (typeof value === "number") assert(Number.isFinite(value));
  else if (value && typeof value === "object") Object.values(value).forEach(finite);
}
finite(statistics);
const modes = [months, days];
const range = values => [...new Set(values.map(v => v.toFixed(2)))].sort((a, b) => Number(a) - Number(b)).join("–");
const celsius = values => `${range(values)}°C`;
const year = months.q4_record_year;
assert(modes.every(m => m.q4_record_year === year));
const historical = months.q4_history.map((r, i) => {
  assert.equal(days.q4_history[i].year, r.year);
  return { year: r.year, months: r.value, days: days.q4_history[i].value, low: Math.min(r.value, days.q4_history[i].value), high: Math.max(r.value, days.q4_history[i].value) };
});
assert.equal(historical.length, 86);
const record = historical.find(r => r.year === year);
assert(record);
const INK = "#111827", BLUE = "#2563eb", NEUTRAL = "#4b5563", PALE = "#eff6ff";
const { document } = new JSDOM("").window;
const FONT = "Arial, Helvetica, sans-serif";
const common = {
  document, width: 720, style: { fontFamily: FONT, fontSize: "15px", background: "white", color: INK },
  marginLeft: 62, marginRight: 28,
};
function label(svg, x, y, text, { size = 16, fill = INK, weight = "normal" } = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  for (const [key, value] of Object.entries({ x, y, fill, "font-family": FONT, "font-size": size, "font-weight": weight, "text-anchor": "start" })) node.setAttribute(key, String(value));
  node.textContent = text;
  svg.appendChild(node);
}
function save(plot, name, title, description, labels) {
  const svg = plot.tagName.toLowerCase() === "svg" ? plot : plot.querySelector("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${title}. ${description}`);
  for (const [tag, text] of [["title", title], ["desc", description]]) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    el.textContent = text;
    svg.insertBefore(el, svg.firstChild);
  }
  labels.forEach(args => label(svg, ...args));
  const output = svg.outerHTML + "\n";
  assert(!/NaN|Infinity|undefined|=>/.test(output));
  writeFileSync(join(HERE, `2026-temperature-record-${name}.svg`), output);
}
const sourceLabels = y => [
  [20, y, "Data: C3S/ECMWF, ERA5 · September 2026 bulletin snapshot", { size: 13, fill: NEUTRAL }],
  [20, y + 19, "Calculations: DataHub · Modified Copernicus Climate Change Service information 2026.", { size: 12, fill: NEUTRAL }],
];

// 1. All complete historical October–December periods; the strip is a condition.
const lower = Math.floor((Math.min(...historical.map(r => r.low)) - 0.12) * 10) / 10;
const hurdleLow = Math.min(...modes.map(m => m.q4_tie_threshold));
const hurdleHigh = Math.max(...modes.map(m => m.q4_tie_threshold));
const plot1 = Plot.plot({
  ...common, height: 620, marginTop: 128, marginBottom: 142,
  x: { domain: [1940, 2027], ticks: [1940, 1960, 1980, 2000, 2025], tickFormat: String, label: null },
  y: { domain: [lower, hurdleHigh + 0.24], ticks: [-1, -0.5, 0, 0.5, 1], grid: true, label: null, tickFormat: d => `${d > 0 ? "+" : ""}${d.toFixed(1)}` },
  marks: [
    Plot.rect([{ x1: 1940, x2: 2027, y1: hurdleLow, y2: hurdleHigh }], { x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: "#bfdbfe" }),
    Plot.ruleY([0], { stroke: "#9ca3af" }),
    Plot.ruleY([hurdleLow, hurdleHigh], { stroke: BLUE, strokeWidth: 1, strokeDasharray: "5,3" }),
    Plot.ruleX(historical, { x: "year", y1: "low", y2: "high", stroke: NEUTRAL, strokeWidth: 2 }),
    Plot.dot(historical, { x: "year", y: "months", fill: NEUTRAL, r: 2.9 }),
    Plot.dot(historical, { x: "year", y: "days", fill: NEUTRAL, r: 2.9 }),
    Plot.dot([record], { x: "year", y: "months", fill: BLUE, r: 5 }),
    Plot.text([{ x: 1941, y: hurdleHigh + 0.12, text: `Tie hurdle vs 2024: ${celsius(modes.map(m => m.q4_tie_threshold))} · hotter to overtake` }], { x: "x", y: "y", text: "text", textAnchor: "start", fontSize: 16, fontWeight: "bold", fill: BLUE }),
    Plot.text([{ x: 1981, y: record.months - 0.08, text: `${year} maximum: ${celsius(modes.map(m => m.q4_record))}` }], { x: "x", y: "y", text: "text", textAnchor: "start", fontSize: 16, fill: BLUE }),
  ],
});
save(plot1, "hurdle", "2026's final-quarter hurdle is above every previous final quarter", "October–December anomaly, 1940–2025. No 2026 final-quarter observation. The two-rule strip shows averaging choices, not physical uncertainty.", [
  [20, 30, "2026's final-quarter hurdle is above", { size: 23, weight: "bold" }],
  [20, 58, "every previous final quarter", { size: 23, weight: "bold" }],
  [20, 88, "October–December global surface air anomaly · °C above 1991–2020", { size: 16 }],
  [20, 112, "Hurdle strip: equal-month vs day-weighted means; not uncertainty.", { size: 15, fill: NEUTRAL }],
  [20, 522, `${celsius(modes.map(m => m.threshold_minus_q4_record))} above the previous maximum.`, { size: 20, weight: "bold" }],
  [20, 548, "Each historical mark spans both averaging choices; most overlap.", { size: 15, fill: NEUTRAL }],
  ...sourceLabels(583),
]);

// 2. Cumulative averages: actual 2026 ends in September, then a conditional finish.
function cumulative(y) {
  return months.cumulative_recent.filter(r => r.year === y).map(r => {
    const day = days.cumulative_recent.find(d => d.year === y && d.through_month === r.through_month);
    assert(day);
    return { month: r.through_month, value: r.value, low: Math.min(r.value, day.value), high: Math.max(r.value, day.value) };
  });
}
const actual24 = cumulative(2024), actual26 = cumulative(2026);
assert.equal(actual24.length, 12);
assert.equal(actual26.length, 9);
const scenario = [actual26.at(-1), ...months.scenario_cumulative_2026_repeat_2023_q4.map((r, i) => ({ month: r.through_month, value: r.value, low: Math.min(r.value, days.scenario_cumulative_2026_repeat_2023_q4[i].value), high: Math.max(r.value, days.scenario_cumulative_2026_repeat_2023_q4[i].value) }))];
const upper = Math.max(...[...actual24, ...actual26, ...scenario].map(r => r.high)) + 0.16;
const sep24 = modes.map(m => m.cumulative_recent.find(r => r.year === 2024 && r.through_month === 9).value);
const sep26 = modes.map(m => m.ytd_2026);
const rank24 = modes.map(m => m.ytd_ranking_top6.findIndex(r => r.year === 2024) + 1);
const rank26 = modes.map(m => m.ytd_ranking_top6.findIndex(r => r.year === 2026) + 1);
assert(rank24.every(r => r === 1) && rank26.every(r => r === 2));
const gapCeiling = Math.ceil(Math.max(...modes.map(m => m.repeat_q4_2023_shortfall_vs_2024)) * 100) / 100;
const plot2 = Plot.plot({
  ...common, height: 700, marginTop: 136, marginBottom: 265,
  x: { domain: [1, 12.25], ticks: [1, 3, 6, 9, 12], tickFormat: d => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d - 1], label: null },
  y: { domain: [0, upper], ticks: [0, 0.2, 0.4, 0.6, 0.8], grid: true, label: null, tickFormat: d => d.toFixed(1) },
  marks: [
    Plot.rect([{ x1: 9.5, x2: 12.25, y1: 0, y2: upper }], { x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: PALE }),
    Plot.ruleY([0], { stroke: "#9ca3af" }),
    Plot.areaY(actual24, { x: "month", y1: "low", y2: "high", fill: NEUTRAL, fillOpacity: 0.16 }),
    Plot.areaY(actual26, { x: "month", y1: "low", y2: "high", fill: BLUE, fillOpacity: 0.16 }),
    Plot.areaY(scenario, { x: "month", y1: "low", y2: "high", fill: BLUE, fillOpacity: 0.10 }),
    Plot.line(actual24, { x: "month", y: "value", stroke: NEUTRAL, strokeWidth: 2.5 }),
    Plot.line(actual26, { x: "month", y: "value", stroke: BLUE, strokeWidth: 2.5 }),
    Plot.line(scenario, { x: "month", y: "value", stroke: BLUE, strokeWidth: 2.5, strokeDasharray: "6,4" }),
    Plot.dot([actual24[8], actual24.at(-1)], { x: "month", y: "value", fill: NEUTRAL, r: 4 }),
    Plot.dot([actual26.at(-1)], { x: "month", y: "value", fill: BLUE, r: 4 }),
    Plot.dot([scenario.at(-1)], { x: "month", y: "value", stroke: BLUE, fill: "white", strokeWidth: 2, r: 4 }),
    Plot.text([{ x: 1.25, y: actual24[1].high + 0.07, text: "2024 · actual all year" }], { x: "x", y: "y", text: "text", textAnchor: "start", fill: NEUTRAL, fontSize: 16, fontWeight: "bold" }),
    Plot.text([{ x: 1.25, y: actual26[0].value - 0.07, text: "2026 · actual through Sep" }], { x: "x", y: "y", text: "text", textAnchor: "start", fill: BLUE, fontSize: 16, fontWeight: "bold" }),
    Plot.text([{ x: 10.8, y: 0.31, text: "2026 only:" }, { x: 10.8, y: 0.24, text: "hypothetical" }], { x: "x", y: "y", text: "text", fill: BLUE, fontSize: 15 }),
  ],
});
save(plot2, "repeat", "Repeating late 2023 would bring 2026 close to 2024", "Cumulative January-to-month anomalies. The shaded October–December region is hypothetical for 2026 only; 2024 remains actual. Solid lines are equal-month means. Faint envelopes span day-weighted alternatives, not physical uncertainty.", [
  [20, 30, "Repeating late 2023 would bring", { size: 23, weight: "bold" }],
  [20, 58, "2026 close to 2024", { size: 23, weight: "bold" }],
  [20, 88, "Cumulative January-to-month global surface air anomaly", { size: 16 }],
  [20, 112, "°C above 1991–2020 · 2026 observations end in September", { size: 16 }],
  [20, 487, `September: 2024 ${celsius(sep24)} · first Jan–Sep`, { size: 18, fill: NEUTRAL, weight: "bold" }],
  [20, 513, `September: 2026 ${celsius(sep26)} · second Jan–Sep`, { size: 18, fill: BLUE, weight: "bold" }],
  [20, 550, `December: 2024 ${celsius(modes.map(m => m.annual_2024))} · actual`, { size: 18, fill: NEUTRAL, weight: "bold" }],
  [20, 576, `If Oct–Dec repeats ${year}: 2026 ${celsius(modes.map(m => m.repeat_q4_2023_annual_2026))}`, { size: 18, fill: BLUE, weight: "bold" }],
  [20, 606, `Annual gap in that scenario: less than ${gapCeiling.toFixed(2)}°C.`, { size: 18, weight: "bold" }],
  [20, 632, "Faint envelopes: day-weighting sensitivity, not statistical uncertainty.", { size: 14, fill: NEUTRAL }],
  ...sourceLabels(665),
]);
console.log("Wrote two static temperature-story SVGs from checked source statistics.");
