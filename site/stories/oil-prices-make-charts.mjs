// Regenerate the SVG charts embedded in oil-prices.md.
//   cd site/stories && npm ci && node oil-prices-make-charts.mjs
//
// Authored with Observable Plot, rendered to static SVG in Node (jsdom supplies
// the DOM). The published page embeds the .svg as a Markdown image — no
// JavaScript runs on it. See docs/charting.md for why Plot.
//
// Reads the committed CSVs from the oil-prices dataset directly (this repo's
// own dataset, not a snapshot). Implements the chart plan in
// oil-prices-outline.md exactly: filter by date, no other transform.

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
const EXCEEDED = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

/** Rows of one resource between two ISO dates (inclusive). Each series keeps
 * its own rows: Brent and WTI trade on different calendars (Brent has no rows
 * on 2020-04-13 or 2020-05-08), so joining them by date would invent gaps. */
function series(file, from, to) {
  const [, ...rows] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  return rows
    .map((r) => r.split(","))
    .filter(([d]) => d >= from && d <= to)
    .map(([d, p]) => ({ iso: d, date: new Date(`${d}T00:00:00Z`), price: Number(p) }));
}

function on(rows, iso) {
  const row = rows.find((r) => r.iso === iso);
  if (!row) throw new Error(`no row for ${iso}`);
  return row;
}

const usd = (v) => (v < 0 ? `-$${Math.abs(v).toFixed(2)}` : `$${v.toFixed(2)}`);

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

// --- Chart 1: Brent vs WTI daily, 1 Mar – 15 May 2020 ------------------------
{
  const wti = series("wti-daily.csv", "2020-03-01", "2020-05-15");
  const brent = series("brent-daily.csv", "2020-03-01", "2020-05-15");
  const wtiNeg = on(wti, "2020-04-20");
  const brentSame = on(brent, "2020-04-20");
  const brentNext = on(brent, "2020-04-21");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: {
      domain: [new Date("2020-03-01T00:00:00Z"), new Date("2020-05-15T00:00:00Z")],
      label: null,
      tickFormat: (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      ticks: 6,
    },
    y: {
      domain: [-45, 60],
      label: "Spot price (US$ per barrel, nominal)",
      labelArrow: "none",
      grid: true,
    },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(brent, { x: "date", y: "price", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "price", stroke: LINE, strokeWidth: 2 }),
      // Direct series labels at the right end instead of a legend.
      Plot.text([brent.at(-1)], { x: "date", y: "price", text: () => "Brent", dx: 6, dy: -8, textAnchor: "start", fill: LINE2, fontWeight: "bold" }),
      Plot.text([wti.at(-1)], { x: "date", y: "price", text: () => "WTI", dx: 6, dy: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.dot([wtiNeg], { x: "date", y: "price", fill: EXCEEDED, r: 4 }),
      Plot.text([wtiNeg], { x: "date", y: "price", text: (d) => `WTI, 20 Apr: ${usd(d.price)}`, dx: 8, textAnchor: "start", fill: EXCEEDED }),
      Plot.dot([brentSame], { x: "date", y: "price", fill: INK, r: 3.5 }),
      Plot.text([brentSame], { x: "date", y: "price", text: (d) => `Brent, 20 Apr: ${usd(d.price)}`, dx: 10, dy: -22, textAnchor: "start", fill: INK }),
      Plot.dot([brentNext], { x: "date", y: "price", fill: INK, r: 3.5 }),
      Plot.text([brentNext], { x: "date", y: "price", text: (d) => `Brent, 21 Apr: ${usd(d.price)}`, dx: 8, dy: 12, textAnchor: "start", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "oil-prices-brent-wti.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: WTI daily vs weekly average, 1 Feb – 1 Jun 2020 ----------------
{
  const from = "2020-02-01";
  const to = "2020-06-01";
  const daily = series("wti-daily.csv", from, to);
  // Weekly values are Mon–Fri means stamped on the Friday ending the week.
  // Start one week early so the first in-window week has a left edge to step
  // from, and draw with step-before so each value spans the week it averages.
  const weekly = series("wti-weekly.csv", "2020-01-31", to);
  const week = on(weekly, "2020-04-24");
  const dailyNeg = on(daily, "2020-04-20");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 16,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: {
      domain: [new Date(`${from}T00:00:00Z`), new Date(`${to}T00:00:00Z`)],
      label: null,
      tickFormat: (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      ticks: 6,
    },
    y: {
      domain: [-45, 60],
      label: "WTI spot price (US$ per barrel, nominal)",
      labelArrow: "none",
      grid: true,
    },
    marks: [
      Plot.ruleY([0], { stroke: INK }),
      Plot.line(daily, { x: "date", y: "price", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(weekly, { x: "date", y: "price", stroke: LINE, strokeWidth: 2.5, curve: "step-before", clip: true }),
      Plot.text([{ date: new Date("2020-02-05T00:00:00Z"), price: -15, l: "Daily" }], { x: "date", y: "price", text: "l", textAnchor: "start", fill: LINE2, fontWeight: "bold" }),
      Plot.text([{ date: new Date("2020-02-05T00:00:00Z"), price: -25, l: "Weekly average (week ending Friday)" }], { x: "date", y: "price", text: "l", textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.dot([dailyNeg], { x: "date", y: "price", fill: EXCEEDED, r: 4 }),
      Plot.text([dailyNeg], { x: "date", y: "price", text: (d) => `Daily, 20 Apr: ${usd(d.price)}`, dx: 8, textAnchor: "start", fill: EXCEEDED }),
      Plot.dot([week], { x: "date", y: "price", fill: LINE, r: 4 }),
      Plot.text([week], { x: "date", y: "price", text: (d) => `Week ending 24 Apr: ${usd(d.price)}`, dx: 8, dy: -10, textAnchor: "start", fill: LINE }),
    ],
  });
  writeFileSync(join(HERE, "oil-prices-daily-weekly.svg"), toSvg(fig) + "\n");
}

console.log("wrote oil-prices-brent-wti.svg, oil-prices-daily-weekly.svg");
