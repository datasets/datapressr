---
number: 5
title: Key Commodity Prices
state: closed
author: rufuspollock
created_at: "2013-03-03T15:40:44Z"
updated_at: "2020-03-06T11:44:54Z"
closed_at: "2020-03-06T11:44:54Z"
labels: ["Priority: ★★★"]
assignees: [zelima]
---

# Key Commodity Prices

This should probably be broken up more:
- [ ] iron ore
- [ ] copper
- [ ] wheat
- [ ] gold - #17 
- [ ] oil - #23 
## Sources

Monthly prices for a wide range of commodities from IMF
- http://www.imf.org/external/np/res/commod/index.aspx
- http://www.imf.org/external/np/res/commod/External_Data.csv - preview http://datapipes.okfnlabs.org/csv/head/?url=http://www.imf.org/external/np/res/commod/External_Data.csv

## Comments

### calmrat (2015-01-04T15:53:44Z)

Are you looking to target specific commodities only? Here's a quick stab at importing monthly 'external data' from IMF; comes in the form of a ipython notebook. 

https://github.com/kejbaly2/ipynotebooks/blob/master/US%20Commodities%20Prices.ipynb

### rufuspollock (2015-01-04T18:25:04Z)

@kejbaly2 my guess is we probably want to start splitting this stuff out. e.g. we already have oil elsewhere. Can you also share a snippet of the output CSV you produced here (http://datapipes.okfnlabs.org/ may be your friend here if you want a pretty version!)

### rufuspollock (2015-05-17T16:14:23Z)

@kejbaly2 are you interested in doing some more work here to get this properly packaged?

@Yannael this would be a nice one to get packaged so maybe one to prioritise as managing curator :-)

### zelima (2016-03-12T07:18:21Z)

I can finish this one, if nobody's working.
http://www.imf.org/external/np/res/commod/External_Data.xls this is link to xls file. The file contains monthly price of all commodities starting from 1980 to 2016/02, including iron, cooper and wheat.

Heading for CSV file.
`Date,Price`

### rufuspollock (2016-03-12T14:48:14Z)

@zelima that would be great - i would suggest pulling the entire imf commodity data into one package (as you suggest).

Could you set out exactly how you would structure e.g. what resources you would have and then we will prep the script.

### zelima (2016-03-13T08:05:49Z)

@rgrp The entire data contains commodities starting from, Aluminium, Bananas, Barley, Beef.. ending with Wheat, Wool, Zinc. There are 53 of them.
Plus there are 10 Indexes - 
- All commodity price index
- Non-fuel price index
- Fuel and beverage price index
- Food price index
- Beverage price index
- Industrial Input price index
- Agricultural raw materials index
- Metal price index
- Fuel (energy) index
- Crude Oil (petroleum) index.

For all of them 2005 = 100

I could do it in one datapackage, just it would be quite massive.

What would be your suggestions

By massive I assume 435(rows)X 65(columns)

### rufuspollock (2016-03-13T18:56:21Z)

@zelima can you explain what the 10 indexes are and list them all out (I suggest editing your previous comment rather than commenting again).

When you say massive how large is the CSV from the IMF atm?

### zelima (2016-03-24T20:09:47Z)

@rgrp I wonder whether you've seen comment I edited?

### rufuspollock (2016-03-25T16:06:22Z)

@zelima no i don't - not unless you notify me ;-)

I think we do this in one data package but one file for each commodity I think.

### zelima (2016-03-25T16:46:48Z)

@rgrp Ok,
So the dataset will look something like this:
65 different csv files. each file will have 2 columns:

```
Date,Price
...,...
```

### rufuspollock (2016-03-27T09:04:53Z)

@zelima that's right. The only other option I could think of was having all the date in one file with:

```
Date, Commodity-Name-1, Commodity-Name-2
```

Do the commodities have data over the same time period or does it vary? This latter option might actually be attractive now I think about it. Let's go for this option of one and if we need to change we can later.

### zelima (2016-03-29T20:44:30Z)

