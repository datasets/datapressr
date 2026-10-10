# Eval harness

A small test bench for developing DataPressr skills: it runs a skill blind on a fixed question, scores the result and keeps the history in git, so we can say whether a skill edit made the output better, how sure we are, and what changed. Stories come first; the wrangling eval (`datapressr-8no.2`) builds on the same runner. Design: [`docs/plans/2026-10-09-story-harness.md`](../docs/plans/2026-10-09-story-harness.md) (the contract this folder implements); review: [`docs/plans/2026-10-09-story-harness-review.md`](../docs/plans/2026-10-09-story-harness-review.md). Work is tracked in Beads under epic `datapressr-hcn`.

House style: plain Node, no build step, no npm dependencies; results are files in git (JSON, JSONL, Markdown, SVG); `evals/REPORT.md` is generated from the ledger. Everything under `evals/**/*.test.mjs` runs in `npm test` with no agent calls; anything that costs money lives behind `node evals/run.mjs …`.

## Status

Walking skeleton (`datapressr-hcn.2`) plus blind staging, the Claude writer and the isolation canary (`datapressr-hcn.3`), the Codex writer and automatic critic vendor choice (`datapressr-hcn.4`), the full report and owner capture (`datapressr-hcn.9`), the critic with its v1 rubric, `score` and `pair` (`datapressr-hcn.5`), the critic's calibration on France (`datapressr-hcn.8`; results in [`LESSONS.md`](LESSONS.md#critic-calibration): held-out hit rate 0 of 5, negative control passes, `story/v1` frozen), and rubric `story/v2` (`datapressr-hcn.21`: fixed-mode scope, chart reading, round-1 anchors; re-calibrated in `LESSONS.md`, no longer a held-out test). What works today:

```sh
node evals/run.mjs run story/q01-french-debt --writer fake     # free plumbing test
node evals/run.mjs canary --writer claude                      # about 0.003 USD on Haiku; required before any Claude run
node evals/run.mjs canary --writer claude --weaken             # negative control: no deny rules, must FAIL
node evals/run.mjs run story/q01-french-debt --writer claude   # paid (caps in config.json); refused without a passing canary
node evals/run.mjs canary --writer codex                       # tokens only (about 40k input, mostly cached, on gpt-6-luna); required before any Codex run
node evals/run.mjs canary --writer codex --weaken              # negative control: real HOME, so ~/.agents/skills load; must FAIL
node evals/run.mjs critic-choice --writer claude               # free: which critic vendor and model `score` would use, and why
node evals/run.mjs score <run_id|--all> [--critic auto|claude|codex|fake] [--critic-model <id>] [--rubric story/v2] [--calibrate] [--png]
node evals/run.mjs pair <run_id> <run_id> [--critic auto|claude|codex|fake] [--critic-model <id>] [--rubric story/v2] [--calibrate]
node evals/run.mjs check <run_id|--all>                       # deterministic checks: checks.json + a ledger row
node evals/run.mjs report                                      # regenerate evals/REPORT.md (also: npm run eval:report)
node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file f.md   # blind owner judgement, then reveal
npm test                                                       # harness tests, no agent calls
```

`run` options: `--skill-ref <commit>` (default `HEAD`), `--allow-dirty` (run even when `skills/<name>` has uncommitted changes; the run is flagged `dirty_skill`), `--repeat N`.

Planned: the open-mode recipe (`datapressr-hcn.12`).

The fake writer copies `lib/adapters/fake-artefacts/<domain>/` into the run. Fake runs exist to test the plumbing; do not commit their output to the real ledger.

## Blind runs and the canary

A real writer never runs in this repo. `lib/stage.mjs` builds a fresh temp git repo holding only: the case `prompt.md` as `TASK.md`; each input via `git archive <commit> <path>` at its repo path; each case skill via `git archive <skill-ref> skills/<name>`; the dataset-conventions part of `AGENTS.md` (above the repo-only marker, at the skill ref); `site/stories/package.json` and its lockfile; and `site/stories/node_modules`, a link to a read-only cache built once per lockfile hash with `npm ci --ignore-scripts` in `~/.cache/datapressr-evals/node_modules/<hash>/` (override with `EVALS_CACHE_DIR`; refused inside a denied path). The staged tree is committed as the baseline; after the run, new and changed files (up to 2 MB) are copied into the run's `artefacts/`.

