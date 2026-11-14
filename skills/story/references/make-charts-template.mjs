// Template: regenerate the SVG charts embedded in <slug>.md.
//   npm ci && node <slug>-make-charts.mjs
//
// Copy next to the story as <slug>-make-charts.mjs, set DATA and the chart blocks at
// the bottom, delete what you don't use. Needs a scoped package.json with pinned
// "@observablehq/plot" and "jsdom". See charting.md in this folder for the rules.
//
// Each chart is ONE spec built twice: desktop (720 px) and mobile (360 px, shown at
// ~326 px on a phone). chart() wraps the Plot output in frame(): a takeaway title, a
// subtitle with measure and unit, and a source line, all inside the SVG, plus <title>
// and <desc> for screen readers. Colour roles are greys + one accent (C); type sizes
// are in T. story-check's chart-* checks hold framed charts to these rules.
//
// Social cards (1080x1350, 1080x1080, 1200x630) come from card(), or from chart() when
// the spec carries `social` overrides; story-check's card-* checks hold them to the
// rules in references/formats.md.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

export { Plot };
const HERE = dirname(fileURLToPath(import.meta.url));
// Where the dataset's CSVs live, relative to this script. Adjust per project.
const DATA = join(HERE, "..", "..", "datasets", "<collection>", "<dataset>", "data");
const { window } = new JSDOM("");
const document = window.document;

// Colour roles. One accent per story: the protagonist, the same hue in every chart.
// Everything else is grey. A second accent (accent2) only for a genuine two-way
// comparison named in the chart plan. Text in a series colour uses the *Text shade
// (>= 4.5:1 on white). Never use `context` for text: it is a mark colour only.
// Every mark colour is >= 3:1 on white (WCAG 1.4.11): accent 6.7:1, accent2 3.2:1,
// context 3.1:1. accent and accent2 are 2.1:1 apart in lightness, so they separate in
// greyscale, and stay apart under protanopia, deuteranopia and tritanopia (dark blue
// against light orange). context and accent2 share a lightness: label both.
// contextFaint (1.9:1) is the one exception, for unnamed background series only: give
// those marks `ariaLabel: "faint context"` and say so in the chart plan.
export const C = {
  accent: "#1d4ed8", accentText: "#1d4ed8",
  accent2: "#ec6a0c", accent2Text: "#c2410c",
  context: "#8b929d", // grey marks: other series, earlier years
  contextFaint: "#b6bcc6", // unnamed background series only, with ariaLabel "faint context"
  contextDark: "#6b7280", // the grey series you still name
  ink: "#111827", // zero rule, titles
  muted: "#4b5563", // subtitle, grey labels (7.6:1)
  faint: "#6b7280", // ticks, source (4.8:1)
  grid: "#e5e7eb",
  bg: "#ffffff",
};

// Type scale in SVG px. Mobile SVGs are 360 wide and render at ~0.9x on a 390 px phone,
// so 13 px -> ~11.8 px on screen; story-check fails framed charts below 11 px rendered.
export const T = {
  desktop: { w: 720, title: 21, subtitle: 15, body: 14, tick: 13, source: 12, plotH: 340, marginRight: 140 },
  mobile: { w: 360, title: 19, subtitle: 15, body: 14, tick: 13, source: 13, plotH: 290, marginRight: 88 },
  // Social cards, canvas px at 1080 wide. Shown at ~390 px in a feed (x0.36: title 84 ->
  // 30 px) and ~125 px in a profile grid (x0.12: only the hero survives, 320 -> 37 px).
  // Nothing below 32 px; lines >= 4 px, dots >= 12 px across. margin is the safe zone.
  social: { w: 1080, margin: 72, hero: 320, title: 84, subtitle: 44, body: 44, tick: 40, source: 34, stroke: 6, r: 9 },
};
export const CARD_SIZES = { portrait: [1080, 1350], square: [1080, 1080], link: [1200, 630] };
const FAMILY = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const PAD = 8;

/** Round half away from zero to `dp` decimals, correctly for decimal inputs.
 * `(94.55).toFixed(1)` gives "94.5" because 94.55 is stored as 94.5499…;
 * this gives 94.6. Round once, from full precision, here and in the calculate
 * script alike: never round a value that was already rounded (us-measles-2026,
 * us-inflation-components, 2026-11-08). */
export function round(v, dp = 0) {
  const s = Math.sign(v) || 1;
  return (s * Math.round(Number(`${Math.abs(v)}e${dp}`) + 1e-9)) / 10 ** dp;
}

/** Rows of one clean (unquoted) CSV between two ISO dates, inclusive. One call
 * per resource — never join resources by date (see charting.md). */
