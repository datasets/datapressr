# Story editorial review gate

The owner requires every data story presented for shipping to have thorough independent agent review of interest, quality and writing. The existing story skill requires independent outline approval but ends its prose checks with a suggested quick comparison against the outline. That leaves the final title, rendering, prose quality and complete handoff without a mandatory recorded verdict.

The open owner-review task `datapressr-qyy` records a concrete concern: the title “Heat Is the Quiet Killer” may not fit data showing more cold deaths on death certificates. This motivates checking title and evidence together. It is owner feedback, not a controlled demonstration that the earlier skill caused a failure. The Factory temperature story provides a forthcoming real application; its approved outline does not substitute for final review.

## Design and scope

Keep outline → charts → prose as separate commits and retain the early outline gate. Add the final gate within step 4 and the done contract, with a bundled reference that resolves when the story skill is installed alone. A reviewer independent of writing/revising the artifacts records the exact commit and input hashes, then gives evidence across six dimensions: reader interest and coverage honesty; independently reproduced numbers; argument and counterevidence; charts and desktop/phone rendering; writing and house voice; reproducibility and draft readiness.

The review begins with reader questions before exposure to the draft. It ends with a strongest objection, highest-value revision and explicit APPROVED or numbered CHANGES_REQUIRED. A blocker cannot be averaged away by other good dimensions. Required fixes receive independent re-review; material later edits reopen the gate. Changes to the argument or chart plan also return to outline approval.

A separate review artifact makes the handoff inspectable without adding a fourth story-production stage. Agent approval clears the draft for handoff, while the author's personal voice pass and owner publication decision remain human stages. Draft status, citation policy, word limits and existing publishing boundaries remain in force.

## Implementation and validation

Modify only the story entrypoint, add the bundled review template and record this rationale. Preserve unrelated shared-worktree changes. Run existing frontmatter and installed-link checks, the story checker tests and the skill author's validator; inspect the diff and test a standalone temporary copy's reference links. The coordinator assigns independent implementation review and exercises the template on the finished Factory draft.

Mechanical checks establish packaging and existing-checker compatibility. Template use on one story can demonstrate a concrete review artifact, but neither establishes a general improvement in model behaviour. A controlled before/after writer comparison is outside this change. No model API calls, source downloads, dependencies or publication are part of this implementation.