@rgrp please take a look at [new datasets](https://github.com/zelima/commodity-prices.git)
README.md, datapackage.json and makefile are missing, I'll finish them for tomorrow, but still, is it something like you were hoping for?

There is a little issue regarding CSV file titles.
Right now  script is naming them according the names that are provided in third row of each commodities column of XLS file. for example in excel file Title only for coffee looks like this 

`Coffee, Robusta, International Coffee Organization New York cash price, ex-dock New York, US cents per pound`

So to take only commodity name I'm taking everything before first comma.

Problem is that there might be several commodities that have same name before first comma. for example same coffee - [coffee N1](https://github.com/zelima/commodity-prices/blob/master/data/Coffee.csv) and [cofee N2](https://github.com/zelima/commodity-prices/blob/master/data/Coffee%28%20Robusta%29.csv). right now script checks if file with name coffee already exists if it does, it is adding additional info (adds everything before second comma) in brackets. 

So the problem is that now first one does not have info and second one does.

Solution for this would be to add additional info to all of the commodities (some of them have really large), or create the list of file names manually inside the script and let it do it's job after. So what would you suggest?

### zelima (2016-03-30T20:05:54Z)

I added missing files, and have question regarding datapackage.json:
Should it include all 63 file paths in it? (for datafiles part to display and download them)
Right now it looks [Like This](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices#resource-External_Data)

### rufuspollock (2016-03-31T12:38:04Z)

@zelima yes - the datapackage.json should contain all the resource files. I suggest you maybe generate this as part of the scrape or use `dpm init` (if you do as part of the scrape be careful to update the existing datapackage.json and not completely replace).

Generally looks good and i will start opening issues on the repo.

### rufuspollock (2016-03-31T12:45:58Z)

@zelima just checking futher: i also thought I said about having all the data in a single file:

> Do the commodities have data over the same time period or does it vary? This latter option might actually be attractive now I think about it. Let's go for this option of one and if we need to change we can later.

**Priority: decide whether we do single file or multiple files** - can you answer my question above re varying time period ... Also it sounds like source has a single sheet per commodity in which case it would make sense to split (as you are already doing - which is good!)

General points:
- data files should _always_ have lower case names ...
- Regarding the titles of the tabs I would suggest we do need to parse this however we go since either we need to put this in the README or we need to put it in the datapackage.json metadata for a given file (if we have individual files).
  - In my experience rather than dooing fancy mapping i would suggest just writing the sheet names to a csv file. Opening that file, adding name mappings by hand and then saving that and using it either as a CSV or by converting to a python dict and inlining into the code.

### zelima (2016-04-01T21:55:06Z)

@rgrp xls file has one column Date and other 63 columns of commodities, on one sheet. date starts form 01/1980. Several commodities on certain date may not have any value, For example: Indonesian natural gas does not have any price value until 1992. So output csv file might look something like this:

```
Date,comodity1,comodity2,comodity3..
1980, ,100,45
1981, ,105,57
1982,43,110,56
1983,45,110,55
...,...,...,...
```

For now I'll leave them split, and will work on proper titles and will fix dataackage.json. If you decide single file is better, I'll modify script in no time. 
And I'll do my best to write proper README.md :)

### rufuspollock (2016-04-02T11:46:18Z)

@zelima if the original file is one sheet let's keep that way - that will make our life easier i imagine and may be more useful - let's go for that and just have blanks where there are no values.

### zelima (2016-04-02T13:36:55Z)

@rgrp OK, will be done

### zelima (2016-04-03T09:33:46Z)

@rgrp 
- All data in in one file.
- datapackage.json shows all of the columns.
- Changed README.md

[Modified dataset](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices) - please review

### rufuspollock (2016-04-03T14:07:57Z)

@zelima the preview does not show the table. I think this is because some column names have `(` in it which currently breaks recline. Can I suggest we strip brackets from column names.

@pdehaye @pwalsh any thoughts on whether this should be one file or many - see discussion above.

### zelima (2016-04-03T14:19:51Z)

@rgrp I removed brackets, but still not shows table. I thought it was caused cause there are too man fields. 
Any other suggestions?

### rufuspollock (2016-04-03T15:50:33Z)

@zelima i recommend checking the developer console in chrome or firefox as it shows the errors. e.g. now it has:

"China import Iron Ore Fines 62% FE spot"

My guess here is the 62%. My sense here would be to perhaps output the list of all commodity names and list them in the README but trim those in the actual spreadsheet (??). Maybe as a start good you dump the list of column names to a markdown list and paste them here or even better in a google doc and we can do a mapping ...

### zelima (2016-04-03T19:58:41Z)

@rgrp [fixed](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices)

Since fixed, there is no need of google docs any more, is it?

### rufuspollock (2016-04-08T11:01:58Z)

@zelima great - and we can forget google docs. Is there any description of any of the commodities beyond their name in a structured form? If so adding this to the datapackage.json field description would be useful.

Otherwise this looks good to go. Please submit all the standard info for review in a single new comment and we can take a look.

### zelima (2016-04-09T06:05:26Z)

@rgrp descriptions for commodities added.

The data comes from [IMF](http://www.imf.org/external/np/res/commod/index.aspx) commodity prices. Data is pursed from xls file retrieved from [this link](http://www.imf.org/external/np/res/commod/External_Data.xls) and saved into archive folder.

The link to view dataset: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices

The validate link: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices

You can view repository itself [here](https://github.com/zelima/commodity-prices)

Please confirm to transfer ownership.

### rufuspollock (2016-04-09T10:38:11Z)

Looks good to me. Let's transfer this. Before we publish however it would be nice to do a bit of tidying and add a graph -- @zelima you and I need to sync to discuss how that is done. Please can you add 2 issues once you have transferred: one for tidying of text and one for the graphy.

@pdehaye once we have everything sorted we will notify here so you can do the honours re announcing.

### rufuspollock (2020-03-06T11:44:53Z)

FIXED. This is done and moved to https://github.com/datasets/commodity-prices
