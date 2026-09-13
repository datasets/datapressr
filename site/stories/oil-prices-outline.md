---
title: "Outline: WTI Went Negative. Brent Didn't."
description: The skeleton for data story #3 — argument, order, key numbers, chart plan. Committed on purpose (see issue #10).
---

# Outline — WTI Went Negative. Brent Didn't.

*The skeleton. Prose is a rendering of this; if the prose drifts from the argument here, the prose is wrong. See [#10](https://github.com/datasets/datapressr/issues/10).*

*Story #3, written the [#10](https://github.com/datasets/datapressr/issues/10) way: outline and chart plan committed before any prose. Draws on [`oil-prices`](../../datasets/energy-and-commodities/oil-prices), enriched in the previous session — the negative-price observation and the "it disappears once averaged" point both came out of [`SUMMARY.md`](../../datasets/energy-and-commodities/oil-prices/SUMMARY.md)'s "What stands out".*

## What this story is about

On 20 April 2020, the U.S. WTI spot price fell to **-$36.98 a barrel** — the only negative value anywhere in eight EIA price series covering Brent and WTI, daily through annual, back to the 1980s. Brent, priced on the same day, stayed at **$17.36**. This is a story about *why the same commodity, priced two different ways on the same day, produced two completely different numbers* — a landlocked storage hub versus a seaborne cargo. **Not** a story about oil-price history in general, and not about the wrangling; that gets one short paragraph at the end.

## Argument, in order

1. **The chart, first.** Brent and WTI daily spot prices, March–May 2020. WTI dips below the zero line on 20 April; Brent, plotted alongside, does not. Show this before any prose beyond a one-line caption.
2. **What these numbers are.** Both series are EIA's daily "spot price FOB": Brent for waterborne North Sea cargoes, WTI for oil delivered at Cushing, Oklahoma — a landlocked pipeline and storage hub, not a port. **Caveat, stated plainly:** "spot price" is doing real work here. Around contract expiry, the near-month NYMEX futures price and the physical spot price converge; the collapse below zero was a futures-and-storage event (the expiring May contract, with Cushing tanks close to full during the COVID-19 demand collapse) that fed straight into the spot number EIA reports for that day. This is a spot-price series, not a futures series, but the two are not independent at expiry — worth one sentence, not a detour into derivatives.
3. **What it says.**
   - WTI: **$18.31** (17 Apr) → **-$36.98** (20 Apr) → **$8.91** (21 Apr). One trading day, a round trip of more than $55.
   - Brent, the same day: **$17.36**. Brent's own all-time daily low across the full 1987–2026 record is **$9.10** (10 Dec 1998) — low, but never negative.
   - The dip barely survives even one level of averaging. WTI's weekly figure for that week (ending 24 Apr) is **$3.32** — positive, but the closest any of the coarser series comes to zero. Monthly (April 2020, dated to the 15th): **$16.55**. The year to 30 June 2020: **$39.16**. Both comfortably positive.
   - Of the **25,415** daily/weekly/monthly/annual observations across all eight series in this dataset, exactly **one** is negative.
4. **The wrinkle: two ways to store the same commodity.** Brent trades as waterborne cargoes — a tanker that cannot unload can, in the worst case, sail somewhere else. WTI settles at Cushing, a landlocked tank farm connected by pipeline; when its storage neared capacity in April 2020, there was nowhere else for a barrel to go. The same demand collapse hit both benchmarks; only the one with a fixed physical delivery point could be pushed negative. **Nominal-dollars caveat:** every figure here, including the 1998 and 2008 comparisons, is nominal USD as EIA published it — not adjusted for inflation.
5. **How this was made.** Brief. Both series come from [`oil-prices`](../../datasets/energy-and-commodities/oil-prices) in this repo — EIA's own `.xls` workbooks, rebuilt by `build.ts`; the consolidated statistics table that surfaced the "exactly one negative value" claim is `enrich.ts`'s work, **local to this repo** (not part of any published dataset). The community [`datasets/oil-prices`](https://github.com/datasets/oil-prices) package is the same underlying EIA source, independently re-wrangled; see this dataset's `README.md` for the row-for-row comparison.
6. **Friction notes** (keep — for the skill work):
   - The story's argument is a *comparison between two resources at one moment* (like story #2's scoreboard), not a single time series (like story #1) — but unlike story #2 it still resolves to a plain line chart, because both resources share units and a time axis. The "multi-resource but still a line chart" case wasn't covered by either existing outline.
   - `enrich`'s consolidated stats table (this session's other task, datapressr-q96) is what actually surfaced this finding — scanning the `min` column across all eight rows is what turned up the single negative cell. Without a table that put every resource's `min` in one place, this argument would have needed a manual per-file scan to find. Worth noting in `enrich`'s skill draft as a reason the consolidated table earns its keep, beyond tidiness.
   - The "spot vs futures" caveat in beat 2 is deliberately one sentence, not a derivatives explainer — matching the voice guide's "one clear caveat > three confident claims." A longer treatment would turn this into an article about futures markets, which is not the argument.

## Chart plan

| # | Chart | Data | Purpose |
|---|-------|------|---------|
| 1 | Line, Brent vs WTI daily spot price, 1 Mar – 15 May 2020, zero reference line, 20 Apr marked on both series (WTI -$36.98, Brent $17.36) | `brent-daily.csv`, `wti-daily.csv` | The headline: on the one day WTI crosses zero, Brent — same commodity, same day, different delivery point — does not. |
| 2 | Line, WTI daily vs WTI weekly price, 1 Feb – 1 Jun 2020, zero reference line | `wti-daily.csv`, `wti-weekly.csv` | The wrinkle: one level of averaging (daily → weekly) already erases the negative print; the weekly low that week is $3.32, not below zero. |

Both rendered by `oil-prices-make-charts.mjs` with Observable Plot per [`docs/charting.md`](../../docs/charting.md) — annotate the 20 Apr point directly on chart 1 rather than relying on a legend.

## Voice

Plain and factual, per [`docs/voice-guide.md`](../../docs/voice-guide.md). Let the two numbers on the same day — $17.36 and -$36.98 — carry the contrast. No "unprecedented", no "the day the market broke". The futures/storage explanation is one sentence of mechanism, not a lecture. A "sounds like me" pass is a separate step the author runs.
