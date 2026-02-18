---
number: 103
title: Government spendings for OECD countries, COFOG nomenclature
state: open
author: Yannael
created_at: "2015-07-05T11:27:46Z"
updated_at: "2019-12-02T20:08:41Z"
labels: ["Type: Indicator", "Format: Tabular"]
---

# Government spendings for OECD countries, COFOG nomenclature

@rgrp They can be found at http://stats.oecd.org/
(in National Accounts/Annual National Accounts/General Government Accounts/COFOG)

What do you think?

## Comments

### rufuspollock (2015-07-06T09:06:11Z)

@Yannael _great_ idea - let's do it.

### Yannael (2015-07-12T14:46:24Z)

@rgrp 

See preliminary data in the following links, for UK and Belgium
- [Package](https://github.com/Yannael/government-expenditure-cofog)
- [Validate](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2FYannael%2Fgovernment-expenditure-cofog)
- [view](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2FYannael%2Fgovernment-expenditure-cofog#resource-government-expenditure-cofog-belgium)

I am using one file per country. However, this will probably become messy on the DP view page once all OECD countries are added.

What do you think, any other suggestions?

### rufuspollock (2015-07-13T09:16:48Z)

Great stuff.

I definitely think we want to consolidate into one file and normalizing both countries and years i.e. data structure would be like the following (and we would have one file):

```
country,year,cofog-1,cofog-2,amount,currency
```

### Yannael (2015-07-13T11:15:14Z)

@rgrp ok, I will go for this structure

Regarding data, I compared OECD data with those on the wheredoesmymoneygo website, i.e. for UK in 2010

http://wheredoesmymoneygo.org/
which is retrieved from
https://openspending.org/ukgov-finances-cra
http://datahub.io/dataset/ukgov-finances-cra

Data is not the same as those of OECD.

For example, defence expenditure are about 35,319 billions on WDMMG, whereas the amount reported at OECD is 40,696 billions (to get data from OECD go to stats.oecd.org, then national accounts/Annual national accounts/General governments accounts/COFOG, and select Defence in Function)

I would like to make sure the OECD is up to date before proceeding further (note: for Belgium, this is the case, OECD data matches data from the National Bank of Belgium).

In http://datahub.io/dataset/ukgov-finances-cra, I looked at XLS files related to 2010, but coud not understand how the spending given at https://openspending.org/ukgov-finances-cra were computed.

Any idea?

### rufuspollock (2015-08-01T09:58:15Z)

@Yannael sorry - i missed your comment somehow. Note the COFOG data for Where Does My Money Go can be found in a data package at https://github.com/openspending/dataset-cra

This may not be the exact same as the data on Where Does My Money Go as I think the github dataset may have later data - but feel free to check. For now, I'd suggest we get this in. BTW as package name what do you think of:

`oecd-gov-expenditure-cofog`

### Yannael (2015-08-09T19:02:53Z)

@rgrp Thanks, I was away the last two weeks, and will get back to this shortly

### pdehaye (2015-12-01T15:14:08Z)

Hey @Yannael, how is the progress here?

### Yannael (2015-12-01T18:56:56Z)

Definitely on the TODO list, will get back to it this month !
