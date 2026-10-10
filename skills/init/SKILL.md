---
name: init
description: "Use this skill to scaffold a new dataset directory — the starting point for any new DataPressr dataset, before archive/structure. Creates datapackage.json (status stub), data/, .datahubignore, and copies in AGENTS.md and the validator script. Invoked as `/init <name>` in Claude Code, or by name with the dataset name as the argument."
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

3. Copy the dataset conventions into `<name>/AGENTS.md` so future AI sessions have context. They ship with this skill: copy `references/AGENTS.md` from this skill's own directory (the folder holding this `SKILL.md`) verbatim. If that file isn't there, download it from https://raw.githubusercontent.com/datasets/datapressr/main/skills/init/references/AGENTS.md. Inside the DataPressr repo itself, run `node scripts/sync-dataset-agents.mjs` instead, which writes the same text into every dataset (and `npm test` fails if a copy goes stale).

4. Copy the validator into `<name>/scripts/validate-datapackage.mjs` — it's what the `validate` skill runs. It ships with the `validate` skill: copy `scripts/validate-datapackage.mjs` from that skill's directory, a sibling of this one (`../validate/scripts/validate-datapackage.mjs` from the folder holding this `SKILL.md`). If it isn't there, download it from https://raw.githubusercontent.com/datasets/datapressr/main/skills/validate/scripts/validate-datapackage.mjs. Don't write a stand-in from memory. It's a single dependency-free file (plain Node, no `package.json` needed to run it), so it travels with the dataset directory even when that directory becomes its own repo.

5. Tell the user:
   - What was created
   - To add data files to `<name>/data/`
   - To fill in `title`, `description`, `licenses`, `sources`, and `resources`
     (with a typed `schema` per resource) in `datapackage.json` — see `AGENTS.md`
     → "Data conventions" for the bar a dataset needs to clear before
     `status: structured`
   - To run the `push` skill (`/push`) when ready
