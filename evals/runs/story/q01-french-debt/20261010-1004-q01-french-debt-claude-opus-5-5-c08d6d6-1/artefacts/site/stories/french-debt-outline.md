---
title: "Outline: France Has Run a Deficit Every Year Since 1995"
description: "Argument, beats, numbers and chart plan for a short data story on why French public debt keeps rising."
---

# Outline: France Has Run a Deficit Every Year Since 1995

> The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `french-debt`.

## The argument, in one sentence

French public debt has nearly doubled as a share of GDP since 2000 because the government has spent more than it collected in every year since 1995 (31 of 31 in this data), not because it collects little: as a share of GDP, France raises more revenue than Germany, Italy, Spain or the EU average, but spends more still, and the interest bill on the accumulated debt has more than doubled since 2020.

## What this story is about — and what it is not

- **About:** the accounting arithmetic behind the debt — a deficit every year, revenue vs spending compared with peers, the step-ups after 2009 and 2020, and the interest bill that now grows with the stock.
- **Not about:** the wrangling; which policies *should* change; whether there is a "crisis" in the market sense. The dataset has no bond yields, spreads or ratings, so it cannot show market stress. The story answers the question as "why does the debt keep rising, and why is it now costing more", and says plainly that "crisis" is not something this data measures.
- **What vs why:** the data shows *that* spending exceeded revenue every year, by how much, and how that compares. It does not show *why* governments chose those budgets, and it does not show which spending "caused" the gap: the COFOG table says what money buys, not what it should have bought, so the story does not single out pensions or social protection. Any mechanism (e.g. why interest rose) is attributed to INSEE, not inferred.

## Argument, in order

Default spine (`references/story-craft.md` §5).

1. **The finding (chart 1).** INSEE's Maastricht gross debt ratio: 60.5% of GDP at end-2000-Q1, 119.0% at end-2026-Q2, the highest in the series (106 quarters, no gaps). In nominal euros: €854.8bn → €3,595.5bn (both labelled on chart 1).
2. **What it is.** General government (central, local, social security). Debt is a *stock* at quarter end, gross Maastricht definition, ratio on INSEE's annualised GDP. The deficit is a *flow*, annual, from Eurostat (`B9`, net lending/borrowing, % of GDP). Two different sources and vintages; never joined. Persistent deficits are the main reason a debt stock grows, but debt also moves with financial transactions and other stock-flow adjustments (dataset README), so the story says "deficits add to the debt", not "debt change = deficit".
3. **What it says.**
   - a. **A deficit every year (chart 2).** `B9` for France is negative in all 31 years 1995–2025. Smallest deficit: −1.3% (2000). Largest: −8.9% (2020); −7.4% in 2009. 2025: −5.1%. By contrast Germany ran surpluses in 8 years (2007, 2013–2019, peak +1.9% in 2018); the EU27 aggregate in none. France's 2025 deficit is the largest of the five geographies (DE −2.7, IT −3.1, EU27 −3.1, ES −2.4).
   - b. **Not a revenue shortfall relative to peers (chart 3).** 2025, % of GDP: France revenue 52.1, spending 57.2. EU27: 46.4 / 49.5. Germany 47.9 / 50.5; Italy 48.1 / 51.2; Spain 42.9 / 45.3. France has the highest revenue *and* the highest spending of the five; its spending exceeds the EU's by 7.7 points, its revenue by 5.7 points. (Computed from the rows, 57.2 − 49.5 and 52.1 − 46.4; these differences are prose-only arithmetic on charted values.)
   - c. **The shocks ratcheted (chart 1).** Debt ratio 69.8% at 2008-Q4 → 98.2% at 2019-Q4; 101.2% at 2020-Q1 → 115.2% at 2020-Q3. Neither step was reversed; chart 2 shows the deficit continuing after each shock. (No causal decomposition: the ratio also moves with GDP.)
