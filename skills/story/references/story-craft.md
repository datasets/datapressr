# Story craft — what makes a good data story

Packaged with the `story` skill so it works from an installed copy. Distilled from how strong practitioners (FT Visual & Data Journalism, NYT / The Upshot, The Pudding, Our World in Data, Reuters Graphics, The Economist) structure this work, from the first four DataPressr stories (Keeling Curve, Planetary Boundaries, WTI/Brent negative price, a public-finance explainer) and the owner's feedback on them. Opinionated on purpose.

## What a data story is

A short piece of writing that makes **one argument** the data supports, with the chart(s) as evidence you can see. Not a dataset description, not a dashboard, not an analysis notebook. If you can't say the argument in one sentence, there isn't a story yet.

## Patterns

1. **Lead with the finding, not the setup.** The headline chart and a one-line statement of what it shows come first. Background, provenance and method come after the reader knows why to care. The first draft of story #1 opened on the messy source file and read as an article about ETL.
2. **One chart, one idea.** Each chart makes one thing visible. If a chart supports two points, it's usually two charts. (A marker that adds context to the headline — e.g. the next day's value — is fine; a second argument is not.) What a category is made of (mix) and how it moved (change) are two ideas: a composition graphic for one, aligned trends or before/after for the other.
3. **Annotate the chart.** Direct-label lines; mark the moments the prose refers to on the chart, where the eye is. A legend is a lookup table; an annotation is the point. When colour carries meaning, compare like with like — same marker size and fill for both years or series, the key in the same colours (coloured labels) — and pick colours that read at a glance (neutral dark for the baseline, red for the cost or shortfall), not two similar hues; hollow vs filled glyphs are not a key.
4. **Prose and chart say the same thing.** Every data number in the prose should be findable on a chart, and vice versa. Exempt, but listed in the prose's audit: dataset-wide counts, values outside the chart's window that frame it (an all-time low), and attributed external figures. Don't narrate the chart ("then it rises, then dips"); state the conclusion and let the chart corroborate. The converse: a sentence that compares two or three numbers is usually better as a small chart — two aligned bars on a zero baseline read faster than any phrasing.
5. **Default spine: finding → what it is → what it says → wrinkle → method.**
   1. The finding — chart + one line.
   2. What you're looking at — the record, who made it, over what period. Brief. Name the units and what kind of measurement it is (spot vs futures, nominal vs real, monthly mean vs single reading). Say what each source category label means in plain words (what an official category actually covers and pays for) before the reader has to ask.
   3. What it says — 2–4 concrete claims, each a number.
   4. The wrinkle — the caveat or complication. Often a second chart.
   5. How this was made — short, last, skippable. Link the build script and the dataset.
   The spine has held for a single series (Keeling), a multi-indicator scoreboard (Planetary Boundaries) and a two-resource comparison at one moment (WTI/Brent). Not yet tested on a genuinely dashboard-shaped story; if one breaks it, say so in the outline rather than forcing it.
6. **Static first.** Scroll-driven, stepped animation is for a *process* or sequence of states and is expensive to build and maintain. Default to static SVG.
7. **Honesty about limits.** Say what the data can't tell you. One clear caveat beats three confident claims. But a caveat is not an answer: if the reader will ask *why*, go and find the evidence (pattern 8) before settling for "the data doesn't say". In the outline, list the numbers that *weaken* the argument as well as those that make it — story #3's first outline omitted Brent's near-record low the next day, which made the contrast look stronger than it was.
8. **Explanations need a source.** A dataset of values shows *that* something happened, rarely *why*. A mechanism (policy, market structure, demography, physics) is outside context: attribute it to a named source with a link, keep it short, and say the data doesn't test it.
9. **Reproducibility is a feature.** Link the exact build script and note that re-running reproduces the numbers.
10. **Answer the reader's questions, starting with the biggest category.** Before outlining, list the questions a curious reader brings to the topic, and check each is answered. The largest slice is the first thing they ask about: a broad official label is itself a question, so unpack it one level when the data allows. If the reader will want to know "what is growing?", answer it directly with a ranking.
11. **Say what "growing" means, and name the denominator.** A category can rise in money and fall as a share of the economy. Show the amount and the share (or the inflation-adjusted value) together, and name the denominator in the chart title and the sentence, not only in an axis label.

## Anti-patterns

- **The tour of the dataset** — column-by-column narration, no argument.
- **The method memoir** — the wrangling as the story.
- **Chart soup** — many charts, no single one that is *the* chart.
- **The dual-axis trick** — two unrelated series on two y-axes to imply correlation.
- **Decoration** — gradients, shadows, 3D, chartjunk.
- **Fake precision** — more digits than the measurement supports or the reader can parse. Write $2.3 trillion, not $2,314.6 billion; round components to whole billions; keep source precision in the CSV.
- **Wordiness** — sentences that repeat a chart label, or technical definitions in the main narrative. Cut them, or move the detail to a note.
- **Swapping similar-looking numbers** — e.g. a futures settlement price for a spot price, or one outlet's figure for another's. Keep the figure your data actually contains, and name the other one if readers will know it.

## How this maps onto the skill's three artefacts

| Artefact | Locks in | Patterns enforced |
|---|---|---|
| Outline (with chart plan) | the one argument, ordered beats, key numbers (supporting *and* weakening), caveats | 1, 2, 5, 7, 8, 10, 11 |
| Charts | one chart per point, annotated, reproducible | 2, 3, 4, 6, 11 |
| Prose | wording only — the argument is already fixed | 4, voice guide |
