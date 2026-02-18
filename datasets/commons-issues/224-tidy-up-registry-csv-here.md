---
number: 224
title: Tidy up registry csv here
state: closed
author: rufuspollock
created_at: "2017-11-06T11:14:45Z"
updated_at: "2017-11-13T07:51:58Z"
closed_at: "2017-11-13T07:51:58Z"
labels: []
assignees: [Mikanebu]
---

# Tidy up registry csv here

We want to tidy up registry, so it is up to date

## Acceptance criteria

* [x] examples datasets moved to separate repo https://github.com/datapackage-examples/registry
* [x] `README` is updated
* [x] renamed `core-status.csv` to `core-list.csv` and `core-status-testing` to `core-list-testing.csv`, plus old `core-list.csv` is removed
* [x] added new column `modified` about frequency information(year, month, day, quarter) to `core-list.csv` 
* [x] datapackage.json is updated for new `core-list.csv`
* [x] published on datahub.io 

## Tasks

* [x] examples should move to the datapackage-examples organization (call it registry repo)
* [x] update the README instructions for index.js usage ...
* [x] rename core-status to core-list.csv (and core-status-testing to core-list-testing.csv)
* [x] merge in to core-list the frequency information (year, month, day, quarter)
   * [ ] up to date
* [x] update the datapackage.json (just core-list.csv - ignore testing)
* [x] push to datahub.io/core/registry - Registry (list) of Core Datasets

## Comments

### rufuspollock (2017-11-13T07:47:37Z)

@Mikanebu is this now done? Can we close?

### Mikanebu (2017-11-13T07:51:58Z)

FIXED, published registry https://datahub.io/core/registry, examples registry https://github.com/datapackage-examples/registry
