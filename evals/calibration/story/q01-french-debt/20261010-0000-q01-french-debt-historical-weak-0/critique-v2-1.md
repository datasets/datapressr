# Critique of 20261010-0000-q01-french-debt-historical-weak-0

Rubric story/v2; critic codex gpt-6-astra.

## Reader questions

Written from the question alone, before the critic read the story.

| # | Question | Answered | Where |
|---|---|---|---|
| 1 | How large is France’s public debt now, in euros and relative to GDP, and what evidence distinguishes a debt crisis from a high debt burden? | partly | Debt gives €3,595.5 billion and 119% of GDP in 2026-Q2; it does not explain that these fiscal data alone cannot establish a market funding crisis. |
| 2 | When did France’s debt burden rise most sharply, and has it continued rising since the pandemic? | no |  |
| 3 | How persistent is the gap between government spending and revenue, and does its recent widening reflect higher spending, lower revenue, or both relative to GDP? | partly | The indicators gives the spending–revenue gap for 2025, but neither explains its persistence nor decomposes its recent change. |
| 4 | How do France’s spending, revenue and deficit compare with Germany, Italy, Spain and the EU aggregate? | partly | Other countries lists three peers’ 2025 balances without units; the countries and deficits charts lack series labels, and no usable EU comparison is made. |
| 5 | Which functions account for the largest shares of public spending and its growth, and what is driving change within the biggest category? | partly | Spending by function and france-public-finances-functions.svg show the largest coded categories in 2024, but give neither their names nor spending shares, growth contributions or changes within the largest category. |
| 6 | How much of the deficit comes from interest payments, how has that burden changed, and how large would the deficit be without them? | no |  |
| 7 | What would need to change in spending, revenue and economic growth for France’s debt-to-GDP ratio to stabilise? | no |  |

## Strongest findings missed

- The reported 2025 figures imply that France borrowed about €153 billion, roughly €9 for every €100 it spent, but the story never makes the gap concrete.
- The annual accounts permit a decomposition of changes in the deficit into spending and revenue movements relative to GDP, which the story omits entirely.
- The quoted balances put France’s 2025 deficit above Germany’s, Italy’s and Spain’s, but the story leaves readers to make the comparison and supplies no units for it.
- The displayed functional totals put social protection at about 41% of 2024 spending and health at about 16%, but the story hides these categories behind GF10 and GF07.
- The largest category, social protection, is neither defined nor unpacked: the group data could identify its dominant components and quantify which grew or shrank.
- The interest series permits calculation of the deficit excluding interest and its change over time, providing a direct test of whether debt service explains the borrowing gap.
- The quarterly debt-to-GDP series could distinguish the pandemic jump, subsequent movements and latest rise, whereas the story plots only euro amounts.
- The story omits the accounting condition for stabilisation: debt must grow no faster than nominal GDP, with any illustrative deficit threshold explicitly allowing for other changes in the debt stock.

## Charts

### france-public-finances-indicators.svg

- At a glance: There are many anonymous series on a generic value scale, with no identifiable finding about France’s finances.
- Glance matches the prose: yes
- Encodings: Fifteen equal-width solid lines use blue, yellow, coral, teal, green, pink, purple, light blue, brown and grey, with the first five colours repeated; colours apparently distinguish indicators, but no legend or direct labels identify them.
- Encodings clear from the chart: no
- Shows: Intended to show fifteen French fiscal indicators as shares of GDP from 1995 to 2025; the supplied line paths are elided, so their actual trajectories cannot be checked.
- Form fits the point: no
- Fix: Replace the fifteen-series display with directly labelled spending and revenue lines on a percentage-of-GDP axis, annotating the persistent gap and its recent change.

### france-public-finances-countries.svg

- At a glance: The chart offers anonymous pairs of lines on a very large numerical scale, without a readable country comparison.
- Glance matches the prose: yes
- Encodings: Blue, yellow, coral, teal and green each appear on two equal-width solid lines, apparently one pair per geography; no legend identifies countries, and no line style distinguishes revenue from expenditure.
- Encodings clear from the chart: no
- Shows: Intended to compare revenue and spending in current million euros across four countries and the EU aggregate over time; elided paths prevent checking the trajectories.
- Form fits the point: no
- Fix: Use a labelled latest-year comparison of spending and revenue as percentages of GDP, with the EU clearly identified as an aggregate benchmark.

### france-public-finances-functions.svg

