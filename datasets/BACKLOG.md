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

- [x] 🔥🔥🔥 **Epoch Data on AI Models** — comprehensive database of 2800+ ML models tracking compute, parameters, performance over time. CSVs attached to issue. _Highly topical._ [commons#412](commons-issues/412-epoch-data-on-ai-models.md)
  ✅ Published: https://datahub.io/ai/epoch-data-on-ai-models
- [x] 🔥🔥 **Historical Adoption of Technology (CHAT)** — NBER dataset: adoption of 100+ technologies across 150+ countries since 1800. CSV available. Great for "how fast do technologies spread?" stories. [commons#156](commons-issues/156-historical-adoption-of-technology.md)
  ✅ Published: https://datahub.io/technology/historical-adoption-of-technology
- [x] 🔥 **Genome Sequencing Costs** — cost per genome from 2001 onward; faster decline than Moore's law. Dataset already exists at github.com/datasets/genome-sequencing-costs (closed issue = done). Good to surface/post. [commons#148](commons-issues/148-genome-sequencing-costs.md)
  ✅ Published: https://datahub.io/technology/genome-sequencing-costs

### Climate & Environment

> Repo: `git@github.com:datasets/climate-and-environment.git` | Publication: https://datahub.io/climate-and-environment

- [ ] 🔥🔥🔥 **Planetary Boundaries** — Steffen et al. 2015 Science paper. Defines 9 planetary boundaries; 4 already crossed. Community member (BastienGauthier) has temporal evolution data started. Ready to package. [commons#338](commons-issues/338-steffen-et-al-planetary-boundaries-guiding-human-development.md)
- [ ] 🔥🔥🔥 **Project Drawdown** — ranked table of ~80 climate solutions by CO2 reduction impact. Data scraped from HTML table; community scraper exists. Very shareable. [commons#329](commons-issues/329-project-drawdown.md)
- [x] 🔥🔥 **Trajectory of the Anthropocene: The Great Acceleration** — Steffen et al. data on 24 socioeconomic + Earth system trends since 1950. Labeled "easy / good first issue". Data in supplementary material of Science paper. Dashboard potential. [commons#408](commons-issues/408-trajectory-of-the-anthropocene-the-great-acceleration.md)
  ✅ Published: https://datahub.io/climate-and-environment/great-acceleration
- [x] 🔥🔥 **HYDE — History Database of the Global Environment** — 12,000 years of gridded population and land use data. Netherlands PBL. Extraordinary scope. [commons#254](commons-issues/254-hyde-history-database-of-the-global-environment.md)
  ✅ Published: https://datahub.io/climate-and-environment/hyde
- [x] 🔥 **Bioregions 2023** — One Earth: 185 discrete bioregions across biogeographical realms. Novel framework, good visuals. [commons#400](commons-issues/400-httpswwwoneearthorgbioregions-2023.md)
  ✅ Published: https://datahub.io/climate-and-environment/bioregions-2023
- [x] 🔥 **Lazard Levelized Cost of Energy (LCOE)** — annual benchmark for cost of solar, wind, storage vs fossil fuels. Mainly PDFs — worth extracting key time series. [commons#332](commons-issues/332-lazard-levelized-cost-of-energy-lcoe-and-levelized-cost-of-s.md)
  ✅ Published: https://datahub.io/climate-and-environment/lazard-lcoe
- [x] 🔥 **Emissions Trading Schemes & Carbon Pricing** — global carbon price / ETS data. Thin issue but important topic; NZ data already scraped. [commons#256](commons-issues/256-emissions-trading-schemes-and-carbon-pricing.md)
  ✅ Published: https://datahub.io/climate-and-environment/carbon-pricing

### Economic History

> Repo: `git@github.com:datasets/economic-history.git` | Publication: https://datahub.io/economic-history

- [x] 🔥🔥🔥 **Eight Centuries of Global Real Interest Rates** — Schmelzing/BoE 2020 paper. Annual real rates 1311–2018 across 78% of advanced economy GDP. Data xlsx attached to issue. Directly challenges Piketty. [commons#330](commons-issues/330-very-long-term-real-interest-rates-over-centuries.md)
  ✅ Published: https://github.com/datasets/economic-history/tree/main/eight-centuries-interest-rates
- [ ] 🔥🔥 **Millennium of Macroeconomic Data for the UK** — Bank of England dataset back to C13th (some estimates from Domesday Book 1086). GDP, wages, prices, interest rates. 28MB xlsx. [commons#331](commons-issues/331-a-millenium-of-macroeconomic-data-for-the-uk-boe.md)
- [ ] 🔥🔥 **Working Hours — Historical Time Series** — Huberman & Minns (2007): work hours across countries 1870–2000. ILO for recent. Good "we work less than we used to" story. [commons#200](commons-issues/200-working-hours-time-series-historical.md)
- [ ] 🔥 **Global Wealth Distribution** — Credit Suisse Global Wealth Databook. Distribution of wealth globally. [commons#207](commons-issues/207-global-wealth-distribution-wip.md)

### Society & Living Standards

> Repo: `git@github.com:datasets/society-and-living-standards.git` | Publication: https://datahub.io/society-and-living-standards

- [x] 🔥🔥🔥 **History of Global Living Conditions** — OurWorldInData 6-chart summary (poverty, life expectancy, literacy, democracy, etc.). Could become a mini dashboard. [commons#409](commons-issues/409-a-history-of-global-living-conditions-in-6-charts.md)
  ✅ Published: https://datahub.io/society-and-living-standards/history-global-living-conditions
- [ ] 🔥🔥 **Segregation Tracking Project** — USC/Stanford: comprehensive tracking of segregation across every US neighborhood and school. [commons#410](commons-issues/410-the-segregation-tracking-project.md)
- [ ] 🔥 **PISA Education Performance** — OECD PISA cross-country student performance data. [commons#308](commons-issues/308-pisa-education-performance-data-oecd-pisa.md)

### Energy & Commodities

> Repo: `git@github.com:datasets/energy-and-commodities.git` | Publication: https://datahub.io/energy-and-commodities

- [x] 🔥🔥 **BP Statistical Review of World Energy** — annual flagship energy stats: production, consumption, prices by country and fuel type. [commons#333](commons-issues/333-bp-statistical-review-of-world-energy.md)
  ✅ Published: https://datahub.io/energy-and-commodities/bp-statistical-review-world-energy
- [ ] 🔥🔥 **US Primary Energy Consumption 1635–2000** — very long historical US energy series. [commons#339](commons-issues/339-estimated-primary-energy-consumption-in-the-united-states-16.md)
- [ ] 🔥 **Precious Metals Prices** — silver, platinum, palladium time series (complement to existing gold-prices dataset). [commons#401](commons-issues/401-precious-metals-datasets.md)

### Space

- [x] 🔥🔥 **GCAT: General Catalog of Artificial Space Objects** — every satellite, rocket stage, and debris object ever launched. Stub repo already exists at github.com/datasets/gcat-artificial-space-objects. [commons#406](commons-issues/406-gcat-general-catalog-of-artificial-space-objects.md)
  ✅ Published: https://datahub.io/technology/gcat-artificial-space-objects

---

## Extra

Datasets published that weren't sourced from the backlog above.

- [x] **Adoption Rates of Key Technologies** — US adoption rates over time for telephone, radio, TV, PC, internet, mobile, smartphone. Story: each wave is faster than the last.
  ✅ Published: https://datahub.io/technology/adoption-rates-technology

- [x] **Cloud Providers Pricing Over Time** — historical storage pricing ($/GB/month) for AWS S3, GCP, Azure from launch to present. Story: 85% price decline since 2006.
  ✅ Published: https://datahub.io/technology/cloud-providers-pricing
