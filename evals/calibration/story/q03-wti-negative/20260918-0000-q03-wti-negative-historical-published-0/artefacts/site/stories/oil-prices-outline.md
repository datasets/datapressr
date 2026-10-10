---
title: "Outline: WTI Went Negative. Brent Didn't."
description: The skeleton for data story #3 — argument, order, key numbers, chart plan. Committed on purpose (see issue #10).
---

# Outline — WTI Went Negative. Brent Didn't.

*The skeleton. Prose is a rendering of this; if the prose drifts from the argument here, the prose is wrong. See [#10](https://github.com/datasets/datapressr/issues/10).*

*Story #3, written the [#10](https://github.com/datasets/datapressr/issues/10) way: outline and chart plan committed before any prose. Draws on [`oil-prices`](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices), enriched in the previous session — the negative-price observation and the "it disappears once averaged" point both came out of [`SUMMARY.md`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/SUMMARY.md)'s "What stands out".*

## The argument, in one sentence

On 20 April 2020 EIA's WTI Cushing spot price was **-$36.98 a barrel** — the only negative value in 25,415 Brent and WTI observations going back to 1986 — while Brent that day was **$17.36**, and even one level of averaging erases the negative print.

## What this story is about

Both of the two main crude benchmarks fell hard in April 2020; only WTI went below zero, and only for one day. The story shows *that* the two numbers diverged and how narrow the event was in the data. It does **not** claim to show *why* from this dataset: the mechanism (futures expiry, Cushing storage) is outside context, attributed to EIA and the CFTC and stated as their explanation. **Not** a story about oil-price history in general, and not about the wrangling; that gets one short paragraph at the end.

## Argument, in order

1. **The chart, first.** Brent and WTI daily spot prices, March–May 2020. WTI dips below the zero line on 20 April; Brent, plotted alongside, does not. Show this before any prose beyond a one-line caption.
2. **What these numbers are.** Both series are EIA's daily "spot price FOB" in nominal US dollars per barrel: Brent (series RBRTE) for North Sea crude, WTI (series RWTC) for crude at Cushing, Oklahoma — a landlocked pipeline and storage hub. These are two different crude grades at two different locations, not one commodity priced twice. **Caveat, stated plainly:** these are spot prices, not futures. The widely reported **-$37.63** is the NYMEX May 2020 futures *settlement* on 20 April ([CFTC interim staff report, Nov 2020](https://www.cftc.gov/PressRoom/PressReleases/8315-20)); EIA's spot figure for the same day is **-$36.98**. Related, not the same number — the prose must not swap them.
3. **What it says.**
   - WTI: **$18.31** (Fri 17 Apr) → **-$36.98** (Mon 20 Apr) → **$8.91** (Tue 21 Apr). Down **$55.29** in one trading day (the 18th and 19th were a weekend), up **$45.89** the next.
   - Brent, the same days: **$19.75** → **$17.36** → **$9.12**. Brent's $9.12 on 21 Apr is 2 cents above its all-time daily low of **$9.10** (10 Dec 1998, across the full 1987–2026 record), and within 21 cents of WTI that day. So "Brent didn't" is narrow: both fell hard; only WTI went negative, and only on 20 April.
   - The dip barely survives even one level of averaging. WTI's weekly average for the week ending Fri 24 Apr (the mean of the five daily prices, including -$36.98) is **$3.32** — positive, and the lowest value in any of the six averaged series. Monthly (April 2020, dated to the 15th): **$16.55** — not even WTI's lowest month (that is $11.35, Dec 1998). The 2020 annual average (dated 30 June): **$39.16**.
   - Of the **25,415** daily/weekly/monthly/annual observations across all eight series in this dataset, exactly **one** is negative.
4. **Outside context: the explanation others give.** One or two sentences, attributed, not presented as something this data shows. EIA's account ([Today in Energy, 27 Apr 2020](https://www.eia.gov/todayinenergy/detail.php?id=43495)): the May WTI futures contract expired on 21 April; holders who could not take physical delivery could not find buyers, and with Cushing storage scarce (76% full on 17 April, with some of the rest already committed) some paid counterparties to take their contracts. The spot price for Cushing delivery fell with it. **Caveat:** this dataset contains prices only — it cannot test why WTI went negative, nor why Brent did not; the prose says so rather than supplying a mechanism for Brent. **Nominal-dollars caveat:** every figure here, including the 1998 comparison, is nominal USD as EIA published it — not adjusted for inflation.
5. **How this was made.** Brief. Both series come from [`oil-prices`](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices) in this repo — EIA's own `.xls` workbooks, rebuilt by `build.ts`; the consolidated statistics table that surfaced the "exactly one negative value" claim is `enrich.ts`'s work, **local to this repo** (not part of any published dataset). The community [`datasets/oil-prices`](https://github.com/datasets/oil-prices) package is the same underlying EIA source, independently re-wrangled; see the [structure benchmark](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md) for the row-for-row comparison.
6. **Friction notes** (keep — for the skill work):
   - The story's argument is a *comparison between two resources at one moment* (like story #2's scoreboard), not a single time series (like story #1) — but unlike story #2 it still resolves to a plain line chart, because both resources share units and a time axis. The "multi-resource but still a line chart" case wasn't covered by either existing outline.
   - `enrich`'s consolidated stats table (this session's other task, datapressr-q96) is what actually surfaced this finding — scanning the `min` column across all eight rows is what turned up the single negative cell. Without a table that put every resource's `min` in one place, this argument would have needed a manual per-file scan to find. Worth noting in `enrich`'s skill draft as a reason the consolidated table earns its keep, beyond tidiness.
   - The "spot vs futures" caveat in beat 2 is deliberately short, not a derivatives explainer — matching the voice guide's "one clear caveat > three confident claims." A longer treatment would turn this into an article about futures markets, which is not the argument.
   - Outline review (datapressr-0cp, round 1) caught the first draft explaining *why* from a price-only dataset, a mis-stated "round trip in one trading day", and omitting Brent's $9.12 the next day — the omission made the headline contrast look stronger than the data supports. Worth a line in the story skill: the outline must list the numbers that *weaken* the argument, not only the ones that make it.

## Chart plan

| # | Chart | Data | Transform, gaps, dates | Purpose |
|---|-------|------|------------------------|---------|
| 1 | Line, Brent vs WTI daily spot price (nominal USD/bbl), 1 Mar – 15 May 2020, zero reference line; 20 Apr marked on both series (WTI -$36.98, Brent $17.36); Brent's $9.12 on 21 Apr marked | `brent-daily.csv`, `wti-daily.csv` (`Date`, `Price`) | Filter by `Date` only; no other transform. Plot each series from its own rows — no joined wide table: Brent has no rows on 2020-04-13 and 2020-05-08 (no-trade days), which must not become zero or null points. y-domain must include -36.98 and 0. Direct labels, no legend. | Beat 1 and beat 3: on the one day WTI crosses zero, Brent does not — and the next day Brent is at its own near-record low. |
| 2 | WTI daily vs WTI weekly average, 1 Feb – 1 Jun 2020, zero reference line | `wti-daily.csv`, `wti-weekly.csv` (`Date`, `Price`) | Filter by `Date` only. Weekly values are Monday–Friday means stamped on the Friday ending the week: draw the weekly series as a step (`curve: "step-before"`) so each value spans the week it averages, and say "week ending" in the label. Annotate the week ending 24 Apr at $3.32. | Beat 3's averaging bullet: one level of averaging (daily → weekly) already erases the negative print. |

Both rendered by `oil-prices-make-charts.mjs` with Observable Plot per [`docs/charting.md`](../docs/charting.md) — annotate directly on the charts rather than relying on a legend.

## Voice

Plain and factual, per [`docs/voice-guide.md`](../docs/voice-guide.md). Let the two numbers on the same day — $17.36 and -$36.98 — carry the contrast, and let Brent's $9.12 the next day keep it honest. No "unprecedented", no "the day the market broke". The futures/storage explanation is attributed outside context, not a lecture and not a claim this data proves. A "sounds like me" pass is a separate step the author runs.
