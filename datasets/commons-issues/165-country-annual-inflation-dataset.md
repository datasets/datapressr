---
number: 165
title: Country Annual Inflation Dataset
state: closed
author: rufuspollock
created_at: "2016-03-01T20:25:37Z"
updated_at: "2016-04-08T11:03:54Z"
closed_at: "2016-04-02T20:54:19Z"
labels: []
---

# Country Annual Inflation Dataset

We already have CPI in #18 but did not do inflation. Think we want this.

Name: `inflation` (could be `inflation-annual` but do not think we need the distinction)

Recommended data sources are World Bank e.g. they have these two:
- http://data.worldbank.org/indicator/NY.GDP.DEFL.KD.ZG - GDP deflator
- http://data.worldbank.org/indicator/FP.CPI.TOTL.ZG - consumer prices

Suggest we take both and have them both in the dataset as separate data files.

## Comments

### rufuspollock (2016-03-01T20:36:53Z)

@zelima please take a look and set out the expected csv headings you would create and the file names. Also any questions about scripting and then we can go ahead.

### zelima (2016-03-02T19:06:49Z)

@rgrp checked both GDP deflator and CPI inflation datas. 
- Download links for both of them provide .zip files.
- Both zip files contain 1 xml and 3 csv files. Think only one has useful data.
- Both useful csv files have pretty much same structure as #18 , if not count 4 additional rows on top and "indicator name", "indicator code" columns, which contain only one information.
- So for headings we may use same structure as in CPI

### _Country name, Country code, Year, Inflation_

