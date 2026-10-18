# Story quality tracking: small human scorecard, expandable AI diagnostics

Date: 2026-10-18. Task: `datapressr-8no.9.12` (gradual scorecard and tracking); `datapressr-8no.9.9` retains the separate diagnostic/custody repair. Status: starting design under the owner's approved direction; anchors and workflow should be refined using actual owner ratings. This records the direction and a phased handoff, not a new calibrated rubric, implemented tracker or permission for additional model evaluation runs. Beads remains the actionable queue.

## Direction and starting point

The owner supports tracking story quality over time, with AI ratings and some owner ratings, and asks for dimensions that distinguish factual or observable defects from editorial taste. Keep the human task to three dimensions; let AI diagnosis be more detailed without making the human complete the same checklist. Begin manually and expand only when repeated failures or disagreements justify it.

The [existing manual candidate](../../evals/calibration/story/reference-led-candidate.md) already defines seven editorial dimensions and four evidence gates. Its [procedure](../../evals/calibration/story/reference-led-protocol.md) preserves independent ratings, missing owner evidence, scope and versioning. Reuse those concepts rather than create another competing rubric. The first comparison's [results](../../evals/experiments/story-quality/reference-led-v1/results.md) and [decisions](../../evals/experiments/story-quality/reference-led-v1/decisions.md) show why refinement is needed: a 2–2 pairwise split, primary diagnostic ceilings, specific visual and analytical defects, and no owner scores. The prior seven-dimensional 0–2 observations must not be converted into invented /10 ratings.

The proposed tracking record has three distinct layers: editorial ratings, evidence checks and resource/process observations. A high editorial rating cannot cancel a factual failure or an unresolved central claim. A readable chart is not necessarily an interesting chart; a technically correct story can still be dull.

## Human scorecard: three questions

Use whole-number 1–10 ratings, with `null` for not rated. The shared 2/4/6/8/10 anchors below guide judgment without pretending that each one-point change has a precise measurable meaning. Scores 1 and odd numbers are available between or below anchors. A short reason and the single most useful improvement are more valuable than forced precision.

| Stable dimension ID | Human question | Low anchor: 2 | Working anchor: 6 | Strong anchor: 8 |
| --- | --- | --- | --- | --- |
| `human.reader_value` | Was this worth reading? Did I learn something that matters? | Dataset tour or familiar facts with little payoff. | A useful finding, but its significance or freshness needs work. | A revealing, consequential comparison or answer worth sharing. |
| `human.explanation_argument` | Did I understand the answer and why the evidence supports it? | The conclusion or relationship between findings is unclear. | Main answer is understandable, but an important explanation, boundary or alternative needs work. | Clear reasoning and explanations; important limits and alternatives sit where they affect interpretation. |
| `human.presentation` | How easy and enjoyable was it to read the prose and charts? | Hard to follow or decode. | Understandable, with substantial editing or chart clarification needed. | Fluent prose and charts that make the intended comparison easy to grasp, with only minor edits. |

The three questions are editorial judgments. The owner need not independently recompute data to answer them. Preserve concrete confusion or suspected errors alongside the rating and route those observations to the checks below. For presentation, a simple comment tag such as `prose` or `chart` can locate a problem without adding a fourth required dimension. No average of these dimensions is the overall score.

An **optional independent overall /10** answers: “How good is this story for its intended audience and commission?” It is a separate editorial judgment, not a sum or weighted composite. The previous proposed anchors are retained as a starting point:

| Score | Overall editorial anchor |
| --- | --- |
| 2 | Confusing or largely a dataset dump. |
| 4 | Understandable, but shallow or weakly explained. |
| 6 | Useful story with substantial editing needed. |
| 8 | Strong, compelling and clear; minor editorial work. |
| 10 | Exceptional reference-quality work. |

The earlier proposed “8 = happy to publish after minor edits, provided factual checks pass” is a candidate editorial anchor, not an owner publication approval or a confirmed calibration standard. Ask the owner whether that meaning fits when collecting first ratings. An editorial 8 with an unresolved central claim still carries `verification-required`; publication retains its existing approval process. Overall is optional so the routine human form remains three ratings rather than four mandatory ones. The owner may also give just an overall score and a comment when time is short; missing dimensions stay missing.

## AI scorecard: compatible summary plus richer diagnosis

For owner/AI comparison, the AI supplies the same three human-facing dimensions and optional overall using the same anchor version, independently and before seeing the owner response. These are new judgments, not mathematical translations of existing scores.

Retain the existing seven diagnostic dimension IDs, their 0–2 anchors and `null` for unassessable: `interest`, `findings_depth`, `argument_counterevidence`, `explanation`, `chart_design`, `writing`, `reader_coverage`. Each has a cited passage/chart, reason and uncertainty. Keep them separate from the /10 layer and do not sum them. They can explain a disagreement even when the coarse headline dimensions tie.

