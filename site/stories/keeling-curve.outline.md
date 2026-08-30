---
title: "Outline: The Keeling Curve"
description: The skeleton this story was built from — argument, order, key numbers, and the chart plan. Committed on purpose (see issue #10).
---

# Outline — The Keeling Curve

*The skeleton. Prose is a rendering of this; if the prose drifts from the argument
here, the prose is wrong. See [#10](https://github.com/datasets/datapressr/issues/10)
for why this is a committed artefact.*

## What this story is about

The Keeling Curve — the measured rise of atmospheric CO₂. **Not** a story about
data wrangling. The wrangling gets a short "how this was made" section at the end
and nothing more.

## Argument, in order

1. **The chart, first.** Annual mean CO₂ at Mauna Loa, 1959–2025. Show it before
   any prose beyond a one-line caption.
2. **What it is.** The longest continuous direct measurement of atmospheric CO₂.
   Started by Charles David Keeling at Mauna Loa in 1958; continued by NOAA and
   Scripps after his death in 2005.
3. **What it says.**
   - 316 ppm in 1959 → 427 ppm in 2025.
   - Up every single year — the annual mean has never fallen.
   - Getting steeper: ~0.9 ppm/yr in the 1960s, ~2.6 ppm/yr in the last decade.
   - Passed 350 ppm around 1988, 400 ppm in 2015.
4. **The sawtooth.** Zoom to monthly data: a ~6 ppm annual oscillation — CO₂ falls
   each northern-hemisphere summer as plants grow, rises again in winter. Keeling
   was first to measure this seasonal breathing. Second chart here.
5. **How this was made.** Brief. The NOAA source is a text file with ~40 comment
   lines and negative "no data" codes; `build.ts` turns it into a clean typed
   table. One paragraph + a link to the dataset. Mention the community-dataset
   column-drift bug in one sentence, link out for detail.
6. **Friction notes** (keep — useful for the skill work): charting was hand-rolled
   SVG because the chart syntax isn't decided; that's the next decision.

## Chart plan

| # | Chart | Data | Purpose |
|---|-------|------|---------|
| 1 | Line, annual mean, 1959–2025, with 350 & 400 ppm reference lines | `co2-annual-mlo.csv` | The headline. Monotonic rise, accelerating. Above the fold. |
| 2 | Line, monthly value + deseasonalized trend, 2010–present | `co2-monthly-mlo.csv` | Show the seasonal sawtooth riding a rising trend. |

Both currently rendered by `make-charts.mjs` (hand-rolled SVG). Replace with a
declarative chart block once that's chosen.

## Voice

Plain and factual. No "most important line in climate science", no "the planet's
breathing", no "relentless". Let the numbers carry it. A "sounds like me" pass is
a separate step the author runs.
