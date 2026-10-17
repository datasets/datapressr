---
title: "Outline: Oil Went Below Zero for One Day, in One Place"
description: "Outline and chart plan for a short story on why the WTI spot price was negative on 20 April 2020 while Brent was not."
publish: false
---

# Outline: Oil Went Below Zero for One Day, in One Place

The prose (`oil-below-zero.md`) is a rendering of this outline. If the prose drifts from the argument below, the prose is wrong, not the outline.

Location: `site/stories/` (DataPressr default), slug `oil-below-zero`.

## The argument, in one sentence

Oil did not become worthless in April 2020: the pandemic slump cut both benchmarks by more than 70%, but only WTI, priced at a landlocked storage hub in Cushing, Oklahoma, went below zero, and only for one day, which fits the explanation EIA gives (storage at Cushing nearly full as the May futures contract expired) rather than a world price below zero.

## What this story is about, and what it is not

About: what the EIA spot-price record shows happened on 20 April 2020, which oil it happened to, for how long, and how that pattern lines up with the published explanation.

Not about: the wrangling (one line in "How this was made"); futures-market microstructure in depth; petrol prices or producers' finances (not in the data); forecasting whether it can happen again.

The data shows *that* and *where* and *for how long*. It does not show *why*. The mechanism (demand collapse, Cushing storage, contract expiry) is outside context attributed to EIA and is not tested by these prices. The story's claim is narrower: the shape of the record (one benchmark, one day, averages positive) is consistent with that explanation. The data cannot rule out other contributors.

## Argument, in order

Spine: finding → what it is → what it says → wrinkle → method (`story-craft.md` §5).

1. **The finding.** On Monday 20 April 2020 the EIA spot price of WTI crude at Cushing, Oklahoma was **−$36.98 a barrel**. Brent, the North Sea benchmark, was **$17.36** the same day: **$54.34** apart. (Headline chart, chart 1.)
2. **What you're looking at.** Daily spot prices, US dollars per barrel, nominal, FOB, from the U.S. Energy Information Administration. WTI = West Texas Intermediate, assessed at Cushing, Oklahoma, an inland pipeline and tank-farm hub; Brent = crude loaded at sea terminals in the North Sea. A spot price is the price for physical oil now, not a futures settlement. A negative price means the seller paid the buyer to take the barrels away. WTI daily runs from 1986-01-02 (10,236 days), Brent from 1987-05-20 (9,967 days); 20 April 2020 is the only negative value in either.
3. **What it says.**
   - *The slump was global.* From 6 January 2020 (the highest daily price of 2020 for both) to Friday 17 April, WTI fell from **$63.27 to $18.31 (−71%)** and Brent from **$70.25 to $19.75 (−72%)**. In March–mid-April the two moved together: on the 33 shared trading days 1 March–17 April, WTI minus Brent ranged from −$6.95 to +$5.66, and WTI was the higher of the two on 12 of them. (Chart 1; the spread range and count are for the reviewer, not the prose.)
   - *The break below zero was WTI's alone.* On 20 April only WTI went negative; Brent stayed positive (chart 1).
   - *It lasted one day.* WTI was $18.31 on Friday 17 April and **$8.91** on Tuesday 21 April. The **weekly average** for the week ending 24 April was **$3.32**, and the **April monthly average $16.55**; neither went below zero (chart 2). Weekly and monthly series are EIA's own averages of the daily values (checked: the five daily values 20–24 April average 3.324; the 21 daily values in April average 16.548).
   - *What the pattern fits.* A negative price confined to one inland benchmark, on one day, while both benchmarks had fallen together for weeks, is consistent with the EIA explanation (outside context below). The data does not test that explanation and cannot rule out other contributors.
