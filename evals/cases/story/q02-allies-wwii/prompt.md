# Task

Write a short data story that answers this question:

**Why did the Allies win the Second World War?**

## Data

Open data mode: nothing is provided. Find, choose and snapshot the data yourself, from the web (see the network notes at the end).

This is a data story, not an essay. Build the argument from measurable series, and make each chart carry one of them. The evidence to look for:

- war production: aircraft, tanks, ships and munitions, by country and year;
- manpower: mobilised forces and population;
- the economic size of each coalition: GDP by country and year (Mark Harrison's *The Economics of World War II* and the work that followed it are the standard starting point);
- oil and raw materials;
- casualties, military and civilian, by country and front.

You need not use all five; use what makes the argument. Whatever you use:

- Every number names what it measures: the unit, the base year and prices (for GDP), the countries and years covered, and the source.
- Where sources disagree (casualties above all, but also output and GDP estimates), show the disagreement, on a chart or in the text, rather than picking one number silently.
- Say plainly what the data does not test: strategy, leadership, intelligence, luck and the like. A story built on production and GDP shows capacity, not how it was used.

## Where files go

Choose a slug for the story. Put every file you produce in `site/stories/`:

- `<slug>-outline.md`, `<slug>-make-charts.mjs`, the chart SVGs and `<slug>.md`, as the story skill describes;
- `<slug>-src/`: a snapshot of every source file the charts read (as downloaded, or the exact table you transcribed from a document, with the page or table number), plus any tidy CSV you derive from them and the script that derives it, with a `PROVENANCE.md` giving for each file its source URL, retrieval date, licence or terms of use, and the vintage or edition of the data;
- `<slug>-src/DATA.md`: what you searched for and where, what you found, what you chose and why, what you rejected and why (including anything you could not reach), and the licence and vintage of each source you used.

`<slug>-make-charts.mjs` must build the charts from the files in `<slug>-src/` alone, with no network.

## How to work

Read `skills/story/SKILL.md` and follow it. `skills/archive/SKILL.md` (snapshotting a raw source with its provenance) and `skills/structure/SKILL.md` (turning a raw source into a tidy, typed CSV with a reproducible script) are there for the data side: use what helps; a full dataset directory with a `datapackage.json` is not required.

The prose of the finished story should be 300 to 700 words.

This is a scratch repository, so skip these steps of the skill:

- adding links to the story from a site index or README;
- publishing to DataHub;
- the human voice pass (there is no human author in this run; leave the prose as your best final draft).
