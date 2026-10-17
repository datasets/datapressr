---
title: "Outline: Oil Went Below Zero in One Place, for One Day"
description: "Argument, beats, numbers and chart plan for a short story on why the WTI oil price went negative on 20 April 2020."
publish: false
---

# Outline: Oil Went Below Zero in One Place, for One Day

The prose (`oil-below-zero.md`) is a rendering of this outline. If the prose drifts from the argument here, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `oil-below-zero`.

## The argument, in one sentence

Oil as a whole never cost less than nothing: both benchmarks had already lost 71% of their value between January and April 2020, but only WTI, priced for delivery at Cushing, Oklahoma, went below zero, and only on 20 April, a pattern that points to a squeeze in one delivery place at one moment rather than to oil becoming worthless; the mechanism comes from outside sources, which this data does not test.

## What this story is about

- The question readers ask: why did "the oil price" go negative in April 2020? The data answers *what* precisely (which price, how far, how long, against what background) and so narrows the *why*: it was one benchmark, one day, on top of a collapse shared by both benchmarks.
- The *why* itself (an expiring futures contract that had to be settled by physical delivery at a hub with little storage left, during the COVID-19 demand collapse) is outside context, attributed to named sources and marked as not tested by this data.

Not about: the wrangling of the EIA workbooks; the Brent–WTI spread over decades; pump prices (not in the data); whether it could happen again (not in the data).

## Argument, in order

All prices are EIA **spot** prices, nominal US dollars per barrel, FOB. WTI = Cushing, Oklahoma; Brent = Europe (North Sea) Brent. Daily values are single-day assessments; monthly values are EIA's monthly averages (dated to the 15th). Source rows: `wti-daily`, `brent-daily`, `wti-monthly`, `brent-monthly`.

1. **The finding (chart 1).** On Monday 20 April 2020 WTI spot was **−$36.98** a barrel, the only value at or below zero in 10,236 daily WTI rows (1986-01-02 → 2026-09-01). On the same day Brent was **$17.36**: a gap of **$54.34**. The previous trading day (Friday 17 April) WTI was **$18.31**, so the fall was **$55.29** in one trading day. On 21 April WTI was back above zero at **$8.91** (+$45.89).
2. **What you are looking at.** Two benchmarks for crude oil: WTI, a US crude priced at the Cushing, Oklahoma, pipeline and storage hub, inland; Brent, a North Sea crude loaded onto tankers at sea terminals. EIA publishes spot prices for both. Note the widely quoted figure: the NYMEX May 2020 WTI *futures* contract settled at **−$37.63** on 20 April (external figure, CFTC). EIA's spot series reads −$36.98 for the same day; the story uses EIA's figure and names the other once.
3. **What it says: the collapse was shared (chart 2).** Before the negative day, both benchmarks had fallen by the same proportion. Monthly average, January → April 2020: WTI **$57.52 → $16.55** (−71%), Brent **$63.65 → $18.38** (−71%). Neither benchmark had averaged less in a month since 1999 (WTI was lower in March 1999, at $14.68; Brent in June 1999, at $15.86) — outside the chart window, exempt. So the fall in price was shared by both benchmarks; going below zero was not.
4. **What it says: the negative price was a single day, in one place.** WTI's weekly average for the week ending 24 April was **$3.32** — positive, despite containing the −$36.98 day. WTI's April monthly average was **$16.55**, above zero. Within eight trading days WTI was back near $20 (**$19.23** on 30 April). Anyone reading a weekly or monthly series never sees a negative oil price.
5. **Why (outside context, not tested by this data).** According to the CFTC staff's interim report on 20 April 2020, the May WTI futures contract expired on 21 April; WTI futures are settled by physical delivery at Cushing, where storage was largely full or committed, while COVID-19 lockdowns had cut demand for fuel. Traders holding contracts they could not take delivery of had to sell, and on the day before expiry buyers had to be paid to take them. Brent futures, by contrast, are settled in cash against an index, not by delivery (ICE contract specification). The data is consistent with this: the negative value sits on one benchmark, on the day before expiry, and disappears the next day. It does not show storage, futures positions or demand.
6. **The wrinkle: Brent came close too.** On 21 April, the day after WTI's negative print, Brent fell to **$9.12**, two cents above its all-time daily low of $9.10 (1998-12-10, outside the chart window, exempt). And Brent was not always the dearer crude that spring: on 31 March Brent was **$14.85** against WTI's **$20.51**. So the contrast is partly about timing: both markets were under extreme pressure; only WTI's crossed zero, and only on the day before its May futures contract expired (expiry date per CFTC).
7. **How this was made.** EIA spot prices, `oil-prices` dataset; `build.ts` rebuilds the CSVs from the archived EIA workbooks; `oil-below-zero-make-charts.mjs` rebuilds the charts. Re-running reproduces every number.

