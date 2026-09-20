---
title: "GitHub issue reconciliation — proposed updates against the Beads audit"
date: 2026-09-18
---

# GitHub issue reconciliation — proposed updates against the Beads audit

GitHub issues #2–#14 were written before the [Beads migration](next-audit.md) and before v1 shipped. Several now describe work as pending that is finished, or carry checklists whose unchecked boxes are done. This document proposes exact updates so the issues stop contradicting the repository.

**This prepares reviewable text; it does not send anything.** No issue body was edited, no comment posted, no status changed. Editing external issues needs its own authorisation, and the owner may prefer to fold several of these together or close issues outright rather than update them.

**Two rules used throughout.** Closed Beads plus repository artifacts take precedence over stale issue checkboxes — that is the audit's own rule, and it is what makes most of these updates one-directional. And GitHub keeps the *lightweight capture* role: #2 stays the inbox, #6 stays a research holding pen. Nothing here duplicates the Beads backlog into GitHub, and no implementation detail is copied across.

Issues #5, #8 and #9 are closed and accurate; they need nothing. #13 is a live open question with nothing stale in it. The six below are the ones the audit flags.

---

## #3 — Wrangle and publish: Project Drawdown

**Stale because** the issue's "Next step" is to write a `build.ts` for the dataset. That relocation work is recorded as complete (`datapressr-61n`, closed; the dataset was removed locally as part of it). What remains is not wrangling — it is a comparison of the two external Drawdown packages (`datapressr-jh6`) and then an owner decision about naming and publication (`datapressr-aw1`, deferred, owner-only).

**Proposed addition** (append to the body, or post as a comment and leave the body alone):

> **Update 2026-09-18.** The wrangling and relocation are done — see `datapressr-61n` (closed). What is left is not a `structure` pass:
>
> - Compare the two external Project Drawdown packages and prepare a recommendation — `datapressr-jh6`. Working notes: [`docs/project-drawdown-comparison.md`](project-drawdown-comparison.md).
> - Decide naming and publication — `datapressr-aw1`. **This one is the owner's**, and it is deferred until the comparison is in front of them.
>
> Keeping this issue open as the public thread for the Drawdown question; the execution detail lives in Beads.

**Do not** close #3. The publication question is genuinely unresolved, and it is owner-facing.

## #4 — Data story: Planetary Boundaries dashboard

**Stale because** the issue reads as though the story is still to be written. It is written: [`site/stories/planetary-boundaries.md`](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries.md), with a committed outline, a chart builder and two rendered SVGs (`datapressr-tzh`, closed, recording commits 16380d8 and 62c526e). The audit lists this issue as stale in as many words.

**Proposed addition:**

> **Update 2026-09-18.** The story is drafted and published on the site: [planetary-boundaries.md](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries.md), with its [outline](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries-outline.md) and charts. Recorded in `datapressr-tzh` (closed). It is data story #2 of the three that v1 required.
>
> One thing remains and it is **not** an agent task: the author's own voice pass — `datapressr-77e`, deferred, human-only. This issue stays open until that happens.

**Do not** close #4 — the voice pass is the last step and it belongs to a person.

## #7 — Ship the DataPressr site (Flowershow)

**Stale because** four of its five unchecked boxes are done. `site/review.md` and `site/datasets.md` both exist. The site is published: `site/README.md` records the live URL at <https://datapressr-2-rufuspollock.flowershow.me>, git-autosyncing from `site/` on every push to `main`. What genuinely remains is the last box — folding `docs/*.md` into the site so the decision history publishes too — which overlaps with #13 and is tracked as `datapressr-5yq` (deferred, post-v1).

**Proposed checklist replacement:**

> - [x] `site/README.md` — landing page
> - [x] `site/review.md` — the "what needs your eyes right now" list
> - [x] `site/datasets.md` — catalogue of produced datasets with status + links
> - [x] First publish — live at <https://datapressr-2-rufuspollock.flowershow.me>, git-autosyncing from `site/` on every push to `main`
> - [x] Record the live URL — in `site/README.md`
> - [ ] Follow-up: fold `docs/*.md` into `site/docs/` so the decision history publishes too — tracked as `datapressr-5yq` (deferred, post-v1); decide together with #13

**Caveat the owner should know:** the live deployment has not been re-verified since the migration audit, which explicitly flagged it as not revalidated. The "first publish" box is being ticked on the repository's own record of the URL, not on a fresh check of the site. Worth a look before posting.

## #10 — Design the `story` skill as separable steps

**Stale because** the issue is blocked on "writing one more story this way by hand first". That has happened three times over, and the skill it describes now exists and is active. `skills/story/` is a real skill with its own `references/`, symlinked into `.claude/skills/story`, and its draft open questions are resolved (`datapressr-9qc`, closed). The outline → charts → prose separation the issue proposes is exactly what story #3 was built with, including the independent review gate on the outline — which changed the argument, so the gate earned itself.

**Proposed addition:**

