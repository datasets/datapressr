// Regenerate the SVG charts embedded in oil-below-zero.md.
//   npm ci && node oil-below-zero-make-charts.mjs
//
// Implements the chart plan in oil-below-zero-outline.md. Every annotated value
// is read from the CSV rows; a missing row fails the build.

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
const LINE2_TEXT = "#6b7280";
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

/** US dollars with a true minus sign: -36.98 → "−$36.98". */
const usd = (v) => `${v < 0 ? "−" : ""}$${Math.abs(v).toFixed(2)}`;

const utc = (iso) => new Date(`${iso}T00:00:00Z`);

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

// --- Chart 1: only WTI went below zero, for one day, after a fall both shared --
{
  const wti = series("wti-daily.csv", "Date", "Price", "2020-01-02", "2020-06-30");
  const brent = series("brent-daily.csv", "Date", "Price", "2020-01-02", "2020-06-30");
  const day = (iso) => ({ iso, date: utc(iso), wti: on(wti, iso).value, brent: on(brent, iso).value });
  const start = day("2020-01-02");
  const fri = day("2020-04-17");
  const mon = day("2020-04-20");
  const tue = day("2020-04-21");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 24,
    marginTop: 36,
    marginBottom: 40,
    style: FONT,
    x: { label: null, domain: [utc("2020-01-01"), utc("2020-06-30")] },
    y: { label: "US$ per barrel (daily spot, nominal)", labelArrow: "none", grid: true, domain: [-50, 80] },
    marks: [
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),
      Plot.line(brent, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      // Start labels double as series names. Fixed heights keep them clear of
      // their lines: Brent peaks at $70.25 and WTI dips to $49.59 under the text.
      Plot.text([start], { x: "date", y: 76, text: (d) => `Brent, 2 Jan: ${usd(d.brent)}`, textAnchor: "start", fill: LINE2_TEXT, fontWeight: "bold" }),
      Plot.text([start], { x: "date", y: 43, text: (d) => `WTI, 2 Jan: ${usd(d.wti)}`, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      // Friday 17 April: label above the lines, with a leader down to the dots.
      Plot.ruleX([fri], { x: "date", y1: (d) => d.brent + 2, y2: 38, stroke: LINE2, strokeWidth: 1 }),
      Plot.text([fri], { x: "date", y: 40, text: (d) => `Fri 17 Apr\nWTI ${usd(d.wti)}\nBrent ${usd(d.brent)}`, dx: -4, textAnchor: "end", lineAnchor: "bottom", fill: INK }),
      // Monday 20 April: the negative print.
      Plot.text([mon], { x: "date", y: "wti", text: (d) => `Mon 20 Apr\nWTI ${usd(d.wti)}\nBrent ${usd(d.brent)}`, dx: 9, textAnchor: "start", lineAnchor: "middle", fill: HIGHLIGHT, fontWeight: "bold" }),
      // Tuesday 21 April: both back near $9, below the zero line.
      Plot.text([tue], { x: "date", y: -3, text: (d) => `Tue 21 Apr\nWTI ${usd(d.wti)}\nBrent ${usd(d.brent)}`, dx: 9, textAnchor: "start", lineAnchor: "top", fill: INK }),
      Plot.dot([fri, mon, tue], { x: "date", y: "brent", fill: LINE2, r: 3.5 }),
      Plot.dot([fri, tue], { x: "date", y: "wti", fill: LINE, r: 3.5 }),
      Plot.dot([mon], { x: "date", y: "wti", fill: HIGHLIGHT, r: 4.5 }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-daily.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: the negative day disappears once WTI is averaged -----------------
{
  const daily = series("wti-daily.csv", "Date", "Price", "2020-03-02", "2020-05-29");
  // The week ending 2020-02-28 is only the left edge of the first step.
  const weekly = series("wti-weekly.csv", "Date", "Price", "2020-02-28", "2020-05-29");
  // EIA dates each monthly average to the 15th; draw it across the whole month.
  const monthly = series("wti-monthly.csv", "Date", "Price", "2020-03-15", "2020-05-15").map((r) => ({
    ...r,
    from: new Date(Date.UTC(r.date.getUTCFullYear(), r.date.getUTCMonth(), 1)),
    to: new Date(Date.UTC(r.date.getUTCFullYear(), r.date.getUTCMonth() + 1, 1)),
  }));
  const neg = on(daily, "2020-04-20");
  const week = on(weekly, "2020-04-24");
  const april = on(monthly, "2020-04-15");
  const keyX = utc("2020-04-15");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 380,
    marginLeft: 52,
    marginRight: 24,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, domain: [utc("2020-03-01"), utc("2020-05-31")] },
    y: { label: "WTI, US$ per barrel (spot, nominal)", labelArrow: "none", grid: true, domain: [-45, 55] },
    marks: [
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),
      Plot.line(daily, { x: "date", y: "value", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(weekly, { x: "date", y: "value", stroke: LINE, strokeWidth: 2.5, curve: "step-before", clip: true }),
      Plot.ruleY(monthly, { x1: "from", x2: "to", y: "value", stroke: INK, strokeWidth: 2.5, clip: true }),
      Plot.dot([neg], { x: "date", y: "value", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([neg], { x: "date", y: "value", text: (d) => `Daily, Mon 20 Apr: ${usd(d.value)}`, dx: 9, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      // Key, in the empty space below zero; colours match the lines.
      Plot.text([week], { x: () => keyX, y: -12, text: (d) => `Weekly average, week ending Fri 24 Apr: ${usd(d.value)}`, textAnchor: "end", fill: LINE, fontWeight: "bold" }),
      Plot.text([april], { x: () => keyX, y: -22, text: (d) => `Monthly average, April: ${usd(d.value)}`, textAnchor: "end", fill: INK, fontWeight: "bold" }),
      Plot.text([daily[0]], { x: () => keyX, y: -32, text: () => "Daily spot price", textAnchor: "end", fill: LINE2_TEXT, fontWeight: "bold" }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-averages.svg"), toSvg(fig) + "\n");
}

console.log("wrote oil-below-zero-daily.svg, oil-below-zero-averages.svg");
