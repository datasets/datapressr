# French public finances: independent prose revision 3 review

Reviewer: `/root/critique_france_v2`, 8 October 2026. Reviewed the working-tree prose against the approved revision-3 outline, the committed chart implementation and generated SVG structure/text at HEAD `0329c9912af587be2ee46800d79134f68c4c27cd`. Prose and package script were modified after that commit; Beads changes and the existing lock file are unrelated. The package script's recursive copy is outside this editorial/geometry review.

**Verdict: APPROVED.** The revised article directly resolves the user's confusion between increasing euro spending and a falling GDP share. Its growth figures, category explanation, contextual attribution and revised visual encodings agree with the reviewed evidence. No required factual correction remains. Pixel-level readability still belongs to the parent's rendering check.

## Reviewed hashes

- Prose: `10bb16478e105a9651f809f04324aa41cd5214bce32b895852e5de4583e5bc9c`.
- Chart script: `531df2ffec480fbc300e683de4c08f89f52fa01ca45710c5bce10d794555c10b`.
- Evolution SVG: `b54a5b02f2ce075be694590081e56997685582c1bf3d6ae7b2d84e01780ae8d4`.
- Growth SVG: `b1696d2aa26b330f3df9cc0e2523240b0157aa6b233975dc8ac688f2dba4e11a`.

## Prose and numerical checks

Word count is **510**, excluding frontmatter, headings, image alt text and URL targets while retaining visible link text. This is within the 300–700-word range.

The key comparison is now explicit: protection increased from €528bn to €693bn, while its GDP share fell from 24.5% to 23.7%; old age increased from €293bn to €392bn while falling from 13.6% to 13.4% of GDP. The explanation correctly says nominal GDP grew faster. Current euros are distinguished from inflation-adjusted growth and service volume. The longer-run 1995 reference prevents the selected decade from implying an unbroken fall in protection's GDP share.

The growth chart labels reproduce the previously independently verified eleven-category decomposition: decade total €414.1bn, led by old age €99.2bn and health €81.6bn; latest-year total €64.4bn with economic affairs down €11.5bn. The script separates old age from other protection and excludes the parent, so no expenditure is counted twice. It checks the component sum against the official total within source rounding. Labels are rounded only after calculations. The nominal 31% increase, €392bn old-age level, 57.1% combined spending share and trillion-scale fiscal/debt headlines retain the correct meanings.

The old-age definition follows the UN source reviewed for the outline: retirement income plus relevant care/support and administration, including public-employee and military schemes. Healthcare and survivors remain separately classified. No unsupported pensions-versus-care percentage is invented.

The ageing explanation remains attributed. DREES supports baby-boom retirements, longer lives and reform effects, plus the importance of inflation-linked uprating in 2024. The 5.3% figure concerns basic-pension uprating, and the 1.0% figure concerns direct-pension recipients in the general scheme, not all pensioners. The prose explicitly forbids adding the figures or treating them as an apportionment of the entire COFOG category. Its method paragraph preserves the distinction between DREES and COFOG scopes. “Partly” is qualitative and source-supported, not a claimed measured fraction of the decade increase.

## Chart geometry and labels

Inspected the chart script and parsed the generated SVGs using an XML parser. Both endpoint panels have nine orange circles and nine blue circles, all with radius `4.5`; fills are inherited from solid-colour groups. The year keys use the same radius and colours. The 2014/2024 numeric columns and keys are explicit. Vertical offsets separate nearby values, while the x coordinates remain their actual amounts or GDP shares. Connectors join the actual offset markers.

The current-euro panel uses a zero-based 0–420 billion-euro scale; the GDP panel uses a separate zero-based 0–15% scale. Category order is identical between them. Titles, subtitles and axes identify the units. The full aggregate history remains above them. The growth panels use independently sorted rows and explicitly different horizontal scales, retaining a visible zero and the negative economic-affairs bar. Generated labels match the reviewed source arithmetic.

Revenue is consistently near-black `#242424` and expenditure red `#c83232` in the snapshot and historical fiscal lines. Year comparisons consistently use orange `#b65d16` and blue `#2563eb`, without unequal marker sizes or open-versus-filled emphasis.

## Optional precision improvement

The source's recipient measure is an end-of-year stock. The phrase “the general scheme’s direct-pension recipient count rose 1.0% over the year” is accurate, but “CNAV’s year-end direct-pension recipient count rose 1.0%” would name the scheme and make its timing immediately explicit. Similarly, “basic pension rates were uprated by 5.3%” is slightly more exact than “basic pensions rose 5.3%”. These are optional clarity edits, not approval blockers; the present context already identifies indexation and distinct measures.

## Final source confirmation

**APPROVED** at final source commit `48ef13a9d7b59ed0c3a088ba7f1af2b7043e58ac`. Prose SHA-256: `b95806f209d12f4fcc866758c3d4706b20170dc3eb728ee296feb33571c08e4a`. Verified against the reviewed working-tree hash by reversing only two subsequent edits: the optional refinement now specifies basic-pension rate uprating and CNAV’s year-end direct-pension recipient count; the care-home comparison sentence was removed. Reversing those changes reproduces the exact previously reviewed hash. Both edits preserve the approved findings and improve precision or concision; no full re-review was needed.
