// Regenerate the SVG charts embedded in oil-below-zero.md.
//   npm ci && node oil-below-zero-make-charts.mjs
//
// Implements the chart plan in oil-below-zero-outline.md. Every annotated value
// is read from the oil-prices CSVs; a missing row fails the build.

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

/** A point at a date and value that is not a data row (label anchors, segment ends). */
const at = (iso, value) => ({ iso, date: new Date(`${iso}T00:00:00Z`), value });

/** $18.31, −$36.98 (true minus sign). */
const usd = (v) => `${v < 0 ? "−" : ""}$${Math.abs(v).toFixed(2)}`;

/** Whole-percent change, signed with a true minus. */
const pct = (from, to) => {
  const p = Math.round((to / from - 1) * 100);
  return `${p < 0 ? "−" : "+"}${Math.abs(p)}%`;
};

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

// --- Chart 1: both benchmarks fell together; only WTI went below zero -------
{
  const wti = series("wti-daily.csv", "Date", "Price", "2020-01-02", "2020-06-30");
  const brent = series("brent-daily.csv", "Date", "Price", "2020-01-02", "2020-06-30");

  const wJan = on(wti, "2020-01-06");
  const bJan = on(brent, "2020-01-06");
  const wFri = on(wti, "2020-04-17");
  const bFri = on(brent, "2020-04-17");
  const wNeg = on(wti, "2020-04-20");
  const bNeg = on(brent, "2020-04-20");
  const wNext = on(wti, "2020-04-21");
  const bNext = on(brent, "2020-04-21");
  const gap = Math.round((bNeg.value - wNeg.value) * 100) / 100;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 440,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 28,
    marginBottom: 36,
    style: FONT,
    x: { label: null, domain: [at("2020-01-01").date, at("2020-06-30").date] },
    y: { label: "US$ per barrel (daily spot, nominal)", labelArrow: "none", grid: true, domain: [-50, 80] },
    marks: [
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),
      Plot.line(brent, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),

      // Series names at the line ends.
      Plot.text([brent.at(-1)], { x: "date", y: "value", text: () => "Brent", dx: 6, dy: -7, textAnchor: "start", fill: LINE2_TEXT, fontWeight: "bold" }),
      Plot.text([wti.at(-1)], { x: "date", y: "value", text: () => "WTI", dx: 6, dy: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),

      // 6 January: 2020's highest daily price for both.
      Plot.dot([bJan], { x: "date", y: "value", fill: LINE2_TEXT, r: 3.5 }),
      Plot.dot([wJan], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.text([bJan], { x: "date", y: "value", text: () => `6 Jan: Brent ${usd(bJan.value)}, WTI ${usd(wJan.value)}`, dx: -4, dy: -12, textAnchor: "start", fill: INK }),

      // 17 April: the last trading day before the plunge.
      Plot.dot([bFri], { x: "date", y: "value", fill: LINE2_TEXT, r: 3.5 }),
      Plot.dot([wFri], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.ruleX([wFri], { x: "date", y1: Math.max(wFri.value, bFri.value) + 3, y2: 41, stroke: LINE2, strokeWidth: 1 }),
      Plot.text([at("2020-04-17", 49)], {
        x: "date",
        y: "value",
        text: () => `17 Apr: WTI ${usd(wFri.value)} (${pct(wJan.value, wFri.value)} since 6 Jan)\nBrent ${usd(bFri.value)} (${pct(bJan.value, bFri.value)})`,
        textAnchor: "middle",
        fill: INK,
      }),

      // 20 April: WTI below zero; Brent the same day.
      Plot.dot([bNeg], { x: "date", y: "value", fill: LINE2_TEXT, r: 3.5 }),
      Plot.dot([wNeg], { x: "date", y: "value", fill: HIGHLIGHT, r: 4.5 }),
      Plot.text([wNeg], { x: "date", y: "value", text: () => `20 Apr: WTI ${usd(wNeg.value)}`, dx: 9, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([wNeg], { x: "date", y: "value", text: () => `Brent that day: ${usd(bNeg.value)}, ${usd(gap)} higher`, dx: 9, dy: 16, textAnchor: "start", fill: INK }),

      // 21 April: the next day, both near $9.
      Plot.dot([bNext], { x: "date", y: "value", fill: LINE2_TEXT, r: 3.5 }),
      Plot.dot([wNext], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.text([bNext], { x: "date", y: "value", text: () => `21 Apr: Brent ${usd(bNext.value)}, WTI ${usd(wNext.value)}`, dx: 9, dy: 14, textAnchor: "start", fill: INK }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-benchmarks.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: one day below zero; every average stayed above it -------------
{
  const daily = series("wti-daily.csv", "Date", "Price", "2020-03-02", "2020-05-29");
  const weekly = series("wti-weekly.csv", "Date", "Price", "2020-03-06", "2020-05-29");
  const april = on(series("wti-monthly.csv", "Date", "Price", "2020-04-15", "2020-04-15"), "2020-04-15");

  const neg = on(daily, "2020-04-20");
  const next = on(daily, "2020-04-21");
  const wk = on(weekly, "2020-04-24");
  const end = on(daily, "2020-05-29");
  const wkEnd = on(weekly, "2020-05-29");
  // The monthly value is dated the 15th; draw it across the month it averages.
  const aprSpan = [at("2020-04-01", april.value), at("2020-04-30", april.value)];

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 152,
    marginTop: 28,
    marginBottom: 36,
    style: FONT,
    x: { label: null, domain: [at("2020-03-01").date, at("2020-05-29").date] },
    y: { label: "WTI, US$ per barrel (spot, nominal)", labelArrow: "none", grid: true, domain: [-45, 50] },
    marks: [
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),
      Plot.line(daily, { x: "date", y: "value", stroke: LINE, strokeWidth: 1.25 }),
      Plot.line(weekly, { x: "date", y: "value", stroke: INK, strokeWidth: 2.5, curve: "step-before" }),
      Plot.line(aprSpan, { x: "date", y: "value", stroke: LINE2_TEXT, strokeWidth: 2, strokeDasharray: "5,3" }),

      // Series names at the line ends.
      Plot.text([end], { x: "date", y: "value", text: (d) => `daily, 29 May\n${usd(d.value)}`, dx: 6, dy: -14, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([wkEnd], { x: "date", y: "value", text: () => "weekly average", dx: 6, dy: 10, textAnchor: "start", fill: INK, fontWeight: "bold" }),

      // The one negative day, and the day after.
      Plot.dot([neg], { x: "date", y: "value", fill: HIGHLIGHT, r: 4.5 }),
      Plot.dot([next], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.text([neg], { x: "date", y: "value", text: (d) => `20 Apr: ${usd(d.value)}, the only day below zero`, dx: 9, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([neg], { x: "date", y: "value", text: () => `next day: ${usd(next.value)}`, dx: 9, dy: 16, textAnchor: "start", fill: INK }),

      // The averages that contain it.
      Plot.text([wk], { x: "date", y: "value", text: (d) => `week ending 24 Apr: ${usd(d.value)}`, dx: 6, dy: 3, textAnchor: "start", fill: INK }),
      Plot.text([aprSpan[0]], { x: "date", y: "value", text: (d) => `April average\n${usd(d.value)}`, dx: 2, dy: 18, textAnchor: "start", fill: LINE2_TEXT, fontWeight: "bold" }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-averages.svg"), toSvg(fig) + "\n");
}

console.log("wrote oil-below-zero-benchmarks.svg, oil-below-zero-averages.svg");
