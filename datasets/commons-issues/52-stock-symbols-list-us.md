---
number: 52
title: Stock Symbols List - US
state: closed
author: rufuspollock
created_at: "2014-05-16T15:58:18Z"
updated_at: "2015-06-01T17:55:25Z"
closed_at: "2015-06-01T17:55:25Z"
labels: ["Priority: ★★★"]
---

# Stock Symbols List - US

A complete list of all NYSE stock symbols (plus company name).

TODO: work out what symbol list(s) we want.

Note EDGAR also have a symbol list: http://okfnlabs.org/blog/2014/03/04/sec-edgar-database.html plus see bloomberg list in #25

## Comments

### joehand (2015-01-10T21:46:28Z)

I created a [data package](https://github.com/joehand/nasdaq-nyse-listings) for this using data available on NASDAQ's FTP (see readme). First time making a data package, let me know if I missed something.

There are a two datasets available on the FTP NASDAQ listings and all other listing. I made a separate fine for just the NYSE listings (from the other dataset).

### joehand (2015-01-10T21:49:25Z)

Oh a few questions too:
- I couldn't find anything about the data license on the NASDAQ site.  Is there a suggested license for the data?
- NASDAQ provides the file creation time but I didn't see that in the datapackage.json schema. Is that something that would be useful to keep track of?

### rufuspollock (2015-01-26T15:12:17Z)

@joehand can you clarify if you just have the nasdaq symbols. I'm starting to think we may want multiple files or even multiple data packages.

I've also updated the description to reflect this todo.

### rufuspollock (2015-04-09T20:45:14Z)

@joehand any developments here? We can do multiple packages here if needed.

### joehand (2015-04-11T10:57:06Z)

@rgrp, NASDAQ separates out the data into two files, _NASDAQ-Listed Securities_ and _Other Exchange-Listed Securities_, as seen [here](http://www.nasdaqtrader.com/trader.aspx?id=symboldirdefs) in the documentation. 

The NYSE is a subset in the _Other Exchange-Listed Securities_. There are four exchanges included in the _Other Exchange-Listed Securities_:
- NYSE MKT
- New York Stock Exchange (NYSE)
- NYSE ARCA
- BATS Global Markets (BATS)

It seems we should at least follow NASDAQ separation and have two separate packages (NASDAQ and Other). I don't know enough about the _Other Exchange-Listed Securities_ to say whether those should be also separated.

### rufuspollock (2015-04-12T19:30:33Z)

@joehand sounds good. Do you want to make a start with whatever is easiest and we go from there.

### rufuspollock (2015-04-26T18:28:20Z)

@joehand how are you doing here? Let's do the simplest thing possible and then add more later.

/cc @Yannael

### joehand (2015-04-27T17:53:38Z)

@rgrp I updated the [original repo](https://github.com/joehand/nasdaq-nyse-listings) to just have NASDAQ data and I added [another repo](https://github.com/joehand/nyse-listings) for the _Other Listings_ (which includes a filtered file for NYSE only).

### rufuspollock (2015-04-28T07:35:56Z)

@joehand this is great. Are you happy to commence the process for getting into core? see http://data.okfn.org/doc/core-data-curators#3-quality-assurance

/cc @Yannael

### joehand (2015-05-04T20:39:24Z)

QA For [NASDAQ Package](https://github.com/joehand/nasdaq-listings): 
- [Validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjoehand%2Fnasdaq-listings%2Fmaster%2Fdatapackage.json)
- [View](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fjoehand%2Fnasdaq-listings)

QA for [NYSE/Other Package](https://github.com/joehand/nyse-listings):
- [Validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjoehand%2Fnyse-listings%2Fmaster%2Fdatapackage.json)
- [View](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fjoehand%2Fnyse-listings)

### rufuspollock (2015-05-30T07:10:01Z)

@Yannael are you able to review this to see if we can get this in?

### Yannael (2015-06-01T07:42:36Z)

@joehand @rgrp 
Sorry for the late review, I had missed it from the queue.
Nice, a couple of changes to make:
- For the License, a link should be made to their Copyright page http://www.nasdaqtrader.com/Trader.aspx?id=CopyDisclaimMain. I would suggest using the same Licensing as https://github.com/datasets/geo-nuts-administrative-boundaries#license, adapting the copyright notice link to the Nasdaq page.
- For the datapackage.json
  - in NASDAQ package. The name should be changed to "nasdaq-listings"
  - For both packages, adding the sources and licenses fields would be nice (see for example https://github.com/datasets/geo-nuts-administrative-boundaries/blob/master/datapackage.json)

I can take care of making these changes to speed up the integration of these packages in the core repository. 

Can you finally transfer the ownership of both repos to me, so I can then transfer them to the 'datasets' organization?

Thanks!

### joehand (2015-06-01T16:49:53Z)

@Yannael great, I transferred the NYSE repo. It looks like you already have a nasdaq-listing repo, so I can't transfer that one (I tried renaming and that didn't work either). Let me know when you delete the other repo and I can transfer it.

Thanks.

### Yannael (2015-06-01T17:14:33Z)

@joehand deleted, can you retry?

### joehand (2015-06-01T17:16:19Z)

@Yannael worked this time! Let me know if there is anything else I can help on. Thanks for your help!

### Yannael (2015-06-01T17:19:12Z)

@joehand Great! I'll make the couples of changes mentioned above, and transfer. I let you know when done. Thanks for the contributions!

### Yannael (2015-06-01T17:54:54Z)

@rgrp @joehand Transferred
