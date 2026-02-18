---
number: 243
title: Mental Health Data
state: open
author: rufuspollock
created_at: "2018-01-24T18:52:33Z"
updated_at: "2019-11-28T16:37:03Z"
labels: []
---

# Mental Health Data

e.g. some of the infographics data here: https://www.nami.org/Learn-More/Mental-Health-By-the-Numbers

> Nearly seven percent of adults in the U.S. had at least one major depressive episode in the past year. Suicide rates doubled among teen girls from 2007 to 2015.

Are things getting better or worse, where and (maybe) why? (Why is hard!)

## Comments

### cabral (2019-09-04T09:45:54Z)

The source is not widely available, so I focused on the Tech mental health survey from Kaggle.

The [data package](https://datahub.io/docs/getting-started/installing-data) works perfectly. 
The output of `$ data push survey.csv`  (tech industry mental health survey). Creates [Tech mental health](https://datahub.io/felipe.cabral/tech-mental-health)

I tried the same process with `[dataflows](https://github.com/datahq/dataflows)`, but the output comes empty. The same happens with the data provided for the tutorial. 

Working with @anuveyatsu for the solution...

### anuveyatsu (2019-09-04T11:40:28Z)

@cabral great!

Re dataflows, @svetozarstojkovic any thoughts on that?

Re published dataset on datahub, that's cool it was smooth to publish this. When you push a CSV data, the tool auto-generates `datapackage.json` which is minimal. E.g., you can see there is no README, no license and source. You can check https://datahub.io/blog/how-to-initialize-a-data-package-using-data-tool to generate custom datapackage.json etc.
