# Comparatron: two numbers, drawn to scale

A comparatron changes how the reader sees one number by setting it beside another. Two numbers and nothing else, drawn true to scale, both printed, with one sentence that turns the ratio into something a person can hold. It descends from David McCandless's 2010 Compare-o-Tron mock and the 2020 Comparotron cards; this is the version Rufus approved in November 2026 (Factory `projects/story-formats/sketches/contact-sheet-v3.html`).

Length 150–300 words plus one figure. Retell test: the ratio, correctly directed and scoped, and what was held equal. Format choice and the other short formats: [formats.md](formats.md).

## The direction, distilled

Two numbers and nothing else. One shape family per picture, so the eye compares like with like. The shape's *area* is true to the value, never its height or its diameter. The value is printed on or beside every shape, so the picture can be checked without a legend. One conversion line turns the total into something a person can hold ("a year of aid = 15 days of defense"), so the comparison lands twice: once as a shape, once as a sentence. Colour is used once: a warm near-black mass for the big thing, one vermilion for the small one, which carries the point, and everything else is paper. Generous space around the marks; a serif title, an italic deck, and small, complete sources at the foot. No icons, rings, gradients or second chart. The restraint is the elegance: the reader gets one thing to look at and one thing to read, and they agree.

## Anatomy

| Part | What | Example (US aid, FY2025) |
|---|---|---|
| Title | The claim as a ratio, ≤ 10 words | $24 on defense for every $1 of US foreign aid |
| Deck | Period, scope, "drawn to scale", ≤ 15 words | Fiscal 2025, drawn to scale by area. Economic aid only, military aid excluded. |
| Marks | Two shapes of one family, area ∝ value; the big one in the mass with its value inside, the small one in the accent with its value beside | $916bn, $37.5bn |
| Kicker | The conversion line, its number in the accent | A year of aid = **15 days** of defense |
| Foot strip | Hairline, full source with period and scope, `datahub.io` | Source: OMB and US Treasury, FY2025. … |
| Post | 150–300 words: the finding first, the ratio and both absolutes in words, one fairness line beside the claim, the two-row table, "How this was made" | |

Print values so they reproduce the ratio: $916bn against $37bn reads as 25 to 1; $37.5bn makes the 24 check. `compare()` refuses printed values more than 1% off the drawn ratio.

## The two-row table

Front matter `format: comparatron` turns on story-check's `compare-scope`, which reads this table in the post and fails unless unit, basis and period match, both denominators are stated, and any "per N" rates use the same N.

| Figure | Number | Unit | Basis | Period | Source | Denominator |
|---|---|---|---|---|---|---|
| US national defense | $916bn | US$, current prices | annual outlays, US federal budget | FY2025 | OMB Historical Table 3.2, function 050 | none: national total |
| US economic foreign aid | $37.5bn | US$, current prices | annual outlays, US federal budget | FY2025 | OMB Historical Table 3.2, subfunction 151; Treasury MTS, Economic Support Fund | none: national total |

Two front-matter escapes, each a statement the post must also make to the reader:

- `compare_ratio: "debt equals about 1.2 years of output"`: an explicit stock-to-flow ratio; unit and basis may differ, the period may not.
- `compare_period_note: "both are twelve-month flows; the US fiscal year runs October to September"`: the period cells may differ (a fiscal year against a calendar year). Prefer a pair with one period; use the note only when no such pair exists.

## Fairness checklist

Run every item before drafting; write the answers in NOTES.md. A comparison that fails an item is fixed or dropped, not caveated.

1. **Like for like.** Flow against flow, stock against stock, same scope and accounting basis. Can you truthfully write "both are [kind], for [scope], in [period], from [source], counted the same way"? Stock against flow only as an explicit ratio (`compare_ratio`).
2. **Per head or total.** Pick the one that answers the reader's question and say which; show both if they point different ways.
3. **Time base.** Same period on both sides; never a cumulative figure against one year. A fiscal year against a calendar year is two different periods: prefer one source with one period, and if you must pair them, state it (`compare_period_note`, below).
4. **Nominal or real.** Over time, both real or both as a share of GDP; across countries, same currency and year, market rates or PPP stated.
5. **Fair baseline.** Not peak against trough; a typical year, or show the series.
6. **Bounded sensitivity check** (replaces the old reverse test and its thresholds). Name the one plausible alternative framing most likely to change the finding, compute it from named sources, and record whether the headline stays true and useful. For aid: all international assistance including military aid against Department of Defense military outlays alone (19 to 1 against 24; still the widest since 2018). For energy in CPI: gasoline alone. For China against US emissions: consumption-based, not territorial. "Not in our data, so not quoted" is not a pass. A numeric threshold is a screening heuristic, never the verdict. Put the alternative's result in one sentence of the post.
7. **Say what it is for.** "Aid is 4% of defense outlays" is a fact; "we could fund X by cutting Y" is a policy claim with its own burden. The "so what" describes, never prescribes.

