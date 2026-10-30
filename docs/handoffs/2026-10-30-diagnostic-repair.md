# Diagnostic and reader-packet repair — implementation handoff

Task `datapressr-8no.9.9`; actor `codex-diagnostic-repair-20261030`. Exact start and total usage were not recorded; the first explicit clock check was 19:20:58 UTC on 30 October. This is one bounded repair session, maximum 120 minutes plus independent review; no cap reset. Root coordinates review and closure.

## Bounded design and implementation plan

The accepted workplan and task authorize this repair. The existing tracker already validates exact render hashes and refuses G4 pass/fail without render evidence and reported viewing size; malformed journals already fail. The pilot builder already removes a duplicate identical leading H1. Neither needs a replacement runner. Gaps: manifest dimensions are asserted rather than checked against PNG bytes, and ordinary reading can expose hidden captions/source before the screenshot, as the workshop reader explicitly recorded.

- [x] Add failing tests for actual PNG dimensions, stale review after changed asset, missing/malformed review evidence, image-only delivery and immutable packet outputs.
- [x] Reuse the existing render library and pilot title correction; provide a small PNG packet utility, not a model runner. Only neutral instructions and copied raster images enter the reader directory; HTML/SVG/source and accessibility assistance stay outside it. Retain hashes, intrinsic and intended display dimensions in an administrative manifest.
- [x] Add an additive `reference-led-manual-v2` protocol and exposed/synthetic diagnostic controls separating useful payoff, commission completeness, claim type/scope, comparison recovery and delivered readability. Freeze spontaneous and prompted responses before source/anchor release; disclose accidental assistance and keep accessibility reading separate.
- [x] Run targeted and full tests, retain a synthetic clipped/overlapping-label render and correction, document actual inspection limitations and hand off for independent review.

No historical v1 records, installed skills, workshop packets, fresh-case inputs, R3 candidate, Factory plan or model calls are changed by this work. Independence and efficacy remain unmeasured.

## Implementation and evidence

The implementation is complete for independent review, not yet independently approved and not closed. Files below are owned by this task; `.beads/issues.jsonl` is shared coordinator state and is not part of the implementation commit.

- `evals/lib/reader-packet.mjs` and tests: image-only ordinary-reading delivery into an exclusive new directory; exact PNG hashes/intrinsic and intended display sizes returned administratively; shared single-title helper; exclusive verbatim spontaneous/prompted response files; hash-linked verification-release attestation; explicit assistance/accessibility scope. Source, HTML and hidden/alt descriptions stay outside the generated reader directory.
- `evals/lib/render.mjs`: PNG IHDR size reader, explicitly not a decoder/readability detector.
- `evals/lib/story-quality-tracker.mjs` and tests: manifest dimensions now checked against exact PNG bytes; regression coverage for existing stale-review, missing-review and malformed-review handling. This does not replace the existing runtime or frozen tracker instrument.
- `evals/calibration/story/tracking-v0.1/prepare-pilot.mjs`: uses the shared duplicate-title helper with unchanged output. Existing byte-stability tests pass.
- `evals/calibration/story/diagnostic-v2/`: additive manual protocol, six synthetic/exposed semantic controls, original SVG fixture sources, existing-renderer fixture builder, retained ordinary reader PNGs and administrative manifest.

Red evidence: reader-packet tests initially failed for absent helper behaviors; the actual-dimensions test specifically failed with “Missing expected exception” against existing `validateManifest`. Existing stale-review behavior passed before modification and is correctly described as coverage, not a newly fixed defect. Green: targeted suite 39/39; full `npm test` 525/525 (0 failed/skipped), approximately 12.1 seconds reported. `node evals/story-quality.mjs validate evals/calibration/story/tracking-v0.1/pilot/manifest.json evals/calibration/story/tracking-v0.1/pilot/judgments.jsonl` passed. `git diff --check` passed. Full test log is local `/tmp/datapressr-diagnostic-repair-tests.log`, not a publication artifact.

The fixture was rendered with `node evals/calibration/story/diagnostic-v2/build-fixtures.mjs evals/calibration/story/diagnostic-v2/rendered` using the existing Chrome/sips renderer at scale 1. Author opened both resulting PNGs via `view_image` with `detail: original`: 360×220 bad and 360×260 corrected. The first visibly clips “Group B doubles group A” at its right edge and overlaps source/note text at the bottom; its A=10/B=20 comparison is still recoverable. The corrected title/footer are visible without those defects. This is author visual checking of one synthetic fixture, not independent review or physical-device mobile testing. The helper does not automatically detect either defect.

## Manual semantics and limits

The six controls independently require: reject a debt-ratio causal overstatement despite valid numerator identity; preserve a useful true price comparison while leaving the causal commission unanswered; reject central/all-government population transfer; reject futures/spot causal transfer; accept verified qualified attribution within its actual reach; keep unavailable attribution unresolved. These are explicit expected manual judgments, not automatic semantic classification or held-out accuracy. Independent reviewer must challenge them against the supplied synthetic evidence. Exposed v1 decisions and workshop observations motivated failure classes, not candidate tuning on fresh material.

