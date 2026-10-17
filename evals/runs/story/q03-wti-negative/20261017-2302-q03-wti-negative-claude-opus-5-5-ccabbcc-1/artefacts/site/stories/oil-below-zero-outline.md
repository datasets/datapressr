---
title: "Outline: Oil Went Below Zero for One Day, in One Place"
description: "Argument, beats, numbers and chart plan for a short story on why the WTI spot price fell to -$36.98 on 20 April 2020."
publish: false
---

# Outline: Oil Went Below Zero for One Day, in One Place

The prose (`oil-below-zero.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Story location: `site/stories/` (DataPressr default). Slug: `oil-below-zero`.

## The argument, in one sentence

On 20 April 2020 the WTI spot price at Cushing, Oklahoma, fell to -$36.98 a barrel for a single day while Brent stayed at $17.36, which is the signature of a storage and delivery squeeze at one inland hub on the day before a futures contract expired, not of crude oil becoming worthless everywhere.

## What this story is about — and what it is not

- **About:** the one negative price in the dataset, why it happened (attributed to EIA), and how narrow it was: one benchmark, one day, gone once averaged.
- **Not about:** the wrangling of the EIA workbooks, the 2008 peak, or the Brent–WTI spread in general.
- **What the data shows vs why.** The data shows *that* WTI went negative on one day and Brent did not, and that both had fallen by about 70% between 2 January and 17 April. It does not show storage levels, futures contract expiry dates or demand. Every mechanism below is outside context, attributed to a named source, and not tested by this data.

## Argument, in order

1. **The finding.** WTI spot, Cushing OK: $18.31 on Friday 17 April 2020, **-$36.98** on Monday 20 April, **$8.91** on Tuesday 21 April. Brent spot on 20 April: **$17.36**. The -$36.98 is the only value at or below zero among the 10,236 daily WTI prices since 2 January 1986, and Brent (9,967 daily prices since 20 May 1987) has none. (Chart 1.)
2. **What you're looking at.** EIA daily spot prices, US dollars per barrel, FOB, nominal. WTI is priced at Cushing, Oklahoma, a landlocked pipeline and storage hub; Brent is a North Sea, waterborne crude. These are spot prices, not futures settlements: the widely quoted figure for that day, **-$37.63**, is the NYMEX May 2020 WTI futures settlement (attributed external figure; not in this dataset). Say which one we have.
3. **What it says — the fall before the fall.** Both benchmarks had already collapsed. On Thursday 2 January 2020 WTI was **$61.17** and Brent **$67.05**; on Friday 17 April, the last trading day before the negative print, WTI was **$18.31** and Brent **$19.75**. Both were down about 70% (WTI 70.1%, Brent 70.5%), measured over the same dates. The negative print sits at the bottom of a three-and-a-half-month fall that hit both. (Chart 1.)
4. **Why (outside context, attributed).** EIA's *Today in Energy* explanation: the May 2020 NYMEX WTI contract expired on 21 April; it is settled by physical delivery at Cushing; storage there was filling and few buyers could take barrels, so holders of expiring contracts paid others to take them. Demand had collapsed with COVID-19 lockdowns (IEA, *Oil Market Report*, April 2020). Brent futures, by contrast, are cash-settled against an index rather than by physical delivery (ICE, *Brent Crude Futures* contract specification), so an expiring Brent contract does not oblige its holder to take barrels anywhere. This data does not test any of this; it is consistent with it in two ways: only the inland benchmark went negative, and it was positive again the next trading day.
5. **The wrinkle — it was not only a WTI problem, and it was not a "price of oil" for April.**
   - **Counter-number:** Brent fell to **$9.12** on 21 April, the day after, two cents above its all-time daily low of **$9.10** on 10 December 1998 (outside the chart window; exempt). The glut hit both; only WTI was squeezed below zero. Next day WTI ($8.91) and Brent ($9.12) were 21 cents apart.
   - **Averaging removes it.** WTI's weekly average for the week ending Friday 24 April 2020 is **$3.32**; the April 2020 monthly average is **$16.55**. Neither weekly, monthly nor annual WTI series ever goes negative. The average of April's daily spot prices was positive; this says nothing about what any particular buyer paid under contract. (Chart 2.)
6. **How this was made.** EIA spot-price workbooks archived 2026-09-05, `build.ts` → eight CSVs, `oil-below-zero-make-charts.mjs` → two SVGs. Links to dataset and build script; re-running reproduces the numbers.

## Outside context

All attributed, none tested by this data:

- U.S. Energy Information Administration, *Today in Energy*, "WTI crude oil futures prices fell below zero because of low liquidity and limited available storage" (April 2020): <https://www.eia.gov/todayinenergy/detail.php?id=43495>. Source of the expiry, physical-delivery-at-Cushing and storage mechanism.
- International Energy Agency, *Oil Market Report — April 2020*: <https://www.iea.org/reports/oil-market-report-april-2020>. Source of the demand-collapse context (lockdowns).
- ICE, *Brent Crude Futures* contract specification: <https://www.ice.com/products/219/Brent-Crude-Futures>. Source of "cash-settled" for Brent futures.
- NYMEX May 2020 WTI futures settlement of -$37.63 on 20 April 2020: widely reported, cited via the EIA article above.

All three URLs are cited from memory; there is no network in this run, so they were not checked (friction note).

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | WTI and Brent daily spot, 2 Jan – 30 Jun 2020, zero line, annotated | `wti-daily` (`Date`, `Price`), `brent-daily` (`Date`, `Price`) | Each resource filtered to `2020-01-02`…`2020-06-30` and drawn as its own `Plot.line` from its own rows — **no join by date** (the calendars differ in this window: WTI has no 2020-01-20 or 2020-02-17, US holidays; Brent has no 2020-04-13 or 2020-05-08, UK holidays; neither has 2020-04-10). Gaps are simply skipped by the line (no zero fill). Annotations looked up by key, build throws if missing: WTI 2020-01-02 $61.17, Brent 2020-01-02 $67.05 (start labels, coloured, also serve as series names); three combined labels, each reading both rows for its date, each with a dot on both lines: 2020-04-17 "Fri 17 Apr: WTI $18.31, Brent $19.75" (placed left of the dots); 2020-04-20 "Mon 20 Apr: WTI -$36.98, Brent $17.36" (WTI dot red, label beside it at the bottom); 2020-04-21 "Tue 21 Apr: WTI $8.91, Brent $9.12" (placed right of the dots). `Plot.ruleY([0])`. y-domain must include -36.98 and 67.05: set [-45, 75]. | Beats 1, 3, 5 (counter-number): one benchmark, one day, at the bottom of a fall shared by both. |
| 2 | WTI daily vs weekly and monthly averages, 2 Mar – 29 May 2020, zero line | `wti-daily`, `wti-weekly`, `wti-monthly` (`Date`, `Price`) | Daily as a thin grey line. Weekly is dated to the Friday ending the week: draw as `curve: "step-before"` so each value spans the five trading days it averages; label "week ending 24 Apr: $3.32". Monthly is dated to the 15th by EIA: draw each month as a horizontal segment from the 1st to the last day of the month (`Plot.ruleY` with `x1`/`x2` computed from the 15th date), not a line through the 15ths; label "April average: $16.55". Weekly window: weeks ending 2020-02-28 … 2020-05-29 (the week ending 2020-02-28 is included only as the left edge of the first step, so the week ending 2020-03-06 is drawn; x-domain clipped to 2020-03-01 … 2020-05-31). Daily window 2020-03-02 … 2020-05-29. Zero rule. y-domain [-45, 55] to include -36.98 and the March weekly/monthly values. Daily -36.98 labelled. | Beat 5: the negative is a one-day reading; averaged over the week or month the price was positive. |

Formula checks run against the columns before submitting: 1 - 18.31/61.17 = 0.701 (WTI, 2 Jan → 17 Apr); 1 - 19.75/67.05 = 0.705 (Brent, same dates); 9.12 - 8.91 = 0.21; 9.12 - 9.10 = 0.02; mean of WTI daily 2020-04-20…24 (-36.98, 8.91, 13.64, 15.06, 15.99) = 3.324 → matches weekly $3.32; mean of 21 WTI daily prices in April 2020 = 16.548 → matches monthly $16.55.

## Voice

Follow `skills/story/references/voice-guide.md`. The voice pass is separate and, in this run, skipped (no human author).

## Friction notes

- review: self (blind run, no reviewer available). The outline review is recorded in [`oil-below-zero-outline-review.md`](oil-below-zero-outline-review.md).
- The task asks *why*, and the dataset can only show *what*. The story's answer to *why* is entirely attributed context (EIA, IEA) that cannot be re-checked offline in this run; the data's contribution is to show how narrow the event was (one benchmark, one day, positive once averaged), which is what makes the storage-squeeze explanation plausible rather than a general collapse in the value of oil.
- Monthly prices dated to the 15th invite drawing a line through mid-month points; chart 2 draws them as month-long segments instead.
