---
title: "Source-discovery playbook"
date: 2026-09-18
---

# Source-discovery playbook

How to get from *a data question* to *a source-backed extraction plan* — the step before `archive` and `structure`, which both assume you already have the source.

**Evidence base: one case.** Everything here is derived from a single worked example, the Tesla quarterly deliveries run ([walkthrough](examples/tesla-source-discovery.md), [dataset](../datasets/transport/tesla-quarterly-deliveries)). Rules that the Tesla run actually tested are marked **[tested]** and cite what tested them. Rules that are reasonable extrapolations from one case and have *not* been tested are marked **[untested]**. Do not read the untested ones as proven; read them as the next things to check. One case cannot tell you which of these rules are about source discovery in general and which are about SEC EDGAR in particular — see [Limitations](#limitations-of-learning-from-one-case).

## Where this sits

| Skill | Starts from | Produces |
|---|---|---|
| [`capture`](../skills/capture/SKILL.md) | A passing thought, a URL, a factoid | A remembered question, filed and not yet researched |
| **source discovery** (this document) | A question, and no source | A named source, terms evidence, a coverage statement and a schema proposal |
| [`archive`](../skills/archive/SKILL.md) | A known source | Raw bytes in `archive/` with provenance |
| [`structure`](../skills/structure/SKILL.md) | An archived snapshot | Typed, tidy `data/*.csv` + `datapackage.json` |

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

**Rule: never promise finer granularity than the source supports, and say so in the dataset's own metadata rather than only in a commit message.** **[tested]**

### 2. Find candidates by looking for indexes, not documents

Search for the thing that *lists* the documents, not the documents. A source that publishes a machine-readable index of its own holdings turns "I found some releases" into "I found the set of releases, and here is the rule that defines it" — and that is the difference between a scrape and a dataset, because only the second one has auditable coverage.

> **[tested]** `https://data.sec.gov/submissions/CIK0001318605.json` plus its pre-2018 overflow file lists all 1,750 Tesla filings with form type, date and 8-K item numbers. The selection rule — form 8-K, items include 2.02, filed in month 1/4/7/10 on day ≤ 10 — is one line, is written down in `fetch.ts`, and is reproducible by anyone.

**[untested]** Candidate index shapes worth looking for in other domains: a regulator's filing index, a statistical agency's dataset catalogue API, a `sitemap.xml`, an OAI-PMH or DCAT endpoint, a DOI prefix listing, a GitHub repo of releases. None of these has been tried here.

### 3. Compare candidates; record the rejected ones

Probe each candidate and write the result down — a rejection with a reason is a finding, and the next agent should not have to re-discover it.

> **[tested]** Three candidates for the same press release. Tesla investor relations: **HTTP 403** to a plain client, including the site root. The Business Wire copy: **HTTP 403**. SEC EDGAR: **HTTP 200**. The publisher's own copy was the worst option of the three.

Rank on these, in this order:

1. **Primary, not a copy.** A filing beats a wire copy beats an aggregator. **[untested]** as a ranking — here the primary source also happened to be the only reachable one, so the criterion never had to break a tie.
2. **Reachable without pretending to be something you are not.** A 403 is an answer. Do not work around it with a spoofed browser user-agent; record it and move on. **[tested]** — and note this is a *policy* choice as much as a technical one, which is why it is a rule here rather than a preference.
3. **Documented access terms.** Prefer the source that tells you how it wants to be accessed. **[tested]** — EDGAR asks for a declared User-Agent identifying the requester and no more than 10 requests/second; the two sources that said nothing both returned 403.
4. **Stable citation per record. [tested]** — EDGAR accession numbers became the `source_id` column, so every published figure points at the document it came from.
5. **An index** (step 2). **[tested]** — and see the limitations: no candidate *without* one was assessed, so this criterion has never been weighed against anything.

Secondary aggregators are for **finding gaps and corroborating**, never for substituting a figure. **[untested]** — the rule was in force but never exercised, because the primary source was complete enough that no aggregator was consulted. A run that actually has to fall back on one will test it; this one did not.

### 4. Establish terms before extracting, and record uncertainty as uncertainty

Find and quote the access terms and the licence. If there is no licence, say there is no licence.

> **[tested]** No redistribution licence is granted by Tesla or the SEC for the filings. The dataset therefore licenses *the compilation* (extracted figures, schema, build scripts) under PDDL-1.0 and states explicitly that no licence is claimed for the press-release prose, which it does not republish. An earlier draft of `fetch.ts` cited 17 U.S.C. §105; a review caught that §105 covers government-*authored* works, not third-party filings the government hosts, and it was removed.

**Rule: never invent a redistribution licence. [tested]** — the rule bound a real decision, and the §105 slip above is what it caught. The procedure that follows from it — if permissions cannot be resolved, keep a stub package plus the evidence report and record publication as blocked — is **[untested]**: the licence question resolved, so that path was never walked.

**Escalation:** anything that commits the project in the real world is not the agent's call. Declaring a contact identity to a regulator, agreeing terms of service, creating an account, paying for access — stop and ask. **[tested] for the contact-identity case only**, and weakly: declaring `hello@datahub.io` as the SEC contact address was settled by the owner *beforehand*, so it was never escalated in-run. Terms of service, accounts and payment never arose, so those three are **[untested]**. No other human input was needed during execution.

### 5. Choose the extraction route from the format you observed

Try plain HTTP first. Escalate only when you have evidence you must, and record what forced it.

> **[tested]** Plain HTTP throughout; no browser was needed. `fetch.ts` uses built-in `fetch` with a 30s timeout, 3 capped retries with exponential backoff, and 250ms sequential pacing — at most 4 requests/second against a documented ceiling of 10.

**Budgets.** What the run actually cost: roughly half an hour end to end for discovery, fetch, build, tests and metadata, about 10 minutes of it the paced download. What `fetch.ts` actually enforces: a 30-second per-request timeout and 3 attempts (2 retries) with exponential backoff. **[untested]** — the wall-clock budgets the task set (60 minutes for discovery, 15 minutes per blocked candidate before trying an alternative) were never enforced in code and never came close to binding; no candidate was blocked that long and no request exhausted its attempts. Treat all of these as proposed starting points, not findings. Nothing here tells you what suits a source that is slower, larger or more hostile.

**Rule: read the declared type; never infer a document's identity from its filename.** **[tested], and tested by failing.** The first `fetch.ts` matched `/ex.?99/` against directory listings. Exhibit filenames drift with whoever filed them — `d106308dex991.htm`, `tsla-ex991_6.htm`, `tsla-ex99_1.htm`, `exhibit99111111.htm` all occur in this one series — and the pattern silently dropped **the eight most recent quarters**, exiting 0.

**Rule: verify the endpoint you intend to depend on across the whole range, not just at the recent end.** **[tested], by failing.** The fix for the above read `<accession>-index-headers.html`, which declares document types in SGML. EDGAR lists that file in its directory JSON but returns **404** for it on pre-2015 filings, so the run died on the 2013 filing. The working answer was the Type column of `<accession>-index.html`, served for every filing in the range.

### 6. Count what you selected, and publish the count

This is the rule the Tesla run would most want a future agent to have.

> **[tested], three times by failing.** All three bugs in the run were the same shape: **a selection heuristic that returned fewer rows instead of an error.** A missing row looks exactly like a row that does not exist. What caught each one was counting — 49 candidate filings but only 42 exhibits retrieved; 50 exhibits but 49 accounted for. The third was a classifier written against recent wording (`production|deliveries`) that missed the 2015 headline style ("TESLA DELIVERS 11,507 VEHICLES IN Q2 OF 2015"), so a real release was filed under "not a delivery release".

Concretely:

- **Publish a coverage resource**, not just a prose note. `data/source-filings.csv` lists all 50 archived exhibits with a `layout` and an `extracted` flag, so what was found-and-not-used is visible *in the data*. **[tested]**
- **Assert the sequence has no interior gaps**, and separately **assert the newest record produced output** — a gap check alone cannot see a series truncated at its far end. The interior-gap check is **[tested]**; the newest-record check is **[untested]** and was added only after an adversarial review pointed out that the original build would have truncated the series silently at the far end and still exited 0. It has never caught anything.
- **Derive any classifier from a sample spanning the whole range**, not the recent end. **[tested], by failing.**
- **Cross-check derived metadata against the document.** The quarter is derived from the filing date *and* verified against the release's own headline; if they ever disagree the build stops. **[tested]**

**And the count is necessary, not sufficient — this run proves that against itself.** The Tesla dataset published a coverage resource and *still shipped two wrong rows*: an Investor Day announcement filed alongside the Q4 2022 release was classified as a prose delivery release, because the word "production" appears in its opening paragraph. That one misclassification put 20 prose filings in the documentation where there were 19, and 1 non-delivery exhibit where there were 2 — and the coverage table did not catch it, because the row count was right and only the labels were wrong. An independent adversarial review found it. So: publish the count, and then have something other than the thing that produced the count check it. Classifying a record is a claim about the record, and it needs the same cross-check as §6's last bullet gives to derived metadata.

### 7. Expect the reporting to change, and preserve the change

A long series is not one format. Record regime changes rather than smoothing them.

> **[tested]** Three grouping regimes across 29 quarters: `Model S/X` + `Model 3`, then `Model S/X` + `Model 3/Y`, then `Model 3/Y` + `Other Models` — plus a lease-accounting column that appears from Q3 2019 and is not published, which is a column change rather than a regime. And two layouts overall: the 19 releases before Q2 2019 state their figures in prose, with wording that changes release to release.

**Missing model detail.** Where the source stops breaking something out, stop breaking it out. Do not reconstruct a `Model S` series from a `Model S/X` group. **[tested]**

**Revisions.** Retain both versions and state a preferred-version rule explicitly. **[tested]** — the Tesla build's rule is "the later filing wins, both snapshots stay in `archive/`", and separately the full-year recaps *do not reconcile* with the four quarters as first reported (2020 deliveries +630, 2021 +222) because Tesla restates without reissuing. Both figures are published, in separate resources, and the build prints the difference on every run rather than reconciling it away. **The instinct to make the numbers agree is the wrong one**; the disagreement is the finding.

**Unparseable eras.** Where a portion of the range needs a fundamentally different extraction, record it as discovered-and-not-extracted rather than reaching for one-off patterns whose failures are silent. **[tested]** — the 19 prose releases are archived and listed, not guessed at. Note the honest cost: they break out individual models, so leaving them out loses granularity, not just rows.

### 8. Hand off

Discovery is done when `archive` and `structure` can proceed without re-deciding anything.

**Source manifest** — per record: `source_id`, URL, local path, retrieval timestamp, byte count, SHA-256, and whatever identifies the period the record reports on (here: accession, filing date, report date and 8-K item numbers). Plus, per run: the selection rule in words, the candidate count, and the declared access identity. **[tested]** — see `archive/manifest.json`.

**Handoff template:**

```
QUESTION          the original ask, verbatim
ANSWERABLE AS     measurement, granularity, coverage the source actually supports
SOURCE            chosen source + why, in one line
REJECTED          each candidate + the probe result (status code, date)
SELECTION RULE    the rule that defines the record set, and how many it selects
TERMS             access terms quoted; licence, or an explicit "none found"
FORMAT            observed format(s); regime changes with the dates they change
COVERAGE          extracted / discovered-not-extracted / does-not-exist, with counts
SCHEMA PROPOSAL   fields, types, primary key, and what a missing value means
BUDGET SPENT      requests, wall-clock, retries
OPEN              anything needing a human
```

**Stop and escalate** when: access requires credentials, payment or agreeing to terms; the source declares a real-world identity requirement; a licence question cannot be resolved from published terms; the coverage count and the expected count disagree and you cannot explain why; or a budget is exhausted. **A documented access limit is a result, not permission to guess.** **[tested]**

---

## Replay: would this have prevented what actually went wrong?

The Tesla run recorded three failed approaches and **zero human interventions during execution** (one decision was pre-authorised). Replaying the workflow above against that log:

| What happened | Would the playbook have caught it? |
|---|---|
| Filename guessing dropped the 8 most recent quarters, exit 0 | **Yes, twice over** — §5 "read the declared type" forbids the approach outright, and §6 "count what you selected" catches the consequence (49 candidates, 42 exhibits). Honest caveat: both rules exist *because of* this failure. They would prevent a repeat; they did not prevent the original. |
| `index-headers.html` 404s on pre-2015 filings; the run died mid-way | **Partly.** §5 "verify across the whole range" would have moved the discovery from mid-run to probe time, which is cheaper — but it would still have been a discovery, not an avoidance. This one failed *loudly*, which is why it cost minutes rather than correctness. |
| Classifier written against recent wording missed the 2015 headline style | **Yes, and retrospectively** — §6's "derive any classifier from a sample spanning the whole range" is written from this exact failure, so it carries the same caveat as row 1. Caught in the original run only by reading the output rather than the exit code, which is itself the §6 lesson. |
| Zero human interventions | §4's escalation list matches what actually needed a human: the contact-identity decision, settled beforehand. No rule here would have manufactured an unnecessary escalation. |

An adversarial review after the fact found **no wrong numbers** — all 210 published values re-derived independently — but did find several further paths where the *extraction* could produce wrong or truncated output silently, and, more to the point here, **two wrong rows in the coverage resource itself**. The extraction paths are `structure`'s territory and the fixes live in `build.ts`. The coverage rows are squarely discovery's, and they are why §6 now says the count is necessary and not sufficient: the run's own headline artefact was wrong until someone else looked at it.

## Limitations of learning from one case

Stated plainly, because the acceptance bar for this document is that it makes no unsupported claim of generality:

- **n = 1.** Every **[tested]** rule was tested exactly once, against one source, by one agent, in one session.
- **The source was unusually good.** EDGAR is a regulator with a machine-readable index, stable per-record citations, published access terms and a legal obligation to keep documents available. Most sources have none of that. The rules that lean on an index (§2, §6) may simply not apply where no index exists, and this document cannot say what to do instead.
- **The domain was easy in ways that will not repeat.** Small data, HTML tables, no authentication, no pagination, no rate-limit rejection actually encountered, English, one publisher, one jurisdiction.
- **The failures were a single species.** All three were silent under-selection. That is why §6 is the strongest section — and it means this playbook is well-tested against one failure mode and untested against others: partial responses, upstream content changing mid-download, ambiguous record identity, conflicting duplicate sources.
- **The wall-clock budgets are not a data point at all.** 60 minutes for discovery and 15 minutes per blocked candidate were set by the task, never enforced in code and never approached. Only the per-request limits (30s, 3 attempts) were real, and neither was ever hit.
- **The rules were written by the agent that made the mistakes**, from its own log. That is the cheapest possible evidence, and it is worth one more independent replication before any of it is treated as settled. Concretely: every "Yes" in the replay table above is retrospective, and the strongest single argument for that caution is that the agent's own coverage table shipped two wrong rows and the agent did not notice — a reviewer did.

## Recommendation: keep this a document, for now

Three options were on the table — leave it as a document, extend [`archive`](../skills/archive/SKILL.md) to cover discovery, or draft a distinct `discover` skill.

**Keep the document.** The boundary argument is what decides it: `archive`'s job is *save this source faithfully*, and it is good precisely because it is narrow. Discovery's job is *choose a source and prove it is the right one*, which is a research activity with judgement calls, escalation conditions and dead ends. Folding a research loop into a save-this-file skill would blur both.

**Don't draft a `discover` skill yet, and the reason is this project's own rule.** [`docs/skills-vision.md`](skills-vision.md) holds the principle — don't design the system before you've felt the workflow — and [`docs/skills-roadmap.md`](skills-roadmap.md) records what it cost in practice: `enrich` was resolved from two runs (co2-ppm and oil-prices), and `story` from two hand-written stories before the third was written *with* the skill. That patience is visibly why they are good. Discovery has had **one** run. Writing the skill now would encode SEC EDGAR's shape as though it were the shape of source discovery.

**The condition for revisiting:** two more discovery runs against structurally different sources — ideally one with no index at all, and one where the licence question does *not* resolve cleanly, since that path is the least tested rule here. If the same rules survive, graduate them into a skill. That next rep is recorded as follow-up work in [`docs/handoffs/cloud-queue.md`](handoffs/cloud-queue.md) for the owner to file as its own Bead, rather than this task quietly expanding into it.

Meanwhile this document is linked from the [worked example](examples/tesla-source-discovery.md). Two of the generalisable extraction lessons — the fetch/build split and the hashed manifest — are already guidance in [`skills/structure/SKILL.md`](../skills/structure/SKILL.md). The coverage table is **not** yet, and on the evidence of §6 it is the one most worth adding.