4. **The wrinkle (numbers that weaken the contrast).**
   - Brent was not unscathed: on 21 April it fell to **$9.12**, two cents above its all-time daily low of $9.10 (1998-12-10, outside the chart's window). WTI was $8.91 that day. The "Brent didn't" contrast holds for one day only.
   - The figure most people remember, **−$37.63**, is the settlement price of the NYMEX May 2020 WTI futures contract (attributed to EIA, below), not the EIA spot price in this data (−$36.98). The story uses the spot figure and names the futures figure so readers don't think one is a typo.
   - In nominal dollars, averaged over the month, April 2020 ($16.55) was not WTI's lowest month: December 1998 averaged **$11.35** (outside the chart's window, exempt). Not inflation-adjusted; say "nominal".
   - Recovery: WTI was back to $35.57 by 29 May (labelled at the end of chart 2's daily line).
5. **How this was made.** Data: `oil-prices` (EIA, daily/weekly/monthly WTI and Brent), built by `build.ts` from archived EIA `.xls` workbooks; charts by `oil-below-zero-make-charts.mjs`. Re-running both reproduces every number.

## Outside context (not tested by this data)

- **Mechanism.** U.S. Energy Information Administration, *Today in Energy*, "Low liquidity and limited available storage pushed WTI crude oil futures prices below zero" (April 2020), [eia.gov/todayinenergy/detail.php?id=43495](https://www.eia.gov/todayinenergy/detail.php?id=43495). Attributed points: pandemic restrictions cut oil demand sharply; crude storage at Cushing, the delivery point for the NYMEX WTI contract, was filling; the May 2020 contract expired on 21 April, so holders who could not take physical delivery had to sell, and with few buyers able to store the oil, the price went negative; the May contract settled at −$37.63 on 20 April.
- Brent is a waterborne crude that can be shipped and stored at sea, while WTI is delivered into tanks at Cushing. This is the plain-words description of the two series' labels ("Europe Brent Spot Price FOB", "Cushing OK WTI Spot Price FOB"); the storage contrast is part of the attributed explanation, not a finding.
- The source link and the −$37.63 figure were not re-checked in this run (fixed data mode, no network). They are attributed, not data from this workspace.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | **Only WTI went below zero.** Daily WTI and Brent spot, 2 Jan–30 Jun 2020, zero line. | `wti-daily` (`Date`, `Price`); `brent-daily` (`Date`, `Price`) | Filter each resource to 2020-01-02…2020-06-30 independently; one `Plot.line` per resource, never joined by date (Brent misses UK holidays, e.g. 10 and 13 April; WTI misses US ones). No missing values in either file; a holiday is just an absent row, so the line connects adjacent trading days. Marked points looked up by date and throw if absent: 6 Jan (WTI 63.27, Brent 70.25), 17 Apr (WTI 18.31, Brent 19.75, with % change from 6 Jan computed in the script), 20 Apr (WTI −36.98, Brent 17.36, gap 54.34 computed from the two looked-up rows), 21 Apr (Brent 9.12, WTI 8.91). y-domain must include −36.98 and 70.25: use [−45, 80]. y label "US$ per barrel (nominal, spot)". Direct labels at line ends, no legend. | Comparison: the two benchmarks on one common scale. They fall together, then one line, and only one, drops through the zero rule for a single point. |
| 2 | **One day, not a month.** WTI daily vs EIA weekly and monthly averages, 2 Mar–29 May 2020, zero line. | `wti-daily`, `wti-weekly`, `wti-monthly` (`Date`, `Price`) | Each from its own rows. Daily as a thin line. Weekly dated Friday ending the week, drawn `curve: "step-before"` so each value spans the week it averages; label "week ending 24 Apr: $3.32". Monthly April 2020 row is dated 2020-04-15; draw it as a horizontal segment 2020-04-01→2020-04-30 at 16.55 (period, not a point), label "April average: $16.55". Marked daily points: 20 Apr −36.98, 21 Apr 8.91; end label 29 May 35.57. Weekly filter 2020-03-06…2020-05-29 (first Friday in window). y-domain [−45, 50] (window max: daily 47.27 on 3 Mar, weekly 45.57 on 6 Mar). | Comparison: one daily observation against the averages that contain it. The spike sits alone below zero; every average stays above it. |

Both charts: Observable Plot → static SVG, 720 px wide, explicit margins, values read from rows, palette from `charting.md` (WTI `#2563eb`, Brent `#9ca3af`, negative/marked `#dc2626`, ink `#111827`).

## Voice

House voice per `skills/story/references/voice-guide.md`. The author's voice pass is a separate, later stage (skipped in this run: no human author).

## Friction notes

- review: self (blind run, no reviewer available). The outline review in step 2 is done by the author against the committed revision; the rounds, verdicts, revisions and reproduced numbers are in `oil-below-zero-outline-review.md`.
- The question asks *why*; the data can only show *what, where and how long*. The story answers *why* by attribution and uses the data to show the explanation's fingerprints. Fixed data mode means the attributed source could not be re-opened in this run.
- The WTI–Brent spread needs a same-date comparison. The chart plan avoids joining resources by date; the 20 April gap is computed from two single-row lookups, and the March–April spread range is reviewer evidence only.
