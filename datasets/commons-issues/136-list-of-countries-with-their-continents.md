---
number: 136
title: List of countries with their continents
state: closed
author: rufuspollock
created_at: "2015-12-03T17:11:50Z"
updated_at: "2023-09-27T09:02:27Z"
closed_at: "2023-09-27T09:02:27Z"
labels: ["Type: Reference", "Format: Tabular", "Difficulty: easy"]
---

# List of countries with their continents

May want this to be part of an existing dataset e.g. http://data.okfn.org/data/core/country-list or http://data.okfn.org/data/core/country-codes.

Would prefer not to "pollute" the simplicity of the former with this info - its aim is to be ultra-simple so maybe the latter one. Or possibly, its own really simple dataset.

## Comments

### pdehaye (2015-12-04T23:24:48Z)

This could be a source: http://www.geonames.org/countries/

### jgkim (2015-12-08T00:34:05Z)

This could be another source of it: http://unstats.un.org/unsd/methods/m49/m49regin.htm

### zelima (2016-03-10T18:25:39Z)

Can I take this one?

### rufuspollock (2016-03-11T07:25:56Z)

@zelima that would be great. Can you detail what you propose to do here and @pdehaye and I can review.

### zelima (2016-03-11T18:42:50Z)

@rgrp @pdehaye since none of the link provide CSV or other type of data, think I'll scratch data directly from HTML. From this source - http://www.geonames.org/countries/
Heading and first few lines of CSV file:

```
country, continent
Andora, Europe
United Arab Emirates, Asia
```

### rufuspollock (2016-03-12T15:02:54Z)

@zelima geonames **almost always** provides their data in bulk so I would be surprised if we need to scrape from HTML - e.g. is this the countryInfo.txt listed on http://download.geonames.org/export/dump/readme.txt

There are a couple of things to resolve here:
- Is this a new data package or an addition to country-codes?
- If it is separate i would suggest including ISO 2 digit code for the countries (so basically start from country-list data package and just add a column for continent)

@pdehaye @lexman i'd welcome comments on point 1

### lexman (2016-03-13T07:00:07Z)

The country-codes dataset already has a ot of usefull infos like currency or phone code, so I think users could expect to see the continent here. 

How would you do ? 
- Add the continent code in a column and create a new reference datapackage with the name of the continents ?
- or write the continent in plain text ?

I tend for the first one, as it would be coherent with other codes.

### zelima (2016-03-13T07:53:54Z)

@rgrp Do you mean something like this http://download.geonames.org/export/dump/countryInfo.txt ? Do you want me to work with txt file? I can not find any other link for download, That is in relation with countries and continents. If I'm heading in wrong direction, please help.
Adding additional column for ISO2 digit is no problem.

@lexman is your question for me? Cause I don't really got it.

### rufuspollock (2016-03-13T18:54:43Z)

@lexman are there standard continent codes? The geonames dataset only has 2 digit codes e.g. "EU".

Overalll I agree with @lexman on approach.

### jgkim (2016-03-14T00:36:54Z)

[UN M.49](http://unstats.un.org/unsd/methods/m49/m49regin.htm) is a standard for 3-digit area codes used by UN for statistical purposes. These codes refer a wide variety of geographical, political, or economic regions including continents and countries, and codes for countries correspond to ISO 3166-1 Alpha-3.

I'm almost done with scraping UN M.49 with Node.js. I don't know it could help, though.

### lexman (2016-03-14T05:33:32Z)

Sorry @zelima, this was a rethorical question. My point was : it's better to add continent codes in a new column, but we need to create a new datapackage that explicits this codes.

By the way, I don't think NaturalEarth's codes are a standard and I don't know any.

### zelima (2016-03-14T17:19:41Z)

@lexman OK that's no problem. 
@rgrp can you please answer my question, about download link?

### rufuspollock (2016-03-23T12:12:15Z)

@jgkim can you please open a new issue for UN M.49 - definitely good to get that in.

@zelima yes - let's use that txt file if we can. I've also opened an issue for a list of continents #174

### zelima (2016-04-03T12:23:38Z)

@rgrp should we continue with this?
If yes, there is an issue regarding text file. I'm not sure I can work with that. 
It is extremely unordered.

The only thing that gives me a hope is that every line may have first five 'column' fulfilled. in that case I could do something like

```
if line contains one of two letter symbol from continent-codes:
   take first 'word' form line (ISO2) and fifths 'word' (Country name) 
   do other stuff
```

This will only work if every first and fifth word will be the needed value. 
Plus There should not be any other two letter entry matching to one of continent-codes, except one that should be. for example something like this:
ANAGRAM there is 'NA' in word, which refers to one of continent-code, so it will mess the data up

### rufuspollock (2016-04-03T13:02:19Z)

I suspect we add this to country-codes - we probably just want to do this by hand. I suggest we open an issue on the country-codes repo.

@lexman any thoughts?

### lexman (2016-04-04T01:38:07Z)

Hello @zelima,

I've faced the same issue with countryInfo.txt. I think in geoname's mind, everyline begining by a `#` is a comment, then there is a tabulation-separated-values file with a header.

You can find my python code to parse the file here :
https://github.com/lexman/world-cities/blob/master/scripts/tuttlefile#L67

### lexman (2016-04-04T01:40:21Z)

@rgrp @zelima I like the idea of adding the continent code to the country-codes. We'll have a truly frictionless datapackage that would be easy to join with anything...

Or [that](https://xkcd.com/927/) :)

### zelima (2016-04-04T17:58:26Z)

Yeh, # lines are easy to handle with... I was talking about the actual data.
I didn't mean it's impossible, Just think it's hard to be sure that parsed data will be 100% correct, because of possible 'traps' in txt file..
So, final word up to you @rgrp? should I do or not?

### rufuspollock (2016-04-08T19:14:24Z)

@zelima i don't get the question right now. As I said we should open an issue on the country-codes repo recommending what we suggest and then open an appropriate request once we have a response from the maintainer.

We then close this issue in favour of that issue.

### pdehaye (2016-04-25T12:48:42Z)

@zelima has @rgrp's suggestion been implemented?

### zelima (2016-04-25T17:46:49Z)

@pdehaye I was little confused about what should I do, so I took a step back.
@rgrp did you mean me under 'we', when you said 

> As I said we should open an issue on the country-codes repo recommending what we suggest

### rufuspollock (2016-04-26T16:23:24Z)

@zelima yes i meant "you" here ;-)

### gsilvapt (2016-05-02T10:33:57Z)

Should this issue be close? https://github.com/datasets/world-cities

### zelima (2016-05-03T11:43:32Z)

I've opened an issue here:

https://github.com/datasets/country-codes/issues/30

### rufuspollock (2023-09-27T09:02:27Z)

FIXED. This was fixed in https://github.com/datasets/country-codes/issues/30
