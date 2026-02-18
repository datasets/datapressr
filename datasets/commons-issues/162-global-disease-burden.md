---
number: 162
title: Global Disease Burden
state: open
author: rufuspollock
created_at: "2016-02-18T13:11:32Z"
updated_at: "2016-06-28T13:43:10Z"
labels: []
---

# Global Disease Burden

Originally a WHO project, IMHE have this data - and seems to be open.

See http://ghdx.healthdata.org/global-burden-disease-study-2013-gbd-2013-data-downloads-full-results

First steps:
- Produce a README here
- Work out whether you can get complete data in bulk or whether it is lots of different files (and how they fit together)

## Comments

### zelima (2016-06-28T13:43:09Z)

@rgrp There are lots of different files eg: for each country, cause, or risk there are different links to download. Download link itself point to the .zip files that contains single .csv file and they are quite big (about 120-150 MB each).
I downloaded and compared data of United kingdom and Georgia: 
- both contain data for 1990, 1995, 2000, 2005, 2010, 2013 years.
- Column titles for both are same in same order eg: 

`cause`, `name`, `risk`, `name`, `age`, `sex`, `year`,`nm_lower`,`nm_upper`,`rt_mean`,`rt_lower` etc.. (don't know what does last four mean yet)
- both of them have unnecessary columns that may be removed eg: `location` and `location_name` - first is some number, second is actual name. so we may remove first one.
- both of them are around 130 MB
