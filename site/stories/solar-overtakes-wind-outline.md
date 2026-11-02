---
publish: false
title: "Outline: Solar Overtakes Wind, and Climbs to 8.7% of World Electricity"
description: The skeleton this story is built from — argument, order, key numbers, chart plan. Committed on purpose, before any chart or prose work.
---

# Outline — Solar Overtakes Wind, and Climbs to 8.7% of World Electricity

*The skeleton. The prose is a rendering of this; if the prose drifts from the argument here, the prose is wrong.*

*Captured as a story candidate in [datapressr#2](https://github.com/datasets/datapressr/issues/2) (2026-11-02), alongside a related, not-yet-researched question: whether 1990s/2000s-vintage solar forecasts also undershot deployment, or undershot it the other way. Backed by the [`global-electricity-mix`](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/global-electricity-mix) dataset (Our World in Data, compiling Ember + Energy Institute).*

## The argument, in one sentence

In 2025 solar generated more of the world's electricity than wind for the first time, after rising from 1.1% of generation a decade earlier to 8.7% — an acceleration fast enough that one year's growth alone covered three-quarters of the entire rise in global electricity generation.

## What this story is about

How far and how fast solar has grown as a share of the electricity actually generated worldwide, 1985–2025, using one consistent series (Our World in Data's compilation, built mainly from Ember's Yearly Electricity Data). **Not** about future projections, policy, cost, or any particular country — this dataset is a world total only. **Not** an explanation of *why* solar grew this fast (that is outside context, attributed, below). **Not** a story about data wrangling — that gets one short paragraph at the end.

## Argument, in order

1. **The chart, first.** Solar's share of world electricity generation, 1985–2025: effectively zero through the 1990s (0.006% in 1999), **1.067% in 2015**, **8.745% in 2025**. That's roughly an eightfold rise in ten years, on a series that was already past its slow start.
2. **What this is.** World electricity generation, all sources, one row per year, 1985–2025 (`global-electricity-mix.csv`, built from Our World in Data's energy dataset). Generation, not capacity — this counts electricity actually produced (TWh), not the panels and turbines installed. "Solar's share" means solar's TWh divided by total TWh generated that year, for the whole world, not any one country or grid. Every growth figure in this outline (beat 3, chart 3) is growth in **generation**, not consumption-side "demand" — the dataset has no demand series. At the world level the two move together closely, since global net electricity trade is near zero, but this outline says "generation" throughout rather than "demand" because that is the measure actually in the data.
3. **What it says, in 2025 specifically.**
   - Solar generation hit **2,778.6 TWh**, up **636.0 TWh** on 2024's 2,142.7 TWh — solar's own largest one-year increase in the series (the next-largest was also solar: +478.5 TWh in 2023→2024), and bigger than any single year's increase in wind generation (wind's own largest one-year rise was +265.5 TWh, in 2021). It is **not** the largest one-year increase of any generation category: total renewables rose +882.2 TWh in 2024 and +848.9 TWh in 2025, and fossil generation rose +959.6 TWh in 2021 and +940.3 TWh in 2010 — both bigger than solar's 2025 jump. The claim here is about solar specifically and about solar vs. wind, not "any source."
   - World electricity generation grew by **842.1 TWh** in 2025. Solar's +636.0 TWh covered **75.5%** of that entire increase — see chart 3.
   - **Solar overtook wind for the first time**: 2,778.6 TWh vs wind's 2,713.1 TWh. As recently as 2024, wind was still ahead (2,509.5 vs solar's 2,142.7).
   - All renewables together reached **33.76%** of world generation in 2025, up from 27.99% in 2020.
4. **The counter-number.** Fast growth from a small base is still not dominance: fossil fuels (coal, oil, gas) still generated **57.39%** of the world's electricity in 2025 — down from 63.58% in 1985, but still well over half. Low-carbon sources overall (renewables + nuclear) reached 42.61%.
5. **Outside context: why, according to others.** Not tested by this data, attributed:
   - Falling cost is the usual explanation. Auke Hoekstra's widely cited tracking of IEA World Energy Outlook forecasts (via [pv magazine, 2018](https://www.pv-magazine.com/2018/11/20/iea-versus-solar-pv-reality/)) found the IEA's 2010 outlook projected 294 GW of cumulative installed solar *capacity* by 2030 — a level the world had already passed by 2016. Capacity (GW) is a different measure from this story's generation (TWh), so the two numbers aren't directly comparable, but the direction is the same: official forecasters have a long history of underestimating how fast solar grows.
   - Ember's own account of 2025 ([Global Electricity Review 2026](https://ember-energy.org/latest-insights/global-electricity-review-2026/)) attributes this increase mainly to China, which it says installed the majority of the world's new solar *capacity* in 2025 — again a capacity figure, not this story's generation measure.
