// Example social cards from the story template's card(): one single figure and one
// comparatron, from the us-natural-hazard-statistics dataset (the heat-quiet-killer story).
//   (cd site/stories && npm ci) && node docs/examples/story-formats/make-cards.mjs
//
// The template resolves Plot and jsdom from where it sits, so this copies it into a temp
// folder beside site/stories/node_modules, the way a story copies it next to itself.
// Writes SVG, and PNG when ~/.cache/factory-playwright/svg2png.mjs is installed.
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const ws = mkdtempSync(join(tmpdir(), "make-cards-"));
cpSync(join(ROOT, "skills", "story", "references", "make-charts-template.mjs"), join(ws, "t.mjs"));
symlinkSync(join(ROOT, "site", "stories", "node_modules"), join(ws, "node_modules"), "dir");
const { card, writeCard, round, C, Plot } = await import(join(ws, "t.mjs"));

// annual-fatalities.csv: year, all_hazards, heat, tornado, flash_flood, all_other
const CSV = join(ROOT, "datasets", "climate-and-environment", "us-natural-hazard-statistics", "data", "annual-fatalities.csv");
const [head, ...lines] = readFileSync(CSV, "utf8").trim().split("\n");
const cols = head.split(",");
const rows = lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], Number(v)])));
const fmt = (n) => n.toLocaleString("en-US");
const first = rows[0].year, last = rows.at(-1).year;
const SOURCE = `Source: US National Weather Service, ${first}–${last} (${last} preliminary)`;

// --- Single figure: 2023's heat deaths against the earlier average -------------------------
{
  const y2023 = rows.find((r) => r.year === 2023);
  const before = rows.filter((r) => r.year < 2023);
  const avg = before.reduce((a, r) => a + r.heat, 0) / before.length;
  const times = round(y2023.heat / avg, 1);
  const social = {
    title: `US heat deaths in 2023 were ${times} times the norm`,
    hero: fmt(y2023.heat),
    heroLabel: `deaths from heat in 2023, the most in ${first}–${last}`,
    subtitle: "",
    alt: `Column chart: US heat deaths reached ${fmt(y2023.heat)} in 2023, the most in ${first}–${last} and ${times} times the ${first}–2022 average of ${fmt(round(avg))}. Source: National Weather Service.`,
  };
  const plot = (mode, s) => ({
    x: { type: "band", ticks: [first, 2010, last], tickFormat: "d", padding: 0.18 },
    y: { axis: null, domain: [0, 600] },
    marks: [
      Plot.barY(rows, { x: "year", y: "heat", fill: (d) => (d.year === 2023 ? C.accent : C.context) }),
      Plot.ruleY([avg], { stroke: C.ink, strokeWidth: 4, strokeDasharray: "14 10" }),
      // The one annotation, with a white halo where it crosses the bars.
      Plot.text([avg], { x: 2005, y: avg, text: () => `${first}–2022 average ${fmt(round(avg))}`, dy: -34, textAnchor: "start", fill: C.ink, stroke: C.bg, strokeWidth: 10, fontSize: s.tick, fontWeight: 700 }),
    ],
  });
  writeCard(HERE, "heat-2023-single-figure", card({ slug: "heat", name: "2023", size: "portrait", social, source: SOURCE, plot }));
  writeCard(HERE, "heat-2023-link", card({ slug: "heat", name: "2023-link", size: "link", social, source: SOURCE }));
}

// --- Comparatron: heat against tornadoes, same count, same years ---------------------------
{
  const heat = rows.reduce((a, r) => a + r.heat, 0);
  const tornado = rows.reduce((a, r) => a + r.tornado, 0);
  const ratio = round(heat / tornado, 1);
  const pair = [{ name: "Heat", value: heat }, { name: "Tornadoes", value: tornado }];
  const social = {
    title: `Heat killed ${ratio} times as many Americans as tornadoes`,
    hero: `${ratio}×`,
    heroLabel: `Both are weather-service death counts, ${first}–${last}`,
    subtitle: "",
    alt: `Bar chart: heat killed ${fmt(heat)} people in the US in ${first}–${last}, ${ratio} times the ${fmt(tornado)} killed by tornadoes, in the same National Weather Service count.`,
  };
  const plot = (mode, s) => ({
    x: { axis: null, domain: [0, heat] },
    y: { axis: null, domain: pair.map((d) => d.name), padding: 0.25 },
    marginTop: 8, marginBottom: 8, marginLeft: 0,
    marks: [
      Plot.barX(pair, { y: "name", x: "value", fill: (d) => (d.name === "Heat" ? C.accent : C.context) }),
      Plot.ruleX([0], { stroke: C.ink, strokeWidth: 4 }),
      // Labels inside the heat bar (white on blue, 6.7:1) and just past the tornado bar.
      Plot.text(pair.slice(0, 1), { y: "name", x: 0, dx: 28, text: (d) => `${d.name} ${fmt(d.value)}`, textAnchor: "start", fill: C.bg, fontSize: s.body, fontWeight: 700 }),
      Plot.text(pair.slice(1), { y: "name", x: "value", dx: 20, text: (d) => `${d.name} ${fmt(d.value)}`, textAnchor: "start", fill: C.ink, fontSize: s.body, fontWeight: 700 }),
    ],
  });
  for (const size of ["portrait", "square"]) {
    writeCard(HERE, `heat-vs-tornadoes-comparatron-${size}`, card({ slug: "heat", name: `vs-tornadoes-${size}`, size, social, source: SOURCE, plot }));
  }
}
rmSync(ws, { recursive: true, force: true });
