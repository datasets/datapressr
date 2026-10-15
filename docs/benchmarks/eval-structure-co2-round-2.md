# Structure CO2 round 2: correction of historical checks

2026-10-15. Four of the nine complete historical outputs change from fail to pass on D5; one also changes from fail to pass on D11. These are corrections to measurement on unchanged outputs. No new writers ran, so this report does not establish a skill behaviour gain. The [round-1 report](eval-structure-co2-round-1.md) remains the historical account of its original checker results.

## Revisions and provenance

The recheck ran at integrated revision `2c7072b87f1a5b44e193c53bd54af6420beeda35`. The corrected checker landed in `b9d41dbcf9441528ad367638bff9d7ee5fa7b429`; its `evals/lib/checkers/structure.mjs` Git blob is `1da890ea57fb224e5e1e29bb38f872affaa570f6`. All thirteen appended check rows record harness tree `3c7ad7c47c8c1e43c51f4620aa6e36849613384b`. The guidance change at `2c7072b` has structure skill tree `c8f9797873517fcee60e9fec519ac134208d6548`; no historical output was produced using that tree.

Each full run ID below links to its unchanged manifest, which retains its original case hash, skill ref/tree, harness tree and recipe hash, requested/actual model, CLI version, prompt hash, usage and flags. All thirteen manifests use case hash `9f7972f6196a20e01d48b3471782fa21eb7f1d3bdd62f3762bfe5384750a23ad` and original harness tree `d6760762299840b6a594f70bb3c736651baae8fb`. Skilled outputs use tree `fbf4d07a5488814633f986d177a5b3e7b4173b19`; the no-skill arm uses empty tree `4b825dc642cb6eb9a060e54bf8d69288fbee4904`. Claude used `claude-opus-5-5` on CLI `2.1.296`; Codex requested `gpt-6-astra` on CLI `0.161.0` (its manifests do not report an actual model).

The unchanged [fixed case](../../evals/cases/structure/co2-monthly/case.json) pins:

| Input/reference | Git revision | SHA-256 |
|---|---|---|
| `archive/co2_mm_mlo.csv` | `e24166f` | `eb751e4e858dc732efddff1e3484cf3d2be80230c8f3f4eba779924ba56ac8f8` |
| `scripts/validate-datapackage.mjs` | `1c1b1eb` | `7a324892a9836fa258485d2b604886f4f65e9a24da826ac8e49d240180dca71e` |
| Reference `data/co2-monthly-mlo.csv` | `e24166f` | `37492bde94680ba9feb20a178bddd4268c23a33469f36acce4825afe5c2d52c3` |

All paths in this table are under `datasets/climate-and-environment/co2-ppm/`. No source was fetched. The historical oracle's PDDL metadata remains unchanged; it is not evidence of a source-granted PDDL dedication.

## Complete outputs: original → corrected

The old column is the saved pre-recheck `checks.json`, corroborated by the original ledger rows. The new column is the regenerated [checks](../../evals/README.md) and appended check evidence. Totals are passes out of thirteen.

