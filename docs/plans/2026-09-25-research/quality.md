# Skill quality and evals: scoping report

Date: 2026-09-25. Scope: DataPressr workstream "skill quality and evals" (beads `datapressr-ck8`, `datapressr-d6n`, `datapressr-5k8`, `datapressr-zwt` item 5, `datapressr-jn8`). Research and scratch experiments only; nothing in the repo was changed.

Evidence read: `AGENTS.md`; `skills/README.md` and all eight `skills/*/SKILL.md` (plus `enrich/references`, `story/references` listings); `scripts/validate-datapackage.mjs` + tests + fixtures; `scripts/wrangling-idioms.mjs`; `docs/structure-benchmark.md`, `docs/benchmarks/round-2-json.md`, `docs/benchmarks/round-2-join.md`; `site/docs/source-discovery-playbook.md`; the five beads; `../line-charts/{ANALYSIS,EVALUATION}.md` and `../tables-bakeoff/ANALYSIS.md`; the local `claude plugin eval` CLI (Claude Code 2.1.282).

Note on concurrency: while this research ran, another session committed `a86e8d6` and appended to `datapressr-zwt` (2026-09-25) an agent decision, flagged for owner review: **adversarial review is required at `structured` for any dataset with a custom parser or many source documents, recommended otherwise; codification filed in "the quality epic".** Section 3 builds on that decision rather than re-opening it. That note refers to a quality epic that I could not find in `bd list` at the time of writing, so it may still be in flight.

---

## Headline findings

1. **The data-level check is cheap and currently finds nothing wrong.** A roughly 200-line, zero-dependency scratch prototype checked every CSV value in all six datasets against its declared schema. That covered 14 checks, 21 resources and about 2 million cells (airports alone is 86,094 rows × 21 fields, about 1.8 million). All six pass with **0 errors and 0 warnings**, and the slowest (airports) takes 218 ms. The prototype does catch every ck8 fixture case: an invalid date (`2020-02-30`, `2020/04/01`), a non-number, a non-integer, a non-boolean, a duplicate composite key, a blank key, a short row, and one duplicate row appended to a copy of population-growth. It also accepts quoted CSV (embedded comma, `""` escapes, embedded newline) and a missing optional value. So it can go on by default without breaking anything that exists.
2. **The metadata validator never looks at values, and the definition of done relies on it.** `AGENTS.md` says "`/validate` passes with no warnings" is part of done for `structured`, and readers will assume that covers the data. Today it does not. The six datasets are clean because each `build.ts` asserts its own invariants, not because anything shared checks them.
3. **`claude plugin eval` exists and is useful, but it cannot run a deterministic data grader.** Its grader types are `regex`, `tool_order`, `tool_used`, `file_exists`, `llm` and `baseline`. `llm` and `regex` can read a created file (`{source: file, path}`), but no grader can execute `node build.ts` or the validator in the workspace. It does give ablation (with vs without the skill), 3 runs per case by default, a model override, a cost ceiling and JSON output. So the structure eval needs a thin runner of our own. `claude plugin eval` fits later for "does the skill fire" cases.
4. **Cost and time capture is free.** `claude -p --output-format json` returns `total_cost_usd`, `duration_ms`, `duration_api_ms`, `num_turns`, `usage` and `modelUsage` (verified with a one-turn haiku call: $0.022, 2.3 s). Codex is also installed (`~/.local/bin/codex`), so a two-agent comparison is possible now.
5. **co2-ppm's monthly file is the right first fixture.** It is 38,688 bytes, has 40 `#` preamble lines, a date split across year and month, and a different "no data" sentinel in each column (`-1` ×195 in ndays, `-9.99` ×196 in sdev, `-0.99` ×194 in unc). A zero-dependency golden build and golden output already exist. Its unguided judgments (1st vs 15th of the month, keep `decimal_date` or not, column naming) are exactly where two runs diverge, which is what the eval should measure.
6. **Discovery is not ready to graduate on rep 3 alone, as rep 3 is now framed.** The 2026-09-20 note on jn8 says the licence now "resolves by owner assumption". So rep 3 will probably still not walk the blocked-publication path, which is the one condition the playbook set. My recommendation is a conditional yes (section 3.3).

---

## 1. Data-level validation (ck8): the contract

### 1.1 Where it lives

**Extend `scripts/validate-datapackage.mjs`. Don't add a second script.** Reasons:

