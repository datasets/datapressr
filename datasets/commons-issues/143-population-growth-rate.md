---
number: 143
title: Population growth rate 
state: open
author: Snekili
created_at: "2015-12-15T17:42:59Z"
updated_at: "2019-12-02T19:54:59Z"
labels: ["Type: Indicator"]
---

# Population growth rate 

## Info

Dataset from [United Nation Population Division](https://esa.un.org/unpd/wpp/Download/Standard/Population/)
The 2015 Revision of World Population Prospects is the twenty-fourth round of official United Nations population estimates and projections that have been prepared by the Population Division of the Department of Economic and Social Affairs of the United Nations Secretariat. The main results are presented in a series of Excel files displaying key demographic indicators for each development group, income group, major area, region and country for selected periods or dates within 1950-2100. A publication labelled Key findings and advance tables, which provide insights on the results of this latest revision, is also made available here.
## Data:

[File](https://esa.un.org/unpd/wpp/DVD/Files/1_Indicators%20%28Standard%29/EXCEL_FILES/1_Population/WPP2015_POP_F01_1_TOTAL_POPULATION_BOTH_SEXES.XLS)

**[Licence:](https://shop.un.org/rights-permissions#rp2)**

Databases
Permission is required to reuse content from any and all United Nations’ online platforms and databases (namely, legal and statistical databases).

**Suggested citation:** United Nations, Department of Economic and Social Affairs, Population Division (2015). World Population Prospects: The 2015 Revision, DVD Edition.

## Comments

### Snekili (2015-12-15T18:04:59Z)

@rgrp Data > http://data.un.org/Explorer.aspx?d=GHG&f=seriesID%3aCH4 

https://drive.google.com/drive/folders/0B_KlKJBuuX4aSjFhRGJTaVVIcUU

### Snekili (2015-12-16T19:37:45Z)

Un Population division > http://esa.un.org/unpd/wpp/Download/Standard/Population/

### zelima (2016-06-14T11:07:16Z)

@Snekili I could start packaging this one following http://esa.un.org/unpd/wpp/Download/Standard/Population/ (second link)
Population Growth Rate [file](https://esa.un.org/unpd/wpp/DVD/Files/1_Indicators%20%28Standard%29/EXCEL_FILES/1_Population/WPP2015_POP_F02_POPULATION_GROWTH_RATE.XLSl) has several sheets - which one do we need to package, **estimates**?

### Snekili (2016-06-14T16:26:12Z)

@zelima I think you should use first sheet  - ESTIMATES as that sheet is for Total population, both sexes combined, from 1950-2015

### Snekili (2016-06-14T16:28:19Z)

@zelima I dont know why this sheet is called "Estimates" because it really Historic data, and all of the rest are in fact Estimates from 2015-2100.

### zelima (2016-06-14T20:17:11Z)

@Snekili datapackage is ready you an view it here: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fpopulation-growth-rate
please review and help with README.md :)

### Snekili (2016-06-16T16:21:03Z)

@zelima I've added a comment that we can use in README. BUT Im not sure abut this [licence](https://shop.un.org/rights-permissions#rp2) thingy... What do you think?

### zelima (2016-06-16T17:40:18Z)

@rgrp [rights and permissions page](https://shop.un.org/rights-permissions#rp2) is a little bit unclear about permissions - it says:

> Permission is required to reuse content from any and all United Nations’ online platforms and databases (namely, legal and statistical databases).

but it also says:

> Excerpts from a non-sales publication
> No permission is necessary to reproduce excerpts from a non-sales publication provided that proper credits are given.

Could you please help here?

### gsilvapt (2016-06-16T18:13:51Z)

Sorry to interrupt: We have this package online that also contains population data: https://github.com/datasets/registry/issues/101

It is not automated, as the source is not an API or similar that could allow me to automate the process. But we can probably take care of that in this package.

### zelima (2016-06-17T07:25:25Z)

@gsilvapt thanks for comment. 
@Snekili in case we deal with license part, do we need to have population growth rate separately?
Please consider these differences between them (I'll call them data1[mine] and data2[Gsllvapt's], ):

**Data1** contains growth rate from 1950 to 2015, for every _5 year_
**Data2** contains growth rate from 1990 to 2009, for every _1 year_

@gsilvapt this is what I saw with first glance, maybe you'd add something else?

### gsilvapt (2016-06-17T11:53:16Z)

@zelima The source from data 2 package is not an API or something that will be updated frequently, AFAIK. Hence, it may make sense to use only the UN's because we can automate the process of maintaining and curating the data set. 

We can also write a secondary Python script to see if the data match in both data sets and, if not, target the differences. We can keep it separated and just add a note saying data2 set is yearly growth rates from 1990 to 2009 and data1 is 5 year intervals of growth rates from 1950 to 2015, if that makes any sense.

### rufuspollock (2016-06-23T18:30:57Z)

@Snekili @zelima may also be worth comparing this to the World Bank one. What is the difference between this and world bank population (growth) datasets?

### zelima (2016-06-24T11:01:17Z)

@rgrp World bank data contains annual growth rate from 1960 to 2015. And I think it is cleaner and tidier then 2 previous 

http://data.worldbank.org/indicator/SP.POP.GROW
