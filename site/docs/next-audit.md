# NEXT.md migration audit — 2026-09-12

This is dated evidence, not a live queue. Current status and detailed work instructions live in Beads. Start with [NEXT.md](https://github.com/datasets/datapressr/blob/main/NEXT.md) and [the handoff](next-session-brief.md). Following the migration, the owner requested retaining NEXT.md as a reusable session prompt that selects ready Beads; its former task list remains migrated below.

## Completed versus remaining

| Work | Evidence inspected | Verdict |
|---|---|---|
| Keeling story | site/stories/keeling-curve.md, outline; closed GitHub #9 | Draft done; chart port and author voice remain |
| Planetary Boundaries story | prose, outline, chart builder and SVGs; closed datapressr-tzh records 16380d8 and 62c526e | Draft done; GitHub #4 stale; author voice remains |
| Craft/voice research | docs/story-craft.md, docs/voice-guide.md; closed datapressr-10y | Reuse existing work |
| Near-term charting | docs/charting.md dated 2026-09-06; pinned Plot/jsdom dependencies | Observable Plot → SVG decided; native renderer research remains |
| Enrich first rep | co2-ppm/enrich.ts, SUMMARY.md, enriched metadata | Done; oil-prices rep remains |
| Story/enrich skills | both drafts have Open questions; neither has .claude/skills symlink | Drafted, not activated |
| Benchmark round 1 | docs/structure-benchmark.md; closed datapressr-pao, dlc, jbz, 31i, ejh; helper tests | Three reps and eight findings applied; JSON/API and relational join remain |
| CO₂ extensions | typed global annual and growth resources; closed datapressr-7yo | Delivered; NOAA growth explicitly differs from annual-mean differences |
| Drawdown relocation | closed datapressr-61n; dataset removed locally | Previously completed according to records; current external publication/license comparison remains |
| Site and six portable skills | site pages, six symlinks, closed GitHub #5 | Existing deliverables present; live deployment not revalidated |

Fresh baseline: `npm test` passed 28/28; oil-prices and co2-ppm validators each returned zero errors/warnings. These checks do not prove data-level type correctness. Oil-prices deliberately retains Date/Price for comparison with its published reference. Its view says Brent vs WTI but references only Brent; the enrichment task covers this misleading label.

Existing datapressr-gy3 is preserved as the benchmark epic and returned from stale in_progress to open. The original Tesla idea datapressr-03u and all ten closed tasks are preserved. After the migration, the owner selected Tesla as an autonomous discovery/scraping example: datapressr-03u is now a P2 epic, with execution task datapressr-03u.1 covering source discovery, snapshots, reproducible extraction and an autonomy report. No completed implementation was duplicated.

## Removed queue coverage

| NEXT.md item | Canonical Beads |
|---|---|
| Story #3 trial and activation | datapressr-7mc, datapressr-0cp, datapressr-ogt, datapressr-1li, datapressr-9qc |
| Oil-prices enrich trial and activation | datapressr-q96, datapressr-9qc |
| Benchmark round 2 | datapressr-gy3; datapressr-cq6, datapressr-rvi, datapressr-rlb |
| Keeling chart port | datapressr-8rk |
| Two Drawdown datasets | datapressr-jh6, datapressr-aw1 |
| Author voice #1/#2 | datapressr-77e |
| Legacy inbox triage | datapressr-h7d; Tesla remains datapressr-03u |
| Optional site rename | datapressr-23l |
| Data-level validation | datapressr-ck8 |
| Docs/changelog publication | datapressr-5yq |
| Monitor/cloud | datapressr-46c |
| v1 completion gate | datapressr-9up, datapressr-blj |

The referenced GitHub roadmap also preserves native-chart research (datapressr-7fs) and skill evals (datapressr-d6n) as post-v1. datapressr-u3m prepares reviewable corrections to stale GitHub issue bodies without sending messages or changing external status.

## Delegation index

The IDs below are a migration snapshot; use Beads for live status, file ownership, steps and acceptance checks.

| Bead | Deliverable |
|---|---|
| datapressr-9up | DataPressr v1: prove and activate story + enrich |
| datapressr-q96 | Enrich oil-prices and record the second-case findings |
| datapressr-7mc | Story #3: oil-prices argument, source checks, and outline |
| datapressr-0cp | Review story #3 outline and approve the argument |
| datapressr-ogt | Story #3: deterministic Observable Plot charts |
| datapressr-1li | Story #3: write prose from approved outline and charts |
| datapressr-9qc | Resolve draft questions and activate story + enrich |
| datapressr-blj | Review v1 acceptance and publish the completion record |
| datapressr-cq6 | Benchmark round 2: one JSON/REST API source |
| datapressr-rvi | Benchmark round 2: genuine relational multi-file join |
| datapressr-rlb | Benchmark round 2: synthesize findings and scope fixes |
| datapressr-8rk | Port Keeling charts to Observable Plot and polish annotations |
| datapressr-jh6 | Compare both Project Drawdown packages and prepare a decision |
| datapressr-aw1 | Owner decision: Project Drawdown naming and publication |
| datapressr-77e | Author voice pass on Keeling and Planetary Boundaries |
| datapressr-h7d | Prepare evidence and owner choices for the seven legacy inbox finds |
| datapressr-23l | Owner decision: retain or rename the Flowershow site |
| datapressr-ck8 | Design data-level schema validation with executable acceptance fixtures |
| datapressr-5yq | Design publishing docs and changelog on the site together |
| datapressr-46c | Research monitor execution and propose one minimal pilot |
| datapressr-7fs | Research native DataHub/Flowershow chart support after v1 |
| datapressr-d6n | Design repeatable evals for prompt-only skills |
| datapressr-u3m | Reconcile legacy GitHub issue status with the Beads audit |

Human decisions and post-v1 research are deferred, outside the immediate queue. Drawdown comparison and inbox research prepare concrete choices before owner review. v1 dependencies are encoded explicitly; benchmarks are nonblocking.

Planning defaults are oil-prices for story #3 and an independent AI outline reviewer; author voice remains human. Revise Beads if the owner answers differently. Source selection in benchmark tasks and future architecture choices are explicitly research deliverables, not invented settled implementation specs.

GitHub issues #2–#14 were inspected read-only with gh. No external issues were edited. Closed Beads plus repository artifacts take precedence over stale issue checkboxes. External Drawdown packages and the live deployment still need current verification in their scoped tasks. The former NEXT.md task list and old unattended brief remain recoverable through Git history.
