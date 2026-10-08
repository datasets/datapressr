# France public finances: independent prose and chart conformance review

Verdict: **APPROVED**.

Reviewer: independent Codex subagent `/root/review_france_outline`. Date: 8 October 2026. This reviewer authored neither the outline, charts nor prose. Compared working-tree prose and committed chart implementation against the previously approved outline at commit `e73458bdc6655774048fb7a1a8f15e26d5729b58`, outline SHA-256 `a3a43a54652614eb004330bebceaddbb04963d4c8a9cb5b37b20c156dc5a20b3`.

Chart commit: `69eb737efaa6db2a8bb2d7074801b33079189162`. Prose was not yet committed at review time, so approval identifies its bytes by hash.

| File under site/stories/ | SHA-256 |
|---|---|
| france-public-finances.md | ad28875c32f53b7f6d77f86e4971ef2cd1e01c75a9aecf46797ab6d76dd1fc92 |
| france-public-finances-make-charts.mjs | 2348061fe8e883d2ca3fb91e3751387d9ae86d3d11d75b1099f9808a352ed950 |
| france-public-finances-data.mjs | b62bbf978509ad6eea3a92eea53136f7dd3211c6468df0a481b3a626d9222fca |
| france-public-finances-gap.svg | 21ec1123c47f8e6e32f2698a629243dbe631db9f3e8f82d9096e53cfcc2437dd |
| france-public-finances-spending.svg | d2b08dc963e0f6a122b9e472c5a951d981bd1624240899bdb435c0c7b61f0fc1 |
| france-public-finances-deficits.svg | 77eead6010c08b0c52c485c9c47c0ebafaa3439254bc6fd0e5d650970ac7dac8 |
| france-public-finances-debt.svg | 1d2e1980407ab193f5b0ca02f39e21a5318d2bfca5daf4761587dad431e9c88e |

Read the prose, chart script and shared data helper. Parsed SVG XML with Python ElementTree and checked displayed `text` elements, not merely source comments or metadata, for the planned numeric annotations. All local Markdown links resolve. Prose is 514 whitespace-delimited words including headings, excluding frontmatter, image alt text and friction notes; comfortably within 300–700.

## Numeric conformance

- Gap SVG visibly contains euro amounts 1,714.1, 1,561.6 and 152.5; 2025 percentages 57.2, 52.1 and 5.1; 2022–2024 endpoints 58.4, 57.0, 53.7 and 51.2; and changes 1.4 and 2.5 points.
- Spending SVG contains all ten divisions, their amounts and shares; headline total 1,671.8; social protection 693.0 and 41.5%; health 261.2 and 15.6%; education 148.6 and 8.9%; defence 54.2 and 3.2%; combined 57.1%; old age 392.0; and social protection GDP shares 24.5 and 23.7 with dates 2014 and 2024.
- Deficit SVG contains all seven 2019–2025 bars and labels: 2.4, 8.9, 6.6, 4.7, 5.4, 5.8, 5.1%.
- Debt SVG contains all five planned annotation values: 65.5, 98.2, 114.9, 109.5, 119.0%, and latest €3,595.5bn. Historical labels correspond to Q4; the latest is explicitly Q2 2026.
- All nonexempt data numbers in the prose and alt text appear on the corresponding charts. The 31-year count and externally attributed IMF 5.0% potential GDP and 3.0% GDP are explicitly exempt in friction notes, as approved in the outline. Publication and methodological dates retain their intended role.

## Argument and implementation

The prose preserves the approved descriptive argument and counter-evidence: the persistent spending–receipts gap, composition, both sides of the recent deterioration, 2025 improvement, falling social protection/GDP and post-pandemic debt-ratio fall. INSEE and IMF mechanisms remain named and linked. The prose does not turn composition into proof of waste, structural estimates into an allocation of blame, or debt levels into a default prediction. Salaries are correctly distinguished from functions and old age is not double-counted. The stock/flow distinction and statistical-vintage caveat survive.

Observable Plot implementation follows the four approved chart plans: independent complete annual TE/TR series; same-resource TOTAL for COFOG shares; B9 sign inversion for deficits; one coherent quarter-end debt series parsed at UTC midnight. Bar scales begin at zero; truncated line scales are explicitly disclosed. Numeric labels read source-derived facts. Chart 2 includes the total requested by the earlier implementation reminder.

No required fixes. Desktop/mobile appearance and byte-identical rebuild verification are being handled separately by the parent author; this review does not claim to repeat visual QA or build checks. The human author's voice pass remains visibly outstanding.
