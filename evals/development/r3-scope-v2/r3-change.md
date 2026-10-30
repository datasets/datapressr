# R3-only proposed change

The only changed instruction span is the relationship paragraph under “The one rule” in `story/references/voice-guide.md`. All other story files and the existing synthetic amount/share example remain byte-identical. The baseline is the v1 candidate, not the older no-R1/R2/R3 arm.

## Old instruction (verbatim)

Make the relationship between findings explicit. Explain how the next finding changes, qualifies or helps account for the previous one, using the evidence already established in the outline. The reader should understand the implication, not just receive a sequence of values. A descriptive comparison can explain an apparent contradiction without establishing its cause; mechanisms still need the attributed evidence required by the story-craft guide.

## Proposed instruction (verbatim)

Make the relationship between findings explicit. Explain how the next finding changes, qualifies or helps account for the previous one, using the evidence already established in the outline. Give the reader the useful connection, with the strength of the explanation matched to its evidence:

- **Accounting relationship:** show how the quantities fit together. Check the numerator and denominator before reconciling an amount with a share. Deficits contribute to debt, but a debt-to-GDP trajectory also depends on GDP and stock-flow adjustments; a deficit alone is not a complete explanation of a changing ratio.
- **Descriptive association:** state the observed comparison or co-movement and what it changes about the preceding finding. A higher revenue share than peers establishes a relative level, not whether revenue is sufficient or which policy caused a deficit.
- **Attributed mechanism:** explain the process in plain words and attribute it to a checked source with a link, as the story-craft guide requires. Confirm that the source supports this mechanism for the population, period and measure being explained. A named source or a plausible story alone is not verification. Keep a supported explanation even when the plotted data cannot test it; distinguish the source's account from the chart's observation.

Before linking findings, match population, units, denominator, time period and series. Name a subset when using it: central-government figures cannot silently stand for general government. Distinguish nominal amounts from real amounts or shares, and a daily spot price from a futures-contract settlement. A mechanism for one series explains another only when the evidence supports that connection. When it does not, state the narrower supported finding and the specific unresolved link at the claim, including in the lede. Do not manufacture a transition between unrelated facts or replace a useful supported explanation with generic caveats.

This is a proposed treatment, not evidence of improved model behaviour. Development controls are in `controls.md`; they are review anchors, not writer inputs.
