# Final editorial review

Use after the prose commit and before a story is presented for shipping. The reviewer is an independent agent who did not write or revise the artifacts. Read [story craft](story-craft.md), [house voice](voice-guide.md) and [charting](charting.md). Review the actual draft, sources and rendered charts; an outline approval or the writer's test summary is insufficient.

First, given only the topic and intended audience, write five to eight reader questions. Then read the artifacts, reproduce the evidence and inspect the rendering. Finish with the verdict. Record concrete findings for every dimension below; use locations, commands/results and source or artifact links so another person can check them. A missing check is an unresolved requirement. Do not average scores into an approval.

## Claim checks — writer runs before handoff, reviewer re-runs

Each failed at least once in production review (bead datapressr-6jr). Check every sentence of the draft, including title and description.

1. **Names and paraphrase match the source.** Copy names from the cited page; paraphrase no stronger than it. *Before:* "Johan Hellstrand found no other factor explains it." *After:* "Julia Hellstrand and colleagues could not identify a factor that explains it."
2. **Every outside figure or anecdote has a link that states it**; otherwise cut it. Generalisations ("the usual explanation") need a source too. *Before:* "The IEA expects 294 GW next year." *After:* cut, or link the IEA page that gives 294 GW.
3. **Accounting words, not causal ones.** Shares of a change are "accounted for", not "covered" or "supplied"; a policy claim needs a source that says it. *Before:* "Solar covered most new demand." *After:* "Solar accounted for most of the net increase in generation."
4. **Name the unit and the scope.** Say what the data counts and over what span. *Before:* "the first time ever, in 40 countries". *After:* "the first time in this 1985–2025 series, in 40 of the UN's countries and areas". (`story-check` S8 warns on unscoped "first time/ever/record".)
5. **Date the hook.** State the latest data year and why now; never call old data "now", and credit who reported it first. *Before:* "Births are now falling." (2023 data) *After:* "In 2023, the latest year in the data, births fell…"
6. **Lead with the strongest finding and check the path, not just endpoints.** Compute the share of the total change each part explains; check for a peak or trough between endpoints. *Before:* "Fossil generation is lower than in 1985." *After:* "Fossil generation peaked in 2007 and has been roughly flat since; solar and wind supplied 99.7% of net growth."
7. **No precision claims without evidence.** Mention revisions only with a cited revision history. *Before:* "within the range revisions could change". *After:* cut, or quote the size of past revisions from the publisher's revision notes, linked.

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
| Evidence and calculations | Independently reproduce every story data number and calculations behind its claims from exact inputs with your own scan, rather than trusting chart-builder output. Record commands/results, row keys, units, periods, denominators, missing-value handling and rounding. Verify attributed external figures against their cited sources. Re-run the claim checks above and list each failure. |
| Argument and counterevidence | Compare prose with the approved argument. Seek the strongest counter-number or alternative interpretation and judge its treatment. Locate unsupported causal language; check each explanation's named source and whether the data actually tests it. |
| Charts as visible evidence | Trace each chart to its source rows and transforms. Check labels, units, dates, baselines, gaps, annotations, alt text and prose-number coverage, including explicitly listed exemptions. Inspect the rendered story at desktop and roughly 360px phone width; record actual widths, screenshots or preview artifacts and observed legibility, clipping and collisions. Reading SVG text alone is not a visual check. |
| Writing and house voice | Give a located assessment of the clear finding, structure, usefulness, precision and house voice. Identify inflated claims, filler, chart narration or unclear sentences and propose concrete edits. Check that the opening paragraph stands alone as a summary of the finding with a number (the skill's opening rule) and that the length is earned; there is no word limit. This assesses the house guide, not the author's personal voice approval. |
| Reproducibility and draft readiness | Re-run the documented chart build twice against the pinned inputs and compare SVG hashes. Check dataset/build/source links, provenance and licence attribution, frontmatter, local links and published-site link paths. Confirm draft visibility and metadata follow project rules; record outstanding human stages. Do not infer publication permission from passing checks. |

## Outcome

- **Strongest objection:** the most credible reason this story could mislead, bore or fail its reader; cite evidence and explain whether it remains blocking or is adequately addressed.
- **Most valuable revision:** one concrete change and why it matters; mark required or optional. Record its disposition on re-review.
- **Verdict:** `APPROVED` or `CHANGES_REQUIRED`.
- **Required corrections:** numbered items, each with artifact/line or chart location, evidence, requested change and how to verify it. Approval requires all required corrections resolved and all dimensions checked; record acceptable limitations explicitly.
- **Re-review:** new commit and changed-file SHA-256s, correction-by-correction verification, reviewer and new verdict. Preserve earlier rounds. Material changes after approval reopen review; an argument/chart-plan change also needs outline approval.
- **Outstanding human stage:** author's personal voice pass and owner publication approval, as applicable. Agent approval permits draft handoff only; it neither approves personal voice nor publishes the story.