export function series(file, dateCol, valueCol, from, to) {
  const [head, ...lines] = readFileSync(join(DATA, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  const di = cols.indexOf(dateCol);
  const vi = cols.indexOf(valueCol);
  return lines
    .map((l) => l.split(","))
    .filter((c) => c[di] >= from && c[di] <= to && c[vi] !== "")
    .map((c) => ({ iso: c[di], date: new Date(`${c[di]}T00:00:00Z`), value: Number(c[vi]) }));
}

/** The row for one key; throws so a missing annotation fails the build. */
export function on(rows, iso, key = "iso") {
  const row = rows.find((r) => r[key] === iso);
  if (!row) throw new Error(`no row for ${iso}`);
  return row;
}

/** Greedy word wrap with an average glyph width (no text measuring in Node). */
export function wrap(text, width, size, bold = false) {
  const max = Math.floor(width / (size * (bold ? 0.58 : 0.52))); // story-check estimates the same
  const out = [];
  let line = "";
  for (const w of text.split(" ")) {
    if (line && `${line} ${w}`.length > max) { out.push(line); line = w; } else line = line ? `${line} ${w}` : w;
  }
  if (line) out.push(line);
  return out;
}

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const setAll = (el, attrs) => { for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v)); return el; };

/**
 * Wrap a Plot figure in one standalone SVG: title, subtitle, the chart, notes and
 * source line, with <title>/<desc> and role="img" for screen readers.
 * id must be unique per SVG (e.g. "<slug>-<chart>-mobile").
 */
export function frame(fig, { id, title, subtitle, source, notes = "", alt = "", mode }) {
  const t = T[mode];
  const plot = fig.tagName.toLowerCase() === "svg" ? fig : fig.querySelector("svg");
  if (plot !== fig) {
    const style = fig.querySelector("style");
    if (style && !plot.contains(style)) plot.insertBefore(style, plot.firstChild);
  }
  const ns = "http://www.w3.org/2000/svg";
  const W = t.w;
  const texts = [];
  let y = 0;
  const add = (cls, text, size, fill, weight, gap, lh = 1.25) => {
    if (!text) return;
    for (const l of wrap(text, W - 2 * PAD, size, weight >= 700)) { y += size * lh; texts.push({ cls, y, size, fill, weight, l }); }
    y += gap;
  };
  add("dp-title", title, t.title, C.ink, 700, 4);
  add("dp-subtitle", subtitle, t.subtitle, C.muted, 400, 8);
  const plotY = y;
  y += Number(plot.getAttribute("height")) + 6;
  const ruleY = y;
  y += 2;
  add("dp-note", notes, t.source, C.faint, 400, 0, 1.3);
  add("dp-source", source, t.source, C.faint, 400, 0, 1.3);
  const H = Math.ceil(y + 8);

  const outer = setAll(document.createElementNS(ns, "svg"), {
    xmlns: ns, "data-dp-frame": "1", role: "img", "aria-labelledby": `${id}-title ${id}-desc`,
    width: W, height: H, viewBox: `0 0 ${W} ${H}`, "font-family": FAMILY, fill: C.ink,
  });
  const titleEl = setAll(document.createElementNS(ns, "title"), { id: `${id}-title` });
  titleEl.textContent = title;
  const desc = setAll(document.createElementNS(ns, "desc"), { id: `${id}-desc` });
  desc.textContent = [subtitle, alt, notes, source].filter(Boolean).join(". ").replace(/\.\./g, ".");
  outer.append(titleEl, desc, setAll(document.createElementNS(ns, "rect"), { width: W, height: H, fill: C.bg }));
  outer.append(setAll(document.createElementNS(ns, "line"), { x1: PAD, x2: W - PAD, y1: ruleY, y2: ruleY, stroke: C.grid }));
  for (const tx of texts) {
    const e = setAll(document.createElementNS(ns, "text"), { class: tx.cls, x: PAD, y: tx.y.toFixed(1), "font-size": tx.size, fill: tx.fill, "font-weight": tx.weight });
    e.textContent = tx.l;
    outer.appendChild(e);
  }
  plot.setAttribute("y", String(plotY));
  plot.removeAttribute("xmlns");
  outer.appendChild(plot);
  const s = outer.outerHTML;
  if (/NaN|Infinity|undefined|=>/.test(s)) throw new Error(`${id}: NaN, Infinity, undefined or function source in the SVG`);
  return s;
}

/** Quiet axes: no tick marks, no axis line, no axis title (units go in the subtitle). */
const quietAxis = (t) => ({ label: null, tickSize: 0, fontSize: t.tick, color: C.faint });

