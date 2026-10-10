---
title: "Outline: Heat Is the Quiet Killer"
description: The skeleton for the heat story — argument, order, key numbers and chart plan, reviewed before any prose.
---

# Outline — Heat Is the Quiet Killer

*The skeleton. Prose is a rendering of this; if the prose drifts from the argument here, the prose is wrong.*

*From bead `datapressr-7q5.4`. Draws on [`us-natural-hazard-statistics`](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/us-natural-hazard-statistics) (NWS annual *Summary of U.S. Natural Hazard Statistics*, 1997–2025) and, for the wrinkle, the NWS's own per-state heat summaries, snapshotted in [`heat-quiet-killer-src/`](heat-quiet-killer-src/PROVENANCE.md). Files in `site/stories/`. Revision 2, after outline review round 1 (see the end).*

## The argument, in one sentence

Heat tops the National Weather Service's count of US weather deaths for 1997–2025 — **5,366** deaths, **2.5 times** tornadoes — but that ranking measures what reaches the count as much as what kills: Arizona barely entered it before 2019, and in 2006–2010 death certificates recorded about **five times** as many heat deaths as the NWS count, and cold deaths at twice the rate of heat deaths.

## What this story is about

Heat leads the NWS's weather-death ranking. The story shows *that* it leads, and *how much* of the ranking depends on who reports a death to the weather service. Every gap found pushes the NWS count *down*: heat is undercounted, and cold (849 deaths in the NWS count, 7th) is undercounted far more — on death certificates cold outnumbers heat about two to one, in 2006–2010 and over 1999–2022/23. So the claim the data supports is "heat is the deadliest hazard *in the NWS's record*", not "heat is the deadliest weather hazard" full stop.

It does **not** say heat deaths are rising: the NWS series jumps in 2019–2020 mostly because Arizona's deaths start appearing in it, so it cannot carry a trend. It does not explain *why* heat kills (age, housing, air conditioning), and it is not about the PDF wrangling.

The seed claim, "more than tornadoes and flash floods combined", is true in the totals (5,366 vs 4,182) but rests on Arizona: without Arizona, heat is 3,376, still the largest single cause but short of the pair. The story says so.

## Argument, in order

