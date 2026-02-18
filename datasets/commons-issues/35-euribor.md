---
number: 35
title: Euribor
state: closed
author: rufuspollock
created_at: "2013-11-24T13:10:14Z"
updated_at: "2015-05-30T07:07:41Z"
closed_at: "2015-05-30T07:07:41Z"
labels: ["Type: Indicator", "Priority: ★★★"]
---

# Euribor

http://www.euribor-rates.eu/euribor-rates-by-year.asp

We probably don't need all 15 rates they used to have and which they are now reducing:

> Until November 1st 2013 Euribor-EBF published 15 Euribor rates (1-3 weeks en 1-12 months) daily (working days only). As of November 1st 2013 the number of Euribor rates is reduced to 8 (1-2 weeks, 1, 2, 3, 6, 9 and 12 months). This adjustment is a consequence of the problems which arose last couple of years when determining the Euribor rates. An EBA/ESMA report which was published January 2013 recommends to calculate and publish only those Euribor rates which are used by banks on a frequent basis. The rationale being that is easier to calculate a reliable rate if there are many transactions for a specific rate (maturity).

I suggest we record the following rates at monthly intervals (which is what you get from historical data)
- 1-week
- 1-month
- 3-month
- 1-year

Though may turn out getting all 8 is same effort so may as well.

## Comments

### ThomasG77 (2015-01-13T18:54:59Z)

The cases to get:

**Current date**

Scrapping of main page
http://www.euribor-rates.eu/euribor-rates-by-year.asp to get result for using first column (01-02-2015 now)
for 
- 1-week
- 1-month
- 3-month
- 1-year (12 months)

Launch this task one time per month

**Get historical data**

For 2014, we will have missing data for the 3 first months 2014
At http://www.euribor-rates.eu/euribor-rate-1-week.asp, the middle table "Rate on first day of the month" only shows 2014 data from April to now (because the table is 10 rows based...)

For older data, we need to follow URL pattern like below and scrap table (one shot) for each year

_One week_
http://www.euribor-rates.eu/euribor-2013.asp?i1=1&i2=1

_One month_
http://www.euribor-rates.eu/euribor-2013.asp?i1=4&i2=1

_Three months_
http://www.euribor-rates.eu/euribor-2013.asp?i1=6&i2=1

_Twelve months_
http://www.euribor-rates.eu/euribor-2013.asp?i1=15&i2=1

### rufuspollock (2015-01-13T19:00:21Z)

@ThomasG77 good data sleuthing! Do you want to have a go at scraping this. Scripts are preferred in python or nodejs.

### ThomasG77 (2015-01-14T01:10:55Z)

Hi,

Part for history done at https://github.com/ThomasG77/euribor
Now 2014 available so only one month missing

My remaining concerns are the data structure, the missing descriptions in README and in datapackage.json

You will see below an extract from one of my csv file

```
date,rate(%),maturity_level,year
02-01-2014,"0,183",1_week,2014
03-02-2014,"0,184",1_week,2014
03-03-2014,"0,184",1_week,2014
01-04-2014,"0,196",1_week,2014
02-05-2014,"0,225",1_week,2014
02-06-2014,"0,244",1_week,2014
01-07-2014,"0,051",1_week,2014
01-08-2014,"0,049",1_week,2014
01-09-2014,"0,031",1_week,2014
```

I have embed the `year` in a column whereas this info is also in first column `date`.
What do I do?
I have to remove the year with 2014 value? I keep it and explode the first column by month and day?
Do I concat the various files by maturity?
The header and order for columns need to be modified?

### rufuspollock (2015-01-14T08:10:41Z)

@ThomasG77 great work - looking really good.
- year: is year in original file? I would just go with date and leave year out.
- date: should be ISO 8601 formatted where possible e.g. `2014-07-01` rather than than `01-07-2014`.
- rate: decimals should be done with decimal point not commas. Also suggest column name is just `rate` and '%' info goes in the description of that column in the data package metadata.
- I would not concat files of different maturity but have one file for each maturity (before doing that can I suggest you post here what your planned list of files with their names would be).

