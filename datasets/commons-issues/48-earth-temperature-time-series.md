---
number: 48
title: Earth Temperature Time Series
state: closed
author: rufuspollock
created_at: "2014-03-08T16:30:31Z"
updated_at: "2016-01-06T13:20:52Z"
closed_at: "2015-02-15T14:10:09Z"
labels: ["Priority: ★★★", "Topic: Climate"]
---

# Earth Temperature Time Series

## Comments

### sxren (2015-01-11T09:46:12Z)

http://www.ncdc.noaa.gov/cag/time-series/global

> Global temperature anomaly data come from the Global Historical Climatology Network-Monthly (GHCN-M) data set and International Comprehensive Ocean-Atmosphere Data Set (ICOADS), which have data from 1880 to the present. These two datasets are blended into a single product to produce the combined global land and ocean temperature anomalies. The available timeseries of global-scale temperature anomalies are calculated with respect to the 20th century average, while the mapping tool displays global-scale temperature anomalies with respect to the 1981-2010 base period. For more information on these anomalies, please visit Global Surface Temperature Anomalies.[1](http://www.ncdc.noaa.gov/cag/data-info)

### rufuspollock (2015-01-11T13:56:35Z)

@sxren looks great - let's proceed. For this one just boot your own repo and we can then move it to datasets organization!

### sxren (2015-01-14T04:22:23Z)

ok.

### sxren (2015-01-16T17:58:42Z)

@rgrp wrote a javascript (casperjs) scraper for the noaa data in the comment above tonight, but then....

saw the news on twitter about 2014 being the hottest year on record and found nasa's http://data.giss.nasa.gov/gistemp/tabledata_v3/GLB.Ts+dSST.txt, annual and monthly data in a single text file via http://data.giss.nasa.gov/gistemp/.

1) would it be useful for people using the data to have the nasa and noaa data (different) in one csv?
2) annual and monthly csv's or only annual? annual is less maintenance. monthly is useful for month to month comparisons.

### rufuspollock (2015-01-16T19:07:59Z)

@sxren good spot. can you do a quick check of the differences. Could be worth having them in the same data package (either as separate data files or in one consolidated file).

### sxren (2015-01-17T05:42:35Z)

@rgrp
The numbers are close to each other.

```
Year,Annual Mean,Source
1880,-0.14,NOAA NCDC
1880,-0.21,NASA GISS
...
1970,0.07,NOAA NCDC
1970,0.04,NASA GISS
...
2014,0.69,NOAA NCDC
2014,0.68,NASA GISS
```

### rufuspollock (2015-01-17T10:05:31Z)

@sxren sounds like pulling both would be good and merging into one file (it sounds like they are broadly comparable).

### sxren (2015-01-17T11:29:12Z)

@rgrp ok.

~~ i guess it should be something along the lines of:~~

~~Year,NCDC,GISS~~
~~1880,-0.14,-0.21~~

for reference:

NOAA/NCDC

> 1981-2010 base period

NASA/GISS

> deviations from the corresponding 1951-1980 means

A third dataset—Met Office Hadley Centre observations—is available at http://www.metoffice.gov.uk/hadobs/hadcrut4/data/current/download.html#regional_series.

> relative to 1961-1990

```
1880,-0.23
...
1970,-0.03
...
2014,0.56
```

however, it has a restrictive license. :(

> HadCRUT4 is subject to Crown copyright protection. The material may be downloaded to file or printer for the purposes of **private study and scientific research**. Any other proposed use of the material is subject to a copyright licence available from the Met Office.[1](http://www.metoffice.gov.uk/hadobs/hadcrut4/terms_and_conditions.html)

### rufuspollock (2015-01-18T15:52:44Z)

@sxren re Met Office let's note that in the README in data section but not include it at the moment (btw it would be a nice follow up to ping the met office to find out why they are applying this restrictive license - I know that in general they are quite big on open data).

### sxren (2015-01-21T22:49:34Z)

@rgrp initial commit at https://github.com/sxren/global-temp

i pinged the met office about the terms and conditions.

a scraper for the met office dataset is included in the `process.py` script, but the script is set to run without it for now.

### rufuspollock (2015-01-23T08:05:14Z)

@sxren great stuff. Could you include a link to validate output and to default view i.e. use http://data.okfn.org/tools/validate and http://data.okfn.org/tools/view (I think we could make these standard and add these instructions to our Getting Started doc ...)

@jalbertbowden would you like to have a go at reviewing this data package (checking structure, datapackage.json etc).

### sxren (2015-01-23T08:44:33Z)

@rgrp

Data Package Validator: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsxren%2Fglobal-temp%2Fmaster%2Fdatapackage.json

DataPackage Viewer: http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsxren%2Fglobal-temp%2Fmaster%2Fdatapackage.json

that could get repetitive fast. i guess i need to look at the github issues api.

> I think we could make these standard and add these instructions to our Getting Started doc

great idea! where is our _getting started_ doc? ^^;

@jalbertbowden thanks in advance for your review. really appreciate it!

### rufuspollock (2015-01-25T13:41:17Z)

@jalbertbowden are you good to review?

@sxren here is [Getting Started doc](https://docs.google.com/a/okfn.org/document/d/144X5lsB1nCIB9v0Km4iXiLBKWu7dbkHXK5EVbZKVVUk/edit)  (it was linked in email to original volunteers). Aside: I think near-term we probably want to move away from separate gdoc and get this info integrated into the main website docs http://data.okfn.org/doc/ and http://data.okfn.org/roadmap/core-datasets/ (note all of that content comes from https://github.com/okfn/data.okfn.org/ so easy to edit)

### sxren (2015-02-08T20:42:32Z)

@jalbertbowden any feedback on this? i see you have a lot of data wrangling experience. a second set of eyes is always appreciated. thanks. :)

### jalbertbowden (2015-02-09T00:53:46Z)

@sxren thanks, but i'll bet your much better with code than i ;). i will look @ this but its currently third on my plate. hopefully tonight...more than likely tomorrow.

### sxren (2015-02-09T01:13:12Z)

@jalbertbowden there's more to data wrangling than code. ;) that said, code is definitely worth dabbling in.

### sxren (2015-02-14T21:57:07Z)

@jalbertbowden i'd like to add https://github.com/sxren/global-temp to datasets and close this issue, unless you had any comments or suggestions. thank you.

### rufuspollock (2015-02-15T13:16:56Z)

@sxren I think this is good to go though it would be nice to get a "view" (i.e. a time series graph) in this data package. Right now I think we move it to datasets and add to the core list and then add the view once we have done that.

### sxren (2015-02-15T14:10:54Z)

@rgrp view added
