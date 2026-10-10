---
title: "Review record: France Hasn't Balanced a Budget in 31 Years"
description: "Outline review status for the French debt story."
---

# Review record

## Independent outline review: OUTSTANDING (not approved)

- **Revision:** `site/stories/french-debt-outline.md` at commit `4589809`, SHA-256 `27b9bc397c0234325978687c0c1e3e8f260bdd6043b78583ac9ddc8aff701ff8`.
- **Attempted reviewer:** a fresh `claude -p` session with no part in the outline. **It did not run** because the sandbox denied network access to `api.anthropic.com`.
- **Verdict:** none. Step 2 of the `story` skill needs someone other than the author to approve, and nobody has. The charts and prose were built anyway because the task asked for a finished story. They are drafts until a human or independent AI reviewer reproduces the numbers below and returns APPROVED.

## Author self-check (does not count as approval)

The outline's author scanned the CSVs with a script on 2026-10-10. Every number in the outline matched:

| Number | Source row | Value |
|---|---|---|
| Quarterly rows, range | `quarterly-debt` | 106, 2000-Q1 to 2026-Q2 |
| Gross debt % GDP | 2000-Q1 / 2008-Q4 / 2009-Q4 / 2019-Q4 / 2020-Q3 | 60.5 / 69.8 / 84.1 / 98.2 / 115.2 |
| Post-Covid peak and trough | 2021-Q1 / 2023-Q4 | 117.8 / 109.5 |
| Latest, series maximum | 2026-Q2 | 119.0% and €3,595.5bn |
| FR `B9` % GDP | 2000 / 2009 / 2020 / 2025 | −1.3 / −7.4 / −8.9 / −5.1 |
| FR deficit years 1995–2025 | `B9` < 0 | 31 of 31 |
| FR deficit worse than EU27 | FR `B9` < EU27 `B9` | 26 years: 1997, 2000, 2002–2025 |
| Surplus years | DE / ES / IT / EU27 | 2007, 2013–2019 / 2005–2007 / none / none |
| 2025 `TR` % GDP | FR, DE, IT, ES, EU27 | 52.1, 47.9, 48.1, 42.9, 46.4 |
| 2025 `TE` % GDP | FR, DE, IT, ES, EU27 | 57.2, 50.5, 51.2, 45.3, 49.5 |
| 2025 `B9` % GDP | FR, DE, IT, ES, EU27 | −5.1, −2.7, −3.1, −2.4, −3.1 |
| FR `D41PAY` | 1995 / 2020 (series low) / 2025 | €42,204.7m, 3.5% / €29,724.1m, 1.3% / €66,635.9m, 2.2% |
| IT `D41PAY` % GDP 2025 | | 3.9 |
| 2025 status flags (TE, TR, B9, D41PAY, all five geographies) | | none |

I also checked France's total revenue against DE, IT, ES and EU27 for every year from 1995 to 2025, and it was higher than all four each year. The INSEE quotes match the archived `insee-annual-accounts.html` (Insee Première n° 2106).
