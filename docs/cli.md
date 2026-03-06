# datapressr CLI

Push local datasets directly to DataHub Cloud without GitHub.

## Requirements

- Node.js 18+
- A DataHub Cloud API token (`AUTH_BEARER_TOKEN` value from the server)

## Setup

```bash
cd mayor/rig/cli
npm install
```

## Configuration

Set three environment variables (or add them to a `.env` file and source it):

| Variable | Description | Example |
|---|---|---|
| `DATAHUB_API_URL` | Base URL of your DataHub Cloud instance | `https://cloud.datahub.io` |
| `DATAHUB_API_TOKEN` | Bearer token for authentication | `my-secret-token` |
| `DATAHUB_PUBLICATION` | Publication slug to push datasets into | `datasets` |

## Usage

Run via `tsx` without a build step:

```bash
npx tsx src/index.ts <command> [options]
```

Or build first and run with Node:

```bash
npm run build
node dist/index.js <command> [options]
```

---

## Commands

### `push <dir>`

Push all files in a local directory as a dataset.

```bash
npx tsx src/index.ts push ./my-dataset
```

**What it does:**
1. Reads `datapackage.json` from the directory (if present) to extract `name`, `title`, and `description`
2. Creates the dataset via the API (skips if it already exists)
3. Walks all files in the directory (skipping dotfiles)
4. For each file: registers it with the API and uploads it directly to R2 storage
5. Sends `datapackage.json` content inline so DataHub can render metadata immediately

**Options:**

| Flag | Description |
|---|---|
| `-n, --name <name>` | Dataset name (overrides `datapackage.json` name and directory name) |
| `-t, --title <title>` | Dataset title |
| `-d, --description <desc>` | Dataset description |

**Example with a `datapackage.json`:**
```json
{
  "name": "world-gdp",
  "title": "World GDP 2024",
  "description": "GDP data by country from World Bank"
}
```
```bash
npx tsx src/index.ts push ./world-gdp
# → Pushes as 'world-gdp' with title and description from datapackage.json
```

**Example with explicit name:**
```bash
npx tsx src/index.ts push ./raw-export --name gdp-data --title "GDP Data"
```

---

### `init <name>`

Create an empty dataset slot in the publication without uploading any files. Useful for reserving a name before you have files ready.

```bash
npx tsx src/index.ts init my-dataset
npx tsx src/index.ts init my-dataset --title "My Dataset" --description "A dataset"
```

---

### `delete <name>`

Delete a dataset and all its files from the publication.

```bash
npx tsx src/index.ts delete my-dataset
```

---

## Full example workflow

```bash
# Set env vars
export DATAHUB_API_URL=https://cloud.datahub.io
export DATAHUB_API_TOKEN=my-secret-token
export DATAHUB_PUBLICATION=datasets

cd mayor/rig/cli
npm install

# Push a dataset
npx tsx src/index.ts push ../../datasets/world-gdp

# Output:
# Pushing 'world-gdp' → datasets
#   Dataset 'world-gdp' already exists, continuing...
#   Uploading 3 file(s)...
#
#   datapackage.json (1.2KB)... ✓
#   data/gdp.csv (45.3KB)... ✓
#   README.md (2.1KB)... ✓
#
# 3 file(s) pushed successfully.
# View at: https://cloud.datahub.io/datasets/world-gdp
```

## Supported file types

CSV, TSV, JSON, YAML, Markdown, Parquet, GeoJSON, XLSX, XLS, PNG, JPG, SVG, PDF, ZIP, XML, and plain text. Unknown extensions default to `application/octet-stream`.
