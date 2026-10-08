# French public finances

Official snapshots for an investigation of French public debt, persistent deficits, government revenue and what public money buys. The unit is **general government**: central government, local government and social security administrations, with consolidation as defined by the statistical sources.

This is one portable dataset in the DataPressr repository, not a copy of an entire Eurostat or INSEE catalog. It can become a standalone repository later without changing its build. The accompanying story belongs in `site/stories/`; Bead `datapressr-sy2` tracks the investigation.

## Reproduce

Requires a recent Node version with native TypeScript support (tested on Node 26.4.0).

```sh
npm install
node build.ts
node scripts/validate-datapackage.mjs .
```

The build is offline and verifies every archived file against `archive/manifest.json`. To check or fetch the raw sources, use `node fetch.ts`; an existing valid snapshot is reused. `node fetch.ts --refresh` explicitly replaces the snapshot. Snapshot-specific count and value assertions deliberately require review when accepting new releases.

## Resources and coverage

| Resource | Content | Coverage in this snapshot |
|---|---|---|
| `data/fiscal-accounts.csv` | 15 fiscal indicators, millions of current euros and percentage of GDP; France, Germany, Italy, Spain and EU27 | API dimensions 1975–2025; availability varies by geography and indicator; France's main totals start in 1995 |
| `data/spending-functions.csv` | France: all 10 COFOG divisions and their groups, plus the total, in millions of euros and percentage of GDP | API dimensions 1990–2025; French values 1995–2024; 2025 is entirely missing |
| `data/quarterly-debt.csv` | French gross and net Maastricht debt in billions of euros, and gross debt/GDP | 2000-Q1–2026-Q2, all from INSEE's 29 September 2026 release |

Empty cells mean the source did not supply an observation. Explicit zeros are retained. The Eurostat files retain the complete selected dimension grids, including missing cells, and original observation flags. The data package documents keys, types, units and definitions for every field. Eurostat's `p` flag means provisional; unflagged data can still be revised.

## Sources, licence and transformations

- [Eurostat government accounts](https://ec.europa.eu/eurostat/databrowser/view/gov_10a_main/default/table?lang=en), update 21 July 2026: JSON-stat dimensions flattened to rows, without rounding or filling values.
- [Eurostat spending by function](https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en), update 16 September 2026: the same flattening, with hierarchy level and parent codes derived from COFOG codes.
- [Source: INSEE, quarterly debt release, 29 September 2026](https://www.insee.fr/fr/statistiques/9053525): two caption- and header-checked HTML tables joined by quarter, with quarter-end dates derived. The source gives billions; no conversion to millions is applied.

Eurostat permits reuse of its statistical data with source acknowledgement under its [reuse policy](https://ec.europa.eu/eurostat/help/copyright-notice). This is recorded by its own name rather than assuming its editorial-content CC BY licence is the data licence. INSEE information is under [Licence Ouverte 2.0](https://www.insee.fr/fr/information/2008466). Each manifest entry records the exact request URL, retrieval timestamp, source update where provided, byte count and SHA-256. The raw snapshot is under 1 MB and fits the small-data workflow.

## Interpretation and reconciliation

**Revenue is broader than taxes.** `TR` includes social contributions, sales and other receipts. Net social contributions include imputed contributions. The selected tax and contribution components are not interchangeable with France's published *prélèvements obligatoires* measure; definitions, collection adjustments and tax credits matter. Use `TR - TE = B9` for the total financing balance. A negative `B9` is a deficit.

**Spending classifications overlap.** The COFOG table answers “what purpose?”, while wages, benefits, subsidies and investment in the fiscal table answer “what economic type?”. A teacher's pay is both education and compensation of employees. Do not add the two classifications. Within COFOG, do not add a parent to its children. Social protection excludes health. “Old age” and “survivors” are separate categories; neither should silently be renamed to all pensions.

**Debt is a stock; the deficit is a flow.** Maastricht debt is consolidated gross debt in specified instruments at nominal value. INSEE net debt deducts specified financial assets, not all public assets. Changes in debt also reflect financial transactions and other stock-flow adjustments; they are not an alternative way to measure the annual deficit. The quarterly ratio uses INSEE's annualised GDP methodology, not one quarter's output.

**Retain statistical vintages.** The Eurostat annual snapshot reports 2025 expenditure/revenue as 57.2/52.1% of GDP. INSEE's May 2026 annual account article reports 57.3/52.2%. Both report a 5.1% deficit. Their euro totals also differ slightly. This build preserves each source and does not silently splice them. The quarterly debt release revises earlier quarters: it gives end-2025 debt of 115.7% and Q2 2025 of 115.2%, so a press article's older comparison can differ. Functional spending totals and the main accounts come from different update dates; chart shares use the COFOG table's own total, never a total from the other table.

**Interest definitions need care.** The fiscal resource retains Eurostat `D41PAY` (66.6 billion euros in 2025). INSEE's annual article presents 64.7 billion euros with its stated FISIM treatment. A separate [Eurostat cross-check of D41GPAY and D41PAY](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10a_main?lang=EN&geo=FR&sector=S13&unit=MIO_EUR&na_item=D41PAY&na_item=D41GPAY&time=2025) identifies D41GPAY, “Total interest before FISIM allocation”, as 64,651.9 million euros, matching INSEE after rounding. This cross-check is contextual, not another archived resource. Comparisons must state the interest convention. No debt-interest causal estimate is inferred from the difference.

**Scope of explanation.** A large spending category is not proof that it caused a deficit. The accounts measure the gap; policy choices, economic conditions, indexation and demographics require separate evidence. The archived INSEE annual-account and spending-function articles provide attributed explanations of recent movements, not a causal decomposition of fifty years of fiscal policy.

## Review

The build uses a custom HTML parser for quarterly debt. Independent reviewer `/root/review_france_data`, with no hand in the build, returned **APPROVED** on 8 October 2026 for commit `fddb127fffe63c9af2f74978678a8fc535b20623`. Lifecycle status was then advanced from archived to structured; data values were unchanged.

Round 1 at `47e8631` reproduced sampled source values and extrema, but a deliberately corrupted COFOG label passed. A reviewed 110-label source contract and a regression test now reject that mutation even if the source manifest checksum is updated. Round 2 caught all four mutations: corrupt label, dropped zero, truncated HTML and swapped debt columns. Validation returned 0 errors/0 warnings; two offline builds were byte-identical; root tests passed 173/173. The [round 1 report](https://github.com/datasets/datapressr/blob/main/docs/reviews/france-public-finances-data-round1.md) and [round 2 report](https://github.com/datasets/datapressr/blob/main/docs/reviews/france-public-finances-data-round2.md) contain the independent derivations, source locations, names checked and exact metadata/data SHA-256 hashes.

## Story and portable download

The companion story is `site/stories/france-public-finances.md`. Its charts unpack social protection and compare nominal spending growth with spending as a share of GDP. The three CSV resources above remain the canonical data; no numbers are rounded for the story in these files.

From the repository root, `node site/stories/france-public-finances-package.mjs` generates a portable bundle under `.runtime/france-public-finances-package/`: the story as `bundle/README.md`, the three files in `bundle/data/`, `datapackage.json`, SVG charts, definitions, raw snapshots and offline reproduction instructions. `dist/` contains the static preview and downloadable ZIP. Install the pinned dependencies in `site/stories` first with `npm ci`. The bundle is generated from these committed sources; it is not a second hand-edited dataset.
