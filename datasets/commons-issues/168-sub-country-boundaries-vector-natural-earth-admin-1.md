---
number: 168
title: Sub-country boundaries (vector) - Natural Earth Admin 1
state: open
author: rufuspollock
created_at: "2016-03-09T14:57:34Z"
updated_at: "2016-04-25T13:06:29Z"
labels: []
assignees: [lexman]
---

# Sub-country boundaries (vector) - Natural Earth Admin 1

Geo Package "Admin 1 – States, Provinces"

Questions:
- Is this one package all in one file, one package multiple files or one package per country?
- Is there a choice on resolution e.g. 110m vs something else? What do we go for?
- Package naming. Options:
  - `geo-all-admin1` or just `geo-admin1` if we do whole world in one package
  - `geo-{country-code-2-digit}-admin1`
  - `geo-ne-{country-code}-admin` - this is if we want to be explicit here with reference to natural earth 
- Is there a way to get some of this moving back upstream to natural earth - i know there was interaction with NE folks in #38 

@lexman would you be interested in taking this one on?

## Comments

### lexman (2016-03-10T15:48:20Z)

Looks like something I could do. I'll have a look, but not before a few days.

### rufuspollock (2016-03-11T07:32:27Z)

@lexman great - thanks and no rush!

### lexman (2016-03-21T07:24:08Z)

I started looking at the data. It states clearly on the site (http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) that this data is still in **beta**.

> Is this one package all in one file, one package multiple files or one package per country?

I see two use cases : some could need the first administrative division of their own country. Some 
could need these for the whole world, or part of it. It seems easier to filter useful data than
to aggregate several file. For example, the cartographic tool `org` has some optons for filtering data and none for aggregation of files. As for aggregating several datapackages it does not look frictionless.
So I would go for one package, one file. Should the need for individual country arise, we can 
add all the countries. With in their own file inside the datapackage ?

I started a test project at https://github.com/lexman/geo-admin1

About resolution, we have to start with the 10m set because the other resolutions are not complete yet. They only cover Us and Canada : http://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/

Problem is : the geojson file is 58 MB... I could not even push it on github ! I'll figure out something to reduce the size.

As for the naming... I leave that for the next comment.

### rufuspollock (2016-03-23T12:45:48Z)

@lexman ok - remember we could break per country and start with 50m and just do US and Canada to start with.

In terms of size we could consider git lfs but i don't like that approach that much ...

### lexman (2016-03-24T17:16:32Z)

I cut the floating part of the coordinates to 6 (about 10 cm on earth) which reduces the file to 30 MB, and it _should_ not impact the topology of the areas. If someone has checked out the repo, I had to force change the history of the repository.

Don't worry about the source (50m or 10m), with tuttle it's reaaly easy to change later.

### lexman (2016-03-24T17:28:31Z)

About the naming, my first though was : we'll make the best reference data, so we don't have to remind in the name of the package that the data comes from Natural Earth. I'm not so sure anymore.

This notion of _admin1_ is very difficult. If you see the test package on the viewer http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-admin1, you can see that the United Kindom is split in very small parts inside (smaller than England, Scottland, Wales and Northern Ireland), whereas the United States are split in states. I really don't know whether we should aim to put in the same level states and provinces.

For the moment, I think I will rename my test package to `geo-ne-admin1` and clearly state that we transparantly expose what NE considers as admin1.

### lexman (2016-03-24T17:47:12Z)

@rgrp , you said that

> Is there a way to get some of this moving back upstream to natural earth - i know there was interaction with NE folks in #38

What are you thinking of ?

Also, as a french, I looked at the data and there are a bit of confusion beetwen _departement_ and _region_. 

The admin1 from Natural Earth is obviously still in beta.

### lexman (2016-03-24T20:08:46Z)

@rgrp , @pdehaye   Even if quality isn't perfect, do you want to add it or wait until it is better ?
- view link : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-ne-admin1
- validation link : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-ne-admin1

### rufuspollock (2016-03-27T09:12:45Z)

