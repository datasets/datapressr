---
title: "Review: Story practice plan (2026-10-09)"
date: 2026-10-09
status: review
---

# Review: Story practice plan

Independent review of [`2026-10-09-story-practice.md`](2026-10-09-story-practice.md) as first drafted, against the owner's intent (stories first; skills that improve with practice; exemplars; a reference-free bootstrap loop; same approach for wrangling; France as case 1; decide rather than block; efficient and repeatable). Read alongside `skills/story/SKILL.md` and its references, the stories in `site/stories/`, the France feedback in `docs/reviews/france-public-finances-*.md`, `docs/plans/2026-09-25-research/quality.md` and `bd list --status=open`.

## Verdict

**Right direction, wrong order, too heavy. Revise before filing beads.** The two-track idea (bootstrap first, reference as a variant of the same case) is right, the copyright tiers are sensible, and the "two cases or an owner flag before a skill edit" guard is good. But Phase 0 spends a session building a seven-dimension rubric, an 18-question bank, a 12-part case layout and a pattern library before any practice, while the single richest signal we already have (the owner's verbatim France feedback) is not scheduled to reach the skill until S6, after reference packaging and owner scoring. The machinery is sized for a benchmark programme; what the owner asked for is a practice habit that changes the skill quickly. At 293 lines it also cannot be reviewed in ten minutes.

## Issues, ranked by severity

1. **The first skill edit comes too late; Phase 0 is process before practice.** The France feedback is owner-flagged, so it already meets the plan's own bar for a skill edit, yet it reaches `story-craft.md` only in S6 (after S1–S5). None of it is in the skill today: `story-craft.md` still has no "unpack the biggest category", "show what is growing in euros and as a share", "readable magnitudes", "reader questions" or colour/marker rule. Fix: Phase 0 step 1 is "put the France lessons into the skill", then test that edit blind.

2. **The critic is designed to score, and scoring is what already failed.** The France draft passed two independent AI reviews (outline APPROVED, prose APPROVED) and the owner still found it "not very deep or compelling", with the biggest category unexplained. Correctness-style review was not the bottleneck; reader questions and depth were. The one thing that surfaced the real gaps was the reader-question critique (`france-public-finances-reader-critique.md`). A 0–14 total on n=2 runs has no statistical power and invites optimising the number. Fix: make the critic generative first (reader questions and whether answered; the strongest finding the story missed; chart-by-chart one fix; the single change that matters most; at most five rule-shaped lessons), keep the rubric as a short checklist for trend-tracking only, and use the owner's blind pairwise preference plus "rounds to publishable" as the only headline measures. Also: the cheapest calibration test of the critic exists already. Run it blind on the France *first* draft (`site/stories/france-public-finances.md` + outline at `4932b28`) and see whether it finds what the owner found.

3. **No clean before/after.** Run 0 is the Codex v3 story, i.e. after three rounds of owner feedback, so it is not a baseline for "did the skill edit help". The plan's S2 runs the *current* skill, so its later comparison mixes skill change with run noise. Fix: one blind Q1 run on the pre-edit skill and one on the post-edit skill, compared blind by the owner. Anecdotal (n=1 each) but a real A/B, cheap, and the format for every later edit.

4. **Train-on-test.** Lessons from Q1 are confirmed by re-running Q1, which mostly tests whether the skill memorised France. Fix: every skill edit is also tested on a question it did not come from (the bootstrap question). The Eurostat hold-out (Q10) needs a new wrangle before it can be used at all; defer it until there are enough cases for a hold-out to mean something.

5. **Case format too heavy for frequent practice.** Per case: `case.md`, `input/DATASETS.md`, `input/context/` with hashes, `reference/{REFERENCE,key-findings,chart-inventory,full-text}.md`, `feedback/`, `outcome/`, `runs/`, `critiques/` (critic and owner files), per-case `lessons.md`, plus a cross-case `LESSONS.md`, a `CHANGELOG.md`, `metrics.json` with a SHA-256 skill hash, and `patterns/<shape>.md` recipes. Most of it serves a runner that does not exist yet. Fix: one `case.md` (question, type, data mode, `as_of`, reference links and key findings inline), `runs/<id>/` holding artefacts plus `critique.md` and an optional `owner.md`, and one `LESSONS.md` per skill. Skill version = commit SHA in the run id. Git history replaces `CHANGELOG.md`. Full-text copies of references are dropped (link + archive link + our key findings; the critic has the network).

6. **Question → data is tested but has nowhere to land, and practice runs would force full wrangling.** The skill under test is said to be question → data → story, but `skills/story/` assumes finished datasets, and every open-mode run would otherwise need a `structured` dataset (archive, build script, adversarial review) before a single chart. That makes bootstrap runs slow and expensive and inverts "datasets follow from stories". Fix: in practice runs the writer may snapshot what it needs into `<slug>-src/` with `PROVENANCE.md` (already allowed by the skill) and write `DATA.md`; a proper dataset is wrangled only for stories we keep. Discovery lessons go to `LESSONS.md` and feed the existing decision `8no.6` (a thin `discover` skill), not a new skill.

7. **The owner's example questions are pushed to the back.** The owner's own open questions (WWII, Ukraine, Nvidia, El Niño) are "first-class", but Phase 0 picks Q2 (the plan's own "climate change") and the owner's questions wait for the runner in Phase 2 or are "not filed now". Fix: the first bootstrap run uses an owner question. Recommended: "Why did the Allies win the Second World War?" (stable, no `as_of` leakage, hard discovery, tests honesty about contested numbers). Nvidia and Ukraine need a fixed `as_of` and snapshots; El Niño needs a 12-month wait. The 18-row bank shrinks to the owner's questions plus the cheap existing-story cases.

8. **Too many beads, too early, some duplicating 8no.** Fifteen beads across four phases; S8 builds a runner before three manual runs have shown what is repetitive (and duplicates `8no.2`); S15 is only a note; S13/S14 are speculative. Fix: file Phase 0–1 only (about six beads), build the runner only after three manual runs (rule of three), fold the 8no notes into the scaffold bead.

9. **The Q1 professional reference does not answer Q1.** Insee Première n° 2106 is an annual accounts bulletin; it does not argue "why is there a French debt crisis". Pairwise comparison against a piece answering a different question measures the wrong thing. Fix: pairwise only when the reference answers the same question; otherwise use the reference as a key-findings checklist. For Q1 the owner's feedback is the real reference. The EIA (Q7) and Climate.gov (Q8) pieces do answer the same questions as our existing stories, which makes them the cheap first reference cases.

10. **Pattern library seeded from sources we cannot fetch, before we know what is needed.** Ten entries including Guardian (not fetchable from here) and Burn-Murdoch X posts (not fetchable), with no link to observed gaps. The owner does want exemplars, so keep it, but seed five entries chosen for gaps the critiques actually found (composition vs change, readable magnitudes, annotated lines, the periodic-release spine), and add an entry whenever a lesson needs one. Owner may hand-add Guardian/FT/McCandless examples.

11. **Costs understated, owner time unstated per week.** "Two runs incl. one open-mode discovery run under 15 USD" is optimistic for an Opus run that spawns its own outline reviewer, builds charts and finds data. Fix: cap per run (20 USD fixed, 30 USD open), estimate Phase 0 at roughly 30–70 USD, and replace estimates with recorded actuals after the first run. State owner time as about 20–30 minutes per practice batch.

12. **Wrangling parallel is only "shared machinery".** The owner wants the same practice approach for wrangling. Fix: one paragraph saying the case/critique/`LESSONS.md` shape is skill-agnostic and `8no.2`/`8no.3` are the wrangling instance; `8no.4` adopts the critic prompt shape. No new beads.

Smaller points: the forecast track (scored months later) should be deferred, not designed now; `as_of` leakage checks matter only for current-state questions and can stay a one-line rule; the "every production story is a case" habit (7q5.4, 7q5.5, any story the owner comments on gets verbatim feedback captured) is the cheapest source of references and should be explicit.

## Reference spot-checks (2026-10-09)

- **INSEE Insee Première n° 2106**, <https://www.insee.fr/fr/statistiques/8997691>: title "Le compte des administrations publiques en 2025", 29 May 2026, `ip2106.xlsx` attached. Confirmed. Licence not rechecked (plan says Etalab 2.0 verified).
- **Eurostat**: the plan's legal-notice URL 404s, but <https://ec.europa.eu/eurostat/web/main/help/copyright-notice> confirms editorial content is CC BY 4.0 and data reuse is authorised with source acknowledgement (some third-party/non-commercial exceptions). The "verify" flag can be cleared with this URL.
- **EIA**, <https://www.eia.gov/about/copyrights_reuse.php>: "U.S. government publications are in the public domain"; third-party images and the EIA logo excepted. Confirmed.

## Resolution

How each issue was handled in the revised plan:

1. Changed. Phase 0 step 1 (bead P1) puts the owner-flagged France lessons and a reader-questions pass into the skill before any run.
2. Changed. Critic is generative first; rubric reduced to a six-item checklist; headline measures are the owner's blind pairwise preference and rounds to publishable. Critic calibration on the France first draft added to P2.
3. Changed. P3 is a blind A/B on Q1: pre-edit vs post-edit skill, owner compares unlabelled.
4. Changed. Every edit is also tested on a question it did not come from; hold-out deferred.
5. Changed. Case format cut to `case.md` + `runs/<id>/` + one `LESSONS.md`; no `CHANGELOG.md`, `metrics.json` reduced to a few fields, no full-text copies.
6. Changed. Practice runs snapshot data into `<slug>-src/` and write `DATA.md`; wrangle only stories we keep; discovery lessons feed `8no.6`.
7. Changed. First bootstrap question is the owner's WWII question; bank cut to owner questions plus cheap existing-story cases.
8. Changed. Six beads filed for Phase 0–1; runner after three manual runs; 8no notes folded into P2.
9. Changed. Pairwise only when the reference answers the same question; Q1's reference is the owner's feedback; Q7/Q8 are the first reference cases.
10. Changed (partly). Pattern library kept (owner wants exemplars) but seeded with five gap-driven entries after the first critiques; owner may hand-add paywalled/unfetchable examples.
11. Changed. Per-run caps raised, Phase 0 estimate 30–70 USD, actuals replace estimates; owner time stated.
12. Changed. One paragraph on wrangling; no new beads.
Smaller points: forecasts deferred (open question 5); production-story feedback capture made explicit in P1; `as_of` kept as a one-line rule.
