---
title: "Outline: France Has Run a Deficit Every Year Since 1995"
description: "Argument, beats, numbers and chart plan for a short story on why French public debt keeps rising."
---

# Outline: France Has Run a Deficit Every Year Since 1995

The prose (`france-debt-crisis.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/`, slug `france-debt-crisis`. Data: [`datasets/france-public-finances`](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances), read directly (same repository).

## The argument, in one sentence

French public debt has nearly doubled, from 60% to 119% of GDP, since 2000 because the government has spent more than it raised in every year since 1995 — not because France taxes little (its revenue is 5.7 points of GDP above the EU average) but because its spending is higher still, 7.7 points above — and a near-doubling of the interest bill since 2021 now makes the gap harder to close, though interest is not its main cause.

## What this story is about — and what it is not

About: the arithmetic underneath the "French debt crisis" — the stock of debt, the annual gap between spending and revenue that adds to it, how France's gap compares with the EU average, and what interest now costs.

Not about:

- **The crisis as an event.** The dataset has no bond yields, spreads, credit ratings, budget votes or governments. It cannot show market stress or political turmoil, only the fiscal build-up beneath them. The story says so and does not describe events it has no source for.
- **The wrangling.** One short "How this was made" paragraph at the end.
- **Why spending is higher.** The data shows *that* France spends more, and on which economic types (cash benefits, public pay). Why — demography, pension rules, policy choices — is outside the data. The only explanations used are attributed to INSEE's own articles (below) and marked as not tested here.

## Argument, in order

1. **The finding (chart 1).** Maastricht gross debt was 60.5% of GDP at 2000-Q1 (€854.8bn, label €855bn) and 119.0% at 2026-Q2 (€3,595.5bn, label €3.6tn): the ratio nearly doubled, the euro amount more than quadrupled. It reached 98.2% at 2019-Q4. **Counter-number:** the ratio fell from 117.8% (2021-Q1) to 109.5% (2023-Q4) even though the euro stock kept rising (€2,752.5bn → €3,103.2bn) — the denominator, nominal GDP, grew faster. A ratio can fall while the debt grows. Source: `quarterly-debt.csv`, INSEE release of 29 September 2026; quarterly ratio uses INSEE's annualised GDP, not one quarter's output.
2. **What you're looking at.** General government = central state, local authorities and social security, consolidated. Debt is a stock (Maastricht gross debt at nominal value); the deficit is a yearly flow. Spending and revenue are Eurostat `TE` and `TR` as % of GDP; `TR − TE = B9`, the balance. Revenue is broader than taxes (includes social contributions and sales).
3. **Why it grows: the gap never closes (chart 2).** France's balance (`B9`) is negative in all 31 years of the series, 1995–2025. Smallest deficit: 1.3% of GDP in 2000. Largest: 8.9% in 2020; 7.4% in 2009. In 2025: spending 57.2%, revenue 52.1%, deficit 5.1% (€152.5bn). From 2019 to 2025 the deficit widened from 2.4% to 5.1%: spending rose 1.9 points (55.3 → 57.2) and revenue fell 0.9 points (53.0 → 52.1). Each step up in the debt in chart 1 lines up with a deficit spike in chart 2 (2009–10, 2020–21) — described as coincidence of timing in the two charts, not a modelled decomposition. **The accounting check:** the annual deficits of 2001–2025 (`B9`, `MIO_EUR`) sum to €2,474bn (label €2.5tn); gross debt rose €2,580bn (label €2.6tn) from 2000-Q4 (€880.0bn) to 2025-Q4 (€3,460.1bn). Deficits account for about 96% of the rise; the rest is stock-flow adjustments (README: debt changes also reflect financial transactions). Shown as a note on chart 1. **Counter-number (is it improving?):** the deficit narrowed from 5.8% in 2024 to 5.1% in 2025 (€169.1bn → €152.5bn); INSEE attributes this mainly to revenue measures, some one-off (outside context). Debt kept rising regardless: 115.7% at 2025-Q4, 119.0% at 2026-Q2.
4. **It is not low taxes: France vs the EU, 2025 (chart 3).** France minus EU27, % of GDP: spending +7.7 (57.2 vs 49.5), revenue +5.7 (52.1 vs 46.4), so the deficit is 2.0 points deeper (5.1 vs 3.1). The extra spending, by economic type: cash social benefits (`D62PAY`) +2.9 (19.4 vs 16.5); compensation of employees (`D1PAY`) +2.1 (12.4 vs 10.3); social transfers in kind bought from the market (`D632PAY`) +1.0; subsidies +0.5; investment (`P51G`) +0.5; interest +0.3; intermediate consumption −0.7 (France spends *less*); everything else (residual = TE minus the seven listed) +1.1. **Peers (caption on chart 3, read from rows):** 2025 deficits FR 5.1, IT 3.1, EU 3.1, DE 2.7, ES 2.4 — France's is the deepest of the five geographies in the file; 2025 revenue FR 52.1, IT 48.1, DE 47.9, EU 46.4, ES 42.9. **Weakening/complicating numbers:** France's revenue is the highest of the five, so "raise taxes" and "cut spending" both start from a high base; and France's revenue share has drifted down from 54.3% (2017) to 52.1% (2025), which also contributes to the recent gap (beat 3). Subtractions are of rounded published % of GDP values; recomputing from euro values moves each row by 0.05 points or less.
5. **The wrinkle: interest (chart 4).** Interest paid (`D41PAY`) nearly doubled from €34.8bn in 2021 to €66.6bn in 2025 (1.4% → 2.2% of GDP). **Counter-numbers:** at 2.2% of GDP it is still below 1995 (€42.2bn, 3.5%), a year whose debt ratio this dataset does not hold (the quarterly series starts in 2000), so the story makes no claim about why the 1995 share was higher; and take interest out and 2025 still has a deficit of 2.9% of GDP (5.1 − 2.2; €85.9bn in euros) — the "primary" deficit. So interest is now a fast-growing cost but not the main source of the gap. **Convention:** `D41PAY` is Eurostat interest after FISIM allocation; INSEE's annual article presents €64.7bn for 2025 on a different FISIM treatment. Name both so a reader who has seen €64.7bn is not confused.
6. **How this was made.** Eurostat `gov_10a_main` (21 July 2026 update) and INSEE quarterly debt (29 September 2026), built by `build.ts`; chart script reads the CSVs; re-running reproduces the numbers. Dataset status is `archived` (adversarial review of its HTML parser outstanding) — say so.

## Outside context (attributed, not tested by this data)

- **INSEE, Insee Première no. 2106, May 2026, ["Le compte des administrations publiques en 2025"](https://www.insee.fr/fr/statistiques/8997691)** (archived at `archive/insee-annual-accounts.html`): the 2025 deficit fell mainly because of strong revenue growth, including new measures worth €23.0bn, some exceptional (€8.0bn from one-off contributions on large-company profits and maritime freight); interest spending rose because of the larger debt stock and the rise in interest rates since 2022; many social benefits are indexed to past inflation, and pensions were the largest contributor to benefit growth.
- **INSEE, Insee Première no. 2093, February 2026, ["Usage de l'argent public : les dépenses publiques par fonction en 2024"](https://www.insee.fr/fr/statistiques/8735252)** (archived at `archive/insee-spending-functions.html`): spending growth in 2024 was led by social protection, chiefly pensions (1.4 of 4.0 points), then health.

These explain recent movements; neither is a causal decomposition of thirty years of deficits, and the story says the data does not test them.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Line: French gross debt, % of GDP, quarterly | `quarterly-debt.csv`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | 106 quarters 2000-Q1–2026-Q2, no gaps; x = `period_end` (quarter-end date). y-domain 0–130 (zero baseline, includes 119.0). Dots + labels read from rows: 2000-Q1 (60.5%, €855bn), 2019-Q4 (98.2%), 2021-Q1 (117.8%), 2023-Q4 (109.5%), 2026-Q2 (119.0%, €3.6tn). € labels: billions rounded to whole; trillions to one decimal. Note text (bottom right, computed at build time): "Deficits 2001–2025 sum to €2.5tn; debt rose €2.6tn (end-2000 to end-2025)" — sum of `fiscal-accounts.csv` FR `B9` `MIO_EUR` 2001–2025 (all present; throw if any missing) and `gross_debt_eur_billions` 2025-Q4 minus 2000-Q4. Also mark 2025-Q4 (115.7%). | Beat 1: the finding, and the counter-number (ratio fell 2021–23) |
| 2 | Two lines + shaded gap: France spending vs revenue, % of GDP, 1995–2025 | `fiscal-accounts.csv`, `country_code=FR`, `unit=PC_GDP`, `indicator ∈ {TE, TR, B9}`, `year`, `value` | 1995–2025, all 31 years present for FR (earlier years empty — filtered, never plotted as zero). TE and TR each from their own rows (same annual calendar, joined on `year` only for the shaded area; assert both present for every year). Red area between = deficit. Labels: deficit (from `B9`) in 2000 (1.3), 2009 (7.4), 2020 (8.9), 2024 (5.8), 2025 (5.1); end labels for TE 57.2 and TR 52.1 in 2025; dots at 2019 TE 55.3 and TR 53.0. y-domain 45–65 (not zero-based: the gap, not the level, is the point; stated in axis label). | Beat 3: the gap has never closed |
| 3 | Diverging horizontal bars: France minus EU27, 2025, percentage points of GDP | `fiscal-accounts.csv`, `year=2025`, `unit=PC_GDP`, `country_code ∈ {FR, EU27_2020}`, indicators TE, TR, D62PAY, D1PAY, D632PAY, D3PAY, P51G, D41PAY, P2 | diff = FR − EU per indicator; "Other spending" = TE diff − sum of the seven component diffs (= +1.1). All 2025 values present, unflagged. Top block: total spending (+7.7) and total revenue (+5.7) in dark ink; then the eight spending rows sorted by size, blue for positive, grey for negative (−0.7). Zero rule. Value labels with sign. Caption lines read from `B9` and `TR` rows for FR, IT, EU27_2020, DE, ES (2025): deficits 5.1, 3.1, 3.1, 2.7, 2.4; revenue 52.1, 48.1, 46.4, 47.9, 42.9. Run against the columns: done, values above. | Beat 4: not low taxes; spending above even high revenue, mostly benefits and pay |
| 4 | Bars: French interest paid, € billions, 1995–2025 | `fiscal-accounts.csv`, `country_code=FR`, `indicator=D41PAY`, `unit ∈ {MIO_EUR, PC_GDP}` | MIO_EUR ÷ 1000 → € bn; bars by year, 2021–2025 in red, earlier grey. Labels: 1995 (€42.2bn, 3.5% of GDP), 2021 (€34.8bn, 1.4%), 2025 (€66.6bn, 2.2%). Note line: "2025 deficit excluding interest: 2.9% of GDP" computed as −(B9 + D41PAY) from PC_GDP rows. Axis note: Eurostat D41PAY (INSEE presents €64.7bn on a different FISIM treatment). y from 0. | Beat 5: the wrinkle |

## Voice

Follow [`skills/story/references/voice-guide.md`](https://github.com/datasets/datapressr/blob/main/skills/story/references/voice-guide.md). The author's voice pass is separate and outstanding.

## Friction notes

- review: self (blind run, no reviewer available).
- The question as posed ("why is there a debt crisis?") asks for a cause and an event. The dataset supports the build-up (deficits, debt, interest) but has no market or political data, so the story answers "why does the debt keep rising" and says plainly what it cannot show.
- The dataset is `status: archived`, not `structured` — its README says the HTML-parser review is outstanding. The story consumes it anyway (fixed-data run) and says so.
- COFOG data (`spending-functions.csv`) could rank *purposes* (social protection 23.7% of GDP in 2024, of which old age 13.4%) but has only France, so it cannot say where France differs from Europe. The economic-type comparison (chart 3) answers the cross-country question; pensions appear only via the attributed INSEE article.

## Review

### Round 1 — corrections

- Reviewer: review: self (blind run, no reviewer available).
- Revision: commit `2449c33`, `france-debt-crisis-outline.md` SHA-256 `b1011c84fc33b8ed72381c872b486659ab45e55f1777dcf1efab1cef31bbe9b4`.
- Reader questions, written before rereading: (1) How big is the debt and how fast has it grown? (2) Why does it keep growing, and since when? (3) Does France spend too much or tax too little? (4) What does the money go on? (5) Is France worse than Germany, Italy, Spain? (6) Is interest / rising rates the problem? (7) Why a "crisis" now — what changed? (8) Is it getting better?
- Coverage: 1 answered (beat 1); 2 answered (beat 3) but without showing the deficits actually account for the debt; 3 answered (beat 4); 4 partly (economic types; pensions only via INSEE); 5 partly (EU27 only, peers not charted); 6 answered (beat 5); 7 partly (2019→2025 widening and interest; no market data, stated); 8 missed (2024→2025 narrowing absent).
- Verdict: corrections.
  1. Beat 3 / chart 1: "because" rests on timing alone. Add the accounting check (cumulative 2001–2025 deficits vs debt rise) and show it on chart 1.
  2. Beat 3 / chart 2: omits the 2024→2025 narrowing (5.8 → 5.1), a number that weakens "crisis". Add it and label 2024.
  3. Beat 4: five-geography revenue list is not on any chart, and the peer deficits (Q5) are absent. Put both on chart 3 as caption lines read from rows.
  4. Beat 5: "rates higher" in 1995 is an unsourced mechanism. Remove.

### Round 2 — APPROVED

- Reviewer: review: self (blind run, no reviewer available).
- Revision reviewed: commit `ce6884a` (SHA-256 `e639a08e1c8a190767950a8e6e7ee552278c0d464cfb32de04c9b83aa8b7fbcc`); one wording correction ("doubled" → "nearly doubled": 60.5 → 119.0 is ×1.97) applied in commit `bc2b539`, SHA-256 `53ce2935175e808401aab2ba4eb9bcb3ef8a4e3ffd79a5a546b17e6afac4b3d7`. **APPROVED at `bc2b539`.** This section was added afterwards and changes nothing above it.
- Numbers reproduced with an independent Python scan (`csv` module, not the chart script): debt 60.5% / €854.8bn (2000-Q1), 98.2% (2019-Q4), 117.8% / €2,752.5bn (2021-Q1), 109.5% / €3,103.2bn (2023-Q4), 115.7% / €3,460.1bn (2025-Q4), 119.0% / €3,595.5bn (2026-Q2), 106 quarters; FR `B9` negative in all 31 years, max −1.3 (2000), min −8.9 (2020), −7.4 (2009), −5.8 (2024), −5.1 / −€152,511.1m (2025); TE/TR 2019 55.3/53.0, 2025 57.2/52.1, TR peak 54.3 (2017); deficits 2001–2025 sum −€2,474.4bn vs debt rise €2,580.1bn (2000-Q4 → 2025-Q4); FR − EU27 2025: TE +7.7, TR +5.7, B9 −2.0, D62PAY +2.9, D1PAY +2.1, D632PAY +1.0, D3PAY +0.5, P51G +0.5, D41PAY +0.3, P2 −0.7, residual +1.1; 2025 deficits FR 5.1, IT 3.1, EU 3.1, DE 2.7, ES 2.4; revenue FR 52.1, IT 48.1, DE 47.9, EU 46.4, ES 42.9; interest €42.2bn / 3.5% (1995), €34.8bn / 1.4% (2021), €66.6bn / 2.2% (2025); primary balance 2025 −2.9% / −€85.9bn. No 2025 observation used carries a Eurostat flag.
- Chart rows: all fields exist; TE/TR joined on `year` only within one resource and calendar; no missing values in any plotted range; y-domains include every annotated value.
- Reader questions after corrections: 1, 2, 3, 6, 8 answered; 4 partly (economic type, not purpose; pensions attributed to INSEE); 5 answered for deficits and revenue (caption), partly for spending mix (EU27 only); 7 partly — the data shows the widening since 2019 and the interest bill, and the outline says it has no market or political data.