- It is the single file that `init` copies into each dataset and that the `validate` skill runs. A second file doubles the copy/sync surface. Only 2 of 6 datasets (co2-ppm, oil-prices) carry a copy today, and both are byte-identical to root.
- The definition of done names one gate. A second command, or an opt-in flag, is the kind of step the benchmarks show gets skipped: the licence/source rule exists because it was skipped.
- The cost is small: about 150 lines added to a 146-line file, still zero dependencies. Runtime is under 250 ms on the largest dataset.

**On by default**, with `--metadata-only` to skip the value checks. That is the escape hatch for a huge file or a non-CSV resource. The evidence for default-on is zero false positives across six real datasets. This does change what "0 errors" means, so the `validate` skill text and `AGENTS.md` must say so in the same commit.

Keep the build-level assertions in `build.ts`: key profiling, join orphans, anchored literals, coverage counts. They check properties of the *source*. The validator checks the *published file against its own declared schema*. These layers are complementary. The validator is the "something other than the thing that produced it" for schema conformance only.

### 1.2 API and CLI

```js
export function validateDatapackage(dir, { data = true } = {}) // → { errors: string[], warnings: string[] }
export function validateResourceData(dir, resource)              // → { errors, warnings } (exported for tests)
export function parseCsv(text)                                   // → { rows: string[][], lines: number[], issues }
```

```sh
node scripts/validate-datapackage.mjs .                   # metadata + data (default)
node scripts/validate-datapackage.mjs . --metadata-only   # today's behaviour
node scripts/validate-datapackage.mjs . --json            # {errors, warnings, stats:{rows, cells, ms}} for the eval runner
```

Exit code is unchanged: 1 if there are errors, else 0.

### 1.3 What it checks (minimal; this is exactly what the schemas use today)

Across all six packages, the declared types are `string`, `integer`, `number`, `boolean`, `date` and `year`. Only population-growth has a `foreignKeys`. No field declares `constraints`, `format`, `missingValues` or a `dialect`.

| Check | Level | Rule |
|---|---|---|
| Encoding | error | Valid UTF-8 (`TextDecoder` with `fatal: true`); a BOM is an error (house rule). |
| Line endings | warning | CR anywhere, or no trailing newline. House format is LF + trailing newline. |
| CSV syntax | error | RFC 4180. Unterminated quote, or a quote inside an unquoted field. |
| Header | error | Header row equals `schema.fields[].name` in order. If not, stop checking that resource (no cascade). |
| Row width | error | Every record has exactly `fields.length` cells. |
| Missing | — | A cell is missing if it is in `schema.missingValues`, default `[""]`. A missing cell skips type checks. |
| Required | error | A missing value in a field with `constraints.required: true` **or in any `primaryKey` field** (Frictionless implies required). |
| `string` | — | Always valid. **Warning** on leading or trailing whitespace (the population-growth `"Sub-Saharan Africa "` lesson). |
| `integer` | error | `^-?\d+$` |
| `number` | error | `^-?(\d+\.?\d*\|\.\d+)([eE][-+]?\d+)?$`. No `NaN`/`INF`/group separators (house format; a `1,000` means the build forgot `cleanNumber`). |
| `boolean` | error | `trueValues`/`falseValues` if declared, else Frictionless defaults `true True TRUE 1` / `false False FALSE 0`. |
| `date` | error | `YYYY-MM-DD` **and a real calendar date** (leap years). `format` other than `default` is a warning: "not checked". |
| `year` | error | `^-?\d{4}$` |
| Other types | warning | `"type X not checked"`. Honest, not silent. `datetime`, `yearmonth` etc. are added when a dataset first uses them. |
| `constraints.enum` | error | Value in the list (cheap, and useful for coverage-table `layout`/status columns). |
| Primary key | error | Composite tuple unique. Message cites the first-seen line. |
| Foreign keys | error | Same-package references only. Orphan count + first orphan line. |

Out of scope for the first cut: `minimum`/`maximum`/`pattern`/`unique` constraints, number `decimalChar`/`groupChar`, `dialect` handling (the house rule is "no dialect"), non-CSV resources, and a snake_case column-name lint. The last one would warn on oil-prices' deliberate `Date`/`Price` and needs an exception mechanism first; file it separately if wanted.

### 1.4 Output format

Same style as today: one line per finding, with a location and the offending value.

```
✗ obs:3: date = "2020-02-30" is not an ISO 8601 date (YYYY-MM-DD)
✗ obs:5: duplicate primary key (country_code, date) = (GBR, 2020-01-01), first seen line 2
✗ obs:6: country_code is empty but part of the primary key
✗ obs:9: row has 4 cells, header has 6
✗ obs: ... 812 more of the same (type value)
⚠ countries:17: country_name has leading/trailing whitespace: "Sub-Saharan Africa "
```

