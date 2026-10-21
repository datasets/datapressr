# Retrospective pilot preparation

Four eligible stories from two topics and both arms are frozen in the administrative [manifest](manifest.json). The selected slot and all eight eligible codes are recorded there. Selection uses first replicates regardless of historical ratings. Existing mappings and previous exposure mean this is identity-minimized, not proven blind. These are known-development stories.

The [owner packet](owner/README.md) and future independent AI reviewers use exactly these same commissions, final reading copies and linked existing PNGs:

| Packet | Brief | Reading view |
| --- | --- | --- |
| A | [Commission](owner/A-commission.md) | [Story and linked PNGs](owner/A.md) |
| B | [Commission](owner/B-commission.md) | [Story and linked PNGs](owner/B.md) |
| C | [Commission](owner/C-commission.md) | [Story and linked PNGs](owner/C.md) |
| D | [Commission](owner/D-commission.md) | [Story and linked PNGs](owner/D.md) |

The sole prose change is removal of the second identical leading H1 and its following blank line. PNG destinations are rewritten relative to the reading copy; image bytes and every other prose byte remain unchanged. Commissions are byte-identical neutral copies. Administrative source identity, hashes, selection and unknown process metadata stay outside the response form. The intended display width is 720px; intrinsic dimensions come from PNG IHDR. Actual viewed dimensions must be reported later, not inferred from either value.

Freeze the instrument and packet hashes before assessment. Future AI reviewers independently score the same three human dimensions plus optional independent overall and all seven instrument diagnostics, before owner responses are revealed. Supply the exact commission, reading view and PNGs linked above, plus the frozen instrument. Record actual identity, materials seen, familiarity, order, uncertainty, viewing dimensions and any missing reasons; do not assume a requested model was served. Unperformed evidence checks remain unresolved/unassessed. No ratings or factual verification are created by this preparation.

Freeze AI records separately before supplying the score-free owner packet; do not provide the administrative manifest, historical assessments, AI scores or expected findings with the owner form. Preserve actual owner wording and missing dimensions without filling answers. Fewer stories or overall-only responses keep a smaller observed denominator and explicit null reasons. A fresh reviewer does not turn these stories into holdout material.

Coordinate later real owner capture and reconciliation with hcn.13 and hcn.14. This packet neither replaces their required artifacts nor closes owner work. Owner agreement and calibration remain unmeasured until actual owner responses arrive. Ratings and check outcomes cannot authorize publication.

Regenerate with `node evals/calibration/story/tracking-v0.1/prepare-pilot.mjs`. Identical regeneration succeeds. A nonempty journal or differing frozen packet/instrument requires a new output directory; this generator never overwrites it. The deterministic [report](report.md) starts with zero owner and AI observations and all checks unassessed.
