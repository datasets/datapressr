---
title: "Next phase: publish, get used, keep producing, measure, keep current"
date: 2026-09-25
---

# Next phase plan — 2026-09-25

The plan for DataPressr after v1. Beads holds the executable tasks, their dependencies and completion evidence; this document gives the reasons, the order and the decisions behind them. Start from [NEXT.md](../../NEXT.md) as usual: `bd ready` shows which of these tasks can start now. The research behind each workstream is in [2026-09-25-research/](2026-09-25-research/), five reports written by parallel research agents on 2026-09-25, with two scratch prototypes in `prototypes/`.

## Where we are

v1 is done. It has eight skills (`capture`, `archive`, `structure`, `enrich`, `story`, `init`, `validate`, `push`), six datasets in `datasets/` (two enriched, four structured, all passing the validator with no warnings and rebuilding byte-identically), three data stories, two source-discovery reps with a playbook, and a live site at <https://datapressr.datahub.io>. `npm test` passes 159/159 as of this plan.

What the assessment found:

- **Nothing is on DataHub.** The name says "press", but no dataset has been published. The docs and the `push` skill describe `dh push`, a command the current CLI no longer has; it is now `dh publish` ([datahub](2026-09-25-research/datahub.md)).
- **An outside user could not get it working.** The documented `npx skills add datasets/datapressr` skipped `archive` and `structure`, because their unquoted YAML descriptions failed to parse. That was fixed during this planning session (7a7a768). Installed skills still depend on repo-only files: `init` has no conventions file or validator to copy, and several links in the skills point at repo paths ([adoption](2026-09-25-research/adoption.md)).
- **The ready queue was small polish.** There was no direction after v1, and five owner decisions were parked. By the owner's instruction (below), those decisions have now been made.
- **Nothing checks CSV values against their declared schema.** A prototype run on the six datasets found no errors, so adding the check costs little ([quality](2026-09-25-research/quality.md)).
- **No dataset is actually monitored.** Four of six have a fetch script and a hashed manifest. A live refresh of co2-ppm showed about 100 silent historical revisions, and the live EIA oil files are missing about 890 Brent and 743 WTI days that our snapshot has ([monitor](2026-09-25-research/monitor.md)).
- **The backlog is spent.** Everything in `datasets/BACKLOG.md` has shipped. About 25 of the open commons issues are real candidates ([backlog](2026-09-25-research/backlog.md)).

## Direction

The owner asked for all four directions at once: throughput, skill quality, living datasets and adoption. Getting datasets published on DataHub comes first, because every direction depends on it. A publication loop is the point of the project. Outside users need real dataset pages to look at. Monitoring should end with a refreshed dataset on DataHub. New datasets are only worth making if they get published.

Six workstreams, each an epic in Beads:

| # | Epic | Priority | Why now |
|---|---|---|---|
| 1 | `datapressr-sff` Publish on DataHub | P1 | The missing last mile; unblocks the others |
| 2 | `datapressr-4ly` Adoption | P1 (fixes), P2–P3 (content, launch) | Install was broken for outsiders; cheap fixes, high leverage |
| 3 | `datapressr-7q5` Throughput: batch 1 | P2 | Using the skills for real is what shows where they fall short |
| 4 | `datapressr-8no` Skill quality | P2 | Value validation is nearly free; evals let skill changes be measured |
| 5 | `datapressr-w83` Living datasets | P2 | One dataset monitored end to end turns `monitored` into a real stage |
| 6 | `datapressr-qmd` Housekeeping and decision review | P3 | Clear decision debt; one place for the owner to review |

## Workstreams

### 1. Publish on DataHub (`datapressr-sff`)

Publish into a dedicated `datapressr` publication, never into `core`. `core/co2-ppm`, `core/oil-prices` and `core/airport-codes` git-sync from `github.com/datasets/*`, and a direct upload would be overwritten by the next sync. Fixes that belong in core (the co2 column mislabel) go upstream as a PR instead.

- `sff.1` Update the push skill and docs for `dh publish`, `dh login`, an explicit `--publication`, the README requirement and the limits on views.
- `sff.2` Get all six datasets ready to publish: READMEs for airports and population-growth (a missing README renders as a 404 page), change co2-ppm's decade bar view to a type DataHub renders, and add notes on how each dataset relates to its core counterpart.
- `sff.3` **Human:** install `dh`, run `dh login` and create the publication. The CLI is in a private repo and login happens in a browser, so only the owner can do this, and it takes about five minutes.
- `sff.4` Pilot oil-prices and check the rendered page → `sff.5` publish the rest and link them from the site → `sff.6` send the co2 fix upstream.

CI publishing (`w83.4`) waits until the manual publish path works and Datopian has closed a server-side permissions issue it is tracking privately (`datahub-next-cyz.1`). Until then, treat the CLI token as highly privileged.

### 2. Adoption (`datapressr-4ly`)

