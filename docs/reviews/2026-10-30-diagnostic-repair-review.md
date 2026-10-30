# Diagnostic repair independent review — 30 October 2026

**APPROVED for the bounded development repair in `datapressr-8no.9.9`.** No blocking findings. This verdict applies to implementation commit `e7233f0cbc022bbd99e2ad33c72cfc0cd8940015`, independently reviewed by the delegated Codex reviewer `/root/diagnostic_independent_review`. The reviewer did not implement the change. Root retains task closure and integration responsibility.

This approves an additive manual diagnostic procedure and local custody utilities. It does not establish improved storytelling, calibrated judgments, held-out detection accuracy, model efficacy, owner preference, or permission for another model batch or publication.

## Scope and evidence

Read the repository AGENTS, full assigned Bead and acceptance notes, implementation handoff, exact commit diff, exposed reference-led-v1 decisions, new manual protocol and all six controls, reader utility/tests, renderer, tracker/tests and relevant pilot builder/tests. The six controls were checked against their supplied synthetic evidence rather than accepted on their expected labels alone. No fresh-case inputs or R3 candidate files were opened for review. Historical pilot and experiment evidence were preserved; the reviewer changed only this review document.

All 15 implementation SHA-256 pins in [the handoff](../handoffs/2026-10-30-diagnostic-repair.md) were independently recomputed and matched. Principal pins:

| Source | SHA-256 |
| --- | --- |
| `evals/lib/reader-packet.mjs` | `a783a43f093aa6b27fd9b0fa21a1bd59780a00a28e6d27c5a675669ed4fb73be` |
| `evals/lib/render.mjs` | `148ab2b07bbcc3541521cc9358388beb1670734a049e6e9aa4b3555e6d866066` |
| `evals/lib/story-quality-tracker.mjs` | `1c318fe808c314cff5c041a3bb6be90186f61d79d221365c69f67faa0cbf6e8a` |
| `evals/calibration/story/diagnostic-v2/README.md` | `9f17a373de0f794e8aa918fb970f3f3a7efd629640fd255855fb15e3f31b0c33` |
| `evals/calibration/story/diagnostic-v2/controls.json` | `92d4947bfe926a361a6e8993795899dfd17749a5d59e6e649a0c7d9c8028d613` |
| `evals/calibration/story/diagnostic-v2/rendered/reader/page-1.png` | `d3480381e4c9e1818eee6e03018377f3d042e80946635889ee757684f6b70a6b` |
| `evals/calibration/story/diagnostic-v2/rendered/reader/page-2.png` | `669c834d18b2f466eefb9b75df7bcd7c96c5bd72323e00ecdadc6c0d20c13159` |

## Semantic review

The protocol explicitly separates the main commission from a bounded useful payoff and selects the central claim independently of the first eligible descriptive/accounting relationship. It permits a meaningful explanation through verified attribution within actual scope; it neither demands causal identification for a qualified attribution nor treats a named unavailable source as verified. Chart recovery and delivered readability have separate judgments, with explicit chart-only versus story-assisted exposure.

| Control | Independent judgment and reason |
| --- | --- |
| Debt ratio overstatement | Reject central claim. Debt rises 100→110, but GDP rises 100→125, so the ratio falls from 100% to 88%. The stipulated deficit contribution is a valid levels identity and cannot establish the asserted ratio rise. |
| Bounded payoff without causal answer | Accept comparison and rounded mean: 4/8=0.5 and (10+8+4)/3=7.33. The supplied observations offer no cause, so the commissioned “why” remains unanswered. |
| Population switch | Reject all-government claim. A 10% central-government increase supplies no all-government aggregate result. |
| Futures-to-spot switch | Reject causal transfer. The supplied excerpt attributes pressure on an expiring futures contract and supplies no link to the particular spot observation. |
| Qualified attribution | Accept within the expressly bounded commission. The reported attribution matches the supplied excerpt and contract scope, and the claim explicitly withholds the unsupported spot inference. This is useful source-attributed explanation, not causal identification. |
| Unverified attribution | Keep unresolved. An unavailable passage cannot substantiate the attribution and does not by itself show the attribution false. |