The Claude recipe (`lib/adapters/claude.mjs`, design section 4.3): `claude -p` with a full model ID, `--max-turns`, `--max-budget-usd`, `--setting-sources project`, `--disable-slash-commands`, `--strict-mcp-config`, `--no-session-persistence`, `--permission-mode dontAsk`, `--tools` and `--allowedTools` set to Read, Write, Edit, Glob, Grep and Bash, `--output-format stream-json --verbose` (so the transcript holds every tool call), and `--settings` pointing at a harness-written file: `Read` and `Edit` deny rules on the repo root, `~/.claude`, `~/.codex`, `~/.agents`, `~/.config/gh` and `~/.ssh`; `Bash(claude:*)` and `Bash(codex:*)` denied (no nested agent); `WebFetch` and `WebSearch` denied; and a sandbox with `allowUnsandboxedCommands: false`, `filesystem.denyRead` on the same paths and `network.allowedDomains: []`. The child process gets our environment minus the variables that mark a parent Claude Code session, with a per-run shim directory first on `PATH` whose `claude` and `codex` print `NESTED_AGENT_BLOCKED` and exit 126 (`lib/adapters/nested.mjs`; the sandbox cannot deny executing the real binaries, and an absolute path to them bypasses the shim, so the leak scan is the backstop). Nothing in the user's settings, `CLAUDE.md` or memory is changed. The recipe hash covers the flags and settings with machine paths as placeholders, not the model or caps.

`canary` runs that recipe on the canary model (`config.json`) with a probe prompt: Read, Grep and Bash `head`/`ls` on the repo; Read, Glob and Bash `ls` on each of the user directories above that exist; `curl` and Node `fetch`; nested agents (`claude --version` and `codex --version` as Bash tool calls, and `claude --version`, a nested `claude -p` and a nested `codex exec` inside the probe script, each bounded by an alarm and pointed at an empty config dir in the workspace so even the weakened recipe never touches the real `~/.claude` or `~/.codex`); and an Observable Plot chart built inside the sandbox from the cached `node_modules` (the positive control). The verdict comes from the tool results in the transcript and the session's init event (only the six tools; no MCP servers, skills, slash commands or non-built-in plugins), never from the model's own account. It writes `canaries/<id>/canary.json` (leaked content redacted) and a `canary` ledger row keyed by vendor, CLI version, recipe hash and mode. `run` refuses unless the latest canary for that key passed, so a CLI upgrade or recipe change needs a new canary.

The Codex recipe (`lib/adapters/codex.mjs`, design section 4.3): `codex exec -C <workspace> --skip-git-repo-check --ephemeral --ignore-user-config --ignore-rules --json -o <last.md> -m <model> --sandbox workspace-write` (critic: `read-only`, `--output-schema`, `-i` for chart images, run from an empty temp dir), with `HOME` and `CODEX_HOME` set to a per-run temp dir holding only a copy of `~/.codex/auth.json` (mode 600; the dir is deleted after the run, and the real `~/.codex` is never written). Beyond the design's line, the recipe disables the features that reach past the sandbox or into the user's accounts: `--disable` `apps` (ChatGPT connectors such as Drive and GitHub, which the auth would otherwise fetch), `plugins`, `remote_plugin`, `browser_use`, `computer_use`, `image_generation`, `memories` and `hooks`, and sets `web_search="disabled"` in fixed mode. It also puts the nested-agent shim first on `PATH` and sets `allow_login_shell=false`, because a login shell runs macOS's `path_helper`, which moves `/opt/homebrew/bin` (where `claude` lives) ahead of the shim; the first recipe-2 canary failed on exactly that. Open mode instead adds `-c sandbox_workspace_write.network_access=true`. Codex reports tokens, not money: `cost_usd` and `cost_basis` are `null` and `usage` holds the summed token counts. `turns` is tool-call items plus the final answer. codex-cli 0.161.0 names no model in its events, so `model_actual` is `null` and `model` is the requested one. Codex has no turn or budget cap flag; the run is bounded by the wall-clock timeout and flagged `over_budget` afterwards if it exceeded the case's turns.

