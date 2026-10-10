---
title: "Outline review: France's debt problem is a gap that never closes"
description: "Review record for france-debt-outline.md: reader questions, reproduced numbers, corrections and verdict."
---

# Outline review: `france-debt-outline.md`

**Reviewer:** self (blind run, no reviewer available). The author ran the skill's review checklist in full. This is weaker than an independent review, and the record should be read with that in mind.

**Method:** an independent scan written separately from the outline (a Node script that parses the three CSVs in `datasets/france-public-finances/data/` directly) reproduced every number. Each chart-plan row was checked against the actual columns.

## Reader questions (written before rereading the outline)

1. How big is the debt, and how fast has it grown? Answered (beat 1).
2. Is it because France spends too much or taxes too little? Answered (beats 3 and 4).
3. How does France compare with Germany, Italy and the EU? Partly answered: it covers deficits, spending and revenue, but the dataset has no debt figures for other countries, and the outline says so.
4. What does the money go on? Is it pensions? Answered (beat 5), with the "old age is not all pensions" caveat.
5. Why is it a "crisis" now rather than ten years ago? Partly answered: rising interest (beat 6). The outline states that market stress is not measured.
6. Did 2008 and Covid cause it? Answered: debt jumped at both shocks, but there were deficits in every year before them too.
7. Has France ever balanced its budget? Partly answered in round 1, because the outline did not say where the record starts. It is answered after correction 2, which adds that the record starts in 1995.
8. Can it be fixed, and what happens next? Missed, deliberately; beat 7 states the limit.

## Round 1: commit `17790d4`, SHA-256 `855dcedf0ee283c2327e0d38902492e690396f1cc216042dd390ad30a329f58c`

Verdict: **corrections**.

1. Line 14 (argument): "Interest costs have doubled since 2020" is true in euros (29.7 → 66.6 bn, ×2.24) but not as a share of GDP (1.3 → 2.2%). The unit must be stated.
2. Line 31 (beat 3): the outline does not say that the French annual record starts in 1995. Without that, "every year" invites a reader to assume all of history.
3. Line 31 (beat 3): "peaked at 54.3% in 2017, when the gap narrowed to 2.3–2.4% in 2018–19" implies that the narrowing happened in 2017. The 2017 deficit was 3.4%.
4. Line 33 (beat 5): "Most other divisions fell" is wrong. Only four of the ten divisions fell (GF01, GF02, GF04, GF09) and six rose.

## Round 2: commit `c4d13d3`, SHA-256 `782d3a769ee8d26427b216dace636e127c6deb6db64a9930df1a08056e2e9250`

Corrections 1–4 were applied correctly. Verdict: **corrections**.

5. Line 50 (chart 1): beat 1 cites the 117.8% peak (2021-Q1), but the chart plan does not annotate it. Every number the prose may cite must be on a chart.
6. Line 51 (chart 2): beat 3 cites the deficits for 2000 (1.3), 2020 (8.9) and 2025 (5.1, €152.5bn), but chart 2 plots only spending and revenue lines. The deficit labels need adding.
7. Line 29 (beat 1): "each in a recession" is a causal framing that the data does not test. Use the dates as markers.

## Round 3: commit `d49b088`, SHA-256 `9d33d05f688fdf8f5ac2027c7c5574bd1d8fd5826747f67395005676ff21aacb`

Corrections 5–7 were applied. The checklist was rerun:

- Every number was reproduced (see below).
- Chart-plan fields exist. The transforms are valid, and no resource is joined to another by date. Chart 2's band joins TE/TR by `year` within one resource and one country, and has no gaps (31/31 rows each). The y-domains include all annotated values.
- There is no causal claim beyond the evidence. The mechanisms are attributed to INSEE Première n° 2106.
- The weakening numbers are present: the debt fall from 117.8 to 109.5, the 2017 revenue peak and the 2018–19 narrowing, other countries' deficits, and the one-year comparison.

**Verdict: APPROVED.**

## Numbers reproduced (independent scan)

- Quarterly debt: 106 rows, none missing. 2000-Q4 59.7; 2008-Q4 69.8; 2010-Q4 86.3; 2019-Q4 98.2; 2020-Q3 115.2; 2021-Q1 117.8 (max 2020–23); 2023-Q4 109.5 (min since 2021); 2026-Q2 119.0 / €3,595.5bn.
- FR B9 < 0 in 31 of 31 years from 1995 to 2025. The smallest deficit was −1.3 (2000) and the largest −8.9 (2020). 2025 was −5.1 / −152,511.1 MIO_EUR.
- FR TE/TR (% GDP): 1995 56.1/50.9; 2017 57.7/54.3 (TR max); 2018 56.4/54.0; 2019 55.3/53.0; 2020 61.7/52.8; 2022 58.4/53.7; 2023 56.8/51.4; 2025 57.2/52.1.
- 2025 TE/TR/B9: FR 57.2/52.1/−5.1; DE 50.5/47.9/−2.7 (TE−TR 2.6); IT 51.2/48.1/−3.1; ES 45.3/42.9/−2.4; EU27 49.5/46.4/−3.1.
- D41PAY: 1995 3.5% / €42.2bn; 2020 1.3% / €29.7bn; 2025 2.2% / €66.6bn. No years missing from 1995 to 2025.
- COFOG % GDP 1995 → 2024 (2024 flagged `p`): TOTAL 56.1 → 57.3; GF01 8.3 → 6.2; GF02 2.5 → 1.9; GF03 1.5 → 1.8; GF04 6.4 → 5.7; GF05 0.6 → 1.0; GF06 1.1 → 1.4; GF07 6.9 → 8.9; GF08 1.1 → 1.5; GF09 5.8 → 5.1; GF10 22.0 → 23.7; GF1002 old age 11.0 → 13.4. Old age plus health rose by 4.4 points.
