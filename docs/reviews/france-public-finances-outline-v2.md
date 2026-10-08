# French public finances: independent outline revision 2 review

Reviewer: `/root/critique_france_v2`, 8 October 2026. I authored the earlier reader critique but did not author this outline, the dataset, data helper or chart implementation. Reviewed commit `514c64f1ec768cb7105c4eacbe929383a7734ca1`. Outline SHA-256: `0e1c75bb6c0f5532cacf483a25c9e71734f3e647a805a31febbc18250b44f03b`.

**Verdict: CORRECTIONS REQUIRED — two transcription errors in exact percentages.** The planned argument, source selection, denominators, hierarchy and chart transformations are otherwise supported. Rounded reader-facing claims are unchanged by both corrections. This report does not approve unimplemented charts or prose.

## Required corrections

1. Beat 2 gives combined social protection and health as `57.135%`. The correct calculation is `(693028.8 + 261156.3) / 1671793.8 × 100 = 57.07552570179409%`. Use `57.0755%` in the evidence outline or `57.1%` for readers.
2. Beat 3 gives old age as `23.444%` of all spending. The correct calculation is `391954.3 / 1671793.8 × 100 = 23.445134202555362%`. Use `23.4451%` in the evidence outline. The planned reader-facing `23%` remains correct.

## Independent reproduction

Used Python's standard-library `csv.DictReader` to scan the three committed CSVs directly; did not call the implementation's shared helper. Selected French annual rows by country, year, indicator and unit; selected COFOG rows by year, function and unit. All euro amounts below retain the source's millions convention unless explicitly converted.

| Claim checked | Independent result |
|---|---|
| 2025 spending/revenue/balance | `1714137.2`, `1561626.1`, `-152511.1` million euros; `57.2`, `52.1`, `-5.1`% GDP |
| Revenue coverage of spending | `91.1027483681003%`; about €91 per €100 spent |
| 2024 functional total | `1671793.8` million euros |
| Social protection / health | `693028.8` / `261156.3` million euros; `41.454203263584304%` / `15.621322438209784%` of that total |
| Old age's share of protection | `56.5567116402666%` |
| Protection nominal growth, 2014–2024 | `528086.0` to `693028.8` million euros; `31.23407929769016%` |
| Contribution of old age to nominal protection increase | `99183.7 / 164942.8 × 100 = 60.13217915544055%` |
| Aggregate protection/health GDP-share annotations | 1995 `22.0/6.9`; 2014 `24.5/8.3`; 2020 `27.2/9.0`; 2024 `23.7/8.9` |
| Protection subgroup amounts and 2014/2024 GDP shares | All nine matched the outline, including explicit zero research and equal old-age endpoints |
| Completeness | Both aggregate functional histories have 30 finite annual values, 1995–2024; all French TR/TE/B9 annual values exist in 1995–2025, with all 31 B9 values negative |
| Recent fiscal arithmetic | 2022 TR/TE/B9 `53.7/58.4/-4.7`; 2024 `51.2/57.0/-5.8`; 2025 `52.1/57.2/-5.1` |
| Deficit bars | `2.4, 8.9, 6.6, 4.7, 5.4, 5.8, 5.1`% GDP in 2019–2025 |
| Debt | 106 rows; named quarter annotations `65.5`, `98.2`, `114.9`, `109.5`, `119`% GDP matched; latest `3595.5` billion euros |

The nine protection children sum to `693028.9`, only `0.1` million above their parent; the ten divisions sum to `1671794.0`, `0.2` million above TOTAL. Both fit the specified source-rounding tolerances. Use the official parent as the percentage denominator; a treemap's child-area normalisation has a negligible rounding difference, not an extra spending category.

## Plan and interpretation checks

The compact bars use the same year, unit and zero baseline. The 91-per-100 figure has a spending denominator and is not confused with GDP. The separate nominal shortfall avoids pretending that subtracting rounded trillion headlines yields the exact balance.

The treemap has mutually exclusive children only; health, survivors and housing classifications remain explicit. Zero research is labelled without fabricated area. The accompanying evolution graphic prevents a composition chart from carrying an unsupported trend claim. The full 1995–2024 context is valuable because protection's GDP share is higher than in 1995 despite being lower than in 2014. The final prose should preserve both facts.

Nominal increases are clearly distinguished from real volumes, per-person spending and GDP shares. The 60% contribution is accounting decomposition, not a demographic or policy effect. The outline retains source-attributed indexation and revenue explanations without claiming that COFOG identifies their causal magnitude. Prior-reviewed INSEE and IMF context is retained; I have not independently refreshed those external releases in this outline review.

Keeping seven chart blocks may still feel long. This is an editorial consideration rather than a factual rejection: prefer compact visual sizes and short connecting prose, and avoid repeating all chart labels in text. The independent prose review should check that “ever-expanding welfare” is presented as a rejected oversimplification rather than a claim that protection never grew relative to GDP.

## Input hashes

- `data/fiscal-accounts.csv`: `5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733`
- `data/spending-functions.csv`: `2387b6d41aa566a863b0e761889a99cb9acda23ed020e06e228972b390f9a494`
- `data/quarterly-debt.csv`: `bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307`

## Correction verification and final verdict

**APPROVED** at commit `a2a318ca4b1a53204e8fbb303aef52951eca6816`. Outline SHA-256: `ba37614d2cd560b0706b28f7c69e71aabb575ee97b6ff98e4040e2dd31576bfc`. The diff changes only the two requested percentages, to `57.0755257%` and `23.4451342%`; both agree with the independent calculations to the displayed precision. All earlier checks remain applicable. This approval covers the revised outline, not charts or prose yet to be implemented.
