---
title: "Outline review: France Has Borrowed Every Year Since 1995"
publish: false
---

# Outline review: France Has Borrowed Every Year Since 1995

Reviewer: self (blind run, no reviewer available). The author of the outline reviewed it; no independent reviewer could be used in this run (no subagent tool; nested `claude`/`codex` blocked).

## Round 1

- Revision reviewed: commit `8605ec0`, `site/stories/france-debt-outline.md` SHA-256 `32cf38c9feb941443c4633245b87c524b6e27223667196aa35c7adaf881633b5`.
- Method: a separate Python scan (`csv` module, `python3 -I`) of `data/fiscal-accounts.csv` and `data/quarterly-debt.csv`, not the d3 script used to draft the outline.

### Reader questions (written before rereading the outline)

1. How big is French debt now, and how fast is it growing? → **answered** (beat 1: 119.0%, €3.6tn, steps).
2. Is this new, or has it been building for decades? → **answered** (beats 1 and 3: 2000 → 2026; deficits every year since 1995).
3. Does France tax too little or spend too much? → **answered** (beat 4: revenue +5.7, spending +7.7 vs EU27).
4. What is the extra spending on — pensions, civil servants? → **partly answered** (beat 4 by economic type: cash social benefits +2.9, public pay +2.1; pensions cannot be separated from other cash benefits in this resource; INSEE's 41% social-protection figure is attributed).
5. How does France compare with Germany, Italy and the EU? → **answered** (charts 2–4).
6. How much does servicing the debt cost, and is that rising? → **answered** (beat 5).
7. Is it actually a crisis — bond markets, ratings, politics, default risk? → **missed by the data, and the outline says so** ("What this story is not about"). Acceptable: no in-scope source exists.
8. Is anything improving? → **partly answered** (2025 deficit 5.8 → 5.1; INSEE attributes it to €23.0bn of new tax measures).

### Numbers reproduced

| Claim | Reproduced |
|---|---|
| Quarterly debt series complete | 106 quarters, 2000-Q1–2026-Q2, 0 empty `gross_debt_pct_gdp` |
| 2000-Q1 / 2008-Q4 / 2009-Q4 / 2019-Q4 / 2020-Q4 / 2023-Q4 / 2026-Q2 | 60.5 / 69.8 / 84.1 / 98.2 / 114.9 / 109.5 / 119.0 % |
| 2026-Q2 gross debt | €3,595.5bn; series maximum is 2026-Q2 |
| Steps | +14.3, +14.1, +16.7 points |
| Lowest after 2021-Q1 | 2023-Q4, 109.5 |
| France balance negative 1995–2025 | True, 31 years; smallest −1.3 (2000), largest −8.9 (2020); 2024 −5.8; 2025 −5.1 |
| EU27 balance negative 1995–2025 | True; smallest −0.4 (2018) |
| Germany surpluses | 2007 +0.2, 2013 +0.1, 2014–2019 (peak +1.9 in 2018) |
| 2025 balances | FR −5.1, DE −2.7, IT −3.1, ES −2.4, EU27 −3.1 |
| 2025 revenue / spending | FR 52.1/57.2 (highest of five), EU27 46.4/49.5 |
| Gaps FR − EU27 | TR +5.7, TE +7.7, D62PAY +2.9, D1PAY +2.1, D632PAY +1.0, P51G +0.5, D3PAY +0.5, D41PAY +0.3, P2 −0.7, residual +1.1; cash+pay 5.0 |
| Interest | FR 1996 3.6% / €45,535.5m; 2020 1.3% / €29,724.1m; 2025 2.2% / €66,635.9m; ratio 2.24; FR maximum 1995–2025 is 1996 (3.6); IT 2025 3.9; EU27 2025 1.9; IT 1995 11.1 |
| 2025 flags | No Eurostat flag on any French 2025 row |

### Checklist

- Chart plan fields exist and filters return exactly one row per key (asserted in the scan). Dates exist. No joins by date. Denominators: all % of GDP from the source; no ratio computed except the gaps and the residual, both run above.
- Numbers weakening the argument are present (EU27 never balanced, 2025 improvement, 2023-Q4 dip, interest below 1990s and Italy).
- Causal claims: two overreach (corrections 1 and 2).

### Verdict: CHANGES REQUIRED

1. Beat 1 (line "Between those jumps … in a decade without a recession year in the debt record"): the debt record does not record recessions. Replace with a data-only statement: between the jumps the ratio never fell back and rose 14.1 points.
2. Argument sentence ("so each recession pushed debt up and no year of growth brought it back down"): "recession" and "growth" are not in the data. Restate as: debt jumped in 2009 and 2020 and never fell back in between. Keep the 2009/2020 event context in "Outside context" with "coincide".
3. Chart plan row 4: a y-domain of 0–12 to keep Italy's 1995 value (11.1%) whole squashes France's 1.3 → 2.2 turn into a sliver, so the chart would not show its one idea. Plot France's line only; show Italy and EU27 as labelled 2025 dots (as chart 2 does for Italy and Spain); y-domain 0–4.5. Also row 3: replace "negative bar red-free neutral" with a clear colour rule.

## Round 2

- Revision reviewed: commit `b852b7c`, outline SHA-256 `6f983b1a953f3660a8da0ac90e8d9f4fbe59bb8b1cdc24bd737c2176a8c41d07`.
- Corrections 1–3: applied (diff of `8605ec0..b852b7c` read line by line).
- New finding while checking correction 1 against the quarterly rows: "never fell back" is not literally true. Year-end debt fell from 98.8% (2017-Q4) to 98.2% (2019-Q4). Reproduced: minimum 2010-Q1–2019-Q4 = 85.9% (above 2008-Q4's 69.8%); minimum 2021-Q1–2026-Q2 = 109.5% (above 2019-Q4's 98.2%, gap 11.3 points).

### Verdict: CHANGES REQUIRED

1. Argument sentence and beat 1: replace "never fell back" with "never returned to where it was before either jump", and record the small 2017–2019 decline and the post-jump minima.

## Round 3

- Revision reviewed: commit `2a92e65`, outline SHA-256 `fea765af6cff5420424edb41eaadcc212cbfc914855ea0171d045d5383cfd8a2`.
- Round 2 correction 1: applied; the argument sentence and beat 1 now say the ratio never returned to its pre-jump level, with 85.9%, 98.8% → 98.2% and 109.5% (+11.3 over 2019-Q4) stated. All reproduced above.
- Full checklist re-run on this revision: every number in the beats matches the round 1 and round 2 tables; chart plan rows 1–4 name existing fields, return one row per key, use no date joins and have y-domains that include every annotated value (chart 1: 0–130 ⊇ 119.0; chart 2: −10 to +3 ⊇ −8.9 and +1.9; chart 4: 0–4.5 ⊇ 3.9); weakening numbers present; causal language limited to the accounting link between deficits and debt, with mechanisms attributed to INSEE and the 2009/2020 events labelled "coincide".
- Reader questions: unchanged from round 1 (1, 2, 3, 5, 6 answered; 4 and 8 partly; 7 missed by the data and stated as a limit).

### Verdict: APPROVED

Reviewer: self (blind run, no reviewer available).