1. **The chart, first.** Total deaths by hazard, 1997–2025, NWS attribution. Heat **5,366**; tornado **2,167**; flash flood **2,015**; tropical storm / hurricane **1,505**; rip current **1,438**; lightning **893**; cold **849**; thunderstorm wind **842**. Heat is **2.5×** tornadoes and **1.3×** tornadoes and flash floods combined (**4,182**). All three flood types together (flash, river, small stream/urban) are 2,673, still below heat. All hazards: **18,867**, so heat is **28%** of the record's weather deaths.
2. **What you're looking at.** The NWS compiles these from *Storm Data*, which local forecast offices fill in event by event; each death is attributed to one event type (direct or indirect). The NWS's own hub page says the CDC, not the NWS, is the official source of cause of death. Damage is not used (heat's damage is near zero, and all damage in the dataset is nominal, never inflation-adjusted). The source says hurricane rows count wind only, with surge and flood deaths booked elsewhere — but 2005's row holds **1,016** deaths (Katrina), so that rule was evidently not applied that year.
3. **What it says.**
   - Heat is the single deadliest hazard in **19 of 29** years (1998–2002, 2006, 2007, 2010, 2012, 2013, 2016–2024).
   - Not one heatwave: the largest year is 2023 (**555**); 1999 (**502**, 60% of it Illinois, Pennsylvania and Missouri per the NWS heat summary) is the only pre-2019 year above 300.
4. **The wrinkle: the count depends on who reports.** A heat death enters *Storm Data* when a medical finding reaches the local forecast office, and generally only when conditions met that office's own heat-advisory or warning threshold; an Excessive Heat death below the threshold goes only into a narrative (a Heat entry below advisory criteria is allowed for a directly related death in unseasonable warmth) ([NWS Instruction 10-1605](https://www.weather.gov/media/directives/010_pdfs/pd01016005curr.pdf), the July 2021 version; 1997–2020 entries were made under earlier versions). So coverage varies by place and year.
   - **Arizona.** The NWS's per-state heat summaries show Arizona at **0–9** heat deaths a year in 1997–2018 except **51** in 2005, then **143** in 2019, **337** in 2020 and **448** in 2023. Arizona is 3% of NWS heat deaths in 1997–2018 and 78% in 2019–2024 (**1,855** of **2,379**). In 2020 the rest of the country logged **13**. Arizona's deaths did not begin in 2019: Maricopa County alone confirmed at least 150 heat deaths in 2016 (preliminary at the time; the county's final figure is 154) ([Maricopa County Department of Public Health, reported by the US Climate and Health Alliance](https://usclimateandhealthalliance.org/post_resource/pheonixs-heat-killed-more-people-in-2016-than-ever-before)), when the NWS count for all of Arizona was 9; and 645 in 2023 ([Maricopa County](https://www.maricopa.gov/CivicAlerts.aspx?AID=3222)), more than the NWS's whole-US 555. Arizona's deaths began entering *Storm Data* consistently in 2019 (the 51 in 2005 is the one earlier exception); why is not documented in any source found.
   - **Not only Arizona.** Nevada goes from 0–3 a year in 1997–2006 to 5–23 in 2007–2012 and 12–81 in 2013–2018; Oregon logs 119 in the 2021 heat dome. The prose names these states without numbers (they are not charted).
   - **Consequence for the seed claim.** Arizona's 1997–2025 total is **1,990**. Heat without Arizona is **3,376**: above tornadoes (2,167) and flash floods (2,015) separately, below the two combined (4,182). "More than tornadoes and flash floods combined" holds in the record as published, and only because Arizona's deaths entered it.
   - **Death certificates, heat and cold.** For 2006–2010, NCHS counted **3,332** heat-related and **6,660** cold-related deaths on death certificates (underlying or contributing cause; [Berko et al., NCHS National Health Statistics Report 76, 2014](https://www.cdc.gov/nchs/data/nhsr/nhsr076.pdf)). The NWS counted **612** heat and **160** cold deaths in the same years: in 2006–2010 death certificates show **5.4×** the heat count and **42×** the cold count, and twice as many cold deaths as heat deaths. The pattern persists: CDC death-certificate data count 40,079 deaths with cold as underlying or contributing cause in 1999–2022 (X31, T68, T69; [Liu et al., *JAMA* 2024](https://jamanetwork.com/journals/jama/fullarticle/2828342)) against Howard et al.'s 21,518 heat deaths in 1999–2023 (X30, T67, P81) — different code sets and a one-year difference in period, so a rough ratio, about 1.9 to 1. Different definitions (a contributing cause on a certificate is not an attribution to a weather event), so this is not a correction to the ranking — but it shows the ranking is of NWS attributions, and that heat's lead over cold does not survive a change of source.
   - **Other numbers that cut against the headline.** 2025 (preliminary): heat **100**, flash flood **209**, so heat is second that year. Tornadoes lead in 2008 and 2011 (**553** in 2011). Hurricanes are undercounted too: the 2017 hurricane row (the year of Hurricane María) has **43** deaths, against an estimated 2,975 excess deaths in Puerto Rico from September 2017 to February 2018 ([George Washington University, "GW Researchers: 2,975 Excess Deaths Linked to Hurricane Maria", 2018](https://gwtoday.gwu.edu/node/9876)); excess deaths are not attributions, so this is a contrast, not a correction.
5. **Outside context (one line, attributed).** On death certificates, heat deaths rose 16.8% a year from 2016 to 2023 after no significant change in 1999–2016, reaching 2,325 in 2023 ([Howard et al., *JAMA* 2024](https://jamanetwork.com/journals/jama/fullarticle/2822854)). This data does not test that trend; the NWS series' rise is mostly Arizona entering it.
6. **How this was made.** Dataset and `build.ts`; per-state heat PDFs snapshotted with hashes in `heat-quiet-killer-src/` and cross-checked against the dataset's heat row on every build; `heat-quiet-killer-make-charts.mjs`.

## Outside context

- NWS Instruction 10-1605 (Storm Data preparation, July 2021), Heat and Excessive Heat sections — the threshold rule.
- Berko J, Ingram DD, Saha S, Parker JD, "Deaths attributed to heat, cold, and other weather events in the United States, 2006–2010", NCHS National Health Statistics Reports 76, July 2014 — 3,332 heat, 6,660 cold (Table 1).
- Howard JT, Androne N, Alcover KC, Santos-Lozada AR, "Trends of Heat-Related Deaths in the US, 1999–2023", *JAMA* 2024;332(14):1203–1204 — 21,518 in 1999–2023, the post-2016 trend and 2,325 in 2023.
- Liu et al., cold-related mortality in the US 1999–2022, *JAMA* research letter, online December 2024, *JAMA* 2025;333(5):427–429 (doi:10.1001/jama.2024.25194) — 40,079 deaths with cold as underlying or contributing cause.
- Maricopa County Department of Public Health — at least 150 in 2016 (preliminary, as reported then; final 154), 645 in 2023.
- George Washington University Milken Institute SPH, 2018 — María excess deaths, 2,975.

None of these is tested by the NWS data.

## Chart plan

| # | Chart | Data (resource + fields) | Transform, gaps, dates | Purpose |
|---|---|---|---|---|
| 1 | Horizontal bars, deaths 1997–2025 by hazard, top 8, sorted. Heat bar split into "other states" (3,376) and "Arizona" (1,990). Dashed vertical rule at 4,182 labelled "Tornado + flash flood combined". Direct value labels on every bar; "2.5× tornadoes" on heat. | `hazard-statistics.csv` (`hazard_id`, `hazard`, `is_total`, `fatalities`); `heat-quiet-killer-src/heat-deaths-arizona.csv` (`year`, `heat_all_states`, `arizona`) | Sum `fatalities` by `hazard_id` over event rows only (`is_total` false), all 29 years. Labels from the most recent spelling of `hazard`, sentence case; the hurricane bar is labelled "Tropical storm / hurricane" with no "wind only" claim (the caveat goes in prose and alt text). Arizona split from the src CSV; the build throws unless each year's `heat_all_states` equals the dataset's heat row. x from 0. | Beats 1 and 4: heat leads; the combined margin depends on the Arizona segment. |
| 2 | Stacked bars per year 1997–2025, heat deaths: Arizona (red) and all other states (grey). Annotate 2005 (AZ 51), 2019 (AZ 143 of 187), 2020 (13 outside Arizona), 2023 (AZ 448 of 555), 2025 "preliminary". Direct colour key. | `heat-quiet-killer-src/heat-deaths-arizona.csv` | other = `heat_all_states` − `arizona`. Year as a band. 29 rows, no missing years (checked). y from 0, domain above 555. | Beat 4: the post-2019 rise is Arizona entering the count. |
| 3 | Paired horizontal bars, titled with the period 2006–2010: heat and cold, each as NWS *Storm Data* vs death certificates (NCHS). Labels: heat 612 vs 3,332 (5.4×); cold 160 vs 6,660 (42×). | `hazard-statistics.csv` (`hazard_id` heat and cold, `fatalities`, 2006–2010) for NWS; 3,332 and 6,660 as attributed constants (Berko et al. 2014, Table 1) | NWS = sum of event-row `fatalities` for `heat` and `cold`, 2006 ≤ year ≤ 2010 (5 rows each, checked). Ratios computed in the script. Same five years on both sides. x from 0, domain above 6,660. | Beat 4: the NWS count is a floor for heat and a much lower floor for cold; on death certificates cold outnumbers heat. |

All values on charts are read from rows at build time except the two attributed NCHS constants.

## Reader questions (written before the outline)

1. Is heat really the top killer, or is that one bad year? — answered (19 of 29 years; chart 1).
2. How does it compare to tornadoes, floods, hurricanes, cold? — answered (chart 1; floods grouped; hurricane and cold undercounts; chart 3).
3. Is it getting worse? — partly: the NWS series cannot say (Arizona); attributed death-certificate trend.
4. Who dies, and where? — partly: Arizona dominates the recent count, Nevada and Oregon named; age and sex not used (65% of 2023's NWS heat deaths have unknown age).
5. How are heat deaths counted, and why might they be missed? — answered (threshold rule, local reporting, death-certificate comparison).
6. Why "quiet"? — answered: little damage, no single dramatic event, and counted only when reported; cold is quieter still.
7. What can be done? — set aside; out of reach of this data.

## Voice

Plain, per [the voice guide](https://github.com/datasets/datapressr/blob/main/skills/story/references/voice-guide.md). "Quiet" is the title's label, earned by the counting argument, not by adjectives. State ratios, not two numbers side by side. The author's voice pass is separate and outstanding.

## Outline review

- **Round 1** — independent AI reviewer (Claude subagent, no hand in the outline), revision SHA-256 `41b9acb3…aaa316` at HEAD `d81b59b` (uncommitted). Reproduced every number (40-odd, all pass except "64% unknown age", which is 65%), re-extracted all 29 heat PDFs independently, and returned corrections, not approval: (1) death certificates rank cold above heat, and the outline applied the comparison to heat only; (2) "its deaths started reaching this count" needed attributed pre-2019 Arizona evidence and "improved" asserted a mechanism; (3) the threshold rule was overstated and dated; (4) Nevada, Oregon and the 2020 figure of 13 outside Arizona (the reviewer's round-1 Nevada range was itself wrong, corrected in round 2); (5) the hurricane label contradicted the 2005 note; (6) 65% not 64%; (7) an unverifiable link; (8) floods grouped. All eight are addressed in this revision; the argument sentence changed (1).
- **Round 2** — same reviewer, revision SHA-256 `175f1b56…7129a`. All new numbers reproduced (NWS 2006–2010 heat 612 and cold 160; Berko Table 1 re-fetched, identical PDF; 5.4×, 42×, 2.00; floods 2,673; Arizona 2.9% of 1997–2018; 13 outside Arizona in 2020; Oregon 119; Howard 2,325). Corrections: (1) Nevada pre-2013 range wrong; (2) date the cold-vs-heat claim to 2006–2010 and corroborate it persists (Liu et al. 2024); (3) revert to the indexed GWU link. Nits: "consistently" for Arizona given 2005's 51; Maricopa final 154; smoother wording. All addressed in revision 3.
- **Round 3** — same reviewer: **APPROVED with nits**, revision SHA-256 `ac72d34e208d75bf07ec97ebbee743bbb7a877599481e26aa406a67283fba608` at HEAD `20ae14b` (uncommitted). Re-checked the Nevada ranges against its own extraction, Liu et al. on the JAMA page (40,079; 40,079 / 21,518 = 1.86), the GWU link and title, and every round-1 and round-2 number. Two optional nits (Liu print citation; "as the NWS count" in the argument sentence) applied after approval, wording only.

## Friction notes

- The seed claim was true and fragile: verifying it needed a second NWS source (per-state heat PDFs) the dataset deliberately did not extract. The README lists those menus as "real follow-ups"; this story is a reason to do one.
- The reviewer's best catch was a comparison applied to one side only (death certificates for heat but not cold). Worth a line in the skill: when you bring in a second source to correct one category, apply it to the competing categories too.
- The dataset says hurricane rows are wind only (the hub page's words), but 2005's row carries 1,016 deaths, which suggests Katrina's surge deaths were booked there. Worth a line in the dataset README.
- The coordinator's brief named a `pattern-library.md` reference; no such file exists in the repo (the craft is in `references/story-craft.md`).
