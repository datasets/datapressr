---
title: "Worked example — autonomous source discovery: Tesla quarterly deliveries"
date: 2026-09-18
---

# Worked example — autonomous source discovery: Tesla quarterly deliveries

An agent was given a data question, not a source: *Tesla quarterly sales by vehicle over time*. This records what it did to turn that into [`datasets/transport/tesla-quarterly-deliveries`](../../datasets/transport/tesla-quarterly-deliveries) — which sources it tried, which it rejected and why, what the source turned out to actually support, and where it got things wrong before getting them right. The dataset's own [README](../../datasets/transport/tesla-quarterly-deliveries/README.md) documents the result; this documents the route.

`archive` and `structure` both start from a source you already have. This example is about the step before them, and the finding that matters most is that **discovery changed the question**. The question said "sales by vehicle". The source supports *production and deliveries by model group*, where the grouping changes twice and no individual model is ever reported. Half the work was establishing that, and the rest was not quietly papering over it.

## Run it

```sh
cd datasets/transport/tesla-quarterly-deliveries
SEC_USER_AGENT="<project> <your-email>" node fetch.ts   # ~100 requests, paced; writes archive/
node build.ts                                           # offline; archive/ → data/
node --test                                             # 25 tests
node ../../../scripts/validate-datapackage.mjs .
```

## Source selection

Three candidates for the same underlying press release, checked in this order:

| Candidate | Result | Verdict |
|---|---|---|
| Tesla investor relations — `ir.tesla.com/press-release/...` | HTTP **403** to a plain client, including the site root | Rejected. The publisher's own copy is not retrievable without pretending to be a browser, and a documented access limit is a result, not a licence to work around it. |
| Business Wire — the wire copy of the same release | HTTP **403** | Rejected, same reason. |
| **SEC EDGAR** — Form 8-K, Item 2.02, Exhibit 99.1 | HTTP **200** | **Chosen.** |
| Secondary aggregators (analyst trackers, Wikipedia tables) | not retrieved | Not needed. They would only have been used to find gaps or corroborate, never substituted for the primary figure. |

EDGAR wins on more than reachability. It is the **primary** filing, not a copy; it is a public record with a stable citation (the accession number, which is carried through to `source_id` in the output); it publishes a machine-readable filing index so the *set* of releases can be discovered rather than guessed at; and it states its access terms plainly — declare a User-Agent that identifies you, stay under 10 requests a second. `fetch.ts` refuses to run without `SEC_USER_AGENT` rather than sending a default, and paces at 250 ms between sequential requests.

That last point is the generalisable one: **prefer the source that tells you how it wants to be accessed.** Two of the three candidates said nothing and returned 403; the third documented a contract and honoured it.

### How the filing set was found

`https://data.sec.gov/submissions/CIK0001318605.json` plus its pre-2018 overflow file lists all 1,750 Tesla filings with form type, filing date and the 8-K item numbers. The quarterly delivery release is an 8-K reporting under **Item 2.02** filed in the first days of January, April, July or October. That rule — item `2.02`, filed in month 1/4/7/10 on day ≤ 10 — selects 49 filings and is what `fetch.ts` runs. The window is deliberately loose; `build.ts` decides what is actually a production-and-deliveries release, and records the ones that are not.

The rule is also visibly imperfect, which is worth stating: it misses the Q4 2013 release (filed 2014-01-15) and anything else Tesla filed outside the window. 49 filings, 50 exhibits, 1.2 MB — well inside small-data.

## What the source actually supports

Recorded **before** any parsing, from reading a sample of the filings:

- **Deliveries and production are two measures, not one.** Both are reported; they are never equal; neither is revenue. They are kept as separate `metric` values and production is never relabelled as sales.
- **Model groups, never individual models.** `Model S/X`, `Model 3`, `Model 3/Y`, `Other Models` — the grouping changes twice across the series. Labels are preserved verbatim. A combined group is never split; groups are never re-combined across regimes.
- **Totals sit alongside components.** Every table has the release's own `Total` row. Flagged `is_total` rather than dropped, so the reader can filter instead of double-counting.
- **Two layouts.** From the Q2 2019 release the figures are in an HTML table. The 20 earlier releases, back to Q1 2013, state them in prose whose wording changes each time.

