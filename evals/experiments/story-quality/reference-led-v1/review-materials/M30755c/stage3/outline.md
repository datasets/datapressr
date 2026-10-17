
# Outline: Why French Debt Keeps Climbing

The prose (`french-debt.md`) is a rendering of this outline. If the prose drifts from the argument below, the prose is wrong, not the outline.

Location: `site/stories/` (DataPressr default). Slug: `french-debt`.

## The argument, in one sentence

French public debt has almost doubled relative to the economy since 2000 because the French state has spent more than it collected in every year on record here (1995–2025), even though it collects more than Germany, Italy or Spain, and the two big shocks (2009 and 2020) each lifted debt by a step that was never fully reversed; rising interest is now added to a gap that is mostly in the rest of the budget.

## What this story is about, and what it is not

About: the fiscal arithmetic behind the debt ratio. Deficits are the flow, debt is the stock: a deficit every year adds to the debt every year, and the ratio only falls when the economy's cash value grows faster than the debt.

Not about:

- **The "crisis" as markets or politics see it.** The dataset has no bond yields, spreads, credit ratings or government collapses. The word "crisis" is the reader's. What the data shows is a debt ratio at the highest point in the series and still rising. The story says this plainly.
- **Who is to blame or what should be cut.** The data shows *that* spending exceeds revenue, and what spending is made of. It does not show that any category *caused* the deficit (the dataset README says the same). Explanations for recent movements are INSEE's, attributed.
- **The wrangling.** One short "How this was made" paragraph at the end.

## Argument, in order

All annual figures are Eurostat `gov_10a_main` (update 21 July 2026), general government, % of GDP unless stated. Quarterly debt is INSEE's 29 September 2026 release. Function spending is Eurostat `gov_10a_exp` (update 16 September 2026).

1. **The finding (headline chart 1).** France's Maastricht gross debt was 60.5% of GDP at end-2000-Q1 and 119.0% at end-2026-Q2, the highest in the 106-quarter series. In euros: €854.8bn → €3,595.5bn (about €3.6 trillion). It rose in steps: 65.5% at end-2007 → 84.1% at end-2009 (+18.6 points in two years); 98.2% at end-2019 → 114.9% at end-2020 (+16.7 points in one year). Neither step was fully reversed: the lowest ratio after 2020 was 109.5%, still 11.3 points above end-2019.
   - *Weakening:* the ratio did fall after Covid, from 117.8% (2021-Q1) to 109.5% (2023-Q4); debt in euros kept rising (€2,752.5bn → €3,103.2bn), but the economy's cash value grew faster. Since then it has risen 9.5 points to 119.0% in 2.5 years, with deficits of 5.1–5.8% rather than the 7.4% (2009) and 8.9% (2020) of the shocks.
2. **What you're looking at.** Maastricht debt = consolidated gross debt of central government, local government and social security funds, at nominal value. The quarterly ratio uses INSEE's annual-GDP denominator, not one quarter's output. The annual deficit is Eurostat `B9` (net borrowing). Interest is `D41PAY`. "Primary balance" = the balance before interest = `B9 + D41PAY`. "Revenue" (`TR`) is taxes, social contributions and other receipts; "spending" (`TE`) is all general government expenditure.
3. **What it says: a deficit every year (chart 2).** France's balance was negative in all 31 years 1995–2025. Smallest deficit: 1.3% (2000). Largest: 8.9% (2020), then 7.4% (2009). 2024: 5.8%; 2025: 5.1% (€152.5bn). The series starts in 1995, so it cannot say when France last balanced its books; the prose must say "every year since at least 1995", not "since 1995".
   - Before interest, France ran a surplus in 1998–2001 (+1.0, +1.6, +1.7, +1.7). The last was 2001. It has run a primary deficit in every year since (2002–2025, 24 years).
   - 2025 deficit of 5.1% = interest 2.2% + primary deficit 2.9% (sum of two rounded values; ±0.1).
   - Interest bottomed at 1.3% of GDP (€29.7bn) in 2020 and was 2.2% (€66.6bn) in 2025: more than double in euros in five years.
   - *Weakening:* in 1995 interest was 3.5% of GDP, higher than today. The interest burden as a share of GDP is rising from a low, not at a record.
