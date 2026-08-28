---
description: Validate datapackage.json for common issues
---

Validate the dataset in the current directory.

Read `datapackage.json` and check:

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
