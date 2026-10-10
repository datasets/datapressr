// Regenerate the SVG charts embedded in junior-dev-hiring.md.
//   cd site/stories && npm ci && node junior-dev-hiring-make-charts.mjs
//
// Observable Plot rendered to static SVG in Node (jsdom supplies the DOM). Reads only the
// snapshots in junior-dev-hiring-src/ (see PROVENANCE.md there). Implements the chart plan in
// junior-dev-hiring-outline.md. Every annotated value is read from the rows; a missing row throws.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "junior-dev-hiring-src");
const { window } = new JSDOM("");
const document = window.document;

const LINE = "#2563eb";
const LINE2 = "#9ca3af";
const INK = "#111827";
const HIGHLIGHT = "#dc2626";
const FONT = { fontSize: "12px", fontFamily: "ui-sans-serif, system-ui, sans-serif" };

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const one = (v) => v.toFixed(1);
const dayMonthYear = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function csv(file) {
  const [head, ...lines] = readFileSync(join(SRC, file), "utf8").trim().split("\n");
  const cols = head.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

function finite(v, what) {
  const n = Number(v);
  if (v === "" || !Number.isFinite(n)) throw new Error(`not a finite number: ${what}`);
  return n;
}

function on(rows, iso) {
  const row = rows.find((r) => r.iso === iso);
  if (!row) throw new Error(`no row for ${iso}`);
  return row;
}

/** Render a Plot figure/svg node to a standalone SVG string; refuse NaN/Infinity/undefined. */
function toSvg(node, name) {
  const svg = node.tagName.toLowerCase() === "svg" ? node : node.querySelector("svg");
  if (svg !== node) {
    const style = node.querySelector("style");
    if (style && !svg.contains(style)) svg.insertBefore(style, svg.firstChild);
  }
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const out = svg.outerHTML;
  if (/NaN|Infinity|undefined/.test(out)) throw new Error(`${name}: NaN, Infinity or undefined in SVG`);
  return out + "\n";
}

const CHATGPT = utc("2022-11-30"); // ChatGPT public launch
const FED_FIRST_RISE = utc("2022-03-16"); // first FOMC rate rise of the 2022 cycle

// --- Chart 1: software developer employment by age (ADP via Stanford), Nov 2022 = 100 ---------
{
  const raw = csv("canaries_software_developers.csv");
  const AGES = [
    ["Early Career 1 (22-25)", "22–25"],
    ["Early Career 2 (26-30)", "26–30"],
    ["Developing (31-34)", "31–34"],
    ["Mid-Career 1 (35-40)", "35–40"],
    ["Mid-Career 2 (41-49)", "41–49"],
    ["Senior (50+)", "50+"],
  ];
  const rows = AGES.flatMap(([col, age]) =>
    raw.map((r) => ({ iso: r.observation_date, date: utc(r.observation_date), age, value: finite(r[col], `${col} ${r.observation_date}`) })),
  );
  const last = raw.at(-1).observation_date;
  const ends = AGES.map(([, age]) => on(rows.filter((r) => r.age === age), last));
  const young = rows.filter((r) => r.age === "22–25");
  const youngPeak = young.reduce((a, b) => (b.value > a.value ? b : a));
  // Nudge end labels apart where two series finish close together.
  const nudge = { "31–34": 5, "50+": -4 };
  const first = raw[0].observation_date;
  const firstYoung = on(young, first);
  const endYoung = on(young, last);
  const mid = rows.filter((r) => r.age === "41–49");
  const firstMid = on(mid, first);
  const endMid = on(mid, last);
  const signed = (a, b) => { const v = 100 * (b.value / a.value - 1); return `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(1)}%`; };

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 92,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, ticks: 5 },
    y: { domain: [75, 125], label: "Employment index, Nov 2022 = 100", labelArrow: "none", grid: true },
    marks: [
      Plot.ruleY([100], { stroke: INK }),
      Plot.ruleX([CHATGPT], { stroke: INK, strokeDasharray: "3,3" }),
      Plot.text([{ x: CHATGPT, y: 122 }], { x: "x", y: "y", text: () => "ChatGPT launched, 30 Nov 2022", dx: 6, textAnchor: "start", fill: INK }),
      Plot.line(rows.filter((r) => r.age !== "22–25"), { x: "date", y: "value", z: "age", stroke: LINE2, strokeWidth: 1.5 }),
      Plot.line(young, { x: "date", y: "value", stroke: HIGHLIGHT, strokeWidth: 2.5 }),
      // One text mark per end label: dy, fill and weight are constants per mark in Plot.
      ...ends.map((d) =>
        Plot.text([d], {
          x: "date",
          y: "value",
          text: () => `${d.age}: ${one(d.value)}`,
          dx: 6,
          dy: nudge[d.age] ?? 0,
          textAnchor: "start",
          fill: d.age === "22–25" ? HIGHLIGHT : "#4b5563",
          fontWeight: d.age === "22–25" ? "bold" : "normal",
        }),
      ),
      Plot.dot([youngPeak], { x: "date", y: "value", fill: HIGHLIGHT, r: 3.5 }),
      Plot.text([youngPeak], { x: "date", y: "value", text: (d) => `Ages 22–25 peak, ${d.date.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}: ${one(d.value)}`, dy: -14, textAnchor: "middle", fill: HIGHLIGHT }),
      Plot.text([{ x: utc("2021-09-15"), y: 79.5 }], { x: "x", y: "y", text: () => `US software developers on ADP payrolls, by age. Latest: ${dayMonthYear(utc(last)).replace(/^1 /, "")}`, textAnchor: "start", fill: "#4b5563" }),
      Plot.text([{ x: utc("2021-09-15"), y: 76.5 }], { x: "x", y: "y", text: () => `Since ${dayMonthYear(utc(first)).replace(/^1 /, "")}: ages 22–25 ${signed(firstYoung, endYoung)} (${one(firstYoung.value)} → ${one(endYoung.value)}); ages 41–49 ${signed(firstMid, endMid)} (${one(firstMid.value)} → ${one(endMid.value)})`, textAnchor: "start", fill: "#4b5563" }),
    ],
  });
  writeFileSync(join(HERE, "junior-dev-hiring-by-age.svg"), toSvg(fig, "by-age"));
}

