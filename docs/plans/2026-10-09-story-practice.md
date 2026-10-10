---
title: "Story practice: a compounding loop for better data stories"
date: 2026-10-09
status: proposal (revised after review, see 2026-10-09-story-practice-review.md; the case format, runner and beads in sections 3, 7 and 8 are superseded by 2026-10-09-story-harness.md)
---

# Story practice — 2026-10-09

## TL;DR

- **What:** a practice habit, not a benchmark programme. We take real questions ("Why is there a French debt crisis?", "Why did the Allies win WWII?"), have the story skill answer them blind, have a separate model critique the result, and turn repeated lessons into short edits to `skills/story/`. A small, growing set of exemplars (best-in-class published pieces) sits alongside.
- **The loop:** question → blind story run → critic (what would a reader ask, what did the story miss, one fix per chart) → lessons → skill edit → test the edit on a *different* question. References (owner feedback, or a published piece answering the same question) sharpen the critique when we have them; the loop works without them.
- **First, cheaply:** put the owner's France feedback into the skill now (it is owner-flagged; nothing of it is in the skill yet), check whether the critic would have caught what the owner caught, then run France blind on the old and new skill and let the owner pick the better one without labels. Then one fresh owner question (WWII) on the new skill.
- **Measure that matters:** the owner's blind preference and "rounds of feedback to publishable" (France took three). Critic scores are a cheap proxy, not the goal.
- **Cost:** Phase 0 is about 3–4 agent runs plus critiques, roughly 30–70 USD (caps 20 USD per fixed-data run, 30 USD per open run; actuals recorded and estimates replaced after run 1). About two sessions of agent work.
- **From the owner:** about 20–30 minutes per practice batch: pick or approve questions, compare two unlabelled stories, and give verbatim remarks (which are the richest signal we get). Plus answers to the five open questions at the end; each has a recommended default we will use unless told otherwise.
- **Not now:** a scripted runner (after three manual runs), forecast questions (scored a year later), a hold-out benchmark, an 18-question bank.

## 1. Goal and measures

Given a question a person actually asks, a fresh agent finds suitable data and writes a story the owner would publish after at most one round of edits, and does so more reliably over time. The skill under test is question → data → story.

| Measure | How | Role |
|---|---|---|
| Owner blind preference | Two stories on the same question, labels hidden; owner picks and says why | Headline |
| Rounds to publishable | Owner feedback rounds before "publish" | Headline (France: 3; target ≤1) |
| Critic findings | Reader questions unanswered, missed findings, chart fixes | Drives lessons |
| Checklist score | Six items, 0–2 each (section 4) | Trend only, never a target |
| Cost, time, turns | From `claude -p --output-format json` | Kept flat while quality rises |

Single runs are anecdotes; we accept that while the loop is small and say so in reports.

## 2. The loop

```
question → blind run → critic → owner (sometimes) → LESSONS.md → skill edit (if seen twice or owner-flagged) → re-test on a different question
```

- **Bootstrap track (default).** Needs only a question. The critic's "what a better story would contain" list for run N becomes the checklist for run N+1.
- **Reference track (when available).** Same case plus a reference: the owner's feedback on our own story, or a published piece that answers *the same question*. Pairwise comparison only in that second case; otherwise the reference is a key-findings checklist.
- **Every production story is a case.** Whenever the owner comments on a story (France, `7q5.4`, `7q5.5`), the remarks are kept verbatim in `docs/reviews/<slug>-user-feedback.md`, as was done for France. This is the cheapest and best reference we have.
- **Lessons become edits only with two sources or an owner flag** (overfitting guard). Edits land in `skills/story/references/story-craft.md` (craft), `SKILL.md` (workflow), `references/charting.md` (chart rules) or `references/pattern-library.md` (an exemplar). Prefer one-line rules and deletions; the skill must stay short. The commit message cites the run(s).
- **Datasets follow stories.** In practice runs the writer may snapshot what it needs into `<slug>-src/` with `PROVENANCE.md` and write a short `DATA.md` (what it searched, chose, licence, vintage). A full `structured` dataset is wrangled only for stories we keep. Discovery lessons feed the existing decision on a `discover` skill (`8no.6`).

