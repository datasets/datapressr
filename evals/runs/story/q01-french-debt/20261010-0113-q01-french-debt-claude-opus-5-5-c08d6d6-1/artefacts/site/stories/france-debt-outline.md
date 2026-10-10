---
title: "Outline: France Has Run a Deficit Every Year Since 1995"
description: "Outline and chart plan for a short data story on why French public debt has doubled relative to GDP since 2000."
---

# Outline: France Has Run a Deficit Every Year Since 1995

The prose (`france-debt.md`) renders this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `france-debt`.

## The argument, in one sentence

French public debt has doubled from 60% to 119% of GDP since 2000 because the government has spent more than it collected in every year since 1995. Most of that gap is not interest: France already raises more revenue than the EU average but spends more again, and big jumps in 2009 and 2020 were never fully reversed.

## What this story is about, and what it is not

About: the accounting arithmetic behind the debt. Annual deficits, the deficit excluding interest (the primary balance), and the levels of spending and revenue against the EU27.

Not about: bond spreads, ratings, government collapses or market "crisis" events. None of these are in the dataset. The data shows *that* the gap exists and on which side it sits. It does not show *why* spending is high (pensions, demographics, policy choices). Any reasons given come from named sources and are not tested here. Also not about the wrangling.

The question asks about a "crisis". The data cannot define one. The story answers the measurable part: why the debt keeps rising.

## Argument, in order

1. **The finding: debt doubled.** Maastricht gross debt was 60.5% of GDP at end of 2000-Q1 and 119.0% at end of 2026-Q2 (INSEE, release of 29 September 2026), which is €3,595.5 billion. It rose in steps: 65.5% at 2007-Q4, 98.2% at 2019-Q4, then 114.9% at 2020-Q4. *Weakening number:* the ratio fell from 114.9% (2020-Q4) to 109.5% (2023-Q4), even though euro debt kept rising (€2,663.9 bn to €3,103.2 bn). Nominal GDP growth with inflation shrank the ratio. It has risen again since then. Measurement: debt is a quarter-end stock; the ratio uses INSEE's annualised GDP denominator.
2. **What you're looking at.** Eurostat's general government accounts (central, local and social security together), update of 21 July 2026, % of GDP, 1995–2025. Plus INSEE's quarterly debt series. 2025 figures are the latest vintage and may be revised. INSEE's own May 2026 article gives 57.3/52.2% for 2025 spending/revenue, against Eurostat's 57.2/52.1%. Both give a 5.1% deficit.
3. **A deficit in every year.** The general government balance (B9) was negative in all 31 years from 1995 to 2025. The smallest deficit was 1.3% of GDP (2000). The largest were 7.4% (2009) and 8.9% (2020). It was 5.1% in 2025, down from 5.8% in 2024. *Weakening number:* this is not unique to France. In this dataset Italy and the EU27 aggregate also ran a deficit every year from 1995 to 2025. Germany had surpluses in 2007 and 2013–2019, and Spain in 2005–2007.
4. **Most of the gap is not interest.** Primary balance = B9 + D41PAY (interest paid), both as % of GDP. Each is published to 0.1, so the sum is accurate to about ±0.1. Primary surpluses came only in 1998–2001 (peak +1.7% in 2000 and 2001). The primary balance has been in deficit every year from 2002 to 2025. In 2025 the deficit is 5.1%: 2.2 points interest and a 2.9-point primary deficit. So France would still be borrowing at zero interest. *The wrinkle:* interest is rising again, from 1.3% of GDP (€29.7 bn) in 2020 to 2.2% (€66.6 bn, Eurostat D41PAY) in 2025. That is still below the 3.5–3.6% of 1995–1997. INSEE reports €64.7 bn under a different FISIM treatment. The story uses Eurostat's figure and names the convention.
5. **The gap is on the spending side, relative to peers.** 2025: France's spending is 57.2% of GDP and revenue 52.1%. The EU27 figures are 49.5% and 46.4%. France's revenue is 5.7 points above the EU's, but its spending is 7.7 points above. *Weakening number:* the recent widening is not only spending. From 2019 to 2025, French spending rose 1.9 points (55.3 → 57.2) and revenue fell 0.9 points (53.0 → 52.1). Measured from 2017, revenue fell further (54.3 → 52.1) while spending was almost flat (57.7 → 57.2). The choice of base year changes the story of the *recent* widening. It does not change the level comparison.
6. **Outside context (attributed, not tested).** INSEE (Insee Première n° 2106, May 2026) says the 2025 deficit narrowed because revenue grew faster and spending slowed as energy-crisis measures and inflation receded. It says interest spending rose because of the larger debt stock and higher interest rates since 2022. INSEE (Insee Première n° 2093, February 2026) says pensions and health drove most of the 2024 rise in spending. These are explanations of recent years, not a causal decomposition of 30 years.
7. **How this was made.** Links to the dataset and to `build.ts`. Re-running the build and `france-debt-make-charts.mjs` reproduces every number. Caveat: the dataset's status is `archived`, not `structured`. Its custom INSEE HTML parser has not yet had its independent review.

## Outside context

