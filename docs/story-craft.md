---
title: What makes a good data story (draft)
date: 2026-09-05
---

# What makes a good data story (draft)

Research notes for the future `story` skill, per
[`skills-roadmap.md`](./skills-roadmap.md) Track B1. Drawn from how the best
practitioners (FT Visual & Data Journalism, NYT / The Upshot, The Pudding, Our
World in Data, Reuters Graphics, The Economist, FiveThirtyEight, Financial Times
Alphaville-style explainers) structure this work, and from what story #1 (the
Keeling Curve) taught. Opinionated on purpose; revisit after story #2.

## What a data story is

A short piece of writing that makes **one argument** the data supports, with the
chart(s) as evidence you can see. It is not a dataset description, not a
dashboard, not an analysis notebook. If you can't say the argument in one
sentence, there isn't a story yet.

## The patterns worth stealing

### 1. Lead with the finding, not the setup

Every strong example puts the payoff first: the headline chart and a one-line
statement of what it shows, above the fold. Background, provenance and method
come *after* the reader knows why they should care. Story #1's first draft
inverted this (opened on the messy source file) and read as an article about ETL
— the single clearest lesson so far.

### 2. One chart, one idea

Each chart earns its place by making *one* thing visible. If a chart supports two
points, it's usually two charts. The Keeling story: chart 1 = "monotonic,
accelerating rise"; chart 2 = "a seasonal cycle rides that trend". Nothing else.

### 3. Annotate the chart; don't make the reader decode a legend

Direct-label lines. Mark the moments the prose refers to (the 350/400 ppm
crossings, a recession, a policy change) *on the chart*, where the eye is. A
legend is a lookup table; an annotation is the point. (This is the main gap in
story #1's current charts — [#12](https://github.com/datasets/datapressr/issues/12).)

### 4. Prose and chart say the same thing, in their own medium

The number in the sentence should be findable on the chart, and vice versa. Don't
narrate the chart line by line ("then it goes up, then down"); state the
conclusion and let the chart corroborate.

### 5. Structure: finding → what it is → what it says → nuance → method

The shape story #1 converged on, and a reasonable default:

1. **The finding** — chart + one line.
2. **What you're looking at** — the record, who made it, over what period. Brief.
3. **What it says** — the 2–4 concrete claims, as a tight list, each a number.
4. **The wrinkle** — the seasonal cycle, the caveat, the thing that complicates
   the headline. Often a second chart.
5. **How this was made** — method, short, last, skippable. Link the `build.ts`
   and the dataset README rather than explaining them.

### 6. Scrollytelling is a cost, not a default

Stepped, scroll-driven animation (NYT/Reuters style) is powerful for a *process*
or a *sequence of states*, and expensive to build and maintain. For a single
time series it's overkill. Default to a static chart (or a light hover-readout);
reach for scrolly only when the story genuinely has steps. The near-term charting
policy ([#11](https://github.com/datasets/datapressr/issues/11)) already says:
hand-rolled SVG / small HTML, iterate freely, don't over-engineer.

### 7. Honesty about limits is part of the craft

The best pieces say what the data can't tell you — coverage gaps, definitional
choices, why a series starts where it does. One clear caveat > three confident
claims. (See the voice guide.)

### 8. Reproducibility is a feature of the story, not just the dataset

Link the exact `build.ts` and note that re-running reproduces the numbers. It
turns "trust me" into "check it". Cheap, and rare enough to be distinctive.

## Anti-patterns (seen in the wild, avoid)

- **The tour of the dataset.** Column-by-column narration with no argument.
- **The method memoir.** The wrangling as the story. (Story #1 draft 1.)
- **Chart soup.** Six charts, no hierarchy, no single one that's *the* chart.
- **The dual-axis trick.** Two unrelated series on one chart with two y-axes to
  imply a correlation. Almost always misleading.
- **Decoration.** Gradients, drop shadows, 3D, chartjunk. Every pixel that isn't
  data is noise.
- **Fake precision.** "427.31 ppm" when the uncertainty is ±0.1.

## Visualisation approach — interim, and the trigger to change it

Three options are on the table for how a story's charts are authored:

| Option | State | Verdict |
|--------|-------|---------|
| `datapackage.json` `views` array | works today on the dataset page | Fine for a quick chart *on a dataset*; too thin for a story (no annotation, no direct labelling, one chart type list). Keep using it for dataset pages, not stories. |
| Hand-rolled inline SVG (`site/stories/make-charts.mjs`) | what story #1 uses | Total control, reproducible, renders anywhere, zero dependencies. Costs the most per chart. Right for now, while the count is low and the look is still being figured out ([#12](https://github.com/datasets/datapressr/issues/12)). |
| A charting library | not yet adopted | The sibling [`line-charts`](https://github.com/datasets/line-charts) bake-off already did the legwork: **Observable Plot** is its pick for "a data story or a one-off analytical chart — best-looking chart per line of code", **Vega-Lite** when the chart needs to be a *published, diffable spec* a non-developer can review. |

**Interim policy (unchanged from [#11](https://github.com/datasets/datapressr/issues/11)):**
make charts that look good by whatever's fastest — hand-rolled SVG now — and
iterate on look and feel. Don't block a story on a charting decision.

**Trigger to adopt a standard:** once (a) the `line-charts` and `tables-bakeoff`
repos are finalised and (b) 2–3 more hand-made stories have shown what actually
recurs (annotation, dark mode, hover readout, small multiples). At that point the
`story` skill's **viz-plan step** names one tool — most likely Observable Plot for
rendering, with Vega-Lite as the "spec you can commit" option — and the skill
carries a small shared chart helper (palette, theme, annotation) rather than each
story re-deriving it. Table embedding in a story follows `tables-bakeoff`'s pick
the same way; it's a rendering detail, decided later, not a blocker.

## How this maps onto the `story` skill

The [#10](https://github.com/datasets/datapressr/issues/10) three-step shape lines
up directly with the patterns above:

| Skill step | What it locks in | Patterns it enforces |
|-----------|------------------|----------------------|
| **Outline** | the one argument, the ordered beats, the key numbers | #1, #2, #5, #7 |
| **Viz plan** | one chart per beat: type, fields, what the reader should see, which annotations | #2, #3, #4, #6 |
| **Prose** | wording only — the argument is already fixed | voice guide, #4 |

Each step is committed and independently reviewable. The argument can be signed
off before any prose effort; the prose can be regenerated or re-voiced from the
outline + viz plan without re-litigating the argument.

## Open questions for story #2

- Does the "finding → what it is → what it says → wrinkle → method" shape hold
  for a *multi-indicator* story (Planetary Boundaries: nine boundaries, not one
  series)? Or does a small-multiples / dashboard story need a different spine?
- Where does a comparison across boundaries (which are crossed, by how much) sit
  — is that the headline chart, or a table?
- How much of the framework's conceptual background (the "safe operating space")
  is needed before the finding, without becoming setup-heavy?
