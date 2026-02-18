---
number: 14
title: Mime-types / Media-types / File formats
state: closed
author: rufuspollock
created_at: "2013-04-15T07:34:54Z"
updated_at: "2015-03-20T17:31:16Z"
closed_at: "2015-03-15T22:05:22Z"
labels: ["Type: Reference", "Priority: ★★★"]
---

# Mime-types / Media-types / File formats

http://www.iana.org/assignments/media-types

http://svn.apache.org/viewvc/httpd/httpd/branches/2.2.x/docs/conf/mime.types?view=annotate
## Discussion
- Would prefer to include file extension

Suggested Schema

<pre>
{
  id: # mimetype identifier
  fileextensions: # space separated list (?)
  link: # link to authoratative mimetype?
}
</pre>

## Comments

### rufuspollock (2015-02-22T21:29:27Z)

@bluechi interested in this one?

### bluechi (2015-02-23T10:58:26Z)

@rgrp this looks doable, but I'm not sure I understand what you mean by "link to authoritative mimetype" in suggested schema. Is this a link to the template for each type on IANA's website? 

Also, should the identifier include the top level type name, or should that be in a different column?

### bluechi (2015-02-25T21:41:59Z)

@sxren I prepared a package for this dataset here:
https://github.com/bluechi/media-types

I used the names used in IANA's page, so I called I used the headings "Media Type", "Media Subtype", "Template", and then I added the "Extension" details from the page on Apache's website. 

The "Extension" is meant to be a space separate list, I put "array" as the time in the schema - not sure if what I've done is correct.

### sxren (2015-02-26T11:01:37Z)

@bluechi great stuff. thank you.

i can imagine use cases where having the media type and subtype split would be useful. that said, there are also use cases where a single field would be useful. @rgrp any thoughts on splitting the field vs having a single id field?

extension field:
a space separated list would be a string (a space delimited string).

aside:
in the datapackage.json, the word array is quoted with smart quotes (`“array”`). replace those with straight quotes (`"array"`).

for reference:
because "Types are based on the [type set of json-schema](http://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.1)"[*](http://dataprotocols.org/json-table-schema/#field-types), i'm guessing an array would be a comma separated list in square brackets—e.g.,  ["ma", "nb", "mb"].

### rufuspollock (2015-02-26T15:23:41Z)

This is great.

I think we probably want one column with the media type and subtype together with a / as that is normal. (we can also have the split out columns as well)

### bluechi (2015-02-28T16:18:03Z)

@sxren @rgrp thanks guys, I added a new column for Media Type / Media Subtype and kept the split columns, too. I didn't know what to name the header of new column, so I called it "Media Type / Media Subtype". Let me know if this requires changing. 

I also changed the "Extension" type in the schema to "string" and used straight quotes.

The updated package can be seen here
https://github.com/bluechi/media-types

### rufuspollock (2015-03-02T09:19:20Z)

@bluechi one quick question - do you have a script or similar you used to prep this (how did you convert the data over)? It would be worth including that or writing up your preparation steps in a section called "Preparation" in the README (see README section of FAQ: http://data.okfn.org/doc/publish-faq)

### sxren (2015-03-03T02:26:39Z)

@bluechi looking at https://tools.ietf.org/html/rfc4288#page-19, what do you think of labeling `xxx/yyy` as Media Type (as is used in the subject line of a template), `xxx` as Type, and `yyy` as Subtype?

### bluechi (2015-03-03T21:30:47Z)

@rgrp I actually copied the data manually and then sorted them in Google Sheets using simple expressions. I added a section to the README file regarding "Preparation".

@sxren thanks for the suggestion, this makes sense. I update the files.

The files can be seen here:
https://github.com/bluechi/media-types

### sxren (2015-03-04T06:30:43Z)

@bluechi awesome!

you can go into a little more detail on your processing section if you're up for it. imagine you're explaining it to someone in steps. for example: first, x number of csv files are copied from http://example.com and merged into one file. next, a space delimited text file is copied from http://example2.com. lines prefixed by a hash (pound) are removed from the text file. and so on. that would be helpful to someone who wanted to automate the process.

other than that:
- [ ] in the csv and datapackage.json, change the label `Extension` to `Extensions` (apologies for missing this before)
- [ ] in the readme, add `http://` to the beginning of `www.iana.org...` (without the protocol, it's interpreted as a relative path)

### bluechi (2015-03-14T18:08:11Z)

@sxren thanks for the tips, I expanded the preparation notes, renamed the header "Extension" to "Extensions" and updated he JSON file accordingly. The updated package can be seen here:
https://github.com/bluechi/media-types

### sxren (2015-03-14T22:37:38Z)

@bluechi thank you very much. if you transfer ownership to me, i'll add this to datasets.

### bluechi (2015-03-15T08:30:37Z)

@sxren great, made the transfer request.

### sxren (2015-03-15T22:05:22Z)

@bluechi great! your dataset is up at http://data.okfn.org/data/core/media-types thank you, again!

### rufuspollock (2015-03-20T17:31:16Z)

w00t! well done @bluechi and @sxren
