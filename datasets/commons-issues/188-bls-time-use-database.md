---
number: 188
title: BLS Time Use Database
state: open
author: rufuspollock
created_at: "2016-06-11T12:27:24Z"
updated_at: "2017-07-22T05:41:16Z"
labels: []
---

# BLS Time Use Database

The American Time Use Survey (ATUS) measures the amount of time people spend doing various activities, such as paid work, childcare, volunteering, and socializing. 
- http://www.bls.gov/tus/data.htm
- http://www.bls.gov/tus/database.htm

See also: (added 2017-07-22)

Sue Bowden and Avner Offer, “Household Appliances and the Use of Time: The United States and Britain Since the 1920s,” Economic History Review 47 (November 1994): 729, supplemented by data from the Statistical Abstract of the United States.

![image](https://user-images.githubusercontent.com/180658/28488749-217373c6-6eb1-11e7-8415-c35b128981a6.png)

## Comments

### zelima (2016-06-28T11:22:19Z)

@rgrp I found several tables that can be downloaded and datapackaged, but it may be difficult get them in "shape":
- Table A-1 - Time spent in detailed primary activities and percent of the civilian population engaging in each activity, averages per day by sex, annual averages [from 2003 to 2015](www.bls.gov/tus/tables/a1_all_years.xlsx) 
-  Table A-2 - Time spent in detailed primary activities and percent of the civilian population engaging in each activity, averages per day on weekdays and weekends by sex, annual averages [from 2003 to 2015](www.bls.gov/tus/tables/a2_all_years.xlsx)
- Table A-6 - Time spent in primary activities and the percent of married mothers and fathers who did the activities on an average day by employment status and age of youngest own household child, average for the combined years [2009-11](www.bls.gov/tus/tables/a6_0913.xls), [2007-11](www.bls.gov/tus/tables/a6_0711.xls), [2003-07](www.bls.gov/tus/tables/a6_0509.xls)
- Table A-7 - Time spent in primary activities by married mothers and fathers with own household children under 18 by employment status of self and spouse and age of youngest child, average for the combined years, [2009-13](www.bls.gov/tus/tables/a7_0913.xls), [2007-11](www.bls.gov/tus/tables/a7_0711.xls), [2005-09](www.bls.gov/tus/tables/a7_0509.xls) 

It's hard to get them in "shape" because e.g data of Table A-1 is divided  in three categories: `Average hours per day, civilian population`, `Average percent engaged in the activity per day` and `Average hours per day for persons who engaged in the activity`. Each of them their-selfs are divided in three more categories: `Total`, `Men` and `Women`. And all of them are distributed on 13 sheets, indicating years from 2003-2015

### rufuspollock (2016-06-29T16:07:57Z)

@zelima as a first step can you list files and file sizes with a short description. I suggest you even boot a data package repo with a README for this purpose.

### zelima (2016-06-30T11:50:36Z)

@rgrp Created repo with README, you can view it here: https://github.com/zelima/american-time-use-survey

### rufuspollock (2016-07-03T15:09:12Z)

@zelima great. Having looked at the data can you suggest the format for the main data file (i.e. lay out the headings with any relevant comments).

Also is there any data on their website that goes back further than 2003? I'd be quite interested in time use for much longer time periods.

### zelima (2016-07-04T09:11:31Z)

@rgrp I'm thinking of something like this:
For A-1 Table (easiest one):

```
Activity,Year,Gender,*1,*2,*3
Sleeping,2003,men,8.83,99.9,8.84
Sleeping,2003,women,8.83,99.9,8.84
Sleeping,2003,both,8.83,99.9,8.84
...
...
Grooming,2015,women,8.83,99.9,8.84
Grooming,2015,both,8.83,99.9,8.84
```

Where 1,2 and 3 will be:
*1 Average hours per day, civilian population
*2 Average percent engaged in the activity per day
*3 Average hours per day for persons who engaged in the activity

### zelima (2016-07-04T09:23:14Z)

@rgrp I found their archive link, http://www.bls.gov/schedule/archives/all_nr.htm#ATUS where are some data e.g: **Annual Pay Levels in Metropolitan Areas**, from 1992-2001. But it is discontinued, and all the data are in .txt files separately.  

i.e this is the link to txt file of Annual pay levels in metropolitan areas of 1993. http://www.bls.gov/news.release/history/anpay2_102094.txt

### rufuspollock (2016-08-09T09:59:21Z)

@zelima not sure how annual pay levels relates to time use so i would ignore.

### zelima (2016-08-09T14:16:54Z)

@rgrp ok. What about the main stuff?
