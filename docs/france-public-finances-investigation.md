# French public finances: investigation brief

Evidence gathered on 8 October 2026 for Bead `datapressr-sy2`. This is research context and a record of decisions; Beads remains the task tracker.

## Intended result and working scope

An English, evidence-led data story for a general reader, accompanied by downloadable, reproducible data. The user wants to understand the size and evolution of French debt, recent deficits, where public spending goes, and why revenue repeatedly falls short. The working format is a short story with annotated charts and a fuller evidence note here. A short European comparison is useful context, but the central subject is France. A preferred language/format question was offered; English is the working assumption pending a reply.

The dataset lives at `datasets/france-public-finances/`; the story and charts live at `site/stories/france-public-finances*`. This is one coherent dataset rather than a source portal, so a dedicated catalog repository is unnecessary. The dataset carries its archive, scripts, dependencies, validator, schema and conventions and can move to its own repository later. Initial work and review happen here. No public publication or repo migration is required for a local draft preview.

Motivation: the user's [New York Times article, 8 October 2026](https://www.nytimes.com/2026/10/08/business/france-bond-yields.html) and [Euronews explanation, 6 October 2026](https://www.euronews.com/2026/10/06/frances-sovereign-debt-crisis-explained-how-dangerous-could-it-be). Euronews was accessible; the NYT page could not be retrieved. These are leads, not the underlying statistical sources. Bond-market claims are not independently established by the fiscal dataset and should not be repeated as verified data.

## What the first source pass establishes

| Question | Evidence | Qualification |
|---|---|---|
| How much debt? | INSEE: €3,595.5 billion, 119.0% of GDP at end-Q2 2026 | Gross consolidated Maastricht debt; quarter-end stock; latest release 29 September 2026 |
| How has it evolved? | In the same INSEE vintage: 65.5% at end-2007, 98.2% at end-2019, 114.9% at end-2020, 109.5% at end-2023, 119.0% in Q2 2026 | The ratio fell after the pandemic before rising again. Nominal debt and debt/GDP answer different questions |
| What is the annual gap? | Eurostat 2025: spending €1,714.1 billion, revenue €1,561.6 billion, deficit €152.5 billion / 5.1% of GDP | Annual accounts, not the state budget; revenue includes contributions and non-tax receipts |
| How persistent? | Negative French B9 in every year of the available 1995–2025 series | This confirms 31 years, not a claim about every year since the 1970s |
| Recent deficits? | 2019–2025: 2.4%, 8.9%, 6.6%, 4.7%, 5.4%, 5.8%, 5.1% of GDP | Observations; no 2026 forecast inserted into the observed series |
| What is spending for? | 2024 COFOG: social protection €693.0 billion / 41.5%; health €261.2 billion / 15.6%; education €148.6 billion / 8.9%; defence €54.2 billion / 3.2% | The full ten-category table is in the dataset. Shares use COFOG's own €1,671.8 billion total. Latest functional data are 2024, not 2025 |
| Is France unusual among peers? | 2025 spending/revenue: France 57.2/52.1% GDP; EU27 49.5/46.4; Germany 50.5/47.9; Italy 51.2/48.1; Spain 45.3/42.9 | Selected comparators, not a ranking of every country; different public/private provision and accounting arrangements matter |

Reproduce these values with `node site/stories/france-public-finances-data.mjs`; the remaining peer and debt reference rows are directly in the CSVs. All percentages are of GDP unless explicitly labelled as shares of spending.

## Explaining the gap without inventing a single cause

**Accounting evidence.** The financing gap is total spending minus total revenue. From 2022 to 2024, the spending share fell 1.4 percentage points, from 58.4% to 57.0% of GDP. Revenue fell 2.5 points, from 53.7% to 51.2%. Thus, a worsening deficit can coexist with a falling spending/GDP ratio. In 2025 revenue recovered to 52.1%, while spending reached 57.2%, reducing the deficit. These are accounting changes, not estimates of policy effects.

