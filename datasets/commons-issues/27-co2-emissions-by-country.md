---
number: 27
title: CO2 emissions (by country)
state: closed
author: rufuspollock
created_at: "2013-08-16T08:26:53Z"
updated_at: "2018-02-01T10:22:58Z"
closed_at: "2018-01-30T07:30:30Z"
labels: ["Type: Indicator", "Topic: Climate"]
---

# CO2 emissions (by country)

Time series of C02 emissions (globally and by country).

Time range: as long as possible and as up to date as possible
## Datasets

Think we have multiple:
- `co2-{geo}`
  - total and per capita emissions at level `{geo}` which is one of `global` or `national`
- `co2-fossil-{geo}` where geo is one of `global | national | regional`
  - global: http://cdiac.esd.ornl.gov/trends/emis/tre_glob_2010.html
  - country data is at http://cdiac.esd.ornl.gov/trends/emis/tre_coun.html
  - preliminary estimates for 2011/2012 - http://cdiac.ornl.gov/ftp/trends/co2_emis/Preliminary_CO2_emissions_2012.xlsx
- `co2-fossil-gridded` - http://cdiac.esd.ornl.gov/epubs/ndp/ndp058/ndp058_v2013.html
## Sources

http://cdiac.esd.ornl.gov/
## Data Should Look Like

Global:

```
Year, Emissions, .... could have other columns for more fine-grained breakdown
```

Country:

```
Year, Country, Emissions, Per Capita Emissions
```

## Comments

### rufuspollock (2014-03-08T16:30:17Z)

@NickBarnes any idea on best sources for these?

### NickBarnes (2014-03-08T18:54:48Z)

CDIAC, I think.

On 8 Mar 2014, at 16:30, Rufus Pollock notifications@github.com wrote:

> @NickBarnes any idea on best sources for these?
> 
> —
> Reply to this email directly or view it on GitHub.

### rufuspollock (2014-03-08T20:51:20Z)

@NickBarnes thanks - really appreciated. I'm assuming primary data is this file:

http://cdiac.esd.ornl.gov/ftp/ndp030/CSV-FILES/global.1751_2010.csv

Preview: http://datapipes.okfnlabs.org/csv/head/html?url=http://cdiac.esd.ornl.gov/ftp/ndp030/CSV-FILES/global.1751_2010.csv

<img src="http://webshot.okfnlabs.org/api/generate?url=http%3A%2F%2Fdatapipes.okfnlabs.org%2Fcsv%2Fhead%2Fhtml%3Furl%3Dhttp%3A%2F%2Fcdiac.esd.ornl.gov%2Fftp%2Fndp030%2FCSV-FILES%2Fglobal.1751_2010.csv&width=1024&height=768" />

### rufuspollock (2014-03-09T21:10:44Z)

Global data done. See:
- https://github.com/datasets/co2-fossil-global 
- http://data.okfn.org/data/co2-fossil-global

### rufuspollock (2015-11-23T15:51:14Z)

Only global done. Reopening for by country.

Also CDIAC data is fossil fuels only. What about total CO2 e.g. from transport etc.

### kiliakis (2015-12-01T22:03:35Z)

Hi @rgrp , annual co2 fossil-fuel per country data are uploaded in my git: https://github.com/kiliakis/co2-emissions .

Links I used for Data package validator and viewer:
- Validation link: https://raw.github.com/kiliakis/co2-emissions/master/datapackage.json
- View link: https://raw.github.com/kiliakis/co2-emissions/master

A snapshot from data package viewer: 

