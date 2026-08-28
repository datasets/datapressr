# DataPressr — AI Agent Instructions

You are helping wrangle raw data finds into clean, publishable datasets on DataHub.

## Concepts

### Data hierarchy

- **Catalog** — a collection of datasets. Maps to one GitHub repo + one DataHub publication. Example: "World Bank Open Data", "Our World in Data".
- **Dataset** — a coherent data concept with defined schema and coverage. One directory, one `datapackage.json`. Example: "World GDP 1960–2024".
- **Data file** — a concrete file artifact (csv, json, parquet…). Listed as a resource in `datapackage.json`.

**Catalog-as-repo rule:** if the source is a portal or collection containing many datasets, give it its own repo and DataHub publication — not a subfolder inside another dataset.

### Dataset lifecycle

A dataset doesn't need to be complete to be published. Lifecycle stages:

| Stage | Description |
|-------|-------------|
| `capture` | Just a URL or note — intent to explore |
| `stub` | Title, description, source link. No files yet. Publishable. |
| `archived` | Raw files downloaded locally |
| `structured` | Cleaned, normalised, schema documented |
| `enriched` | Analysis, visualisations, derived data added |
| `monitored` | Living source, versioned and updated over time |

Set `"status": "<stage>"` in `datapackage.json` to track this.

---

## Dataset structure

Every dataset is a directory:

```
<name>/
  datapackage.json   # metadata and resource list (required)
  data/              # data files go here
  .datahubignore     # gitignore-style exclusions for dh push
  AGENTS.md          # this file (copy into new datasets)
```

---

## datapackage.json

Minimal valid example:

```json
{
  "name": "world-gdp",
  "title": "World GDP",
  "description": "GDP by country from World Bank, 1960–2024",
  "status": "structured",
  "licenses": [
    { "name": "ODbL-1.0", "title": "Open Data Commons Open Database License", "path": "https://opendatacommons.org/licenses/odbl/" }
  ],
  "sources": [
    { "title": "World Bank Open Data", "path": "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD" }
  ],
  "resources": [
    {
      "path": "data/gdp.csv",
      "name": "gdp",
      "title": "GDP by Country",
      "mediatype": "text/csv",
      "schema": {
        "fields": [
          { "name": "country_code", "type": "string" },
          { "name": "year", "type": "year" },
          { "name": "gdp_usd", "type": "number" }
        ],
        "primaryKey": ["country_code", "year"]
      }
    }
  ]
}
```

**Rules:**
- `name` must be URL-safe: lowercase, hyphens only
- Every file in `data/` that should be published must be in `resources`
- `status` should reflect the lifecycle stage above
- `licenses` and `sources` are **not optional** once the dataset leaves `stub`. We are republishing other people's data — record where it came from and what it's licensed under as soon as both are known. Use an SPDX id in `licenses[].name` when one applies (`CC-BY-4.0`, `ODbL-1.0`, `CC0-1.0`, `PDDL-1.0`...); if there's no SPDX id, use the license's own name and a link.
- Every resource should declare a `schema` with a `type` per field and a `primaryKey` where one exists. This is what makes the dataset actually structured, not just "a CSV that exists."
- Use `.datahubignore` to exclude scratch files, large intermediaries, raw downloads

### Data conventions

Applies from `structured` onward — the bar a dataset must clear before it's more than a stub:

- **Encoding**: UTF-8, no BOM.
- **Column names**: `snake_case`, no spaces. Include units where the value is ambiguous without them (`gdp_usd_millions`, not `gdp`).
- **Missing values**: a genuinely empty cell. Don't mix `NA`, `N/A`, `-`, `0`, and empty string for "missing" within one column.
- **Dates**: ISO 8601 (`YYYY-MM-DD`, or `YYYY` for year-only series).
- **One value per cell, one row per observation.** No merged headers, no totals rows mixed in with data rows.
- **Reproducibility**: any transform beyond a trivial rename should be a checked-in script (e.g. `build.sql` run through DuckDB, or `build.ts`) living in the dataset directory next to the raw snapshot — not a one-off interactive edit that can't be re-run when the source updates. The raw snapshot plus the script should be able to reproduce `data/*.csv` deterministically.
- **Scale**: this workflow assumes small data — comfortably fits in memory / a local DuckDB instance (rule of thumb: well under ~1GB raw). If a source is bigger than that, say so explicitly rather than quietly forcing it through the same pipeline; it needs a different approach.

**Definition of done for `status: structured`:** every resource has a `schema` with typed fields, a `primaryKey` if one exists, `licenses` and `sources` are filled in, the build is reproducible from a script, and `/validate` passes with no warnings.

### Adding charts (views)

Add a `views` array to `datapackage.json` to render charts on the dataset page:

```json
{
  "views": [
    {
      "name": "gdp-over-time",
      "title": "GDP Over Time",
      "specType": "simple",
      "resources": ["gdp"],
      "spec": {
        "type": "line",
        "group": "year",
        "series": ["gdp_usd"]
      }
    }
  ]
}
```

Supported chart types: `line`, `bar`, `lines-and-points`. Only CSV and GeoJSON resources can be visualised. `group` is the x-axis field, `series` is the list of y-axis fields.

---

## Workflow

### Start a new dataset

Create the directory structure:

```sh
mkdir -p <name>/data
cd <name>
```

Create `datapackage.json` with at minimum `name`, `title`, `description`. Add `"status": "stub"` if no data files yet.

Copy this `AGENTS.md` into the new directory so future AI sessions have context.

### Push to DataHub

**Skip this step if credentials are not configured.** Commit and push to GitHub — that is sufficient. Do not attempt `dh push` and do not treat missing credentials as an error.

If credentials are configured:

```sh
dh push .
```

Requires env vars:
```sh
export DATAHUB_API_URL=https://datahub.io
export DATAHUB_API_TOKEN=<your-token>
export DATAHUB_PUBLICATION=<your-publication-slug>
```

`dh` is the DataHub CLI — install from [datopian/datahub-next](https://github.com/datopian/datahub-next/tree/staging/cli).

### Delete a dataset

```sh
dh delete <name>
```

---

## Claude Code skills

If using Claude Code, the following slash commands are available in this repo:

| Command | What it does |
|---------|-------------|
| `/init <name>` | Scaffold a new dataset directory |
| `/push` | Push current directory to DataHub |
| `/validate` | Check datapackage.json for common issues |
