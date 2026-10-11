---
title: "France Has Run a Deficit Every Year Since 1995"
description: "French public debt has nearly doubled as a share of GDP since 2000 because spending has exceeded revenue in every year since 1995, and a rising interest bill now makes the gap harder to close."
datahub:
  slug: france-deficit-every-year
  status: draft
---

# France Has Run a Deficit Every Year Since 1995

![Line chart of French gross public debt as a percentage of GDP, quarterly, 2000 to mid-2026. It rises from 60.5% (€855bn) in 2000-Q1 to 98.2% in 2019-Q4 and 117.8% in 2021-Q1, falls to 109.5% in 2023-Q4, then climbs to 115.7% in 2025-Q4 and 119.0% (€3.6tn) in 2026-Q2. A note says deficits from 2001 to 2025 add up to €2.5tn, while debt rose €2.6tn from end-2000 to end-2025.](france-debt-crisis-debt.svg)

French public debt has nearly doubled as a share of the economy this century. It was 60.5% of GDP at the start of 2000 and 119.0% in mid-2026. In euros it went from €855bn to €3.6tn.

The figure covers all of general government: the state, local authorities and social security. It is gross debt as defined for the EU's Maastricht rules. Debt is a stock. The deficit is the yearly flow that adds to it: spending minus revenue, where revenue includes taxes, social contributions and sales.

## The gap has never closed

The deficits explain the debt. France's annual deficits from 2001 to 2025 add up to €2.5tn. Its debt rose €2.6tn over the same years. The difference is financial transactions and other adjustments that change the debt without counting in the deficit.

![Line chart of French public spending and revenue as a percentage of GDP, 1995 to 2025, with the gap between them shaded red in every year. Spending is above revenue throughout. The smallest deficit is 1.3% of GDP in 2000; deficits reach 7.4% in 2009 and 8.9% in 2020. In 2019 spending was 55.3% and revenue 53.0%; in 2025 spending was 57.2% and revenue 52.1%. The deficit was 5.8% in 2024 and 5.1% in 2025.](france-debt-crisis-gap.svg)

France has run a deficit in every year of this record, 1995 to 2025. The smallest was 1.3% of GDP, in 2000. The two largest, 7.4% in 2009 and 8.9% in 2020, line up with the two steps in the debt chart. Since 2019 the gap has widened again: spending is up 1.9 points of GDP and revenue down 0.9.

The ratio can fall while the debt grows. Between early 2021 and the end of 2023 it dropped from 117.8% to 109.5%, because the economy grew faster in money terms than the debt did. The euro amount kept rising throughout.

The deficit narrowed from 5.8% in 2024 to 5.1% in 2025. [INSEE](https://www.insee.fr/fr/statistiques/8997691) attributes most of that to higher revenue, including €23.0bn from new tax and contribution measures, €8.0bn of them one-off levies on large companies' profits and maritime freight. The debt ratio still reached 119.0% by mid-2026.

## Not a low-tax country

![Bar chart of France minus the EU27 average in 2025, in percentage points of GDP. France spends 7.7 points more and raises 5.7 points more. The extra spending: cash social benefits +2.9, public employee pay +2.1, other spending +1.1, benefits in kind bought in +1.0, subsidies +0.5, investment +0.5, interest +0.3, goods and services used −0.7. Caption: 2025 deficits France 5.1, Italy 3.1, EU 3.1, Germany 2.7, Spain 2.4; revenue France 52.1, Italy 48.1, EU 46.4, Germany 47.9, Spain 42.9.](france-debt-crisis-vs-eu.svg)

France's public revenue was 52.1% of GDP in 2025, 5.7 points above the EU average and the highest of the five compared here (four countries and the EU). Its spending is 7.7 points above the average. So France's deficit, 5.1% of GDP, is the deepest of the five: Italy's and the EU's are 3.1, Germany's 2.7 and Spain's 2.4.

Two items account for about two-thirds of the extra spending: cash social benefits (+2.9 points) and public employee pay (+2.1). France spends less than the average on goods and services. INSEE's [spending-by-function study](https://www.insee.fr/fr/statistiques/8735252) finds that pensions contributed 1.4 points of the 4.0% rise in public spending in 2024. These data do not test why French spending is higher.

## The interest bill is growing fast

![Bar chart of interest paid by French general government, in billions of euros, 1995 to 2025. 1995: €42.2bn, 3.5% of GDP. 2021: €34.8bn, 1.4% of GDP. 2025: €66.6bn, 2.2% of GDP, the highest bar. A note says the 2025 deficit excluding interest was 2.9% of GDP.](france-debt-crisis-interest.svg)

Interest nearly doubled in four years, from €34.8bn in 2021 to €66.6bn in 2025. INSEE puts this down to the larger debt and the rise in interest rates since 2022. As a share of GDP, though, interest is 2.2%, below the 3.5% of 1995. Without any interest at all, France would still have run a deficit of 2.9% of GDP in 2025. Interest makes the gap harder to close, but it is not most of the gap.

This is Eurostat's measure of interest. INSEE publishes €64.7bn for 2025, using a different treatment of bank service charges.

The data has no bond yields, credit ratings or budget votes, so it cannot show the market or political side of the crisis. It shows what lies underneath: three decades in which French government never once spent less than it raised.

## How this was made

Annual accounts come from Eurostat's government finance tables (July 2026 update) and quarterly debt from INSEE's release of 29 September 2026, both snapshotted in the [france-public-finances dataset](https://github.com/datasets/datapressr/tree/main/datasets/france-public-finances) and built by its [`build.ts`](https://github.com/datasets/datapressr/blob/main/datasets/france-public-finances/build.ts). The dataset is still at `archived` status, pending an independent review of its INSEE table parser. The charts are drawn by [`france-debt-crisis-make-charts.mjs`](france-debt-crisis-make-charts.mjs), which reads every labelled value from the CSVs; re-running both scripts reproduces the numbers. The argument was fixed first in the [outline](france-debt-crisis-outline.md).

## Friction notes

- review: self (blind run, no reviewer available). The outline review (two rounds, APPROVED at `bc2b539`) and the prose-against-outline check were done by the author. Prose check: 632 words; every beat present in outline order; every data number on a chart or listed below; local links resolve. It caught and fixed three overstatements before commit: "most of the difference" (the data does not split the €0.1tn residual), "it did not open it" (in 1998–2001 France had a surplus before interest, so interest did cause the deficit then) and "the largest share" for pensions (INSEE gives a contribution, not a ranking).
- The author's voice pass is outstanding. This is the best final draft without it.
- The charts were not inspected visually: there is no supported way to rasterise SVG in this workspace. Each was checked from its SVG source instead: `viewBox` 720 wide, every text label and its coordinates, label clearance against neighbouring lines and bars computed from the scales, two builds byte-identical, no `NaN`/`undefined`/`=>` in the output. Phone-width legibility is unchecked.
- "Crisis" is answered as "why the debt keeps rising". The dataset has no market or political data.
- **Exempt numbers** (not on a chart):
  - €23.0bn: attributed external figure (INSEE, new revenue measures 2025)
  - €8.0bn: attributed external figure (INSEE, one-off levies)
  - 1.4: attributed external figure (INSEE, pensions' contribution to 2024 spending growth)
  - 4.0%: attributed external figure (INSEE, 2024 spending growth)
  - 2022: attributed external date (INSEE, start of the rise in interest rates)
  - 1.9: difference of two charted values (spending 55.3 → 57.2)
  - 0.9: difference of two charted values (revenue 53.0 → 52.1)
  - two-thirds: ratio of charted values ((2.9 + 2.1) / 7.7)