What Codex isolation does and does not prevent. It prevents the user's Codex config, `AGENTS.md`, memories, sessions and rules, and the skills in `~/.agents/skills` and `~/.codex/skills` (e.g. `humanizer`), from loading; ChatGPT apps, plugins, MCP servers, browser and computer use from being offered; network access in fixed mode (`curl` gets no connection, Node `fetch` fails); and writes outside the workspace. It does **not** prevent reads: under `workspace-write` the agent's shell can read any file the user can, by absolute path (the parent repo, `~/.claude`, the real `~/.codex`, `~/.ssh`). Those reads are detected by the leak scan after every run, not blocked; a run that makes one is flagged `leaked` and excluded from comparisons. The CLI also installs its own bundled system skills (`imagegen`, `openai-docs`, `skill-creator`, `skill-installer`, `review-agent`) into the temp home; like Claude's built-in plugins they come with the CLI version the canary is keyed on and are recorded, not failed.

The Codex canary runs the probe script and one direct `head` of the repo's `AGENTS.md` (so the leak scan has a shell read to catch), then asks for the skills list and any user instructions. Disk reads are recorded as `open` (possible; the leak scan is the control), not as failures. It fails on: a user skill in the model's listing or in the temp home; any memory row or `memories/` folder in the temp home, or a quoted line from a user instruction file; any fetched plugin or apps cache, MCP call or web search; network access in fixed mode; the chart not building; the leak scan missing the repo read; or a nested `claude`/`codex` that ran instead of hitting the shim. First run on 2026-10-10 (codex-cli 0.161.0, `gpt-6-luna`): passed (`canaries/20261010-0038-canary-codex-gpt-6-luna-1`); the weakened recipe (real `HOME`) failed because the model listed all 15 skills in `~/.agents/skills`, `humanizer` included. An earlier run the same day (`…-0037-…`) failed on two bugs in the canary itself (a bookkeeping row counted as a memory; no shell read for the leak scan to catch), fixed before the passing run; its row stays in the ledger.

Critic vendor (`lib/adapters/index.mjs`, design section 4.4): `available(vendor)` checks, in order and cached per invocation, that the binary runs (`--version`), that auth works (`claude auth status`; `codex login status` against a temp home with the auth copy) and that the latest canary for this CLI version and the fixed-mode recipe passed. `pickCritic(writer)` returns the other vendor's `critic` model from `config.json` when it is available, otherwise the writer's vendor with the `critic_fallback` family (Opus → Sonnet, Astra → Sol), as `{ vendor, model, fallback, fallback_reason }`; it never returns the writer's own model and throws if `config.json` would make it do so.

After every staged run `lib/leakscan.mjs` scans the tool calls for absolute (or `~`, `$HOME`, `../`) paths outside the workspace and the `node_modules` cache, allowing executables, `/dev/null` and `/tmp`. It also flags nested agent CLI invocations (`claude`, `codex` or their npm packages in command position, however wrapped: `timeout 600 claude -p`, `sh -c "codex exec …"`, an absolute path; `which claude` or `grep codex` are not invocations) and `$TMPDIR` references that list the shared temp dir, climb out of it or name another `evals-*` dir there (scratch files such as `$TMPDIR/a.mjs` pass, like `/tmp`). Any hit flags the run `leaked` and lists the paths in `run.json`. The scan is conservative: review flagged paths before excluding a run.

## Layout

