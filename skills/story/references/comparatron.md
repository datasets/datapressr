# Comparatron: two numbers, drawn to scale

A comparatron changes how the reader sees one number by setting it beside another. Two numbers and nothing else, drawn true to scale, both printed, with one sentence that turns the ratio into something a person can hold. It descends from David McCandless's 2010 Compare-o-Tron mock and the 2020 Comparotron cards; this is the version Rufus approved in November 2026: circles side by side, composed like the portrait card (Factory `projects/story-formats/sketches/contact-sheet-v3.html`, round 3, and his verdict of 21 November).

Length 150–300 words plus one figure. Retell test: the ratio, correctly directed and scoped, and what was held equal. Format choice and the other short formats: [formats.md](formats.md).

## The direction, distilled

Two numbers and nothing else. One shape family per picture, so the eye compares like with like. The shape's *area* is true to the value, never its height or its diameter. The value is printed on or beside every shape, the big one's name under its value inside the mass, so the picture can be checked without a legend. One conversion line turns the total into something a person can hold ("a year of aid = 15 days of defense"), so the comparison lands twice: once as a shape, once as a sentence. Colour is used once: a warm near-black mass for the big thing, one vermilion for the small one, which carries the point, and everything else is paper. Generous space around the marks; a serif title, an italic deck, and small, complete sources at the foot. No icons, rings, gradients or second chart. The restraint is the elegance: the reader gets one thing to look at and one thing to read, and they agree.

## Anatomy

| Part | What | Example (US aid, FY2025) |
|---|---|---|
| Title | The claim as a ratio, ≤ 10 words, true on its own when cropped | $24 on defense for every $1 of US economic aid |
| Deck | Period, scope, "drawn to scale by area", ≤ 15 words | Fiscal 2025, drawn to scale by area. Aid excludes military assistance. |
| Marks | Two circles side by side, area ∝ value; the big one in the mass with its value and name inside, the small one in the accent with its value beside | $916bn, $37.5bn |
| Kicker | The conversion line under the marks, its number in the accent; a quiet note under it | A year of aid = **15 days** of defense / 24 to 1, up from 19 in 2024 |
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

All forms take the same spec; `form` picks one, `altForm` adds a second for the post's switcher. Every form prints both values and draws true to scale.

| `form` | Encoding | Use when |
|---|---|---|
| `circles` (default) | area | Almost always: the 2010 and 2020 Comparotron signature, the calmest of the forms, and Rufus's choice. Circle areas are under-read, so the deck says "by area" and both values are printed. |
| `nestedSquares` | area | The usual switcher alternative, and the form for a part against its whole (the Billion Dollar-o-Gram move). Only above about 5 to 1: closer than that, the small square sits on the big one's label and the build refuses. |
| `sideSquares` | area | The alternative when nested squares cannot be drawn (ratios under about 5), and for square-grid feeds. |

Bars and nested circles still build (`bars`, `nestedCircles`) but are not recommended: bars are exact and flat, and nested circles are the hardest areas of all to read. Beyond about 400 to 1 the small mark is a speck (the build throws below 8 px): use a 1-against-N grid of squares or a time strip ("a year of aid in 15 days") instead.

## Building: `compare()`

`compare-template.mjs` (and `comparatron-fonts.mjs`, the embedded serif) sit beside this file. Copy both next to the story; no npm install is needed, since it writes SVG strings.

```js
// <slug>-make-charts.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compare, mdx, writeCompare } from "./compare-template.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "<slug>";
const S = JSON.parse(readFileSync(join(HERE, `${SLUG}-src`, "statistics.json"), "utf8"));
const built = compare({
  slug: SLUG,
  title: "$24 on defense for every $1 of US economic aid",                  // <= 10 words
  deck: "Fiscal 2025, drawn to scale by area. Aid excludes military assistance.", // <= 15
  items: [
    { label: "Defense", value: S.military_usd_m / 1000, display: "$916bn", unit: "US$ bn" },
    { label: "Economic aid", value: S.aid_usd_m / 1000, display: "$37.5bn", unit: "US$ bn" },
  ],
  kicker: "A year of aid =\n**15 days** of defense",   // **accent**; \n = preferred break
  kickerNote: "24 to 1, up from 19 in 2024",            // optional quiet line under the kicker
  source: "Source: OMB and US Treasury, FY2025. Defense outlays (function 050) against economic aid.",
  form: "circles",                                      // the default
  altForm: "nestedSquares",                             // optional: the switcher's second form
  card: { deck: "Fiscal 2025, to scale. Aid excludes military assistance.", source: "Source: OMB, US Treasury, FY 2025." },
});
const preview = process.argv.includes("--preview") ? join(HERE, "..", "previews") : null;
await writeCompare(HERE, built, { base: `${SLUG}-pair`, cardBase: `${SLUG}-card`, preview });
// The README's figure markup, with the switcher; paste it in place of the old figure.
console.log(mdx({ slug: SLUG, alt: built.alt, altAlt: built.alternative.alt, files: {
  desktop: `${SLUG}-pair.svg`, mobile: `${SLUG}-pair-mobile.svg`,
  altDesktop: `${SLUG}-pair-nested-squares.svg`, altMobile: `${SLUG}-pair-nested-squares-mobile.svg` } }));
```

