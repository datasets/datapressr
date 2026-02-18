---
number: 87
title: Dataset of all (commercial) aircraft accident / crashes
state: open
author: rufuspollock
created_at: "2015-04-19T08:33:30Z"
updated_at: "2019-12-02T10:00:30Z"
labels: []
---

# Dataset of all (commercial) aircraft accident / crashes

We want a dataset of all commercial aircraft accidents / crashes so that we can answer questions like "Has flying become more safe", "Which are the safest airlines (?)", "How safe is flying compared to other modes of transport".

Note we may not have a global database but datasets per jurisdiction. For example, the US has detailed data but just on US flights / carriers. Ultimately we have collected data on US, UK and an international database (B3A).

## Tasks

* [ ] NTSB dataset - see new issue here ...
* [ ] B3A dataset - see new issue here ...
* [ ] ...

## Research

Questions: US or global?

### Global

https://aviation-safety.net/database/record.php?id=19200223-0 - looks quite good, 1921 to date

Also a potential https://www.icao.int/safety/iStars/Pages/Accident-Statistics.aspx - 2008-2016 

* API https://www.icao.int/safety/iStars/Pages/Accident-Statistics.aspx
  * But may have to pay :grimacing: 

#### Bureau of Aircraft Accidents Archives (B3A) :star: 

https://www.baaa-acro.com/

From wikipedia
 
> The Bureau of Aircraft Accidents Archives (B3A), a non-government organization based in Geneva, compiles statistics on aviation accidents of aircraft capable of carrying more than six passengers, excluding helicopters, balloons, and combat aircraft. Note that ACRO only considers crashes in which the aircraft has suffered such damage that it is removed from service, which will further reduce the statistics for incidents and fatalities compared to some other data. The total fatalities due to aviation accidents since 1970 is 83,772.


### US

#### NTSB

Official gov source (NTSB) with an excellent database 

https://www.ntsb.gov/_layouts/ntsb.aviation/index.aspx

Full Download (CSV with "|"): http://app.ntsb.gov/aviationquery/Download.ashx?type=csv

(Have XML too but not really that useful - same data, no better structure)

The NTSB aviation accident database contains information from 1962 and later about civil aviation accidents and selected incidents within the United States, its territories and possessions, and in international waters. Generally, a preliminary report is available online within a few days of an accident. Factual information is added when available, and when the investigation is completed, the preliminary report is replaced with a final description of the accident and its probable cause. Full narrative descriptions may not be available for dates before 1993, cases under revision, or where NTSB did not have primary investigative responsibility.

* Monthly lists - accidents sorted by date, updated daily.
* Investigations Nearing Completion - List of investigations with estimated dates of publishing probable cause.
* Downloadable datasets - one complete dataset for each year beginning from 1982, updated monthly in Microsoft Access 2000 MDB format; this site also provides weekly "change" updates and complete documentation.
* GILS record - complete description of the accident database, including definition of "accident" and "incident".
* FAA incident database - complete information about incidents, including those not investigated by NTSB, is provided by the Federal Aviation Administration.
* Data & Information Products - lists other sources of information about aviation accidents, including publications, dockets, and press releases

## Comments

### monikappv (2019-11-27T10:02:52Z)

## Subissue

Aircraft accidents/crashes due to thunderstorm, icing or turbulence

We want a dataset of all aircraft accidents/crashes caused by thunderstorm, icing or turbulence so that we can answer questions like "Has flying become safer", "In what way can the bad weather affect a flight".

### Research
no research needed, this research question was inspired by data found in one of the links above -->

Aviation safety :star: 
https://aviation-safety.net/database/record.php?id=19200223-0
