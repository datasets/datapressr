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

4. Tell the user:
   - What was created
   - To add data files to `$ARGUMENTS/data/`
   - To fill in `title`, `description`, `licenses`, `sources`, and `resources` (with a typed `schema` per resource) in `datapackage.json` — see `AGENTS.md` → "Data conventions" for the bar a dataset needs to clear before `status: structured`
   - To run `/push` when ready
