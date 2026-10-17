// Regenerate the SVG charts embedded in oil-below-zero.md.
//   npm ci && node oil-below-zero-make-charts.mjs
//
// Implements the approved chart plan in oil-below-zero-outline.md. Every
// annotated value is looked up from the CSV rows; a missing row fails the build.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "datasets", "energy-and-commodities", "oil-prices", "data");
const { window } = new JSDOM("");
const document = window.document;

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

/** Rows of one clean (unquoted) CSV between two ISO dates, inclusive. One call
 * per resource — never join resources by date (see charting.md). */
function series(file, dateCol, valueCol, from, to) {
  const [head, ...lines] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  const di = cols.indexOf(dateCol);
  const vi = cols.indexOf(valueCol);
  return lines
    .map((l) => l.split(","))
    .filter((c) => c[di] >= from && c[di] <= to && c[vi] !== "")
    .map((c) => ({ iso: c[di], date: new Date(`${c[di]}T00:00:00Z`), value: Number(c[vi]) }));
}

/** The row for one date; throws so a missing annotation fails the build. */
function on(rows, iso) {
  const row = rows.find((r) => r.iso === iso);
  if (!row) throw new Error(`no row for ${iso}`);
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

/** US dollars with a true minus sign: −$36.98, $8.91. */
const usd = (v) => `${v < 0 ? "−" : ""}$${Math.abs(v).toFixed(2)}`;

/** Title and subtitle drawn in the top margin. */
function heading(title, subtitle) {
  return [
    Plot.text([title], { frameAnchor: "top-left", dx: -50, dy: -44, fill: INK, fontWeight: "bold", fontSize: 14 }),
    Plot.text([subtitle], { frameAnchor: "top-left", dx: -50, dy: -26, fill: INK }),
  ];
}

// --- Chart 1: only WTI went below zero, and only for one day -----------------
{
  const FROM = "2020-03-02";
  const TO = "2020-05-29";
  const wti = series("wti-daily.csv", "Date", "Price", FROM, TO);
  const brent = series("brent-daily.csv", "Date", "Price", FROM, TO);
  const weekly = series("wti-weekly.csv", "Date", "Price", "2020-04-24", "2020-04-24");

  const w17 = on(wti, "2020-04-17");
  const w20 = on(wti, "2020-04-20");
  const w21 = on(wti, "2020-04-21");
  const w30 = on(wti, "2020-04-30");
  const w31m = on(wti, "2020-03-31");
  const b20 = on(brent, "2020-04-20");
  const b21 = on(brent, "2020-04-21");
  const b31m = on(brent, "2020-03-31");
  const wk24 = on(weekly, "2020-04-24");
  const gap = b20.value - w20.value;

  const note = [
    `31 Mar: Brent ${usd(b31m.value)}, below WTI ${usd(w31m.value)}`,
    `17 Apr: WTI ${usd(w17.value)}`,
    `20 Apr: WTI ${usd(w20.value)}, Brent ${usd(b20.value)}`,
    `20 Apr gap, Brent minus WTI: ${usd(gap)}`,
    `21 Apr: WTI ${usd(w21.value)}, Brent ${usd(b21.value)}`,
    `Week ending 24 Apr: WTI average ${usd(wk24.value)}`,
    `30 Apr: WTI ${usd(w30.value)}`,
  ].join("\n");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 64,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [new Date(`${FROM}T00:00:00Z`), new Date(`${TO}T00:00:00Z`)] },
    y: { label: null, grid: true, domain: [-45, 55] },
    marks: [
      ...heading("Only WTI went below zero, and only for one day", "Daily spot price, US$ per barrel (nominal), Cushing WTI and Brent, March to May 2020"),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(brent, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.text([wti.at(-1)], { x: "date", y: "value", text: () => "WTI", dx: 6, dy: -8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([brent.at(-1)], { x: "date", y: "value", text: () => "Brent", dx: 6, dy: 8, textAnchor: "start", fill: "#6b7280", fontWeight: "bold" }),
      Plot.dot([w31m, w17, w21, w30], { x: "date", y: "value", fill: LINE, r: 3 }),
      Plot.dot([b31m, b20, b21], { x: "date", y: "value", fill: "#6b7280", r: 3 }),
      Plot.dot([w20], { x: "date", y: "value", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([w20], { x: "date", y: "value", text: (d) => `WTI ${usd(d.value)} on 20 April`, dx: 9, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([note], { x: new Date("2020-03-03T00:00:00Z"), y: -8, text: (d) => d, textAnchor: "start", lineAnchor: "top", lineHeight: 1.35, fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-day.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: both benchmarks lost 71% from January to April 2020 ------------
{
  const FROM = "2019-01-15";
  const TO = "2020-12-15";
  const wti = series("wti-monthly.csv", "Date", "Price", FROM, TO);
  const brent = series("brent-monthly.csv", "Date", "Price", FROM, TO);

  const wJan = on(wti, "2020-01-15");
  const wApr = on(wti, "2020-04-15");
  const bJan = on(brent, "2020-01-15");
  const bApr = on(brent, "2020-04-15");
  const pct = (a, b) => `${Math.round(((b.value - a.value) / a.value) * 100)}%`.replace("-", "−");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 64,
    marginBottom: 32,
    style: FONT,
    x: { label: null },
    y: { label: null, grid: true, domain: [0, 80] },
    marks: [
      ...heading("Both benchmarks lost 71% from January to April 2020", "Monthly average spot price, US$ per barrel (nominal), Cushing WTI and Brent, 2019 to 2020"),
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(brent, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.text([wti.at(-1)], { x: "date", y: "value", text: () => "WTI", dx: 6, dy: 7, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([brent.at(-1)], { x: "date", y: "value", text: () => "Brent", dx: 6, dy: -7, textAnchor: "start", fill: "#6b7280", fontWeight: "bold" }),
      Plot.dot([wJan, wApr], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.dot([bJan, bApr], { x: "date", y: "value", fill: "#6b7280", r: 3.5 }),
      Plot.text([bJan], { x: "date", y: "value", text: () => `Jan 2020: Brent ${usd(bJan.value)}, WTI ${usd(wJan.value)}`, dx: 8, dy: -14, textAnchor: "start", fill: INK }),
      Plot.text([wApr], { x: "date", y: "value", text: () => `Apr 2020\nBrent ${usd(bApr.value)} (${pct(bJan, bApr)})\nWTI ${usd(wApr.value)} (${pct(wJan, wApr)})`, dy: 10, lineAnchor: "top", lineHeight: 1.35, fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-months.svg"), toSvg(fig) + "\n");
}

console.log("wrote oil-below-zero-day.svg, oil-below-zero-months.svg");
