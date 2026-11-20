// Comparatron (skills/story/references/compare-template.mjs, comparatron.md): compare() output
// passes story-check's chart and card checks, its build-time rules throw, card-hero reads a
// comparatron card's marks, compare-scope accepts a period note, and chart() cards take their own
// source line (datapressr-fnl.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCards, checkChartDesign } from "./svg-design.mjs";
import { checkCompareScope } from "./story-check.mjs";
import { compare, FORMS, lieFactor } from "../skills/story/references/compare-template.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const byId = (results, id) => results.find((r) => r.id === id);
const failing = (results) => results.filter((r) => !r.pass && r.severity === "fail").map((r) => `${r.id}: ${r.message}`);

// The aid piece (Factory pilot-1, us-aid-vs-military-2025), FY2025 OMB outlays in $bn.
const AID = {
  slug: "aid",
  title: "$24 on defense for every $1 of US foreign aid",
  deck: "Fiscal 2025, drawn to scale by area. Economic aid only, military aid excluded.",
  items: [{ label: "Defense", value: 916.14, display: "$916bn" }, { label: "Foreign aid", value: 37.49, display: "$37.5bn" }],
  kicker: "A year of aid =\n**15 days** of defense",
  kickerNote: "24 to 1, fiscal 2025",
  source: "Source: OMB and US Treasury, FY2025. Defense outlays (function 050) against economic aid; military aid excluded.",
  card: { deck: "Fiscal 2025, drawn to scale. Economic aid only.", source: "Source: OMB, US Treasury, FY2025." },
};

test("compare(): every form builds all five outputs, and they pass story-check's chart and card checks", () => {
  for (const form of Object.keys(FORMS)) {
    const b = compare({ ...AID, form });
    for (const k of ["desktop", "mobile", "portrait", "square", "link"]) assert.match(b[k], /^<svg /, `${form} ${k}`);
    assert.match(b.desktop, /data-dp-frame="1"/);
    assert.match(b.portrait, /data-dp-card="portrait" data-dp-compare=/);
    const charts = checkChartDesign([{ path: "a-pair.svg", role: "desktop", svg: b.desktop }, { path: "a-pair-mobile.svg", role: "mobile", svg: b.mobile }]);
    assert.deepEqual(failing(charts), [], form);
    const cards = checkCards(["portrait", "square", "link"].map((k) => ({ path: `${k}.svg`, svg: b[k] })));
    assert.deepEqual(failing(cards), [], form);
    assert.equal(byId(cards, "card-hero").pass, true, form);
  }
});

test("compare(): the lie factor read back from the written SVG is within 2% of 1", () => {
  for (const form of Object.keys(FORMS)) {
    const b = compare({ ...AID, form });
    for (const k of ["desktop", "mobile", "portrait", "square", "link"]) {
      const marks = [...b[k].matchAll(/<(rect|circle) class="dp-cmp-mark" ([^>]*)\/>/g)].map(([, tag, attrs]) => {
        const a = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], Number(m[2])]));
        return tag === "circle" ? { area: Math.PI * a.r ** 2, len: 2 * a.r, value: a["data-value"] } : { area: a.width * a.height, len: a.width, value: a["data-value"] };
      });
      assert.equal(marks.length, 2);
      const [big, small] = marks.sort((x, y) => y.value - x.value);
      const drawn = FORMS[form].encoding === "length" ? big.len / small.len : big.area / small.area;
      const lf = drawn / (big.value / small.value);
      assert.ok(Math.abs(lf - 1) < 0.02, `${form} ${k}: LF ${lf}`);
      assert.ok(Math.abs(b.lieFactor[k] - 1) < 0.02);
    }
  }
});

