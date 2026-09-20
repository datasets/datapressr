---
title: Dataset lifecycle
description: From a saved idea to a reproducible, published dataset.
---

# Dataset lifecycle

A dataset can be useful before it is complete. Use the `status` field in `datapackage.json` to describe how far the work has progressed; not every dataset needs every stage.

| Status | What it means | Next step |
|---|---|---|
| `capture` | A source URL or idea, with a short note about why it matters | Decide whether to explore it |
| `stub` | A title, description and source link; no data files required | Preserve the source |
| `archived` | Raw source files saved with provenance | Extract and structure the data |
| `structured` | Tidy data with typed schemas and a reproducible build | Publish, analyse or reuse it |
| `enriched` | Analysis, visualisations or derived data added | Write a story or share the findings |
| `monitored` | A living source with versioned updates | Check and record changes over time |

## Capture an idea

Save the URL or file reference and one to three lines explaining what is interesting and what data might exist. Capture should be quick: downloading and validation can wait. Use the `capture` skill to preserve the idea.

If you have a question but no source, start with [source discovery](source-discovery-playbook.md).

## Create a stub

Use `init` to scaffold a dataset directory with `datapackage.json`, `data/`, `.datahubignore` and `AGENTS.md`. Add a clear title, description and source link, and set `"status": "stub"`. A stub is publishable without data files.

## Archive the source

Use `archive` to save a raw snapshot and record the source URL, retrieval time and licence. Record checksums or versions where available. Once a dataset leaves `stub`, `sources` and `licenses` are required metadata; an unresolved licence needs investigation, not an invented permission to republish.

## Structure the data

Use `structure` to produce tidy CSVs and document coverage, units and assumptions. A structured dataset must have:

- UTF-8 CSVs without a BOM, with LF line endings, `snake_case` columns and empty cells for missing values.
- One observation per row, one value per cell and ISO dates.
- A resource entry for every published data file, with typed schema fields and a primary key where one exists.
- Recorded sources and licences.
- A checked-in build script that reproduces the outputs from the archived snapshot.
- A clean `/validate` result with no warnings.

See [assistant setup and commands](cli.md) for validation and publication. These workflows assume small data that fits comfortably in memory, well under roughly 1 GB raw; larger sources need a different approach.

## Enrich and tell a story

Use `enrich` for summary statistics, initial dataset views and derived data. Use `story` when the findings support an argument: review the outline, build the charts, then write the prose. See [story craft](story-craft.md) and [charting](charting.md).

## Monitor when updates matter

For living sources, preserve successive snapshots, compare releases and record the update schedule. `monitored` describes a dataset maintained this way; an automated `monitor` skill is not yet available.

A source can contain several datasets at different stages. Keep the [catalog, dataset and data file](data-hierarchy.md) distinct when organising them.
