---
title: "Review: Story and skill improvement harness (2026-10-09)"
date: 2026-10-09
status: review (folded into the design and bead file the same day; see Resolution)
---

# Review: story and skill improvement harness

Independent review of [`2026-10-09-story-harness.md`](2026-10-09-story-harness.md) and [`2026-10-09-story-harness-beads.json`](2026-10-09-story-harness-beads.json) as first drafted (one epic, 22 beads), against the owner's steer: the deliverable is the infrastructure (cases, blind isolated runs, scoring, a critic on a different vendor with automatic fallback, history and regressions, and a harness that improves itself), one pilot run end to end, stories that are data-driven, plain Node, minimal dependencies, files in git. Read alongside the [story practice plan](2026-10-09-story-practice.md) and [its review](2026-10-09-story-practice-review.md), `skills/story/`, `docs/plans/2026-09-25-research/quality.md`, `docs/reviews/france-public-finances-*.md` and `bd show datapressr-8no` with its children. The isolation claims were tested against the installed CLIs (Claude Code 2.1.295, codex-cli 0.161.0) with four Haiku probe runs costing under 0.02 USD in total.

## Verdict

**Right architecture, built in the wrong order, too big for v0, and its two load-bearing claims are not true as written.** One runner for stories and wrangling, an append-only ledger, a findings-first critic on a different vendor, judge–owner agreement as the harness's own metric and re-scoring history on a rubric change are all the right ideas, and the data model is mostly sound. But: (1) the blind-run recipe as specified does **not** isolate the writer: with the design's flags a run in a temp dir could read the parent repository (published stories, owner feedback, prior runs) and reach the network in "network off" mode; (2) the measurement logic cannot tell us whether we are improving at the sample sizes we will have, because it compares absolute critic totals against a noise floor estimated from three runs on one case; (3) the pilot sits behind six beads of infrastructure, several of which (price tables, daily caps, sealed-mapping owner CLI, a markdown-parsing lessons guard, twelve checks, `add-from-story`) are not needed to learn anything yet. Fix the isolation recipe with a measured canary, make blind pairwise comparison the primary signal, and cut to a walking skeleton that reaches a real pilot in four beads.

## Issues, ranked by severity

### 1. Blind isolation is claimed but not real (verified)

The design says `--setting-sources project` plus a staged allowlist workspace makes the run blind and that a staged sandbox with an empty allowed-domain list makes fixed mode offline. Probes run in a fresh `mktemp -d` git repo:

