---
title: DataPressr voice guide (draft)
date: 2026-09-05
---

# Voice guide (draft)

How DataPressr data stories should sound. Drafted from the stated preferences in
the Keeling Curve outline and the prose of story #1; will firm up after story #2.
A "sounds like me" pass by the author is always a separate, final stage — this
guide is the floor, not that.

## The one rule

**Let the numbers carry it.** The reader came for what the data says. Your job is
to state it clearly and get out of the way. If a sentence would survive having
its adjective deleted, delete the adjective.

## Do

- **Lead with the finding.** First chart, then one line saying what it shows.
  Never open on the source file, the download, or the wrangling.
- **Short declarative sentences.** "It has risen every year. The annual mean has
  not once fallen in 67 years."
- **Concrete numbers with units, in the prose**, not just the chart: "316 ppm in
  1959. 427 ppm in 2025."
- **Name the people and places.** "Charles David Keeling began measuring… 3,400
  metres up a volcano in Hawaii." Specific beats grand.
- **Attribute plainly.** "Data: co2-ppm, from NOAA." A link, not a paragraph.
- **Put the method last and short**, framed as "how this was made" for the reader
  who wants it — "here's the cake, now the recipe."
- **Admit what the data doesn't say.** One honest caveat builds more trust than
  three confident claims.
- **British spelling** (colour, metres, -ise), consistent with the repo.

## Don't

- **No editorialising adjectives**: *relentless*, *alarming*, *staggering*,
  *dramatic*, *unprecedented*. The outline calls these out by name.
- **No metaphor doing an argument's job**: not "the planet's breathing", not
  "the most important line in climate science". A metaphor can *label* a real
  pattern (the "sawtooth") — it can't stand in for a number.
- **No throat-clearing openings**: "In today's world…", "It is well known
  that…", "Data is the new oil…".
- **No hedge stacks**: "it seems that this might perhaps suggest". Say it or
  don't.
- **No exclamation marks. No rhetorical questions. No second person** ("imagine
  you…").
- **Don't bury the finding** under context. Context supports the finding; it
  doesn't precede it at length.
- **Don't oversell the dataset.** "A tidy version of X" is enough; it doesn't
  need to be "definitive" or "comprehensive".

## Before / after

> **Before.** In an age of mounting climate anxiety, perhaps no dataset is as
> quietly terrifying as the relentless, unbroken march of atmospheric carbon
> dioxide — a grim testament to humanity's failure to act.

> **After.** Atmospheric CO₂ at Mauna Loa has risen every year since measurements
> began in 1958. The annual mean has never fallen.

---

> **Before.** Let's dive into the messy world of NOAA's data files and see if we
> can wrangle them into shape!

> **After.** The NOAA source is a text file with about 40 comment lines and `-1`
> for "no measurement". `build.ts` turns it into two typed CSVs.

---

> **Before.** This groundbreaking dataset represents the definitive, most
> comprehensive collection of oil price data ever assembled.

> **After.** Brent and WTI spot prices from the EIA, daily to annual, in one tidy
> package.

## Length

A story is as long as its argument, usually 300–700 words of prose around one or
two charts. If it runs longer, the argument probably has two stories in it.

## Structure the voice assumes

The [outline → viz plan → prose](https://github.com/datasets/datapressr/issues/10)
separation is what makes this voice cheap to hold: the argument is fixed in the
outline, so the prose pass is only ever about *wording*, and a later voice pass
can rewrite wording without touching the argument.