## 3. Case format (minimal)

*Superseded 2026-10-09 by [the harness design](2026-10-09-story-harness.md) sections 2–4, which make the case, run and critique machine-readable and stage blind runs with a script. The loop, the critic shape (section 4) and the question bank (section 5) stand.*

```
evals/stories/
  README.md          how to stage a blind run by hand; critic prompt; checklist
  QUESTIONS.md       the question bank with status
  LESSONS.md         lessons with evidence links; "seen once" / "seen twice" / "in skill (commit)"
  q01-french-debt/
    case.md          question, type, data mode, as_of, word budget, inputs (dataset + commit), references (links + key findings)
    runs/<date>-<model>-<skill-sha7>/
      outline.md, *.svg, story.md, DATA.md (open mode)
      run.json       model, skill sha, cost, duration, turns, network on/off
      critique.md    critic output
      owner.md       optional: owner preference and verbatim remarks
```

`evals/` sits at the repo root (as `quality.md` decided) so installed skills never ship fixtures. Transcripts are not committed. References are stored as link + archive.org link + our key findings; no full-text copies.

**Blind run, by hand until a runner exists:** fresh temp directory with `git init`; copy `case.md` and inputs; copy the chosen version of `skills/story/` (plus `archive`, `structure` for open mode) into `.claude/skills/`; never copy `runs/`, references or `LESSONS.md`. Fixed-data cases run with the network off; open cases with it on, the reference domain denied, and a grep of the transcript for the reference title and URL afterwards. Run with `claude -p "$(cat case.md)" --output-format json --model M --max-turns 100`. The skill's own outline review is part of the run. Current-state questions fix `as_of` and the critic flags anything dated later. Training-data exposure to references cannot be prevented; comparisons are relative (old vs new skill), so a constant advantage cancels.

## 4. The critic

A different model from the writer (see open question 2). It never sees `skills/story/`, so editing the skill does not edit the judge. It gets the question, the run and any reference. It returns one markdown file:

1. **Reader questions:** the five to eight questions a curious reader brings to this question, each answered / partly / not, with where.
2. **What a better story would contain:** the strongest finding or angle missed, numbered.
3. **Chart by chart:** what it is trying to show, whether the form fits, one concrete fix.
4. **The one change that matters most**, and "would you publish this?".
5. **Lessons:** at most five, phrased as rules a skill could carry, each tied to an artefact.
6. **Checklist (0–2):** argument, depth/insight, charts, honesty (units, denominators, attributed causes, counter-evidence), reader questions answered, prose. Plus data choice in open mode. Anchors use France examples. Changes to the checklist need owner sign-off.

Items 1–5 are the point; item 6 is for trend lines. The critic is calibrated first on the France *first* draft (`site/stories/france-public-finances.md` and outline as of commit `4932b28`), blind to the owner's feedback: if it does not find roughly what the owner found (social protection unexplained, unreadable magnitudes, nominal vs share confusion, wordiness, shallow), the prompt is fixed before anything else relies on it.

## 5. Questions

Owner questions first; existing stories second because they are free.