> **Update 2026-09-18.** Done, and the design held up. The `story` skill is written and active — [`skills/story/`](https://github.com/datasets/datapressr/tree/main/skills/story) — with the three-step separation this issue proposed: outline, then charts, then prose, and the outline reviewed and signed off before any prose effort. Activated in `datapressr-9qc` (closed); the draft's open questions all have written policies now, each based on a real run.
>
> Three stories were written this way: [Keeling Curve](https://github.com/datasets/datapressr/blob/main/site/stories/keeling-curve.md), [Planetary Boundaries](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries.md), [WTI Went Negative. Brent Didn't.](https://github.com/datasets/datapressr/blob/main/site/stories/oil-prices.md). The review gate proved its worth on the third: it rejected the first outline for explaining *why* WTI went negative, which a price-only dataset cannot show.
>
> Closing — the skill exists and the design question is answered.

**Close #10** with that comment. The distinction worth drawing here is the one the audit makes: at migration time both `story` and `enrich` were *drafted, not activated*. They are now activated. That is what changes this issue from open to closed.

## #11 — Charting approach: near-term policy + longer investigation

**Stale because** the issue presents the near-term policy as open ("hand-rolled inline SVG … raw HTML … pick whatever gets a good-looking chart fastest"). It is decided and written down: [`docs/charting.md`](charting.md) (2026-09-06) settles on Observable Plot rendered to static SVG at build time for stories, and declarative `views` for dataset pages. All three stories now follow it; the Keeling charts were ported from hand-rolled SVG (`datapressr-8rk`). The issue's *second* track — a chart mechanism DataHub or Flowershow support natively — is genuinely still open and is `datapressr-7fs` (deferred, post-v1).

**Proposed addition:**

> **Update 2026-09-18.** The near-term track is **decided and no longer open to mix-and-match**: Observable Plot rendered to static SVG at build time for stories, declarative `views` for dataset pages. Written up in [`docs/charting.md`](charting.md). All three stories follow it, and the Keeling charts were ported over from hand-rolled SVG (`datapressr-8rk`).
>
> The longer investigation — a standard DataHub/Flowershow renders natively — is still open and still deferred: `datapressr-7fs`, post-v1.
>
> Leaving this open for that second track only. The near-term half is closed.

## #14 — [epic] Roadmap to DataPressr v1

**Stale because** it defines "v1 = steps 2, 3, 4 done" and marks steps 2, 3 and 4 as in progress. All three are done, and v1 was reviewed and recorded complete (`datapressr-blj`, closed; `datapressr-9up`, the v1 epic, closed).

**Proposed step-list replacement:**

> 1. ~~Prove `structure` in anger~~ — done (#8, co2-ppm); benchmarked twice ([`docs/structure-benchmark.md`](structure-benchmark.md)) — round 1 across three sources with eight fixes applied, round 2 across a JSON/REST API source and a relational multi-file join.
> 2. ~~Write 1–2 data stories by hand~~ — done, three of them: [Keeling Curve](https://github.com/datasets/datapressr/blob/main/site/stories/keeling-curve.md), [Planetary Boundaries](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries.md), [WTI Went Negative. Brent Didn't.](https://github.com/datasets/datapressr/blob/main/site/stories/oil-prices.md).
> 3. ~~Charting~~ — near-term decided: Observable Plot → static SVG for stories, `views` for dataset pages ([`docs/charting.md`](charting.md)). Native support remains deferred (#11).
> 4. ~~Write `enrich` + `story` skills~~ — both written and **active**, after real runs: `enrich` on two datasets, `story` on three stories, with an independent review gate on the outline.
> 5. ~~Ship the site~~ — done (#7; one follow-up open: fold `docs/` onto the site).
>
> **v1 = steps 2, 3, 4 done — reached 2026-09-18.** Recorded in `datapressr-9up` and `datapressr-blj` (both closed).
>
> ## Remaining, all outside v1
>
> - Author's voice pass on the three stories — human-only (#4, `datapressr-77e`).
> - Native chart support (#11, `datapressr-7fs`); skill evals (`datapressr-d6n`); `monitor` + unattended cloud execution (#6, `datapressr-46c`); data-level schema validation (`datapressr-ck8`); docs and changelog on the site (#13, `datapressr-5yq`).

**Whether to close #14** is the owner's call. The v1 gate it defines is met, so closing is defensible; keeping it open as the standing roadmap is equally defensible, given the post-v1 list. It should not stay open showing steps 2–4 as unfinished either way.

---

## Canonical Bead IDs referenced here

| Bead | What it is | Status at the time of writing |
|---|---|---|
| `datapressr-9up` | DataPressr v1 epic | closed |
| `datapressr-blj` | v1 acceptance review and completion record | closed |
| `datapressr-9qc` | Resolve draft questions and activate `story` + `enrich` | closed |
| `datapressr-tzh` | Planetary Boundaries story | closed |
| `datapressr-61n` | Project Drawdown relocation | closed |
| `datapressr-8rk` | Port Keeling charts to Observable Plot | closed |
| `datapressr-jh6` | Compare both Project Drawdown packages | closed |
| `datapressr-aw1` | Owner decision: Drawdown naming and publication | deferred, owner-only |
| `datapressr-77e` | Author voice pass | deferred, human-only |
| `datapressr-7fs` | Native DataHub/Flowershow chart support | deferred, post-v1 |
| `datapressr-5yq` | Publishing docs and changelog on the site | deferred, post-v1 |
| `datapressr-46c` | Monitor execution pilot | deferred, post-v1 |
| `datapressr-d6n` | Evals for prompt-only skills | deferred, post-v1 |
| `datapressr-ck8` | Data-level schema validation | deferred, post-v1 |

## Summary of proposed actions

| Issue | Action | Why |
|---|---|---|
| #3 Project Drawdown | Update, keep open | Wrangling done; publication decision is owner-facing and unresolved |
| #4 Planetary Boundaries | Update, keep open | Story drafted; human voice pass remains |
| #7 Site | Tick four boxes, keep open | Shipped; only the docs-on-site follow-up remains (verify the live URL first) |
| #10 `story` skill design | Update and **close** | The skill exists and is active |
| #11 Charting | Update, keep open | Near-term decided; native-support track still open |
| #13 Changelog on site | No change | Live question, nothing stale |
| #14 v1 roadmap epic | Rewrite the step list; **owner decides** whether to close | The v1 gate it defines is met |
| #2, #5, #6, #8, #9, #12 | No change here | #2 is covered by [`docs/inbox-triage.md`](inbox-triage.md); the rest are accurate |
