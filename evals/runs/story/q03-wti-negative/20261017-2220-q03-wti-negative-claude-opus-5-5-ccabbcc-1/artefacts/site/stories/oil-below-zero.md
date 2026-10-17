---
title: "One Oil Benchmark Went Below Zero, for One Day"
description: "On 20 April 2020 the WTI spot price was −$36.98 a barrel and Brent was $17.36: what went negative was one benchmark, at one storage hub, for one day."
publish: false
datahub:
  slug: oil-below-zero-one-day
  status: draft
---

# One Oil Benchmark Went Below Zero, for One Day

![Line chart of daily WTI and Brent spot prices, January to June 2020. On 2 January Brent is $67.05 and WTI $61.17. By 17 April WTI is $18.31 and Brent $19.75, down 70% and 71%. On 20 April WTI drops to −$36.98 while Brent is $17.36; Brent falls to $9.12 the next day. No other day is below zero.](oil-below-zero-only-wti.svg)

On Monday 20 April 2020 a barrel of West Texas Intermediate (WTI) crude at Cushing, Oklahoma, was priced at −$36.98. Brent, the North Sea benchmark, was $17.36 the same day.

So "the price of oil" did not go below zero. One of its two main benchmarks did, at one inland hub, for one day.

## What these prices are

Both are daily spot prices from the U.S. Energy Information Administration (EIA), in US dollars per barrel, not adjusted for inflation. A spot price is the price of a barrel for delivery now. WTI is priced at Cushing, an inland hub of pipelines and storage tanks. Brent is priced as crude loaded onto ships in the North Sea. The dataset holds these two benchmarks only, so it cannot say whether other crude prices went negative too.

The figure most people remember, −$37.63, is a different measurement: the settlement price of the May 2020 WTI futures contract on the New York Mercantile Exchange that day. This story uses the EIA spot price.

## What the prices show

**The collapse came first, and both benchmarks shared it.** On 2 January WTI was $61.17 and Brent $67.05. By Friday 17 April, weeks into COVID-19 lockdowns, WTI was $18.31 and Brent $19.75. Each had lost about 70% before the negative day.

**The plunge took one trading day.** WTI fell $55.29 from Friday to Monday, then was back to $8.91 on Tuesday. Of 10,236 daily WTI prices from January 1986 to September 2026, 20 April 2020 is the only one below zero. Before 2020 the lowest was $10.25, in March 1986.

![Chart of the WTI spot price from late March to early May 2020, with daily prices, weekly averages and the April average. The daily price falls from $18.31 on 17 April to −$36.98 on 20 April, down $55.29 in one trading day, and is $8.91 on 21 April. The average for the week ending 24 April is $3.32 and the April average is $16.55; neither goes below zero.](oil-below-zero-averages.svg)

**Averages hide it.** The average for the week ending 24 April was $3.32. April's average was $16.55. A weekly or monthly chart of WTI shows no negative value at all.

## Why it happened

The prices show *that* one price went negative, not *why*. The explanation comes from the U.S. Commodity Futures Trading Commission (CFTC), whose staff examined the day in an [interim report](https://www.cftc.gov/media/5296/InterimStaffReportNYMEX_WTICrude/download) in November 2020.

The May WTI futures contract expired on 21 April, and it is settled by delivering physical oil at Cushing. Anyone still holding a contract had to take barrels there, and storage at Cushing was scarce. On 20 April, the day before expiry, holders with nowhere to put the oil sold at any price, even below zero. The Cushing spot price went negative the same day.

That account explains why the price that fell was WTI's, and why it fell on that day. The data does not say why Brent stayed positive. The plain difference is where each is priced, a landlocked tank farm against cargoes at sea, but this dataset cannot test it.

## The wrinkle

Brent was not calm. On 21 April it fell to $9.12, two cents above its lowest daily price since the series began in 1987, $9.10 in December 1998. The contrast on 20 April is between a price that went below zero and one that came within two cents of its record low the next day, not between crisis and calm.

## How this was made

Prices come from the [oil-prices dataset](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices), which [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/build.ts) builds from EIA spot-price workbooks. Source: U.S. Energy Information Administration (Sep 2026). The charts are drawn by [`oil-below-zero-make-charts.mjs`](oil-below-zero-make-charts.mjs) straight from the dataset's daily, weekly and monthly CSVs; re-running it reproduces them byte for byte. The argument and chart plan are in the [outline](oil-below-zero-outline.md).

## Friction notes

- **Draft.** The author's voice pass is outstanding. This is the house-voice draft only.
- **Reviews: self (blind run, no reviewer available).** The outline review (two rounds, recorded in the outline), the prose-against-outline check below and the final editorial review ([`oil-below-zero-editorial-review.md`](oil-below-zero-editorial-review.md)) were all done by the author, not by an independent reviewer.
- **Charts not inspected visually.** No supported way to rasterise SVG in this workspace. Each chart was checked from its SVG source instead: `viewBox="0 0 720 420"`, width 720; axis ticks (−$40 to $80 on chart 1, −$40 to $40 on chart 2); label positions read from the `translate()` coordinates and checked against the data positions for collisions and the 720px edge. One label (chart 2, 20 April) ran past the right edge and was split onto two lines. The ~360px phone check was not done.
- **Outside source not opened.** No network in this run. The CFTC report URL and the details taken from it (expiry on 21 April, physical delivery at Cushing, storage concerns, −$37.63 settlement) are from memory and must be checked against the report before shipping.
- **Editorial review round 1 corrections** (scope to two benchmarks, COVID clause as timing, "chart of WTI", "since the series began in 1987") applied; the scoping changed the outline's argument sentence, which was re-approved in outline review round 3.
- **Prose vs outline.** Checked beat by beat: same argument, same numbers. The prose adds one sentence not spelled out in the outline, "The Cushing spot price went negative the same day," which restates beat 1 next to the futures mechanism. The outline's note that Brent priced below WTI on 31 March is omitted, as the outline allowed.
- **Exempt numbers** (not on a chart):
  - −$37.63: attributed external figure (CFTC, NYMEX May 2020 futures settlement)
  - 10,236: dataset-wide count
  - $10.25: WTI's pre-2020 low (31 March 1986), outside the charts' window
  - $9.10: Brent's all-time daily low (10 December 1998), outside the charts' window
  - two cents: difference between $9.12 (on chart 1) and the exempt $9.10
