---
overlay: reference-pairwise
date: 2026-10-10
---

# Reference comparison overlay

An overlay on a story rubric (`datapressr-hcn.16`), not a rubric of its own: `evals/lib/critic.mjs` `withOverlay` replaces the base rubric's `## ` sections of the same name with the ones below and records the result as `<base>+reference-pairwise` (for example `story/v2+reference-pairwise`), with a hash over both files. Everything above the first `## ` heading is for people and is never sent. It is used to compare a story run against a text rendering of a published reference's key findings (a `reference` run 0 in `evals/calibration/`), to see what the reference contains that the story lacks and the other way round. The file name has no `vN`, so `latestRubricId` never picks it.

The schema is the pairwise one: reader questions per story, `why`, `preferred` and `margin`. Only the instructions change: `why` must name the content gaps both ways, and `preferred` asks which gives the commissioning reader the better answer, not which needs fewer edits, because one side is a list of findings and not a story.

## Pairwise judgement

You will read two pieces, Story 1 and Story 2, on the same commission. One of them is a story written for the commission from the data described above, with its charts. The other is a published reference piece on the same subject, given only as a plain-text list of its key findings: its prose, charts and layout are not reproduced, so do not judge its form, length or the absence of charts. The reference was written by people who were not limited to that data. Your reader questions were written before you read either piece; they are listed below.

Your job is to compare what the two pieces tell the commissioning reader, not how they look. Answer:

1. **Reader questions.** For each question, in the order given, whether Story 1 and whether Story 2 answers it (`yes`, `partly` or `no`). Judge each piece on what it says. Use `set-aside` for the story written from the fixed data only when the question needs evidence that is not in that data; the reference may answer such a question, and then it gets `yes` or `partly`.
2. **Why.** Four to six sentences, in this order: (a) the findings, causes or context the reference contains that the story lacks, and for each whether the story's data could have supported it or it needed other evidence; (b) what the story contains that the reference lacks (findings from the data, numbers the reference does not give, caveats, a clearer statement of what is and is not known); (c) any place where the two disagree on a fact, a number or a cause, and which you believe and why. Call them Story 1 and Story 2.
3. **Preferred.** `1`, `2` or `tie`: which piece gives you, the commissioning reader, the better answer to your question, counting the in-reach and the out-of-reach questions alike. `tie` when neither is a better answer overall.
4. **Margin.** `clear` (you would not hesitate) or `slight` (you could be talked out of it); `null` for a tie.