The reviewer (SKILL.md step 4 and editorial-review.md) recomputes the sensitivity alternative from the named sources and answers one question: which comparison would you defend to a sceptic and still repeat?

## Finding the pair

1. **Start from a number the reader already half-holds**, not a dataset: a budget line, a death count, a bill. Write down the reader's likely guess of the yardstick first; that gap is what you are hunting.
2. **List six to eight yardsticks** by type: the same thing elsewhere, the same thing before, the total it sits inside, per person or per day, a thing of the same kind people overrate, a stock-to-flow ratio in years where the stock is the point.
3. **Prefer one table for both numbers** (OMB historical tables, Treasury MTS, BEA, BLS, CDC WONDER, Ember, UN WPP): one source, one period, one definition, and the fairness line writes itself.
4. **Mine our own releases**: every `statistics.json` holds yardsticks nobody has drawn. Check Factory `publications.csv` and `inventory/` so the pair is new.
5. **Hunt the shapes that retell**: a big round ratio (12×, 24 to 1) or a same-size shock (solar ≈ nuclear). Avoid 1.3× unless the ordering is the surprise.
6. **Run the sensitivity check** (item 6 above); keep the pair only if the headline stands.
7. **Attach a dated hook** and the primary URL and licence; every number is "to verify" until fetched from the primary source.
8. **Score** gap, stakes, retell, robustness and visual, 1–5; under 3 on robustness is out whatever the gap.

## Forms

All forms take the same spec; `form` picks one. Every form prints both values and draws true to scale.

| `form` | Encoding | Use when |
|---|---|---|
| `sideSquares` (default) | area | Almost always. Two squares on one baseline: area and height both carry the ratio, and square areas are the easiest areas to judge. Ratios from about 2 to about 400. |
| `nestedSquares` | area | A part against its whole, or to show the leftover (the Billion Dollar-o-Gram move). |
| `circles` | area | A warm, iconic card in the 2020 Comparotron line, when both values are printed large. Circle areas are under-read the most. |
| `nestedCircles` | area | Rarely: one object with a small part marked. Nested areas are the hardest of all to read. |
| `bars` | length | Ratios under about 5, where two areas look alike, and an in-text chart. The most exact and the flattest. |

Beyond about 400 to 1 the small square is a speck (the build throws below 8 px): use bars, a 1-against-N grid of squares, or a time strip ("a year of aid in 15 days") instead.

## Building: `compare()`

`compare-template.mjs` (and `comparatron-fonts.mjs`, the embedded serif) sit beside this file. Copy both next to the story; no npm install is needed, since it writes SVG strings.

```js
// <slug>-make-charts.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compare, writeCompare } from "./compare-template.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(readFileSync(join(HERE, "<slug>-src", "statistics.json"), "utf8"));
const built = compare({
  slug: "<slug>",
  title: "$24 on defense for every $1 of US foreign aid",                   // <= 10 words
  deck: "Fiscal 2025, drawn to scale by area. Economic aid only, military aid excluded.", // <= 15
  items: [
    { label: "Defense", value: S.military_usd_m / 1000, display: "$916bn", unit: "US$ bn" },
    { label: "Foreign aid", value: S.aid_usd_m / 1000, display: "$37.5bn", unit: "US$ bn" },
  ],
  kicker: "A year of aid =\n**15 days** of defense",   // **accent**; \n = preferred break
  kickerNote: "24 to 1, fiscal 2025",                   // optional, desktop only
  source: "Source: OMB and US Treasury, FY2025. Defense outlays (function 050) against economic aid; military aid excluded.",
  form: "sideSquares",
  card: { deck: "Fiscal 2025, drawn to scale. Economic aid only.", source: "Source: OMB, US Treasury, FY2025." },
});
const preview = process.argv.includes("--preview") ? join(HERE, "..", "previews") : null;
await writeCompare(HERE, built, { base: "<slug>-pair", cardBase: "<slug>-card", preview });
console.log(built.alt); // paste into the README's alt text and PROMOTION.md
```

