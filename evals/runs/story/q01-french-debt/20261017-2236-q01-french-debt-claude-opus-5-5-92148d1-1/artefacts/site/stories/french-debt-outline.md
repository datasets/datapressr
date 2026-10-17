---
title: "Outline: France Never Closed the Gap"
description: "Argument, beats, numbers and chart plan for a short story on why French public debt has doubled relative to GDP since 2000."
publish: false
---

# Outline: France Never Closed the Gap

The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument below, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `french-debt`.

## The argument, in one sentence

French public debt has doubled from 59.7% to 119.0% of GDP since 2000 because the French state has run a deficit in every one of the 31 years from 1995 to 2025: it raises more revenue than Germany, Italy, Spain or the EU average but spends more still, and the fall in interest costs that once offset rising old-age and health spending has gone into reverse.

## What this story is about, and what it is not

It is about the fiscal arithmetic behind the debt: the stock (debt), the annual flow that feeds it (the deficit), the two sides of that flow (revenue and spending), and what spending grew.

It is **not** about:

- the political or market side of the "crisis" (bond spreads, ratings, governments falling). The dataset contains none of it, and no source in the workspace covers it. The story takes the question's framing but answers only the part the accounts can answer;
- whether France *should* cut spending or raise taxes. INSEE's own explainer notes the classification conventions behind "spending" and "revenue" are debatable;
- the wrangling.

The data shows *that* the deficit persisted and *which* spending categories grew as a share of GDP. It does not show *why* (policy choices, demographics, indexation, growth). Any mechanism is attributed below.

## Argument, in order

