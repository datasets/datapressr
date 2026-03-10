# DataPressr CLI (`data`)

A CLI for data wranglers. Turn raw finds into clean, publishable datasets.

```sh
data init world-gdp && cd world-gdp && claude
# Your AI coding assistant has context and can help you wrangle data
```

## Install (local development)

**Prerequisites:** Go 1.22+

```sh
git clone https://github.com/datasets/datapressr.git
cd datapressr/cli
go build -o data .
```

This produces a `data` binary in the current directory. You can move it to your PATH or run it directly:

```sh
./data init my-dataset
```

Or install it globally:

```sh
go install .
```

## Usage

### `data init <name>`

Scaffold a new dataset directory:

```sh
data init world-gdp
```

This creates:

```
world-gdp/
  datapackage.json   # dataset metadata and resource list
  data/              # put your data files here
  AGENTS.md          # AI assistant context (Claude Code, Codex, etc.)
  .datahubignore     # files to exclude when pushing
```

Options:

```
-t, --title         Dataset title
-d, --description   Dataset description
```

### AI integration

`data init` generates an `AGENTS.md` that gives AI coding assistants (Claude Code, Codex CLI, Gemini CLI) immediate context about dataset structure and conventions. Just `cd` into the directory and start your assistant.

## License

MIT
