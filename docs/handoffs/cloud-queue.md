---
title: Cloud run queue — handoff log
date: 2026-09-18
---

# Cloud run queue — handoff log

Unattended cloud runs work the Beads queue without a Dolt remote (the Beads remote is git+ssh to GitHub and does not authenticate from the cloud sandbox). Each run records what it did here, one section per run and per task, with the fields each Bead's description asks for, so the owner can transfer them into Beads and close or reopen the issues.

**Reading this file:** a task marked **done** or **blocked** here is treated as done or blocked by later runs, unless a later section says the blocker was resolved. Beads itself remains the source of truth once the owner syncs these notes in.

**Transferred into Beads on 2026-09-19 (local session, working `bd`):** the seven tasks recorded done in the 2026-09-18 section (`ozk`, `eec`, `ub1`, `03u.1`, `d8r`, `h7d`, `u3m`) are now closed in Beads with this file's evidence attached. The epic `datapressr-03u` is deliberately left open for the owner. The "New work found" and "What needs the owner" items became Beads: `datapressr-dzo` (Tesla licence position), `78h` (inbox-triage questions), `mpy` (posting the GitHub reconciliation), `zwt` (four convention choices), `07t` (extend the invisible-character check to `.json`/`.yaml`), `b6w` (second source-discovery rep, in progress in a cloud routine), `jn8` (third rep, blocked on `dzo`), `vkk` (retire the decision documents), and `e2t` (a symlink bug in the CLI entry guard found while re-verifying: `npm test` is 107/108 on macOS). From here, read the queue from `.beads/issues.jsonl`; sections below are history and only need an entry for work that Beads cannot yet record.

**The 2026-09-19T12:08Z run (second source-discovery rep) was transferred the same day:** `datapressr-b6w` is closed with its evidence, and that run's "New work found" and "What needs the owner" items became Beads: `datapressr-2w5` (owner decision on the Federal Reserve SEP under a public-domain position, best decided with `dzo`), `voq` (OCR the 1996 summary, or decide it is not worth the dependency), `s6e` (state-level and per-hazard follow-on dataset), `02p` (shared silent-revision detection), `5k8` (coverage-table guidance in `skills/structure`), plus a fifth choice appended to `zwt` (make the adversarial-review step a written rule). The same session made `us-natural-hazard-statistics`'s tests run without an `npm install` and removed a scratch file that run committed (`datapressr-5k9`, `7942c9b`).

---

## Run 2026-09-18T20:38Z

Beads state read from `.beads/issues.jsonl` at `630e92a` (`bd` is not installed in the sandbox and the Dolt remote is not reachable; nothing was initialised or recreated). Working directly on `main` per the run's standing authorisation. Open, unblocked, non-human, non-epic tasks at the start of the run, highest priority first: `datapressr-ozk` (P2), `datapressr-03u.1` (P2), `datapressr-d8r` (P2, blocked on 03u.1), `datapressr-eec` (P3), `datapressr-ub1` (P3), `datapressr-u3m` (P3), `datapressr-h7d` (P3).

### datapressr-ub1 — Site: fix relative links that escape site/ — **done**

- **Changed paths:** `site/stories/oil-prices-outline.md`, `site/stories/planetary-boundaries-outline.md`, `site/stories/planetary-boundaries.md`
- **Commit:** `352b63c`
- **What changed:** eight `](../../docs/…)` / `](../../datasets/…)` links rewritten to absolute `https://github.com/datasets/datapressr/{blob,tree}/main/…` URLs — the pattern already used by `keeling-curve.md` and `oil-prices.md`. Directory targets use `/tree/main/`, file targets `/blob/main/`, matching `site/stories/oil-prices.md:36`.
- **Commands and results:** `grep -rn '](\.\./\.\./' site --include=*.md` → 0 matches after the change (8 before). Each of the five distinct link targets checked to exist on `main`. `git diff` confirms link-only edits; no prose, numbers or chart plan touched.
- **Decisions:** the Bead estimated seven links (five in `oil-prices-outline.md`); there were eight (six in that file). `](../datasets.md)` in `keeling-curve.md` and `](../charting-spike.html)` in `planetary-boundaries.md` were left alone — they resolve inside `site/` and are not affected. `oil-prices-outline.md` is the approved review artifact from `85a9de8`; the commit message records that this is a link-only change that does not alter the argument.
- **Blockers:** none.

### datapressr-ozk — structure: verify keys and joins + refine the DuckDB threshold — **done**

- **Changed paths:** `skills/structure/SKILL.md`
- **Commit:** `6c2236a`
- **What changed:** (1) a "profile it, don't assume it" bullet in step 2 — count blanks and duplicates in each candidate key against the snapshot before declaring `primaryKey`, keep the profiling as build assertions; (2) a new **Joining tables** checklist — record cardinality and orphan policy before coding, assert one-side uniqueness, count orphans in both directions, assert row counts before and after, check redundant columns agree across tables, define what a child-table aggregate counts and recompute a sample; (3) the **When to reach for DuckDB** paragraph rewritten — plain Node for keyed many-to-one lookups and simple group-bys *even across several files*, DuckDB for many-to-many joins, window functions and wide reshapes; (4) `datasets/transport/airports` added as the relational-join worked example.
- **Commands and results:** `npm test` → 47/47 pass. `git diff --check` clean. No Markdown hard-wrapping introduced (every new paragraph and bullet is one line).
- **Independent check:** a fresh subagent re-derived every figure in the new text directly from `datasets/transport/airports/archive/*.csv` and `datasets/demographics/population-growth/archive/observations/*.json` rather than from the benchmark reports — 66 duplicate `(countryiso3code, date)` key groups from exactly five blank-iso3 entities (XD/XM/XN/XT/XY), 44,953 airports with no runway rows, 289 runways with blank `length_ft` and 6 with `0`, row counts 86,094 / 249 / 3,987 / 48,248, `csv-parse` 7.0.2 pinned dataset-local, closed runways counted in `runway_count` and excluded from `open_runway_count`. Four wording corrections it raised were applied before committing: `138,000` → `~138,600` source rows (actual 138,578); "a separate anti-join query in SQL" → "one line in Node and a separate anti-join or count query in SQL", matching `round-2-join.md:43`; "the count belongs in the README" → "wherever the join plan is written down" (`airports` has no README); and the iso2 sentence reworded so it reads as the lookup path rather than the published key.
- **Decisions:** the child-table-aggregate bullet is proposed edit 4 from `docs/benchmarks/round-2-join.md`, one item beyond this Bead's enumerated content list. Kept, because it is join guidance the checklist would be incomplete without — recorded here as the scope note the Bead asks for rather than dropped.
- **Blockers:** none.

### datapressr-eec — structure: value semantics (text placeholders, literal NA, aggregate flags, precision) — **done**

