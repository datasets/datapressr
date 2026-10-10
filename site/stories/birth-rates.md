---
publish: false
title: "Most Countries Now Have Birth Rates Below Replacement"
description: In 2023, 130 of 237 countries and territories had fertility below 2.1 children per woman, up from 60 in 1990, and most places already below it kept falling. Sub-Saharan Africa is where the fall is far from finished.
datahub:
  slug: below-replacement
  status: draft
---

# Most Countries Now Have Birth Rates Below Replacement

![Line chart, 1950 to 2023, of how many of 237 countries and territories had a fertility rate below 2.1 and below 1.4 children per woman. The below-2.1 line rises from 4 in 1950 to 60 in 1990, holding 24% of the world's population, and to 130 in 2023, holding 67%, crossing the halfway mark in the late 2010s. The below-1.4 line rises from 5 in 1990 to 43 in 2023, holding 25% of the world's population. Notes: among places of 1 million or more people, 40 of 152 in 1990 and 81 of 161 in 2023; outside China and India, the share of people below 2.1 went from 38% to 49%.](birth-rates-below-replacement.svg)

*Countries and territories with a total fertility rate below 2.1 and below 1.4 children per woman, 1950–2023. Data: UN World Population Prospects 2024. Written from [an outline](birth-rates-outline.md).*

In 1990, 60 of the world's 237 countries and territories had fertility below the replacement level of 2.1 children per woman. By 2023 it was 130: more than twice as many, and more than half. The number below 1.4, a level the UN calls "ultra-low", went from 5 to 43.

## What these numbers are

The total fertility rate is how many children a woman would have if she lived through her childbearing years at one year's birth rates for each age. It describes a year, not any real woman: when people have children later, the rate dips even if they end up with as many.

Replacement is the rate at which each generation, without migration, is replaced by one of the same size. Where few children die young, it is about 2.1. All figures are UN estimates for 1950–2023; projections are not used.

The places below 2.1 held 24% of the world's people in 1990 and 67% in 2023. Most of that rise is two countries: China went below 2.1 in 1991 and India in 2020. Outside those two, the share went from 38% to 49%. Among places of a million or more people, 81 of 161 are below 2.1.

## It took about a generation

![Range chart of 37 countries with a million or more people that went from 5 or more children per woman to below 2.1. Each bar runs from the last year at 5 or above to the first year below 2.1. The median is 31 years. Iran took 10 years (1989–1999), Singapore 12, China 19, South Korea 20, Brazil 33, Mexico 38, India 43 (1977–2020) and Sri Lanka 51. Eight countries, marked with an asterisk, later rose back above 2.1 for at least a year.](birth-rates-speed.svg)

Of 37 countries with a million or more people that fell from five children per woman to below 2.1, the median time taken was 31 years. Iran took 10, China 19 and South Korea 20; India took 43 and Sri Lanka 51.

This counts only falls that reached 2.1; 8 of the 37 have since risen back above it. Europe, the United States and Japan were already below five in 1950, when the record starts, so their own falls cannot be timed here.

## It did not stop at 2.1

![Dumbbell chart of fertility in 2010 and 2023 for 16 countries. Fourteen were below 2.1 in 2010; twelve of them fell, including South Korea from 1.23 to 0.72, China from 1.69 to 1.00, Finland from 1.86 to 1.28, the United States from 1.92 to 1.62 and France from 2.02 to 1.64. Germany rose by 0.04 and Hungary by 0.23, from 1.26 to 1.49. Mexico and India, above 2.1 in 2010, fell below it. Note: 87 of the 103 places below 2.1 in 2010 were lower in 2023, 72 of them already by 2019.](birth-rates-since-2010.svg)

Of the 103 places already below 2.1 in 2010, 87 were lower in 2023, and 72 of those were lower before COVID. South Korea went from 1.23 to 0.72; only Macao and Hong Kong are lower. China fell by 0.69, to 1.00.

It reached countries that had held steady for two decades. The United States went from 1.92 to 1.62; Finland fell by 0.58 and Norway by 0.54. Most places that did not fall are in central and eastern Europe. Hungary rose from 1.26 to 1.49. This data cannot say why.

## Where the fall is far from finished

![Line chart of each region's share of the world's births, 1950 to 2023. Sub-Saharan Africa rises from 9.1% in 1950 to 15.5% in 1990 and 30.4% in 2023. East and South-East Asia falls from 29.9% in 1990 to 15.7%. Central and Southern Asia is at 29.6%. Note: in 2023 sub-Saharan Africa had 4.32 children per woman against 2.25 for the world, and its share of world population rose from 9.4% in 1990 to 15.0% in 2023.](birth-rates-births-share.svg)

Sub-Saharan Africa's rate is falling too, but was 4.32 in 2023, against 2.25 worldwide. Its share of the world's births doubled, from 15.5% in 1990 to 30.4%. Part of that is its growing share of the world's people, 9.4% to 15.0%; births grew faster, to twice its population share. East and South-East Asia went the other way, from 29.9% of births to 15.7%.

## Why, according to others

This data shows rates, not reasons. Others' explanations, untested here:

For the long fall from about five children, Max Roser of Our World in Data [credits](https://ourworldindata.org/global-fertility-has-halved) "women's empowerment, declining child mortality, and the rising cost of bringing up children".

The UN Population Division [says](https://population.un.org/wpp/assets/Files/WPP2024_Summary-of-Results.pdf) that in several low-fertility countries women have fewer children than they expected, naming obstacles including "high costs of childcare, challenges to work-family balance" and an "unequal division of household tasks between partners".

For the United States, the economists Melissa Kearney, Phillip Levine and Luke Pardue [found](https://www.aeaweb.org/articles?id=10.1257/jep.36.1.151) that the Great Recession explains part of the early fall, but no other economic, policy or social change since 2007 explains much of the rest. They suggest "shifting priorities" among younger women.

For the Nordic countries, Johan Hellstrand and colleagues [found](https://doi.org/10.1215/00703370-9373618) that having children later explains "only part of the decline", and forecast that women born in the late 1980s will have around 1.8 children each.

## How this was made

The data is the UN's [World Population Prospects 2024](https://population.un.org/wpp/), medium variant. [`fetch.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/birth-rates-src/fetch.mjs) downloads it, checks its hash and writes two small extracts; [`birth-rates-make-charts.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/birth-rates-make-charts.mjs) builds the charts; re-running it reproduces them exactly. World Bank figures agree to within 0.07. Licence and choices: [PROVENANCE.md](https://github.com/datasets/datapressr/blob/main/site/stories/birth-rates-src/PROVENANCE.md) and [DATA.md](https://github.com/datasets/datapressr/blob/main/site/stories/birth-rates-src/DATA.md).

## Friction notes

For the `story` skill:

- **The headline measure changed after looking.** The share of the world's people below 2.1 moves in two jumps, China and India, so the count leads and the share is reported with and without them.
- **Outline review earned its keep.** Round 1 found 13 problems, including a false "lowest of all" for South Korea, a chart domain that clipped a series and a misquoted UN source.
- **Plot's `dx`, `textAnchor` and `fontWeight` are constants.** Passing a function wrote its source into the SVG; the build now refuses that.
- **Exempt numbers** (not on a chart):
  - 1.8: attributed Hellstrand et al. forecast
  - 0.07: dataset-wide cross-check tolerance
- **Author's voice pass: outstanding.** This prose is an AI draft rendered from the approved outline; the "sounds like me" pass has not been done.