test("compare(): embeds the serif, with a <title> and a <desc> giving both values and the ratio", () => {
  const b = compare(AID);
  assert.match(b.desktop, /@font-face\{font-family:'Comparatron Serif'/);
  assert.match(b.desktop, /<desc id="aid-pair-desc">Side-by-side squares, drawn to scale by area: .*Defense \$916bn, Foreign aid \$37\.5bn, 24 to 1\./);
  assert.match(b.alt, /A year of aid = 15 days of defense/);
});

test("compare(): the build throws on a long title or deck, a wrong item count, a too-rounded value, a pale accent", () => {
  assert.throws(() => compare({ ...AID, title: "one two three four five six seven eight nine ten eleven" }), /title is 11 words/);
  assert.throws(() => compare({ ...AID, deck: Array.from({ length: 16 }, (_, i) => `w${i}`).join(" ") }), /deck is 16 words/);
  assert.throws(() => compare({ ...AID, items: AID.items.slice(0, 1) }), /exactly two/);
  assert.throws(() => compare({ ...AID, items: [AID.items[0], { ...AID.items[1], value: 0 }] }), /positive value/);
  // $916bn / $37bn = 24.8 to 1, but the data give 24.4: the printed values must reproduce the ratio.
  assert.throws(() => compare({ ...AID, items: [AID.items[0], { ...AID.items[1], display: "$37bn" }] }), /one more digit/);
  assert.throws(() => compare({ ...AID, accent: "#f4a582" }), /needs 4\.5:1/);
  assert.throws(() => compare({ ...AID, form: "pie" }), /form must be one of/);
});

test("compare(): a card over 40 words, or one that cannot fit its height, throws", () => {
  assert.throws(() => compare({ ...AID, card: { deck: AID.deck, source: AID.source } }), /words on the card/);
  const long = "A year of aid is fifteen days of defense, and it was ten a few years earlier, so the gap widened";
  assert.throws(() => compare({ ...AID, card: { ...AID.card, kicker: long } }), /overflows|words on the card|title and kicker/);
});

test("compare(): a ratio too large to draw as an area (an invisible small mark) throws", () => {
  assert.throws(() => compare({ ...AID, items: [{ label: "A", value: 1e6, display: "1,000,000" }, { label: "B", value: 1, display: "1" }] }), /too small to see/);
});

// --- card-hero on comparatron cards -----------------------------------------------------------

test("card-hero: a comparatron card passes on its marks; one mark, a missing value or small marks fail", () => {
  const svg = compare(AID).portrait;
  const hero = (s) => byId(checkCards([{ path: "c.svg", svg: s }]), "card-hero");
  assert.equal(hero(svg).pass, true);
  assert.equal(hero(svg.replace(/<rect class="dp-cmp-mark"[^>]*data-value="37.49"\/>/, "")).pass, false);
  assert.match(hero(svg.replace(/class="dp-cmp-value"([^>]*)>\$37\.5bn/, 'class="x"$1>$37.5bn')).message, /printed value/);
  const tiny = svg.replace(/(class="dp-cmp-mark" x="[\d.]+" y="[\d.]+" )width="[\d.]+" height="[\d.]+"/g, '$1width="100" height="100"');
  assert.match(hero(tiny).message, /largest mark/);
});

// --- compare-scope period note ----------------------------------------------------------------

const comparatron = (rows, front = "") => [
  "---", "title: T", "description: x", "date: 2026-11-20", "format: comparatron", front, "---", "",
  "| Figure | Number | Unit | Basis | Period | Source | Denominator |",
  "|---|---|---|---|---|---|---|",
  ...rows,
].join("\n");
const mil = "| SIPRI military | $954bn | US$ | annual spending | US fiscal year 2025 | SIPRI | none: national total |";
const oda = "| OECD ODA | $29bn | US$ | annual spending | calendar 2025 | OECD | none: national total |";

test("compare-scope: differing period cells fail without a note and pass with compare_period_note", () => {
  const without = checkCompareScope(comparatron([mil, oda]));
  assert.equal(without.pass, false);
  assert.match(without.message, /compare_period_note/);
  const withNote = checkCompareScope(comparatron([mil, oda], 'compare_period_note: "both twelve-month flows: the US fiscal year runs October to September"'));
  assert.equal(withNote.pass, true, withNote.message);
  assert.match(withNote.message, /periods differ with a note/);
  // The note excuses the period only: a unit mismatch still fails, and a blank period still fails.
  assert.equal(checkCompareScope(comparatron([mil, oda.replace("| US$ |", "| US$ per person |")], "compare_period_note: x")).pass, false);
  assert.equal(checkCompareScope(comparatron([mil, oda.replace("calendar 2025", " ")], "compare_period_note: x")).pass, false);
});

// --- fnl.1: chart({ social }) cards take social.source -------------------------------------------

const STORY_MODULES = join(here, "..", "site", "stories", "node_modules");
const needsPlot = { skip: !existsSync(join(STORY_MODULES, "@observablehq", "plot")) && "site/stories not installed" };

test("chart({ social }): the card uses social.source, not the chart's long source line (fnl.1)", needsPlot, async () => {
  const ws = mkdtempSync(join(tmpdir(), "fnl1-"));
  cpSync(join(here, "..", "skills", "story", "references", "make-charts-template.mjs"), join(ws, "t.mjs"));
  symlinkSync(STORY_MODULES, join(ws, "node_modules"), "dir");
  const t = await import(join(ws, "t.mjs"));
  const rows = [{ name: "Heat", value: 5366 }, { name: "Tornadoes", value: 2167 }];
  const long = "Source: US National Weather Service, weather fatality statistics, annual summaries 1997–2025, deaths directly attributed to each hazard; 2025 preliminary";
  const built = t.chart({
    slug: "heat", name: "pair", title: "Heat killed 2.5 times as many as tornadoes", subtitle: "US deaths, 1997–2025", source: long, alt: "Bars: 5,366 against 2,167",
    plot: () => ({ marks: [t.Plot.barX(rows, { y: "name", x: "value" })] }),
    social: { title: "Heat killed 2.5 times as many as tornadoes", hero: "2.5×", heroLabel: "5,366 against 2,167", alt: "Heat 5,366, tornadoes 2,167", source: "Source: NWS, 1997–2025" },
  });
  assert.match(built.card, /Source: NWS, 1997–2025/);
  assert.doesNotMatch(built.card, /annual summaries/);
  assert.match(built.desktop, /annual summaries/);
  rmSync(ws, { recursive: true, force: true });
});
