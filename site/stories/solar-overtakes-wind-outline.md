---
publish: false
title: "Outline: Solar Overtakes Wind, and Climbs to 8.7% of World Electricity"
description: The skeleton this story is built from — argument, order, key numbers, chart plan. Committed on purpose, before any chart or prose work.
---

# Outline — Solar Overtakes Wind, and Climbs to 8.7% of World Electricity

*The skeleton. The prose is a rendering of this; if the prose drifts from the argument here, the prose is wrong.*

*Captured as a story candidate in [datapressr#2](https://github.com/datasets/datapressr/issues/2) (2026-11-02), alongside a related, not-yet-researched question: whether 1990s/2000s-vintage solar forecasts also undershot deployment, or undershot it the other way. Backed by the [`global-electricity-mix`](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/global-electricity-mix) dataset (Our World in Data, compiling Ember + Energy Institute).*

## The argument, in one sentence

In 2025 solar generated more of the world's electricity than wind for the first time, after rising from 1.1% of generation a decade earlier to 8.7% — an acceleration fast enough that one year's growth alone covered three-quarters of the entire rise in global electricity demand.

## What this story is about

How far and how fast solar has grown as a share of the electricity actually generated worldwide, 1985–2025, using one consistent series (Our World in Data's compilation, built mainly from Ember's Yearly Electricity Data). **Not** about future projections, policy, cost, or any particular country — this dataset is a world total only. **Not** an explanation of *why* solar grew this fast (that is outside context, attributed, below). **Not** a story about data wrangling — that gets one short paragraph at the end.

## Argument, in order

1. **The chart, first.** Solar's share of world electricity generation, 1985–2025: effectively zero through the 1990s (0.007% in 2000), **1.067% in 2015**, **8.745% in 2025**. That's roughly an eightfold rise in ten years, on a series that was already past its slow start.
2. **What this is.** World electricity generation, all sources, one row per year, 1985–2025 (`global-electricity-mix.csv`, built from Our World in Data's energy dataset). Generation, not capacity — this counts electricity actually produced (TWh), not the panels and turbines installed. "Solar's share" means solar's TWh divided by total TWh generated that year, for the whole world, not any one country or grid.
3. **What it says, in 2025 specifically.**
   - Solar generation hit **2,778.6 TWh**, up **636.0 TWh** on 2024's 2,142.6 TWh — the single largest one-year increase for any source in the whole 1985–2025 series (the next-largest was also solar: +478.5 TWh in 2024).
   - World electricity demand grew by **842.1 TWh** in 2025. Solar's +636.0 TWh covered **75.5%** of that entire increase.
   - **Solar overtook wind for the first time**: 2,778.6 TWh vs wind's 2,713.1 TWh. As recently as 2024, wind was still ahead (2,509.5 vs solar's 2,142.6).
   - All renewables together reached **33.76%** of world generation in 2025, up from 27.99% in 2020.
4. **The counter-number.** Fast growth from a small base is still not dominance: fossil fuels (coal, oil, gas) still generated **57.39%** of the world's electricity in 2025 — down from 63.58% in 1985, but still well over half. Low-carbon sources overall (renewables + nuclear) reached 42.61%.
5. **Outside context: why, according to others.** Not tested by this data, attributed:
   - Falling cost is the usual explanation. Auke Hoekstra's widely cited tracking of IEA World Energy Outlook forecasts (via [pv magazine, 2018](https://www.pv-magazine.com/2018/11/20/iea-versus-solar-pv-reality/)) found the IEA's 2010 outlook projected 294 GW of cumulative installed solar *capacity* by 2030 — a level the world had already passed by 2016. Capacity (GW) is a different measure from this story's generation (TWh), so the two numbers aren't directly comparable, but the direction is the same: official forecasters have a long history of underestimating how fast solar grows.
   - Ember's own account of 2025 ([Global Electricity Review 2026](https://ember-energy.org/latest-insights/global-electricity-review-2026/)) attributes the surge mainly to China, which it says installed the majority of the world's new solar capacity in 2025.
6. **How this was made.** Short, last. `global-electricity-mix.csv` is built by `build.ts` from an archived snapshot of Our World in Data's `owid-energy-data.csv`, filtered to the "World" rows. Link the dataset and the build script; re-running reproduces every number above.

## Numbers that weaken or limit the argument

- Fossil fuels are still the majority source (57.39% in 2025) — solar's growth is real but starts from a small base and has a long way to go before it changes the overall mix's centre of gravity.
- This is a world aggregate. It says nothing about any one country or grid, and nothing about whether 2025's record one-year jump (+636 TWh) is a new sustained rate or a single unusually large year — the series itself can't distinguish those without more future years.
- The capacity-vs-generation distinction in the forecast comparison (beat 5) is a real limit: the IEA number cited there is GW of capacity, not TWh of generation, so it's context for the *underestimation* theme, not a number this dataset itself can confirm or chart.

## Reader questions

1. How much of the world's electricity is actually solar now? — beat 1/3 (8.745% in 2025).
2. Is that a lot, or still small? — beat 4 (fossils still 57.39%).
3. Is solar really the fastest-growing source, or is wind still bigger? — beat 3 (solar overtakes wind in 2025).
4. How much did solar grow in the most recent year, concretely? — beat 3 (+636.0 TWh, record).
5. Does solar's growth matter for overall electricity demand growth, or is it a rounding error next to rising demand? — beat 3 (75.5% of 2025's demand growth).
6. Why is this happening? — beat 5, attributed only (cost decline, China's buildout).
7. Didn't forecasters predict all this years ago? — beat 5, attributed, with the capacity/generation caveat stated.

## Chart plan

Both from `datasets/energy-and-commodities/global-electricity-mix/data/global-electricity-mix.csv` (`year`, `solar_electricity_twh`, `solar_share_elec_pct`, `wind_electricity_twh`, `electricity_generation_twh`; one row per year, 1985–2025, no gaps).

| # | Chart | Data (fields) | Transform, gaps, dates | Purpose |
|---|-------|----------------|-------------------------|---------|
| 1 | Line, 1985–2025: solar's share of world electricity generation (%). Point at 2025 labelled "8.7%"; point at 2015 labelled "1.1%". | `year`, `solar_share_elec_pct` | None — direct plot of the column, annual, no missing years in range. y-domain 0 to just above 8.745. | The headline: the share, and how recently and fast it rose (beat 1). |
| 2 | Two lines, 2015–2025: solar and wind generation (TWh). Dot + label at 2025 marking the crossover ("solar overtakes wind") where the solar line passes above the wind line; label the 2024 and 2025 values for both. | `year`, `solar_electricity_twh`, `wind_electricity_twh` | Each series plotted from its own column of the same rows — not a join of two resources, so no invented points. Window starts 2015 so the crossover is visible without compressing the whole 1985–2025 range. y-domain 0 to just above 2,778.6. | Beat 3's crossover claim, shown directly rather than only stated in prose. |

Rendered by `solar-overtakes-wind-make-charts.mjs` per [`skills/story/references/charting.md`](https://github.com/datasets/datapressr/blob/main/skills/story/references/charting.md). Build twice, compare SHA-256; `grep` the built SVGs for `NaN`, `Infinity`, `undefined`, `=>`.

## Voice

Plain and factual, per the [voice guide](https://github.com/datasets/datapressr/blob/main/site/docs/voice-guide.md). No "milestone", "surge" (except attributed to Ember verbatim), "unprecedented" or "soared" — state the numbers and let them carry it. A "sounds like me" pass is a separate step the author runs.

## Friction notes

- This is the first DataPressr story built specifically to carry a dataset that didn't exist yet (`global-electricity-mix`) — the dataset was wrangled first, in its own commit, purely to back this one story. Worth watching whether that pattern (dataset-for-a-story vs. story-from-an-existing-dataset) needs its own note in the skill.
- The forecast-underestimation angle (beat 5) was the original hook for this whole idea (see the linked Inbox item) but turned out to use a *different unit* (capacity, GW) than this dataset measures (generation, TWh) — so it stays as attributed outside context rather than becoming a chart. A follow-on story comparing historical forecast vintages against actual deployment, properly unit-matched, is a separate, larger piece of work (flagged in the Inbox item).
