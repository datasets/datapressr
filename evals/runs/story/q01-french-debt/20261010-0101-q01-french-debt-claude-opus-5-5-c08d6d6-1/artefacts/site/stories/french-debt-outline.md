---
title: "Outline: France Hasn't Balanced a Budget in 31 Years"
description: "Argument, beats, numbers and chart plan for a short story on why French public debt keeps climbing."
---

# Outline: France Hasn't Balanced a Budget in 31 Years

The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

## The argument, in one sentence

French public debt has roughly doubled relative to GDP since 2000 because the French state has spent more than it collected in every year on record since 1995 — despite collecting more revenue, as a share of GDP, than Germany, Italy, Spain or the EU average — so each recession pushed debt up and no surplus ever brought it down, and since 2020 a rising interest bill has added to the gap.

## What this story is about — and what it is not

About: the arithmetic of the French debt — a deficit (flow) every year, accumulating into a debt (stock) — and how France compares with its large neighbours on revenue, spending and deficits.

Not about:

- **The wrangling.** One short paragraph at the end.
- **The market or political "crisis".** Bond yields, spreads, credit ratings and changes of government are not in this dataset. "Crisis" here means what the official accounts show: a debt ratio at a record and still rising, and a deficit above its neighbours'. The story says this explicitly.
- **Which spending or which tax is "to blame".** The data shows *that* spending has exceeded revenue every year, not *why*. The dataset README warns that a large spending category is not proof it caused a deficit. No causal decomposition is offered; the only mechanisms quoted are INSEE's own, attributed.

## Argument, in order

