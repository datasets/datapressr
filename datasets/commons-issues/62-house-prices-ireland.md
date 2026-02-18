---
number: 62
title: House prices Ireland
state: open
author: PilipMac
created_at: "2015-01-04T21:42:49Z"
updated_at: "2019-12-02T19:54:59Z"
labels: []
---

# House prices Ireland

I'd like to put together a dataset for house prices in Ireland similiar to the UK one. The irish property price registery data starts from 2010. I look to see if data is avialable prior to 2010 also.

## Comments

### rufuspollock (2015-01-04T21:49:13Z)

@PilipMac this would be most welcome - definitely useful to have reasonably long-term historical time-series - also worth looking at what data BIS has (see link in #55)

### PilipMac (2015-01-04T21:50:53Z)

Thanks @rgrp let me do some research on the BIS site and elsewhere. I'll post an update in a couple of days.

### rufuspollock (2015-04-26T18:23:27Z)

@PilipMac any update here?

### smith-phil (2015-05-07T19:38:54Z)

To the best of my understanding, the historical data only goes back as far as 2010. There is an official register that contains the details of every house sold in the Republic of Ireland since January 1st 2010. The data is in many different csv files but all of them have the following headers:
- Date of Sale - in dd/mm/yyyy format, this obviously can be changed.
- Address 
- Postal Code - where applicable as only some parts of Ireland have a postal code to date
- County
- Price (€)
- Not Full Market Price - boolean value
- VAT Exclusive - boolean value
- Description of Property
- Property Size Description

Seems like the best solution to me. There is other historical data, such as the BIS site etc but none of them have the actual sale price for each residence.

### smith-phil (2015-05-07T19:41:27Z)

Oh yeah, I'm pilipmac by the way. I've a new account.

### rufuspollock (2015-05-08T08:16:22Z)

@smith-phil looks good - let's go for it.

### smith-phil (2015-05-09T11:30:38Z)

I'm scripting it up right now. I'll look at hosting it on morph.io or somewhere else while I'm at it. Here's the license information: http://www.psr.ie/website/npsra/npsraweb.nsf/page/copyright-en

### smith-phil (2015-05-31T08:05:18Z)

Nearly ready to start running on morph.io, hopefully this week. Then I'll get coding on github integration. 

Sorry it's taking so long, my spare time is v. limited at the moment.

### pdehaye (2015-12-01T16:02:07Z)

Giving this a bump. Any progress here?
