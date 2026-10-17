// Regenerate the SVG charts embedded in oil-below-zero.md.
//   npm ci && node oil-below-zero-make-charts.mjs
//
// Implements the chart plan in oil-below-zero-outline.md. Each resource is read
// on its own rows (no date joins); every annotated value is looked up from the
// CSVs at build time. See skills/story/references/charting.md.

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
const LINE2_TEXT = "#6b7280"; // darker grey so Brent's labels stay legible
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

/** Rows of one clean (unquoted) CSV between two ISO dates, inclusive. */
function series(file, from, to) {
  const [head, ...lines] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  const di = cols.indexOf("Date");
  const vi = cols.indexOf("Price");
  return lines
    .map((l) => l.split(","))
    .filter((c) => c[di] >= from && c[di] <= to && c[vi] !== "")
    .map((c) => ({ iso: c[di], date: day(c[di]), value: Number(c[vi]) }));
}

/** The row for one date; throws so a missing annotation fails the build. */
function on(rows, iso) {
  const row = rows.find((r) => r.iso === iso);
  if (!row) throw new Error(`no row for ${iso}`);
  return row;
}

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const usd = (v) => (v < 0 ? `−$${(-v).toFixed(2)}` : `$${v.toFixed(2)}`);
const tick = (v) => (v < 0 ? `−$${-v}` : `$${v}`);
const fall = (from, to) => `−${Math.round((1 - to.value / from.value) * 100)}%`;

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

