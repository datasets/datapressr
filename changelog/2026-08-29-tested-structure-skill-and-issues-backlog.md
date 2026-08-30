---
date: 2026-08-29
title: A tested wrangling skill, and backlog moves to GitHub issues
promote: false
---

DataPressr moves from three thin publishing commands to the start of an actual, opinionated skill suite for turning raw data into published datasets — and, unusually for an AI-authored playbook, the parts that can be tested now are.

`/validate` is no longer an LLM re-deriving a checklist from prose each run — it's a small, dependency-free script with its own test suite, checking a dataset's schema, license, and source metadata before anything gets published. A new `structure` skill walks through turning a messy raw source into a clean, typed dataset, written and verified against two datasets already on DataHub — including a genuine gotcha caught while parsing a 27MB multi-sheet spreadsheet (Excel formula cells silently breaking a naive parser, now documented with the fix). Its cleanup patterns are themselves a tested module, not just prose. The wrangling approach changed after testing against real data, too: an initial DuckDB-first decision got reversed for Node/TypeScript once it was clear no dataset in the project actually used DuckDB.

Every dataset now also needs a recorded license and source before it's more than a stub — see [AGENTS.md](https://github.com/datasets/datapressr/blob/main/AGENTS.md) for the full set of conventions and [the `structure` skill](https://github.com/datasets/datapressr/blob/main/skills/structure/SKILL.md) for the playbook.

Separately: `BACKLOG.md`, `INBOX.md`, and `DASHBOARDS.md` are retired in favour of [GitHub issues](https://github.com/datasets/datapressr/issues) and a short `datasets/NEXT.md` — a queue that can actually be searched, instead of a growing markdown file.
