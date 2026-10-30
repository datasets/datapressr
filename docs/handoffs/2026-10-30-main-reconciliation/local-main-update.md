# Reviewed local-main update — 2026-10-30

Root authorized the exact reviewed update and confirmed a coordinated DataPressr ref/worktree pause. The remote was re-fetched; all expected refs, eight worktree registrations, merge parents/tree, clean integration checkout and required ancestries matched. No registration checked out main.

Executed with hooks disabled:

```sh
git -c core.hooksPath=/dev/null update-ref -m 'Reviewed local integration of preserved work and origin/main' refs/heads/main 5a2d8e8eac906102caf0a95547780260c7cb37dc a11d0670702d8b76cb6131b4fcde0a084ddf42da
```

Result: PASS. Local main is now `5a2d8e8eac906102caf0a95547780260c7cb37dc`; old main was `a11d0670702d8b76cb6131b4fcde0a084ddf42da`. Actual source `dd580cf2760b24ab4558b11a7092849bda3345ac`, staging `46a14a5f25cee203844a38d5fcc284293ee2301b`, old main and fetched origin/main are verified ancestors of actual main. Active checkout HEAD remains staging on `work/structure-eval-quality-2026-10-15`. Worktree registrations and all non-main expected refs remain unchanged.

Dirty/untracked paths, bytes and status were identical before and after; hashes below were computed without displaying or interpreting their contents:

- `.beads/issues.jsonl`: 641092 bytes, SHA256 `a1c5199e4411718cc50f11d2568db5f8c2f311970f80217846106a5f686a7b86`.
- `evals/experiments/story-quality/fresh-case-c17/reviewer-evidence/integration-review.md`: 2458 bytes, SHA256 `9acabf51eceeeb380033301b1a569297260c3bf5fb0a1e0c082fbcda206926f9`.
- `evals/experiments/story-quality/fresh-case-c17/reviewer-evidence/integration-staging.json`: 799 bytes, SHA256 `1fc2f56df855a6a728344c23dcb25a680b11e30b9eef4eec9a85e138d5edc162`.

Exact command/exit/output log and before/after snapshots: `/tmp/datapressr-main-cas-20261030.json`. Executed verification script: `/tmp/datapressr-main-cas-20261030.py`. No remote push, checkout, cleanup, database sync, protected-content review, or reviewed-tree modification occurred. Root was notified that the pause may end. Production loader/staging recheck belongs to the custodian; this operation makes no whole-case-ready claim.

## Auxiliary manifest serialization clarification

The original preserved-entry digest is reproducible: parse each NUL-separated `git ls-tree -r -z <first-parent>` row at its first TAB into `metadata` and `path`; exclude the two analytics paths; sort the remaining path bytes; serialize each as `path + TAB + metadata`, joining rows with NUL and **no final NUL**. Metadata is Git's original `mode + SPACE + type + SPACE + object-id`. SHA256 is `e0f1fa37b8eb068257be14660664b8b094bbb504fce6934313560e19c07dd6b9` (reproduced after CAS). The reviewer's equally valid digest uses original metadata-first rows and a final NUL, hence differs. Direct equality of all 1,981 preserved entries is the substantive preservation evidence.
