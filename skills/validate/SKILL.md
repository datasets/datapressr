---
name: validate
description: "Use this skill to check a dataset's datapackage.json for common issues before pushing to DataHub — missing/invalid fields, unsafe name, empty or broken resources, missing schema/licenses/sources. Runs the deterministic dependency-free validator script. Invoked as `/validate` in Claude Code, or by name; operates on the dataset in the current directory."
---

# Validate: check datapackage.json before pushing

Validate the dataset in the current directory.

1. If `scripts/validate-datapackage.mjs` exists in the current directory (it's
   copied in by the `init` skill), run it and print its output verbatim:
   ```sh
   node scripts/validate-datapackage.mjs .
   ```
   This is a deterministic, dependency-free script — same checks every time, not
   re-derived by reasoning about the JSON each run. It exits non-zero if there
   are errors.

2. If the script is missing (an older dataset scaffolded before this existed),
   fall back to checking by hand and tell the user to copy
   `scripts/validate-datapackage.mjs` from the `datapressr` repo into this
   dataset so future runs are deterministic:

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

   **Notes (don't count as warnings):**
   - `title` or `description` is the blank `""` placeholder `/init` scaffolds, while `status` is `capture` or `stub`

   Print a clear summary with ✓ for passing checks, ✗ for errors, ⚠ for warnings and · for notes.
