---
number: 30
title: City population timeseries
state: closed
author: rufuspollock
created_at: "2013-09-22T16:23:32Z"
updated_at: "2016-03-13T18:57:36Z"
closed_at: "2015-11-19T22:26:49Z"
labels: ["Type: Indicator", "Priority: ★★★"]
assignees: [jalbertbowden]
---

# City population timeseries

http://data.un.org/Data.aspx?d=POP&f=tableCode:240

Download is via some javascript-y thing but some dev tools analysis reveals source as:

http://data.un.org/Handlers/DownloadHandler.ashx?DataFilter=tableCode:240&DataMartId=POP&Format=csv&c=2,3,5,7,9,11,13,15,16,17&s=_countryEnglishNameOrderBy:asc,refYear:desc,areaCode:asc

## Comments

### rufuspollock (2014-08-16T15:33:28Z)

@jalbertbowden would you be willing to take a look at this one?

### jalbertbowden (2014-08-16T15:49:16Z)

sure i'll take a look today

### jalbertbowden (2014-08-20T18:20:54Z)

sorry just now looking at this....i know i need to fix the first repo's dpm, but just thinking aloud here....same format? giant csv?

### rufuspollock (2014-08-21T08:13:59Z)

Same format :-) A giant CSV again I think ... (though if too massive e.g. 10Mb+ we can think about how to cut down)

### iotakodali (2015-01-15T18:49:02Z)

@rgrp is this dataset ready to package? is there link for the data repo

### rufuspollock (2015-01-15T19:09:34Z)

@jalbertbowden did you do any work here?

@iotakodali just checking with @jalbertbowden. If he has not done anything I suggest you start a repo - we'll then move it to github.com/datasets/ when ready.

### iotakodali (2015-01-17T18:03:15Z)

@rgrp it is a 6.5 MB csv file with some footnotes for few countries. Do you think we should split them into two files?

### sxren (2015-01-18T05:12:15Z)

@iotakodali maybe one csv with male and female data (~28,000 rows) and one csv with "both sexes" data (~14.000 rows).

### sxren (2015-02-15T12:07:26Z)

@iotakodali are you working on this? it would be useful for #47. thanks!

### st-martin (2015-06-01T18:42:16Z)

@rgrp @sxren
Is this okay? https://github.com/st-martin/citypop-timeseries/tree/master

### Yannael (2015-06-02T06:25:46Z)

@st-martin Great to catch up on this one! CVSs seem fine, however there are issues with the datapackage.json. Can you update it so the validation and view are fine, see 
- http://data.okfn.org/doc/publish-faq#validate-and-preview-your-data-package for links to the validate and view tools, 
- http://data.okfn.org/doc/data-package for the structure of the datapackage.json.

Also, could you follow the guidelines http://data.okfn.org/doc/publish-faq#readme for the README?

Thanks!

### st-martin (2015-06-02T15:29:27Z)

@Yannael Those links were really useful. Thank you!

Packaging is mostly done ([Validation link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fst-martin%2Fcitypop-timeseries%2Fmaster%2Fdatapackage.json)) but views are not straightforward for this dataset. Are they a requirement?

**Edit:** I guess the problem with views is not related with the dataset but with my lack of knowledge. ;)
I'm searching for the JSON especification details for Recline Views to fix it.

**Edit 2:** According to [this](http://data.okfn.org/doc/data-package#views) the datapackage.json can only display a Recline Dataset Graph View and that will not be possible due to the granularity of the datasets. I was trying to offer a Recline Grid View instead but I'm not sure if that's possible.

An option could be to include diferent CSV files for each country but, if I'm not wrong, that will output 460 CSV files (230 for each big CSV). That would be really painful unless there's a way to automate it.

Can someone imagine a different way to offer graph views for this dataset?

### Yannael (2015-06-03T05:19:11Z)

@st-martin oops by view I did not mean to visualize the data with Recline (which would probably be tricky with this dataset), but how the dataset page (table and README) will be displayed on OKFN website. Simply enter the URL to your dataset at http://data.okfn.org/tools/view

Sorry for the misunderstanding

### st-martin (2015-06-04T19:20:35Z)

@Yannael 
Don't worry! This has been useful to learn a bit more and to burnish the data package.

Here are the links:
- To my [repository](https://github.com/st-martin/citypopulation-year).
- [Validation link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fst-martin%2Fcitypopulation-year%2Fmaster%2Fdatapackage.json).
- [View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fst-martin%2Fcitypopulation-year).

What's next?

### Yannael (2015-06-06T16:47:02Z)

@st-martin 
Ok looks good!
One last thing: you should add the 'sources' structure in your datapackage.json to specify the content of the columns

You can get it from http://data.okfn.org/tools/create by upoading your CSV there, just copy and paste then sources content in youe datapackage file after

You'll see that the view at http://data.okfn.org/tools/view will then also display the table!

Once done, you can transfer ownership of your repo to me (that is in settings on the Github repo), I'll then transfer it to the dataset repo.

### st-martin (2015-07-06T21:25:23Z)

Done!
Please, have a look at it to ensure that everything's okay and then I'll transfer the ownership.
1. [Validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fst-martin%2Fcitypopulation-year)
2. [View](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fst-martin%2Fcitypopulation-year)
3. [Repository](https://github.com/st-martin/citypopulation-year)

### Yannael (2015-07-12T12:26:23Z)

@st-martin Ok, great! 
I'll add to the dataset repo when you transfer me the ownership

### Yannael (2015-07-13T12:17:37Z)

@st-martin Can you resend the link for the transfer, it seems to be expired? Thanks!

### st-martin (2015-07-13T12:43:28Z)

Hi, @Yannael. I'm new to GitHub and I don't know how to resend it. I don't even knew you have received a link. Isn't it already transfered?

### Yannael (2015-07-13T13:33:47Z)

@st-martin 
Problem solved, that was on my side. I transferred it, http://data.okfn.org/data/datasets/unsd-citypopulation-year

Thanks!

@rgrp

### rufuspollock (2015-11-19T22:26:49Z)

FIXED. Closing. Well done all.

@Yannael one aside - i think we may want to name this a bit differently e.g. population-city (we generally don't put providers atm and i think the year stuff is normally not included unless we are distinguishing a time series with one granularity from another). I've gone and made this change so nothing needed at your end but worth noting for the future.

### lexman (2016-03-10T06:40:25Z)

Final data is here : https://github.com/datasets/population

### rufuspollock (2016-03-12T14:58:03Z)

@lexman no its at https://github.com/datasets/population-city and http://data.okfn.org/data/core/population-city :smile: 

/cc @pdehaye a good example of why we should list the final published locations (and this was one i did and neglected to correctly :wink:)

### lexman (2016-03-13T04:51:15Z)

+1 ! 
I've been looking for this data mentionned here...