- **Changed paths:** `skills/structure/SKILL.md`
- **Commit:** `148ef01`
- **What changed:** a new **Values that lie** block between "Government / scientific text data" and "Joining tables", covering the two opposite failure modes the sentinel rule doesn't reach — values that look like data and aren't, and values that look like missing and aren't. Six bullets: decide by what the row is rather than what the string looks like; placeholder lists are per column, never global, and `cleanNumber`'s `MISSING_TOKENS` is named as the specific trap; trim whitespace centrally; legitimate values that tools read as missing stay verbatim with a warning in the field description; aggregates mixed in with units get an `is_aggregate` flag; keep source precision and treat a display hint as metadata. The "mixing missing-value conventions" bullet under **Common mistakes** was also qualified, because it otherwise now reads as forbidding the literal-`NA` case.
- **Commands and results:** `npm test` → 47/47. `git diff --check` clean. No hard-wrapping.
- **Independent check:** a fresh subagent re-derived every figure from `datasets/demographics/population-growth/archive/` and `datasets/transport/airports/archive/` and caught **three real errors before commit**. (1) `"Not classified"` was listed as a placeholder to empty; it is a genuine World Bank lending type (`LNX`) held by 72 economies and published verbatim by `population-growth` — the guidance would have destroyed 72 real values. (2) The stated test — "does this column have a code list, and is the token in it" — gives the *wrong* answer for the block's own World Bank example, since `NA` **is** in the region code list; replaced with a test about what the row is. (3) "Both are real ISO codes" was wrong for `continent`, since ISO defines no continent codes. Also corrected: the lending-type placeholder id (empty, not `NA`), and the entity counts (48 of 265 in the series; 295 entities / 78 aggregates in the full list).
- **Decisions:** **AGENTS.md was deliberately not touched.** The Bead makes its "Missing values" line conditional on the owner agreeing, and the owner is away. Proposed wording, if the owner wants it, is one clause on the existing bullet: *"…Don't mix `NA`, `N/A`, `-`, `0`, and empty string for 'missing' within one column — and note the converse: where a literal `NA` is a real code (North America, Namibia), keep it verbatim and say so in the field description."*
- **Blockers:** none.

### datapressr-h7d — evidence and owner choices for the seven legacy inbox finds — **done**

