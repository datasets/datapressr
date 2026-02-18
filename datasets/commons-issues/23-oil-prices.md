---
number: 23
title: Oil prices
state: closed
author: rufuspollock
created_at: "2013-06-14T19:54:22Z"
updated_at: "2016-03-12T14:56:15Z"
closed_at: "2016-03-10T14:18:56Z"
labels: ["Type: Indicator"]
---

# Oil prices

US EIA has a variety of prices: https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm (US EIA is great as high quality and public domain as fed gov)

There's various types of oil for which we could get prices:
- brent crude - https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RBRTE&f=D
  - XLS file: https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls
- wti (west texas intermediate) - http://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RWTC&f=M
  - note there are a bunch of versions - [first purchase price](http://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=F003048623&f=M) - [FOB spot price](http://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RWTC&f=M)
- pump price (in various places in the world)

I propose we store:
- Brent crude
- WTI

For granularity I'd say it is worth storing all of daily, weekly, monthly and annual but prioritise daily. (note naming conventions: http://data.okfn.org/doc/publish-faq#data-package-name)

Question: Do this as one data package or one data package per oil type? (And if one data package do we store brent and WTI same file or separate files? Ans: yes, separate files).

All in one:
- Convenient to prepare as data all from same source so scraper easy to run (that said we already have natural gas prices separate ...)

Separate:
- One data package for one dataset approach.
- Data package is small and lightweight

My instinct here is in all in one, so data package will look like:

```
data/wti-day.csv
data/wti-year.csv
data/wti-month.csv
# etc
```

## Comments

### rufuspollock (2016-02-11T11:47:23Z)

@kiliakis could you look at this one.

BTW: one quick question. For the various temporal granularities should we use:

`-daily / weekly / monthly / annual (or yearly)`

OR

`-day / week / month / year`

Latter seem more natural english but the former are easier to apply (e.g. no debate over annual vs yearly for year data).

/cc @pdehaye

### kiliakis (2016-02-15T20:47:40Z)

@rgrp I am going to start packaging this one, I will put both brent crude and wti in the same datapackage, separate files. As for the temporal granularities, there will be one file for each of them, and the extension will follow the second option (day / week etc) as mentioned in data package naming conventions.
If we decide to alter any of the above though, I could easily change it.

### kiliakis (2016-02-15T22:52:42Z)

Datapackage looks ready to me, please review. Links:
- [view](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Foil-prices)
- [validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Foil-prices%2Fmaster%2Fdatapackage.json)
- [github](https://github.com/kiliakis/oil-prices)

@rgrp If I merge together brent and wti files of same granularity, it would be possible to display both brent-day and wti-day data series in the datapackage view graph. Currently it is displayed only a brent-day line graph.

### rufuspollock (2016-02-18T15:28:18Z)

@kiliakis brilliant. What's your view on merging? My feeling is probably keep separate and work on changing the view stuff so that it can support multiple series.

@kiliakis + @pdehaye can we get this moved over and added to the core list.

### pdehaye (2016-02-22T12:47:43Z)

@rgrp  will try to start doing this in 10 hours or so. have been very busy past week

### pdehaye (2016-02-22T23:44:59Z)

@kiliakis actually, I need you to transfer ownership of the dataset. I have just reviewed and it looks good to go! you can do a pull request to add to the core list if you want, or signal for me that I need to do it.

### pdehaye (2016-03-07T12:00:35Z)

@kiliakis would be great to get this done! just transfer ownership if you have little time.

### kiliakis (2016-03-07T16:34:19Z)

done (sorry for the delay, I will be back soon)

### pdehaye (2016-03-10T14:18:56Z)

Now fully packaged! Thanks, @kiliakis!

### rufuspollock (2016-03-11T07:33:39Z)

When complete can you close with a comment like:

```
FIXED.

{link to data.okfn.org package}
{link to github package}
{link to tweet if we tweeted}
```

That would be awesome and mean that checking later it is really easy to see where this ended up.

### pdehaye (2016-03-11T07:50:25Z)

ok

On Fri, Mar 11, 2016 at 8:33 AM, Rufus Pollock notifications@github.com
wrote:

> When complete can you close with a comment like:
> 
> FIXED.
> 
> {link to data.okfn.org package}
> {link to github package}
> {link to tweet if we tweeted}
> 
> That would be awesome and mean that checking later it is really easy to
> see where this ended up.
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/23#issuecomment-195233492.

### rufuspollock (2016-03-12T14:55:55Z)

@pdehaye great! could you do it for this one :wink:
