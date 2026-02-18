---
number: 182
title: UN M.49 3-digit area codes
state: open
author: rufuspollock
created_at: "2016-05-04T20:39:55Z"
updated_at: "2019-12-02T19:55:00Z"
labels: ["Type: Reference", "Priority: ★★"]
---

# UN M.49 3-digit area codes

UN M.49 is a standard for 3-digit area codes used by UN for statistical purposes. These codes refer a wide variety of geographical, political, or economic regions including continents and countries, and codes for countries correspond to ISO 3166-1 Alpha-3.

## Comments

### rufuspollock (2016-05-04T20:40:12Z)

@jgkim could you update on your scraping efforts here?

### jgkim (2016-05-11T07:31:04Z)

@rgrp Sorry for the late reply. The work I've been doing can be found at https://github.com/jgkim/country-data-package. I scraped codes for geographical regions only. It is a JSON data package, but I guess it can be easily converted into CSV or other forms.

### rufuspollock (2016-05-12T10:45:24Z)

@jgkim we would need it in CSV. Can you convert it over?

### zelima (2016-07-05T13:30:40Z)

@rgrp @jgkim I could try writing python script, that takes already scraped JSON data as input and outputs CSV file, if @jgkim would like to receive PR. 
As a first glance CSV file would look something like this (for continents.json):

```
unM49Code,wikipediaSlug,wikidataId,geoNamesId,country,wikipediaLabel,officialName,alternateName,name,larirude,longtitude
002,Africa,Q15,6255146,en,Africa,Africa,Africa,7.1881,21.09375
002,Africa,Q15,6255146,de,Afrika,,Africa,7.1881,21.09375
002,Africa,Q15,6255146,en,Afrique,,Afrique,Africa,7.1881,21.09375
...
...
009,Oceania,Q538,6255151,jam,Uoshania,,Oceania,-18.31281,138.51562
```

### rufuspollock (2016-07-06T11:01:38Z)

@jgkim would be great if you were up for contributing (@zelima can support if needed).

### zelima (2016-08-08T08:36:23Z)

@jgkim Did you have chance to look at this?

### jgkim (2016-08-13T10:54:34Z)

@zelima Sorry for being late. I didn't have a chance to see this, and actually really really busy these days. I'm so sorry for that. :(

Do you want to make a PR to the existing my personal repo? What about forking or making a new repo in this organization `datasets`? @rgrp

### zelima (2016-08-16T08:20:49Z)

@jgkim That's ok, think I can help with finishing this one. :) 
I'll make PR as soon as I have script ready and we can transfer to datasets org after.

### rufuspollock (2016-09-13T08:18:53Z)

@jgkim i'd suggest transferring the repo into the `datasets` org if we can? If you can make @zelima an admin on your repo he can do that for you - and then he can add you as an admin here ...

### jgkim (2016-09-19T08:02:05Z)

@zelima What do you think? Are you still working on it? I'm OK with transferring the repo. @rgrp

### zelima (2016-09-19T11:48:48Z)

@jgkim I have problem with finding time for now, but I'll finish as soon as I find one