![screenshot from 2015-12-02 00 01 49](https://cloud.githubusercontent.com/assets/11835649/11515725/0a5ee2e8-9888-11e5-9c4a-15451a38ccca.png)

Waiting for any feedback.

### pdehaye (2015-12-01T22:26:16Z)

Put in some pull requests.

### rufuspollock (2015-12-02T13:18:25Z)

@kiliakis as a tip it is best to actually link the validation results e.g. http://data.okfn.org/tools/validate?url=...

### Snekili (2015-12-16T19:47:38Z)

Other GHG data > http://data.un.org/Explorer.aspx?d=GHG&f=seriesID%3aCH4

https://drive.google.com/drive/folders/0B_KlKJBuuX4aNjFfVDYxY2k2dnc

### zelima (2016-04-20T19:19:06Z)

@rgrp is this one done? if not, I can finish..

preview

```
Year,Country,Total Emissions,Solid fuel,Liquid fuel,Gas fuel,Cement,Gas flaring,Per capita,Bunker fuels,
1949,Afghanistan,4,4,0,0,0,0,0,0
...
2011,Afghanistan,3341,1174,2077,84,5,0,0.1,1,9
1933,Albania,2,0,2,0,0,0,0,0
```

### rufuspollock (2016-04-21T08:39:41Z)

@kiliakis could you transfer this is to the datasets organization and then we can take it from there.

@zelima atm @kiliakis has already done most of this so let's get his repo transferred and then we can see.

### zelima (2016-04-21T10:26:16Z)

@rgrp got it

### zelima (2016-07-27T11:44:57Z)

@kiliakis Any thoughts about transferring? Maybe some  help needed?

### kiliakis (2016-07-27T11:56:02Z)

@zelima I've already transferred that :) https://github.com/datasets/co2-emissions

### zelima (2016-07-27T13:20:05Z)

@kiliakis Oh, great! 
Then we should close this one, right @rgrp ?

### rufuspollock (2016-08-01T15:24:58Z)

@zelima yes, though first this should be live on data.okfn.org and we should tweet about it /cc @pdehaye (and when tweeting we usually want a nice image ...)

When closing you want to note something like:

```
FIXED

{link to live on data.okfn.org}
{link to github repo}
```

### zelima (2016-08-02T08:11:24Z)

@pdehaye we can use this image for tweet: 
![co2emissions](https://cloud.githubusercontent.com/assets/15143785/17321525/0af49f94-58aa-11e6-9bc3-1f326979cb5e.png)

### zelima (2016-08-02T08:11:38Z)

Link to repo: https://github.com/datasets/co2-emissions
Link to live: http://data.okfn.org/data/core/co2-fossil-global

### rufuspollock (2016-08-03T09:30:26Z)

@zelima but the two links you just provided don't match - the former is the _new_ dataset and the latter data.okfn.org link is to a different data package ...

### zelima (2016-08-03T10:18:29Z)

@rgrp you are right, I've been mistaken.
So the correct links are:
Link to repo: https://github.com/datasets/co2-emissions
Link to live: http://data.okfn.org/data/kiliakis/co2-fossil-by-nation

@pdehaye image above is useless. Sorry for that. Unfortunately we don't have graph view for this one - only grid view.

### rufuspollock (2016-08-22T07:07:10Z)

@zelima what would it take to get a graph view for this new dataset?

### zelima (2016-08-22T09:27:31Z)

@rgrp There are different emission values for multiple countries for the single year. So we need to group values by country and by year too. (probably by different emission types as well) Like in this example https://vega.github.io/vega-editor/?mode=vega&spec=stocks
As much as I know Recline library does not support this kind of transforms. So we need to use different library for showing graphs like Vega.

### rufuspollock (2018-01-29T11:31:53Z)

@AcckiyGerman can you look into estimate for getting co2-emissions dataset completed and published as a core dataset. /cc @zelima

### zelima (2018-01-29T14:02:11Z)

@AcckiyGerman This is now possible by setting correct configuration in `views`.  See this datapackage.json  for example https://pkgstore-testing.datahub.io/81429cbbddcfb180f54c142fac32f83b/population-growth-estimates-and-projections/27/datapackage.json

### AcckiyGerman (2018-01-29T19:16:46Z)

@rufuspollock 
https://github.com/datasets/co2-emissions has been updated:
- latest link on a source FTP (till 2014)
- script and dp.json to pass the datahub validator
- readme extended

On a datahub: https://datahub.io/AcckiyGerman/co2-fossil-by-nation
@zelima take a glance plz and I'll push it under the core user.

#### P.S. I decided not to add views because:
- here is 220 countries in the dataset
- we already have the graph re global co2-emissions (which comes from the same source) http://datahub.io/core/co2-fossil-global

### zelima (2018-01-30T05:01:10Z)

@AcckiyGerman I Agree re views. Looks good to go

### AcckiyGerman (2018-01-30T06:27:07Z)

FIXED
Global co2 - http://datahub.io/core/co2-fossil-global
per Nation - https://datahub.io/core/co2-fossil-by-nation
Core-list is updated

### zelima (2018-01-30T07:13:10Z)

@AcckiyGerman Great! let's close

### zelima (2018-01-30T07:38:35Z)

@AcckiyGerman is core list updated BTW?

### AcckiyGerman (2018-01-30T07:58:02Z)

Core-list updated!

### rufuspollock (2018-01-31T10:43:14Z)

@AcckiyGerman 

I'm confused: what happened to co2-emissions?

I'd like a graph if possible on co2-fossil-by-nation - maybe pick some big emitters e.g. US, China.

### AcckiyGerman (2018-01-31T10:52:55Z)

@rufuspollock 
- https://github.com/datasets/co2-emissions  on a github
- http://datahub.io/core/co2-fossil-global  is the same dataset on a datahub

Funny that before you asked I didn't see that url names are different.
That seems the 'co2-fossil-global' name comes from the `datapackage.json`, while the original github name is co2-emissions, I'm going to rename it (move the repo) now, if you are not objecting.

### rufuspollock (2018-02-01T10:22:58Z)

@zelima @AcckiyGerman that does not really make sense to me:

https://github.com/datasets/co2-emissions
https://github.com/datasets/co2-fossil-global

Both exist on github and are different so they can't be the same? Do you mean that co2-emissions is `co2-fossil-by-nation` (in which case yes we should rename github repo to reflect data package name).

Note: for future `co2-emissions-global` and `co2-emissions-country` would have been better names (and i set the names). At the moment we can't do renaming on datahub so we should leave names as is.
