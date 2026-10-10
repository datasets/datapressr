# Eval report

Generated from `evals/ledger.jsonl` by `node evals/run.mjs report` (or `npm run eval:report`); do not edit by hand. Three layers, never averaged: deterministic checks (the only automatic regressions), the critic's blind order-swapped pairwise verdicts with its 0-2 checklist as a diagnostic, and the owner's blind preferences and verbatim remarks.

## Flags

- Leaked run 20261010-0250-co2-monthly-claude-opus-5-5-fbf4d07-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0253-co2-monthly-claude-opus-5-5-fbf4d07-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0255-co2-monthly-claude-opus-5-5-noskill-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0512-co2-monthly-claude-opus-5-5-noskill-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0514-co2-monthly-claude-opus-5-5-noskill-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0517-co2-monthly-claude-opus-5-5-noskill-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-0519-co2-monthly-claude-opus-5-5-fbf4d07-1 (structure/co2-monthly): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1 (story/q01-french-debt): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1 (story/q01-french-debt): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1 (story/q01-french-debt): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1 (story/q01-french-debt): the transcript touched paths outside the workspace; see its run.json before using it.
- Leaked run 20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1 (story/q02-allies-wwii): the transcript touched paths outside the workspace; see its run.json before using it.

## Per skill change

### none

#### Tree `4b825dc`, not a committed tree (earliest tree with runs)

Cases run: structure/co2-monthly (6 runs).

### story

#### Tree `17c1821`, commit `6203aee` Story DataHub slug and approval fields; bundler gates drafts (datapressr-kh5.3)

Cases run: story/q02-allies-wwii (1 run).

