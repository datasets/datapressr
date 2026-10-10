---
title: "France Has Run a Deficit Every Year Since 1995"
description: "French public debt has doubled to 119% of GDP since 2000. The cause is a gap between spending and revenue that has never closed, and most of it is not interest."
---

# France Has Run a Deficit Every Year Since 1995

![Line chart of French general government gross debt as a percentage of GDP, quarterly, 2000 to 2026. It rises from 60.5% in 2000-Q1 to 65.5% in 2007-Q4, 98.2% in 2019-Q4 and 114.9% in 2020-Q4, falls to 109.5% in 2023-Q4, then climbs to 119.0% (€3,595.5 billion) in 2026-Q2. A dashed line marks the 60% Maastricht reference value.](france-debt-ratio.svg)

French public debt has doubled relative to the economy since 2000, from 60.5% of GDP to 119.0% in mid-2026. That is €3,595.5 billion.

The debt rose in steps. It was 65.5% at the end of 2007 and 98.2% at the end of 2019. Each crisis added a step that later years did not reverse. After 2009 the ratio never returned to its pre-crisis level. It reached 114.9% at the end of 2020. It then fell to 109.5% by the end of 2023, because inflation pushed up nominal GDP while the euro amount of debt kept rising. Since then it has been rising again.

## What this is

The debt series is the Maastricht gross debt of French general government (the state, local authorities and social security together), from INSEE's quarterly release of 29 September 2026. The annual figures are Eurostat's government accounts as a percentage of GDP, 1995–2025. Figures for 2025 are the latest estimates and may be revised.

## Spending has exceeded revenue every year

![Bar chart of the French general government balance as a percentage of GDP, 1995 to 2025, with every bar below zero. Labelled bars: −1.3 in 2000, −7.4 in 2009, −8.9 in 2020, −5.1 in 2025. A line shows the balance excluding interest: positive only from 1998 to 2001, peaking at +1.7 in 2000, and negative every year since 2002, at −2.9 in 2025. Interest was 1.3% of GDP (€29.7 billion) in 2020 and 2.2% (€66.6 billion) in 2025.](france-debt-deficit.svg)

Debt grows when a government borrows to cover a deficit, and France has had one in every year in the data. The smallest was 1.3% of GDP in 2000. The largest were 7.4% in 2009 and 8.9% in 2020. In 2025 it was 5.1%.

Interest is not the main cause. Excluding interest, France ran a surplus only from 1998 to 2001, peaking at 1.7% of GDP. It has been in deficit before interest every year since 2002. In 2025 that primary deficit was 2.9% of GDP: before paying any interest, the state was still short.

Interest is growing, though. It rose from 1.3% of GDP (€29.7 billion) in 2020 to 2.2% (€66.6 billion) in 2025. INSEE puts the cause at a larger debt stock and the rise in interest rates since 2022 ([Insee Première n° 2106](https://www.insee.fr/fr/statistiques/8997691)). Under INSEE's own accounting convention the 2025 bill is €64.7 billion.

## France taxes a lot and spends more

![Line chart of spending and revenue as a percentage of GDP, 1995 to 2025, for France and the EU27. French spending is the top line throughout, at 57.2% in 2025. French revenue is 52.1%, above both EU27 lines (spending 49.5%, revenue 46.4%). French 2019 values are marked: spending 55.3%, revenue 53.0%.](france-debt-spending-revenue.svg)

The gap does not come from low revenue. In 2025, French government revenue was 52.1% of GDP, against 46.4% across the EU27. Spending was 57.2%, against 49.5%. France collects 5.7 points of GDP more than the EU average and spends 7.7 points more.

The recent widening has two sides. From 2019 to 2025, spending rose from 55.3% to 57.2% of GDP and revenue fell from 53.0% to 52.1%.

Persistent deficits are not unique to France. The EU27 as a whole, and Italy, also ran one every year from 1995 to 2025. What marks France out is the size of both totals.

The data shows where the gap sits. It does not show why spending is high. INSEE attributes most of the 2024 rise in spending to pensions and health ([Insee Première n° 2093](https://www.insee.fr/fr/statistiques/8735252)). That explains one year, not three decades. The dataset also has no bond-market data, so it cannot say when rising debt becomes a "crisis". It can only say that the debt has not stopped rising.

## How this was made

Data: [france-public-finances](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances), from Eurostat (`gov_10a_main`) and INSEE. [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts) builds the CSVs from an archived snapshot. [`france-debt-make-charts.mjs`](france-debt-make-charts.mjs) draws the charts from those CSVs, and re-running both reproduces every number here. The primary balance is the published deficit plus published interest, each rounded to 0.1% of GDP. The argument and chart plan are in the [outline](france-debt-outline.md). The dataset's status is still `archived`: its INSEE table parser has not yet had an independent review.

## Friction notes

- **Outstanding:** the author's voice pass, and an independent review of the outline. The outline's numbers were reproduced mechanically by its author only (see the outline's Review section).
- Numbers not printed on a chart: 5.7 and 7.7 points, and the 1.9 and 0.9 point changes, are differences of charted values. "Every year 1995–2025" is a count across the dataset. Italy's unbroken deficits come from the same resource but are not charted. €64.7 billion is an attributed INSEE figure.
- The deficit chart's y-domain is −10 to +4, not the −10 to +3 in the chart plan, to leave room for the key above the 1998–2001 surpluses.
- The charts could not be rasterised in the build sandbox. Label collisions were checked from SVG text coordinates, not by eye, and the phone-width check is outstanding.
- The quarter-end labels hide the post-2020 peak, 117.8% in 2021-Q1. The prose says "reached 114.9% at the end of 2020", not "peaked", for that reason.
- The outline's working title ("Has Not Balanced a Budget Since 1995") implied 1995 was balanced, which it was not. It was retitled.
