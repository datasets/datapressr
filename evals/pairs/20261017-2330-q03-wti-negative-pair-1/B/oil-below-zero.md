---
title: "Oil Went Below Zero in One Place, for One Day"
---

# Oil Went Below Zero in One Place, for One Day

![Daily spot prices for WTI and Brent crude, March to May 2020, US dollars per barrel. Both fall through March and April. WTI drops from $18.31 on 17 April to −$36.98 on 20 April, the only point below the zero line, then recovers to $8.91 on 21 April and $19.23 on 30 April. Brent is $17.36 on 20 April, a gap of $54.34, and $9.12 on 21 April. On 31 March Brent, at $14.85, was below WTI, at $20.51. WTI's average for the week ending 24 April was $3.32.](oil-below-zero-day.svg)

On 20 April 2020 a barrel of WTI crude at Cushing, Oklahoma, was priced at −$36.98. Brent was $17.36 the same day. Oil in general never cost less than nothing. One benchmark did, for one day.

## What these prices are

WTI and Brent are two of the main reference prices for crude oil. WTI is a US crude priced at Cushing, an inland pipeline and storage hub. Brent is a North Sea crude. The figures here are spot prices from the US Energy Information Administration (EIA), in nominal dollars per barrel.

The figure most people remember, −$37.63, is a different measurement: the settlement price of the NYMEX May 2020 WTI futures contract that day, according to the [CFTC](https://www.cftc.gov/media/5296/InterimStaffReportNYMEX_WTICrude/download). EIA's spot price for the same day is −$36.98.

## What the data shows

**It lasted one day.** WTI was $18.31 on Friday 17 April and −$36.98 on Monday 20 April. On Tuesday it was back above zero at $8.91, and by 30 April it was $19.23. Of the 10,236 daily WTI prices EIA has published since 1986, 20 April 2020 is the only one at or below zero. Averaged over a week, the negative day disappears: WTI's average for the week ending 24 April was $3.32.

**It was one benchmark.** On the day WTI was −$36.98, Brent was $17.36, a gap of $54.34 a barrel.

**The collapse underneath it was shared.**

![Monthly average spot prices for WTI and Brent, January 2019 to December 2020, US dollars per barrel, on a zero baseline. Brent averaged $63.65 and WTI $57.52 in January 2020. By April 2020 Brent averaged $18.38 and WTI $16.55, a fall of 71% for each. Neither monthly average goes below zero.](oil-below-zero-months.svg)

From January to April 2020, WTI's monthly average fell from $57.52 to $16.55 and Brent's from $63.65 to $18.38. Both lost 71%. Neither had averaged less in a month since 1999. Neither monthly average came near zero.

The fall in price, then, hit both benchmarks in the same proportion. Going below zero happened to WTI alone, on one day.

## Why WTI, and why that day

Price data shows where and when, not why. The explanation comes from the Commodity Futures Trading Commission's staff review of that day's trading ([interim staff report, November 2020](https://www.cftc.gov/media/5296/InterimStaffReportNYMEX_WTICrude/download)). COVID-19 lockdowns had cut demand for fuel. The May WTI futures contract expired on 21 April, and it is settled by physical delivery of oil at Cushing, where storage was largely full or already committed. Traders holding contracts they could not take delivery of had to sell, and on 20 April buyers had to be paid to take them. Brent futures, by contrast, are settled in cash against an index, not by delivery ([ICE contract specification](https://www.ice.com/products/219/Brent-Crude-Futures)).

The prices are consistent with that account: one benchmark negative, on the day before its contract expired, and positive again the next day. They do not test it. This dataset has no storage, futures-position or demand series.

## The wrinkle: Brent came close

Brent did not escape. On 21 April, the day after WTI's negative price, Brent fell to $9.12, two cents above its lowest daily price on record, $9.10 in December 1998. Nor was Brent always the dearer crude that spring: on 31 March it was $14.85, against WTI's $20.51. Both markets were at lows not seen since the late 1990s. Only WTI crossed zero, and only on the day before its delivery deadline.

## How this was made

Data: the [oil-prices](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices) dataset, EIA daily and monthly spot prices (Source: U.S. Energy Information Administration, Sep 2026). Its [build.ts](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/build.ts) rebuilds the CSVs from the archived EIA workbooks. [oil-below-zero-make-charts.mjs](oil-below-zero-make-charts.mjs) rebuilds both charts and reads every labelled value from the CSV rows, so re-running the two scripts reproduces every number here. The argument and chart plan are in the [outline](oil-below-zero-outline.md).
