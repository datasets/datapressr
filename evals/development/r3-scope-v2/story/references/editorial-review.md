# Final editorial review

Use after the prose commit and before a story is presented for shipping. The reviewer is an independent agent who did not write or revise the artifacts. Read [story craft](story-craft.md), [house voice](voice-guide.md) and [charting](charting.md). Review the actual draft, sources and rendered charts; an outline approval or the writer's test summary is insufficient.

First, given only the topic and intended audience, write five to eight reader questions. Then read the artifacts, reproduce the evidence and inspect the rendering. Finish with the verdict. Record concrete findings for every dimension below; use locations, commands/results and source or artifact links so another person can check them. A missing check is an unresolved requirement. Do not average scores into an approval.

Copy this template into the project's internal review folder and fill it in:

## Review identity and revision

- Story and intended audience:
- Reviewer identity (agent/session identifier), date and independence statement:
- Reviewed Git commit:
- Input manifest: path + SHA-256 for prose, approved outline, chart builder, each SVG, data inputs and relevant dependency lockfile; identify external source versions/snapshots and the earlier outline approval:

## Reader questions — written before reading the draft

1. Question → answered / partly answered / missed; draft location and reader consequence.

## Evidence and editorial findings

| Dimension | Required evidence and judgment |
|---|---|
| Reader interest and coverage honesty | State the finding and why this audience should care. Check whether title, lead and promised usefulness follow from the evidence. Record source period, latest observation and retrieval/as-of date; flag historical or limited coverage presented as current, universal or complete. Explain important unanswered reader questions. |
| Evidence and calculations | Independently reproduce every story data number and calculations behind its claims from exact inputs with your own scan, rather than trusting chart-builder output. Record commands/results, row keys, units, periods, denominators, missing-value handling and rounding. Verify attributed external figures against their cited sources. |
| Argument and counterevidence | Compare prose with the approved argument. Seek the strongest counter-number or alternative interpretation and judge its treatment. Locate unsupported causal language; check each explanation's named source and whether the data actually tests it. |
| Charts as visible evidence | Trace each chart to its source rows and transforms. Check labels, units, dates, baselines, gaps, annotations, alt text and prose-number coverage, including explicitly listed exemptions. Inspect the rendered story at desktop and roughly 360px phone width; record actual widths, screenshots or preview artifacts and observed legibility, clipping and collisions. Reading SVG text alone is not a visual check. |
| Writing and house voice | Give a located assessment of the clear finding, structure, usefulness, precision and house voice. Identify inflated claims, filler, chart narration or unclear sentences and propose concrete edits. Check the 300–700-word requirement using the skill's exclusions. This assesses the house guide, not the author's personal voice approval. |
| Reproducibility and draft readiness | Re-run the documented chart build twice against the pinned inputs and compare SVG hashes. Check dataset/build/source links, provenance and licence attribution, frontmatter, local links and published-site link paths. Confirm draft visibility and metadata follow project rules; record outstanding human stages. Do not infer publication permission from passing checks. |

## Outcome

- **Strongest objection:** the most credible reason this story could mislead, bore or fail its reader; cite evidence and explain whether it remains blocking or is adequately addressed.
- **Most valuable revision:** one concrete change and why it matters; mark required or optional. Record its disposition on re-review.
- **Verdict:** `APPROVED` or `CHANGES_REQUIRED`.
- **Required corrections:** numbered items, each with artifact/line or chart location, evidence, requested change and how to verify it. Approval requires all required corrections resolved and all dimensions checked; record acceptable limitations explicitly.
- **Re-review:** new commit and changed-file SHA-256s, correction-by-correction verification, reviewer and new verdict. Preserve earlier rounds. Material changes after approval reopen review; an argument/chart-plan change also needs outline approval.
- **Outstanding human stage:** author's personal voice pass and owner publication approval, as applicable. Agent approval permits draft handoff only; it neither approves personal voice nor publishes the story.
