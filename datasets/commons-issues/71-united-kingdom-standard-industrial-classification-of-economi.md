---
number: 71
title: United Kingdom Standard Industrial Classification of Economic Activities (SIC)
state: closed
author: ekoner
created_at: "2015-02-08T15:36:19Z"
updated_at: "2015-02-18T01:06:16Z"
closed_at: "2015-02-18T01:06:16Z"
labels: ["Type: Reference", "Priority: ★★★", "Format: Tabular"]
---

# United Kingdom Standard Industrial Classification of Economic Activities (SIC)

The UK SIC codes are used to classify businesses and other economic activities. The codes can be found on gov.uk but licensing is unclear. The codes are published as [pdf](https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/376462/condensedSICList.pdf), there may be other formats available.

No SIC codes appear in the search and as I'm working on companies house data, this would be very useful for me and others in CSV format.

## Comments

### rufuspollock (2015-02-08T18:03:33Z)

@ekoner great suggestion. Would you be up for taking on packaging here?

### rufuspollock (2015-02-08T18:04:45Z)

By the way if you are looking for way to parse PDF check out https://github.com/okfn/ideas/issues/52

### ekoner (2015-02-08T18:07:37Z)

@rgrp Yes, I will. Thanks for the link.

### sxren (2015-02-08T18:30:04Z)

@ekoner csv format https://github.com/nathanpitman/sic-codes/blob/master/2007/sic_codes.csv

### ekoner (2015-02-08T21:21:49Z)

Thanks @sxren, I'd already parsed the pdf as an excuse to play with OpenRefine. That link heped me cross-check my work!

### sxren (2015-02-08T21:48:19Z)

@ekoner you're very welcome. :) glad i didn't stunt your learning. and it was kind of you to find a use for it.

### ekoner (2015-02-15T10:07:38Z)

It's been a long week chasing down licensing information for this dataset. While I'm still waiting for a reply direct from Companies House, I'm inclined to mark this as open data or at least public data based on information kindly provided by [Owen Boswarva](https://twitter.com/owenboswarva/status/566327126719463424). 

The SIC codes used by Companies House are a subset of the codes published by the ONS whose [copyright page](http://www.ons.gov.uk/ons/site-information/information/creative-commons-license/index.html) supports an assumption of open data and requests attribution:

Users reproducing ONS content which is adapted should include a source accreditation to ONS: Adapted from data from the Office for National Statistics licensed under the Open Government Licence v.3.0.

@rgrp / @sxren - I'm ready to package and could do with a steer on creating the data package when you're about.

### rufuspollock (2015-02-15T13:15:28Z)

@ekoner well done on tracking down licensing info and we can include that in the README.md

What do you need in terms of a steer on making the data package? I suggest we'll make this tabular data (i.e. in CSV) and there are instructions here you can follow: http://data.okfn.org/doc/publish (feedback and improvements on those docs are very welcome).

### ekoner (2015-02-15T13:27:31Z)

Thanks @rgrp 
Questions about the data package creator:
1. I've named the file sic-2007-condensed.csv - does this meet naming conventions and where can I find these?
2. Title - Again, is there a naming convention for this? I've gone with "UK condensed standard industrial classification of economic activities (SIC) 2007 codes"
3. Name - Same as title? Abbreviated? I've used "UK Condensed SIC 2007"
4. License - Can't select or type in, so I'm assuming it goes somewhere else.
5.  "mediatype": "application/vnd.ms-excel" - I think this is incorrect - shouldn't it be csv?

### sxren (2015-02-15T14:50:16Z)

@ekoner 
1. your name follows the conventions i've seen practiced (lowercase, dash delimited). i don't know if they're documented. @rgrp http://dataprotocols.org/simple-data-format/ is down.
2. title: convention seems to be concise, title case: e.g., `UK SIC 2007 Codes`? more information can be provided in a description field.
3. name: lowercase, concise, dash delimited: e.g., uk-sic-2007, uksic
4. license: would you be comfortable adding it to the json by hand for now? @rgrp is there anything i can do to get the update deployed?
5. mediatype: yes, it should be `text/csv`

### ekoner (2015-02-15T16:26:47Z)

Right, just stuck validating the [json file](https://www.dropbox.com/s/ff12urpx3zn9rfr/datapackage.json?dl=0). Unsure if Dropbox is adding some rubbish to the file or I've made an error editing.

### sxren (2015-02-15T16:44:24Z)

@ekoner 
use:
https://www.dropboxusercontent.com/s/ff12urpx3zn9rfr/datapackage.json?dl=1
(or https://dl.dropboxusercontent.com/s/ff12urpx3zn9rfr/datapackage.json)

changing `dl=0` to `dl=1` or replacing `www` with `dl` gives you the raw link to the file.

a comma is missing at the end of the description line.

### ekoner (2015-02-15T17:13:21Z)

Thanks @sxren - I've fixed that one and now getting `[SCHEMA] String does not match pattern: ^([a-z0-9\.\_\-])+$`. Any ideas?

### sxren (2015-02-16T01:15:07Z)

@ekoner See my comment in https://github.com/datasets/registry/issues/71#issuecomment-74420232 above about the name. `3`.

### ekoner (2015-02-16T08:29:57Z)

Thanks so much @sxren! Now valid:

[Validation Link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fdl.dropboxusercontent.com%2Fs%2Fff12urpx3zn9rfr%2Fdatapackage.json)
[View Link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fdl.dropboxusercontent.com%2Fs%2Fff12urpx3zn9rfr%2Fdatapackage.json)

Do I need to publish now?

### sxren (2015-02-17T06:03:07Z)

@ekoner oh, cool! your csv is being read. so, you answered my question from https://github.com/okfn/data.okfn.org/issues/153#issuecomment-74619064. :smiley_cat:
1. are the files in a public folder?
2. the mess at the top of the view is usually a result of not having a README.md in the data package folder. is there a README.md in the folder? if not, would you mind adding one? thanks!

### sxren (2015-02-17T06:04:48Z)

@ekoner oh, no. my bad. the csv is not being read. :frowning:

### sxren (2015-02-17T06:05:42Z)

@ekoner would you be cool with putting your data package on github?

### ekoner (2015-02-17T07:27:19Z)

@sxren no worries, I've created a [repo](https://github.com/openyorkshire/uk-sic-2007-condensed).

### sxren (2015-02-17T09:16:40Z)

@ekoner awesome! would you transfer that to datasets and then add the transferred repo (https://github.com/datasets/uk-sic-2007-condensed) to https://github.com/datasets/registry/blob/master/core-list.txt and https://github.com/datasets/registry/blob/master/catalog-list.txt ? thank you!

### ekoner (2015-02-17T19:31:12Z)

All done @sxren - could you sanity check for me?

Cheers

### sxren (2015-02-18T01:06:16Z)

@ekoner your dataset is up at http://data.okfn.org/data/core/uk-sic-2007-condensed :)
- i added the data directory to the path of the resource.
- i removed the file extension from the resource name—i missed that before.

this issue is closed. thank you very much!
