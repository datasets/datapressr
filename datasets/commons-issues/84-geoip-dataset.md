---
number: 84
title: GeoIP dataset
state: closed
author: rufuspollock
created_at: "2015-04-17T05:50:35Z"
updated_at: "2015-06-28T18:58:19Z"
closed_at: "2015-06-28T18:58:19Z"
labels: []
---

# GeoIP dataset

What databases are there? Is there an open one out there?

Probably take a look at http://datahub.io/

## Comments

### edobejar (2015-04-21T02:47:21Z)

Maxmind has downloadable databases in CSV format with CC BY-SA 3.0 license:
http://dev.maxmind.com/geoip/geoip2/geolite2/

### rufuspollock (2015-04-21T06:24:25Z)

@edobejar perfect. How big is the file? Would it be worth looking at data packaging this?

### edobejar (2015-04-21T17:37:28Z)

Did this first approach. There were two different CSV, one with fields like network, geoname_id and the other with geoname_id, country_name. Made a script to combine both and create a single CSV dataset (172755 rows in total - 11MB), with the following considerations:
- Where geoname_id was not available, registered_country_geoname_id was used.
- Where geoname_id and registered_country_genoname_id where empty, geoname_id, continent_code, continent_name, country_iso_code and country_name are empty.

https://github.com/edobejar/geoip2

### rufuspollock (2015-04-26T18:23:09Z)

@edobejar great work and this should go in. A few minor suggestions:
- Can we tweak the README.md in line with suggestions at http://data.okfn.org/doc/publish-faq#sections
- Can we fix indentation / formatting in https://github.com/edobejar/geoip2/blob/master/datapackage.json
- Can you drop in the links to the validation and view in here as comments as per http://data.okfn.org/doc/core-data-curators#3-quality-assurance

@Yannael are you happy to help review here.

### Yannael (2015-04-28T04:43:51Z)

@rgrp yes
@edobejar 
Looks quite good
- The title might give too many details. I would suggest 'IPv4 geolocation', and leave information regarding data source and last update in the README file.
- There is a typo for the type of the field 'continent_name' ('tring' instead of 'string')

### edobejar (2015-04-29T19:22:42Z)

Done, updated with your suggestions. Here are the links:
- Validation:<br>
  http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fedobejar%2Fgeoip2
- View: <br>
  http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fedobejar%2Fgeoip2

Best!

Edo

### Yannael (2015-04-29T20:52:49Z)

Great!
Regarding the README conventions at http://data.okfn.org/doc/publish-faq#sections, 
- could you add a section 'Preparation' explaining how you created the dataset (did you use a script, or manually arranged the two files) ?
- and start the README without header (i.e. remove 'IPv4 geolocation datapackage', since it is not displayed nicely in the datapackage viewer) 
  Thanks!

### rufuspollock (2015-05-09T14:15:18Z)

@edobejar how you doing there - this would be a great dataset to get in.

### rufuspollock (2015-05-17T16:07:43Z)

@edobejar / @Yannael how's it going?

### edobejar (2015-05-18T15:08:16Z)

Hi @rgrp, just updated datapackage with @Yannael 's suggestions for readme.
https://github.com/edobejar/geoip2/

### Yannael (2015-05-21T18:55:10Z)

Hi @edobejar 
Great! Can you transfer the ownership to me, so I can then transfer it to github/datasets? (this is in settings, transfer ownership) ?

### Yannael (2015-06-01T07:46:05Z)

@edobejar 
A reminder for the transfer, so we can make it available on the portal. Thanks!

### Yannael (2015-06-15T20:49:01Z)

Hi @edobejar 
A reminder for the transfer!

### edobejar (2015-06-16T04:50:02Z)

Hi @Yannael, transfer done. How do I maintain it after transferring it?

### Yannael (2015-06-17T03:19:47Z)

Hi @edobejar 
Nice, added to core packages
@rgrp 
For the maintenance, what is the best way?

### rufuspollock (2015-06-28T02:29:14Z)

Sorry for slow response.

@Yannael we should keep @edobejar an admin on the repo after the transfer (just create a dedicated team if necessary).

Great work all and look forward to having this closed and a tweet announcing the new core dataset!

### Yannael (2015-06-28T18:58:16Z)

@edobejar @rgrp 
Ok, added a team for the repo, and twitted about it!
