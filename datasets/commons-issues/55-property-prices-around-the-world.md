---
number: 55
title: Property Prices (Around the World)
state: closed
author: rufuspollock
created_at: "2014-06-07T12:14:06Z"
updated_at: "2018-01-15T18:19:13Z"
closed_at: "2018-01-10T08:07:01Z"
labels: ["Priority: ★★★"]
assignees: [AcckiyGerman]
---

# Property Prices (Around the World)

This issue is about a consolidated set of data (probably at a coarser granularity e.g. country level averages per month or per year).

- [x] Consolidated - BIS have good consolidate data here (openness isn't super clear). http://www.bis.org/statistics/pp.htm
  - Data file: http://www.bis.org/statistics/pp/pp.xlsx
  - long time series: http://www.bis.org/statistics/pp_long.htm

**Focus on a consolidated global dataset -- see if any other options than BIS**

##  Country Specific

*These will be separate issues*

Here for reference
- [x] UK - various data series - https://github.com/datasets/house-prices-uk
- [x] US - Case/Shiller series - https://github.com/datasets/house-prices-us
- [ ] ...

Interesting paper with long run time series across the world: http://voxeu.org/article/home-prices-1870 - however no data link afaict.

## Comments

### PilipMac (2015-01-04T16:11:18Z)

Any interest in Ireland? I could put that together for you.

### rufuspollock (2015-01-04T18:25:31Z)

@PilipMac definitely interested in ireland - could you open a specific issue for irish property prices.

### rufuspollock (2015-01-26T15:10:24Z)

@sxren interested in taking a look at this one?

### lexman (2016-05-15T21:50:17Z)

For France a lot of data can be found here : http://www.cgedd.developpement-durable.gouv.fr/prix-immobilier-evolution-a-long-terme-a1048.html

Including prices in Paris since 1200 : http://www.cgedd.developpement-durable.gouv.fr/IMG/xls/prix-immo-paris-1200-2012_cle2f2d1a.xls

### s-celles (2016-05-17T07:22:35Z)

See https://github.com/datasets/registry/issues/186 for Property price in France

### rufuspollock (2016-05-17T08:12:00Z)

@lexman or @scls19fr  this is great. Can you boot a specific issue for France and copy this info over into the description.

### rufuspollock (2016-06-23T18:23:36Z)

@zelima could you start looking at the BIS data on this one and scripting the data extraction.

Data package name: `house-prices-global`

I would suggest trying to do both the main file and the long time series item.

### zelima (2016-06-24T05:45:33Z)

@rgrp I went through BIS data, main file is constructed like this:
- The data contains Monthly, quarterly, half-yearly and yearly data. form 31-01-1966 to 31-05-2016. _which one do we need, or all of them?_
- For several countries there may be several data e.g: United Kingdom has two different data depending on Compiling agency (national statistic office and private sector), other countries may have more then two. e.g.: Finland has 7 depending on various options. _We need all of them or one of them?_
- Also 100 units for different countries may be different year - most of them are 2010, but there are exceptions e.g: For same UK it is 2002 and 1983

```
date,UK national stat office, UK private sector
,2002 = 100 (Units),1983 = 100 (Units)
28-02-2002,100,324.3
31-03-2002,103.5,329.2
30-04-2002,104.9,335.9
```

### rufuspollock (2016-06-29T08:53:12Z)

@zelima how big are the files. Can you give a short list here of the actual _files_ involved with their size.

### zelima (2016-06-29T11:21:55Z)

There is only one file with 6 sheets, first two sheets are content and documentation, other four - monthly, quarterly, half-yearly and annual series. The file is not too big (500 KB).

Size of excel sheets (rows/cols)
- Monthly Series - 609/53
- Quarterly Series - 249/220
- Half-yearly Series - 24/5 (there's something wrong with this one - it contains only Greece)
- Annual - 201/29

### rufuspollock (2016-07-03T15:10:45Z)

@zelima can you boot a repo for this and create the readme and add the archive files (in an automated way using a `scripts` file).

Based on what you have shown me I think we would do all temporal granularities and name as per our standard naming conventions. I would start though with annual data first.

Can you set out here or in the README what the structure of the _output_ data file would be?

### zelima (2016-07-04T10:35:44Z)

@rgrp The repository with README describing structure of output data is ready: https://github.com/zelima/house-prices-global

### rufuspollock (2016-08-22T07:06:28Z)

@pdehaye could you take a look and review this repo prepared by @zelima ?

### rufuspollock (2016-09-11T07:17:08Z)

Interesting paper with long run time series across the world: http://voxeu.org/article/home-prices-1870 - however no data link afaict.

### pdehaye (2016-09-12T09:27:22Z)

Hi @zelima. I just had a look at your suggestion. I am not sure I agree with the proposal. It would mix just by country, which would merge columns that have nothing to do with each other (different payment plans, if I understand right). This would mess up some of the datapackage tools (like automated graphing). 
I suggest you keep the columns separate, and go for something like `NO_annual_A:NO:2:1:0:0:1:0.csv` for a typical name. This file would simply contain:

```
31.12.1841, 0.1231
31.12.1842, 0.1058
31.12.1843, 0.1138
...
```

Ideally the documentation file would be extended to include an explicit reference to the file name, and a column giving explicitly the frequency of payment.

### AcckiyGerman (2017-12-08T10:13:44Z)

New source has been found here:
https://www.bis.org/statistics/full_bis_selected_pp_csv.zip
The structure is like this:

![image](https://user-images.githubusercontent.com/11707682/33761234-f30db7f8-dc10-11e7-97f3-34ee3df6d848.png)

Analyzing and making datapackage...

### AcckiyGerman (2017-12-08T16:27:36Z)

Temp repo: https://github.com/AcckiyGerman/global-house-prices-selected
## Done:
* analyse
* find nice source
* output format
## Todo:
* pivot table
* update datapackage.json['resources']
* push to datahub.io

### rufuspollock (2017-12-09T08:32:35Z)

@AcckiyGerman can you comment on https://github.com/zelima/house-prices-global - is that useful or not? /cc @zelima

### AcckiyGerman (2017-12-10T19:45:41Z)

Hi, @zelima I think you can remove https://github.com/zelima/house-prices-global now, coz I found the csv source on the http://bis.org, so there is no need to parse xlsx any more. Thanks.

### rufuspollock (2017-12-11T10:48:21Z)

@AcckiyGerman i'm not asking for @zelima to remove it - i'm more wondering on what the difference was and whether his existing work and structure were useful.

### AcckiyGerman (2017-12-11T11:35:01Z)

the repo in the datasets https://github.com/datasets/global-house-prices

### AcckiyGerman (2017-12-11T14:34:45Z)

The data package is ready, please review! @zelima @Mikanebu 
https://github.com/datasets/global-house-prices

@rufuspollock 
This https://github.com/zelima/house-prices-global repo from Irakli was useful on the analyse stage.
The differences between Irakly repo and my one is:
* source in csv was found - no need to parse xlsx
* the original table from bis.org (both xlsx and csv) has  date and country info in orthogonal to each other, the Irakly propose was to put it alongside, witch leads to mixing all other info in a table (there also is important info like "Unit of measure", "Value" which we don't want to lost.
* in my case I just pivoted the table and save all additional data as 'unit, 'value', 'country' in a datapackage.json

The original table from bis has complex structure, and there could be several ways to convent it, or even leave it like it is.
So while I have no experience how this data could be used - I can't decide this question.
So I ask you to review the table in 'archive/...csv' and result one and a datapackage.json and give me a feedback please.

### AcckiyGerman (2017-12-13T08:21:41Z)

The required Property Prices dataset is there: https://github.com/datasets/global-house-prices , which includes 59 countries and generalized prices for developing and advanced markets. Reviews and verified. We could now close this issue, aren't we?

### AcckiyGerman (2017-12-28T14:50:14Z)

The result [dataset](https://github.com/datasets/global-house-prices) is updated:
* data is divided onto 4 files
* table is unpivoted
@rufuspollock please could you review the dataset and close this issue if it is ok.

### rufuspollock (2018-01-09T18:56:49Z)

@AcckiyGerman following standard naming practice this should have been called `house-prices` or `house-prices-global` (/cc @zelima). Please can you get this corrected both in the github repo and on datahub.

I have not reviewed dataset itself in detail and would ask @zelima to do that please.

### zelima (2018-01-10T05:31:59Z)

Structure of dataset was discussed here https://github.com/datasets/global-house-prices/issues/2 and reviewed. So yes, we can close as soon as title is fixed

### AcckiyGerman (2018-01-10T08:07:01Z)

FIXED
Datapackage has been moved there: https://github.com/datasets/house-prices-global
Also it will be uploaded to datahub.io https://github.com/datasets/house-prices-global/issues/1

### rufuspollock (2018-01-15T18:19:13Z)

General discussion on property prices around the world continues in the new awesome repo here: https://github.com/datahq/awesome-data/issues/9