@lexman 
- Re naming: I agree on just keeping the natural earth pretty explicit and not modifying (we are primarily in the business of "packaging" not modifying a la debian but for data ...)
- Re US stuff - maybe we do a geo-ne-admin1-us (separately)
- I've checked your files - the view looks good though it takes so long for the data to load - i wonder if we need something there in the view code to not try previewing when you have such a large file ;-)

/cc @pdehaye @jalbertbowden any thoughts?

### jalbertbowden (2016-03-27T13:55:07Z)

looks good enough to me. clearly you all have been doing much more and are more aware but i don't see anything that makes it unusable.
for viewing, perhaps create topojson version also? i know there are differences between the two files, but i don't see that as a reason to discredit topojson as a format for viewing/rendering, especially if one is aware that of the differences between geojson/topojson. 
converted admin1.geojson to .topojson and difference in size is telling: geo is 30.6mb, topo is 4.6. here it is in a gist for comparison. https://gist.github.com/jalbertbowden/e5a75241fb07c63f2762

### lexman (2016-03-29T22:44:04Z)

@rgrp I've added a geo-ne-admin1-us repository with US at low scale. I perfectly understand the need for this dataset, however I'm not totaly satisfied for two reasons :
- we can't develop this method to all the countries in the world : it would be impracticle to maintain 250 geo-ne-admin1-XX repositories
- I made a specific treatment for the US, because the meaningfull code for each state is the two-letter code, like "CA", instead of "USA-3521". 

Anyway, it is ready to be published if needed :
- view link : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-ne-admin1-us
- validation link : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-ne-admin1-us

### rufuspollock (2016-04-01T11:56:52Z)

@lexman 
- Re extending to whole world: i hear you but we can cross that bridge when we come to it ;-)
- On the code treatment not sure I understand. In general i suggest we stay completely faithful to NE as far as possible.

One minor points:
- I increasingly think we drop "Prepartion" section from main README _if_ we have the scripts/README.

Otherwise this looks great and we should get this in. @pdehaye are you happy to manage the formalities with @lexman ?

### pdehaye (2016-04-02T20:56:41Z)

@rgrp sure, can manage

### pdehaye (2016-04-02T20:59:00Z)

@lexman this looks good, but I need you to transfer ownership of the dataset to the "datasets" organisation. Let me know (here) when you have done that.

### lexman (2016-04-04T01:01:51Z)

I'm back !

Following @rgrp I've put back the `id` column to be faithfull with NE. But I also added a `state_code` column, because this two letter code is the frictionless well known code used by every one, easy for joins.

And I've droped the preparation section. It will be nicer for the viewer, instead of a dead link.

@pdehaye I'm giving ownership in a minute...

### lexman (2016-04-04T01:29:30Z)

Here are the final links after transfert

geo-ne-admin1 :
- view : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fdatasets%2Fgeo-ne-admin1
- validate : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fdatasets%2Fgeo-ne-admin1

geo-ne-admin1-us :
- view : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fdatasets%2Fgeo-ne-admin1-us
- validate : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fdatasets%2Fgeo-ne-admin1-us

@pdehaye  I've created a [pull-request](https://github.com/datasets/registry/pull/176) in case you agree to add to add the datasets :)

### jalbertbowden (2016-04-04T01:56:05Z)

realize i'm doing nothing but playing team spirit from afar, but great job! very, very, nicely done!

### lexman (2016-04-09T18:01:32Z)

Team spirit is good... Thanks @jalbertbowden !

### lexman (2016-04-14T00:35:51Z)

@pdehaye, @rgrp has merged the changes in the reference csv files and i've reloaded the list, but the new datapackage isn't a aimable on the core datapackage list. Do you have any idea ? Have I missed something ?

### pdehaye (2016-04-25T13:06:29Z)

@lexman certainly part of the problem is that the core CSV was badly formatted (note: we also need to add it to the txt file). I fixed that now at https://github.com/datasets/registry/commit/a1018fd2f72de16b8a9b7e6c7b52d0369eee0964 
But it still does not reload and I absolutely don't know why. I asked @rgrp to have a look.
