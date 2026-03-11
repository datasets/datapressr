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
- Any resource file is very large (>50MB)
- `status` field is not set

Print a clear summary with ✓ for passing checks, ✗ for errors, and ⚠ for warnings.