- `4ly.1` Done: all eight skills install, and a strict frontmatter test stops a repeat.
- `4ly.2` Make installed skills self-contained. Bundle the validator and the dataset conventions into the skills that use them, kept in sync by a script and a test, the same pattern as `scripts/sync-dataset-agents.mjs`. Use absolute links, and have `capture` file ideas into the user's own project.
- `4ly.3` Let a fresh stub pass the validator (today `/init` output fails `/validate`).
- `4ly.4` Generate the datasets page from each `datapackage.json`. Today it lists 3 of 6 datasets.
- `4ly.5` Clean up the site and README: hide internal pages, separate story outlines from finished stories, fix the quick start, and put visitor-facing material first in the README.
- `4ly.6` Write a 10-minute tutorial with reference output, dry-run by a fresh agent.
- `4ly.7` Draft a launch post and a demo recording. `4ly.8` **Human:** approve and publish them. They go out in the owner's name.

### 3. Throughput: batch 1 (`datapressr-7q5`)

Five new datasets, chosen for variety of format, licence position and story potential:

| Bead | Dataset | Exercises |
|---|---|---|
| `7q5.1` | Arctic sea ice extent (NSIDC) | Clean CSV, **living source** (daily/monthly); built with `fetch.ts` + manifest from day one, second monitoring candidate |
| `jn8` | Fed Summary of Economic Projections | Source-discovery rep 3: a real licence question (Reserve Bank participation), HTML with no index |
| `s6e` | NWS state-level hazard statistics | Reuse of an existing PDF pipeline at 31× scale |
| `7q5.2` | UCDP battle-related deaths | Zipped CSV with uncertainty bounds; first strand of the causes-of-death comparison |
| `7q5.3` | IEA Global EV Outlook | xlsx; possible login wall (fallback: Big Mac Index) |

Plus charts on the two datasets that have none (`x5a` NWS, `86o` Tesla, `3j8` the NWS changelog image) and two stories:

- `7q5.4` "Heat is the quiet killer" (NWS). Heat caused 5,366 deaths from 1997 to 2025, more than tornadoes and flash floods combined.
- `7q5.5` The first story across two datasets: EV sales kept rising while Tesla's deliveries fell two years running.

`7q5.6` clears the inbox: GitHub issue #2 gets the dispositions decided below.

Each dataset goes init → archive → structure → enrich. After the structure step it gets the adversarial review from `8no.1`, and then it is published under epic 1. Friction found along the way becomes beads under epic 4, not side fixes.

### 4. Skill quality (`datapressr-8no`)

- `ck8` (reopened as implementation) The validator checks values against the schema by default, with `--metadata-only` to opt out and a `--json` mode. The contract and 11 fixtures are in the quality report, and a prototype passes all six datasets.
- `8no.1` The structure skill requires an adversarial review for datasets with a custom parser or many source documents. `5k8` adds guidance on coverage tables.
- `8no.2` Eval harness v0: an offline `structure` eval on the co2-ppm monthly file with 13 scripted checks, tested first against the reference build and deliberately broken builds → `8no.3` first comparison, with the skill, without it, and with Codex, three runs each, capped at USD 30 → `8no.4` a judged rubric calibrated against the owner, and `8no.5` an `enrich` eval.
- `8no.6` Decide whether discovery becomes a thin `discover` skill, after rep 3 and the review rule are in place.
- `07t` (P4) Extend the invisible-character check to JSON and YAML. It becomes more relevant once the repo has workflow files.

### 5. Living datasets (`datapressr-w83`)

Run it on GitHub Actions (free for a public repo, runs `node build.ts` unchanged) as a scheduled workflow that **opens a PR for human review and never publishes automatically**. Cloudflare Workers cannot run Node or git, and its full-Linux Sandbox option is a paid preview. The pilot is co2-ppm: small text files, monthly updates, and a build that already guards its headers. oil-prices is not ready (see `w83.5`).

- `02p` Shared `scripts/source-diff.mjs` (prototype in `prototypes/`). `w83.1` gives co2-ppm a `fetch.ts` and a manifest.
- `w83.2` Monthly workflow. It opens a PR only when `data/` changes, because NOAA rewrites a creation-date comment every month.
- `w83.3` Merge the first automated PR after NOAA's early-October release and set `status: monitored`.
- `w83.5` Explain the historical days missing from the live EIA files before monitoring oil-prices. This is a data-quality question in its own right.
- `w83.6` Document the pattern (supersedes `46c`). `w83.4` Publish on merge (P3, gated as described under workstream 1).

Note that GitHub disables scheduled workflows after 60 days of repo inactivity. The monthly PRs themselves count as activity once they are being merged.

### 6. Housekeeping (`datapressr-qmd`)

`qmd.1` cross-links the two Project Drawdown packages and traces the 2024 package's CC-BY claim. After that: `vkk` retires the decision documents that have been acted on (once `78h` closes), `u22` sets the changelog image practice, `voq` handles the 1996 OCR question (P4), and `qmd.2` lets the owner review the decisions below.

