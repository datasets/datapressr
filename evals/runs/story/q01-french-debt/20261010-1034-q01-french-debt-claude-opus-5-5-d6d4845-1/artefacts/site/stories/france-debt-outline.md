---
title: "Outline: France's debt problem is a gap that never closes"
description: "Argument, beats, numbers and chart plan for a short data story on why French public debt keeps rising."
---

# Outline: France's debt problem is a gap that never closes

The prose (`france-debt.md`) is a rendering of this outline. If the prose drifts from the argument here, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `france-debt`.

## The argument, in one sentence

France's public debt has doubled as a share of GDP since 2000 because the government has spent more than it collected in every year from 1995 to 2025: France does not raise less revenue than its neighbours (it raises the most), it spends more still. Interest payments have more than doubled in euros since 2020, so that permanent gap now costs more each year.

## What this story is about, and what it is not

About: the arithmetic of the French debt, which is a stock built from a deficit that has never once turned into a surplus in this record. It covers how big the gap is, how it compares with Germany, Italy, Spain and the EU, what the spending is on and why the cost of carrying the debt has started to bite.

Not about:

- The wrangling. That gets one short paragraph at the end.
- Markets and politics. The dataset has no bond yields, spreads, credit ratings or government collapses. "Crisis" in that sense is not measured here. The data shows the fiscal position that those events react to.
- Causes in the policy sense. The data shows *that* spending exceeds revenue and *which* functions grew. It does not show *why* governments chose this, or whether cutting any category would close the gap. A large category is not proof that it caused the deficit.
- Other countries' debt. The dataset has debt only for France, so the story makes no claim about France's debt ranking.

## Argument, in order