What changed since `d6d4845`: `git log --oneline 50e166b..6203aee -- skills/story` ([compare](https://github.com/datasets/datapressr/compare/50e166b...6203aee))

- `6203aee` Story DataHub slug and approval fields; bundler gates drafts (datapressr-kh5.3)
- `20c6d1e` Define the story skill's exempt-number list format (datapressr-hcn.17)
- `5f62900` Make installed skills self-contained (datapressr-4ly.2)

Pairwise vs `d6d4845`: no comparison on record.

#### Tree `d6d4845`, commit `50e166b` Put the owner's France feedback into the story skill (datapressr-hcn.10)

Cases run: story/q01-french-debt (2 runs).

What changed since `c08d6d6`: `git log --oneline 90ea475..50e166b -- skills/story` ([compare](https://github.com/datasets/datapressr/compare/90ea475...50e166b))

- `50e166b` Put the owner's France feedback into the story skill (datapressr-hcn.10)

Pairwise vs `c08d6d6` (rubric story/v2): 4 wins, 0 ties, 0 losses (n=4 pairs).

- 20261010-1044-q01-french-debt-pair-1 on q01-french-debt: win
- 20261010-1045-q01-french-debt-pair-1 on q01-french-debt: win
- 20261010-1046-q01-french-debt-pair-1 on q01-french-debt: win
- 20261010-1047-q01-french-debt-pair-1 on q01-french-debt: win

#### Tree `c08d6d6`, commit `90ea475` site: publish all docs on the site by moving docs/ to site/docs/ (earliest tree with runs)

Cases run: story/q01-french-debt (4 runs).

#### Skill commits with no pairwise comparison on record

- `46af661` evals: S7 fails embedded SVGs with NaN, undefined or leaked function source (hcn.25)
- `6203aee` Story DataHub slug and approval fields; bundler gates drafts (datapressr-kh5.3)
- `20c6d1e` Define the story skill's exempt-number list format (datapressr-hcn.17)
- `5f62900` Make installed skills self-contained (datapressr-4ly.2)

### structure

#### Tree `fbf4d07`, commit `1c1b1eb` validate: check CSV values against the declared schema, on by default (datapressr-ck8) (earliest tree with runs)

Cases run: structure/co2-monthly (7 runs).

#### Skill commits with no pairwise comparison on record

- `07c29e1` Drafts stay off the live site (publish: false) until approved; licence policy: ship and cite; owner review beads

## Per case

### story/q01-french-debt

6 runs over 2 skill trees.

#### Writer claude-opus-5-5

| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |
|---|---|---|---|---|---|---|---|
| 2026-10-10 10:34 | [20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1](runs/story/q01-french-debt/20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1/run.json) | `d6d4845` | claude | fail S7 (6 pass) | 2.36 | 36 | leaked |
| 2026-10-10 10:24 | [20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1](runs/story/q01-french-debt/20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1/run.json) | `d6d4845` | claude | pass (7) | 2.52 | 30 | leaked |
| 2026-10-10 10:12 | [20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | fail S3, S7 (5 pass) | 2.07 | 33 | leaked |
| 2026-10-10 10:04 | [20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | fail S3, S7 (5 pass) | 2.02 | 29 | leaked |
| 2026-10-10 01:13 | [20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | fail S3 (6 pass) | 1.72 | 33 |  |
| 2026-10-10 01:01 | [20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1](runs/story/q01-french-debt/20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1/run.json) | `c08d6d6` | claude | pass (7) | 1.46 | 26 |  |

Absolute scores, rubric story/v1 (diagnostic; 0-2):

| Run | Skill tree | Critic | argument | depth | charts | honesty | reader_questions | prose | Publishable |
|---|---|---|---|---|---|---|---|---|---|
| 20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 0 | 1 | 1 | 0 | 0 | 2 | no |
| 20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 0 | 1 | 1 | 0 | 0 | 1 | no |

Absolute scores, rubric story/v2 (diagnostic; 0-2):

| Run | Skill tree | Critic | argument | depth | charts | honesty | reader_questions | prose | Publishable |
|---|---|---|---|---|---|---|---|---|---|
| 20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1 | `d6d4845` | codex gpt-6-astra | 2 | 1 | 1 | 1 | 1 | 1 | with-edits |
| 20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1 | `d6d4845` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 2 | with-edits |
| 20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 1 | with-edits |
| 20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 2 | 1 | 1 | with-edits |
| 20261010-0113-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 1 | with-edits |
| 20261010-0101-q01-french-debt-claude-opus-5-5-c08d6d6-1 | `c08d6d6` | codex gpt-6-astra | 2 | 1 | 1 | 0 | 1 | 1 | with-edits |

Pairwise (blind, judged in both orders; a win only when both orders agree):

| Pair | Rubric | Critic | New | Old | AB | BA | Result | Owner |
|---|---|---|---|---|---|---|---|---|
| 20261010-1044-q01-french-debt-pair-1 | story/v2 | codex gpt-6-astra | 20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1 | 20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1 | new | new | win for new |  |
| 20261010-1045-q01-french-debt-pair-1 | story/v2 | codex gpt-6-astra | 20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1 | 20261010-1004-q01-french-debt-claude-opus-5-5-c08d6d6-1 | new | new | win for new |  |
| 20261010-1046-q01-french-debt-pair-1 | story/v2 | codex gpt-6-astra | 20261010-1024-q01-french-debt-claude-opus-5-5-d6d4845-1 | 20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1 | new | new | win for new |  |
| 20261010-1047-q01-french-debt-pair-1 | story/v2 | codex gpt-6-astra | 20261010-1034-q01-french-debt-claude-opus-5-5-d6d4845-1 | 20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1 | new | new | win for new |  |

### story/q02-allies-wwii

1 run over 1 skill tree. A single run is an anecdote.

#### Writer claude-opus-5-5

| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |
|---|---|---|---|---|---|---|---|
| 2026-10-10 11:11 | [20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1](runs/story/q02-allies-wwii/20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1/run.json) | `17c1821` | claude | fail S7 (6 pass) | 5.11 | 62 | leaked |

Absolute scores, rubric story/v2 (diagnostic; 0-2):

| Run | Skill tree | Critic | argument | depth | charts | honesty | reader_questions | prose | data_choice | Publishable |
|---|---|---|---|---|---|---|---|---|---|---|
| 20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1 | `17c1821` | codex gpt-6-astra | 1 | 1 | 1 | 0 | 0 | 1 | 1 | no |

### structure/co2-monthly

13 runs over 2 skill trees.

#### Writer claude-opus-5-5

| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |
|---|---|---|---|---|---|---|---|
| 2026-10-10 05:19 | [20261010-0519-co2-monthly-claude-opus-5-5-fbf4d07-1](runs/structure/co2-monthly/20261010-0519-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | `fbf4d07` | claude | fail D5, D8, D9, D10, D11, D12 (7 pass) | 0.85 | 19 | leaked |
| 2026-10-10 05:17 | [20261010-0517-co2-monthly-claude-opus-5-5-noskill-1](runs/structure/co2-monthly/20261010-0517-co2-monthly-claude-opus-5-5-noskill-1/run.json) | `4b825dc` | claude | fail D8, D9, D10, D11, D12 (8 pass) | 0.69 | 17 | leaked, no_skill |
| 2026-10-10 05:14 | [20261010-0514-co2-monthly-claude-opus-5-5-noskill-1](runs/structure/co2-monthly/20261010-0514-co2-monthly-claude-opus-5-5-noskill-1/run.json) | `4b825dc` | claude | fail D8, D9, D10, D11, D12 (8 pass) | 0.68 | 15 | leaked, no_skill |
| 2026-10-10 05:12 | [20261010-0512-co2-monthly-claude-opus-5-5-noskill-1](runs/structure/co2-monthly/20261010-0512-co2-monthly-claude-opus-5-5-noskill-1/run.json) | `4b825dc` | claude | fail D8, D9, D10, D11, D12 (8 pass) | 0.75 | 17 | leaked, no_skill |
| 2026-10-10 02:56 | [20261010-0256-co2-monthly-claude-opus-5-5-noskill-2](runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-noskill-2/run.json) | `4b825dc` | claude | fail D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 (2 pass) | 0.00 | 1 | failed, no_skill |
| 2026-10-10 02:56 | [20261010-0256-co2-monthly-claude-opus-5-5-noskill-1](runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-noskill-1/run.json) | `4b825dc` | claude | fail D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 (2 pass) | 0.00 | 1 | failed, no_skill |
| 2026-10-10 02:56 | [20261010-0256-co2-monthly-claude-opus-5-5-fbf4d07-1](runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | `fbf4d07` | claude | fail D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 (2 pass) | 0.09 | 2 | failed |
| 2026-10-10 02:55 | [20261010-0255-co2-monthly-claude-opus-5-5-noskill-1](runs/structure/co2-monthly/20261010-0255-co2-monthly-claude-opus-5-5-noskill-1/run.json) | `4b825dc` | claude | fail D1, D8, D9, D10, D11, D12 (7 pass) | 0.51 | 10 | failed, leaked, no_skill |
| 2026-10-10 02:53 | [20261010-0253-co2-monthly-claude-opus-5-5-fbf4d07-1](runs/structure/co2-monthly/20261010-0253-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | `fbf4d07` | claude | fail D8, D9, D10, D11, D12 (8 pass) | 0.85 | 15 | leaked |
| 2026-10-10 02:50 | [20261010-0250-co2-monthly-claude-opus-5-5-fbf4d07-1](runs/structure/co2-monthly/20261010-0250-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | `fbf4d07` | claude | fail D11, D12 (11 pass) | 0.80 | 17 | leaked |

#### Writer gpt-6-astra

| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |
|---|---|---|---|---|---|---|---|
| 2026-10-10 02:58 | [20261010-0258-co2-monthly-codex-gpt-6-astra-fbf4d07-1](runs/structure/co2-monthly/20261010-0258-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | `fbf4d07` | codex | fail D5, D11 (11 pass) |  | 16 |  |
| 2026-10-10 02:56 | [20261010-0256-co2-monthly-codex-gpt-6-astra-fbf4d07-1](runs/structure/co2-monthly/20261010-0256-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | `fbf4d07` | codex | fail D5, D11 (11 pass) |  | 13 |  |
| 2026-10-10 02:50 | [20261010-0250-co2-monthly-codex-gpt-6-astra-fbf4d07-1](runs/structure/co2-monthly/20261010-0250-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | `fbf4d07` | codex | fail D5, D11 (11 pass) |  | 11 |  |

## Noise

Absolute scores per skill tree as min-max ranges with n (the latest score per run), one table per case, writer model, rubric and writer prompt: runs given different prompts (a harness change to the blind-run notes, or the no-skill arm) are never pooled. A difference is called a change only when the ranges do not overlap; otherwise "no detectable change". A single run is an anecdote. No standard deviations or p-values at these sample sizes.

### story/q01-french-debt, writer claude-opus-5-5, rubric story/v1, prompt `39a5e7f`

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|
| `c08d6d6` | 2 | 0 | 1 | 1 | 0 | 0 | 1-2 |

### story/q01-french-debt, writer claude-opus-5-5, rubric story/v2, prompt `39a5e7f`

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|
| `c08d6d6` | 2 | 2 | 1 | 1 | 0 | 1 | 1 |

### story/q01-french-debt, writer claude-opus-5-5, rubric story/v2, prompt `3fe1ed6`

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|
| `d6d4845` | 2 | 2 | 1 | 1 | 0-1 | 1 | 1-2 |
| `c08d6d6` | 2 | 2 | 1 | 1 | 0-2 | 1 | 1 |

| Comparison | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|
| `d6d4845` vs `c08d6d6` | no detectable change | no detectable change | no detectable change | no detectable change | no detectable change | no detectable change |

### story/q02-allies-wwii, writer claude-opus-5-5, rubric story/v2, prompt `5a60fa0`

| Skill tree | n | argument | depth | charts | honesty | reader_questions | prose | data_choice |
|---|---|---|---|---|---|---|---|---|
| `17c1821` | 1 (anecdote) | 1 | 1 | 1 | 0 | 0 | 1 | 1 |

### Critic-only spread (one run re-scored)

| Run | Rubric | n | argument | depth | charts | honesty | reader_questions | prose |
|---|---|---|---|---|---|---|---|---|
| 20261010-1012-q01-french-debt-claude-opus-5-5-c08d6d6-1 | story/v2 | 3 | 2 | 1 | 0-1 | 0 | 1 | 1 |

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

- Critic fallback: 0 of 35 critiques (absolute and pairwise) used the fallback critic.
- Critic validation failures: 0 of 25 absolute critiques recorded as critic_failed.
- Leaks caught: 12 of 20 runs flagged leaked.

Canary status (latest per vendor, CLI version and mode; weakened canaries are negative controls and must fail):

| Vendor | CLI | Mode | Kind | Latest | Result |
|---|---|---|---|---|---|
| claude | 2.1.296 | fixed | recipe | 20261010-0211-canary-claude-haiku-5-5-1 | PASS |
| claude | 2.1.296 | fixed | weakened | 20261010-0212-canary-claude-haiku-5-5-weakened-1 | FAIL (expected) |
| claude | 2.1.296 | open | recipe | 20261010-1108-canary-claude-haiku-5-5-1 | PASS |
| claude | 2.1.296 | open | weakened | 20261010-1109-canary-claude-haiku-5-5-weakened-1 | FAIL (expected) |
| codex | 0.161.0 | fixed | recipe | 20261010-0212-canary-codex-gpt-6-luna-1 | PASS |
| codex | 0.161.0 | fixed | weakened | 20261010-0212-canary-codex-gpt-6-luna-weakened-1 | FAIL (expected) |

- Installed claude CLI: 2.1.296 (fixed mode): canary passed.
- Installed claude CLI: 2.1.296 (open mode): canary passed.