These are exposed synthetic manual controls, not automatic semantic tests or a sample from which accuracy can be estimated. The ratio negative combines wrong direction with causal overreach; it therefore demonstrates rejection of this concrete negative, not isolated sensitivity to causal overstatement in otherwise correct prose. That limit does not defeat the bounded acceptance criterion.

## Render and custody review

Opened both retained PNGs with `view_image`, `detail: original`. Page 1 is 360×220: A=10 and B=20 remain readable, while the title begins far to the right and is cut off, and the source/note footer visibly overlaps. Page 2 is 360×260: the title is visible and the footer lines are separated, with the same A/B comparison. This independently confirms the synthetic recovery/readability distinction. It is inspection through the image tool at retained intrinsic resolution, not physical-device mobile testing or proof of a reader's actual CSS display size.

The ordinary packet helper writes only neutral instructions and byte-identical PNGs with generated names into a new directory. Administrative source identities, manifest and expected answers are not inserted into that directory. Exclusive creation prevents helper-mediated overwrite. Existing output symlinks also fail rather than writing through to their targets. Absolute input/output paths remain intentional caller-controlled paths; this utility is not a filesystem sandbox.

Prompted responses require a pinned spontaneous response with matching packet digest/mode. Release checks both pinned response files and the spontaneous linkage. Missing files, changed hashes, malformed response content and mode/packet mismatches fail; declared assistance from either response affects the released scope. Accessibility remains separate. Prompt freezing, actual stage timing, complete capture, truthful exposure and source withholding remain explicit custodian duties. The release utility compares packet digests supplied by the custodian; it does not reopen a packet manifest and revalidate all image files. Accordingly this is a linkage attestation, not an independent audit of the delivered packet or proof of unaided reading.

The tracker newly checks intrinsic PNG dimensions against the pinned bytes. Its existing path validation rejects repository traversal and escaping symlinks; existing record validation rejects stale render hashes, malformed journals and G4 pass/fail without viewed-render evidence and reported size. Missing reviews remain unassessed. The IHDR reader is explicitly a header-size check, not PNG decoding or visual defect detection. G4 validation establishes evidence presence rather than semantic completeness of every claimed chart/viewport inspection; that coverage remains a manual duty. These limits are adequately disclosed and are not new automatic enforcement claims.

The title helper retains the exact previous pilot regex. Existing byte-stability and freeze-protection tests pass; no historical outputs or frozen instrument are recoded. Existing valid pilot PNGs pass the strengthened dimension check.

## Verification performed independently

- `node --test evals/lib/reader-packet.test.mjs evals/lib/story-quality-tracker.test.mjs evals/calibration/story/tracking-v0.1/prepare-pilot.test.mjs`: **39 passed, 0 failed/skipped**; local log `/tmp/diagnostic-independent-targeted.log`.
- `npm test`: **525 passed, 0 failed/skipped**, reported duration 12,175.9865 ms; local log `/tmp/diagnostic-independent-full.log`.
- `node evals/story-quality.mjs validate evals/calibration/story/tracking-v0.1/pilot/manifest.json evals/calibration/story/tracking-v0.1/pilot/judgments.jsonl`: exit 0.
- Additional temporary-directory adversarial checks: existing symlink output refused without writing into its target; invalid later image rejected before output creation; invalid/truncated/zero-dimension PNG headers rejected; assistance declared only at prompted stage still produces source-assisted scope; missing prompted file rejected; hash-correct malformed response variants with invalid assistance, packet digest, mode, stage or empty response rejected. Together with the 15 handoff hash checks, **27 assertions passed**. Temporary files were removed.
- `git diff --check`: exit 0. HEAD matched the reviewed implementation commit. The pre-existing shared `.beads/issues.jsonl` modification was left untouched.

No implementation revisions are requested. Approval is limited to this exact revision and the stated manual/development boundary; it does not close the broader quality programme or substitute for future independent scoped reading and source verification.
