---
description: Scaffold a new dataset directory
argument-hint: <name>
---

Scaffold a new dataset directory called $ARGUMENTS.

1. Create the directory structure:
   - `$ARGUMENTS/data/`
   - `$ARGUMENTS/.datahubignore` (empty)

2. Create `$ARGUMENTS/datapackage.json`:
```json
{
  "name": "$ARGUMENTS",
  "title": "",
  "description": "",
  "status": "stub",
  "licenses": [],
  "sources": [],
  "resources": []
}
```

3. Copy the repo's `AGENTS.md` into `$ARGUMENTS/AGENTS.md` so future AI sessions have context.

4. Copy the repo's `scripts/validate-datapackage.mjs` into `$ARGUMENTS/scripts/validate-datapackage.mjs` — it's what `/validate` runs. It's a single dependency-free file (plain Node, no `package.json` needed to run it), so it travels with the dataset directory even when that directory becomes its own repo, unrelated to wherever `datapressr` itself is checked out.

5. Tell the user:
   - What was created
   - To add data files to `$ARGUMENTS/data/`
   - To fill in `title`, `description`, `licenses`, `sources`, and `resources` (with a typed `schema` per resource) in `datapackage.json` — see `AGENTS.md` → "Data conventions" for the bar a dataset needs to clear before `status: structured`
   - To run `/push` when ready
