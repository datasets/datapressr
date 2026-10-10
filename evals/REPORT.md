# Eval report

Generated from `evals/ledger.jsonl` by `node evals/run.mjs report` (or `npm run eval:report`); do not edit by hand. Three layers, never averaged: deterministic checks (the only automatic regressions), the critic's blind order-swapped pairwise verdicts with its 0-2 checklist as a diagnostic, and the owner's blind preferences and verbatim remarks.

## Flags

None.

## Per skill change

No runs recorded yet.

## Per case

No runs recorded yet.

## Noise

Absolute scores per skill tree as min-max ranges with n (the latest score per run). A difference is called a change only when the ranges do not overlap; otherwise "no detectable change". A single run is an anecdote. No standard deviations or p-values at these sample sizes.

No absolute scores recorded yet.

## Harness quality

### Judge-owner agreement on pairs

No owner-judged pairs yet. The critic's pairwise verdict stands alone for small edits only once it matches the owner in at least 4 of 5 pairs.

### Calibration

No calibration hit rates recorded yet (datapressr-hcn.8 writes them to `evals/calibration/<domain>/*.json`).

### Critic and isolation

- Critic fallback: 0 of 0 critiques (absolute and pairwise) used the fallback critic.
- Critic validation failures: 0 of 0 absolute critiques recorded as critic_failed.
- Leaks caught: 0 of 0 runs flagged leaked.

Canary status (latest per vendor, CLI version and mode; weakened canaries are negative controls and must fail):

| Vendor | CLI | Mode | Kind | Latest | Result |
|---|---|---|---|---|---|
| claude | 2.1.296 | fixed | recipe | 20261010-0028-canary-claude-haiku-5-5-1 | PASS |
| claude | 2.1.296 | fixed | weakened | 20261010-0028-canary-claude-haiku-5-5-weakened-1 | FAIL (expected) |
| codex | 0.161.0 | fixed | recipe | 20261010-0038-canary-codex-gpt-6-luna-1 | PASS |
| codex | 0.161.0 | fixed | weakened | 20261010-0038-canary-codex-gpt-6-luna-weakened-1 | FAIL (expected) |

- Installed claude CLI: 2.1.296 (fixed mode): canary passed.
