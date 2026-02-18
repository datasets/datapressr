---
number: 148
title: Genome sequencing costs
state: closed
author: rufuspollock
created_at: "2015-12-18T10:33:36Z"
updated_at: "2016-02-08T11:05:51Z"
closed_at: "2016-02-08T11:05:47Z"
labels: ["Type: Indicator", "Priority: ★★", "Format: Tabular", "Difficulty: easy"]
---

# Genome sequencing costs

Think this is a dataset worth of inclusion -- faster than Moore's law too!
## Sources
- http://www.genome.gov/sequencingcosts/ - this page has data from 2001 and some graphs. Data is in this excel sheet: http://www.genome.gov/pages/der/sequencing_costs_oct2015.xlsx
- pre 2001 ??

## Comments

### rufuspollock (2015-12-18T10:34:23Z)

@kiliakis another one for you to look at :-)

We both need some research to find earlier data (if you can't find any quickly i'd leave it) and to extract that excel file (remember to cache and commit a copy in `/archive/` if the file is not too big)

### kiliakis (2015-12-19T11:09:55Z)

@rgrp okay, I'm working on it, I will post any useful info I find

### kiliakis (2015-12-19T12:01:15Z)

@rgrp there are plots about genome sequencing cost per base: 
- http://synbiobeta.com/time-new-dna-synthesis-sequencing-cost-curves-rob-carlson/
- http://www.genomebiology.com/2010/11/5/207/figure/F2?highres=y

However, I can't really find the actual data. I will move on creating a dataset for these data.

### kiliakis (2015-12-21T10:02:15Z)

@rgrp Datapackage is ready, here are the links:
- Actual data package: https://github.com/kiliakis/genome-sequencing-costs
- [Validation link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Fgenome-sequencing-costs%2Fmaster%2Fdatapackage.json)
- [View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fgenome-sequencing-costs)

In order to improve this datapackage, we should add a logarithmic y-scale graph for the sequencing cost per Mb/ Genome. Is there any way of doing this using the view tool?

### pdehaye (2015-12-23T23:29:40Z)

I just submitted a pull request, slightly changing the way you format the month. 

As for the view, I don't know. One way to do it directly is to compute the log directly, add that as a column, then build the view. That might be the best way, I can see how some would just want the log directly.

### pdehaye (2015-12-24T01:00:12Z)

Added to the dataset registry

### rufuspollock (2015-12-24T10:41:05Z)

@kiliakis  re view i would not compute log directly - we need support for that in the view stuff (not there right now) and so do not worry now - even if imperfect (cf my comment re new view stuff for you https://github.com/dataprotocols/dataprotocols/issues/77 /cc @pdehaye

### kiliakis (2015-12-24T12:52:58Z)

@pdehaye Thanks for the fix in months format! ;) About direct log calculation, this would probably fix the graph's view and make it more readable. However it would be a partial solution as in a log scale graph it is the axis scale that changes and not the actual values of the data series. 
@rgrp I will start familiarizing with vega-lite.

### pdehaye (2016-01-21T22:05:31Z)

@kiliakis I have reopened this dataset because I just realised I did it wrong a month ago (sorry, still learning the ropes!). We need the dataset held by the datasets org to be the original repo, and yours (if you want to have one) to be a fork. From here, only you can proceed to correct the situation:
1. go to https://github.com/datasets/genome-sequencing-costs/settings and delete that repo
2. go to https://github.com/kiliakis/genome-sequencing-costs -> settings -> transfer ownership to the datasets organisation.

I could do 1. but not 2., and it's best if both are done in a close sequence.

This should do the trick!

### rufuspollock (2016-02-08T09:11:24Z)

@kiliakis ping ;-)

### kiliakis (2016-02-08T10:40:53Z)

@pdehaye, @rgrp oops, I missed that. Anyway, it looks like I don't have the permissions to modify a repository, as the settings icon is missing. I think, I can only create new repositories and transfer ownership from my github to datasets. Here is my view:
![screenshot from 2016-02-08 12 39 28](https://cloud.githubusercontent.com/assets/11835649/12883494/117837dc-ce61-11e5-88cd-78f33d4f3cc7.png)

### pdehaye (2016-02-08T10:56:24Z)

Then I will delete the datasets fork of your repo right now and you transfer ownership of your repo right after.

### pdehaye (2016-02-08T10:57:29Z)

Done, please try transferring ownership.

### kiliakis (2016-02-08T11:00:09Z)

Done

### pdehaye (2016-02-08T11:05:47Z)

Great! Problem solved, now closing.
