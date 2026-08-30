# Next

What's actionable right now, for a clean handoff to a fresh session. Kept short on purpose — detail lives in the linked issues and `docs/skills-vision.md`, not duplicated here. Update this file, don't let it grow into a second backlog.

**Start here:** `AGENTS.md` (data conventions, definition of done), `docs/skills-vision.md` (full decision history — why Node/TS not DuckDB, why GitHub issues not BACKLOG.md, what's tested and what isn't), `skills/{capture,archive,structure}/SKILL.md` (the skills themselves).

## AI can do now

- [ ] _(nothing queued — the two standing items were done in the 2026-08-30 autonomous session; see below. Add the next AI-doable item here.)_

## Needs human input first

- [ ] **Decide if Project Drawdown can be published** — the `structure` pass is done and validated on branch `auto/2026-08-30-autonomous-session` (`datasets/climate-and-environment/project-drawdown/`), but drawdown.org's [Terms of Use](https://drawdown.org/terms-of-use) reserve all rights and offer no open licence, so redistribution needs a human call (written permission, or a considered factual-data position). Also: the live source was redesigned in 2025 and no longer publishes the 2020 two-scenario table — the structured data is the 2020 review from the community mirror. [#3](https://github.com/datasets/datapressr/issues/3)
- [ ] **Triage the inbox** — half a dozen small finds with no clear next step yet (some need a primary source, one's missing its own context). [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Check what climate datasets are already published before wrangling more** — the obvious open candidates in `datasets/commons-issues` (CO2 ppm / Mauna Loa, global temperature anomaly) resolve to existing `datasets/co2-ppm` and `datasets/global-temp` repos, i.e. probably already live. NOAA/NASA sources are US-gov public domain and the CSVs are tiny, so a refresh/monitor pass is cheap — but someone should confirm what's stale vs. current first.
- [ ] **Pick a chart approach by writing 1–2 stories by hand** — `enrich`/`story` skills are deliberately not designed yet; Planetary Boundaries ([#4](https://github.com/datasets/datapressr/issues/4)) is the first candidate. This one needs a human to actually look at the result and say what felt right/wrong before it's worth generalizing into a skill.

## Later (blocked on the above, not urgent)

- [ ] `enrich.md` + `story.md` skills — once the charting approach above is settled by real practice
- [ ] `monitor.md` skill — no living/scheduled source needs it yet
- [ ] Real type-level validation (checking data against its declared schema, not just that a schema is declared) — flagged as open in `docs/skills-vision.md`, likely belongs in `structure`'s build script (DuckDB/TS `try_cast`-style) rather than `/validate` itself

## Already done (context, not action items)

**2026-08-30 autonomous session** (branch `auto/2026-08-30-autonomous-session`, not merged):
- Skills made portable — moved `.claude/skills/*` → `skills/*`, converted `init`/`push`/`validate` commands to `SKILL.md`, `.claude/skills/` now symlinks, `npx skills` layout, docs updated. `npm test` green. ([#5](https://github.com/datasets/datapressr/issues/5))
- Project Drawdown structured (`datasets/climate-and-environment/project-drawdown/`) — reproducible `build.ts`, tidy typed CSVs, `/validate` clean — but publication blocked on licensing (see "Needs human input first"). ([#3](https://github.com/datasets/datapressr/issues/3))
- Changelog: `changelog/2026-08-30-portable-skills-and-project-drawdown.md`.

**2026-08-29:** Tested `/validate` (`scripts/validate-datapackage.mjs` + `npm test`), a verified `structure` skill (tested against two real DataHub datasets, cleanup idioms in `scripts/wrangling-idioms.mjs`), `capture`/`archive` skills, `BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` retired for GitHub issues, engine decision reversed to Node/TypeScript after testing against real data. Full story: `docs/skills-vision.md` and `changelog/2026-08-29-tested-structure-skill-and-issues-backlog.md`.