4. **The wrinkle (chart 4) and counter-numbers.**
   - Interest (`D41PAY`, millions of current euros): €29.7bn in 2020 → €66.6bn in 2025, ×2.24. INSEE attributes the rise to a larger debt stock and the rise in interest rates since 2022 (outside context, below).
   - **Weakens:** as a share of GDP, interest in 2025 is 2.2%, below 1995's 3.5% (both labelled on chart 4). The interest burden is rising, not historically high.
   - **Weakens:** the debt ratio *fell* from 117.8% (2021-Q1) to 109.5% (2023-Q4) while deficits continued. The ratio depends on GDP growth too, and this data does not decompose it. Chart 1 marks 2023-Q4.
   - **Weakens:** the deficit did narrow in 2025 (−5.8 → −5.1).
   - **Vintages:** Eurostat gives 2025 spending/revenue 57.2/52.1%; INSEE's May 2026 article 57.3/52.2%. Both 5.1% deficit. Story uses Eurostat for annual figures, INSEE for quarterly debt. Eurostat interest (D41PAY) for 2025 is €66.6bn; INSEE's article uses €64.7bn under a different FISIM treatment — name this in the method so readers who know the INSEE figure aren't confused.
5. **How this was made.** Dataset `france-public-finances` (Eurostat gov_10a_main, INSEE quarterly debt release of 29 September 2026), its `build.ts`, this story's `french-debt-make-charts.mjs`. Dataset status is `archived`: its adversarial review is outstanding — say so.

## Outside context (not tested by this data)

