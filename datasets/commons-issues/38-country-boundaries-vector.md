---
number: 38
title: Country Boundaries (vector)
state: closed
author: rufuspollock
created_at: "2013-12-07T21:53:40Z"
updated_at: "2016-03-07T11:59:40Z"
closed_at: "2016-03-07T11:59:36Z"
labels: ["Format: Geodata", "Priority: ★★★"]
---

# Country Boundaries (vector)

This would be country polygons at crudest scale (e.g. 1:110m). Suggest packaging natural earth data (pd etc).

package name: `geo-boundaries-world-110m`

Long-term: best way would be to get primary natural earth folks to add in "packaging" - they are already on github - see https://github.com/nvkelso/natural-earth-vector. But we need an exemplar ...

What format should we use?
- geojson
- topojson - already have this here https://github.com/mbostock/topojson/tree/master/examples
- (geocsv ?)
- (sqlite)

/cc @jalbertbowden @amercader - thoughts here very welcome :-)
## Data
- [natural earth geojson from @nvkelso](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson) - [just boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_boundary_lines_land.geojson)
- [topojson from @mbostock](https://github.com/mbostock/topojson/blob/master/examples/world-110m.json)
- Natural earth site: http://www.naturalearthdata.com/downloads/110m-cultural-vectors/

## Comments

### rufuspollock (2013-12-07T22:11:05Z)

Booted repo at https://github.com/datasets/geo-boundaries-world-110m

### jalbertbowden (2013-12-08T15:03:34Z)

if there has to be one, i say json. conversion @ this point imo is a joke.
unless its not an option because this is geodata. then i say geojson.

i'm not a fan of only one format though. in an ideal world, one xml to rule
them all...in reality, as long as its an open format and conversion is not
extremely difficult, i like to have as many flavors as possible for end
users. convenience of use via data portability. the easier someone can
access data to accomplish their goal, the better.

i'm really excited about this. i have the longest list of repos to raid. i
also need to fix my repo error as well as get up to speed. no excuses, just
have alot going on at the moment.

as for natural earth and others similar, i'm not aware of a perfect
solution. owners can be a bit possesive...can be. diplomacy and a case by
case approach would be my route.

i was on the fence about reposting data until feds shut down their sites.
now i could careless: i will post any data i find. with proper citation,
but any data. kind of wreckless, but its also a goal. the more exposure
datasets get the better. like any press is good press.

and i love github for it because its wide open for public access. every
single piece. but you all know that.

cheers,
albert

On Saturday, December 7, 2013, Rufus Pollock wrote:

> Booted repo at https://github.com/datasets/geo-boundaries-world-110m
> 
> —
> Reply to this email directly or view it on GitHubhttps://github.com/datasets/registry/issues/38#issuecomment-30066263
> .

## 

J. Albert Bowden II

jalbertbowden@gmail.com

http://bowdenweb.com/

### rufuspollock (2013-12-15T11:58:21Z)

@jalbertbowden really useful feedback. Let's go for geojson. Repo is in progress and I have some data down and ready to push. I'm also halfway through a "publishing geodata" tutorial for http://data.okfn.org. Would you be up for taking a look at this once I've pushed something ...

### amercader (2013-12-15T13:28:10Z)

+1 to GeoJSON, although a big proportion of geospatial folk will still find
shapefiles more helpful. Perhaps it will need to have the geom simplified a
bit if it is too heavy. I can also help having a look at the tutorial if
you want another pair of eyes.
On 15 Dec 2013 11:58, "Rufus Pollock" notifications@github.com wrote:

> @jalbertbowden https://github.com/jalbertbowden really useful feedback.
> Let's go for geojson. Repo is in progress and I have some data down and
> ready to push. I'm also halfway through a "publishing geodata" tutorial for
> http://data.okfn.org. Would you be up for taking a look at this once I've
> pushed something ...
> 
> —
> Reply to this email directly or view it on GitHubhttps://github.com/datasets/registry/issues/38#issuecomment-30603066
> .

### jalbertbowden (2013-12-16T21:30:10Z)

@amercader +1 shapefile usage will be heavier or as heavy....geojson is a baby. shapefiles are quite useful.

here's how i've been converting them:
csv _> http://togeojson.com  
kml -> http://mapbox.github.io/togeojson/
shp -> http://converter.mygeodata.eu/vector

at some point, i'd like to stop and finish building a conversion tool in the browser. i have collected a ton of single conversion libs via github, just haven't pieced them together. no need to reinvent....i'm more worried about optimization with so much different code, but should be quite manageable. maybe start the repo here instead of personal? just a thought.

more than happy to look whenever you'd like. can also have close friend/professional content writer read it for grammar. i'm assuming its still not up, right?

you guys ever get on irc? does opendata have a freenode channel? i bet it does, but if not we could make it. local cfa brigade made #codeforva so the local group can chat it up. i'm on a bunch of different ims too. can do hangout but it extremely limits my resources. won't do skype...after nsa surrender...no way. 
basically, it would be nice to hop onto a chat and shoot a bunch of ideas back and forth. i also think the original data format question could be asked on opendata.stackoverflow.com
so i asked it: http://opendata.stackexchange.com/questions/1363/optimal-data-formats-for-open-data-repositories

this is exciting.

### jalbertbowden (2013-12-17T01:12:32Z)

natural earth repo already has geojson! could it be as simple as forking here?

### nvkelso (2013-12-17T01:22:33Z)

The geojson in natural earth is generated by ogr2org, a gdal related tool,
anytime the SHP file changes.

I suggest using ogr, not a custom convertor, for any other data source.

Sent from my handsful device.

On Dec 16, 2013, at 17:12, albert notifications@github.com wrote:

natural earth repo already has geojson! could it be as simple as forking
here?

—
Reply to this email directly or view it on
GitHubhttps://github.com/datasets/registry/issues/38#issuecomment-30718021
.

### jalbertbowden (2013-12-17T02:10:24Z)

nice. was not aware of ogr web tool http://ogre.adc4gis.com

### rufuspollock (2013-12-17T10:45:10Z)

@jalbertbowden irc channel is #okfn on freenode.

### rufuspollock (2013-12-21T18:27:10Z)

@jalbertbowden to add ...
- on converters: very interested here in some in browser stuff. We've done some work in form of stuff like http://okfnlabs.org/dataconverters/ (which has nascent geo support)
- I'm thinking of rename to "geo-countries-110m" since i think we want polygons rather than just boundaries - does this make sense?
- I've nearly got first pass of this data package and will try to push tonight.

### rufuspollock (2013-12-22T00:32:22Z)

@jalbertbowden  Working data package at https://github.com/datasets/geo-boundaries-world-110m - feedback welcome and we can use this as a template for further data packages.

### rufuspollock (2015-02-08T13:05:41Z)

@jalbertbowden up for completing this?

### jalbertbowden (2015-02-08T16:29:38Z)

sure. i need to do something here.

### jalbertbowden (2015-02-09T16:20:45Z)

does natural earth have each jurisdiction broken out into separate files?  
i've been over their downloads numerous times trying to clarify and not ask the obvious...but if they have it, i'm totally overlooking it.  

if they don't, thoughts on what datasets to use? i was just looking at DIVA-GIS, and i think it'll do nicely, if need be.

### nvkelso (2015-02-09T16:23:51Z)

you'd need to use a command line tool like ogr2ogr (in the gdal family) to
filter &/or clip out the per country information from natural earth.

On Mon, Feb 9, 2015 at 8:20 AM, albert notifications@github.com wrote:

> does natural earth have each jurisdiction broken out into separate files?
> 
> i've been over their downloads numerous times trying to clarify and not
> ask the obvious...but if they have it, i'm totally overlooking it.
> 
> if they don't, thoughts on what datasets to use? i was just looking at
> DIVA-GIS, and i think it'll do nicely, if need be.
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/38#issuecomment-73537651.

### jalbertbowden (2015-02-09T16:25:58Z)

werd. i'll see what i can dig up

### jalbertbowden (2015-02-20T21:16:44Z)

think i found it here. ogr2ogr -f "ESRI Shapefile" -where 'SOVISO="FR"' FRANCE_110m_admin_0_co  
working on this now

### ThomasG77 (2015-02-22T22:40:53Z)

Is it working on your side? I've forked the repository and automated extraction per countries and added the shp files at https://github.com/ThomasG77/geo-boundaries-world-110m
The only remaining part IMO is documenting all fields.

As I was working on the fields part, I was wondering if there is a way to declare a schema and make a reference in datapackage (a bit like in xml). I produced the "per countries" GeoJSON and the fields schema remains the same. So duplicating 177 times is not really good IMO.

### jalbertbowden (2015-02-23T19:38:12Z)

no i'm still having an issue. jvm.dll not found. thinking about wiping the desktop and starting over. 
agree about duplication....if you would like me to help with the fields, lmk

### ThomasG77 (2015-03-31T21:08:57Z)

@jalbertbowden Can you help for the fields? See https://github.com/ThomasG77/geo-boundaries-world-110m/blob/master/datapackage.json#L30
I've some missing fields undocumented (I will duplicate fields metadata for each country file after)
@nvkelso Any feedback, additions as your are the original data producer?

### nvkelso (2015-04-01T05:01:23Z)

What do you need help with? What fields need documenting?

On Tue, Mar 31, 2015 at 2:08 PM, Thomas Gratier notifications@github.com
wrote:

> @jalbertbowden https://github.com/jalbertbowden Can you help for the
> fields? See
> https://github.com/ThomasG77/geo-boundaries-world-110m/blob/master/datapackage.json#L30
> I've some missing fields undocumented (I will duplicate fields metadata
> for each country file after)
> @nvkelso https://github.com/nvkelso Any feedback, additions as your are
> the original data producer?
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/38#issuecomment-88249181.

