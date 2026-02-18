---
number: 145
title: Global Fire 
state: open
author: Snekili
created_at: "2015-12-15T18:11:38Z"
updated_at: "2019-12-02T19:54:59Z"
labels: ["Type: Indicator", "Topic: Climate"]
---

# Global Fire 

Total deaths and damage in US $ coused by Wildfires and Drough

## Comments

### Snekili (2015-12-15T18:21:03Z)

@rgrp 

## **Potential data source**

**EM-DAT** contains essential core data on the occurrence and effects of over 18,000 mass disasters in the world from 1900 to present. The database is compiled from various sources, including UN agencies, non-governmental organisations, insurance companies, research institutes and press agencies.

[Disaster database EM-DAT](http://www.emdat.be/)

[Actual data can be filtered here](http://www.emdat.be/disaster_profiles/index.html)

[Data in google drive](https://drive.google.com/open?id=1pQjk6k6zos6uo-x9QCxBGHSmxUu5mpHpSr-YGDGspWc)

## Other potential sources

http://neo.sci.gsfc.nasa.gov/view.php?datasetId=MOD14A1_M_FIRE

### zelima (2016-06-29T12:05:41Z)

@Snekili @rgrp to download data it need first to be filtered. 
EM-DAT may be filtered by year, disaster type or by it's subgroup. eg: We can get data that contains total damage (USD) by countries that was caused by earthquake. It looks something like this:

```
Country,Type,Date,Total damage ('000 US$)
China,Earthquake,27-07-1976,242000
Haiti,Earthquake,12-01-2010,222570
China,Earthquake,22-05-1927,200000
China,Earthquake,16-12-1920,180000
Indonesia,Earthquake,26-12-2004,165708
```

Problem is that the button that gives download link is JS button (I guess), so I can not get actual download link to automate process.

It also has [disaster-list](http://www.emdat.be/disaster_list/index.html) where you can request raw data, but first we need to request data. So I'll have to manually download filtered file and datapackage after

Other link that contains active fires data also needs to be filtered, and gives the links to download files, but when I do so the data looks very strange eg:
if i choose data of April 2016 (1 degree) the first couple of lines look something like this: 

```
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
99999.0,99999.0,99999.0,99999.0,99999.0,99999.0,
```

To be honest all the data looks like this - see link: http://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1703042&cs=rgb&format=CSV&width=360&height=180

### rufuspollock (2016-07-03T15:05:26Z)

@Snekili I am going to let you look at this with @zelima

### Snekili (2016-07-04T12:13:15Z)

@rgrp 
@zelima You have example in google drive link  - [**Natural__1900_2015_summary.csv - Climatilogical**](https://drive.google.com/open?id=1pQjk6k6zos6uo-x9QCxBGHSmxUu5mpHpSr-YGDGspWc), but  this database contains much more than just a Global Fire and damage, It has datasets for Drought, Earthquakes, Epidemic, Extreme Temperature, Volcanic Activity etc... and more advanced subgroups like Complex disasters, Natural, Technological... Climatological, Meteorological..... By Continent, Region or Country... 
And I cant get link to download csv file directly, I can just download it in drive. 
We must look at it together.

### zelima (2016-07-04T13:13:11Z)

@Snekili Yeah, there are much of useful data, just there are no links to download them. 
@rgrp there is kind of "online tool" that generates the data depended on filter options. You can try it here: http://www.emdat.be/disaster_profiles/index.html
