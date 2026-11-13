# Cold edit and fidelity review: two fresh-context passes

Packaged with the `story` skill; used in step 4 after the draft. Why: in the h2 held-out test (Factory `projects/story-remakes/rounds/h2/results.md`, 2026-11-13), more writing rules no longer moved results. Our stories carried 1.7 figures per sentence against the originals' 0.8. They opened on definitions and ended on what the data can't say, and the writer's own fidelity table passed "held elections" for a year-end status measure. A reader who has not seen the notes catches what the writer can't.

Run each pass as a **separate subagent with a fresh context**: it sees only the inputs listed, never the writer's notes, outline reasoning or drafts. If the runtime has no subagent tool, do the pass yourself as a separate step, starting from a re-read of the README alone (plus the listed inputs), not from memory of writing it. That fallback is weaker: say in NOTES.md that it was a self pass, and use `Reviewer: writer (self pass)`.

## A. Cold edit

**Inputs:** the README, the chart SVGs, the commission question, the outline's one-sentence argument and its list of caveats and attributions (not its reasoning), and the `density` line from `story-check`.

**Brief to give the editor (copy it):**

> You are a newspaper data editor seeing this story for the first time. Edit it for a general reader. Cut, reorder and reword only: add no fact, number, source, comparison or explanation that is not already in the README. Keep every caveat and attribution on the list, and every qualifier ("about", "on this measure", "in this series"): you may move them, not drop them. The first paragraph after the first chart must still stand alone as the summary: the finding with at least one number, at most 80 words.
>
> a. **Open on the news hook or the stake**: a dated event in the README (the latest reading, a decision, a release) or why the measure matters to a reader, then the finding. A stake from a linked source stays attributed; never imply that these figures show a cause or effect they don't. Move definitions later, to where the reader first needs them.
> b. **Cut figures** that a chart already shows or that don't serve the finding, aiming for under 1.2 figures per sentence and under 15% of sentences with three or more (the `density` line lists the worst). Keep each number the argument rests on, and every caveat's number, exactly as written. Don't split or pad sentences to dilute the count; if a figure must stay, say why in the change log.
> c. **State the finding once, plainly**, as the README's own evidence supports it: the strongest true sentence, not the most dramatic. Plain means no hedging stack and no throat-clearing. It does not mean a new cause, a "why" the README doesn't attribute to a named source, or a scope wider than the data's.
> d. **End on the answer**: the strongest supported point or its implication, not a list of what the data can't say. When uncertainty is the answer, end on it. A caveat that limits a claim stays beside that claim; only measurement mechanics move to "How this was made".
> e. **Return** the full revised README, then a change log: one line per change (what, where, why: a, b, c or d), marking any moved section or beat. End with the `density` figures you expect.

**The writer then:** re-runs `story-check`, and accepts the edit unless a change breaks accuracy (a wrong number, a lost caveat or qualifier, a claim beyond the data or the approved outline). Record each rejected change and why in NOTES.md under `## Cold edit`, and list moved beats there for the final reviewer. A rejected change is fixed in your own words, not reverted wholesale.

## B. Fidelity review

Run after the cold edit is settled, on the final wording.

**Inputs:** the README, the chart SVGs, and the source definitions: DATA.md, PROVENANCE.md and the publisher's metadata or documentation pages the writer saved. Not the writer's notes.

**Brief to give the reviewer (copy it):**

> Find every plain-language phrase in the title, description, prose, chart titles, subtitles and captions that stands for a measure, population or category (for example "payroll jobs", "unvaccinated", "held elections"). Check each against the source definitions for measure, population, period, geography and category. Return a table under `## Measure fidelity review`, preceded by a line `Reviewer: <your identity>, <date>`, one row per phrase, every cell filled:
>
> `| Phrase as published | Where | Source wording and definition | Mismatch | Resolution |`
>
> Quote the phrase exactly as published, in double quotes. Mismatch is `none` or names the field and the gap ("measure: year-end status, not elections held that year"). For a mismatch, put `pending: "<the source's own wording, fitted to the sentence>"` in Resolution; otherwise `ok`. If the flagged phrase also appears elsewhere and those uses do match the source, append `; ok-elsewhere: "<where>"` to that Resolution.

**The writer then:** pastes the table into NOTES.md, fixes every flagged phrase (use the proposed wording or the source's own) and replaces `pending:` with `fixed:` and the wording as now published, in double quotes. `story-check`'s `fidelity` warning checks that the table has a Reviewer line, that unflagged phrases are still published, and that each fix is published and the flagged phrase gone, unless the Resolution says `ok-elsewhere`. It cannot judge the match or prove the reviewer's independence; the final editorial reviewer audits both (claim check 13). A later change to a measure phrase, a claim or a figure, including one made to answer the final editorial review, goes back to a fidelity reviewer as a delta: only the changed sentences, recorded under `## Final review delta` in NOTES.md, then `story-check` again (SKILL.md step 4, "After the final review").