- At a glance: GF10 dominates spending, followed by GF07, but neither code tells me what the money buys.
- Glance matches the prose: yes
- Encodings: Equal-width filled bars encode values by height; blue is GF01, yellow GF02, coral GF03, teal GF04, green GF05, pink GF06, purple GF07, light blue GF08, brown GF09 and grey GF10, identifiable through the adjacent axis codes; colour redundantly repeats category position, while category meanings and units remain unexplained.
- Encodings clear from the chart: no
- Shows: Ten functional spending totals for 2024, with GF10 at 693028.8 and GF07 at 261156.3 on an axis labelled only 'value'.
- Form fits the point: yes
- Fix: Use ranked horizontal bars labelled with full function names and rounded shares of total spending, under a title specifying France and 2024.

### france-public-finances-subfunctions.svg

- At a glance: One category near the right towers above dozens of tiny bars whose rotated codes are hard to read.
- Glance matches the prose: yes
- Encodings: All bars share the default foreground fill and equal width, with no colour grouping; height encodes an unnamed value and position identifies densely packed function codes, whose meanings are absent.
- Encodings clear from the chart: no
- Shows: A cross-section of second-level spending codes, led by GF1002 at about 13.4, without a stated year or unit.
- Form fits the point: no
- Fix: Replace the exhaustive code chart with named components of social protection showing their change over a stated period in percentage points of GDP.

### france-public-finances-debt.svg

- At a glance: France’s debt appears to have climbed to nearly 7,000 units because the two coloured segments form one total.
- Glance matches the prose: no
- Encodings: Blue lower segments encode gross debt and yellow upper segments encode net debt, inferable from their heights and the prose but not from a legend; equal-width quarterly bars stack these overlapping measures, with height on an axis labelled 'v'.
- Encodings clear from the chart: no
- Shows: Gross and net debt incorrectly stacked, reaching €6,962.3 billion together in 2026-Q2; that sum is not a meaningful debt measure.
- Form fits the point: no
- Fix: Replace the stack with a directly labelled gross-debt-to-GDP line, annotate the latest euro amount, and use sparse year ticks.

### france-public-finances-deficits.svg

- At a glance: Balances mostly lie below zero and fall sharply around 2009 and 2020, but I cannot identify France.
- Glance matches the prose: yes
- Encodings: Blue, yellow, coral, teal and green filled circles apparently distinguish five geographies, but none is labelled; all circles have radius 3, so shape, fill and size add no distinction, and there are no connecting lines.
- Encodings clear from the chart: no
- Shows: Annual fiscal balances for five geographies from 2000 to 2025, with both deficits and surpluses plotted on an axis that omits the percentage-of-GDP unit.
- Form fits the point: no
- Fix: Use directly labelled lines with France highlighted, a percentage-of-GDP axis and a zero reference, making the latest comparison explicit.

## The one change that matters most

Rewrite the dataset tour around an evidenced explanation of France’s borrowing gap: establish its persistence, separate spending, revenue and interest contributions, and connect these to debt relative to GDP while stating that the data cannot establish a funding crisis.

## Would the commissioning reader publish it?

no

## Lessons

1. Organise an explanatory story around an answer, rather than around the tables available. Evidence: The introduction promises a dataset tour and the conclusion says there is more to explore; neither answers why France has a debt problem.
2. Stack only mutually exclusive components of a meaningful total. Evidence: The debt chart adds gross and net debt, visually producing nearly €7 trillion instead of the stated €3.6 trillion gross debt.
3. Make every chart intelligible through its own labels, units and series identification. Evidence: The charts use 'value' or 'v', unexplained function codes and unlabelled colour palettes.
4. Distinguish a category’s size from its contribution to change, and unpack the largest category. Evidence: The function charts establish that GF10 is large but never name social protection or show which of its components are growing.
5. Use comparable denominators and reader-sized numbers when explaining fiscal scale. Evidence: The peer chart compares nominal euro totals including the EU aggregate, while the prose reports spending as 1,714,137.2 million euros.

## Checklist (0-2)

| Dimension | Score | Why |
|---|---|---|
| argument | 0 | Explicitly a dataset tour, with no explanatory claim answering the commission. |
| depth | 0 | No mechanism, decomposition or alternative explanation is developed; spending categories remain unexplained codes. |
| charts | 0 | Series and units are unidentified, and stacking gross with net debt creates a false total. |
| honesty | 0 | The debt chart misuses overlapping measures; several prose figures also omit units, despite naming the source institutions. |
| reader_questions | 0 | None of the seven questions receives a complete answer, and the main explanatory questions remain open. |
| prose | 0 | Dataset terminology, unexplained codes, excessive numerical precision and generic opening and closing paragraphs displace the explanation. |
