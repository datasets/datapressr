# Next

What's actionable right now, for a clean handoff to a fresh session. Kept short on purpose — detail lives in the linked issues and `docs/skills-vision.md`, not duplicated here. Update this file, don't let it grow into a second backlog.

**Start here:** `AGENTS.md` (data conventions, definition of done), `docs/skills-roadmap.md` (current plan), `docs/skills-vision.md` (full decision history), `skills/{capture,archive,structure}/SKILL.md` (the skills themselves).

## Roadmap to v1

1. ~~Prove `structure` in anger~~ — done ([#8](https://github.com/datasets/datapressr/issues/8), co2-ppm).
2. **Write 1–2 data stories by hand** — one done (Keeling Curve, [#9](https://github.com/datasets/datapressr/issues/9)); story #2 (Planetary Boundaries) in progress — outline committed, prose + charts left ([#10](https://github.com/datasets/datapressr/issues/10)).
3. **Charting** — near-term: just make good charts, any pragmatic way ([#11](https://github.com/datasets/datapressr/issues/11)). Picking a standard DataHub/Flowershow support natively is a deferred, longer investigation (also [#11](https://github.com/datasets/datapressr/issues/11)).
4. **Write `enrich` + `story` skills** — from what steps 2–3 taught ([#10](https://github.com/datasets/datapressr/issues/10) has the intended shape).
5. ~~Ship the site~~ — done ([#7](https://github.com/datasets/datapressr/issues/7); one follow-up open: fold `docs/` in).

**v1 = steps 2–4 done.** Post-v1: `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)); skill evals for the prompt-only skills.

## Next up (AI-doable)

- [ ] **Story #2 — finish the prose + charts.** Planetary Boundaries: source archived, [outline + chart plan](site/stories/planetary-boundaries-outline.md) committed 2026-09-05 the [#10](https://github.com/datasets/datapressr/issues/10) way. Left to do: `make-charts.mjs` for the two charts, then prose (each its own commit). [#4](https://github.com/datasets/datapressr/issues/4)
- [ ] **Apply the `structure` benchmark findings.** `docs/structure-benchmark.md` + 5 beads issues (label `skill-structure`). Top two (P1): the Excel-serial-date timezone bug, and `exceljs` can't read legacy `.xls` (name SheetJS). Then re-run the benchmark with a JSON/API source + a multi-file join.
- [ ] **Polish the story charts** — [#12](https://github.com/datasets/datapressr/issues/12). Now also the first candidate to try Observable Plot (per `docs/story-craft.md` + the `line-charts` bake-off) rather than more hand-rolled SVG.
- [ ] **Draft `story` + `enrich` skills** from stories #1 + #2 + `docs/story-craft.md` + `docs/voice-guide.md`, following outline → viz plan → prose. Mark DRAFT.
- [ ] **Two `project-drawdown` datasets now exist in the `datasets` org** — our 2020-vintage repo <https://github.com/datasets/project-drawdown> and a 2024-vintage one inside `datasets/climate-and-environment/project-drawdown`. Different scope, licence and vintage. Decide: rename one, cross-reference, or merge.
- [x] **co2-ppm follow-ups** — global annual mean + NOAA growth rates (MLO & global) + derived decadal means added 2026-09-05. Still open: global *monthly* series; scheduling waits on `monitor` ([#6](https://github.com/datasets/datapressr/issues/6)).

## Needs human input first

- [ ] **Another look at the Keeling Curve story** — first-draft feedback was given and acted on (data-first not wrangling-first; built from an outline). A "sounds like me" voice pass is yours to run; worth a re-read before story #2.
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step. [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Rename the official site** off the `datapressr-2` URL if wanted — needs delete + recreate + re-do the git integration in the Flowershow dashboard.

## Later (not urgent)

- [ ] `enrich` + `story` skills — after the charting approach is settled by real practice ([#10](https://github.com/datasets/datapressr/issues/10))
- [ ] `monitor` skill + unattended cloud execution — [#6](https://github.com/datasets/datapressr/issues/6)
- [ ] Real type-level validation (data checked against its declared schema) — likely in `structure`'s build script, not `/validate`
- [ ] Fold `docs/*.md` and possibly `changelog/` onto the site — [#7](https://github.com/datasets/datapressr/issues/7) (docs), [#13](https://github.com/datasets/datapressr/issues/13) (changelog); decide together

## Review — what to look at

Everything is on `main`. GitHub renders Markdown and shows CSVs as sortable tables.

- **Live site:** <https://datapressr-2-rufuspollock.flowershow.me> — landing → "what to review now" → datasets → the Keeling Curve story.
- **Data story #1:** <https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve> (and its [outline](https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve-outline)).
- **Everything since the session started, one diff:** <https://github.com/datasets/datapressr/compare/7eca8eb...main>
- **co2-ppm dataset:** [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/co2-ppm) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/README.md) (comparison vs the community version)
- **Project Drawdown dataset:** moved to its own repo → <https://github.com/datasets/project-drawdown> (DataHub publish still pending — no `dh` CLI here)
- **oil-prices dataset:** [folder](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices) — the `structure` benchmark's ground-truth rep; content-identical to community `datasets/oil-prices`.
- **`structure` benchmark:** [`docs/structure-benchmark.md`](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md)
- **Story craft + voice:** [`docs/story-craft.md`](https://github.com/datasets/datapressr/blob/main/docs/story-craft.md), [`docs/voice-guide.md`](https://github.com/datasets/datapressr/blob/main/docs/voice-guide.md)
- **Story #2 outline:** [`site/stories/planetary-boundaries-outline.md`](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries-outline.md)
- **Portable skills:** [`skills/`](https://github.com/datasets/datapressr/tree/main/skills)

## Already done (context, not action items)

**2026-09-05:**
- `structure` benchmark v1 — 3 reps (co2-ppm text, project-drawdown table, oil-prices `.xls` ground-truth diff — content-identical to published). `docs/structure-benchmark.md`; 5 skill-edit findings in beads.
- New datasets: `oil-prices` (EIA, 8 `.xls` → tidy); co2-ppm gained global series + growth rates.
- Project Drawdown → own repo <https://github.com/datasets/project-drawdown>.
- `docs/story-craft.md` + `docs/voice-guide.md` (B1); `docs/skills-roadmap.md` (the plan this session ran).
- Story #2 (Planetary Boundaries): source archived, outline + chart plan committed.
- Local task tracking now via Beads (`bd`); `.beads/` in the repo.

**2026-08-30:**
- Skills made portable — `.claude/skills/*` → `skills/*`, commands converted to `SKILL.md`, symlinks kept, `npx skills` layout, `npm test` green. ([#5](https://github.com/datasets/datapressr/issues/5))
- Project Drawdown structured — reproducible `build.ts`, tidy typed CSVs, `/validate` clean, licensing settled. **Moved to its own repo <https://github.com/datasets/project-drawdown> (2026-09-05).** ([#3](https://github.com/datasets/datapressr/issues/3))
- **Site shipped** — official <https://datapressr-2-rufuspollock.flowershow.me> (git-autosync from `site/`), preview <https://datapressr-preview-rufuspollock.flowershow.me> (`fl site --name datapressr-preview --yes`). (`site/.flowershow` was being committed — removed + gitignored.)
- **co2-ppm wrangled from NOAA source** — first real end-to-end `structure` run on a messy primary source; README diffs it against the community `datasets/co2-ppm`. ([#8](https://github.com/datasets/datapressr/issues/8))
- **Data story #1: The Keeling Curve** — first hand-written story; restructured after feedback to lead with the data; built from a committed outline. ([#9](https://github.com/datasets/datapressr/issues/9))
- Charting split into near-term (make good charts pragmatically) vs deferred standard. ([#11](https://github.com/datasets/datapressr/issues/11))
- `structure` skill gained a "government/scientific text data" idioms note (comment lines, negative sentinels, assert-the-header).
- Issues [#6](https://github.com/datasets/datapressr/issues/6)–[#13](https://github.com/datasets/datapressr/issues/13) opened; `NEXT.md` moved to repo root; changelog: `changelog/2026-08-30-*.md` (3 entries).

**2026-08-29:** `/validate` built as a tested script (`scripts/validate-datapackage.mjs` + `npm test`, 24 assertions — the one genuinely tested piece). `structure` skill *written* and its cleanup-idiom module unit-tested — but no real end-to-end trial until 2026-08-30. `capture`/`archive` written, not yet exercised. `BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` retired for GitHub issues. Engine decision reversed to Node/TypeScript. Full story: `docs/skills-vision.md`, `changelog/2026-08-29-tested-structure-skill-and-issues-backlog.md`.
