# Eval harness

A small test bench for developing DataPressr skills: it runs a skill blind on a fixed question, scores the result and keeps the history in git, so we can say whether a skill edit made the output better, how sure we are, and what changed. Stories come first; the wrangling eval (`datapressr-8no.2`) builds on the same runner. Design: [`docs/plans/2026-10-09-story-harness.md`](../docs/plans/2026-10-09-story-harness.md) (the contract this folder implements); review: [`docs/plans/2026-10-09-story-harness-review.md`](../docs/plans/2026-10-09-story-harness-review.md). Work is tracked in Beads under epic `datapressr-hcn`.

House style: plain Node, no build step, no npm dependencies; results are files in git (JSON, JSONL, Markdown, SVG); `evals/REPORT.md` is generated from the ledger. Everything under `evals/**/*.test.mjs` runs in `npm test` with no agent calls; anything that costs money lives behind `node evals/run.mjs …`.

## Status

Walking skeleton (`datapressr-hcn.2`) plus blind staging, the Claude writer and the isolation canary (`datapressr-hcn.3`). What works today:

```sh
node evals/run.mjs run story/q01-french-debt --writer fake     # free plumbing test
node evals/run.mjs canary --writer claude                      # about 0.003 USD on Haiku; required before any Claude run
node evals/run.mjs canary --writer claude --weaken             # negative control: no deny rules, must FAIL
node evals/run.mjs run story/q01-french-debt --writer claude   # paid (caps in config.json); refused without a passing canary
node evals/run.mjs check <run_id|--all>                       # deterministic checks: checks.json + a ledger row
node evals/run.mjs report                                      # regenerate evals/REPORT.md
npm test                                                       # harness tests, no agent calls
```

`run` options: `--skill-ref <commit>` (default `HEAD`), `--allow-dirty` (run even when `skills/<name>` has uncommitted changes; the run is flagged `dirty_skill`), `--repeat N`.

Planned, each with its bead: `--writer codex` and automatic critic choice (`datapressr-hcn.4`), `score` and `pair` (`datapressr-hcn.5`), `owner` and the full report (`datapressr-hcn.9`), the open-mode recipe (`datapressr-hcn.12`). Calling one of these now prints which bead brings it.

The fake writer copies `lib/adapters/fake-artefacts/<domain>/` into the run. Fake runs exist to test the plumbing; do not commit their output to the real ledger.

## Blind runs and the canary

A real writer never runs in this repo. `lib/stage.mjs` builds a fresh temp git repo holding only: the case `prompt.md` as `TASK.md`; each input via `git archive <commit> <path>` at its repo path; each case skill via `git archive <skill-ref> skills/<name>`; the dataset-conventions part of `AGENTS.md` (above the repo-only marker, at the skill ref); `site/stories/package.json` and its lockfile; and `site/stories/node_modules`, a link to a read-only cache built once per lockfile hash with `npm ci --ignore-scripts` in `~/.cache/datapressr-evals/node_modules/<hash>/` (override with `EVALS_CACHE_DIR`; refused inside a denied path). The staged tree is committed as the baseline; after the run, new and changed files (up to 2 MB) are copied into the run's `artefacts/`.

The Claude recipe (`lib/adapters/claude.mjs`, design section 4.3): `claude -p` with a full model ID, `--max-turns`, `--max-budget-usd`, `--setting-sources project`, `--disable-slash-commands`, `--strict-mcp-config`, `--no-session-persistence`, `--permission-mode dontAsk`, `--tools` and `--allowedTools` set to Read, Write, Edit, Glob, Grep and Bash, `--output-format stream-json --verbose` (so the transcript holds every tool call), and `--settings` pointing at a harness-written file: `Read` and `Edit` deny rules on the repo root, `~/.claude`, `~/.codex`, `~/.agents`, `~/.config/gh` and `~/.ssh`; `WebFetch` and `WebSearch` denied; and a sandbox with `allowUnsandboxedCommands: false`, `filesystem.denyRead` on the same paths and `network.allowedDomains: []`. The child process gets our environment minus the variables that mark a parent Claude Code session. Nothing in the user's settings, `CLAUDE.md` or memory is changed. The recipe hash covers the flags and settings with machine paths as placeholders, not the model or caps.

`canary` runs that recipe on the canary model (`config.json`) with a probe prompt: Read, Grep and Bash `head`/`ls` on the repo; Read, Glob and Bash `ls` on each of the user directories above that exist; `curl` and Node `fetch`; and an Observable Plot chart built inside the sandbox from the cached `node_modules` (the positive control). The verdict comes from the tool results in the transcript and the session's init event (only the six tools; no MCP servers, skills, slash commands or non-built-in plugins), never from the model's own account. It writes `canaries/<id>/canary.json` (leaked content redacted) and a `canary` ledger row keyed by vendor, CLI version, recipe hash and mode. `run` refuses unless the latest canary for that key passed, so a CLI upgrade or recipe change needs a new canary.

After every staged run `lib/leakscan.mjs` scans the tool calls for absolute (or `~`, `$HOME`, `../`) paths outside the workspace and the `node_modules` cache, allowing executables, `/dev/null` and `/tmp`; any hit flags the run `leaked` and lists the paths in `run.json`. The scan is conservative: review flagged paths before excluding a run.

## Layout

