---
title: "France Has Not Balanced Its Books Since Before the Euro"
---

# France Has Not Balanced Its Books Since Before the Euro

![Line chart of French Maastricht gross debt as a share of GDP, quarterly, 2000 to mid-2026. It rises from 60.5% (€855bn) in 2000 to 119.0% (€3.6 trillion) in mid-2026, with two steep steps: 69.8% to 84.1% between end-2008 and end-2009, and 98.2% to 114.9% between end-2019 and end-2020. It never falls back after either step; end-2025 is 115.7%.](france-debt-ratio.svg)

French public debt has doubled as a share of the economy since 2000, from 60.5% of GDP to 119.0% in mid-2026. In money it went from €855bn to €3.6 trillion. About half of the rise came in two single years, 2009 and 2020. After both, the ratio stayed up.

The debt is the total that the French state, local authorities and social security funds owe. Each year's deficit, spending minus revenue, adds to it. The ratio also moves with the size of the economy, which shrank in 2020, and this story does not split the two apart. Figures are from Eurostat and INSEE, as a share of GDP unless stated.

## Spending has been above revenue every year

![Line chart of French general government spending and revenue, % of GDP, 1995 to 2025, with the gap between them shaded as the deficit. Spending is above revenue in all 31 years. The deficit is smallest in 2000 (1.3) and largest in 2009 (7.4) and 2020 (8.9). Spending reaches 58.0 in 2009 and 61.7 in 2020, and is 57.2 in 2025 against 53.6 in 2007 and 55.3 in 2019. Revenue peaks at 54.3 in 2017, is 51.2 in 2024 and 52.1 in 2025.](france-debt-gap.svg)

France has run a deficit in all 31 years since 1995. The smallest was 1.3% of GDP, in 2000. In most years it was above 3%.

The gap widened in 2009 and 2020, when spending jumped to 58.0% and then 61.7% of GDP. It never closed again. Spending settled at about 57%, above where it stood before each shock (53.6% in 2007, 55.3% in 2019).

Two numbers cut against a simple "France spends too much" story. Spending was already 56.1% of GDP in 1995, so it has not climbed steadily for 30 years. And revenue has fallen. It peaked at 54.3% in 2017 and dropped to 51.2% in 2024. Between 2019 and 2024 the deficit went from 2.4% to 5.8%, and about half of that came from lower revenue. In 2025 it narrowed to 5.1%, but the debt ratio kept rising, from 115.7% at the end of 2025 to 119.0% by mid-2026.

## France taxes more than its neighbours, and spends more again

![Dot chart of general government revenue and spending, % of GDP, 2025. France: revenue 52.1, spending 57.2, deficit 5.1. Italy: 48.1 and 51.2, deficit 3.1. EU27: 46.4 and 49.5, deficit 3.1. Germany: 47.9 and 50.5, deficit 2.7. Spain: 42.9 and 45.3, deficit 2.4.](france-debt-neighbours.svg)

In 2025 France collected 52.1% of GDP, more than Germany (47.9%), Italy (48.1%) or the EU as a whole (46.4%). It spent 57.2%, against 49.5% for the EU. Its deficit, 5.1%, was the largest of the five.

## Where the money goes

![Bar chart of the change in French spending by function, percentage points of GDP, 1995 to 2024. Health rose from 6.9 to 8.9 and social protection (excluding health) from 22.0 to 23.7, with old age 11.0 to 13.4. General public services fell from 8.3 to 6.2, including debt interest 3.6 to 2.0. Education fell from 5.8 to 5.1, economic affairs 6.4 to 5.7 and defence 2.5 to 1.9. Total spending went from 56.1 to 57.3.](france-debt-functions.svg)

Social protection, which excludes health, is the largest function at 23.7% of GDP in 2024. Since 1995 the growth has been in health (6.9% to 8.9%) and old-age spending (11.0% to 13.4%). Debt interest, education and defence all shrank, so total spending rose only from 56.1% to 57.3%. INSEE attributes most of the 2024 increase to social protection, mainly pensions uprated in line with past inflation, and to health ([Insee Première n° 2093](https://www.insee.fr/fr/statistiques/8735252)).

## Interest is rising, but it is not most of the gap

![Stacked bar chart splitting the 2025 deficit, % of GDP, into the primary balance and interest. France: primary deficit 2.9, interest 2.2, total 5.1. Italy: primary surplus 0.8, interest 3.9, total 3.1. EU27: 1.2 and 1.9, total 3.1. Germany: 1.6 and 1.1, total 2.7. Spain: 0.0 and 2.4, total 2.4. French interest paid rose from €29.7bn in 2020 to €66.6bn in 2025.](france-debt-interest.svg)

Take interest out and France still had a deficit of 2.9% of GDP in 2025. Interest added 2.2%. Italy paid more in interest, 3.9%, but ran a surplus of 0.8% before paying it. France's deficit before interest is the largest of the five.

Interest is rising: €29.7bn in 2020, €66.6bn in 2025. As a share of GDP it is still below the 3.5% France paid in 1995.

INSEE puts the 2025 improvement down mainly to faster revenue growth, helped by new tax measures, and to spending slowing as energy support ended and inflation fell ([Insee Première n° 2106](https://www.insee.fr/fr/statistiques/8997691)). This data has no bond yields, ratings or budget votes. It cannot show how markets or politicians read the numbers, only the gap they are reading.

## How this was made

The numbers come from the [`france-public-finances`](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances) dataset: Eurostat's government accounts (update of 21 July 2026) and spending by function (16 September 2026), and INSEE's quarterly debt release of 29 September 2026. Its [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts) turns the archived source files into CSVs. [`france-debt-make-charts.mjs`](france-debt-make-charts.mjs) draws the charts from those rows, and re-running both reproduces every number here. Interest is Eurostat's `D41PAY`; INSEE's own article reports €64.7bn for 2025 on a different treatment. The argument is fixed in the [outline](france-debt-outline.md).