`resource:line` uses the physical line where the record starts, so it stays correct across quoted newlines. The report prints at most 5 findings per (resource, check, field) plus one "N more" line, so one systematic bug doesn't produce 17,000 lines.

### 1.5 Acceptance fixtures

Follow the existing `scripts/fixtures/<case>/` pattern: one directory per case with `datapackage.json` and `data/`.

| Fixture | Content | Expected |
|---|---|---|
| `data-valid-quoted` | Field with `a, quoted ""note"""`, a quoted field with an embedded LF, a missing optional number/integer/boolean | 0 errors, 0 warnings |
| `data-invalid-date` | `2020-02-30`, `2020/04/01`, `2021-02-29` (non-leap) | 3 errors naming field, line and value; `2020-02-29` accepted |
| `data-bad-number` | `abc` in number, `2.5` in integer, `1,000` in number, `yes` in boolean | 4 errors |
| `data-duplicate-key` | Composite key `(country_code, date)` repeated; single-field key repeated | 2 errors citing the first-seen line |
| `data-empty-key` | Blank cell in a primaryKey field | 1 error "part of the primary key" |
| `data-row-width` | One short row, one long row | 2 errors, other rows still checked |
| `data-header-mismatch` | Header order differs from schema | 1 error; no per-row cascade |
| `data-bom-crlf` | BOM + CRLF + no trailing newline | 1 error (BOM), 2 warnings |
| `data-fk-orphan` | Child key not in parent | 1 error with orphan count |
| `data-unsupported-type` | A `geopoint` field | 1 warning "not checked", no error |
| (existing) `valid` etc. | Unchanged | Unchanged, including `--metadata-only` parity |

Tests also run the CLI over the six real datasets and assert 0/0, so a dataset regression fails `npm test`. The scratch prototype is at `prototypes/check-data.mjs`: about 200 lines covering all rows above except the enum/unsupported-type fixtures, which it handles but I did not exercise.

### 1.6 Adoption path

