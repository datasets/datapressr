// Story formats and chart accessibility (Factory story-formats spec, factory-but.9; library
// distillation gaps 2 and 4): the template palette, mark contrast, alt text, data links,
// social cards and the comparatron scope check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCards, checkChartDesign, contrastRatio, cvdConfusions, simulateCvd } from "./svg-design.mjs";
import { checkAlt, checkCompareScope, checkStoryPackage, imageAlts } from "./story-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "..", "skills", "story", "references", "make-charts-template.mjs");
const GOOD = join(here, "fixtures", "story-package");
const byId = (results, id) => results.find((r) => r.id === id);

// The palette object from the template source, without importing Plot.
function templatePalette() {
  const src = readFileSync(TEMPLATE, "utf8");
  const body = src.match(/export const C = (\{[\s\S]*?\n\});/)[1];
  return new Function(`return ${body}`)();
}

// --- 1. Palette: marks 3:1 (WCAG 1.4.11), accents apart in greyscale and under CVD ---------

test("palette: every mark colour is at least 3:1 on the background; contextFaint is the only exception", () => {
  const C = templatePalette();
  for (const k of ["accent", "accent2", "context", "contextDark", "ink"]) {
    assert.ok(contrastRatio(C[k], C.bg) >= 3, `${k} ${C[k]} is ${contrastRatio(C[k], C.bg).toFixed(2)}:1`);
  }
  assert.ok(contrastRatio(C.contextFaint, C.bg) < 3, "contextFaint is the declared faint-context exception");
  for (const k of ["accentText", "accent2Text", "muted", "faint"]) {
    assert.ok(contrastRatio(C[k], C.bg) >= 4.5, `${k} text ${C[k]} is ${contrastRatio(C[k], C.bg).toFixed(2)}:1`);
  }
});

test("palette: the two accents differ by at least 2:1 in luminance, so they separate in greyscale", () => {
  const C = templatePalette();
  assert.ok(contrastRatio(C.accent, C.accent2) >= 2, `accent/accent2 ${contrastRatio(C.accent, C.accent2).toFixed(2)}:1`);
  // The old pair failed this: #2563eb vs #ea580c is 1.45:1.
  assert.ok(contrastRatio("#2563eb", "#ea580c") < 1.5);
});

test("palette: the accents stay distinct under protanopia, deuteranopia and tritanopia", () => {
  const C = templatePalette();
  assert.deepEqual(cvdConfusions([C.accent, C.accent2]), []);
  assert.deepEqual(cvdConfusions([C.accent, C.context]), []);
  for (const type of ["protanopia", "deuteranopia", "tritanopia"]) {
    const [a, b] = [simulateCvd(C.accent, type), simulateCvd(C.accent2, type)];
    assert.ok(contrastRatio(a, b) >= 1.3, `${type}: simulated ${a} vs ${b} is ${contrastRatio(a, b).toFixed(2)}:1`);
  }
});

// --- 1b. chart-mark-contrast ---------------------------------------------------------------

