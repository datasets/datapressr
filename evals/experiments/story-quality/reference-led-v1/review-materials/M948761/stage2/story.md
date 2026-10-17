# Oil Went Below Zero for One Day, in One Place

# Oil Went Below Zero for One Day, in One Place

![Line chart of daily WTI and Brent spot prices, January to June 2020, in US dollars per barrel. Both fall from 6 January (Brent $70.25, WTI $63.27) to 17 April (WTI $18.31, down 71%; Brent $19.75, down 72%). On 20 April WTI drops through the zero line to −$36.98 while Brent is $17.36, $54.34 higher. On 21 April Brent is $9.12 and WTI $8.91. Both recover to about $40 by the end of June.](chart-1.png)

**On 20 April 2020 the spot price of WTI crude was −$36.98 a barrel. Brent was $17.36.**

The price of oil did not go below zero. One price did: West Texas Intermediate (WTI), delivered at Cushing, Oklahoma, for one trading day. Where and for how long are the clues to why.

## What the numbers are

These are daily spot prices from the U.S. Energy Information Administration (EIA), in US dollars per barrel, not adjusted for inflation. A spot price is the price of physical oil changing hands now. WTI is priced at Cushing, an inland hub of pipelines and storage tanks. Brent is North Sea crude, loaded onto ships at sea terminals. A negative price means the seller paid the buyer to take the oil away.

The WTI record starts in January 1986. In 10,236 days of prices, 20 April 2020 is the only one below zero. Brent, recorded daily since May 1987, has never been negative.

## What they show

The slump was shared. Between 6 January, the highest price of 2020 for both, and Friday 17 April, WTI fell from $63.27 to $18.31 and Brent from $70.25 to $19.75: drops of 71% and 72%. Through March and early April the two moved together, with WTI sometimes the higher of the two.

The fall below zero was not shared. On Monday 20 April WTI went to −$36.98 while Brent stayed at $17.36, $54.34 higher.

It was also brief. WTI was back to $8.91 the next day. Its average for the week ending 24 April was $3.32, and for April as a whole $16.55. Neither average went below zero. By 29 May WTI was at $35.57.

![Line chart of the WTI spot price, March to May 2020, with EIA's weekly averages as a step line and the April monthly average as a dashed line. The daily price falls to −$36.98 on 20 April, the only point below zero, and is $8.91 the next day. The average for the week ending 24 April is $3.32 and the April average $16.55. The daily price ends May at $35.57.](chart-2.png)

## Why, according to EIA

The prices show what happened, where and for how long. They do not show why. EIA's [explanation](https://www.eia.gov/todayinenergy/detail.php?id=43495) is this. Pandemic restrictions cut demand for oil sharply, and crude storage at Cushing, the delivery point for the main US WTI futures contract, was filling up. The May 2020 contract expired on 21 April. Holders who could not take delivery of physical barrels at Cushing had to sell, and with tank space short, few buyers could take the oil. So sellers paid buyers to take it.

This data does not test that account, and it cannot rule out other contributors. But the record has the shape the account describes: one inland price, one day, the day before a contract expired, while the seaborne benchmark stayed positive.

## The wrinkle

Brent did not escape. On 21 April it fell to $9.12, two cents above its lowest daily price on record, $9.10 in December 1998. WTI was $8.91 that day. What lasted a single day was the gap between the two, not the pressure on both.

The figure most often quoted for 20 April, −$37.63, is the settlement price of the May futures contract, as reported by EIA. The −$36.98 here is the spot price. They measure different things.

And as a monthly average in nominal dollars, April 2020 was not WTI's lowest month. December 1998 averaged $11.35.

## How this was made

Data: [oil-prices](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices), EIA daily, weekly and monthly spot prices for Brent and WTI, built by [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/build.ts) from archived EIA workbooks. Charts: [`oil-below-zero-make-charts.mjs`](oil-below-zero-make-charts.mjs), Observable Plot rendered to static SVG. Re-running both reproduces every number here. The argument and chart plan are in the [outline](oil-below-zero-outline.md). Source: U.S. Energy Information Administration (Sep 2026).
