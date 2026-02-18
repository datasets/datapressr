---
number: 20
title: World Bank - World Development Indicators
state: open
author: vincentarelbundock
created_at: "2013-05-31T09:13:40Z"
updated_at: "2019-12-02T19:54:59Z"
labels: []
---

# World Bank - World Development Indicators

http://data.worldbank.org/
http://data.worldbank.org/summary-terms-of-use

## Comments

### rufuspollock (2013-05-31T11:45:43Z)

@vincentarelbundock like it. Do you have some specific suggestions for indicators to include?

### vincentarelbundock (2013-05-31T12:11:04Z)

Oh I don't know. All of them? I'm not entirely sure I understand what the scope of your project is, so I guess it would depend. All 8000+ World Development Indicator series (country-year panels, mostly) are available in one big CSV file. It's just a matter of pivoting the axes if you want series as columns and country-year indices as rows. I've done a little bit of work with this dataset, so I may be able to help a bit, but it's all very straightforward. 

http://cran.r-project.org/web/packages/WDI/index.html

### rufuspollock (2013-05-31T12:20:31Z)

What's the link to the big CSV file and how big is it?

In the first instance I think we probably want to have one series per dataset (part of the purpose of using CSV and git is that we can track changes in the data better which is hard in one massive file)

### vincentarelbundock (2013-05-31T12:24:58Z)

Here on the right-hand side

http://data.worldbank.org/data-catalog/world-development-indicators

### rufuspollock (2013-05-31T12:43:01Z)

Thanks - other thing i notice is you may be a bit of an R expert. As such wonder if you would be interested to contribute on this issue https://github.com/okfn/data.okfn.org/issues/23

BTW: if you want to understand more about what this is about see http://data.okfn.org/ and esp http://data.okfn.org/about
