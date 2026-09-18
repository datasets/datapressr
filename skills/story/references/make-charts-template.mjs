// Template: regenerate the SVG charts embedded in <slug>.md.
//   npm ci && node <slug>-make-charts.mjs
//
// Copy next to the story as <slug>-make-charts.mjs, set DATA and the chart
// blocks, delete what you don't use. Needs a scoped package.json with pinned
// "@observablehq/plot" and "jsdom". See charting.md in this folder.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
// Where the dataset's CSVs live, relative to this script. Adjust per project.
const DATA = join(HERE, "..", "..", "datasets", "<collection>", "<dataset>", "data");
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

// --- Chart 1: <what the reader should see> ------------------------------------
{
  const rows = series("<resource>.csv", "<date column>", "<value column>", "<from>", "<to>");
  const marked = on(rows, "<ISO date the prose cites>");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 400,
    marginLeft: 52,
    marginRight: 64,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null },
    y: { label: "<quantity (unit)>", labelArrow: "none", grid: true },
    marks: [
      Plot.line(rows, { x: "date", y: "value", stroke: LINE, strokeWidth: 2 }),
      Plot.text([rows.at(-1)], { x: "date", y: "value", text: () => "<series name>", dx: 6, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.dot([marked], { x: "date", y: "value", fill: HIGHLIGHT, r: 4 }),
      Plot.text([marked], { x: "date", y: "value", text: (d) => `<label>: ${d.value}`, dx: 8, textAnchor: "start", fill: HIGHLIGHT }),
    ],
  });
  writeFileSync(join(HERE, "<slug>-<chart>.svg"), toSvg(fig) + "\n");
}

console.log("wrote <slug>-<chart>.svg");
