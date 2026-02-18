---
number: 57
title: Transparency / Corruption Index
state: closed
author: rufuspollock
created_at: "2014-08-03T09:08:50Z"
updated_at: "2015-06-01T08:27:47Z"
closed_at: "2015-06-01T08:27:47Z"
labels: ["Priority: ★★★"]
---

# Transparency / Corruption Index

E.g. Transparency International index

@christophergandrud would you be interested in pull this one together? Also are there other political economy datasets that you think would be of general importance and interest (that would merit being "[core datasets](http://data.okfn.org/roadmap/core-datasets)")?

## Comments

### christophergandrud (2014-08-03T16:26:36Z)

I could definitely work on this.

My one thought is that maybe it would make the most sense to work with Transparency International to help them  restructure their data in a more Data Science friendly way. 

At the least this would be having it available in one big panel-series formatted file that includes the Index for every year. At the best this would be creating a well structured API. As far as I can tell now you have to download Excel files in zips for each year. 

Working with them to restructure their data might be the most sustainable method going forward.

### rufuspollock (2014-08-04T09:25:38Z)

@christophergandrud my sense would be that short-term doing a simple scrape to get the data package up and running would be best as engaging with folks can take some time but that medium-term we should definitely engage!

### christophergandrud (2014-08-04T09:27:46Z)

Sounds like a good strategy to me! Cleaning the data might build a good
template for them to follow.

On Mon, Aug 4, 2014 at 10:25 AM, Rufus Pollock notifications@github.com
wrote:

> @christophergandrud https://github.com/christophergandrud my sense
> would be that short-term doing a simple scrape to get the data package up
> and running would be best as engaging with folks can take some time but
> that medium-term we should definitely engage!
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/57#issuecomment-51034994.

### Yannael (2015-02-28T02:49:36Z)

I have just tried my first package for this one, see https://github.com/Yannael/corruption-perceptions-index

### rufuspollock (2015-03-02T09:20:11Z)

@Yannael fantastic! Can you check the data package in the validator http://data.okfn.org/tools/validate and previewer http://data.okfn.org/tools/view and drop links to the results in here.

### Yannael (2015-03-02T19:35:04Z)

It is now validated and view seems correct.

On Mon, Mar 2, 2015 at 3:20 AM, Rufus Pollock notifications@github.com
wrote:

> @Yannael https://github.com/Yannael fantastic! Can you check the data
> package in the validator http://data.okfn.org/tools/validate and
> previewer http://data.okfn.org/tools/view and drop links to the results
> in here.
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/57#issuecomment-76679872.

## 

# 

Yann-Aël Le Borgne
Machine Learning Group
Université Libre de Bruxelles

http://mlg.ulb.ac.be

# http://www.ulb.ac.be/di/map/yleborgn

### Yannael (2015-04-19T07:25:28Z)

@rgrp I think this one is ready now

http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2FYannael%2Fcorruption-perceptions-index

http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2FYannael%2Fcorruption-perceptions-index

### rufuspollock (2015-04-19T08:08:51Z)

OK, great work. Some quick comments:
- View looks broken in that no data tables are displaying. I suspect looking at JS this is because having a '/" in a field name is bad news (sort of a bug in recline but anyway). Can we change Country/Territory either to simple Country or Jurisdiction or similar?
- I wonder if it would be useful to have all the data in one file. We could do this by adding a "year" column and then setting that for each source data year (are there any variations in data stored over the years? If so you would need to deal with that).
- datapackage.json seems to have some mis-indentation. Its not strictly invalid but would be nice to be consistently indented

### Yannael (2015-04-19T17:49:47Z)

- View looks broken: I had checked with Firefox and Chrome on MacOS X 10.7.5, there were no issues.  Checking now with Safari, I see that indeed nothing is displayed. I'll look into that, thanks.
- All data in one file: Yes there are variations (countries change from year to year, and besides, Transparency International did not use a consistent naming for the countries). I'll look deeper into that, indeed it would be nice to have a table with CPI/Years.
-  Datapackage.json: Noted

Thanks!

### Yannael (2015-04-21T07:38:12Z)

@rgrp I merged all the tables in one, and updated package files accordingly.
Two questions related to datapackage.json fields:
- The license is unclear, so I mentioned that in the License section. In this case, is it better to leave the license field of datapackage.json empty, or can I put the PDDL license there?
- Is it good practice to include contributors/maintainers fields?

### rufuspollock (2015-04-21T08:26:05Z)

@Yannael re license i would go for PDDL but have a note in the License section about data source and potential rights. See this thread for more https://discuss.okfn.org/t/copyright-on-data-sources/189 (Aside: we really should get guidance on this into the FAQ at http://data.okfn.org/doc/publish-faq as it comes up a lot)

Re contributors / maintainers: we do not use that systematically. I think we need some agreement on that. I think we probably need to sort this - see this issue https://github.com/dataprotocols/dataprotocols/issues/130

### Yannael (2015-04-21T18:41:02Z)

@rgrp Thanks. I sent a mail to Transparency International to make sure what the copyright is.

### rufuspollock (2015-04-26T18:25:57Z)

@Yannael let's get this in and not wait on response from TI. We can put in a "reservation" in the README. Personally given size of dataset I doubt there are DB rights but we can just comment to that affect.

### Yannael (2015-04-28T07:26:40Z)

@rgrp 
ok, I modified the README, and added to the datasets repository, and to core-list and catalog-list
