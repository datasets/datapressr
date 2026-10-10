---
name: validate
description: "Use this skill to check a dataset's datapackage.json and its CSV data for common issues before pushing to DataHub — missing/invalid fields, unsafe name, empty or broken resources, missing schema/licenses/sources, and CSV values that don't match the declared schema (types, dates, primary keys, row width). Runs the deterministic dependency-free validator script. Invoked as `/validate` in Claude Code, or by name; operates on the dataset in the current directory."
---

# Validate: check datapackage.json and its data before pushing

Validate the dataset in the current directory.

1. If `scripts/validate-datapackage.mjs` exists in the current directory (it's
   copied in by the `init` skill), run it and print its output verbatim:
   ```sh
   node scripts/validate-datapackage.mjs .
   ```
   This is a deterministic, dependency-free script — same checks every time, not
   re-derived by reasoning about the JSON each run. It exits non-zero if there
   are errors.

   It checks two layers by default: the metadata in `datapackage.json`, and the values in every CSV resource against that resource's `schema`. The value checks cover UTF-8 without BOM, LF line endings and a trailing newline, RFC 4180 quoting, a header matching `schema.fields` in order, row width, the types `string`, `integer`, `number`, `boolean`, `date` (a real calendar date), `year`, `yearmonth` and `datetime`, `constraints.required` and `constraints.enum`, `primaryKey` fields non-empty and unique, and same-package `foreignKeys`. Empty cells (or `schema.missingValues`) are missing and skip the type check. Any other type, or a non-default `format`, is a "not checked" warning rather than a silent pass. Each finding names the resource, line and value; repeated findings are capped at five plus a "more of the same" line. `--metadata-only` skips the value checks (for a file too big to read); `--json` prints `{errors, warnings, notes, stats}`.

2. If the dataset has no `scripts/validate-datapackage.mjs` (an older dataset, or one not scaffolded by `init`), run the copy that ships with this skill, in `scripts/validate-datapackage.mjs` under this skill's own directory (the folder holding this `SKILL.md`), and print its output verbatim:
   ```sh
   node <this skill's directory>/scripts/validate-datapackage.mjs .
   ```
   Then offer to copy that file into the dataset's `scripts/` so future runs don't depend on the skill being installed.

3. If neither copy exists, download https://raw.githubusercontent.com/datasets/datapressr/main/skills/validate/scripts/validate-datapackage.mjs into the dataset's `scripts/` and run it as in step 1. Only if that fails too, fall back to checking by hand, and say that you did:

   **Errors (must fix before pushing):**
   - `datapackage.json` exists and is valid JSON
   - `name` is present and URL-safe (lowercase, hyphens only — no spaces, dots, or uppercase)
   - `resources` array is present and non-empty (not required while `status` is `capture` or `stub`)
   - Every resource `path` exists on disk

   **Warnings (ok to push, worth fixing):**
   - `title` is present (see Notes for a blank `""` at `capture`/`stub`)
   - `description` is present (likewise)
   - Files exist in `data/` that are not listed in `resources` (dotfiles such as `.gitkeep` are ignored)
   - Any resource file is very large (>50MB) — flag as approaching the small-data ceiling this workflow assumes
   - `status` is not set or is not a lifecycle stage (`capture`, `stub`, `archived`, `structured`, `enriched`, `monitored`); either way the dataset is treated as past `stub`
   - `licenses` is missing or empty (required once `status` is past `stub` — see `AGENTS.md`)
   - `sources` is missing or empty (required once `status` is past `stub`)
   - Any resource has no `schema`, or a `schema` with fields missing a `type`
   - A resource with an obvious identifying column (e.g. named `id`, or the first column) has no `schema.primaryKey` declared

   **Values (errors unless marked, for each CSV resource with a schema):**
   - UTF-8 without BOM; LF line endings and a trailing newline (warnings); RFC 4180 quoting
   - Header row equals `schema.fields` names in order; every row has that many cells
   - Each non-empty cell parses as its field's type: `integer`, `number` (plain decimal, no `1,000`), `boolean`, `date` (`YYYY-MM-DD`, a real day), `year`; `string` cells with leading/trailing spaces are a warning
   - `primaryKey` cells are non-empty and the key is unique; `foreignKeys` point at existing rows

   **Notes (don't count as warnings):**
   - `title` or `description` is the blank `""` placeholder `/init` scaffolds, while `status` is `capture` or `stub`

   Print a clear summary with ✓ for passing checks, ✗ for errors, ⚠ for warnings and · for notes.