1. Land it in the root validator with its tests and fixtures. `npm test` stays green (six datasets pass).
2. Update the text in the same commit: `skills/validate/SKILL.md` (list the value checks and drop the "by hand" fallback list's implication that values are unchecked), `skills/structure/SKILL.md` step 5, and `AGENTS.md`'s definition of done ("`/validate` checks values against the schema").
3. Refresh the two dataset copies (co2-ppm, oil-prices). Consider making `scripts/sync-dataset-agents.mjs` (from `a86e8d6`) also sync the validator copy and fail `npm test` on drift. It is the same problem, and that session just solved it for `AGENTS.md`.

---

## 2. Skill evals (d6n): minimal first harness

### 2.1 Principles (from the benchmarks, the bake-offs and the playbook)

- **Fixed offline inputs.** Every case runs from a committed raw snapshot in a temp workspace, with network blocked for the agent and for the build. That way "the source changed" can never masquerade as "the skill regressed" (d6n's explicit concern). The line-charts rule applies: generate inputs once and never regenerate them.
- **Deterministic checks and judged checks are scored separately.** Pass/fail comes from scripts. Judgment gets its own rubric score with its own variance, and is never averaged into the deterministic score.
- **At least one check anchored outside the pipeline** (playbook §6). Golden anchors are figures a human read off the raw file and typed in as literals. They are not "whatever the reference `build.ts` emits".
- **Measure the unguided-judgment count**, the benchmark's recurring ⚠ row. The task prompt requires a `DECISIONS.md` listing every decision the skill didn't cover. That count, and whether two runs made the *same* call, is the skill-quality signal the round 1/2 benchmarks were scoring by hand.
- **Oracle and saboteur arms first.** Before spending on agent runs, prove the graders work. The existing `build.ts` must score 100% (oracle). A deliberately broken build must fail the specific checks it should (mutation, the playbook's "try to break your own build").
- **Variance.** At least 3 runs per arm (the `claude plugin eval` floor too). Report pass rate and median/min/max cost, time and turns. Treat single runs as anecdotes (tables-bakeoff's variance caveat).

### 2.2 Layout

Put evals at the repo root, not inside `skills/`, so `npx skills add` doesn't ship fixtures to users.

```
evals/
  README.md                         how to run, what each arm means
  run.mjs                           zero-dep runner (Node 22+)
  graders/structure.mjs             deterministic graders, exported for tests
  graders/structure.test.mjs        oracle + saboteur tests (part of npm test; no agent calls)
  structure/co2-monthly/
    task.md                         the prompt given to the agent
    fixture/                        copied into a fresh temp workspace per run
      archive/co2_mm_mlo.csv        byte-identical to the dataset's archive (sha256 eb751e4e…)
      PROVENANCE.md                 source URL, retrieval date, NOAA terms quoted (so no fetch is needed)
      datapackage.json              stub: name, status "archived", empty resources
      AGENTS.md                     dataset-conventions subset (as synced by a86e8d6)
      scripts/validate-datapackage.mjs
    golden/
      anchors.json                  human-read literals + expected counts (see 2.4)
      co2-monthly-mlo.csv           current golden output (sha256 37492bde…), used for semantic diff
    oracle/build.ts                 the existing co2 build, trimmed to the monthly resource
  results/                          gitignored; one dir per run
```

### 2.3 Runner (`evals/run.mjs`)

```sh
node evals/run.mjs structure/co2-monthly --arm skill --arm no-skill --agent claude --model opus --runs 3
node evals/run.mjs structure/co2-monthly --agent codex --runs 3          # second agent
node evals/run.mjs structure/co2-monthly --arm oracle                    # no agent; grader self-test
```

For each (arm, run):

1. **Stage.** Copy `fixture/` to a fresh temp dir and `git init`, then commit it as a baseline for diffing. Arm `skill` copies `skills/structure/` (and `skills/archive/`, which `structure` references) into `.claude/skills/`, or into `AGENTS.md`/skills for Codex. Arm `no-skill` stages only `AGENTS.md`, which is the realistic baseline because `AGENTS.md` already carries the contract.
2. **Execute.** `claude -p "$(cat task.md)" --output-format stream-json --model M --max-turns 60` with cwd set to the workspace. Deny `WebFetch`/`WebSearch`, and turn on Claude Code's sandbox with network off for Bash. Save the transcript, then read `total_cost_usd`, `duration_ms`, `num_turns` and `usage` from the final result event. For Codex, run `codex exec --json` with its equivalent sandbox flag. Use one adapter function per agent that returns `{transcript, cost_usd?, duration_ms, turns?}`, and leave cost null where the agent doesn't report it rather than guessing.
3. **Grade deterministically** (2.4) on the workspace. Also run the build under `node --import ./no-net.mjs build.ts` (a preload that makes `fetch` and `http(s).request` throw), so "offline build" is enforced rather than claimed.
4. **Save** `grades.json`, `metrics.json`, a tarball of the workspace, and the transcript.
5. **Summarise.** Write `results/<ts>/summary.md` with one row per arm: per-check pass rate over runs, median/min/max cost, wall-clock and turns, `DECISIONS.md` count, and agreement on key judgment calls across runs (for example, did all runs date months to the 1st?).

Keep `claude plugin eval` for what it's good at, **later**: should-fire/should-NOT-fire trigger cases on skill descriptions (for example, "wrangle this CSV" should fire `structure`; "remember this URL" should fire `capture` and not `structure`). Its with/without ablation and `tool_used: Skill` reporting fit that job. It can't run `node build.ts`, so it can't be the structure outcome grader.

### 2.4 Deterministic graders for `structure/co2-monthly`

Each grader is a named pass/fail result with a message. None needs the agent's column names to match golden, so judgment calls aren't penalised as failures.

| # | Check | How |
|---|---|---|
| D1 | Artefacts exist | `build.ts`, `datapackage.json`, ≥1 `data/*.csv`, `DECISIONS.md` |
| D2 | Offline build succeeds | `rm -rf data && node --import no-net.mjs build.ts` exits 0 |
| D3 | Deterministic | Build twice → identical SHA-256 for every `data/*.csv` |
| D4 | Validator clean | The validator with data checks from §1 on by default (`--json`): 0 errors, 0 warnings |
| D5 | Contract fields | `status: "structured"`; `licenses` non-empty with an SPDX-shaped name; `sources[].path` contains `gml.noaa.gov`; every resource has typed fields and a `primaryKey` |
| D6 | House format | snake_case headers, LF, trailing newline, no `dialect` block |
| D7 | Row count | Exactly 821 observation rows (822 non-comment raw lines minus header) |
| D8 | Anchored literals | Human-read from the raw file: the 1958-03 row has CO₂ 315.71 and deseasonalised 314.44, plus ~4 more rows (one mid-series, the last month, one row where ndays is present). Located by value, column-agnostic: some column holds 315.71 on the row whose date column starts `1958-03`. |
| D9 | Sentinels handled | No cell anywhere equals `-1`, `-9.99`, `-0.99` or `-99.99`. Empty-cell counts per column match {195, 196, 194} as a multiset. This catches both "kept sentinels" and "one global sentinel list". |
| D10 | Semantic golden diff | For each golden column, some agent column has an identical value multiset after numeric normalisation (`Number(x)`). Report `k/7` matched. `decimal_date` being dropped is allowed but reported (a judgment call, not a failure). |
| D11 | Provenance | `build.ts` has source URL + retrieval date + licence in a header comment (regex) |
| D12 | Dates ISO | Date column matches `YYYY-MM-DD`. Whether it is day `01` or `15` is recorded as a judgment call, not failed. |
| D13 | Raw untouched | `archive/` SHA-256 unchanged vs the baseline commit |

**Oracle arm:** `oracle/build.ts` must pass D1–D13 (with a canned `DECISIONS.md`). **Saboteur tests** in `graders/structure.test.mjs` mutate a copy of the oracle output: keep `-99.99` (fails D9), drop the last month (D7, D8), swap `std_dev`/`uncertainty` (D9 multiset holds, but D8 or D10 must catch it; if nothing does, add an anchor that does, as the playbook warns), add `Date.now()` to the output (D3), CRLF (D4/D6). This makes the harness testable with `npm test` and no agent spend.

**A variant, for later, not the first task.** `co2-monthly-pinned` gives the exact output schema in the prompt, so D10 becomes a byte-hash equality against golden. That turns an eval of *judgment* into an eval of *execution*. It's useful for comparing models, less so for improving the skill.

### 2.5 Judged checks (separate score, rubric 0–2 each)

Run by a separate `claude -p` judge (sonnet, not the model under test) over `build.ts`, `datapackage.json`, `DECISIONS.md` and the diff. Calibrate against the owner on the first comparison run before trusting it.

- J1 Asserts the source header / fails loudly on drift (the skill's "assert the header" rule).
- J2 Sentinels handled per column, not globally; zero and negative values not dropped.
- J3 Field descriptions are honest: units, what empty means, monthly-mean vs point reading.
- J4 `DECISIONS.md` is complete. The judge compares it against a reference list of known unguided calls (day-of-month, `decimal_date`, deseasonalised naming, licence reasoning) and counts misses.
- J5 Build readability: a reviewer could re-run and understand it in five minutes.
- J6 No claims beyond the source (no invented licence, no invented methodology).

Several of these can be partly scripted later, such as J1 (mutate the fixture's header and check the build throws). Promote a judged item to deterministic whenever that becomes possible.

### 2.6 Comparing two agents or models

Use the same fixture, prompt and graders for every arm, with at least 3 runs each. Report per arm:

- deterministic pass rate per check
- judged mean ± range
- median/min/max `total_cost_usd`, `duration_ms` and `num_turns`
- `DECISIONS.md` count
- a **convergence** column: for each known judgment call, how many runs chose the same answer

Low convergence on a call means the skill should decide it. That is the benchmark's "two runners could reasonably diverge" finding, now measured rather than asserted. Three comparisons are worth running first: skill vs no-skill (same model) shows whether the skill adds value; model A vs B with the skill shows robustness; and Claude vs Codex with the skill shows that skills aren't secretly Claude-specific.

Rough budget: a structure run on this fixture is probably 20–50 turns. At current prices, 2 arms × 3 runs is on the order of $10–30 and under an hour wall-clock. That is a guess to be replaced by the first `summary.md`. Set `--max-cost` in the runner as a hard stop.

### 2.7 Fixture sketch for the other skills (not first; for the d6n protocol doc)

| Skill | Fixture | Deterministic | Judged |
|---|---|---|---|
| capture | A URL + one-line idea. `bd`/`gh` replaced by stub scripts on PATH that log their args | Exactly one create call; labels `dataset,inbox`; no WebFetch in the trace (cheap `claude plugin eval` fit); should-NOT-fire case | Entry is ≤3 lines, no research |
| archive | Raw file served from a localhost HTTP server started by the runner | `archive/` bytes = served bytes (SHA-256); provenance comment has URL/date/licence-or-"unknown"; `status: archived`; nothing written to `data/` | — |
| structure | co2-monthly (above), then a trap variant (header reordered in the snapshot → build must throw) and a quoted-CSV source | §2.4 | §2.5 |
| enrich | Structured oil-prices (8 resources, the −36.98 value) | `enrich.ts` twice → identical `SUMMARY.md`; `data/` hashes unchanged; stats block equals golden stats from `references/enrich-template.ts`; −36.98 present; `views` reference real resources/fields; hand-written text survives a rerun | "What stands out": every number in it appears in the stats table (scriptable), no unattributed cause |
| story | Enriched dataset + an approved outline (fixed input), so only charts + prose are evaluated | SVGs byte-identical over two builds; prose 300–700 words; every number in the prose appears in an SVG `<text>` or on the exempt list; links resolve | Argument strength, voice; expensive, human-judged; defer |
| init / validate / push | — | Trivial; covered by unit tests; no agent eval needed | — |

### 2.8 The ONE first implementation task

**"Eval harness v0: `structure/co2-monthly` fixture, deterministic graders, oracle + saboteur tests, and a runner for skill vs no-skill."** It is specified as task T4 in section 4. It deliberately includes **no judge, no second fixture and no `claude plugin eval` integration**. Its done-state is one real comparison table (T5 is the paid run; T4 must at least execute one run per arm to prove the plumbing).

---

## 3. Process rules worth codifying now

### 3.1 Adversarial review (zwt item 5, decided 2026-09-25 by agent under delegation, pending owner review)

**When it is required.** Before setting `status: structured`, when any of these hold:

- (a) the build contains a custom parser for a non-tabular or layout-dependent format (PDF, HTML scrape, prose/Markdown extraction, spreadsheet with preamble or sparse headers)
- (b) the record set is assembled from **many source documents**, meaning distinct documents that can differ in layout (not pages of one API response)
- (c) any heuristic *selects or classifies* records
- (d) the build joins tables

It is recommended otherwise, and not needed for a clean single-file CSV/JSON source that passes the validator. Against the six datasets: Tesla (a, b, c) and NWS (a, b, c) required; airports (d) required; population-growth and oil-prices borderline (oil-prices has the preamble and `.xls`); co2-ppm not required.

**Who.** A fresh agent or human with no hand in the build, briefed only with the dataset directory, its archive and the review checklist. No access to the author's transcript, since independence is the point: "in both runs, the most valuable finding came from outside the agent doing the work."

**What the reviewer does** (in order; bounded to about 30–60 minutes):

1. **Re-derive values independently.** Take at least one row per resource, per layout era and per extreme (min/max), plus the newest record. Read them from the archived source with the reviewer's own scan, not by running `build.ts`, and list them with their locations in the source.
2. **Read the names.** Print every distinct value of every categorical column, including the coverage table's own columns, and read the list. This is the check that caught `River Flood}}`. Arithmetic doesn't check names.
3. **Mutate the build.** In a scratch copy, apply at least three mutations: swap two same-typed columns for one era, drop one zero-valued record, truncate the last document, and corrupt one label. For each, report which check fired. **A mutation that nothing catches is a finding.**
4. **Check anchoring.** At least one literal read off the source by hand exists per layout era, in a test. If none exists, that is a finding (playbook §6).
5. **Run the gates.** The validator (with data checks), a double build (hashes identical) and `npm test`.
6. **Verdict.** `APPROVED`, or numbered findings with file:line references. Findings go back to the author, and the new revision is re-reviewed.

**Record it** like the story outline gate: reviewer identity, commit, SHA-256 of `datapackage.json` and each data file, the re-derived values, and each mutation with the result. Put this in the dataset README "Review" section or in the bead's close notes. Elapsed time is not approval.

**Where it goes.** A short "Review gate" step in `skills/structure/SKILL.md` (between "Validate" and "Prove reproducibility", with the trigger list), plus `skills/structure/references/adversarial-review.md` holding the reviewer brief verbatim, so it can be pasted into a fresh agent. `site/docs/source-discovery-playbook.md` Limitations should then say the gap is closed and point to it. It should also become a rule in any future `discover` skill.

### 3.2 Coverage-table guidance (5k8)

Put this in `skills/structure/SKILL.md` as a short section after "Joining tables", with Tesla and NWS as worked examples:

- **When.** The dataset is assembled from many source documents or candidates, especially where a listing or index defines the record set. Record the answer for the non-document datasets explicitly rather than retrofitting. Population-growth: no; the hashed page manifest plus the `summed rows = total` assertion already accounts for every input. Airports: no; four files, and the join-plan orphan counts serve the purpose. Co2-ppm and oil-prices: no.
- **What.** A published resource with a typed schema, not a prose note. One row per *candidate*, including ones that 404ed or were not extractable. Columns that earned their place: candidate id / period, `url`, `archived_path` (empty if not retrieved), `http_status`, `layout` (or format regime), `extracted` (boolean), `rows_contributed` (integer), `note`.
- **Rules.**
  1. The count is necessary but not sufficient: both reps shipped wrong labels with correct counts.
  2. Every column is computed from a property *of the document*, never from the year, filename or URL.
  3. Print the distinct values of each categorical column and read them.
  4. Assert no interior gaps and that the newest candidate produced rows.
  5. Assert `sum(rows_contributed)` equals the data row count in `build.ts`/tests.
  6. Have something other than the producer check it: anchored literals, and the adversarial review above.
- **Validator support.** A `constraints.enum` on `layout`/`extracted`-style columns makes the §1 validator catch a novel label. That is cheap, and it partly mechanises rule 3.

### 3.3 Is discovery ready to graduate into a `discover` skill after rep 3?

**Conditional yes, with the adversarial review codified first.** The case for a no: the playbook's own graduation condition was "a rep where the licence question does not resolve cleanly". jn8's 2026-09-20 note says rep 3's candidate (Fed SEP) now resolves "by owner assumption". So rep 3 will likely again *not* walk the blocked-publication path to a stub-plus-evidence-report end, and more reps by the same agent family won't fix the "n is not independent" limitation either.

Graduate after rep 3 if:

1. rep 3 produces either a dataset or a documented dead end
2. rep 3's replay table shows no *new* failure species that the rules don't address, or the new species is written into the playbook before graduating
3. the adversarial review (3.1) is already a structure rule the skill can reference, because the playbook itself said "that gap is worth closing before any of this is graduated"
4. the skill is thin: the workflow, handoff template and escalation list in `SKILL.md`, with the playbook moved to `references/`. Untested rules keep their `[untested]` tags in the skill, and the licence section states "owner-ruled positions apply; otherwise reject if an alternative exists, else stub + evidence report + escalate", marked untested.

If the owner prefers the playbook's original bar, rep 4 must be chosen so no ruling covers it (a non-US or third-party-copyright source with no alternative). Tell jn8's runner now that rep 3 should state explicitly which of these two readings it satisfies.

A discover eval is harder than a structure eval: it's web research, so it needs a recorded local mirror of a source. Defer it until the skill exists.

---

## 4. Sequenced bead-sized tasks

Dependencies are on tasks in this list unless a bead id is given. T1–T3 can run in parallel. The eval track is T4 → T5 → T6/T7.

**T1. Validator: check CSV values against the declared schema** (implements ck8; close ck8 with a pointer to this contract)
Extend `scripts/validate-datapackage.mjs` with the §1.3 checks, on by default, with `--metadata-only` and `--json`. Add the §1.5 fixtures and tests, and a test that the six real datasets report 0/0. Update `skills/validate/SKILL.md`, `skills/structure/SKILL.md` step 5 and the `AGENTS.md` definition of done in the same commit, and refresh the two dataset copies.
*Acceptance:* `npm test` green, including every §1.5 fixture's expected output; `node scripts/validate-datapackage.mjs <each dataset>` gives 0 errors and 0 warnings; zero dependencies; airports under 1 s; no doc claims a check that isn't implemented. *Deps:* none. The owner reviews §1 as the ck8 contract before merge.

**T2. structure: codify the adversarial review gate** (implements the zwt item-5 decision)
Add a "Review gate" step with the trigger list to `skills/structure/SKILL.md`, and `references/adversarial-review.md` with the reviewer brief (§3.1: re-derive, read names, mutate, anchor, gates, verdict, record). Update the playbook Limitations to point at it.
*Acceptance:* the trigger list classifies the six datasets as in §3.1; the brief is pasteable into a fresh agent unchanged; the record format matches the story outline review; `npm test` green. *Deps:* owner ratification of the zwt 2026-09-25 decision (or proceed and flag, as that session did).

**T3. structure: coverage-table guidance** (existing bead `datapressr-5k8`)
As §3.2, including the recorded "not needed" answers for population-growth, airports, co2-ppm and oil-prices, and the `constraints.enum` tip.
*Acceptance:* per 5k8; the section links to the T2 reviewer brief for "have something else check it". *Deps:* T2 (soft; for the cross-link), T1 (soft; for the enum tip to be true).

**T4. Eval harness v0: `structure/co2-monthly`** (the ONE first task from d6n; close d6n after the protocol is in `evals/README.md`)
Build `evals/` as in §2.2–2.4: the fixture copied from co2-ppm's archive with provenance, `golden/anchors.json` with human-read literals, graders D1–D13, the oracle arm, saboteur tests in `npm test`, and `run.mjs` with a Claude adapter (stream-json cost/time/turns capture, network denied, no-net preload for the build). Execute one run each of `skill` and `no-skill` to prove the plumbing.
*Acceptance:* the oracle scores 13/13; each saboteur fails its intended check, and any mutation no check catches gets a new anchor; `npm test` stays free of agent calls and green; one `results/<ts>/summary.md` with both arms, costs and times; `evals/results/` gitignored; nothing under `evals/` ships with `npx skills add`. *Deps:* T1 (D4 uses data checks; can stub with `--metadata-only` until T1 lands).

**T5. First comparison: structure skill vs no skill, 3 runs each, plus a Codex arm**
Add the Codex adapter. Run `skill`/`no-skill` on one Claude model and `skill` on Codex, 3 runs each, under a `--max-cost` cap. Write `docs/benchmarks/eval-structure-001.md`: pass rates, cost/time/turns, `DECISIONS.md` counts and the convergence table of judgment calls. File a bead for each low-convergence call as a candidate skill edit (don't apply them).
*Acceptance:* the report exists with raw numbers and a variance caveat; the budget is stated up front and not exceeded; at least one concrete skill-edit bead or an explicit "none found". *Deps:* T4.

**T6. Judged rubric J1–J6 with a separate judge, calibrated once**
Add the §2.5 judge step to `run.mjs`, kept out of the deterministic score. Calibrate it against the owner's scoring of the T5 outputs, and promote J1 (header-drift) to deterministic via a trap fixture that reorders the snapshot's header.
*Acceptance:* judge vs owner agreement is reported per item; items with poor agreement are marked human-only; the trap fixture fails any build that doesn't assert its header. *Deps:* T5.

**T7. Second skill eval: `enrich/oil-prices`**
As §2.7: deterministic graders (byte-identical rerun, `data/` untouched, stats equal the template's golden, −36.98 survives, views valid, hand-written text preserved, "What stands out" numbers appear in the table).
*Acceptance:* oracle (`references/enrich-template.ts`) passes; saboteurs fail; one skill vs no-skill run recorded. *Deps:* T4 (reuses the runner).

**T8. Discovery rep 3, then the graduation decision** (existing bead `datapressr-jn8`; add a dependency on T2)
Run rep 3 as filed, and state in the playbook which reading of the graduation condition it satisfies (§3.3). Then either draft a thin `discover` skill (workflow + handoff template + escalation list, playbook in `references/`, `[untested]` tags kept, adversarial review required), or record why not.
*Acceptance:* per jn8, plus an explicit graduate/don't decision against the four §3.3 conditions. *Deps:* T2.

---

## Appendix: scratch evidence

- The prototype checker `prototypes/check-data.mjs` (about 200 lines, zero dependencies) reported 0 errors and 0 warnings on each dataset: oil-prices (8 resources, 18 ms), tesla-quarterly-deliveries (3, 2 ms), airports (1, 86,094 rows, 218 ms), population-growth (2 incl. FK, 26 ms), co2-ppm (5, 3 ms), us-natural-hazard-statistics (2, 4 ms).
- The fixture `scratchpad/mut/fx` produced exactly the 8 expected errors. The quoted field with comma plus doubled quote, the multi-line quoted field, and the missing optional cells produced no findings.
- Mutation: one duplicate row appended to a copy of population-growth gave `duplicate primary key (country_code, year) = (ABW, 1960), first seen line 2`, exit 1.
- The current metadata validator reports 0/0 on all six datasets.
- co2 monthly fixture facts: raw sha256 `eb751e4e…ac8f8`, 40 `#` lines, 821 data rows; golden sha256 `37492bde…52c3`; golden empty counts num_days 195, std_dev 196, uncertainty 194, matching the raw sentinel counts (`-1`, `-9.99`, `-0.99`).
- `claude plugin eval` (CLI 2.1.282): cases live in `evals/**/prompt.md` or `case.yaml` with `graders/*.md`. Grader types are `regex|tool_order|tool_used|file_exists|llm|baseline`. Other features: `scaffold_script` (opt-in `--scaffold`), `runs` default 3, `--ablation with-without`, `--model`, `--judge-model` (default haiku), `--max-cost-usd`, `--json`, `--keep-temp`. It has no grader that executes a command in the workspace.
