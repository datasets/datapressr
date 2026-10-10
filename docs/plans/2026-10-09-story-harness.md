---
title: "Story and skill improvement harness"
date: 2026-10-09
status: proposal, revised after independent review (see 2026-10-09-story-harness-review.md). Supersedes the machinery and bead sections of 2026-10-09-story-practice.md; the loop and question bank there still stand.
---

# Story and skill improvement harness — 2026-10-09

Companion bead file: [`2026-10-09-story-harness-beads.json`](2026-10-09-story-harness-beads.json) (one epic, 16 beads). Review: [`2026-10-09-story-harness-review.md`](2026-10-09-story-harness-review.md). Owner steer of 2026-10-09: the deliverable is the infrastructure, not a run; one pilot run proves it end to end.

## TL;DR

- **What it is.** A small test bench under `evals/` that runs a skill blind on a fixed question, scores the result, and keeps the history in git, so we can say whether a skill edit made stories (and later, wrangling) better, how sure we are, and what changed. Stories first; the wrangling eval (`8no.2`) is built on the same runner.
- **Blind runs are measured, not assumed.** Each run happens in a fresh temp repo holding only the question, the allowed data and one pinned copy of the skill. We tested the CLIs: by default a run there *can* read the parent repo and, with the first draft's flags, reach the network. So the harness uses a verified lock-down recipe and a cheap "canary" run that proves the lock-down works before any paid run; every transcript is scanned for peeks outside the workspace.
- **How we score.** Three layers, never averaged: a few scripted checks (does it meet the skill's contract), a critic from a different vendor (Codex when available, otherwise a different Claude model, chosen automatically and recorded), and the owner's blind preference and verbatim remarks. The critic's main job is a **blind side-by-side** of old-skill and new-skill stories, judged twice with the order swapped; its 0–2 checklist is for diagnosis, not the verdict.
- **How we know we're improving.** With a handful of runs, honesty beats statistics: the report shows win/tie/loss counts of new vs old, score ranges with n, and calls something a change only when the evidence does not overlap. Scripted-check failures are the only automatic regressions. One run is labelled an anecdote.
- **How the harness improves itself.** The critic is calibrated on France with a held-out test (anchors from the owner's first remarks, tested on his second-round remarks); every owner rating measures judge–owner agreement; a rubric change re-scores all past runs so the new rubric is tested, not assumed better.
- **Order.** Four small beads to a working pilot (skeleton → lock-down + Claude → Codex + automatic critic choice → critic), then the France skill edit, an A/B with repeats, a WWII open-data run, one owner review session, and a rubric v2. 16 beads in all.
- **Cost.** Phase 0 is free except a few cents of canary runs and about 2–5 USD of critiques; the pilot about 10–20 USD; everything through the first owner session roughly 80–120 USD (notional list price; actuals replace estimates after the pilot). Owner time: one 20–30 minute review session.

## 1. What we are building and why

The goal of [story practice](2026-10-09-story-practice.md) is a skill that produces a story the owner would publish after at most one round of edits, more reliably over time. The loop (question → blind run → critic → lessons → skill edit → test on a different question) needs machinery we can trust: if runs can see prior answers, the critic is noisy or the history is incomplete, a "better" score means nothing. The harness must answer, at any time: *is the skill better than it was*, *how sure are we*, and *what changed*.

House style: plain Node (`node evals/run.mjs …`, no build step, no npm dependencies in `evals/` unless calibration proves PNG rendering is needed), results as files in git (JSONL, JSON, Markdown, SVG), a generated Markdown report instead of a service, and every component testable without an agent call so `npm test` guards the harness.

**Built later, only when needed (rule of three):** `case add-from-story`, a CI regression gate, planted-flaw suites beyond one negative control, a lessons parser, cost estimates for Codex.

## 2. Directory layout

```
evals/
  README.md                  how to run; the contract this document specifies
  config.json                full model IDs, per-run caps, critic preference and fallback
  run.mjs                    dispatcher: canary | run | check | score | pair | owner | report
  lib/
    schema.mjs               validators for case, run, checks, critique and ledger rows (+ test)
    versions.mjs             skill/harness/rubric tree hashes, dirty check (+ test)
    stage.mjs                blind workspace staging (+ test)
    adapters/claude.mjs      claude -p, writer and critic roles
    adapters/codex.mjs       codex exec, writer and critic roles
    adapters/fake.mjs        copies canned artefacts; free plumbing tests
    adapters/index.mjs       vendor choice and fallback (+ test)
    checkers/story.mjs       six deterministic story checks (+ test with oracle and saboteurs)
    critic.mjs               prompt assembly, absolute and pairwise modes, JSON validation, Markdown render (+ test)
    ledger.mjs               append and read evals/ledger.jsonl (+ test)
    report.mjs               generates evals/REPORT.md (+ test on a fixture ledger)
  rubrics/story/v1.md        critic prompt and anchors; a new version is a new file, change log in its header
  cases/story/q01-french-debt/   case.json, prompt.md
  cases/story/q02-allies-wwii/
  calibration/story/         France drafts as run 0s, one deliberately weak story, the hit/miss tables
  runs/<domain>/<case>/<run_id>/  committed: run.json, artefacts, checks.json, critique*.json/.md
                                  gitignored: transcript.jsonl, workspace.tar (hashes in run.json)
  pairs/<pair_id>/           A/ and B/ for the owner; mapping in a gitignored file until recorded
  ledger.jsonl               one row per event
  LESSONS.md                 per-domain lessons with status and run-id evidence (maintained by hand)
  REPORT.md                  generated, committed so trends read on GitHub
```

`evals/` stays outside `skills/` so `npx skills add` never ships fixtures. `evals/**/*.test.mjs` run under `npm test` with no agent calls; anything paid lives behind `node evals/run.mjs …`.

## 3. Data model

All JSON is validated by `lib/schema.mjs` on write and on read; a malformed file fails loudly. Every ledger row carries `schema: 1`.

### 3.1 Case (`case.json` + `prompt.md`)

| Field | Meaning |
|---|---|
| `id`, `domain`, `title`, `question` | `q01-french-debt`, `story`, the human question verbatim |
| `type` | `explanatory`, `historical`, `current-state`, `markets`, `periodic` (the critic applies the type's rules) |
| `data_mode` | `fixed` (inputs listed, network off) or `open` (writer finds data, network on) |
| `as_of` | Optional; the critic and check S6 flag later dates |
| `inputs[]` | `{ path, commit }`, copied with `git archive`; the commit must be an ancestor of `main` (validated) |
| `skills[]` | Skill directories staged as files (`story`; plus `archive`, `structure` in open mode) |
| `references[]` | `{ title, url, archive_url, answers_same_question, key_findings[] }`; critic only |
| `owner_feedback[]` | Paths in `docs/reviews/`; critic only, and only in calibration |
| `budget` | `{ max_usd, max_turns, words: [300, 700] }` |
| `forbidden_domains[]` | Open mode: named in the prompt, scanned for afterwards |

`prompt.md` is the only text from the case the writer sees: the question, the data mode and inputs, the word budget, where files go (`site/stories/` in the workspace), and which skill steps to skip in a scratch repo (site index links, DataHub, the human voice pass). `case_hash` is SHA-256 over both files and the input tree hashes.

### 3.2 Run (`run.json`)

`run_id` = `<YYYYMMDD-HHMM>-<case>-<vendor>-<model-short>-<skill7>-<n>`.

| Field | Meaning |
|---|---|
| `run_id`, `case_id`, `domain`, `case_hash` | Identity |
| `skill` | `{ name, ref, tree, dirty }`; `tree` = `git rev-parse <ref>:skills/<name>`; refuse a dirty tree unless `--allow-dirty` |
| `harness` | `{ tree }` of `evals/lib` plus the recipe hash (flags and settings used) |
| `writer` | `{ vendor, model, model_actual, cli_version, prompt_sha256 }`; `model` is a full ID from `config.json`, `model_actual` from the CLI's own output |
| `isolation` | `{ canary_run_id, network, leaks[] }` |
| `started_at`, `duration_ms`, `turns`, `cost_usd`, `cost_basis`, `usage` | From the CLI; `cost_basis` is `list` for Claude (notional on a subscription) and `null` for Codex (tokens only) |
| `artefacts[]` | `{ path, sha256, bytes }` |
| `transcript_sha256`, `workspace_sha256` | Of the gitignored files |
| `flags[]` | `leaked`, `over_budget`, `failed`, `dirty_skill`, `fallback_critic` |

### 3.3 Checks (`checks.json`)

`{ checker: "story", results: [{ id, pass, severity: "fail"|"warn", message, evidence }] }`.

### 3.4 Critique

Two modes, both requested as structured JSON (`claude -p --json-schema`, `codex exec --output-schema`), validated, retried once, then recorded as `critic_failed`.

**Absolute** (`critique.json` in the run directory): `rubric`, `critic {vendor, model, model_actual, fallback, fallback_reason}`, `reader_questions[{q, answered: yes|partly|no, where}]` (questions written before reading the story), `missed_findings[]`, `charts[{file, shows, form_fits, fix}]`, `top_change`, `publishable: yes|with-edits|no`, `lessons[{rule, evidence}]` (at most five), `scores` (0–2 with a one-line `why` each: `argument`, `depth`, `charts`, `honesty`, `reader_questions`, `prose`, plus `data_choice` in open mode).

**Pairwise** (ledger row of kind `pair`, detail in `evals/pairs/<pair_id>/critique-<order>.json`): the two runs labelled `A`/`B` with no skill or version information, judged twice with the order swapped; each judgement gives `preferred: A|B|tie`, `margin: clear|slight`, `why`, and the reader questions each answers. The pair's result is a win only when both orders agree; otherwise a tie.

### 3.5 Owner rows and ledger

Owner rows: `{ kind: "owner", at, case_id, pair_id | run_id, preferred, remarks (verbatim), scores (optional), rounds_to_publishable (optional) }`; the report computes agreement with the critic's pairwise result for the same pair.

`ledger.jsonl` row kinds: `canary`, `run`, `check`, `score` (absolute critique), `pair`, `owner`. Re-scoring appends; nothing is rewritten. The report joins by `run_id` / `pair_id`.

## 4. The runner

### 4.1 Commands

```sh
node evals/run.mjs canary --writer claude|codex [--mode fixed|open]   # cents; required before paid runs
node evals/run.mjs run story/q01-french-debt --writer claude [--skill-ref <commit>] [--repeat 2]
node evals/run.mjs run story/q01-french-debt --writer fake          # free plumbing test
node evals/run.mjs check <run_id|--all>                             # deterministic checks, re-runnable
node evals/run.mjs score <run_id|--all> [--rubric story/v2] [--critic auto|claude|codex|fake]
node evals/run.mjs pair <run_id> <run_id> [--critic auto]           # blind order-swapped critique; writes evals/pairs/<id>/A,B
node evals/run.mjs owner <pair_id|run_id> --preferred A|B|neither --remarks-file f.md [--scores …]
node evals/run.mjs report                                           # regenerate evals/REPORT.md
```

Running and scoring are separate: artefacts are committed, so checks, critiques and pairs can be (re)applied to any past run.

### 4.2 Flow of `run`

1. **Resolve versions.** Skill tree at `--skill-ref` (default `HEAD`), harness tree, recipe hash, case hash. Refuse a dirty skill tree unless `--allow-dirty`.
2. **Gate.** Refuse unless a canary passed for this vendor, CLI version, recipe hash and mode; refuse if `repeat × per-run cap` exceeds 60 USD unless `--force` (recorded).
3. **Stage** (`lib/stage.mjs`): `mkdtemp` → `git init` → copy only: `prompt.md` as `TASK.md`; inputs via `git archive <commit> <path>` into the same paths as the repo (`datasets/<name>/`); the skill directories via `git archive <skill-ref> skills/<name>` into `skills/<name>/`; the dataset-conventions part of `AGENTS.md`; `site/stories/package.json` and a read-only link to a cached `node_modules` built once per lockfile hash with `npm ci` (cache outside the denied paths). An allowlist: anything not named is absent. Commit the staged tree as the baseline.
4. **Execute** with the vendor recipe (4.3), per-run caps, a wall-clock timeout.
5. **Collect.** Diff against the baseline; copy new or changed files up to 2 MB per run; write `run.json`; save the transcript and a workspace tarball (gitignored, hashed).
6. **Leak scan.** Flag `leaked` for any absolute path outside the workspace in a tool call, any reference title/URL or forbidden domain (open mode). Leaked runs stay in the ledger and are excluded from comparisons.
7. **Check, score** (unless `--no-critic`), **ledger**, **report**.

### 4.3 Isolation recipes (verified 2026-10-09, Claude Code 2.1.295, codex-cli 0.161.0)

Probe results that shaped the recipe, from a fresh temp repo:

| Probe | Result |
|---|---|
| `--setting-sources project`: user `CLAUDE.md`, auto-memory, user plugins | Not loaded |
| Same: skills available | Staged skill **plus built-in skills** (`dataviz`, `code-review`, …); `--disable-slash-commands` removes all |
| Read tool on the parent repo | **Allowed** by default; blocked by a `Read(//<repo>/**)` deny rule even under `bypassPermissions` |
| Bash `head` on the parent repo | Blocked by `sandbox.filesystem.denyRead` |
| `curl` with sandbox on, `allowedDomains: []`, `bypassPermissions` | **Not blocked** (HTTP 200) |
| Same with `--permission-mode dontAsk` | Blocked (`deny network-outbound`) |
| `permissions.allow` in a staged `.claude/settings.json` | Ignored (untrusted workspace); deny rules apply |
| Codex `workspace-write` | Reads the whole disk; user skills in `~/.agents/skills` (incl. `humanizer`), memories in `~/.codex/memories_1.sqlite`, defaults in `~/.codex/config.toml` |

Re-verified 2026-10-10 on Claude Code 2.1.296 by the canary (`datapressr-hcn.3`; `evals/canaries/20261010-0028-canary-claude-haiku-5-5-1`, Haiku, 0.003 USD): every probe above still holds. Also measured: the `Read` deny rules block Glob and Grep as well as Read, and Bash `ls`/`head` on every denied path fails with "Operation not permitted"; `curl` gets no connection and Node `fetch` fails DNS; a Plot chart builds inside the sandbox from the cached `node_modules`; the init event lists only the six tools, no MCP servers, skills or slash commands, but three plugins bundled with the CLI (`cc-plugin-agents-md`, `cc-plugin-telemetry`, `cc-plugin-plugin-authoring`, source `@builtin`), which the canary records rather than fails since they come with the CLI version it is keyed on. The weakened recipe (no read deny rules, no `denyRead`) fails the canary with 15 of 15 read probes leaked. The recipe as built adds `--strict-mcp-config` and `--tools` (same six tools) to the line below and uses `--output-format stream-json --verbose` instead of `json`, because the leak scan needs every tool call; the final `result` event carries the same cost, turns and `modelUsage` fields.

**Claude writer:** `claude -p "$(cat TASK.md)" --output-format json --model <full id> --max-turns N --max-budget-usd X --setting-sources project --disable-slash-commands --no-session-persistence --permission-mode dontAsk --allowedTools "Read Write Edit Glob Grep Bash" --settings <harness settings file>`. The settings file holds deny rules for `Read` on the repo root, `~/.claude`, `~/.codex`, `~/.agents`, `~/.config/gh`, `~/.ssh`; `WebFetch`/`WebSearch` denied in fixed mode; and `sandbox: { enabled: true, autoAllowBashIfSandboxed: true, allowUnsandboxedCommands: false, filesystem.denyRead: [same paths], network.allowedDomains: [] }` in fixed mode. The prompt tells the writer to read `skills/story/SKILL.md` and follow it, so the skill reaches Claude and Codex the same way. Open mode: web tools and network allowed; the exact open-mode network setting is chosen in H11 and proven by the canary.

**Codex writer and critic:** `HOME` and `CODEX_HOME` set to a per-run temp home containing only a copy of `auth.json` (deleted afterwards); `codex exec -C <cwd> --skip-git-repo-check --ephemeral --ignore-user-config --json -o last.md -m <model> --sandbox workspace-write` (critic: `read-only`); open mode adds `-c sandbox_workspace_write.network_access=true`. Codex disk reads outside the workspace cannot be prevented, only detected by the leak scan; that is stated in the report.

Verified 2026-10-10 on codex-cli 0.161.0 by the Codex canary (`datapressr-hcn.4`; `evals/canaries/20261010-0038-canary-codex-gpt-6-luna-1`, `gpt-6-luna`, about 39k input tokens, 24k of them cached): with the temp home the skills listing holds only the CLI's bundled system skills, no memories load, `curl` gets no connection and Node `fetch` fails, and the chart builds; the repo and every user directory remain readable by absolute path, as expected, and the leak scan flags the read. The weakened recipe (real `HOME`) lists all 15 skills in `~/.agents/skills`, `humanizer` included, and fails. Also measured: with the auth copy the CLI fetches ChatGPT apps and remote plugins (Drive, Calendar, GitHub…) into the temp home (a trivial prompt costs about 29k input tokens with them and 10k without), so the recipe as built adds `--ignore-rules` and `--disable` for `apps`, `plugins`, `remote_plugin`, `browser_use`, `computer_use`, `image_generation`, `memories` and `hooks`, plus `-c web_search="disabled"` in fixed mode. The JSONL events carry no model id, so `model_actual` is `null` for Codex.

Recipe 2, 2026-10-10 (`datapressr-hcn.19`): in the q01 pilot a writer ran `claude -p` from Bash, which failed only for want of network. Both recipes now put a per-run shim directory first on the child's `PATH` whose `claude` and `codex` refuse to run; the Claude settings also deny `Bash(claude:*)` and `Bash(codex:*)`; Codex adds `-c allow_login_shell=false`, because a login shell's `path_helper` put `/opt/homebrew/bin` ahead of the shim (the first recipe-2 Codex canary, `20261010-0146-canary-codex-gpt-6-luna-1`, failed on that). The sandbox cannot stop the real binaries by absolute path (`denyRead` on the Claude package dir does not stop it executing), so the leak scan now flags nested agent invocations and `$TMPDIR` reads outside scratch files. The canary probes `claude --version` and `codex --version` as tool calls and a nested `claude -p` and `codex exec` in the probe script. Results: Claude 2.1.296 recipe `5cdd01e0464f` passes (`20261010-0147-canary-claude-haiku-5-5-1`, 0.0035 USD; every nested probe blocked, the tool calls by the deny rules, the script ones by the shim), weakened fails with every nested probe leaked; codex-cli 0.161.0 recipe `833020919fa2` passes (`20261010-0147-canary-codex-gpt-6-luna-1`, about 52k input tokens, 38k cached), weakened (no shim, real `HOME`) fails on the nested probes and the skills. Inside Claude's sandbox `$TMPDIR` is `/tmp/claude-501`, shared with the user's other Claude sessions; under Codex it is the user's own `$TMPDIR`, where the eval workspaces live.

**Canary** (`canary`): the exact recipe with the cheapest model and a probe prompt that tries to read the parent repo, `~/.claude` and `~/.codex`, lists its skills, and (fixed mode) runs `curl` and Node `fetch`. Pass = every probe blocked or empty. Recorded as a `canary` ledger row keyed by vendor, CLI version, recipe hash and mode. About 0.01 USD.

**Critic role** (any vendor): tools off (`--tools ""`, or Codex `read-only` with nothing to read but its prompt), except when chart PNGs are attached (Codex `-i`; Claude `--tools Read` confined to the critique folder).

### 4.4 Vendor choice

`adapters/index.mjs`: the critic is `codex` when the writer is `claude` and vice versa. If the preferred vendor's `available()` fails (binary missing, auth failing, or its canary not passed), it falls back to the writer's vendor with a different model family (`config.json`: Claude Opus writer → Sonnet critic), and the critique records `fallback: true` with the reason. The critic never receives the skill, prior runs, prior critiques or `LESSONS.md`.

## 5. Scoring

### 5.1 Deterministic checks (`checkers/story.mjs`; free)

| Id | Check | Severity |
|---|---|---|
| S1 | Artefacts exist: `<slug>-outline.md`, `<slug>-make-charts.mjs`, ≥1 `.svg`, `<slug>.md`; open mode also `DATA.md` and `<slug>-src/PROVENANCE.md` | fail |
| S2 | Prose 300–700 words (excluding frontmatter, alt text, friction notes) | fail |
| S3 | Every number in the prose appears in some SVG's text or in the friction notes' exempt list (the skill's own contract) | fail, lists misses |
| S4 | Charts reproducible: `make-charts.mjs` run twice offline gives byte-identical SVGs | fail |
| S5 | Inputs untouched against the baseline | fail |
| S6 | No date after `as_of` in prose or outline (cases with `as_of`) | fail |

Oracle: the four published stories in `site/stories/` pass, or the test documents the exact exception and why (a check is never weakened to make a story pass). Saboteurs generated from a copy of one story must fail exactly their intended check: a prose-only number, `Date.now()` in the build, an edited input, a 900-word prose, a date after `as_of`, a missing outline.

### 5.2 The critic (`rubrics/story/v1.md` + `lib/critic.mjs`)

Inputs: the case question and type, the run's outline, prose and SVG sources with extracted text labels (PNG renders if calibration requires them), `DATA.md` in open mode, references with key findings, and owner feedback only in calibration. The prompt makes the critic the commissioning reader: **first** list the five to eight questions a curious reader brings to this question, from the question alone; **then** read the story and say which are answered; the strongest findings missed; chart by chart with one fix; the one change that matters most and "would you publish this?"; at most five rule-shaped lessons; and last the 0–2 checklist. Type rules: "why" claims attributed; `as_of` respected; historical stories name what each number measures and show disagreement between sources; market stories date each explanation. Anchors are written generically, not from France, so France stays a fair test.

Pairwise mode asks which of two unlabelled stories the commissioning reader would publish with fewer edits, and why, and which reader questions each answers.

### 5.3 Calibration (before any trend relies on the critic)

- **Held-out split.** Rubric anchors may draw on the owner's round-1 remarks (first draft: outline `a153036`, charts `844796a`, prose `cbddc11`). The test is the second draft (`cb2080d`, which already addressed round 1) against the owner's **round-2** remarks (blue/green colours, hollow vs filled markers, "what is old age", "show me what is growing", "how could social protection have grown if almost every area shrank"). Record a hit/miss table for both drafts; the round-2 hit rate is the honest number.
- **Negative control.** One deliberately weak story on the same data (a dataset tour, no argument, chart soup) must lose the pairwise comparison against the first draft in both orders and score lower on every checklist dimension that applies.
- **Visual remarks.** If round-2 visual remarks are missed with SVG text alone, add PNG renders (one targeted dependency in `evals/package.json`, or a system rasteriser) and re-test.
- **Critic noise.** Re-score one run three times; record the spread.

### 5.4 Owner layer

Blind pairwise preference and verbatim remarks are the headline measure; "rounds to publishable" is recorded for every story that reaches the site (France: 3). The agent prepares `evals/pairs/<id>/A` and `B` (prose and charts only); the owner reads them and replies in chat; the agent records the reply verbatim with `owner`, and only then reads the mapping. Owner checklist scores are optional and used only for agreement.

## 6. History, trends and regression

`node evals/run.mjs report` regenerates `evals/REPORT.md` from the ledger:

- **Flags at the top:** a deterministic check that passed on the previous skill tree and fails on the new one (hard regression); a pairwise loss of new vs old on any case (soft, needs a look); leaked runs; a missing canary for the current CLI version.
- **Per skill change:** for each skill tree, the cases run, win/tie/loss of new vs previous in order-swapped pairwise critiques, and owner preferences where they exist, with a `git log --oneline <a>..<b> -- skills/<name>` link for what changed. Skill commits with no pairwise comparison on record are listed (this is the guard that edits get tested).
- **Per case:** runs newest first: date, skill tree, writer `model_actual`, checks, absolute scores with critic, publishable, cost, turns. Rubric versions are never mixed in one column; model versions are segmented.
- **Noise, stated plainly:** for each case with repeats, the range of absolute scores per skill tree with n, and the critic-only spread from re-scoring. A difference is reported as a change only if the ranges do not overlap; otherwise "no detectable change". Single runs are labelled anecdotes. No standard deviations or p-values at these sample sizes.
- **Harness quality:** judge–owner agreement on pairs per rubric version, calibration hit rates, critic fallback rate, critic validation failures, leaks caught, canary status per vendor.

## 7. How the harness improves itself

- **Versioned rubrics.** `rubrics/<domain>/vN.md`; a new version is a new file whose header lists what changed and which owner remark motivated it. Old score rows stay reproducible.
- **Judge–owner agreement** is the harness's quality metric: does the critic's pairwise verdict match the owner's? Until it matches in at least four of five pairs (about five review sessions at one pair each), every skill edit we keep needs an owner look; after that the critic's verdict can stand alone for small edits.
- **Re-score on rubric change.** `score --all --rubric story/v2` and the same for pairs; the report shows v1 vs v2 agreement with the owner on the same runs; v2 becomes the default only if its agreement is at least v1's.
- **Misses become rubric edits.** When the owner names something the critique missed, the miss and the proposed fix are recorded in the next rubric version's change log.
- **The canary** re-runs whenever the CLI version or the recipe changes, so isolation regressions surface in the same report.

## 8. Lessons into skills

- `evals/LESSONS.md`, maintained by hand: each lesson a one-line rule with status `seen once` / `seen twice` / `owner-flagged` / `in skill @ <commit>` and the run ids that support it.
- **Edit rule:** a skill edit needs two sources (two runs, or a run plus a reference) or an owner flag; prefer one-line rules and deletions; the commit cites the run ids.
- **Overfitting guard:** every kept edit gets a pairwise comparison on the case it came from and on one case it did not come from; the report lists skill commits without one.
- Edits land in `skills/story/references/story-craft.md`, `SKILL.md`, `references/charting.md` or a pattern library; site copies are synced in the same commit. Seeding the pattern library and deciding the France story's future (practice plan P6) belong to the practice loop, not this epic.

## 9. Shared machinery with the wrangling eval (`datapressr-8no`)

The runner, adapters, canary, ledger and report are domain-agnostic; a domain adds a checker, cases and a rubric. The wrangling beads stay in their epic and are **amended in place** by bead H0 (no parallel beads):

| Bead | Change |
|---|---|
| `8no.2` Eval harness v0 (structure, co2-monthly) | Build the fixture, golden anchors, D1–D13 and oracle/saboteur tests as `evals/lib/checkers/structure.mjs` and `evals/cases/structure/co2-monthly/` on the shared runner; drop its own runner. Add dependencies on H2 and H8; keep `ck8`. |
| `8no.3` First comparison, three runs each | Run via `node evals/run.mjs run structure/co2-monthly --repeat 3` (writer with/without skill, and Codex); the write-up wraps the generated report. |
| `8no.4` Judged rubric | Use the shared critic (findings first, order-swapped pairwise, automatic vendor) with `rubrics/structure/v1.md`; owner calibration through `owner`. Add a dependency on H4. |
| `8no.5` Enrich eval | An `enrich` domain on the shared runner. |
| `8no` epic | Acceptance "eval harness v0 scores the reference build 13/13" → "the structure case on the shared harness scores the reference 13/13". |

## 10. Cases

| Case | Mode | Inputs and reference |
|---|---|---|
| `q01-french-debt` (explanatory) | fixed | `datasets/france-public-finances` at `f0082af`; owner feedback is the reference (calibration only) |
| `q02-allies-wwii` (historical) | open | Data-driven brief below; no reference yet |
| `q03-wti-negative` (explanatory, H15) | fixed | `datasets/energy-and-commodities/oil-prices`; reference EIA *Today in Energy* 27 Apr 2020 |
| `q04-co2-rising` (current-state, H15) | fixed | `datasets/climate-and-environment/co2-ppm`, `as_of` = last observation; reference NOAA Climate.gov |

**WWII, framed as data.** The question stays "Why did the Allies win the Second World War?". The brief requires the argument to be built from measurable series, each chart carrying one: war production (aircraft, tanks, ships, munitions by country and year), manpower, coalition GDP (Harrison's *The Economics of World War II* and successors), oil and raw materials, casualties by front. Each number names what it measures, disagreement between sources is shown (casualties especially), and the story says what the data does not test (strategy, leadership, luck). Sources are snapshotted into `<slug>-src/` with `PROVENANCE.md`, and `DATA.md` lists what was searched, chosen, licence and vintage. A WWI variant is the next transfer case.

**France.** The published story is acknowledged as not good; it is a case with the owner's feedback as the reference. No decision about replacing it is taken here.

## 11. Cost controls

- Per-run caps passed to the CLI (`--max-budget-usd`, `--max-turns`): 20 USD / 100 turns fixed, 30 USD / 150 turns open; `over_budget` recorded.
- `run` refuses if `repeat × per-run cap` exceeds 60 USD unless `--force`.
- Canary and critics on cheap settings: canary on the smallest model; critics with tools off.
- `fake` writer and fake critic for all plumbing tests; `npm test` never calls an agent.
- Costs are notional list prices for Claude (`cost_basis: list`); Codex records tokens only.
- Estimates: Phase 0 under 5 USD (canaries, H4 smoke critique); H5 pilot 10–20 (actual, 2026-10-10: two Opus writer runs on the pre-edit skill, 1.46 and 1.72 USD list, 26 and 33 turns, 5.5 and 5.7 minutes; two Codex gpt-6-astra critiques, tokens only, about 37k input and 2k output each, about 1 minute; canary already current, so 3.18 USD in all); H7 calibration 3–8; H10 A/B with repeats 45–70; H11 WWII 20–30; H13 re-scoring 5–10; H14 one regression run 10–20; H15 3–5. Actuals replace estimates in close notes and the report.

## 12. Bead breakdown

Filed in Beads on 2026-10-09 as epic `datapressr-hcn`. H keys in this document map to bead IDs as follows:

| Key | Bead | Title |
|---|---|---|
| epic | `datapressr-hcn` | Epic: story and skill improvement harness |
| H0 | `datapressr-hcn.1` | Amend the 8no eval beads in place to build on this harness |
| H1 | `datapressr-hcn.2` | Skeleton: evals/ layout, q01 case, schemas, versions, ledger, fake writer, minimal report |
| H2 | `datapressr-hcn.3` | Blind staging, Claude recipe and isolation canary |
| H3 | `datapressr-hcn.4` | Codex recipe and automatic critic vendor with fallback |
| H4 | `datapressr-hcn.5` | Critic v1: rubric, absolute and order-swapped pairwise modes |
| H5 | `datapressr-hcn.6` | Pilot: q01 blind run on the current skill, critiqued, in ledger and report |
| H6 | `datapressr-hcn.7` | Story deterministic checks with oracle and saboteurs |
| H7 | `datapressr-hcn.8` | Calibrate the critic on France with a held-out split and a negative control |
| H8 | `datapressr-hcn.9` | Report v1 and owner capture: pairwise win/tie/loss, ranges, flags, agreement |
| H9 | `datapressr-hcn.10` | Put the France lessons into the story skill (the treatment) |
| H10 | `datapressr-hcn.11` | q01 A/B with repeats: pre- vs post-edit skill, two runs each, pairwise |
| H11 | `datapressr-hcn.12` | Transfer case: q02 WWII, open mode, data-driven brief |
| H12 | `datapressr-hcn.13` | HUMAN (20-30 min): owner judges the q01 pair and the WWII story blind |
| H13 | `datapressr-hcn.14` | Rubric v2 from owner misses; re-score history; agreement v1 vs v2 |
| H14 | `datapressr-hcn.15` | Regression routine and docs: npm run eval:regress, README, changelog |
| H15 | `datapressr-hcn.16` | Reference cases q03/q04: published stories vs EIA and Climate.gov, pairwise |

Epic: **Story and skill improvement harness** (P1, labels `quality, evals, story, harness`). Full descriptions, acceptance and dependencies are in [`2026-10-09-story-harness-beads.json`](2026-10-09-story-harness-beads.json).

### Phase 0 — walking skeleton to a pilot

| Key | Title | P | Deps |
|---|---|---|---|
| H0 | Amend the `8no` eval beads in place to build on this harness | P1 | — |
| H1 | Skeleton: `evals/` layout, q01 case, schemas, versions, ledger, fake writer, minimal report | P1 | — |
| H2 | Blind staging, Claude recipe and isolation canary | P1 | H1 |
| H3 | Codex recipe and automatic critic vendor with fallback | P1 | H2 |
| H4 | Critic v1: rubric, absolute and order-swapped pairwise modes | P1 | H3 |
| H5 | Pilot: q01 blind run on the current skill, critiqued, in ledger and report (paid) | P1 | H4 |
| H6 | Story deterministic checks with oracle and saboteurs | P2 | H1 |
| H7 | Calibrate the critic on France with a held-out split and a negative control (paid, small) | P1 | H4 |
| H8 | Report v1 and owner capture: pairwise win/tie/loss, ranges, flags, agreement | P1 | H1 |
| H9 | Put the France lessons into the story skill (the treatment) | P2 | — |

### Phase 1 — first measurements

| Key | Title | P | Deps |
|---|---|---|---|
| H10 | q01 A/B with repeats: pre- vs post-edit skill, two runs each, pairwise (paid) | P2 | H5, H6, H7, H8, H9 |
| H11 | Transfer case: q02 WWII, open mode, data-driven brief (paid) | P2 | H5, H9 |
| H12 | HUMAN (20–30 min): owner judges the q01 pair and the WWII story blind | P2 | H10, H11 |

### Phase 2 — the harness improves itself

| Key | Title | P | Deps |
|---|---|---|---|
| H13 | Rubric v2 from owner misses; re-score history; agreement v1 vs v2 (paid, small) | P2 | H12 |
| H14 | Regression routine and docs: `npm run eval:regress`, README, changelog | P3 | H10, H13 |
| H15 | Reference cases q03/q04: published stories vs EIA and Climate.gov, pairwise (paid, small) | P3 | H7 |

## 13. Open questions (each with the default we will use)

1. **Critic vendor when Codex is unavailable.** Default: a different Claude model family from the writer (Opus → Sonnet), `fallback: true`, fallback rate in the report; never the writer's model with the skill.
2. **Codex disk reads.** Default: detect via the transcript scan and exclude leaked runs; do not build a stronger jail unless a leak is actually seen.
3. **Open-mode network for Claude.** Default: web tools allowed, the forbidden domains named in the prompt and scanned for; the exact sandbox setting is chosen and canary-verified in H11.
4. **Commit run artefacts?** Default: yes for text and SVG under 2 MB per run; transcripts and tarballs gitignored with hashes. Revisit at ~50 MB.
5. **PNG renders for the critic.** Default: not until calibration shows visual remarks are missed; then one targeted dependency in `evals/package.json`.
6. **When can the critic's verdict stand without the owner?** Default: after judge–owner agreement of at least four of five pairs.
7. **Regression runs: manual or CI?** Default: manual `npm run eval:regress` by whoever edits `skills/story/`; CI only once pairwise results show a stable signal.
8. **Where do practice runs publish?** Default: nowhere; a run becomes a site story only by an explicit owner decision outside this epic.
9. **Owner time.** Default: one 20–30 minute session per batch (one A/B pair, one open-mode story), replies in chat, recorded verbatim.
