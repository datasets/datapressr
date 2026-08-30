# Next

What's actionable right now, for a clean handoff to a fresh session. Kept short on purpose — detail lives in the linked issues and `docs/skills-vision.md`, not duplicated here. Update this file, don't let it grow into a second backlog.

**Start here:** `AGENTS.md` (data conventions, definition of done), `docs/skills-vision.md` (full decision history — why Node/TS not DuckDB, why GitHub issues not BACKLOG.md, what's tested and what isn't), `skills/{capture,archive,structure}/SKILL.md` (the skills themselves).

## AI can do now

- [ ] **Wrangle Project Drawdown** — data's ready (scraper precedent exists), just needs a `structure` pass. [#3](https://github.com/datasets/datapressr/issues/3)
- [ ] **Make skills portable** — move `skills/` out of `.claude/` so they're installable via `npx skills` by non-Claude agents too. Fully scoped already, just not executed — see [#5](https://github.com/datasets/datapressr/issues/5) for the researched plan (target layout, symlink approach, doc updates needed).

## Needs human input first

- [ ] **Triage the inbox** — half a dozen small finds with no clear next step yet (some need a primary source, one's missing its own context). [#2](https://github.com/datasets/datapressr/issues/2)
- [ ] **Pick a chart approach by writing 1–2 stories by hand** — `enrich`/`story` skills are deliberately not designed yet; Planetary Boundaries ([#4](https://github.com/datasets/datapressr/issues/4)) is the first candidate. This one needs a human to actually look at the result and say what felt right/wrong before it's worth generalizing into a skill.

## Later (blocked on the above, not urgent)

- [ ] `enrich.md` + `story.md` skills — once the charting approach above is settled by real practice
- [ ] `monitor.md` skill — no living/scheduled source needs it yet
- [ ] Real type-level validation (checking data against its declared schema, not just that a schema is declared) — flagged as open in `docs/skills-vision.md`, likely belongs in `structure`'s build script (DuckDB/TS `try_cast`-style) rather than `/validate` itself

## Already done this session (context, not action items)

Tested `/validate` (`scripts/validate-datapackage.mjs` + `npm test`), a verified `structure` skill (tested against two real DataHub datasets, cleanup idioms in `scripts/wrangling-idioms.mjs`), `capture`/`archive` skills, `BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` retired for GitHub issues, engine decision reversed to Node/TypeScript after testing against real data. Full story: `docs/skills-vision.md` and `changelog/2026-08-29-tested-structure-skill-and-issues-backlog.md`.
