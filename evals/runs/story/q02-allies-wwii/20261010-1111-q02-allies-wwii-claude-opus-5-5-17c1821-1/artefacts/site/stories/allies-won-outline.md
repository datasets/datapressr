---
title: "Outline: Why the Allies Won the Second World War"
description: "Argument, beats, numbers and chart plan for a data story on munitions, GDP, the Soviet–German balance and the cost in lives, 1938–45."
---

# Outline: Why the Allies Won the Second World War

The prose (`allies-won.md`) is a rendering of this outline. If the prose drifts from the argument here, the prose is wrong.

Location: `site/stories/` (DataPressr default). Sources and derivation: [`allies-won-src/`](allies-won-src/) ([DATA.md](allies-won-src/DATA.md), [PROVENANCE.md](allies-won-src/PROVENANCE.md)).

## The argument, in one sentence

From 1942 to 1944 the Allies built three to three and a half times the Axis's munitions out of economies about twice the Axis's size, and that measurable gap in capacity is the data's answer to why they won, but size was not everything: the Soviet Union out-built Germany in 1942 with two-thirds of its GDP, and the Soviet Union and China paid most of the cost in lives.

## What this story is about, and what it is not

About: the resources each coalition had (GDP), what it made of them (munitions), the Soviet–German balance where most of the land war was fought, and who died. The data shows **capacity and cost**. It does not show how the capacity was used.

Not about: strategy, command, intelligence (codebreaking), technology and weapon quality, morale, the timing of decisions, or luck. None of these is in the data, so the story makes no claim about them, and it says so. It is not about the wrangling either (one paragraph at the end).

Not covered: oil and raw materials. The only country-by-country table found (Wikipedia, "Military production during World War II") is mostly marked "citation needed", and no better source was reachable in this run (see `allies-won-src/DATA.md`). The story names oil as a gap in its evidence and gives no number for it.

Not tested here: *why* the Allies converted GDP into munitions faster, why Soviet output held up in 1942, or how much Lend-Lease mattered. Those are attributed to Harrison (1988) below.

## Argument, in order

1. **The finding: the Allies out-built the Axis three to three and a half times over, 1942–44.** Combat munitions output, $ billion a year at US 1944 munitions prices (Goldsmith 1946, as tabulated in Harrison 1988 table 1). Allies = USA + Canada + UK + USSR; Axis = Germany + Japan (Italy is not in Goldsmith's table).
   - 1942: Allies $41.5bn, Axis $11.5bn (3.61×). 1943: $64.5bn vs $18.0bn (3.58×). 1944: $70.5bn vs $23.0bn (3.07×).
   - 1944 Allied total by country: USA $42bn, USSR $16bn, UK $11bn, Canada $1.5bn. The US alone out-built the Axis from 1942 ($20bn vs $11.5bn).
   - **Weakening:** before the war the Axis was ahead: 1935–39 average $2.8bn a year vs $2.4bn (0.86×). In 1940 the Allied total ($10bn vs $7bn, 1.43×) counts the USA and USSR, which were not at war; in 1941 (2.50×) it counts the USA for a year it was at war for three weeks and the USSR for a year it was at war from June. The gap is a 1942–44 phenomenon.
   - **Weakening:** the ratio narrowed between 1943 and 1944 (3.58× → 3.07×) as German output rose from $13.5bn to $17bn.
2. **What we are looking at.** Goldsmith was formerly head of the economics and planning division of the US War Production Board; his table is a 1946 estimate by value, so a heavy tank counts for more than a light one. Harrison (1988) reproduces it and refers readers to a separate appendix on how reliable the Soviet estimate is. Values are at a single price set (US 1944 munitions prices), so years and countries are comparable in volume, not in what each economy paid.
3. **The economies behind it: about twice the Axis's size, three times by 1944.** GDP, $ billion at 1990 international dollars (Harrison 1998 table 1-3, the author's corrected spreadsheet). Harrison's coalition totals: Allies = USA, UK, USSR, France (1938–40, 1945), Italy (1944–45); Axis = Germany, Austria, Italy (to 1943), Japan, occupied France (1940–44).
   - 1942: Allies $1,862bn, Axis $903bn (2.06×). 1944: $2,325bn vs $748bn (3.11×). 1945: 5.03×.
   - The munitions gap (3.61× in 1942) was wider than the GDP gap (2.06×): on these figures the Allies turned a larger share of a larger economy into weapons. The two coalition definitions differ (Goldsmith has no Italy or France), so check on a matched set: 1942 Allied GDP (USA + UK + USSR, $1,862bn) over Germany + Austria + Japan ($641bn) is 2.90×, still below the munitions ratio of 3.61×. The matched-set ratio is a check for this outline, not a charted number; the prose does not cite it.
   - **Weakening:** the GDP ratio *fell* from 2.38× in 1938 to 1.97× in 1941, because Harrison counts occupied France on the Axis side from 1940 and Soviet GDP fell from $417bn (1940) to $274bn (1942) under invasion. Harrison's 1938–41 Allied totals count the USA and USSR before they joined: those years show potential, not belligerents.
   - **Second estimate (disagreement shown):** for a fixed set, US + UK GDP over Germany + Italy + Japan GDP, Harrison 1998 gives 2.02× in 1942 and the Maddison Project Database 2023 (2011 international dollars, via Our World in Data) gives 2.12×. Across 1938–43 the two differ by 0.15 or less (largest gap 1938: 1.58× vs 1.73×). MPD 2023 has no Soviet GDP for 1941–45, so the cross-check cannot include the USSR.
