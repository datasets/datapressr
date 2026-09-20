# DataPressr skills

Opinionated, prescriptive playbooks for turning a raw data find into a clean,
published dataset. Each is a `SKILL.md` file in its own directory — the flat
layout expected by [`npx skills`](https://github.com/vercel-labs/skills), so they
install into any agent, not just Claude Code.

| Skill | Lifecycle stage | What it does |
|-------|-----------------|--------------|
| `capture` | capture | File a URL / idea as a GitHub issue — near-zero friction, no judgement |
| `archive` | → archived | Snapshot the raw source into `archive/` with provenance |
| `structure` | → structured | The core wrangling step: raw → tidy typed CSV(s) + `datapackage.json` |
| `init` | — | Scaffold a new dataset directory |
| `validate` | — | Run the deterministic `datapackage.json` checks before pushing |
| `push` | → published | `dh push` the dataset to DataHub |
| `enrich` | → enriched | Structured dataset → consolidated descriptive stats + first charts + commentary (`enrich.ts` + `SUMMARY.md` + `views`). Bundles a working `enrich.ts` template in `references/`. |
| `story` | → story | One or more finished datasets → a short data story: outline (independently reviewed) → Observable Plot charts → prose. Bundles its craft, voice and charting guides in `references/`. |

`monitor` is planned but not built. `enrich` and `story` were activated after real runs (enrich on co2-ppm and oil-prices; story on three data stories). Each carries what it needs in its own `references/` folder, so an installed copy works without this repo; `site/docs/story-craft.md`, `site/docs/voice-guide.md` and `site/docs/charting.md` hold the background and decision history.

## Install

```sh
npx skills add datasets/datapressr                                   # all skills
npx skills add datasets/datapressr --skill structure -a claude-code -y   # just one
```

`-a` targets a specific agent's skills directory (`claude-code`, `cursor`,
`continue`, …). Without `npx skills`, any agent that reads `SKILL.md` files can
use these directly from `skills/<name>/SKILL.md`.

## Claude Code

`.claude/skills/<name>` symlinks point back here, so Claude Code's own skill
discovery and the `/<name>` slash commands (`/init`, `/validate`, `/push`, …) keep
working with no extra install step. Edit the skill in `skills/<name>/SKILL.md` —
the symlink means there's only one copy.

## Start here

`AGENTS.md` at the repo root is the contract (data conventions, definition of
done). These skills are the *how*; `AGENTS.md` is the *what*.
