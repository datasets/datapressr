---
number: 47
title: (Major) Cities of the World
state: closed
author: rufuspollock
created_at: "2014-02-02T13:02:31Z"
updated_at: "2016-02-26T00:12:33Z"
closed_at: "2016-02-26T00:12:29Z"
labels: ["Priority: ★★★"]
---

# (Major) Cities of the World

See http://www.unece.org/cefact/locode/service/location.html - looks like we would have to scrape (and not sure what the license is ...)

See also #30 (city population time series) - this provides a nice CSV file so maybe we extract from that ...)

## Comments

### rufuspollock (2014-02-19T11:57:15Z)

@tlevine @Stiivi @pudo do you know any good sources beyond that listed above?

### Stiivi (2014-02-19T12:44:19Z)

[ISO 3166-2](http://en.wikipedia.org/wiki/ISO_3166-2) is a good source. I guess it needs to be scraped as well.

### rufuspollock (2014-02-19T12:52:07Z)

@Stiivi alpha and currency codes stuff from ISO already done - see e.g. http://data.okfn.org/data/country-codes

### rufuspollock (2014-08-15T17:57:46Z)

@mchelen would you be interested in helping doing this data packaging? If so this would be a really useful dataset to do ...

### pwalsh (2015-01-05T23:04:45Z)

Check this out: https://github.com/mledoze/countries

### rufuspollock (2015-01-06T11:51:05Z)

@pwalsh thanks for the link. Note we already have the country codes stuff in http://data.okfn.org/data/core/country-list and http://data.okfn.org/data/core/country-codes - #24 and #21

### iotakodali (2015-01-15T18:36:42Z)

@rgrp what data are you looking for in cities? just the list of them or other indicators like population, area, location too?

### rufuspollock (2015-01-15T19:11:32Z)

@iotakodali i guess this one was _just_ city names (perhaps plus country they were in) - so really simple (population for cities is #30). We do this sometimes to provide people with date really simply - e.g. you could imagine this being used for a timezone drop-down or something in an app. You may want to strip the data out of #30 or pull from suggested source here.

Also open to suggestions for other a "rich" city dataset - but open a new issue for that.

### pudo (2015-01-15T19:13:12Z)

Geonames is a great source for this, cf. http://www.geonames.org/maps/cities.html

### rufuspollock (2015-02-22T22:11:24Z)

@iotakodali how are you doing here?

@pudo do you know where you can get the raw data dump for that

@all: any thoughts on exactly what is most useful in this dataset (e.g. city name (english and local language), centroid (lon, lat) ...)

/cc @sxren

### pwalsh (2015-02-23T07:21:41Z)

Raw data for geonames: http://download.geonames.org/export/dump/

Useful:
- Name
  - English
  - Common
- Country
  - Name
    - English
    - Common
- Region (region in country, for example state in Australia)
  - Name
    - English
    - Common
- Population
  - Time series
- Centroid
- GeoJSON
  - Timeseries

### pdehaye (2015-12-02T00:06:40Z)

@pwalsh, are you still working on this?

### pwalsh (2015-12-02T07:10:42Z)

@pdehaye no, I'm not working on a data package for this.

### lexman (2016-02-13T16:48:53Z)

Hello there,

Here's a first attempt to package a list of cities from geonames available online 
at : http://sisyphus.lexman.org/workflows/world-cities/datapackage.json. I followed the idea to make a very simple set of data, so the only included fields are :
- name in english
- asciiname (it's already provided by geonames)
- name of the country
- name of the "subcountry". Either the name of a state (eg US, UK) or an administrative area ("region" in France)
- geoname's primary key "geonameid"

While packaging, I had to make choices I'd like to dicuss :
- what is a _major_ city ? Geonames provide three subset of cities : above 15,000 inhabitants, above 10,000 and above 5,000 inhabitants. I choose > 15,000 because of the word 'major'. If I wasn't lazy I would have merged all the datasets from all the countries and extracted only the cities. But that would have included a lot of very small cities, even with one inhabitant. For example in France, more than 20,000 cities have less than 100 inhabitants ! And a lot of them have the same name...
- how to make the difference between the cities with the same name ? I added "admin1" field (renamed subcountry) from geoname to improve usability in a pick list. There are still a few ambiguities, so the geoname id could be used in last resort.
- what language ? The primary language in geonames is english, but why favor it instead of french, russian, mandarin or spanish ? The local language would really be nice, but unfortunately not very readable in utf8.
- what about utf8 ? geonames provides an ascii name so I included it. But since datapackages are suposed to be in utf8, maybe this column should be removed. Or maybe an 'asccisubcountry' column should be aded for consistancy.

The code to process this data is available inside the datapackage on github : https://github.com/lexman/world-cities/tree/master/scripts. It uses tuttle (https://github.com/lexman/tuttle) to ensure production of this data is reproductible.In order to produce the final data, I've put cities, countries and subcountries data into an sqlite table and used an sql join. That's a big tool for this small task, but I'm not sure what fields we want in the end, and it's easy to make evolutions that way.

Tuttle also allows me to provide a kind of continuous integration for this project : my server runs the project every ten minutes so it updates the datapackage in case the source data (or the processing code) has changed. I even get a mail if something is broken (did the provider remove a column ?) so I know I have to fix it.

Please, give me feedback about the few choices above, or my bad english in the doc ! You can even submit pull-requests : it's easy for me because the data is automatically updated when I merge the code.

Lexman

### rufuspollock (2016-02-18T13:06:34Z)

@lexman this is **awesome** - great work. Quick comments:
- Choice of cities: great
- In terms of city names: where you have you added "admin1" into - i think we probably want to leave the original name untouched in at lest one column
- Name: could we get a column with english version and a column with "native" version?
- Utf8: up to you but i'd go with plain utf8 and not worry about ascii

Overall this just looks great and we should start getting you editorial rights so you can move this over as an official core dataset.

One minor thing: please post links to the validation and preview links for your dataset as per quality assurance process http://data.okfn.org/doc/core-data-curators#3-quality-assurance

@pdehaye can you, as managing curator, support in any review, moving of repos etc

### lexman (2016-02-18T13:44:31Z)

Thank you for the feedback !

I'll be away for three days, but I'll do the ajustements and the quality checks when I get back. About the  the native version of the names, it's the right thing to do but it'll be longer.

By the way, I'm not sure I understood what you mean about the admin1 column...

### rufuspollock (2016-02-18T20:05:10Z)

@lexman great
- Re native names - why don't we leave this out of the first release if it is painful - we can open an issue for it and see if others want it too ..
- Re "admin1" stuff I was referring to your:
  
  > how to make the difference between the cities with the same name ? I added "admin1" field (renamed subcountry) from geoname to improve usability in a pick list. There are still a few ambiguities, so the geoname id could be used in last resort.
  
  Re-reading I realise you just added the column/field (which is great) - whereas I had thought you had perhaps merged admin1 value into the name field (which I would recommend against). So nothing to change here I think ...

### lexman (2016-02-21T14:23:21Z)

So here we are for review :
- Validation link : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Flexman%2Fworld-cities%2Fmaster%2Fdatapackage.json
- review link : http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Flexman%2Fworld-cities%2Fmaster%2Fdatapackage.json

If review is good, data will be ready for publishing. 

I will look in the native name in the next few days to add this usefull column.

### rufuspollock (2016-02-21T15:36:51Z)

@lexman i think the datapackage.json is broken as the path to the resource is `data/world-cities.csv` not just `world-cities.csv`. Can you fix that ... 

My one other tip is just using the simple github repo when doing the validation and view urls - it makes it nicer to got check the repos.

### lexman (2016-02-22T05:13:12Z)

Looks like it's working now. And thank you for the tip, I didn't know I could do that. So here are the new :
- validation url : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Flexman%2Fworld-cities
- preview url : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fworld-cities

### lexman (2016-02-22T07:11:29Z)

Regarding the native name, I originally wanted to use the field "isPreferredName" from the alternate names in geonames, but it doesn't seem reliable. 

For the record, here are the 2 examples I looked at :
- I though I would find the chineese writing for Bejing would be selected... But I find none 
- In Thaïland, the selected language is russian for the city of Sukhothai (the former capital of the Siam Kingdom, the ancestor of Thailand)

By the way, the notion of native name can be difficult in multi language countries :
- In Belgium, Antwerpen in the Flemish region is also called "Anvers" in French (the other official language of the country). 
- Jaffna (the major city in the north of Sri Lanka) can be written either in Singalese or in Tamil language. The city is in the tamil area of the country

Maybe we'll have to provide several native names, in several columns...

### rufuspollock (2016-02-22T12:22:30Z)

@lexman i suggest we leave native name for now and get this into core datasets and open an issue on the repo logging this as something to work on.

@pdehaye could you do the honours re final check and moving this into github.com/datasets (and giving @lexman admin rights either on that repo or by giving him general edit rights with the org)

### pdehaye (2016-02-22T12:47:26Z)

@rgrp  will try to start doing this in 10 hours or so. have been very busy past week

### lexman (2016-02-22T14:25:27Z)

So what's the next step ? Do I need to do something to give ownership of the repo to okfn ?

### rufuspollock (2016-02-22T23:18:38Z)

@pdehaye awesome and much appreciated! @lexman @pdehaye will explain the process.

### pdehaye (2016-02-22T23:35:44Z)

Hi @lexman This looks great! I have just reviewed, and have one comment (see below).
Let me explain the ownership transfer process first. We need you to have admin rights on this repo, **but** the repo to be transferred within the _datasets_ organisation. So I have added you as a member, and as a curator. Once you accept this membership, you will have the right to transfer ownership of the repo. To do that, go to the repo then "Settings" -> "Danger Zone" -> "Transfer ownership". 
Note, and this is my comment, that this will invalidate some of the links you have added: at least two in the datapackage, and one in the README.md file (to the "ambiguities" link). 
Your scripts might then need some fixin'.
Let me know if you have other questions!

### lexman (2016-02-23T02:52:44Z)

So I changed the links to refer to the datasets organisation. I also completely removed the reference to `ambiguities.csv`, as it was linking to my personnal server.

Will start moving the repo in a minute...

### lexman (2016-02-23T03:01:20Z)

I tried to transfert ownership but I get "You don’t have admin rights to datasets". 

On my profile, I'm not part of the datasets organization, maybe that's why ?

### pdehaye (2016-02-23T09:24:13Z)

probably. did you actively accept the invite i sent you? did you receive something? just now?

### lexman (2016-02-23T12:48:08Z)

Sorry, I haven't received any mail nor notification...

### danfowler (2016-02-23T12:54:02Z)

@lexman can you try going to the top-level at https://github.com/datasets?  Your invitation is still pending and can be accepted there.

### lexman (2016-02-23T13:40:10Z)

All right I got the invitation ! Should I give ownership to curators or Managing Curators ?

### pdehaye (2016-02-23T16:26:24Z)

@lexman can you explain what you did exactly to see the invitation (this confusion keeps on happening...)? thanks! 

I am not sure who should get ownership. I would say give ownership to curators, and the rest of the team can figure out exactly what is best later (it looks like a general mess in that respect).

### lexman (2016-02-24T00:30:38Z)

The invitation was indeed on the top of  https://github.com/datasets page. 

And I was able to add ownership to both Curators or Managing Curators.

Thanks everyone for help !

@pdehaye, tell me we're all done :)

### pdehaye (2016-02-26T00:12:29Z)

@lexman, you are done and done. thank you very much for reviving this 2 years old ticket and working so hard on it!!!