| Human summary dimension | Relevant existing AI diagnoses; not aggregation weights |
| --- | --- |
| Reader value | Interest, findings depth, reader coverage. |
| Explanation and argument | Argument/counterevidence, explanation, reader coverage. |
| Presentation | Writing, chart design. |

The same observation can inform more than one dimension. That is acceptable for diagnosis, but another reason not to add scores together. Do not require exhaustive analysis of every sentence for each small rating session. Freeze the intended scope and assess the central claims/charts first, retaining what was not checked.

## Evidence checks: atomic, scoped and separate from taste

Keep G1 source/scope, G2 factual/analytical validity, G3 reproducibility and G4 delivered visual integrity as the existing gate families. Add small atomic check records beneath them when useful; those records are diagnoses, not extra /10 dimensions. Every check has a stable ID, target locator, checked scope, method, evidence locator, outcome and follow-up. Outcomes are `pass`, `fail`, `unresolved` or `not-applicable`. Missing work is unresolved or not yet assessed, never a pass. Record a reason for not applicable.

| Initial check example | Gate | What establishes the result |
| --- | --- | --- |
| `source.central_claim_scope` | G1 | Pin source/vintage and compare measure, population, unit and denominator with the named central claim. |
| `analysis.central_arithmetic` | G2 | Recompute the named difference, ratio or percentage-point change from pinned rows; retain calculation and scope. |
| `analysis.inference_scope` | G2 | Examine whether the exact descriptive, accounting or causal claim exceeds the evidence or named attribution; record reviewer reasoning and unresolved alternatives. |
| `reproduction.pipeline` | G3 | Record which steps actually ran: raw-to-CSV, CSV-to-chart, render. Partial success must not become a whole-pipeline pass. |
| `visual.label_collision` | G4 | Inspect the actual delivered render at recorded viewport/size for overlapping labels, clipping and obscured meaning; locate the affected objects and render. |
| `visual.encoding_integrity` | G4 | Check plotted positions, units, labels and scale against the named data/encoding. Distinguish incorrect geometry from a stylistic dislike. |

These checks differ in how objective and automatable they are. Arithmetic and geometry can often be directly tested. Causal scope still needs reasoned assessment. A model saying “no overlaps” without seeing the delivered chart is not verification. An automated bounding-box collision can also be harmless or intentional: preserve the detected geometry separately from a judgment that it obstructs reading.

“I could immediately tell which mark was which year” is **interpretive ease**, supported by a reader's first response, not by the mere existence of a legend. Keep it under chart design/presentation with evidence. The chart may pass geometry checks and remain difficult to understand. Conversely, an owner may like the design while a label covers a material value. Preserve both observations.

Do not prescribe blanket gate passes from a small sample of claims. Record per-target coverage; a story-level disposition identifies any material fail or unresolved central evidence, as well as the actual checked scope. Unavailable sources remain unresolved, not false. Unchecked regions and render variants stay visible.

## Small append-only tracker

Start with a few manually maintained records and a generated or hand-maintained reading table, not a new platform. A simple JSONL file for judgments/checks plus a small Markdown summary is sufficient for the first implementation. Agree an exact minimal schema in that task; the fields below are the contract it must preserve.

| Record group | Minimum identity or evidence |
| --- | --- |
| Story/artifact | Stable story ID, exact revision/commit or content hash, commission/audience, chart/render identities and viewed size; comparison case/pair IDs when applicable. |
| Judgment | Unique judgment ID, time, human or AI role, pseudonymous owner/judge identity, requested model/effort and served identity if available; unknown stays unknown. |
| Instrument | Schema version, human anchor version, AI diagnostic version, prompt/procedure version and check-definition versions. Existing manual v1 identities remain intact. |
| Context/exposure | Materials actually shown, stage/order, prior exposure, whether treatment/model identity or prior ratings were visible, and whether the rating is retrospective or prospective. |
| Scores | Dimension ID, value or null, reason, evidence locator and uncertainty; missing reason such as not requested, no response or insufficient evidence. |
| Checks | Check ID, target/scope, method, evidence, outcome, checker identity/version and needed next action. |
| Process | Writer/review rounds and recorded resources, with units and accounting boundary. Unknown tokens/costs are not zero; avoid double-counting overlapping counters. |

Keep owner and AI judgments as separate rows linked to the same artifact. Preserve verbatim owner remarks; any later coded interpretation links back to the original. Do not infer a numeric rating from historical comments or convert “no reply” into agreement. Corrections and adjudications append a superseding record with a reason; original records remain available.

Use proposed namespace `story-quality-tracking-v0.1` for the first tracking instrument, distinct from frozen `reference-led-manual-v1` and runtime `story/v2`. These are proposed identifiers until the implementation freezes exact definitions. No `evals/rubrics/story/v3.md`, runner/default change, ledger-score conversion or automatic rubric promotion is part of this design; the existing highest-version selection behavior makes casually adding a runtime rubric unsafe.

## First calibration and gradual evolution

