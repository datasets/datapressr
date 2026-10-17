---
title: "Oil Went Below Zero for One Day, in One Place"
description: "On 20 April 2020 the WTI spot price at Cushing, Oklahoma, fell to −$36.98 a barrel. Brent stayed at $17.36, and WTI was back above zero the next day."
publish: false
datahub:
  slug: oil-below-zero-one-day
  status: draft
---

# Oil Went Below Zero for One Day, in One Place

![Daily spot prices of WTI and Brent crude, January to June 2020. Both fall from early January (WTI $61.17, Brent $67.05) to Friday 17 April (WTI $18.31, Brent $19.75). On Monday 20 April WTI drops to −$36.98 while Brent is $17.36. On Tuesday 21 April WTI is $8.91 and Brent $9.12. Both then recover above $35 by the end of June.](oil-below-zero-daily.svg)

On Monday 20 April 2020 the spot price of West Texas Intermediate (WTI) crude at Cushing, Oklahoma, was −$36.98 a barrel: sellers paid buyers to take it. Brent, the North Sea benchmark, was $17.36 the same day.

## What this is

These are daily spot prices from the U.S. Energy Information Administration (EIA), in US dollars per barrel, not adjusted for inflation. WTI is priced at Cushing, a landlocked pipeline and storage hub. Brent is a North Sea crude that moves by tanker.

The figure most people remember, −$37.63, is something else: the settlement price of the May 2020 WTI futures contract on the New York Mercantile Exchange. The EIA spot price is close to it but not the same number.

Among 10,236 daily WTI prices since 2 January 1986, −$36.98 is the only one at or below zero. Brent, with 9,967 daily prices since May 1987, has none.

## What it says

**The negative price came at the bottom of a fall that both benchmarks shared.** On 2 January 2020 WTI was $61.17 and Brent $67.05. By Friday 17 April, the last trading day before the negative price, WTI was $18.31 and Brent $19.75. Both had lost about 70%.

**It lasted one day.** On Tuesday 21 April WTI was $8.91.

**Only WTI went below zero.** Brent fell as far in percentage terms but never crossed zero.

## Why WTI, and why that day

The data shows what happened, not why. The explanation comes from the EIA, which put the fall down to ["low liquidity and limited available storage"](https://www.eia.gov/todayinenergy/detail.php?id=43495). The May 2020 WTI futures contract expired on 21 April. It is settled by physical delivery of oil at Cushing. Storage there was filling up while demand collapsed under COVID-19 lockdowns ([IEA, *Oil Market Report*, April 2020](https://www.iea.org/reports/oil-market-report-april-2020)). Holders of expiring contracts who could not take delivery had to pay someone else to take the contracts off their hands.

Brent futures work differently. They are settled in cash against an index ([ICE, *Brent Crude Futures*](https://www.ice.com/products/219/Brent-Crude-Futures)), so an expiring Brent contract does not oblige anyone to take barrels.

This dataset cannot test that explanation, but it fits it. The inland, physically delivered benchmark went negative and the waterborne one did not. By the next trading day the price was positive again.

## The wrinkle

Brent did not escape the glut. On 21 April it fell to $9.12, two cents above its all-time daily low of $9.10 in December 1998, and 21 cents above WTI's $8.91. The glut reached both benchmarks. The squeeze the EIA describes, on delivery at Cushing, applied to only one of them.

![WTI daily spot price, March to May 2020, with weekly and monthly averages. The daily price falls to −$36.98 on Monday 20 April. The weekly average for the week ending Friday 24 April is $3.32, and the April monthly average is $16.55. Neither average goes below zero.](oil-below-zero-averages.svg)

The negative number is a one-day reading. Averaged over the week ending Friday 24 April, WTI's spot price was $3.32. Its April average was $16.55. None of the EIA's weekly, monthly or annual WTI averages has ever been below zero. That is a fact about averages of spot quotes. It does not say what any particular buyer paid under contract.

## How this was made

Data: [oil-prices](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices), Brent and WTI spot prices from the EIA, archived on 5 September 2026. Source: U.S. Energy Information Administration (Sep 2026). [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/build.ts) turns the EIA's workbooks into eight CSVs. [`oil-below-zero-make-charts.mjs`](oil-below-zero-make-charts.mjs) draws both charts from those CSVs and reads every labelled value from the rows. Re-running both reproduces the numbers here. The argument and chart plan are in the [outline](oil-below-zero-outline.md).

## Friction notes

- review: self (blind run, no reviewer available). The outline review ([`oil-below-zero-outline-review.md`](oil-below-zero-outline-review.md)) took three rounds and approved revision `ac79a0c`. The final editorial review of this draft is in [`oil-below-zero-editorial-review.md`](oil-below-zero-editorial-review.md); it is also a self-review, not an independent one.
- **Exempt numbers** (not on a chart):
  - −$37.63: attributed external figure (NYMEX May 2020 WTI futures settlement)
  - 10,236: dataset-wide count
  - 2 January 1986: dataset-wide coverage start
  - 9,967: dataset-wide count
  - May 1987: dataset-wide coverage start
  - 21 April: attributed external figure (contract expiry date, EIA)
  - $9.10: all-time low outside the chart's window
  - December 1998: date of the all-time low outside the chart's window
  - 5 September 2026: archive retrieval date (method)
- Derived numbers: "about 70%" is 1 − 18.31/61.17 = 70.1% (WTI) and 1 − 19.75/67.05 = 70.5% (Brent), both from chart 1's labels. "Two cents" (9.12 − 9.10) and "21 cents" (9.12 − 8.91) are differences between a chart label and an exempt or charted value.
- **Charts not inspected visually.** This run has no supported way to rasterise SVG. Each chart was checked from its source instead: `viewBox` 0 0 720 420 and 0 0 720 380, `width` 720, label text and translate coordinates compared against line values for collisions, every cited number found by `grep`, and no `NaN`, `Infinity`, `undefined` or `=>` in either file. Phone-width (about 360px) legibility is unchecked; at that width the 12px text scales to about 6px.
- The EIA, IEA and ICE URLs and the −$37.63 figure were cited from memory. There is no network in this run, so none was checked. Verify them before publishing.
- The GitHub links assume the repository is `datasets/datapressr` with this directory layout; this scratch repository has no remote to confirm it.
- The task asks *why*, and the dataset can only show *what*. The *why* here is entirely attributed. The data's contribution is showing how narrow the event was: one benchmark, one day, positive once averaged.
- The author's voice pass is outstanding. It was skipped in this run because there is no human author, so this is the agent's final draft.