1. **The finding (chart 1).** General government gross (Maastricht) debt was 59.7% of GDP at end-2000 and 119.0% at the end of Q2 2026, which is €3,595.5 billion (≈ €3.6 trillion). It rose in two steps, around the 2008–09 financial crisis and the 2020 pandemic (dates as markers; the data does not attribute the rise): 69.8% (2008-Q4) → 86.3% (2010-Q4), and 98.2% (2019-Q4) → 115.2% (2020-Q3). Between the shocks it did not come back down to the earlier level. *Weakening number:* the ratio did fall after Covid, from a peak of 117.8% (2021-Q1) to 109.5% (2023-Q4), before rising again. The data does not decompose that fall. It happened while nominal GDP grew fast during the 2022–23 inflation, but this story does not claim that as the mechanism.
2. **What you're looking at.** "General government" means central government, local authorities and social security funds together. Debt is INSEE's quarterly Maastricht gross debt at nominal value from the 29 September 2026 release. The ratio uses annual GDP, not one quarter's output. Spending, revenue and interest are annual Eurostat accounts (update of 21 July 2026), as % of GDP in current prices. Revenue is broader than taxes: it includes social contributions and sales. The deficit is revenue minus spending (Eurostat `B9`). Debt is a stock and the deficit is a flow, so debt changes also reflect financial transactions. The two are not interchangeable.
3. **The gap never closes (chart 2).** France ran a deficit in all 31 years from 1995 to 2025. The annual accounts in this dataset start in 1995 for France, so the story says nothing about earlier years. The smallest was 1.3% of GDP (2000), the largest 8.9% (2020) and 2025's was 5.1% (€152.5 billion). Spending was 56.1% of GDP in 1995 and 57.2% in 2025. Revenue was 50.9% in 1995 and 52.1% in 2025. Both moved, but revenue never caught up. *Weakening/nuancing:* revenue did rise. It peaked at 54.3% in 2017 (deficit 3.4%). The deficit narrowed to 2.3% in 2018 and 2.4% in 2019, its smallest outside 1999–2001. Since 2019 (55.3 / 53.0) spending is up 1.9 points and revenue down 0.9 points. Revenue fell from 53.7% (2022) to 51.4% (2023), so a narrowing in 2018-19 driven by revenue was reversed from both sides.
4. **Not a low-tax country (chart 3).** In 2025 France had the highest revenue of the five (52.1% of GDP; Italy 48.1, Germany 47.9, EU27 46.4, Spain 42.9) and the highest spending (57.2; Italy 51.2, Germany 50.5, EU27 49.5, Spain 45.3). Its deficit was the largest: 5.1% against 3.1 (Italy, EU27), 2.7 (Germany) and 2.4 (Spain). *Nuance:* Germany, Italy and the EU also ran deficits in 2025. France is the outlier in size, not in having one. The comparison is one year, and 2025 values are recent and can be revised.
5. **What the spending is (chart 4).** By function (COFOG, % of GDP, 1995 → 2024): social protection 22.0 → 23.7, of which old age 11.0 → 13.4 (old age is a COFOG group inside social protection; survivors' pensions are separate, so "old age" is not "all pensions"); health 6.9 → 8.9; general public services 8.3 → 6.2; economic affairs 6.4 → 5.7; education 5.8 → 5.1; defence 2.5 → 1.9. The total went from 56.1 → 57.3. Old age and health rose by 4.4 points between them, more than the 1.2-point rise in the total. That is possible because four divisions fell: general public services (−2.1), economic affairs (−0.7), education (−0.7) and defence (−0.6). The four small divisions (public order, environment, housing, culture) each rose by 0.3–0.4. *Caveat:* 2024 COFOG values are provisional (`p`). The COFOG total for 2024 (57.3) differs from the main-accounts total (57.0) because the two tables come from different vintages, so the chart uses only the COFOG table. Health is not part of social protection in COFOG. The functional split describes where money goes, not what caused the deficit.
6. **The wrinkle: why it bites now (chart 5).** Interest payments (Eurostat `D41PAY`) were 3.5% of GDP in 1995 and fell to 1.3% in 2020, while debt roughly doubled as a share of GDP. They rose to 2.2% in 2025. In euros, they went from €29.7 billion (2020) to €66.6 billion (2025). For two decades, cheap borrowing hid the cost of the debt. That has now ended. *Measurement note:* INSEE presents 2025 interest as €64.7 billion under a different FISIM convention. This story uses Eurostat `D41PAY` throughout.
7. **Limits.** The data shows the arithmetic, not the politics. It contains no bond yields or ratings, says nothing about why governments ran these deficits, and does not test whether any particular cut or tax would close the gap.

## Outside context (attributed, not tested by this data)

- INSEE, *Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026 ([insee.fr/fr/statistiques/8997691](https://www.insee.fr/fr/statistiques/8997691), archived in the dataset as `archive/insee-annual-accounts.html`):
  - Interest spending rose 11.2% in 2025 "sous l'effet de la hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022" (because of the larger debt stock and higher interest rates since 2022).
  - The 2025 deficit reduction came mainly from strong revenue growth, including €23.0 billion of new tax measures, some exceptional.
  - Pensions are indexed to the previous year's inflation and were the largest contributor to the rise in social benefits.

These are INSEE's explanations of recent movements. This data does not test them.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Gross debt, % of GDP, quarterly, 2000-Q1 to 2026-Q2 | `quarterly-debt`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | One row per quarter (106 rows, none missing), plotted at `period_end` (quarter-end stock). Annotate 2000-Q4 (59.7), 2008-Q4 (69.8), 2019-Q4 (98.2), 2021-Q1 (117.8, post-Covid peak), 2023-Q4 (109.5, post-Covid low) and 2026-Q2 (119.0, with €3,595.5 bn shown as "€3.6tn"). Values read from the rows by `period`, and the build throws if any row is missing. The y-domain runs from 0 to 125 so the doubling is honest. | Beat 1: the finding |
| 2 | France spending vs revenue, % of GDP, 1995–2025 | `fiscal-accounts`: `country_code=FR`, `indicator` ∈ {TE, TR}, `unit=PC_GDP`, `year`, `value` | Two series, each filtered from its own rows, with `year` as a number. Shade the band between them red (the deficit), joining by `year` within one resource and one country, with no gaps 1995–2025 (31 rows each, checked). Label the line ends at 1995 and 2025 with values. Add a text note, "Deficit every year, 1995–2025", and the count computed from `B9` < 0 (31 of 31). Also annotate the 2020 spending peak (61.7) and the 2017 revenue peak (54.3), and label the deficit (`B9`) at 2000 (1.3, the smallest), 2020 (8.9, the largest) and 2025 (5.1, with €152.5bn from `MIO_EUR`). The y-domain covers 48 to 63 and is labelled as not zero-based. | Beat 3: the gap never closes |
| 3 | 2025 spending and revenue, % of GDP: FR, DE, IT, ES, EU27 | `fiscal-accounts`: `year=2025`, `unit=PC_GDP`, `indicator` ∈ {TE, TR, B9}, the five `country_code`s | A dot plot with one row per geography, sorted by spending. The revenue dot is dark and the spending dot red, joined by a rule, with coloured labels as the key. The deficit label comes from the `B9` row (not TE−TR, because rounding gives DE 2.6 vs B9 2.7). The x-domain runs from 40 to 60. EU27 is an aggregate and is labelled "EU27 average". | Beat 4: not a low-tax country |
| 4 | Spending by function, % of GDP, 1995 vs 2024 | `spending-functions`: `unit=PC_GDP`, `year` ∈ {1995, 2024}, level-1 divisions (GF01–GF10) plus the group GF1002 "old age" shown as an indented "of which" row | Dumbbell chart: 1995 grey dot, 2024 dark/red dot (red where 2024 > 1995), sorted by 2024 value. The change is labelled at the right. Rows are never summed across levels. The 2024 rows are flagged `p`, and the chart notes "2024 provisional". The total is taken from COFOG `TOTAL` (56.1 → 57.3) and shown in the subtitle, not from the main accounts. All 11 rows exist for both years (checked). | Beat 5: what the spending is |
| 5 | Interest payments, % of GDP, 1995–2025 | `fiscal-accounts`: `FR`, `D41PAY`, `PC_GDP` and `MIO_EUR` | A line plot of % of GDP (31 rows, none missing), annotated at 1995 (3.5%), 2020 (1.3%, €29.7bn) and 2025 (2.2%, €66.6bn). Euro labels are rounded from `MIO_EUR`/1000 to one decimal. The y-domain runs from 0 to 4. | Beat 6: the wrinkle |

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is separate and outstanding.

## Friction notes

- **Review:** self-review (blind run, no reviewer available). The verdict is recorded in `france-debt-outline-review.md`.
- The dataset's status is `archived`, not `structured`: its own README says the adversarial review of the HTML debt parser is still pending. The story skill expects a structured dataset. The numbers here were cross-checked against INSEE's article table (Figure 1/2 in the archived HTML), and they match to rounding: the 2025 spending figure is 57.2 in Eurostat and 57.3 in INSEE's figures, a difference between data vintages.
- There are five charts, more than the one or two of earlier stories. The question is a "why", and each beat needs its own evidence. Merging any two would make one chart carry two ideas. If the prose cannot carry five charts within 700 words, cut chart 2 first, because chart 3 partly covers it.
- "Debt crisis" is the question's framing. The data can show the fiscal arithmetic but not market stress, so the outline says so up front rather than borrowing the word.