- INSEE, *Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026: https://www.insee.fr/fr/statistiques/8997691. Covers recent drivers of the deficit and interest. Archived at `datasets/france-public-finances/archive/insee-annual-accounts.html`.
- INSEE, *Les dépenses publiques par fonction en 2024*, Insee Première n° 2093, February 2026: https://www.insee.fr/fr/statistiques/8735252. Covers pensions and health as the drivers of the 2024 spending rise.

The data does not test any of these mechanisms.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Debt ratio, quarterly, 2000–2026 (headline) | `quarterly-debt`: `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | No transform; all 106 quarters present (2000-Q1–2026-Q2). Plotted at the quarter-end date as a stock. Annotated rows (looked up by `period`, throw if missing): 2000-Q1 60.5, 2007-Q4 65.5, 2019-Q4 98.2, 2020-Q4 114.9, 2023-Q4 109.5, 2026-Q2 119.0 (with €3,595.5 bn). Reference rule at 60% (Maastricht reference value; labelled as such). Y domain 0–130. | Beat 1: debt doubled, in steps |
| 2 | Deficit and primary balance, % GDP, 1995–2025 | `fiscal-accounts`: FR, unit `PC_GDP`, indicators `B9`, `D41PAY` | Overall balance = B9 bars. Primary balance = B9 + D41PAY, drawn as a line with dots, computed per year only when both exist (all 31 do; throw otherwise). The gap between bar and line is interest. Zero rule. Annotate: B9 2000 −1.3, 2009 −7.4, 2020 −8.9, 2025 −5.1; primary 2000 +1.7 and 2025 −2.9; text label "primary deficit every year since 2002" computed from the rows (first year of the final unbroken run of negative primary balances). Interest labels: 2020 1.3% (€29.7 bn), 2025 2.2% (€66.6 bn), read from D41PAY PC_GDP and MIO_EUR rows. Y domain −10 to +3. | Beats 3–4: a deficit every year, and most of it is not interest |
| 3 | Spending vs revenue, France vs EU27, % GDP, 1995–2025 | `fiscal-accounts`: FR and EU27_2020, `PC_GDP`, indicators `TE`, `TR` | Each geography × indicator is its own series from its own rows (same annual calendar, no join). France blue, EU27 grey; spending solid, revenue dashed. End labels with 2025 values: FR 57.2 / 52.1, EU 49.5 / 46.4. Dots for FR 2019 values (55.3 / 53.0). Y domain 40–64. | Beat 5: the gap is on the spending side compared with peers, and the 2019→2025 movement on both sides |

Formula check: primary balance computed in the outline review script from the CSV (see Review below). All 31 years have both B9 and D41PAY. The run of negative primary balances starts in 2002 (2001 is +1.7).

## Voice

Follow `skills/story/references/voice-guide.md`. The voice pass is separate and outstanding.

## Friction notes

- The question presupposes a "crisis". The dataset has no market data (yields, spreads), so the story answers "why does the debt keep rising" and says so.
- "Deficit every year" is true for Italy and the EU27 aggregate too. Without the peer rows, the headline would have overstated how unusual France is.
- The dataset is still `archived` (review of its HTML parser outstanding). The story consumes it anyway and says so.

## Review

**Status: NOT independently approved.** This run had no reviewer other than the outline's author (a single Claude Opus 5.5 session, no human and no separate agent available). The step-2 gate is therefore **outstanding**. What was done in its place is recorded here so a reviewer can start from it.

- Revision checked: commit `7e582d9`, file SHA-256 `4664e8c58e93abb6fc4a706d34d1be47a42cb0ad177ddb2911082407ccdd0f20`.
- Mechanical reproduction by the author: a separate script re-read both CSVs and checked 38 figures. Every number in beats 1–5 and the chart plan matched, including: 106 quarters; debt 60.5 / 65.5 / 98.2 / 114.9 / 109.5 / 119.0% and €2,663.9 / 3,103.2 / 3,595.5 bn; French B9 negative in all 31 years, min −1.3 (2000), −7.4 (2009), −8.9 (2020), −5.8 (2024), −5.1 (2025); Italy and EU27 negative in all 31 years; Germany in surplus 2007 and 2013–2019, Spain 2005–2007; primary surplus only 1998–2001, unbroken primary deficit 2002–2025, +1.7 (2000, 2001), −2.9 (2025); interest 1.3% / €29,724.1 m (2020), 2.2% / €66,635.9 m (2025), 3.5 / 3.6 / 3.6% (1995–1997); TE/TR 2025 FR 57.2/52.1, EU27 49.5/46.4, FR 2019 55.3/53.0, FR 2017 57.7/54.3.
- Argument self-check: the "because" in the one-sentence argument is the accounting identity (debt grows with borrowing). No claim about *why* spending is high is made from the data. The "never fully reversed" claim rests on the debt ratio never returning to 65.5% after 2009 or to 98.2% after 2020. Weakening numbers are present: the 2020–2023 ratio fall, Italy and EU27 deficits, and the revenue fall since 2017.

A human or independent reviewer should repeat the scan and return APPROVED or corrections before the story is treated as final.
