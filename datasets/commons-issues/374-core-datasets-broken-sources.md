---
number: 374
title: Core datasets broken sources
state: open
author: PhilippeduPreez
created_at: "2023-03-08T22:13:05Z"
updated_at: "2024-10-22T09:30:56Z"
labels: []
assignees: [PhilippeduPreez]
---

# Core datasets broken sources

*Created by: @Branko-Dj*

Some of the core datasets have a source that is not working anymore. As a PM I want to find alternative up to date sources

## Analysis
1. **cofog**

Source for `process.py` script on line 20 `access_db_zip_url = 'http://unstats.un.org/unsd/cr/registry/regdntransfer.asp?f=186'` is broken.


## Acceptance Criteria
- [ ] We have the new source for each of the datasets where the source is broken or missing

## Tasks
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

## Comments

### anuveyatsu (2024-10-22T06:07:59Z)

@gradedSystem I know you are working on updating core datasets so could you please check the list here and check items you have fixed please.

### gradedSystem (2024-10-22T06:10:27Z)

@anuveyatsu sure going to look into that

### gradedSystem (2024-10-22T09:27:12Z)

@anuveyatsu should i try changing the codebase and scripts if the source is not working just as we did in `core` datasets?

### anuveyatsu (2024-10-22T09:29:42Z)

@gradedSystem no, could you just go through the list of items in this issue and see if you have already fixed any of them as part of your ongoing work?

### gradedSystem (2024-10-22T09:30:54Z)

@anuveyatsu I don't think any of them are fixed as part of my ongoing work
