# Eval report

Generated from `evals/ledger.jsonl` by `node evals/run.mjs report` (or `npm run eval:report`); do not edit by hand. Three layers, never averaged: deterministic checks (the only automatic regressions), the critic's blind order-swapped pairwise verdicts with its 0-2 checklist as a diagnostic, and the owner's blind preferences and verbatim remarks.

## Flags

None.

## Per skill change

### story

#### Tree `c08d6d6`, commit `90ea475` site: publish all docs on the site by moving docs/ to site/docs/ (earliest tree with runs)

Cases run: story/q01-french-debt (2 runs).

#### Skill commits with no pairwise comparison on record

- `20c6d1e` Define the story skill's exempt-number list format (datapressr-hcn.17)
- `5f62900` Make installed skills self-contained (datapressr-4ly.2)
- `50e166b` Put the owner's France feedback into the story skill (datapressr-hcn.10)

## Per case

### story/q01-french-debt

2 runs over 1 skill tree.

#### Writer claude-opus-5-5

| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |
|---|---|---|---|---|---|---|---|
| 2026-10-10 01:13 | [20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | fail S3 (5 pass) | 1.72 | 33 |  |
| 2026-10-10 01:01 | [20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | pass (6) | 1.46 | 26 |  |

Absolute scores, rubric story/v1 (diagnostic; 0-2):

| Run | Skill tree | Critic | argument | depth | charts | honesty | reader_questions | prose | Publishable |
|---|---|---|---|---|---|---|---|---|---|
| 20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 0 | 1 | 1 | 0 | 0 | 2 | no |
| 20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 0 | 1 | 1 | 0 | 0 | 1 | no |

Absolute scores, rubric story/v2 (diagnostic; 0-2):

| Run | Skill tree | Critic | argument | depth | charts | honesty | reader_questions | prose | Publishable |
|---|---|---|---|---|---|---|---|---|---|
| 20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 1 | with-edits |
| 20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 1 | with-edits |

## Noise

Absolute scores per skill tree as min-max ranges with n (the latest score per run). A difference is called a change only when the ranges do not overlap; otherwise "no detectable change". A single run is an anecdote. No standard deviations or p-values at these sample sizes.

### story/q01-french-debt, writer claude-opus-5-5, rubric story/v1

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|
| `c08d6d6` | 2 | 0 | 1 | 1 | 0 | 0 | 1-2 |

### story/q01-french-debt, writer claude-opus-5-5, rubric story/v2

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|
| `c08d6d6` | 2 | 2 | 1 | 1 | 0 | 1 | 1 |

### Critic-only spread (one run re-scored)

No run has been re-scored yet.

## Harness quality

### Judge-owner agreement on pairs

No owner-judged pairs yet. The critic's pairwise verdict stands alone for small edits only once it matches the owner in at least 4 of 5 pairs.

### Calibration

| Rubric | Set | Hits |
|---|---|---|
| story/v1 | q01 round 1 (draft 1; anchors may use these remarks) | 4 of 6 |
| story/v1 | q01 round 2 (draft 2; held out), PNG renders | 0 of 5 |
| story/v1 | q01 round 2 (draft 2; held out), SVG text | 0 of 5 |
| story/v2 | q01 round 1 (draft 1; anchors drew on these remarks) | 6 of 6 |
| story/v2 | q01 round 2 (draft 2; seen by the v2 author, not held out), PNG renders | 1 of 5 |
| story/v2 | q01 round 2 (draft 2; seen by the v2 author, not held out), SVG text | 1 of 5 |

### Critic and isolation

- Critic fallback: 0 of 20 critiques (absolute and pairwise) used the fallback critic.
- Critic validation failures: 0 of 16 absolute critiques recorded as critic_failed.
- Leaks caught: 0 of 2 runs flagged leaked.

Canary status (latest per vendor, CLI version and mode; weakened canaries are negative controls and must fail):

| Vendor | CLI | Mode | Kind | Latest | Result |
|---|---|---|---|---|---|
| claude | 2.1.296 | fixed | recipe | 20261010-0147-canary-claude-haiku-5-5-1 | PASS |
| claude | 2.1.296 | fixed | weakened | 20261010-0147-canary-claude-haiku-5-5-weakened-1 | FAIL (expected) |
| codex | 0.161.0 | fixed | recipe | 20261010-0147-canary-codex-gpt-6-luna-1 | PASS |
| codex | 0.161.0 | fixed | weakened | 20261010-0147-canary-codex-gpt-6-luna-weakened-1 | FAIL (expected) |

- Installed claude CLI: 2.1.296 (fixed mode): canary passed.
