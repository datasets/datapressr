---
number: 101
title: Historical GDP
state: open
author: rufuspollock
created_at: "2015-05-24T19:09:03Z"
updated_at: "2019-12-02T19:54:59Z"
labels: []
---

# Historical GDP

Angus Maddison has a great datasets of historical GDP and population. Package that.

Can get from http://datahub.io/dataset/econonomic-history-gdp-historical-estimates

Note: may be IP issues - should flag that in the License section

## Comments

### rufuspollock (2015-07-19T12:10:45Z)

Could start by just getting this data into a google doc and nice and tidy.

### gsilvapt (2016-04-28T21:41:52Z)

Original files have been removed, apparently. Will work on the original .xls files.

### gsilvapt (2016-04-28T22:20:12Z)

[Historical GDP Per Capita](https://github.com/gsilvapt/historical-gdp-per-capita)
[Historic GDP](https://github.com/gsilvapt/historical-gdp)

To improve the quality of these data packages, I would recommend removing the first two rows of these datasets. If this is needed, I will take care of this later on.

For now, I will take care of the remaining parts of the process to move this package forward.

### gsilvapt (2016-04-28T22:26:45Z)

Issue: http://prntscr.com/ay3cs3

As soon as solved, I can published it. Already have the PR ready.

### rufuspollock (2016-04-29T08:14:49Z)

@gsilvapt can you please do http://data.okfn.org/doc/core-data-curators#3-quality-assurance - i.e. post links here.

### gsilvapt (2016-04-29T09:07:58Z)

@rgrp I cannot move the repositories to the /datasets organization because I don't have admin access. At least it is what GitHub says. The links to the repositories are posted in a previous comment but here they are again:

https://github.com/gsilvapt/historical-gdp
https://github.com/gsilvapt/historical-gdp-per-capita

### zelima (2016-04-29T09:21:42Z)

Hi @gsilvapt.
This is the link for okfn tools and plugins: http://data.okfn.org/tools
Follow the [Validate link](http://data.okfn.org/tools/validate) and paste link to your repository there. If it is valid it should look something  [like this](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices)
Follow the [View link](http://data.okfn.org/tools/view) and paste link to your repository there. The result should look something [like this](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcommodity-prices)
After dataset will pass validation and you think it looks well, paste the validation and view links here.

**Update:** In your case, there should not be graph

### gsilvapt (2016-04-29T09:28:06Z)

Oh, okay. I had run the validator in my terminal. But here they are again then:
**Historic GDP**
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-gdp
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-gdp

**Historic GDP Per Capita**
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fgsilvapt%2Fhistorical-gdp-per-capita%2Fmaster%2Fdatapackage.json
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-gdp-per-capita

Thanks for helping :+1:

### zelima (2016-04-29T10:04:08Z)

You're welcome. 
I opened, few issues on your Historic GDP repository, hope it will help to prettify your dataset.
Good luck!

### rufuspollock (2016-04-29T11:19:38Z)

@gsilvapt what's the logic on splitting them into two data packages? My sense is that probably having these in one (if they come from one data source) is probably better tbh (though two different data files in the data package)

### gsilvapt (2016-04-29T11:22:58Z)

@rgrp Because the original sheet had 3 separate tabs and they are different types of data. One is GDP and one is population numbers.

### rufuspollock (2016-04-29T16:46:30Z)

@gsilvapt as discussed in channel let's have 3 files.

Also in terms of naming i would suggest gdp-historical just because the ordering makes nicer sense (its GDP first then its the historical version of GDP).

### gsilvapt (2016-04-29T16:49:41Z)

Yes, taking care of this for ages :stuck_out_tongue: Let's hope this last try actually works!!

### gsilvapt (2016-04-29T16:51:33Z)

In regards to this data package, here you have it:

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-gdp

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-gdp

I have the Pull Request ready with the updated lists on `registry/data`. Let me know when I should do it, please.

### gsilvapt (2016-05-04T21:52:15Z)

I forgot to come back with extra news. The repository has progressed significantly. However, it is not yet perfect. In this [issue](https://github.com/gsilvapt/historical-data/issues/4) we have been discussing how to improve the quality of the package.

@rgrp, some years have strings instead because they represent year intervals. Like 

> Annual compound Growth rate 1990-2008

As for 

> Numbers have "," for decimal separator rather than "."

I will have to double-check. The professor who posted this online was European and we tend to use commas instead of dots. Dots makes more sense to me but didn't even look at that. What should we do about the year intervals though?

### gsilvapt (2016-05-05T14:20:59Z)

Latest [commit](https://github.com/gsilvapt/historical-data/commit/65062535b75440743834c1c6455f127b143271a9) changes all "," to "." . As for the time intervals, I am still waiting for some guidance there.

### rufuspollock (2016-05-06T17:45:45Z)

@gsilvapt re time intervals it is a tough one. If we leaves strings like this thought it breaks a lot of stuff. My suggestion is for these one pick a date in the middle and add a column called "notes" and put the interval description in the notes column.

### gsilvapt (2016-05-09T18:27:58Z)

@rgrp I was trying to have a look at that and then I noticed the middle value is actually a coincident value with other years - namely 1999. What to do then?

### rufuspollock (2016-05-10T10:00:13Z)

@gsilvapt how common are these "averages"? one option is to delete them (or put them in a separate special file).

### gsilvapt (2016-05-10T10:04:22Z)

@rgrp Every "growth" indicator has this time interval and it is the only one

### rufuspollock (2016-05-12T10:42:34Z)

@gsilvapt ok - i would just remove since it is probably computable from other data (and note this in the `## Data` section of the README (that we removed it).

### gsilvapt (2016-05-12T16:56:22Z)

That has been taken care of:

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-data

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fhistorical-data

### rufuspollock (2016-05-13T08:45:50Z)

@pdehaye would you like to review?

### gsilvapt (2016-06-09T22:41:09Z)

This dataset has not been reviewed and I'd like to transfer ownership when you guys can review this. Thanks!

### zelima (2016-06-10T05:39:00Z)

@gsilvapt I suggest to sort Year column too.. like:

```
Afghanistan,1998,"0,0582390906"
Afghanistan,2002,"0,2515428942"
Afghanistan,2004,"0,0769589935"
```

instead of 

```
Afghanistan,1998,"0,0582390906"
Afghanistan,2004,"0,0769589935"
Afghanistan,2002,"0,2515428942"
```

Also, I see values of "Value" column are strings instead of number - they are inside double quotes. should they be so? (I'm not sure this needs to be fixed - just saying)

### gsilvapt (2016-06-10T10:53:49Z)

Thanks for the suggestions. I will work on a fix for this :+1:
