---
number: 289
title: Bitcoin Prices
state: open
author: app/
created_at: "2018-04-27T11:36:17Z"
updated_at: "2024-03-29T12:28:49Z"
labels: []
---

# Bitcoin Prices

Final [Bitcoin prices repo](https://github.com/otruja/bitcoin-prices) with data package automated to update the data daily.

## Comments

###  (2018-04-27T11:37:31Z)

https://www.coindesk.com/price/ - generates .csv, but restricted by the terms of use, quote,

_You may use the Content online and solely for your personal, non-commercial use, and you may download or print a single copy of any portion of the Content for your personal, non-commercial use, provided you do not remove any trademark, copyright or other notice contained in such Content._ 

_You may not, for example, republish the Content on any Internet, Intranet or Extranet site or incorporate the Content in any database, compilation, archive or cache or store the Content in electronic form on your computer or mobile device unless otherwise expressly permitted byCoinDesk_

###  (2018-04-28T06:31:07Z)

Can't find any legal on this [website](https://coinmarketcap.com/currencies/bitcoin). Will write script and do Github repo for it.

###  (2018-04-28T07:28:28Z)

Here's [GitHub repo](https://github.com/otruja/bitcoin-prices) with the script for this source and received data. 

Need advice though on how to workaround data validation error - .csv in archive directory has bad values in the last rows on the column 'Volume". One solution is to request the data from the website only for the dates with valid values, but probably this error might be ignored (since final data is valid and got no errors).

### anuveyatsu (2018-07-12T16:15:29Z)

@Branko-Dj can we get this dataset published?

### rufuspollock (2018-09-01T13:36:56Z)

@anuveyatsu what happened here? There's no update and sprint completed.

### Branko-Dj (2018-09-05T21:07:17Z)

@rufuspollock @anuveyatsu Data on coinmarketcap.com is protected by copyright https://coinmarketcap.com/terms/. There it says:

> Prohibited Activities
> You agree that you will not:
> 
> Copy, modify or create derivative works of the Service or any Content;
> Copy, manipulate or aggregate any Content (including data) for the purpose of making it available to > > any third party;
> Trade, sell, rent, loan, lease or license any Content or access to the Service, whether commercially or > free of charge;
> Use or introduce to the Service any data mining, crawling, "scraping", robot or similar automated or > > > data gathering or extraction method, or manually access, acquire, monitor or copy any portion of the > > Service, or download or store Content (unless expressly authorized by CMC). Certain data and other > > information within the Service is available by subscription, or for a fee, at https://pro.coinmarketcap.com;

So I scraped cryptocurrency data from a different website coinmetrics.io. Data can be found at https://datahub.io/cryptocurrency

### zelima (2018-09-06T03:41:27Z)

@Branko-Dj can we add views to the datasets? Nice time series graphs would be great here I think. Once that's done, think we can close this one

### Branko-Dj (2018-09-06T05:31:13Z)

@zelima Yes I think that will be nice. I will add some views for better look

### zelima (2018-10-03T11:37:20Z)

@Branko-Dj where this dataset lives on GitHub can't find under `datasets` organization https://github.com/datasets/bitcoin-prices. 

Is it still under @otruja , if so @otruja could you please transfer ownership so that I can do modifications to it and re-publish

### rufuspollock (2018-11-01T08:13:25Z)

@zelima what is happening here? If necessary just clone the original repo and push directly to github.com/datasets ...

### Branko-Dj (2018-11-01T09:58:49Z)

I am currently working on this

### rufuspollock (2019-01-06T14:40:52Z)

@Branko-Dj what happened?