## Order and parallelism

Most work can start immediately. Waves by dependency:

1. **Now, in parallel:** `sff.1`, `sff.2`, `sff.3` (human), `4ly.2`, `4ly.3`, `4ly.4`, `4ly.5`, `8no.1`, `5k8`, `02p`, `w83.1`, `w83.5`, `x5a`, `86o`, `3j8`, `7q5.1`–`7q5.3`, `jn8`, `s6e`, `7q5.6`, `qmd.1`.
2. **Next:** `ck8` (after `4ly.3`), `sff.4` (after the owner's login), `w83.2`, `4ly.6`, the stories `7q5.4`/`7q5.5`, `8no.2`.
3. **Then:** `sff.5`, `sff.6`, `8no.3`, `w83.3` (timed to NOAA's release), `w83.6`, `4ly.7`, `8no.6`.
4. **Later / gated:** `4ly.8` (owner), `w83.4` (Datopian fix), `8no.4`, `8no.5`, `07t`, `voq`.

**Shared files, one editor at a time:**

| File(s) | Beads that edit them |
|---|---|
| `scripts/validate-datapackage.mjs` | `4ly.3` then `ck8`; `4ly.2` only bundles a synced copy |
| `AGENTS.md` | `sff.1`, `8no.1`; run `node scripts/sync-dataset-agents.mjs` after any change |
| `skills/structure/SKILL.md` | `8no.1`, `5k8` |
| `site/datasets.md` | `4ly.4` owns it; later beads regenerate it rather than hand-editing |
| `site/README.md`, `site/docs/cli.md` | `sff.1`, `4ly.5` |

Dataset beads each own their own directory. When dispatching in parallel, give each worker its own worktree.

**Human-only items**, all small:

- `sff.3`: `dh` install and login, about 5 minutes.
- `4ly.8`: launch approval.
- `qmd.2`: reviewing decisions made on the owner's behalf.
- `77e`: the author's voice pass on stories.
- Adding CI secrets when `w83.4` arrives.

## Decisions taken under delegation (review after)

The owner said on 2026-09-25: *"Unless something is super irreversible, you just make a proposal, go for it, and maybe note for later that we need to check in or review it once it's done."* Every decision below is reversible and carries the `review-after` label. `qmd.2` collects them for review.

| Decision | Where | Reverse by |
|---|---|---|
| Per-dataset `AGENTS.md` = the dataset-conventions part of the root file above a repo-only marker; synced by script, enforced by `npm test` | `zwt` item 3, done a86e8d6 | Remove the marker, copy whole file |
| Missing-values rule gains the "literal NA can be a real code" clause | `zwt` item 1, done a86e8d6 | Delete the clause |
| Skills use absolute GitHub links and bundle what they need | `zwt` item 2 → `4ly.2` | Relative links (breaks installs) |
| Tesla changelog entry stays one entry | `zwt` item 4 | Split it |
| Adversarial review required at `structured` for custom parsers / many documents | `zwt` item 5 → `8no.1` | Downgrade to recommended |
| Non-commercial data is not republished; HRMI closes as licence-incompatible | `78h` | Accept NC with a label |
| FiveThirtyEight and "Wiser metrics" inbox lines dropped (538 already mirrored in the org) | `78h` | Re-capture |
| Causes-of-death comparison proceeds, one dataset per series, starting with UCDP | `78h` → `7q5.2` | Close the bead |
| Project Drawdown: keep both, cross-link, no merge or rename | `aw1` → `qmd.1` | New decision bead |
| Site stays at datapressr.datahub.io (the rename had already happened) | `23l` | — |
| Publish to a `datapressr` publication owned by the owner's account, not `core`; ask Datopian later about the `datahub` user for sitemap inclusion | `sff` | Move publication |
| Validator checks values by default (opt out with `--metadata-only`) | `ck8` | Make it opt-in |
| Monitoring = GitHub Actions opening PRs, no auto-publish; pilot co2-ppm | `w83` | Different runner |
| Batch-1 dataset choice (sea ice, Fed SEP, NWS states, UCDP, IEA EV) | `7q5` | Swap beads |
| First eval run budget capped at USD 30 | `8no.3` | Change the cap |

Not decided on the owner's behalf, because they are outward-facing or personal: the DataHub login, publishing the launch post, and the voice passes. Pull requests to repos in the `datasets` org (`sff.6`, `qmd.1`) and editing this repo's inbox issue (`7q5.6`) are treated as reversible and within scope.

## Not in this phase

- Native chart standards (`7fs`, deferred). The DataHub renderer supports `vega-lite` and `plot` view types, so revisit this once real pages exist.
- A second monitored dataset. Sea ice is the likely candidate, after co2-ppm has worked end to end.
- Publishing Project Drawdown (2020) to DataHub; it lives in its own repo.
- Anything past the small-data ceiling (for example, GDELT).