It returns `{ desktop, mobile, portrait, square, link, alt, cardAlt, ratio, lieFactor }`: the blog figure at 1024 px (kicker beside the marks) and 350 px (stacked, drawn 1:1), and cards at 1080×1350, 1080×1080 and 1200×630. `writeCompare` writes `<base>.svg`, `<base>-mobile.svg`, `<cardBase>.svg|png`, `<cardBase>-square.svg|png` and `<cardBase>-link.svg|png`; with `preview` it also renders the figure to PNG (desktop 2×, mobile 1× and 2×) for review. PNGs need Playwright at `~/.cache/factory-playwright`.

**What the build enforces** (it throws, naming the fix): title ≤ 10 words and deck ≤ 15; exactly two positive values; the lie factor, recomputed from the geometry as written, within 2% of 1; every value printed, and the printed values reproducing the ratio within 1%; text contrast 4.5:1 (3:1 at 24 px and up), on white or on the mark it sits on; no text off the canvas or in a card's outer 48 px, no text on text, no text across a mark it is not printed on; nothing under 16 px on desktop, 12 on mobile, 32 on a card (at 1080); a card ≤ 40 words and within its height (marks shrink to fit, to a floor). Cards' deck and source are usually shorter than the figure's: pass them in `card`. `card.link` overrides the 1200×630 card alone: it shows no deck unless given `linkDeck`, and `kicker: ""` drops the kicker there (the falls piece puts its age line there instead). Wrapping uses story-check's own width estimate, so its checks agree with the build; write `\u00a0` between a number and its unit to keep them on one line.

**Type.** The figures embed a subset of Lora 3.008 (SIL OFL, renamed Comparatron Serif as the licence requires; `comparatron-fonts.OFL.txt`), about 75 KB per SVG. The blog shows figures as `<img>`, which cannot load page fonts, so embedding is the only way the serif reaches the reader. Text is measured with the face's own advance widths. Without `comparatron-fonts.mjs` the figures fall back to Georgia. To rebuild the font module, see make-comparatron-fonts.py in the [DataPressr scripts](https://github.com/datasets/datapressr/tree/main/scripts).

**Checks.** story-check treats the figure as a framed chart (`data-dp-frame`) and the cards as cards; on a comparatron card (`data-dp-compare`) `card-hero` asks for the pair of marks (the largest at least 240 px across, every value printed) instead of a hero number.

## Placing it in the post: wide on desktop, stacked on mobile

The blog's text column is 494–667 px on desktop with an empty right-hand column; the figure breaks out into it, keeping the text's left edge (the sticky table of contents is on the left). Tailwind classes in a post are not compiled, so the breakout is an inline style object, which DataHub MDX accepts. Measured on the live blog, 20 Nov 2026: the figure is 1024 px at 1440 and up, 947 at 1280, 754 at 1024, the column width below that.

```mdx
<figure style={{
  margin: "2em 0",
  marginLeft: "min(0px, calc(50% - 0.6 * min(640px, 50vw - clamp(20px, 4vw, 48px))))",
  marginRight: "min(0px, calc(50% - min(640px, 50vw - clamp(20px, 4vw, 48px))))"
}}>
  <picture>
    <source media="(max-width: 767px)" srcSet="https://datahub.io/blog/<slug>/_r/-/<slug>-pair-mobile.svg" />
    <img src="https://datahub.io/blog/<slug>/_r/-/<slug>-pair.svg" alt="<built.alt>" style={{ width: "100%", height: "auto" }} />
  </picture>
</figure>
```

`50%` is half the article's width and `min(640px, 50vw - gutter)` half the container's, so their difference is the distance from the article's right edge to the container's; `min(0px, …)` switches the breakout off below the `lg` breakpoint, where the article already fills the container. The phone figure takes over below 768 px, so the desktop figure is never shown narrower than about 707 px, where its 16 px source line is 11 px. If the site's container (1280 px) or gutter changes, the two numbers change with it; the lasting fix is a `.front-prose figure.wide` rule in datahub-next.

Posts emit no `og:image` yet, so the link card does not show on shared links until that platform fix lands; attach it by hand where a channel allows.