The schema fell out of that: `period_start, period_end, vehicle_group, is_total, metric, vehicles, source_id`, keyed on `(period_start, period_end, vehicle_group, metric)`.

## Coverage and gaps

| Range | Filings | Status |
|---|--:|---|
| Q2 2019 – Q2 2026 | 29 | **Extracted.** Table layout, no gaps in the run. |
| Q1 2013 – Q1 2019 | 20 | **Discovered, not extracted.** Prose layout. |
| Same-window exhibits that are not delivery releases | 1 | Recorded as such (an all-staff email filed 2018-10-01). |
| Q4 2013 (filed 2014-01-15) and any other out-of-window release | — | **Not discovered** by the selection rule. |
| Q3 2026 onwards | — | Quarter had not ended at the 2026-09-18 cutoff. |

The 20 prose releases were left unextracted on purpose. Each would need its own pattern, and a regex that silently matches the wrong number in a paragraph produces a plausible figure with no way to tell. Extracting them is a real follow-up, not an oversight — and either way `data/source-filings.csv` lists all 50 exhibits with a `layout` and an `extracted` flag, so the gap is visible in the data rather than only in prose.

## Sample results, checked against the filings

| Quarter | Group | Production | Deliveries | Filing |
|---|---|--:|--:|---|
| Q2 2019 (first table) | Model S/X | 14,517 | 17,650 | 0001564590-19-024414 |
| Q2 2019 | Model 3 | 72,531 | 77,550 | |
| Q1 2021 | Model S/X | **0** | 2,020 | 0001564590-21-017443 |
| Q4 2023 (grouping change) | Model 3/Y | 476,777 | 461,538 | 0000950170-24-000282 |
| Q4 2023 | Other Models | 18,212 | 22,969 | |
| Q2 2026 (latest) | Total | 451,758 | 480,126 | 0001628280-26-046717 |

Three things the data turned up that the question did not anticipate:

1. **A dash that is a real zero.** Q1 2021 prints `-` for Model S/X production during the line changeover. It is resolved to `0` only because the quarter's total minus the other group leaves exactly nothing; a dash the arithmetic cannot account for is left empty. Missing and zero never get merged.
2. **A number broken by markup.** Q2 2022's total production is marked up as `258,5 8 0` across separate spans. Stripping whitespace repairs it — and the component sum (16,411 + 242,169 = 258,580) is what proves the repair rather than the repair being trusted on sight.
3. **The annual recap does not match the four quarters.** 2020 deliveries sum to 498,920 across the quarterly releases; the Q4 2020 recap says 499,550. 2021: 935,950 against 936,172. Tesla restates and does not reissue the press releases. Both figures are kept, in separate resources, and `build.ts` prints the difference on every run instead of reconciling it away.

Everything above is asserted in `build.ts` or covered by one of the 25 tests. The checks that earn their keep: components sum to the reported Total for every quarter and metric; the quarter derived from the filing date matches the quarter the release's own headline claims; the extracted quarters form an unbroken sequence; the primary key is unique; every archived file matches its manifest SHA-256 before it is parsed.

## Autonomy log

**Human interventions during execution: zero.** One decision was settled beforehand — the owner authorised declaring `hello@datahub.io` as the SEC contact address, which is a real-world-identity call an agent should not make for itself. No other input was needed or requested.

**Elapsed:** roughly half an hour of wall-clock for discovery, fetch, build, tests and metadata, of which about 10 minutes was the paced download — run three times, after two selection bugs (see below).

**Tools:** `curl` for reachability probes; Node's built-in `fetch`; plain Node with no dependencies for parsing (regex over the archived HTML — the tables are simple enough that a DOM library would have been an unnecessary dependency); `node --test`.

