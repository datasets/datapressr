---
number: 72
title: Natural Gas Prices
state: closed
author: rufuspollock
created_at: "2015-02-08T18:32:20Z"
updated_at: "2018-04-28T20:27:24Z"
closed_at: "2018-04-20T12:09:49Z"
labels: ["Type: Indicator", "Priority: ★★★", "Format: Tabular"]
---

# Natural Gas Prices

Standard (US) natural gas prices and maybe north sea too
- Henry Hub

Stub repo in progress here with links to source data: https://github.com/datasets/natural-gas-prices

**Packager wanted!**

Similar one for gold already done: https://github.com/datasets/gold-prices

## Comments

### zelima (2016-04-16T06:48:19Z)

@rgrp I'll finish this one.

the output files will be: 
natural-gas-price-daily.csv
natural-gas-price-monthly.csv

daily

```
date,price
1997-01-07,3.82
1997-01-08,3.8
1997-01-09,3.61
1997-01-10,3.92
1997-01-13,4.0
1997-01-14,4.01
```

monthly

```
date,price
1997-01-01,3.45
1997-02-01,2.15
1997-03-01,1.89
1997-04-01,2.03
1997-05-01,2.25
```

### rufuspollock (2016-04-16T08:24:49Z)

@zelima perfect. Let's get this one done.

### zelima (2016-04-18T19:22:01Z)

@rgrp please review

validate link: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fnatural-gas-prices

view link: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fnatural-gas-prices

I Registered pull request for repository.

### rufuspollock (2016-04-24T11:49:33Z)

@zelima can you link the pull request.

@lexman would you like to review this one?

### lexman (2016-04-24T16:52:28Z)

@rgrp @zelima  I'll review it, but I need a few days... Sorry

### rufuspollock (2016-04-25T11:08:27Z)

@lexman no problem - thanks!

### zelima (2016-04-25T17:38:39Z)

Link for PR: https://github.com/datasets/natural-gas-prices/pull/1

### lexman (2016-04-27T02:27:08Z)

Hello, 

@zelima I've started to review the PR and every thing looks good so far except for two minor things :
- file `scripts/README.md~` seam to be an artefact from your editor... It should be removed
- Makefile should be in the script directory

Unfortunately, I can't use the view link for a definite check because the server seams broken :

> Application Error
> An error occurred in the application and your page could not be served. Please try again in a few moments.
> If you are the application owner, check your logs for details.

 @rgrp do you have any idea ?

### lexman (2016-04-27T15:42:08Z)

Well, the viewer is back and the data is great ! I really like the graph view @zelima

I'll merge the PR as soon as both corrections are made...

### zelima (2016-04-27T16:27:09Z)

@lexman done: https://github.com/zelima/natural-gas-prices/commits/master

### lexman (2016-04-28T03:07:26Z)

I merged the PR. Great work @zelima !

### lexman (2016-04-28T03:42:15Z)

It seams that the natural-gas-prices has never been added to the core datasets...

I created a PR ( https://github.com/datasets/registry/pull/178 ) to add it to the main site. @pdehaye /cc @rgrp would you merge my PR ? I hope it is correct this time...

### lexman (2016-04-29T18:10:09Z)

Thanks @rgrp , it works !

I think the next step is to tweet about this new dataset. @pdehaye ?

### Branko-Dj (2018-04-20T12:09:49Z)

FIXED, The repo is located under `datasets` organization https://github.com/datasets/natural-gas-prices and it is also live on `datahub` https://datahub.io/core/natural-gas

### rufuspollock (2018-04-28T20:27:24Z)

@Branko-Dj great this up. One comment: this dataset should be named `natural-gas-prices` not natural gas (as per repo name). Please can we get this corrected in the datapackage.json and on datahub.io
