# Critique of 20261010-0000-q01-french-debt-historical-weak-0

Rubric story/v1; critic codex gpt-6-astra.

## Reader questions

Written from the question alone, before the critic read the story.

| # | Question | Answered | Where |
|---|---|---|---|
| 1 | What makes France’s debt situation a crisis now, rather than simply a high level of government borrowing? | no |  |
| 2 | How large are France’s debt, annual deficit and interest bill relative to its economy, its own history and comparable countries? | partly | “Debt” gives gross and net debt in euros and gross debt as 119 percent of GDP in 2026-Q2; “The indicators” gives the annual borrowing total, and “Other countries” gives peer balances without units. The interest bill and usable historical comparisons are missing. |
| 3 | What has driven the debt buildup, and what evidence distinguishes the roles of spending, taxation, weak growth and economic shocks? | no |  |
| 4 | What changed, and when, to make the situation more urgent? | no |  |
| 5 | How do interest rates, economic growth and the government’s budget balance affect whether the debt burden keeps rising? | no |  |
| 6 | How do France’s political constraints and its membership of the euro area shape the crisis and the options for resolving it? | no |  |
| 7 | What credible measures could stabilise the debt, who would bear their costs, and what would happen if the government failed to act? | no |  |

## Strongest findings missed

- The reported 2025 expenditure and revenue imply a €152.5 billion shortfall, about 8.9 percent of expenditure, but the story never explains the significance of that gap.
- If the reported B9 figures all measure percent of GDP, France’s 2025 deficit exceeds Germany’s by 2.4 percentage points, Italy’s by 2.0 and Spain’s by 2.7; confirming the unit would establish this useful comparison.
- The story supplies no dated evidence of financing stress or a loss of budget credibility that would distinguish a crisis from a high debt burden.
- A spending snapshot cannot distinguish persistent budget imbalances from temporary shocks, tax changes or weak growth; the story needs changes in revenue, spending and GDP over identified periods.
- Interest spending is listed as an available indicator but never extracted to explain how borrowing costs, nominal growth and the balance before interest affect debt sustainability.
- Political feasibility, euro-area constraints and the distributional costs of stabilising debt are entirely absent, leaving the reader unable to assess possible resolutions.

## Charts

### france-public-finances-indicators.svg

- Shows: Fifteen fiscal series over time, with no labels identifying the lines and repeated colours.
- Form fits the point: no
- Fix: Reduce this to directly labelled revenue and expenditure lines on an axis marked percent of GDP, making the budget gap the point.

### france-public-finances-countries.svg

- Shows: Revenue and expenditure totals over time for four countries and the EU aggregate, without identifying the series.
- Form fits the point: no
- Fix: Use labelled country panels showing revenue and expenditure as percentages of GDP so economic size and the EU aggregate do not dominate the comparison.

### france-public-finances-functions.svg

- Shows: Ten spending categories, with GF10 visibly the largest, but categories appear only as codes and values have no unit.
- Form fits the point: yes
- Fix: Replace the technical labelling with category names and a title specifying France, 2024 and the verified monetary unit.

### france-public-finances-subfunctions.svg

- Shows: Dozens of spending subcategories as narrow bars with vertical codes; neither the unit nor the period is stated.
- Form fits the point: no
- Fix: Replace the exhaustive display with ranked horizontal bars for a few relevant, fully named categories, specifying the year and unit.

### france-public-finances-debt.svg

- Shows: Quarterly gross and net debt stacked together, producing a meaningless combined height of €6,962.3 billion in 2026-Q2.
- Form fits the point: no
- Fix: Plot gross and net debt as separate, directly labelled lines in € billions; these overlapping measures must not be added.

### france-public-finances-deficits.svg

- Shows: Five unidentified coloured sets of annual budget-balance dots, including positive balances, on an axis labelled only “value”.
- Form fits the point: no
- Fix: Use directly labelled lines with France highlighted and an axis specifying budget balance as percent of GDP, with negative values identified as deficits.

## The one change that matters most

Rewrite around an evidence-backed answer to “why a crisis now?”, connecting the persistent budget gap, debt dynamics and constraints on adjustment; retain only charts that establish that explanation.

## Would the commissioning reader publish it?

no

## Lessons

1. Organise an explanatory story around an answer to the commissioned question, rather than the structure of its dataset. Evidence: The opening promises a dataset tour and the conclusion says there is more to explore; neither explains why France faces a debt crisis.
2. Use changes over time and competing explanations to establish causes; a snapshot establishes composition only. Evidence: The spending-function section lists one year’s totals without distinguishing spending decisions, tax changes, growth or shocks.
3. Stack series only when they are non-overlapping components of a meaningful total. Evidence: The debt chart adds gross and net debt, creating a total that measures neither.
4. Make every chart intelligible through readable series names, units and a stated takeaway. Evidence: The charts use “value” or “v”, omit series legends and leave spending categories as GF codes.
5. Normalise international fiscal comparisons and translate source precision into useful reader-scale numbers. Evidence: The country chart compares euro totals with the EU aggregate, while the prose reports expenditure to a tenth of a million euros and leaves deficit ratios unitless.

## Checklist (0-2)

| Dimension | Score | Why |
|---|---|---|
| argument | 0 | An explicit tour of tables and indicators offers no claim answering why France has a debt crisis. |
| depth | 0 | No causal mechanism, dated turning point or alternative explanation is examined. |
| charts | 0 | Unidentified series and unspecified units prevent interpretation, and stacked gross and net debt misrepresent the measures. |
| honesty | 0 | The debt chart misuses overlapping measures by adding them; several prose figures also omit units despite naming Eurostat and INSEE broadly. |
| reader_questions | 0 | Only the scale question receives a partial answer; the other six questions remain unanswered. |
| prose | 0 | Generic opening and closing paragraphs surround code-heavy lists and unwieldy figures, with no explanatory point for the reader to find. |
