---
number: 184
title: SMDG codelists
state: closed
author: sabas
created_at: "2016-05-10T08:45:00Z"
updated_at: "2016-07-05T13:05:30Z"
closed_at: "2016-07-05T13:05:26Z"
labels: ["Type: Reference"]
---

# SMDG codelists

http://smdg.org/index.php/smdg-code-lists/

Codes used in maritime industry, mantained as excel files.

I could package these.

## Comments

### rufuspollock (2016-05-10T09:58:40Z)

@sabas awesome - please start packaging :-)

### sabas (2016-05-11T13:55:50Z)

This is the terminal code list

https://github.com/PHPEdifact/smdg-master-terminal-facilities-list

### rufuspollock (2016-05-12T10:41:28Z)

@zelima can you review.

@sabas you will need to post validation and preview links as per http://data.okfn.org/doc/core-data-curators#4-publishing

### sabas (2016-05-12T10:44:46Z)

Valid package
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2FPHPEdifact%2Fsmdg-master-terminal-facilities-list%2Fmaster%2Fdatapackage.json

Viewer
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2FPHPEdifact%2Fsmdg-master-terminal-facilities-list

### zelima (2016-05-13T05:58:13Z)

@sabas data looks very good. Great job!
Just a little things to consider:
- Think it would be better if column names are space separated i.e: `Company Name` instead of `CompanyName`
- There's no need to indicate "default" as optional 'format' parameter. You may indicate `yyyy-mm-dd` as format For date types.
- Also REAMDE.md doesn't need Title as an opening line.

### sabas (2016-05-13T08:32:02Z)

@zelima thanks, ok changed it.
I was also wondering if the geopoint type is supported, in case I can convert the Latitude and Longitude columns

### gsilvapt (2016-05-13T09:25:35Z)

(sorry to interrupt)

@sabas This guide may help you figuring details we usually look around here: http://datapatterns.org/core-guides/core-data-curators/

The website is incomplete and being subject to changes often, but hopefully that will help.

### zelima (2016-05-13T17:14:04Z)

@sabas We've lost table for data. 
The reason behind this is the "/" symbol in the `"UN/LOCODE"` field name. 
The way to fix this is, to separate it with space or do not separate it at all.

### sabas (2016-05-13T19:27:12Z)

Fixed.
I also moved the coordinates in a single column with geopoint type

### zelima (2016-05-14T11:45:08Z)

Great, looks good to me, @rgrp any comment about README.md?

### rufuspollock (2016-05-15T12:55:37Z)

@sabas great - could we add a `LICENSE` section to README and perhaps a `DATA` section. @zelima you know the general outline on the README so I'll let you lead here.

### zelima (2016-05-15T19:37:54Z)

- There should be an opening line that contains description of the data, covering:

What this is
Where it comes from
- after comes ##data section which covers more informative desorption of data.
- And finally license section with some information e.g. what are the terms on the original dataset etc.

### sabas (2016-05-16T07:25:03Z)

Restructured like this

List mantained by the [SMDG Secretariat](http://smdg.org/) to specify the port terminal facilities in UN/EDIFACT messages. The list is directly linked with the UN/LOCODE codelist (see [data package](http://data.okfn.org/data/core/un-locode))

## Data

Example segment where the main location is RULED (UN/LOCODE for Saint Petersburg, Russia) and the facility is PLP (SMDG code for Petrolesport).

```
LOC+11+RULED:139:6+PLP:72:306
```

## License

All data is licensed under the [Creative Commons 4.0 Attribution License](https://creativecommons.org/licenses/by/4.0/). You may need to attribute the specific code to the SMDG Secretariat.

### zelima (2016-05-16T07:39:49Z)

@sabas Nice, looks fine to me. Could you please update actual README.md in your repository and paste validation and preview link one last time.
@rgrp think we are ready to start publishing process.

### sabas (2016-05-16T07:44:27Z)

Done and valid

Valid package
http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2FPHPEdifact%2Fsmdg-master-terminal-facilities-list%2Fmaster%2Fdatapackage.json

Viewer
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2FPHPEdifact%2Fsmdg-master-terminal-facilities-list

### zelima (2016-05-18T08:18:48Z)

Following [this steps](http://data.okfn.org/doc/core-data-curators#4-publishing), @sabas  needs to transfer ownership to proceed. But first you must become organization member. 
@rgrp since I am `Team maintainer` of curators team, I can only add users who are **already members of  [organization](https://github.com/orgs/datasets/people)**. We would need to add @sabas as an organization member (I don't have access right for this)

### gsilvapt (2016-05-18T18:15:16Z)

I can't add as an organization member, I think. If this is an urgency, I can clone the repository and just push it upstream, without taking any credit away from @sabas. Still, I think we can wait!

### zelima (2016-05-18T20:27:25Z)

That would be great, thanks @gsilvapt

### gsilvapt (2016-05-19T01:18:43Z)

It is up to @sabas and @rgrp then :+1:

### rufuspollock (2016-05-23T15:47:12Z)

@zelima you are now an owner so you can add @sabas. @pdehaye would you like to guide @zelima in what he needs to do so he knows for the future and can also help with managing curator work :-)

### zelima (2016-05-24T10:04:41Z)

@sabas I've sent you invitation. You can transfer ownership once you accept it.. Please notify here so I could publish data

### sabas (2016-05-24T10:11:03Z)

Done https://github.com/datasets/smdg-master-terminal-facilities-list
:tada:

### zelima (2016-05-24T18:36:39Z)

Great!
The dataset has landed here: http://data.okfn.org/data/core/smdg-master-terminal-facilities-list
Good job @sabas

### sabas (2016-05-25T07:17:29Z)

Thanks! In these days the list was updated with some request I made to the secretariat, I'll fork and update

### zelima (2016-06-13T07:31:52Z)

@rgrp @sabas we can close this one, right?

### sabas (2016-06-13T07:34:15Z)

Yes, the other lists are less used I think...
