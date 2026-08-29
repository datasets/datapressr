---
name: capture
description: Use this skill when the user shares a URL, dataset idea, or loose factoid they want tracked but haven't decided to act on yet — "worth remembering" not "let's build this now". Files it as a GitHub issue (either a new checklist line in the Inbox issue, or its own issue if it's already substantive), replacing the old datasets/INBOX.md and datasets/BACKLOG.md markdown-file workflow. Near-zero friction is the point — no validation, no downloading, no judgment about whether it's good enough.
---

# Capture: get it out of the conversation and somewhere durable

Per `docs/lifecyle.md`'s "Capture" stage: prevent loss, preserve intent, near-zero friction. This is bookmarking plus a one-line reason, not research.

## Where it goes

1. Decide substantive vs. not, right now, don't agonize:
   - **Not yet substantive** (a URL with no clear dataset shape yet, a factoid, a vague idea) → add one checklist line to the open **"Inbox — quick finds to triage"** issue in `datasets/datapressr`. Find it with `search_issues` (query: `Inbox quick finds to triage`) rather than a hardcoded issue number — it could be recreated or renumbered.
   - **Already substantive** (clear source, some readiness signal — an existing scraper, an attached file, a known API) → its own issue instead. Title it `Wrangle and publish: <name>` (dataset) or `Data story: <name>` (a story/dashboard idea), same pattern as the existing Project Drawdown / Planetary Boundaries issues.

2. Keep the entry to what `docs/lifecyle.md` asks for — no more:
   - What it is (title or URL)
   - Why it's interesting, in one line
   - What data might exist, if known

   No validation. No downloading. No deciding if it's *good* — that's a later stage's job.

3. Update `datasets/NEXT.md` only if this capture changes what's actionable *right now* — most captures don't. `NEXT.md` is deliberately short; don't let capture inflate it back into a second backlog. If in doubt, leave `NEXT.md` alone and let the issue speak for itself.

## What this replaced

`datasets/BACKLOG.md`, `datasets/INBOX.md`, and `datasets/DASHBOARDS.md` used to be the capture surface — plain markdown checklists. They're superseded (each file says so, and points here) because freeform markdown doesn't scale as a queue: no way to search it, no way to know what's already triaged, no dependency or status tracking. GitHub issues give all of that for free. The one thing markdown had going for it — near-zero friction — is why this skill exists: don't let filing an issue become more ceremony than editing a list was.
