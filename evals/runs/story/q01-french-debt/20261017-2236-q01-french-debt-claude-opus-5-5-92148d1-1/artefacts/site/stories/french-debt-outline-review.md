---
title: "Outline review: France Never Closed the Gap"
description: "Step-2 outline review record for the french-debt story."
publish: false
---

# Outline review: France Never Closed the Gap

review: self (blind run, no reviewer available). The author of the outline ran the skill's review checklist against the committed revision. This is not an independent review.

## Round 1

- **Revision reviewed:** commit `2d98387`, `site/stories/french-debt-outline.md` SHA-256 `a29cf662814f695be1ff64a6a4d3ac4c2447ad073457ec955afd8192dd98fe54`.
- **Method:** a fresh scan script (written for the review, kept outside the repo) that reads the three CSVs with `d3-dsv`, looks up every outline number by key, and recomputes every count, difference and ratio. It does not reuse the exploration code.

### Reader questions (written before rereading the outline)

1. How big is French debt now, and how fast has it grown? → **answered** (beat 1: 59.7% → 119.0%, €3.6trn).
2. Does France tax too little, or spend too much? → **answered** (beat 5: highest revenue of the five, higher spending).
3. What is the money spent on, and what has grown? → **partly answered** (beat 6: old age and health grew. The level of the largest category, social protection at 23.7% of GDP, is not stated. Health is not unpacked, which is acceptable at this length).
4. Is it the crises or something structural? → **answered** (beats 1 and 3: two steps that were never reversed, and a deficit even in the best year).
5. How big is the interest bill, and is it rising? → **answered** (beats 4 and 7).
6. How does France compare with Germany, Italy and Spain? → **partly answered** (deficit, revenue and spending yes; their debt levels are not in the dataset, which the outline says).
7. Is it getting better or worse now? → **answered** (weakening numbers: the deficit narrowed to 5.1% while the ratio rose to 119.0%).
8. What makes it a "crisis": markets, politics? → **missed by design.** The outline says so explicitly, and the prose must say so too.

### Checks

- Numbers: 84 checks, all reproduced exactly except the chart-4 row count (correction 1). Reproduced values: 59.7 (2000-Q4), 119.0 and 3,595.5 bn (2026-Q2), ratio 1.99; Q4 values 65.5/69.8…/84.1/98.8/98.2/114.9/109.5/115.7; steps +18.6 and +16.7 of a +59.3 rise; Q4 ratio rises every year 2008–2017 (true); 2017-Q2 101.2. Deficit negative in all 31 years 1995–2025 (true); min 1.3 (2000), max 8.9 (2020), 7.4 (2009), 5.8 (2024), 5.1 (2025); 23 years above 3%; 26 years worse than EU27, every year 2002–2025 (true). Interest 2.2% / €66,635.9m (2025), 3.6 (1996, series max), 1.3 (2020, series min); primary −2.9 (2025); borrowing > interest every year 2002–2025 (true); primary surplus 1998–2001 1.0/1.6/1.7/1.7. 2025 TR/TE/B9: FR 52.1/57.2/−5.1, IT 48.1/51.2/−3.1, DE 47.9/50.5/−2.7 (TR−TE −2.6), EU27 46.4/49.5/−3.1, ES 42.9/45.3/−2.4; IT interest 3.9, primary +0.8. COFOG 1995→2024: old age 11.0→13.4, health 6.9→8.9, total 56.1→57.3, GF01 8.3→6.2, GF0107 3.6→2.0, education 5.8→5.1, economic affairs 6.4→5.7, defence 2.5→1.9, family 2.7→2.3. 2025 COFOG absent (true). 1995 FR TE/TR/B9 56.1/50.9/−5.1. Debt in euros 2,663.9 (end-2020) and 3,103.2 (end-2023).
- Chart plan: every field and code exists. No resources are joined by date: chart 3 is a single-year comparison and chart 2 keys each indicator by year from its own rows. There are no gaps in the windows used. Chart 4's set (GF01–09 plus GF1001–1009) is mutually exclusive and sums to 56.2/57.2 against TOTAL 56.1/57.3, a rounding difference.
- Causal claims: the debt ← deficit link is accounting, and growth and stock-flow adjustments are acknowledged. The mechanisms (indexation, rates since 2022, new revenue measures) are attributed to INSEE. Two wording issues follow (corrections 2 and 3).
- Counter-numbers are present: the 1995 = 2025 deficit, the deficit narrowing in 2025, interest below its 1990s level, the ratio falling 2020–23, and Italy's primary surplus.

### Verdict: CHANGES_REQUIRED

1. **Chart plan, row 4.** "abs change ≥ 0.3 (11 rows)" is wrong: the scan finds **13** of 18 categories. Fix: state 13 rows, compute the change rounded to 0.1 before applying the threshold (floating-point 0.3 must count), and give the footnote count of the rest as 5.
2. **Argument sentence and beat 7: "pension".** COFOG "Old age" is not the same as pensions (the dataset README warns against renaming it). Fix: say "old-age" (cash and services for old age) and keep "pensions" only inside the attributed INSEE context.
3. **Beat 7: "That fall paid for a large share"** reads as causal. Fix: make it descriptive and quantified: the fall in debt interest (GF0107, −1.6 points) offset more than a third of the old-age and health rise (+4.4).
4. **Beat 6 and reader question 3.** Give the level of the largest category: social protection was 23.7% of GDP in 2024, of which old age 13.4. Add it to chart 4's subtitle or footnote so the number is on a chart.

## Round 2

- **Revision reviewed:** commit `5903277`, `site/stories/french-debt-outline.md` SHA-256 `37c245b914bbdda2885296491dc756972e8919e7e1b2d829a033cb88fc874224`.
- Correction 1: verified. With changes rounded to 0.1, 13 of 18 categories have an absolute change ≥ 0.3 (GF01 −2.1, GF02 −0.6, GF03 +0.3, GF04 −0.7, GF05 +0.4, GF06 +0.3, GF07 +2.0, GF08 +0.4, GF09 −0.7, GF1002 +2.4, GF1003 −0.3, GF1004 −0.4, GF1007 +0.3); 5 others remain.
- Correction 2: verified. The argument sentence and beat 7 say "old-age"; "pensions" appears only in the attributed INSEE paragraph and in beat 6's definition note.
- Correction 3: verified. Beat 7 is descriptive: interest −1.6 vs old age + health +4.4 = 0.36, so "more than a third" holds.
- Correction 4: verified. Social protection 23.7 and old age 13.4 (2024, flag `p`) are in beat 6 and chart 4's footnote.
- No other text changed (diff checked).

### Verdict: APPROVED

Charts and prose may proceed against revision `5903277`.
