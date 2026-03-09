---
created: 2026-03-09
---

# DataPressr CLI Vision

**A CLI for data wranglers. Turn raw finds into clean, publishable datasets.**

```sh
data init world-gdp && cd world-gdp && claude
```

---

## The Problem

Getting a dataset from "I found something interesting" to "published and usable" involves a lot of repetitive friction:

- Creating the right directory structure
- Writing boilerplate `datapackage.json`
- Normalizing files, naming things consistently
- Packaging up for publishing

None of this is hard. All of it is tedious and easy to skip.

The result: half-finished datasets that never ship.

---

## The Tool

`data` is a local CLI. It operates on your filesystem. It is designed to be used alongside AI coding assistants — Claude Code, Codex, Gemini CLI, and others.

The target user is someone already comfortable with the terminal who uses an AI assistant as part of their workflow. `data` gives both the human and the AI a shared, predictable structure to work with.

---

## AI Integration

`data init` generates an `AGENTS.md` inside every new dataset directory. `AGENTS.md` is the cross-tool standard for AI assistant instructions — Claude Code, Codex CLI, Gemini CLI, and others all read it automatically when working in a directory.

The generated `AGENTS.md` gives the AI immediate context:
- The dataset structure (`datapackage.json`, `data/`, `.datahubignore`)
- Frictionless Data Package conventions (resources, schema, etc.)
- How to push to DataHub with `dh push`
- Key rules (resources must be listed, name must be URL-safe, etc.)

This means the moment a user opens a dataset directory in their AI assistant, the AI already knows the conventions and can help correctly — without the user having to explain anything.

---

## Commands (Vision)

### Scaffolding

```sh
data init <name>
```

Creates a dataset directory with `datapackage.json`, `data/`, `.datahubignore`, and `AGENTS.md`. The starting point for any new dataset.

---

### Packaging (future)

```sh
data pack <dir>
```

Validate and finalize a dataset directory before publishing:

- Check `datapackage.json` is valid
- Verify all resources listed actually exist
- Warn on common issues (missing titles, no description, large files)

---

### Import helpers (future)

```sh
data from-url <url>
data from-csv <file>
```

Bootstrap a dataset from a remote URL or local file. Fetch, infer schema, generate a `datapackage.json` stub. Starting point, not a finished product.

---

### Conversion / normalization (future)

```sh
data normalize <file>
```

Clean up column names, infer types, produce a normalized CSV with a corresponding schema.

---

## Design Principles

**Local first.** `data` never needs a network connection. It works on your filesystem. Publishing is a separate step (`dh push`).

**Opinionated structure.** Every dataset follows the same layout: `datapackage.json` at root, data files in `data/`. Predictable = automatable.

**Fast to start, safe to skip.** Every command should be useful in isolation. You don't have to use the whole workflow — `data init` alone is already valuable.

**No hidden state.** What you see in the directory is what you get. No database, no lock files, no sync required.

**Go binary.** Single binary, no runtime dependency. `brew install` or `go install` and it works.

---

## The Workflow (End-to-End)

```sh
# 1. Scaffold
data init world-gdp --title "World GDP" --description "GDP by country from World Bank"

# 2. Add your data files
cp ~/downloads/gdp.csv world-gdp/data/

# 3. Edit datapackage.json — add resources, schema, sources
# (editor of your choice)

# 4. Pack and validate (future)
data pack world-gdp

# 5. Push to DataHub
dh push world-gdp
```

---

## What DataPressr Is Not

- Not a publishing platform (that's DataHub)
- Not a data pipeline or ETL tool
- Not a replacement for pandas / dbt / whatever you use to transform data
- Not opinionated about where data comes from

It sits in the gap between "raw file on disk" and "clean packaged dataset ready to publish."