// --- Chart 2: US software development postings vs all postings (Indeed), Feb 2020 = 100 -------
{
  const all = csv("indeed-software-vs-all.csv").filter((r) => r.country === "US");
  const mk = (series) => all.filter((r) => r.series === series).map((r) => ({ iso: r.date, date: utc(r.date), value: finite(r.index_feb2020_100, `${series} ${r.date}`) }));
  const sw = mk("software_development");
  const tot = mk("all_postings");
  const peak = sw.reduce((a, b) => (b.value > a.value ? b : a));
  const low = sw.filter((r) => r.iso > peak.iso).reduce((a, b) => (b.value < a.value ? b : a));
  const atLaunch = sw.filter((r) => r.date <= CHATGPT).at(-1);
  const swLast = sw.at(-1);
  const totLast = tot.at(-1);
  if (swLast.iso !== totLast.iso) throw new Error("US series end on different days");

  const fig = Plot.plot({
    document,
    width: 720,
    height: 420,
    marginLeft: 52,
    marginRight: 120,
    marginTop: 28,
    marginBottom: 40,
    style: FONT,
    x: { label: null, ticks: 7 },
    y: { domain: [0, 250], label: "Job postings index, 1 Feb 2020 = 100", labelArrow: "none", grid: true },
    marks: [
      Plot.ruleY([100], { stroke: INK }),
      Plot.ruleX([FED_FIRST_RISE], { stroke: INK, strokeDasharray: "3,3" }),
      Plot.text([{ x: FED_FIRST_RISE, y: 22 }], { x: "x", y: "y", text: () => "Fed's first rate rise,\n16 Mar 2022", dx: 6, textAnchor: "start", fill: INK }),
      Plot.ruleX([CHATGPT], { stroke: INK, strokeDasharray: "3,3" }),
      Plot.text([{ x: CHATGPT, y: 200 }], { x: "x", y: "y", text: () => "ChatGPT launched,\n30 Nov 2022", dx: 6, textAnchor: "start", fill: INK }),
      Plot.line(tot, { x: "date", y: "value", stroke: LINE2, strokeWidth: 2 }),
      Plot.line(sw, { x: "date", y: "value", stroke: LINE, strokeWidth: 2.5 }),
      Plot.dot([peak, atLaunch, low, swLast], { x: "date", y: "value", fill: LINE, r: 3.5 }),
      Plot.text([peak], { x: "date", y: "value", text: (d) => `Peak, ${dayMonthYear(d.date)}: ${one(d.value)}`, dx: -8, textAnchor: "end", fill: LINE }),
      Plot.text([atLaunch], { x: "date", y: "value", text: (d) => `${dayMonthYear(d.date)}: ${one(d.value)}`, dx: 8, dy: 4, textAnchor: "start", fill: LINE }),
      Plot.text([low], { x: "date", y: "value", text: (d) => `Low, ${dayMonthYear(d.date)}: ${one(d.value)}`, dy: 16, textAnchor: "middle", fill: LINE }),
      Plot.text([swLast], { x: "date", y: "value", text: (d) => `Software\ndevelopment: ${one(d.value)}`, dx: 8, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.dot([totLast], { x: "date", y: "value", fill: "#6b7280", r: 3.5 }),
      Plot.text([totLast], { x: "date", y: "value", text: (d) => `All postings:\n${one(d.value)}`, dx: 8, dy: -6, textAnchor: "start", fill: "#4b5563", fontWeight: "bold" }),
      Plot.text([{ x: utc("2023-06-01"), y: 245 }], { x: "x", y: "y", text: () => `US job postings on Indeed, weekly. Latest: ${dayMonthYear(swLast.date)}`, textAnchor: "start", fill: "#4b5563" }),
    ],
  });
  writeFileSync(join(HERE, "junior-dev-hiring-postings.svg"), toSvg(fig, "postings"));
}

// --- Chart 3: six countries, fall from each series' own peak since 2022 to the latest reading ---
{
  const NAMES = { US: "United States", GB: "United Kingdom", CA: "Canada", DE: "Germany", FR: "France", AU: "Australia" };
  const rows = csv("indeed-software-vs-all.csv");
  const changes = [];
  for (const cc of Object.keys(NAMES)) {
    for (const series of ["software_development", "all_postings"]) {
      const own = rows.filter((x) => x.country === cc && x.series === series).map((r) => ({ iso: r.date, value: finite(r.index_feb2020_100, `${cc} ${series} ${r.date}`) }));
      // Highest weekly reading since January 2022 (French all postings peaked in March 2023).
      const since = own.filter((r) => r.iso >= "2022-01-01");
      if (!since.length) throw new Error(`no rows since 2022 for ${cc} ${series}`);
      const peak = since.reduce((x, y) => (y.value > x.value ? y : x));
      const last = own.at(-1);
      changes.push({ cc, country: NAMES[cc], series, iso: last.iso, peak: peak.value, latest: last.value, change: 100 * (last.value / peak.value - 1) });
    }
  }
  const dates = new Set(changes.map((r) => r.iso));
  if (dates.size !== 1) throw new Error(`latest dates differ: ${[...dates]}`);
  const asOf = utc([...dates][0]);
  const sw = changes.filter((r) => r.series === "software_development");
  const tot = changes.filter((r) => r.series === "all_postings");
  const order = [...sw].sort((a, b) => a.change - b.change).map((r) => r.country);
  const pairs = sw.map((s) => ({ country: s.country, x1: s.change, x2: tot.find((t) => t.cc === s.cc).change }));
  const pct = (v) => `${v < 0 ? "−" : "+"}${Math.abs(Math.round(v))}%`;

  const fig = Plot.plot({
    document,
    width: 720,
    height: 330,
    marginLeft: 112,
    marginRight: 40,
    marginTop: 48,
    marginBottom: 40,
    style: FONT,
    x: { domain: [-80, 0], label: `Change in job postings from the peak to ${dayMonthYear(asOf)} (%)`, labelArrow: "none", grid: true, tickFormat: (v) => (v === 0 ? "0" : `−${Math.abs(v)}`) },
    y: { domain: order, label: null, padding: 0.5 },
    marks: [
      Plot.ruleX([0], { stroke: INK }),
      Plot.link(pairs, { x1: "x1", x2: "x2", y1: "country", y2: "country", stroke: "#d1d5db", strokeWidth: 3 }),
      Plot.dot(tot, { x: "change", y: "country", fill: LINE2, r: 6 }),
      Plot.dot(sw, { x: "change", y: "country", fill: LINE, r: 6 }),
      Plot.text(sw, { x: "change", y: "country", text: (d) => pct(d.change), dx: -11, textAnchor: "end", fill: LINE, fontWeight: "bold" }),
      Plot.text(tot, { x: "change", y: "country", text: (d) => pct(d.change), dx: 11, textAnchor: "start", fill: "#4b5563" }),
      Plot.text([{ x: -80 }], { x: "x", frameAnchor: "top-left", text: () => "Indeed job postings; each series from its own highest weekly reading since January 2022.", dy: -40, textAnchor: "start", fill: "#4b5563" }),
      Plot.text([{ x: -80 }], { x: "x", frameAnchor: "top-left", text: () => "Software development", dy: -22, textAnchor: "start", fill: LINE, fontWeight: "bold" }),
      Plot.text([{ x: -80 }], { x: "x", frameAnchor: "top-left", text: () => "All postings", dx: 140, dy: -22, textAnchor: "start", fill: "#4b5563", fontWeight: "bold" }),
    ],
  });
  writeFileSync(join(HERE, "junior-dev-hiring-countries.svg"), toSvg(fig, "countries"));
}

// --- Chart 4: CPS share of employed software developers aged 22-25, 12 months to September -----
{
  const rows = csv("cps-software-by-age.csv").filter((r) => r.occupation === "software_developers" && r.status === "employed");
  const periods = [];
  for (let end = 2021; end <= 2026; end++) {
    const from = `${end - 1}-10-01`;
    const to = `${end}-09-01`;
    const inWin = rows.filter((r) => r.month >= from && r.month <= to);
    const months = new Set(inWin.map((r) => r.month)).size;
    if (months < 11) throw new Error(`window to Sep ${end} has ${months} months`);
    const young = inWin.filter((r) => r.age_band === "22-25");
    const share = (100 * young.reduce((s, r) => s + finite(r.persons, "persons"), 0)) / inWin.reduce((s, r) => s + finite(r.persons, "persons"), 0);
    const records = young.reduce((s, r) => s + finite(r.records, "records"), 0);
    const level = young.reduce((s, r) => s + finite(r.persons, "persons"), 0) / months; // average a month
    const total = inWin.reduce((s, r) => s + finite(r.persons, "persons"), 0) / months;
    periods.push({ label: `${end}`, share, records, months, level, total });
  }

  const fig = Plot.plot({
    document,
    width: 720,
    height: 360,
    marginLeft: 52,
    marginRight: 16,
    marginTop: 40,
    marginBottom: 80,
    style: FONT,
    x: { type: "band", label: null, padding: 0.35 },
    y: { domain: [0, 13], label: "Employed US software developers aged 22–25, share of all ages (%), Current Population Survey", labelArrow: "none", grid: true },
    marks: [
      Plot.barY(periods, { x: "label", y: "share", fill: LINE2 }),
      Plot.ruleY([0], { stroke: INK }),
      Plot.text(periods, { x: "label", y: "share", text: (d) => `${one(d.share)}%`, dy: -36, fill: INK, fontWeight: "bold" }),
      Plot.text(periods, { x: "label", y: "share", text: (d) => `${Math.round(d.level / 1000)}k of ${(d.total / 1e6).toFixed(1)}m`, dy: -22, fill: INK }),
      Plot.text(periods, { x: "label", y: "share", text: (d) => `${d.records} responses${d.months < 12 ? "*" : ""}`, dy: -8, fill: "#4b5563" }),
      Plot.text(["Twelve months to September. Labels: share; average number employed a month, aged 22–25 of all ages; survey\nresponses from 22–25-year-olds (many are the same people in several months). *11 months: October 2025 was not collected."], { frameAnchor: "bottom-left", text: (d) => d, dy: 50, dx: -44, textAnchor: "start", lineAnchor: "top", fill: "#4b5563" }),
    ],
  });
  writeFileSync(join(HERE, "junior-dev-hiring-survey.svg"), toSvg(fig, "survey"));
}

console.log("wrote junior-dev-hiring-by-age.svg, -postings.svg, -countries.svg, -survey.svg");