**Decided unaided:** the three-candidate comparison and the choice of EDGAR; the item-2.02 + filing-month selection rule; the fetch/build split with a hashed manifest, reused from `population-growth` where the skill now recommends it; the schema and primary key; `is_total` rather than dropping total rows; publishing quarterly and annual figures as separate resources; the coverage resource; the preferred-version rule for duplicate quarters; excluding the lease-accounting percentage and storage deployments as out of grain; the licence position.

**Failed approaches, and what fixed them:**

1. **Guessing exhibit filenames from the directory listing.** The first `fetch.ts` matched `/ex.?99/` against `index.json` names. Exhibit filenames drift with whoever filed them — `d106308dex991.htm`, `tsla-ex991_6.htm`, `tsla-ex99_1.htm`, `exhibit99111111.htm` all occur in this one series — and the pattern silently dropped the **eight most recent quarters**. It failed quietly: the run exited 0 with a note that no exhibit was found. Fixed by reading the document **type** the filing declares instead of pattern-matching its name.
2. **The obvious place to read that type doesn't always exist.** `<accession>-index-headers.html` carries the SGML header with `<TYPE>EX-99.1`, and `index.json` lists the file — but EDGAR returns **404** for it on pre-2015 filings. The whole run died on the 2013 filing. Fixed by parsing the Type column of `<accession>-index.html`, which is served for every filing in the range.
3. **A classifier that matched the wrong era's wording.** Releases not in the table format were labelled by testing the headline for `production|deliveries`; the 2015 headlines read "TESLA DELIVERS 11,507 VEHICLES IN Q2 OF 2015", so one release was filed under "not a production-and-deliveries release". Caught by reading the output rather than the exit code. Fixed by matching the stems.

All three are the same failure: **a selection heuristic that returns fewer rows instead of an error.** A missing row looks exactly like a row that doesn't exist. What caught each one was counting — 49 candidate filings but only 42 exhibits retrieved, 50 exhibits but 49 accounted for — which is why `source-filings.csv` exists at all.

## What this teaches beyond `archive` and `structure`

- **Reachability is a source-selection criterion, and 403 is an answer.** The publisher's own copy was the worst option of the three. Record the probe; don't work around it.
- **Prefer a source that publishes an index of its own documents.** The difference between "I found some releases" and "I found the set of releases, and here is the rule that defines it" is the difference between a scrape and a dataset. It is also what makes coverage auditable later.
- **Pin the question against the source before writing any code.** "Sales by vehicle" was not answerable. Writing down what the source *does* support, first, is what stopped the build from inventing a model-level split.
- **A discovery rule needs a count, and the count needs to be published.** Every one of this run's three bugs was a silent under-selection. The coverage resource is the artefact that made them visible.
- **Cross-check the metadata against the document.** The quarter is derived from the filing date and verified against the release's own headline. Those could have disagreed; if they ever do, the build stops.

## Follow-ups worth filing

- **Extract the 20 prose releases (Q1 2013 – Q1 2019).** The safe approach is the one already proven here: parse to component figures, then require them to sum to the total the same paragraph states, and fail rather than guess where they don't. Roughly doubles the series.
- **Widen the discovery rule** to catch out-of-window releases like Q4 2013 (filed 2014-01-15), and assert one release per quarter across the whole range so a future gap is an error rather than a silent absence.
- **Decide whether the lease-accounting percentage deserves its own resource.** It is in every table from Q3 2019 and currently discarded.
- **Re-run and diff.** The build is deterministic against a pinned snapshot; running `fetch.ts --refresh` after a new quarter and diffing the CSVs would show whether Tesla has restated anything, which is currently only visible via the annual recap.

No generic scraping framework is proposed. Three sources into this repo, the reusable parts are the fetch/build split, the hashed manifest and the coverage table — all of which are now guidance in [`skills/structure/SKILL.md`](../../skills/structure/SKILL.md), not a framework.
