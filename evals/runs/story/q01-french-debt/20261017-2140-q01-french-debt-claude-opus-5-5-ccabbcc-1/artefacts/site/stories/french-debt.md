---
title: "Why French Debt Keeps Climbing"
description: "France has spent more than it collects every year since at least 1995. Two shocks turned that into steps in the debt, and interest is now rising on top."
publish: false
datahub:
  slug: why-french-debt-keeps-climbing
  status: draft
---

# Why French Debt Keeps Climbing

![Line chart of French gross public debt as a share of GDP by quarter, 2000 to mid-2026, on a zero baseline. It rises from 60.5% in early 2000 to 65.5% at the end of 2007, jumps to 84.1% at the end of 2009 and from 98.2% at the end of 2019 to 114.9% at the end of 2020, dips to 109.5% at the end of 2023, and reaches 119.0%, €3.6 trillion, in mid-2026.](french-debt-ratio.svg)

French public debt was 60.5% of GDP in early 2000. By mid-2026 it was 119.0%, or €3.6 trillion. It climbed in steps, and the steps never fully came back down.

This is Maastricht gross debt: what central government, local authorities and social security funds owe, at face value, as a share of a year's GDP. The deficit is the yearly gap between what they spend and what they collect. Each deficit adds to the debt. The ratio falls only when the economy's cash value grows faster than the debt.

## A deficit every year

![Bar chart of France's general government balance, 1995 to 2025, as % of GDP, split into interest paid and the balance before interest. Every year's total is negative: 1.3% in 2000, 7.4% in 2009, 8.9% in 2020, 5.8% in 2024 and 5.1% in 2025. The balance before interest was last in surplus in 2001, at +1.7%. Interest was 1.3% of GDP (€30bn) in 2020 and 2.2% (€67bn) in 2025, leaving a deficit before interest of 2.9%.](french-debt-deficit.svg)

France has spent more than it collected in every year since at least 1995, where the series starts. The smallest gap was 1.3% of GDP, in 2000. Leave interest aside and France last ran a surplus in 2001, at 1.7% of GDP. It has run a deficit before interest every year since.

The shocks made the steps. The deficit reached 7.4% of GDP in 2009, and debt went from 65.5% at the end of 2007 to 84.1% two years later. The deficit reached 8.9% in 2020, and debt went from 98.2% to 114.9% in one year. Between the shocks, deficits stayed large enough that the ratio kept edging up.

After the pandemic the ratio did fall, to 109.5% at the end of 2023, as the economy grew faster in cash terms than the debt. It has risen since, with deficits of 5.8% in 2024 and 5.1% in 2025, both smaller than in either shock.

Interest is now rising on top. It cost 1.3% of GDP (€30bn) in 2020 and 2.2% (€67bn) in 2025. INSEE attributes the rise to a larger debt and to interest rates climbing since 2022 ([Insee Première n° 2106](https://www.insee.fr/fr/statistiques/8997691)). But interest took a larger share of GDP in 1995–2001 than it does now, and most of the 2025 deficit is not interest: 2.9 points of the 5.1 came from the rest of the budget.

## Not a shortage of revenue

![Dot plot for 2025, as % of GDP, axis from 40 to 60. Revenue and spending: France 52.1 and 57.2, Italy 48.1 and 51.2, Germany 47.9 and 50.5, EU-27 aggregate 46.4 and 49.5, Spain 42.9 and 45.3. Deficits: France 5.1, Italy 3.1, Germany 2.7, EU-27 3.1, Spain 2.4. Balance before interest: France −2.9, Italy +0.8, Germany −1.6, EU-27 −1.2, Spain 0.0.](french-debt-peers.svg)

France collects more than its neighbours: 52.1% of GDP in 2025, against 48.1% in Italy, 47.9% in Germany and 42.9% in Spain. It spends more still, 57.2%. Its deficit of 5.1% is the largest of the group. France had the highest revenue and the highest spending of the four countries in every year of the series.

Deficits alone are not unusual. Italy, and the EU as a whole, also ran one every year. The difference is the balance before interest: −2.9% of GDP in France, +0.8% in Italy, which pays more interest. The dataset has no debt figures for the other countries.

## Where the money goes

![Dumbbell chart of French public spending by function, % of GDP, 1995 against 2024. Social protection excluding health 22.0 to 23.7, of which old age 11.0 to 13.4; health 6.9 to 8.9; general public services 8.3 to 6.2, of which debt interest 3.6 to 2.0; economic affairs 6.4 to 5.7; education 5.8 to 5.1; defence 2.5 to 1.9. Total spending 56.1 in 1995 and 57.3 in 2024 (provisional).](french-debt-functions.svg)

Spending was 56.1% of GDP in 1995 and 57.3% in 2024. The total barely moved; the mix did. Old-age benefits rose from 11.0% to 13.4% of GDP, and health from 6.9% to 8.9%. Defence, education and debt interest took smaller shares. INSEE describes the 2024 rise in spending as "portée par les retraites et la santé", driven by pensions and health ([Insee Première n° 2093](https://www.insee.fr/fr/statistiques/8735252)). That shows where the money goes, not which part caused the deficit: revenue rose too, and the gap has stayed open rather than steadily widened.

This data has no bond yields, credit ratings or votes in parliament, so it cannot say why the word "crisis" is in use now. It shows the arithmetic underneath: a state that has borrowed every year since at least 1995, a debt that rose with each shock and was never fully brought back, and an interest bill growing again.

## How this was made

Data: the [`france-public-finances`](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances) dataset: Eurostat government accounts (`gov_10a_main`, updated 21 July 2026; `gov_10a_exp`, 16 September 2026, reused under Eurostat's reuse policy) and INSEE's [quarterly debt release](https://www.insee.fr/fr/statistiques/9053525) of 29 September 2026 (Licence Ouverte 2.0), retrieved 8 October 2026. Interest is Eurostat's `D41PAY`; INSEE's convention gives €64.7bn for 2025. "Before interest" is the balance plus interest, each rounded to 0.1 point. [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts) builds the CSVs from the archived snapshot; [`french-debt-make-charts.mjs`](french-debt-make-charts.mjs) draws the charts, and re-running it reproduces every number. [Outline](french-debt-outline.md).

## Friction notes

- **Review: self (blind run, no reviewer available).** The outline review ([record](french-debt-outline-review.md)) and the final editorial review (recorded in `french-debt-editorial-review.md`, written after this commit) were done by the author, not an independent agent. The independent final review required by the skill is still outstanding before handoff for shipping.
- **Charts were not inspected visually.** No supported way to rasterise SVG was available. Each chart was checked from its SVG source: `viewBox` and width (720 px), text labels, axis ticks and label coordinates against line and bar positions. Phone-width (~360 px) legibility is untested.
- **Exempt numbers** (not on a chart):
  - 2022: attributed external figure (INSEE, start of the rise in interest rates)
  - €64.7bn: attributed external figure (INSEE's 2025 interest under its own convention)
- The dataset is at `status: archived`, not `structured`; its parser review is outstanding. `node build.ts` could not be re-run here (its `jsdom` dependency is not installed and there is no network); the CSVs were used as committed, and the dataset validator passes.
- `fiscal-accounts.csv` quotes labels that contain commas, so the chart template's `split(",")` reader cannot read it. The chart script uses `d3-dsv`.
- COFOG "old age" is called "old-age benefits", not "pensions", following the dataset README; "pensions" appears only in INSEE's attributed words.
- Skipped in this scratch run, as instructed: links from site index pages, publishing to DataHub.
- **The author's voice pass is outstanding.** This is the best final draft without it.
