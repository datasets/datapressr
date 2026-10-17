
# Outline: France Has Run a Deficit Every Year Since 1995

The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

## The argument, in one sentence

French public debt has doubled as a share of the economy, from 60.5% of GDP in early 2000 to 119.0% in mid-2026, because the government has spent more than it collected in every one of the 31 years on record since 1995, and the gap is wider than its neighbours' not because France taxes lightly (it raises more revenue relative to GDP than Germany, Italy, Spain or the EU average) but because it spends more still, chiefly on cash social benefits and public-sector pay.

## What this story is about, and what it is not

About: the arithmetic behind the debt. The deficit is a flow, debt is the stock it adds to; France's flow has been negative every year; the comparison with its neighbours shows which side of the ledger is out of line.

Not about:

- the "crisis" as an event. The dataset has no bond yields, spreads, credit ratings or government budget votes, so it cannot show market stress or the political fights over the budget. The story says this plainly and answers the part of "why" the accounts can answer: why the debt is high and still rising.
- the wrangling.
- what France *should* cut or tax. A large spending line is not proof it caused the deficit (dataset README, "Scope of explanation"). The comparison shows where France differs from the EU average, not which difference is the "cause".
- pensions as such. The EU comparison is by economic type; cash social benefits (`D62PAY`) include pensions but also unemployment, family and other benefits, and the dataset has no by-function (COFOG) data for other countries. The story can say France's cash benefits are 2.9 points of GDP above the EU average, not how much of that is pensions.
- the period before 1995. France's main totals start in 1995 in this snapshot, so "since 1995" means "since records in this dataset begin". The story makes no claim about earlier years.

The data shows *that* spending exceeds revenue and *where* France spends more than its peers. It does not show *why* governments chose to run those deficits; any mechanism is attributed to INSEE below.

## Argument, in order

All annual figures: Eurostat `gov_10a_main`, general government (S13), % of GDP, update 21 July 2026, none flagged provisional for 2025. Quarterly debt: INSEE release of 29 September 2026, Maastricht gross debt, % of annualised GDP.

1. **The finding.** France's general government has run a deficit in every year from 1995 to 2025: 31 years, 31 deficits (`B9` < 0 in all 31 rows). The smallest was 1.3% of GDP in 2000. The largest were 7.4% in 2009 and 8.9% in 2020. In 2025 it was 5.1% (€152.5 billion; spending 57.2% of GDP, revenue 52.1%).
2. **What you're looking at.** "General government" means the state, local authorities and the social security funds together, consolidated. Spending (`TE`) and revenue (`TR`) are shares of GDP in current euros; revenue includes social contributions, not only taxes. The deficit is `TR − TE` (`B9`). Debt is Maastricht gross debt at nominal value.
3. **What it does to the debt.** Each year's deficit has to be financed, mostly by borrowing (the change in debt also reflects financial transactions, so it is not equal to the deficit; dataset README). Gross debt rose from €854.8 billion (60.5% of GDP) at the end of Q1 2000 to €3,595.5 billion (119.0%) at the end of Q2 2026, the highest ratio in the series. It moved in steps: 65.5% at end-2007 to 84.1% at end-2009 (financial crisis), 98.2% at end-2019 to 114.9% at end-2020 (Covid). Between shocks it did not come back down: from 86.3% at end-2010 it climbed to between 97% and 101% from 2015 on (peak 101.2% in Q2 2017) and was 98.2% at end-2019, while deficits narrowed but never closed. The quarterly series is not seasonally adjusted (INSEE release) and swings within each year, so year-to-year comparisons use Q4 values.
4. **Is it low taxes? No.** In 2025 France raised 52.1% of GDP in revenue, the most of the five: Germany 47.9%, Italy 48.1%, Spain 42.9%, EU27 46.4%. France is 5.7 points above the EU average on revenue. But it spent 57.2% of GDP against Germany 50.5%, Italy 51.2%, Spain 45.3%, EU27 49.5%: 7.7 points above. The difference, 2.0 points, is France's deficit (5.1%) minus the EU's (3.1%). France had the widest gap of the five in 2025: Germany 2.7%, Italy 3.1%, Spain 2.4%.
5. **Where the extra spending goes** (France minus EU27, 2025, points of GDP, by ESA economic type, which are mutually exclusive components of `TE`):
   - cash social benefits (`D62PAY`, pensions, unemployment and family benefits and the like): 19.4 vs 16.5, **+2.9**
   - public-sector pay (`D1PAY`, compensation of employees): 12.4 vs 10.3, **+2.1**
   - social transfers in kind bought from the market (`D632PAY`, e.g. reimbursed medical care): 6.4 vs 5.4, **+1.0**
   - subsidies (`D3PAY`): 1.9 vs 1.4, **+0.5**
   - investment (`P51G`): 4.4 vs 3.9, **+0.5**
   - interest (`D41PAY`): 2.2 vs 1.9, **+0.3**
   - intermediate consumption (`P2`): 5.4 vs 6.1, **−0.7**
   - all other spending (residual: `TE` minus the seven items above; FR 5.1, EU 4.0): **+1.1**
   - total: 57.2 vs 49.5, **+7.7**.
   Cash benefits and public pay account for 5.0 of the 7.7 points.
