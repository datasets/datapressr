# Fidelity review: an independent, fresh-context pass

Packaged with the `story` skill; used in step 4 after the draft, and again as a delta after the final editorial review. Why: in the held-out tests (Factory `projects/story-remakes/rounds/h1`, `h2`, `h3`, 2026-11-13), the D2 accuracy failures were mostly plain-words restatements that changed a measure ("retail" for "retail and wholesale"; "held elections" for a year-end status). The writer's own fidelity table passed them. With a fresh-context reviewer building the table, both accuracy gates passed in 7 of 10 stories against 3 of 10 without it (h3).

This pass checks **fidelity only**. It does not edit for style, structure, figures or length, and the writer fixes only what it flags, in as few words as the fix needs.

Run it as a **separate subagent with a fresh context**: it sees only the inputs listed, never the writer's notes, outline reasoning or drafts. If the runtime has no subagent tool, do the pass yourself as a separate step, starting from a re-read of the README alone (plus the listed inputs), not from memory of writing it. That fallback is weaker: say in NOTES.md that it was a self pass, and use `Reviewer: writer (self pass)`.

**Inputs:** the README, the chart SVGs, and the source definitions: DATA.md, PROVENANCE.md and the publisher's metadata or documentation pages the writer saved. Not the writer's notes.

**Brief to give the reviewer (copy it):**

> Find every plain-language phrase in the title, description, prose, chart titles, subtitles and captions that stands for a measure, population or category (for example "payroll jobs", "unvaccinated", "held elections"). Check each against the source definitions for measure, population, period, geography and category. Do not comment on style, structure or length. Return a table under `## Measure fidelity review`, preceded by a line `Reviewer: <your identity>, <date>`, one row per phrase, every cell filled:
>
> `| Phrase as published | Where | Source wording and definition | Mismatch | Resolution |`
>
> Quote the phrase exactly as published, in double quotes. Mismatch is `none` or names the field and the gap ("measure: year-end status, not elections held that year"). For a mismatch, put `pending: "<the source's own wording, fitted to the sentence>"` in Resolution; otherwise `ok`. If the flagged phrase also appears elsewhere and those uses do match the source, append `; ok-elsewhere: "<where>"` to that Resolution.

**The writer then:** pastes the table into NOTES.md, fixes every flagged phrase (use the proposed wording or the source's own) and replaces `pending:` with `fixed:` and the wording as now published, in double quotes. `story-check`'s `fidelity` warning checks that the table has a Reviewer line, that unflagged phrases are still published, and that each fix is published and the flagged phrase gone, unless the Resolution says `ok-elsewhere`. It cannot judge the match or prove the reviewer's independence; the final editorial reviewer audits both (claim check 13).

**Delta re-pass.** A later change to a measure phrase, a claim or a figure, including one made to answer the final editorial review, goes back to a fresh-context fidelity reviewer as a delta: only the changed sentences, recorded under `## Final review delta` in NOTES.md, with the charts and source definitions, then `story-check` again (SKILL.md step 4, "After the final review").