| Path | What |
|---|---|
| `config.json` | Full model IDs (never aliases), per-run caps (fixed 20 USD / 100 turns, open 30 USD / 150 turns), critic vendor preference and fallback family |
| `run.mjs` | Thin dispatcher for the subcommands |
| `lib/schema.mjs` | Validators for case, run, checks, absolute and pairwise critiques, owner and ledger rows; each returns `{ ok, errors }` |
| `lib/versions.mjs` | Skill tree (`git rev-parse <ref>:skills/<name>`), dirty check, harness tree of `evals/lib` as on disk, input trees, case hash, ancestor-of-main check |
| `lib/ledger.mjs` | Append (validated) and read `ledger.jsonl`; never rewrites |
| `lib/runner.mjs` | The `run` flow |
| `lib/checkers/story.mjs` | The six story checks S1–S6 (below); `run-checks.mjs` is the `check` subcommand, which `run` also calls after collecting artefacts; `offline-preload.mjs` blocks the network for chart rebuilds |
| `lib/report.mjs` | Writes `REPORT.md` (per-case table of runs for now) |
| `lib/adapters/fake.mjs` | Zero-cost writer for tests |
| `lib/stage.mjs` | Blind workspace staging, the `node_modules` cache, artefact collection |
| `lib/adapters/claude.mjs` | The Claude recipe: settings file, flags, writer and critic roles, stream-json parsing |
| `lib/canary.mjs` | Canary probes, verdict and the `run` gate |
| `lib/leakscan.mjs` | Out-of-workspace path scan over a transcript's tool calls |
| `canaries/<id>/` | `canary.json` (probe statuses and redacted evidence); `transcript.jsonl` is gitignored |
| `cases/<domain>/<id>/` | `case.json` and `prompt.md` |
| `runs/<domain>/<case>/<run_id>/` | `run.json` and `artefacts/` (the writer's files at their workspace paths, e.g. `artefacts/site/stories/<slug>.md`); later `checks.json` and `critique*.json`. `transcript.jsonl` and `workspace.tar` are gitignored and hashed in `run.json` |
| `pairs/<pair_id>/` | Blind `A/` and `B/` for the owner; `mapping.json` is gitignored |
| `ledger.jsonl` | One row per event (`canary`, `run`, `check`, `score`, `pair`, `owner`), each with `schema: 1`; re-scoring appends |
| `REPORT.md` | Generated; committed so trends read on GitHub |

A run id is `<YYYYMMDD-HHMM>-<case>-<vendor>-<model-short>-<skill7>-<n>` (UTC). `run.json` records the skill tree and ref, the harness tree (and whether it differed from `HEAD`), the case hash (SHA-256 over `case.json`, `prompt.md` and the input tree ids), the writer, cost and turns, and a SHA-256 and size for every artefact.

## Three scoring layers, never averaged

1. **Deterministic checks** (free): does the output meet the skill's own contract (artefacts present, word budget, every number in the prose visible in a chart, charts reproducible, inputs untouched, no dates past `as_of`). Failures here are the only automatic regressions.
2. **Critic** from a different vendor than the writer (Codex for a Claude writer and vice versa; a different Claude model family when Codex is unavailable, recorded as a fallback). Its primary job is a blind side-by-side of old-skill and new-skill outputs, judged in both orders; its 0–2 checklist is for diagnosis.
3. **Owner**: blind preference and verbatim remarks, the headline measure; the critic's agreement with the owner is the harness's own quality metric.

## Story checks

`check` rebuilds the writer's workspace in a temp dir (case inputs via `git archive` at their pinned commits, the run's artefacts on top, `site/stories/node_modules` linked from this repo), runs the six checks of design section 5.1, writes `checks.json` and appends a `check` row. All six have severity `fail`.

| Id | Passes when |
|---|---|
| S1 | `<slug>-outline.md`, `<slug>-make-charts.mjs`, `<slug>.md` exist and the prose embeds at least one `.svg` that exists; open mode also `DATA.md` and `<slug>-src/PROVENANCE.md` |
| S2 | The prose is within the case's word budget, excluding frontmatter, alt text, link URLs and the friction notes section |
| S3 | Every data number in that prose appears in the visible `<text>` of an SVG the prose embeds, or in the exempt list: friction-notes lines that say "exempt" and the list items nested under them. Years, dates, ordinals and `#N` references are not data numbers. The prose may round a chart value to its own precision; units must not conflict (% vs currency, EUR vs USD); sign is ignored |
| S4 | `<slug>-make-charts.mjs` run twice offline (network blocked) gives byte-identical SVGs, identical to the committed ones |
| S5 | Every input is identical to its pinned commit: no file edited, added or deleted |
| S6 | No date or year after the case's `as_of` in the prose or the outline (link URLs excluded); passes when the case has no `as_of` |

The oracle is the published stories in `site/stories/`; their known failures are pinned with reasons in `lib/checkers/story.test.mjs` and explained in [`LESSONS.md`](LESSONS.md).

## Adding a case

1. Create `cases/<domain>/<id>/case.json` with the fields of design section 3.1: `id` and `domain` (matching the folder), `title`, `question` (verbatim), `type` (`explanatory`, `historical`, `current-state`, `markets`, `periodic`), `data_mode` (`fixed` or `open`), `inputs[]` of `{ path, commit }` where the commit is on `main`, `skills[]`, `references[]` (critic only), `owner_feedback[]` (paths in `docs/reviews/`, critic and calibration only), `budget` `{ max_usd, max_turns, words: [min, max] }`, and optionally `as_of` and `forbidden_domains[]`.
2. Write `prompt.md`: the only case text the writer sees. It holds the question, the data mode and inputs, the word budget, that files go in `site/stories/`, and which skill steps to skip in a scratch repo (site index links, DataHub publishing, the human voice pass). It never contains feedback, references or anything else the critic uses; `cases.test.mjs` checks this.
3. Run `npm test` (the case must validate against this repo) and `node evals/run.mjs run <domain>/<id> --writer fake`.