6. **How this was made.** Short, last. `global-electricity-mix.csv` is built by `build.ts` from an archived snapshot of Our World in Data's `owid-energy-data.csv`, filtered to the "World" rows. Link the dataset and the build script; re-running reproduces every number above.

## Numbers that weaken or limit the argument

- Fossil fuels are still the majority source (57.39% in 2025) — solar's growth is real but starts from a small base and has a long way to go before it changes the overall mix's centre of gravity.
- This is a world aggregate. It says nothing about any one country or grid, and nothing about whether 2025's record one-year jump (+636 TWh) is a new sustained rate or a single unusually large year — the series itself can't distinguish those without more future years.
- The capacity-vs-generation distinction in the forecast comparison (beat 5) is a real limit: both the IEA number and the Ember/China number cited there are GW of capacity, not TWh of generation, so they're context for the *underestimation* and *who's driving it* themes, not numbers this dataset itself can confirm or chart.
- "Largest one-year increase" claims need their scope stated precisely: solar's 2025 jump is its own biggest, and bigger than wind's biggest, but smaller than the biggest one-year rises in the broader "renewables" and "fossil" categories (see beat 3) — those categories aggregate several technologies, so they are not an apples-to-apples comparison with a single technology's jump, but the raw numbers are bigger and the outline says so rather than implying otherwise.
- This dataset splices two underlying sources (Ember for recent years, the Energy Institute's Statistical Review for earlier years) without this outline establishing the exact handoff point or checking for a discontinuity there. Noted, not resolved (reader question 8).
- 2025 is the most recent year in the series and may still be revised as more complete-year data comes in from national statistics agencies; the crossover and record-jump claims rest on this still-fresh figure.

## Reader questions

1. How much of the world's electricity is actually solar now? — beat 1/3 (8.745% in 2025).
2. Is that a lot, or still small? — beat 4 (fossils still 57.39%).
3. Is solar really the fastest-growing source, or is wind still bigger? — beat 3 (solar overtakes wind in 2025).
4. How much did solar grow in the most recent year, concretely? — beat 3 (+636.0 TWh, record).
5. Does solar's growth matter for overall electricity generation growth, or is it a rounding error next to rising generation? — beat 3 and chart 3 (75.5% of 2025's generation growth).
6. Why is this happening? — beat 5, attributed only (cost decline, China's buildout).
7. Didn't forecasters predict all this years ago? — beat 5, attributed, with the capacity/generation caveat stated.
8. Is this 40-year series measured consistently, or spliced across different methodologies/sources? — **Partly answered, as a limitation rather than resolved.** The frontmatter and README both state the series compiles Ember's Yearly Electricity Data (recent years) and the Energy Institute's Statistical Review of World Energy (earlier years); this outline does not establish exactly where one source hands off to the other or whether there's a measurable discontinuity at that point. Stated as an open limitation in "Numbers that weaken or limit the argument" below rather than papered over.

## Chart plan

Both from `datasets/energy-and-commodities/global-electricity-mix/data/global-electricity-mix.csv` (`year`, `solar_electricity_twh`, `solar_share_elec_pct`, `wind_electricity_twh`, `electricity_generation_twh`; one row per year, 1985–2025, no gaps).

| # | Chart | Data (fields) | Transform, gaps, dates | Purpose |
|---|-------|----------------|-------------------------|---------|
| 1 | Line, 1985–2025: solar's share of world electricity generation (%). Point at 2025 labelled "8.7%"; point at 2015 labelled "1.1%". | `year`, `solar_share_elec_pct` | None — direct plot of the column, annual, no missing years in range. y-domain 0 to just above 8.745. | The headline: the share, and how recently and fast it rose (beat 1). |
| 2 | Two lines, 2015–2025: solar and wind generation (TWh). Dot + label at 2025 marking the crossover ("solar overtakes wind") where the solar line passes above the wind line; label the 2024 and 2025 values for both. | `year`, `solar_electricity_twh`, `wind_electricity_twh` | Each series plotted from its own column of the same rows — not a join of two resources, so no invented points. Window starts 2015 so the crossover is visible without compressing the whole 1985–2025 range. y-domain 0 to just above 2,778.6. | Beat 3's crossover claim, shown directly rather than only stated in prose. |
| 3 | Single stacked bar for 2025: total electricity generation growth (842.1 TWh), split into solar's contribution (636.0 TWh) and everything else (206.1 TWh), each segment labelled with its TWh value; solar's segment also labelled "75.5% of 2025's generation growth". | `year` (2024, 2025), `electricity_generation_twh`, `solar_electricity_twh` | Computed at build time, not stored in the CSV: total growth = `electricity_generation_twh[2025] − electricity_generation_twh[2024]`; solar's share of growth = `(solar_electricity_twh[2025] − solar_electricity_twh[2024]) / total growth`; "everything else" = total growth − solar's growth. Two specific rows only, no gaps to handle. | Visualises the one-sentence argument's second clause (beat 3's 75.5%/842.1 TWh claim), which otherwise exists only as prose arithmetic. |

