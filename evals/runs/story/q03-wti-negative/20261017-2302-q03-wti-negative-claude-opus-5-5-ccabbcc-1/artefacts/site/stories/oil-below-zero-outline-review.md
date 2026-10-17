---
title: "Outline review: Oil Went Below Zero for One Day, in One Place"
description: "Step 2 gate record for the oil-below-zero outline: reader questions, reproduced numbers, corrections and verdict."
publish: false
---

# Outline review: oil-below-zero

- **Reviewer:** review: self (blind run, no reviewer available). The author of the outline ran the skill's step 2 checklist on the committed revisions. This is not an independent review.
- **Date:** 2026-10-18.
- **Data:** `datasets/energy-and-commodities/oil-prices/data/{wti,brent}-{daily,weekly,monthly,year}.csv` at commit `2446dd6` (unchanged since baseline).

## Reader questions (written before rereading the outline)

1. What does a negative oil price mean: who paid whom?
2. Was it all oil, or one kind of oil in one place?
3. How long did it last?
4. What caused it: the pandemic, storage, the futures market?
5. How far had prices already fallen before that day?
6. The figure I remember is about -$37. Is this the same number?
7. Has it happened before, and did it change what oil cost that month?
8. Did it make petrol cheaper for anyone?

Against the outline:

1. **Answered** (beat 4, attributed): holders of expiring contracts paid others to take the barrels.
2. **Answered** (beats 1, 2, 5): WTI at Cushing only; Brent stayed positive.
3. **Answered** (beat 1): one trading day; $8.91 the next.
4. **Answered, attributed** (beat 4): EIA for the storage/expiry mechanism, IEA for demand. The data does not test it, and the outline says so.
5. **Answered** (beat 3): about 70% for both, 2 January to 17 April.
6. **Answered** (beat 2): -$37.63 is the NYMEX futures settlement; this dataset has the EIA spot price, -$36.98.
7. **Answered** (beats 1, 5): the only negative value among 10,236 daily WTI prices since 1986; the weekly and monthly averages stay positive.
8. **Missed, which is acceptable.** Retail fuel prices are not in the data, and it would be a second story. Recorded as a limitation, not a correction.

## Reproduced numbers

Independent scan with a fresh script (not the chart builder), [`oil-below-zero-outline-scan.mjs`](oil-below-zero-outline-scan.mjs), run as `node oil-below-zero-outline-scan.mjs ../../datasets/energy-and-commodities/oil-prices/data`:

| claim | reproduced |
|---|---|
| WTI daily rows, first date | 10,236, 1986-01-02 |
| Brent daily rows, first date | 9,967, 1987-05-20 |
| WTI values ≤ 0 | one row: 2020-04-20, -36.98 |
| Brent values ≤ 0 | none |
| 2020-01-02 | WTI 61.17, Brent 67.05 |
| 2020-04-17 | WTI 18.31, Brent 19.75 |
| 2020-04-20 | WTI -36.98, Brent 17.36 |
| 2020-04-21 | WTI 8.91, Brent 9.12 |
| Brent all-time daily min | 9.10 on 1998-12-10 |
| fall 2 Jan → 17 Apr | WTI 0.7007, Brent 0.7054 |
| WTI weekly, week ending 2020-04-24 | 3.32 (mean of 5 daily = 3.324) |
| WTI monthly, 2020-04-15 | 16.55 (mean of 21 daily = 16.548) |
| WTI weekly / monthly / annual minimum | 3.32 (2020-04-24) / 11.35 (1998-12-15) / 14.42 (1998) |
| weekdays | 2 Jan 2020 Thursday; 17 Apr Friday; 20 Apr Monday; 21 Apr Tuesday; 24 Apr Friday |
| calendar differences, H1 2020 | WTI has no 2020-01-20 or 2020-02-17; Brent has no 2020-04-13 or 2020-05-08; neither has 2020-04-10 |

External figures (-$37.63 settlement, 21 April expiry, Brent cash settlement, IEA demand context) could not be checked offline and are recorded as attributed, not reproduced.

## Round 1: commit `d64e2a0`, outline SHA-256 `6c227c9c2656eef459b854402bc03831fb81b5632602a9a94b1f27cdaad440b2`

**Verdict: CHANGES_REQUIRED**

1. *Beat 3 and "What the data shows".* The comparison used different end dates: WTI fell 70% to 17 April, Brent 74% to 20 April. That mixes a pre-event day with the event day. Measure both over 2 January → 17 April (70.1%, 70.5%) and label 17 April for both on chart 1.
2. *Beat 4.* "Brent futures are cash-settled and Brent is loaded onto ships at sea, so it was not trapped the same way" is a mechanism with no source. Attribute the cash settlement to the ICE contract specification and drop the unsourced "not trapped" reasoning.
3. *Beat 5.* "Anyone who bought crude in April 2020 paid, on average, a positive price" overclaims. A mean of daily spot quotes is not what buyers paid. Restate it as a fact about the average of spot prices.

The chart-plan checks passed. Fields exist and the windows contain the annotated dates. The two resources are drawn separately, with no join, and the plan lists the calendar differences. Weekly prices are drawn as steps and monthly prices as month-long segments. Both y-domains include -36.98.

## Round 2: commit `e9acf92`, outline SHA-256 `3cd07a0a11f30bb75b62fda853903a23ab3ef99321fc3c59b5ba7c5e4f8bb0a0`

Corrections 1 to 3 are verified as fixed. **Verdict: CHANGES_REQUIRED**

4. *Line 15, the argument sentence.* It says "on a contract's last trading day", but beat 4 says the May contract expired on 21 April, so 20 April was the day *before* expiry. Fix the wording to match the attributed source.
5. *Chart 2 row.* Starting the weekly window at the week ending 2020-03-06 under `step-before` leaves that first week with no step to its left. Add the week ending 2020-02-28 as the left edge and clip the x-domain to March to May.

## Round 3: commit `ac79a0c`, outline SHA-256 `2333094f4a92fbcf9923dcc46785878a214de7b9d53b5b981a3e186b4eecdacd`

Corrections 4 and 5 are verified as fixed. All the numbers above match the outline, and the outline makes no causal claim beyond its attributed sources. It includes the counter-numbers: Brent's $9.12 against its $9.10 record, and the weekly and monthly averages staying positive.

**Verdict: APPROVED**
