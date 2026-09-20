---
date: 2026-08-30
title: The structure skill, used in anger — and a first data story
promote: false
---

The `structure` skill got its first real run against a messy primary source:
NOAA's Mauna Loa CO₂ record, from the raw text file (40 comment lines, negative
"no data" sentinels, no date column) to a clean typed dataset with a reproducible
`build.ts`. Diffing it against the long-running community dataset at
`github.com/datasets/co2-ppm` turned up a live bug there — NOAA restructured the
CSV, the community version's shell updater didn't follow, and its published
monthly file now has its last two columns mislabelled with nothing to catch it.
This build asserts the source header and stops if the shape changes; the lesson
went back into the skill as a "government/scientific text data" idioms note.

On top of the dataset: **[the first hand-written data story](https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve)** — the
Keeling Curve, what it is and what it says (316 ppm in 1959, 427 in 2025, up every
single year). It's built from a committed outline, and it's deliberately a story
about the data, not about the wrangling — the chart leads, the "how this was made"
part is a short section near the end. Charts are hand-rolled SVG for now: the
near-term policy is just to make charts that look good by whatever's easiest, and
leave picking a standard mechanism (that DataHub or Flowershow support natively)
to a later investigation.
