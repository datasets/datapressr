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
import { compare, FORMS, lieFactor, mdx } from "../skills/story/references/compare-template.mjs";

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
  assert.match(b.desktop, /<desc id="aid-pair-desc">Circles side by side, drawn to scale by area: .*Defense \$916bn, Foreign aid \$37\.5bn, 24 to 1\./);
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

test("compare(): a form that cannot hold its labels at this ratio is refused, not drawn badly", () => {
  const items = [{ label: "Fall deaths", value: 48308, display: "48,308" }, { label: "Homicides", value: 20162, display: "20,162" }];
  assert.throws(() => compare({ ...AID, items, form: "nestedSquares" }), /crosses a mark/);
});

test("compare(): a ratio too large to draw as an area (an invisible small mark) throws", () => {
  assert.throws(() => compare({ ...AID, items: [{ label: "A", value: 1e6, display: "1,000,000" }, { label: "B", value: 1, display: "1" }] }), /too small to see/);
});

test("compare(): card.link gives the link card its own line; a no-break space keeps a number with its unit", () => {
  const b = compare({ ...AID, kicker: "One fall death every 11\u00a0minutes", card: { ...AID.card, link: { linkDeck: "Nine in ten were 65 or older.", kicker: "" } } });
  assert.match(b.link, /class="dp-subtitle"[^>]*>Nine in ten/);
  assert.doesNotMatch(b.link, /dp-kicker/);
  assert.match(b.portrait, /dp-kicker/);
  for (const k of ["desktop", "mobile", "portrait"]) assert.doesNotMatch(b[k], />[^<]*\b11<\/text>/, `${k}: "11" split from "minutes"`);
});

test("compare(): circles and the narrow layout are the defaults; layout wide gives the 1024 px figure", () => {
  const b = compare(AID);
  assert.match(b.desktop, /data-dp-compare="circles"[^>]*width="680"/);
  assert.match(b.portrait, /data-dp-compare="circles"/);
  assert.match(compare({ ...AID, layout: "wide" }).desktop, /width="1024"/);
  assert.match(compare({ ...AID, width: 600 }).desktop, /width="600"/);
  assert.throws(() => compare({ ...AID, layout: "tall" }), /layout/);
});

test("compare(): altForm adds the second form for the switcher, checked like the first", () => {
  const b = compare({ ...AID, altForm: "nestedSquares" });
  assert.equal(b.alternative.form, "nestedSquares");
  assert.match(b.alternative.desktop, /data-dp-compare="nestedSquares"/);
  assert.match(b.alternative.alt, /^Nested squares, drawn to scale/);
  for (const k of ["desktop", "mobile"]) assert.ok(Math.abs(b.alternative.lieFactor[k] - 1) < 0.02);
  assert.throws(() => compare({ ...AID, altForm: "circles" }), /altForm/);
});

test("lieFactor: a mark cut off by the canvas edge is measured as seen, and the build refuses it", () => {
  const els = [{ type: "rect", id: "big", x: 0, y: 0, w: 240, h: 240, value: 2.4 }, { type: "rect", id: "small", x: 262, y: 85, w: 155, h: 155, value: 1 }];
  // The pilot's clipped phone figure: 57,600 against 88 x 155 visible, so 4.22 to 1 shown for 2.4.
  assert.ok(Math.abs(lieFactor(els, "area") * 2.4 - 57600 / (155 * 155)) < 0.01);
  assert.ok(Math.abs(lieFactor(els, "area", 350, 300) * 2.4 - 57600 / (88 * 155)) < 0.01);
  const circles = [{ type: "circle", id: "big", cx: 100, cy: 100, r: 100, value: 4 }, { type: "circle", id: "small", cx: 340, cy: 100, r: 50, value: 1 }];
  assert.ok(Math.abs(lieFactor(circles, "area", 340, 300) - 2) < 0.01, "half the small circle is off the canvas");
});

test("compare(): every mark fits the canvas, at every width and ratio (the marks shrink to fit)", () => {
  // Nested squares only where the small square sits clear of the big label (ratio above ~5); the build refuses otherwise.
  const cases = [[48308, 20162, "circles"], [48308, 20162, "sideSquares"], [916, 37.5, "circles"], [916, 37.5, "sideSquares"], [916, 37.5, "nestedSquares"], [3, 2.2, "circles"], [3, 2.2, "sideSquares"]];
  for (const [a, b, form] of cases) for (const width of [560, 680, 800]) {
    const items = [{ label: "Fall deaths", value: a, display: String(a) }, { label: "Homicides", value: b, display: String(b) }];
    const out = compare({ ...AID, items, width, form });
    for (const k of ["desktop", "mobile", "portrait", "square", "link"]) {
      const W = Number(out[k].match(/viewBox="0 0 (\d+)/)[1]);
      for (const m of out[k].matchAll(/<(rect|circle) class="dp-cmp-mark" ([^>]*)\/>/g)) {
        const a = Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => [x[1], Number(x[2])]));
        const right = m[1] === "circle" ? a.cx + a.r : a.x + a.width;
        assert.ok(right <= W + 0.05, `${form} ${width} ${k} ${a}/${b}: mark to ${right} on ${W}`);
      }
    }
  }
});

test("mdx(): the switcher is two radios, two labels and two pictures, CSS via dangerouslySetInnerHTML", () => {
  const m = mdx({ slug: "s", files: { desktop: "s-pair.svg", mobile: "s-pair-mobile.svg", altDesktop: "s-sq.svg", altMobile: "s-sq-mobile.svg" }, alt: "A 24 to 1", altAlt: "B 24 to 1" });
  assert.equal((m.match(/<input type="radio" name="cmp-s"/g) ?? []).length, 2);
  assert.match(m, /id="cmp-s-a" defaultChecked/);
  assert.match(m, /<style dangerouslySetInnerHTML=\{\{ __html: "[^"]*#cmp-s-b:checked~\.cmp-s-a[^"]*display:none/);
  assert.equal((m.match(/<picture className="cmp-s-[ab]">/g) ?? []).length, 2);
  assert.match(m, /srcSet="https:\/\/datahub\.io\/blog\/s\/_r\/-\/s-sq-mobile\.svg"/);
  assert.doesNotMatch(mdx({ slug: "s", files: { desktop: "a.svg", mobile: "b.svg" }, alt: "x 1" }), /radio/);
});

// --- card-hero on comparatron cards -----------------------------------------------------------

test("card-hero: a comparatron card passes on its marks; one mark, a missing value or small marks fail", () => {
  const svg = compare({ ...AID, form: "sideSquares" }).portrait;
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
