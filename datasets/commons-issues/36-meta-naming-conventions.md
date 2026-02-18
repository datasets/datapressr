---
number: 36
title: "[meta] Naming Conventions"
state: closed
author: rufuspollock
created_at: "2013-12-01T00:09:38Z"
updated_at: "2015-04-26T21:31:21Z"
closed_at: "2015-04-26T21:31:21Z"
labels: []
---

# [meta] Naming Conventions

Establish various naming conventions both for datasets / repos and also for files.
## Datasets

For country specific datasets:

```
{topic}                      # e.g. gdp
{topic}-{2-digit-iso}    # e.g. gdp-us 
```
## For Data Files

Temporal granularity

```
[...-]year.csv
[...-]quarter.csv
[...-]month.csv
[...-]day.csv
```
## For README

Intro summary paragraph

Headings (all h2)
- Data - about the data
- Wrangling - how we had to process the data (maybe we should call Processing)
- License - about the license

## Comments

### rufuspollock (2015-04-26T21:31:21Z)

FIXED. See http://data.okfn.org/doc/publish-faq#data-package-names
