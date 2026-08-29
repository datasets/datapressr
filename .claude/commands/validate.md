---
description: Validate datapackage.json for common issues
---

Validate the dataset in the current directory.

1. If `scripts/validate-datapackage.mjs` exists in the current directory (it's copied in by `/init`), run it and print its output verbatim:
   ```sh
   node scripts/validate-datapackage.mjs .
   ```
   This is a deterministic, dependency-free script — same checks every time, not re-derived by reasoning about the JSON each run. It exits non-zero if there are errors.

2. If the script is missing (an older dataset scaffolded before this existed), fall back to checking by hand and tell the user to copy `scripts/validate-datapackage.mjs` from the `datapressr` repo into this dataset so future runs are deterministic:

   **Errors (must fix before pushing):**
   - `datapackage.json` exists and is valid JSON
   - `name` is present and URL-safe (lowercase, hyphens only — no spaces, dots, or uppercase)
   - `resources` array is present and non-empty
   - Every resource `path` exists on disk

   **Warnings (ok to push, worth fixing):**
   - `title` is present
   - `description` is present
   - Files exist in `data/` that are not listed in `resources`
   - Any resource file is very large (>50MB) — flag as approaching the small-data ceiling this workflow assumes
   - `status` field is not set
   - `licenses` is missing or empty (required once `status` is past `stub` — see `AGENTS.md`)
   - `sources` is missing or empty (required once `status` is past `stub`)
   - Any resource has no `schema`, or a `schema` with fields missing a `type`
   - A resource with an obvious identifying column (e.g. named `id`, or the first column) has no `schema.primaryKey` declared

   Print a clear summary with ✓ for passing checks, ✗ for errors, and ⚠ for warnings.
