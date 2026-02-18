---
number: 113
title: repository URL are not datapackage URL directory
state: open
author: femtotrader
created_at: "2015-09-15T05:04:30Z"
updated_at: "2015-11-29T02:00:17Z"
labels: ["Tooling: bug"]
---

# repository URL are not datapackage URL directory

Hello,

I noticed that it's strange to see how data are given in this repository

For example in `core-list.txt`

We can find this repository
https://github.com/datasets/gold-prices
datapackage can be found in https://raw.githubusercontent.com/datasets/gold-prices/master/
( see https://raw.githubusercontent.com/datasets/gold-prices/master/datapackage.json )

but some other repository behave differently

https://github.com/theodi/hot-drinks

contains `datapackage.json`

but it's available at

https://raw.githubusercontent.com/theodi/hot-drinks/gh-pages/datapackage.json

not

https://raw.githubusercontent.com/theodi/hot-drinks/master/datapackage.json

You might noticed this `gh-pages`

That's quite strange and not very convenient if we want to use `datasets/registry` for testing purpose of some datapackage tools.

My suggestion is

datapackage URL directory should be given instead of repository URL
(ie https://github.com/datasets/gold-prices should be replaced by https://raw.githubusercontent.com/datasets/gold-prices/master/ or https://raw.githubusercontent.com/datasets/gold-prices/master/datapackage.json )

but if there is only an issue with this `gh-page`, an other columns with `gh-page` should be given (most of data being `False`)

An other approach could be to have an other column with datapackage.json URL (when URL can't be found obviously)

Kind regards

## Comments

### femtotrader (2015-09-15T05:44:52Z)

An example of the problem with https://github.com/theodi/hot-drinks

DataPackage Viewer is not able to "discover" data without a "full" URL

http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftheodi%2Fhot-drinks%2Fgh-pages%2Fdatapackage.json

### femtotrader (2015-09-19T09:12:12Z)

My opinion is, in fact, that an other column "branch" is necessary.
branch could be "master" or "gh-pages"
