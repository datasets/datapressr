# Pattern: Catalog as Repository

## Example

**EH.net Economic History Datasets** — [`datasets/commons-issues/91-ehnet-datasets.md`](../datasets/commons-issues/91-ehnet-datasets.md)

Source http://eh.net/databases/ is a portal containing many datasets. It is a catalog, not a single dataset. The original issue noted: *"maybe we need a datasets-history org"*.

Proposed treatment:
- Repo: `datasets-history/ehnet-economic-history`
- Structure: one subfolder per EH.net dataset, datafiles inside those
- DataHub: own publication under the `datasets-history` org

---

## Rule

> One catalog = one GitHub repo = one DataHub publication.

A catalog (see [data-hierarchy.md](data-hierarchy.md)) gets its own independent repo and DataHub entry. It is not a subfolder inside another repo.

DataPressr is the publishing tool used to create and manage these. DataHub is where they are indexed and discoverable.

---

## When to Apply

The source is a portal, index, or curated collection — not a single dataset. You expect multiple datasets to come out of it over time. You would say "the EH.net catalog", not "a dataset from EH.net".

---

## Repository Structure

```
<catalog-name>/
├── README.md           # What this catalog is, source, license, coverage
├── <dataset-slug>/     # One subfolder per dataset
│   ├── README.md       # Schema, source URL, status
│   └── <datafile>      # e.g. data.csv
└── <dataset-slug>/
    └── ...
```

