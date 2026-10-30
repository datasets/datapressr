
# Voice guide

How DataPressr data stories should sound. Packaged with the `story` skill so it works from an installed copy (the DataPressr repo keeps the original at [`site/docs/voice-guide.md`](https://github.com/datasets/datapressr/blob/main/site/docs/voice-guide.md)). A "sounds like me" pass by the author is always a separate, final stage — this guide is the floor, not that.

## The one rule

**Let the numbers carry it.** The reader came for what the data says. Your job is to state it clearly and get out of the way. If a sentence would survive having its adjective deleted, delete the adjective.

Make the relationship between findings explicit. Explain how the next finding changes, qualifies or helps account for the previous one, using the evidence already established in the outline. Give the reader the useful connection, with the strength of the explanation matched to its evidence:

- **Accounting relationship:** show how the quantities fit together. Check the numerator and denominator before reconciling an amount with a share. Deficits contribute to debt, but a debt-to-GDP trajectory also depends on GDP and stock-flow adjustments; a deficit alone is not a complete explanation of a changing ratio.
- **Descriptive association:** state the observed comparison or co-movement and what it changes about the preceding finding. A higher revenue share than peers establishes a relative level, not whether revenue is sufficient or which policy caused a deficit.
- **Attributed mechanism:** explain the process in plain words and attribute it to a checked source with a link, as the story-craft guide requires. Confirm that the source supports this mechanism for the population, period and measure being explained. A named source or a plausible story alone is not verification. Keep a supported explanation even when the plotted data cannot test it; distinguish the source's account from the chart's observation.

Before linking findings, match population, units, denominator, time period and series. Name a subset when using it: central-government figures cannot silently stand for general government. Distinguish nominal amounts from real amounts or shares, and a daily spot price from a futures-contract settlement. A mechanism for one series explains another only when the evidence supports that connection. When it does not, state the narrower supported finding and the specific unresolved link at the claim, including in the lede. Do not manufacture a transition between unrelated facts or replace a useful supported explanation with generic caveats.

## Do

- **Lead with the finding.** First chart, then one line saying what it shows. Never open on the source file, the download, or the wrangling.
- **Short declarative sentences.** "It has risen every year. The annual mean has not once fallen in 67 years."
- **Concrete numbers with units, in the prose**, not just the chart: "316 ppm in 1959. 427 ppm in 2025."
- **Name the people and places.** "Charles David Keeling began measuring… 3,400 metres up a volcano in Hawaii." Specific beats grand.
- **Attribute plainly.** "Data: co2-ppm, from NOAA." A link, not a paragraph.
- **Put the method last and short**, framed as "how this was made" for the reader who wants it — "here's the cake, now the recipe."
- **Admit what the data doesn't say.** One honest caveat builds more trust than three confident claims.
- **British spelling** (colour, metres, -ise) by default; follow the project's own convention if it has one.

## Don't

- **No editorialising adjectives**: *relentless*, *alarming*, *staggering*, *dramatic*, *unprecedented*.
- **No metaphor doing an argument's job**: not "the planet's breathing", not "the most important line in climate science". A metaphor can *label* a real pattern (the "sawtooth") — it can't stand in for a number.
- **No throat-clearing openings**: "In today's world…", "It is well known that…", "Data is the new oil…".
- **No hedge stacks**: "it seems that this might perhaps suggest". Say it or don't.
- **No exclamation marks. No rhetorical questions. No second person** ("imagine you…").
- **Don't bury the finding** under context. Context supports the finding; it doesn't precede it at length.
- **Don't oversell the dataset.** "A tidy version of X" is enough; it doesn't need to be "definitive" or "comprehensive".

## Before / after

Constructed example with synthetic figures, illustrating the relationship rather than a reported finding:

> **Before.** Spending rose from £100 to £120. Its share of the economy fell from 10% to 8%.

> **After.** Spending rose from £100 to £120, but the economy grew faster, from £1,000 to £1,500. That larger denominator means spending increased in pounds while falling from 10% to 8% of the economy.

This reconciles the two measures. It does not show what caused either increase or whether spending rose after inflation.

---

> **Before.** In an age of mounting climate anxiety, perhaps no dataset is as quietly terrifying as the relentless, unbroken march of atmospheric carbon dioxide — a grim testament to humanity's failure to act.

> **After.** Atmospheric CO₂ at Mauna Loa has risen every year since measurements began in 1958. The annual mean has never fallen.

---

> **Before.** Let's dive into the messy world of NOAA's data files and see if we can wrangle them into shape!

> **After.** The NOAA source is a text file with about 40 comment lines and `-1` for "no measurement". `build.ts` turns it into two typed CSVs.

---

> **Before.** This groundbreaking dataset represents the definitive, most comprehensive collection of oil price data ever assembled.

> **After.** Brent and WTI spot prices from the EIA, daily to annual, in one tidy package.

## Length

A story is as long as its argument, usually 300–700 words of prose around one or two charts. If it runs longer, the argument probably has two stories in it.

## Structure the voice assumes

The outline → charts → prose separation is what makes this voice cheap to hold: the argument is fixed in the outline, so the prose pass is only ever about *wording*, and a later voice pass can rewrite wording without touching the argument.