- INSEE, *Le compte des administrations publiques en 2025* (Insee Première n° 2106, May 2026, <https://www.insee.fr/fr/statistiques/8997691>): interest spending "reste soutenue … sous l'effet de la hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022". Same article: the 2025 narrowing was mainly due to strong revenue growth with new measures, and spending slowed with lower inflation. Archived at `datasets/france-public-finances/archive/insee-annual-accounts.html`.
- The dataset README's own caveat: a large spending category is not proof it caused a deficit. The story will not single out social spending as "the cause".

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | `french-debt-ratio.svg` — line of debt ratio, 2000–2026 | `quarterly-debt.csv`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | Plot at `period_end` (quarter-end stock). All 106 rows, no gaps. y domain [0, 130] (ratio from zero). Mark 2000-Q1 (60.5%, €854.8bn), 2008-Q4 (69.8%), 2019-Q4 (98.2%), 2020-Q1 (101.2%), 2020-Q3 (115.2%), 2021-Q1 (117.8%), 2023-Q4 (109.5%), 2026-Q2 (119.0%, €3,595.5bn). Labels read from rows by `period`; throw if missing. | Beat 1 + 3c + wrinkle (fall 2021–23) |
| 2 | `french-debt-balance.svg` — balance, % GDP, France vs Germany vs EU27, 1995–2025 | `fiscal-accounts.csv`: `country_code` ∈ {FR, DE, EU27_2020}, `indicator`=B9, `unit`=PC_GDP, `year`, `value` | One `Plot.line` per country from its own rows (same annual calendar, but still not joined). Filter empty `value`. Zero rule. y domain includes −9.5…+2.5. Mark FR 2000 (−1.3), 2009 (−7.4), 2020 (−8.9), 2024 (−5.8), 2025 (−5.1); DE 2018 (+1.9) labelled "Germany: surplus in 8 years", the count computed from DE rows with value ≥ 0. End labels with 2025 values: France −5.1, Germany −2.7, EU27 −3.1. Title states "France: deficit in all 31 years" with the count computed from the rows. | Beat 3a |
| 3 | `french-debt-revenue-spending.svg` — 2025 revenue and spending, % GDP, five geographies | `fiscal-accounts.csv`: `indicator` ∈ {TR, TE, B9}, `unit`=PC_GDP, `year`=2025, all 5 `country_code` | Dot plot: one row per geography, sorted by TE descending; rule from TR to TE (the gap is the deficit, visually); value labels on both dots, and the 2025 balance (`B9`, % GDP, read from its own row, not computed as TE − TR) labelled at the right edge of each row. Throw if any of the 15 values is missing. x domain [40, 60] — not from zero, so axis labelled clearly; this is a comparison of positions, not lengths. | Beat 3b |
| 4 | `french-debt-interest.svg` — interest paid, € bn, France 1995–2025 | `fiscal-accounts.csv`: FR, `D41PAY`, `MIO_EUR` (÷1000 → € bn, nominal) and `PC_GDP` for labels | Line of nominal € bn. Mark 2020 (29.7bn, 1.3% GDP), 2025 (66.6bn, 2.2% GDP), 1995 (42.2bn, 3.5% GDP). The % GDP values come from the PC_GDP rows by year (lookup, not join for plotting). y domain [0, 70]. Axis label says "current euros". | Wrinkle |

Formulas run against the columns before submitting: B9 negative count = 31 of 31 FR rows; DE ≥0 rows = 8; 66,635.9 / 29,724.1 = 2.24; all 2025 TE/TR rows present for the five geographies, no status flags on them.

## Voice

Follow `skills/story/references/voice-guide.md`. No "crisis" adjectives; let the numbers carry it. The human voice pass is out of scope for this run.

## Friction notes

- The question asks "why … crisis". The data supports "why the debt rises" (arithmetic) but not "crisis" (no market data). The outline answers the first and says so about the second rather than forcing it.
- Dataset status is `archived`, not `structured`: its own adversarial review is still outstanding. The story consumes it anyway, with this caveat in the method.
- review: self (blind run, no reviewer available). Verdict recorded below.

## Review

### Round 1 — reviewed `639f4b8`, `french-debt-outline.md` SHA-256 `a62ad1d1921076918c8076106bcf876eae7bed9835a421942a80775161ad3919`

Reviewer: self (blind run, no reviewer available). Independent re-scan in Python (`csv` module, not the Node scan used to draft).

Reader questions, written before rereading:

1. How high is the debt, and is it a record? — **answers** (119.0% at 2026-Q2, series maximum).
2. Is France simply under-taxed? — **answers**, but conflates revenue with taxes (correction 4).
3. Is it just 2008 and Covid? — **partly answers**: ratchet shown, and chart 2 shows deficits in calm years too.
4. How does France compare with Germany and Italy? — **answers** (charts 2, 3).
5. Is the interest bill out of control? — **answers**, with the counter-number (2.2% of GDP vs 3.5% in 1995).
6. Is there a crisis in the markets? — **answers** by saying the data cannot show it.
7. Which spending is driving it (pensions)? — **misses** (correction 5).
8. Is it getting better or worse? — **partly answers** (2025 deficit narrowed; 2026-Q2 ratio a record).

Reproduced: debt ratio 2000-Q1 60.5 (€854.8bn), 2008-Q4 69.8, 2019-Q4 98.2, 2020-Q1 101.2, 2020-Q3 115.2, 2021-Q1 117.8, 2023-Q4 109.5, 2026-Q2 119.0 (€3,595.5bn), 106 rows, max at 2026-Q2. FR B9 negative 31/31 (1995–2025), max −1.3 (2000), min −8.9 (2020), 2009 −7.4, 2024 −5.8, 2025 −5.1. DE ≥ 0 in 2007, 2013–2019 (8 years), 2018 +1.9. EU27 ≥ 0: none. 2025 TR/TE/B9: FR 52.1/57.2/−5.1, DE 47.9/50.5/−2.7, IT 48.1/51.2/−3.1, ES 42.9/45.3/−2.4, EU27 46.4/49.5/−3.1; gaps 7.7 and 5.7. D41PAY 1995 42,204.7 (3.5%), 2020 29,724.1 (1.3%), 2025 66,635.9 (2.2%); ratio 2.24. No status flags on 2025 TE/TR/B9/D41PAY rows. Chart-plan fields all exist; every marked period/year exists; no gaps in quarterly series.

Verdict: **corrections**.

1. Line 14: "doubled" overstates 60.5 → 119.0 (×1.97). Say "nearly doubled".
2. Line 14 and title: "31 years on record" / "since before 1995" claim more than the data, which starts in 1995. Say "every year since 1995 (31 of 31 in this data)"; retitle.
3. Beat 2: "spent more than it collected" → debt is presented as if it were only the sum of deficits. Note stock-flow adjustments (README).
4. Line 14: "taxes lightly" — `TR` is total revenue, broader than taxes (README). Say "collects little", and "as a share of GDP".
5. Reader question 7 missed: state in "What vs why" that the story will not attribute the deficit to a spending category, and why.

### Round 2

Reviewed `4b854dc`, `french-debt-outline.md` SHA-256 `c6e5be4ad2574d6d935d8d85334834da2474802045654bb7e6f2517a4aa1beb8`. Reviewer: self (blind run, no reviewer available).

Corrections 1–5 checked as applied: "nearly doubled" (119.0/60.5 = 1.97); "every year since 1995 (31 of 31 in this data)" and retitled; stock-flow caveat in beat 2; "collects little … as a share of GDP"; spending-category attribution explicitly out of scope. Reader questions re-run: 1, 2, 4, 5, 6 answer; 3 and 8 partly answer; 7 now answered by stating the data can't attribute it. Numbers as round 1 (unchanged).

Verdict: **corrections**.

1. Beat 4, "the deficit did narrow in 2025 (−5.8 → −5.1)": −5.8 (2024) is not marked on any chart. Add a 2024 mark to chart 2.

### Round 3

Reviewed `8747d19`, `french-debt-outline.md` SHA-256 `ade39c0b3bbed41210b7eda23a6f6dbb391706c2a6c270d73184c79d8e7d4966`. Reviewer: self (blind run, no reviewer available).

Round 2 correction applied (2024 −5.8 marked on chart 2). Traced every beat number to a chart-plan mark.

Verdict: **corrections**.

1. Beat 3a, "Germany ran surpluses in 8 years": the count is not on chart 2. Label the Germany 2018 mark with the computed count.
2. Beat 3a, "France's 2025 deficit is the largest of the five (DE −2.7, IT −3.1, EU27 −3.1, ES −2.4)": IT and ES balances appear on no chart. Label each row's 2025 `B9` on chart 3, read from the B9 rows (TE − TR can differ by 0.1 from rounding).

### Round 4
Reviewed `2c5385d`, `french-debt-outline.md` SHA-256 `0ed92cb963b3ea474e4a0215066f75c3568a848ba0d61d290c8326fc776c7db5`. Reviewer: self (blind run, no reviewer available).

Round 3 corrections applied: Germany count label on chart 2 (8 years ≥ 0, reproduced: 2007, 2013–2019); 2025 `B9` per row on chart 3 with `B9` in the field list (reproduced FR −5.1, DE −2.7, IT −3.1, ES −2.4, EU27 −3.1; note DE TE − TR = 2.6, so reading `B9` is right). Every beat number traced to a chart mark: beat 1 → chart 1; 3a → charts 2 and 3; 3b → chart 3 (7.7 and 5.7 are arithmetic on charted values, to be listed in the prose audit); 3c → chart 1; wrinkle → charts 1, 2, 4. INSEE's 57.3/52.2 and €64.7bn are attributed external figures (exempt). No causal claim beyond the accounting identity, with the stock-flow caveat; the interest mechanism is attributed to INSEE. Weakening numbers present: 2.2% vs 3.5% interest share, the 2021–2023 ratio fall, the 2025 narrowing, no market data for "crisis".

Verdict: **APPROVED**.
