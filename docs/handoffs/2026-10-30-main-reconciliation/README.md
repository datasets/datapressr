# Local main reconciliation evidence — 2026-10-30

The reviewed local integration merge is `5a2d8e8eac906102caf0a95547780260c7cb37dc`, and actual **local** `main` was advanced to that commit using a guarded compare-and-swap after independent approval and a coordinated pause. No remote main update or push occurred.

The active checkout remains on `work/structure-eval-quality-2026-10-15`, whose HEAD before this evidence-only commit was `46a14a5f25cee203844a38d5fcc284293ee2301b`. This archival commit belongs to that active branch; it does not move local main again or change the reviewed integration tree.

- [Integration handoff](integration-handoff.md): reviewed parents/tree, conflict-free merge, preservation and test evidence, and the historical pre-update procedure.
- [Independent review](independent-review.md): APPROVED integration review, 144 generic tests and 264 synthetic eval tests passed; protected production gate excluded.
- [Local main update](local-main-update.md): executed CAS result, actual source/staging ancestry, preserved active dirty/untracked bytes, and exact auxiliary-manifest serialization.
- [Exact operation log](operation-log.json) and [executed verification script](operation-script.py): commands, exit codes, ref/worktree checks and before/after snapshots. The script is retained as historical evidence, not a new run instruction.
- [SHA256SUMS](SHA256SUMS): copied report/log/script identities, verified byte-for-byte against their original temporary files.

These reports retain their original temporary paths and time-specific statements as audit evidence. The durable equivalents of the five principal temporary files are linked above. Large raw tree inventories and test transcripts were not duplicated; the independent review records direct equality of all 1,981 preserved tracked entries, exact merge identities and test outcomes. The preservation serialization is specified in the update report.

No protected case contents were reviewed for this integration. This archive establishes the local ref update, not whole-case readiness. Later custodian production-loader/staging evidence is maintained separately and does not change the scope of the integration review.
