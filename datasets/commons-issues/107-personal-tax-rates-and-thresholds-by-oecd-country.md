---
number: 107
title: Personal Tax Rates and Thresholds by OECD Country
state: open
author: mcnabber091
created_at: "2015-07-28T04:09:45Z"
updated_at: "2019-12-02T20:11:26Z"
labels: ["Type: Indicator"]
---

# Personal Tax Rates and Thresholds by OECD Country

Data can be found under OECD Stat Extracts, Public Sector, Tax Database, Individual Tax Rates: http://stats.oecd.org/

## Comments

### rufuspollock (2015-07-28T10:14:40Z)

Is this the most comprehensive version of the data? Definitely think worth packaging.

### mcnabber091 (2015-08-01T23:16:04Z)

This is the most comprehensive version of this data in excel format I have found on the internet. It has data for all OECD countries.

PKF and EY have pdfs for every country (not excel files) with this personal tax rate and threshold information. Their data is not open but you can get permission to use their data (I had to get written permission from PKF to use their data for econfactbook.org). I don't think PKF's data is usable for the Core Datasets Project.

I would love to see an excel file with all the tax rate and threshold data for every country but unfortunately this does not exist to my knowledge.

### mcnabber091 (2015-08-01T23:16:38Z)

I can start prepping for this data

### pdehaye (2015-11-29T02:20:16Z)

Hi @mcnabber091, have you made any progress?

### mcnabber091 (2015-11-29T20:43:59Z)

Hi @pdehaye , sorry i havn't had time to work on this one. Would you be interested to work on this one? I am not very good with Github right now.

### rufuspollock (2015-11-30T10:03:29Z)

@mcnabber091 see my comment on #106

### pdehaye (2015-12-01T15:11:45Z)

Hi @mcnabber091. I am just joining as new datasets managing curator. I think I can be most effective for OKFN Labs right now by focusing on sorting out a bit of the overall process, rather than focusing on specific datasets. If you want to abandon the issue/dataset, that's fine, but please leave enough information here (and in the other similar issues) that someone new can take over. I will then flag it as just "Discussion and research", so it can be re-assigned. Thanks!

### mcnabber091 (2015-12-07T03:30:20Z)

Here is the Google Doc for this data: https://docs.google.com/spreadsheets/d/1nBTo4Rhrl9hqi5IGV6g-NPS3Rx3MpAY3ywD9Bp_oQO8/edit?usp=sharing

### pdehaye (2015-12-10T23:20:41Z)

Thanks, @mcnabber091, you left this in a very good state :)

### gsilvapt (2016-05-02T11:47:31Z)

You can find the data package in this [repo I made](https://github.com/gsilvapt/tax-registry)

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Ftax-registry

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Ftax-registry

I am concerned with all those ".." instead of blank or 0's. Should I change that to improve data quality?

### rufuspollock (2016-05-03T19:11:06Z)

@gsilvapt looks good.
- yes we should replace .. with blank if it 
- Re file naming: use `-` between words e.g. `tax-rate-country` rather than `taxratecountry`
- a description of the columns would be useful 
- Data Package as a whole might want a better name (tax-registry is probably not perfectly accurate)
- There is no README.md - this is essential ... - please see curator docs for how this should be structured

In all good work.

Lastly: Please keep posting here (and not in issues for that repo) - at least for updates and whilst we are preparing this package.

### gsilvapt (2016-05-03T21:26:05Z)

> There is no README.md - this is essential ... - please see curator docs for how this should be structured

Is there something wrong with [this](https://github.com/gsilvapt/tax-registry/blob/master/readme.md) readme?

Thanks for the feedback. I'll improve this package soon.

### gsilvapt (2016-05-03T23:01:51Z)

Most modifications have been pushed to the repository, even though I cannot help much in writing a a description of the columns. The data is not very concise about it and the source links are not working.

@mcnabber091 Do you think you can give us a hand writing a description for the many columns? I can teach you how to edit the JSON file if you need help!

### rufuspollock (2016-05-04T20:37:55Z)

@gsilvapt great - the README looks good though please can you rename to `README.md` rather than `readme.md` (minor but a convention). Also it looks like `LICENSE` section has ended up as part of the last bullet point of the previous section.

### gsilvapt (2016-05-04T22:05:27Z)

> the README looks good though please can you rename to README.md rather than readme.md (minor but a convention).

Done.

> Also it looks like LICENSE section has ended up as part of the last bullet point of the previous section.

I'm sorry but I didn't understand. Can you rephrase that, please?

In regards to the package name, I couldn't come up with anything decent/interesting. Can someone give a suggestion?

### rufuspollock (2016-05-06T12:06:07Z)

@gsilvapt look at the indentation of the LICENSE heading.

Re naming suggest:

`tax-rates-personal`