### ThomasG77 (2015-01-14T23:29:14Z)

- year included at the moment but I would remove according to your feedback
- date: not done but easy to change
- rate: need to do search/replace the commas with decimal point
- for naming convention adopted at the moment, see https://github.com/ThomasG77/euribor/tree/master/data

In fact, I get informations for each maturity for each year (it also includes the data for the 15 rates whereas now it's only 8)

### rufuspollock (2015-01-15T17:57:20Z)

@ThomasG77 it would be good to cut down the number of files substantially (usefulness to users will trump comprehensiveness for us I think). In general, we should have continuous time series in one file (even if the source does not provide that). So, for each maturity type / granularity can we get that in one single file (and have continuous time series in that) - i.e. all time series data for monthly 3m euribor would be in one file. How many data files will that give us (if still a lot we might prune further in terms of granularity and maturity).

### ThomasG77 (2015-01-19T22:54:06Z)

@rgrp Changes have been done.

The changes are:
- removing the last date column
- change data to make it conform to iso 8601
- rate are dot-based instead of comma-based
- aggregating data by maturity level

The last operation, the aggregation is done after retrieving, with a new  script file.
We have in total 15 files as I get data for all maturity levels including before 2013.
- 1 week
- 2 weeks
- 3 weeks
- 1 month
- 2 months
- 3 months
- 4 months
- 5 months
- 6 months
- 7 months
- 8 months
- 9 months
- 10 months
- 11 months
- 12 months

The result is available at https://github.com/ThomasG77/euribor/tree/master/data
IMO, everything is ok at data level.

I need to complete the datapackage.json and the README.
We can always discuss about naming conventions for files.
For dealing with regex things for concatenation, naming was before
`euribor_9_months_2006_by_month.csv` and is now `data_euribor_01_month_1999-2014_by_month.csv`.

I will also have to make the small script for the ongoing year but no data before february so no need to hurry ;)

### rufuspollock (2015-01-21T06:43:30Z)

@ThomasG77 this is looking _great_.

