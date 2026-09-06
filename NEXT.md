# Next

A concise pointer to what's actionable now, for a clean handoff to a fresh session. Not a backlog and not a changelog — the roadmap lives in the [v1 epic (#14)](https://github.com/datasets/datapressr/issues/14), history in [`changelog/`](changelog/), working state in Beads (`bd ready`). Keep this file short.

**Start here:** `AGENTS.md` (data conventions, definition of done), [`docs/skills-roadmap.md`](docs/skills-roadmap.md) (current plan), [`docs/skills-vision.md`](docs/skills-vision.md) (decision history), `skills/{capture,archive,structure}/SKILL.md`.

## Next up (AI-doable)

- [ ] **Story #2 — voice pass + review.** Planetary Boundaries draft is complete: [outline](site/stories/planetary-boundaries-outline.md), [charts](site/stories/planetary-boundaries-make-charts.mjs), [prose](site/stories/planetary-boundaries.md) all committed the [#10](https://github.com/datasets/datapressr/issues/10) way. Left: the author's "sounds like me" voice pass (human), and a read-through. Scoreboard normalisation was changed from the outline's `current/boundary` to the framework's own — see the story's friction notes. [#4](https://github.com/datasets/datapressr/issues/4), Beads `datapressr-tzh`.
- [ ] **`structure` benchmark round 2.** Round 1's 8 findings are applied (2026-09-06 — `wrangling-idioms.mjs` + tests, `SKILL.md`, `AGENTS.md`; see `docs/structure-benchmark.md`). Left: re-run the benchmark against a JSON/REST-API source and a genuine multi-file relational join (the DuckDB escape-hatch case). Beads `datapressr-gy3`.
- [ ] **`story` + `enrich` skills — first DRAFTs written** ([`skills/story/SKILL.md`](skills/story/SKILL.md), [`skills/enrich/SKILL.md`](skills/enrich/SKILL.md); 2026-09-06, neither symlinked/activated). `enrich` drafted from one hand rep (co2-ppm — `enrich.ts` + `SUMMARY.md`). Next: exercise each on a second case (a story #3; enrich on oil-prices — tests the "parallel resources" open question), resolve the open questions in each, then consider activating. [#10](https://github.com/datasets/datapressr/issues/10)
- [ ] **Port the story #1 (Keeling) charts to Observable Plot** — [#12](https://github.com/datasets/datapressr/issues/12). Now that Plot is the standard (`docs/charting.md`); `site/stories/make-charts.mjs` is still hand-rolled SVG.
- [ ] **Two `project-drawdown` datasets now exist in the `datasets` org** — our 2020-vintage [repo](https://github.com/datasets/project-drawdown) and a 2024-vintage one in `datasets/climate-and-environment/project-drawdown`. Different scope, licence, vintage. Decide: rename, cross-reference, or merge.

## Needs human input first

- [ ] **Keeling Curve story — a "sounds like me" voice pass.** First-draft feedback was given and acted on; the voice pass is the author's to run. Worth a re-read before story #2's prose.
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step. [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Rename the site** off the `datapressr-2` URL if wanted — needs delete + recreate + re-do the git integration in the Flowershow dashboard.

## Later (not urgent)

- [ ] Real type-level validation (data checked against its declared schema) — likely in `structure`'s build script, not `/validate`.
- [ ] Fold `docs/*.md` and maybe `changelog/` onto the site — [#7](https://github.com/datasets/datapressr/issues/7), [#13](https://github.com/datasets/datapressr/issues/13).
- [ ] `monitor` skill + unattended cloud execution — [#6](https://github.com/datasets/datapressr/issues/6), post-v1 (see epic [#14](https://github.com/datasets/datapressr/issues/14)).

## Review — what to look at

Everything is on `main`. GitHub renders Markdown and shows CSVs as sortable tables.

- **Live site:** <https://datapressr-2-rufuspollock.flowershow.me> — landing -> "what to review now" -> datasets -> the Keeling Curve story.
- **Data story #1:** <https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve> ([outline](https://datapressr-2-rufuspollock.flowershow.me/stories/keeling-curve-outline)).
- **Story #2 outline:** [`site/stories/planetary-boundaries-outline.md`](site/stories/planetary-boundaries-outline.md)
- **`structure` benchmark:** [`docs/structure-benchmark.md`](docs/structure-benchmark.md)
- **Story craft + voice:** [`docs/story-craft.md`](docs/story-craft.md), [`docs/voice-guide.md`](docs/voice-guide.md)
- **Charting decision:** [`docs/charting.md`](docs/charting.md) (Observable Plot, near-term) + the [side-by-side](site/charting-spike.html) behind it ([#11](https://github.com/datasets/datapressr/issues/11))
- **co2-ppm dataset:** [folder](datasets/climate-and-environment/co2-ppm) · [README](datasets/climate-and-environment/co2-ppm/README.md) (diffs vs the community version)
- **oil-prices dataset:** [folder](datasets/energy-and-commodities/oil-prices) — the benchmark's ground-truth rep; content-identical to community `datasets/oil-prices`.
- **Portable skills:** [`skills/`](skills/)
