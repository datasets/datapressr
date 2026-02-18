---
number: 16
title: Currency Codes
state: closed
author: KitWallace
created_at: "2013-04-24T15:31:49Z"
updated_at: "2013-05-18T13:58:25Z"
closed_at: "2013-05-18T13:58:25Z"
labels: []
---

# Currency Codes

The links need to be updated - (coincidentally I commented on this in the datahub http://datahub.io/dataset/iso-4217-currency-codes a couple of hours ago)

This table is not really currency codes, its country/currency codes so is denormalized so  USD appears in several places as a result. The table is misnamed and less useful as a result.

Oddly too, the reference to a country is by name not by ISO 3166 code. Do you have a policy around linking/foreign keys?

Of course, some folk would use the XML 'package' directly http://www.currency-iso.org/dam/downloads/dl_iso_table_a1.xml  :)

## Comments

### rufuspollock (2013-04-24T16:07:41Z)

@KitWallace can you do a pull request? iso 3166 codes would be best.

### KitWallace (2013-04-24T16:51:22Z)

But should country be there at all?  Maybe both the country/currency table and a factored currency table would be better?  Looking more closely at the data, I see that an additional country code would be needed because entity is not always a country.

### rufuspollock (2013-05-18T13:58:25Z)

Moving to https://github.com/datasets/currency-codes/issues/1 where it should be (registry is just for new datasets)
