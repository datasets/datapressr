---
number: 4
title: JODI Oil Database (?)
state: open
author: rufuspollock
created_at: "2013-03-02T11:12:55Z"
updated_at: "2019-12-02T19:54:59Z"
labels: []
---

# JODI Oil Database (?)

http://www.jodidata.org/database/access-database.aspx

Not quite sure what is in there but seems to be oil reserves etc

## Comments

### sanh2o (2015-01-21T01:41:17Z)

They have 13 product, 14 flows data in 3 different units per their site description starting from 2002 and updated monthly. These can be downloaded as txt / csv or .ivt (?) and there exist 4 or 5 different files with one containing indexes and explanations.

### rufuspollock (2015-01-21T05:44:51Z)

@sanh2o could you summarize here what exactly the 13 product + 14 flows (+ 3 different units are) here (or in a gist or spreadsheet if more useful). We can then make a decision about what to pull.

### sanh2o (2015-01-23T01:22:50Z)

Summary of Jodi data categories 
https://gist.github.com/sanh2o/4a45e93ac52c8c9266dd

Inlined:

```
Thirteen product categories:

Crude oil
NGL
Other (refinery feedstocks + additives/oxygenates + other hydrocarbons)
Total (primary products)
LPG
Naptha
Motor/aviation gasoline
Kerosenes
of which: Kerosene type jet fuel
Gas/diesel oil
Fuel oil
Other oil products
Total oil products

Fourteen flows:

Production
Production From Other sources
Trade
Products transferred/Backflows
Direct use
Stock change
Statistical difference
Refinery intake
Closing stocks
Refinery output
Receipts
Products transferred
Interproduct transfers
Demand

Data in three different units:

barrels
tons
litres

Data for more than 90 participating countries;
Data from January 2002 to one month-old.
```

### pdehaye (2015-12-01T15:59:45Z)

Giving this a bump. Any decision taken?

### rufuspollock (2015-12-02T12:52:16Z)

@sanh2o do you have any stats on each item or a description.
