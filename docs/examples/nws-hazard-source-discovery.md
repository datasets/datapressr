---
title: "Worked example — source discovery with no index: U.S. natural hazard statistics"
date: 2026-09-19
---

# Worked example — source discovery with no index: U.S. natural hazard statistics

The second [source-discovery](../source-discovery-playbook.md) run, deliberately chosen to be the case the first one could not test: **a source with no machine-readable index.** No API, no feed, no sitemap, no dataset listing, no bulk download. The documents are PDFs, and the only listing of them anywhere is a hand-maintained `<select>` menu on one HTML page — which is wrong.

The first run ([Tesla quarterly deliveries](tesla-source-discovery.md)) used SEC EDGAR, which publishes a machine-readable index of its own holdings. Half the playbook's rules lean on that. This run was about finding out which of them survive without one. The result is written up rule by rule in the [playbook](../source-discovery-playbook.md); this documents the route, including the four candidate sources that were rejected and the two bugs that got as far as the CSV.

The dataset is [`datasets/climate-and-environment/us-natural-hazard-statistics`](../../datasets/climate-and-environment/us-natural-hazard-statistics).

## The question

*How many people does weather kill in the United States, and what kills them?* — with the immediate follow-up that makes it a data question rather than a wish: **per what, over what period, on whose count.**

## Source selection: five candidates, and the licence gate did the deciding

| Candidate | Index? | Reachable? | Licence | Verdict |
|---|---|---|---|---|
| **usmint.gov** — circulating coin production by year and mint | not reached | **HTTP 403**, a Cloudflare managed challenge served in place of `/robots.txt` | not reached | Rejected. A 403 is an answer. |
| **bep.gov** — annual currency production figures | **has `sitemap.xml`** (35 KB) | the production-figures page **timed out** after 30s; `robots.txt` served fine | not reached | Rejected twice over: an index exists, so it is the wrong shape for this run, and the target page did not load. |
| **archives.gov** — Electoral College results by election | **`sitemap.xml` enumerates all 61 of its per-election pages (1788–2024)** | 200, `Crawl-delay: 10` | US federal, clean | Rejected *for this run only*. It is a perfectly good source; it just has the index this run exists to do without. |
| **federalreserve.gov** — FOMC Summary of Economic Projections | **no `robots.txt`, no `sitemap.xml`** (both 404), no API, no bulk download | 200 for every SEP page probed, 2012 and 2024 alike | **could not be resolved** | **Rejected on the licence.** Structurally the best match found. Four likely terms pages (`/aboutthefed/policies.htm`, `/terms-of-use.htm`, `/copyright.htm`, `/website-policies.htm`) all 404; the one that exists, `/website-linking-policies.htm`, says nothing about reuse of the Board's own material — its only copyright paragraph is about *external* sites. |
| **weather.gov** — NWS annual natural hazard statistics | **no `robots.txt`, no `sitemap.xml`** (both 404), no API, no feed, no bulk download | 200 | **stated plainly on its own disclaimer page** | **Chosen.** |

The Federal Reserve rejection is the one worth dwelling on. It would have made a better story — the SEP is a richer dataset than this one — and the public-domain argument for a federal agency's own statistical tables is a reasonable argument. It is not a *stated* one, and the previous run's licence position is [still unratified](../handoffs/cloud-queue.md); taking a second inferred position on top of the first is how a project ends up with a licence policy nobody ever decided. So: rejected, recorded, and left for whoever has the owner's answer.

`weather.gov` needed no inference:

> The information on National Weather Service (NWS) Web pages are in the public domain, unless specifically noted otherwise, and may be used without charge for any lawful purpose so long as you do not: 1) claim it is your own […], 2) use it in a manner that implies an endorsement or affiliation with NOAA/NWS, or 3) modify its content and then present it as official government material.

Archived as `archive/disclaimer.html`, quoted in `datapackage.json`, and the three conditions are met by attributing the source and publishing a derived compilation.

**The generalisable finding is the correlation, and it runs the wrong way.** A site modern enough to publish an explicit reuse licence is usually modern enough to publish a sitemap; a site plain enough to have no index is usually old enough to have no stated terms either. Four of the five candidates above fail on exactly one of the two axes. That difficulty is a property of the search rather than of this particular question, and it shows up as candidates burned rather than as minutes spent — see the budget note below.

## What "no index" actually meant here

There is no listing of these documents anywhere except a Dreamweaver-era jump menu on `https://www.weather.gov/hazstat/`:

```html
<select name="select" onchange="MM_jumpMenu('parent',this,1)">
  <option selected="selected" value="#">U.S. Summaries</option>
  <option value="/media/hazstat/sum25.pdf">2025</option>
  ...
  <option value="/media/hazstat/sum95.pdf">1995</option>
</select>
```

So the selection rule is *"every year the menu offers"* — 31 of them, 1995 to 2025. `fetch.ts` archives the hub page, parses that menu, and takes the year from the option's **label** and the path from its **value**, checking the two against each other rather than reconstructing `sum25.pdf` from `2025` by arithmetic. There are nine more identical menus on the page (one per hazard, plus state summaries); the national totals are only in the first.

