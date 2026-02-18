---
number: 15
title: Exchange Rates
state: open
author: rufuspollock
created_at: "2013-04-15T07:37:49Z"
updated_at: "2021-07-15T13:05:10Z"
labels: ["Type: Indicator", "Priority: ★★★"]
---

# Exchange Rates

http://datahub.io/dataset/exchange-rates

## Comments

### rufuspollock (2017-11-04T10:02:26Z)

@Mikanebu can you look into this and report back on what it would take to get this up - i think this would be really useful.

### Mikanebu (2017-11-06T05:07:44Z)

@rufuspollock Sure, I will report you soon

### Mikanebu (2017-11-15T16:54:09Z)

@rufuspollock I checked all 3 resources which are: 
* OECD Monthly Exchange Rates - it is only until 2011 - https://commondatastorage.googleapis.com/ckannet-storage/2011-12-05T192836/OECD-Monthly-Exchange-Rates.zip
* Foreign exchange rates from US federal reserve  - http://research.stlouisfed.org/fred2/categories/15/downloaddata/FX_csv_2.zip
* Euro foreign exchanges rates ecb historical - http://www.ecb.int/stats/eurofxref/eurofxref-hist.zip?660e41d04f400c146331b2c488d4c5fd

There will be a huge dataset with 2 resources or we can even split it into 2 datasets: 
* `euro-foreign-exchanges-rates`
  * from 1991 to nowadays.
  * regularity: daily
  * 41 columns(each column for foreign currency)
* `Foreign exchange rates from US federal reserve(daily and annually)`
  * probably we only need daily or we can split it out into 2 resources
  * 3 columns(Date,Rate,Currency)
* script is well written and needs small refactoring https://github.com/datasets/exchange-rates-usd/blob/master/run.py

Estimate time: 2hours

### rufuspollock (2017-11-15T19:01:12Z)

@Mikanebu let's start with US Federal Reserve data. Do we have granularities other than daily (and what's the time coverage)?

Also can we automate this?

### Mikanebu (2017-11-15T19:09:50Z)

@rufuspollock Yes, annually. Time coverage since 1971. We cannot automate US Federal Reserve data, it is bit complicated(zip with 148 csv files,plus some logic to merge them), but we can automate `euro-foreign-exchanges-rates`. So, I suggest having 2 different datasets for `EURO` and `USD`.

### anuveyatsu (2021-07-15T13:05:10Z)

We could work on this dataset and improve to include more countries. Ideally, we could cover all countries from PPP dataset - https://github.com/datasets/ppp