1. **The finding (headline chart 1).** Maastricht gross debt was 60.5% of GDP in 2000-Q1 and 119.0% in 2026-Q2 (INSEE, 29 Sept 2026 release), €3,595.5bn. It rose in steps: 69.8% at 2008-Q4, 84.1% at 2009-Q4; 98.2% at 2019-Q4, 115.2% at 2020-Q3. *Weakening:* the ratio did fall after Covid — from 117.8% (2021-Q1) to 109.5% (2023-Q4) — before climbing again. Measurement: gross, nominal, consolidated debt over annual GDP (INSEE's quarterly method), not net debt.
2. **What you're looking at.** Eurostat general-government accounts (update 21 July 2026; central, local government and social security together) and INSEE's quarterly Maastricht debt. Deficit = net borrowing `B9`, % of GDP. Debt is a stock, the deficit a flow; they are not interchangeable.
3. **What it says — never in surplus (chart 2).** France's balance has been negative in all 31 years 1995–2025. Best year: −1.3% (2000). Worst: −7.4% (2009), −8.9% (2020). 2025: −5.1%. France's deficit was larger than the EU27's in 26 of those 31 years, every year since 2002; in 2025, −5.1% against −3.1%. *Weakening / context:* the EU27 aggregate was also in deficit every year, and Italy had no surplus year either; Germany had surpluses in 2007 and 2013–2019, Spain in 2005–2007. A persistent deficit is common; France's is larger and has never paused.
4. **What it says — not a revenue shortfall in the usual sense (chart 3).** In 2025 France's revenue was 52.1% of GDP, the highest of the five (DE 47.9, IT 48.1, ES 42.9, EU27 46.4). Its spending was 57.2%, also the highest (DE 50.5, IT 51.2, ES 45.3, EU27 49.5). The gap is the deficit: FR 5.1 vs DE 2.7, IT 3.1, ES 2.4, EU27 3.1. The data cannot say whether the gap "should" close from the spending or revenue side; the story does not take sides. Revenue here is total revenue (`TR`), broader than taxes.
5. **The wrinkle — interest (chart 4).** Interest paid (`D41PAY`, Eurostat convention) fell to €29.7bn in 2020 and rose to €66.6bn in 2025 — more than doubled in five years. *Weakening:* as a share of GDP it is 2.2% in 2025, below the 3.5% of 1995 and below Italy's 3.9% (2025). So the interest bill is not yet historically extreme relative to the economy; what changed is its direction. Interest definition note: INSEE's article gives €64.7bn for 2025 (different FISIM treatment); we use Eurostat's €66.6bn and name the difference in the method note.
6. **How this was made.** Links to the dataset, `build.ts`, this outline and the chart script. Re-running reproduces the numbers. Dataset status is `archived` (adversarial review of its build still pending) — say so.

## Outside context (attributed, not tested by this data)

- INSEE, *Le compte des administrations publiques en 2025* (Insee Première n° 2106, May 2026, <https://www.insee.fr/fr/statistiques/8997691>): the rise in interest spending is "under the effect of the rise in the stock of debt and the rise in interest rates since 2022, despite the ebb of inflation". The 2025 deficit fall is "essentially" explained by strong revenue growth, notably compulsory levies supported by new measures, while spending slowed as inflation fell and energy-crisis support ended.
- Nothing in this dataset explains why the debt ratio fell in 2021–2023; the story notes the fall without explaining it.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | Line: gross debt, % of GDP, quarterly 2000-Q1–2026-Q2 | `quarterly-debt`: `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | Plotted at `period_end` (quarter-end date). No gaps (106 rows). Dots + labels read from rows for 2000-Q1 (60.5), 2008-Q4 (69.8), 2019-Q4 (98.2), 2020-Q3 (115.2), 2026-Q2 (119.0, with €3,595.5bn). y-domain 0–130 so the doubling reads honestly. | Beat 1 — the headline: debt doubled, in steps |
| 2 | Bars: France `B9` % GDP, 1995–2025, with EU27 `B9` as a grey line | `fiscal-accounts`: `country_code` in {FR, EU27_2020}, `indicator`=B9, `unit`=PC_GDP, `year`, `value` | Each geography filtered separately (same annual calendar; no join). Non-empty values only (FR and EU27 complete 1995–2025). Zero rule. Label FR 2000 (−1.3), 2009 (−7.4), 2020 (−8.9), 2025 (−5.1) and EU27 2025 (−3.1). Title states "31 of 31 years in deficit". y-domain −10 to +1. | Beat 3 — never in surplus, and deeper than the EU |
| 3 | Dumbbell: 2025 revenue (`TR`) and spending (`TE`), % GDP, for FR, IT, DE, EU27, ES | `fiscal-accounts`: `indicator` in {TR, TE}, `unit`=PC_GDP, `year`=2025 | Look up each (geo, indicator) row; throw if missing. Rows sorted by spending, descending. Label both values; label the gap with `B9` read from its own row (not TE−TR, which can differ by 0.1 through rounding). x-domain 40–60, axis labelled. | Beat 4 — highest revenue, higher spending |
| 4 | Line: France `D41PAY` interest paid, € bn, 1995–2025 | `fiscal-accounts`: FR, `D41PAY`, `MIO_EUR` (÷1000 for bn) and `PC_GDP` for labels | Labels on 1995 (€42.2bn, 3.5% GDP), 2020 (€29.7bn, 1.3%), 2025 (€66.6bn, 2.2%), % values read from the PC_GDP row. y-domain from 0. Nominal euros stated on axis. | Beat 5 — interest bill doubled since 2020, still lower share of GDP than 1995 |

Formulas checked against the CSVs: FR `B9` < 0 in all 31 years; FR `B9` < EU27 `B9` in 26 years (all 2002–2025, plus 1997 and 2000); 2025 values carry no status flag in this snapshot.

## Voice

Per `skills/story/references/voice-guide.md`. The human voice pass is a separate stage and is skipped in this scratch run.

## Friction notes

- The dataset is `status: archived`, not `structured`: its custom-parser review has not returned APPROVED. The skill expects a finished dataset; the story proceeds on the archived build and says so.
- "Why" questions push toward causal claims the accounts can't support. The honest answer from this data is arithmetic (deficits every year → debt), plus comparison; the policy *why* needs outside sources, here limited to the archived INSEE article because the run is offline.
- Interest has two conventions in circulation (Eurostat D41PAY €66.6bn vs INSEE €64.7bn for 2025). The README flags it; the story needs to name it.
