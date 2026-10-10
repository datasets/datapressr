---
title: "Story lab: teaching AI agents to write better data stories"
description: What we are trying to improve, how we measure it, and what the first rounds have shown.
date: 2026-10-10
---

# Story lab: getting better at data stories

*Status as of 10 October 2026. Work in progress; detailed write-ups are linked throughout.*

## The goal

DataPressr answers questions people actually ask ("Why is there a French debt crisis?", "Why did the Allies win the Second World War?") with a short data story: one argument, backed by charts and checked numbers, that says plainly what the data cannot show. Stories are the main output. Datasets follow: we build a full published dataset when a story we keep needs one.

AI agents write the stories by following the DataPressr [story skill](https://github.com/datasets/datapressr/tree/main/skills/story). Our first stories needed several rounds of human feedback; the French public finances story took three. The aim: given a real question, a fresh agent finds suitable data and writes a story we would publish after at most one round of edits, more reliably over time.

## What we optimise, in order

"Better" is a judgement, so we rank several measures. A cheap measure is trusted only as far as it agrees with the one above it.

1. **The owner's blind preference (headline).** Two stories on the same question, from two versions of the skill, labels hidden. The owner (Rufus Pollock, who edits what DataPressr publishes) says which he would publish with fewer edits, and why. His remarks are kept word for word; labels are revealed afterwards.
2. **Rounds of feedback to publishable.** France took three; the target is one or none.
3. **Critic findings and 0–2 scores (a cheap proxy).** A model from a different vendor to the writer (OpenAI's Codex critiquing Claude) lists what a reader would still ask, what the story missed and one fix per chart, and scores argument, depth, charts, honesty, reader questions and prose from 0 to 2. Its strongest tool is comparing two stories side by side, twice with the order swapped; a verdict counts only if both orders agree. Scores alone are not trusted: a critic can be consistent and still notice different things from a human reader. We track how often it agrees with the owner, and until it matches him on at least four pairs in five its verdicts guide attention but settle nothing.
4. **Deterministic checks (gates, not goals).** Free, automatic: all parts exist, the prose is within its word budget, every number in the prose is on a chart (or listed as an exception), charts rebuild identically from their script, inputs are untouched. Failing one is a defect; passing them all says nothing about quality.

**Constraint:** cost and time per run are recorded for every run, and should stay roughly flat while quality rises. The layers are never averaged into one number, because averaging would hide the disagreements we most need to see.

## How the loop works

```text
question
  → blind run    a fresh agent writes the story with one pinned skill version
  → checks       the automatic gates
  → critic       another vendor's model critiques and compares pairs
  → owner        blind preference and verbatim remarks
  → lessons      what went wrong, with evidence
  → skill edit   only for a lesson seen twice or flagged by the owner
  → re-test      on a different question, so we don't overfit one case
```

"Blind" means the agent works in an empty throwaway folder holding only the question, the input data, the skill and our data conventions: no access to our repository, published stories, reviews or settings. A cheap canary run proves this before each batch, and every run's actions are scanned afterwards for anything outside that folder. In open mode, where the agent finds its own data, it may use the web but not our own sites.

Details: [harness README](https://github.com/datasets/datapressr/blob/main/evals/README.md), [harness design](https://github.com/datasets/datapressr/blob/main/docs/plans/2026-10-09-story-harness.md), [practice proposal](https://github.com/datasets/datapressr/blob/main/docs/plans/2026-10-09-story-practice.md).

## Progress so far

Mostly one or two runs per result, so these are early signals, not findings.

- **Pilot: the loop works.** Two blind runs on the France question each produced an outline, three or four reproducible charts and about 600 words, unaided, in about six minutes and under 2 USD. Both made the same miss: government spending treated as one total, never broken down into pensions, health and so on, though the data had it.
- **Critic calibration: it misses what a human reader notices.** Tested on the published France story, the first critic caught 0 of the 5 remarks the owner made in his second round of feedback, which it had never seen. It graded the story it imagined (bond markets, politics) rather than one the data allowed, and praised a passage the owner found confusing. A revised critic fixes the scope problem and now prefers the draft the owner preferred, but its second-round test is no longer clean: its author had read those remarks.
- **Reference cases: professionals state the comparison.** Against professional pieces answering the same questions, our oil-prices and Keeling curve stories both lost, for one reason: the professional piece states the difference or ratio, ours gives two numbers and leaves the arithmetic to the reader. Seen twice, so it qualifies for a skill edit (not yet made).
- **France A/B: awaiting the owner's blind judgement.** We put ten owner-flagged France lessons into the skill (break down the biggest category, answer the reader's obvious questions, readable magnitudes, a proper colour key and more), then ran the France question blind twice before the edit and twice after. The critic has compared the pairs; we are not publishing its verdict until the owner has judged blind, since his judgement is the independent check on the critic. The 0–2 checklist cannot tell the two versions apart. The four runs cost 8.98 USD.
- **WWII: the first open-data run.** The agent found, downloaded and documented its own sources (Mark Harrison's wartime GDP and munitions tables, the Maddison Project via Our World in Data, Wikipedia's casualty ranges) in 15 minutes for 5.11 USD, recorded what it could not reach, and passed every automatic check. The critic said not publishable: partly for real defects (a chart legend that failed to draw, a comparison of differently defined country groups), partly for strategy questions the brief had ruled out. Some France lessons carried over to this new kind of question; two did not.
- **Side experiment: dataset wrangling.** The same harness ran the `structure` skill on NOAA's monthly CO2 file: three runs each with the skill, without it, and with another vendor's model. Every run built a valid, reproducible dataset, but the skill gave no measurable gain (7–11 of 13 checks with it, 8 every time without). Failures came from calls our conventions don't yet settle, such as how to write a monthly date or what licence to record when the source gives none; fixes are filed. [Write-up](https://github.com/datasets/datapressr/blob/main/docs/benchmarks/eval-structure-co2-round-1.md).

**Cost.** The story runs so far came to 17.31 USD for the writing agent, the structure experiment to 5.22 USD; a typical fixed-data story run is 1.5–2.5 USD and 5–10 minutes. These are list-price equivalents reported by the Claude command-line tool. We run on a subscription, so they are not billed amounts; they are for comparing runs. The critic runs on a Codex subscription that reports tokens, not money (about 2.1 million input tokens so far). Everything came in several times under our estimates.

Full account: [story round 1](https://github.com/datasets/datapressr/blob/main/docs/benchmarks/story-round-1.md) (it includes the critic's A/B verdict, so the owner should judge the pair first) and [lessons with evidence](https://github.com/datasets/datapressr/blob/main/evals/LESSONS.md).

## What's next

1. **Owner judges the France pair and reads the WWII story:** the first measure of critic–owner agreement, and fresh remarks to test the critic cleanly.
2. **Test transfer:** run the updated skill on questions the France lessons didn't come from, starting with oil prices, which has a professional reference.
3. **Next skill edit:** "when two numbers matter because of their difference or ratio, state it", tested on several questions.
4. **Better critic, tested only on remarks it hasn't seen:** notice what confuses a non-expert reader, and judge open-data stories against their brief.
5. **Harness fixes:** fail any chart with a broken value (the WWII legend), fewer false alarms from the isolation scan.
6. **Publish finished stories on DataHub** beside their datasets, starting with oil prices ([plan](https://github.com/datasets/datapressr/blob/main/docs/plans/2026-10-10-stories-on-datahub.md)).