**Recent revenue mechanisms, attributed.** [INSEE's 2023 accounts analysis](https://www.insee.fr/fr/statistiques/8194620) attributes weak receipts mainly to slower taxable bases, including corporation tax and property transactions; tax reductions also contributed. Its numbers reflect its original release vintage, so use the current Eurostat snapshot for the historical chart, and the article for its explanation. The [2025 accounts analysis](https://www.insee.fr/fr/statistiques/8997691) attributes the revenue rebound partly to new tax measures and describes slower benefit growth as inflation-linked increases moderated. It also reports the expiry of energy support. Those explain specific years; they are not a causal decomposition of all persistent deficits.

**Spending commitments, attributed and measured.** The [INSEE function analysis](https://www.insee.fr/fr/statistiques/8735252) links pension spending growth in 2024 to indexation following earlier inflation and reports higher health spending. But scale and growth must be distinguished: in the current COFOG snapshot, social protection's GDP share fell from 24.5% in 2014 to 23.7% in 2024 even though its euro amount rose. Healthcare, wages and pensions overlap when mixing functional and economic classifications; avoid double-counting them. A large category is not evidence of waste, nor proof that removing it would be desirable or yield its gross cost as a net saving.

**The persistent component.** The [IMF's July 2026 assessment](https://www.imf.org/en/news/articles/2026/07/22/pr26255-france-imf-executive-board-concludes-2026-article-iv-consultation) estimates a 2025 structural deficit of 5.0% of potential GDP and a primary deficit of 3.0% of GDP. These are respectively model-based and interest-excluding measures, not extra observed deficits to add together. They support the narrower statement that the gap cannot be explained solely by the business cycle or interest payments. The IMF identifies ageing-related spending pressure, modest growth and the need for a credible multi-year fiscal strategy. Its policy recommendations are attributed judgements, not findings mechanically proved by these CSVs.

**Debt dynamics.** Repeated deficits contribute to debt accumulation, but cash management, financial transactions and valuation/accounting adjustments also affect the stock. Debt/GDP additionally depends on nominal GDP. A new ten-year bond yield is not the average rate paid on the entire existing stock; higher refinancing rates feed through over time. The dataset does not estimate default probability or prescribe an optimal debt ratio.

## Reconciliations and limits

- Annual Eurostat data, quarterly INSEE debt and COFOG have different publication calendars. The API may expose 2025 in the COFOG dimension while every French value is absent; the build keeps those cells empty.
- The archived Eurostat annual ratios for 2025 are 57.2% spending and 52.1% revenue; INSEE's May article prints 57.3% and 52.2%. Both give a 5.1% deficit. Use one vintage consistently within each chart.
- The latest quarterly release revises Q2 2025 debt/GDP to 115.2%. Euronews gives an older comparison of 115.6%; the story should use the explicitly dated official series.
- Interest definitions reconcile at the series level: Eurostat D41GPAY before FISIM is €64,651.9 million in 2025, matching INSEE's rounded €64.7 billion; the archived D41PAY series is €66,635.9 million. Do not silently substitute one for the other.
- A February 2026 Cour des comptes report still estimated the 2025 deficit at 5.4%. It is not a source for the realised 2025 result, and the story should not repeat that estimate as the latest number.
- The first dataset does not contain policy-cost counterfactuals, a full structural-balance history, demographic attribution, or an interest-rate/refinancing model. Explaining the exact share of decades of debt attributable to each tax cut, programme or shock requires further research. Current evidence supports an account of composition, arithmetic and named recent mechanisms.

## Editorial direction

The first story should lead with the persistent spending–revenue gap, show the spending mix, then explain recent revenue weakness and the debt stock. Include the 2025 improvement and the post-pandemic fall in debt/GDP. This yields a factual explainer rather than a verdict that pensions, taxes, or “waste” alone caused the problem. A later deeper piece could examine the long-run policy decomposition, but that is not a claim this first dataset can settle.
