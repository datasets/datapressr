---
title: "Why the Allies Won the Second World War"
description: "From 1942 the Allies built three times the Axis's munitions from twice its economy. The Soviet Union out-built a richer Germany and, with China, bore most of the deaths."
datahub:
  slug: why-the-allies-won
  status: draft
---

# Why the Allies won the Second World War

![Stacked bars of combat munitions output in billions of US dollars at 1944 prices, Allies (USA, USSR, UK, Canada) against Axis (Germany, Japan), 1935–39 average to 1944. The Axis leads before the war, 2.8 to 2.4. From 1942 the Allies lead 41.5 to 11.5 (3.6×), 64.5 to 18.0 in 1943 (3.6×) and 70.5 to 23.0 in 1944 (3.1×).](allies-won-munitions.svg)

From 1942 to 1944 the Allies built three to three and a half times as many munitions as Germany and Japan. That gap in capacity is the numbers' clearest answer to why the Allies won. It is not the whole answer.

## What the chart measures

The estimates are Raymond Goldsmith's, made in 1946. He had headed the economics and planning division of the US War Production Board, and the economic historian Mark Harrison reproduced his table in 1988. It values each country's combat munitions at US 1944 prices, so a heavy tank counts for more than a light one. Italy is not in it, and the USA and USSR are counted in years before they entered the war.

Before the war the Axis was ahead: $2.8bn a year against $2.4bn in 1935–39. In 1942 the Allies produced $41.5bn and the Axis $11.5bn. In 1944 the figures were $70.5bn and $23.0bn. The ratio narrowed to 3.1× in 1944 as German output kept rising.

## The economies behind it

![Lines of Allied and Axis GDP in billions of 1990 international dollars, 1938–45. The Allied line rises throughout; the Axis line peaks in 1941 and falls from 1943. Labelled values: 1,862 against 903 in 1942, 2,325 against 748 in 1944. The Allies-to-Axis ratio is 2.4× in 1938, 2.0× in 1941, 2.1× in 1942, 3.1× in 1944 and 5.0× in 1945. An inset compares two estimates for the US and UK against Germany, Italy and Japan in 1942: 2.02× and 2.12×.](allies-won-gdp.svg)

In 1942 the Allied economies produced $1,862bn and the Axis $903bn, in Harrison's 1998 estimates at 1990 prices: a ratio of 2.1×. By 1944 it was 3.1×. On these figures the munitions gap was wider than the economic gap, so the Allies turned a larger share of a larger economy into weapons.

The ratio was lower in 1941 (2.0×) than in 1938 (2.4×). Harrison counts occupied France on the Axis side from 1940, and Soviet output shrank under invasion. A second estimate agrees closely: for the US and UK against Germany, Italy and Japan in 1942, Harrison's figures give 2.02× and the Maddison Project's 2023 figures 2.12×.

## Size was not everything

![Dot plot of the USSR's output divided by Germany's on five measures. In 1942: GDP 0.66× (274 vs 417 billion dollars), armed forces 1.35×, munitions by value 1.35×, combat aircraft 1.87× (21.7k vs 11.6k), tanks and self-propelled guns 3.94× (24.4k vs 6.2k). In 1944: 0.83×, 1.30×, 0.94×, 0.97× and 1.58×.](allies-won-ussr-germany.svg)

In 1942 the Soviet economy was 0.66× the size of Germany's. It still had 1.35× the troops, 1.87× the combat aircraft and 3.94× the tanks and self-propelled guns. By value the Soviet lead was 1.35×. A count does not weigh a heavy tank against a light one, and value does, so the two sources disagree on how far ahead the USSR was. Both are on the chart.

By 1944 Germany had caught up on munitions by value (0.94×) and combat aircraft (0.97×). By then the Allied margin came from the United States.

Two points from [Harrison's 1988 paper](https://warwick.ac.uk/markharrison/public/ehr88postprint.pdf), not tested here, frame this. From June 1941 to January 1944 Soviet forces faced "at least 90 per cent of Germany's frontline ground forces", and in 1943–44 Lend-Lease may have supplied resources equal to one-sixth of Soviet national product.

## Who paid

![Range bars of war deaths in millions for ten countries, low to high estimate. Soviet Union: 20–27m in all, 8.7–11.4m military. China: 14–20m in all. Germany: 6.9–7.4m in all, 4.4–5.3m military. Poland 5.9–6m. Japan 2.5–3.1m. United States 0.41m military; United Kingdom 0.38m military.](allies-won-deaths.svg)

Most of the dead among these ten countries were in Allied countries, above all the Soviet Union (20m to 27m) and China (14m to 20m). These totals include victims of occupation, genocide, famine and disease, not only soldiers. The estimates disagree widely: Soviet military deaths run from 8.7m (Krivosheev) to 11.4m (Hartmann). That gap is larger than the military deaths of the USA (0.41m), the UK (0.38m) and France (0.21m) combined. Deaths measure cost. They do not measure who did most to win.

## What the data cannot test

Goldsmith put it this way: "whatever may have saved the United Nations from defeat in the earlier stages of the conflict, what won the war for them in the end was their ability to produce more, and vastly more, munitions than the Axis." This data covers the second half of that sentence. It says nothing about strategy, command, codebreaking, weapon quality, morale or luck, or about why the Axis's early lead did not end the war before the gap opened. Oil and raw materials are missing: no well-sourced series by country and year was found for this story.

## How this was made

Sources: Harrison's corrected chapter 1 spreadsheet for *The Economics of World War II* (1998), table 1 of Harrison (1988), the Maddison Project Database 2023 via Our World in Data, and one fixed revision of Wikipedia's "World War II casualties". Each is snapshotted in [`allies-won-src/`](allies-won-src/); [PROVENANCE.md](allies-won-src/PROVENANCE.md) gives URLs and licences, and [DATA.md](allies-won-src/DATA.md) what was searched and rejected. [`derive.mjs`](allies-won-src/derive.mjs) builds tidy CSVs and [`allies-won-make-charts.mjs`](allies-won-make-charts.mjs) draws the charts offline. Re-running both reproduces every number. The [outline](allies-won-outline.md) fixed the argument first.

## Friction notes

- **Review:** self (blind run, no reviewer available). Outline approved at `eb91cdc` after two rounds of corrections (log in the outline). The prose was checked against the outline by the author; see the last item.
- **Charts not inspected visually.** No supported way to rasterise SVG here; each chart was checked from its SVG source (text labels, tick values, `viewBox` 720 wide, label positions computed against line positions). Phone-width rendering is unchecked.
- **Voice pass outstanding.** This is the author's best draft; the human "sounds like me" pass has not happened.
- **Exempt numbers** (not on a chart):
  - 90 per cent: attributed external figure (Harrison 1988)
  - one-sixth: attributed external figure (Harrison 1988)
  - ten: count of countries on the chart
  - three to three and a half: range of the 1942–44 ratios on chart 1 (3.6×, 3.6×, 3.1×), in words
- **Prose vs outline check** (review: self, blind run, no reviewer available; against approved outline `eb91cdc`): every claim maps to an outline beat (1–7). One correction made: the description said the Soviet Union alone "paid most of the cost"; the outline says the USSR and China. Changed the prose of beat 1's 1943–44 narrowing to the outline's wording ("as German output kept rising") rather than a cause. Verdict after those fixes: APPROVED. Removed in drafting: the outline's US-only comparison ($20bn vs $11.5bn) and the US share of 1944 output, because those values are not labelled on chart 1.