Begin with existing output artifacts so new writing is unnecessary. The eight reference-led outputs provide an available development set; a small, declared subset of about four can be used for the first owner session. Choose coverage across topic, arm and known failure types rather than selecting apparent winners. If the owner wants fewer, retain that smaller denominator. Coordinate with the existing owner-reading and reconciliation tasks (`hcn.13`, `hcn.14`), retaining their original required artifacts rather than silently replacing them with this set.

Freeze AI ratings before revealing owner scores. Offer the owner the exact same story/render revision with the brief, without AI scores. Where feasible hide treatment identity; previous exposure or mappings cannot be undone, so record it honestly. These are **new retrospective ratings of old stories**. The rating procedure can be fixed prospectively before the owner session, but neither the stories nor the topics become a fresh holdout. No ratings have been collected under this proposed instrument yet.

After the first few paired owner/AI ratings, examine the largest disagreements and the reasons. Change a dimension only if it improves a real decision: for example, repeated “correct legend but confusing years” failures might justify a specific first-reading interpretation check. A one-off complaint can remain an annotation. Proposed additions need a definition, examples and counterexamples, an evidence method, a burden estimate, and a statement of what existing field fails to capture. Avoid a growing collection of near-duplicate dimensions.

Freeze versions within each evaluation. When anchors, prompts or judge models change, retain the old series and run a small bridge: rerate the same fixed artifacts under old/new conditions, as available, recording the overlap and any missing owner participation. A bridge diagnoses a discontinuity; it does not prove a universal conversion formula. Never overwrite old scores or retrospectively tune the rubric to make a candidate win. Rubric revisions and model-quality claims require separate evidence.

## What to track over time

Keep a **fixed comparison set** distinct from a **production trend**. Repeated judgments on fixed revisions can expose judge/rubric drift; matched new story versions on fixed commissions can assess changes in the workflow. Those exposed examples remain development material. A fresh case is needed to investigate transfer, using the existing fresh-case preparation handoff.

Production ratings describe the stories actually made and the work required; changes in topic difficulty, audience, reviewer or source availability can move their scores. A rising production average alone is not a causal performance improvement. Record counts, topic mix and missing owner coverage alongside any summary.

Start by showing the individual ratings, per-dimension owner/AI differences, observed matched-pair preferences and the largest disagreements with their evidence. Once enough observations exist, add descriptive medians or absolute owner/AI score differences with sample counts and version partitions; treat integer /10 judgments as coarse ordinal evidence, not precise interval measurement. Keep failures/unresolved checks, revision rounds and effort alongside quality. Missing owner replies cannot enter an agreement denominator. Do not count multiple charts, dimensions, order swaps or repeated ratings as independent stories.

The useful operational question is whether stories reach the owner's accepted quality with fewer substantive revisions and no unresolved material validity problems. Numeric quality, validity and effort remain separate so a cheaper weak story or a costly unverifiable one cannot look like a win through averaging.

## Phased handoff and success conditions

1. **Log and settle the starter instrument.** Record this direction in Beads, connect the existing diagnostic/owner-calibration tasks, and independently review the three-question form plus minimal record contract. Success: the human form fits three required ratings, evidence and taste remain separate, and no historical ratings are invented. The present document delivers the design, not the later tasks.
2. **Create the minimal manual tracker and first packets.** Freeze versioned anchors/schema and a small declared artifact set; prepare independently scored AI records and an owner form. Success: exact revisions/renders and exposure are recorded, raw observations survive, and every score/check can be traced to its evidence. No new writers or paid evaluation campaign is required; any separately invoked evaluation calls need their own scope and bounds.
3. **Capture actual owner judgments and compare.** Let the owner rate the same artifacts without AI-score anchoring where possible. Success: owner/AI rows stay separate, disagreements are examined with concrete passages/charts, no-response remains missing, and the first summary reports its small sample honestly. Owner-dependent work cannot be closed by agent substitutes.
4. **Refine from repeated evidence.** Propose only justified diagnostic additions; bridge changed versions on fixed examples and preserve the previous records. Success: an added check demonstrably describes a recurring failure or disagreement more precisely without enlarging the routine human form. Runtime promotion remains a separate decision under `hcn.14`; no automatic promotion follows from this tracker.

This is deliberately a small start. A few useful owner/AI disagreements and clear artifact-linked checks are more valuable than a large uncalibrated scorecard. Completion of the initial tracker would establish record keeping and a usable feedback loop, not calibrated AI taste, generalized story improvement or permission to publish.

## Owner direction, preserved

The owner wrote on 18 October 2026:

> we could also even get more granular and identify different dimensions to rate data stories on - this would probably be even better for me an AI. it seems a little project to identify a good set of dimensions to rate on. for a human i wouldn't be having more than 2-3 (maybe 4 dimensions). but for ai could be more granular. the point would also be to have some that were more factual (are graphs readable, no overlapping labels etc. is data correct etc. whilst others are more taste based ....)
>
> overall i already like your approach and this should be logged *and* we could develop this more granuarl scoring system (probably gradually - it would be good to start basic but with the struture to evolve e.g. after training runs or evaluations we can see if there are feature dimensions we could add to the scoring system)
