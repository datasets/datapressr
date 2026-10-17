
# Outline: France Has Borrowed Every Year Since 1995

The prose (`france-debt.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `france-debt`.

## The argument, in one sentence

French public debt has reached 119% of GDP because France has spent more than it raised in every one of the last 31 years — not because it taxes less than its neighbours (it taxes more) but because it spends more still — so debt jumped in 2009 and 2020 and never returned to where it was before either jump, and the interest bill on that debt has more than doubled since 2020.

## What this story is about, and what it is not

About: the fiscal arithmetic behind the debt. The stock (Maastricht gross debt, INSEE quarterly) and the flow that feeds it (the annual general-government balance, Eurostat), compared with Germany, Italy, Spain and the EU27; where France's spending exceeds the EU27's; and the cost of servicing the debt.

Not about:

- **The "crisis" as markets and politics see it.** The dataset has no bond yields, spreads, credit ratings, auction results or government collapses. It shows a debt that keeps climbing and a rising interest bill; whether that amounts to a crisis is a market and political judgment the data does not contain. The story says so in one sentence rather than pretending otherwise.
- **Why** French governments chose to spend more. The accounts measure the gap; they do not test policy, demography or indexation. Any mechanism is attributed to INSEE (below) and marked as untested here.
- The wrangling.

## Argument, in order

Measurement kinds, stated once: debt is a **stock** (gross Maastricht debt, nominal, consolidated; % of annual GDP using INSEE's quarterly method). The balance, revenue, spending and interest are annual **flows** (Eurostat ESA 2010, % of GDP and millions of current euros). All values nominal. Debt changes are not the same thing as the deficit (stock-flow adjustments, cash holdings); the story never derives one from the other.

1. **The finding (chart 1).** Gross debt was 60.5% of GDP in 2000-Q1 and 119.0% (€3,595.5bn, shown as €3.6 trillion) in 2026-Q2, the highest in the series. It rose in steps: +14.3 points between 2008-Q4 (69.8%) and 2009-Q4 (84.1%); +16.7 points between 2019-Q4 (98.2%) and 2020-Q4 (114.9%). Neither jump was reversed: after 2009 the ratio never went below 85.9% (2010–2019 minimum), and by 2019-Q4 it had risen a further 14.1 points, almost as much as the 2009 jump (small year-end declines such as 98.8% in 2017-Q4 to 98.2% in 2019-Q4 recovered none of it); after 2020 its low point was 109.5% (2023-Q4), still 11.3 points above 2019-Q4. Prose says "never returned to its earlier level", not "never fell".
2. **What you're looking at.** INSEE quarterly debt release of 29 September 2026 (whole series revised to that vintage); Eurostat annual government accounts updated 21 July 2026 (France totals from 1995). "General government" = central state, local authorities and social security funds together. "Revenue" is broader than taxes (includes social contributions and sales).
3. **What it says — the deficit never closes (chart 2).** France's balance has been negative in all 31 years 1995–2025. Its smallest deficit was 1.3% of GDP (2000); its largest 8.9% (2020); 5.1% in 2025. Germany ran surpluses 2014–2019, peaking at +1.9% in 2018 (also +0.2% in 2007 and +0.1% in 2013). In 2025 France's deficit (5.1%) is the largest of the five geographies: Germany 2.7%, Italy 3.1%, Spain 2.4%, EU27 3.1%.
4. **What it says — not low taxes, higher spending (chart 3).** In 2025 French revenue was 52.1% of GDP against 46.4% for the EU27 (+5.7 points), the highest of the five. Spending was 57.2% against 49.5% (+7.7 points). The +7.7 breaks down (France minus EU27, points of GDP, economic type): social benefits in cash (pensions, unemployment, family allowances) +2.9; pay of public employees +2.1; social transfers in kind bought from the market +1.0; investment +0.5; subsidies +0.5; interest +0.3; intermediate consumption −0.7; everything else (residual = TE gap minus listed gaps) +1.1. Cash benefits and public pay are 5.0 of the 7.7 points.
5. **The wrinkle — the interest bill (chart 4).** Interest paid (Eurostat D41PAY) fell to €29.7bn, 1.3% of GDP, in 2020 and reached €66.6bn, 2.2% of GDP, in 2025 — more than double in euros (×2.24). This is the part that changes the arithmetic: interest is spending that buys nothing and grows with the stock. But it **weakens** a "crisis" reading in two ways: France paid more relative to GDP in the 1990s (3.6% in 1996, €45.5bn), and Italy pays more today (3.9% in 2025). EU27: 1.9% in 2025.
6. **How this was made.** Dataset `france-public-finances`, `build.ts` offline from archived snapshots verified by SHA-256; chart script re-builds byte-identical SVGs.

### Numbers that weaken the argument (must appear in the prose)

- The EU27 aggregate has also run a deficit every year 1995–2025 (smallest 0.4%, 2018). France is not unique in never balancing; it is unusual in the size of its gap (shown on chart 2).
- The deficit fell in 2025 (5.8% → 5.1%) and debt/GDP dipped to 109.5% at 2023-Q4 before rising again (both on charts 1 and 2 — 2023-Q4 dip is annotated on chart 1).
- Interest at 2.2% of GDP is below France's own 1990s level (3.6%) and Italy's (3.9%) (chart 4).
- Germany's deficit is not small in 2025 either (2.7%).

### Figures readers may know that differ from ours

- INSEE's annual accounts give 2025 spending/revenue as 57.3/52.2% of GDP; Eurostat (used here) 57.2/52.1%. Both give a 5.1% deficit.
- INSEE reports 2025 interest as €64.7bn (interest before FISIM allocation); Eurostat D41PAY, used here, is €66.6bn. The prose names the €66.6bn as Eurostat's measure.
- Older press figures for end-2025 debt may differ slightly; INSEE's latest release gives 115.7%.

## Outside context (not tested by this data)

- **Why spending rose recently.** INSEE (*Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026, [https://www.insee.fr/fr/statistiques/8997691](https://www.insee.fr/fr/statistiques/8997691)) attributes the 2025 deficit reduction mainly to revenue growth, including €23.0bn of new tax measures, and notes that social benefits — many indexed to past inflation, pensions the largest contributor — rose 3.2% in 2025. INSEE's function study (*Insee Première* n° 2093, February 2026, [https://www.insee.fr/fr/statistiques/8735252](https://www.insee.fr/fr/statistiques/8735252)) puts social protection (excluding health) at 41% of 2024 spending, €693bn. Used in prose as attribution only, not on a chart; listed as exempt (attributed external figures).
- **Recessions.** The 2009 and 2020 jumps coincide with the global financial crisis and the pandemic; the prose says "coincide", not "caused by".

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Line: French gross debt, % of GDP, quarterly | `quarterly-debt`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | All 106 quarters 2000-Q1–2026-Q2, no gaps (verified). x = `period_end` (quarter-end date). Dots + labels read from rows: 2000-Q1 60.5, 2008-Q4 69.8, 2009-Q4 84.1, 2019-Q4 98.2, 2020-Q4 114.9, 2023-Q4 109.5, 2026-Q2 119.0 (with €bn/1000 → "€3.6tn"). Step labels computed from rows: +14.3 (2009-Q4 − 2008-Q4), +14.1 (2019-Q4 − 2009-Q4), +16.7 (2020-Q4 − 2019-Q4). y-domain 0–130 (zero baseline; includes all labels). | Beat 1: debt rose in steps and never fell back |
| 2 | Lines: general-government balance, % of GDP, 1995–2025: France, Germany, EU27 | `fiscal-accounts`: `country_code` ∈ {FR, DE, EU27_2020}, `indicator` = B9, `unit` = PC_GDP, `year`, `value` | One `Plot.line` per country from its own rows (same annual calendar, no join). Filter to non-empty values; DE has empty 1975–1994 and is filtered by year ≥ 1995 anyway. x = year as a date (Jan 1). Zero rule. Labels: FR 2000 −1.3, FR 2020 −8.9, FR 2024 −5.8, FR 2025 −5.1, DE 2018 +1.9, DE 2025 −2.7, EU27 2018 −0.4, EU27 2025 −3.1. Italy and Spain: one 2025 dot each (no lines), labelled −3.1 and −2.4, so "largest of the five in 2025" is visible. y-domain −10 to +3. | Beat 3: France's deficit never closes; Germany's did |
| 3 | Horizontal bars: France minus EU27, points of GDP, 2025 | `fiscal-accounts`: FR and EU27_2020, year 2025, unit PC_GDP, indicators TR, TE, D62PAY, D1PAY, D632PAY, P51G, D3PAY, D41PAY, P2 | Difference = FR − EU27 per indicator (both from 1-dp source values; differences exact to 1 dp). Residual "Everything else" = (TE gap) − (sum of seven component gaps) = 7.7 − 6.6 = 1.1. Two groups: totals (Revenue +5.7, Spending +7.7, labels show "52.1 vs 46.4", "57.2 vs 49.5") and "Spending gap by type" (eight bars, sorted descending; revenue bar blue, spending bar and its type bars red, the one negative type bar grey). Zero baseline. EU27 includes France; title says "EU27 average". | Beat 4: higher revenue, higher spending still; where the extra spending goes |
| 4 | Line: France's interest paid, % of GDP, 1995–2025, with Italy and EU27 as 2025 dots | `fiscal-accounts`: `indicator` = D41PAY, `unit` = PC_GDP for the line and dots; France MIO_EUR for euro labels | France line only, from its own rows. Labels: FR 1996 3.6% (€45.5bn), FR 2020 1.3% (€29.7bn), FR 2025 2.2% (€66.6bn). Italy 2025 3.9% and EU27 2025 1.9% as grey labelled dots (no lines: Italy's 1995 value of 11.1% would squash France's line). y-domain 0–4.5. MIO_EUR / 1000 rounded to 1 dp for €bn. | Beat 5: the interest bill doubled since 2020 — but is below the 1990s and Italy |

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is separate and outstanding.

## Friction notes

- The dataset is at `status: archived`, not `structured`: its README says the custom INSEE HTML parser still awaits independent review. The story uses it anyway (it is the only data in scope) and says so in "How this was made".
- The question as posed ("why is there a crisis?") presupposes a crisis the data cannot show (no yields, ratings or politics). The outline answers the fiscal "why" and states that limit.
- Eurostat 2025 values carry no `p` flag in this snapshot; the README warns unflagged data can still be revised.
- Review: self (blind run, no reviewer available). Three rounds, recorded in [`france-debt-outline-review.md`](france-debt-outline-review.md): round 1 caught two causal overreaches ("recession", "growth") and a chart 4 domain that would have hidden the point; round 2 caught "never fell back", which the 2017–2019 quarters contradict. Round 3 APPROVED commit `2a92e65` (outline SHA-256 `fea765af…cfd8a2`). This note is the only change since.
