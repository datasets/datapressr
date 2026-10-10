---
title: "Outline: France Has Not Balanced Its Books Since Before the Euro"
description: "Argument, beats, numbers and chart plan for a short story on why French public debt has doubled relative to GDP since 2000."
---

# Outline: France Has Not Balanced Its Books Since Before the Euro

The prose (`france-debt.md`) is a rendering of this outline. If the prose drifts from the argument here, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `france-debt`.

## The argument, in one sentence

French public debt has doubled relative to GDP since 2000 because the government has spent more than it collected in every one of the last 31 years: it taxes more than its neighbours but spends more still, the gap widened sharply in 2009 and 2020 and never closed afterwards, and rising interest now adds to a gap that is mostly there before interest is paid.

## What this story is about, and what it is not

- **About:** the arithmetic of the French debt, which is the accumulation of persistent general-government deficits. It covers how big the gap between spending and revenue is, how it compares with Germany, Italy, Spain and the EU, what the spending buys, and how much of the deficit is interest.
- **Not about:** the wrangling; who is to blame; which policy should close the gap; who holds the debt or whether France can service it (the dataset has no holder or maturity data).
- **What the data cannot show.** The dataset measures debt, deficits, revenue and spending. It contains no bond yields, spreads, credit ratings or political events, so it cannot show the market or political side of the "crisis". In this story "crisis" means the size and direction of the debt. The data also shows *that* the gap exists, not *why* governments chose it: a large spending category is not proof it caused the deficit (dataset README, "Scope of explanation").

## Argument, in order

Units: % of GDP unless stated. Annual figures come from Eurostat `gov_10a_main` (update 21 July 2026) and are general government (central, local and social security) under ESA 2010. Quarterly debt comes from INSEE's 29 September 2026 release and is Maastricht gross debt at nominal value, as % of annualised GDP. Both are nominal; ratios to GDP are the denominator throughout.

1. **The finding (chart 1).** Maastricht gross debt was 60.5% of GDP in 2000-Q1 and 119.0% in 2026-Q2: it doubled relative to the economy. In euros it went from €854.8bn to €3,595.5bn (about €3.6 trillion). Two single years account for about half of the 58.5-point rise (14.3 + 16.7 = 31.0 points): 69.8% in 2008-Q4 to 84.1% in 2009-Q4, and 98.2% in 2019-Q4 to 114.9% in 2020-Q4. Between them the ratio kept climbing more slowly (2000–2008, 2010–2015) or levelled off (2015–2019 at about 97–101%). It never came back down. The latest reading, 119.0%, is the series high; 2021-Q1 was 117.8%.
2. **What you are looking at.** "General government" means the state, local authorities and the social security funds together. The deficit is total revenue minus total expenditure (Eurostat `B9`; negative is a deficit). Revenue (`TR`) is broader than taxes: it includes social contributions and sales. The debt is a stock; the deficit is the yearly flow that mostly adds to it (other stock-flow adjustments also move debt, so the two do not reconcile exactly). The ratio also moves with nominal GDP: it can rise because debt grows or because GDP shrinks, as in 2020. The dataset does not decompose the ratio into these parts, and the story does not try.
3. **Never balanced (chart 2).** France ran a deficit in all 31 years from 1995 to 2025. The smallest was 1.3% of GDP in 2000. In 23 of the 31 years it was larger than 3%. Spending jumped in 2009 and 2020 (the years of the financial crisis and the pandemic), to 58.0% in 2009 and 61.7% in 2020, and settled at about 57% afterwards rather than returning to its pre-shock level (53.6% in 2007; 55.3% in 2019). The deficit was 7.4% in 2009, 2.4% in 2019, 8.9% in 2020, 5.8% in 2024 and 5.1% in 2025.
   - *Latest direction:* the deficit narrowed from 5.8% in 2024 to 5.1% in 2025, but the debt ratio kept rising: from 115.7% at end-2025 to 119.0% in 2026-Q2 (both marked on chart 1). A smaller deficit is not yet a falling ratio.
   - *Weakening number:* spending as a share of GDP is barely higher than 30 years ago: 56.1% in 1995, 57.2% in 2025. The 2000s low (52.6% in 2000) is the exception. So the story is a gap that never closed, not spending that has steadily exploded.
   - *Weakening number:* revenue also moves. It peaked at 54.3% in 2017 and fell to 51.2% in 2024 (52.1% in 2025). Between 2019 and 2024 the deficit widened from 2.4% to 5.8%; spending rose 1.7 points (55.3 → 57.0) and revenue fell 1.8 points (53.0 → 51.2). Roughly half the recent widening is lower revenue.