1. **The finding.** Maastricht gross debt was 59.7% of GDP at end-2000 (2000-Q4) and 119.0% at end of June 2026 (2026-Q2), €3.6 trillion (3,595.5 bn). Ratio ≈ 2.0. Two crisis steps added 35 points of the 59-point rise: 65.5% at end-2007 → 84.1% at end-2009 (+18.6, financial crisis); 98.2% at end-2019 → 114.9% at end-2020 (+16.7, Covid). Neither step was reversed: the end-year ratio rose every year 2008–2017 (to 98.8%), barely moved to 2019 (98.2%), and after Covid fell only to 109.5% (end-2023) before rising again. Compare end-year (Q4) values only: the quarterly ratio is seasonal and peaks mid-year (e.g. 101.2% in 2017-Q2, above end-2019). Source: INSEE quarterly release, 29 Sept 2026 (`quarterly-debt`). Ratio uses INSEE's annualised GDP denominator.
2. **What you're looking at.** General government (central, local, social security). Debt is a stock; the deficit (net borrowing, Eurostat `B9`) is the annual flow, revenue (`TR`) minus spending (`TE`). All in % of GDP, nominal. Annual accounts: Eurostat `gov_10a_main`, update 21 July 2026, 1995–2025.
3. **A deficit every year.** France's `B9` is negative in all 31 years 1995–2025. The smallest deficit was 1.3% of GDP in 2000; the largest 8.9% in 2020; 7.4% in 2009; 5.1% in 2025. It exceeded 3% of GDP (the Maastricht reference value, per the INSEE explainer) in 23 of 31 years. France's deficit was larger than the EU27 aggregate's in 26 of 31 years, including every year 2002–2025.
4. **Not only interest.** Interest paid (`D41PAY`) was 2.2% of GDP in 2025; borrowing was 5.1%, so 2.9 points (the primary deficit, `B9 + D41PAY`) funded spending other than interest. Borrowing has exceeded the interest bill every year since 2002; in 1998–2001 it was smaller than the interest bill (primary surplus of 1.0–1.7 points).
5. **Not low revenue.** In 2025 France's revenue was 52.1% of GDP, above Italy 48.1%, Germany 47.9%, EU27 46.4%, Spain 42.9%. Its spending was 57.2%, against Italy 51.2%, Germany 50.5%, EU27 49.5%, Spain 45.3%. Deficits: France 5.1, Italy 3.1, EU27 3.1, Germany 2.7, Spain 2.4. France has the largest gap of the five. (Germany's TR − TE is 2.6 from rounded shares; the official `B9` is −2.7. Charts label the official balance.)
6. **What grew.** The largest category is social protection, 23.7% of GDP in 2024, of which old age 13.4 ("old age" is COFOG's label for cash benefits and services for old age; it is not identical to "pensions"). COFOG, mutually exclusive set (divisions 01–09 plus the groups of division 10, social protection), % of GDP, 1995 → 2024 (2025 not published; 2024 values flagged provisional): old age 11.0 → 13.4 (+2.4), health 6.9 → 8.9 (+2.0). Together +4.4 points, while total spending moved only 56.1 → 57.3 (+1.2). Falls offset most of it: general public services 8.3 → 6.2 (−2.1), of which interest on public debt (`GF0107`) 3.6 → 2.0 (−1.6); education 5.8 → 5.1 (−0.7); economic affairs 6.4 → 5.7 (−0.7); defence 2.5 → 1.9 (−0.6); family and children 2.7 → 2.3 (−0.4).
7. **The wrinkle: the cushion is reversing.** Interest (`D41PAY`) fell from 3.6% of GDP (1996) to 1.3% (2020) even as debt rose, and is back to 2.2% in 2025. In the COFOG table, the fall in debt interest (GF0107, −1.6 points, 1995 → 2024) offset more than a third of the old-age and health rise (+4.4 points). This is arithmetic within the spending total, not a claim that one caused the other. That offset is now running the other way. INSEE attributes the 2025 rise in interest spending to the larger debt stock and higher rates since 2022.

### Numbers that weaken the argument (must appear)

- **Spending is not a recent surge.** France spent 56.1% of GDP in 1995 and 57.2% in 2025; revenue rose too, 50.9% → 52.1%. The 2025 deficit (5.1%) equals 1995's. The story is a gap that never closed, not a sudden blow-out.
- **It is improving on the flow.** The deficit narrowed from 5.8% (2024) to 5.1% (2025), mainly through new revenue measures (INSEE). The debt ratio still rose, to 119.0% in 2026-Q2.
- **Interest is still lower than in the 1990s.** 2.2% of GDP in 2025 vs 3.6% in 1996, with twice the debt ratio.
- **The ratio can fall while debt grows.** End-2020 114.9% → end-2023 109.5%, while debt in euros rose from €2,664 bn to €3,103 bn: nominal GDP grew faster. Ratio dynamics depend on growth, not only deficits; the data does not decompose it. Change in debt ≠ deficit (INSEE: stock-flow adjustments).
- **Italy has a smaller deficit but a larger interest bill** (3.1% vs 3.9%), i.e. a primary surplus of 0.8 points; its debt level is not in this dataset.

### Measurement kinds readers conflate

- Debt ratio (quarterly, INSEE annualised GDP) vs annual accounts (Eurostat). Different vintages: INSEE reports 2025 spending/revenue as 57.3/52.2; Eurostat 57.2/52.1. Story uses Eurostat for annual flows.
- Interest: Eurostat `D41PAY` 2025 = €66.6 bn (2.2% of GDP). INSEE's article quotes €64.7 bn before FISIM. The story uses `D41PAY` and says so in method.
- COFOG 2024 total (57.3) differs from `TE` 2024 (57.0): different update dates. Chart 4 uses COFOG's own total.
- Gross debt (Maastricht) vs net debt: story uses gross.

## Outside context (attributed, not tested by this data)

- INSEE, *Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026 — <https://www.insee.fr/fr/statistiques/8997691>: the 2025 deficit fell mainly because revenue grew strongly with new measures (€23.0 bn, including exceptional levies on large firms' profits); spending slowed as inflation fell; many social benefits, pensions first, are indexed to past inflation; interest spending rose 11.2% from the larger debt stock and the rise in interest rates since 2022.
- INSEE blog, *Dépenses et recettes des comptes publics* — <https://blog.insee.fr/depenses-et-recettes-des-comptes-publics/>: the Maastricht deficit criterion is 3% of GDP; reducing the deficit means lowering spending and/or raising revenue; what counts as each is a convention.
- INSEE, quarterly Maastricht debt, Q2 2026, 29 Sept 2026 — <https://www.insee.fr/fr/statistiques/9053525>: 119.0% of GDP; the change in debt cannot be used to infer the deficit.

The data does not test why old-age and health spending rose (demography, indexation, policy). The story says so.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | `french-debt-ratio.svg` — debt doubled, in two steps | `quarterly-debt`: `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | All 106 quarters 2000-Q1–2026-Q2, no gaps; x = quarter-end date. Line. Dots + labels read from rows 2000-Q4 (59.7), 2007-Q4 (65.5), 2009-Q4 (84.1), 2019-Q4 (98.2), 2020-Q4 (114.9), 2026-Q2 (119.0, with €3.6trn from 3,595.5 bn). y domain [0, 130] so doubling reads as doubling. All labelled points are Q4 (end-year) except the latest; note under the chart that the quarterly ratio is seasonal. | Beat 1. Comparison: level now vs 2000, and where the steps are. |
| 2 | `french-debt-borrowing.svg` — borrowing every year, more than interest since 2002 | `fiscal-accounts`, FR, `PC_GDP`: `B9`, `D41PAY` | 1995–2025, each indicator from its own rows, keyed by year; plot net borrowing as `−B9` (positive) bars, interest `D41PAY` as narrower dark bars on the same zero baseline. Throws if any year missing. Rule at 3 labelled "3% Maastricht reference". Labels: 2000 (1.3), 2009 (7.4), 2020 (8.9), 2025 (5.1; interest 2.2). | Beats 3–4. Comparison: every bar above zero; borrowing bar taller than interest bar from 2002. |
| 3 | `french-debt-revenue-spending.svg` — highest revenue, higher spending | `fiscal-accounts`, 2025, `PC_GDP`: `TR`, `TE`, `B9`; FR, IT, DE, EU27_2020, ES | One row per geography, sorted by revenue. Two dots (revenue dark ink, spending red), joined by a segment; right-hand label "deficit X" from `B9` (official balance, not TE − TR). x domain [40, 60] — positions on a common scale, not bars, so a non-zero domain is fair; ticks labelled "% of GDP". EU27 labelled as an aggregate. | Beat 5. Comparison: France's revenue dot is furthest right and its gap the widest. |
| 4 | `french-debt-spending-change.svg` — what grew, what made room | `spending-functions`, `PC_GDP`, years 1995 and 2024: GF01–GF09 (level 1) and GF1001–GF1009 (groups of GF10); `GF0107` for the interest sub-label; `TOTAL` for the footnote | Change = value(2024) − value(1995), both from source (0.1-point precision), rounded to 0.1 before filtering. Show categories with abs change ≥ 0.3 (13 of 18 rows); footnote: "5 other categories changed by less than 0.3 points; total 56.1 → 57.3; social protection 23.7% of GDP in 2024, of which old age 13.4; 2024 provisional". Diverging horizontal bars, sorted, zero rule, red for rises, grey for falls. GF01 labelled "General public services (incl. debt interest)" with "of which interest −1.6". | Beats 6–7. Comparison: two long red bars (old age, health) vs a set of grey falls, the largest being the category that holds interest. |

Interest over time (beat 7: 3.6% in 1996, 1.3% in 2020) is read from chart 2's interest bars; label 1996 and 2020 on chart 2 too, so those numbers are on a chart.

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is a separate human stage (not run in this blind run).

## Friction notes

- review: self (blind run, no reviewer available). Record and verdicts in `french-debt-outline-review.md`.
- The dataset is `status: archived`, not `structured`: the INSEE quarterly-debt HTML parser has no independent review yet. I cross-checked the two quarterly values the story leans on (119.0% in 2026-Q2, 115.7% at end-2025) against the archived INSEE release text; they match.
- The question presumes a "crisis". The workspace has no market or political data, so the outline answers only the fiscal-arithmetic part and says so.
- The labels in `fiscal-accounts.csv` contain quoted commas and newlines, so a naive `split(",")` (as in the chart template) breaks. Use `d3-dsv`, which is already in `site/stories/package.json`.
