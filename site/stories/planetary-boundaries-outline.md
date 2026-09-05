---
title: "Outline: Planetary Boundaries"
description: The skeleton for data story #2 — argument, order, key numbers, chart plan. Committed on purpose (see issue #10).
---

# Outline — Planetary Boundaries

*The skeleton. Prose is a rendering of this; if the prose drifts from the argument
here, the prose is wrong. See [#10](https://github.com/datasets/datapressr/issues/10).*

*Story #2, written the [#10](https://github.com/datasets/datapressr/issues/10) way:
this outline and the chart plan are committed before any prose. Data story #1 (the
[Keeling Curve](keeling-curve.md)) was the first pass at this workflow; this is the
second.*

## What this story is about

The planetary boundaries framework and where the nine boundaries stand now: **six
are crossed**. It's a story about a scoreboard — a comparison across indicators at
one moment — with one time series (ozone) as the counter-note. **Not** a story
about the dataset or how it was assembled; that's one short paragraph near the end.

## Argument, in order

1. **The scoreboard, first.** One chart, every indicator, current value against its
   safe boundary. Show it before any prose beyond a one-line caption.
2. **What the framework is.** Nine Earth-system processes (climate, biosphere,
   freshwater, land, nutrient cycles, ocean acidification, ozone, aerosols, novel
   entities), each with a quantified "safe operating space" — a boundary value and
   a zone of uncertainty beyond it. Crossing a boundary raises the risk of
   pushing the Earth system out of the stable Holocene state agriculture and
   cities grew up in. Introduced 2009 (Rockström et al.), quantified 2015
   (Steffen et al., *Science*), updated 2023 (Richardson et al., *Science
   Advances*). Keep this to a short paragraph.
3. **What the data says.**
   - **6 of 9 boundaries are crossed** — 9 of the 12 measured sub-indicators are
     past their boundary value.
   - The three still inside the safe zone: **stratospheric ozone**, **ocean
     acidification**, and **atmospheric aerosol loading**.
   - The overshoot is largest for **biosphere integrity**: genetic diversity is
     running at ~150 extinctions per million species-years against a boundary of
     10 — about 15× over. **Novel entities** (synthetic chemicals, plastics) sits
     at ~50 on a scale where the boundary is 0, and was only assessed for the
     first time in 2022.
   - The framework has added crossings over time, not removed them — green-water
     freshwater and novel entities are recent additions to the "crossed" list.
   - Climate change crossed its boundary — **350 ppm CO₂** — around **1988**, the
     same crossing marked in the [Keeling Curve](keeling-curve.md) story. Current
     value ~428 ppm against a 350 ppm boundary.
4. **The counter-note: ozone came back.** Stratospheric ozone thinned through the
   1980s–90s toward the boundary as CFCs accumulated; after the 1987 Montreal
   Protocol it stopped falling and is now recovering, inside the safe zone. Second
   chart: the ozone series dipping and recovering, boundary and zone shaded. The
   point: a boundary is not a one-way ratchet. Where policy acts on a clear
   cause, a trend can reverse. This is the honest complication, not a
   feel-good coda — it's one boundary out of nine, and the cause (CFCs) was
   unusually tractable.
5. **How this was made.** Brief. The story consumes the published
   [`planetary-boundaries`](https://datahub.io/climate-and-environment/planetary-boundaries)
   dataset (Steffen/Richardson science plus a temporal-evolution compilation by
   Bastien Gauthier). No wrangling here — a dated snapshot is in
   `planetary-boundaries-src/`. One paragraph + links.
6. **Friction notes** (keep — for the skill work):
   - The headline is a *comparison across indicators*, not a time series. That
     wants a different chart shape (ranged dot / bar against a reference band)
     than story #1's line, and hand-rolled SVG makes small-multiples or a
     ranged-bar chart more laborious than a single line. First real pull toward
     adopting a charting library (Observable Plot per the
     [line-charts bake-off](https://github.com/datasets/line-charts)).
   - Units differ per indicator (ppm, DU, Tg/yr, %, E/MSY…), so the scoreboard
     chart has to normalise (value ÷ boundary) to put them on one axis — a
     modelling choice the story must state.
   - Naming collision found while sourcing this: there are now two
     `project-drawdown` datasets in the `datasets` org (our 2020-vintage repo and
     a 2024-vintage one inside `datasets/climate-and-environment`). Noted for
     triage, unrelated to this story.

## Chart plan

| # | Chart | Data | Purpose |
|---|-------|------|---------|
| 1 | **Scoreboard.** One row per sub-indicator (12), a dot at `current_value ÷ boundary_value` on a log-ish axis, a reference line at 1.0 (the boundary), the uncertainty zone as a light band, rows sorted by ratio, colour = exceeded / safe. | `boundaries.csv` | The headline: which boundaries are crossed and by how much, all 12 in one view. Above the fold. |
| 2 | **Ozone, dipping and recovering.** Line, stratospheric ozone in Dobson units, ~1960–2025, boundary (276 DU) and zone shaded, Montreal Protocol (1987) marked. | `boundary-evolution.csv`, `boundary_id = 3.0` | The counter-note: a boundary approached, then pulled back by policy. |

Alternative headline considered: small multiples of all 12 trajectories, each
normalised to its boundary. Stronger in principle, much heavier to hand-roll —
deferred unless a library lands first. If built, it replaces chart 1.

Charts rendered by a `make-charts.mjs` alongside the story (hand-rolled SVG), same
as story #1 — see friction notes.

## Voice

Plain and factual, per [`docs/voice-guide.md`](../../docs/voice-guide.md). Let the
count — six of nine — carry it. No "humanity on the brink", no "tipping point"
unless the source uses it precisely. The ozone section is allowed to note the
recovery plainly; it is not allowed to become uplift. A "sounds like me" pass is a
separate step the author runs.