// --- Chart 1: only WTI went below zero, for one day -------------------------
{
  const wti = series("wti-daily.csv", "2020-01-02", "2020-06-30");
  const brent = series("brent-daily.csv", "2020-01-02", "2020-06-30");
  const wJan = on(wti, "2020-01-02");
  const bJan = on(brent, "2020-01-02");
  const wApr17 = on(wti, "2020-04-17");
  const bApr17 = on(brent, "2020-04-17");
  const wNeg = on(wti, "2020-04-20");
  const bNeg = on(brent, "2020-04-20");
  const bNext = on(brent, "2020-04-21");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 24,
    marginTop: 36,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [day("2020-01-02"), day("2020-06-30")] },
    y: { label: null, domain: [-45, 80], grid: true, tickFormat: tick },
    marks: [
      Plot.text(["WTI and Brent daily spot prices, 2020 (US$ per barrel, nominal)"], {
        frameAnchor: "top-left", dx: -44, dy: -26, fill: INK, fontWeight: "bold",
      }),
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),
      Plot.line(brent, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(wti, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),

      // Direct series labels at the line ends (Brent above, WTI below).
      Plot.text([brent.at(-1)], { x: "date", y: "value", text: () => "Brent", dy: -12, textAnchor: "end", fill: LINE2_TEXT, fontWeight: "bold" }),
      Plot.text([wti.at(-1)], { x: "date", y: "value", text: () => "WTI", dy: 14, textAnchor: "end", fill: LINE, fontWeight: "bold" }),

      // 2 January starting values.
      Plot.dot([bJan], { x: "date", y: "value", fill: LINE2_TEXT, r: 3 }),
      Plot.dot([wJan], { x: "date", y: "value", fill: LINE, r: 3 }),
      Plot.text([bJan], { x: "date", y: () => 77, text: () => `2 Jan: Brent ${usd(bJan.value)}, WTI ${usd(wJan.value)}`, textAnchor: "start", fill: INK }),

      // 17 April: both about 70% down.
      Plot.ruleX([wApr17], { x: "date", y1: 22, y2: 42, stroke: LINE2, strokeWidth: 1 }),
      Plot.dot([bApr17], { x: "date", y: "value", fill: LINE2_TEXT, r: 3 }),
      Plot.dot([wApr17], { x: "date", y: "value", fill: LINE, r: 3 }),
      Plot.text([wApr17], {
        x: "date",
        y: () => 49,
        text: () => `17 Apr: WTI ${usd(wApr17.value)}, Brent ${usd(bApr17.value)}\n${fall(wJan, wApr17)} and ${fall(bJan, bApr17)} since 2 Jan`,
        textAnchor: "middle",
        fill: INK,
      }),

      // 20 April: WTI below zero; Brent that day and the next.
      Plot.dot([wNeg], { x: "date", y: "value", fill: HIGHLIGHT, r: 4 }),
      Plot.text([wNeg], { x: "date", y: "value", text: () => `20 Apr: WTI ${usd(wNeg.value)}`, dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.dot([bNeg, bNext], { x: "date", y: "value", fill: LINE2_TEXT, r: 3 }),
      Plot.text([bNext], {
        x: "date",
        y: () => -12,
        text: () => `Brent: ${usd(bNeg.value)} on 20 Apr,\n${usd(bNext.value)} on 21 Apr`,
        dx: 6,
        textAnchor: "start",
        fill: LINE2_TEXT,
      }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-only-wti.svg"), toSvg(fig) + "\n");
}

// --- Chart 2: a one-day price; the weekly and monthly averages stayed above zero
{
  const daily = series("wti-daily.csv", "2020-03-30", "2020-05-08");
  const weekly = series("wti-weekly.csv", "2020-04-03", "2020-05-08").map((r) => ({
    ...r,
    start: new Date(r.date.getTime() - 7 * 86400000),
  }));
  const month = on(series("wti-monthly.csv", "2020-04-15", "2020-04-15"), "2020-04-15");
  const april = [{ value: month.value, start: day("2020-04-01"), end: day("2020-04-30") }];
  const fri = on(daily, "2020-04-17");
  const neg = on(daily, "2020-04-20");
  const next = on(daily, "2020-04-21");
  const week = on(weekly, "2020-04-24");
  const drop = Math.round((fri.value - neg.value) * 100) / 100;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 24,
    marginTop: 36,
    marginBottom: 32,
    style: FONT,
    x: { label: null, domain: [day("2020-03-27"), day("2020-05-08")] },
    y: { label: null, domain: [-45, 40], grid: true, tickFormat: tick },
    marks: [
      Plot.text(["WTI spot price, daily vs weekly and April averages (US$ per barrel)"], {
        frameAnchor: "top-left", dx: -44, dy: -26, fill: INK, fontWeight: "bold",
      }),
      Plot.ruleY([0], { stroke: INK, strokeWidth: 1 }),

      // April monthly average: the whole month, not a point on the 15th.
      Plot.ruleY(april, { y: "value", x1: "start", x2: "end", stroke: LINE2, strokeWidth: 3, strokeDasharray: "6,4" }),
      Plot.text(april, { x: () => day("2020-04-04"), y: "value", text: (d) => `April average ${usd(d.value)}`, dy: 12, textAnchor: "start", fill: LINE2_TEXT }),

      // Weekly averages: each spans the week ending on its Friday.
      Plot.ruleY(weekly, { y: "value", x1: "start", x2: "date", stroke: INK, strokeWidth: 2.5 }),
      Plot.text([week], { x: () => day("2020-04-22"), y: () => -7, text: (d) => `Week ending 24 Apr: average ${usd(d.value)}`, textAnchor: "start", fill: INK }),

      Plot.line(daily, { x: "date", y: "value", stroke: LINE, strokeWidth: 1.5 }),
      Plot.dot(daily, { x: "date", y: "value", fill: LINE, r: 2.5 }),

      Plot.ruleX([fri], { x: "date", y1: fri.value + 1.5, y2: 28, stroke: LINE2, strokeWidth: 1 }),
      Plot.text([fri], { x: "date", y: () => 31, text: (d) => `17 Apr: ${usd(d.value)}`, textAnchor: "middle", fill: LINE }),
      Plot.dot([neg], { x: "date", y: "value", fill: HIGHLIGHT, r: 4 }),
      Plot.text([neg], { x: "date", y: "value", text: (d) => `20 Apr: ${usd(d.value)}\ndown ${usd(drop)} in one trading day`, dx: 8, textAnchor: "start", fill: HIGHLIGHT, fontWeight: "bold" }),
      Plot.text([next], { x: "date", y: "value", text: (d) => `21 Apr: ${usd(d.value)}`, dx: 8, dy: 4, textAnchor: "start", fill: LINE }),

      // Key, top right, in the series' own colours.
      Plot.text(["Daily price"], { frameAnchor: "top-right", dy: 4, textAnchor: "end", fill: LINE, fontWeight: "bold" }),
      Plot.text(["Weekly average"], { frameAnchor: "top-right", dy: 18, textAnchor: "end", fill: INK, fontWeight: "bold" }),
      Plot.text(["Monthly average"], { frameAnchor: "top-right", dy: 32, textAnchor: "end", fill: LINE2_TEXT, fontWeight: "bold" }),
    ],
  });
  writeFileSync(join(HERE, "oil-below-zero-averages.svg"), toSvg(fig) + "\n");
}

console.log("wrote oil-below-zero-only-wti.svg, oil-below-zero-averages.svg");
