---
number: 122
title: Big Mac Index
state: open
author: rufuspollock
created_at: "2015-11-03T10:37:59Z"
updated_at: "2023-09-05T15:31:28Z"
labels: ["Type: Indicator", "Priority: ★★★", "Difficulty: easy"]
assignees: [saad-gh]
---

# Big Mac Index

http://www.economist.com/content/big-mac-index

http://infographics.economist.com/2015/databank/BMfile2000-Jul2015.xls

Very straightforward to do :-)

## Comments

### zelima (2016-04-16T07:04:36Z)

@rgrp I'll take this one.

Output: big-mac-index.csv

preview

```
Country,Date,Local price,Dollar ex,Dollar price,Dollar ppp,Dollar valuation
Argentina,2000-04-01,2.50,1.00,2.50,1.00,-0.40
Argentina,2001-04-01,2.50,1.00,2.50,0.98,-1.57
...
Argentina,2015-01-01,28,9.14,3.07,5.85,-36.01
Australia,2000-04-01,2.59,1.68,1.54,1.03,-38.58
```

### rufuspollock (2016-04-16T08:25:42Z)

Great. Remember we would like a chart as well.

### zelima (2016-04-18T16:52:15Z)

@rgrp please review
validation link: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fbig-mac-index
view link: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fbig-mac-index
Repository: https://github.com/zelima/big-mac-index

### rufuspollock (2016-04-24T10:30:16Z)

@pdehaye can you cast your eye and see if this looks good?

### pdehaye (2016-04-25T13:14:12Z)

This generally looks good, but the graph is suboptimal. This does not link prices at different times for the same country together (country against country, as time evolves), which would be the most immediately accessible presentation.

### zelima (2016-04-25T16:25:26Z)

To link price with different time periods, we have to divide datapackage. So there will be different CSV files for each country. 
Right now, any other combination for x and y axis makes graph unreadable.

### rufuspollock (2016-04-27T22:01:53Z)

@zelima i think this is one where you cannot do a graph without pivoting so for now i would not do a graph. The need for things like pivoting is why we need to switch to new "View" support - see https://discuss.okfn.org/t/data-packages-views-graphs-maps-tables-etc/2667

### zelima (2016-04-29T10:18:47Z)

@rgrp got it - removing the graph from view.

### anuveyatsu (2023-09-05T15:31:28Z)

Hi @zelima hope you're doing great! 😄  It would be great if you could move this dataset from your own account to this org? https://github.com/zelima/big-mac-index
