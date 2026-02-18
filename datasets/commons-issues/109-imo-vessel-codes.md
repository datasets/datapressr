---
number: 109
title: IMO Vessel Codes
state: open
author: cmsdroff
created_at: "2015-08-19T13:45:09Z"
updated_at: "2025-09-24T15:08:16Z"
labels: ["Type: Reference", hackathon]
---

# IMO Vessel Codes

@rgrp as discussed on issue #108 moved to separate issue for packaging.

Data set is the IMO Vessel Codes for all vessel types that have an IMO code.

We have scraped just under 10,000 data items, and will do a full scrape just before publishing.  The data provided is to ensure we meet the packaging requirements, as a full scrape will take a couple of hours due to amount of data and API limits in place.

Can you confirm all ok and we will upload the final data before you merge in.

## Comments

### cmsdroff (2015-08-19T13:47:10Z)

data package at https://github.com/warrantgroup/IMO-Vessel-Codes.git

### rufuspollock (2015-08-19T15:44:30Z)

Great. Could you do the quality assurance step detailed at:

http://data.okfn.org/doc/core-data-curators#3-quality-assurance

Basically post a validation and view link for the data package.

### cmsdroff (2015-08-19T16:15:19Z)

@rgrp valid and displays correctly

http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwarrantgroup%2FIMO-Vessel-Codes%2Fmaster%2Fdatapackage.json

http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fwarrantgroup%2FIMO-Vessel-Codes%2Fraw%2Fmaster%2Fdatapackage.json

Only question i had was regards the license, data is scraped from mentioned sources using a script, last one we published was from the UN CEFACT for Package Code published under the PDL license, would this be the same?

### rufuspollock (2015-08-19T16:42:38Z)

Looks great and ready to go.

Re license I suggest following approach in http://data.okfn.org/doc/publish-faq#-strong-license-strong-

Specifically i would apply PDDL license but note point about scraping - this goes in a section called "License" (see the faq for details).

### cmsdroff (2015-08-19T20:09:45Z)

Thanks @rgrp i've applied the PDDL license and reviewed the README.md file to reflect suggestions on formatting.

We will scrape the full data this week, then let you know as guess we are ready to merge?

### rufuspollock (2015-08-20T08:20:17Z)

@cmsdroff that sounds right. My one other suggestion is that if you have scraping scripts you may want to add them to the repo in the scripts/ directory and add a README.md in the scripts directory detailing how to use them.

### rufuspollock (2015-09-14T09:02:36Z)

@cmsdroff how are you folks doing here?

### cmsdroff (2015-09-14T09:11:22Z)

We have (most) of the data, site we scraped from implemented some restrictions to try and prevent scraping, we will reattempt on Friday with some workaround and if not will grab data from one of the other sites.

Keep you posted Friday.

> On 14 Sep 2015, at 10:02, Rufus Pollock notifications@github.com wrote:
> 
> @cmsdroff https://github.com/cmsdroff how are you folks doing here?
> 
> —
> Reply to this email directly or view it on GitHub https://github.com/datasets/registry/issues/109#issuecomment-140007638.

All business is conducted subject to Warrant Group Limited Standard Terms and Conditions 2012, a copy of which is available on request and at www.warrant-group.com/terms.  
Registered Office: Warrant House, 157 Regent Road, Liverpool, L5 9TF. Registered in England No. 1941659 VAT Reg. No. GB 100116496.

### pdehaye (2015-11-29T02:07:17Z)

@cmsdroff This seemed almost done, what is the current status?

### cmsdroff (2015-12-22T15:10:39Z)

will have this in January, working on a different data source as we need it for our internal software.  Will keep you posted when ready to transfer.

### rufuspollock (2018-01-09T10:40:14Z)

@cmsdroff any update here? The dataset here https://github.com/warrantgroup/IMO-Vessel-Codes looks good. Can we migrate it across.

### rufuspollock (2024-03-29T10:05:25Z)

We should just copy this over to core datasets for now and publish on datahub.io

### sabas (2025-09-18T09:34:26Z)

bumping this issue... @cmsdroff did you do any more work on this topic? I was looking into having an updated list with call signs as well (although they aren't stable) Perhaps scraping Gisis...

### cmsdroff (2025-09-24T15:08:16Z)

This work is soo old now :) but ironically still a problem that a public data set doesn't exist for basic information without paying for it.

The last update is 10 years ago so I wouldn't copy any of this over it will be well out of date.

@sabas I did do a refresh of data for known container vessels on a project a while back but again its dated, we paid for that data refresh at the time.

The IMO Number is consistent, the flag, name and callsign can change from memory.  Sorry can't be more help :)
