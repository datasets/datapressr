---
title: The Keeling Curve
description: What it takes to get from a NOAA text file to the single most important line in climate science — and what the line says.
---

# The Keeling Curve

*Data story #1. Written by hand — no `story` skill yet; that gets designed after a
couple of these. Dataset: [co2-ppm](../datasets.md).*

In March 1958, Charles David Keeling started measuring the amount of carbon
dioxide in the air at the Mauna Loa Observatory in Hawaii, 3,400 metres up a
volcano, far from cities and forests. He kept measuring until he died in 2005.
NOAA and the Scripps Institution have kept it going since. It is the longest
continuous record of atmospheric CO₂ that exists, and it produced one of the most
consequential graphs of the twentieth century.

## Before: what NOAA actually gives you

The source is a file called `co2_mm_mlo.csv`. It does not open cleanly in a
spreadsheet. The first 40 lines look like this:

```
# --------------------------------------------------------------------
# USE OF NOAA GML DATA
#
# These data are made freely available to the public and the scientific
# community in the belief that their wide dissemination will lead to
...
# NOTE: Due to the eruption of the Mauna Loa Volcano, measurements ...
#
year,month,decimal date,average,deseasonalized,ndays,sdev,unc
1958,3,1958.2027,315.71,314.44,-1,-9.99,-0.99
1958,4,1958.2877,317.45,315.16,-1,-9.99,-0.99
```

Three things to deal with:

1. **40 comment lines** before the data. Not a fixed number you can hard-code —
   it changes when NOAA adds a note (like the 2022 volcanic eruption that
   suspended measurements for eight months).
2. **`-1`, `-9.99`, `-0.99` are not measurements.** They're NOAA's way of writing
   "no information." Every row before May 1974 has them, because that stretch
   comes from Keeling's Scripps records, which didn't log how many daily readings
   went into each month. Leave them in and your average uncertainty is negative.
3. **Two columns of year and month, no date.** You assemble the date yourself.

## After: a clean table

[`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/build.ts)
strips the comments, turns the sentinels into empty cells, builds an ISO date, and
writes two tidy files — monthly (821 rows, 1958–now) and annual (67 rows). Every
column has a declared type and the primary key is named. Re-running the script
produces byte-identical output.

| date | co2_ppm | co2_ppm_deseasonalized | num_days | std_dev | uncertainty |
|------|--------:|----------------------:|---------:|--------:|------------:|
| 1958-03-01 | 315.71 | 314.44 | | | |
| 1974-05-01 | 333.19 | 330.22 | 13 | 0.31 | 0.16 |
| 2026-07-01 | 429.12 | 428.83 | 21 | 0.59 | 0.25 |

One detail that made the case for doing it this way: the long-running community
version of this dataset auto-updates with a shell script, and at some point NOAA
added the `sdev` and `unc` columns. The script didn't notice. Its published file
now has seven values per row under six column headings — so its "Trend" column
silently contains the day-count, and its "Number of Days" column contains the
standard deviation. Nothing caught it because nothing checks the data against the
schema. `build.ts` asserts the header it expects and stops if the shape changes.

## What the line says

### The annual mean, 1959–2025

![Annual mean CO₂ at Mauna Loa, rising from 316 ppm in 1959 to 427 ppm in 2025, crossing 350 ppm around 1988 and 400 ppm in 2015](keeling-annual.svg)

316 parts per million in 1959. **427 in 2025.** The line has gone up every single
year — not once has the annual mean fallen. It crossed 350 ppm (a number often
cited as a safe ceiling) around 1988, and 400 ppm in 2015. The rise is also
getting steeper: about 0.9 ppm/year across the 1960s, about 2.6 ppm/year across
the last decade.

### The sawtooth, 2010–present

![Monthly CO₂ at Mauna Loa 2010 to 2026 showing an annual saw-tooth oscillation of about 6 ppm around a steadily rising deseasonalized trend line](keeling-seasonal.svg)

Zoom in and the smooth line breaks into teeth. CO₂ falls every northern-hemisphere
summer as forests leaf out and breathe in, and rises again each winter — a swing
of about 6 ppm. Keeling was the first to measure this. It's the planet's
respiration. The blue line underneath, with the season taken out, is the part that
doesn't come back down.

## Friction notes (for the future `story` / charting skills)

- **Charting was the awkward part.** I didn't know what chart syntax this site's
  renderer supports, so I hand-wrote an SVG generator
  ([`make-charts.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/make-charts.mjs)).
  It works and it's reproducible, but ~120 lines of `<path>` math is not how the
  third data story should be made. **Decision needed:** pick a declarative chart
  block (Vega-Lite / Observable Plot) and confirm the site renders it.
- **The dataset needed almost no reshaping** — NOAA ships it tidy-ish. The value
  `structure` added here was types, sentinel handling, and the header assertion,
  not layout surgery. A story built on a genuinely wide source will be a better
  test of the charting workflow.
- **What worked well:** having the clean dataset with typed columns meant the
  charts were three lines of "read CSV, map two columns" each. The mess was all
  upstream of the story, which is the point.
