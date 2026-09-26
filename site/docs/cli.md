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
  .datahubignore                # gitignore-style exclusions for dh publish
  AGENTS.md                     # AI assistant context
  scripts/validate-datapackage.mjs   # the deterministic check /validate runs
```

### `/validate`

Check `datapackage.json` for common issues before publishing.

Runs `scripts/validate-datapackage.mjs` (copied into the dataset by `/init`, zero dependencies, plain Node — no `package.json` needed to run it) and reports its output: errors (must fix) and warnings (worth fixing).

- **Errors**: missing file, invalid JSON, unsafe name, empty resources, a resource path that doesn't exist
- **Warnings**: missing title/description/status, unlisted files in `data/`, large files, missing `licenses`/`sources` past `stub`, resources with no typed `schema` or no `primaryKey`

The script itself has a test suite in the `datapressr` repo (`npm test`, using Node's built-in test runner against fixture datapackages in `scripts/fixtures/`) — it's the one piece of this project's tooling that's actually tested, rather than being an LLM re-deriving a checklist from prose each run.

### `/push`

Publish the current dataset to DataHub. Publishing is optional: if `dh` isn't installed or you haven't signed in, the skill says so and stops, and your dataset lives on in Git.

The skill keeps the name `push`, but the command it runs is `dh publish` (the DataHub CLI renamed its `push` command to `publish`, and the old name no longer works):

```sh
dh publish . --publication datapressr
```

**Install `dh`.** It is a Go binary released from [datopian/datahub-next](https://github.com/datopian/datahub-next/tree/staging/cli). That repository is private, so you need GitHub access to it. Download the archive for your platform, check it and put `dh` on your `PATH`:

```sh
gh release download v0.1.0 -R datopian/datahub-next -p 'dh_darwin_arm64.tar.gz' -p checksums.txt
shasum -a 256 -c checksums.txt --ignore-missing   # Linux: sha256sum -c --ignore-missing checksums.txt
tar -xzf dh_darwin_arm64.tar.gz && mv dh ~/bin/
```

**Sign in.** Run `dh login` once. It opens a browser, you sign in to datahub.io and authorize the CLI, and it saves a token locally. For CI, copy that token into a `DATAHUB_API_TOKEN` secret and set `DATAHUB_API_URL=https://datahub.io`. Treat the token as highly privileged.

**Before publishing**, the skill checks:

- **A root `README.md`.** DataHub builds the dataset page from it; without one the page is a 404. Don't start it with a `# Title`, because DataHub shows the title already.
- **`/validate` passes.**
- **Views DataHub can draw.** Simple `line` charts take several series. Simple `bar` and `lines-and-points` charts need the x (`group`) field and `series[0]` typed `year`, `yearmonth`, `date` or `number`, not `integer` or `string`, and they plot only `series[0]`. For anything else use a `vega-lite` or `plot` view.
- **`.datahubignore`** excludes `archive/`, scripts, `node_modules/`, `package*.json` and `AGENTS.md`. Every other non-hidden file is uploaded, and every other `.md` file becomes a sub-page.

**Which publication.** The skill always passes `--publication` explicitly: `$DATAHUB_PUBLICATION` if you set it, otherwise `datapressr`. It never publishes to `core` (it refuses if `$DATAHUB_PUBLICATION` is `core`), whose datasets sync from GitHub, so the next sync can overwrite a direct upload.

**After publishing**, open the printed URL (`https://datahub.io/<publication>/<name>`) and check the page; it is processed in the background after the upload. Publishing again adds and overwrites files but never deletes them, so a file you removed locally stays online, and an existing dataset's title and description only change in the DataHub dashboard.