And then:

> **1995: HTTP 404.** The menu offers a document the server does not have.

That is the finding this whole run exists to produce. **With no index, the listing you have is an editorial artefact, and it can be wrong in both directions** — it can offer what does not exist, and there is nothing to tell you whether it omits what does. An index generated from holdings cannot make the first mistake. A hand-maintained menu can, and did, and would have looked like a fetch failure to anyone not recording HTTP status per candidate.

`fetch.ts` therefore treats a non-200 as data rather than an error: it records the status for every candidate and only throws if *nothing* was retrieved. The coverage resource publishes all 31 rows, 404 included.

## What the source actually supports

Established from reading a sample before writing the parser, not after:

- **Deaths, injuries, property damage and crop damage, per event type, per year.** 1997–2025.
- **The counts are Storm Data's**, compiled by NWS forecast offices — and the hub page (not the summaries: the phrase appears in none of the 30 PDFs) names the CDC, not the NWS, as the official US source of cause of death. Two different series; this is not the death-certificate one.
- **A hurricane row is wind only.** Surge, rainfall flooding and tornadoes from the same storm are counted under Flood and Tornado. **No row is the full cost of a named storm**, which is the single most likely way this dataset gets misused.
- **Damage is nominal**, in dollars of the year reported.
- **Two layouts and a moving vocabulary.** `Tstm Wind` becomes `Thunderstorm Wind` in 2007; `Rip Current` appears in 2002; `Small Stream/Urban Flood` disappears after 2006; the total row is spelled `TOTALS`, `TOTAL` and `Total` in different years.

The question survived contact with the source better than the Tesla one did — "what kills people" is answerable at event-type grain — but the *hurricane-is-wind-only* rule changes what the answer means, and that had to be found by reading the PDFs' own notes rather than the table.

## The extraction, and where it nearly went wrong

Plain HTTP throughout, 35 requests paced at 1.5s — 31 candidates, the hub page, the terms page, and `robots.txt` and `sitemap.xml`, both probed and recorded as 404 so the "no index" claim has evidence in `archive/` rather than resting on the README's word. One dependency, `pdfjs-dist`, because the source is PDFs.

**The trap that would have been silent.** The two layouts' column positions overlap: a *legacy* injuries figure sits at almost exactly the horizontal position a *modern* fatalities figure sits at. A single hard-coded column template would have read an entire decade into the wrong columns and produced a complete-looking table with the right number of rows. So `build.ts` calibrates the five columns per document, from the median right edge of that document's own five-figure rows — right edges, because the figures are right-aligned and the left edge moves with the digit count, as it does in 2005 where the tropical-cyclone death toll is four digits.

**Three failures caught by an assertion, in order:**

1. The header detector matched the legacy layout's own *title*, which wraps as "Summary of 1997 Weather Events, Fatalities," / "Injuries, and Damage Costs". Requiring all three column names on one line fixed it. Two out of three was not enough.
2. The modern layout wraps its column headers over three lines, which then look like category headings. Fixed by skipping rows before the first known category — but only while they carry no figures, so a real data row in that position stops the build.
3. A `Report generated: …` footer sits inside the table region on page 1 of every modern PDF. Fixed with an allowlist of page-furniture shapes derived by listing *every* figure-less row inside the table across all 29 extractable years — three shapes, exactly.

**And two failures that no assertion caught, found by reading the output:**

4. **`River Flood}}`** was published as an event name for six years. In the legacy layout a hand-drawn brace on the River Flood line carries a Flood-category subtotal, and in six of the ten legacy years the `}` is a real text run. It was being folded into the label. **Every row count and every arithmetic check passed with it there** — the figures were right; only the name was wrong.
5. **The coverage table's `layout` column said "modern" for all 29 years.** It was computed with `rows.some(r => /^totals$|^total$/.test(r.hazard)) && year <= 2006`, and the legacy label is uppercase `TOTALS`, so the test was always false and every document fell through to "modern". A hard-coded year cutoff, wrong twice: wrong in its answer, and wrong to be inferring from the year at all. It now reads the layout off the header the document itself prints.

Both are the same species as the Tesla run's coverage-table error: **the count was right and the label was wrong.** Neither was found by a check. Both were found by printing the vocabulary and the coverage table and looking at them.

**And two more that only an adversarial review found, both latent rather than shipped.** A reviewer re-derived all 788 values independently — zero mismatches — and then went looking for what the build *could* get wrong without failing. It found two, and demonstrated both by mutation:

