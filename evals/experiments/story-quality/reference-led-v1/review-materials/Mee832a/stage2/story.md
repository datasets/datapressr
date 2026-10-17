# Oil Went Below Zero for One Day, in One Place

# Oil Went Below Zero for One Day, in One Place

![Daily spot prices of WTI and Brent crude, January to June 2020. Both fall from early January (WTI $61.17, Brent $67.05) to Friday 17 April (WTI $18.31, Brent $19.75). On Monday 20 April WTI drops to −$36.98 while Brent is $17.36. On Tuesday 21 April WTI is $8.91 and Brent $9.12. Both then recover above $35 by the end of June.](chart-1.png)

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

![WTI daily spot price, March to May 2020, with weekly and monthly averages. The daily price falls to −$36.98 on Monday 20 April. The weekly average for the week ending Friday 24 April is $3.32, and the April monthly average is $16.55. Neither average goes below zero.](chart-2.png)

The negative number is a one-day reading. Averaged over the week ending Friday 24 April, WTI's spot price was $3.32. Its April average was $16.55. None of the EIA's weekly, monthly or annual WTI averages has ever been below zero. That is a fact about averages of spot quotes. It does not say what any particular buyer paid under contract.

## How this was made

Data: [oil-prices](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices), Brent and WTI spot prices from the EIA, archived on 5 September 2026. Source: U.S. Energy Information Administration (Sep 2026). [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/build.ts) turns the EIA's workbooks into eight CSVs. [`oil-below-zero-make-charts.mjs`](oil-below-zero-make-charts.mjs) draws both charts from those CSVs and reads every labelled value from the rows. Re-running both reproduces the numbers here. The argument and chart plan are in the [outline](oil-below-zero-outline.md).
