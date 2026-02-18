---
number: 139
title: Global temperature anomaly
state: closed
author: Snekili
created_at: "2015-12-11T13:49:31Z"
updated_at: "2016-01-21T22:25:17Z"
closed_at: "2016-01-21T22:25:13Z"
labels: ["Type: Indicator", "Topic: Climate"]
---

# Global temperature anomaly

What is wanted: Data Tables of Global, Hemispheric, and Zonal Temperature Anomalies
# The Info

Global temperature anomaly data from the [NASA GISS Surface Temperature (GISTEMP) Analysis](http://cdiac.ornl.gov/trends/temp/hansen/data.html) at the US Government's Carbon Dioxide Information Analysis Center (CDIAC).
## Data

There are individual datasets for different regions:
- Global Annual Temperature Anomalies, 1880-2014 Land Meteorological Stations: http://cdiac.ornl.gov/ftp/trends/temp/hansen/gl_land.txt

```
--------------------------
          Annual     5-yr
 Year     Anomaly    mean
-------------------------- 
 1880     -0.43    -99.99 
 1881     -0.34    -99.99
 1882     -0.28     -0.38
 1883     -0.28     -0.39
```
- Global Annual Temperature Anomalies, 1880-2014 
  Land + Ocean http://cdiac.ornl.gov/ftp/trends/temp/hansen/gl_land_ocean.txt

```
--------------------------
          Annual     5-yr
 Year     Anomaly    mean
-------------------------- 
 1880     -0.21    -99.99
 1881     -0.13    -99.99
 1882     -0.16     -0.19
 1883     -0.19     -0.20
 1884     -0.27     -0.22
```
- Hemispheric Temperature Anomalies, 1880-2014 
  Land + Ocean http://cdiac.ornl.gov/ftp/trends/temp/hansen/nhsh.txt
- Annual temperature anomalies (land + ocean) for three latitude bands (90N-23.6N, 23.6N-23.6S,23.6S-90S) that cover 30%, 40% and 30% of the global area, respectively, 1900-2014
  [Land + Ocean](http://cdiac.ornl.gov/ftp/trends/temp/hansen/norlowsou.txt)

Cached data in google drive https://drive.google.com/drive/folders/0B_KlKJBuuX4aWUpLQV9jdUNVRlk
## Other Sugested data sources

World Meteorogical Organization suggests period from 2011-2015 is most likely warmest 5 year period on record, and refers to several datasets among others to this:
-  http://www.metoffice.gov.uk/research/monitoring/climate/surface-temperature
- Global Av. Surface T. Anomalies - http://ds.data.jma.go.jp/tcc/tcc/products/gwp/temp/ann_wld.html

Indicates that Five Warmest Years (Anomalies) are: 1st. 2015 (+0.40°C), 2nd. 2014 (+0.27°C), 3rd. 1998 (+0.22°C), 4th. 2013, 2010 (+0.20°C)

## Comments

### Snekili (2015-12-27T16:00:47Z)

@rgrp Can you take a look at this one?

### rufuspollock (2015-12-28T17:38:21Z)

@kiliakis can we start packaging this one - note i think we want to combine the 4 (or at least first 2) different CDIAC dataset into one - i.e. just have additional columns named after each series.

### kiliakis (2015-12-30T08:30:46Z)

@rgrp Okay I'm working on it. I'll post any updates here.

### kiliakis (2016-01-03T14:15:35Z)

@rgrp Packaging this one is almost complete. I included all 4 dataset (additional columns for each series) into two different csv files. The first one contains annual data while the second contains 5-year means. The graph in the data package view displays only annual data though.
Here are the links:
- [validation link](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Fglobal-temp-anomalies%2Fmaster%2Fdatapackage.json)
- [view link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fglobal-temp-anomalies)
- [datapackage](https://github.com/kiliakis/global-temp-anomalies) 

Waiting for feedback :)

### rufuspollock (2016-01-03T19:41:40Z)

@kiliakis this looks great - getting really efficient :-) Some minorish comments:
- I would generally recommend storing the raw data files in `archive` not `cache` and actually committing them (often data later disappears off the web and it is useful to have the raw data archived). If you really do have temporary files then cache is great
- License section could be a bit clearer. I think you need to make clear that the data is coming from US Federal government funded agency and hence is assumed to be public domain and that the license applied covers the additional work we did. See http://data.okfn.org/doc/publish-faq#-strong-license-strong- and http://data.okfn.org/data/datasets/us-employment-bls for a nice example
- I'd also recommend that the "citation" either go in a dedicated "Citation" headed section or go under license. Personally i think the latter is preferable. 

@pdehaye do you want to do a review?

### rufuspollock (2016-01-04T09:27:18Z)

@kiliakis I suggest we get this moved over to github.com/datasets and added to core.

One other thought: I think we can start using "keywords" field and putting climate in there.

### kiliakis (2016-01-05T00:33:58Z)

@rgrp I merged in the proposed modifications. I also added keywords field in .json file, containing only the word climate currently. Here is the updated [view link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Fglobal-temp-anomalies). Please review.

### rufuspollock (2016-01-05T09:27:33Z)

@kiliakis looks good to me.

@pdehaye do you want to check and then get this moved over to datasets with @kiliakis?

Last point: it would be nice to start "promoting/announcing" these datasets when they come online. Worth pinging @danfowler so e.g. @pdehaye you could tweet this from okfnlabs twitter and even have a regular blog post listing the latest exciting core datasets :-)

### pdehaye (2016-01-06T13:10:37Z)

@rgrp Yes, will move with @kiliakis  
@danfowler The Twitter OKFN Lab idea sounds good, but we need to have a new one in first :)

@kiliakis I need you to transfer the repository, it's the same situation as for #29

### danfowler (2016-01-06T16:38:34Z)

@pdehaye you should have access to tweet as okfnlabs, let me know if you have any issues

### kiliakis (2016-01-10T15:50:43Z)

@pdehaye it looks like I have insufficient permissions to create a new repository under datasets organization. Am I missing something?

### rufuspollock (2016-01-13T17:54:20Z)

@kiliakis fixed now - you  should be able to transfer and/or create (github permissions change had confused me!)

### kiliakis (2016-01-16T11:04:13Z)

@pdehaye , @rgrp transferred this one too

### rufuspollock (2016-01-21T14:47:53Z)

@kiliakis ok - and do you have the pull request to add this to the registry? To complete what we usually want is a link to github repo plus a link to live on data.okfn.org and then we can close the issue :-)

### pdehaye (2016-01-21T22:25:13Z)

yes, he has done the pull request. I just announced this new package on Twitter. so this is now done, modulo #159. I am closing the issue.
