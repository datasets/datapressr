---
name: capture
description: Use this skill when the user shares a URL, dataset idea, or loose factoid they want tracked but haven't decided to act on yet — "worth remembering" not "let's build this now". Files it as a checklist line in the Inbox GitHub issue, or as a Beads task if it's already substantive and the repo uses Beads, replacing the old datasets/INBOX.md and datasets/BACKLOG.md markdown-file workflow. Near-zero friction is the point — no validation, no downloading, no judgment about whether it's good enough.
---

# Capture: get it out of the conversation and somewhere durable

Per `site/docs/lifecyle.md`'s "Capture" stage: prevent loss, preserve intent, near-zero friction. This is bookmarking plus a one-line reason, not research.

## Where it goes

1. Decide substantive vs. not, right now, don't agonize:
   - **Not yet substantive** (a URL with no clear dataset shape yet, a factoid, a vague idea) → add one checklist line to the open **"Inbox — quick finds to triage"** issue in `datasets/datapressr`. Find it with `search_issues` (query: `Inbox quick finds to triage`) rather than a hardcoded issue number — it could be recreated or renumbered.
   - **Already substantive** (clear source, some readiness signal — an existing scraper, an attached file, a known API) → a bead, not its own GitHub issue: `bd create --title="dataset: <name>" --type=task --priority=3 --labels="dataset,inbox"` (add `story-candidate` for a story idea; see AGENTS.md's labeling convention). If the repo doesn't use Beads or `bd` isn't available, fall back to its own issue titled `Wrangle and publish: <name>` or `Data story: <name>`.

2. Keep the entry to what `site/docs/lifecyle.md` asks for — no more:
   - What it is (title or URL)
   - Why it's interesting, in one line
   - What data might exist, if known

   No validation. No downloading. No deciding if it's *good* — that's a later stage's job.

3. Beads (`bd ready`) is the actionable work queue; see `docs/next-session-brief.md` for handoff instructions. Lightweight captures go in the Inbox issue under this skill; anything substantive is tracked in Beads only, following AGENTS.md's labeling convention. Never file the same idea in both.

## What this replaced

`datasets/BACKLOG.md`, `datasets/INBOX.md`, and `datasets/DASHBOARDS.md` used to be the capture surface — plain markdown checklists. They're superseded (each file says so, and points here) because freeform markdown doesn't scale as a queue: no way to search it, no way to know what's already triaged, no dependency or status tracking. GitHub issues gave all of that for free, and Beads now carries the substantive items. The one thing markdown had going for it — near-zero friction — is why this skill exists: don't let filing an issue become more ceremony than editing a list was.
