# Critique of 20260918-0000-q03-wti-negative-historical-published-0

Rubric story/v2; critic codex gpt-6-astra.

## Reader questions

Written from the question alone, before the critic read the story.

| # | Question | Answered | Where |
|---|---|---|---|
| 1 | Which oil price went below zero, on what date and by how much, and do these data measure spot prices or futures contracts? | yes | Opening paragraph and “What these numbers are”: Cushing WTI spot was -$36.98 per barrel on 20 April 2020, distinguished from the -$37.63 futures settlement. |
| 2 | Why would a seller pay someone to take oil, and what evidence establishes why that happened in April 2020? | set-aside |  |
| 3 | How far had WTI and Brent prices already fallen before the negative price appeared, and when did the decline accelerate? | partly | oil-prices-brent-wti.svg shows the March decline, but neither the chart nor the prose calculates either benchmark’s preceding fall or identifies when it accelerated. |
| 4 | What happened to Brent when WTI went negative, and how unusual was the gap between them? | partly | Opening paragraph, “Brent fell hard too,” and oil-prices-brent-wti.svg give Brent’s prices on 20–21 April; the spread is neither calculated nor compared with its history. |
| 5 | How long did negative prices last, how quickly did prices recover, and what do the weekly and monthly averages show about the episode? | partly | “What the data says” establishes one negative daily observation and the $3.32 weekly average; the charts show recovery, but the prose gives no recovery milestones or monthly average. |
| 6 | Had either benchmark gone negative before in the available record, and how did April 2020 compare with earlier price collapses? | partly | The opening establishes the sole negative observation; “Brent fell hard too” compares Brent with its December 1998 low, but earlier collapses are not compared in scale or speed. |
| 7 | What would have to happen to demand, supply, storage or trading conditions for negative oil prices to recur? | set-aside |  |

## Strongest findings missed

- The story leaves the size and timing of the pre-negative collapse for readers to estimate from the lines, although the daily data permit explicit before-and-after comparisons for both benchmarks.
- Brent exceeded WTI by $54.34 per barrel on 20 April, but by only $0.21 the next day; this makes the exceptional divergence and its rapid reversal concrete.
- WTI moved from $18.31 on 17 April to -$36.98 on 20 April and $8.91 on 21 April, a $55.29 fall followed by a $45.89 rebound, figures present in the outline but omitted from the story.
- April’s WTI monthly average was $16.55, above December 1998’s $11.35 in nominal dollars, showing that the unprecedented daily negative price did not produce the lowest monthly price.
- The available historical series could establish how unusual the benchmark spread and the speed of the collapse were, whereas the story supplies only a historical Brent low.

## Charts

### oil-prices-brent-wti.svg

- At a glance: Both prices collapse, but WTI alone makes a dramatic, brief plunge below zero while Brent remains positive.
- Glance matches the prose: yes
- Encodings: The grey solid line is Brent and the blue solid line is WTI, identified by matching endpoint labels. A red filled circle and matching annotation highlight negative WTI; smaller dark filled circles and adjacent labels highlight Brent on 20 and 21 April. Circle sizes provide emphasis rather than a quantitative scale. The dark horizontal line marks zero, readable against the axis; faint horizontal lines are gridlines.
- Encodings clear from the chart: yes
- Shows: Daily nominal spot prices through March–mid-May, the negative WTI observation, Brent’s positive price that day, and Brent’s near-record low the next day.
- Form fits the point: yes
- Fix: Add a takeaway title containing the year, such as “WTI alone briefly crossed below zero in April 2020”; the chart itself currently has no year.

### oil-prices-daily-weekly.svg

- At a glance: WTI’s daily price plunges below zero, but its weekly average stays just above it.
- Glance matches the prose: yes
- Encodings: The thin grey solid line denotes daily WTI; the thicker blue stepped line denotes the weekly average, decoded through matching coloured labels inside the chart. A red filled circle with a direct annotation highlights the negative daily observation; a blue filled circle with a direct annotation identifies the $3.32 weekly average. Equal marker sizes do not encode magnitude. The dark horizontal line marks zero and faint lines provide the grid.
- Encodings clear from the chart: yes
- Shows: Daily and weekly nominal WTI prices from February to June, demonstrating that weekly averaging leaves the lowest week positive despite one negative daily price.
- Form fits the point: yes
- Fix: Add a takeaway title with the year so the chart independently identifies the episode as April 2020.

## The one change that matters most

Replace most of “How this was made” with a compact account of the collapse and recovery: quantify the preceding falls, the one-day spread and rebound, and April’s monthly average against 1998, while retaining the explicit limit on causal inference.

## Would the commissioning reader publish it?

with-edits

## Lessons

1. Use the available price history to quantify the buildup and recovery around an exceptional observation. Evidence: The story labels the negative day precisely but leaves the preceding decline and subsequent recovery largely to visual estimation.
2. When comparing benchmarks, calculate the gap and supply a meaningful historical benchmark. Evidence: The reader receives $17.36 and -$36.98 but must calculate the $54.34 spread and is not told how unusual it was.
3. Explain what aggregation changes economically, as well as whether it removes an extreme value. Evidence: The weekly average is shown, but April’s $16.55 monthly average and its comparison with December 1998 are omitted.
4. Keep causal explanations attributed and distinguish them from what the supplied measurements establish. Evidence: “Why, according to EIA” explicitly separates the storage and expiry explanation from the price-only dataset.
5. Keep production details proportionate to their value for the reader. Evidence: The long final section explains scripts, repository-local statistics and independent wrangling while several substantive price comparisons remain unanswered.

## Checklist (0-2)

| Dimension | Score | Why |
|---|---|---|
| argument | 1 | The early claim about a brief, benchmark-specific negative spot price is clear and within reach, but the explanation arrives late and the lengthy production section does not advance it. |
| depth | 1 | The attributed mechanism and Brent comparison help, but available evidence about the preceding collapse, historical spread and recovery is not developed. |
| charts | 2 | Both line charts fit their comparisons, clearly identify their encodings and annotate the decisive values; their immediate readings match the prose. |
| honesty | 2 | The story distinguishes spot from futures, identifies nominal units and sources, and expressly states that its price data cannot establish the causal explanation. |
| reader_questions | 1 | The essential identification is answered, but four other in-reach questions receive only partial answers. |
| prose | 1 | Most sentences are clear, but repeated statements of the negative-price contrast and a long repository-focused ending displace useful explanation. |
