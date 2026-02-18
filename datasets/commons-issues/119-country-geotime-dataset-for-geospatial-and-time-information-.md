---
number: 119
title: country-geotime dataset, for geospatial and time information related to country
state: open
author: ppKrauss
created_at: "2015-09-22T16:33:14Z"
updated_at: "2019-12-02T20:08:41Z"
labels: ["Type: Reference", "Format: Geodata", "Difficulty: hard"]
---

# country-geotime dataset, for geospatial and time information related to country

A `datasets/country-geotime`  to complement [datasets/country-codes](https://github.com/datasets/country-codes), with  geospatial country information and time references.  As "join" with `country-codes` the most popular "country ID" (_ISO3166-1-Alpha-2_    and _ISO3166-1-numeric_) can be adopted. The other relevant columns already have rationale and specifications,
- [country-codes/issues/22](https://github.com/datasets/country-codes/issues/22): spec for columns `utmzones_list` and `neighbor_list`.
- [country-codes/issues/5](https://github.com/datasets/country-codes/issues/5):  spec for `utc_list` column.

---

PS: [territory_language](http://www.unicode.org/cldr/charts/latest/supplemental/territory_language_information.html) and other standards are using _ISO3166-1-Alpha-2_  in "list of countries" attributes, see [tr35/Supplemental_Language_Data](http://unicode.org/reports/tr35/tr35-info.html#Supplemental_Language_Data).

## Comments

### rufuspollock (2015-09-23T14:36:08Z)

@ppKrauss seems very sensible. Do you want to do a first pass on a data package for this?

### ppKrauss (2015-09-24T12:56:57Z)

@rgrp Thanks and ok (!), I am preparing, and may be sent weekend.

### ppKrauss (2015-09-28T15:22:51Z)

Hello,  the data package was prepared, it is a first draft, https://github.com/ppKrauss/country-geotime

PS: needs `utmzones_list` and review of `neighbor_list`...  There are some suggestions (ex. official lang list)  from http://cldr.unicode.org/ and I think some Wikidata standard values (as country area and population) can be used.

### rufuspollock (2015-10-05T08:07:40Z)

@Yannael can you review?

### Yannael (2015-10-05T17:29:41Z)

Sure,
I am however quite busy until Wednesday evening
I briefly checked it validates and displays properly.
A short note on the README: following guidelines there http://data.okfn.org/doc/publish-faq#readme
could you remove the 'Introduction' heading, and add the license one.
I'll have a closer look at the data content on Thursday, and get back to you!

### Yannael (2015-10-07T18:16:30Z)

Hi @ppKrauss 

I had a look at the data content, and have these two questions:
- France has no neighbouring countries, why is that?
- How does the 'type' field for territoryContainment relate to the first table (if it does) ?

Otherwise, in terms of presentation of the dataset, I would make it self contained, and not refer to Github discussions. I would suggest to update with a short paragraph presenting what the content is about (Countries, neighboring countries, UTC).

Also, a useful section to clarify would be the 'preparation' section : ideally the sequence of commands to run in order to reproduce these two datasets.

Cheers

### ppKrauss (2015-10-07T22:12:49Z)

Thanks @Yannael, 
NOTE: it is a "first draft" and, as [I said before](https://github.com/datasets/country-codes/issues/22#issuecomment-140444969), I not have PostGIS yet (do you have? _OKFN offers some infrastructure that we can use?_) here to test geo-scripts... But the project aims can be discussed with this draft... I can create another CSV with only "homologated data", to add only "good columns", after each discussion and finalization.

Answering,

> France has no neighbouring countries, why is that?

Yes, is the point where we stop, because I only sketched the procedures to a friend... I still need to see the data, see the maps, do tests, do experiments... (need a machine with PostGIS). There was [try1 and try2](https://github.com/ppKrauss/country-geotime/wiki/Country-neighbors%2C-preparation-report), need try3... The source mundi map is not good (no topology, only workarounds), perhaps need another better source, with reliable topology.

Another suggestion is to use [Wikidata queries](https://wdq.wmflabs.org/), even to confirm some samples... Wikidata is a good "second source".

> How does the 'type' field for territoryContainment relate to the first table (if it does) ?

Is part of [TR35, the macroregion](http://unicode.org/reports/tr35/#Validity_Data), "the standard codes that are macroregions (...) some two-letter region codes are macroregions, and (in the future) some three-digit codes may be regular codes". [This CSV](https://github.com/ppKrauss/country-geotime/blob/master/data/territoryContainment.csv) details which regions are contained within which macroregions, see the [`<territoryContainment>` element at supplementalData.xml](https://github.com/ppKrauss/country-geotime/blob/master/originals/supplementalData.xml).

> ... in terms of presentation of the dataset, I would make it self contained, and not refer to Github discussions. I would suggest to update with a short paragraph presenting what the content is about (Countries, neighboring countries, UTC).

Yes, ok, I can do (review text, documentation, etc. and simplify)

> Also, a useful section to clarify would be the 'preparation' section : ideally the sequence of commands to run in order to reproduce these two datasets.

Ok, good ideia to simplify, I can do.

---

Other question: do you agree to add coluns like population, langs_official, etc. that I suggested with the draft?  They are also Wikidata information, that can be "confirmed by sampling". The official reference (as reliable source) for this "extra data" remains [TR35](http://www.unicode.org/reports/tr35/).

### Yannael (2015-10-08T18:00:54Z)

Sorry I thought that was an 'advanced draft', where the idea was to include it in official data packages. My remarks are then not so relevant.
I will try to have a deeper look this week end at how everything connects there
Cheers!

### ppKrauss (2015-10-08T18:55:57Z)

@Yannael, sorry my English, I am using automatic translator in some fragments ;-)
Your remarks are so relevant. In this week (or later) could be just showing and  discussing the directions ... I need check simple things like "more columns? that columns is good?". After _try3_ completed, your checking (homologation) will be also so important.

### ppKrauss (2015-10-19T03:12:10Z)

Hi @Yannael , now I have better map-data, see [contry-neighbors.csv](https://github.com/ppKrauss/country-geotime/blob/master/data/contry-neighbors.csv),  you can check if it is ok (!)... I was checking some samples with Wikipedia and was ok. 

The _draft_ of preparation-text [is here](https://github.com/ppKrauss/country-geotime/blob/master/README.md#country-neighbors)... Perhaps next  weekend I can finish texts and unify data.

### Yannael (2015-10-22T17:26:21Z)

Hi @ppKrauss 
That looks nice, and will give you a more detailed feedback on Saturday
If you have an update till then, let me know
Cheers

### Yannael (2015-10-23T16:33:35Z)

Hi @ppKrauss ,

Taking a bit of perspective with the datasets you are creating, I see complementary, but also somewhat redundant, info with https://github.com/datasets/country-codes and https://github.com/datasets/language-codes/ (for example country name, or official language), and that it would be best not to duplicate any of the information already available in these two data packages. 

It is really nice I think to have complementary infos about countries, such as neighbouring countries, timezone, or population, but I am a bit worried about the ‘coherence’ of such data, why put them together. Neighbouring countries is about geographic info, timezones about, well, timezone info, and population about demographic infos. 

A suggestion could be to have a ‘country-metadata’ repository, where there would be one CSV for each category of info. 

Or maybe best, following the ‘country-*’ naming, have different data packages, ‘country-timezones’, ‘country-neighbours’, ‘country-demographic’, with the ISO_ALPHA2 code as common key. 

What do you think?

@rgrp

### ppKrauss (2015-10-26T04:15:27Z)

Hi @Yannael , thanks to showing directions!

I am reorganazing, with your suggestion to split into "`country-*`"... The first one is at https://github.com/okfn-brasil/country-geoinfo
check [`data` folder](https://github.com/okfn-brasil/country-geoinfo/tree/master/data). If this first is ok, my next step will to add `datapackage.json` in it; and start  _country-timezones_... Them later we discuss _country-langs_ and _country-demographic_.

### pdehaye (2015-12-01T15:08:07Z)

Hi @ppKraus, I am joining as new datasets managing curator. Looks like this baby was about to be delivered. Any update?

### ppKrauss (2015-12-01T16:42:09Z)

Hello @pdehaye , welcome!

Hum, I need one weekend to review all this project, I think we can manage some pending decisions meanwhile... Can you designate a collaborator for check the [country-geoinfo.csv](https://github.com/okfn-brasil/country-geoinfo/blob/master/data/country-geoinfo.csv) file?

### pdehaye (2015-12-01T21:33:43Z)

I just looked at `country-geoinfo.csv`. Its general shape looks good, but I immediately have questions/comments: 
- change the `country` header to include some hint as to the format used. This information will be in the `datapackage.json`, but it is still useful to have
- change `UTMgrid_cells` to `UTM_grid_cells`
- make sure to specify somewhere how the neighbours were computed, and how the grid cells were computed. Indeed, it looks like the neighbours of France don't include Brazil, for instance, so some choice had to be made in excluding Guyana. And I am unsure how the cells were computed either. I see this has been part of the discussion before in this thread, and is documented a bit in your github repo. Your datapackage should be stand-alone.

### ppKrauss (2015-12-02T01:06:13Z)

Thanks (!), lets see 
- "change the country header (...)" I not understand what need change, sorry; only that I need to do `datapackage.json`.. Ok, now we have a preliminar one.
- "change UTMgrid_cells to UTM_grid_cells". Ok changed.
- Hum... I checked and now is ok, no BR at FR, etc. But need more checking for homologation. Wikipedia and Wikidata offers some reference data.

So, [okfn-brasil/country-geoinfo](https://github.com/okfn-brasil/country-geoinfo) is updated.

### pdehaye (2015-12-04T23:22:16Z)

Yeah, forget about the first point. Ping me here when ready for review!

### ppKrauss (2015-12-05T22:00:04Z)

Hello @pdehaye , you can review [country-geoinfo](https://github.com/okfn-brasil/country-geoinfo).

### pdehaye (2015-12-10T23:29:14Z)

I just have, and submitted a pull request.
