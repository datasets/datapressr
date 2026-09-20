---
title: "Inbox triage — evidence and owner choices for the seven legacy finds"
date: 2026-09-18
---

# Inbox triage — evidence and owner choices for the seven legacy finds

The seven unchecked items in [datapressr#2 — Inbox: quick finds to triage](https://github.com/datasets/datapressr/issues/2), each with what was actually found when the primary sources were checked on **2026-09-18**, and a recommendation. All seven entries are preserved; none has been dropped here.

**This document proposes; it does not act.** Nothing was posted to the GitHub issue, no issue body was edited, and no dataset was created. Checking the boxes in datapressr#2, or striking an item through with a reason, is the owner's call. Two items (#2 and #3) cannot be decided without context only the owner has.

Research was read-only: the primary sources were fetched and read, nothing was downloaded into the repo.

| # | Find | Recommendation |
|---|---|---|
| 1 | Human Rights Measurement Initiative | **Clarify** — licence is non-commercial |
| 2 | FiveThirtyEight | **Clarify** — original context needed; data is still open but frozen |
| 3 | "Wiser metrics" | **Clarify** — no referent identified |
| 4 | Fischer, *The Great Wave* | **Drop as a dataset**, redirect to an open substitute we already have |
| 5 | Causes-of-death comparison | **Proceed**, with a per-series licence check |
| 6 | 40,000 TV commercials a year | **Drop as a dataset**; usable only as a cited claim |
| 7 | Fashion is the 3rd most polluting industry | **Drop the ranking**; a different, answerable question is available |

---

## 1. Human Rights Measurement Initiative — dataset download

*Captured 2026-02-18. [humanrightsmeasurement.org/dataset-download](https://humanrightsmeasurement.org/dataset-download/) — "needs a look at license/coverage before deciding if it's worth a `structure` pass".*

**Found.** HRMI publishes its Rights Tracker data for download. The stated licence is a **Creative Commons Attribution Non-Commercial 4.0 International License**: use is permitted with attribution to HRMI and a link to rightstracker.org and/or humanrightsmeasurement.org, for non-commercial and journalistic purposes, and commercial use requires contacting HRMI directly. Academic citation details are said to ship inside the download's documentation. The download page itself does not state year or country coverage, or the metric list — those are in the files.

**The licence is the blocker, and it is a real one.** CC BY-NC is not an open licence: it fails the Open Definition, and it is not on the SPDX list this repo's `AGENTS.md` asks for. Every dataset published here so far carries an open licence (`CC-BY-4.0`, `ODbL-1.0`, `PDDL-1.0`). Republishing NC data on DataHub would be the first exception and would restrict what downstream users can do with it.

**Recommendation: clarify.** This is a policy decision, not a technical one — does this catalog accept non-commercial data at all? If yes, HRMI is otherwise a good candidate (a genuine primary source, actively maintained, with a real citation practice) and the next step is downloading the files to record coverage and metrics. If no, the item closes with "licence incompatible" and that reason is worth recording once, because it will come up again.

## 2. FiveThirtyEight

*Captured with no detail — `datasets/BACKLOG.md` had just "Five Thirty Eight …". The issue says it "needs the original context filled in or it should be dropped".*

**Found.** The data repository at `github.com/fivethirtyeight/data` is still up and still open: **CC BY 4.0** for the datasets, MIT for the code, roughly 100+ dataset folders. The most recent update visible is **13 June 2023**, and the README carries a notice that as of that date sports predictions and forecasts are no longer being updated. Separately, `fivethirtyeight.com` now returns a **301 redirect to `abcnews.com/538`**, which serves ABC News's politics section with no FiveThirtyEight branding on it. So the publication has been wound down and absorbed; the archive of its data remains openly licensed and reachable.

That makes the item viable but shapeless. "FiveThirtyEight" is a hundred datasets about a hundred different things — it is a *catalog*, and by this repo's catalog-as-repo rule it would be its own repo and publication, not a folder here. Nothing in the capture says which dataset or which question was meant.

**Recommendation: clarify, then most likely drop as written.** The owner is the only person who can say what the original note meant. If no specific dataset comes to mind, drop it: a frozen 2023 archive of someone else's already-open, already-public data is not a wrangling job, and re-hosting the whole catalog is a project, not an inbox item. If a *particular* series was meant — the one that would have made a story — that becomes its own issue and the rest of this entry closes.

## 3. "Wiser metrics"

*Dashboard/story idea from the superseded `datasets/DASHBOARDS.md`, no further detail.*

**Found: nothing identifiable.** The note is two words and the file it came from has been superseded; there is no URL, no date and no surrounding text. "Wiser" could plausibly be several unrelated things, and guessing which and then researching the guess would produce confident-looking work about the wrong subject.

**Recommendation: clarify — this one needs the owner and nobody else.** A sentence of context is enough to either turn it into a real capture or close it. Failing that, drop it: an idea nobody can reconstruct is not a backlog item, and leaving it unchecked forever costs more attention than deleting it.

## 4. David Hackett Fischer, *The Great Wave* — price revolutions data

*Captured 2019-08-05.*

**Found.** *The Great Wave: Price Revolutions and the Rhythm of History* (Oxford University Press, 1996) presents its long-run price series in the book's appendices. There is no machine-readable dataset published by Fischer or the publisher — no accompanying data site, no supplementary files. The appendix tables are a copyrighted presentation, and transcribing them would be republishing the book's content, not the underlying facts in the way a public-record extraction is.

The series *behind* the book are largely published historical price indices that are separately citable — the Phelps Brown and Hopkins consumer price index, Beveridge's price data, and the other long-run national series economic historians reuse. Those are the real source, and the book is a synthesis of them.

**The more useful point:** the terrain is already covered by work this project has done. [`millennium-macroeconomic-data-uk`](https://github.com/datasets/economic-history/tree/main/millennium-macroeconomic-data-uk) is the Bank of England's *A Millennium of Macroeconomic Data*, which carries UK prices, wages, interest rates and GDP back to the 13th century — the same centuries and largely the same underlying series Fischer draws on, already structured and openly licensed in the sibling `datasets/economic-history` repo, and already the worked example for messy spreadsheets in `skills/structure/SKILL.md`.

**Recommendation: drop the book as a dataset; keep the idea as a story.** The price-revolutions argument is a *story* candidate built on data we already hold, not a wrangling job. Fischer belongs in that story's citations, not in `sources`. Worth recording that reasoning when the box is checked, because "the book has the chart" is a recurring trap.

## 5. Suicides vs. traffic accidents vs. war deaths vs. famine deaths over time

*Captured 2019-02-11 — modern vs. pre-modern causes of death.*

**Found: this one is buildable, and the data is open.** Our World in Data covers all four strands and states that "all visualizations, data, and articles produced by Our World in Data are completely open access under the Creative Commons BY license". Its famine work is the clearest piece: OWID now uses the **World Peace Foundation's Historic Famines Dataset**, having switched to it in spring 2025 from a dataset OWID had assembled itself, with charts running roughly 1870–2023. The suicide, road-death and conflict-death strands come from the standard providers (IHME's Global Burden of Disease for the health causes, UCDP/PRIO for conflict).

**The real work here is a licence check per series, not the wrangling.** OWID's CC BY covers OWID's own charts and derived data; the upstream providers each set their own terms, and IHME's GBD in particular has its own conditions that need reading rather than assuming. Two of the four series would need that checked before publication.

The second issue is definitional and will decide whether the comparison is honest: the four causes are not measured the same way. Famine deaths are event-attributed estimates with wide uncertainty; road and suicide deaths are registered vital statistics in some countries and modelled in others; conflict deaths differ enormously depending on whether indirect deaths count. Putting four lines on one chart implies a comparability the sources do not have. That is a solvable problem — state the basis per series, show uncertainty where the source gives it — but it must be solved deliberately, not discovered in the middle of writing prose.

**Recommendation: proceed.** Promote it to its own issue as a `story` candidate with a dataset behind it. Scope it as one dataset per series with a shared time axis rather than one merged table, so the differing bases stay visible. Check IHME and UCDP terms before any publication step.

## 6. "US children watch ~40,000 TV commercials a year"

*Captured 2019-05-11 — AAP 2006, cited in* Cultural Anthropology *p.64. The issue says it "needs a primary source before it's usable".*

**Found: the primary source exists and is precisely citable.** The policy statement is *Children, Adolescents, and Advertising*, Committee on Communications, American Academy of Pediatrics (Strasburger VC), **Pediatrics 2006 Dec;118(6):2563–9** (PMID 17142547). The AAP full text returned HTTP 403 to a plain request on 2026-09-18, so the figure was **not** read in its original wording; the citation is confirmed, the sentence containing the number is not.

Two things to be clear about before anyone uses it. First, the figure is nearly twenty years old and describes **broadcast television in the United States** — a media environment that has since been replaced. Repeating it in 2026 without that framing would be misleading whatever its 2006 accuracy. Second, and more to the point here: it is a *number*, not a dataset. One figure from one policy statement has nothing to structure, no series, no schema.

**Recommendation: drop it as a dataset candidate; keep the citation.** If the underlying question — how much advertising children are exposed to, and how that has changed — is interesting, that is a different and much larger capture needing contemporary measurement across platforms, and it should be filed as its own idea rather than as a 2006 footnote. Anyone who does use the 40,000 figure should read the AAP statement's own wording first, since it was not verifiable here.

## 7. "Fashion is the 3rd most polluting industry globally"

*Captured 2019-05-11 as a viz idea — the issue already flags that it "needs a primary source".*

**Found: no primary source for the ranking, and the obvious authority declines to make it.** UNEP's own fashion coverage gives figures without a ranking: the fashion industry "produces between 2 to 8 per cent of global carbon emissions" (attributed to a Quantis study); textiles "account for approximately 9% of annual microplastic losses to the ocean"; "every second, the equivalent of one garbage truck of textiles is landfilled or burned". The one ranking UNEP does make is narrower and different — **textile *dyeing*** is described as "the second largest polluter of water globally", which is a claim about one process and one medium, not about the industry's overall rank among all industries.

The ranking claim (variously second or third, depending on who is repeating it) has no traceable primary source, and the fact that the emissions estimate spans **2% to 8% — a fourfold range** — is itself the reason no defensible ranking can be built on it. Note that the capture, the issue and this document all decline to state the ranking as fact.

**Recommendation: drop the ranking; the adjacent question is the good one.** "How large is the fashion industry's environmental footprint, and how well do we actually know?" is answerable and more interesting than a league table — the honest answer is a range with a wide uncertainty band and a note on why estimates disagree. If the owner wants that, it is a fresh capture with UNEP and Quantis as starting points, not this item. This entry itself closes as unsupported.

---

## What the owner needs to decide

1. **Does this catalog publish non-commercial data?** (#1 HRMI, and it will recur.)
2. **What did the FiveThirtyEight note mean** — a specific dataset, or general interest? (#2)
3. **What is "Wiser metrics"?** (#3)

With those three answered, four items close immediately (#4, #6, #7 drop with recorded reasons; #5 gets promoted to its own issue) and the inbox is empty.
