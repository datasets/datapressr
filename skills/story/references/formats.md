# Story formats: data story, single figure, comparatron, social card

One objective for all four: the most people who can retell the finding the next day, every claim true. Accuracy is a gate, not a score; past the gate, hedging is a defect in every format, and worst in the short ones. Source: the Factory story-formats spec (with exemplars) and its objective-function plan, both 2026-11-14.

## The four formats

| | Data story | Single figure | Comparatron | Social card |
|---|---|---|---|---|
| **Job** | Argue one finding with visible evidence | Lodge one number the reader can't un-know | Change how the reader sees one number by setting it beside another | One claim read in three seconds, screenshotted |
| **Size** | 800–1,200 words, 2–5 charts | 120–250 words, one figure | 150–300 words, one figure | ≤ 40 words on the image, ≤ 5 cards |
| **Visual** | `chart()` | A typeset hero number plus a sparkline or one reference | `compare()`: two circles drawn to scale by area, both values printed, a conversion line | `card()`: 1080×1350 (default), 1080×1080, 1200×630 link card |
| **Retell test** | "US measles cases are the highest since 1991 and twice last year" | The number *with* its denominator and comparison: "aid is about 1% of federal spending, not a quarter" | The ratio, correctly directed and scoped, and what was held equal | Shown for three seconds without the caption, the reader states the claim |

**When to use which.** One finding that needs an argument, a tension and counter-evidence: a data story. One number whose size surprises (it beats the reader's guess by more than their confidence): a single figure. A number that only means something beside another, and the pair survives the sensitivity check in [comparatron.md](comparatron.md): a comparatron. Any of the three, for a feed: cards. If a short format needs more than one *necessary* caveat, narrow the claim or make it a story.

## Spin-offs: after every data story

Once the story is drafted (SKILL.md step 4b), propose in NOTES.md:

1. **One or two short formats**: a single figure (the headline number plus its yardstick) or a comparatron (the "compared with what" the argument turns on). Each with its hero number, its comparison clause and, for a comparatron, the two-row table from [comparatron.md](comparatron.md) filled in.
2. **One to three social cards**: card 1 is the claim with its comparison, alone; cards 2–3 the "compared with what" and the "so what", same scale and colours. Never a title card first; never a comparison split across cards.

Every value comes from the story's data rows, as in the charts. Cards post 1–3 days after the story and link back to it.

## Single figure: outline

- **Hero number** with its unit, two significant figures unless the third changes the story ("555", "$66bn", "1%").
- **Comparison clause**, same sentence: per person, per day, against history or a reference ("deaths in 2023, 3.5 times the 1997–2022 average").
- **Stakes**: one sentence.
- **Visual**: the hero typeset large, plus a word-sized history (sparkline or bars, ends labelled) or one reference value. It shows magnitude; it never decorates.
- **Source and period line**; 120–250 words below with the one necessary caveat and the data link.
- Alt text: the hero sentence plus both reference values.

Failure modes: a total with no denominator; a nominal record that recurs every year; precision theatre (99.8%); a cherry-picked window.

## Comparatron

[comparatron.md](comparatron.md) is the method: the approved design and its anatomy, the two-row table that `compare-scope` reads, the fairness checklist with the bounded sensitivity check, how to find a pair, the forms, `compare()` in `compare-template.mjs` (the blog figure, its phone version and three cards from one spec), and `mdx()`, the post markup with a CSS-only switcher between circles and nested squares.

## Social cards: the template's `card()`

`card({ slug, name, size, social, source, plot })` in `make-charts-template.mjs`, or `social` overrides on a `chart()` spec, which then also returns `.card`. A card is not a resized chart: the build throws without `social.title` (≤ 10 words, the claim), `social.hero` (the number), `social.alt`, and a source line, or with more than 40 words on the card. `heroLabel` is the comparison clause; `subtitle` is measure, unit, place and period. `plot(mode, t)` gets mode `"social"` and `T.social`: one chart, ≤ 3 series, direct labels, no legend, ≤ 1 annotation, strokes `t.stroke`, dots `t.r`. `writeCard(dir, file, svg)` writes the SVG and, where `~/.cache/factory-playwright/svg2png.mjs` exists, the PNG. Worked examples: [DataPressr's example cards](https://github.com/datasets/datapressr/tree/main/docs/examples/story-formats), a single figure and a comparatron from the NWS weather-deaths data.

Type tiers at 1080 wide: hero 240–400 px (the only thing that survives a 125 px profile grid), title 72–96 (reads in a 390 px feed), labels 40–48, nothing below 32 (11.5 px in a feed), source line included. 72 px margins; nothing in the outer 48 px. The foot strip carries the source with its period, and the DataHub mark. Card 1 doubles as the post's promo image. Alt text (chart type, claim, two to four values, source) goes in `PROMOTION.md`; Instagram caps it near 100 characters, so there the claim and two values only. Look at every card at full size and at about 300 px wide before shipping.

## Checks

`story-check` on the package: `card-text-size`, `card-words`, `card-safe-zone`, `card-hero` (one hero number, the largest text), `card-self-contained` (source line and mark; warns without a year) and `card-contrast` for every card SVG (a comparatron card's `card-hero` reads its marks); `compare-scope` for a comparatron. All FAIL except the missing-year warning.
