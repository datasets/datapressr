---
number: 97
title: "OpenAddresses - https://github.com/openaddresses/"
state: open
author: rufuspollock
created_at: "2015-05-14T16:43:49Z"
updated_at: "2019-12-02T19:54:59Z"
labels: []
---

# OpenAddresses - https://github.com/openaddresses/

Ask them to data package it ...

## Comments

### pdehaye (2015-12-01T15:19:17Z)

Hi @iandees, @ingalls, we would be really interested to have openaddresses as an OKFN data package, and to actually introduce it in our list of Core packages. This would immediately enable lots of people to use the OKFN tooling on the data you have made available. Would you or anyone on your team be interested to do this? The directions are here: http://data.okfn.org/doc/core-data-curators
Don't hesitate to discuss it here first, this looks like extremely useful data to have.

### ingalls (2015-12-01T15:28:11Z)

Going to loop @sbma44 into the discussion as well

### sbma44 (2015-12-01T15:49:44Z)

I'd be delighted to see OpenAddresses data made more broadly useful. A few questions:
- Our sources are segmented by provider, but can also be sliced by license (to some extent). what's best practice here?
- Great work has been done recently by @migurski to organize our licenses, but the lines can occasionally be fuzzy. there is a lot of definitely-CC-BY, some "bespoke attribution license if Google Translate is to be believed", a bunch of public domain, and a small amount of sharealike. Unfortunately OpenAddresses cannot vouch for our reading of the licenses; users are at their own risk.
- We recreate CSVs every few days by pulling from sources. Although we keep our source definitions in github, the data would not be a good fit for a GH repo (there's way too much of it and it's updated too frequently). Is this a problem?

As a first pass I might suggest taking a single relatively open and stable package as a test source (perhaps the Netherlands address file?). Curious to hear thoughts, I haven't done this packaging before myself.

### rufuspollock (2015-12-02T13:55:38Z)

@sbma44 great to hear you are interested.
- I wouldn't worry about slicing by license
- re licenses - you can put a lot of detailed info in the licenses section of the README as per http://data.okfn.org/doc/publish-faq#-strong-license-strong-
- Re CSVs - we do support other data formats. If large and too big for github you can push them wherever you put them online (e.g. s3) and point with a url to them (that's allowed in a datapackage.json)
