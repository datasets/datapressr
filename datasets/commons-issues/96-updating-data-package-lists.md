---
number: 96
title: Updating data package lists
state: open
author: Deiz
created_at: "2015-05-09T18:34:47Z"
updated_at: "2020-11-19T06:34:38Z"
labels: [meta]
---

# Updating data package lists

I'd like to generate a bit of discussion on this before making any changes.
#### Should core datasets be present in both core-list.txt and catalog-list.txt?

Currently, 33 of the 35 repos in the core list are also found in catalog-list.txt. I see that deduplication is performed when displaying the lists on data.okfn.org, but perhaps the two lists should be mutually-exclusive? If so, I could update the scraper to avoid outputting known core datasets.
#### Are all non-example datasets in the datasets organization considered core datasets?

I did a quick check and [datasets/employment-us](https://github.com/datasets/employment-us) and [datasets/browser-stats](https://github.com/datasets/browser-stats) are both absent from the core list, and seem useful and high-quality.
#### Should catalog-list.txt be curated?

There are quite a few valid data packages that are examples or tests (e.g. [datasets/ex-geojson](https://github.com/datasets/ex-geojson)). Should catalog-list.txt contain all valid data packages, or aim to only include useful data?

## Comments

### rufuspollock (2015-05-30T08:22:31Z)

@Deiz great questions:
- i think you are right that the duping of core and catalog was annoying and i think that is now fixed
- ultimately i think datasets in this org should be core - probably us employment and browser stats could be core (and if not we can move out)
- catalog-list atm should probably just be everything including examples ...

### pdehaye (2015-12-01T15:26:12Z)

I filed separately #130 and #129  since we need two maintainers for datasets/employment-us and datasets/browser-stats. datasets/ex-geojson was removed from the core list. As such I think this can be closed but want to give a chance to bump this thread for a couple more days.

### s-celles (2020-11-19T06:13:09Z)

I found that `core-list` is now in https://github.com/datasets/core-datasets but couldn't find where `catalog-list` is now

I wonder if they are considered as DataPackage catalog https://github.com/frictionlessdata/specs/issues/37#issuecomment-552936484
