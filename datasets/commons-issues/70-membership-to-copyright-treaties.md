---
number: 70
title: Membership to Copyright Treaties
state: closed
author: bluechi
created_at: "2015-02-07T13:39:15Z"
updated_at: "2015-02-26T06:08:14Z"
closed_at: "2015-02-26T06:08:14Z"
labels: ["Priority: ★★"]
---

# Membership to Copyright Treaties

Berne Convention
http://www.wipo.int/treaties/en/ShowResults.jsp?lang=en&treaty_id=15

WCT
http://www.wipo.int/treaties/en/ShowResults.jsp?lang=en&treaty_id=16

WPPT
http://www.wipo.int/treaties/en/ShowResults.jsp?lang=en&treaty_id=20

Marrakesh VIP Treaty
http://www.wipo.int/treaties/en/ShowResults.jsp?lang=en&treaty_id=843

There is no proper license on WIPO's website, but this is what the website policy says:
"1. Anyone may use or reproduce any information presented on this website, subject to any specific terms of use that might appear with such information, provided that the use of such information is accompanied by an acknowledgement that WIPO is the source." http://www.wipo.int/tools/en/disclaim.html

So I guess it is allowed to copy the data 

The package can have the list of the countries and their membership status to the treaties along with the date of signature/ratification/accession if available.

I can package the data and maintain it.

## Comments

### rufuspollock (2015-02-07T18:07:54Z)

@bluechi great suggestion and let's go for it.

### bluechi (2015-02-08T18:58:16Z)

OK, great! I'm working on this.

So I'm going to start with one treaty and then add more treaty details to my data package. 

The table will have the date of signature if the treaty was signed by a country (only the original countries sign), then type of instrument by which the country became a member, then the date on which this instrument was deposited, and finally the date on which the treaty entered into force for that specific country. I now have Berne Convention data in the table.
https://github.com/bluechi/membershiptoiptreaties/blob/master/membershiptoiptreaties.csv

I will add more columns for the details of other treaties as we go.

I'm not sure what I'm doing wrong, but my packages do not validate when I use the validation tool? Anybody knows what I'm doing wrong?
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbluechi%2Fmembershiptoiptreaties%2Fmaster%2Fmembershiptoiptreaties.json

### sxren (2015-02-08T20:36:47Z)

@bluechi first, rename membershiptoiptreaties.json to datapackage.json. any suggestions on clarifying the naming requirement?

@rgrp would it be worth catching incorrectly named datapackage.json files with a clear error? if so, is https://github.com/okfn/datapackage-validate the right place to do that? thanks.

### bluechi (2015-02-08T23:23:49Z)

@sxren thanks, now that you told me this I can see that it is clearly stated in the datapackage docs that the JSON file must be named package.json :
http://data.okfn.org/doc/data-package

My JSON file now properly validates
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbluechi%2Fmembershiptoiptreaties%2Fmaster%2Fdatapackage.json

I'll add the details for other treaties next and I'll post here once my package is ready.

### bluechi (2015-02-10T21:21:26Z)

I think I have my package ready. Here is the link:
https://github.com/bluechi/membershiptocopyrighttreaties

The JSON file verified properly, I had to edit it manually to add the source details and also correct the field types as it kept on mixing "number" and "date". Maybe an issue to be looked at with the JSON creator.

I also added a README.md file.

Not sure if this qualifies as a Core Dataset or not.

### rufuspollock (2015-02-22T21:29:41Z)

@sxren are you happy to review?

### sxren (2015-02-23T06:06:35Z)

@bluchi this is a great resource.

now, four columns are added for each treaty: `Treaty Name - Signature Date`, `Treaty Name - Instrument Type`, `Treaty Name - Instrument Date`, and `Treaty Name - In Force Date`. as a raw data source, it would be more useful to have five columns: `Treaty Name`, `Signature Date`, `Instrument Type`, `Instrument Date`, and `In Force Date` with a row for each country and treaty.

was that clear? is that a change you have the time and interest to make? thank you.

### bluechi (2015-02-23T10:41:51Z)

@sxren OK, this makes sense, let me try to do this one more time! (Y)

### sxren (2015-02-23T11:34:24Z)

@bluechi great! thank you very much.
- [ ] tidy/unpivot csv data (see https://github.com/datasets/registry/issues/70#issuecomment-75493444)
- [ ] rename repo with words separated by dashes (readability); e.g., membership-to-copyright-treaties or copyright-treaty-members
- [ ] rename csv with words separated by dashes (readability); e.g., membership-to-copyright-treaties or copyright-treaty-members
- [ ] update datapackage.json (with new schema/fields and new csv name)
- [ ] remove file extension (.csv) from 'name' in resources
- [ ] add license to datapackage.json; e.g., ODC-PDDL-1.0
- [ ] add license to README.md; see example below

```
## License

These data are made available under the Public Domain Dedication and License v1.0 whose full text can be found at: http://www.opendatacommons.org/licenses/pddl/1.0/
```

### bluechi (2015-02-24T21:01:30Z)

@sxren I made all the changes you recommended in the post above. The license I picked is PDDL. 

The package can be found here:
https://github.com/bluechi/membership-to-copyright-treaties

### sxren (2015-02-25T02:54:40Z)

- [x] resource schema is tidy/unpivoted
- [x] datapackage.json validates
- [x] readme loads in view
- [x] no formatting mistakes in readme
- [x] data loads in view

@bluechi please transfer ownership to me and i'll move the dataset into the datasets repository. thank you very much!

### bluechi (2015-02-25T11:11:25Z)

@sxren just made the transfer request, thanks!

### sxren (2015-02-26T06:08:14Z)

@bluechi thank you very much! your data is up at http://data.okfn.org/data/core/membership-to-copyright-treaties
