# Working with datasets using AI assistants

Datapressr is a skills repo — instead of a CLI, it provides AI assistant instructions that work across tools (Claude Code, Codex CLI, Gemini CLI, etc.).

## Quick start

Install the skills into your agent once, then start a session:

```sh
npx skills add datasets/datapressr
mkdir world-gdp && cd world-gdp && claude
```

Then inside the session:

```
/init world-gdp
```

Your AI assistant will scaffold the directory, create `datapackage.json`, and explain next steps.

(Claude Code in this repo also picks the skills up directly via `.claude/skills/`
symlinks — no `npx skills` step needed when working inside `datapressr` itself.)

## AGENTS.md

Every dataset directory should contain `AGENTS.md` — a knowledge file that gives your AI assistant immediate context about dataset structure, conventions, and the publish workflow. The `/init` command copies it automatically.

`AGENTS.md` is the standard cross-tool instruction file:

| Tool | Reads |
|------|-------|
| Claude Code | `AGENTS.md` + `skills/` (via `.claude/skills/` symlinks) |
| Codex CLI | `AGENTS.md` + `skills/` (via `npx skills add`) |
| Gemini CLI | `AGENTS.md` + `skills/` (via `npx skills add`) |

## Skills

The `skills/` directory holds one `SKILL.md` playbook per step, in the flat layout
[`npx skills`](https://github.com/vercel-labs/skills) expects — so they install
into any agent, not just Claude Code. See `skills/README.md`. In Claude Code the
judgement-heavy playbooks (`capture`, `archive`, `structure`) and the mechanical
last-mile steps below are all invocable as `/<name>` slash commands:

### `/init <name>`

Scaffold a new dataset directory.

```
/init world-gdp
```

Creates:

```
world-gdp/
  datapackage.json              # dataset metadata and resource list
  data/                         # data files go here
  .datahubignore                # gitignore-style exclusions for dh push
  AGENTS.md                     # AI assistant context
  scripts/validate-datapackage.mjs   # the deterministic check /validate runs
```

### `/validate`

Check `datapackage.json` for common issues before pushing.

Runs `scripts/validate-datapackage.mjs` (copied into the dataset by `/init`, zero dependencies, plain Node — no `package.json` needed to run it) and reports its output: errors (must fix) and warnings (worth fixing).

- **Errors**: missing file, invalid JSON, unsafe name, empty resources, a resource path that doesn't exist
- **Warnings**: missing title/description/status, unlisted files in `data/`, large files, missing `licenses`/`sources` past `stub`, resources with no typed `schema` or no `primaryKey`

The script itself has a test suite in the `datapressr` repo (`npm test`, using Node's built-in test runner against fixture datapackages in `scripts/fixtures/`) — it's the one piece of this project's tooling that's actually tested, rather than being an LLM re-deriving a checklist from prose each run.

### `/push`

Push the current dataset to DataHub.

Requires env vars:

```sh
export DATAHUB_API_URL=https://datahub.io
export DATAHUB_API_TOKEN=<your-token>
export DATAHUB_PUBLICATION=<your-publication-slug>
```

Runs `dh push .` using the [`dh` CLI](https://github.com/datopian/datahub-next/tree/staging/cli).