4. **The wrinkle: size was not everything.** USSR ÷ Germany, 1942 and 1944.
   - 1942: GDP 0.66× ($274bn vs $417bn); armed forces 1.35× (11.34m vs 8.41m); munitions by value 1.35× ($11.5bn vs $8.5bn); combat aircraft 1.87× (21.7k vs 11.6k); tanks and self-propelled guns 3.94× (24.4k vs 6.2k).
   - **Sources disagree on how far ahead:** by value (Goldsmith) the USSR out-built Germany 1.35× in 1942; by count of tanks (Harrison, from the Soviet official history) 3.94×. A count does not weigh a heavy tank against a light one; value does. Both are on the chart.
   - **Weakening:** by 1944 Germany had caught up: munitions by value 0.94× ($16bn vs $17bn), combat aircraft 0.97× (33.2k vs 34.1k), tanks 1.58×. By then the Allied margin came from the United States.
5. **The cost: among the ten countries charted, most of the dead were in Allied countries, above all the USSR and China.** Their totals include civilians killed by occupation, genocide, famine and disease, not only the cost of fighting. Deaths, millions, low and high estimates as compiled in Wikipedia's "World War II casualties" table (revision of 2026-09-26), each end with its cited source.
   - Soviet Union: military 8.7m (Krivosheev) to 11.4m (Hartmann); total 20m (Zemskov) to 27m (Andreev et al.).
   - China (1937–45): total 14m to 20m; military 2.0m to 3.75m.
   - Germany: military 4.4m (Statistisches Jahrbuch 1960) to 5.3m (Overmans 2000); total 6.9m to 7.4m.
   - Japan: total 2.5m to 3.1m. Poland: total 5.9m to 6.0m.
   - USA: military 0.41m; UK: military 0.38m.
   - **Disagreement shown:** the gap between the low and high Soviet military estimates (2.7m) is larger than the combined military deaths of the USA, UK and France (1.0m).
   - **Not a measure of contribution:** deaths measure cost, not who did most to win; a low death count can reflect a long supply line and an ocean, not a small effort.
6. **What the data does not test.** Strategy, command, codebreaking, technology, morale and luck are not in it. Goldsmith himself framed his table this way: "whatever may have saved the United Nations from defeat in the earlier stages of the conflict, what won the war for them in the end was their ability to produce more, and vastly more, munitions than the Axis" (quoted in Harrison 1988, postprint p. 3). The data covers the second half of that sentence, not the first: it cannot say why the Axis's early advantage (1939–41) did not win the war before the gap opened.
7. **How this was made.** Sources snapshotted in `allies-won-src/`; `derive.mjs` builds the tidy CSVs; `allies-won-make-charts.mjs` builds the charts from them, no network. Re-running reproduces every number.

## Outside context (attributed, not tested by this data)

