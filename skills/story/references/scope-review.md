# Fidelity and scope review: a light, fresh-context pass

Packaged with the `story` skill; used once in step 4, after the draft and story-check. Why (Factory `projects/story-remakes`, h3 and h3b, 2026-11-13): an independent measure-fidelity review lifted both accuracy gates from 3/10 stories to 7/10, but cost craft (lost 15–3 on the blind verdict). Its fixes pasted the source's long wording into every sentence ("information processing equipment and software" all the way through) and spread the finding over several numbers. And it checked wording, not claims, so overreach still passed ("AI has not changed which industries drive UK productivity growth"). This pass keeps the accuracy check, states each measure exactly once, checks claim scope, and returns only a few errors to fix.

Run it as a **separate subagent with a fresh context**. It sees only the inputs below, never the outline, the writer's notes or earlier drafts. With no subagent tool, do it yourself as a separate step from a fresh read of the README, and write `Reviewer: writer (self pass)`.

**Inputs:** the README, the chart SVGs, DATA.md, PROVENANCE.md and the publisher's metadata or documentation pages the writer saved.

**Brief to give the reviewer (copy it):**

> You review a draft data story for errors of fact and scope. You fix errors; you do not add hedges, polish style or ask for more numbers.
>
> **1. Measures.** For each measure, check that the source's exact wording appears once, where the measure is defined: a chart subtitle, its first use in the prose, or "How this was made". Everywhere else a short plain name is right; never ask for the full wording again. Flag a plain name only if it changes the measure, population, period, geography or category ("retail" for "retail and wholesale"; "held elections" for a year-end status).
>
> **2. Claim scope.** Start with the title, the opening and the close. List every causal, comparative or general claim in the title, description, headings, prose and chart titles: "drives", "because", "led to", "has not changed", "only", "always", "the biggest", "the first". For each, say whether the data shown supports it at that strength, and where ("chart 2"). If not, propose the smallest weakening: the strongest claim the data does establish, usually a plainer verb, not a qualifier bolted onto the old premise. If nothing true remains, cut it. Example: "AI has not changed which industries drive UK productivity growth" → "The same industries led UK productivity growth in both periods".
>
> **3. Return**, under `## Fidelity and scope review` with a first line `Reviewer: <your identity>, <date>`:
> - a claims list, one line each: the claim quoted, then `supported: <where>` or `too strong: <why>`;
> - then `Must fix:`, at most 8 items, most serious first. Each: the exact text quoted, the error in one line, the replacement text. Or `Must fix: none`.
>
> Rules for fixes: ask for a caveat only if the claim is wrong without it. Prefer a narrower claim to extra figures or baselines, and never ask to repeat a definition. A replacement is no longer than the text it replaces plus a few words, and a title replacement is no longer than the title. No style notes, no praise.

**The writer then** pastes the review into NOTES.md and applies each must-fix item, or notes in one line why not. Keep the headline punchy: if the title overreaches, find a shorter true claim, never bolt on a qualifier. A fix must not lengthen the title. A fix must not spread the finding over more numbers. `story-check` reports whether NOTES.md has the review (`scope-review`, information only).
