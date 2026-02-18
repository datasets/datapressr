---
number: 201
title: CIA World Factbook
state: open
author: rufuspollock
created_at: "2016-11-20T08:41:59Z"
updated_at: "2017-10-02T00:05:45Z"
labels: []
---

# CIA World Factbook

CIA world factbook is a top candidate for being data packagized ...

/cc @geraldb - i see you've been doing some work around this recently

## Comments

### geraldb (2016-11-20T08:56:29Z)

@rgrp You're more than welcome to (re)use what you can, see - [/opendatajson/factbook.json](https://github.com/opendatajson/factbook.json) for country profiles datasets in JSON.  If anyone is interested some background and talks notes titled "[factbook.json - Turn the World Factbook into Open (Structured) Data](https://github.com/geraldb/talks/blob/master/factbook.md)".    

About packaging - the factbook is more document-oriented (thus, "nested" JSON datasets to include everything incl. inconsistencies and "known" errors/typos etc.). Adding a subset, however, would work great for (one or more) tabular data packages (in CSV).  Keep up the great work on datapackage.json and friends. Cheers.

### rufuspollock (2016-11-20T09:13:29Z)

@geraldb awesome. Do you have any notes on the factbook structure and any scraping code to point to? (BTW: I remember scraping the factbook almost 10y ago in python but, typically, can't locate my code now!)

### geraldb (2016-11-20T09:28:29Z)

@rgrp Sure. More than welcome. All code and scripts public domain. The ruby script (packaged as a gem) -> [/factbook/factbook](https://github.com/factbook/factbook). All codes in csv [/factbook/data/codes.csv](https://github.com/factbook/factbook/blob/master/data/codes.csv) and (most) categories mapped to attributes [factbook/data/attributes.yml](https://github.com/factbook/factbook/blob/master/data/attributes.yml). That's the "real world" auto-generated list - [factbook/CATEGORIES.md](https://github.com/factbook/factbook/blob/master/CATEGORIES.md) with a counter how many profile use the category.  And if interested - there's a build script - to automate fetching and generating the datasets - [/yorobot/factbook](https://github.com/yorobot/factbook).  Again everybody welcome to (re)use whatever you can. All public domain (dedicated). Cheers.

### rufuspollock (2017-09-16T20:29:45Z)

@geraldb i'm quite interested in trying to (tabular) data package this. Do you have an SQL version of the data - that would be the easiest to convert to CSV.

Also i looked briefly at the yorobot scripts but wasn't sure the best place to start -- any tips?

/cc @Mikanebu

### geraldb (2017-09-17T09:55:26Z)

@rufuspollock Thanks again for the interest in packaging the factbook datasets. Love the (tabular) data packages. 

As written before - this factbook repo and approach maps the original CIA factbook data sources (in html pages) with minimal clean-up 1:1 to "document-oriented" datasets. One "country" page one json dataset. An example, is France (which includes Metroplitan France and its overseas territories in a single country document, for example). Thus, as is you cannot map it without extra mapping to tabular structured data.

The good news. @iancoleman has written an alternative factbook parser [1] that includes much more clean-ups and mappings, and, thus, might be way easier to use for packing up in tabular datasets. 

[1] https://github.com/iancoleman/cia_world_factbook_api#data

Maybe @iancoleman can comment?  By the way, great initiative / project. Always great to see alternatives / new factbook parsers / datasets / projects. 

Or maybe repost or open an issue / ticket on at the iancleman's cia_world_factbook_api repo to get things started over there. 

Again thanks for the update and interest. Keep it up. 

/cc @Mikanebu

### rufuspollock (2017-09-26T07:08:28Z)

@geraldb thanks for the great suggestions.

@iancoleman - any thoughts? Also do you have a schema for your data anywhere? Would it be possible make a table schema (https://specs.frictionlessdata.io/table-schema/) for it?

### iancoleman (2017-09-27T00:13:17Z)

For tabular data, have a quick look at https://iancoleman.github.io/explorer-cia-world-factbook/ which can create csv output; needs a bit of ux attention (eg a [select all columns button](https://github.com/iancoleman/cia_world_factbook_api/issues/8), [handle lists](https://github.com/iancoleman/cia_world_factbook_api/issues/9) etc) but let me know if this is along the lines you're looking for.

There isn't a formal schema but once the parser is a bit more mature this will happen. See https://github.com/iancoleman/cia_world_factbook_api/issues/7

As for data being packagized, could you elaborate a bit more on that? I've somewhat bundled the data, see [the 'data' section](https://github.com/iancoleman/cia_world_factbook_api#data) of the readme but it sounds like you're going for something a bit more formal...?

### rufuspollock (2017-09-29T17:40:27Z)

@iancoleman i'm thinking about packaging (some of the data) as tabular data packages:

http://frictionlessdata.io/data-packages/
http://frictionlessdata.io/guides/tabular-data-package/

https://specs.frictionlessdata.io/tabular-data-resource/

Especially adding a Table Schema https://specs.frictionlessdata.io/table-schema/

### iancoleman (2017-10-02T00:05:45Z)

Thanks for the additional info. At this stage no plan for packaging, but it will happen at some point. I'll be tracking progress in https://github.com/iancoleman/cia_world_factbook_api/issues/7 so if there's any further info you think may be beneficial please post it in that issue.
