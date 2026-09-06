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
| `enrich` | → enriched | **DRAFT** — structured dataset → descriptive stats + first charts + commentary (`enrich.ts` + `SUMMARY.md` + `views`). Review only, not symlinked. |
| `story` | → story | **DRAFT** — one or more published datasets → a short data story (outline → charts → prose). Review only, not symlinked. |

`monitor` is planned but not built. `enrich` (`skills/enrich/SKILL.md`) and
`story` (`skills/story/SKILL.md`) are first drafts awaiting a real run — see
`docs/skills-vision.md` and the craft docs (`docs/story-craft.md`,
`docs/voice-guide.md`, `docs/charting.md`).

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
