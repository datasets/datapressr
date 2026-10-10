---
title: "Software's Slump Landed on the Youngest"
description: Since late 2022, US employment of software developers aged 22 to 25 has fallen by a fifth in ADP payroll records while every group over 30 grew. Data to October 2026.
datahub:
  slug: software-slump-youngest
  status: draft
---

# Software's Slump Landed on the Youngest

![US software developer employment on ADP payrolls by age, indexed to November 2022 = 100, September 2021 to August 2026. Ages 22–25, in red, peak at 101.6 in September 2022 and fall to 80.5 by August 2026. Every other group ends higher: 26–30 at 93.9, 31–34 at 105.5, 50+ at 107.9, 35–40 at 111.7 and 41–49 at 119.5. Since September 2021, ages 22–25 are down 8.7% and ages 41–49 up 31.0%.](junior-dev-hiring-by-age.svg)

*Employment index, November 2022 = 100. Data: Stanford Digital Economy Lab, from ADP payroll records. As of 10 October 2026. Written from [an outline](junior-dev-hiring-outline.md).*

In the records of ADP, a large US payroll company, employment of software developers aged 22 to 25 is down a fifth since November 2022: its index stands at **80.5**. Developers aged 41 to 49 are up a fifth, at **119.5**. Every group over 30 has more people in work than it did when ChatGPT launched. Software's job slump has fallen hardest on the youngest, though, as below, the public survey data is too thin to confirm it.

## What these numbers are

The chart counts people on payrolls at firms that use ADP, in the software developer occupation. Erik Brynjolfsson, Bharat Chandar and Ruyu Chen at Stanford built it for their paper ["Canaries in the Coal Mine?"](https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf) and publish the index on a [public dashboard](https://digitaleconomy.stanford.edu/project/indicators/canaries-dashboard/).

It measures employment, not hiring, and age, not seniority. For 22-to-25-year-olds it is the nearest thing to entry-level hiring the data offers. Their base month, November 2022, sits on the young group's peak. Measured from September 2021 instead, 22–25 is down 8.7% and 41–49 up 31.0%: still the only group below where it started.

## Ads fell first

![US job postings on Indeed, software development and all postings, weekly, February 2020 to October 2026, indexed to 1 February 2020 = 100. Software postings peak at 233.4 on 26 February 2022, are at 143.2 on 26 November 2022, four days before ChatGPT launched, reach a low of 61.1 on 17 May 2025 and stand at 78.3 on 2 October 2026. All postings end at 103.8. Dashed lines mark the Federal Reserve's first rate rise on 16 March 2022 and ChatGPT's launch on 30 November 2022.](junior-dev-hiring-postings.svg)

Job ads for software developers on Indeed peaked in February 2022 at more than twice their pre-pandemic level, and fell by two-thirds. On 2 October 2026 they stood at **78.3**, about a fifth below February 2020, while all postings stood at **103.8**.

About half of that fall happened before ChatGPT existed, so AI tools cannot explain it. The rest, including every point below the pre-pandemic level, came after.

![Change in Indeed job postings from each series' peak to 2 October 2026, in six countries. Software development postings fell between 61% and 71%: Germany 71%, United States, United Kingdom and Canada 66%, France 62%, Australia 61%. All postings fell between 33% and 60%: Germany 40%, United States 36%, United Kingdom 60%, Canada 42%, France 52%, Australia 33%.](junior-dev-hiring-countries.svg)

In all six countries for which Indeed publishes software data, ads fell by roughly two-thirds from their peak, more than ads overall. The US drop, 66%, is the same as Britain's and Canada's and smaller than Germany's.

Software postings have partly recovered since May 2025. The youngest developers have not. Indeed's economists find 71% of the increase over the following year was for [senior roles](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/), and in early 2026 just 4.5% of software postings [were entry-level](https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/).

## The survey that can't confirm it

![Share of employed US software developers aged 22–25 in the Current Population Survey, twelve months to September, 2021 to 2026: 8.2%, 8.1%, 8.5%, 7.9%, 9.1% and 7.1%. About 159k, 166k, 179k, 163k, 201k and 174k young developers a month, out of 1.9m rising to 2.5m in all. Each year rests on 369 to 521 survey responses.](junior-dev-hiring-survey.svg)

The government's own household survey is too small to settle this. Its share of software developers aged 22 to 25 was **7.1%** in the year to September 2026, the lowest in six years, but it was **9.1%** the year before. The number of young developers has not fallen. They have just not grown with the rest. The Stanford authors note their pattern is "more pronounced in the ADP analysis sample than in national survey benchmarks". The strongest age evidence comes from one payroll company's clients.

## Why, according to others

The data shows when and to whom, not why.

- **AI coding tools.** The Stanford authors find young workers in AI-exposed jobs well behind their peers, but call their results descriptive, "rather than causal estimates". [Hosseini and Lichtinger](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5425555) find junior employment falls at firms that adopt generative AI. The [Yale Budget Lab](https://budgetlab.yale.edu/research/evaluating-impact-ai-labor-market-current-state-affairs) finds no "discernible disruption" in the wider labour market.
- **Over-hiring and interest rates.** Iscenko and Curto Millet of the [Economic Innovation Group](https://eig.org/wp-content/uploads/2026/01/TAWP-Iscenko-Millet.pdf) blame "the sharpest monetary policy tightening cycle in four decades". The timing fits: postings turned weeks before the Fed's first rise.
- **Section 174.** From 2022 US firms had to spread software development costs over five years instead of deducting them at once ([Congressional Research Service](https://www.everycrsreport.com/reports/IN11887.html)), until a 2025 law restored it for work done in the US. Evidence that it cut hiring is [anecdotal](https://blog.pragmaticengineer.com/section-174/), and the data shows no US-specific extra drop.
- **Offshoring.** No systematic evidence found either way.

Recent computer science graduates had an unemployment rate of 7.0% in 2024, against 4.2% for all recent graduates ([New York Fed](https://www.newyorkfed.org/research/college-labor-market)).

## How this was made

Four sources, snapshotted on 10 October 2026 with fetch scripts and provenance in [`junior-dev-hiring-src/`](junior-dev-hiring-src/PROVENANCE.md): Indeed Hiring Lab's [job postings data](https://github.com/hiring-lab/job_postings_tracker) (CC BY 4.0), Stanford's index, Census survey microdata for every month since January 2020 (aggregated by [`fetch-cps.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/junior-dev-hiring-src/fetch-cps.mjs)) and the New York Fed's graduate data. [`junior-dev-hiring-make-charts.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/junior-dev-hiring-make-charts.mjs) builds the charts; re-running it reproduces them exactly. [`DATA.md`](junior-dev-hiring-src/DATA.md) lists what was searched and what could not be had.

## Friction notes

- **The obvious sources have no age split.** Indeed's open data has none; BLS tables refused automated download; the Census API needs a key. The age evidence came from Stanford's public index and from CPS microdata processed here.
- **The Census server refused two fixed-width files** with a "Request Rejected" page and status 200; the CSV versions of the same months worked.
- **The source's base month flattered the story.** The outline review caught it; the September 2021 comparison is on chart 1.
- **Licence:** Stanford's index has no stated licence. Check before publishing it as data.
- **Exempt numbers** (not on a chart):
  - 71%: attributed Indeed Hiring Lab figure
  - 4.5%: attributed Indeed Hiring Lab figure
  - 7.0%: attributed New York Fed figure
  - 4.2%: attributed New York Fed figure
- **Author's voice pass: outstanding.** This prose is an AI draft rendered from the approved outline.
