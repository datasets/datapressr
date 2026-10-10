# Independent France public finances outline review

Verdict: **APPROVED**.

Reviewer: independent Codex subagent `/root/review_france_outline`, with no role in authoring the outline. Review date: 8 October 2026. Reviewed file: `site/stories/france-public-finances-outline.md`. Exact commit: `e73458bdc6655774048fb7a1a8f15e26d5729b58`. Exact file SHA-256: `a3a43a54652614eb004330bebceaddbb04963d4c8a9cb5b37b20c156dc5a20b3`. Both revision and hash verified locally before review. No repository files edited.

Applied `skills/story/SKILL.md` step 2 and read its craft, voice and charting references. Independently scanned the three CSVs with Python's standard-library `csv.DictReader`, without running or relying on the author's analysis helper. The separate extraction review is outside this review's scope.

## Independently reproduced numbers

- Fiscal coverage: FR TR, TE and B9 each have 31 finite annual PC_GDP observations, exactly 1995–2025 without gaps. All B9 observations are negative, ranging from −8.9 to −1.3. Revenue ranges 50.3–54.3% GDP and expenditure 52.6–61.7%, inside chart 1's proposed 45–64 domain.
- 2025: TE 1,714,137.2 million euros = €1,714.1372bn → €1,714.1bn; TR 1,561,626.1 million = €1,561.6261bn → €1,561.6bn; B9 −152,511.1 million = −€152.5111bn → €152.5bn deficit. PC_GDP values are 57.2, 52.1 and −5.1 respectively. TE−TR matches the unrounded euro deficit.
- 2022→2024: TE 58.4→57.0% GDP, −1.4 percentage points; TR 53.7→51.2%, −2.5 points; B9 −4.7→−5.8%. Thus the deficit increases by 1.1 points even though spending's GDP share falls.
- Deficits 2019–2025: 2.4, 8.9, 6.6, 4.7, 5.4, 5.8 and 5.1% GDP. All seven source B9 rows exist and are negative. The 2025 improvement is real.
- Functional latest finite year: 2024. TOTAL = 1,671,793.8 million euros; ten level-1 divisions sum to 1,671,794.0 million, a 0.2 million difference, safely inside the planned 1.1 million tolerance. Either rounds to €1,671.8bn.

| COFOG division | Raw amount / 1000 (€bn) | Share of resource TOTAL, one decimal |
|---|---:|---:|
| General public services | 181.1032 | 10.8% |
| Defence | 54.1990 | 3.2% |
| Public order and safety | 52.1130 | 3.1% |
| Economic affairs | 166.0728 | 9.9% |
| Environmental protection | 30.2851 | 1.8% |
| Housing and community amenities | 42.1286 | 2.5% |
| Health | 261.1563 | 15.6% |
| Recreation, culture and religion | 43.0676 | 2.6% |
| Education | 148.6396 | 8.9% |
| Social protection | 693.0288 | 41.5% |

- Social protection plus health divided by same-resource TOTAL rounds to 57.1%. Old age (GF1002) is €391.9543bn → €392.0bn, with parent GF10. Public debt transactions GF0107 belongs to GF01. The hierarchy supports the warnings against counting either as an extra division.
- GF10 PC_GDP is 24.5 in 2014 and 23.7 in 2024, corroborating the counter-evidence.
- Debt: exactly 106 consecutive quarters, 2000-Q1 through 2026-Q2. Independently checked every `period_end` against its calendar quarter end and every plotted value for completeness. Range 58.7–119.0% fits proposed domain 50–130.
- Debt annotation rows: 2007-Q4 65.5%; 2019-Q4 98.2%; 2020-Q4 114.9%; 2023-Q4 109.5%; 2026-Q2 119.0% and €3,595.5bn. Q2 2025 is 115.2% in this release. The pandemic-to-2023 decline is included, not suppressed.
- Archive manifest retrieval dates are 8 October 2026. Functional data end in 2024, fiscal data in 2025 and quarterly debt in June 2026, as stated.

## Chart and argument review

All named resource columns exist. Chart 1's independent series filters, B9-based rounded deficit and euro conversion are valid. Chart 2 uses the appropriate same-resource TOTAL denominator and mutually exclusive level-1 rows (the CSV stores level as `1`); its GF10 GDP-share annotation requires PC_GDP rows and its old-age annotation requires GF1002. Those rows exist. Charts 3 and 4 have complete requested calendars and valid domains. Explicit truncated line axes and zero-based bar axes are appropriate. No missing values are treated as zero and no cross-calendar joins are needed.

Implementation reminder under the existing all-numbers rule: if prose uses the €1,671.8bn functional total from beat 2, include it on chart 2. This is not a requested change to the argument or plan.

The argument is descriptive and accounting-based. It does not infer waste from category size, endorse a tax or spending policy, or claim to decompose decades of debt causally. Counter-evidence includes the 2025 improvement, falling social protection/GDP and the post-pandemic debt-ratio decline. Four charts are justified by the explicit explainer scope; the prose must preserve the one argument rather than become a dashboard tour.

## External attribution checks

Opened every linked primary source and the motivating Euronews story independently. The [2023 INSEE accounts](https://www.insee.fr/fr/statistiques/8194620) support weak taxable bases and tax changes; the [2024 functional spending release](https://www.insee.fr/fr/statistiques/8735252) supports pension revaluation following inflation; the [2025 accounts](https://www.insee.fr/fr/statistiques/8997691) support new revenue measures and slower expenditure growth, and confirm that their 57.3/52.2 ratios differ from the archived Eurostat 57.2/52.1. The outline appropriately avoids mixing these vintages.

The [IMF July 2026 assessment](https://www.imf.org/en/news/articles/2026/07/22/pr26255-france-imf-executive-board-concludes-2026-article-iv-consultation) reports 2025 primary balance −3.0% GDP and structural balance −5.0% potential GDP. These support the limited inference that interest and the cycle alone do not account for the gap, with attribution and model limitations retained. They are not causal estimates from the CSVs.

The [September 2026 debt release](https://www.insee.fr/fr/statistiques/9053525) confirms the latest ratio, euro stock and revised historical values and explains why debt changes cannot directly be read as deficits. [Euronews](https://www.euronews.com/2026/10/06/frances-sovereign-debt-crisis-explained-how-dangerous-could-it-be) indeed gives 115.6% as its prior-year comparison; this is not substituted for the official release's 115.2%.

No required corrections. Approval applies to the exact revision and hash above, before chart or prose authoring.
