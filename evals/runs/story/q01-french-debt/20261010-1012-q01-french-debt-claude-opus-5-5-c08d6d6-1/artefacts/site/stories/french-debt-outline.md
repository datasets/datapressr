---
title: "Outline: Why France's Debt Keeps Climbing"
description: "Argument, beats, numbers and chart plan for a short story on why French public debt is at a record share of GDP."
---

# Outline: Why France's Debt Keeps Climbing

The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `french-debt`.

## The argument, in one sentence

French public debt reached a record 119.0% of GDP in mid-2026 because the government has spent more than it collected in every year since 1995, with spending running ahead of a revenue share that is already the highest of the four big euro economies; since 2024 that gap has been the widest of the four, and the interest bill it adds to has more than doubled since 2020.

## What this story is about, and what it is not

About: the arithmetic of why the debt stock keeps rising. Debt is a stock, the deficit is the annual flow that adds to it (with other stock-flow adjustments; INSEE warns the two cannot be derived from each other quarter by quarter). The data shows *that* France borrows every year, *how big* the gap is relative to neighbours, and *which side* of the account is unusually large compared with them.

Not about:

- **Whether it is a "crisis" in the market sense.** The dataset has no bond yields, spreads or ratings. It can show a record debt ratio and a persistent deficit; it cannot show investors' reaction. The story says so plainly.
- **Why spending exceeds revenue.** The accounts measure the gap. Policy choices, the economic cycle, demographics and indexation need other evidence (dataset README, "Scope of explanation"). A large spending share is not proof that spending "caused" the deficit, and the story should not say France should cut spending or raise taxes.
- **The wrangling.** One short "How this was made" paragraph at the end.
- **Spending by function (COFOG).** Not used; it would be a second story ("what the money buys").

## Argument, in order

1. **The finding.** Maastricht gross debt was 119.0% of GDP at end-Q2 2026 (€3,595.5 billion), the highest point in the INSEE series that starts in 2000-Q1 (60.5%). The previous peak was 117.8% in 2021-Q1. The ratio stepped up in two jumps: 65.5% at end-2007 → 84.1% at end-2009, and 98.2% at end-2019 → 117.8% in 2021-Q1. Between the jumps it kept climbing (84.1% → 98.2%, end-2009 to end-2019). After each jump it did not return to the earlier level.
   - *Weakening:* the ratio fell from 117.8% (2021-Q1) to 109.5% (end-2023) even though France ran deficits of 6.6%, 4.7% and 5.4% of GDP in 2021–2023, and the euro amount kept rising (€2,752.5bn → €3,103.2bn). A ratio also moves with the size of GDP, its denominator; the deficit alone does not set it. The data does not split the fall into GDP growth and inflation, so the story states only that the denominator matters. *(Source: `quarterly-debt`, INSEE release 29 September 2026. Ratio uses INSEE's annual-GDP denominator, not one quarter's output. The quarterly release gives end-2025 as 115.7%.)*
2. **What you're looking at.** General government (central, local, social security) under EU Maastricht definitions: gross consolidated debt from INSEE, annual revenue, expenditure and balance from Eurostat (update 21 July 2026), as % of GDP. Nominal, not inflation-adjusted. 2025 Eurostat values carry no flag but may still be revised.
3. **France has not run a surplus in any year of the record, 1995–2025.** The balance (B9) is negative in all 31 years. Low points: −7.4% (2009), −8.9% (2020). Best year: −1.3% (2000). By contrast Germany had surpluses in 2007 and 2013–2019, Spain in 2005–2007.
   - *Weakening:* Italy and the EU27 aggregate have no surplus year either, so a permanent deficit is not unique to France. Italy's deficit was wider than France's in 2020–2023 (e.g. −8.1% vs −4.7% in 2022).
   - *Strengthening:* in 2024 and 2025 France had the widest deficit of the four: 2025 France −5.1%, Italy −3.1%, Germany −2.7%, Spain −2.4%; EU27 −3.1%.
   - *Weakening:* France's deficit narrowed from −5.8% (2024) to −5.1% (2025).
