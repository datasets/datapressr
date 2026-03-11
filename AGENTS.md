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
  "resources": [
    {
      "path": "data/gdp.csv",
      "name": "gdp",
      "title": "GDP by Country",
      "mediatype": "text/csv"
    }
  ]
}
```

**Rules:**
- `name` must be URL-safe: lowercase, hyphens only
- Every file in `data/` that should be published must be in `resources`
- `status` should reflect the lifecycle stage above
- Use `.datahubignore` to exclude scratch files, large intermediaries, raw downloads

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