/**
 * Build one chart at both sizes from one spec. `plot(mode, t)` returns the Plot options
 * that differ by chart (marks, scales, ticks); this adds width, height, margins, type and
 * quiet axes. Gridlines are off: pass `y: { grid: true }` only when readers must read
 * values off the axis. Returns { desktop, mobile } SVG strings.
 */
export function chart({ slug, name = "chart", title, subtitle, source, notes, alt, plot, height = {}, social }) {
  const out = {};
  if (social) out.card = card({ slug, name: `${name}-card`, social, source, plot });
  for (const mode of ["desktop", "mobile"]) {
    const t = T[mode];
    const spec = plot(mode, t);
    const fig = Plot.plot({
      document,
      width: t.w,
      height: height[mode] ?? t.plotH,
      marginLeft: mode === "mobile" ? 48 : 56, // fits "3,000" at tick size; widen for longer ticks
      marginRight: t.marginRight, // reserved for end labels: series name + latest value
      marginTop: 20,
      marginBottom: 28,
      ...spec,
      style: { fontSize: `${t.body}px`, fontFamily: FAMILY, background: C.bg, color: C.ink },
      x: { ...quietAxis(t), ...spec.x },
      y: { ...quietAxis(t), ...spec.y },
    });
    out[mode] = frame(fig, { id: `${slug}-${name}${mode === "mobile" ? "-mobile" : ""}`, title, subtitle, source, notes, alt, mode });
  }
  return out;
}

/**
 * Direct labels at line ends, in the reserved right margin: a dot on the last point and
 * the label beside it. Where lines converge, give each label its own fixed `slotY` (in
 * data units) and a leader line from the point; never nudge a label a few px off a
 * crowded point. items: [{ x, y, text, mobileText?, slotY?, accent? }]
 */
export function endLabels(mode, items) {
  const rows = items.map((d) => ({ ...d, ly: d.slotY ?? d.y, label: (mode === "mobile" && d.mobileText) || d.text }));
  const marks = [];
  for (const accent of [true, false]) {
    const group = rows.filter((d) => !!d.accent === accent);
    if (!group.length) continue;
    const fill = accent ? C.accent : C.contextDark;
    marks.push(
      Plot.link(group.filter((d) => d.ly !== d.y), { x1: "x", x2: "x", y1: "y", y2: "ly", dx: 6, stroke: C.context }),
      Plot.dot(group, { x: "x", y: "y", fill, r: 4, stroke: C.bg, strokeWidth: 1.5 }),
      Plot.text(group, { x: "x", y: "ly", text: "label", dx: 10, textAnchor: "start", lineAnchor: "middle", fill: accent ? C.accentText : C.muted, fontWeight: "bold" }),
    );
  }
  return marks;
}

/** Write <slug>-<name>.svg and <slug>-<name>-mobile.svg (and <slug>-<name>-card.svg/.png with social overrides). */
export function writeChart(slug, name, built) {
  writeFileSync(join(HERE, `${slug}-${name}.svg`), built.desktop + "\n");
  writeFileSync(join(HERE, `${slug}-${name}-mobile.svg`), built.mobile + "\n");
  console.log(`wrote ${slug}-${name}.svg, ${slug}-${name}-mobile.svg`);
  if (built.card) writeCard(HERE, `${slug}-${name}-card`, built.card);
}

// --- Social cards ----------------------------------------------------------------
// A card is not a resized chart: it has its own short claim, one hero number and at
// most one annotation, sized for a feed. See references/formats.md.

