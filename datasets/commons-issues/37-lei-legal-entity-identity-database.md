---
number: 37
title: LEI (legal entity identity) database
state: open
author: rufuspollock
created_at: "2013-12-04T12:42:16Z"
updated_at: "2024-03-29T10:30:48Z"
labels: ["Priority: ★★", hackathon]
---

# LEI (legal entity identity) database

See http://p-lei.org/about

See also http://openleis.com/ - seems to be a dump at http://openleis.com/legal_entities.json and http://openleis.com/legal_entities.xml (not sure about license)

## Comments

### smith-phil (2015-05-08T13:52:48Z)

openleis.com was started by OpenCorporates so I'm guessing it's a sharealike license. Let me see if I can find out from them what the license situation is.

### CountCulture (2015-05-08T14:02:06Z)

Actually the primary source from this data is now https://www.gleif.org//en/services/gleif-services/access-lei-data/lei-download 
It's CC0 Licence I'm very pleased to say (I'm on the Board of directors of the GLEIF)!

### smith-phil (2015-05-09T11:25:04Z)

Thanks Chris.

### rufuspollock (2015-05-09T14:13:12Z)

@smith-phil may we should try and get this data packaged upstream - i.e. ask gleif to do this.

Though in the first instance i suggest we make a data page for it - with a remote url for the data (so we don't copy the data across)

Annoyingly they don't provide the CSV itself but zip it up :-/ - suggest they have raw csv and use gzip deflate in their webserver ...

### CountCulture (2015-05-09T16:29:25Z)

@rgrp The data is not as a CSV but as a daily-produced XML file using the Common Definition Format agreed with the regulators.

### rufuspollock (2015-05-09T18:54:44Z)

@CountCulture ah ok - so, in that case, may definitely be worth unpacking and looking at whether it can be tabularized ...