Enforced by code: exclusive helper writes, exact PNG hashes/dimensions, linked frozen response hashes, rejection of missing/malformed/changed response evidence, explicit source-assistance/accessibility records, existing G4 evidence and reported-size requirements, existing stale-render review rejection. Manual duties: honest exposure/identity, complete rendered capture, actual viewer size, separate chart-only reading before prose (otherwise story-assisted), prompt freezing, source release timing outside the helper, semantic support judgments and visual readability. The helper cannot sandbox a reader, prove absence of undeclared assistance, turn a timestamp into trusted custody, inspect arbitrary HTML/CSS or detect all label collisions. Header-valid PNG is not necessarily decoded/readable; actual view review remains required. No rule/instrument promotion or quality gain is claimed.

Materials read: repository AGENTS/workplan; full `.9.9` bead including Forge/workshop notes; v1 decisions and manual protocol; current tracker/renderer/pilot builder and tests; workshop reader-first/probes; Factory Forge lessons. No fresh case, R3 candidate or private book was read. No model batch, paid run, publication or installed prose-rule mutation occurred. Only synthetic figures were created.

## Independent review handoff

Review the exact file hashes below (or the implementation commit reported by the worker), run the targeted tests and existing pilot validation, open both PNGs at their retained sizes, inspect controls against their supplied evidence, and challenge whether the helper/protocol boundary is honestly stated. In particular, test malformed/missing review and response evidence, changed-image staleness, hidden/source assistance leakage, single-title preservation and qualified attribution versus unsupported causal transfer. Approval can establish bounded development repair only. Root owns review corrections, accepted revision and Beads closure; author has not self-closed the task.

## Implementation file pins

Hashes exclude this self-referential handoff. The independent review record should name the final commit and any subsequent fixes.

| Path | SHA-256 |
| --- | --- |
| `evals/lib/reader-packet.mjs` | `a783a43f093aa6b27fd9b0fa21a1bd59780a00a28e6d27c5a675669ed4fb73be` |
| `evals/lib/reader-packet.test.mjs` | `7201c2b61895f6a32d5bda6429300ddae6237ab1a4060e87bf9bdb6c618ddfbd` |
| `evals/lib/render.mjs` | `148ab2b07bbcc3541521cc9358388beb1670734a049e6e9aa4b3555e6d866066` |
| `evals/lib/story-quality-tracker.mjs` | `1c318fe808c314cff5c041a3bb6be90186f61d79d221365c69f67faa0cbf6e8a` |
| `evals/lib/story-quality-tracker.test.mjs` | `7a0a149f650904403a4ca1fad7f07fae0a9554f8d8b49f8edfbdf2572e98205f` |
| `evals/calibration/story/tracking-v0.1/prepare-pilot.mjs` | `a1b020b7907f7ba400dd7704e0af3ca0a3d5703747a4b50a2db88bd4843c5a5e` |
| `evals/calibration/story/diagnostic-v2/README.md` | `9f17a373de0f794e8aa918fb970f3f3a7efd629640fd255855fb15e3f31b0c33` |
| `evals/calibration/story/diagnostic-v2/build-fixtures.mjs` | `0ddc06567082670b244c7922dd2bc039b56bf3578be5c44fe5bd7f6a8fb5e5a9` |
| `evals/calibration/story/diagnostic-v2/controls.json` | `92d4947bfe926a361a6e8993795899dfd17749a5d59e6e649a0c7d9c8028d613` |
| `evals/calibration/story/diagnostic-v2/fixtures/clipped.svg` | `9f6ffcb523caa08c22f8cd7872a2ccf4be9fdbff6af4c6615debb2c521dfa798` |
| `evals/calibration/story/diagnostic-v2/fixtures/corrected.svg` | `85f187314b054729db975585c07fc2ee43b83280703817c106b3dfd1c533efd9` |
| `evals/calibration/story/diagnostic-v2/rendered/manifest.json` | `51641899a6254d2cbf5f74ed8fc70c522bc7a36a4dd39419f046490b7c6eae58` |
| `evals/calibration/story/diagnostic-v2/rendered/reader/README.md` | `77d556ed41c816dd4561257af55c6f56bdaf5b8e98254a5e44c11108cdab6666` |
| `evals/calibration/story/diagnostic-v2/rendered/reader/page-1.png` | `d3480381e4c9e1818eee6e03018377f3d042e80946635889ee757684f6b70a6b` |
| `evals/calibration/story/diagnostic-v2/rendered/reader/page-2.png` | `669c834d18b2f466eefb9b75df7bcd7c96c5bd72323e00ecdadc6c0d20c13159` |

## Accepted review and readiness attestation

Independent reviewer `/root/diagnostic_independent_review` APPROVED implementation `e7233f0cbc022bbd99e2ad33c72cfc0cd8940015` without requested fixes. The [review record](../reviews/2026-10-30-diagnostic-repair-review.md) has SHA-256 `0013a12d92fd5421634d7482169d8145229fcef67471d7ef602b762031e7457c`. The reviewer independently passed 39 targeted tests, 525 full tests, existing pilot validation and 27 additional assertions including all 15 file pins. Worker rechecked all 15 implementation pins against working bytes and the reviewed commit before acceptance; no implementation changes followed review.

Under root's explicit closure delegation, `.9.9` meets its bounded acceptance criteria and its diagnostic/custody prerequisite is ready for `.9.11`. Consume `reference-led-manual-v2` at this exact reviewed revision, with manual semantic and visual checks, truthful exposure/capture duties and the helper limitations preserved. This attestation concerns only `.9.9`: it does not attest fresh-case or candidate readiness, authorize a model batch, establish efficacy/calibration or close the broader quality programme. No fresh-case or candidate files were opened for this acceptance step. The review-only evidence commit is recorded in Beads and the coordinator handoff.