4. **The gap is spending above a high revenue line, not low revenue.** In 2025 French revenue (TR) was 52.1% of GDP and expenditure (TE) 57.2%. Both are the highest of the four in every year 1995–2025. EU27 for comparison in 2025: revenue 46.4%, spending 49.5%. French revenue has stayed between 50.3% (2003) and 54.3% (2017) across the period; spending jumped to 58.0% in 2009 and 61.7% in 2020 and its lowest since 2020 is 56.8% (2023), above every pre-2009 year. This is a comparison, not a cause: the data cannot say which side should move.
5. **The wrinkle: the interest bill is now growing.** Interest paid (D41PAY) was €29.7 billion (1.3% of GDP) in 2020 and €66.6 billion (2.2%) in 2025, 2.24 times as much. Interest adds to the deficit, so a rising bill makes the gap harder to close.
   - *Weakening:* as a share of GDP, interest is still below its 1995 level of 3.5% (€42.2 billion) and below Italy's 3.9% in 2025.
   - *Measurement:* Eurostat D41PAY (€66.6 billion) is after FISIM allocation; INSEE's annual article quotes €64.7 billion on a different FISIM treatment. Use only the Eurostat figure and name the other if quoted.
6. **How this was made.** Links to the dataset and `build.ts`; the dataset is still at `archived` status pending its own adversarial review; chart script reproduces the numbers.

## Outside context (not tested by this data)

- INSEE's annual accounts article for 2025 ([insee.fr/fr/statistiques/8997691](https://www.insee.fr/fr/statistiques/8997691), archived in the dataset) attributes the rise in interest spending to "la hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022" — the larger debt stock and higher interest rates since 2022. Attribute; the dataset contains neither interest rates nor the stock-flow split.
- The two jumps in the debt ratio coincide with the 2008–09 financial crisis and the 2020 Covid-19 pandemic. Named as dates only; the data does not decompose the jumps into lost revenue, emergency spending and lower GDP.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Debt ratio, quarterly, 2000–2026 | `quarterly-debt`: `period_end`, `gross_debt_pct_gdp` | All 106 rows, no empty cells. x = `period_end` (quarter-end date; the stock at that date). Single line. Dots + labels read from rows for `2000-Q1` (60.5), `2007-Q4` (65.5), `2009-Q4` (84.1), `2019-Q4` (98.2), `2021-Q1` (117.8), `2023-Q4` (109.5), `2026-Q2` (119.0). The labels for 2021-Q1, 2023-Q4 and 2026-Q2 also show `gross_debt_eur_billions` (€2,753bn, €3,103bn, €3,596bn, rounded to whole billions) so the falling-ratio, rising-euros wrinkle is visible. y-domain 0–130 (include zero; % of GDP). | Beat 1: record high, ratchet in two jumps |
| 2 | Government balance, % of GDP, 1995–2025 | `fiscal-accounts`: `country_code` ∈ {FR, DE, IT, ES, EU27_2020}, `indicator` = B9, `unit` = PC_GDP, `year`, `value` | One `Plot.line` per country from its own rows (same annual calendar, no join). Filter to non-empty values (1995–2025 complete for all five). France blue and thick, others grey; EU27 dashed. Zero rule. End labels at 2025 with values (FR −5.1, IT −3.1, EU27 −3.1, DE −2.7, ES −2.4), vertically dodged so they do not overlap. Mark FR 2009 (−7.4) and 2020 (−8.9). Note text: "France: no surplus in any year, 1995–2025". y-domain must include −11.5 (ES 2012) and +2.1 (ES 2006). | Beat 3: always in deficit; widest of four in 2025 |
| 3 | Revenue and spending, France vs EU27, % of GDP | `fiscal-accounts`: FR and EU27_2020, `indicator` ∈ {TE, TR}, PC_GDP | Four lines from their own rows, 1995–2025. France blue (spending solid, revenue lighter blue), EU27 grey. Area between FR TE and TR shaded light red, labelled "France's deficit" (area computed per year from FR rows only, both present every year). End labels with 2025 values (57.2, 52.1, 49.5, 46.4). Mark FR spending 2009 (58.0) and 2020 (61.7). y-domain 40–64 (not zero-based: levels around 50%; state "% of GDP" on axis). | Beat 4: gap is spending above a high revenue line |
| 4 | Interest paid by France, % of GDP, 1995–2025 | `fiscal-accounts`: FR, `indicator` = D41PAY, `unit` PC_GDP for the line; MIO_EUR for the label text | Line on PC_GDP. Labels for 1995, 2020, 2025 show both: "1995: 3.5% · €42.2bn", "2020: 1.3% · €29.7bn", "2025: 2.2% · €66.6bn" (MIO_EUR / 1000, one decimal). y-domain 0–4. | Beat 5: interest bill rising again, but below 1990s share |

Formulas run against the columns before submitting: 2.24 = 66,635.9 / 29,724.1; "highest of four every year" checked for TE and TR 1995–2025; "widest deficit of four" holds for 2003, 2004, 2007, 2017, 2024, 2025 (so the claim is limited to 2024 and 2025); no surplus year for FR, IT, EU27.

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is a separate, outstanding stage.

## Friction notes

