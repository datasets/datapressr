# French public finances: independent outline revision 3 review

Reviewer: `/root/critique_france_v2`, 8 October 2026. Reviewed the appended revision-3 specification, which explicitly supersedes affected revision-2 details, at commit `8efdcb69307ea3012d378d5f1b08dba702a93f94`. Outline SHA-256: `f5786d599b770cc344947f1b90e25d5646829e2d75f4c1cb2c30681e85097ae8`.

**Verdict: APPROVED.** The revision resolves the user's euro-growth/GDP-share confusion by displaying both quantities with separate units, rather than asking a GDP-share graphic to demonstrate nominal growth. The new growth decomposition, category definition and attributed ageing/indexation explanation are supported by the reviewed evidence. Approval covers the outline, not its unimplemented charts or prose.

## Independent numerical reproduction

Scanned `datasets/france-public-finances/data/spending-functions.csv` directly using Python's standard-library CSV parser, without the implementation helper. Selected current-euro observations by year/function/unit and divided millions by 1,000. Replaced the GF10 parent with GF1002 and the exact GF10-minus-GF1002 residual. Thus the chart has eleven mutually exclusive leaves, not an additional parent counted on top of children.

| Category | 2014–2024 change, €bn | 2023–2024 change, €bn |
|---|---:|---:|
| Old age | 99.1837 | 22.8755 |
| Other social protection | 65.7591 | 12.2220 |
| Health | 81.5841 | 11.4799 |
| Education | 34.3492 | 7.0848 |
| Economic affairs | 33.0663 | -11.5475 |
| General public services | 31.5431 | 6.3397 |
| Defence | 18.2253 | 3.0192 |
| Public order and safety | 17.0648 | 3.4011 |
| Housing and community amenities | 14.6880 | 6.5268 |
| Environmental protection | 9.6558 | 1.3493 |
| Recreation, culture and religion | 9.0256 | 1.6506 |
| **Sum of chart categories** | **414.1450** | **64.4014** |
| **Source TOTAL change** | **414.1448** | **64.4013** |

Residual differences are €0.2 million and €0.1 million, within the planned €2 million source-rounding tolerance. All outlined growth values match. Each panel should sort independently: notably, other social protection ranks above health in the one-year panel, whereas health ranks above it over the decade. The outline does not incorrectly claim that health is the second-largest addition in both periods.

Old-age current spending is €292.7706bn in 2014 and €391.9543bn in 2024; growth is `33.87761612675588%`, correctly written as 33.8776%. Protection's €528.086bn to €693.0288bn and 31.2341% growth, plus the old-age GDP shares 13.6% to 13.4% and protection shares 24.5% to 23.7%, agree with the earlier independent CSV verification. The longer histories and all nine subgroup endpoint pairs remain those approved in revision 2.

## Visual specification checks

The current-euro endpoint panel demonstrates nominal increases directly. The separate GDP-share endpoint panel answers whether each category takes a larger part of the economy. Shared category order across the two panels makes the denominator contrast inspectable; explicit year-labelled numeric columns avoid an unexplained arrow. Neither panel implies an inflation-adjusted quantity or a causal reform effect.

Equal-sized filled orange/blue dots, a matching year key and small opposing vertical offsets address both unequal visual emphasis and coincident markers. Offsets must affect only vertical position; the specified unchanged x values preserve the data. Negative economic-affairs growth retains a visible zero. Different decade/year scales are explicitly stated, so lengths across those two growth panels are not presented as comparable magnitudes. Near-black revenue and red spending are applied consistently to both fiscal comparisons.

The combined history and two endpoint panels will be tall. Mobile rendering should be checked for readable headings, year columns and labels, not merely absence of page overflow. This is an implementation check rather than an outline defect.

## Category definition and contextual source checks

Verified every saved source's byte count and SHA-256 against `site/stories/france-public-finances-src/manifest.json`. Read the archived UN HTML explanatory note and extracted DREES PDF text directly with `pdftotext`, including printed pages 35–36, 54 and 57. Page 54 supplies the two cited contextual numbers; page 57 confirms the recipient series' scope and limitations.

The UN definition of COFOG 10.2.0 covers retirement pensions, care allowances, accommodation, help with daily activities and scheme administration. It explicitly includes military and government-employee pension schemes. It is therefore correct to explain old age as retirement income and support for older people, rather than nursing homes alone. The definition also excludes early retirement because of disability or unemployment to other functions; the prose need not reproduce every exclusion, but must not imply that every pension payment belongs in this category.

DREES printed pages 35–36 describe pension reforms moderating expenditure dynamics and identify baby-boom retirements and longer life expectancy as increasing recipient numbers. Page 36 also discusses rising average pensions across generations. This supports an attributed explanation of ageing pressure; it does not establish a numerical share of the COFOG decade increase caused by ageing.

DREES page 54 identifies pension indexation as the principal 2024 driver, with beneficiary growth another contributor. Its footnote explicitly reports basic-pension uprating of 5.3% on 1 January 2024. The same page reports a 1.0% increase in recipients of CNAV direct pensions in 2024. Page 57's graph presents end-of-year recipient counts and warns that all-regime recipient data for 2024 were unavailable. Consequently the prose must keep the CNAV qualifier: 1.0% is not a measured all-France/all-scheme increase. The outline correctly does so.

Recipients multiplied by average payment is a useful pension-expenditure explanation at a consistent scope and period. It is not a formula for every component of the broader COFOG old-age category. The two contextual percentages cover different populations/concepts and cannot be added to explain that category's spending increase. The outline states this limit explicitly. DREES includes some private provision and combines old age/survivors in several tables; none of its totals should replace or be added to the COFOG amounts. The revised specification preserves that separation.

## Source identifiers and implementation cautions

- UN definition snapshot SHA-256: `2b2debdb86628b878867548b0f7192990c9407ff68e59b19b3fbecf9f3b17c67`.
- DREES PDF snapshot SHA-256: `98692741a5ec3070cade1ebf92a02adae4c2fa317cdcc100d63b0580d2cf1ccd`.
- Social Security recipient-page snapshot SHA-256: `6ece4c278c6eac08db724cadf5923b0acb290aefaa722f55535e47d4d5657d04`.

Use the cited source definitions as attributed context, keep the chart-derived evidence separate, and preserve “current euros” beside both growth and amount comparisons. The phrase “ageing contributes” is supported; “ageing explains the €99bn increase” would exceed the evidence. The outline makes no such overclaim and requires no correction before implementation.
