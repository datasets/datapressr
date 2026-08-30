# Next

What's actionable right now, for a clean handoff to a fresh session. Kept short on purpose — detail lives in the linked issues and `docs/skills-vision.md`, not duplicated here. Update this file, don't let it grow into a second backlog.

**Start here:** `AGENTS.md` (data conventions, definition of done), `docs/skills-vision.md` (full decision history), `skills/{capture,archive,structure}/SKILL.md` (the skills themselves).

## Roadmap to v1

1. **Prove `structure` in anger** — one genuinely messy source, raw → typed dataset, committed `build.ts` + `archive/`, diffed against a human-made version. [#8](https://github.com/datasets/datapressr/issues/8) (co2-ppm / Keeling Curve)
2. **Write 1–2 data stories by hand** — plain Markdown + whatever charts are fastest. [#9](https://github.com/datasets/datapressr/issues/9)
3. **Decide a charting standard** — from the friction of step 2, not before.
4. **Write `enrich` + `story` skills** — from what steps 2–3 taught.
5. **Ship the site** — landing → datasets → stories → docs. [#7](https://github.com/datasets/datapressr/issues/7)

**v1 = steps 1–5 done.** Post-v1: `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)); skill evals for the prompt-only skills.

## AI can do now (in this order — one piece, committed + pushed, before the next)

- [x] **Ship the site** — live at <https://datapressr-rufuspollock.flowershow.me>. Update with `fl site --name datapressr --yes`. (Still open in [#7](https://github.com/datasets/datapressr/issues/7): fold `docs/` in.)
- [x] **Wrangle co2-ppm from source** — done, `datasets/climate-and-environment/co2-ppm/`. `/validate` clean, deterministic. README compares against the community `datasets/co2-ppm` (whose monthly file is currently mislabelled after an unfollowed NOAA column change). [#8](https://github.com/datasets/datapressr/issues/8)
- [x] **Data story #1** — [The Keeling Curve](https://datapressr-rufuspollock.flowershow.me/stories/keeling-curve), `site/stories/`. Friction note: charting was hand-rolled SVG — **next: pick a declarative chart block (Vega-Lite / Observable Plot) and confirm the site renders it** (roadmap step 3). [#9](https://github.com/datasets/datapressr/issues/9)

### Next AI-doable

- [ ] **Charting spike** — decide the chart syntax for stories, from the Keeling-curve friction. Then it unblocks `enrich` / `story` skills.
- [ ] **co2-ppm follow-ups** — add the global series + growth rates (easy), and/or wire it to a schedule once `monitor` exists ([#6](https://github.com/datasets/datapressr/issues/6)).

## Needs human input first

- [ ] **Relocate Project Drawdown to its catalog repo and push** — structured and validated, now on `main` at `datasets/climate-and-environment/project-drawdown/`. Licensing decided: facts, not per se copyrightable → PDDL-1.0 with attribution to Project Drawdown (see the dataset's README → Licensing). Move it into the real `datasets/climate-and-environment` repo and `dh push` when ready. [#3](https://github.com/datasets/datapressr/issues/3)
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step yet. [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Look at the Keeling Curve story and say what felt right/wrong** — the human read that skills-vision.md says is needed before generalising `enrich`/`story`. A second story (Planetary Boundaries, [#4](https://github.com/datasets/datapressr/issues/4)) is the other candidate.

## Later (blocked on the above, not urgent)

- [ ] `enrich.md` + `story.md` skills — after the charting approach is settled by real practice
- [ ] `monitor.md` skill + unattended cloud execution — [#6](https://github.com/datasets/datapressr/issues/6)
- [ ] Real type-level validation (checking data against its declared schema, not just that a schema is declared) — likely belongs in `structure`'s build script rather than `/validate` itself
- [ ] Fold `docs/*.md` into `site/docs/` so the decision history publishes on the site — deferred from [#7](https://github.com/datasets/datapressr/issues/7), ~16 internal refs to fix

## Review — what to look at

Everything is on `main`. GitHub renders Markdown and shows CSVs as sortable tables — no local checkout or DataHub needed.

- **Live site:** <https://datapressr-rufuspollock.flowershow.me> — start here; landing → "what to review now" → datasets → the Keeling Curve story.
- **Data story #1:** <https://datapressr-rufuspollock.flowershow.me/stories/keeling-curve> — read this and say what felt right/wrong.
- **Everything since the session started, one diff:** <https://github.com/datasets/datapressr/compare/7eca8eb...main>
- **co2-ppm dataset:** [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/co2-ppm) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/README.md) (has the comparison vs the community version)
- **Project Drawdown dataset:** [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/project-drawdown) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/README.md)
- **Portable skills:** [`skills/`](https://github.com/datasets/datapressr/tree/main/skills)

## Already done (context, not action items)

**2026-08-30:**
- Skills made portable — `.claude/skills/*` → `skills/*`, `init`/`push`/`validate` converted to `SKILL.md`, `.claude/skills/` now symlinks, `npx skills` layout, docs updated, `npm test` green. ([#5](https://github.com/datasets/datapressr/issues/5), merged to `main`)
- Project Drawdown structured — reproducible `build.ts`, tidy typed CSVs, `/validate` clean, licensing settled (PDDL-1.0 + attribution). Needs relocating to its catalog repo. ([#3](https://github.com/datasets/datapressr/issues/3))
- Site live at <https://datapressr-rufuspollock.flowershow.me> (Flowershow, `fl site`); issues [#6](https://github.com/datasets/datapressr/issues/6)–[#9](https://github.com/datasets/datapressr/issues/9) opened to track the road to v1.
- **co2-ppm wrangled from NOAA source** — first real end-to-end `structure` run on a messy primary source; README diffs it against the community `datasets/co2-ppm`. ([#8](https://github.com/datasets/datapressr/issues/8))
- **Data story #1: The Keeling Curve** — first hand-written story, on the site; charting was hand-rolled SVG → charting-syntax decision is now the top open item. ([#9](https://github.com/datasets/datapressr/issues/9))
- `structure` skill gained a "government/scientific text data" idioms note (comment lines, negative sentinels, assert-the-header) from the co2-ppm run.
- Changelog: `changelog/2026-08-30-*.md` (3 entries).

**2026-08-29:** `/validate` built as a tested script (`scripts/validate-datapackage.mjs` + `npm test`, 24 assertions — the one genuinely tested piece). `structure` skill *written* and its cleanup-idiom module unit-tested — but the playbook itself had no real end-to-end trial until Project Drawdown (2026-08-30), and that was an easy case. `capture`/`archive` written, not yet exercised. `BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` retired for GitHub issues. Engine decision reversed to Node/TypeScript. Full story: `docs/skills-vision.md`, `changelog/2026-08-29-tested-structure-skill-and-issues-backlog.md`.