6. **A row could be dropped and every check still pass.** Delete `Volcanic Ash` from the parser and 29 rows vanish, the build exits 0 and all tests pass: an event with no deaths, no injuries and little damage subtracts nothing from any total. The damage tolerance was also 430× looser than the source ever needs (worst real drift 0.03 M$ against a 13.0 M$ limit). Fixed by asserting the **expected event vocabulary per year** — the only check that can see an absence — and tightening the tolerance.
7. **A whole-era column swap was invisible.** Swap fatalities with injuries and property with crop for 2007 onwards: 507 rows wrong, exit 0, all tests green. Property + crop = total survives a swap, the year total is swapped too, and the row counts do not move. The *legacy* era was already protected — the braced flood subtotal catches it, which is the best argument yet for taking every redundant number a source offers. The modern era had no equivalent, and no assertion anywhere was anchored outside the pipeline. Fixed by adding six five-tuples **read off the PDFs by hand** as the negative control.

That is the sharper version of §6's lesson. This run's own checks were all derived from the thing they were checking, so they moved with it; what caught the two latent bugs was an assertion anchored outside the build, and a reviewer willing to break the code on purpose to see whether anything screamed.

## Checks that earn their keep

The source hands over three independent cross-checks, and the build takes all of them:

- **Property + crop = the row's own printed total**, in all 788 rows.
- **The event rows sum to the year's own total row**, exactly, for fatalities and injuries. This is what proves no row was dropped — a missing row looks exactly like a row that does not exist.
- **The legacy brace's Flood subtotal** equals the flood rows it brackets. The source printed a redundant number; that makes it a free audit.

Plus: contiguous years *and* the newest served document produced rows; categories appear once each in the source's own order; every label matches the shape of a label (which is the check `River Flood}}` failed once it existed); the primary key is unique; every archived file matches its manifest SHA-256 before parsing.

**Independently re-derived.** A second extractor was written that shares no code with `build.ts` and does not use `pdfjs-dist` at all — it decompresses the PDFs' content streams and tracks the text matrix through the `Tm`/`Td`/`TJ` operators itself. Across ten years spanning the range (1997, 1998, 2002, 2005, 2006, 2007, 2012, 2016, 2020, 2025) it reconstructed **181 published rows and disagreed with none of them**, including the braced legacy flood rows and the four-digit 2005 tropical-cyclone death toll. The rows it could not reconstruct are its own limitation — it merges pages and concatenates label runs, so rows whose figures collide with the age table on a later page fall out — and not a disagreement. That is a 23% sample, not a proof; it is the check that is independent of the thing it is checking, which is what §6 of the playbook asks for.

## Coverage

| Range | Documents | Status |
|---|--:|---|
| 1997–2025 | 29 | **Extracted**, no gaps. 759 event rows + 29 annual totals. |
| 1996 | 1 | **Discovered, not extracted.** Scanned image, no text layer. Recorded as such rather than OCR'd. |
| 1995 | 1 | **Does not exist.** Listed by the menu; server returns 404. |

Discovered and deliberately not extracted: the per-state summaries, the nine per-hazard menus, and the fatalities-by-sex-and-age table on the last page of each modern PDF. Real follow-ups, not oversights.

## Autonomy log

**Human interventions during execution: zero.** The contact identity (`hello@datahub.io`) was pre-authorised by the owner, as in the first run. The one decision that would have needed a human — the Federal Reserve licence question — was resolved by *not taking it*: rejecting the candidate is a decision an agent can make on its own, where asserting a licence position is not.

**Budget spent:** **15.6 minutes** from the start of the run to the first archived byte, measured from the timestamps in `archive/manifest.json`, and that includes reading the repository's own conventions first. The playbook's 60-minute discovery budget was not close to binding — an earlier draft of this note claimed it nearly was, which the timestamps do not support. What *did* grow against run 1 is the number of candidates burned: five rather than three, four of them rejected, and every rejection on one of the two axes above. The paced download was 35 requests in about a minute against one host, with no retries and no rate-limit rejection.

**Tools:** `curl` for reachability probes; Node's built-in `fetch`; `pdfjs-dist` for PDF text; `node --test`.

**Decided unaided:** the five-candidate comparison and the rejections; the menu-as-selection-rule; recording HTTP status per candidate rather than failing on 404; the fetch/build split with a hashed manifest; the schema and primary key; publishing the source's total row flagged rather than dropping it; `hazard_id` folding exactly two spelling changes and no more; leaving the 1996 scan unextracted; the per-document column calibration.

## What this run adds to the playbook

Written up properly in [`docs/source-discovery-playbook.md`](../source-discovery-playbook.md), rule by rule. The short version:

- **§2 "find indexes, not documents" did not apply, and the workflow survived it** — but only because a *substitute* selection rule was available (a hand-maintained menu) and could be checked against reality (a 404). Where no listing at all exists, this run still says nothing.
- **§6 "count what you selected" held, and was again necessary and not sufficient** — for the second time in two runs, the thing it failed to catch was a *label*, and the thing that caught it was a person reading the output.
- **§3's ranking finally broke a tie**, which it never did in run one: four candidates were reachable and only one had stated terms.
- **The licence rule is now the binding constraint in practice**, not the index rule. That was not visible from one case.
- **The wall-clock budgets are still not calibrated by anything.** Two runs, neither of which came near them.