- The dataset is at `status: archived` (its adversarial review for the HTML parser is outstanding), not `structured`. The story uses it directly; the "How this was made" section should say so.
- `fiscal-accounts.csv` has quoted labels containing commas (`"Interest, expenditure"`), so the template's naive `split(",")` reader is wrong for this file; the chart script uses `d3-dsv` (already pinned in `site/stories/package.json`).
- The question asks about a "debt crisis". The data can measure the debt and the deficit, not market stress, so the story answers "why the debt keeps rising" and states that limit.
- Four charts for one argument is at the upper end; each serves one beat.
- Story numbering: this repository has no earlier stories, so commits use "Story #1".
- Review: self (blind run, no reviewer available). See the review record below.

## Outline review record

Reviewer: review: self (blind run, no reviewer available).

Reader questions, written before rereading the outline:

1. How big is French debt now, and is it a record?
2. Has it always been this high, or when did it get this way?
3. Is France unusual compared with its neighbours?
4. Does France tax too little or spend too much?
5. Is interest on the debt rising, and is that what makes it a crisis?
6. Are markets actually treating it as a crisis?
7. Is it getting better or worse right now?

### Round 1 — commit `07b9a86`, file SHA-256 `46b72e9dc825550cb0297265793d2fd38f667a6d98b708be1a70b2c3144e78c5`

Numbers reproduced independently from the raw Eurostat JSON-stat (`archive/fiscal.json`, update 2026-07-21) rather than the built CSV, and from the INSEE HTML table (`archive/insee-quarterly-debt.html`): debt 60.5 (2000-T1), 65.5 (2007-T4), 84.1 (2009-T4), 98.2 (2019-T4), 117.8 (2021-T1), 109.5 (2023-T4), 119.0 (2026-T2, series maximum); B9 2025 FR −5.1, DE −2.7, IT −3.1, ES −2.4, EU27 −3.1; FR B9 has no year ≥ 0 in 1995–2025, minimum −8.9 (2020), maximum −1.3 (2000), 2009 −7.4, 2024 −5.8; surpluses DE 2007, 2013–2019, ES 2005–2007, none for IT or EU27; IT/FR 2022 −8.1/−4.7; FR widest of four in 2003, 2004, 2007, 2017, 2024, 2025; FR highest TE and TR of four in all 31 years; FR 2025 TE/TR 57.2/52.1, EU27 49.5/46.4; FR TR range 50.3 (2003)–54.3 (2017); FR TE 58.0 (2009), 61.7 (2020), 56.8 (2023, lowest since 2020), pre-2009 maximum 56.1; interest 3.5% / €42,204.7m (1995), 1.3% / €29,724.1m (2020), 2.2% / €66,635.9m (2025), ratio 2.242; IT interest 2025 3.9%; ES B9 range −11.5 to 2.1. No Eurostat status flags on any B9, TE, TR or D41PAY cell from 1995 on.

Chart plan rows: all fields exist; every series is complete for 1995–2025 (quarterly 2000-Q1–2026-Q2, 106 rows, no empty cells); no join across resources; y-domains include every annotated value.

Reader questions: 1 answered (beat 1); 2 answered (beats 1, 3); 3 answered (beats 3, 4); 4 partly answered, deliberately (comparison given, judgement declined, which is correct for this data); 5 answered (beat 5, with weakening numbers); 6 partly answered (stated as outside the data, correctly); 7 partly answered (deficit narrowed in 2025; debt ratio still rising in 2026).

Verdict: corrections.

1. Beat 1: the climb between the jumps (84.1% → 98.2%, end-2009 to end-2019) is missing; "stepped up in two jumps" alone understates the steady rise between them.
2. Beat 1 and chart 1: a weakening number is missing. The ratio fell from 117.8% to 109.5% in 2021–2023 while deficits continued and the euro stock rose (€2,752.5bn → €3,103.2bn). The outline must say the ratio also depends on GDP, without claiming why GDP grew, and chart 1 must show the euro amounts.

### Round 2 — commit `acdb71e`, file SHA-256 `6a030abee82558e46cce98899d1fcf69762e64fbc00564bd1c9fcc1ac9abe8c9`

Reviewer: review: self (blind run, no reviewer available).

Both corrections applied. New numbers reproduced: FR B9 2021–2023 −6.6, −4.7, −5.4 (raw JSON-stat); INSEE table 2021-T1 €2,752.5bn, 2023-T4 €3,103.2bn, 2026-T2 €3,595.5bn. The denominator sentence makes no claim about why GDP grew. All round 1 numbers unchanged. Reader questions: unchanged from round 1; question 2 is now fully answered (steady climb between jumps), and the 2021–2023 fall gives question 7 a fairer answer.

Verdict: **APPROVED**.