For extracting data from zip files [this](https://docs.python.org/2/library/zipfile.html) library may be useful.

### rufuspollock (2016-03-03T08:15:20Z)

@zelima sounds good. Can you please:
- set out the csv headings you expect to have in the resulting files
- post the links to the zip files (also can you really only get zips - i.e. it is not possible to get CSV files directly?)

### zelima (2016-03-03T15:44:59Z)

Found links that download CSV files directly

http://api.worldbank.org/indicator/NY.GDP.DEFL.KG.ZG?format=csv
http://api.worldbank.org/indicator/FP.CPI.TOTL.ZG?format=csv

Heading for inflation by GDP deflator:
Country name, Country code, Year, Inflation(GDP Deflator)

Heading for inflation by consumer prices:
Country name, Country code, Year, Inflation(Consumer Prices)

It's possible to use the same exact code for retrieving this data, by changing "cpi_source" variable and making process() function yielding Heading we want, inside script.

So what is my next step? 
- should I write 2 new scripts? 
- we must create 2 new repositories, or we are updating existing one?

### rufuspollock (2016-03-03T16:04:11Z)

For each file i would same headings:

`Country, Country Code, Year, Inflation`

I would keep the description of the inflation type (and of other columns) in the `datapackage.json` field descriptions in the schema for this resource.

In terms of code I would just do this from scratch since it is so simple.

I would suggest this Inflation data is a new Data Package (and repository) but we put **both** inflation series in this data package but in different files. The Data Package will look like:

```
README.md
datapackage.json
data/inflation-consumer.csv
data/inflation-gdp.csv

# optionally if we transform the World Bank data we may want to cache (and store) their source data into the archive directory e.g.
archive/NY.GDP.DEFL.KG.ZG.csv
archive/FP.CPI.TOTL.ZG.csv
```

### zelima (2016-03-04T18:59:16Z)

https://github.com/zelima/inflation

Please check new repository.

**double check**
- datapackage.json
- README.md
- and script

Since there where 2 different files to retrieve, I'm not sure I did everything as needed. (especially datapackage.json)

### rufuspollock (2016-03-05T17:11:23Z)

@zelima can you follow instructions at http://data.okfn.org/doc/core-data-curators#3-quality-assurance in particular can you post a validation link for the data package and a "view" link here. Thanks :-)

### zelima (2016-03-07T20:45:09Z)

I have a problem with validation and even view:
- in the validation part when I pass the [the link to datapackage](https://github.com/zelima/inflation/blob/master/datapackage.json) it throws  "message": "Error loading the datapackage.json file. HTTP Error code: 404"
- in the view part it says: "There was an error. datapackage.json is invalid JSON. Details: Unexpected token <".
  Could you help with this?

And Also I'd like to say few words about script:
- When no argument is passed after ./script.py  in terminal- it scratches data for both files.
- When file name and source are passed - scratches for source that is passed and only. 
- The problem is when only filename is passed - cause since there are 2 links, which one should I pass as default?

### pdehaye (2016-03-07T22:09:11Z)

This is the correct link to validate:
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzelima%2Finflation%2Fmaster%2Fdatapackage.json

(you need to validate the raw file, not the github page for that file,
subtle difference)

The error is with multiple sources, which are not to be listed as an array
within a record, but an array of records. See
https://github.com/datasets/IMO-IMDG-Codes/blob/master/datapackage.json

As for the script, I am not sure I understand. What is filename? If only
filename is passed, why not use both links?

Don't hesitate to ask more questions!

On Mon, Mar 7, 2016 at 9:45 PM, zelima notifications@github.com wrote:

> I have a problem with validation and even view:
> - in the validation part when I pass the the link to datapackage
>   https://github.com/zelima/inflation/blob/master/datapackage.json it
>   throws "message": "Error loading the datapackage.json file. HTTP Error
>   code: 404"
> - in the view part it says: "There was an error. datapackage.json is
>   invalid JSON. Details: Unexpected token <" Could you help with this?
> 
> And Also I'd like to say few words about script:
> - When no argument is passed after ./script.py in terminal- it
>   scratches data for both files.
> - When file name and source are passed - scratches for source that is
>   passed and only.
> - The problem is when only filename is passed - cause since there are
>   2 links, which one should I pass as default?
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/165#issuecomment-193442182.

### zelima (2016-03-08T06:52:51Z)

@pdehaye Thanks for help.

Under filename I mean the name of the CSV file you want to output. 
If that parameter is passed by user in terminal like this:
`$ ./inflation2datapackage.py -o somefilename.csv`
In this case script should scratch data from default source and fill the somefilename.csv file with data. This would work if we were scratching only one type of inflation, but since there are two, source for them is two as well. So by default I'm passing list of both of sources. 

So for now, if filename is passed by user (without optional source parameter) since script can not decide by itself with which source it should fill, it ignores it and outputs data for both sources with default file names - 'inflation-consumer.csv' and 'inflation-gdp.csv'.

It does not hang or throw error, just does not actually do what user expects.

### zelima (2016-03-08T08:52:34Z)

@rgrp 
[validation link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzelima%2Finflation%2Fmaster%2Fdatapackage.json)

[View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzelima%2Finflation%2Fmaster%2Fdatapackage.json)

### pdehaye (2016-03-10T13:59:39Z)

@zelima I think the issue with the script is fine, as long as it is documented properly. Possibly you could just use 
`./inflation2datapackage.py -o somefilename`
with the understanding that this could generate `somefilename.csv`, `somefilename-source1.csv` or `somefilename-source2.csv`

### pdehaye (2016-03-10T14:06:52Z)

@zelima one of the headers, in both files, is "Country", not "Country Name". There should be consistency between datapackage.json and the csv files. Otherwise it looks good to go. 

After you fix this, the next step is to transfer ownership f your github repo to the datasets/ organisation. In order to enable this, I have invited you as a member. Go to https://github.com/orgs/datasets and look there for acceptation of invite. Then you can transfer ownership through the settings page of your inflation repo. Ping me here when that's done, or ask for help if needed!

### pwalsh (2016-03-10T16:39:24Z)

can't wait for this one!

### zelima (2016-03-10T17:04:19Z)

@pdehaye datapckage.json updated, as well README.md. Plus script is updated with proper comments. 
I accepted invitation and forked repositories. Is that enough to transfer ownership, or there is something else I should do? If so please give hint.
Thank you

### zelima (2016-03-10T17:15:43Z)

@pdehaye Never mind, already  done. I deleted forked repository and transferred ownership. I put tick on both - **curators** and  **managing curators**

### rufuspollock (2016-03-11T08:10:54Z)

@zelima great and i've added a couple of issues in that repo for minor things we could improve.

### pdehaye (2016-04-02T20:54:19Z)

Added to the registry, tweeted, etc so I am now closing.

### pdehaye (2016-04-02T20:54:30Z)

@zelima Thanks!

### pdehaye (2016-04-02T22:13:16Z)

The dataset has landed [here](http://data.okfn.org/data/core/inflation)

### pwalsh (2016-04-03T05:08:49Z)

Hey @rgrp @pdehaye I just looked at the dataset. I was very confused reading the dataset because the first batch of data in the file is not for countries at all: it is some pan-national region grouping. After those entries, there are a bunch of countries, but it might be good to either:
1. Remove the non-country rows (presuming this is supposed to be inflation per country)
2. Associate countries with these groups through some parent-child column

### rufuspollock (2016-04-03T14:03:13Z)

@pwalsh good feedback.

Tthose data points came direct from original world bank data. I'm not certain about actually removing it. As a user what's your concern exactly? If we remove from main set we probably want to keep but in separate file.

@zelima we won't do anything here until we have clarity :-)

### pwalsh (2016-04-04T05:56:01Z)

@rgrp there is just an element of surprise: the data set is labeled as annual inflation per country, yet reading the CSV file, you are first confronted with a large amount of information that is not related to countries. I'd say to keep this info, and associate countries to these regional groupings (presuming, of course, that it is possible from the source data), and make it clear that this other information is in here, via the description perhaps.

### rufuspollock (2016-04-08T11:03:54Z)

@pwalsh noted. At the moment we are literally converting directly from source so not sure the regional grouping info is in there per se.

Perhaps we add something to the README for the present.
