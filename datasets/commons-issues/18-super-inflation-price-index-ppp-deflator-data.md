---
number: 18
title: "[super] Inflation / Price Index / PPP / Deflator data"
state: closed
author: rufuspollock
created_at: "2013-05-24T16:02:12Z"
updated_at: "2016-03-09T15:21:50Z"
closed_at: "2013-05-28T20:43:29Z"
labels: []
---

# [super] Inflation / Price Index / PPP / Deflator data

- Price indices
  - <del>World CPI (per country) #170</del> https://github.com/datasets/cpi 
  - Country specific price indexes e.g.
    - https://github.com/datasets/cpi-gb 
    - https://github.com/datasets/cpi-us
- Inflation
  - World: #165  
- PPP
  - <del>Global PPP #40</del> https://github.com/datasets/ppp
- Price deflators

Granularity
- Spatial:
  - "World" i.e. per country (probably annual time series)
  - Per country: probably want a sub-selection and greater granularity
- Temporal
  - Year, month, day (?)
  - Span: historical is special. For uniform values probably more recent.

## Comments

### rufuspollock (2013-05-24T16:08:04Z)

Simplest thing possible: annual CPI based inflation for most countries (probably from world bank). cpi
- Price index: http://data.worldbank.org/indicator/FP.CPI.TOTL (2005=100) - http://api.worldbank.org/indicator/FP.CPI.TOTL?format=csv
- Inflation: http://data.worldbank.org/indicator/FP.CPI.TOTL - http://api.worldbank.org/indicator/FP.CPI.TOTL.ZG?format=csv

### rufuspollock (2013-05-28T20:43:29Z)

FIXED. https://github.com/datasets/cpi

### rufuspollock (2016-03-09T15:13:25Z)

Re-opening as making this a "super" issue with links out to specific packages.
