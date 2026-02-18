---
number: 174
title: List of continents with codes
state: closed
author: rufuspollock
created_at: "2016-03-23T12:11:55Z"
updated_at: "2016-04-02T22:15:48Z"
closed_at: "2016-04-02T22:12:22Z"
labels: []
---

# List of continents with codes

A _very_ simple dataset but useful as a reference for #136 

```
Code, Name
..., ...
```

No known sources of specific continent codes. we should check:
- Natural Earth's continent codes
- Geonames codes: http://download.geonames.org/export/dump/countryInfo.txt
- Any other sources

/cc @zelima @lexman for comments ...

## Comments

### zelima (2016-03-24T20:05:26Z)

```
code,name
AF,Africa
AN,Antarctica
AS,Asia
EU,Europe
NA,North america
OC,Oceania
SA,South america
```

All the sources including geonames That I found use this format. 
Here are some of them:
[Planetary Names](http://planetarynames.wr.usgs.gov/Abbreviations)
[Wikipedia article](https://en.wikipedia.org/wiki/List_of_sovereign_states_and_dependent_territories_by_continent_%28data_file%29#Format)
There is even [PHP function](http://php.net/manual/en/function.geoip-continent-code-by-name.php) that returns continent codes in this format

### lexman (2016-03-24T20:11:26Z)

@zelima Looks great !

### zelima (2016-03-25T19:02:15Z)

@rgrp @lexman please check new dataset 
https://github.com/zelima/continent-codes
datapackage.json validate [link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzelima%2Fcontinent-codes%2Fmaster%2Fdatapackage.json)
if everything is ok, I'll transfer ownership.

### lexman (2016-03-26T06:01:54Z)

Hello,

can you also post the view link, as explained in the [datacurator guide](http://data.okfn.org/doc/core-data-curators#3-quality-assurance) ? It really hepls for reviewing.

Tip : you don't need to enter the whole absolute url to the datapackage.json in the view link. The url of the github project is enough (and easyer to read).

### zelima (2016-03-27T16:06:56Z)

Here it is
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcontinent-codes

### rufuspollock (2016-03-27T17:37:54Z)

@zelima where is the standard README info e.g. the first paragraph describing the dataset. Also remember the processing info now goes in a separate directory. Also for a dataset _this_ small I doubt we need any processing codes - just some documentation about where it came from - this info should go in the `## Data` section and is probably just a summary of the discussion here (e.g. info from https://github.com/datasets/registry/issues/174#issuecomment-200998121)

### zelima (2016-03-29T17:23:39Z)

@rgrp got it.

I modified the repository. Please take look 
[Repository](https://github.com/zelima/continent-codes)
[View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcontinent-codes)
[Validation link](https://raw.githubusercontent.com/zelima/continent-codes/master/datapackage.json)

### lexman (2016-03-29T22:30:47Z)

Hello, 

on the view link we should see the table with the continent code but we can't...

Because in the repository the file is named `data/continent-codes` whereas it should be called `data/continent-codes.csv` : the `.csv` extension is missing.

Nearly there :)

### zelima (2016-03-30T04:11:11Z)

@lexman sorry for that. 
fixed

[Repository](https://github.com/zelima/continent-codes)
[View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcontinent-codes)
[Validation link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcontinent-codes)

### rufuspollock (2016-03-31T12:36:29Z)

@zelima looks good. One thing missing is a single opening sentence or paragraph saying what this dataset is e.g.

```
A list of the seven continents with English names and short, unique and permanent identifying codes.
```

### zelima (2016-04-02T06:41:20Z)

@rgrp Done
[View link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fzelima%2Fcontinent-codes)

### rufuspollock (2016-04-02T11:47:41Z)

@zelima it would have been useful to have listed in the Data section what the 3 sources you reference actually use but for now i think this is good.

@pdehaye do you want to the do honours of getting this into core.

### zelima (2016-04-02T13:31:20Z)

@rgrp so for now, I'm leaving dataset as it is, correct?

### pdehaye (2016-04-02T21:07:11Z)

@zelima a few comments: 
- this is an amazing dataset   :)
- your markdown is off in the data section
- the second data source link is a duplicate of the first, please fix
- while you are at it, why not add the php source indeed
- can't wait to get this in 

Please do those changes, and then transfer ownership to the "datasets" organisation. Please ping me here when that's done, so I can add it to the registry and announce it more widely.

### zelima (2016-04-02T21:48:10Z)

@pdehaye Thank you.
- duplicated link - fixed
- php source - added
- ownership - transferred
- can you please give hint about markdown issue?

### pdehaye (2016-04-02T22:12:22Z)

@zelima  for the markdown, i meant to add a bulletlist. i have done that now. Thanks for your work!

I have now updated the registry. The continent-codes dataset has landed in core, [here](http://data.okfn.org/data/core/continent-codes).

### zelima (2016-04-02T22:15:48Z)

@pdehaye great!