| Path | What |
|---|---|
| `config.json` | Full model IDs (never aliases), per-run caps (fixed 20 USD / 100 turns, open 30 USD / 150 turns), critic vendor preference and fallback family, a per-call critic cap (`critic_caps`, Claude only) |
| `run.mjs` | Thin dispatcher for the subcommands |
| `lib/schema.mjs` | Validators for case, run, checks, absolute and pairwise critiques, owner and ledger rows; each returns `{ ok, errors }` |
| `lib/versions.mjs` | Skill tree (`git rev-parse <ref>:skills/<name>`), dirty check, harness tree of `evals/lib` as on disk, input trees, case hash, ancestor-of-main check |
| `lib/ledger.mjs` | Append (validated) and read `ledger.jsonl`; never rewrites |
| `lib/runner.mjs` | The `run` flow |
| `lib/checkers/story.mjs` | The six story checks S1–S6 (below); `run-checks.mjs` is the `check` subcommand, which `run` also calls after collecting artefacts; `offline-preload.mjs` blocks the network for chart rebuilds |
| `lib/report.mjs` | Writes `REPORT.md` (sections below); `renderReport(rows, ctx)` is pure, `reportContext` gathers skill history from git and the installed CLI versions |
| `lib/critic.mjs` | The critic: rubric loading, prompt assembly, output schemas, validation with one retry, Markdown rendering, and the `score` and `pair` subcommands |
| `rubrics/<domain>/vN.md` | The critic's instructions; a new version is a new file with its change log in the header (never sent to the critic). A version is frozen once calibrated (`story/v1` since `datapressr-hcn.8`): its hash covers the whole file, so even a header edit splits its scores |
| `lib/render.mjs` | PNG renders of chart SVGs for `score --png`: headless Chrome at 2x, cropped with `sips` (macOS) |
| `calibration/<domain>/` | Critic calibration: `<case>/<run_id>/` run-0 directories (historical drafts and a negative control; `score` and `pair` find them by id, `--all` skips them), `build-runs.mjs` to rebuild them, and `*.json` hit rates that the report reads |
| `lib/owner.mjs` | The `owner` subcommand: blind pair judgements, single-run remarks, rounds to publishable |
| `lib/adapters/fake.mjs` | Zero-cost writer for tests |
| `lib/stage.mjs` | Blind workspace staging, the `node_modules` cache, artefact collection |
| `lib/adapters/claude.mjs` | The Claude recipe: settings file, flags, writer and critic roles, stream-json parsing |
| `lib/adapters/codex.mjs` | The Codex recipe: temp home, flags, writer and critic roles, `exec --json` parsing |
| `lib/adapters/index.mjs` | Vendor availability (binary, auth, canary) and critic choice with fallback |
| `lib/canary.mjs` | Canary probes, verdict and the `run` gate |
| `lib/leakscan.mjs` | Out-of-workspace path scan over a transcript's tool calls |
| `canaries/<id>/` | `canary.json` (probe statuses and redacted evidence); `transcript.jsonl` is gitignored |
| `cases/<domain>/<id>/` | `case.json` and `prompt.md` |
| `runs/<domain>/<case>/<run_id>/` | `run.json` and `artefacts/` (the writer's files at their workspace paths, e.g. `artefacts/site/stories/<slug>.md`); later `checks.json` and `critique*.json`. `transcript.jsonl` and `workspace.tar` are gitignored and hashed in `run.json` |
| `pairs/<pair_id>/` | Blind `A/` and `B/` for the owner (prose and charts only); the critic's `critique-AB.json`, `critique-BA.json` and `critique.md`; `mapping.json` (`{ "pair_id", "A": <run_id>, "B": <run_id> }`) is gitignored until `owner` records it as a `reveal` row |
| `ledger.jsonl` | One row per event (`canary`, `run`, `check`, `score`, `pair`, `owner`, `reveal`), each with `schema: 1`; re-scoring appends |
| `REPORT.md` | Generated; committed so trends read on GitHub |

A run id is `<YYYYMMDD-HHMM>-<case>-<vendor>-<model-short>-<skill7>-<n>` (UTC). `run.json` records the skill tree and ref, the harness tree (and whether it differed from `HEAD`), the case hash (SHA-256 over `case.json`, `prompt.md` and the input tree ids), the writer, cost and turns, and a SHA-256 and size for every artefact.

## Three scoring layers, never averaged

1. **Deterministic checks** (free): does the output meet the skill's own contract (artefacts present, word budget, every number in the prose visible in a chart, charts reproducible, inputs untouched, no dates past `as_of`). Failures here are the only automatic regressions.
2. **Critic** from a different vendor than the writer (Codex for a Claude writer and vice versa; a different Claude model family when Codex is unavailable, recorded as a fallback). Its primary job is a blind side-by-side of old-skill and new-skill outputs, judged in both orders; its 0–2 checklist is for diagnosis.
3. **Owner**: blind preference and verbatim remarks, the headline measure; the critic's agreement with the owner is the harness's own quality metric.

## The critic

`score` and `pair` (`lib/critic.mjs`, design section 5.2). The rubric (`rubrics/story/v2.md` by default, the highest version; `--rubric story/v1` for the frozen first one) makes the critic the reader who commissioned the story. Each critique is two calls: first the critic writes five to eight reader questions from the case question alone, before it sees any story; then it reads the story (or both) with those questions fixed in the prompt.

- **Absolute** (`score`): the questions marked yes/partly/no with where; the strongest findings missed; chart by chart, what it shows, whether its form fits and one fix; the one change that matters most; would you publish (`yes`, `with-edits`, `no`); at most five rule-shaped lessons; and last the 0-2 checklist (`argument`, `depth`, `charts`, `honesty`, `reader_questions`, `prose`, plus `data_choice` in open mode). Writes `critique-<version>-<n>.json` and `.md` in the run directory (findings first, checklist last; re-scoring adds `-2`, `-3`) and a `score` row with the scores, the critic and the cost.
- **Pairwise** (`pair`): both runs must be of the same case. A coin toss decides which is `A`; `pairs/<pair_id>/A` and `B` get the reader prose (title-only frontmatter, no friction notes) and the SVGs it embeds. The critic judges twice, order `AB` then `BA`; it sees the stories by position as Story 1 and Story 2 and answers which it would publish with fewer edits (`1`, `2` or `tie`), the margin (`clear` or `slight`), why, and the reader questions each answers. The stored judgements use the pair's labels (`shown` records which label held each position). The `pair` row's result is a win only when both orders prefer the same run; a split is a tie.

Rubric v2 adds two optional sections that switch on harness behaviour. `## Fixed data`: in fixed mode every step (questions, absolute, pairwise) also gets an inventory of what the writer was given, built deterministically from each input's `datapackage.json` and CSVs at the pinned commit (`dataInventory`: titles, sources, rows, field descriptions, year and date ranges over rows with an observation, values of text fields with at most 20 distinct values); reader questions may then be answered `set-aside` when they need evidence outside that data, and set-aside questions do not count against the story. `## Chart reading`: each chart in an absolute critique also records `glance` (what a reader concludes in five seconds), `glance_matches_prose`, `encodings` (what each colour, marker and line style means and how a reader finds out) and `encodings_clear`.

What the critic sees: the rubric's sections for the step (never its header), the case question, type, data mode, as_of and word budget, the case's references, and the story: outline (absolute mode only), prose, each embedded SVG as source (long path data elided, so colours and markers stay) with the text labels drawn on it, and `DATA.md` in open mode. Owner feedback only with `--calibrate`. It never sees the skill, other files in the run (run.json, checks, earlier critiques, transcripts), `LESSONS.md`, run dates, or any run id, skill or harness tree or skill ref; those are redacted wherever they appear in the material. The tests in `lib/critic.test.mjs` prove this with marker files.

`--png` (absolute mode, Codex critic only) also attaches a PNG render of each chart, so the critic can judge colour, markers and clipping; the row and critique record `png`. Calibration found it necessary but not sufficient for visual remarks, so it is off by default.

Critic choice: `--critic auto` (the default) uses `pickCritic` (the other vendor when available, else the writer's vendor with the fallback family); `--critic claude|codex` forces a vendor (the fallback family when it is the writer's); `--critic-model` overrides the model (cheap smoke tests), never the writer's own; `--critic fake` is free and deterministic. Both vendors run with tools off and a JSON schema (`claude -p --json-schema`, `codex exec --output-schema`). An answer that fails the call or validation is retried once; then `score` appends a `critic_failed` row and `pair` removes the half-written pair and exits non-zero.

First smoke, 2026-10-10, in a scratch evals dir (nothing committed), on copies of the published France and Keeling stories posing as q01 runs: `--critic auto` chose Codex (no fallback), run on `gpt-6-luna` via `--critic-model`; one absolute critique (2 calls, about 52k input and 2k output tokens) and one pair (3 calls, about 94k input and 1k output tokens; France preferred in both orders, `clear`). A Claude critic on `claude-haiku-5-5` (forced, so `fallback: true`) scored the same run for 0.019 USD.

Blindness of the pair files: `critique-*.json` plus the pair row's `preferred_run_id` in the ledger reveal which run is `A`. Show the owner only `A/` and `B/`, and do not read the critique files or the pair row aloud before `owner` has recorded the judgement.

## The report

`node evals/run.mjs report` (or `npm run eval:report`) regenerates `REPORT.md` from the ledger; `run`, `check` and `owner` regenerate it too. It has no timestamp, so regenerating with nothing new changes nothing. Besides the ledger it reads the skill's git history (to order skill trees and list commits) and the installed CLI versions (for the canary flag). Sections:

- **Flags.** Hard regression: a check that passed on every run of the previous skill tree for a case and fails on a run of the next tree (deterministic checks are the only automatic regressions). Soft flag: a pair where the older tree won in both orders. Leaked runs. A missing or failed canary for the installed CLI version and current recipe.
- **Per skill change.** Each skill tree with runs, newest first: the cases run, the `git log --oneline a..b -- skills/<name>` range since the previous tree (with a compare link), win/tie/loss of new vs old in order-swapped pairs with n (a win only when both orders agree; split orders are a tie), and owner preferences once revealed. Then the skill commits after the earliest tree with runs that no pair covers (a pair old -> new covers the commits between them).
- **Per case.** Runs newest first, one table per writer `model_actual`: date, run, skill tree, checks, cost, turns, flags; then one table of absolute scores per rubric version (never mixed), with the critic and publishable; then the pairs; then rounds to publishable and the owner's remarks, verbatim.
- **Noise.** Per case, writer model and rubric: each dimension's range (min-max) per skill tree with n, and a comparison row that says higher or lower only when the ranges do not overlap, otherwise "no detectable change"; n=1 is an anecdote. Critic-only spread from re-scoring one run. No standard deviations or p-values.
- **Harness quality.** Judge-owner agreement on pairs per rubric version (owner's preferred run against the critic's pair result; "neither" agrees with a tie; the critic stands alone for small edits only at 4 of 5), owner vs critic checklist scores where both exist, calibration hit rates (`calibration/<domain>/*.json`, each `{ rubric, label, hits, total }`), critic fallback rate, critic validation failures, leaks caught, and canary status per vendor.

## Owner capture

The owner's judgement is the headline measure, so it is recorded blind and verbatim. The agent shows the owner `pairs/<pair_id>/A` and `B` (prose and charts only), saves the reply exactly as given to a file, and runs:

```sh
node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file reply.md [--scores A.prose=1,B.prose=2]
node evals/run.mjs owner <run_id> --remarks-file reply.md [--scores argument=2,prose=1]   # remarks on a single story
node evals/run.mjs owner --rounds <case_id> <n> [--remarks-file notes.md]                 # review rounds a story took to reach the site
```

For a pair, `owner` appends the owner row first (A/B labels as the owner saw them, remarks byte for byte, never summarised); only then does it read `pairs/<pair_id>/mapping.json`, append a `reveal` row (which run was A and B, and the run the owner preferred) and print the agreement with the critic. A pair can be judged once; if the mapping was missing at the time, the owner row stays and `owner <pair_id> --reveal` finishes the reveal later. Do not open `mapping.json` or tell the owner which side is which before this.

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
