---
number: 108
title: ISO container codes
state: closed
author: cmsdroff
created_at: "2015-08-11T09:51:28Z"
updated_at: "2016-01-06T20:34:23Z"
closed_at: "2016-01-06T20:34:17Z"
labels: ["Type: Reference"]
---

# ISO container codes

I'm working on a research project with HMRC, One Government at the Border, UN/CEFACT and a handful of private companies from the shipping supply chain world, we are building a data pipeline to establish and secure data in the supply chain from source to origin.

Working through the data set and there are common datasets which like the unece/cefact package codes we contributed earlier this year would be beneficial to be on here and openly available, as we all use them, and sometimes struggle to get the data and revert back to googling.  This data is readily available in the public domain when searching for it and passed around between various companies.  However for these two datasets you can pay for the information (it comes with a larger dataset), if we can scrape this information from the web, are you happy to host it or would it cause you some issues in terms of license etc?

**Lloyds / IMO vessel codes** are available free for logged in users from the official channel (http://imonumbers.ihs.com/default.aspx) but searching for any vessel name reveals the IMO code and vessel flag i.e. http://www.shipspotting.com/gallery/photo.php?lid=1757275 and these are also available from each shipping line.

For this dataset we only care about shipping line container vessel names, imo code and vessel flag.

**ISO Container Codes** are available from the official channel (http://www.iso.org/iso/catalogue_detail?csnumber=20453) but are also available from many websites i.e. http://www.containercontainer.com/ISO6346.aspx 

For this dataset we only care about the Code and the Description

We can potentially scrape this information for both datasets from a number of places, so my question is that if we do so, are you happy to host the information on the datasets project?

@sxren @rgrp i'd welcome your comments please before doing any work as wouldn't want to cause you any upset.

On a positive note the datasets that we use in shipping such as the un location codes and package codes are now being used by parties in the project :)

## Comments

### rufuspollock (2015-08-11T10:02:10Z)

@cmsdroff it is just great to hear about these efforts and the specific projects.

To your key question: yes, if you were able to scrape these datasets (and preferably continue to maintain them, at least initially) we would be willing to host them as part of the project - in fact, we would be delighted to do so.

### cmsdroff (2015-08-12T15:18:45Z)

Great, thanks @rgrp we have identified the sources and will write a script to scrape and package in the coming weeks :)

### pdehaye (2015-11-29T02:17:31Z)

@cmsdroff IMO vessel code packaging was passed on to #109, but are ISO container codes still on?

### cmsdroff (2015-12-22T14:38:49Z)

Yes, i'll commit them now for review.

### cmsdroff (2015-12-22T14:47:39Z)

Validation Link: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwarrantgroup%2FISO-Container-Codes%2Fmaster%2Fdatapackage.json

DataPackage Link: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fwarrantgroup%2FISO-Container-Codes#readme

### cmsdroff (2015-12-22T15:09:06Z)

repository ready to transfer @sxren already in the team but can add @pdehaye if preferred?

### pdehaye (2015-12-23T23:42:28Z)

Great work. I forked your warrantgroup repo into the datasets/ organisation, and made a small change to your datapackage.json, lowercasing all the field names to match what is in the csv.

### rufuspollock (2015-12-29T17:59:53Z)

Great work all round.

One small comment @pdehaye: in general we prefer not to fork the repo in but to move it and give @cmsdroff admin rights on it - is is possible to do that - otherwise it is not clear what the primary repo is ...

### cmsdroff (2016-01-05T09:58:53Z)

@rgrp do you need me to do anything more or is @pdehaye going to 'move' the repo over to datasets?  I've merged the changes made into the master repo so it's ready to go.  Let me know so i can fork it back for control of integration into our system.  Thanks!

### pdehaye (2016-01-06T16:43:18Z)

Note to self: I need to clean up the mess I have created here, and make sure there is one true ultimate version in datasets/ with @cmsdroff given admin rights.
