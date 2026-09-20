# Agent handoff: execute the Beads plan

Beads is the source of truth for current work, dependencies, acceptance criteria and completion evidence. This document is the execution protocol, not a second backlog. The dated [migration audit](next-audit.md) records what was verified on 2026-09-12. Historical roadmaps must not override current Beads tasks or AGENTS.md.

Start from the repository root:

```sh
git status --short --branch
bd dolt pull
bd ready
bd show datapressr-9up
bd show <assigned-issue-id>
bd update <assigned-issue-id> --claim
```

Read AGENTS.md and the assigned issue's full description and acceptance criteria, then its named skill and source files. Check prerequisites are closed with evidence. Choose a task, not an umbrella epic. Use a unique worker identity for shared Beads. Claiming coordinates ownership; it does not isolate files.

Planning defaults: oil-prices for story #3; an independent reviewing AI agent signs off the outline; author voice passes remain human. These optional choices do not block execution or require repeated confirmation. This is not approval of an unwritten outline. Update affected Beads if the owner changes either choice.

## Dispatch and order

Select current work from `bd ready` using [NEXT.md](https://github.com/datasets/datapressr/blob/main/NEXT.md); the issue IDs below describe the initial plan, not a fixed current queue. Work sequentially unless parallel execution is requested. Initially independent tasks are datapressr-q96 (oil enrichment), datapressr-cq6 (JSON benchmark), and datapressr-rvi (join benchmark). Assign distinct dataset paths if dispatching benchmark workers in parallel. Additional independent work: datapressr-8rk (Keeling charts) or datapressr-jh6 (Drawdown comparison). v1 has priority over benchmarks.

The v1 chain is datapressr-q96 → datapressr-7mc → datapressr-0cp → datapressr-ogt → datapressr-1li → datapressr-9qc → datapressr-blj. The benchmark chain is datapressr-cq6 + datapressr-rvi → datapressr-rlb, under existing epic datapressr-gy3. Beads has blocking edges; parent-child hierarchy alone does not enforce order.

Give bounded enrichment, chart and prose tasks to execution agents. Assign argument review, skill graduation, benchmark synthesis and release review to a coordinator or stronger reviewer: these require judgment across artifacts. Benchmark source selection is research first; the worker records the chosen source, license and paths before implementation. Pass the full Bead and this protocol, not just its title.

Use separate worktrees/checkouts for simultaneous edits when supported, with the coordinator managing shared Beads and integration. Shared files (AGENTS.md, skills/README.md, site/stories/package*.json, site/README.md, site/datasets.md, site/docs/structure-benchmark.md) have one editor at a time. Chart workers reuse current Plot/jsdom dependencies; graduation owns skill catalogs; synthesis owns the benchmark report. Integrate prerequisites before dispatching dependents. Preserve unrelated work.

## Verification and review

For each task: inspect inputs, implement only its scope, run named checks, inspect the diff, record results. Root regression check is `npm test`; dataset check is `node scripts/validate-datapackage.mjs <dataset-directory>`. Zero-warning metadata validation does not prove CSV values satisfy types or keys. Reproducibility checks use the archived snapshot without new network fetches, compare hashes across two runs, and preserve handwritten sections.

The outline reviewer records APPROVED, identity, reproduced numbers and exact reviewed revision in datapressr-0cp. Corrections return to the outline owner. Prose consumes approved outline and checked charts. Do not treat elapsed time as approval.

Human-only and post-v1 tasks are deferred. Explicitly reopen with `bd update <id> --status open` when the owner/coordinator chooses to schedule them. Do not execute them just because a broad listing shows them.

## Closing and handing off

Append outcome, paths, commit IDs if committed, exact commands/results, source/version/hash evidence, reviewer verdict, assumptions and remaining blockers to the issue with `bd update <id> --append-notes '...'`. Then use `bd close <id> --reason 'Specific verified outcome'`. Leave blocked work unfinished with the exact missing input. Put new work in scoped Beads. Close epics only when every acceptance gate passes.

Run `bd dolt push` and confirm success at handoff. Dolt remote synchronization is the continuity mechanism; JSONL is not the backup. Use the playbook linked in AGENTS.md for bootstrap/sync recovery; never delete or reinitialize Beads as a routine fix. Commit owned repository changes when authorized. External issue messages, publishing, dashboard deletion/recreation and cross-repository renames require their own authorized scope; this plan does not authorize them. Skip DataHub push when credentials are absent.

The former unattended brief, including instructions to maintain a Markdown queue, commit directly to main, and use a Claude-specific trailer, is retired and recoverable in Git history. NEXT.md is now the stable session entry point; task state stays in Beads.