const wordCount = (s) => String(s ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * One social card as an SVG string. size: "portrait" (1080x1350, the house default),
 * "square" (1080x1080) or "link" (1200x630 Open Graph: title and hero only).
 * social (required): {
 *   title,      the claim, at most 10 words
 *   hero,       the one number the reader keeps, with its unit ("555", "2.5×", "$66bn")
 *   heroLabel,  its comparison in the same breath ("deaths in 2023, against 161 a year before")
 *   subtitle,   measure, unit, place, period
 *   alt,        alt text: chart type, claim, two to four values, source (goes in <desc> and PROMOTION.md)
 * }
 * plot(mode, t) is optional and called with mode "social" and T.social: one chart, at
 * most three series, direct labels, no legend, at most one annotation. Use t.stroke for
 * lines and t.r for dots. The build throws when a rule is broken, so a card can't ship without them.
 */
export function card({ slug, name = "card", size = "portrait", social, source, plot }) {
  const id = `${slug}-${name}`;
  if (!social) throw new Error(`${id}: a card needs social overrides { title, hero, heroLabel, subtitle, alt }: a card is not a resized chart`);
  const { title, hero, heroLabel = "", subtitle = "", alt } = social;
  for (const [k, v] of Object.entries({ title, hero, alt, source })) if (!v) throw new Error(`${id}: social.${k === "source" ? "source (the card's source line)" : k} is required`);
  if (wordCount(title) > 10) throw new Error(`${id}: the card title is ${wordCount(title)} words; at most 10 words`);
  if (!CARD_SIZES[size]) throw new Error(`${id}: size must be one of ${Object.keys(CARD_SIZES).join(", ")}`);
  const [W, H] = CARD_SIZES[size];
  const s = T.social;
  const M = s.margin;
  const link = size === "link";
  const titleSize = link ? 64 : plot ? 76 : s.title;
  const heroTarget = link ? 200 : !plot ? 360 : size === "square" ? 240 : 280;
  // Shrink a long hero to fit the width, but never below the grid-thumbnail tier.
  const heroSize = Math.min(heroTarget, Math.floor((W - 2 * M) / (String(hero).length * 0.62)));
  if (heroSize < (link ? 180 : 240)) throw new Error(`${id}: hero "${hero}" is too long to set large; shorten it (e.g. "$66bn", "2.5×")`);

  const ns = "http://www.w3.org/2000/svg";
  const texts = [];
  let y = M;
  const put = (cls, text, size, fill, weight, lh, gap, width = W - 2 * M) => {
    if (!text) return;
    for (const l of wrap(String(text), width, size, weight >= 700)) {
      y += texts.length ? size * lh : size * 0.85;
      texts.push({ cls, l, size, fill, weight, x: M, y });
    }
    y += gap;
  };
  put("dp-title", title, titleSize, C.ink, 700, 1.12, link ? 20 : 28);
  put("dp-hero", hero, heroSize, C.accent, 800, 0.98, link ? 0 : 18);
  if (!link) {
    put("dp-hero-label", heroLabel, s.subtitle, C.ink, 400, 1.22, 14);
    put("dp-subtitle", subtitle, 40, C.muted, 400, 1.25, 24);
  }

  // Foot strip: source (with its period) left, DataHub mark right, on the safe-zone edge.
  const fs = Math.ceil((s.source * W) / 1080); // 34 px at 1080 wide, 38 on the 1200 px link card
  const markW = 10 * fs * 0.58 + 44;
  const sourceLines = wrap(source, W - 2 * M - markW - 32, fs);
  const footTop = H - M - (sourceLines.length - 1) * fs * 1.25 - fs - 26;
  sourceLines.forEach((l, i) => texts.push({ cls: "dp-source", l, size: fs, fill: C.faint, weight: 400, x: M, y: H - M - (sourceLines.length - 1 - i) * fs * 1.25 }));
  texts.push({ cls: "dp-mark", l: "datahub.io", size: fs, fill: C.ink, weight: 700, x: W - M, y: H - M, anchor: "end" });
  if (y > footTop - 16) throw new Error(`${id}: the ${size} card overflows by ${Math.ceil(y - footTop + 16)} px; shorten the title or hero label${plot ? ", or drop the plot" : ""}`);

  let plotSvg = null;
  if (plot && !link) {
    const plotW = W - 2 * M;
    const avail = Math.floor(footTop - 24 - y);
    if (avail < 160) throw new Error(`${id}: only ${avail} px left for the plot on the ${size} card; shorten the title or hero label, or use the portrait size`);
    const plotH = Math.min(avail, plotW); // plot area between square and wide; a short card gets a wide plot
    const spec = plot("social", s);
    const fig = Plot.plot({
      document, width: plotW, height: plotH, marginLeft: 56, marginRight: 56, marginTop: 24, marginBottom: 56, // room for edge ticks at 40 px
      ...spec,
      style: { fontSize: `${s.body}px`, fontFamily: FAMILY, background: C.bg, color: C.ink },
      x: { ...quietAxis(s), ...spec.x },
      y: { ...quietAxis(s), ...spec.y },
    });
    plotSvg = fig.tagName.toLowerCase() === "svg" ? fig : fig.querySelector("svg");
    if (plotSvg !== fig) {
      const style = fig.querySelector("style");
      if (style && !plotSvg.contains(style)) plotSvg.insertBefore(style, plotSvg.firstChild);
    }
    plotSvg.setAttribute("x", String(M));
    plotSvg.setAttribute("y", String(Math.round(y + (avail - plotH) / 2)));
    plotSvg.removeAttribute("xmlns");
  }

  const outer = setAll(document.createElementNS(ns, "svg"), {
    xmlns: ns, "data-dp-card": size, role: "img", "aria-labelledby": `${id}-title ${id}-desc`,
    width: W, height: H, viewBox: `0 0 ${W} ${H}`, "font-family": FAMILY, fill: C.ink,
  });
  const titleEl = setAll(document.createElementNS(ns, "title"), { id: `${id}-title` });
  titleEl.textContent = title;
  const desc = setAll(document.createElementNS(ns, "desc"), { id: `${id}-desc` });
  desc.textContent = alt;
  outer.append(titleEl, desc, setAll(document.createElementNS(ns, "rect"), { width: W, height: H, fill: C.bg }));
  outer.append(setAll(document.createElementNS(ns, "line"), { class: "dp-rule", x1: M, x2: W - M, y1: footTop, y2: footTop, stroke: C.grid, "stroke-width": 2 }));
  outer.append(setAll(document.createElementNS(ns, "rect"), { class: "dp-mark", x: W - M - markW + 4, y: H - M - 27, width: 28, height: 28, rx: 6, fill: C.accent }));
  for (const tx of texts) {
    const e = setAll(document.createElementNS(ns, "text"), { class: tx.cls, x: tx.x, y: tx.y.toFixed(1), "font-size": tx.size, fill: tx.fill, "font-weight": tx.weight, ...(tx.anchor ? { "text-anchor": tx.anchor } : {}) });
    e.textContent = tx.l;
    outer.appendChild(e);
  }
  if (plotSvg) outer.appendChild(plotSvg);
  const out = outer.outerHTML;
  if (/NaN|Infinity|undefined|=>/.test(out)) throw new Error(`${id}: NaN, Infinity, undefined or function source in the SVG`);
  const words = [...out.matchAll(/<(?:text|tspan)\b[^>]*>([^<]*)/g)].reduce((n, m) => n + wordCount(m[1]), 0);
  if (words > 40) throw new Error(`${id}: ${words} words on the card; at most 40 words (one claim, one comparison)`);
  return out;
}

// PNG via Playwright, if the Factory renderer is installed; otherwise SVG only.
export const SVG2PNG = join(homedir(), ".cache", "factory-playwright", "svg2png.mjs");

/** Write <dir>/<file>.svg and, when SVG2PNG exists, <file>.png at the card's own width. */
export function writeCard(dir, file, svg) {
  const svgPath = join(dir, `${file}.svg`);
  writeFileSync(svgPath, svg + "\n");
  const width = svg.match(/viewBox="0 0 (\d+) /)[1];
  if (!existsSync(SVG2PNG)) return console.log(`wrote ${file}.svg (no PNG: ${SVG2PNG} not installed)`);
  const r = spawnSync(process.execPath, [SVG2PNG, svgPath, join(dir, `${file}.png`), width], { encoding: "utf8", cwd: dirname(SVG2PNG) });
  if (r.status !== 0) throw new Error(`svg2png failed for ${file}: ${r.stderr}`);
  console.log(`wrote ${file}.svg, ${file}.png`);
}

// --- Charts: run only when this file is executed, not imported -------------------
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const SLUG = "<slug>";
  const SOURCE = "Source: <publisher, dataset> · Chart: DataHub";

  // Chart 1: <the comparison in the post title>. One accent (the protagonist), greys
  // for context, end labels with values, at most three explanatory annotations.
  {
    const rows = series("<resource>.csv", "<date column>", "<value column>", "<from>", "<to>");
    const marked = on(rows, "<ISO date the prose cites>");
    const last = rows.at(-1);
    writeChart(SLUG, "<chart>", chart({
      slug: SLUG,
      name: "<chart>",
      title: "<Takeaway: a sentence with a verb, ideally the key number>",
      subtitle: "<Measure, unit, place, years>",
      source: SOURCE,
      notes: "", // e.g. "2026 provisional, to 5 November."
      alt: "", // the key values, for screen readers
      plot: (mode) => ({
        x: { ticks: mode === "mobile" ? 4 : 8 },
        y: { zero: true }, // bars need zero; for lines, justify any other baseline
        marks: [
          Plot.ruleY([0], { stroke: C.ink }),
          Plot.line(rows, { x: "date", y: "value", stroke: C.accent, strokeWidth: 2.5 }),
          Plot.dot([marked], { x: "date", y: "value", fill: C.accent, r: 4 }),
          Plot.text([marked], { x: "date", y: "value", text: (d) => `<label>: ${round(d.value, 1)}`, dy: -12, fill: C.accentText }),
          ...endLabels(mode, [{ x: last.date, y: last.value, text: `<Series> ${round(last.value, 1)}`, mobileText: `<Short>\n${round(last.value, 1)}`, accent: true }]),
        ],
      }),
    }));
  }
}