| Probe (Claude Code 2.1.295) | Result |
|---|---|
| `--setting-sources project`: user `CLAUDE.md`, auto-memory content, user plugins (superpowers) | Did **not** reach the run. Good. |
| Same flags: skills listed | The staged skill **plus built-in bundled skills** (`dataviz`, `init`, `code-review`, `simplify`, …). `dataviz` is a charting skill: it would silently co-author every story's charts and change with the CLI version. `--disable-slash-commands` removed all of them. |
| Read tool on `/Users/rgrp/src/datasets/datapressr/AGENTS.md` | **Succeeded.** Nothing stops a writer that searches the disk for "france public finances" from finding the published story, the owner's feedback or `evals/runs/`. A `permissions.deny` rule `Read(//Users/rgrp/src/**)` blocked it, even under `bypassPermissions`; `sandbox.filesystem.denyRead` blocked `head` from Bash. |
| `curl https://example.com` with sandbox on, `allowedDomains: []`, `--permission-mode bypassPermissions` (the design's recipe) | **Returned 200.** "Network off" is not enforced. The same settings with `--permission-mode dontAsk` blocked it (`deny network-outbound example.com:443`). Node `fetch` failed DNS in both cases, so a `no-net.mjs` preload alone tests the wrong path. |
| `permissions.allow` in a staged `.claude/settings.json` | **Ignored** ("this workspace has not been trusted"); deny rules still applied. Allowed tools must come from `--allowedTools`, not the staged file. |

Codex is leakier. `codex exec --sandbox workspace-write` reads the whole disk; user skills live in `~/.agents/skills` (superpowers and `humanizer` are installed there, so a Codex writer would get a prose-rewriting skill the Claude writer does not), Codex memories in `~/.codex/memories_1.sqlite`, and defaults in `~/.codex/config.toml`. `--ignore-user-config` skips only `config.toml`.

**Fix.** Treat isolation as a measured property, not a configuration claim: a `canary` command runs a cheap probe (Haiku / smallest Codex model, about 0.01 USD) through the exact writer recipe and asserts that the parent repo, `~/.claude`, `~/.codex` and `~/.config/gh` are unreadable, the skills listing is empty, and (fixed mode) `curl` and `fetch` fail. `run` refuses unless a canary passed for the current CLI version and recipe hash. Claude recipe: `--setting-sources project --disable-slash-commands --permission-mode dontAsk --allowedTools …` plus deny rules and the sandbox via `--settings <file>` with `allowUnsandboxedCommands: false`; the skill is staged as plain files and the prompt says to read it (vendor-neutral, and identical for Claude and Codex). Codex recipe: `HOME` and `CODEX_HOME` pointed at a per-run temp home holding only a copy of `auth.json`, `--ignore-user-config --ephemeral -m <model>`. Both: a post-run transcript scan for any absolute path outside the workspace, flagged `leaked`. Disk reads under Codex can only be detected, not prevented; say so.

### 2. The measurement cannot answer "are we getting better" at this N

- **Absolute totals are the wrong primary signal.** Seven 0–2 dimensions summed give integer totals that tie often and sit near a lenient ceiling (the France draft passed two AI reviews). LLM judges are far more reliable comparing two outputs than scoring one. The design uses pairwise only for references and for `critic_agrees`, which it then computes from absolute totals, where ties make agreement undefined.
- **The noise floor is not sound.** Three repeats on one case give a max−min that is itself very noisy, and the design applies it to every case and every later comparison. "Newer mean below previous mean by more than the noise floor" with n=1 per version will fire or stay silent by chance. Standard deviation at n=3 adds false precision.
- **Writer noise and critic noise are confounded** until H14's optional sub-step.
- **Calibration is circular.** H5 writes the rubric anchors from the France first draft and its feedback; H6 then "calibrates" on the same draft against the same feedback and revises until four of five points are hit. That measures whether the agent copied the feedback into the prompt.

**Fix.** Primary signal: blind pairwise critic judgements between old-skill and new-skill outputs on the same case, each pair judged in both orders, counted as a win only when both orders agree (otherwise a tie). Report win/tie/loss counts with n and no p-values. Absolute 0–2 scores stay as diagnostics, reported as values with n and range. A score difference is called a change only if the ranges do not overlap; otherwise "no detectable change". Hard regressions come from deterministic checks only. Measure critic noise directly (re-score one run three times, cheap) and writer noise from two runs per arm, folded into the A/B bead rather than a separate 30–60 USD bead. Calibration uses a held-out split: anchors from the owner's round-1 feedback, tested on the second draft (`cb2080d`) against the round-2 remarks the rubric author did not use.

### 3. The pilot comes too late and Phase 0 is over-built

The pilot (H11) depends on H2, H4, H5, H7 and H8, and H5 depends on H2; realistically six beads of plumbing before anyone sees a blind story and its critique. Meanwhile scoring is decoupled from running by design (artefacts are committed and `score` re-runs on them), so the pilot does not need the checker, the full report or calibration first: they can all be applied retroactively. Over-built for v0:

- **Twelve deterministic checks.** S2 (heading heuristics), S6 (annotation heuristic) and S7 (causal-word scan) are brittle proxies for things the critic judges better; S10 and S11 duplicate run flags; S8 tests site publishing rules that do not apply in a scratch workspace. Keep six that test the skill's own contract.
- **Codex price table, cost estimates, batch and daily caps checked against the ledger.** Codex runs here on a subscription; record tokens, not invented dollars. The CLI's `--max-budget-usd` and a `--repeat × cap` check cover the real risk.
- **Sealed-mapping interactive `owner` CLI.** The owner gives remarks in chat to an agent, not at a terminal prompt. Write `A/` and `B/` folders and a gitignored mapping; the agent records the verbatim reply with one command.
- **`case add-from-story`.** Four hand-written cases first; build the command when hand-writing repeats (rule of three, as the practice review said).
- **`LESSONS.md` parser and `npm test` guard; critic lessons auto-appended.** A markdown-parsing test that fails the build is maintenance with little payoff, and auto-appending every critique's five lessons buries the useful ones. The report can list skill commits that have no A/B on record, from the ledger, which is the guard that matters.
- **`VERSION` semver, `ledger_version`, `report --diff`, `meta/` directory.** A `schema` integer per row and a `git log` link per skill change are enough; meta-reviews can live in the rubric's change log.
- **Separate selftest bead with planted-flaw stories.** Deterministic saboteurs belong in the checker's tests; one deliberately weak story as a critic negative control belongs in calibration.

### 4. The critic will not catch what the owner catches as specified

The owner's remarks on France were about depth (social protection unexplained), reader questions, readability of magnitudes, simple graphics, wordiness, and in round 2 visual problems: blue/green colours, hollow vs filled markers, and a share-of-GDP chart that contradicted "growing". The design gives the critic SVG source and extracted text labels, which cannot show colour, marker or legibility problems. It also asks for reader questions after the critic has read the story, which anchors them on what the story already answers. **Fix:** the critic writes the reader's questions from the case question alone before it sees the story, then checks them; it receives rendered PNGs of the charts when the calibration shows visual remarks are missed (the round-2 remarks are a ready test); and its pairwise mode asks "which would the commissioning reader publish with fewer edits, and why". Rubric anchors stay generic, with France as held-out evidence.

### 5. Wrong commit pins (verified)

`4932b28`, `fddb127` and `69eb737` are not ancestors of `main`; they are pre-rebase copies that will be garbage-collected and are absent from `origin`, so `git archive` will fail on any other clone. The equivalents on `main` are `f0082af` (data guard), `a153036` (outline), `844796a` (four charts), `cbddc11` (first draft). The second draft that received the round-2 remarks is `cb2080d`.

### 6. Chart builds cannot run offline in the workspace

Story charts need `@observablehq/plot` and `jsdom` from `site/stories/package.json`. A fixed-mode workspace with the network off cannot `npm install`, so every fixed run would fail or burn turns. **Fix:** staging provides a `node_modules` built once per lockfile hash with `npm ci` into a cache outside the denied paths, linked read-only into the workspace's `site/stories/`. The case prompt must also tell the writer which skill steps to skip in a scratch repo (site index links, DataHub, the human voice pass), or runs waste turns on them.

### 7. Bead problems

- **No bead applies the section 9 changes to `8no`**; it says "proposals only". Add one, first, P1, cheap. Prefer amending `8no.2`–`8no.5` in place (they keep their ids, history and parent) over creating parallel H20/H21 beads and closing the originals: the wrangling domain stays owned by the wrangling epic, built on this harness.
- **H12 (skill edit) depends on H6 (calibration) for no reason.** The A/B only needs the pre- and post-edit commits; the edit can land any time and the pilot can use `--skill-ref` for the old tree.
- **H13 and H14 should be one bead.** Two runs per arm give the A/B and the writer noise together; the pilot is one pre-edit run already.
- **The practice plan's P6 (pattern library seeding, France story decision) is not absorbed** despite the claim. It belongs to the practice loop, not the harness; say so and leave it out of this epic.
- **H22 bundles a paid run, docs, an AGENTS pointer and a changelog**; fine as one session, but its paid regression run duplicates work and depends on H14/H18 for no structural reason.
- Labels: `paid` is useful; `human` beads should carry the owner's time estimate in the title, which H17 does.

### 8. Risks not addressed

- **Model alias drift.** `--model opus` resolves to whatever is current; a "skill improvement" can be a model upgrade. Pin full model IDs in `config.json`, and segment the report by `model_actual` (the CLI result JSON reports it in `modelUsage`).
- **Cost on a subscription.** `total_cost_usd` is a list-price notional figure; caps still work, but "cost" means notional.
- **Maintenance burden.** Each CLI upgrade can change isolation behaviour; the canary keyed to the CLI version catches this cheaply. Without it the harness silently degrades.
- **Repository growth.** Committed runs are small (Markdown and Plot SVGs); fine at the design's 50 MB revisit point.

## Concrete changes

1. Add the isolation canary and the verified Claude/Codex recipes (section 4.3 of the revised design); `run` refuses without a passing canary for the current CLI version.
2. Make blind, order-swapped pairwise critique the primary comparison; keep absolute scores as diagnostics; replace the noise-floor statistics with ranges, non-overlap and win/tie/loss counts; hard regressions only from deterministic checks.
3. Reorder to a walking skeleton: skeleton → isolation and Claude adapter → Codex adapter and vendor choice → critic v1 → pilot, with checks, report, skill edit and calibration in parallel.
4. Cut S2, S6, S7, S8, S10, S11; the price table; daily caps; sealed interactive owner CLI; `add-from-story`; the lessons parser and guard; `VERSION`; `report --diff`; the separate selftest bead.
5. Calibrate on a held-out split (round-1 anchors, round-2 test on `cb2080d`) plus one deliberately weak story as a negative control; reader questions written before reading; PNG renders if visual remarks are missed.
6. Fix the commit pins; stage chart dependencies; tell the writer which steps to skip.
7. Add a first bead that amends `8no` in place; merge H13/H14; drop H12→H6; keep P6 out of scope.
8. Pin full model IDs; segment by `model_actual`.

## Resolution

1. Isolation not real → **Changed.** Section 4.3 records the probe results and the two recipes; bead H2 builds staging, the Claude recipe and the canary; H3 the Codex recipe with a temp `HOME`; `run` refuses without a passing canary; transcript scan flags out-of-workspace paths.
2. Measurement at small N → **Changed.** Section 6 makes order-swapped pairwise critique the primary signal, absolute scores diagnostics, ranges and non-overlap instead of standard deviations, deterministic checks the only hard regressions; critic noise measured by re-scoring; old H13 and H14 merged into H10.
3. Pilot late, Phase 0 over-built → **Changed.** Pilot is H5, after four beads; twelve checks cut to six (H6); price table, daily caps, sealed owner CLI, `add-from-story`, lessons parser/guard, `VERSION`, `report --diff`, `meta/` and the selftest bead removed. Bead count 22 → 16.
4. Critic will miss what the owner catches → **Changed.** Reader questions first from the question alone; pairwise "fewer edits to publish" judgement; held-out calibration on round-2 remarks; PNG renders added in H7 if visual remarks are missed (decided by evidence rather than up front, because it adds the evals' first dependency).
5. Wrong commit pins → **Changed.** All pins replaced with commits on `main` (`f0082af`, `a153036`, `844796a`, `cbddc11`, `cb2080d`).
6. Chart builds offline → **Changed.** Staging links a cached `node_modules` built from `site/stories/package-lock.json`; the case prompt lists the skill steps to skip.
7. Bead problems → **Changed.** H0 amends `8no` in place (no H20/H21 duplicates; the structure domain stays `8no.2`, built on this runner); skill edit (H9) has no dependency; A/B and noise merged (H10); practice-plan P6 explicitly out of scope; regression routine (H14) depends only on H10 and H13.
8. Risks → **Changed** for model pinning and `model_actual` segmentation, cost labelled notional, canary keyed to CLI version. **Declined:** a CI regression gate (still deferred until pairwise results show a stable signal; manual `npm run eval:regress` first).
