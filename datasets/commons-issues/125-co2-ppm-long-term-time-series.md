---
number: 125
title: CO2 PPM (long-term time series)
state: open
author: rufuspollock
created_at: "2015-11-23T16:08:40Z"
updated_at: "2019-12-02T19:54:59Z"
labels: ["Topic: Climate"]
---

# CO2 PPM (long-term time series)

We already have 50 years of CO2 #56 but what about much longer time series e.g. using ice core data. What's the best data we have there and where's it from?

## Comments

### kiliakis (2015-12-01T22:16:22Z)

@rgrp 
- vostok ice core [CDIAC](http://cdiac.ornl.gov/ftp/trends/co2/vostok.icecore.co2)
  has data about co2 concentration from 400k years ago
- [NOAA](http://www.ncdc.noaa.gov/data-access/paleoclimatology-data/datasets/ice-core) has also co2 concentration data from 800k years ago

### rufuspollock (2015-12-02T12:53:18Z)

@kiliakis can we have both in one data package? In any case, just pick easiest and start with that one.

### kiliakis (2015-12-02T22:18:54Z)

@rgrp  Here is a first version containing dataset from vostok ice core: https://github.com/kiliakis/co2-ppm-ice-core

Links from data.okfn.org:
- [validation results](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Fco2-ppm-ice-core%2Fmaster%2Fdatapackage.json)
- [view link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fco2-ppm-ice-core)

### rufuspollock (2015-12-03T07:43:20Z)

@kiliakis perfect though i note the data table does not display because of the column title. That's a bit of a bug in viz but also reflects that column name has "nasty" characters - could i ask that we rename the column to something simple like "Age" and then have the full info in the description (as you already have)?

@pdehaye do you want then to review and we merge in?

### kiliakis (2015-12-03T10:14:39Z)

Okay, I fixed the problem with the column names. Here is the view link:
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fco2-ppm-ice-core

### rufuspollock (2015-12-03T17:17:34Z)

@kiliakis looking pretty good - added a few comments in the issues of that repo. Now its time to transfer across to datasets.

@pdehaye please also cast your eye over for improvements.

### rufuspollock (2015-12-03T19:56:49Z)

@kiliakis also strictly to satisfy this issue we'd want a nice dataset merging this dataset with some other co2 measures to get a nice continuous dataset up to the present with dates in a nice format. To be clear i think we want to keep vostok dataset but have another dataset like `co2-ppm-longterm` or something.

### kiliakis (2015-12-05T13:57:33Z)

@rgrp I can merge the ice core dataset together with co2-ppm dataset and create the co2-ppm-longterm. There will be a gap between 2400 years ago ( end of vostok  ice core data) and 1959 AD (start of annual co2 ppm measures ).

### kiliakis (2015-12-09T11:16:26Z)

@rgrp I think the merging of co2-ppm and co2-ppm-ice-core into co2-ppm-longterm is completed. 
- Validation link: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Fco2-ppm-longterm%2Fmaster%2Fdatapackage.json
- View link: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fco2-ppm-longterm#resource-co2-mm-mlo
- datapackage: https://github.com/kiliakis/co2-ppm-longterm

Please review.
I am facing a problem when trying to add two graphs from two different resources to the data package viewer. Is this possible?

### pdehaye (2015-12-10T23:05:25Z)

I have looked at it in details. 

The "Trends" and "Historial record" [here](https://github.com/kiliakis/co2-ppm-longterm/blob/master/README.md#trends) are a bit confusing as I didn't see these terms used elsewhere. 

I don't know about two graphs from two different resources. @rgrp  ?

Otherwise it looks good!

### kiliakis (2015-12-11T06:52:34Z)

@pdehaye I see what you mean. These terms are firstly introduced in the first paragraph of the README file and then used in the data description, citations and sources. I can change it though. @rgrp , @pdehaye Do you have any suggestions?

### pdehaye (2015-12-11T07:31:37Z)

Actually, it is fine to use Trends and Historical series, but the first paragraph needs a bit of reorganisation and stream lining. In the first paragraph, do a Markdown list, and make sure in each it is the terms "Trends" and "Historical series" that appear first.

### rufuspollock (2015-12-12T19:32:02Z)

@kiliakis merging in the co2-ppm does not make much sense to me tbh:
- the scales are massively out
- we end up with duped data which is never great

At most i would add in like the 1950 datapoint and the 2010 datapoint or something (but frankly i wouldn't botther).

Also when i look at the datasets page i just see the co2-ppm graph.

Overall: I would suggest we stick with historical data here and not dupe in the co2-ppm stuff (i agree we may want to rename co2-ppm to something more meaningful but lets make that another issue)

### kiliakis (2015-12-14T20:27:59Z)

@rgrp ok no problem :)