6. **The wrinkle: this is a gap that never closed, not a spending explosion.** Numbers that weaken a "spending spiralled" reading:
   - French spending was 56.1% of GDP in 1995 and 57.2% in 2025, only 1.1 points higher over 30 years. Revenue also rose, from 50.9% to 52.1%. Spending jumps in a shock (54.3% in 2008 to 58.0% in 2009; 55.3% in 2019 to 61.7% in 2020) and falls back only partly.
   - The deficit is narrowing: 5.8% in 2024, 5.1% in 2025.
   - The debt ratio fell from 114.9% (end-2020) to 109.5% (end-2023) even though the euro amount rose from €2,663.9 billion to €3,103.2 billion: the denominator grew faster. Implied annualised GDP (debt ÷ ratio) went from about €2.32 trillion to €2.83 trillion, years when INSEE reports consumer-price inflation of 5.2% (2022) and 4.9% (2023). Part of each shock step is also the denominator: in 2020 debt rose by €276.5 billion while implied GDP fell from about €2.43 trillion (end-2019) to €2.32 trillion.
   - Interest is not the main difference from peers (+0.3 points of GDP) and is lower than it was: 3.5% of GDP in 1995, 1.3% in 2020, 2.2% in 2025. Italy pays more (3.9%). The rise since 2020 is real, but for most of the period the interest bill took a shrinking share of GDP while the debt ratio doubled; the data does not give interest rates, so the story says no more than that.
   - The EU27 average includes France itself; that slightly narrows France's measured gap to "the average".
7. **How this was made.** Eurostat and INSEE snapshots in `datasets/france-public-finances/` (built by `build.ts`); charts rebuilt by `french-debt-make-charts.mjs`. Dataset status is `archived`, not yet `structured`: its adversarial review is outstanding. Say so.

**Measurement kinds readers conflate:**

- Revenue vs taxes: `TR` includes social contributions and sales; it is not France's *prélèvements obligatoires* rate.
- Gross vs net debt: the story uses gross Maastricht debt (119.0%); INSEE's net debt for Q2 2026 is lower (111.4% per the INSEE release). Not charted.
- Vintages: INSEE's May 2026 annual account gives 2025 spending/revenue as 57.3%/52.2% of GDP; Eurostat's snapshot gives 57.2%/52.1%. Both give a 5.1% deficit. The story uses Eurostat throughout for comparability across countries.
- Interest: Eurostat `D41PAY` (€66.6 billion in 2025) differs from INSEE's €64.7 billion (FISIM treatment). The story uses `D41PAY` shares only.
- The quarterly debt ratio uses INSEE's annualised GDP; the end-2025 figure (115.7%) matches INSEE's annual article.

## Outside context (not tested by this data)