4. **What it says: not a low-tax problem (chart 3).** In 2025 France's revenue was 52.1% of GDP, the highest of France, Germany (47.9), Italy (48.1), Spain (42.9) and the EU-27 aggregate (46.4). Its spending was higher still: 57.2%, against 50.5, 51.2, 45.3 and 49.5. France had the highest revenue *and* the highest spending of the four countries in every one of the 31 years.
   - Its 2025 deficit of 5.1% compares with 2.7% (DE), 3.1% (IT), 2.4% (ES), 3.1% (EU-27).
   - Before interest: France −2.9%, Germany −1.6%, Italy +0.8%, Spain 0.0%, EU-27 −1.2%. Italy pays more interest (3.9% of GDP) than France (2.2%) but runs a primary surplus.
   - Debt levels for the peers are not in this dataset (Eurostat debt for DE, IT, ES and the EU-27 was not archived). The story compares flows only and must not claim France has more or less debt than Italy.
   - *Weakening:* Italy and the EU-27 aggregate were also in deficit in all 31 years; Spain in 28 and Germany in 23. Persistent deficits are not unique to France; the size of the primary gap now is.
5. **The wrinkle: what the spending is (chart 4).** COFOG spending was 56.1% of GDP in 1995 and 57.3% in 2024 (latest; 2024 provisional, 2025 not yet published). The total share barely moved; the mix did. Social protection (excluding health) 22.0% → 23.7%, of which old age 11.0% → 13.4%; health 6.9% → 8.9%. Falling: general public services 8.3% → 6.2% (of which public-debt interest 3.6% → 2.0%), education 5.8% → 5.1%, defence 2.5% → 1.9%, economic affairs 6.4% → 5.7%.
   - Caveat, stated in the prose: this shows where the money goes, not which category caused the deficit. Revenue also rose (50.9% in 1995, 52.1% in 2025), and the gap has been persistent rather than steadily widening.
6. **How this was made.** Dataset `france-public-finances` (Eurostat + INSEE snapshots, retrieved 8 October 2026), `build.ts`, the chart script; re-running reproduces every number.

### Measurement kinds and figures readers may know

- **Interest:** `D41PAY` 2025 = €66.6bn. INSEE's annual-accounts article gives €64.7bn, using interest before FISIM allocation (Eurostat `D41GPAY`). The story uses `D41PAY` and says "Eurostat measure".
- **2025 spending/revenue:** Eurostat 57.2/52.1%; INSEE's May 2026 article 57.3/52.2%. Both 5.1% deficit. The story uses Eurostat.
- **Debt at end-2025:** 115.7% in the September 2026 INSEE release (revised; older press figures may differ).
- **Two spending tables:** the COFOG total for 2024 (57.3%) differs from the `TE` series for 2024 (57.0%), different vintages. Chart 4 uses only the COFOG table's own total.

## Outside context (attributed, not tested by this data)

