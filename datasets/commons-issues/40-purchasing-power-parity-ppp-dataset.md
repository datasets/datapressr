---
number: 40
title: Purchasing power parity (PPP) dataset
state: closed
author: rufuspollock
created_at: "2013-12-26T14:21:18Z"
updated_at: "2015-02-14T07:00:40Z"
closed_at: "2015-02-14T07:00:40Z"
labels: ["Type: Indicator", "Type: Reference", "Priority: ★★★"]
---

# Purchasing power parity (PPP) dataset

Source data series would be one or more of:
- PPP conversion factor (GDP) to market exchange rate ratio - http://data.worldbank.org/indicator/PA.NUS.PPP
- PPP conversion factor, GDP (LCU per international $) - http://data.worldbank.org/indicator/PA.NUS.PPP

## Comments

### sxren (2015-01-11T09:25:19Z)

Duplicate links above.  http://data.worldbank.org/indicator/PA.NUS.PPPC.RF looks right for PPP conversion factor (GDP) to market exchange rate ratio. OK? Thanks.

### rufuspollock (2015-01-11T15:11:31Z)

@sxren good spot. Key question is which we want (we probably want to pick one and one only here).

### sxren (2015-01-11T16:16:56Z)

The dataset linked to in the first comment is the PPP dataset.

The dataset linked to in my comment just above is the ratio of PPP conversion factor to market exchange rate.

Since the open issue is for the Purchasing power parity (PPP) dataset, how about going with that; i.e., the PPP conversion factor, GDP (LCU per international $) dataset at http://data.worldbank.org/indicator/PA.NUS.PPP.

### sxren (2015-01-11T17:23:53Z)

~~Or not. The PPP column group at http://stats.oecd.org/Index.aspx?DataSetCode=PPPGDP is equivilent to http://data.worldbank.org/indicator/PA.NUS.PPPC.RF; i.e. price level ratio of PPP conversion factor (GDP) to market exchange rate.~~

~~So, a PPP conversion factor is used to produce a PPP. Does that make sense?~~

**Correction. The PPP column group at http://stats.oecd.org/Index.aspx?DataSetCode=PPPGDP is PPP conversion factors.**

Here is a useful FAQ: http://www.oecd.org/std/prices-ppp/purchasingpowerparities-frequentlyaskedquestionsfaqs.htm

The UN also has PPP conversion factor data:
- http://data.un.org/Data.aspx?d=MDG&f=seriesRowID:699
- http://mdgs.un.org/unsd/mdg/SeriesDetail.aspx?srid=699

(Both links are to the same data.)

### sxren (2015-01-11T18:13:34Z)

Unrelated to the previous comments, in either case, is it appropriate to tidy the data? That is, move the year values into a year column instead of using year values as column names? Thank you.

### rufuspollock (2015-01-12T10:15:46Z)

@sxren yes totally appropriate - normalizing the date (e.g. "unpivoting") is standard practice as part of the data packaging.

### sxren (2015-01-15T12:29:49Z)

initial commit of PPP conversion factor, GDP (LCU per international $) dataset pushed to https://github.com/sxren/ppp-gdp.

in the example at http://data.okfn.org/doc/data-package the license for the example is odc-pddl. is that the norm for world bank data?

thanks!

### sxren (2015-01-17T12:22:35Z)

@rgrp i went with PDDL

the UN data above is for PPP conversion factor, private consumption (vs GDP). so, i'm not planning to include it in this data package.

i'm open to suggestions for a view.

### rufuspollock (2015-01-18T22:30:26Z)

@sxren looks really good. Some quick comments:
- Applying PDDL is appropriate (we can note this is a license for our work and that source data may differ - if possible pointing to that source data license).
- Suggest we drop all NA data - it just clutters up the DB and is a pain for processors including the view system. Happy to hear differently if others think NA is essential (but we should think about how we encode if we want to keep)
- Re view: it is tough for these kind of datasets as we really need to "pivot" before we present. Adding simple pivot support into views is something on our list for data.okfn.org - https://github.com/okfn/data.okfn.org/issues/141

Note: I may be afkb for next few days so expect slower responses - please keep forging ahead with the great work you are doing.

### sxren (2015-02-08T21:04:59Z)

@rgrp
- is there some canned text available for noting the data source license may differ?
- NA rows dropped

would it be cool if i add this to the core datasets list and move it to the datasets registry? one change: i'll call the project ppp vs ppp-gdp (the name of my current repo).

thank you.

### rufuspollock (2015-02-08T22:13:50Z)

@sxren no canned response but I note that http://data.okfn.org/data/core/language-codes#readme had some reasonable language.

Go ahead on finalizing this and making this "core".

PS: you can now reload data.okfn.org db to pull in updated data by visiting data.okfn.org/admin/reload
