---
title: Docs
description: Learn how to find, structure, publish and tell stories with data using DataPressr.
---

# Work with data using DataPressr

DataPressr provides AI assistant skills for turning a data question or raw source into a reproducible dataset, then a data story. Start with the setup guide, or pick the step you need below.

## From a question to a story

```text
┌───────────────────────┐
│ Find a source         │   datapressr: capture + discovery guide
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Build a clean dataset │   datapressr: archive + structure + validate
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Explore the findings  │   datapressr: enrich
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Tell a data story     │   datapressr: story
└───────────────────────┘
```

The labels name the DataPressr skills (plus the discovery guide) that help your AI assistant: preserving sources, making data reproducible, checking the package, exploring findings and turning an argument into charts and prose. Start with your question or idea; you review the source, the numbers and the story's claims.

You can stop at a useful dataset. Use `init` to scaffold it and `push` to publish it to DataHub when ready; publication is optional and does not require a story. If you already have clean data, start at **Explore the findings**. The [source-discovery guide](source-discovery-playbook.md) helps you find evidence before the extraction skills begin.

## Get started

1. [Set up your AI assistant](cli.md) — install the skills, create a dataset, validate it and publish to DataHub.
2. [Understand the dataset lifecycle](lifecyle.md) — move from a saved idea to archived, structured and enriched data, with a clear quality bar at each stage.
3. [Choose the right structure](data-hierarchy.md) — distinguish catalogs, datasets and data files. For a source containing many datasets, use the [catalog-as-repository pattern](pattern-catalog-as-repo.md).

## Find and prepare a source

Use the [source-discovery playbook](source-discovery-playbook.md) to turn a question into an extraction plan: compare sources, check licensing, establish coverage and record gaps before building.

Two worked examples show how that works in practice:

- [Tesla quarterly deliveries](examples/tesla-source-discovery.md) — find releases through SEC EDGAR and adapt the question to what the source actually reports.
- [U.S. natural hazard statistics](examples/nws-hazard-source-discovery.md) — recover tables from PDFs when there is no machine-readable index and the source's own listing contains mistakes.

Once you have a source, use the [skill playbooks](https://github.com/datasets/datapressr/tree/main/skills) for `archive`, `structure` and `enrich`. They cover raw snapshots, tidy CSVs, typed metadata and initial analysis.

## Make a data story

- [Story craft](story-craft.md) — choose one argument, support it with checked numbers and charts, and explain its limits.
- [Charting](charting.md) — build reproducible story charts with Observable Plot and static SVG; use dataset views for initial exploration.
- [Voice guide](voice-guide.md) — write plainly, lead with the finding and let the numbers carry it.

Browse the [datasets](../datasets.md) and [finished stories](../stories/README.md) for examples of the results.