Rendered by `solar-overtakes-wind-make-charts.mjs` per [`skills/story/references/charting.md`](https://github.com/datasets/datapressr/blob/main/skills/story/references/charting.md). Build twice, compare SHA-256; `grep` the built SVGs for `NaN`, `Infinity`, `undefined`, `=>`.

## Voice

Plain and factual, per the [voice guide](https://github.com/datasets/datapressr/blob/main/site/docs/voice-guide.md). No "milestone", "surge" (except attributed to Ember verbatim), "unprecedented" or "soared" — state the numbers and let them carry it. A "sounds like me" pass is a separate step the author runs.

## Outline review

- **Round 1** — independent AI reviewer (Claude subagent, general-purpose, no hand in the outline), revision 1, SHA-256 `c59e8cce1227dcba3cc6d90ace49ca161c20bbfab2c84cc2a72af366f2acb7ed` (commit `e58f68f`), 2 November 2026. **Not approved**, 5 corrections (3 substantive, 2 minor). Every number independently re-derived from the CSV. Corrections, all applied in this revision: (1) the "largest one-year increase for any source" claim was false — total renewables rose more in both 2024 (+882.2 TWh) and 2025 (+848.9 TWh), and fossil generation rose more in 2021 (+959.6 TWh) and 2010 (+940.3 TWh); rescoped to solar's own largest jump and the true comparison against wind's largest jump (+265.5 TWh, 2021); (2) "2,142.6 TWh" for 2024 solar generation was a rounding error — the CSV value 2142.65 rounds to 2,142.7, fixed in both mentions; (3) the one-sentence argument's demand-growth clause (75.5%/842.1 TWh) had no chart — added chart 3; (4) the capacity-vs-generation caveat was stated for the IEA bullet but not the parallel Ember/China bullet — added to both; (5) "0.007% in 2000" was cited as a "1990s" figure — replaced with the actual 1999 value, 0.006%. The reviewer's reader-question pass also flagged that source-splicing (Ember + Energy Institute) across the 40-year series was never addressed — added as reader question 8 and a stated limitation, not resolved.
- **Round 2** — same reviewer, revision 2, SHA-256 `b177d82d1497a654929fbe9e6961d447a71da7f2c8c120796c42527d65a82246` (commit `64d175b`), 2 November 2026. Re-verified every number from scratch, including chart 3's new figures, and confirmed all five round-1 corrections were both applied and themselves true. **Not approved**, 2 new corrections: (1) the outline conflated "generation" (what the data measures) with consumption-side "demand" in the one-sentence argument, beat 3, reader question 5 and chart 3 — fixed by using "generation" throughout and adding one sentence to beat 2 stating the dataset has no demand series and why generation is used; (2) the Voice section permits "surge" only when quoting Ember verbatim, but the Ember bullet used it unquoted — changed to "this increase." Also added a non-blocking note on 2025 being the series' most recent, potentially-revised year.

## Friction notes

- This is the first DataPressr story built specifically to carry a dataset that didn't exist yet (`global-electricity-mix`) — the dataset was wrangled first, in its own commit, purely to back this one story. Worth watching whether that pattern (dataset-for-a-story vs. story-from-an-existing-dataset) needs its own note in the skill.
- The forecast-underestimation angle (beat 5) was the original hook for this whole idea (see the linked Inbox item) but turned out to use a *different unit* (capacity, GW) than this dataset measures (generation, TWh) — so it stays as attributed outside context rather than becoming a chart. A follow-on story comparing historical forecast vintages against actual deployment, properly unit-matched, is a separate, larger piece of work (flagged in the Inbox item).
- Round 1 review caught a real "biggest ever" overstatement that the outline's own author (checking the data) missed: solar's jump was the biggest *for solar*, and bigger than wind's biggest, but not bigger than the broader renewables/fossil aggregate categories' own biggest jumps. Worth a general caution in `story-craft.md`: a superlative claim needs to be checked against every column that could beat it, not just the one the story is about.
