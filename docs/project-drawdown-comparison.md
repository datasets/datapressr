---
title: Project Drawdown — two packages in the `datasets` org, compared
date: 2026-09-13
---

# Project Drawdown — two packages in the `datasets` org, compared

Evidence gathered 2026-09-13 (dated: GitHub metadata and content change over time — re-verify before acting on this if it's read much later). Read-only checks against both public repos and DataHub; neither external repo was modified. Written for [datapressr-jh6](https://github.com/datasets/datapressr/issues/3), which asked for a comparison and a recommendation, not a decision — the recommendation below is for the owner to accept, adjust, or reject.

## Why this exists

`datapressr-61n` relocated this repo's own 2020-vintage Project Drawdown dataset out to its own repo, `datasets/project-drawdown`, on 2026-09-05. While drafting the Planetary Boundaries story outline shortly after, a second, unrelated Project Drawdown dataset turned up living inside a different repo, `datasets/climate-and-environment`. Both now share the name "Project Drawdown" in the same GitHub org. This document is the first read-only look at both, to inform a naming/publication decision — **it does not repeat or undo the 2026-09-05 relocation.**

## The two packages

| | `datasets/project-drawdown` | `datasets/climate-and-environment/project-drawdown` |
|---|---|---|
| Repo | Standalone (one dataset, one repo) | One dataset inside a multi-dataset catalog repo (7 datasets: bioregions-2023, carbon-pricing, great-acceleration, hyde-history-database-of-the-global-environment, lazard-levelized-cost-of-energy, planetary-boundaries, project-drawdown) |
| Repo created | 2026-09-05 (this session's relocation) | 2026-03-16 |
| Last pushed | 2026-09-05 (same day as creation — one commit) | 2026-03-16 (same day as creation — one commit; unchanged for ~6 months) |
| Data vintage | Project Drawdown's **2020** review ("Table of Solutions") | Project Drawdown's **2024**-labelled data (`datapackage.json` `version: "2024"`), from the current Drawdown Explorer |
| Coverage | 82 solutions × 2 scenarios (164 data rows in `solutions.csv`, plus a `solution_sectors.csv` link table) | 156 solutions per its own README (184 data rows in `solutions.csv`, one row per solution) |
| Schema | `solution`, `scenario` (1 or 2), `co2_eq_reduction_gt_2020_2050` — a narrow, two-scenario emissions-reduction figure | `action`, `solution`, `solution_classification`, `mode`, `sector`, `cluster`, `adoption_unit`, `effectiveness_tco2eq_per_unit`, `adoption_current`, `adoption_achievable_range`, `ghg_impact_gt_co2eq_yr`, `cost_usd_per_t_co2eq`, plus co-benefit columns — much richer, but several numeric-looking fields (e.g. `adoption_current`, `ghg_impact_gt_co2eq_yr`) are typed `string` and carry ranges/units in the cell (`"1.4×10⁷/yr"`, `"0.05 to 0.12"`), not split into typed min/max columns |
| Primary source cited | `drawdown.org/solutions/table-of-solutions`, via a community mirror snapshot (`datasets/commons#329`) — the live 2020-table page no longer exists; Project Drawdown redesigned it in 2025 | `drawdown.org/solutions` ("Explorer CSV export") — no archived snapshot or build script; the repo has no `archive/`, `build.ts`, or `scripts/`, just `data/` + `datapackage.json` + `README.md` |
| Reproducibility | `build.ts` regenerates both CSVs from an archived source snapshot (`archive/commons-329-project-drawdown-snapshot.md`) — DataPressr `structure`-skill conventions: typed schema, primary key, deterministic build | No build step or archived raw source found in the repo. The CSV appears to be a direct, unreproducible drop of an export |
| **License claimed** | **PDDL-1.0** — with an explicit, reasoned justification in `README.md`: Project Drawdown's own [Terms of Use](https://drawdown.org/terms-of-use) are all-rights-reserved with no open licence offered; the dataset's position is that the *values* (facts) aren't copyrightable, so the tidy compilation is released to the public domain, with clear attribution required | **CC-BY-4.0**, stated flatly in `datapackage.json` and `README.md` ("Project Drawdown's research is published under CC BY 4.0") with **no link or citation to where Project Drawdown states this** |
| DataHub publication | **Not published.** `https://datahub.io/project-drawdown` and `https://datahub.io/core/project-drawdown` both return HTTP 404 (checked 2026-09-13); the repo's own README says "Publish to DataHub is pending" | **Published and live** at `https://datahub.io/climate-and-environment/project-drawdown` (HTTP 200, page title "Project Drawdown Climate Solutions", licence badge shown as CC-BY-4.0 — reflecting the repo's own metadata, not an independent check) |

## Verified facts vs. an unresolved licensing claim

Everything in the table above is a directly observed fact (HTTP status, file contents, row counts, dates) except one thing, which is a **claim, not a verified fact**: that "Project Drawdown's research is published under CC BY 4.0."

A direct check of `https://drawdown.org/terms-of-use` (2026-09-13) finds the words "Copyright" and "copyright" but no mention of Creative Commons, CC BY, or any open licence. This doesn't prove the CC-BY-4.0 claim is wrong — Project Drawdown could license specific data exports differently from its general site terms, and that page wasn't exhaustively reviewed — but the claim currently has **no supporting citation** in the dataset itself, and it sits in direct tension with the 2020 dataset's own (better-documented) finding that Drawdown's Terms of Use reserve all rights. **This needs the licence claim traced to an actual Project Drawdown statement before anyone treats CC-BY-4.0 as settled**, especially since it's already live on DataHub carrying that badge. This report does not resolve it and does not assume either dataset's licensing position is correct — that determination, and any relicensing, is explicitly out of scope here (no permission to merge or relicense is inferred).

## Recommendation: keep and cross-link, not merge or rename

**Do not merge.** These are not two wranglings of the same source — they're different Project Drawdown products from different years, with non-overlapping schemas (a two-scenario emissions figure vs. a richer multi-attribute classification) and a live licensing discrepancy. Merging would either lose the 2020 scenario structure, lose the 2024 richer attributes, or silently pick one licence for content that arrived under two different claims. None of those is a compression worth making.

**Do not rename either repo.** `datasets/climate-and-environment/project-drawdown` is already the live, DataHub-published URL other people may be using; renaming it breaks that link for no clear gain. `datasets/project-drawdown` was just created by the 2026-09-05 relocation for the reason recorded in `datapressr-61n`; renaming it again a week later repeats churn the task explicitly says to avoid.

**Do cross-link, with a vintage label on both sides**, so a reader who lands on either doesn't mistake it for the only Project Drawdown dataset in the org:

- In `datasets/project-drawdown/README.md`, add a line under "Source moved on": *"A separate, newer Project Drawdown dataset (2024 data, ~150 solutions, richer per-solution attributes) is published at [`datasets/climate-and-environment/project-drawdown`](https://github.com/datasets/climate-and-environment/tree/main/project-drawdown) / [datahub.io/climate-and-environment/project-drawdown](https://datahub.io/climate-and-environment/project-drawdown). This dataset is the older (2020) two-scenario table, kept because Project Drawdown's own site no longer publishes it in this form."*
- In `datasets/climate-and-environment/project-drawdown/README.md`, add a line: *"A separate dataset holds Project Drawdown's earlier (2020) two-scenario 'Table of Solutions', since retired from Project Drawdown's own site: [`datasets/project-drawdown`](https://github.com/datasets/project-drawdown)."* (Requires whoever maintains that catalog repo — not verified here whether that's the same owner.)
- Both edits are cross-org-repo changes, out of this task's scope ("do not mutate either external repo in this task") and out of `datapressr`'s own scope (neither file lives in this repo) — they're the owner's to make or delegate.

**One more open item for the owner, not a recommendation:** the CC-BY-4.0 claim on the published, DataHub-live 2024 dataset should be traced to an actual Project Drawdown source or corrected/hedged. This report surfaces it; resolving it needs someone with standing to edit that repo (and possibly to ask Project Drawdown directly).

## Not repeated here

The 2026-09-05 relocation (`datapressr-61n`: moving this repo's old `project-drawdown` dataset out to `datasets/project-drawdown`) is done and is not reopened or redone by this comparison.