- INSEE, *Le compte des administrations publiques en 2025*, Insee Première n° 2106, May 2026 ([https://www.insee.fr/fr/statistiques/8997691](https://www.insee.fr/fr/statistiques/8997691)): the 2025 deficit fell "essentiellement" because of strong revenue growth, including new measures; interest spending rose €6.5bn (+11.2%) "sous l'effet de la hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022" (a larger debt stock and interest rates rising since 2022).
- INSEE, *Usage de l'argent public : les dépenses publiques par fonction en 2024*, Insee Première n° 2093, February 2026, Maxime Diaz ([https://www.insee.fr/fr/statistiques/8735252](https://www.insee.fr/fr/statistiques/8735252)): spending growth in 2024 was "portée par les retraites et la santé" (driven by pensions and health).
- INSEE, Informations Rapides n° 239, 29 September 2026 ([https://www.insee.fr/fr/statistiques/9053525](https://www.insee.fr/fr/statistiques/9053525)): debt at 119.0% of GDP at end-2026-Q2.

No explanation of *why* 2009 and 2020 happened is drawn from the data; they are labelled on chart 1 by period only ("2008–09 financial crisis", "2020 pandemic").

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | `french-debt-ratio.svg` — line, debt % GDP by quarter, steps marked | `quarterly-debt`: `period`, `period_end`, `gross_debt_pct_gdp`, `gross_debt_eur_billions` | No transform. 106 rows 2000-Q1–2026-Q2, no gaps (check every value finite). Plotted at `period_end` (quarter-end stock). Dots + labels at 2000-Q1 (60.5), 2007-Q4 (65.5), 2009-Q4 (84.1), 2019-Q4 (98.2), 2020-Q4 (114.9), 2023-Q4 (109.5), 2026-Q2 (119.0; label adds €bn/1000 to 1 dp = €3.6 trillion). Light grey bands 2008-01-01–2009-12-31 and 2020-01-01–2020-12-31 with period labels. y-domain [0, 130], zero baseline. All labels read from rows by `period`; throw if missing. | Beat 1: debt almost doubled in steps that were not reversed |
| 2 | `french-debt-deficit.svg` — diverging stacked bars by year: interest (grey, below zero) + primary balance (red when negative, blue when positive); ink tick at total `B9` | `fiscal-accounts`: `country_code=FR`, `unit=PC_GDP`, `indicator` in {`B9`,`D41PAY`}, `year`, `value`; plus `D41PAY` `MIO_EUR` for 2020 and 2025 labels | Per year: interest = −D41PAY; primary = round(B9 + D41PAY, 1). Both indicators present for all 31 years 1995–2025 (throw otherwise; never fill). Stack sum equals `B9` exactly by construction. x = year (band); y-domain [−10, 3]. Labels: 2000 total −1.3; 2001 "last primary surplus +1.7"; 2009 −7.4; 2020 −8.9 and interest 1.3% (€30bn); 2024 −5.8; 2025 −5.1 with "interest 2.2% (€67bn) + primary 2.9%". Coloured key words in title/subtitle rather than a legend. | Beat 3: a deficit every year; since 2002 a deficit even before interest; interest rising from a low |
| 3 | `french-debt-peers.svg` — dot plot, 2025: revenue (ink) and spending (red) per geography, joined by a rule; text columns "Deficit" and "Before interest" | `fiscal-accounts`: `year=2025`, `unit=PC_GDP`, `indicator` in {`TR`,`TE`,`B9`,`D41PAY`}, `country_code` in {FR, DE, IT, ES, EU27_2020} | One row per geography (20 lookups; throw if any missing). Before-interest = round(B9 + D41PAY, 1). Rows ordered by spending, descending. x-domain [40, 60] (position comparison, not bar length; stated in axis label). EU-27 labelled "EU-27 (aggregate)". Values labelled at each dot. | Beat 4: France collects the most and spends more still; its gap is not interest |
| 4 | `french-debt-functions.svg` — dumbbell, 1995 vs 2024, ten COFOG divisions, % of GDP | `spending-functions`: `level=1` (10 divisions) and `TOTAL`, `GF1002` (old age), `GF0107` (public-debt transactions), `unit=PC_GDP`, `year` in {1995, 2024} | No sums: each value read directly; the total is the table's own `TOTAL`, never summed from divisions or taken from `TE`. Rows ordered by 2024 value. 1995 grey dot, 2024 ink dot, rule between. Sub-labels "of which old age 11.0 → 13.4" under social protection and "of which debt interest 3.6 → 2.0" under general public services. Subtitle: total 56.1% → 57.3%; "2024 provisional". x-domain [0, 25]. | Beat 5: what the money is spent on, and how the mix shifted |

Formula check (run against the columns before submitting, 17 October 2026): `B9 + D41PAY` for FR PC_GDP gives a value in every year 1995–2025; positive 1998–2001 only; 2025 = −2.9. TE − TR for FR 2025 = 5.1 = |B9|. For other years TE − TR and |B9| differ by at most 0.1 (rounding) — chart 2 uses `B9`, not TE − TR.

## Voice

Follow `skills/story/references/voice-guide.md`. Short declarative sentences, numbers with units, no editorialising adjectives. "Ratchet" may label the step pattern on chart 1; it does not replace the numbers. The author's voice pass is separate and outstanding.

## Friction notes

- **Review: self (blind run, no reviewer available).** The outline review, recorded in [`french-debt-outline-review.md`](french-debt-outline-review.md), was done by the author against the committed revision; it is not independent.
- The dataset is at `status: archived`, not `structured`: its README says the adversarial review of the INSEE HTML parser is still outstanding. The story uses it as-is; `node scripts/validate-datapackage.mjs .` passes with 0 errors, 0 warnings. `node build.ts` could not be re-run here: the dataset's `jsdom` dependency is not installed and there is no network.
- `fiscal-accounts.csv` uses RFC 4180 quoting (labels contain commas), so the template's `split(",")` reader breaks on it. The chart script needs a real CSV parser (`d3-dsv`, already pinned in `site/stories/package.json`).
- The question is phrased "Why is there a French debt crisis?" The data can answer "why is the debt so high and still rising", not "why do markets or politicians call it a crisis". The outline narrows the question explicitly rather than borrowing a mechanism.
- Four charts is at the edge of "chart soup". Each serves one beat; chart 4 answers the reader's "is it pensions?" question, which would otherwise go unanswered.
