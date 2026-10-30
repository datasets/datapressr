# Independent integration review — 2026-10-30

APPROVED for a separately authorized local-main fast-forward, subject to the live preconditions below. No ref update was performed. This verdict does not complete the production main/input gate.

Reviewed merge `5a2d8e8eac906102caf0a95547780260c7cb37dc`, tree `0e544055623bc1fa2fbbb62706938f00c9164e2d`, with exactly two parents in order: `46a14a5f25cee203844a38d5fcc284293ee2301b` and `52f2b232298d88f4cc90c0c8a27d3b61688fd7e0`. Each parent, current local main `a11d0670702d8b76cb6131b4fcde0a084ddf42da`, and opaque source `dd580cf2760b24ab4558b11a7092849bda3345ac` is an ancestor of this merge. Parent divergence is 111 work-only commits and one remote-only commit.

Independent recursive Git tree comparisons confirm exactly two changed entries relative to the first parent: `site/config.json` and `site/charting-spike.html`, comprising five added analytics lines and no removals. Both final file blobs/modes exactly equal their second-parent versions. All other 1,981 tracked entries have exactly equal paths, modes, types and object IDs between first parent and merge; no protected contents were opened. Reviewer-owned raw preserved-entry manifest is `/tmp/datapressr-integration-review-preserved-20261030.bin`, SHA256 `31b1373b64bb11e01ef8d1547be49f6329986cdaf14ba0f74de06571aa01a350`, serialized as byte-sorted `git ls-tree -rz` rows excluding those two paths, each followed by NUL. Handoff's auxiliary digest cannot be reproduced without its serialization specification; direct full-entry equality establishes its intended preservation claim independently.

Independent tests on merge:

- `node --test scripts/*.test.mjs`: 144 passed, zero failed/skipped. Log `/tmp/datapressr-integration-review-generic-20261030.log`.
- `node --test evals/lib/*.test.mjs evals/lib/adapters/*.test.mjs evals/lib/checkers/*.test.mjs`: 264 passed, zero failed/skipped. Log `/tmp/datapressr-integration-review-evals-20261030.log`. These use synthetic fixtures/adapters; no real model/writer invocation was made.
- `git diff --check`: passed; integration worktree clean after tests.
- Author's baseline and merge generic logs independently inspected: each 144 passed, zero failed/skipped.

Full auto-discovered suite (suggested 525-test count) was deliberately not invoked: `evals/cases.test.mjs` reads committed case/prompt contents and asserts inputs against the actual shared main ref, which remains old. Its production case loading/gate is separately reserved to the authorized custodian after main movement. This review establishes structural integration and library/generic regression evidence, not semantic protected-case approval or a passing production input gate.

All eight worktree registrations were examined; none checks out main. Five stale registrations were preserved, along with active source, R3 and integration worktrees. Active source HEAD remains the first parent. Its dirty `.beads/issues.jsonl` was preserved with before/after SHA256 `a1c5199e4411718cc50f11d2568db5f8c2f311970f80217846106a5f686a7b86`. Two concurrent custodian evidence files are now untracked in the active source checkout; their contents were not read or modified. No source files, task database, shared refs, registrations, or remote state were changed by this review. Scratch reports/logs were written only under `/tmp` (tests use their own temporary fixtures).

Hooks inspection confirms configured `core.hooksPath=.beads/hooks`; post-checkout and post-merge execute Beads hooks and custom Dolt pulls. Use `-c core.hooksPath=/dev/null` for every ref/worktree operation, including fetch and update-ref; do not run `bd`, pull, checkout, reset, cleanup/prune, or merge in the dirty active checkout.

## Required live conditions and update

Root must separately authorize and coordinate a short ref/worktree pause. Re-fetch origin/main with hooks disabled and check all exact refs immediately before update: origin/main equals second parent; active work branch and its checkout HEAD equal first parent; integration branch and checkout HEAD equal reviewed merge; main equals old main. Stop on drift, an unexpected worktree/HEAD condition, or any checked-out main registration; do not silently incorporate new work. Reconfirm merge tree and both parents, old-main and opaque-source ancestry, and any custodian-specified staging commit ancestry. Preserve all concurrent untracked evidence and dirty bytes; coordinate legitimate writers rather than restoring old snapshots.

After those conditions and root authorization, the handoff's executable CAS is correct:

```sh
git -c core.hooksPath=/dev/null update-ref -m 'Reviewed local integration of preserved work and origin/main' refs/heads/main 5a2d8e8eac906102caf0a95547780260c7cb37dc a11d0670702d8b76cb6131b4fcde0a084ddf42da
```

The CAS prevents clobbering intervening main changes; the coordinated pause is still required because CAS alone does not guard worktree registrations or the other refs. Afterward verify main equals merge; parent/source/staging ancestries succeed; source HEAD and coordinated Beads hash remain unchanged. Retain integration branch/worktree. No push or deployment is authorized by this review. Have custodian run actual production `loadCase`/input gate and report only opaque results to root before declaring that gate complete.
