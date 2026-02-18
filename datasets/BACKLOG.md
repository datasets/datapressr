---
created: 2026-02-18
---

Candidates mined from commons GitHub issues: https://github.com/datasets/commons

Ordered roughly by priority / how ready they are.

## Curation Notes

Sourced from 323 open/closed issues in the commons repo (fetched 2026-02-18). Skipped:
- Meta/infra issues (branch renames, CI, registry tooling)
- Issues where data is clearly proprietary or restricted-access
- Issues already well resolved (closed with active datasets)

Priority tiers (🔥🔥🔥 / 🔥🔥 / 🔥) based on two axes:
1. **Data readiness** — is the data actually accessible and usable now? (attached CSVs, known xlsx, existing scraper, community work already started)
2. **Story strength** — is there a compelling angle, broad interest, or dashboard potential?

Top picks rationale:
- **Epoch AI Models** — CSVs directly attached to issue, highly topical right now
- **Eight Centuries of Interest Rates** — data xlsx in issue, extraordinary historical scope, direct Piketty angle
- **Planetary Boundaries** — iconic concept, community member already building dataset
- **Project Drawdown** — scraper already written by community, ranked climate solutions table is very shareable
- **History of Global Living Conditions** — OurWorldInData source, natural mini-dashboard, strong narrative arc

## To Post

- [ ] ➕2026-02-18 Five Thirty Eight ...

### AI & Technology

- [ ] 🔥🔥🔥 **Epoch Data on AI Models** — comprehensive database of 2800+ ML models tracking compute, parameters, performance over time. CSVs attached to issue. _Highly topical._ [commons#412](commons-issues/412-epoch-data-on-ai-models.md)
- [ ] 🔥🔥 **Historical Adoption of Technology (CHAT)** — NBER dataset: adoption of 100+ technologies across 150+ countries since 1800. CSV available. Great for "how fast do technologies spread?" stories. [commons#156](commons-issues/156-historical-adoption-of-technology.md)
- [ ] 🔥 **Genome Sequencing Costs** — cost per genome from 2001 onward; faster decline than Moore's law. Dataset already exists at github.com/datasets/genome-sequencing-costs (closed issue = done). Good to surface/post. [commons#148](commons-issues/148-genome-sequencing-costs.md)

### Climate & Environment

- [ ] 🔥🔥🔥 **Planetary Boundaries** — Steffen et al. 2015 Science paper. Defines 9 planetary boundaries; 4 already crossed. Community member (BastienGauthier) has temporal evolution data started. Ready to package. [commons#338](commons-issues/338-steffen-et-al-planetary-boundaries-guiding-human-development.md)
- [ ] 🔥🔥🔥 **Project Drawdown** — ranked table of ~80 climate solutions by CO2 reduction impact. Data scraped from HTML table; community scraper exists. Very shareable. [commons#329](commons-issues/329-project-drawdown.md)
- [ ] 🔥🔥 **Trajectory of the Anthropocene: The Great Acceleration** — Steffen et al. data on 24 socioeconomic + Earth system trends since 1950. Labeled "easy / good first issue". Data in supplementary material of Science paper. Dashboard potential. [commons#408](commons-issues/408-trajectory-of-the-anthropocene-the-great-acceleration.md)
- [ ] 🔥🔥 **HYDE — History Database of the Global Environment** — 12,000 years of gridded population and land use data. Netherlands PBL. Extraordinary scope. [commons#254](commons-issues/254-hyde-history-database-of-the-global-environment.md)
- [ ] 🔥 **Bioregions 2023** — One Earth: 185 discrete bioregions across biogeographical realms. Novel framework, good visuals. [commons#400](commons-issues/400-httpswwwoneearthorgbioregions-2023.md)
- [ ] 🔥 **Lazard Levelized Cost of Energy (LCOE)** — annual benchmark for cost of solar, wind, storage vs fossil fuels. Mainly PDFs — worth extracting key time series. [commons#332](commons-issues/332-lazard-levelized-cost-of-energy-lcoe-and-levelized-cost-of-s.md)
- [ ] 🔥 **Emissions Trading Schemes & Carbon Pricing** — global carbon price / ETS data. Thin issue but important topic; NZ data already scraped. [commons#256](commons-issues/256-emissions-trading-schemes-and-carbon-pricing.md)

### Economic History

- [ ] 🔥🔥🔥 **Eight Centuries of Global Real Interest Rates** — Schmelzing/BoE 2020 paper. Annual real rates 1311–2018 across 78% of advanced economy GDP. Data xlsx attached to issue. Directly challenges Piketty. [commons#330](commons-issues/330-very-long-term-real-interest-rates-over-centuries.md)
- [ ] 🔥🔥 **Millennium of Macroeconomic Data for the UK** — Bank of England dataset back to C13th (some estimates from Domesday Book 1086). GDP, wages, prices, interest rates. 28MB xlsx. [commons#331](commons-issues/331-a-millenium-of-macroeconomic-data-for-the-uk-boe.md)
- [ ] 🔥🔥 **Working Hours — Historical Time Series** — Huberman & Minns (2007): work hours across countries 1870–2000. ILO for recent. Good "we work less than we used to" story. [commons#200](commons-issues/200-working-hours-time-series-historical.md)
- [ ] 🔥 **Global Wealth Distribution** — Credit Suisse Global Wealth Databook. Distribution of wealth globally. [commons#207](commons-issues/207-global-wealth-distribution-wip.md)

### Society & Living Standards

- [ ] 🔥🔥🔥 **History of Global Living Conditions** — OurWorldInData 6-chart summary (poverty, life expectancy, literacy, democracy, etc.). Could become a mini dashboard. [commons#409](commons-issues/409-a-history-of-global-living-conditions-in-6-charts.md)
- [ ] 🔥🔥 **Segregation Tracking Project** — USC/Stanford: comprehensive tracking of segregation across every US neighborhood and school. [commons#410](commons-issues/410-the-segregation-tracking-project.md)
- [ ] 🔥 **PISA Education Performance** — OECD PISA cross-country student performance data. [commons#308](commons-issues/308-pisa-education-performance-data-oecd-pisa.md)

### Energy & Commodities

- [ ] 🔥🔥 **BP Statistical Review of World Energy** — annual flagship energy stats: production, consumption, prices by country and fuel type. [commons#333](commons-issues/333-bp-statistical-review-of-world-energy.md)
- [ ] 🔥🔥 **US Primary Energy Consumption 1635–2000** — very long historical US energy series. [commons#339](commons-issues/339-estimated-primary-energy-consumption-in-the-united-states-16.md)
- [ ] 🔥 **Precious Metals Prices** — silver, platinum, palladium time series (complement to existing gold-prices dataset). [commons#401](commons-issues/401-precious-metals-datasets.md)

### Space

- [ ] 🔥🔥 **GCAT: General Catalog of Artificial Space Objects** — every satellite, rocket stage, and debris object ever launched. Stub repo already exists at github.com/datasets/gcat-artificial-space-objects. [commons#406](commons-issues/406-gcat-general-catalog-of-artificial-space-objects.md)
