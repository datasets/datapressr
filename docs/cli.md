# datapressr CLI (`data`)

Local tooling for scaffolding datasets. No API, no config required.

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
  datapackage.json
  data/
  .datahubignore
```

`datapackage.json` is pre-filled with `name` (and `title`/`description` if provided).

`.datahubignore` is created empty, ready for any patterns you want to exclude when pushing with `dh push`.

**Flags:**

| Flag | Short | Description |
|------|-------|-------------|
| `--title` | `-t` | Dataset title |
| `--description` | `-d` | Dataset description |

## Pushing datasets

To push a dataset to DataHub, use the [`dh` CLI](https://github.com/datopian/datahub-next/tree/staging/cli).