### Numbers that weaken the argument (keep them in)

- Brent $9.12 on 21 April, within 2 cents of its record daily low: Brent was also near breaking point, a day later.
- Brent below WTI on 31 March ($14.85 vs $20.51) and 1 April ($14.97 vs $20.28): Brent was not a stable "normal" price throughout.
- The data cannot show the storage, contract-expiry or demand mechanism. It is attributed, not demonstrated.
- Nominal dollars: the 1999 comparisons are not inflation-adjusted.

## Outside context (attributed, not tested by this data)

- Commodity Futures Trading Commission (CFTC) staff, *Interim Staff Report: Trading in NYMEX WTI Crude Oil Futures Contract Leading up to, on, and around April 20, 2020* (November 2020): <https://www.cftc.gov/media/5296/InterimStaffReportNYMEX_WTICrude/download>. Used for: the May contract's 21 April expiry, physical delivery at Cushing, storage constraints, the −$37.63 settlement.
- ICE, *Brent Crude Futures* contract specification: <https://www.ice.com/products/219/Brent-Crude-Futures>. Used for: Brent futures are cash-settled.
- Both were cited from the author's knowledge; this run had no network access, so neither page was retrieved or re-read. The owner must check the links and the attributed wording before publishing.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | `oil-below-zero-day.svg` — "Only WTI went below zero, and only for one day" | `wti-daily` (`Date`, `Price`); `brent-daily` (`Date`, `Price`) | Filter each resource to 2020-03-02 → 2020-05-29. Each benchmark drawn from its own rows as its own line; no join by date. Different holiday calendars (Brent has no 10 or 13 April rows, WTI no 10 April row): the line simply connects adjacent trading days; nothing is filled or zeroed. Horizontal rule at $0. y-domain must include −36.98 and the window's highs (Brent 52.52, WTI 47.27): set −45 → 55. Values looked up from rows (throw if missing): WTI 2020-04-17 $18.31, WTI 2020-04-20 −$36.98, WTI 2020-04-21 $8.91, WTI 2020-04-30 $19.23, Brent 2020-04-20 $17.36, Brent 2020-04-21 $9.12, Brent 2020-03-31 $14.85, WTI 2020-03-31 $20.51. Gap $54.34 computed from the two 20 April rows. To avoid collisions: −$36.98 labelled directly beside its dot; the 17 / 20 / 21 April values sit in a note block in the empty lower-right area, with dots on the lines; the 31 March pair labelled above (WTI) and below (Brent) their dots; $19.23 labelled above its dot. Direct labels "WTI (Cushing)" and "Brent" at line ends. | Beats 1, 4, 6. Comparison: the two benchmarks on a common scale on the same days; the visual feature is one WTI point far below the zero rule while Brent stays above it. |
| 2 | `oil-below-zero-months.svg` — "Both benchmarks lost 71% from January to April 2020" | `wti-monthly` (`Date`, `Price`); `brent-monthly` (`Date`, `Price`) | Filter each resource to 2019-01-15 → 2020-12-15 (monthly averages dated to the 15th by EIA; plotted at the 15th, labelled "monthly average"). Each from its own rows. y-domain from 0 (zero baseline, so neither average dipping below zero is visible). Annotated from looked-up rows: Jan 2020 (WTI $57.52, Brent $63.65), Apr 2020 (WTI $16.55, Brent $18.38). Percent change computed in the script: (Apr − Jan) / Jan, rounded to whole percent: WTI −71.2% → −71%, Brent −71.1% → −71%. | Beat 3. Comparison: the same proportional fall in both lines from the same January level to the same April trough, both well above zero as monthly averages. |

Chart 1 also carries one note line, "WTI week ending 24 Apr, average: $3.32", read from the `wti-weekly` row dated 2020-04-24 (a Friday, EIA's week-ending convention). It is a text note, not a plotted series, so nothing is joined by date.

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is a separate, later stage.

## Friction notes

- Review: self (blind run, no reviewer available). Recorded in `oil-below-zero-outline-review.md`.
- The dataset holds spot prices only. The question asked is "why", and the honest answer from this data is a narrowing (which benchmark, which day) plus attributed context. No storage, futures or demand series in the workspace to test the mechanism.
- External sources could not be retrieved (fixed-data mode, no network); flagged for the owner.
- The EIA spot value (−$36.98) differs from the figure most readers remember (−$37.63, the futures settlement). Named once in the prose.