| Historical run ID | D5 | D11 | Total | Remaining failures |
|---|---|---|---|---|
| [20261010-0250-co2-monthly-claude-opus-5-5-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0250-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | pass → pass | fail → fail | 11 → 11 | D11, D12 |
| [20261010-0250-co2-monthly-codex-gpt-6-astra-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0250-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | fail → pass | fail → fail | 11 → 12 | D11 |
| [20261010-0253-co2-monthly-claude-opus-5-5-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0253-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | pass → pass | fail → fail | 8 → 8 | D8, D9, D10, D11, D12 |
| [20261010-0256-co2-monthly-codex-gpt-6-astra-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0256-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | fail → pass | fail → fail | 11 → 12 | D11 |
| [20261010-0258-co2-monthly-codex-gpt-6-astra-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0258-co2-monthly-codex-gpt-6-astra-fbf4d07-1/run.json) | fail → pass | fail → pass | 11 → 13 | none |
| [20261010-0512-co2-monthly-claude-opus-5-5-noskill-1](../../evals/runs/structure/co2-monthly/20261010-0512-co2-monthly-claude-opus-5-5-noskill-1/run.json) | pass → pass | fail → fail | 8 → 8 | D8, D9, D10, D11, D12 |
| [20261010-0514-co2-monthly-claude-opus-5-5-noskill-1](../../evals/runs/structure/co2-monthly/20261010-0514-co2-monthly-claude-opus-5-5-noskill-1/run.json) | pass → pass | fail → fail | 8 → 8 | D8, D9, D10, D11, D12 |
| [20261010-0517-co2-monthly-claude-opus-5-5-noskill-1](../../evals/runs/structure/co2-monthly/20261010-0517-co2-monthly-claude-opus-5-5-noskill-1/run.json) | pass → pass | fail → fail | 8 → 8 | D8, D9, D10, D11, D12 |
| [20261010-0519-co2-monthly-claude-opus-5-5-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0519-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | fail → pass | fail → fail | 7 → 8 | D8, D9, D10, D11, D12 |

D5 now accepts the source's own terms title plus a valid HTTP(S) terms URL, resolving the four false negatives: Claude 05:19's `Use of NOAA GML Data` and all three Codex outputs' `USE OF NOAA GML DATA`. It retains identifier-shaped names as a compatibility branch; passing that branch does not verify SPDX membership or establish a legal licence. Five complete Claude outputs' invented `NOAA-GML-data-use` slug still passes through that legacy branch. The skill now directs writers to preserve the original terms title and location rather than invent a slug or dedication.

Codex 02:58's opening header already has `Terms: USE OF NOAA GML DATA`, a separate NOAA source URL and retrieval-labelled date. D11 now recognises that populated terms declaration. The other eight complete outputs still fail D11 because their opening headers lack a licence/terms declaration. No licence URL is required on the declaration line itself.

The resulting totals are Claude + skill 11/8/8 (previously 11/8/7), Claude without skill 8/8/8 (unchanged), and Codex + skill 12/12/13 (previously 11/11/11). The higher totals reflect corrected acceptance rules on historical artifacts.

## Failed runs remain separate

All four original failed/usage-limited attempts were also rechecked, preserving their flags and original ledger evidence. Their partial or absent artifacts remain excluded from the nine-output comparison. A checker process exiting zero means the check command completed; it does not turn a failed writer run into a successful one.

| Historical run ID | D5 | D11 | Total | Remaining failures |
|---|---|---|---|---|
| [20261010-0255-co2-monthly-claude-opus-5-5-noskill-1](../../evals/runs/structure/co2-monthly/20261010-0255-co2-monthly-claude-opus-5-5-noskill-1/run.json) | pass → pass | fail → fail | 7 → 7 | D1, D8, D9, D10, D11, D12 |
| [20261010-0256-co2-monthly-claude-opus-5-5-fbf4d07-1](../../evals/runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-fbf4d07-1/run.json) | fail → fail | fail → fail | 2 → 2 | D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 |
| [20261010-0256-co2-monthly-claude-opus-5-5-noskill-1](../../evals/runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-noskill-1/run.json) | fail → fail | fail → fail | 2 → 2 | D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 |
| [20261010-0256-co2-monthly-claude-opus-5-5-noskill-2](../../evals/runs/structure/co2-monthly/20261010-0256-co2-monthly-claude-opus-5-5-noskill-2/run.json) | fail → fail | fail → fail | 2 → 2 | D1, D2, D3, D4, D5, D7, D8, D9, D10, D11, D12 |

All four retain identical pass/fail outcomes. The three 02:56 empty outputs have one diagnostic-only difference: the D5 ENOENT message contains a new temporary scratch directory name. After normalising that path, their full results are unchanged. The 02:55 partial output's complete check object is unchanged.

## Unchanged semantics and evidence

D8 (hand-read anchors), D9 (sentinels and empty counts) and D10 (reference values) are exactly unchanged in all thirteen runs, including their messages and evidence. In the nine complete outputs, five Claude outputs still fail all three because they blanked zero uncertainty beside a negative standard-deviation sentinel; Claude 02:50 and all three Codex outputs preserve those zeros and pass. Across the complete outputs, D1/D2/D3/D4/D6/D7/D13 still pass universally. D12 still fails for the six complete Claude outputs' monthly `YYYY-MM` dates and passes for all three Codex outputs' `YYYY-MM-01` dates. No check outside D5/D11 changed, including any failed-run result.

Verification against the coordinator's pre-recheck snapshot matched all 239 immutable file hashes, covering structure manifests, transcripts, workspace archives and artifacts, story checks, and the case/oracle. The original ledger prefix is byte-identical: 77,637 bytes, SHA-256 `c4db657b1c1002785cfa59de7cb1128553b4719b693703847c87f7dae3f92c32`. Exactly thirteen structure `check` rows were appended, one per listed ID, with outcomes matching the regenerated checks. No writer, canary, critic or pairwise row was added. The [generated report](../../evals/REPORT.md) uses the latest checks; original run and check rows remain in the [ledger](../../evals/ledger.jsonl).

Report regeneration also records the new skill commit among commits with no pairwise comparison and detects installed Claude CLI `2.1.301`, whose fixed/open recipes have no current canary. These are generated revision/environment observations, not changed historical run flags or new evaluations. No new canary was run. The old leak flags remain as recorded; round 1 explains the false positives and the later scanner fix is separate history.

## Commands and validation

The thirteen manifest IDs above were enumerated from `evals/runs/structure/co2-monthly/*/run.json`; each received `node evals/run.mjs check <full_run_id>`, sequentially, followed by `node evals/run.mjs report`. Every command exited zero. This is the structure-only equivalent of the requested all-run recheck; no story checks were regenerated. The recheck window was 2026-10-15 20:37:38–20:37:48 UTC.

`npm test` passed 478/478 tests with zero failures, cancellations or skips in 73.5 seconds on the integrated tree. `git diff --check` passed. Hash/prefix verification confirmed all 239 immutable files and the complete original ledger prefix, and matched all thirteen new rows to their checks.

## Unmeasured follow-ups

The three guidance lessons are in skill at `2c7072b`; writer adherence to those edits remains unmeasured. `datapressr-8no.7` tracks a fresh old-skill/new-skill/no-skill comparison using the immediate pre-edit skill revision `b9d41db`, the same fixed case/harness/model, three sequential runs per arm, declared zero/licence/header measures and failed-run treatment, and a current isolation canary. Its proposed budget is not spending authorisation; this deterministic slice made no paid calls.

`datapressr-8no.8` tracks a second independently pinned source outside the skill's worked example, with hand-read anchors and deliberate saboteurs. Structure rubric and owner calibration remain `datapressr-8no.4`. These are separate open evaluations, and this report makes no claim of transfer or improved skill behaviour.
