# Tesla quarterly vehicle production and deliveries

Vehicles produced and delivered each quarter by reported model group, **Q2 2019 to Q2 2026** — 29 quarters, 174 rows — read from Exhibit 99.1 of Tesla's quarterly Production & Deliveries Form 8-K filed with the SEC.

The walkthrough of how the source was found and built is [`docs/examples/tesla-source-discovery.md`](https://github.com/datasets/datapressr/blob/main/docs/examples/tesla-source-discovery.md).

## Rebuild

```sh
SEC_USER_AGENT="<project> <your-email>" node fetch.ts   # network; reuses archive/ unless --refresh
node build.ts                                           # offline; archive/ → data/
node --test                                             # 25 tests
```

`fetch.ts` is the only script that touches the network, and it refuses to run without `SEC_USER_AGENT` — the SEC requires requests to identify the requester and asks for no more than 10 per second. `build.ts` reads `archive/` only, checks every file against the SHA-256 in `archive/manifest.json`, and is deterministic: two runs produce byte-identical CSVs.

## What the numbers mean

**Deliveries** are vehicles transferred to a customer with the paperwork complete. **Production** is vehicles built. They are two separate measures, they are never equal, and neither is revenue. Tesla calls its delivery count "slightly conservative" and says final numbers could vary by up to about 0.5%.

**Tesla does not report individual models.** It reports groups, and the grouping has changed twice:

| Quarters | Groups reported |
|---|---|
| Q2 2019 – Q4 2019 | `Model S/X`, `Model 3` |
| Q1 2020 – Q3 2023 | `Model S/X`, `Model 3/Y` |
| Q4 2023 – Q2 2026 | `Model 3/Y`, `Other Models` |

Group labels are kept exactly as the release writes them. A combined group is never split into individual models, and groups are never re-combined across regimes, because the source does not support either. If you want a continuous series, `Total` is the only group that runs unchanged through all 29 quarters.

**`is_total` matters.** Each quarter and metric has its component rows plus the release's own `Total`. Filter on `is_total` — summing a Total with its components double-counts. `build.ts` asserts that the components sum to the reported Total for every quarter and metric, so if that ever stops being true the build fails rather than publishing the discrepancy.

**Empty is not zero.** An empty `vehicles` cell means the release gave no figure. A `0` means it reported none. The one real zero is Model S/X production in Q1 2021, which Tesla printed as a dash during the line changeover; it is resolved to `0` only because the quarter's total minus the other group leaves exactly nothing, and a dash the arithmetic cannot account for is left empty instead.

## Coverage, and what is not here

Coverage starts at **Q2 2019** because that is the first release to publish its figures in a table. Tesla has filed quarterly delivery press releases since Q1 2013, but the 20 earlier ones state the numbers in prose — "Q1 deliveries totaled 29,980 vehicles, of which 11,730 were Model S, 10,070 were Model X, and 8,180 were Model 3" — with the wording changing release to release. Those filings are archived and listed in `data/source-filings.csv` with `layout: prose` and `extracted: false`. They are a known gap, deliberately left rather than extracted by a set of one-off regexes whose failures would be silent. `source-filings.csv` accounts for all 50 archived exhibits, so what was found and not used is visible rather than absent.

Other limits:

- **Q3 2026 is not here.** The snapshot was taken on 2026-09-18, before the quarter ended. The cutoff is Q2 2026, the latest quarter with a released report.
- **The lease-accounting column is not published.** Most releases carry a "Subject to operating lease accounting" percentage. It is a share, not a vehicle count, so it is out of this schema's grain; it remains in the archived exhibits.
- **Energy storage deployments are not published**, for the same reason — GWh, not vehicles.
- **Two quarters are covered by more than one filing** in the prose era (Q2 2017 was filed twice, and an unrelated exhibit was filed the day before the Q3 2018 release). The build applies a preferred-version rule — the later filing wins, both snapshots stay in `archive/` — but no quarter in the extracted range actually triggers it.

## Restatements: the annual recap does not match the four quarters

`data/tesla-annual-deliveries.csv` holds the full-year figures that Tesla recaps in each Q4 release. They are kept in a separate resource because **they do not reconcile with the four quarters as originally reported**:

| Year | Four quarters as first reported | Annual recap | Difference |
|---|--:|--:|--:|
| 2020 deliveries | 498,920 | 499,550 | +630 |
| 2021 deliveries | 935,950 | 936,172 | +222 |

Tesla revises quarterly figures after the fact and does not reissue the press releases, so the annual number counts vehicles the original quarterly releases did not. `build.ts` reports these differences on every run rather than asserting them away or quietly preferring one figure. Both are what the source said at the time; which one you want depends on whether you are studying what was reported or what was finally counted.

## Licence

The compilation here — the extracted figures, the schema and the build scripts — is released under [PDDL-1.0](https://opendatacommons.org/licenses/pddl/).

The sources are Tesla press releases filed with the SEC as public records. The figures themselves are facts, which US copyright does not cover; the press-release prose is Tesla's, and this dataset does not republish it. **No redistribution licence is granted or implied for the source documents**, and none was found: neither Tesla nor the SEC publishes terms that grant one. `archive/` holds the retrieved documents as evidence for the build, not as a republication of them.

Tesla's investor-relations site and the Business Wire copies of the same releases return HTTP 403 to plain clients. SEC EDGAR serves the identical exhibits as public records and states its access terms openly, which is why it is the source used here.
