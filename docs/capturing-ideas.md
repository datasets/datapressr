# Capturing ideas quickly

Most good ideas arrive as a bare URL or a half-sentence. The capture step exists so that nothing is lost and nothing is researched yet. It is the first stage of the [dataset lifecycle](../site/docs/lifecyle.md): preserve intent, near-zero friction.

An entry has three parts and no more:

- **What it is** — the title or URL.
- **Why it's interesting** — one line.
- **What data might exist** — if known. "Unknown" is a fine answer.

No validation, no downloading, no deciding whether it's good enough. That is the job of the later stages.

## Where it goes

In the DataPressr repo, an idea goes in exactly one of three places:

| Situation | Where | How |
|---|---|---|
| You have `bd` (the default) | A bead | `bd create --title="dataset: <name>" --type=task --priority=3 --labels="dataset,inbox"`, with the three parts in `--description`. Add `story-candidate` if a written piece seems likely. |
| No `bd` (a cloud session, a phone) or a one-liner | A checklist line in the Inbox issue | Find the open "Inbox — quick finds to triage" issue ([datapressr#2](https://github.com/datasets/datapressr/issues/2)) and add `- [ ] <date> — <link> — <why>`. |
| It needs a longer write-up or outside comment | Its own GitHub issue | Titled `Wrangle and publish: <name>` or `Data story: <name>`. Link it from the bead. |

Beads is the default because it is searchable, labelled, and feeds `bd ready`. The Inbox issue is the fallback where `bd` isn't available. Never file the same idea in both: when an Inbox line becomes substantive, create the bead and tick or strike the line with a pointer to it.

There is no markdown inbox file in this repo. Projects of your own that have no tracker can keep an `INBOX.md` of `- [ ]` lines; the `capture` skill covers that case.

## Ideas that are really catalogs

If the source is a portal or a knowledge base where each entry is itself a dataset (for example [Global Social Norms — Everyday Norms](https://www.globalsocialnorms.org/everyday-norms)), capture it the same way and add a note: "likely a catalog". When it is picked up, the [catalog-as-repo pattern](../site/docs/pattern-catalog-as-repo.md) applies.

## Asking your assistant

Paste the URL and say why it caught your eye. The `capture` skill files it in the right place. Then move on.
