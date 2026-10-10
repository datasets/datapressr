---
name: capture
description: "Use this skill when the user shares a URL, dataset idea, or loose factoid they want tracked but haven't decided to act on yet — \"worth remembering\" not \"let's build this now\". Files it in the current project's own tracker: a Beads task if the project uses Beads, otherwise its issue tracker or a local INBOX.md checklist. Near-zero friction is the point — no validation, no downloading, no judgment about whether it's good enough."
---

# Capture: get it out of the conversation and somewhere durable

Per the "Capture" stage of the [dataset lifecycle](https://github.com/datasets/datapressr/blob/main/site/docs/lifecyle.md): prevent loss, preserve intent, near-zero friction. This is bookmarking plus a one-line reason, not research.

## Where it goes

The idea goes into **the project you are working in** — never into another project's tracker. In particular, don't file into DataPressr's own Inbox issue (`datasets/datapressr`) unless the current repository *is* DataPressr.

1. Find the current project's tracker, first match wins:
   - **The DataPressr repo itself** (its git remote is `datasets/datapressr`): see "Inside the DataPressr repo" below.
   - **Beads** (a `.beads/` directory and `bd` available): `bd create --title="dataset: <name>" --type=task --priority=3 --labels="dataset,inbox"` (add `story-candidate` for a story idea). If the project's `AGENTS.md` has its own labelling convention, follow that instead.
   - **The project's own issue tracker**, if the user keeps ideas there (e.g. a GitHub repo they own with an inbox issue or label): one checklist line in that inbox issue, or one short issue titled `Wrangle and publish: <name>` or `Data story: <name>`. Ask once if it's unclear whether they want issues used; don't guess at someone else's repo.
   - **Otherwise a local `INBOX.md`** at the project root (create it if missing): one `- [ ] ` checklist line per idea, newest at the bottom.

2. Keep the entry to what the lifecycle's Capture stage asks for — no more:
   - What it is (title or URL)
   - Why it's interesting, in one line
   - What data might exist, if known

   No validation. No downloading. No deciding if it's *good* — that's a later stage's job.

3. File each idea in one place only. If it later becomes substantive work, move it (e.g. INBOX line → Beads task or issue) and tick off the original rather than keeping both.

## Inside the DataPressr repo

1. Decide substantive vs. not, right now, don't agonize:
   - **Not yet substantive** (a URL with no clear dataset shape yet, a factoid, a vague idea) → add one checklist line to the open **"Inbox — quick finds to triage"** issue in `datasets/datapressr`. Find it with `search_issues` (query: `Inbox quick finds to triage`) rather than a hardcoded issue number — it could be recreated or renumbered.
   - **Already substantive** (clear source, some readiness signal — an existing scraper, an attached file, a known API) → a bead, not its own GitHub issue: `bd create --title="dataset: <name>" --type=task --priority=3 --labels="dataset,inbox"` (add `story-candidate` for a story idea; see AGENTS.md's labeling convention).

2. Beads (`bd ready`) is the actionable work queue; see the [handoff protocol](https://github.com/datasets/datapressr/blob/main/docs/next-session-brief.md). Lightweight captures go in the Inbox issue under this skill; anything substantive is tracked in Beads only, following AGENTS.md's labeling convention. Never file the same idea in both.

## Why not a markdown backlog in DataPressr

DataPressr used to capture into plain markdown checklists (`BACKLOG.md`, `INBOX.md`, `DASHBOARDS.md` under its `datasets/` folder). They were superseded because freeform markdown doesn't scale as a queue there: no way to search it, no way to know what's already triaged, no dependency or status tracking. GitHub issues gave all of that for free, and Beads now carries the substantive items. For a small project with no tracker, a local `INBOX.md` is still the right zero-friction default — don't let filing an idea become more ceremony than editing a list.