4. **High taxes, higher spending (chart 3).** In 2025 French revenue was 52.1% of GDP against 47.9% in Germany, 48.1% in Italy, 42.9% in Spain and 46.4% for the EU27 aggregate. French spending was 57.2%, against 50.5%, 51.2%, 45.3% and 49.5%. France collects about 5.7 points of GDP more than the EU aggregate and spends about 7.7 points more. The gap (deficit) is the largest of the five: 5.1% against 2.7% (Germany), 3.1% (Italy), 2.4% (Spain) and 3.1% (EU27).
   - Other countries have surpluses in some years in this window (Germany in 8 years, 2007 and 2013–2019; Spain 2005–2007). Neither France nor Italy has one; the EU27 aggregate has none either.
5. **What the spending buys (chart 4).** By function (COFOG, 2024, provisional), social protection is 23.7% of GDP (it excludes health), health 8.9%, general public services 6.2%, economic affairs 5.7%, education 5.1%. Since 1995, health rose most (6.9 → 8.9, +2.0 points) and social protection rose 1.7 points (22.0 → 23.7), within which old age went from 11.0 to 13.4. General public services fell most (8.3 → 6.2, −2.1), largely because its public-debt-transactions group (interest) fell from 3.6 to 2.0; education fell 0.7 (5.8 → 5.1), defence 0.6 (2.5 → 1.9), economic affairs 0.7 (6.4 → 5.7). Total spending by function: 56.1% in 1995, 57.3% in 2024 (+1.2).
   - "Old age" is a COFOG group and is not the same as all pensions (survivors' pensions are a separate group; some pension-like payments sit elsewhere). Say "old-age spending", not "pensions", in the prose.
   - The COFOG total for 2024 (57.3%) differs from the main-accounts total (57.0%) because the two tables have different update dates. Chart 4 uses only the COFOG table.
6. **The wrinkle: it is not mainly interest — yet (chart 5).** Split the 2025 deficit into interest (`D41PAY`) and the rest, the primary balance (`B9 + D41PAY`). France: interest 2.2% of GDP, primary deficit 2.9%. Italy paid 3.9% in interest but ran a primary *surplus* of 0.8%. Germany: interest 1.1%, primary deficit 1.6%. Spain: interest 2.4%, primary balance 0.0%. EU27: interest 1.9%, primary deficit 1.2%. France's primary deficit is the largest of the five.
   - *Counter-direction:* interest is rising. In euros it went from €29.7bn in 2020 to €66.6bn in 2025 (`D41PAY`). As a share of GDP, 2.2% is still below the 3.5% of 1995, so the cost of the debt is not yet at a historic high relative to the economy.
   - Interest convention: Eurostat `D41PAY` (€66.6bn in 2025) is after FISIM allocation; INSEE's own article gives €64.7bn on a different treatment. The story uses `D41PAY` and says so in the method note.
7. **How this was made.** Dataset `france-public-finances` (Eurostat `gov_10a_main`, `gov_10a_exp`; INSEE quarterly debt), its `build.ts`, and `france-debt-make-charts.mjs`. Re-running reproduces the numbers.

### Measurement notes and figures readers may have seen

- INSEE's May 2026 annual-accounts article gives 2025 spending/revenue as 57.3%/52.2%; this dataset's Eurostat vintage gives 57.2%/52.1%. Both give a 5.1% deficit. The story uses Eurostat throughout for the annual series.
- End-2025 debt is 115.7% in the September 2026 quarterly release. Older press articles may cite earlier, pre-revision quarterly figures.
- Revenue/spending rounding: `TE − TR` from rounded values can differ from `B9` by 0.1 (2019: 55.3 − 53.0 = 2.3, but `B9` = −2.4). Charts and prose quote `B9` for the deficit.

## Outside context (not tested by this data)

- **2025 improvement.** INSEE attributes the fall in the 2025 deficit mainly to strong revenue growth, supported by new tax measures, while spending slowed as energy-crisis support ended and inflation fell. Source: [INSEE, *Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026](https://www.insee.fr/fr/statistiques/8997691).
- **What drove 2024 spending.** INSEE attributes most of the 4.0% rise in 2024 spending to social protection (2.2 points, of which 1.4 points pensions, through inflation-linked uprating) and health (0.7 points). Source: [INSEE, *Usage de l'argent public : les dépenses publiques par fonction en 2024*, Insee Première n° 2093, February 2026](https://www.insee.fr/fr/statistiques/8735252).
- No source in this workspace covers bond markets, ratings or the politics of budget votes, so the story makes no claim about them. It says so in one sentence.

## Chart plan

All charts: Observable Plot → static SVG, 720 px wide, palette from `charting.md` (revenue/baseline ink `#111827` or blue `#2563eb`, spending/cost red `#dc2626`, others grey `#9ca3af`). Annotation values are read from CSV rows at build time; a missing row throws.

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Line: French gross debt, % of GDP, quarterly | `quarterly-debt.csv`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | All 106 quarters 2000-Q1–2026-Q2, no gaps (check every value finite). x = `period_end` (quarter-end date, a stock reading). Mark and label 2000-Q1 (60.5), 2008-Q4 (69.8), 2009-Q4 (84.1), 2019-Q4 (98.2), 2020-Q4 (114.9), 2025-Q4 (115.7), 2026-Q2 (119.0, with €bn at end: 3,595.5 → "€3.6tn"); label start €854.8bn. Y-domain 0–130 so the doubling reads from a zero baseline. Title names the denominator: "% of GDP". | Beat 1: debt doubled, in two steps that never reversed |
| 2 | Two lines + shaded gap: French spending and revenue, % of GDP, 1995–2025 | `fiscal-accounts.csv`, `country_code = FR`, `unit = PC_GDP`, `indicator ∈ {TE, TR, B9}`, `year`, `value` | One series per indicator, each from its own rows (same annual calendar, but no wide join needed: area uses TE and TR rows looked up by year, throw if either missing). All 31 years present for FR. Shaded area between TR and TE in light red = deficit. Labels: "Spending" / "Revenue" at line ends with 2025 values; spending peaks 2009 (58.0) and 2020 (61.7); deficit labels from `B9` (not TE−TR) at 2000 (1.3), 2009 (7.4), 2019 (2.4), 2020 (8.9), 2024 (5.8), 2025 (5.1). Count of deficit years computed from `B9 < 0` and shown in the subtitle ("deficit in all 31 years"). Y-domain 48–64. | Beat 3: the gap never closed; spending ratchets up after shocks |
| 3 | Dot-and-bar (dumbbell): revenue and spending, % of GDP, 2025, five geographies | `fiscal-accounts.csv`, `year = 2025`, `unit = PC_GDP`, `indicator ∈ {TE, TR, B9}`, `country_code ∈ {FR, DE, IT, ES, EU27_2020}` | One row per geography, sorted by deficit (`B9`), France first. Revenue dot ink, spending dot red, same size and fill; light red bar between them; deficit `B9` labelled at the right. EU27 labelled as "EU27 (aggregate)". Key as coloured text labels on the France row. x-domain 40–60. All 15 values exist (checked). | Beat 4: France taxes more than its neighbours and spends more still |
| 4 | Horizontal bars: change in spending by function, percentage points of GDP, 1995 → 2024 | `spending-functions.csv`, `level = 1`, `unit = PC_GDP`, years 1995 and 2024, `function_code`, `function_name`, `value` | Change = 2024 value − 1995 value per division; both years present for all 10 divisions (checked). Sorted by change; zero rule; positive bars red, negative grey. Each bar labelled with "1995 → 2024" values and short name. Annotate social protection with "of which old age 11.0 → 13.4" (`GF1002`), and general public services with "of which debt interest 3.6 → 2.0" (`GF0107`). Note in subtitle: 2024 provisional; total 56.1 → 57.3. Never add parent and child. | Beat 5: what is growing — health and social protection up, interest, defence, education down |
| 5 | Diverging stacked bars: 2025 balance split into primary balance and interest, % of GDP, five geographies | `fiscal-accounts.csv`, `year = 2025`, `unit = PC_GDP`, `indicator ∈ {B9, D41PAY}` | primary = `B9 + D41PAY`, rounded to 0.1 (FR −2.9, DE −1.6, IT +0.8, ES 0.0, EU27 −1.2); interest segment = −`D41PAY`. Stack: primary segment from 0, interest segment stacked beyond it on the deficit side; where primary is a surplus (IT) the primary bar goes right of zero and interest left from zero. Total `B9` labelled at the bar end. Zero rule. Same row order as chart 3. Annotate France with "Interest €29.7bn (2020) → €66.6bn (2025)" from `D41PAY`/`MIO_EUR`. | Beat 6: the deficit is mostly not interest, unlike Italy; but interest is rising |

Formula check (run on the CSV before submitting): `B9 + D41PAY` for 2025 gives FR −2.9, DE −1.6, IT 0.8, ES 0.0, EU27 −1.2 (to 0.1); `B9` is negative in all 31 French years, max −1.3 (2000); 23 years < −3. COFOG 1995 and 2024 `PC_GDP` values exist for all ten divisions and for `GF1002` and `GF0107`.

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is separate and outstanding.

## Friction notes

- The dataset is at `status: archived` with its own adversarial review outstanding (README "Review"). The story reads it directly from the same repository; numbers were reproduced from the CSVs, and the INSEE article tables in `archive/` agree with the Eurostat series to 0.1 point.
- The question asks "why", but the dataset only measures *what*. The "why" this story can support is arithmetic: deficits every year. Policy explanations are limited to the two archived INSEE articles; there is no market data, so the "crisis" framing has to be defined as the debt path.
- Five charts is more than the three proven stories. Each serves one beat; if the review thinks it is chart soup, chart 4 is the candidate to cut.
- No git remote in this scratch repository. Absolute links assume `https://github.com/datasets/datapressr` (from `npx skills add datasets/datapressr` in `AGENTS.md`).
- Outline review: self (blind run, no reviewer available). See the review record appended below once done.

## Review record

Reviewer: self (blind run, no reviewer available). Each round reviews the committed revision named. The numbers were reproduced with a separate Node scan of the three CSVs (not the Python used to draft).

### Round 1: commit `dafb988`, file SHA-256 `4bf5b1270f2df60fd7c83db4d12dcff287196e1b29a80bba9d4c4b7f330b6743`

Reader questions, written before rereading the outline:

1. How big is the debt, and how fast has it grown? **Answered** (beat 1).
2. Is it too much spending or too little tax? **Answered** (beats 3–4, with both weakening numbers).
3. How does France compare with Germany, Italy and the EU? **Answered** (beat 4, chart 3).
4. What is the money spent on? Is it pensions? **Answered** (beat 5, with the old-age ≠ pensions caveat).
5. Is interest now driving it? **Answered** (beat 6).
6. Why is it a *crisis*: markets, ratings, politics? **Partly answered**: the outline says the data cannot show it, which is right but has to be said in the prose.
7. Is it getting better or worse lately? **Partly answered**: 2025 improvement only in outside context, not in the beats.
8. Who holds the debt, and can France pay? **Missed**: not even listed as out of scope.

Reproduced: debt 60.5 (2000-Q1), 69.8 (2008-Q4), 84.1 (2009-Q4), 98.2 (2019-Q4), 114.9 (2020-Q4), 117.8 (2021-Q1), 119.0 (2026-Q2, series max); €854.8bn and €3,595.5bn; 106 quarters, all finite. FR `B9` < 0 in 31/31 years, 23 below −3, max −1.3 (2000). FR TE/TR/B9/D41PAY for 1995, 2000, 2007, 2009, 2017, 2019, 2020, 2024 and 2025 as in the beats. 2025 TR/TE/B9/D41PAY for five geographies; primary balances −2.9, −1.6, +0.8, 0.0, −1.2. Interest €29,724.1m (2020) and €66,635.9m (2025). COFOG 1995 → 2024 for all ten divisions, TOTAL, GF1002 and GF0107; the changes match the beats.

Chart plan: every field exists; the `B9 + D41PAY` formula was run on all five rows; all annotated rows exist; no join by date (chart 2 looks up by year in a single annual calendar); y-domains include all annotated values.

Verdict: **corrections**.

1. Argument sentence: "each recession widened the gap" is a framing the data can't show (it has no GDP-growth series). Describe it by years.
2. Beat 2: the debt ratio also moves with nominal GDP. Say this and say that the story does not decompose it, or "because of deficits" overclaims.
3. Beat 3 / reader Q7: add the latest direction (deficit 5.8 → 5.1, while the ratio still rises 115.7 → 119.0) and label those points on charts 1 and 2.
4. Beat 6: "Italy, which carries a heavier debt": Italy's debt is not in this dataset. Remove it.
5. Reader Q8: list holders and ability to pay as out of scope.

All five applied in the next revision.

### Round 2: commit `fb2df29`, file SHA-256 `b31e31ea81f776da08b2ee0e49e44096e22e2b6b7b7be94b9120963b6c442109`

Round-1 corrections 1–5 checked as applied. Reader questions 6, 7 and 8 are now answered or explicitly scoped out. New scan: the two step-years add 14.3 and 16.7 points out of a 58.5-point rise (60.5 → 119.0), i.e. 31.0 points, 53%. The implied nominal GDP fell in 2020 (2,387.4 / 0.982 ≈ 2,431bn to 2,663.9 / 1.149 ≈ 2,318bn), which supports beat 2's "as in 2020".

Verdict: **corrections**.

1. Beat 1 (line 26): "two steps account for most of the rise" overstates. They account for about half (31.0 of 58.5 points). Say so.
2. Beat 3, latest direction (line 29): "a 5.1% deficit still adds to the debt faster than the economy grows" ties an annual 2025 flow to 2026 quarterly stocks as a mechanism. State the two readings and drop the mechanism.

Both applied in the next revision.

### Round 3: commit `99b95ba`, file SHA-256 `c2e77417c4dc376dfd5dba51136c806d584c83543592f3125210d12199f315a0`

Round-2 corrections 1–2 checked as applied (beat 1 now says "about half … 31.0 points"; beat 3 states the two readings with no mechanism). I re-ran the full checklist on this revision. Every number in beats 1–6 and in the chart plan matches the Node scan recorded in round 1, plus 115.7 (2025-Q4). Chart-plan fields, transforms and y-domains are valid. The only causal claim is the accounting link between deficits and debt, and beat 2 qualifies it (stock-flow adjustments, GDP denominator). Mechanisms are attributed to INSEE with links. The weakening numbers are present: spending in 1995 vs 2025, the revenue fall since 2017, interest below its 1995 share, Italy's primary surplus. Reader questions: 1–5 answered, 6 and 8 explicitly out of scope with the reason, 7 answered.

Verdict: **APPROVED** (self-review, blind run, no reviewer available).