Let us know when README and datapackage.json are ready (can I suggest linking to validator output and view for your Data Package - http://data.okfn.org/tools/validate + http://data.okfn.org/tools/view)

Re naming, here's a suggestion:

```
euribor-1w-monthly.csv
euribor-1m-monthly.csv
euribor-10m-monthly.csv
...

# format is
euribor-{maturity}-{granurality}
```

Aside: Generally, I think we need a convention for naming time series regularity (e.g. monthly etc) and we should probably open a specific issue for that.

Finally: do they only have data published at monthly granularity or is that just what you have pulled atm? (i.e. can i get daily or quarterly versions of these time series?)

### ThomasG77 (2015-02-03T16:25:27Z)

@rgrp I agree partly about your proposition for renaming.
File names doesn't give clue when time series begin and end.
Mitigated between:
- keeping a same uri (ressource to file remains identical but content in time series files changes) 
- changing renaming to display dates of start and end like below

```
euribor-{maturity}-{granularity}-{time-serie-begin}-{time-serie-end}
```

I don't really have an idea for convention for `time-serie-begin` and `time-serie-end`
Difficult to make a choice here: do we prefer exact date, interval, duration,...
Maybe indication from https://schema.org/Date could help.
Do you know any standards for this purpose except ISO8601 notation?

For your last question about granularity, I didn't choose to take all granularities because your first data request for the package was for monthly granularity and I would prefer deliver some data and add more of them later.
Methods to acquire them remain mainly the same.

### ThomasG77 (2015-02-03T16:38:04Z)

@rgrp 
When creating datapackage.json locally, I was inspecting licence/terms but was considering a possible issue with using scrapping here `Please, do not copy any of the information without the authority of Triami Media` from http://www.euribor-rates.eu/disclaimer.asp

Thoughts before I go further?

### rufuspollock (2015-02-04T08:56:15Z)

@ThomasG77 I would not include time-series start/end in file name - that can go in description of the resource if appropriate. So suggest we go with naming scheme I suggested for now.

To move this forward can you get the validator and view links in and we'll look at those (really agree on moving this forward and adding more data, if needed, later).

### ThomasG77 (2015-02-14T15:55:08Z)

My datapackage.json is done and OK ([datapackage.json validator url](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2FThomasG77%2Feuribor%2Fmaster%2Fdatapackage.json)) 
Created with `dpm init` so was not really frightened.
The second tool, http://data.okfn.org/tools/view does not work at the moment so I can't test

The README is quite complete, any idea to improve it, in particular about licence part?

### sxren (2015-02-14T16:28:07Z)

@ThomasG77 add the `.md` extension to your readme and gitgub will render the markdown to html.

Here is my template note for source data licensing:
`> Refer to the [terms of use](http://example.com) of the source dataset for any specific restrictions on using these data in a public or commercial product.`

See also http://data.okfn.org/data/core/language-codes#readme

### rufuspollock (2015-02-14T16:28:33Z)

@sxren are you happy to review. Re the error from view that indicates something both wrong (possibly) in the data package and something with data.okfn.org (we should not crash out on a rendering error - i note error is somewhat opaque based on local checking)

### sxren (2015-02-14T16:32:56Z)

@rgrp yes. i'll look at it tomorrow. (Japan)

### ThomasG77 (2015-02-14T21:59:25Z)

@sxren Reference to licence done using your template but no really sure and renaming README to README.md done also.

### sxren (2015-02-14T23:35:20Z)

@ThomasG77 the error from the view seems to be caused by `"homepage":""` in the datapackage.json. if it is, it's not your fault. it's a bug. but would you mind deleting that line for now? thank you.

@rgrp i traced the issue back to `dataset.homepage.replace('https://', '')` on line 54 of `data.okfn.org/views/_snippets.html` and then from there to `normalize()` in `datapackage\datapackage.js`. is that something that should be caught in validation or how do you want to handle that?

### sxren (2015-02-15T00:01:22Z)

@ThomasG77 you could be more explicit in the license section and say, "This Data Package..." instead of "This material...."

is the official source http://www.emmi-benchmarks.eu/euribor-org/euribor-rates.html ? i mean, that seems to be the source people would need to refer to for usage restrictions.

and what are you not sure about? happy to help if i can. thank you.

### ThomasG77 (2015-02-15T13:01:02Z)

@sxren I think everything from your feedback is done. See following :

> caused by `"homepage":""`

Removed

> "This Data Package..." instead of "This material...."

Done

> and what are you not sure about? happy to help if i can. thank you.

The licence to apply. We currently retrieve the content from http://www.euribor-rates.eu with a disclaimer http://www.euribor-rates.eu/disclaimer.asp
whereas the official source behind should be the one you mentioned  http://www.emmi-benchmarks.eu/euribor-org/euribor-rates.html.
So what is the "right" disclaimer and licence to put?

### sxren (2015-02-15T14:22:34Z)

@ThomasG77 awesome! thank you very much.

> So what is the "right" disclaimer and licence to put?
> i don't know, i'd reference the upstream data source http://www.emmi-benchmarks.eu/euribor-org/euribor-rates.html

i added you as a collaborator to datasets. whenever you're ready, please go to https://github.com/ThomasG77/euribor/settings and transfer ownership to datasets.

thanks, again!

### rufuspollock (2015-02-15T15:38:49Z)

@ThomasG77 our standard approach re license as per this thread is http://discuss.okfn.org/t/copyright-on-data-sources/189/7 is:
- Apply "our" preferred open license to the data package (as in license in license field)
-  Note clearly in License section of README that:
  - this is license is covering any "rights" we the packager have
  - that there may be underlying rights in the data from the source and that we are not licensing those (since we do not control them). In this specific situation I would note that a) not clear if any rights in underlying data (not really clear that it would justify any database rights or similar) b) not clear what terms and conditions / license is (it would be good to dig out there terms and conditions and have a look)

