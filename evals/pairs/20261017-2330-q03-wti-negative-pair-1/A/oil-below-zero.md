---
title: "One Oil Benchmark Went Below Zero, for One Day"
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
