# Data Hierarchy (Concise Model)

We define three structural object types:

1. **Catalog**
2. **Dataset**
3. **Data File**

---

## 1. Catalog

A listing of datasets.

Examples:

* Institutional portal (World Bank)
* Thematic grouping (Human Rights Data)
* Your own curated grouping

A **collection** is special case of a *thematic catalog* -- often small.

So:

> Collection = special, small Catalog (semantic subtype)

A catalog:

* Contains datasets
* May contain sub-catalogs
* Does not itself need to be data

---

## 2. Dataset

A coherent structured data concept defined by schema and coverage.

Important:

* A dataset is a logical unit.
* It may contain multiple data files.
* It may have sub-datasets (handled via parent relationship).

Examples:

* “US GDP 1900–2020”
* “Human Rights Violations Index”

---

## 3. Data File

A concrete file artifact.

Examples:

* `gdp.csv`
* `index_2024.json`

This is the storage layer.

---

# Hierarchy Diagram

```
Catalog
│
├── Dataset
│   ├── Dataset (sub-dataset)
│   │   └── Data File
│   └── Data File
│
└── Dataset
    └── Data File
```

---

# Parent Model

Keep it simple:

```
type: catalog | dataset | datafile
parent: <id>   # single structural parent
```

Rules:

* Catalog → contains datasets
* Dataset → contains datasets or datafiles
* Datafile → leaf node

Avoid multi-parent structural trees.

---

# Core Principle

Everything is a node in a typed hierarchy.

Catalogs organize.
Datasets define structure.
Data files implement datasets.

That’s enough structure to scale without overengineering.

