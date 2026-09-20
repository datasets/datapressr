---
title: What makes a good data story
date: 2026-09-05
---

# What makes a good data story

Use this guide alongside the `story` skill to turn checked findings into a short, readable argument. For wording, see the [voice guide](voice-guide.md); for reproducible charts, see [charting](charting.md).

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
legend is a lookup table; an annotation is the point.

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
reach for scrolly only when the story genuinely has steps. Use [Observable Plot and static SVG](charting.md) for story charts.

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

## Choose the charting approach

Use declarative `datapackage.json` views for initial charts on dataset pages. For an annotated story chart, build static SVG with Observable Plot. Keep the script with the story so the chart can be reproduced. The [charting guide](charting.md) covers the pattern and when a bespoke SVG or interactive page is appropriate.

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