- INSEE, [*Le compte des administrations publiques en 2025*](https://www.insee.fr/fr/statistiques/8997691) (May 2026): the 2025 deficit fell mainly because revenue grew strongly, helped by €23.0 billion of new tax measures including an exceptional levy on large companies' profits; spending slowed with lower inflation, a pay-point freeze in the civil service and smaller inflation-indexed pension increases. Interest spending rose 14.3% in 2025 after 13.2% in 2024, driven by a larger debt and higher interest rates since 2022.
- INSEE, [*Les dépenses des administrations publiques par fonction en 2024*](https://www.insee.fr/fr/statistiques/8735252): pensions were the main source of spending growth in 2024, after a 5.3% increase in basic pensions indexed to past inflation.

Both are attributed explanations of recent years, not a causal decomposition of 30 years of deficits.

## Chart plan

All charts read the CSVs with `d3-dsv` (`fiscal-accounts.csv` has quoted labels). Every annotated value is looked up by key at build time; a missing row throws. Rows with empty `value` are dropped, never plotted as zero. No resource is joined to another by date: charts 1, 3, 4 use only `fiscal-accounts.csv`; chart 2 uses only `quarterly-debt.csv`.

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | **Spending above revenue every year** (headline). Two lines, France spending and revenue, % of GDP, 1995–2025, the gap between them shaded red. Dots and labels on 2000 (smallest deficit), 2009, 2020 and 2025, label text "deficit X%" from `B9`. Direct labels "Spending 57.2%", "Revenue 52.1%" at the right end. | `fiscal-accounts`: `country_code=FR`, `indicator` ∈ {TE, TR, B9}, `unit=PC_GDP`, `year`, `value` | Filter FR, PC_GDP; years 1995–2025 all present for all three (31 rows each; build asserts this). Shaded area from TR (y1) to TE (y2) by year: both from the same resource and the same yearly keys, so no join invention; assert every year has both. Labels use `B9`; build asserts `abs((TR−TE) − B9) ≤ 0.15` for labelled years (all four match exactly). `year` plotted as a number with integer ticks. y-domain 45–65 (includes 50.3 min revenue (2003) and 61.7 max spending (2020)); title names the denominator "% of GDP". | Reader sees at a glance the spending line never dips below revenue; comparison is the vertical gap between two aligned lines on one scale. Beat 1. |
| 2 | **Debt ratio steps up in each shock.** France gross Maastricht debt, % of GDP, quarterly, 2000-Q1 to 2026-Q2, line. Dots and labels: 2000-Q1 60.5%, 2007-Q4 65.5%, 2009-Q4 84.1%, 2019-Q4 98.2%, 2020-Q4 114.9%, 2023-Q4 109.5%, 2026-Q2 119.0% (with "€3.6 trillion" from `gross_debt_eur_billions`). Light shading for 2008-Q1–2009-Q4 and 2020-Q1–2020-Q4 labelled "Financial crisis" and "Covid". | `quarterly-debt`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | 106 rows, no gaps (build asserts 106 consecutive quarters). x = `period_end` as a date (quarter-end stock). The series is not seasonally adjusted, so labelled comparison points are Q4 (year-end) values, except the first (2000-Q1) and latest (2026-Q2) quarters, which are labelled with their quarter. Euro label: 3,595.5 → "€3.6 trillion" rounded in the label only. y-domain 50–125 with gridlines. No 60% treaty reference line: that value is not in the workspace sources. The shaded periods are labels for the reader, not tested by the data. | One series over time; the eye sees the stair steps and the lack of descent between shocks. Beat 3 and the 2020–23 dip in beat 6. |
| 3 | **France taxes more than its neighbours, and spends more still** (2025). Dumbbell: one row per geography (France, Italy, Germany, EU27, Spain, sorted by spending), a dark dot for revenue and a red dot for spending, a red segment between them labelled with the deficit from `B9`. Values labelled at each dot. | `fiscal-accounts`: `year=2025`, `unit=PC_GDP`, `indicator` ∈ {TE, TR, B9}, all five `country_code`s | 15 lookups, all present and unflagged (build throws otherwise). Geography label "EU27 average" for `EU27_2020`, with a note "includes France". x-domain 40–60 (includes 42.9 and 57.2); x is position on a common scale, not a bar length, so a non-zero baseline is acceptable for dots; axis labelled "% of GDP, 2025". Colours: revenue `#111827`, spending `#dc2626`, key given by coloured column labels at the top. | Comparison: aligned positions on a common scale show France's revenue dot furthest right *and* its spending dot further right still, so the gap is widest. Answers "is it low taxes?". Beat 4. |
| 4 | **Where France's extra spending goes** (2025). Horizontal diverging bars, France minus EU27 in percentage points of GDP, eight bars (seven ESA items + "All other spending"), sorted by size with the residual last; zero rule; value labels "+2.9" etc. A text note "Total: +7.7 points" from `TE`. | `fiscal-accounts`: `year=2025`, `unit=PC_GDP`, `country_code` ∈ {FR, EU27_2020}, `indicator` ∈ {D62PAY, D1PAY, D632PAY, D3PAY, P51G, D41PAY, P2, TE} | Difference computed per item as FR − EU, rounded to 1 decimal (inputs are 1-decimal). Residual = (TE − Σ seven items) per geography, then FR − EU: (57.2 − 52.1) − (49.5 − 45.5) = 5.1 − 4.0 = +1.1. Build asserts eight differences sum to the TE difference within 0.05. Bars from a zero baseline; positive red, negative `#9ca3af`. Plain-English labels: "Cash social benefits (pensions etc.)", "Public-sector pay", "Health care and other in-kind benefits bought in", "Subsidies", "Investment", "Interest", "Goods and services bought (intermediate consumption)", "All other spending". | Ranking: the reader sees two bars (cash benefits, public pay) make up most of the gap and interest is small. Answers "spent on what?". Beat 5 and interest point in beat 6. |

**Prose-number coverage.** Some beat-6 numbers are context for the reviewer, not for the prose. Chart 1 also labels spending and revenue in 1995 (56.1%, 50.9%), so the "only 1.1 points higher in 30 years" point is on a chart. The 2024 deficit (5.8%), the 2008/2019 spending levels, the interest history (3.5%, 1.3%) and the €276.5 billion are not labelled and stay out of the prose. On interest the prose cites only chart 4's difference (+0.3) and the attributed INSEE growth rates (exempt: attributed external figures).

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is a separate, later stage and is outstanding.

## Friction notes

- The question asks about a "crisis". The dataset can show why debt is high and rising, not the market or political crisis. The outline narrows the question explicitly rather than borrowing outside figures it cannot check (fixed-data run, no network).
- The dataset is `status: archived`: its own adversarial review has not returned APPROVED. The skill expects a structured dataset; this run is fixed to this data, so the story uses it (every resource is typed and has a primary key) and says in the method that the dataset's review is outstanding.
- Four charts is above the skill's usual one or two. Each answers a separate reader question (how long, how much debt, low taxes or high spending, spent on what); merging any two would make one chart carry two ideas.
- Outline review: self (blind run, no reviewer available). Verdict recorded below.

## Outline review

Reviewer: self (blind run, no reviewer available). The checklist in `skills/story/SKILL.md` step 2 was run in full, with numbers reproduced by a separate Python `csv` scan of the CSVs (not the chart builder, not the `d3-dsv` exploration script).

### Round 1 — commit `f43d47a`, `french-debt-outline.md` SHA-256 `36d3a9fd888ef7b297be5cbcd81063e7b7c45f97bccac808de4eb52ef4ba3f78`

Reader questions, written before rereading the outline:

1. How big is the debt and how fast has it grown? — answered (beat 3, chart 2).
2. Is it because France spends too much or taxes too little? — answered (beat 4, chart 3).
3. What is the money spent on: is it pensions? — partly answered (beat 5, chart 4 show cash benefits; the data cannot isolate pensions in the EU comparison, and the outline did not say so).
4. How does France compare with Germany, Italy and the EU? — answered (beat 4).
5. Is this new (Covid, recent governments) or long-running? — answered (beat 1: 31 deficits in 31 years).
6. Why a "crisis" now: interest rates, markets? — partly answered (interest in beat 6 and outside context; markets explicitly out of scope).
7. Is it getting better or worse? — answered (deficit 5.8% → 5.1%, debt still rising to 119.0%).
8. Did the shocks cause it? — answered (steps in 2009 and 2020, deficits in every year before them).

Reproduced: 31 French `B9` rows 1995–2025, all negative; smallest −1.3 (2000); largest −8.9 (2020), −7.4 (2009); 2025 −5.1 / −152,511.1 MIO_EUR; TE/TR 2025 FR 57.2/52.1, DE 50.5/47.9, IT 51.2/48.1, ES 45.3/42.9, EU27 49.5/46.4; B9 DE −2.7, IT −3.1, ES −2.4, EU27 −3.1; gaps to EU +7.7 (TE), +5.7 (TR); item differences +2.9, +2.1, +1.0, +0.5, +0.5, +0.3, −0.7; residual FR 5.1, EU 4.0, +1.1; TR − TE equals B9 exactly in 2000, 2009, 2020, 2025; no 2025 flags on any charted item; quarterly debt 106 consecutive quarters 2000-Q1–2026-Q2; 60.5, 65.5, 84.1, 98.2, 114.9, 109.5, 115.7, 119.0 (max); €854.8 bn, €3,595.5 bn; 2020 rise €276.5 bn; 1995 TE/TR 56.1/50.9; 2008/2009 TE 54.3/58.0; 2019/2020 TE 55.3/61.7; 2024 B9 −5.8; interest 3.5/1.3/2.2, IT 3.9.

Verdict: **corrections**.

1. Line 34 (beat 3): "it kept rising through 2010–2019" is wrong; the ratio peaked at 98.8% at end-2017 and was 98.2% at end-2019. State the peak.
2. Line 76 (chart 1): minimum French revenue is 50.3% (2003), not 50.6%. Fix the number; the 45–65 domain is still valid.
3. Line 50 (beat 6): "the economy grew faster" and "in 2020 output fell" are inferences not shown. Show the implied denominator (debt ÷ ratio) and attribute the inflation figures to INSEE.
4. Line 77 (chart 2): the 60% Maastricht reference line is not in any workspace source. Drop it.
5. Line 24: the "1974" date is an unverifiable outside figure in a fixed-data run. Remove it.
6. Reader question 3: say explicitly that the data cannot separate pensions from other cash benefits in the EU comparison.

### Round 2 — commit `5b46b7e`, `french-debt-outline.md` SHA-256 `01ff4f50ab38d3192e5ca683bcc3d3ec152570b95fc59435ad2a0b74aeb86dbd`

Corrections 2–6 verified as applied: chart 1 domain note now says 50.3 (2003); implied denominators reproduced (debt ÷ ratio: end-2019 €2,431 bn, end-2020 €2,318 bn, end-2023 €2,834 bn) and INSEE inflation 5.2% (2022), 4.9% (2023) found in the archived annual-account article; no 60% line; no 1974; the pensions limit is stated. Rest of the outline reread against the checklist; chart-plan fields all exist in the CSV headers.

Verdict: **corrections**.

1. Line 34 (beat 3): correction 1 introduced a new error. "A peak of 98.8% at end-2017" is the Q4 value; the 2010–2019 quarterly maximum is 101.2% (2017-Q2), and the quarterly series is not seasonally adjusted. Describe the 2015–2019 range, give the true peak, and say Q4 values are used for year-end comparisons; add the same rule to chart 2's transform column.

### Round 3 — commit `35e0801`, `french-debt-outline.md` SHA-256 `66d93bf54b5cd62a2cafbf8122ba9ec0d1dc43e27d1734173ca576a64ca9d153`

Round 2 correction verified: 2015–2019 quarterly values reproduced (97.0 to 101.2, peak 2017-Q2), Q4 rule stated in beat 3 and chart 2. Full outline reread.

Verdict: **corrections**.

1. Line 52 (beat 6): "the debt was built while borrowing was cheap" is an inference about interest rates, which the dataset does not contain. Replace with the descriptive fact (interest share of GDP fell while the debt ratio rose).
2. Line 35 (beat 3): "Each year's deficit has to be borrowed" overstates the identity; the README says debt changes also reflect financial transactions. Qualify it.

### Round 4 — commit `394bb4f`, `french-debt-outline.md` SHA-256 `1e698ba26afab215fbe6fb0fb50adc57bf86a974781ac602a859c94931d06622`

Round 3 corrections verified. French `D41PAY` fell from 3.0% of GDP (2000) to 1.3% (2020) with small rises in 2001, 2007–2008 and 2011, while the Q4 debt ratio rose from 59.7% (2000) to 114.9% (2020): "for most of the period … shrinking share" holds. The financing wording now matches the README. Numbers from rounds 1–3 unchanged. Reader questions: 6 answered, 2 partly answered (pensions, which the data cannot isolate and the outline says so; the market "crisis", explicitly out of scope). No causal claim beyond the data; weakening numbers present (flat spending share over 30 years, narrowing 2025 deficit, 2020–23 ratio dip, small interest difference, EU average includes France).

Verdict: **APPROVED** (review: self, blind run, no reviewer available). This section was appended after approval and changes the file hash; the approved argument is the revision above.

### After approval: title change only

The story title changed from "France Has Not Balanced Its Books Since 1995" to "France Has Run a Deficit Every Year Since 1995" during the final self-review (correction 1 in `french-debt-editorial-review.md`): the old title implied 1995 was balanced, but 1995 was a 5.1% deficit. The argument, beats, numbers and chart plan are unchanged, so no new outline review round is needed.
