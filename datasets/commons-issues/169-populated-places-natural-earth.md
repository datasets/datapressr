---
number: 169
title: Populated Places (Natural Earth)
state: open
author: rufuspollock
created_at: "2016-03-09T15:01:06Z"
updated_at: "2016-07-11T10:22:05Z"
labels: []
---

# Populated Places (Natural Earth)

See http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/

Is this a dupe of #47 (world cities)? If so should we merge some of this into https://github.com/datasets/world-cities (and open an issue for that there)?

/cc @lexman @pdehaye

## Comments

### pdehaye (2016-03-10T13:51:32Z)

This one says 

>  Point symbols with name attributes. Includes all admin-0 and many admin-1 capitals, major cities and towns, plus a sampling of smaller towns in sparsely inhabited regions. We favor regional significance over population census in determining our selection of places.

So that's a top-down approach: for each region, the most significant cities are selected. In contrast, world-cities says

> This datapackage only list cities above 15,000 inhabitants. Each city is associated with its country and subcountry to reduce the number of ambiguities. 

That seems bottom-up: select the city's name first, then specify what is needed to really identify it. 

It looks like it is meant to talk about the same concepts, but the selection happens differently. Integrating the two would improve the quality. What do you think @lexman ?

### lexman (2016-03-13T07:11:44Z)

The purpose of geonames is to be an inventory of the names everywhere in the globe, and the one of naturalearth is to make beautiful maps.

So I think geonames is geonames  and reliable wheras naturalearth could add (or remove) cities if their placement on the map would improve readability. that's why I'm not sure merging them would result in something meaningfull. What should we do with places that are in one dataset and not in the other ?

### rufuspollock (2016-03-13T18:52:49Z)

@lexman from your comments my sense is we keep them separate and we create a data package called e.g.

`geo-ne-populated-places`

### zelima (2016-07-05T14:18:36Z)

@rgrp @lexman @pdehaye I could prepare datapackage, but download [link(s)](www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_populated_places.zip) are for zip files and main file that (I think) contains data has .dbf extension. Any ideas how to handle with this one?

### lexman (2016-07-10T15:09:26Z)

Hello,

the data is in [shapefile](https://en.wikipedia.org/wiki/Shapefile) format which is a set of 5 files. That's why they offer one download link in the zip format.
The best tool for handling geographic data is [ogr](http://www.gdal.org/ogr_utilities.html). You can find example of the syntax in project [geo-countries](https://github.com/datasets/geo-countries/blob/master/scripts/tuttlefile).

### zelima (2016-07-11T10:22:05Z)

@lexman Thanks for info.. I'll take a look at them.
