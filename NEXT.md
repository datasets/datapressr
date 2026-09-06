# Next

A concise pointer to what's actionable now, for a clean handoff to a fresh session. Not a backlog and not a changelog — the roadmap lives in the [v1 epic (#14)](https://github.com/datasets/datapressr/issues/14), history in [`changelog/`](changelog/), working state in Beads (`bd ready`). Keep this file short.

**Start here:** `AGENTS.md` (data conventions, definition of done), [`docs/skills-roadmap.md`](docs/skills-roadmap.md) (plan), [`docs/skills-vision.md`](docs/skills-vision.md) (decision history), `docs/charting.md` (charts). Skills: `skills/{capture,archive,structure}/SKILL.md` are live; `skills/{story,enrich}/SKILL.md` are first drafts, not yet activated.

## Where v1 stands

Epic [#14](https://github.com/datasets/datapressr/issues/14): **v1 = `story` + `enrich` skills + a settled near-term charting approach.** As of 2026-09-06 all three have a first deliverable — charting decided (`docs/charting.md`, Observable Plot), both skills drafted. What's left to call v1 *done*: exercise each skill on a second real case, resolve its open questions, and activate it (add the `.claude/skills/` symlink).

## Next up (AI-doable)

- [ ] **Exercise the `story` skill — write story #3.** Follow [`skills/story/SKILL.md`](skills/story/SKILL.md) end to end on a new dataset (outline + chart plan → charts → prose, each its own commit). Then resolve the skill's open questions (viz-plan as its own file?, craft-doc bundling, portability) and, if it held, activate it (symlink into `.claude/skills/`). [#10](https://github.com/datasets/datapressr/issues/10)
- [ ] **Exercise the `enrich` skill — run it on oil-prices.** Follow [`skills/enrich/SKILL.md`](skills/enrich/SKILL.md): `enrich.ts` + fenced `SUMMARY.md` + `views` + status bump. This is the case that settles the "parallel same-schema resources" open question (8 CSVs, one schema). Then resolve the rest and activate.
- [ ] **`structure` benchmark round 2.** Round 1's 8 findings are applied (`docs/structure-benchmark.md`). Left: re-run against a JSON/REST-API source and a genuine multi-file relational join (the DuckDB escape-hatch case). Beads `datapressr-gy3`. Not blocking v1.
- [ ] **Port the story #1 (Keeling) charts to Observable Plot** — [#12](https://github.com/datasets/datapressr/issues/12). `site/stories/make-charts.mjs` is still hand-rolled SVG; `docs/charting.md` is now the standard.
- [ ] **Two `project-drawdown` datasets exist in the `datasets` org** — our 2020-vintage [repo](https://github.com/datasets/project-drawdown) and a 2024-vintage one in `datasets/climate-and-environment/project-drawdown`. Different scope, licence, vintage. Decide: rename, cross-reference, or merge.

## Needs human input first

- [ ] **Voice pass on stories #1 and #2.** Both drafts are built from committed outlines; the "sounds like me" rewrite is the author's to run and only touches wording. Worth a read-through of each.
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step. [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Rename the site** off the `datapressr-2` URL if wanted — needs delete + recreate + re-do the git integration in the Flowershow dashboard.

## Later (not urgent)

- [ ] Real type-level validation (data checked against its declared schema) — likely in `structure`'s build script, not `/validate`.
- [ ] Fold `docs/*.md` and maybe `changelog/` onto the site — [#7](https://github.com/datasets/datapressr/issues/7), [#13](https://github.com/datasets/datapressr/issues/13).
- [ ] `monitor` skill + unattended cloud execution — [#6](https://github.com/datasets/datapressr/issues/6), post-v1.

## Review — what to look at

Everything is on `main`. GitHub renders Markdown and shows CSVs as sortable tables.

- **Live site:** <https://datapressr-2-rufuspollock.flowershow.me> — landing → "what to review now" → datasets → the Keeling Curve story.
- **Data story #1 (Keeling Curve):** on the [live site](https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve).
- **Data story #2 (Planetary Boundaries):** [prose](site/stories/planetary-boundaries.md), [outline + chart plan](site/stories/planetary-boundaries-outline.md), [charts](site/stories/planetary-boundaries-make-charts.mjs). Draft complete; voice pass pending.
- **Skill drafts:** [`skills/story/SKILL.md`](skills/story/SKILL.md), [`skills/enrich/SKILL.md`](skills/enrich/SKILL.md) — each has an "Open questions" section.
- **Charting decision:** [`docs/charting.md`](docs/charting.md) + the [side-by-side](site/charting-spike.html) ([#11](https://github.com/datasets/datapressr/issues/11)).
- **`structure` benchmark + applied findings:** [`docs/structure-benchmark.md`](docs/structure-benchmark.md); `scripts/wrangling-idioms.mjs` gained `excelSerialToIsoDate`, `num`, RFC-4180 `toCsv` (tests 24 → 28).
- **`enrich` rep:** [`co2-ppm/SUMMARY.md`](datasets/climate-and-environment/co2-ppm/SUMMARY.md) + [`enrich.ts`](datasets/climate-and-environment/co2-ppm/enrich.ts).
- **Story craft + voice:** [`docs/story-craft.md`](docs/story-craft.md), [`docs/voice-guide.md`](docs/voice-guide.md).
