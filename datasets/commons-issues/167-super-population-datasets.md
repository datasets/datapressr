---
number: 167
title: "[super] Population Datasets"
state: open
author: rufuspollock
created_at: "2016-03-09T12:59:16Z"
updated_at: "2016-10-10T09:10:01Z"
labels: []
---

# [super] Population Datasets

This is a "super" issue for population datasets.
- <del>Total Population (over time, at least for last 10-20 years) for all countries</del> - see https://github.com/datasets/population
- Country Population broken down e.g.
  - Male/Female population
  - Age bands (example: 0-5, 6-12, 13-20, 21-35, 36-50, 51-70, 70-?)
- <del>City Population</del> #30

## Comments

### zelima (2016-07-05T14:34:28Z)

@rgrp 
- World bank data for male/female %  from 1960 - 2014 http://data.worldbank.org/indicator/SP.POP.TOTL.FE.ZS?end=2014&start=1960&view=chart
- World bank data for age bands:
  - < 14 http://data.worldbank.org/indicator/SP.POP.0014.TO.ZS?end=2014&start=1960&view=chart 
  - 15-65 http://data.worldbank.org/indicator/SP.POP.1564.TO.ZS?end=2014&start=1960&view=chart 
  - 65 < http://data.worldbank.org/indicator/SP.POP.65UP.TO.ZS?end=2014&start=1960&view=chart

### zelima (2016-08-08T08:40:51Z)

@gsilvapt Could you help with this one?

### gsilvapt (2016-08-08T13:29:40Z)

@zelima 

Yes, I can. The idea is to divide the data sets i 1) male/female set; 2) from the different age bands you have there, correct?

Notice: I will be out of town until Saturday, so this might take some extra time.

### zelima (2016-08-08T14:59:53Z)

@gsilvapt that's great!
There's no need of rush, you can start packaging when you have time for it. :)

### gsilvapt (2016-08-08T18:55:10Z)

@rgrp and @zelima 

If we are following the structure proposed above in [this](https://github.com/datasets/registry/issues/167#issue-139570610) comment, would not it make sense to merge all data sets into a single set called "Population"? We can explain the division in the README file.

### zelima (2016-08-09T08:49:12Z)

@gsilvapt That could be an option. What's your thoughts about this @rgrp?

As a starting point, we could start packaging them as several small ones and if there's need we will merge after.

### rufuspollock (2016-08-09T08:55:53Z)

@zelima @gsilvapt this is a "super" issue so generally we would not generate a data package to address this issue but would create data packages for all the subissues it references.

In that spirit, @zelima you should create a separate issue for the "population broken down" (as per info in your [comment](https://github.com/datasets/registry/issues/167#issuecomment-230496035) above). And then link that from the main description for this issue.

In general, I prefer the "small is beautiful" approach to creating data packages - rather than one massive data package several smaller ones. That said, there are times where data should clearly go in one whole data package so there is an aspect of judgment.

To make any decision here we'd need to clearly lay out what we wanted to merge together.

### zelima (2016-08-09T09:11:39Z)

@rgrp Think we can come up with two datapackages here:
- male/female population, named `population-by-gender`
- Age bands, namd `population-by-age`
  with structure like this

```
year,age,percentage
1960,0-15,30
1960,15-65,50
1960,65-above,20
1961,0-15,35
...
```

### gsilvapt (2016-08-09T09:42:44Z)

@rgrp The items to merge would be the total population, country population (divided by male/female and age bands) and city population, as a single data set. However, your point about "supper" makes sense and it would be easy to leave things as they are right now and just add another set with the structure of @zelima's last comment.

### rufuspollock (2016-10-10T09:10:01Z)

@zelima can we edit the main description to update with the population-by-xxx items - and sources where they would come from.