| # | Question | Type | Data mode | Why now |
|---|---|---|---|---|
| Q1 | Why is there a French debt crisis? | explanatory | fixed (`france-public-finances` at `fddb127`) | Case 1; owner feedback is the reference |
| Q2 | Why did the Allies win the Second World War? | historical | open | First bootstrap question: stable, no `as_of`, hard discovery, contested numbers |
| Q3 | Why did WTI go negative in April 2020? | explanatory | fixed (`oil-prices`) | Existing story; EIA *Today in Energy* 27 Apr 2020 answers the same question (public domain, verified) |
| Q4 | Is CO₂ still rising, and is it speeding up? | current-state | fixed (`co2-ppm`) | Existing story; NOAA Climate.gov CO₂ page (US government work; confirm notice) |
| Q5 | What's happening with Nvidia's stock, and why? | markets | open, `as_of` fixed | Tests the attributed-"why" rule |
| Q6 | Is Ukraine winning or losing? | current-state, contested | open, `as_of` fixed | Tests partisan sources and uncertainty |
| Q7 | What has happened to hiring of junior software developers? | current-state | open | Already `datapressr-t5s` |
| Q8 | How much did the UK borrow last month, and why? | periodic | fixed (ONS CSVs, OGL) | The repeatable monthly-bulletin shape |
| — | What will happen with El Niño next year? / Will the Fed cut? | forecast | open | Deferred: needs a dated outcome months later |

Type rules the critic applies: "why" claims must be attributed to a named source and the story must say what the data does not test; current-state stories fix `as_of`; historical stories name what each number measures and show disagreement; market stories attribute and date each explanation and note that several explanations fit one chart.

## 6. Exemplars