const svgDoc = (body, { framed = true } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${framed ? 'data-dp-frame="1" ' : ""}role="img" width="360" height="400" viewBox="0 0 360 400" fill="#111827">` +
  `<title>Solar overtook wind</title><rect width="360" height="400" fill="#ffffff"/>` +
  `<text class="dp-title" x="8" y="22" font-size="19" font-weight="700">Solar overtook wind in 2025</text>` +
  `<line class="dp-rule" x1="8" x2="352" y1="370" y2="370" stroke="#e5e7eb"/>` +
  body +
  `<text class="dp-source" x="8" y="390" font-size="13" fill="#4b5563">Source: Ember · Chart: DataHub</text></svg>`;
const mark = (svg) => byId(checkChartDesign([{ path: "c.svg", svg, role: "mobile" }]), "chart-mark-contrast");

test("chart-mark-contrast: the old context grey #b6bcc6 (1.9:1) fails a framed chart; legacy charts only warn", () => {
  const r = mark(svgDoc(`<g aria-label="line" fill="none" stroke="#b6bcc6"><path d="M0,0L9,9"/></g>`));
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /#b6bcc6 is 1\.9:1/);
  assert.equal(mark(svgDoc(`<g aria-label="line" stroke="#b6bcc6"><path d="M0,0L9,9"/></g>`, { framed: false })).severity, "warn");
});

test("chart-mark-contrast: accents, 3:1 greys, white halos, gridlines, rules and declared faint context pass", () => {
  const C = templatePalette();
  const body = [
    `<g aria-label="line" fill="none" stroke="${C.accent}"><path d="M0,0L9,9"/></g>`,
    `<g aria-label="line" fill="none" stroke="${C.context}"><path d="M0,0L9,9"/></g>`,
    `<g aria-label="dot" fill="${C.accent2}" stroke="#ffffff"><circle r="4"/></g>`,
    `<g aria-label="y-grid" stroke="#e5e7eb"><line x1="0" x2="9"/></g>`,
    `<g aria-label="faint context" fill="none" stroke="${C.contextFaint}"><path d="M0,0L9,9"/></g>`,
    `<rect fill="#2563eb" fill-opacity="0.1" width="9" height="9"/>`, // a pale band is structure (< 1.5:1)
  ].join("");
  const r = mark(svgDoc(body));
  assert.equal(r.pass, true, r.message);
});

test("chart-mark-contrast: an accent fill at 45% opacity is a mark below 3:1", () => {
  const r = mark(svgDoc(`<g aria-label="bar" fill="#1d4ed8" fill-opacity="0.45"><rect width="9" height="9"/></g>`));
  assert.equal(r.pass, false);
});

// --- 1c. chart-alt and chart-data-link ----------------------------------------------------

test("imageAlts reads alt text from Markdown images and <img> tags, either attribute order", () => {
  const md = `![Line chart: solar rose to 42% in 2025.](a.svg)\n\n<img alt="Bars: heat 5,366" src="b.svg" />\n<img src="c.svg" />\n`;
  assert.deepEqual(imageAlts(md).map((i) => [i.src, i.alt]), [["a.svg", "Line chart: solar rose to 42% in 2025."], ["b.svg", "Bars: heat 5,366"], ["c.svg", ""]]);
});

test("chart-alt: missing, label-only and 'chart of X' alt text fail; a finding with values passes", () => {
  const md = (alt) => `![${alt}](good-story-share.svg)\n`;
  for (const bad of ["", "Annual growth", "Chart of UK electricity generation by source", "chart.svg"]) {
    const r = checkAlt(md(bad));
    assert.equal(r.pass, false, bad);
    assert.equal(r.severity, "fail", bad);
  }
  assert.equal(checkAlt(md("Line chart: wind overtook coal in UK electricity in 2024, rising from 1% in 2000 to 30%.")).pass, true);
  // A finding without any value warns: the reader of alt text should get the numbers too.
  const r = checkAlt(md("Line chart: wind overtook coal in UK electricity during the last decade."));
  assert.equal(r.pass, false);
  assert.equal(r.severity, "warn");
});

test("chart-data-link: a story that shows charts but links no data file fails", async () => {
  const dir = mkdtempSync(join(tmpdir(), "story-formats-"));
  cpSync(GOOD, dir, { recursive: true });
  const p = join(dir, "README.md");
  writeFileSync(p, readFileSync(p, "utf8").replace(/\[frozen data\]\([^)]*\)/, "frozen data").replace(/```sh[\s\S]*?```/, ""));
  const r = byId(await checkStoryPackage(dir), "chart-data-link");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.equal(byId(await checkStoryPackage(GOOD), "chart-data-link").pass, true);
  rmSync(dir, { recursive: true, force: true });
});

// --- 4. card-* ------------------------------------------------------------------------------

const cardSvg = ({ w = 1080, h = 1350, title = "Heat tops tornadoes", hero = "2.5×", extra = "", source = "Source: NWS, US deaths 1997–2025", mark = true, heroSize = 320 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" data-dp-card="portrait" role="img" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="#111827">` +
  `<title>${title}</title><rect width="${w}" height="${h}" fill="#ffffff"/>` +
  `<text class="dp-title" x="72" y="160" font-size="84" font-weight="700">${title}</text>` +
  (hero ? `<text class="dp-hero" x="72" y="520" font-size="${heroSize}" font-weight="800" fill="#1d4ed8">${hero}</text>` : "") +
  `<text class="dp-subtitle" x="72" y="620" font-size="44" fill="#4b5563">US deaths, 1997–2025</text>` +
  extra +
  `<text class="dp-source" x="72" y="${h - 72}" font-size="34" fill="#6b7280">${source}</text>` +
  (mark ? `<text class="dp-mark" x="${w - 72}" y="${h - 72}" text-anchor="end" font-size="34" font-weight="700">datahub.io</text>` : "") +
  `</svg>`;
const card = (svg) => checkCards([{ path: "c-card.svg", svg }]);

test("card checks: a good card passes every card-* check", () => {
  const res = card(cardSvg());
  assert.deepEqual(res.map((r) => r.id).sort(), ["card-contrast", "card-hero", "card-safe-zone", "card-self-contained", "card-text-size", "card-words"]);
  assert.deepEqual(res.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`), []);
});

test("card-text-size: text under 32 px at 1080 wide fails (11.5 px in a 390 px feed)", () => {
  const r = byId(card(cardSvg({ extra: `<text x="72" y="700" font-size="24">small print</text>` })), "card-text-size");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /24 px/);
});

test("card-words: more than 40 words, or a title over 10 words, fails", () => {
  const many = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
  assert.equal(byId(card(cardSvg({ extra: `<text x="72" y="700" font-size="40">${many}</text>` })), "card-words").pass, false);
  const long = byId(card(cardSvg({ title: "Heat killed far more Americans than tornadoes did over these twenty nine years" })), "card-words");
  assert.equal(long.pass, false);
  assert.match(long.message, /title/);
});

test("card-safe-zone: text inside the outer 48 px fails", () => {
  const r = byId(card(cardSvg({ extra: `<text x="20" y="700" font-size="40">edge</text>` })), "card-safe-zone");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /"edge"/);
});

test("card-hero: no hero, a small hero or two heroes fail", () => {
  assert.equal(byId(card(cardSvg({ hero: "" })), "card-hero").pass, false);
  assert.equal(byId(card(cardSvg({ heroSize: 120 })), "card-hero").pass, false);
  const two = byId(card(cardSvg({ extra: `<text class="dp-hero" x="72" y="900" font-size="300">14×</text>` })), "card-hero");
  assert.equal(two.pass, false);
  assert.match(two.message, /2 hero/);
});

test("card-self-contained: no source or no DataHub mark fails; no year in the text warns", () => {
  assert.equal(byId(card(cardSvg({ mark: false })), "card-self-contained").severity, "fail");
  assert.equal(byId(card(cardSvg({ source: "Chart: DataHub" })), "card-self-contained").pass, false);
  const noYear = cardSvg().replace(/1997–2025/g, "all years");
  const r = byId(card(noYear), "card-self-contained");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "warn");
});

test("story-check runs card checks on *.svg cards in the package and keeps them out of the chart checks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "story-formats-"));
  cpSync(GOOD, dir, { recursive: true });
  writeFileSync(join(dir, "good-story-card.svg"), cardSvg({ extra: `<text x="72" y="700" font-size="24">small print</text>` }));
  const results = await checkStoryPackage(dir);
  assert.equal(byId(results, "card-text-size").pass, false);
  assert.doesNotMatch(byId(results, "chart-text-size").message, /card/);
  rmSync(dir, { recursive: true, force: true });
});

// --- compare-scope ----------------------------------------------------------------------------

const comparatron = (rows, extra = "") => [
  "---", "title: Heat killed 2.5 times as many as tornadoes", "description: x", "date: 2026-11-14", "format: comparatron", "---", "",
  "| Figure | Number | Unit | Basis | Period | Source | Denominator |",
  "|---|---|---|---|---|---|---|",
  ...rows, "", extra,
].join("\n");
const heat = "| Heat deaths | 5,366 | deaths | NWS Storm Data, attributed | 1997–2025 | NWS | US population (not divided) |";
const tornado = "| Tornado deaths | 2,167 | deaths | NWS Storm Data, attributed | 1997–2025 | NWS | US population (not divided) |";

test("compare-scope: a comparatron with matching unit, basis and period and a stated denominator passes", () => {
  const r = checkCompareScope(comparatron([heat, tornado]));
  assert.equal(r.pass, true, r.message);
});

test("compare-scope: mismatched period, unit or basis, or a blank denominator, fails", () => {
  const cases = [
    [tornado.replace("1997–2025", "2011"), /period/],
    [tornado.replace("| deaths |", "| deaths per million |"), /unit/],
    [tornado.replace("NWS Storm Data, attributed", "CDC death certificates"), /basis/],
    [tornado.replace("US population (not divided) |", " |"), /denominator/],
  ];
  for (const [row, why] of cases) {
    const r = checkCompareScope(comparatron([heat, row]));
    assert.equal(r.pass, false, row);
    assert.equal(r.severity, "fail");
    assert.match(r.message, why);
  }
});

test("compare-scope: a comparatron without the two-row table fails; other formats are not checked", () => {
  assert.equal(checkCompareScope(comparatron([])).pass, false);
  assert.equal(checkCompareScope(comparatron([heat])).pass, false);
  assert.equal(checkCompareScope("---\ntitle: T\n---\n\nText."), null);
});

// --- 2. The template's social mode -------------------------------------------------------------

const STORY_MODULES = join(here, "..", "site", "stories", "node_modules");
const needsPlot = { skip: !existsSync(join(STORY_MODULES, "@observablehq", "plot")) && "site/stories not installed" };
async function loadTemplate() {
  const ws = mkdtempSync(join(tmpdir(), "card-template-"));
  cpSync(TEMPLATE, join(ws, "t.mjs"));
  symlinkSync(STORY_MODULES, join(ws, "node_modules"), "dir");
  return { t: await import(join(ws, "t.mjs")), ws };
}

test("social mode: card() output passes every card check at 1080×1350, 1080×1080 and 1200×630", needsPlot, async () => {
  const { t, ws } = await loadTemplate();
  const rows = [{ name: "Heat", value: 5366 }, { name: "Tornadoes", value: 2167 }];
  const social = {
    title: "Heat killed 2.5 times as many Americans as tornadoes",
    hero: "2.5×",
    heroLabel: "5,366 heat deaths against 2,167 from tornadoes",
    subtitle: "US deaths attributed by the weather service, 1997–2025",
    alt: "Bar chart: heat killed 5,366 people in the US in 1997–2025, 2.5 times the 2,167 killed by tornadoes. Source: NWS.",
  };
  const plot = (mode, s) => ({
    x: { axis: null }, y: { axis: null },
    marks: [t.Plot.barX(rows, { y: "name", x: "value", fill: (d) => (d.name === "Heat" ? t.C.accent : t.C.context) })],
  });
  assert.deepEqual(Object.keys(t.CARD_SIZES).sort(), ["link", "portrait", "square"]);
  for (const size of ["portrait", "square", "link"]) {
    // A square card holds less text: the bars carry the two values, so it drops the hero label.
    const svg = t.card({ slug: "heat", name: "vs-tornado", size, social: size === "square" ? { ...social, heroLabel: "" } : social, source: "Source: NWS weather fatality statistics, 1997–2025", plot });
    const [w, h] = t.CARD_SIZES[size];
    assert.match(svg, new RegExp(`viewBox="0 0 ${w} ${h}"`));
    assert.match(svg, /data-dp-card=/);
    const res = checkCards([{ path: `${size}.svg`, svg }]);
    assert.deepEqual(res.filter((r) => !r.pass).map((r) => `${size} ${r.id}: ${r.message}`), []);
    assert.match(svg, /<desc[^>]*>Bar chart: heat killed 5,366/);
  }
  rmSync(ws, { recursive: true, force: true });
});

test("social mode: the build fails without the social overrides, with a long title, or over 40 words", needsPlot, async () => {
  const { t, ws } = await loadTemplate();
  const base = { slug: "s", source: "Source: NWS" };
  const social = { title: "Heat deaths tripled", hero: "555", heroLabel: "in 2023", subtitle: "US, 1997–2025", alt: "Heat deaths reached 555 in 2023." };
  assert.throws(() => t.card({ ...base }), /social/);
  assert.throws(() => t.card({ ...base, social: { ...social, hero: undefined } }), /hero/);
  assert.throws(() => t.card({ ...base, social: { ...social, alt: "" } }), /alt/);
  assert.throws(() => t.card({ ...base, social: { ...social, title: "one two three four five six seven eight nine ten eleven" } }), /10 words/);
  assert.throws(() => t.card({ ...base, social: { ...social, heroLabel: Array.from({ length: 40 }, () => "w").join(" ") } }), /40 words/);
  rmSync(ws, { recursive: true, force: true });
});
