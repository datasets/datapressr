---
title: "The Commons dataset standard (machine-checkable)"
created: 2026-11-22
status: v1
checker: scripts/dataset-check.mjs
---

# The Commons dataset standard

What a well-published dataset in the Commons (`github.com/datasets/<name>`, shown at `datahub.io/core/<name>`) must have. Every rule here is checked by [`scripts/dataset-check.mjs`](../scripts/dataset-check.mjs), so an agent can publish without a human reading the package. Origin: Factory programme LTP, 22 Nov 2026 (injection "encode the standard once"; signed Must rules 1–4 in `datasets/factory` `projects/datahub-programme-ltp/rules-to-sign.md`).

Two levels:

- **New** (`--new`): the gate for every dataset we add from now on. All rules below are errors.
- **Stock** (default): the nightly watch over the existing datasets. Only things that break a reader are errors (page down, broken package, missing files, a living dataset gone stale); the rest of the standard shows as warnings, so the stock can be raised over time without a wall of red.

## Rules

| # | Rule | New | Stock |
|---|---|---|---|
| 1 | `datapackage.json` passes `validate-datapackage.mjs` with no errors (metadata, README MDX, CSV values against the schema) | error | error |
| 2 | `name` is URL-safe and equals the repo (directory) name; `title` and `description` are set | error | warning |
| 3 | **Open licence:** `licenses` names one on the allowlist below | error | warning |
| 4 | **Clear primary source:** `sources` has at least one entry with an `http(s)` `path` | error | warning |
| 5 | Every resource has a `schema` with typed fields; identifying columns have a `primaryKey` | error | warning |
| 6 | **Upkeep declared at birth:** `upkeep.mode` is `frozen` (with `upkeep.snapshot`, a date) or `living` (with `upkeep.refresh`, a cadence, and `upkeep.workflow`, a scheduled GitHub Actions file that exists) | error | warning |
| 7 | **Living stays fresh:** for a living dataset, the newest commit touching `data/` is within twice its cadence | error | error |
| 8 | Root `README.md` exists, has no H1, and has a `## What stands out` section (one striking fact, with the number) and a `## Source and licence` section | error | warning (README missing: error) |
| 9 | The README says how the data is kept: it contains "frozen snapshot" or "updated" + the cadence | error | – |
| 10 | Git sync ships only the dataset: if `archive/`, `scripts/`, `AGENTS.md`, `build.*`, `package*.json` or `node_modules/` exist, a root `config.json` lists them in `contentExclude` (DataHub's git sync ignores `.datahubignore`) | error | – |
| 11 | No file over 50 MB; no resource named the same as the package (DataHub then hides the others); every view names an existing resource | error | warning |
| 12 | A check-on-push workflow (`.github/workflows/dataset-check.yml`) runs this checker | error | – |
| 13 | **Live page** (`--live`): `datahub.io/core/<name>` returns 200 without "Error parsing MDX" or "Resource not found for view" | error | error |
| 14 | **Name is free** (`--prepublish`): `datahub.io/core/<name>` returns 404 before the first link, so a link never overwrites another dataset | error | – |

**Open licence allowlist:** `CC0-1.0`, `PDDL-1.0`, `CC-BY-4.0`, `CC-BY-3.0`, `ODC-BY-1.0`, `ODbL-1.0`, `CC-BY-SA-4.0`, `OGL-UK-3.0`, `US-PD` (works of the US federal government), `other-pd` (public domain, stated by the source). Anything else, or a licence we inferred rather than read on the source's site, goes to a human (Must rule 1).

## `upkeep` in `datapackage.json`

```json
"upkeep": { "mode": "frozen", "snapshot": "2026-11-22" }
```

```json
"upkeep": { "mode": "living", "refresh": "weekly", "workflow": ".github/workflows/update.yml" }
```

Cadences: `daily`, `weekly`, `monthly`, `quarterly`, `annual`. Default is frozen (Must rule 4). A living dataset sets `status: "monitored"`.

## Not machine-checked (recorded in the content bead instead)

- **Fact check** (Must rule 2): a second agent recomputes the "What stands out" number from the published CSV before the dataset goes public. The bead records the reviewer, the number and the command.
- Whether the licence is really what the source says. The checker reads our metadata; the wrangler reads the source's terms and quotes them in the bead.

## Running it

```sh
node scripts/dataset-check.mjs <dir> --new                 # gate a new dataset before publishing
node scripts/dataset-check.mjs <dir> --new --prepublish    # plus: the /core name is free
node scripts/dataset-check.mjs <dir> --live                # after linking: the page renders
node scripts/dataset-check.mjs --org datasets --out report # stock: every repo in the org (nightly)
```

`--json` prints machine-readable results. Exit code is 1 if any error.
