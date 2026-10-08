# French public finances: independent prose revision 2 review

Reviewer: `/root/critique_france_v2`, 8 October 2026. Reviewed the working-tree prose, chart script and generated SVG labels against the independently approved outline and user feedback. Repository HEAD was `c3cc67b18654c71869f3ece35733e9309a05df47`; the prose, chart script and seven SVGs had uncommitted changes, including the parent's inherited-font-size fix. The package script was untracked and is outside this review. Beads changes and the existing lock file are unrelated to the editorial verdict.

**Verdict: APPROVED.** The revision answers the user's main missing question, substantially improves number readability, provides both spending composition and evolution, and keeps the causal limits honest. No factual correction is required in the reviewed prose or chart arithmetic. This is an editorial/data-label review, not a replacement for the parent's desktop/mobile rendering checks or bundle reproduction checks.

## Files and hashes

- Prose `site/stories/france-public-finances.md`: SHA-256 `aad39d1f9f386d8ff3df332f925cef28dbec06d13b8f270667e428f4afe04d51`.
- Chart script `site/stories/france-public-finances-make-charts.mjs`: SHA-256 `1f64820c40aafe8559bbbe74166fb6dab75057f991249d8ecfc5ba2bca5a7bf8`.
- Approved outline `site/stories/france-public-finances-outline.md`: SHA-256 `ba37614d2cd560b0706b28f7c69e71aabb575ee97b6ff98e4040e2dd31576bfc`.

## Numerical and chart checks

I independently rescanned the spending-function CSV using Python's standard-library CSV parser, rather than using the implementation helper. Social protection's 2014–2024 current-euro increase is `31.234079297690155%`; the old-age contribution to that increase is `60.13217915544055%`. The prose's 31% and 60% are correct. Combined protection and health is `57.07552570179409%` of COFOG's own total; old age is `56.5567116402666%` of protection and `23.445134202555362%` of all spending. The prose and generated SVG labels round these correctly to 57.1%, 57% and 23% respectively.

The fiscal snapshot uses the existing verified 2025 source amounts, common zero baseline and exact geometry. Its €1.56tn/€1.71tn bar labels and €153bn gap avoid claiming that rounded subtraction is exact. The €91/€100 comparison is correctly a share of expenditure, not GDP. The debt label correctly turns €3,595.5bn into €3.6 trillion.

The treemap uses only the nine children of social protection, retains survivors as a separate category, names the explicit zero for research, and gives the smallest positive category a keyed label. The child sum differs from the parent by just €0.1 million from source rounding; chart shares use the official parent. The full functional chart separately retains all ten divisions. The health and housing classification notes prevent plausible double-counting errors.

The evolution graphic contains both complete 1995–2024 aggregate histories and all nine subgroup comparisons. The 2014 and 2024 paired labels correctly represent equal endpoints as well as changes. The prose explicitly restores the longer comparison: protection's GDP share rose from 1995 even though it fell over the selected decade. Nominal growth is not presented as additional service volume or a demographic estimate.

I extracted the generated SVG text with an XML parser and checked the snapshot, spending mix, protection and evolution labels against the source calculations and outline. Their text agrees. The script derives these labels from CSV rows, checks finite consecutive observations and avoids adding a parent to its children.

## Reader and prose assessment

The article now answers what sits inside the largest category: old age dominates, while unemployment support is much smaller. It separates that scale question from growth and from the revenue-side contribution to recent deficits. The opening pair of bars, the treemap and the evolution graphic address the user's requested visual improvements. Trillion-scale headlines replace difficult thousand-billion figures. Internal “friction notes” are removed from the reader narrative.

Word count is **505**, excluding frontmatter, image alt text and headings, retaining visible Markdown link labels and removing link targets. This is within the requested 300–700-word range. No length-driven cuts are required. Seven graphics still create a substantial page, so the parent's layout checks should ensure the compact snapshot remains compact and the evolution figure is readable on a phone.

The prose follows the approved outline. Its attributed IMF claim stays outside the direct CSV calculations. The latest improvement, the post-pandemic fall in the debt ratio and the long-run rise in protection's GDP share remain visible, rather than selectively presenting deterioration. It avoids inferring that large categories are waste, that pensions alone caused the deficit, or that the data predict default.

The most important remaining reader question is causal: how much ageing, benefit uprating, policy changes or tax choices explain the long-run gap. The article explicitly says the accounts cannot separate those effects. That is an honest limit for this iteration rather than an unacknowledged missing answer. A future investigation can quantify those mechanisms with additional primary sources.

## Optional editorial refinements

“The economy grew faster” could become “nominal GDP grew faster” if a technically explicit wording is preferred; the surrounding current-euro comparison and GDP-share sentence already establish the intended meaning. “Opening it up changes the picture” is a disposable transition if an even leaner voice is wanted. Neither affects approval.

## Final source confirmation

**APPROVED** for final source commit `0f8f164f87bde80fb5c0079bd9c45d891089c1cb`; prose SHA-256 `281f81f39fea4bc196cebdd07fed7d9be2504ff99776b9acf0323a4fcaa7085f`. The two optional editorial changes were accepted: the disposable transition was removed and “the economy grew faster” became “nominal GDP grew faster”. Both preserve the reviewed argument and numbers. The separate font-only correction at `683b6e2` changes inherited SVG font sizing, with no data changes. The parent reports that extraction of the portable bundle reproduced all three CSVs and seven SVGs byte-for-byte, all 173 root tests passed, validation returned zero errors and zero warnings, and mobile inspection found no page overflow. Those execution/layout results are recorded as parent-reported evidence; this append verifies the final prose edits without repeating the independent review.
