# France Has Run a Deficit Every Year Since 1995

# France Has Run a Deficit Every Year Since 1995

![Line chart of French general government spending and revenue as a share of GDP, 1995 to 2025. The spending line is above the revenue line in every year. Spending was 56.1% in 1995 and 57.2% in 2025; revenue was 50.9% and 52.1%. Marked deficits: 1.3% in 2000, 7.4% in 2009, 8.9% in 2020 and 5.1% in 2025.](chart-1.png)

The French government has spent more than it raised in every one of the last 31 years. That persistent gap, not one bad year, is why the debt keeps climbing.

The record is Eurostat's account of French general government: the state, local authorities and the social security funds together. Revenue includes social contributions as well as taxes. The smallest deficit since 1995 was 1.3% of GDP, in 2000. The largest came with the financial crisis (7.4% in 2009) and Covid (8.9% in 2020). In 2025 the government spent 57.2% of GDP and raised 52.1%, a deficit of 5.1%.

## Every deficit adds to the debt

![Line chart of French gross public debt as a share of GDP at the end of each quarter, 2000 to 2026. It was 60.5% in Q1 2000 and 65.5% at end-2007, jumped to 84.1% by end-2009, reached 98.2% at end-2019, jumped to 114.9% at end-2020, dipped to 109.5% at end-2023 and stood at 119.0%, or €3.6 trillion, in Q2 2026.](chart-2.png)

A deficit is financed mostly by borrowing, so each year's gap lands on the stock of debt. INSEE puts gross debt at 119.0% of GDP in mid-2026, €3.6 trillion, up from 60.5% in early 2000. It climbs in steps. The financial crisis took it from 65.5% at the end of 2007 to 84.1% two years later. Covid took it from 98.2% to 114.9% in 2020. Between shocks it did not fall back, while the deficit narrowed but never closed.

## Not low taxes: high spending

![Dot chart of government revenue and spending as a share of GDP in 2025. France: revenue 52.1%, spending 57.2%, deficit 5.1%, the highest on all three. Italy: 48.1% and 51.2%, deficit 3.1%. Germany: 47.9% and 50.5%, deficit 2.7%. EU27 average: 46.4% and 49.5%, deficit 3.1%. Spain: 42.9% and 45.3%, deficit 2.4%.](chart-3.png)

Low revenue is not the explanation. In 2025 its government raised 52.1% of GDP, more than Italy (48.1%), Germany (47.9%) or the EU average (46.4%). But it spent 57.2%, against an EU average of 49.5%. That left the widest deficit of the five, at 5.1% of GDP; Germany's was 2.7% and Spain's 2.4%.

![Bar chart of French minus EU27 average government spending in 2025 by economic type, in points of GDP. France spends 7.7 points more in total. Cash benefits +2.9 (19.4% against 16.5%), public-sector pay +2.1, in-kind benefits +1.0, subsidies +0.5, investment +0.5, interest +0.3, all other spending +1.1, goods and services bought −0.7.](chart-4.png)

Most of that 7.7-point difference sits in two places: cash benefits such as pensions (+2.9 points of GDP) and public-sector pay (+2.1). Interest adds only +0.3. These accounts cannot say how much of the benefits gap is pensions: the comparable Eurostat category also covers unemployment, family and other benefits. INSEE [reports](https://www.insee.fr/fr/statistiques/8735252) that pensions, which are raised in line with past inflation, were the main source of French spending growth in 2024.

## A gap that never closed, not a spending spree

French spending is barely higher as a share of GDP than it was in 1995: 56.1% then, 57.2% in 2025. Revenue rose too, from 50.9%. Spending jumps in each crisis and only partly falls back. The deficit narrowed in 2025, and between the end of 2020 and the end of 2023 the debt ratio fell from 114.9% to 109.5%: the debt kept growing in euros, but GDP measured in euros grew faster.

The newer pressure is interest. INSEE [reports](https://www.insee.fr/fr/statistiques/8997691) that interest spending rose 14.3% in 2025 after 13.2% in 2024, as a larger debt met the higher interest rates of the years since 2022.

These accounts explain why the debt is high and still rising. They contain no bond yields, credit ratings or budget votes, so they cannot show the market and political side of the crisis. Nor can they say which spending choice caused which deficit.

## How this was made

Data: [france-public-finances](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances), built from Eurostat's government accounts (`gov_10a_main`, update of 21 July 2026) and INSEE's quarterly debt release of 29 September 2026 by [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts). [`french-debt-make-charts.mjs`](french-debt-make-charts.mjs) draws the charts from the dataset's CSVs; re-running both reproduces every chart and every figure drawn from the dataset. INSEE's own annual account puts 2025 spending and revenue 0.1 point higher than Eurostat; both give a 5.1% deficit. The dataset is at the `archived` stage: its independent review is still outstanding. The [outline](french-debt-outline.md) records the argument and its review.
