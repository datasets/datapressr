# French public finances: reader critique of the first draft

Independent editorial critique by `/root/critique_france_v2`, 8 October 2026, requested by the user. Reviewed the story, approved outline, investigation note, dataset README/schema and underlying spending-function CSV. This is a reader-centred critique, not a new source audit. Bead `datapressr-sy2` remains the task tracker.

## Overall assessment

The first draft is a sound accounting explainer, but its most interesting question stops at the first level of classification. A reader asks “where does the money go?” and receives “social protection”, then immediately needs to ask what that means. The dataset already contains most of the missing detail. The next version should make social protection's composition and evolution the centre of the article, use a compact revenue–spending comparison to establish the gap, and make the relationship between large spending commitments and changes in the deficit explicit.

The strongest finding available for development is a tension: old-age and related support dominate the largest spending category, yet social protection's share of GDP was lower in 2024 than in 2014. Its scale matters to the budget; its scale alone does not explain the recent deterioration. That gives the article an argument rather than a sequence of fiscal definitions.

## Questions a reader brings from debt-crisis coverage

| Reader question | First-draft coverage | What the next version needs |
|---|---|---|
| How much debt are we talking about? | Answered, but €3,595.5 billion is unnecessarily hard to read. | Say about €3.6 trillion, dated June 2026, beside the 119% of GDP figure. Retain source precision in data and notes. |
| How much does France spend, raise and borrow each year? | Answered, with an over-precise opening and a long-run chart doing several jobs. | Two aligned horizontal bars, zero baseline, showing about €1.71tn spending and €1.56tn revenue; bracket the €153bn annual gap. Use source values for geometry. |
| Does “government” mean the national government's budget? | Answered. | Keep a single plain sentence explaining that the numbers include local government and social security. |
| What do I actually get for this spending? | Partly answered by ten broad COFOG categories. | Keep the overall composition graphic, then unpack social protection into familiar purposes. Explain that cash income support and healthcare are separate statistical categories. |
| Is social protection mainly pensions, unemployment benefits or welfare for people out of work? | Not adequately answered. A single old-age amount leaves readers to infer the rest. | Show all nine subgroups, with old age and survivors visibly distinct. Say what is and is not included; do not rename old age alone to total pensions. |
| Which spending has grown, and over what period? | Weak. One aggregate 2014–2024 GDP comparison is buried in prose. | Show category trends through the available history, with clear pre-pandemic and latest comparisons. Distinguish nominal euros, share of total spending and share of GDP. |
| Has social protection grown faster than the economy? | Partly answered for the aggregate only. | Display the subgroup GDP-share changes. This is the article's strongest presently underused counterpoint. |
| Why are deficits large if France already taxes heavily? | Partly answered: recent receipts fell relative to GDP, but France's revenue level lacks comparison. | One compact selected-peer comparison from the existing fiscal dataset can show both high revenue and higher spending. Avoid claiming a European ranking from four countries. |
| What changed in recent years? | Answered reasonably well. | Keep the 2022–2024 revenue-versus-spending arithmetic and 2025 improvement, with less repeated explanation. Separate observed changes from INSEE's causal interpretation. |
| Is this a spending problem or a revenue problem? | Cautious and fair, but diffuse. | State the direct answer: the gap is the difference between both; recent widening reflected receipts falling faster relative to GDP, while spending commitments stayed large. Choosing which taxes or programmes to change is a separate policy question. |
| Is rising interest the whole problem? | Answered indirectly through the primary-deficit estimate. | If retained, explain “the deficit would still be substantial before interest” in plain language, with the estimate and its source in a note. Do not mix the two documented interest conventions. |
| Is the debt crisis new, and did debt only ever rise? | Answered by the history and post-pandemic decline in the ratio. | Keep the debt chart; clarify that a fall in debt/GDP need not mean debt was repaid. |
| Are pensions growing because people are ageing or because payments rose? | Not answered. | Identify as a real evidence gap. Indexation explains a particular year's movement; beneficiary counts, age structure and payment levels are needed for a decomposition. Do not infer these mechanisms from COFOG alone. |
| Is France about to default, or what does the bond yield mean? | Outside the dataset; draft says so. | A short closing scope sentence is sufficient. A crisis-risk conclusion needs separate debt maturity, refinancing, interest and market evidence. Avoid allowing a title or framing to promise that conclusion. |
| Can I inspect and reuse the numbers? | Strong underlying reproducibility; published layout hides the relationship between story and files. | Make the CSV download section obvious, with short descriptions and dates. A portable story README plus `data/` and chart assets is a reasonable distribution format; avoid multiple manually maintained story copies. |

