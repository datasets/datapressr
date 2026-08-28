# Working with datasets using AI assistants

Datapressr is a skills repo — instead of a CLI, it provides AI assistant instructions that work across tools (Claude Code, Codex CLI, Gemini CLI, etc.).

## Quick start

```sh
mkdir world-gdp && cd world-gdp && claude
```

Then inside the session:

```
/init world-gdp
```

Your AI assistant will scaffold the directory, create `datapackage.json`, and explain next steps.

## AGENTS.md

Every dataset directory should contain `AGENTS.md` — a knowledge file that gives your AI assistant immediate context about dataset structure, conventions, and the publish workflow. The `/init` command copies it automatically.

`AGENTS.md` is the standard cross-tool instruction file:

| Tool | Reads |
|------|-------|
| Claude Code | `AGENTS.md` + `.claude/commands/` |
| Codex CLI | `AGENTS.md` |
| Gemini CLI | `AGENTS.md` |

## Claude Code slash commands

When using Claude Code in this repo, the following slash commands are available:

### `/init <name>`

Scaffold a new dataset directory.

```
/init world-gdp
```

Creates:

```
world-gdp/
  datapackage.json   # dataset metadata and resource list
  data/              # data files go here
  .datahubignore     # gitignore-style exclusions for dh push
  AGENTS.md          # AI assistant context
```

### `/validate`

Check `datapackage.json` for common issues before pushing.

Reports errors (must fix) and warnings (worth fixing):

- **Errors**: missing file, invalid JSON, unsafe name, empty resources
- **Warnings**: missing title/description/status, unlisted files in `data/`, large files, missing `licenses`/`sources`, resources with no typed `schema` or no `primaryKey`

### `/push`

Push the current dataset to DataHub.

Requires env vars:

```sh
export DATAHUB_API_URL=https://datahub.io
export DATAHUB_API_TOKEN=<your-token>
export DATAHUB_PUBLICATION=<your-publication-slug>
```

Runs `dh push .` using the [`dh` CLI](https://github.com/datopian/datahub-next/tree/staging/cli).
