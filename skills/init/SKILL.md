---
name: init
description: Use this skill to scaffold a new dataset directory — the starting point for any new DataPressr dataset, before archive/structure. Creates datapackage.json (status stub), data/, .datahubignore, and copies in AGENTS.md and the validator script. Invoked as `/init <name>` in Claude Code, or by name with the dataset name as the argument.
---

# Init: scaffold a new dataset directory

You are given a dataset name (e.g. `world-gdp`). It must be URL-safe: lowercase
letters, digits, and hyphens only. If what you were given has spaces, dots, or
uppercase, slugify it and say what you used.

1. Create the directory structure:
   - `<name>/data/`
   - `<name>/.datahubignore` (empty)

2. Create `<name>/datapackage.json`:
   ```json
   {
     "name": "<name>",
     "title": "",
     "description": "",
     "status": "stub",
     "licenses": [],
     "sources": [],
     "resources": []
   }
   ```

3. Copy the repo's `AGENTS.md` into `<name>/AGENTS.md` so future AI sessions have context.

4. Copy the repo's `scripts/validate-datapackage.mjs` into
   `<name>/scripts/validate-datapackage.mjs` — it's what the `validate` skill runs.
   It's a single dependency-free file (plain Node, no `package.json` needed to run
   it), so it travels with the dataset directory even when that directory becomes
   its own repo, unrelated to wherever `datapressr` itself is checked out.

5. Tell the user:
   - What was created
   - To add data files to `<name>/data/`
   - To fill in `title`, `description`, `licenses`, `sources`, and `resources`
     (with a typed `schema` per resource) in `datapackage.json` — see `AGENTS.md`
     → "Data conventions" for the bar a dataset needs to clear before
     `status: structured`
   - To run the `push` skill (`/push`) when ready
