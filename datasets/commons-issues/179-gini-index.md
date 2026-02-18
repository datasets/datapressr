---
number: 179
title: GINI index
state: closed
author: rufuspollock
created_at: "2016-04-28T16:31:42Z"
updated_at: "2016-06-23T18:32:12Z"
closed_at: "2016-06-15T22:57:12Z"
labels: []
---

# GINI index

GINI is inequality index. Want this for as many countries as possible for as long as possible.

## Comments

### zelima (2016-04-28T18:36:59Z)

we could use  world bank data: http://data.worldbank.org/indicator/SI.POV.GINI

### rufuspollock (2016-04-29T11:20:36Z)

@zelima great.

@gsilvapt i suggest you take this on and @zelima can advise as necessary.

### gsilvapt (2016-04-29T11:24:00Z)

As soon as we take care of packaging those two others, this is my next one then :+1:

### gsilvapt (2016-04-29T14:32:52Z)

There you go: https://github.com/gsilvapt/gini-index/issues/1

That one is working, apparently. What are the next steps?

### rufuspollock (2016-04-29T16:47:24Z)

@gsilvapt please do post the validation and view links here ;-)

Also have you scripted the extraction so this can be run again and again automatically - you may want to look at #165 for an example of doing this with other World Bank data.

### gsilvapt (2016-04-29T16:49:10Z)

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

No, I haven't created a Python script. Still struggling with the other data package. I can work out on something yes, makes sense :smile:

### rufuspollock (2016-05-04T20:34:16Z)

@gsilvapt we really need it scripted to go in so that it is repeatable. You may want to look at other scripted world banks ones e.g. #165 

Again we will also want the data "normalized" here so:

```
Year, Country Code, Country, Value
```

### gsilvapt (2016-05-04T22:01:54Z)

Should that be the format of all data packages? I don't recall reading about that in the guides. Perhaps it should be added, if not already? Sorry for the off-topic question.

And yes, I haven't yet worked on the python script because I thought it would be better to prepare the datapackage and then work on that. Specially when other issues require the same script. Thanks for the guidance! ;)

### gsilvapt (2016-05-05T14:39:31Z)

[Latest commit](https://github.com/gsilvapt/gini-index/commit/60ad090ea7558b059c6d559e2c9f4897b0d36bd9) takes care of "normalizing" data.

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index%2F

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

### rufuspollock (2016-05-06T12:06:23Z)

@zelima can you review please and comment.

### zelima (2016-05-06T13:00:02Z)

Data is sorted by country names alphabetically, but not sorted by year. As an example:

```
Albania,ALB,1996,27.01
Albania,ALB,2005,30.6
Albania,ALB,2002,32.46
Albania,ALB,2012,29.98
Albania,ALB,2008,28.96
```

Think it would be better if it is sorted.

```
Albania,ALB,1996,27.01
Albania,ALB,2002,30.6
Albania,ALB,2005,32.46
Albania,ALB,2008,29.98
Albania,ALB,2012,28.96
```

Also REAMDE.md doesn't need Title as an opening line.
It would be good if you add separate README.md for usage in scripts directory eg: [like this](https://github.com/datasets/commodity-prices/tree/master/scripts)
We could also add Makefile eg: [like this](https://github.com/datasets/commodity-prices/blob/master/Makefile) (We need Makefile, right? @rgrp)

Overall it looks good to me. Great job @gsilvapt

### gsilvapt (2016-05-07T18:18:16Z)

Thanks for reviewing @zelima! Yes, the year sorting was something I was worried before but I guess we can work that out before publishing it.
I don't know if we need Makefile here. I'll let @rgrp answer.

Anyway, the to-do list for this package is:
- [x] Remove title from README.md
- [x] Create README.md for `/scripts`
- [x] sort data frame by country (alphabetically) _and_ by year (ascending);
- [x] prepare Python script to run automatically as per https://github.com/datasets/registry/issues/165
- [x] add Makefile

### rufuspollock (2016-05-08T14:48:22Z)

@gsilvapt yes you want a makefile as per @zelima - in general you can follow @zelima's suggestions 😄

### gsilvapt (2016-05-08T17:45:51Z)

Alright. I will have to read more about Makefiles and will have to work on something for all the other data packages then. Thanks, @zelima and @rgrp!

### gsilvapt (2016-05-09T17:04:47Z)

Newest version:

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

`Makefile` has been added and script is currently working.

Can anyone check if everything is correct this time? @rgrp @zelima Thanks!!

### zelima (2016-05-10T05:50:40Z)

Just a little correction - Think it will be better if country names are sorted in ascending order as well (From "A" to "Z").
After this fix Datapackage looks perfect to me.
well done @gsilvapt !!!

### gsilvapt (2016-05-10T09:30:30Z)

Didn't even noticed that. Weird though. I though I had it sorting things correctly. Thanks, @zelima!

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fgini-index

### zelima (2016-05-10T10:07:39Z)

@gsilvapt Great! 
@rgrp To me, this one is ready to publish.

### rufuspollock (2016-05-10T10:09:47Z)

@zelima great. Can you work with @gsilvapt to get it moved over and published on the site.

### gsilvapt (2016-05-10T10:11:33Z)

@zelima @rgrp I have the PR ready to publish the updated lists upstream. I don't know how can I transfer ownership, though.

### zelima (2016-05-10T10:12:16Z)

@rgrp I've never published anything on the site, some help would be useful.

### rufuspollock (2016-05-10T10:13:26Z)

@zelima read http://data.okfn.org/doc/core-data-curators#4-publishing - then ping me on gitter if help needed.

### zelima (2016-05-10T10:15:12Z)

@gsilvapt Go do repository settings, scroll down where the Danger zone is and click on transfer, fill the pop-up window as needed and as much as I remember that's all.

### gsilvapt (2016-05-10T10:18:08Z)

That requires authorization: `You don’t have admin rights to datasets`

### zelima (2016-05-10T10:22:39Z)

@gsilvapt  Make sure you are in  [**your**](https://github.com/gsilvapt/gini-index) repository settings

### gsilvapt (2016-05-10T10:25:17Z)

@zelima I need to become a member of the organization before changing ownership, thus it says "admin rights to datasets", where `datasets` is the organization I am trying to transfer to

### zelima (2016-05-10T10:42:04Z)

I'm not sure I have permission to make somebody a member of organization. @rgrp Think we need your help.

### gsilvapt (2016-05-10T10:43:22Z)

@zelima @rgrp I can take a print screen if needed

### rufuspollock (2016-05-12T10:44:38Z)

@zelima i have added @gsilvapt to the curators team and made you a "team maintainer" so you can add people going forward. https://github.com/orgs/datasets/teams/curators

I will now leave you two to manage the move-over of the repository.

### gsilvapt (2016-05-12T16:14:30Z)

@rgrp, thanks!

@zelima I am making the transfer now - Hopefully I'll do it it right :)

### zelima (2016-05-13T06:17:28Z)

@rgrp @gsilvapt PR is read https://github.com/datasets/registry/pull/185
We need merge and after I'll publish.

### gsilvapt (2016-05-13T09:20:51Z)

Merged!

### zelima (2016-05-13T17:05:47Z)

The data has landed here:  http://data.okfn.org/data/core/gini-index
It would be great if someone tweeted about this.

### gsilvapt (2016-06-15T22:57:12Z)

Data package available online. FIXED!

### rufuspollock (2016-06-23T18:32:12Z)

@pdehaye can we tweet about this one?
