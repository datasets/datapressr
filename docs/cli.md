# datapressr CLI (`data`)

Local tooling for scaffolding datasets. No API, no config required.

```sh
data init world-gdp && cd world-gdp && claude
```

## Installation

### go install

Requires Go 1.22+:

```sh
go install github.com/datasets/datapressr/cli@latest
```

### Build from source

```sh
git clone https://github.com/datasets/datapressr.git
cd datapressr/cli-go
go build -o data .
mv data /usr/local/bin/data
```

## Commands

### `data init <name>`

Scaffold a new dataset directory.

```sh
data init my-dataset
data init my-dataset --title "My Dataset" --description "A great dataset"
```

Creates:

```
my-dataset/
  datapackage.json   # dataset metadata and resource list
  data/              # data files go here
  .datahubignore     # gitignore-style exclusions for dh push
  AGENTS.md          # AI assistant context (read by Claude Code, Codex, Gemini CLI)
```

`datapackage.json` is pre-filled with `name` (and `title`/`description` if provided).

`AGENTS.md` gives your AI assistant immediate context about the dataset structure and conventions — no explanation needed.

**Flags:**

| Flag | Short | Description |
|------|-------|-------------|
| `--title` | `-t` | Dataset title |
| `--description` | `-d` | Dataset description |

## Pushing datasets

To push a dataset to DataHub, use the [`dh` CLI](https://github.com/datopian/datahub-next/tree/staging/cli).
