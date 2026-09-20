---
title: DataPressr
description: AI agent skills for turning messy source data into reproducible datasets and clear data stories.
---

# DataPressr

**From messy source data to a dataset someone else can use.**

DataPressr is a library of skills for AI coding assistants. Give your agent a source file or URL, and use the skills to archive the original, build tidy CSVs, document the schema and licence, and check the result. Then add analysis, charts or a data story.

The output is yours: ordinary files, readable metadata and scripts you can rerun when the source changes. Built by [Rufus Pollock](https://rufuspollock.com) and [Datopian](https://datopian.com), drawing on more than 20 years of data wrangling and open data experience.

## Install

You need Node.js with `npx` and an AI coding assistant that supports skills. From your project directory, run:

```sh
npx skills add datasets/datapressr
```

Choose the skills and your agent in the installer's prompts. You can also install just the wrangling skill:

```sh
npx skills add datasets/datapressr --skill structure
```

The [skills installer](https://github.com/vercel-labs/skills) supports agents including Claude Code, Cursor and others. Each DataPressr skill is a readable `SKILL.md` playbook, so you can also give its instructions directly to your agent.

## Get started

### Wrangle a dataset

Open your assistant in the project where you installed the skills. Start with a small CSV, spreadsheet or source URL and ask:

> Use DataPressr's archive and structure skills to turn this source into a dataset: [paste a URL or file path]. Save the raw source, record its licence and provenance, and write a reproducible build that produces tidy CSVs with typed metadata. Run the validate skill and explain any remaining gaps.

The agent checks the source and its terms, saves a snapshot, and builds a dataset along these lines:

```text
my-dataset/
  archive/          # original source and provenance
  build.ts          # rerunnable transformation
  data/             # tidy CSVs
  datapackage.json  # resources, schema, sources and licence
```

Review the source, coverage and output with your agent. When the data is ready, try:

> Use the enrich skill to summarise this dataset and add initial charts. Tell me what stands out and what the data cannot establish.

To scaffold an empty dataset first, use the `init` skill with a name such as `world-gdp`. For this workflow, [clone the repository](https://github.com/datasets/datapressr) so the agent has the accompanying `AGENTS.md` and validator script to copy. See the [setup guide](docs/cli.md) for commands and publication details.

### Make a data story

Start with a structured dataset of your own, or [clone this repository](https://github.com/datasets/datapressr) to try the included oil-price data. Ask your assistant:

> Use DataPressr's enrich and story skills with datasets/energy-and-commodities/oil-prices. Explore how Brent and WTI behaved in April 2020. Check the figures, propose one argument, and have the outline independently reviewed before writing. Then build annotated charts and a short story with sources and caveats.

You get an outline, chart-building scripts, SVG charts and a Markdown story. Review the argument before the prose: the skill separates those decisions so you can change the wording without losing the evidence.

[![Brent and WTI daily spot prices, showing WTI falling below zero in April 2020 while Brent remained positive.](stories/oil-prices-brent-wti.svg)](stories/oil-prices.md)

[Read the finished example: WTI Went Negative. Brent Didn't.](stories/oil-prices.md) The chart above is the actual generated SVG: sharp at any size and reproducible from the dataset.

## What you can do

| Skill | Use it to… |
|---|---|
| `capture` | Save a URL or idea with a short note about why it matters |
| `init` | Scaffold a dataset directory and its metadata |
| `archive` | Preserve raw source files with provenance |
| `structure` | Turn CSVs, spreadsheets, text tables or JSON responses into tidy, typed data |
| `validate` | Check metadata, resource paths and schema declarations |
| `enrich` | Add summary statistics, initial charts and a note on the findings |
| `story` | Develop one argument through a reviewed outline, charts and prose |
| `push` | Publish the dataset to DataHub when credentials are configured |

Use one skill for a specific job, or combine them for the full workflow. Publication is optional: the dataset can live in your own Git repository.

## Why DataPressr?

- **Start with a workflow that has done the work.** The playbooks distil practical data wrangling experience into steps your agent can follow, from messy spreadsheets to paginated APIs.
- **Keep the evidence.** Preserve raw snapshots, source URLs and licence information alongside the result.
- **Make cleaning reproducible.** Check in the transformation script; rebuild from the archived source rather than repeating a chat session.
- **Describe what the numbers mean.** Record field types, units, keys, coverage and missing values in `datapackage.json`.
- **Separate findings from storytelling.** Review the argument and numbers before polishing the prose; generate story charts as static SVGs with Observable Plot.

DataPressr is designed for small data that fits comfortably in memory, typically well under 1 GB raw. Validation checks the package metadata; it does not prove every value is correct. Source checks and review remain part of the workflow.

## See the results

- [Tesla quarterly deliveries](docs/examples/tesla-source-discovery.md) — finding the source, tracking gaps and adapting the question to what was actually reported.
- [U.S. natural hazard statistics](docs/examples/nws-hazard-source-discovery.md) — extracting decades of tables from PDFs with an incomplete source index.
- [WTI Went Negative. Brent Didn't.](stories/oil-prices.md) — a data story built from reproducible oil-price data, checked findings and annotated charts.

Browse all [datasets](datasets.md) and [stories](stories/README.md), or follow the [documentation](docs/README.md) from setup to publication.

## Status and background

All eight skills above are available. The wrangling workflow has been exercised on scientific text files, spreadsheets, Markdown tables, paginated APIs and linked CSVs. Automated monitoring is not yet a skill; repeatable skill evaluation and monitoring are areas for further work.

[Explore the source and skills](https://github.com/datasets/datapressr) · [Read the changelog](changelog/) · [Background and development notes](https://github.com/datasets/datapressr/blob/main/docs/README.md)

## Built by

[Rufus Pollock](https://rufuspollock.com) and [Datopian](https://datopian.com) — bringing more than 20 years of experience in data wrangling, open data and publishing data people can use.