## Concrete evidence already available

The current `spending-functions.csv` contains nine children of `GF10`, including an explicit zero for research. These 2024 amounts are nominal billions of euros, rounded here for reading, and sum to the parent within source rounding.

| Social protection purpose | 2024 €bn | 2014 % GDP | 2019 % GDP | 2024 % GDP |
|---|---:|---:|---:|---:|
| Old age | 392.0 | 13.6 | 13.4 | 13.4 |
| Sickness and disability | 83.9 | 2.7 | 2.8 | 2.9 |
| Family and children | 66.7 | 2.6 | 2.3 | 2.3 |
| Unemployment | 48.5 | 1.9 | 1.8 | 1.7 |
| Survivors | 40.6 | 1.6 | 1.5 | 1.4 |
| Social exclusion, not elsewhere classified | 36.5 | 1.0 | 1.2 | 1.2 |
| Housing | 21.1 | 0.9 | 0.8 | 0.7 |
| Other social protection | 3.7 | 0.2 | 0.2 | 0.1 |
| Social protection research | 0.0 | 0.0 | 0.0 | 0.0 |
| **Social protection total** | **693.0** | **24.5** | **23.9** | **23.7** |

Old age represents about 56.6% of social protection. Old age plus survivors represents about 62.4%, but that combination must retain its actual labels. Rounded GDP shares need not add exactly to the rounded total. These are source-accounting purposes, not household benefit-programme budgets, and sickness/disability support is not the separate healthcare division.

## Visual recommendations

1. Open with a compact pair of revenue and expenditure bars. A shared zero-based scale makes their relative size immediately visible; a labelled connector shows the deficit. Use the same unit and year for both. A second line can translate the result to “about €9 borrowed for every €100 spent”, if derived precisely from the underlying totals and labelled as a spending-denominator ratio rather than GDP.
2. Use a nested treemap if the goal is to show both the whole budget and what sits inside social protection. Keep parent areas equal to the total of their children, use a consistent colour family for protection, and avoid plotting parents as extra leaves. Tiny or zero groups need an adjacent accessible table, since they cannot all carry legible labels. A ranked bar chart remains better for precise comparisons. A treemap should add hierarchy, not duplicate a second graphic showing identical information.
3. Show evolution separately: a line chart or small multiples of spending/GDP for social protection, old age, health and the smaller protection groups. If space is tight, an aligned 2014–2024 slope or change-in-percentage-points chart is sufficient, but state why those endpoints were chosen and include 2019 as a pre-pandemic check. A treemap alone cannot answer evolution.
4. Keep the long-run revenue/spending lines and debt history, but reconsider whether the separate seven-year deficit bars earn their space once the opening and line annotations show the recent gap. More distinct questions answered is preferable to a higher chart count.
5. Put exact values in the downloadable CSVs and chart detail table. Headlines should say €1.7 trillion or €1.71 trillion, €3.6 trillion and €153 billion. “Trillion” is clear in an English article; do not force all values into billions merely because the source uses millions.

## Prose and structure recommendations

Lead with a concrete finding: France spent about €1.7 trillion in 2025, around €153 billion more than it raised. Follow immediately with where it went, then the social protection drill-down, then how those purposes have evolved. Explain the deficit's recent movement after the reader understands the spending commitments. End by connecting repeated gaps to debt.

Retain one short definitions paragraph and move technical reconciliations to the method note. “Friction notes”, the author-pass status and internal chart-number exceptions belong in the editorial record rather than the reader-facing article. The prose currently repeats the warning that the data cannot prove a causal allocation or default probability; say each necessary limitation once, close to the relevant claim.

Replace technical terms where the plain meaning is enough. For example, “before interest payments” is more immediately useful than introducing “primary deficit” in the main narrative. An attributed model estimate can support the argument without making the reader parse both structural and primary balance definitions in one paragraph.

## Priorities and evidence limits

The highest-value iteration needs no new source acquisition: expose the social protection groups, calculate their shares, show evolution, simplify the numerical presentation and trim method-heavy prose. The existing peer data can answer whether high spending coexists with high revenue, subject to differences in public/private provision.

A subsequent evidence expansion could separate demographic effects, real benefit generosity, inflation indexation and programme reforms. That requires additional primary sources and coherent vintages; nominal growth is not real growth, and a COFOG line is not a causal decomposition. Expenditure efficiency, distributional incidence, the effect of specific tax cuts, creditor composition and default risk remain outside this first dataset.

The next outline should centre the question “What is inside France's biggest spending category, and is it actually growing relative to the economy?” Keep the observed accounting answer distinct from claims about why policy choices were made or what should be cut.
