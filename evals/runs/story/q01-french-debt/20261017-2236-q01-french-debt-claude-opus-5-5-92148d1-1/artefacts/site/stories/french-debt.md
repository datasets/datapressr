---
title: "France Never Closed the Gap"
description: "French public debt has doubled to 119% of GDP since 2000. The accounts show why: a deficit every year since 1995, with spending above even France's high revenue."
publish: false
datahub:
  slug: france-never-closed-the-gap
  status: draft
---

# France Never Closed the Gap

![Line chart of French gross government debt as a share of GDP, quarterly, 2000 to mid-2026. It rises from 59.7% at end-2000 to 119.0% (€3.6 trillion) in mid-2026, with a step of +18.6 points from end-2007 (65.5%) to end-2009 (84.1%), another of +16.7 points from end-2019 (98.2%) to end-2020 (114.9%), and a dip to 109.5% at end-2023 before rising again.](french-debt-ratio.svg)

French public debt has doubled as a share of the economy since 2000, from 59.7% of GDP to 119.0% in June 2026. The reason in the accounts is plain: France has not balanced its budget in any year since at least 1995.

A debt crisis also has a market and a political side: bond yields, ratings, governments that fall over budgets. This data does not cover that. It covers the arithmetic underneath.

## Two steps up, none down

The figure is INSEE's Maastricht debt: what central government, local authorities and social security owe, at face value. Two steps account for most of the rise. Debt rose 18.6 points of GDP from end-2007 to end-2009, and 16.7 points in 2020. Neither step was reversed. After the first, the ratio kept climbing until 2017. After the second, it eased to 109.5% at end-2023, then rose again. That dip came from an economy growing faster than the debt, not from repayment: the debt in euros kept rising. It now stands at €3.6 trillion.

## A deficit every year

![Bar chart of French net borrowing as a share of GDP, 1995 to 2025, with interest paid as a line. Every one of the 31 years is a deficit, above the 3% Maastricht reference in 23. Deficits: 1.3% in 2000, 7.4% in 2009, 8.9% in 2020, 5.1% in 2025. Interest: 3.6% in 1996, 1.3% in 2020, 2.2% in 2025. Borrowing has exceeded interest every year since 2002.](french-debt-borrowing.svg)

Debt grows when the state borrows, and France has borrowed in all 31 years of Eurostat's annual accounts. The smallest deficit was 1.3% of GDP, in 2000. It was above the [3% reference in the EU's Maastricht rules](https://blog.insee.fr/depenses-et-recettes-des-comptes-publics/) in 23 of those years, and larger than the EU-wide deficit in 26.

Interest is not most of it. In 2025 France borrowed 5.1% of GDP and paid 2.2% in interest, so more than half of the borrowing went on everything else the state does. Borrowing has exceeded the interest bill every year since 2002.

## Not a shortage of revenue

![Dot chart of government revenue and spending as a share of GDP in 2025. France: revenue 52.1%, spending 57.2%, deficit 5.1. Italy: 48.1% and 51.2%, deficit 3.1. Germany: 47.9% and 50.5%, deficit 2.7. EU27 aggregate: 46.4% and 49.5%, deficit 3.1. Spain: 42.9% and 45.3%, deficit 2.4.](french-debt-revenue-spending.svg)

France does not collect too little. Its government took in 52.1% of GDP in 2025, more than Italy (48.1%), Germany (47.9%) or Spain (42.9%), and above the EU aggregate (46.4%). It spent 57.2%. The resulting deficit, 5.1%, is the widest of the five: Italy and the EU ran 3.1%, Germany 2.7%, Spain 2.4%.

## What grew, and what made room

![Bar chart of the change in French public spending by function as a share of GDP, 1995 to 2024. Old age +2.4 points and health +2.0 rose most. General public services fell 2.1, of which debt interest 1.6; education and economic affairs fell 0.7 each, defence 0.6. Total spending went from 56.1% to 57.3% of GDP. Social protection was 23.7% of GDP in 2024, of which old age 13.4.](french-debt-spending-change.svg)

Spending has not surged overall: 56.1% of GDP in 1995, 57.3% in 2024. Its mix has changed. Old age, the largest single category at 13.4% of GDP, rose 2.4 points. Health rose 2.0. Most other areas shrank as a share of the economy: education and economic affairs by 0.7 points each, defence by 0.6. The largest fall, 2.1 points, was in general public services, and 1.6 of that was interest on the debt, even as the debt grew. The interest fall alone offset more than a third of the rise in old-age and health spending.

## The cushion is going

That offset is now reversing. Interest cost 3.6% of GDP in 1996 and 1.3% in 2020; by 2025 it was back to 2.2%. INSEE [attributes the 2025 increase](https://www.insee.fr/fr/statistiques/8997691) to the larger stock of debt and the rise in interest rates since 2022. The same report shows the deficit narrowing from 5.8% in 2024, mainly through new revenue measures, while spending growth slowed with inflation. Many social benefits, pensions among them, are indexed to past inflation.

The data does not say why old-age and health spending grew; ageing, indexation and policy choices each need their own evidence. What it does show is the gap. France raises more than its neighbours, spends more still, and has run a deficit every year for three decades. With interest costs rising again, falling interest no longer makes room for the rest of the budget.

## How this was made

Data: [`france-public-finances`](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances), from Eurostat government accounts (`gov_10a_main`, updated 21 July 2026; `gov_10a_exp`, 16 September 2026) and INSEE's [quarterly debt release](https://www.insee.fr/fr/statistiques/9053525) of 29 September 2026. All figures are general government, nominal, as a share of GDP. Interest is Eurostat's `D41PAY`; INSEE's own article quotes a slightly lower figure, before allocating indirectly measured bank services (FISIM). Spending by function for 2024 is provisional and 2025 is not yet published. The dataset's [build script](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts) turns the archived sources into CSVs, and [`french-debt-make-charts.mjs`](french-debt-make-charts.mjs) draws the charts from them; re-running both reproduces every number.

## Friction notes

- review: self (blind run, no reviewer available). Outline: [`french-debt-outline.md`](french-debt-outline.md) (approved revision `5903277`). Outline review: [`french-debt-outline-review.md`](french-debt-outline-review.md). Final editorial review: [`french-debt-editorial-review.md`](french-debt-editorial-review.md).
- The charts were not inspected visually: there is no supported way to rasterise SVG in this workspace. I checked each chart from its SVG source instead (text labels, axis ticks, `viewBox` 720 wide), plus an estimated-bounding-box pass for clipping, label overlaps and labels crossing the chart-1 line. That pass moved three labels.
- **Exempt numbers** (not on a chart):
  - 5.8%: attributed external figure (INSEE, 2024 deficit; Eurostat agrees, but it is not labelled on chart 2)
- Derived phrasings, with no new number: "more than half" (5.1 − 2.2 = 2.9 of 5.1) and "more than a third" (1.6 of 2.4 + 2.0).
- The dataset is `status: archived`: the INSEE HTML parser behind `quarterly-debt` has not had its independent review. The two quarterly values the story leans on (119.0%, 115.7% at end-2025) match the archived INSEE release text.
- The author's voice pass is outstanding (no human author in this blind run; this is the best final draft).