- **Changed paths:** `docs/inbox-triage.md` (new)
- **Commit:** `815dae9`
- **What changed:** each of the seven unchecked items in GitHub issue #2, with what the primary source actually says as of 2026-09-18 and a proceed/clarify/drop recommendation. All seven preserved.
- **Commands and results:** primary sources fetched read-only — HRMI download page, `github.com/fivethirtyeight/data`, `fivethirtyeight.com` (301 → `abcnews.com/538`), PubMed E-utilities for PMID 17142547, `ourworldindata.org/famines`, UNEP's fast-fashion page. The AAP full text returned **HTTP 403**, so the citation is confirmed but the sentence carrying the 40,000 figure was not read; that limitation is stated in the document rather than papered over.
- **Decisions:** recommendations are proceed (#5 causes-of-death comparison), clarify (#1 HRMI, #2 FiveThirtyEight, #3 "Wiser metrics"), drop (#4 *The Great Wave*, #6 the TV-commercials factoid, #7 the fashion ranking). The fashion ranking is not restated as fact anywhere in the document — UNEP gives 2–8% of global carbon emissions and makes no such ranking; the only ranking it makes is about textile *dyeing* and water specifically.
- **Nothing was sent.** No GitHub comment, no issue-body edit, no external message. Checking or striking the boxes in #2 is the owner's.
- **Owner input needed on three:** does this catalog publish non-commercial data (HRMI is CC BY-NC 4.0, which would be the first non-open licence here)? What did the FiveThirtyEight note mean? What is "Wiser metrics"? With those answered, the other four close immediately.
- **Blockers:** none for the analysis; the three questions above block closing the issue.

### datapressr-u3m — reconcile legacy GitHub issue status with the Beads audit — **done**

- **Changed paths:** `docs/github-issue-reconciliation.md` (new)
- **Commit:** `09acfda`
- **What changed:** exact proposed text for the six issues `docs/next-audit.md` flags — #3, #4, #7, #10, #11, #14 — plus a summary table of what to do with each of #2–#14. Recommends closing #10 (the `story` skill exists and is active), rewriting #14's step list (the v1 gate is met), ticking four of #7's five boxes, and leaving #3, #4 and #11 open for the parts that are genuinely unresolved.
- **Commands and results:** GitHub issues #2–#14 read read-only via the API (13 issues). All fourteen cited Bead IDs verified against `.beads/issues.jsonl` for existence and status; every repository claim checked against the working tree (`.claude/skills/` symlinks, `site/` contents, `docs/charting.md`, the changelog entry).
- **Nothing was sent.** Draft text only, as the Bead requires.
- **Flagged for the owner:** #7's "first publish" box is proposed as ticked on the strength of the URL recorded in `site/README.md` (<https://datapressr-2-rufuspollock.flowershow.me>), **not** a fresh check of the live site — `docs/next-audit.md` explicitly left the deployment unrevalidated. Worth loading the site before posting that one. Whether to close #14 is also explicitly left to the owner.
- **Blockers:** none. Posting any of it needs the owner's authorisation.

### datapressr-03u.1 — Tesla worked example: autonomous source discovery, scraping and reproducible quarterly data — **done**

- **Changed paths:** `datasets/transport/tesla-quarterly-deliveries/` (new — `fetch.ts`, `build.ts`, `build.test.mjs`, `datapackage.json`, `README.md`, `AGENTS.md`, `.datahubignore`, `archive/` 101 files, `data/` 3 CSVs), `docs/examples/tesla-source-discovery.md` (new)
- **Commits:** `4aa3246` (dataset), `e97a613` (review fixes), `c6100f4` (changelog)
- **Source cutoff:** Q2 2026, the latest quarter with a released report at the 2026-09-18 snapshot. Q3 2026 had not ended.
- **What was built:** SEC EDGAR as the primary source (Tesla IR and Business Wire both returned HTTP 403 to a plain client this run; EDGAR returned 200 and documents its access terms). 29 quarters, Q2 2019 – Q2 2026, 174 rows, keyed on `(period_start, period_end, vehicle_group, metric)`, plus the Q4 full-year recaps as a second resource and a coverage resource accounting for all 50 archived exhibits.
- **Commands and results:** `npm test` 78/78 from root, 31 of them this dataset's; `node scripts/validate-datapackage.mjs datasets/transport/tesla-quarterly-deliveries` → 0 errors, 0 warnings; two offline builds byte-identical; `fetch.ts` run with `SEC_USER_AGENT="datapressr hello@datahub.io"`, ~100 requests paced at 250 ms.
- **Independent check:** every one of the 210 published values was re-derived from the raw archived HTML by a second extractor that does not use `build.ts` — 0 mismatches, re-run after the fixes below. A separate adversarial review agent did the same independently and also found no wrong numbers, but found several paths where the build could produce wrong or truncated output *without erroring*: the sum check was skipped whenever a group was dashed; a ragged Total row silently deleted a whole metric; an unrecognised group label was dropped silently; the Q4 quarter/annual table order was assumed, not verified; a parse failure on the newest filing would truncate the series with no gap to detect; the supersede rule cleaned only one of the two resources. All fixed in `e97a613`, each with a test that fails without the fix.
- **Corrections that review forced in the prose:** the Q4 2022 filing's second exhibit (an Investor Day announcement) was classified as a prose delivery release because "production" appears in its first paragraph — so the prose-era counts were wrong throughout (19 filings over 18 quarters, not 20; 2 non-delivery exhibits, not 1). The prose era is also **not contiguous**: no delivery 8-K exists for Q2 2013 – Q4 2014. And "Tesla does not report individual models" is true of the table era only — the prose releases break out Model S, X and 3 separately, which makes extracting them a gain in granularity, not just rows.
- **One review finding was itself wrong and was corrected against the archive:** the reviewer placed the last "slightly conservative / 0.5%" delivery caveat in the 2022-04-04 filing. Checking the archived exhibits directly, it last appears in the 2022-01-03 filing (Q4 2021); 2022-04-04 does not contain it. The published wording follows the archive.
- **Decisions:** table era only, with the prose era recorded as discovered-and-not-extracted rather than parsed by one-off regexes whose failures are silent; quarterly and annual kept as separate resources because the annual recaps do not reconcile (2020 deliveries +630, 2021 +222 — Tesla restates without reissuing) and the build prints the difference rather than reconciling it; the lease-accounting percentage and storage deployments excluded as out of the schema's grain; no declarative `views`, because the only chart the simple spec can express would overlay components and totals.
- **Needs the owner's eye — licence.** This is the first dataset here whose source carries **no** stated open licence. Position taken: PDDL-1.0 on the compilation (figures, schema, build scripts), with no redistribution licence claimed or implied for the press-release text, which is not republished; the figures are facts from US public records. `archive/` holds the retrieved documents as build evidence. An earlier draft cited 17 U.S.C. §105, which covers government-*authored* works and not third-party filings the SEC hosts — removed. If the owner disagrees, the fix is to drop `status` back to `stub` and keep the evidence report; nothing else depends on it.
- **Blockers:** none.

### datapressr-d8r — derive a source-discovery playbook from the completed Tesla example — **done**

- **Changed paths:** `docs/source-discovery-playbook.md` (new), `docs/examples/tesla-source-discovery.md` (one link added)
- **Commit:** `fa6c0ed`
- **Prerequisite:** started only after `datapressr-03u.1` was complete, checked and pushed (`4aa3246`, `e97a613`), since the playbook's entire evidence base is that run.
- **What changed:** an eight-step workflow from a data question to a source-backed extraction plan, with budgets, escalation conditions and a compact handoff template. Every rule carries **[tested]** with its Tesla evidence or **[untested]** as an extrapolation. A replay table works the saved discovery log rule by rule; a limitations section states what one case cannot establish.
- **Commands and results:** all local links checked to resolve; no Markdown hard-wrapping; every factual claim re-verified against the archive, the manifest, the fetch log and `.beads/issues.jsonl`.
- **Self-check corrections:** two rules were downgraded from **[tested]** to **[untested]** — the secondary-aggregator rule was in force but never exercised (the primary source was complete, so no aggregator was consulted), and the newest-record assertion was added in response to review rather than after a failure and has caught nothing. The 60-minute and 15-minute budgets are now labelled as set by the task rather than chosen by the agent, and as never having come close to binding.
- **Decisions:** recommends **keeping this a document** — not extending `archive`, not drafting a `discover` skill — on the repo's own rule that a skill is written from felt friction across several real runs (`enrich` waited for two, `story` for three; discovery has had one). The condition for revisiting is stated: two more discovery runs against structurally different sources, ideally one with no index at all and one where the licence question does not resolve cleanly, since that is the least-tested path. Filed below rather than expanding this task into it.
- **Independent check:** a review agent returned late (after the first commit) and its findings were applied in `459f1cf`. It found eight rules marked **[tested]** that the evidence does not support that strongly — corrected above and in the document — plus three factual errors: "four layout/grouping regimes" is three groupings plus a column change, which contradicted the dataset's own README; the source-manifest field list did not match `archive/manifest.json`; and the claim that the coverage table is already guidance in `skills/structure/SKILL.md` is false (`grep` finds nothing). The `enrich`/`story` precedent was also cited from `docs/plans/skills-vision.md`, which predates both skills existing; it is now cited from `docs/plans/skills-roadmap.md`, which records two runs each rather than "two to three". Its best finding is now §6's closing point — see below. It endorsed the keep-a-document recommendation as genuinely argued from repo practice rather than asserted.
- **The finding worth carrying forward:** the coverage resource that this playbook holds up as *the* artefact against silent under-selection **was itself wrong**. The misclassified Investor Day exhibit put 20 prose filings in the documentation where there were 19, and the count did not catch it because the row count was right and only the labels were wrong. A reviewer caught it. The rule is now "the count is necessary, not sufficient — have something other than the thing that produced the count check it", and the limitations section says plainly that every "Yes" in the replay table is retrospective.
- **Blockers:** none.

### Queue status at the end of the run

Every open, unblocked, non-human, non-epic task in `.beads/issues.jsonl` was completed: `datapressr-ozk`, `datapressr-eec`, `datapressr-ub1`, `datapressr-03u.1`, `datapressr-d8r`, `datapressr-h7d`, `datapressr-u3m`. **No actionable work is left in the queue.**

Still open in the JSONL, and deliberately not touched:

- `datapressr-03u` — the Tesla epic. Its only execution child, `03u.1`, is now done, so the epic has no open children and looks closeable; that is the owner's call, since closing an epic is an acceptance judgement.
- `datapressr-7fs`, `d6n`, `46c`, `5yq`, `ck8` — status `deferred`, post-v1.
- `datapressr-77e`, `23l`, `aw1` — human-only or owner decisions.

Because `bd` could not sync, **none of these Beads has been updated in Beads itself**. The seven completed tasks above still read `open` in `.beads/issues.jsonl`; the evidence for closing each is in its section of this file.

Final verification across the repository: `npm test` 78/78, and `node scripts/validate-datapackage.mjs` returns 0 errors and 0 warnings for all five datasets (`co2-ppm`, `population-growth`, `oil-prices`, `airports`, `tesla-quarterly-deliveries`). Working tree clean, everything pushed to `main`.

### New work found during the run (for the owner to file as Beads)

1. **The DuckDB guidance is now stale outside `skills/structure/SKILL.md`.** `AGENTS.md:101` still reads "DuckDB is fine for a genuinely relational transform (multi-file joins, heavy reshaping)", and that line is copied verbatim into four per-dataset `AGENTS.md` files (`oil-prices`, `co2-ppm`, `population-growth`, `airports`). `docs/skills-vision.md:64` says the same. All five now contradict the refined threshold in the skill. Left untouched because `datapressr-ozk` limits work to the skill file. Small, mechanical, and worth doing before the next benchmark round.
2. **`scripts/wrangling-idioms.mjs` has no `cleanString`,** though `skills/structure/SKILL.md` referred to one under **Common mistakes**. Removed from that line as part of `datapressr-eec` since the line was being edited anyway. Either add the helper or check for other references; this was the only one found.
3. **`skills/structure/SKILL.md` cites `datasets/economic-history/millennium-macroeconomic-data-uk` as a repo-relative path, but that dataset lives in the sibling `datasets/economic-history` repo,** not here. Pre-existing, in two places (the xlsx parsing note and the worked-example list). Cosmetic, but it is the kind of link a reader will try to follow.
4. **Second source-discovery rep, for the playbook.** `docs/source-discovery-playbook.md` recommends not graduating discovery into a skill until two more runs exist against structurally different sources — ideally one with **no machine-readable index** (the rules that lean on one would simply not apply) and one where the **licence question does not resolve cleanly** (the blocked-publication path is currently the least-tested rule in the document). If the rules survive both, graduate them.
5. **A changelog entry covering the run's skill work only.** `changelog/2026-09-18-tesla-quarterly-deliveries.md` covers the Tesla dataset and the two `structure` sections together. If the owner would rather the skill guidance stood on its own, it is easy to split.
6. **`docs/` is drifting into a second backlog.** This run added three documents whose whole content is "what the owner should decide" — `docs/inbox-triage.md`, `docs/github-issue-reconciliation.md`, and this file. Each was asked for by its Bead, so none is wrong, but together they are a queue living outside Beads, which is what `docs/next-session-brief.md` warns against. Worth a pass once the owner has acted on them: fold the decisions into Beads and delete the documents rather than letting them accumulate.

*Items 1, 2 and 3 above were done by the run of 2026-09-19 below. Items 4, 5 and 6 were not — see that run's closing section for why.*

---

## Run 2026-09-19T02:20Z

Beads state read from `.beads/issues.jsonl` at `1204f89`. `bd` is still not installed here and the Dolt remote still does not authenticate from the cloud sandbox; nothing was initialised or recreated. Working directly on `main` per the run's standing authorisation.

**The Beads queue had no actionable work at the start of this run.** Every open, unblocked, non-human, non-epic task in the JSONL — `ozk`, `eec`, `ub1`, `03u.1`, `d8r`, `h7d`, `u3m` — is recorded **done** in the 2026-09-18 section above, which this file's own reading rule says to honour. They still read `open` in the JSONL only because `bd` cannot sync from here. So this run took the follow-ups the previous run filed, which are repository defects rather than owner decisions, and two more defects found while checking that work.

Root checks at the start and after every commit: `npm test` (78 before the new tests, 82 after, 0 failures) and `node scripts/validate-datapackage.mjs` on all five datasets (0 errors, 0 warnings each). All five builds were re-run from their archives and reproduce `data/` byte-for-byte; `airports` and `oil-prices` need `npm install` in the dataset directory first, which is what `AGENTS.md` documents and not a regression.

### Follow-up 1 — the stale DuckDB threshold in `AGENTS.md` — **done**

- **Changed paths:** `AGENTS.md` and all five per-dataset copies (`oil-prices`, `co2-ppm`, `population-growth`, `airports`, `tesla-quarterly-deliveries`)
- **Commit:** `a11de5f`
- **What changed:** one sentence in the reproducibility bullet. "DuckDB is fine for a genuinely relational transform (multi-file joins, heavy reshaping)" became "DuckDB earns its place when the transform is genuinely one SQL query — many-to-many joins, window functions, or reshaping a wide table to long across dozens of columns — not for keyed lookups and group-bys, which stay plain Node even across several files, and not for 'clean up one messy source.'" That is the threshold `skills/structure/SKILL.md:128` now sets, with `airports` as its calibration point.
- **Scope note:** the previous run counted four copies; there are five, because `tesla-quarterly-deliveries` was created by that same run and inherited the line.
- **Decision — `docs/skills-vision.md:64` deliberately left alone.** The previous run listed it as a fifth stale site. It is a historical planning document whose own banner at line 3 says later completed work supersedes its claims and that it must not be executed as a current assignment. Editing its record of a past decision to match a present one is worse than the contradiction the banner already covers.
- **Blockers:** none.

### Follow-up 3 — skill files citing datasets that live in sibling repos — **done**

- **Changed paths:** `skills/structure/SKILL.md` (four places), `skills/archive/SKILL.md`, `scripts/wrangling-idioms.mjs` (header comment)
- **Commit:** `9a65050`
- **What changed:** `millennium-macroeconomic-data-uk` and `precious-metals-prices` now link to their real homes and name the repo they are in, instead of reading as paths in this repo.
- **Scope note:** the previous run flagged two places and only the millennium dataset. There were five places, and `precious-metals-prices` has the same defect — and is the worse trap of the two, because `datasets/energy-and-commodities/` *does* exist here (it holds `oil-prices`), so the path looks resolvable right up until you try it.
- **Commands and results:** a repo-wide scan resolves every `datasets/<x>/<y>` citation in `skills/` and `scripts/` against the working tree — all now resolve or are absolute URLs. The four worked examples that really are in this repo keep their relative paths.
- **Blockers:** none.

### Follow-up 2 — `cleanString` — **done, by adding the helper**

- **Changed paths:** `scripts/wrangling-idioms.mjs`, `scripts/wrangling-idioms.test.mjs`, `skills/structure/SKILL.md` (two places)
- **Commit:** `faac8ca`
- **Which branch of the follow-up:** the previous run offered "either add the helper or check for other references". Both. The reference check found none outside this file. The helper was added because the skill's "Values that lie" block tells you to trim every string you keep once, centrally, and named a helper that did not exist — and because `num(raw, sentinels)` already exists as its numeric counterpart.
- **What it does:** collapses whitespace runs including U+00A0 and U+200B to a single space, trims, and returns `undefined` for what is left of a blank. The character class is the one `tesla-quarterly-deliveries/build.ts` arrived at by hand; `population-growth` and `co2-ppm` hand-roll the trim half. Four tests, 82 total passing.
- **Design decision:** it takes no placeholder list, on purpose. A string placeholder list would have to be per column, and in practice the answer comes from the row — which is what the skill says two bullets earlier.
- **Independent check — four corrections applied before commit, all verified here against the sources rather than taken on trust:**
  1. **The escapes were written as literal invisible characters**, in the one file whose stated purpose is being copy-pasted. `od -c` confirmed raw `302 240` and `342 200 213` bytes. A U+200B that does not survive a paste leaves a function that still compiles and silently stops doing the only thing `\s` cannot do. Now ` ` and `​`, in the tests too.
  2. **The population-growth claim was backwards** — and so was the line `skills/structure/SKILL.md:114` already carried, written by the previous run. Measured from the archive: four entity names in `countries.json` carry a trailing space, **zero** of 17,490 observation `country.value` strings do. So it is the metadata name that disagrees with the name the entity's own observations use, not the other way round. `population-growth/build.ts:27` says as much in its own header. Both the docstring and the skill line are corrected.
  3. **It does not decode HTML entities**, so describing it as handling `&nbsp;` was wrong. The tesla build decodes first, in `decodeEntities`; this character class is for the literal characters those filings still carry afterwards.
  4. **It is not a drop-in for that build's `plainText`**, which splits on newlines before collapsing, on purpose, so its headline checks keep the line structure they read; and it is wrong for a build that republishes free text verbatim. Verified independently: applying it to `airports/archive/airports.csv` would alter 165 non-empty cells of 1,156,775, 154 of them internal double spaces inside real place names. All three caveats are now in the docstring and the skill.
- **One reviewer note was checked and is right, though my first check of it was wrong:** it flagged the same literal-invisible bug in `tesla-quarterly-deliveries/build.ts`. I initially read that as a false positive because I truncated the line before the character. A full codepoint scan confirms it. Fixed separately below.
- **Blockers:** none.

### Found this run — literal invisible characters in the Tesla build — **done**

- **Changed paths:** `datasets/transport/tesla-quarterly-deliveries/build.ts`, `build.test.mjs`
- **Commit:** `9e886d0`
- **What changed:** a raw U+00A0 and U+200B inside a character class in `build.ts`, and both inside a test string in `build.test.mjs`, written as ` ` and `​`. The test was the worse of the two: had its U+200B degraded to a plain space it would still have passed, and stopped testing the thing it exists to test.
- **Commands and results:** all 82 tests pass, the build reproduces `data/` byte-for-byte against the pre-change hashes, and `validate-datapackage.mjs` still returns 0 errors and 0 warnings. Behaviour is identical by construction — same characters, different spelling.
- **Blockers:** none.

### Found this run — root-relative links in the copied `AGENTS.md` — **done**

- **Changed paths:** `AGENTS.md`, `population-growth/AGENTS.md`, `airports/AGENTS.md`, `tesla-quarterly-deliveries/AGENTS.md`
- **Commit:** `c2de724`
- **What changed:** the task-tracking paragraph linked `NEXT.md`, `docs/next-session-brief.md` and `docs/next-audit.md` as root-relative paths. `AGENTS.md` is copied into every dataset directory by design, so all three links were dead in every copy carrying that section — nine broken links. Now absolute `github.com` URLs, the pattern `datapressr-ub1` settled on for `site/` links that escape their directory, which keeps every copy byte-identical to the root file.
- **How it was found:** a repo-wide check of local Markdown links. The 15 it still reports are all either illustrative filenames inside backticks (`chart.svg` in `docs/charting.md`, `<slug>-chart.svg` in `skills/story/SKILL.md`), quoted link *patterns* in this file's prose describing the `ub1` fix, or scheme-less and `ftp://` URLs in the archived `datasets/commons-issues/` copies of upstream issues. All left alone; the last group is a record of what an upstream issue said, not our text.
- **Blockers:** none.

### Found this run — two per-dataset `AGENTS.md` copies had drifted — **done**

- **Changed paths:** `co2-ppm/AGENTS.md`, `oil-prices/AGENTS.md`
- **Commit:** `6ecf457`
- **What changed:** both were an older revision, missing "Do NOT linewrap markdown files", the `enrich` and `story` rows in the skills table, and the whole task-tracking section. The linewrap rule is a convention an agent working in those directories needs and was not being given. Both files were a strict subset of the root file — verified, nothing unique in either — so they were replaced with it. All six copies are now byte-identical, which is what "copy this `AGENTS.md` into the new directory" is meant to produce.
- **Blockers:** none.

### Changelog

`changelog/2026-09-19-cleanstring-idiom.md`, `promote: false`. It covers the `cleanString` idiom and, at more length, the corrected claim — the skill's own evidence for a rule having been stated backwards is the part a reader of the skill would want to know. The four link, escape and sync commits are tidying and are not in it.

### Follow-ups from 2026-09-18 that this run deliberately did NOT take

- **Item 4, a second source-discovery rep.** Not started, and this is a judgement the owner may want to overturn. It is real agent work needing no owner input in principle, but the playbook names the least-tested path as the one where *the licence question does not resolve cleanly* — and that is exactly the question still open on the first rep. `datapressr-03u.1`'s licence position (PDDL-1.0 on the compilation, no redistribution licence claimed for the press-release text) is flagged in the section above as needing the owner's eye and has not had it. Building a second dataset whose defining feature is an unresolved licence, on top of a first whose licence stance is unratified, would compound the one decision that is genuinely the owner's. Worth doing as soon as that position is confirmed or corrected.
- **Item 5, splitting the changelog entry.** It is explicitly an owner preference about an already-published entry, not a defect.
- **Item 6, the `docs/` backlog drift.** Explicitly conditioned on the owner having acted on `docs/inbox-triage.md` and `docs/github-issue-reconciliation.md`. They have not been acted on, and this run added a section to this file rather than reducing the pile — so the item stands and is now slightly worse.

### Queue status at the end of the run

No actionable Beads work remains, and none of the six follow-ups this run completed exists as a Bead — they live in this file only. **None of the seven tasks the previous run completed, nor any of this run's work, has been recorded in Beads itself**, because `bd` cannot sync from here. The evidence for closing each is in its section.

Still open in the JSONL and deliberately untouched, unchanged from the previous run: `datapressr-03u` (the Tesla epic, whose only execution child is done — closing it is an acceptance judgement and the owner's); `7fs`, `d6n`, `46c`, `5yq`, `ck8` (status `deferred`, post-v1); `77e`, `23l`, `aw1` (human-only or owner decisions).

**What needs the owner, in priority order:** (1) the `tesla-quarterly-deliveries` licence position, which now also gates item 4 above; (2) the three questions in `docs/inbox-triage.md` (does this catalog publish non-commercial data; what the FiveThirtyEight note meant; what "Wiser metrics" is); (3) whether to post any of `docs/github-issue-reconciliation.md`, and whether to close `datapressr-03u` and issue #14.

Final verification: `npm test` 82/82; `validate-datapackage.mjs` 0 errors and 0 warnings on all five datasets; all five builds byte-reproducible from their archives; no literal invisible characters left in any tracked `.ts`/`.mjs` source; working tree clean, everything pushed to `main`.

### New work found during this run (for the owner to file as Beads)

1. **The `skills/` worked-example paths are still repo-relative, and the skills are installed elsewhere.** This run made the two cross-repo citations absolute. The four that point inside this repo (`co2-ppm`, `oil-prices`, `population-growth`, `airports`) are correct for a contributor reading the file here, and dead for anyone who installed the skill with `npx skills add datasets/datapressr`, which is the documented way to get it. Making them absolute too would fix that; leaving them relative keeps them clickable in the repo. A real choice, not a defect — worth the owner picking one.
2. **Nothing enforces the absence of literal invisible characters.** Two separate places had the bug, written months apart, and both passed review by eye. The scan that found them is four lines of Node over tracked `.ts`/`.mjs` files. It could be a test in `scripts/`, which would also stop the next copy-paste from reintroducing it. Not added here because it is a new repo-level check rather than a fix to existing work.
3. **The per-dataset `AGENTS.md` copies carry repo-level task-tracking instructions.** This run made them byte-identical to the root file, which is what the convention says. But a dataset directory that becomes its own repo does not need the Beads section, and that section is the reason the links needed absolutising in the first place. If the owner would rather the copies were a dataset-relevant subset, that is a different and defensible convention — it just needs deciding, because the two rules pull opposite ways.

---

## Run 2026-09-19T07:38Z

Beads state read from `.beads/issues.jsonl` at `600b64c`. `bd` is still not installed here, and this run established *why* the Dolt remote cannot work from the sandbox rather than just observing that it doesn't: the remote is `git+ssh://git@github.com/datasets/datapressr.git` (`.beads/config.yaml`) and **there is no `ssh` binary in the image at all** (`ssh: No such file or directory`). Nothing was initialised or recreated. Working directly on `main` per the run's standing authorisation.

**The Beads queue had no actionable work again.** Every open, unblocked, non-human, non-epic task in the JSONL — `ozk`, `eec`, `ub1`, `03u.1`, `d8r`, `h7d`, `u3m` — is recorded **done** in the 2026-09-18 section, which this file's reading rule says to honour. No new Beads have appeared. So this run took the one follow-up on the list that is a repository defect needing no owner input: item 2 of "New work found during this run" in the 2026-09-19T02:20Z section.

Root checks at the start: `npm test` 82/82; `validate-datapackage.mjs` 0 errors and 0 warnings on all five datasets.

### Follow-up 2026-09-19 item 2 — nothing enforced the absence of literal invisible characters — **done**

- **Changed paths:** `scripts/check-invisible-characters.mjs` (new), `scripts/check-invisible-characters.test.mjs` (new), `skills/structure/SKILL.md` (one bullet), `package.json` (one script), `changelog/2026-09-19-invisible-character-check.md` (new)
- **Commits:** `4106152` (the check), `fbd5cdf` (review findings applied)
- **What it does:** fails when a literal invisible character — U+00A0, U+200B, the variation selectors, the Hangul fillers, the bidi and tag characters, 230 code points in all — appears in checked-in source rather than as a backslash-u escape. It reports file, line, column, the character's name and the exact escape to write instead. `npm test` runs the same scan; `npm run check:invisible` runs the CLI.
- **Scope, and why:** the nine source extensions (`.ts`/`.mts`/`.cts`/`.tsx`/`.js`/`.mjs`/`.cjs`/`.jsx`/`.py`), never anything under `archive/`. Data, prose Markdown and archived snapshots are records of what a source actually said — `airports` publishes U+00A0 and U+200B in place names on purpose, and `datasets/commons-issues/*.md` is a copy of what an upstream issue said. Rewriting any of those would be falsifying evidence, and Markdown has no escape syntax to offer as the fix anyway. `.json` and `.yaml` are named in the script header as deliberate gaps, with the condition for closing each.
- **Commands and results:** `npm test` 107/107 (82 before, 25 new). `npm run check:invisible` clean. All five datasets still validate 0/0. `git diff --check` clean. Negative controls run by hand: injecting a U+00A0 into `wrangling-idioms.mjs` makes the CLI print the finding and exit 1, and makes the test fail; reverted clean.
- **The check caught its own source twice during development.** The escapes written into the new files arrived on disk as literal invisible characters, in the script header and then again in a test — exactly the failure mode, in the files whose purpose is preventing it. Both were found by running the check, not by reading. That is the strongest evidence available that the check earns its place, and it is why the test file carries a header saying every invisible character in it is an escape on purpose.
- **Independent check — twelve findings from a fresh review agent, every one verified here before applying, all applied in `fbd5cdf`:** a tracked file deleted from the working tree is still listed by `git ls-files --cached`, so reading it threw and aborted the entire scan, hiding every later file; a missing root threw a raw ENOENT instead of reporting; git's own "not a git repository" complaint leaked into the report; the CLI guard compared a `file://` template against a raw path, so the command `skills/structure/SKILL.md` tells people to run printed **nothing and exited 0** from any directory with a space in its name — a check that silently reads as "clean" is the worst thing this file could do; the suggested escape used the four-digit form for astral code points, which spells a different, visible character plus a stray hex digit; extension matching was case-sensitive; the no-git fallback walked into directories `.gitignore` excludes; and the character table was missing the variation selectors, Hangul fillers, combining grapheme joiner, Mongolian FVS, deprecated format controls and tag characters. The reviewer also confirmed what the check does *not* do wrong: no false positives anywhere in the tracked tree, correct handling of paths with spaces and newlines, correct line/column against CRLF, tabs, a leading BOM and U+2028, and conventions matching `validate-datapackage.mjs`.
- **Two claims in the first draft were wrong and are corrected.** (1) The bullet said a flattened paste "stops doing the one thing `\s` cannot do". JS `\s` **does** match U+00A0 (verified: U+00A0, U+202F, U+2009, U+3000 and U+FEFF all match; U+200B and U+200D do not) — so the catastrophic-paste story is true of the zero-width half only, and the first draft contradicted a docstring in `wrangling-idioms.mjs:45` that had it right. (2) "which `npm test` runs over every source file in the repo" overstated twice: `npm test` is `node --test` and never invokes the CLI, and "every source file" means 26 files in nine extensions outside `archive/`, not `.md`/`.json`/`.csv`/`.yaml`.
- **The repo-wide scan had no negative control.** Its only assertion was `deepEqual(findings, [])` against a clean repo, which would have passed if `isSourcePath` were inverted, `SOURCE_EXTENSIONS` emptied, or `scanRepo` replaced with `return []`. It now has one: a throwaway tree with a literal in `src/build.ts`, a zero-width space in `notes.md` and another literal in `archive/old.ts`, asserting that exactly the first is reported. Plus a subprocess test asserting the CLI's exit codes, which is what would have caught the silent-exit-0 defect.
- **Blockers:** none.

### Found this run — the same silent-exit-0 defect in the `/validate` CLI — **done**

- **Changed paths:** `scripts/validate-datapackage.mjs` and both per-dataset copies (`co2-ppm`, `oil-prices`), `scripts/validate-datapackage.test.mjs`
- **What changed:** the CLI guard compared `import.meta.url` against a `file://` template built from `process.argv[1]` — a percent-encoded URL against a raw path. Run from any directory with a space or a non-ASCII character in its name, `/validate` printed **nothing and exited 0** — on a package with real errors. Reproduced against `scripts/fixtures/bad-name` from a spaced path: silent, exit 0 before; two errors and exit 1 after. Now `pathToFileURL(process.argv[1]).href`, with the same `process.argv[1] &&` guard the invisible-character check needed, so a bare `import()` of the module still works.
- **Why it was in scope after all:** it was written up as follow-up 1 below, on the grounds that the file has two copies the repo keeps byte-identical and so it was a three-file change. That reasoning was wrong on reflection — fixing all three *is* what keeps them identical, the fix is one line each, and it is a silent wrong answer in the command `AGENTS.md` tells every contributor to run. All three copies verified byte-identical after the change.
- **Commands and results:** `npm test` 108/108 (one new test, which runs the CLI from a deliberately spaced temp directory and asserts exit 1); all five datasets still validate 0 errors and 0 warnings; `npm run check:invisible` clean.
- **Blockers:** none.

### A correction to the previous run's record

`docs/handoffs/cloud-queue.md:209` (the 2026-09-19T02:20Z section) says the two invisible-character bugs were "written months apart, and both passed review by eye". Both halves are wrong, and the first draft of this run's work inherited them. Checked against git: the repo's first commit is 2026-09-13 and it has 50 commits, so nothing in it is months apart. The literals first shipped in `4aa3246` (`build.test.mjs`, 2026-09-18), `e97a613` added the `build.ts` one the same day, and `9e886d0` fixed both the next day. The second instance — the first draft of `cleanString` — never shipped: a review agent caught it in the minutes before `faac8ca`, as that run's own notes say two paragraphs earlier. So: written twice inside two days, one shipped, one caught by review. The previous section is a dated run log and has been left as written; this is the correction on the record.

### Queue status at the end of the run

No actionable Beads work remains. As with both previous runs, **nothing has been recorded in Beads itself** — `bd` cannot sync from a sandbox with no `ssh`. The evidence for closing each completed task is in its section of this file.

Still open in the JSONL and deliberately untouched, unchanged from the previous two runs: `datapressr-03u` (the Tesla epic, whose only execution child is done — closing it is an acceptance judgement and the owner's); `7fs`, `d6n`, `46c`, `5yq`, `ck8` (status `deferred`, post-v1); `77e`, `23l`, `aw1` (human-only or owner decisions).

**Follow-ups this run did NOT take, and why:**

- **Item 4 from 2026-09-18, a second source-discovery rep.** Still not started, and the reasoning has moved on slightly, so it is worth restating rather than repeating. The previous run declined it because the playbook names the licence-unresolved path as its least-tested rule and `datapressr-03u.1`'s licence position is still unratified — compounding one open owner decision with another. That argument is sound but it only blocks *one* of the two reps the playbook asks for. The other — a source with **no machine-readable index** — needs no licence answer and is genuinely doable by an agent. It was not taken here because building and publishing a new dataset on a branch that auto-publishes the public site is a larger, unbudgeted call than a repository defect fix, and it has no Bead authorising it the way `03u.1` authorised the first one. **This is the clearest piece of real work waiting on a yes.**
- **Items 5 and 6 from 2026-09-18 and items 1 and 3 from 2026-09-19** are all explicitly owner choices (whether to split a published changelog entry; whether to fold the decision documents back into Beads; whether skill worked-example paths should be absolute; whether per-dataset `AGENTS.md` copies should be a subset). None has moved.

**What needs the owner, in priority order,** unchanged from the previous run: (1) the `tesla-quarterly-deliveries` licence position, which also gates the second discovery rep; (2) the three questions in `docs/inbox-triage.md`; (3) whether to post any of `docs/github-issue-reconciliation.md`, and whether to close `datapressr-03u` and issue #14.

Final verification: `npm test` 108/108; `npm run check:invisible` clean; `validate-datapackage.mjs` 0 errors and 0 warnings on all five datasets; working tree clean, everything pushed to `main`.

### New work found during this run (for the owner to file as Beads)

1. ~~`scripts/validate-datapackage.mjs` has the same silent-exit-0 defect~~ — **done this run**, see the section above. Left here because it was found and written up before it was fixed.
2. ~~`scripts/wrangling-idioms.mjs:79`'s character class is redundant~~ — **done this run.** `/[\s\u00a0\u200b]+/g` keeps the explicit `\u00a0` (`\s` already matches it) and the docstring now says so, rather than trimming a class that reads as the list of characters the function exists to handle.
3. **`.json` and `.yaml` are named gaps in the new check.** A stray U+00A0 pasted into a published `datapackage.json` field description would not be caught; nor would one in a CI `run:` block if this repo grows workflow files. Both are closable, and both need a rule separating hand-written metadata from `archive/` and `data/` payloads first. No tracked JSON in the repo carries one today.

---

## Run 2026-09-19T12:08Z — the second source-discovery rep

Beads state read from `.beads/issues.jsonl` at `81961b9`. `bd` is still not installed here and there is still no `ssh` binary in the image, so nothing was initialised, recreated or synced. Working directly on `main` per the run's standing authorisation.

**This run had one assigned task rather than a queue.** `datapressr-b6w` — "Source-discovery rep 2: a source with no machine-readable index" — reads `in_progress` in the JSONL, assigned to `cloud:trig_01FrgRJfGJ7anmJwpWN3xQqY`, which is this routine. Every other open Bead is deferred, human-only, or the Tesla epic. The queue is otherwise drained, as the previous three runs record.

### datapressr-b6w — source-discovery rep 2, a source with no machine-readable index — **done**

- **Changed paths:** `datasets/climate-and-environment/us-natural-hazard-statistics/` (new — `fetch.ts`, `build.ts`, `build.test.mjs`, `datapackage.json`, `README.md`, `AGENTS.md`, `.datahubignore`, `package.json`, `package-lock.json`, `archive/` 33 files, `data/` 2 CSVs), `docs/examples/nws-hazard-source-discovery.md` (new), `docs/source-discovery-playbook.md`, `changelog/2026-09-19-us-natural-hazard-statistics.md` (new)
- **Commits:** `cced892` (dataset, example doc, changelog)
- **Source chosen:** the National Weather Service's annual *Summary of U.S. Natural Hazard Statistics* — US weather-related fatalities, injuries and property/crop damage by event type, 1997–2025. 29 years, 759 event rows plus the source's own 29 annual totals, keyed on `(year, hazard)`, with a coverage resource accounting for all 31 candidate documents.
- **Why this source:** it satisfies the Bead's five constraints, and the no-index one strictly. `weather.gov` serves **no `robots.txt` and no `sitemap.xml`** (both 404, now probed and recorded in `archive/manifest.json` on every fetch so the claim is checkable), no API, no feed and no bulk download. The only listing of the 31 annual PDFs anywhere is a hand-maintained `<select>` jump menu on one HTML page.

**Four candidates were rejected first, each with its probe result recorded:**

| Candidate | Result | Why rejected |
|---|---|---|
| `usmint.gov` — circulating coin production | **HTTP 403**, Cloudflare managed challenge on `/robots.txt` | A 403 is an answer. Not worked around. |
| `bep.gov` — annual currency production | complete `sitemap.xml`; target page **timed out** after 30s | Has an index, so wrong shape for this rep; and did not load. |
| `archives.gov` — Electoral College results | **200**, `Crawl-delay: 10`, sitemap lists all 61 per-election pages | Perfectly good source; has exactly the index this rep exists to do without. |
| `federalreserve.gov` — FOMC Summary of Economic Projections | **200**, no `robots.txt`, no `sitemap.xml`, no API, no bulk download | **Rejected on the licence.** Structurally the best match found. |

- **The Federal Reserve rejection is the decision most worth your eye.** The SEP is a richer dataset than the one that got built, and it is the better no-index example. Four likely terms URLs (`/aboutthefed/policies.htm`, `/terms-of-use.htm`, `/copyright.htm`, `/website-policies.htm`) all 404; the one that exists, `/website-linking-policies.htm`, addresses only *external* sites. A public-domain argument was available — a federal agency's own statistical tables, and tables of facts besides — and **was deliberately not taken**, because it is an inference rather than a stated position and `datapressr-dzo` (the Tesla licence position) is still unratified. Stacking a second inferred position on the first is the one thing the Bead told this run not to do. If you would rather have the Fed dataset, that is a one-line answer from you and a straightforward rerun.
- **Licence of what was built — clean, and it needs no ruling from you.** The NWS states its own position: *"The information on National Weather Service (NWS) Web pages are in the public domain, unless specifically noted otherwise, and may be used without charge for any lawful purpose…"* The page is archived as `archive/disclaimer.html` and quoted verbatim in `datapackage.json`. `PDDL-1.0` on the compilation, following `co2-ppm` (NOAA) and `oil-prices` (EIA), which are the same situation — an earlier draft invented a non-SPDX `NWS-public-domain` id and was corrected to the repo's own precedent. The disclaimer's 17 U.S.C. § 403 request is met explicitly in the README and the licence title.
- **Commands and results:** `npm test` 144/144 from root, 36 of them this dataset's; `npm run check:invisible` clean; `node scripts/validate-datapackage.mjs` → 0 errors, 0 warnings for all **six** datasets; two consecutive builds byte-identical; `fetch.ts` run with `NWS_USER_AGENT="datapressr hello@datahub.io"`, 35 requests paced at 1.5s (well under 1/second), no retries and no rate-limit rejection.
- **Independent verification, twice over.** (1) A second extractor sharing no code with `build.ts` and **not using `pdfjs-dist` at all** — it decompresses the PDF content streams and tracks the text matrix through the `Tm`/`Td`/`TJ` operators — reconstructed 181 published rows across ten years spanning the range with **zero mismatches**. (2) A fresh adversarial review agent wrote its own extractor with a deliberately different column-assignment strategy and re-derived **all 788 rows × 5 numeric columns, plus labels, categories and `is_total`, and independently re-derived all 31 rows of the coverage resource** — zero mismatches, and it confirmed the manifest hashes, the licence quote in context, and every headline figure in the README.
- **Two bugs reached the CSV, and no check caught either.** An event was published as `River Flood}}` for six years (a brace drawn beside the label in the legacy layout was being folded into it), and the coverage table's `layout` column described all 29 documents as "modern" because it was computed with a case-sensitive test plus a `year <= 2006` cutoff. **Both had correct numbers and wrong labels** — the same species as the Tesla run's coverage-table error. Both were found by printing the distinct label vocabulary and the coverage table and reading them, before review.
- **Two latent defects the reviewer found by mutation, both fixed.** (1) A row could be dropped and every check still pass: deleting `Volcanic Ash` from the parser loses 29 rows, exits 0 and passes all tests, because an event with no deaths, no injuries and little damage subtracts nothing from any total. The damage tolerance was also 433× looser than the source ever needs (worst real drift 0.03 M$ against a 13.0 M$ limit). (2) A whole-era column swap was invisible: swapping fatalities↔injuries and property↔crop for 2007 onward leaves all 513 modern-era rows wrong, exits 0 and passes all tests. The *legacy* era was already protected — the braced flood subtotal catches it — but the modern era had no redundancy and **no assertion anywhere was anchored outside the pipeline**. Fixed by asserting the expected event vocabulary per year, tightening the tolerance 10×, requiring all seven categories and the legacy brace, and adding six five-tuples **read off the PDFs by hand** as the negative control. Both mutations were re-run afterwards and now fail loudly.
- **One reviewer figure was not reproducible and was not taken on trust.** It reported "507 rows wrong" from the column-swap mutation; re-running it here gives **all 513 modern-era rows swapped, 463 of them textually different**. The published wording is the measured number, not the reported one.
- **Decisions:** the coverage resource lists all 31 candidates including the 1995 document the menu offers and the server 404s, and the 1996 one that is page images with no extractable text (verified independently: 4 image objects and one text operator rendering nothing, against 305 in 1997) — recorded as discovered-and-not-extracted rather than OCR'd; `hazard` keeps the source's label verbatim and `hazard_id` folds **only** the two 2007 re-spellings, leaving `Rip Current` (from 2002) and `Small Stream/Urban Flood` (to 2006) as visible gaps rather than invented series; the source's own total row is published flagged `is_total` rather than dropped; column bands are calibrated per document because the two eras' bands overlap; per-state summaries, the nine per-hazard menus and the fatalities-by-sex-and-age table are recorded as discovered and not extracted.
- **Blockers:** none.

### Deliverable 3 — the discovery-log example, and what the run showed about the playbook's rules

`docs/examples/nws-hazard-source-discovery.md` follows the structure the first rep established: the question, the candidate table with every probe result, what the source actually supports, the failures in order, coverage, and an autonomy log. The playbook's own §8 handoff template is what it is written against.

The rule-by-rule verdict is in `docs/source-discovery-playbook.md` and is summarised here so the Bead can be closed from this file alone:

- **§2 "find indexes, not documents" — did not apply**, by construction. What replaced it: the source's own hand-maintained menu as the selection rule. The workflow survived, but at a stated cost — coverage is auditable **against the listing, not against reality**, because nothing can tell you whether the menu omits a document that exists. That is a strictly weaker claim than rep 1's and the dataset's README says so.
- **§3 candidate ranking — held, and finally broke ties.** In rep 1 no criterion ever had to decide anything. Here "reachable without pretending" rejected `usmint.gov`, and "documented access terms" decided the run. Criterion 5 ("an index") was **demoted from a requirement to a preference** on evidence: the best-indexed candidate was set aside and the source with none at all was built.
- **§4 "never invent a redistribution licence" — held, and cost the better dataset.** It also gained a third outcome the original rule did not name: **reject the candidate at probe time**, which is earlier and better than the "stub plus blocked publication" path. That blocked path has now been *available* twice and *walked* zero times.
- **§5 "never infer a document's identity from its filename" — generalised and failed again.** Rep 1 inferred from a filename; this run inferred a table layout from the **year**. Same rule, new costume. "Verify across the whole range" failed loudly again, this time on the *oldest* document.
- **§6 "count what you selected" — held, and is still necessary and not sufficient, for the second run running.** Four wrong labels across two runs, none caught by a count or an assertion. Three new rules came out of this run: assert the record *set* rather than the count; keep at least one assertion anchored **outside** the pipeline; and try to break your own build before someone else does.
- **§7 "expect the reporting to change" — held.** Two layouts, four label changes, and a deliberate refusal to fold the two that are real appearances and disappearances. **Revisions could not be tested**: the source revises silently and, with no index, publishes no change feed, so only re-fetching and diffing would show it.
- **§8 handoff — held**, with two manifest fields added: HTTP status per candidate, and the terms page archived as evidence.

### Deliverable 2 — should discovery graduate into a skill? **No, and for a specific reason**

The playbook set its own condition: two more runs against structurally different sources, *one with no index* and *one where the licence does not resolve cleanly*. **The first is now done. The second is not** — and this run made its absence sharper rather than smaller, because it *met* a licence-ambiguous source (`federalreserve.gov`) and **rejected** it rather than walking the blocked-publication path to its end. So after two runs the least-tested rule in the document is the same rule that was least-tested after one, and it has had two opportunities and zero exercises.

Two further reasons are recorded in the document: the rules are demonstrably good at counts and bad at names in both runs, and the fix found so far is a habit rather than anything a skill could enforce; and rep 2 read rep 1's playbook before starting, so this is replication of a procedure rather than of a result.

**No `discover` skill was created, as the Bead required.**

### Queue status at the end of the run

`datapressr-b6w` is **complete** and its acceptance criteria are met: a new dataset following `AGENTS.md` (structured, licences and sources filled in, typed schema with `primaryKey`, `.datahubignore`, copied `AGENTS.md`, `archive/` with raw snapshot and provenance manifest, a checked-in build that reproduces `data/*.csv` byte-identically across two runs, and a coverage resource that shows what was and was not captured); a playbook update marking each rule held / failed / did-not-apply with tags moved on evidence only; a discovery-log example under `docs/examples/`; a changelog entry; and an explicit, negative answer on graduating discovery into a skill. **It still reads `in_progress` in `.beads/issues.jsonl`** because `bd` cannot sync from here — please transfer this section and close it.

Still open in the JSONL and deliberately untouched, unchanged from the previous three runs: `datapressr-03u` (the Tesla epic); `7fs`, `d6n`, `46c`, `5yq`, `ck8` (deferred, post-v1); `77e`, `23l`, `aw1` (human-only or owner decisions); `dzo`, `78h`, `mpy`, `zwt`, `07t`, `vkk`, `e2t` (the decisions and defects filed on 2026-09-19); and `jn8`, the third rep, which remains blocked on `dzo`.

Nothing external was sent: no GitHub comment, no issue edit, no email, no message of any kind. `datapressr-77e` was not touched. The `tesla-quarterly-deliveries` licence position was not modified.

Final verification: `npm test` 144/144; `npm run check:invisible` clean; `node scripts/validate-datapackage.mjs` 0 errors and 0 warnings on all six datasets; the new build byte-reproducible across two consecutive runs; working tree clean, everything pushed to `main`.

### What needs the owner, in priority order

1. **`datapressr-dzo` — the `tesla-quarterly-deliveries` licence position.** Unchanged and now two runs old. It still gates `jn8`, the third source-discovery rep, which is the one remaining thing standing between this playbook and a decision about graduating it.
2. **Whether you would rather have had the Fed dataset.** This run rejected `federalreserve.gov` — structurally the best no-index source it found — solely because the Board publishes no reuse statement. That was the conservative reading of the Bead's "do not compound the unresolved licence". If you are comfortable with a public-domain position on a federal agency's own statistical tables, say so and the rep can be redone against a better source; the discovery log records everything needed to pick it up.
3. Unchanged from previous runs: the three questions in `docs/inbox-triage.md`; whether to post any of `docs/github-issue-reconciliation.md`; whether to close `datapressr-03u` and issue #14.

### New work found during this run (for the owner to file as Beads)

1. **The 1996 summary is recoverable with OCR, and it is the only gap in the series.** It is a real PDF of page images; the table is legible. One year, one document, and it would make the series 1996–2025 contiguous from the first document that exists. Not done here because OCR is a new dependency and a new class of extraction risk, and the Bead scoped this run to discovery.
2. **The per-state summaries and the nine per-hazard menus are the same source, one level down.** `sum<yy>.pdf` has siblings `state<yy>.pdf`, `cold<yy>.pdf`, `flood<yy>.pdf` and so on, all listed by the same hub page and all unextracted. A state-level version of this dataset is a straightforward follow-on with the same fetch, the same licence and the same coverage discipline.
3. **Nothing in this repo detects that a source has revised a snapshot.** This dataset's documents carry a `Report generated:` date showing the NWS regenerates old years silently (2007–2015 all regenerated in 2016, 2019 in 2021, 2024 in 2026), and the same is true of the Tesla restatements. `fetch.ts --refresh` plus a hash diff against the committed manifest would surface it in one command, and would suit any `monitored` dataset. Worth a shared helper rather than a per-dataset habit.
4. **The adversarial-review step is a convention of these runs, not a rule in any document.** In both source-discovery reps the single most valuable finding came from a fresh reviewer rather than from the agent doing the work — rep 1's wrong coverage rows, rep 2's two latent silent-failure paths. `docs/source-discovery-playbook.md` now says this in its limitations, but neither it nor `skills/structure/SKILL.md` actually *requires* it. Two for two is worth writing down before discovery is graduated into anything.
5. **`skills/structure/SKILL.md` still has no coverage-table guidance.** The playbook has now said twice that this is the single most transferable thing either rep produced, and it is still only in the playbook. The `airports` and `population-growth` builds would both be better with it.
