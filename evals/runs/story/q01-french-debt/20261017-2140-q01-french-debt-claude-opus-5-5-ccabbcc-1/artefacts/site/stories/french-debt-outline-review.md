---
title: "Outline review: Why French Debt Keeps Climbing"
description: "Step 2 gate record for the french-debt outline: reader questions, reproduced numbers, chart-plan checks and verdicts."
publish: false
---

# Outline review: Why French Debt Keeps Climbing

- **Reviewer:** review: self (blind run, no reviewer available). The outline's author ran the skill's review checklist on the committed revision. This is not an independent review.
- **Date:** 2026-10-17.
- **Method:** a fresh scan script (not the outline's working scripts) parsed the three CSVs in `datasets/france-public-finances/data/` with `d3-dsv` (the fiscal file uses RFC 4180 quoting), looked up each cited row by its primary key, threw on a missing or duplicate key, and recomputed every derived value.

## Round 1

- **Revision reviewed:** commit `22d2b2a`, `site/stories/french-debt-outline.md` SHA-256 `6f5d80cca8f1b1834b598ef1e21c6611b69921e7ecef3a187c5dcdc7c8abd1f6`.

### Reader questions (written before rereading the outline)

1. How big is French debt, and how fast has it grown? → **Answered** (beat 1: 60.5% → 119.0%, €854.8bn → €3,595.5bn).
2. Is the deficit about France spending too much or taxing too little? → **Answered** (beat 4: highest revenue and highest spending of the four countries in all 31 years).
3. How does France compare with Germany and Italy, and isn't Italy's debt higher? → **Partly answered.** Flows are compared; debt levels of the peers are not in the dataset, and the outline does not say so. A reader will assume the story is silent by choice.
4. Where does the money go: is it pensions? → **Answered** (beat 5: old age 11.0% → 13.4% of GDP, health 6.9% → 8.9%, with the not-causal caveat).
5. Are interest costs the problem? Are rising rates making it worse? → **Answered** (beat 3: 1.3% → 2.2% of GDP, €29.7bn → €66.6bn; INSEE's attribution to debt stock and rates since 2022; counter-number 3.5% in 1995).
6. Why is it called a "crisis" now: markets, ratings, politics? → **Missed by design**, stated in "What this story is about". Acceptable: the dataset has no market or political data. The prose must say so in one line.
7. When did France last balance its budget? → **Partly answered.** The outline says "every year since 1995", which reads as if 1995 were the start of the deficits. 1995 is the start of the series.
8. Is it getting better or worse? → **Partly answered.** The ratio is at its series high, but the 2025 deficit fell from 2024's; the 2024 figure is not in the beats or on the chart plan's labels.

### Numbers reproduced

| Claim | Reproduced |
|---|---|
| Quarterly rows, gaps | 106 rows, 2000-Q1–2026-Q2, every `gross_debt_pct_gdp` finite |
| Debt ratio 2000-Q1 / 2007-Q4 / 2009-Q4 / 2019-Q4 / 2020-Q4 / 2021-Q1 / 2023-Q4 / 2025-Q4 / 2026-Q2 | 60.5 / 65.5 / 84.1 / 98.2 / 114.9 / 117.8 / 109.5 / 115.7 / 119.0 |
| 119.0 is the series maximum | yes, 2026-Q2 |
| Lowest ratio from 2021-Q1 on | 109.5, 2023-Q4 |
| Debt in € 2000-Q1 / 2021-Q1 / 2023-Q4 / 2026-Q2 | 854.8 / 2,752.5 / 3,103.2 / 3,595.5 bn |
| Steps | 84.1 − 65.5 = 18.6; 114.9 − 98.2 = 16.7; 119.0 − 109.5 = 9.5 |
| France in deficit (`B9` < 0) | 31 of 31 years, 1995–2025 |
| Smallest / largest deficits | −1.3 (2000); −8.9 (2020), −7.4 (2009) |
| 2025 deficit | −5.1% of GDP; −152,511.1 €m |
| Primary surplus years (`round(B9 + D41PAY, 1)` > 0) | 1998 +1.0, 1999 +1.6, 2000 +1.7, 2001 +1.7; none after 2001 |
| 2025 primary balance | −5.1 + 2.2 = −2.9 |
| Interest 1995 / 2020 / 2025 (% GDP) | 3.5 / 1.3 (series minimum) / 2.2 |
| Interest 2020 / 2025 (€m) | 29,724.1 / 66,635.9; ratio 2.24 |
| 2025 TR / TE / B9 / D41PAY / primary | FR 52.1 / 57.2 / −5.1 / 2.2 / −2.9; DE 47.9 / 50.5 / −2.7 / 1.1 / −1.6; IT 48.1 / 51.2 / −3.1 / 3.9 / +0.8; ES 42.9 / 45.3 / −2.4 / 2.4 / 0.0; EU-27 46.4 / 49.5 / −3.1 / 1.9 / −1.2 |
| France strictly highest TR and TE among FR, DE, IT, ES | 31 of 31 years |
| Deficit years, peers | DE 23, IT 31, ES 28, EU-27 31 |
| TR 1995; TE 2024 | 50.9; 57.0 |
| max over years of abs(TE − TR − abs(B9)) | 0.1 |
| COFOG 1995 → 2024 (% GDP) | TOTAL 56.1 → 57.3p; GF01 8.3 → 6.2p; GF0107 3.6 → 2.0p; GF02 2.5 → 1.9p; GF03 1.5 → 1.8p; GF04 6.4 → 5.7p; GF05 0.6 → 1.0p; GF06 1.1 → 1.4p; GF07 6.9 → 8.9p; GF08 1.1 → 1.5p; GF09 5.8 → 5.1p; GF10 22.0 → 23.7p; GF1002 11.0 → 13.4p |
| COFOG 2025 | empty for every code checked (not published) |
| Level-1 divisions | 10 |

Ratio 60.5 → 119.0 is ×1.97.

### Chart-plan checks

- Chart 1: fields exist; dates are quarter-end; no gaps; y-domain [0, 130] contains 119.0. OK.
- Chart 2: `B9` and `D41PAY` (PC_GDP) present for all 31 French years; stack of −D41PAY and round(B9 + D41PAY, 1) equals B9 exactly; y-domain [−10, 3] contains −8.9 and +1.7. OK.
- Chart 3: all 20 lookups exist for 2025; x-domain [40, 60] contains 42.9–57.2; dot positions, not bar lengths, so a non-zero axis is acceptable and stated. OK.
- Chart 4: all values read directly, no sums; COFOG total, not `TE`; 2024 flagged `p` and labelled provisional; x-domain [0, 25] contains 23.7. OK.

### Causal claims and counter-numbers

The argument stays in accounting: deficits add to debt; the mechanism for interest is attributed to INSEE n° 2106; the pensions/health remark to INSEE n° 2093. Counter-numbers present: the 2021–2023 fall in the ratio, interest higher in 1995 than now, Italy and the EU-27 also in deficit every year, the total spending share almost unchanged since 1995.

### Verdict round 1: CHANGES REQUIRED

1. **Line 15 (argument) and line 3 (description):** "has doubled" overstates ×1.97. Change to "almost doubled".
2. **Line 15 (argument):** "in every year since 1995" implies deficits began in 1995. The series starts in 1995. Say "in every year on record here (1995–2025)" and require the prose to say "since at least 1995" (reader question 7).
3. **Line 15 and beat 1:** "a step that was never paid back" / "Neither step was reversed" is too strong for the ratio: after 2020 it fell from 117.8 to 109.5, reversing part of the 2020 step. Say "never fully reversed" and give the post-2020 low against end-2019 (109.5 vs 98.2, +11.3 points).
4. **Beat 4:** add that peer debt levels are not in the dataset, so the story compares flows and must not claim France's debt is above or below Italy's (reader question 3).
5. **Beat 3 and chart 2 row:** add the 2024 deficit (5.8%) to the beat and as a label on chart 2, so "the deficit fell in 2025" has its number on a chart (reader question 8).

## Round 2

- **Revision reviewed:** commit `8e778e0`, `site/stories/french-debt-outline.md` SHA-256 `02d840b06a08c9b705dea27aee9be50ea30efe2796bc0d11917311a3cb050416`.
- **Corrections checked against the diff `22d2b2a..8e778e0`:**
  1. "almost doubled" in description, argument and chart 1 purpose. Resolved.
  2. Argument says "every year on record here (1995–2025)"; beat 3 requires "since at least 1995". Resolved.
  3. Argument says "never fully reversed"; beat 1 gives 109.5% and 11.3 points above end-2019 (reproduced: 109.5 − 98.2 = 11.3). Resolved.
  4. Beat 4 adds the peer-debt limit; `source-labels.json` confirms no debt indicator was requested from `gov_10a_main`. Resolved.
  5. Beat 3 gives 2024: 5.8% (reproduced: FR `B9` PC_GDP 2024 = −5.8); chart 2 labels 2024 −5.8. Resolved.
- **Reader questions after round 2:** 1, 2, 4, 5, 8 answered; 3 and 7 answered as far as the data allows, with the limit stated; 6 out of scope, stated.
- **No new numbers** beyond those reproduced above.

### Verdict round 2: APPROVED

Approved revision: commit `8e778e0`, outline SHA-256 `02d840b06a08c9b705dea27aee9be50ea30efe2796bc0d11917311a3cb050416`. Charts and prose may proceed.

## Addendum: link-syntax change after approval

- Before the prose commit, an MDX compile check (`@mdx-js/mdx` with `remark-gfm`, as pinned in `site/stories/package.json`) failed on the outline's three `<https://…>` autolinks. They were rewritten as `[url](url)` links. No wording, number, beat or chart-plan row changed (diff: three lines in "Outside context", link syntax only).
- New outline SHA-256: `9ea2f004296254988105c127cb1f51ea564b9c6e9f31ddf8b3e3211e359c14a3` (committed with this addendum). Reviewer (self) confirms the round-2 approval carries over; this is not a change to the argument or chart plan.
