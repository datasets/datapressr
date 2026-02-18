---
number: 58
title: Language codes (ISO 639)
state: closed
author: rufuspollock
created_at: "2014-08-23T17:23:11Z"
updated_at: "2015-02-08T18:26:46Z"
closed_at: "2015-02-08T18:26:46Z"
labels: ["Priority: ★★★"]
---

# Language codes (ISO 639)

Nice little dataset
- Source: http://www.iso.org/iso/home/standards/language_codes.htm
- Suggested name: `language-codes`
- Suggested title: Language Codes (ISO 639)
- Suggest we want 2 digit and 3 digit codes (probably separate files?)

## Comments

### rufuspollock (2014-08-23T17:24:03Z)

@jalbertbowden another good and (I hope simple) one

### rufuspollock (2014-09-20T14:03:24Z)

@jalbertbowden any thoughts?

### hirntodt (2015-01-07T21:54:33Z)

Iso.org charge for the download, but link to the library of congress as Registration Authority for this ISO. They again provide a file for download.
http://www.loc.gov/standards/iso639-2/iso639jac.html

I would take this on as a first project for packaging, unless someone stops me..

### rufuspollock (2015-01-08T10:24:06Z)

@hirntodt all sounds good and you are hereby the current assignee of this packaging work :-)

### hirntodt (2015-01-12T21:28:03Z)

ok, I have packaged the data, put it on https://github.com/hirntodt/okfn-language-codes . 
Now I am confused on how to proceed (new to the pull request business).

Any pointers ?

### rufuspollock (2015-01-13T11:49:24Z)

Next steps:
- Quality check
- Move to github.com/datasets
- Add to core datasets list

Re quality check:
- Check datapackage.json in http://data.okfn.org/tools/validate (you may need raw link)
- Try to view it here - http://data.okfn.org/tools/view

### hirntodt (2015-01-15T20:41:15Z)

I can not validate using the validator tool (even the json from the generator tool does not pass).
The view however looks fine : 

http://data.okfn.org/tools/view?url=http%3A%2F%2Fhirntodt.de%2FOKFN-core-datasets%2FISO639%2Fdatapackage.json

As the file is rather  small i put both codes in there, it also seems more handy for doing conversions between them.

### rufuspollock (2015-01-16T12:56:06Z)

@hirntodt can you link the validator result (you can just copy and paste the url).

Aslo I'm wondering what would be most useful to users. Do you think users might prefer 2 files:
- One file just of 2 digit codes and english name
- One file which is everything (what we have)

I'm wondering as I imagine many people just want the 2 digit codes so providing that so they can just "get it" fast is probably useful.

In addition could you give a bit more detail either in README or description of columns about the terminologic codes (what is it? why would one that as well as the bibliographic codes ...)

### hirntodt (2015-01-18T15:45:00Z)

I included a short, 2 letter code version for quick and easy matching of languages with their code and vice versa.
The full list with all 3 different codes is a  second file now in the package. 

Also extended the README.

[Viewer](http://data.okfn.org/tools/view?url=http%3A%2F%2Fhirntodt.de%2FOKFN-core-datasets%2FISO639%2Fdatapackage.json#readme)

[The validator still fails](http://data.okfn.org/tools/validate?url=http%3A%2F%2Fwww.hirntodt.de%2FOKFN-core-datasets%2FISO639%2Fdatapackage.json)

### rufuspollock (2015-01-18T15:57:30Z)

@hirntodt this is great! Looking good to get this in and a new official core data package :-)

re the validator message, does that make sense to you? What it is saying is the data package name field is invalid as it needs to be lowercase alphanumeric ... (any suggestions on how to improve the validator feedback warmly welcome at https://github.com/okfn/data.okfn.org/issues :-) ...)

### hirntodt (2015-01-18T16:04:26Z)

No, the message does not make sense to me :) 

So, how  will the package find its way into https://github.com/datasets ?

### rufuspollock (2015-01-18T22:21:11Z)

So the message says (with comments from me to explain better):

```
[
  {
    "message": "String does not match pattern: ^([a-z0-9\\.\\_\\-])+$",  # this is what wrong with the field value
    "code": 202,
    "dataPath": "/name",  # this is the path in the datapackage.json - so "name" field
    "schemaPath": "/properties/name/pattern",
    "subErrors": null,
    "type": "schema"
  }
]
```

Re finding it way in here - that requires you to transfer ownership across (think that will require you to make a relevant person an admin on that repo). We can come to that once we have finalized and checked the datapackage.

### hirntodt (2015-01-24T15:36:30Z)

@rgrp, small misunderstanding on my side. It didn't make sense to me bcause all the "name" tags in the schema were matching the pattern, no matter how often I doublechecked. Took just a weeks break to figure it was the top level tag not matching...

Anyway, it [validates now](http://data.okfn.org/tools/validate?url=http%3A%2F%2Fwww.hirntodt.de%2FOKFN-core-datasets%2FISO639%2Fdatapackage.json)

And if the split into two files and description are reasonable, I think it's good to go.
[Viewer preview](http://data.okfn.org/tools/view?url=http%3A%2F%2Fhirntodt.de%2FOKFN-core-datasets%2FISO639%2Fdatapackage.json)

the repo was here: https://github.com/hirntodt/okfn-language-codes

### rufuspollock (2015-01-25T13:10:05Z)

Great. Looks good to go. Could you make me an admin on the repo in github so I can move it to github.com/datasets. We'll then do the last steps of adding to the list and then on the site.

### hirntodt (2015-01-25T21:07:03Z)

ok, done.

### rufuspollock (2015-02-08T18:26:45Z)

@hirntodt sorry for slight delay - had to move from private account to /datasets/.

All looks great and this now added to the Core Datasets list and is live at:

https://github.com/datasets/language-codes
http://data.okfn.org/data/core/language-codes

Congratulations on packaging your first official core dataset!
