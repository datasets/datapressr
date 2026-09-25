# Project notes and planning

This directory holds maintainer and agent material outside the published `site/` folder. It is still public in the GitHub repository. For user documentation, see [the docs index](../site/docs/README.md). For actionable work, use Beads and [NEXT.md](../NEXT.md); these documents are context and evidence, not a second queue.

## Where things belong

| Material | Location | Purpose |
|---|---|---|
| Setup, dataset conventions, how-to guides, worked examples | `site/docs/` | Published user documentation, linked from its curated index |
| Design documents, implementation plans, Superpowers plans and historical roadmaps | `docs/plans/` | Project planning and decision context |
| Benchmark reports | `docs/benchmarks/`, `docs/structure-benchmark.md` | Evidence for improving the skills |
| Agent handoff logs | `docs/handoffs/` | Execution evidence and continuity |
| Session protocol, audits and owner decision material | `docs/` | Maintainer reference |

## Planning and evidence

- [Next phase plan, 2026-09-25](plans/2026-09-25-next-phase.md): current direction, epics, order and delegated decisions, with its [research reports](plans/2026-09-25-research/).
- [Skills roadmap](plans/skills-roadmap.md) and [skills vision](plans/skills-vision.md): historical planning; current assignments live in Beads.
- [Structure benchmark](structure-benchmark.md): overall findings, with [JSON/API](benchmarks/round-2-json.md) and [relational join](benchmarks/round-2-join.md) reports.
- [Session protocol](next-session-brief.md), [migration audit](next-audit.md) and [cloud handoff log](handoffs/cloud-queue.md): agent coordination and dated execution evidence.
- [Inbox triage](inbox-triage.md), [GitHub issue reconciliation](github-issue-reconciliation.md) and [Project Drawdown comparison](project-drawdown-comparison.md): decision context; check the corresponding Beads for current outcomes.

## Documentation split — 2026-09-20

Kept on the site: assistant setup, data hierarchy, dataset lifecycle, catalog-as-repository guidance, source discovery and its two worked examples, story craft, charting and voice guidance. These help users do the work; outdated planning language in the lifecycle and story guides was removed or updated.

Moved here: both skills planning documents, all three benchmark reports, the session protocol, migration audit, cloud handoff log, inbox triage, GitHub reconciliation and Drawdown comparison. No documents were deleted. Links from published pages to moved evidence now point to GitHub. The existing `lifecyle.md` URL is retained to avoid breaking incoming links.

The owner requested moving planning material out of the site, so this split uses the publication folder boundary rather than a Flowershow exclusion setting. Keep future plans here even if they would be safe to publish; the distinction is reader purpose, not confidentiality. Retirement of obsolete decision records remains tracked separately in `datapressr-vkk`.
