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

- [ ] **Ship the site** — finish `site/` (`review.md`, `datasets.md` done; landing done), publish with `flowershow publish ./site --name datapressr` after a human runs `flowershow auth login`. Record the URL here. [#7](https://github.com/datasets/datapressr/issues/7)
- [ ] **Wrangle co2-ppm from source** — NOAA Mauna Loa, messy real CSV, tiny, public domain, has a human-made `github.com/datasets/co2-ppm` to compare against. [#8](https://github.com/datasets/datapressr/issues/8)
- [ ] **Data story #1** — the Keeling Curve, before/after, in `site/`. Only after #8 is pushed. [#9](https://github.com/datasets/datapressr/issues/9)

## Needs human input first

- [ ] **`flowershow auth login`** — one interactive OAuth step so the site can be published (then the token persists and updates are automatic). [#7](https://github.com/datasets/datapressr/issues/7)
- [ ] **Relocate Project Drawdown to its catalog repo and push** — structured and validated, now on `main` at `datasets/climate-and-environment/project-drawdown/`. Licensing decided: facts, not per se copyrightable → PDDL-1.0 with attribution to Project Drawdown (see the dataset's README → Licensing). Move it into the real `datasets/climate-and-environment` repo and `dh push` when ready. [#3](https://github.com/datasets/datapressr/issues/3)
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step yet. [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Pick a chart approach by writing 1–2 stories by hand** — same as roadmap step 2/3; Planetary Boundaries ([#4](https://github.com/datasets/datapressr/issues/4)) is a second candidate after the Keeling Curve.

## Later (blocked on the above, not urgent)

- [ ] `enrich.md` + `story.md` skills — after the charting approach is settled by real practice
- [ ] `monitor.md` skill + unattended cloud execution — [#6](https://github.com/datasets/datapressr/issues/6)
- [ ] Real type-level validation (checking data against its declared schema, not just that a schema is declared) — likely belongs in `structure`'s build script rather than `/validate` itself
- [ ] Fold `docs/*.md` into `site/docs/` so the decision history publishes on the site — deferred from [#7](https://github.com/datasets/datapressr/issues/7), ~16 internal refs to fix

## Review — what to look at

Everything is on `main`. GitHub renders Markdown and shows CSVs as sortable tables — no local checkout or DataHub needed.

- **Everything since the session started, one diff:** <https://github.com/datasets/datapressr/compare/7eca8eb...main>
- **Project Drawdown dataset:** [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/project-drawdown) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/README.md) · [solutions.csv](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/data/solutions.csv)
- **Portable skills:** [`skills/`](https://github.com/datasets/datapressr/tree/main/skills)
- **Site (source, until published):** [`site/`](https://github.com/datasets/datapressr/tree/main/site)

## Already done (context, not action items)

**2026-08-30:**
- Skills made portable — `.claude/skills/*` → `skills/*`, `init`/`push`/`validate` converted to `SKILL.md`, `.claude/skills/` now symlinks, `npx skills` layout, docs updated, `npm test` green. ([#5](https://github.com/datasets/datapressr/issues/5), merged to `main`)
- Project Drawdown structured — reproducible `build.ts`, tidy typed CSVs, `/validate` clean, licensing settled (PDDL-1.0 + attribution). Needs relocating to its catalog repo. ([#3](https://github.com/datasets/datapressr/issues/3))
- `site/` scaffolded; issues [#6](https://github.com/datasets/datapressr/issues/6)–[#9](https://github.com/datasets/datapressr/issues/9) opened to track the road to v1.
- Changelog: `changelog/2026-08-30-portable-skills-and-project-drawdown.md`.

**2026-08-29:** `/validate` built as a tested script (`scripts/validate-datapackage.mjs` + `npm test`, 24 assertions — the one genuinely tested piece). `structure` skill *written* and its cleanup-idiom module unit-tested — but the playbook itself had no real end-to-end trial until Project Drawdown (2026-08-30), and that was an easy case. `capture`/`archive` written, not yet exercised. `BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` retired for GitHub issues. Engine decision reversed to Node/TypeScript. Full story: `docs/skills-vision.md`, `changelog/2026-08-29-tested-structure-skill-and-issues-backlog.md`.
