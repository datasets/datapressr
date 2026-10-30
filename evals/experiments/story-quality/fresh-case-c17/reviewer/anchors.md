# FC-C17 source and answerability anchors — reviewer only

## Scope and exact source locators

`inputs/raw/population.csv`: header plus national record SUMLEV=010 / STATE=00 / NAME=United States. Use suffixes 2021 through 2024 from the same Vintage 2024 release. The source layout PDF p1 defines population endpoints, NPOPCHG, births, deaths and natural change; p2 defines net international and domestic migration and residuals. Annual migration/flow periods run July 1 of the preceding year through June 30; stock observations are July 1. Exclude the partial 2020 interval. National stock means resident population, not citizens, adults, voters or households. The methods PDF p1 describes resident population and the demographic balancing approach; pp8–9 identify net international migration as a sum of multiple immigration/emigration and other movement components. It is not gross border arrivals, asylum applications or solely foreign-born immigration.

Accounting: end stock minus start stock equals natural change plus net international migration plus domestic migration plus residual. Natural change equals births minus deaths. National domestic migration and residual equal zero in these four source rows. Share of annual change uses annual population change as denominator; population growth rate uses starting population. Percentage share of growth is not percentage growth of the total population. The primary descriptive relation is the change in annual growth between the two endpoint years, decomposed into changes in the components; a secondary relation is each year's component share of annual growth.

## Available external measurement mechanism

`migration-release-notes.pdf` p2, section Net International Migration Estimates, documents an administrative-data adjustment applied to non-U.S.-born immigration for estimate years 2022–2024. It increases national net international migration estimates relative to Vintage 2023. Accept a clearly attributed statement of that method change, qualified as measurement methodology. The same source does not give an unadjusted national counterfactual for each row in this packet. No attribution to a named administration, border policy, wage differential or change in migrant intent is established. The full methods PDF and release notes must be read together, since the notes update the method.

## Reconstructed expected findings

Exact extracted counts and ratios are in `../inputs/data/components.csv`; a separate Python Decimal reconstruction is in `../reconstruction/check-result.json`. The population-growth acceleration from 2021 to 2024 is 2,782,717 people per year: migration's increase is 2,410,115 (86.61013678358238% of that acceleration), and natural change's increase is 372,602. Those quantities are changes in annual flows, not cumulative migrants over four years. In 2024 alone, migration is 2,786,119 of 3,304,757 annual population increase (about 84.3%). This explains the estimates' accounting decomposition; it does not identify the real-world causal share due to a particular policy or separate methodology from underlying movement.

## Answerability

The packet fully supports the bounded numerical decomposition and source-attributed measurement account. The broader “why actual migration rose” question is not fully answerable. A good answer must preserve useful supported mechanisms rather than discard all explanation, and must leave policy/behavioral causal apportionment unresolved. No commissioned story, writer output or candidate rule informed selection.
