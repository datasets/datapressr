---
number: 208
title: Aggregate Pharmaceutical Drug Spending
state: closed
author: rufuspollock
created_at: "2017-02-10T05:25:20Z"
updated_at: "2019-12-11T13:00:12Z"
closed_at: "2019-12-11T13:00:01Z"
labels: []
assignees: [Mikanebu]
---

# Aggregate Pharmaceutical Drug Spending

Global spending and per country for all drugs

* Bonus if we can disaggregate for some drugs but that is really another dataset (as much bigger)
* Individual country analysis for "big" spenders e.g. US

Best data I've found is this OECD data:

https://data.oecd.org/healthres/pharmaceutical-spending.htm

With some painful JS debugging (their download link isn't an actual link but just a hook for some js) i located the download url as:

https://stats.oecd.org/sdmx-json/data/DP_LIVE/.PHARMAEXP.../OECD?contentType=csv&detail=code&separator=comma&csv-lang=en

You'd need to combine it with population data to get totals which is a nice example of merging.

+OpenWorld

## Analysis

There will be 2 resources, 1st with original pharma data, 2nd with extra columns. 

New csv headers: 
"LOCATION","INDICATOR","SUBJECT","MEASURE","FREQUENCY","TIME","Value","Flag Codes", "Population", " Total Spending Per Country"
Total Spend Per County = Value * Population

* Population from the OECD
https://data.oecd.org/pop/population.htm
  * outdated, missing years 2015, 2016 for some countries
* Population from World Bank, using our core dataset: 
http://datahub.io/core/population
  * updated with the latest data
I suggest to use World Bank because in case of merging, it has a perfect match.

## Comments

### rufuspollock (2019-12-11T13:00:01Z)

FIXED. See https://datahub.io/blog/pharmaceutical-drug-spending and https://datahub.io/core/pharmaceutical-drug-spending and https://github.com/datasets/pharmaceutical-drug-spending