It returns `{ desktop, mobile, portrait, square, link, alt, cardAlt, ratio, lieFactor, alternative }`. The blog figure is **narrow** by default: the portrait card's vertical composition (title, deck, marks, kicker, note, source) 680 px wide, which sits in the text column (494–667 px on desktop) with no breakout; `width` changes it. `layout: "wide"` gives the earlier 1024 px figure with the kicker beside the marks, placed with the breakout snippet below. The phone figure (350 px, drawn 1:1) has the same composition. Cards are 1080×1350, 1080×1080 and 1200×630; `card.form` can differ from the figure's. With `altForm`, `alternative` holds the figure in the second form, checked like the first. `writeCompare` writes `<base>.svg`, `<base>-mobile.svg`, `<base>-<alt-form>.svg` and `-mobile.svg`, and the cards `<cardBase>.svg|png`, `-square` and `-link`; with `preview` it also renders the figures to PNG for review. PNGs need Playwright at `~/.cache/factory-playwright`.

**What the build enforces** (it throws, naming the fix): title ≤ 10 words and deck ≤ 15; exactly two positive values; every mark wholly on its canvas (the marks shrink to fit the width first); the lie factor, computed from the geometry as written and as visible on the canvas, within 2% of 1; every value printed, and the printed values reproducing the ratio within 1%; text contrast 4.5:1 (3:1 at 24 px and up), on white or on the mark it sits on; no text off the canvas or in a card's outer 48 px, no text on text, no text across a mark it is not printed on; nothing under 16 px on desktop, 12 on mobile, 32 on a card (at 1080); a card ≤ 40 words and within its height. Cards' deck and source are usually shorter than the figure's: pass them in `card`. `card.link` overrides the 1200×630 card alone: it shows no deck unless given `linkDeck`, and `kicker: ""` drops the kicker there (the falls piece puts its age line there instead). Wrapping uses story-check's own width estimate, so its checks agree with the build, and never leaves one word on a last line; write `\u00a0` between a number and its unit to keep them together.

**Type.** The figures embed a subset of Lora 3.008 (SIL OFL, renamed Comparatron Serif as the licence requires; `comparatron-fonts.OFL.txt`), about 75 KB per SVG. The blog shows figures as `<img>`, which cannot load page fonts, so embedding is the only way the serif reaches the reader. Text is measured with the face's own advance widths. Without `comparatron-fonts.mjs` the figures fall back to Georgia. To rebuild the font module, see make-comparatron-fonts.py in the [DataPressr scripts](https://github.com/datasets/datapressr/tree/main/scripts).

**Checks.** story-check treats the figures as framed charts (`data-dp-frame`) and the cards as cards; on a comparatron card (`data-dp-compare`) `card-hero` asks for the pair of marks (the largest at least 240 px across, every value printed) instead of a hero number.

## The switcher: circles by default, nested squares on request

`mdx()` writes the figure markup for the post's README. With an alternative it is a CSS-only switcher: two radio inputs, a quiet line "Drawn as circles · nested squares" whose words are their labels, and two `<picture>`s; a `:checked ~` sibling rule hides the picture not chosen. It needs no JavaScript and no platform change. DataHub renders posts as MDX on the server (`next-mdx-remote-client`, no sanitiser), so `<input>`, `<label>` and `<style>` pass through; the CSS goes in through `dangerouslySetInnerHTML` because React escapes text inside `<style>` (a `>` would become `&gt;`). Without CSS (a feed reader) both figures show, the default first; ids carry the slug, so two switchers can share a page.

Tested on 21 November 2026: the markup compiled through `next-mdx-remote-client` 1.1.4 with datahub-next's remark and rehype plugins and React 18.2 (the versions in its lockfile), then injected into a live datahub.io blog post (its own CSS and layout) with the SVGs served from the package. At 1440 px the circles showed at the column's 667 px; a click on "nested squares" swapped them, and the arrow keys swapped them back; at 390 px the phone SVGs swapped the same way at 350 px, with no sideways scroll. Re-test on the live post after publishing.

## The wide layout: a breakout on desktop

For `layout: "wide"` only (the narrow default needs none of this). The blog's text column is 494–667 px on desktop with an empty right-hand column; the figure breaks out into it, keeping the text's left edge (the sticky table of contents is on the left). Tailwind classes in a post are not compiled, so the breakout is an inline style object, which DataHub MDX accepts. Measured on the live blog, 20 Nov 2026: the figure is 1024 px at 1440 and up, 947 at 1280, 754 at 1024, the column width below that.

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