PS: we should definitely start adding this info to the docs - http://data.okfn.org/doc/

### sxren (2015-02-15T16:03:28Z)

@rgrp 

> PS: we should definitely start adding this info to the docs - http://data.okfn.org/doc/

Any thoughts on where this would go? Existing section? New section; e.g., FAQ?

### sxren (2015-02-15T16:04:58Z)

Accidentally closed the issue.

### ThomasG77 (2015-02-15T19:54:00Z)

I have updated the README.md as below:

> Refer to the [terms of use](http://www.euribor-rates.eu/disclaimer.asp) of the source dataset for any specific restrictions on using these data in a public or commercial product. You should also be aware that this data comes indirectly from http://www.emmi-benchmarks.eu/euribor-org/euribor-rates.html.
> Note that underlying rights, terms and conditions in the data from the source are unclear and may exists.

Feel free to comment.

I tried to change repo ownership but it keeps saying `You don't have admin rights to datasets`
I'm listed as contributor hence the possible issue. You can also fork my repository if you don't want to change my Github rights in the datasets organization.

### sxren (2015-02-16T01:34:46Z)

@ThomasG77 oops! apologies. you can transfer it now.

### ThomasG77 (2015-02-16T14:42:16Z)

Ownership changed. URL atm is https://github.com/datasets/euribor
Now, we can close the issue in your opinion?

### sxren (2015-02-17T05:35:02Z)

@rgrp does this go in core-list or catalog-list?

### rufuspollock (2015-02-17T07:41:44Z)

@sxren it has to go into both (if it is core - which it is).

### sxren (2015-02-17T08:00:15Z)

@ThomasG77 would you add https://github.com/datasets/euribor to https://github.com/datasets/registry/blob/master/core-list.txt and then close this issue? thank you!

### rufuspollock (2015-02-25T07:40:24Z)

@sxren note you also need (atm) to add to the catalog-list.txt as well. I've just done that and data is now live on: http://data.okfn.org/data/core/euribor (note due to number of data files the pages locks initially due to JS creating the tables!).

One last thing: this is a dataset that would really benefit from having a "view" e.g. let's plot 3m euribor over time. @sxren would you be up for walking @ThomasG77 through how to create a view? We should also add this to our general docs!

### sxren (2015-02-26T07:09:06Z)

@rgrp 
1. catalog-list.txt, thank you. i'll remember that.
2. is there a view property that can be set to use a resource other than the first resource? or would 3m-monthly need to be moved to the first position in the resources array?
3. when you say general docs, is that data.okfn.org/doc?

thank you.

### rufuspollock (2015-02-26T07:29:40Z)

@sxren re the view property that's a good question if you can reference other resources. It should be really easy to do so though looking at relevant code https://github.com/okfn/data.okfn.org/blob/master/public/js/app.js#L37 and https://github.com/okfn/data.okfn.org/blob/master/public/js/catalog.js#L30 I think it may be hardcoded to the first resource. This is actually very easy to fix.= and we should do.

Re general docs: yes, http://data.okfn.org/doc/ (maybe we start with adding it to the FAQ)

### sxren (2015-02-26T14:28:20Z)

@rgrp thank you.

see https://github.com/okfn/data.okfn.org/pull/158

re: views documentation, i'll make a PR in the next couple of days.

### sxren (2015-03-03T04:00:13Z)

@ThomasG77 i made a [PR](https://github.com/sxren/data.okfn.org/commit/53ad0fe2145d1ec3c1795f8259e8fa95d154d1c8) for documentation on views. please have a look and let me know if you have any questions. thank you.

### rufuspollock (2015-05-30T07:07:41Z)

FIXED. This is live http://data.okfn.org/data/core/euribor

@ThomasG77 we will don't have a view for the data which would be nice - do you want to try adding one?