Two uses. **Benchmark references** must answer the same question and be open enough to read: EIA (public domain, verified), NOAA Climate.gov, ONS (OGL v3), INSEE (Etalab 2.0; Insee Première n° 2106 verified, but it is an accounts bulletin, not an answer to Q1), Eurostat (CC BY 4.0, verified at <https://ec.europa.eu/eurostat/web/main/help/copyright-notice>), OWID (CC BY 4.0). **Pattern library** (`skills/story/references/pattern-library.md`, ships with the skill): exemplary charts and moves with a link, one line on what it shows, one on why it works, when to use it. Licence does not matter for a link and our note. Sources: Guardian Datablog (Rogers era), Information is Beautiful, John Burn-Murdoch's public posts, OWID, ONS bulletins, FiveThirtyEight, The Pudding. Seeded with five entries chosen for gaps the first critiques found (composition vs change over time, readable magnitudes, annotated lines with direct labels, the periodic-release spine), then grown one entry per lesson that needs an example. Organised by story shape, kept under 300 lines. The owner can hand-add examples we cannot fetch (Guardian, FT, X posts).

## 7. Wrangling uses the same shape

*Superseded 2026-10-09: the harness design, section 9, proposes which `8no` beads to re-parent, amend or supersede so one runner serves both domains.*

The case / critique / `LESSONS.md` shape is skill-agnostic. The wrangling instance is already planned in epic `datapressr-8no` (`8no.2` harness, `8no.3` comparison, `8no.4` judged rubric). `8no.4` should adopt the critic structure in section 4 (generative findings first, checklist second). A scripted runner is built once, by whichever of `8no.2` or story practice needs it first, and only after three manual runs show what is repetitive. No new wrangling beads here.

## 8. Beads to file now (Phase 0–1)

*Superseded 2026-10-09 by the bead breakdown in [the harness design](2026-10-09-story-harness.md) section 12 and [`2026-10-09-story-harness-beads.json`](2026-10-09-story-harness-beads.json). P1 below survives as bead H9 (`datapressr-hcn.10`); P2–P5 are absorbed into the harness beads (epic `datapressr-hcn`); P6 (pattern library, France decision) is out of the harness scope.*

New epic: **Story practice: blind runs, critique and lessons** (P2, labels `quality, evals, story`).

**P1. Put the France lessons into the skill.** From `docs/reviews/france-public-finances-user-feedback.md` and the reader critique: unpack the biggest category; separate mix from change and show euros and GDP share together, naming the denominator; readable magnitudes (€1.7tn); equal markers with real colour keys; define source labels in plain words; answer "why" with attributed evidence, not a limitation; simple graphics over prose for simple comparisons; cut wordiness. Add a **reader-questions pass** to `SKILL.md` step 2 (the outline review checked correctness and missed depth) and a line that owner remarks on any story are kept verbatim in `docs/reviews/<slug>-user-feedback.md`. Sync `site/docs/story-craft.md`. *Acceptance:* each edit cites the feedback; SKILL.md grows by at most a few lines; `npm test` green. P2, `review-after`. Deps: none.

**P2. Scaffold `evals/stories/` and calibrate the critic.** `README.md` (case format, manual blind checklist, critic prompt, checklist anchors), `QUESTIONS.md`, `LESSONS.md` seeded from P1, `q01-french-debt/case.md`. Run the critic blind on the France first draft and compare with the owner's feedback; fix the prompt if it misses the owner's main points. Add notes on `8no.2` and `8no.4` pointing here. *Acceptance:* files exist; calibration result recorded in `LESSONS.md`; critic cost noted. P2. Deps: none (parallel with P1). Cost: a few USD.

**P3. Q1 blind A/B: old skill vs new skill.** One blind run on the pre-P1 skill and one on the post-P1 skill, fixed data, network off; critic both. **Human:** owner reads both unlabelled, picks one, gives remarks (15 minutes) → `owner.md`. *Acceptance:* two runs with `run.json` and `critique.md`; owner preference recorded; lessons added. P2. Deps: P1, P2. Cap 20 USD per run.

**P4. First bootstrap question: Q2 (Allies, WWII), open mode, on the new skill.** Data via `<slug>-src/` snapshots and `DATA.md`; critic; lessons. This is also the "different question" test of P1's edits. **Human (optional):** owner remarks. *Acceptance:* run, critique, `DATA.md`, transcript leakage grep logged, lessons tagged seen once/twice. P2. Deps: P1, P2. Cap 30 USD.

**P5. Reference cases from existing stories: Q3 (EIA) and Q4 (Climate.gov).** Write `case.md` with the reference link and key findings; existing story as run 0; critic with pairwise. No new writing. *Acceptance:* two critiques; lessons appended. P3. Deps: P2. Cost: a few USD.

**P6. Promote lessons, seed the pattern library, decide the France story.** Lessons seen twice or owner-flagged go into the skill; five pattern-library entries for the gaps found; if the owner preferred the new blind France run in P3, it replaces the published story after a voice pass (old version stays in git); update `datapressr-sy2`. *Acceptance:* each skill edit cites two sources or an owner flag; `pattern-library.md` linked from `SKILL.md`; decision noted in `sy2`. P2, `review-after`. Deps: P3, P4, P5. **Human:** confirm the France decision.

**Later, not filed:** runner (`story` case type, after three manual runs; coordinate with `8no.2`); Q5–Q8 one per batch; the monthly-bulletin pattern from Q8; forecasts; a hold-out case (Eurostat COFOG) once there are about ten cases; a Codex writer arm.

## 9. Open questions (with the default we will use)

1. **First bootstrap question.** Recommended: "Why did the Allies win the Second World War?" (stable, no date leakage, hard data discovery). Alternatives: Nvidia or Ukraine with a fixed `as_of`.
2. **Critic vendor.** Recommended: a different vendor (Codex/GPT) when available, otherwise a different Claude model; never the writer's model with the skill loaded.
3. **France story.** Recommended: if you prefer the new blind run in P3, it replaces the published story after your voice pass; otherwise keep the current one and voice-pass it.
4. **Practice-run data.** Recommended: practice runs use snapshots in `<slug>-src/`; we wrangle a proper dataset only for stories we keep.
5. **Forecast questions** (El Niño, Fed). Recommended: defer until the loop has run on four or five other cases; they score only months later.

Decided without asking (reversible): `evals/stories/` at the repo root; network off for fixed-data cases, on with the reference denied for open ones; references stored as links plus our notes, no full-text copies; practice runs are not published on the site unless kept.
