---
number: 376
title: Get core datasets up to date
state: open
author: rufuspollock
created_at: "2023-03-14T10:47:46Z"
updated_at: "2024-03-05T14:14:34Z"
labels: []
---

# Get core datasets up to date

We want to get the "core" dataset as listed here up to date https://github.com/datasets/core-datasets (and preferably *all* datasets on github.com/datasets)

## Acceptance

- [ ] What datasets are up to date / out of date?
- [ ] Which github actions are failing
- [ ] How do we show a datasets is not up to date
  - [ ] Perhaps a GH badge?

## Notes - May 2020

1. **corruption-perceptions-index**
Libraries need to be installed, sometimes source is downloaded but it is not unzipped, some sources unavailable, it's a mess. **I suggest complete refactoring of this script**

2. **geo-admin1-us**
This uses tuttle file so further analysis is needed

3. **geo-countries**
This uses tuttle file so further analysis is needed

4. **geo-ne-admin1**
This uses tuttle file so further analysis is needed

5. **language-codes**
Unable to make PHP work, further analysis needed

6. **un-locode**
Unable to make PHP work, further analysis needed

7. **world-cities**
This uses tuttle file so further analysis is needed

- [ ] Research and replace the broken or missing sources for the following datasets
   - [ ] https://github.com/datasets/cofog
   - [ ] https://github.com/datasets/cash-surplus-deficit
   - [ ] https://github.com/datasets/cpi-us
   - [ ] https://github.com/datasets/employment-us
   - [ ] https://github.com/datasets/investor-flow-of-funds-us
   - [ ] https://github.com/datasets/population-global-historical
   - [ ] https://github.com/datasets/uk-sic-2007-condensed
   - [ ] https://github.com/datasets/unece-package-codes
   - [ ] https://github.com/datasets/unece-units-of-measure


### Pull request created by @svetozarstojkovic

* https://github.com/datasets/corruption-perceptions-index/pulls