### ThomasG77 (2015-04-01T07:59:31Z)

The fields I mentioned are from https://github.com/ThomasG77/geo-boundaries-world-110m/blob/master/datapackage.json#L31 to https://github.com/ThomasG77/geo-boundaries-world-110m/blob/master/datapackage.json#L407
Each of them looks like below

```
 {
    "name": "woe_id",
    "title": "",
    "type": "number",
    "description": ""
},
...
```

As you see, I always have the field `name` and `type. The undocumented parts are in`title`and`description`. In some cases, I was able to guess (or I think) but I'm stuck for some of them. Any help is appreciated.

### jalbertbowden (2015-04-04T23:29:46Z)

guys i keep getting slammed on every front. i'm sorry i'm not being much help. i do plan on helping alot, i just need to get some things in order first. until then, i'll try and comment when i can, but with my current schedule i'm not even getting on here daily like i used to.
carry on, you're doing a great job.
i'm sorry for letting you down

### rufuspollock (2015-04-09T20:44:30Z)

@jalbertbowden are you able to help @ThomasG77 resolve this one issue? then we can get this up. wdyt?

### jalbertbowden (2015-04-11T06:02:32Z)

ok. i have hobbled a gist of *some and relevant links to try and piece it together, but its really a mess. there is no clear definition.  
you'll see if you follow the links in this gist.
i commented on the issue with the gist and links too....hopefully we'll get some feedback.  
https://github.com/nvkelso/natural-earth-vector/issues/121  
here's the gist, i just did Afghanistan:  
https://gist.github.com/jalbertbowden/1a94aa339682eabfdc6a

### lexman (2016-02-14T23:21:56Z)

Hello,

is someone still working on this ? I'm quite familiar with org so I can maintain this datapackage. 

What fields should we include ? A really minimalist set (geometric shape of the country, common name of the country, ISO3 code of the country) that is meant to be joined with the very complete https://github.com/datasets/country-codes ? Or should we include all or partial data from the former ?

By the way, should we split countries withe their overseas parts (eg France and La Réunion) or should we gather them in the same multiple geometric shape ?

### jalbertbowden (2016-02-15T02:20:29Z)

not sure if anyone is still actively pursuing this....i know i haven't done anything since my last post. still have not heard back from natural earth.  

fields to include:
preferably all the fields that we already have....you can view them in the repository.

not sure about all/partial data from the former....

not sure about splitting countries either....hopefully others can comment.

essentially we need all of the fields we are using defined. realistically, we'll take any fields that we can get defined, and we seriously appreciate it.

thanks @lexman!

### lexman (2016-02-15T17:57:48Z)

Hello,

I was already following my first idea (make this data a good complement for https://github.com/datasets/country-codes), so here is a datatapackage with only 2 fields. I called it geo-countries-110m as suggested above by @rgrp.
It's available on : http://sisyphus.lexman.org/workflows/geo-countries-110m/datapackage.json

Source code and doc are on github at https://github.com/lexman/geo-countries-110m

I'll add some fields later on, but I already know some are out of purpose, like population or gdp.

### rufuspollock (2016-02-17T22:54:33Z)

@lexman this is brilliant. If it it looks good we'd move this over into github.com/datasets and make this an official core dataset!

@pdehaye + @jalbertbowden do you want to review.

### jalbertbowden (2016-02-18T02:29:35Z)

@rgrp i'll take a peek tonight

### lexman (2016-02-21T14:59:24Z)

For review :
- Validation link : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Flexman%2Fgeo-countries-110m%2Fmaster%2Fdatapackage.json

Unfotunately, preview link does not seem to work properly : http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Flexman%2Fgeo-countries-110m%2Fmaster%2Fdatapackage.json because the map is not displayed. It does not seem to be an issue with the datapackage, because I get an error a 'dataproxy' url from the viewer : http://data.okfn.org/tools/dataproxy/?url=https%3A%2F%2Fraw.githubusercontent.com%2Flexman%2Fgeo-countries-110m%2Fmaster%2Fdata%2Fcountries.geojson . Anyone an idea ? @rgrp ?

### rufuspollock (2016-02-21T15:41:47Z)

@lexman when you get that 404 its because the underlying file does not exist which it does not ;-) You have `countries.geojson` in the resource path but the file is `countries.json` - https://github.com/lexman/geo-countries-110m/blob/master/data/countries.json

Also the homepage file should use http:// not git:// (it must be a url ...)

### lexman (2016-02-22T05:05:05Z)

Thanks for the help, it's much better now !

### rufuspollock (2016-02-22T12:23:10Z)

@lexman awesome - can you resubmit validation and preview links.

@pdehaye can you review and then do the honours re moving this over :-)

### pdehaye (2016-02-22T12:47:36Z)

@rgrp  will try to start doing this in 10 hours or so. have been very busy past week

### jalbertbowden (2016-02-22T13:24:25Z)

looks great! nicely done. thank you.

### lexman (2016-02-22T14:24:09Z)

Validation link : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-countries-110m

Preview link : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-countries-110m

### pdehaye (2016-02-22T23:41:48Z)

Hi @lexman, this looks good, except that I am a bit baffled at what you mean by 1:110m. I understand you mean some measure of how coarse the approximation is, but I have trouble translating the scale (1:110m) to a measure of the granularity of the approximation. 

Also, your README.md mentions 1:110, not 1:110m. And again, the homepages will need to be adapted to the new address once you transfer ownership.

### lexman (2016-02-23T02:32:49Z)

@pdehaye, you're right about the scale : one has to master both geography and computers to understand what is means in pixels. So I removed every reference to the scale (except in the `sources`field) and I changed the name of the repository.

Here are the new links with the updated name :
- validation : http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-countries
- preview : http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Flexman%2Fgeo-countries

Also I changed the references of the repository for hosting in the datasets organisation

### pdehaye (2016-02-26T21:45:16Z)

@lexman Looks good! Can you transfer ownership?

### lexman (2016-02-27T12:12:22Z)

Transfert should be complete :)

### rufuspollock (2016-02-29T12:13:34Z)

@pdehaye would you like to explain to @lexman what last steps need to be done (e.g. add to core list, reload site, tweet it!) - that way @lexman can lead on this in future ;-) I think most of this is already in http://data.okfn.org/doc/core-data-curators#4-publishing

### pdehaye (2016-03-07T11:57:41Z)

Hi @lexman 
The steps I take after validating, checking the dataset, etc, and the transfer of ownership (indeed these steps  are explained at http://data.okfn.org/doc/core-data-curators#4-publishing , slight update waiting in a pull request):
-  Add to the [catalog list](https://github.com/datasets/registry/blob/master/catalog-list.txt) **and** the [core list](https://github.com/datasets/registry/blob/master/core-list.txt) **and** the associated csv files: [catalog-list.csv](https://github.com/datasets/registry/blob/master/data/catalog-list.csv) and [core-list.csv](https://github.com/datasets/registry/blob/master/data/core-list.csv). 
  - Reload [http://data.okfn.org/data/](http://data.okfn.org/data/) by visiting http://data.okfn.org/admin/reload/
  - Tweet from the @OKFNLabs account a link to the http://data.okfn.org/data/ page for the dataset. For this you need to get access, which you don't have right now. @danfowler , can you give @lexman access if that's ok? 
- Close the issue
