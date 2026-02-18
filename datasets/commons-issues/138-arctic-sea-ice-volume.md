---
number: 138
title: Arctic Sea Ice Volume
state: open
author: rufuspollock
created_at: "2015-12-11T13:47:01Z"
updated_at: "2024-03-29T10:00:08Z"
labels: ["Type: Indicator", "Format: Tabular", "Topic: Climate", hackathon]
---

# Arctic Sea Ice Volume

Monthly sea ice extent measurements from 1978 to present from [NSIDC National Snow and Ice Data Center](http://nsidc.org/data/docs/noaa/g02135_seaice_index/index.html). The Sea Ice Index provides a quick look at Arctic- and Antarctic-wide changes in sea ice. It is a source for consistent, up-to-date sea ice extent data.

The images and data are produced in a consistent way that makes the Index time-series appropriate for use when looking at long-term trends in sea ice cover. Both monthly and daily products are available. However, monthly products are better to use for long-term trend analysis because errors in the daily product tend to be averaged out in the monthly product and because day-to-day variations are often the result of short-term weather.

Monthly extent products are also available as geographic information systems (GIS) compatible shapefiles.
## Data

From http://nsidc.org/data/seaice_index/archives.html:

> ### Monthly Sea Ice Extent and Area Data Files
> 
> The ASCII data files tabulate extent and area (in millions of square kilometers) by year for a given month.
> 1. Go to the FTP Directory: ftp://sidads.colorado.edu/DATASETS/NOAA/G02135
> 2. Choose the month directory (indicated by a 3-character month abbreviation) for the data that you are interested in. Within the month directory, search for data files that are named according to the following convention:
>    H_mm_area.txt
>    Where H stands for the hemisphere: N (north) or S (south), and mm is the 2-digit month.
>    For example, the file N_04_area.txt contains data from the Northern Hemisphere for the month of April.

For example here is April: ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/Apr/N_04_area.txt

```
year mo data_type region extent area 
1979 4 Goddard N 15.49 12.44 
1980 4 Goddard N 15.51 12.45 
1981 4 Goddard N 15.14 12.17 
1982 4 Goddard N 15.58 12.55 
1983 4 Goddard N 15.31 12.11 
1984 4 Goddard N 15.17 12.10
1985 4 Goddard N 15.34 12.46 
1986 4 Goddard N 15.16 11.95 
1987 4 Goddard N 15.34 12.28 
1988 4 Goddard N 15.23 13.11 
```

> ### Daily Sea Ice Extent Data Files
> 
> These files provide the total extent for each day for the entire time period. There are two data files for each hemisphere: a final and a near-real time. The final file uses data processed at NASA Goddard that goes through manual quality control as input values. However, these data are not available on a near-real-time basis, so a near-real-time file is provided that provides data up to the present. The data in the near-real-time file are the data that are in the Daily Total Sea Ice Extent Time Series Graphs. The data files are in comma delimited ASCII text format (.csv). For more information on how these are processed, see the Daily Total Extent Data Files section of the Sea Ice Index documentation.

Daily extent - Northern Hemisphere: ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/north/daily/data/NH_seaice_extent_final.csv

```
Year, Month, Day, Extent, Missing, 
1978, 10, 26, 10.231, 0.000, 
1978, 10, 28,  10.420, 0.000, 
1978, 10, 30, 10.557, 0.000, 
1978, 11, 01, 10.670, 0.000,
```

Daily extent - Southern Hemisphere: ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/south/daily/data/SH_seaice_extent_final.csv

```
Year, Month, Day, Extent, Missing, 
1978, 10, 26, 17.634, 0.000, 
1978, 10, 28, 17.815, 0.000, 
1978, 10, 30, 17.671, 0.000, 
1978, 11, 01, 17.534, 0.000, 
1978, 11, 03, 17.493, 0.000, 
1978, 11, 05, 17.350, 0.000,
```
## License

Source material appears to open information that can be freely used and reused. From [Copyright Web page](http://nsidc.org/about/use_copyright.html):

> Use and Copyright
> 
> You may download and use photographs, imagery, or text from our Web site, unless limitations for its use are specifically stated. Please credit the National Snow and Ice Data Center as described below.
> 
> Citing NSIDC Scientific Data Sets
> 
> As a condition of use, you must cite the use of our data in your work with a formal citation. ...
> 
> Distribution of the data set from NSIDC is supported by the NOAA@NSIDC Team with funding from NOAA and with assistance from the [NSIDC NASA DAAC](http://nsidc.org/daac/)
### Citation

As a condition of using this data, please use the following citation:

Fetterer, F., K. Knowles, W. Meier, and M. Savoie. 2002, updated daily. Sea Ice Index, Version 1. [indicate subset used]. Boulder, Colorado USA. NSIDC: National Snow and Ice Data Center. http://dx.doi.org/10.7265/N5QJ7F7W. [Date Accessed].
# Other potential sources
- This data is from **Earth Policy Institute** datasets page: http://www.earth-policy.org/data_center/C26. The Institute is part of Rutgers University. They compiled data from [Polar Science Center, University of Washington, PIOMAS Daily Ice Volume Data, 1979-present](http://psc.apl.uw.edu/research/projects/arctic-sea-ice-volume-anomaly/)

This data covers: Average March and September Arctic Sea Ice Volume for time period 1979-2013

[Average March and September Arctic Sea Ice Volume, 1979-2013 (xls)](http://www.earth-policy.org/datacenter/xls/highlights42_6.xlsx)

## Comments

### Snekili (2015-12-15T16:53:02Z)

NOAA Arctic Theme page - Realtime Data and Climate Indices + Retrospective or Historical Data, Analyses and Indices datasets like >
- Sea Ice monitoring 
  -  Ice coverage 
  - Realtime graphics of Indices and Forecasts from the Climate Prediction Center etc.

### Snekili (2015-12-15T17:22:16Z)

## Info

Data from **NSIDC National Snow and Ice Data Center** covers daily updated sea ice extent measurements from 1978 to present.
http://nsidc.org/data/docs/noaa/g02135_seaice_index/index.html

Sea Ice Index, Version 1
The Sea Ice Index provides a quick look at **Arctic- and Antarctic**-wide changes in sea ice. It is a source for consistent, up-to-date sea ice extent and concentration images, in PNG format, and data values, in ASCII text files, from November 1978 to the present. 

The images and data are produced in a consistent way that makes the Index time-series appropriate for use when looking at long-term trends in sea ice cover. Both monthly and daily products are available. **However, monthly products are better to use for long-term trend analysis because errors in the daily product tend to be averaged out in the monthly product and because day-to-day variations are often the result of short-term weather.**

Monthly extent products are also available as geographic information systems (GIS) compatible shapefiles. 
**Data via FTP** : ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/

GCMD Parameter(s): 

Sea Ice > Ice Extent
Sea Ice > Ice Growth/Melt
Sea Ice > Sea Ice Concentration

## Data
- Daily extent - Northern Hemisphere: 

ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/north/daily/data/NH_seaice_extent_final.csv

Year, Month, Day, Extent, Missing, 
1978, 10, 26, 10.231, 0.000, 
1978, 10, 28,  10.420, 0.000, 
1978, 10, 30, 10.557, 0.000, 
1978, 11, 01, 10.670, 0.000,
- Daily extent - Southern Hemisphere :

ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/south/daily/data/SH_seaice_extent_final.csv

Year, Month, Day, Extent, Missing, 
1978, 10, 26, 17.634, 0.000, 
1978, 10, 28, 17.815, 0.000, 
1978, 10, 30, 17.671, 0.000, 
1978, 11, 01, 17.534, 0.000, 
1978, 11, 03, 17.493, 0.000, 
1978, 11, 05, 17.350, 0.000,
- Monthly data:
  
  ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/

year mo data_type region extent area 
1979 4 Goddard N 15.49 12.44 
1980 4 Goddard N 15.51 12.45 
1981 4 Goddard N 15.14 12.17 
1982 4 Goddard N 15.58 12.55 
1983 4 Goddard N 15.31 12.11 
1984 4 Goddard N 15.17 12.10
1985 4 Goddard N 15.34 12.46 
1986 4 Goddard N 15.16 11.95 
1987 4 Goddard N 15.34 12.28 
1988 4 Goddard N 15.23 13.11 

## Data Citation

As a condition of using this data, you must cite the use of this data set using the following citation. For more information, see our Use and [Copyright Web page](http://nsidc.org/about/use_copyright.html).

Fetterer, F., K. Knowles, W. Meier, and M. Savoie. 2002, updated daily. Sea Ice Index, Version 1. [indicate subset used]. Boulder, Colorado USA. NSIDC: National Snow and Ice Data Center. http://dx.doi.org/10.7265/N5QJ7F7W. [Date Accessed].

## License

From  [Copyright Web page](http://nsidc.org/about/use_copyright.html)
- Use and Copyright

You may download and use photographs, imagery, or text from our Web site, unless limitations for its use are specifically stated. Please credit the National Snow and Ice Data Center as described below.
- Citing NSIDC Scientific Data Sets

As a condition of use, you must cite the use of our data in your work with a formal citation. A citation acknowledges our data contributors, and allows us to track the use and impact of our data. It also helps us report data distribution activity to funding agencies, and to assist others who may contact us about data that are referenced in publications.
- HOW TO CITE NSIDC SCIENTIFIC DATA SETS

You must include a citation in the references section of your publication.
You can find appropriate citations that can be copied and pasted into your documentation, on the landing page and in the documentation for each data set. If you need assistance with a citation format, please contact NSIDC User Services.

## Acknowledgments

Distribution of the data set from NSIDC is supported by the NOAA@NSIDC Team with funding from NOAA and with assistance from the [NSIDC NASA DAAC](http://nsidc.org/daac/)

### Other potential sources

## Info

This data is from **Earth Policy Institute** datasets page: http://www.earth-policy.org/data_center/C26. The Institute is part of Rutgers University. They compiled data from [Polar Science Center, University of Washington, PIOMAS Daily Ice Volume Data, 1979-present](http://psc.apl.uw.edu/research/projects/arctic-sea-ice-volume-anomaly/)

This data covers: Average March and September Arctic Sea Ice Volume for time period 1979-2013

[Average March and September Arctic Sea Ice Volume, 1979-2013 (xls)](http://www.earth-policy.org/datacenter/xls/highlights42_6.xlsx)

### rufuspollock (2015-12-17T22:51:42Z)

@Snekili thanks for the links.

Could you indicated precise link either to the data url on those websites or to the page where you could download or find that data. For example, I want the actual link to data on sea ice coverage (e.g. a link to a CSV or excel file and either the direct link to that data file or the page where i can download it from).

### Snekili (2015-12-26T23:42:00Z)

@rgrp Can you take a look?

### rufuspollock (2015-12-27T11:32:02Z)

@Snekili this looks good. One thing I'm not clear on is why use the Rutgers data rather than the data from the original source at the Polar Science Center: http://psc.apl.uw.edu/research/projects/arctic-sea-ice-volume-anomaly/data/

The one painful thing is that they have require registration (annoyingly violating the intended openness) but i imagine you could find out the actual underlying url with a bit of "hacking" - or at least point to this page and leave it to the coders to find the CSV.

I also think it would be good to have excerpted the intended credits from PIOMASS  i.e. (bonus points for reinstating the links)

> _Volume time series and uncertainties:_
> Schweiger, A., R. Lindsay, J. Zhang, M. Steele, H. Stern, Uncertainty in modeled arctic sea ice volume, J. Geophys. Res., doi:10.1029/2011JC007084, 2011
> 
> _Model details:_
> Zhang, J.L. and D.A. Rothrock, “Modeling global sea ice with a thickness and enthalpy distribution model in generalized curvilinear coordinates“, Mon. Weather Rev., 131, 845-861, 2003

### Snekili (2015-12-27T15:52:46Z)

@rgrp regarding your first question : 
1.  You answered that yourself - it requires registration and I'm not "hacker" yet, I've just scratched the surface and I dont know how to do that. 
2.  Rutgers University compiled data and made it realy simple and nice. Data from NS& Ice Centre are monthly and daily measurements data for each year separately and you said you like your data nice, simple and understandable, but that link that requires registration is pointing directly to that sheets so when you register sheet will automaticaly download, and they are in google drive, you have links.

### Snekili (2015-12-27T15:58:44Z)

@rgrp  Oh, yeah one more thing regarding PIOMAS direct data, they are in .gz format and I've tried to open that but with no success, I think it has something to do with Linux? 
Here is one link http://psc.apl.washington.edu/zhang/IDAO/data_piomas.html

### rufuspollock (2015-12-27T18:35:28Z)

@Snekili great answers - and worth pointing this out in the main description. E.g. "The data comes originally from X but we have linked Y because data is cleaned up and does not require registration to access."
- Re the data page: I'd recommend linking it and explain that the data has a registration. I would have also suggested briefly going through registration since it probably takes 5s and then pasting the data somewhere. (Which you have done: perfect!)
- Re `gz` you can open that on windows but you may need something more than unzip -- you may need to do a quick google. Do not worry about this now but may be useful in future.
- Are the google drive files "Public on the web" so we don't need to sign in to access

All in all, other than the google drive access I think we're done here: well done :-)

### Snekili (2015-12-27T20:23:04Z)

@rgrp Thank you :). I will make changes tomorrow.

### Snekili (2016-01-04T12:54:42Z)

@rgrp Maybe this National Snow and Ice data is better?

### rufuspollock (2016-01-04T17:58:37Z)

@Snekili can you update if that is the case? Or are you asking me to evaluate?

### Snekili (2016-01-06T12:21:42Z)

@rgrp I think that NSIDC data is better.

### rufuspollock (2016-01-07T14:27:38Z)

@Snekili ok. Can i suggest you refactor your comment to have the NSIDC data first and other data as other info. Also let's rework the NSDIC info as per our best practice e.g. nice intro paragraphs (with links to data home page) and then a data section and a license section (with citation requirement in license section)

### Snekili (2016-01-07T18:31:00Z)

@rgrp I've made changes based on your suggestions :)

### rufuspollock (2016-01-11T20:26:52Z)

@kiliakis @pdehaye ready to package :-)

@kiliakis I suggest we try and consolidate monthly data into one CSV file and have this as the main data file. The daily data we can pull down direct if we want (I'm sort of easy either way) and keep into two separate files - one for NH and one for SH.

### zelima (2016-07-05T15:09:07Z)

@rgrp I could try packaging this one if @kiliakis has no time for it

### rufuspollock (2016-08-03T09:30:57Z)

@zelima let us leave this for now ...

### sxren (2016-08-04T10:21:31Z)

@Snekili If you're interested in the Polar Science Center Links, they are:
http://psc.apl.uw.edu/wordpress/wp-content/uploads/schweiger/ice_volume/PIOMAS.2sst.monthly.Current.v2.1.txt 
http://psc.apl.uw.edu/wordpress/wp-content/uploads/schweiger/ice_volume/PIOMAS.vol.daily.1979.2016.Current.v2.1.dat.gz

There are a few ways to find them after copying the links that appear after clicking the send  buttons. 

The second link is a text file and will actually show up in the browser—lucky us.

The first link can either be guessed from the second link, found by inspecting network activity in a browser such as Chrome, or by using the developer version of httpie (pip install --upgrade https://github.com/jkbrzt/httpie/archive/master.tar.gz) with the --follow --all arguments.

Let me know if you'd like more info on either of the latter two methods.

### rufuspollock (2016-08-22T07:10:24Z)

@Snekili / @zelima do you want to review @sxren links?

### zelima (2016-08-24T16:25:00Z)

@rgrp 
- The link that point to .txt file contains monthly data of ice volume, from 1979 to 2016. Has 13 columns - first referencing to years, other12 -months. We can package in following format: 

```
date,volume
1979-01-01,27.704
...
```
- Second [link](http://psc.apl.uw.edu/wordpress/wp-content/uploads/schweiger/ice_volume/PIOMAS.vol.daily.1979.2016.Current.v2.1.dat.gz) that points to .gz file. contains one .dat file with daily data of ice volume from 1979 to 2016. we can use same format here as well
