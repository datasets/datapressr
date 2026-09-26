---
title: "Source-discovery playbook"
date: 2026-09-19
---

# Source-discovery playbook

How to get from *a data question* to *a source-backed extraction plan* — the step before `archive` and `structure`, which both assume you already have the source.

**Evidence base: two cases.** Everything here is derived from two worked examples:

1. **Tesla quarterly deliveries** ([walkthrough](examples/tesla-source-discovery.md), [dataset](https://github.com/datasets/datapressr/tree/main/datasets/transport/tesla-quarterly-deliveries)) — SEC EDGAR, which publishes a machine-readable index of its own holdings.
2. **U.S. natural hazard statistics** ([walkthrough](examples/nws-hazard-source-discovery.md), [dataset](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/us-natural-hazard-statistics)) — the National Weather Service, chosen deliberately because it has **no machine-readable index at all**: no API, no feed, no sitemap, no dataset listing, no bulk download, and the only listing of its documents anywhere is a hand-maintained HTML menu that turns out to be wrong.

Rules are marked **[tested]** with what tested them, or **[untested]** where they remain extrapolation. Where run 2 tested a rule the first run could not, the rule says so; where run 2 could not test a rule *because there was no index*, it says **[did not apply]** and what stood in its place. Tags are promoted and demoted on evidence only — several rules below are still **[untested]** after two runs, and one has now failed the same way twice. See [Limitations](#limitations-of-learning-from-two-cases).

## Where this sits

| Skill | Starts from | Produces |
|---|---|---|
| [`capture`](https://github.com/datasets/datapressr/blob/main/skills/capture/SKILL.md) | A passing thought, a URL, a factoid | A remembered question, filed and not yet researched |
| **source discovery** (this document) | A question, and no source | A named source, terms evidence, a coverage statement and a schema proposal |
| [`archive`](https://github.com/datasets/datapressr/blob/main/skills/archive/SKILL.md) | A known source | Raw bytes in `archive/` with provenance |
| [`structure`](https://github.com/datasets/datapressr/blob/main/skills/structure/SKILL.md) | An archived snapshot | Typed, tidy `data/*.csv` + `datapackage.json` |

The boundaries that matter. `capture` remembers a question without judging it; discovery is what happens when someone decides to pursue it. `archive` saves a source you have already chosen; discovery is choosing it, and produces the manifest `archive` then fills. `structure` transforms a snapshot; discovery decides what the snapshot should even contain. The handoff between discovery and `archive` is the **source manifest** — without one, `archive` is guessing at scope.

---

## The workflow

### 1. Pin the question against reality before writing any code

A data question is usually a wish, not a specification. Write down what you would need for it to be answerable:

- **Measurement** — what exactly is being counted, in what unit. Not "sales": *vehicles delivered to a customer with paperwork complete*, which is a different number from *vehicles built* and neither of which is revenue.
- **Granularity** — per what entity, at what time grain.
- **Coverage** — which periods, and what you will do about the ones that don't exist.

Then, after you have found a source, **come back and rewrite this**. This is the step that earns its place.

> **[tested]** The Tesla question was "quarterly sales by vehicle over time". The source supports *production and deliveries by model group*, where no individual model is reported in the table era and the grouping changes twice. Half the work was establishing that; the value was in not papering over it. The published `vehicle_group` field preserves the source's own labels and the README states plainly that `Total` is the only series continuous across all 29 quarters.

> **[tested again, run 2]** The question was "how many people does weather kill in the US, and what kills them". The source answers it at event-type grain — but a hurricane row counts **wind only**, with the same storm's surge, rainfall flooding and tornadoes filed under Flood and Tornado, so no row is the full cost of a named storm. And the counts are Storm Data's, not death certificates; the source's hub page names the CDC as the official US source of cause of death — a caveat that sits on the listing page and in none of the 30 documents, so reading only the documents would have missed it. Neither fact is in the table. Both are in the dataset's `description`, its field descriptions and its README.

**Rule: never promise finer granularity than the source supports, and say so in the dataset's own metadata rather than only in a commit message.** **[tested twice]** — and run 2 widens it slightly: the thing you must not over-promise is not only *granularity* but **what the number counts**. "Deaths from hurricanes" and "deaths the NWS attributes to hurricane wind" are different claims at identical grain.

### 2. Find candidates by looking for indexes, not documents

Search for the thing that *lists* the documents, not the documents. A source that publishes a machine-readable index of its own holdings turns "I found some releases" into "I found the set of releases, and here is the rule that defines it" — and that is the difference between a scrape and a dataset, because only the second one has auditable coverage.

> **[tested]** `https://data.sec.gov/submissions/CIK0001318605.json` plus its pre-2018 overflow file lists all 1,750 Tesla filings with form type, date and 8-K item numbers. The selection rule — form 8-K, items include 2.02, filed in month 1/4/7/10 on day ≤ 10 — is one line, is written down in `fetch.ts`, and is reproducible by anyone.

**[partly tested, run 2]** Candidate index shapes worth looking for: a regulator's filing index, a statistical agency's dataset catalogue API, a `sitemap.xml`, an OAI-PMH or DCAT endpoint, a DOI prefix listing, a GitHub repo of releases. Run 2 probed `robots.txt` and `sitemap.xml` on every host it looked at, as its first action on each, and that one cheap pair of requests settled the index question for four of its five named candidates: `archives.gov` and `bep.gov` serve complete sitemaps (`archives.gov`'s lists all 61 of its per-election pages, 1788 to 2024), `weather.gov` and `federalreserve.gov` serve neither file. **Probing for the index before probing for the documents is now [tested], and it is the cheapest discriminator found so far.** The other shapes on this list remain untried.

### 2a. When there is no index — run 2's case

> **[did not apply]** The NWS serves no `robots.txt`, no `sitemap.xml`, no API, no feed and no bulk download. The only listing of its 31 annual summaries anywhere is a Dreamweaver-era `<select>` jump menu on one HTML page.

What stood in for an index, and what it cost:

- **The selection rule became "every year the source's own menu offers"** — which is still a written-down, reproducible rule, and `fetch.ts` parses the menu rather than generating URLs. Taking the year from each option's *label* and the path from its *value*, then checking the two against each other, keeps a mismatch visible instead of reconstructing `sum25.pdf` from `2025` by arithmetic.
- **And the menu was wrong.** It offers a 1995 summary; the server returns **HTTP 404** for it.

**Rule: a hand-maintained listing is an editorial artefact, not an inventory, and it can be wrong in both directions.** **[tested, run 2, by the listing being wrong]** — it can offer documents that do not exist, and nothing tells you whether it omits documents that do. An index generated from holdings cannot make the first mistake; a menu someone types can, and did. The practical consequence: **fetch must treat a non-200 as data, not as an error.** Record the HTTP status of every candidate, fail only if *nothing* was retrieved, and publish the failures in the coverage resource. A run that throws on the first 404 reports a broken fetch; this one reports a wrong menu, which is the true finding.

**The half this run still cannot speak to:** the second direction. Nothing here establishes whether the menu omits a summary that exists, and with no index there is no way to find out short of guessing URLs. Coverage against a hand-maintained listing is therefore **auditable against the listing, and not against reality** — a strictly weaker claim than run 1's, and one the dataset's own README has to state rather than imply.

### 3. Compare candidates; record the rejected ones

Probe each candidate and write the result down — a rejection with a reason is a finding, and the next agent should not have to re-discover it.

> **[tested]** Three candidates for the same press release. Tesla investor relations: **HTTP 403** to a plain client, including the site root. The Business Wire copy: **HTTP 403**. SEC EDGAR: **HTTP 200**. The publisher's own copy was the worst option of the three.

> **[tested again, run 2, and this time the ranking had to decide]** Five candidates, four of them rejected and every rejection recorded with its probe result: `usmint.gov` **403** behind a Cloudflare challenge; `bep.gov` a complete `sitemap.xml` and a **30-second timeout** on the target page; `archives.gov` **200** with a sitemap enumerating all 61 of its per-election pages; `federalreserve.gov` **200**, no `robots.txt`, no `sitemap.xml`, and **no reuse statement that could be found** — four candidate terms URLs all 404, and the one that exists talks only about *external* sites. `weather.gov`: **200**, no index, and an explicit public-domain statement on its own disclaimer page.

Rank on these, in this order:

1. **Primary, not a copy.** A filing beats a wire copy beats an aggregator. **[untested]** as a ranking after two runs — in run 1 the primary source was also the only reachable one, and in run 2 every candidate was a primary publisher. It has still never broken a tie.
2. **Reachable without pretending to be something you are not.** A 403 is an answer. Do not work around it with a spoofed browser user-agent; record it and move on. **[tested twice]** — run 2's `usmint.gov` 403 is a Cloudflare managed challenge, which is the modern shape of this and is *designed* to be defeated by a browser-like client. It was recorded and abandoned, not defeated.
3. **Documented access terms.** Prefer the source that tells you how it wants to be accessed. **[tested, and promoted: in run 2 this criterion decided the run.]** Four of the five candidates were reachable; exactly one stated terms for reuse of its own material, and that is the one that got built. In run 1 this never had to break a tie. It does now, and on the evidence of two runs it is the criterion that binds most often in practice — see §4.
4. **Stable citation per record. [tested twice]** — run 1 used EDGAR accession numbers. Run 2's citation is weaker but real: a stable per-year URL and the archived filename, carried into `source_document` and joined to the coverage resource. **Weaker in a way worth naming:** a URL is a location, not an identifier, and the source can replace what sits at it without telling you. The archived bytes plus the manifest SHA-256 are what make the citation checkable, not the URL.
5. **An index** (step 2). **[tested, and demoted from a requirement to a preference.]** Run 1 could not weigh it because no candidate lacked one. Run 2 weighed it and it lost: `archives.gov` had the best index of any candidate and was set aside, and the source that got built has none at all. **A source with no index is workable.** What it costs is stated in §2a: coverage becomes auditable against a listing rather than against reality. That is a real loss, and it is not a veto.

Secondary aggregators are for **finding gaps and corroborating**, never for substituting a figure. **[untested after two runs]** — in force both times, exercised neither time. Run 2 had an obvious opportunity and declined it: the 1996 summary is a scanned image, and the figures in it are quoted in later NWS documents and in secondary trackers. They were not substituted; the year is published as discovered-and-not-extracted. So the rule was *obeyed* under temptation, which is weak evidence that it works and no evidence at all about the corroboration half.

**New in run 2 — the licence is a gate, not a ranking criterion.** A source whose terms cannot be resolved does not score badly; it is **not a candidate**, however good its shape. Run 2 applied this to the best-shaped candidate in its set and lost the better dataset by it. Criterion 3 above is about *access* terms (how the source wants to be fetched); this is about *reuse* terms (whether what you publish is lawful), and run 2 is the first evidence that the two come apart: `federalreserve.gov` documents neither, and turned out to be fetchable and not republishable.

### 4. Establish terms before extracting, and record uncertainty as uncertainty

Find and quote the access terms and the licence. If there is no licence, say there is no licence.

> **[tested]** No redistribution licence is granted by Tesla or the SEC for the filings. The dataset therefore licenses *the compilation* (extracted figures, schema, build scripts) under PDDL-1.0 and states explicitly that no licence is claimed for the press-release prose, which it does not republish. An earlier draft of `fetch.ts` cited 17 U.S.C. §105; a review caught that §105 covers government-*authored* works, not third-party filings the government hosts, and it was removed.

> **[tested again, run 2, and this time it cost the better dataset]** The FOMC Summary of Economic Projections on `federalreserve.gov` was the best structural match run 2 found: no `robots.txt`, no `sitemap.xml`, no API, no bulk download, HTML tables served reliably from 2012 and 2024 alike. Four plausible terms URLs 404'd, and the page that exists says nothing about reuse of the Board's own material. A public-domain argument was available — a federal agency's own statistical tables, and tables of facts besides — and it was **not taken**, because "arguable" is not "stated" and the project already has one unratified licence position outstanding. The candidate was rejected at probe time and the reasoning recorded.
>
> **Update 2026-09-20:** the owner ratified the Tesla PDDL-1.0 position and ruled that a public-domain position may be assumed for a US federal agency's own statistical tables, so the Fed SEP is unblocked and is the source for the third rep (`datapressr-jn8`). The rejection above was correct on the rule as it stood then; the rule now is that this position needs no per-source argument, only a record of the assumption in `datapackage.json` and the README.
>
> The chosen source needed no argument at all. The NWS says it in its own words, and the page is archived as `archive/disclaimer.html`: *"The information on National Weather Service (NWS) Web pages are in the public domain, unless specifically noted otherwise, and may be used without charge for any lawful purpose…"*

**Rule: never invent a redistribution licence. [tested twice]** — run 1 caught a bad §105 citation in review; run 2 caught a *plausible* §105-shaped argument before it was written down, and paid for it by giving up a richer source. Note the asymmetry the two runs together show: **the rule is cheap when the licence resolves and expensive when it does not**, and the expensive case is the one that tests it.

**Run 2 adds a third outcome the original rule did not name.** The playbook said: resolve the licence, or keep a stub and record publication as blocked. There is an earlier and better exit — **reject the candidate at probe time and go find another one.** Establishing terms belongs with the reachability probe, before any extraction, precisely so this exit is available. Doing it that way cost one round of probing; doing it after extraction would have cost a build.

The two downstream procedures remain **[untested]** after two runs, and it is worth being exact about why. *If permissions cannot be resolved, keep a stub package plus the evidence report and record publication as blocked* — run 1 never reached it because the licence resolved, and run 2 never reached it because it took the new third exit instead. **The blocked-publication path has now been available twice and walked zero times.** That is the single least-tested rule in this document, and it is exactly what the outstanding third rep is for.

**Escalation:** anything that commits the project in the real world is not the agent's call. Declaring a contact identity to a regulator, agreeing terms of service, creating an account, paying for access — stop and ask. **[tested] for the contact-identity case only**, and weakly, in both runs: `hello@datahub.io` was settled by the owner beforehand each time, so it was never escalated in-run. Terms of service, accounts and payment have now failed to arise twice, so those three remain **[untested]**. No human input was needed during either execution.

**Run 2 sharpens what does *not* need escalating.** Taking a licence position commits the project and is the owner's. **Declining a source does not**, and an agent that treats every licence doubt as a question for a human will stall on work it could have finished elsewhere. The escalating move here would have been "may I publish the Fed data under a public-domain claim?"; the correct move was to reject the candidate and build something else. **[tested, run 2]**

### 5. Choose the extraction route from the format you observed

Try plain HTTP first. Escalate only when you have evidence you must, and record what forced it.

> **[tested]** Plain HTTP throughout; no browser was needed. `fetch.ts` uses built-in `fetch` with a 30s timeout, 3 capped retries with exponential backoff, and 250ms sequential pacing — at most 4 requests/second against a documented ceiling of 10.

> **[tested again, run 2]** Plain HTTP again; no browser, and the one candidate that would have needed a browser-like client (`usmint.gov`, behind a Cloudflare challenge) was rejected rather than accommodated. 33 requests paced at 1.5s against a source that documents no rate limit and serves no `robots.txt` — the absence of a stated ceiling is a reason to be *more* conservative, not less. One dependency, `pdfjs-dist`, because the documents are PDFs and nothing built in reads them.

**Budgets. [still untested after two runs — the wall-clock budgets have again not bound, and the interesting cost was not wall clock.]** Run 1 spent about half an hour end to end. Run 2 took **15.6 minutes from task start to the first archived byte**, and that includes reading this repository's own conventions first; the paced download itself was 50 seconds for 33 requests. The 60-minute discovery budget was not close to binding, the 15-minutes-per-blocked-candidate budget never fired (run 2's slowest rejection was a 30-second timeout), and the per-request limits (30s, 3 attempts, backoff) were again never reached. **Treat every wall-clock figure in this document as a description of two easy runs, not as a calibration.**

What *did* grow between the runs is the **number of candidates that had to be rejected**: three in run 1, five in run 2, four of them rejected. And the reason is worth stating because it will recur, in §2a and §4's terms: **the index-free property and the cleanly-licensed property are anti-correlated.** A site plain enough to serve no sitemap is usually old enough to state no reuse terms; a site modern enough to publish a licence usually publishes a sitemap too. Every one of run 2's four rejections failed on exactly one of those two axes.

So: **budget discovery by the number of constraints, not by the number of candidates** — but note that this run has no evidence about how long that actually takes, only about how many candidates it burned.

**Rule: read the declared type; never infer a document's identity from anything outside the document.** **[tested twice, by failing twice — and the generalisation is run 2's contribution.]** Run 1 matched `/ex.?99/` against filenames; exhibit names drift with whoever filed them (`d106308dex991.htm`, `tsla-ex991_6.htm`, `tsla-ex99_1.htm`, `exhibit99111111.htm` all occur in one series) and the pattern silently dropped **the eight most recent quarters**, exiting 0. Run 2 made the same mistake wearing different clothes: it decided which of two **table layouts** a document used with `year <= 2006`. The legacy label is uppercase `TOTALS`, the test was case-sensitive, and **every one of the 29 documents was labelled "modern"** in the published coverage table while every figure in it was correct. The fix in both cases is identical: read the property off the document — EDGAR's Type column in run 1, the column header the PDF itself prints in run 2. Filename, URL and *date* are all outside the document.

**Rule: verify the endpoint you intend to depend on across the whole range, not just at the recent end.** **[tested twice, by failing twice.]** Run 1: `<accession>-index-headers.html` is listed in EDGAR's directory JSON but **404s** on pre-2015 filings, so the run died on the 2013 filing. Run 2: the header detector required "Weather Event" and "Fatalities" on one line, which matches the legacy layout's own wrapped *title* ("Summary of 1997 Weather Events, Fatalities," / "Injuries, and Damage Costs") — it failed first on the **oldest** document, not the newest. Run 2 also shows the version of this that does not fail loudly: the two layouts' column positions **overlap**, with a legacy injuries figure sitting almost exactly where a modern fatalities figure sits, so one hard-coded column template would have read a decade into the wrong columns and produced a full-looking table. The build calibrates columns per document from that document's own rows instead. **A range-spanning check is not just about coverage; it is how you discover that the format has two of something.**

### 6. Count what you selected, and publish the count

This is the rule the Tesla run would most want a future agent to have.

> **[tested], three times by failing.** All three bugs in the run were the same shape: **a selection heuristic that returned fewer rows instead of an error.** A missing row looks exactly like a row that does not exist. What caught each one was counting — 49 candidate filings but only 42 exhibits retrieved; 50 exhibits but 49 accounted for. The third was a classifier written against recent wording (`production|deliveries`) that missed the 2015 headline style ("TESLA DELIVERS 11,507 VEHICLES IN Q2 OF 2015"), so a real release was filed under "not a delivery release".

Concretely:

- **Publish a coverage resource**, not just a prose note. **[tested twice]** Run 1's `data/source-filings.csv` lists all 50 archived exhibits with a `layout` and an `extracted` flag. Run 2's `data/source-documents.csv` lists all **31** candidates the source's menu offered — including the 1995 document that does not exist and the 1996 one that is a scanned image — with the HTTP status of each. **Run 2 adds a required column for index-free sources: the HTTP status per candidate**, because when the listing is hand-maintained, "we asked and it wasn't there" is a finding about the source rather than a failed fetch.
- **Assert the sequence has no interior gaps**, and separately **assert the newest record produced output** — a gap check alone cannot see a series truncated at its far end. The interior-gap check is **[tested twice]**. The newest-record check is **still [untested] after two runs**: present in both builds, has caught nothing in either. It remains an argument, not a finding.
- **Derive any classifier from a sample spanning the whole range**, not the recent end. **[tested twice, by failing twice.]** Run 1's release classifier was written against recent wording. Run 2's header detector failed on the oldest document. Run 2 then did it properly for the next classifier and it is worth copying: to decide which non-data rows may appear inside the table, it **listed every figure-less row between header and total across all 29 extractable years** — exactly three shapes, two of them present only in the modern layout — and allowlisted those three, with anything else stopping the build. Enumerate the whole range, then allowlist; do not pattern-match a sample and hope.
- **Cross-check derived metadata against the document.** **[tested twice, and in run 2 by failing.]** Run 1 derives the quarter from the filing date and verifies it against the release's own headline. Run 2's `layout` column was derived from the *year* and was wrong for all 29 documents, precisely because nothing cross-checked it against the document. It now reads the header the document prints. **The lesson is that "derived metadata" includes the columns of the coverage resource itself**, which is the artefact least likely to be checked because it is the one doing the checking.
- **Take the redundant numbers the source gives you.** **[tested, run 2, and proven load-bearing by mutation]** The NWS summaries print property damage, crop damage *and* their sum on every row; an annual total row that the event rows sum to exactly; and, in the legacy layout, a braced Flood-category subtotal beside the River Flood line. All three are free audits. The brace is the one that earned its keep: an adversarial review swapped two column pairs for a whole era, and **the legacy era caught it — on the brace — while the modern era, which has no such redundancy, did not notice at all.** Where a source prints a number it did not have to, take it.
- **Assert the record *set*, not just the record count. [tested, run 2, by mutation]** Arithmetic cannot see an absence: delete an event that had no deaths, no injuries and almost no damage, and every total still reconciles, every row count still matches the coverage resource, and the build exits 0. Only an expectation about *which* records should exist can catch it. Run 2's build now carries the source's event vocabulary with the year range of each label, so a dropped row — or a genuinely new one — stops the build and has to be looked at.
- **Keep at least one assertion anchored outside the pipeline. [tested, run 2, by mutation — and this is the sharpest thing either run has produced.]** Every other check in run 2's build was derived from the same extraction it was checking, so it *moved with it*: swapping fatalities with injuries and property with crop across nineteen years left all 513 of the modern era's rows wrong — 463 of them visibly different — with every sum reconciling, every count unchanged, the coverage table intact and all thirty-two tests as they then stood still green. What catches that is a handful of figures **read off the source documents by a human and typed in as literals** — six five-tuples, one per era plus the awkward rows. A self-consistent pipeline can be uniformly and completely wrong; a literal cannot move with it.
- **Try to break your own build before someone else does. [tested, run 2]** Both of the above were found by *mutation*: deliberately damaging the parser in a scratch copy and checking whether anything screamed. Nothing did, twice. That is a cheap, repeatable technique and it is how a "necessary but not sufficient" rule stops being a slogan.

**And the count is necessary, not sufficient — and this is now the most strongly evidenced claim in the document, because it has happened in both runs, in the same shape, to the same artefact.**

Run 1: the Tesla dataset published a coverage resource and *still shipped two wrong rows*. An Investor Day announcement filed alongside the Q4 2022 release was classified as a prose delivery release, because the word "production" appears in its opening paragraph. That put 20 prose filings in the documentation where there were 19, and 1 non-delivery exhibit where there were 2. The coverage table did not catch it: the row count was right and only the labels were wrong. An independent adversarial review found it.

Run 2, knowing all of the above, did it twice more:

- **`River Flood}}` was published as an event name for six years.** In the legacy layout a hand-drawn brace sits beside the River Flood label and in six of the ten legacy years the `}` is a real text run, which was being folded into the label. Every row count and every arithmetic check passed with it there, because the figures were right.
- **The coverage table's `layout` column was wrong for all 29 rows**, as described in §5.

**Two runs, four wrong labels, zero caught by a count or an assertion.** The pattern is exact enough to state as a rule: *arithmetic checks the numbers, and nothing checks the names.* What caught run 2's two was printing the distinct label vocabulary and the coverage table and reading them, before review — which is cheap, takes one throwaway script, and is now the thing this section would most want a future agent to do.

Then run 2's reviewer found the deeper version of the same problem. Run 2's published figures were **entirely correct** — all 788 values re-derived independently, zero mismatches — but the build could be made to swap two column pairs across 513 rows, or to drop 29, **without a single check firing**, because every check it had was derived from the extraction it was checking. Redundancy the *source* provides (the legacy brace) caught one; nothing caught the other until six figures were read off the documents by hand and typed in as literals.

So: publish the count; assert the arithmetic; **print every distinct value of every categorical column you produced, and read it**; assert which records should exist and not merely how many; keep at least one assertion anchored outside the pipeline; and then try to break your own build and see whether anything screams. Classifying a record is a claim about the record, and a claim no sum can reach — and a self-consistent pipeline can be uniformly, completely and silently wrong.

### 7. Expect the reporting to change, and preserve the change

A long series is not one format. Record regime changes rather than smoothing them.

> **[tested]** Three grouping regimes across 29 quarters: `Model S/X` + `Model 3`, then `Model S/X` + `Model 3/Y`, then `Model 3/Y` + `Other Models` — plus a lease-accounting column that appears from Q3 2019 and is not published, which is a column change rather than a regime. And two layouts overall: the 19 releases before Q2 2019 state their figures in prose, with wording that changes release to release.

> **[tested again, run 2]** Two table layouts across 29 years, and a vocabulary that moves underneath them: `Tstm Wind` becomes `Thunderstorm Wind` and `Tropical Storm/Hurricane` gains spaces around its slash in 2007; `Rip Current` is first reported in 2002; `Small Stream/Urban Flood` is last reported in 2006; and the source's own total row is spelled `TOTALS`, `TOTAL` and `Total` in different years.

**Missing detail.** Where the source stops breaking something out, stop breaking it out. Do not reconstruct a `Model S` series from a `Model S/X` group. **[tested twice]** — run 2's version of the temptation was sharper, because two of its four label changes are *pure spelling* and two are *real appearances and disappearances*, and they look identical in a `distinct` query. The dataset publishes the source's label verbatim in `hazard` and a normalised `hazard_id` that folds **exactly the two spelling changes and nothing else**, with the reasoning in the code and the README. `Small Stream/Urban Flood` is not folded into Flash Flood, and `Rip Current` is not backfilled, because where those events were counted outside their own years is **not stated anywhere** — and a plausible guess would have produced a complete-looking series that is partly invented.

**Rule, added by run 2: a normalisation is a claim, so write down which ones you made and which you refused.** Publishing only the verbatim label is unhelpful (the series breaks at every re-typing); publishing only a normalised one is a claim with no evidence attached. Publish both columns.

**Revisions.** Retain both versions and state a preferred-version rule explicitly. **[tested, run 1 only]** — the Tesla build's rule is "the later filing wins, both snapshots stay in `archive/`", and separately the full-year recaps *do not reconcile* with the four quarters as first reported (2020 deliveries +630, 2021 +222) because Tesla restates without reissuing. Both figures are published, in separate resources, and the build prints the difference on every run rather than reconciling it away. **The instinct to make the numbers agree is the wrong one**; the disagreement is the finding. **Run 2 could not test this and the reason is instructive:** its documents carry a `Report generated:` date showing the source *does* regenerate them years later (the 2019 summary was last regenerated in 2021, the 2024 one in 2026), but with a single snapshot there is nothing to diff against. **With no index there is also no change feed**, so a no-index source cannot tell you it has revised anything; detecting revision means re-fetching and diffing, and nothing else.

**Unparseable eras.** Where a portion of the range needs a fundamentally different extraction, record it as discovered-and-not-extracted rather than reaching for one-off patterns whose failures are silent. **[tested twice]** — run 1 archived and listed 19 prose releases rather than guessing at them. Run 2's 1996 summary is a **scanned image with no text layer**: it is archived, listed in the coverage resource with the reason, and not OCR'd. Both runs paid an honest cost for this (run 1 lost per-model granularity; run 2 lost a year), and in both cases the alternative was output that could be wrong without being detectably wrong.

### 8. Hand off

Discovery is done when `archive` and `structure` can proceed without re-deciding anything.

**Source manifest** — per record: `source_id`, URL, local path, retrieval timestamp, byte count, SHA-256, and whatever identifies the period the record reports on (run 1: accession, filing date, report date and 8-K item numbers). Plus, per run: the selection rule in words, the candidate count, and the declared access identity. **[tested twice]** — see each dataset's `archive/manifest.json`.

**Run 2 adds two manifest fields, and both are consequences of having no index:**

- **`http_status` per candidate, and a null `path` where nothing was retrieved.** With a generated index, every entry exists and a manifest of retrieved files is a complete record. With a hand-maintained listing, the candidates and the retrievals are different sets, and the manifest has to hold both or the 404 disappears.
- **The terms page itself, archived as a record.** Run 2 fetches and archives `disclaimer.html` alongside the data, because the licence claim in `datapackage.json` quotes it and a quote with no archived source is the same unevidenced assertion this playbook's §4 exists to prevent. **[tested, run 2]** — cheap, one request, and it is the only evidence that the terms said what they said on the day.

**Handoff template:**

```
QUESTION          the original ask, verbatim
ANSWERABLE AS     measurement, granularity, coverage the source actually supports
SOURCE            chosen source + why, in one line
REJECTED          each candidate + the probe result (status code, date)
SELECTION RULE    the rule that defines the record set, how many it selects, and — where
                  the listing is hand-maintained rather than generated — how many of those
                  actually exist
TERMS             access terms quoted; licence, or an explicit "none found"
FORMAT            observed format(s); regime changes with the dates they change
COVERAGE          extracted / discovered-not-extracted / does-not-exist, with counts
SCHEMA PROPOSAL   fields, types, primary key, and what a missing value means
BUDGET SPENT      requests, wall-clock, retries
OPEN              anything needing a human
```

**Stop and escalate** when: access requires credentials, payment or agreeing to terms; the source declares a real-world identity requirement; the coverage count and the expected count disagree and you cannot explain why; or a budget is exhausted. **A documented access limit is a result, not permission to guess.** **[tested twice]**

**Amended by run 2: "a licence question cannot be resolved from published terms" is not by itself an escalation** — it is a reason to reject the candidate and look elsewhere, which an agent can do alone (see §4). Escalate when the licence is unresolved *and* there is no alternative source, so the choice is between blocking and guessing. Run 2 had an alternative and took it. **[tested, run 2]**

Run 2's coverage counts disagreed three ways — 31 listed, 30 served, 29 extracted — and each gap was explainable from the evidence (a 404, a scan with no text layer), so nothing escalated. **The rule is "disagree and you cannot explain why", and run 2 is the first case where it had something to not-fire on.**

---

## Replay: run 1, would this have prevented what actually went wrong?

The Tesla run recorded three failed approaches and **zero human interventions during execution** (one decision was pre-authorised). Replaying the workflow above against that log:

| What happened | Would the playbook have caught it? |
|---|---|
| Filename guessing dropped the 8 most recent quarters, exit 0 | **Yes, twice over** — §5 "read the declared type" forbids the approach outright, and §6 "count what you selected" catches the consequence (49 candidates, 42 exhibits). Honest caveat: both rules exist *because of* this failure. They would prevent a repeat; they did not prevent the original. |
| `index-headers.html` 404s on pre-2015 filings; the run died mid-way | **Partly.** §5 "verify across the whole range" would have moved the discovery from mid-run to probe time, which is cheaper — but it would still have been a discovery, not an avoidance. This one failed *loudly*, which is why it cost minutes rather than correctness. |
| Classifier written against recent wording missed the 2015 headline style | **Yes, and retrospectively** — §6's "derive any classifier from a sample spanning the whole range" is written from this exact failure, so it carries the same caveat as row 1. Caught in the original run only by reading the output rather than the exit code, which is itself the §6 lesson. |
| Zero human interventions | §4's escalation list matches what actually needed a human: the contact-identity decision, settled beforehand. No rule here would have manufactured an unnecessary escalation. |

An adversarial review after the fact found **no wrong numbers** — all 210 published values re-derived independently — but did find several further paths where the *extraction* could produce wrong or truncated output silently, and, more to the point here, **two wrong rows in the coverage resource itself**. The extraction paths are `structure`'s territory and the fixes live in `build.ts`. The coverage rows are squarely discovery's, and they are why §6 now says the count is necessary and not sufficient: the run's own headline artefact was wrong until someone else looked at it.

## Replay: run 2, against the rules run 1 wrote

The point of the second rep is that its failures were recorded *against a playbook that already existed*. So: did having it help?

| What happened in run 2 | Did the playbook catch it? |
|---|---|
| Five candidates probed, four rejected with recorded reasons | **Yes.** §3 is why the rejections were probed and written down at all, and §3's own ranking finally had to break a tie. |
| The best-shaped candidate (`federalreserve.gov`) had no resolvable licence and was dropped | **Yes, and this is the clearest win.** §4 forbade the plausible §105-shaped argument outright. Without the rule, and without run 1's §105 slip on the record, that argument would very likely have been made. |
| Header detector matched the legacy layout's own title; failed on the oldest document | **Yes, after the fact.** §5 "verify across the whole range" is exactly this, and it failed loudly and cost minutes — the same shape as run 1's `index-headers.html` 404. |
| Page-furniture rows inside the table region | **Yes, and preventively.** §6's "derive any classifier from a sample spanning the whole range" is why the allowlist was built by enumerating all 29 years instead of patching 2007 and moving on. |
| Column bands of the two eras overlap; a hard-coded template would have mis-read a decade | **Partly.** §5 points at whole-range verification, which is what surfaced the two layouts. It does not say "calibrate per document", which is the actual fix. That is new guidance, added above. |
| `River Flood}}` published as an event name for six years | **No.** Every rule in §6 passed. Caught by printing the label vocabulary and reading it. |
| Coverage `layout` column wrong for all 29 rows | **No.** §6's "cross-check derived metadata against the document" covers it in principle and the agent did not apply it to the coverage resource — the artefact doing the checking was the one not checked. §6 now says so explicitly. |
| A row could be dropped, or a whole era's columns swapped, with every check still passing | **No — and neither run's rules came close.** §6 said to publish the count and have something else check it; run 2 did both and was still wide open, because "something else" was still part of the same pipeline. Found by a reviewer mutating the build on purpose. §6 now carries three new rules from it. |
| Zero human interventions | §4's escalation list again matched what actually needed a human, and run 2 adds the case that does *not*: declining a source. |

**Five of nine caught, three missed, one partly.** Two misses are labels and are the same failure as run 1's; the third is the structural one above, which neither run had any rule for. That is the strongest single signal in this document: the rules were good at counts, bad at names, and blind to the possibility that the checking apparatus and the thing being checked were the same apparatus. The first two want a habit; the third wants an assertion anchored outside the build, and an agent willing to break its own code to find out.

## Limitations of learning from two cases

Stated plainly, because the acceptance bar for this document is that it makes no unsupported claim of generality. Run 2 resolved some of run 1's limitations and left others exactly where they were.

**What the second case did fix:**

- **The index question.** Run 1 said "the rules that lean on an index (§2, §6) may simply not apply where no index exists, and this document cannot say what to do instead." It can now: §2a says what stood in for one and what that costs. §2's core rule genuinely did not apply, and the workflow survived.
- **§3's ranking had never broken a tie.** It has now, twice over — on reachability and on stated terms.
- **§3's stated-terms criterion had never decided anything.** It decided run 2 outright, and §4 is now the binding constraint in practice rather than §2.
- **"The source was unusually good."** Run 2's is not: no index, no stated rate limit, PDFs, a listing that is wrong, a decade-long layout change and a scanned year.

**What two cases still cannot establish:**

- **The wall-clock budgets are still not a data point.** Run 1 never approached them; run 2 took 15.6 minutes to a snapshot and did not either. Two easy runs say nothing about a source that is slower, larger or more hostile, and an earlier draft of this section claimed run 2 had nearly exhausted its budget — it had not, and the claim was withdrawn against the timestamps in `archive/manifest.json`.
- **n = 2, and the second n is not independent.** Both runs were executed by the same kind of agent, in the same repository, under the same conventions, with the second explicitly reading the first's playbook before starting. That is replication of a procedure, not of a result, and it makes the "Yes" rows in run 2's replay table partly self-fulfilling.
- **The blocked-publication path is still untested**, and is now the *only* major path with zero exercises after two opportunities. §4 explains why. This is precisely what the third rep is for.
- **Both failure logs are still one species.** Run 1's three failures and run 2's five are all **silent under-selection or silent mislabelling**. Nothing here has tested partial responses, upstream content changing mid-download, ambiguous record identity, conflicting duplicate sources, authentication, pagination, or a rate-limit rejection actually encountered.
- **Neither run had to fall back on a secondary source**, so §3's aggregator rule is still asserted rather than tested — despite run 2 having an obvious opportunity (the 1996 scan) and declining it.
- **Neither run had to detect a revision.** Run 1 saw restatements because the source republished them; run 2's source revises silently and a single snapshot cannot see it. **A no-index source has no change feed**, and this document still says nothing useful about monitoring one.
- **Both sources are US-federal, English, small-data, and published as ordinary web documents.** No authentication, no non-Latin script, no jurisdiction where the licence default differs, nothing above a few megabytes.
- **The rules are still written by the agents that made the mistakes.** Run 2 caught two of its own label errors before review, which run 1 did not — that is a genuine improvement in the habit and not evidence that the *rules* work, since no rule caught them. And the two findings run 2 is proudest of came from an independent reviewer instructed to break the build, not from the playbook: **in both runs, the most valuable finding came from outside the agent doing the work.** Two for two is not a large sample, but it is not nothing, and no rule in this document currently says "get an adversarial review" — it is a convention of the runs, not of the playbook. That gap is worth closing before any of this is graduated. *Update 2026-09-26:* closed. The review is now a required step for custom-parser and many-document datasets in the [`structure` skill](https://github.com/datasets/datapressr/blob/main/skills/structure/SKILL.md) (step 7), with the full brief in [adversarial-review.md](https://github.com/datasets/datapressr/blob/main/skills/structure/references/adversarial-review.md).

## Graduating discovery into a skill: not yet, and the missing rep is a specific one

This document set its own condition for revisiting, and it is worth quoting rather than paraphrasing: *"two more discovery runs against structurally different sources — ideally one with no index at all, and one where the licence question does not resolve cleanly, since that path is the least tested rule here."*

**One of the two is now done.** Run 2 is the no-index rep, and it was structurally different in the way that mattered.

**The other is not, and run 2 made its absence sharper rather than smaller.** Run 2 *met* a licence-ambiguous source — `federalreserve.gov` — and **rejected it**, which was the right call for that run and means the blocked-publication path was not walked. So after two runs the least-tested rule in this document is exactly the same rule that was least-tested after one, and it has now had two opportunities and zero exercises. Graduating on this evidence would encode "reject and move on" as *the* answer to a licence question, when it is only the answer available when an alternative source exists.

So: **do not write a `discover` skill yet.** The condition this document set has been half met, and the unmet half is the one it called least tested.

Two further reasons, on top of the unmet condition:

- **The rules are good at counts and bad at names**, in both runs, and the fix found so far is a habit ("print every distinct categorical value and read it") rather than anything a skill could enforce. A skill written now would carry the well-tested half and the blind spot together, with equal authority.
- **Two cases, one procedure.** As the limitations say, run 2 read run 1's playbook before starting. That is not independent replication, and a skill is exactly the artefact that would make every future run non-independent too.

**What would change the answer:** the third rep, against a source whose licence genuinely cannot be resolved *and* where no cleanly-licensed alternative exists, so the run has to walk the blocked-publication path to its end — a stub package, the evidence report, and publication recorded as blocked. That rep is filed as the Bead `datapressr-jn8` and is blocked on the owner's ruling on the [`tesla-quarterly-deliveries` licence position](https://github.com/datasets/datapressr/blob/main/docs/handoffs/cloud-queue.md), for the same reason run 2 declined to take a second inferred position on top of the first.

## The original recommendation, from run 1: keep this a document

Three options were on the table — leave it as a document, extend [`archive`](https://github.com/datasets/datapressr/blob/main/skills/archive/SKILL.md) to cover discovery, or draft a distinct `discover` skill.

**Keep the document.** The boundary argument is what decides it: `archive`'s job is *save this source faithfully*, and it is good precisely because it is narrow. Discovery's job is *choose a source and prove it is the right one*, which is a research activity with judgement calls, escalation conditions and dead ends. Folding a research loop into a save-this-file skill would blur both.

**Don't draft a `discover` skill yet, and the reason is this project's own rule.** [`docs/plans/skills-vision.md`](https://github.com/datasets/datapressr/blob/main/docs/plans/skills-vision.md) holds the principle — don't design the system before you've felt the workflow — and [`docs/plans/skills-roadmap.md`](https://github.com/datasets/datapressr/blob/main/docs/plans/skills-roadmap.md) records what it cost in practice: `enrich` was resolved from two runs (co2-ppm and oil-prices), and `story` from two hand-written stories before the third was written *with* the skill. That patience is visibly why they are good. Discovery had **one** run when this was written. Writing the skill then would have encoded SEC EDGAR's shape as though it were the shape of source discovery.

**The condition for revisiting:** two more discovery runs against structurally different sources — ideally one with no index at all, and one where the licence question does *not* resolve cleanly, since that path is the least tested rule here. If the same rules survive, graduate them into a skill.

*Where that stands after run 2: the no-index rep is done, the licence-ambiguous rep is not, and the verdict is still no — see [the section above](#graduating-discovery-into-a-skill-not-yet-and-the-missing-rep-is-a-specific-one).*

Meanwhile this document is linked from both worked examples, [Tesla](examples/tesla-source-discovery.md) and [NWS hazard statistics](examples/nws-hazard-source-discovery.md). Two of the generalisable extraction lessons — the fetch/build split and the hashed manifest — are already guidance in [`skills/structure/SKILL.md`](https://github.com/datasets/datapressr/blob/main/skills/structure/SKILL.md). The coverage table is **not** yet, and on the evidence of §6 across two runs it is the one most worth adding.