- **Eastern front share.** Harrison (1988, postprint pp. 24–25): from June 1941 to January 1944 the Soviet armed forces "always faced at least 90 per cent of Germany's frontline ground forces". Source: [Harrison 1988 postprint](https://warwick.ac.uk/markharrison/public/ehr88postprint.pdf).
- **Lend-Lease.** Harrison (1988, p. 23): Lend-Lease "may have supplied resources equal to one-sixth of Soviet NNP" in 1943–44, and Lend-Lease to Britain was about 15 per cent of US military spending. So the Soviet munitions column is not all Soviet effort.
- **Mechanism for converting GDP into munitions** (mobilisation policy, labour, planning): Harrison (1988, 1998). Not tested here.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | `allies-won-munitions.svg`: munitions output per year, one stacked bar per coalition per period | `allies-won-src/transcribed/goldsmith-1946-munitions-via-harrison-1988-table1.csv` (`country`, `period`, `munitions_usd_bn_1944_prices`); totals and ratio from `tidy/munitions-by-coalition-goldsmith-1946.csv` (`allies_usd_bn_1944_prices`, `axis_usd_bn_1944_prices`, `allies_to_axis`) | Periods are ordinal: "1935–39 avg." then 1940…1944; no time axis, so the average is not mistaken for a year. Each period: two bars (Allies, Axis), stacked by country, Allies in blues, Axis in greys. Total label on each bar, "N.N×" ratio above each pair, read from the tidy CSV. Country labels on the 1944 segments. Note on chart: "USA and USSR counted before they entered the war (Jun/Dec 1941); Italy not in source". Y from 0, must include 70.5. Canada is 0 in 1935–39 and 1940: plotted as zero height (it is a real 0 in the source, not missing). | Beat 1 (headline) |
| 2 | `allies-won-gdp.svg`: Allied and Axis GDP, 1938–45 | `tidy/gdp-coalition-totals-harrison-1998.csv` (`year`, `allies_gdp_bn_1990_intl_usd`, `axis_gdp_bn_1990_intl_usd`, `allies_to_axis`); cross-check text from `tidy/gdp-us-uk-vs-axis-two-sources.csv` (`source`, `year`=1942, `ratio`) | Year axis as integers 1938–45 (annual figures, plotted as points joined by lines). Ratio labels at 1938, 1941, 1942, 1944, 1945 read from rows. Light band over 1938–41 labelled "USA, USSR counted before entering the war". Annotation: "Same countries, two estimates, 1942: US+UK ÷ Germany+Italy+Japan = 2.02× (Harrison 1998), 2.12× (Maddison 2023)". Y from 0, includes 2,342. Different price bases are never put on the same axis: only the ratios from MPD appear. | Beat 3 |
| 3 | `allies-won-ussr-germany.svg`: USSR ÷ Germany on five measures, 1942 and 1944 | `tidy/ussr-vs-germany.csv` (`measure`, `year`, `ussr`, `germany`, `ussr_to_germany`) | Dot plot, one row per measure, x = ratio (linear, 0 to 4.2), a dot per year (1942 red, 1944 dark grey), joined by a thin rule; reference line at 1.0 labelled "parity". Each dot labelled with its ratio; the 1942 row labels include the two raw values (e.g. "24.4k vs 6.2k"). Row order: GDP, armed forces, munitions value, aircraft count, tank count, so value and count sit next to each other. | Beat 4 |
| 4 | `allies-won-deaths.svg`: war deaths by country, low and high estimates | `tidy/deaths-wikipedia-2026-09.csv` (`country`, `side`, `measure`, `low`, `high`) | Horizontal range bars, millions, one row per country (10), ordered by total high. Two bars per row: total (light) and military (dark), each spanning low→high; a single-value estimate is drawn as a tick. Labels at the high end ("20–27m"). Side shown in the row label ("Germany (Axis)"). X from 0 to 28. | Beat 5 |

## Voice

Follow `skills/story/references/voice-guide.md`. The author's voice pass is separate and outstanding.

## Friction notes

- **Review:** self (blind run, no reviewer available). Verdict and reproduced numbers are recorded in the review section below.
- No "finished dataset" existed; the story's data was found, snapshotted and derived inside `allies-won-src/`. The skill assumes a structured dataset upstream; open-data mode needs DATA.md and a derive script as well.
- Two sources needed tools outside plain Node: the `.xls` (SheetJS 0.18.5, the last npm release, used once to export one sheet to CSV) and a PDF table (transcribed by hand from `pdftotext` output). The Maddison Excel file was unreachable (object store blocked); OWID's copy was used.
- Coalitions are defined differently by each source (Goldsmith has no Italy; Harrison's GDP totals count the USA and USSR before they entered and move France and Italy between sides). The outline keeps each source on its own chart rather than mixing them.

## Outline review log

Reviewer: **review: self (blind run, no reviewer available)**. The author ran the skill's step-2 checklist against each committed revision. This log was appended after approval, so it is not part of the approved revision's hash.

**Reader questions** (written before rereading the outline):

1. Was it simply that the Allies were bigger? — *answered* (beats 1, 3, 4: bigger, converted more, and the USSR out-built a richer Germany in 1942).
2. When did the gap open; was the Axis ever ahead? — *answered* (1935–39 average 0.86×; gap from 1942; GDP ratio dipped to 1.97× in 1941).
3. Who carried the Allied side, the US or the USSR? — *partly answered* (1944 munitions by country; Soviet–German balance; eastern-front share and Lend-Lease are attributed context, not data).
4. Do the sources agree? — *answered* (two GDP estimates; value vs count for Soviet output; casualty ranges).
5. What did it cost, and who paid? — *answered* (beat 5).
6. Oil and raw materials? — *missed in round 1*; now *answered as a stated gap* (no sourced series; DATA.md).
7. Strategy, leadership, codebreaking, luck? — *answered* (beat 6: not tested, and why).
8. How much did Lend-Lease matter? — *partly answered* (attributed to Harrison 1988, not tested).

**Round 1** — revision `7e4b4d3`, `allies-won-outline.md` SHA-256 `906a4887ea4518dbc4783c1c0e68c726f2c36cfd18c5d84660114f8ac035a1f9`. Verdict: corrections.
1. Beat 3: "turned a larger share … into weapons" compared coalitions defined differently; add a matched-set check (USA+UK+USSR GDP ÷ Germany+Austria+Japan GDP, 1942 = 2.90×, still below munitions 3.61×).
2. Beat 2: Goldsmith's post was "formerly head of the economics and planning division", per Harrison.
3. Beat 5: "did most of the dying" framed genocide and famine victims as a cost of winning; rephrase.
4. Reader question 6 (oil) missed; state it as a gap with the reason.

**Round 2** — revision `fd14773`, SHA-256 `40e333cea41c933ae9dadb4ae8343454debc4f1c131baab4dea7ceba29f95358`. Verdict: corrections.
1. "About 3.5 to 1 from 1942" overstates 1944 (3.07×): say "three to three and a half times, 1942–44".
2. Beat 3 weakening gave a mechanism; restate as what the table does (occupied France counted as Axis from 1940; Soviet GDP $417bn in 1940 → $274bn in 1942).
3. Beat 5 headline: "among the ten countries charted".

**Round 3** — revision `eb91cdc`, SHA-256 `7364e276e54044ddd5371782672bd9f3e27c910680debfb069f72b597ffa9f6d`. Verdict: **APPROVED**.

**Numbers reproduced** independently of `derive.mjs` (awk over `raw/harrison-1998-chapter_1_tables.Tables.csv` and `raw/owid-gdp-maddison-project-database-2023.csv`; `pdftotext` of the Harrison 1988 postprint for table 1; wikitext rows for deaths):
- Goldsmith table 1: transcription matches the PDF text row for row. Allies/Axis: 1935–39 2.4/2.8 = 0.857; 1940 10.0/7.0 = 1.429; 1941 20.0/8.0 = 2.500; 1942 41.5/11.5 = 3.609; 1943 64.5/18.0 = 3.583; 1944 70.5/23.0 = 3.065.
- Harrison table 1-3: Allied total 1938 1,629.116; 1941 1,797.659; 1942 1,862.333; 1944 2,324.676; 1945 2,341.638. Axis total 685.813; 910.968; 902.822; 747.655; 465.796. Ratios 2.375, 1.973, 2.063, 3.109, 5.027. USSR 1940 417.038, 1942 273.901; Germany 1942 417.349 → 0.656.
- Fixed set 1942: Harrison (1,235.499 + 352.933) ÷ (417.349 + 27.195 + 145.079 + 196.838) = 2.020; MPD (2,013.171 + 589.318) ÷ (648.060 + 209.764 + 370.534) = 2.119. 1938: 1.581 vs 1.730.
- Harrison tables 1-5 and 1-6, USSR ÷ Germany: forces 1942 11,340/8,410 = 1.348, 1944 12,225/9,420 = 1.298; tanks 24.4/6.2 = 3.935, 29/18.3 = 1.585; aircraft 21.7/11.6 = 1.871, 33.2/34.1 = 0.974; munitions value 11.5/8.5 = 1.353, 16/17 = 0.941.
- Deaths: Soviet military 8,668,000–11,400,000 (gap 2,732,000); US + UK + France military 407,300 + 383,700 + 210,000 = 1,001,000.
