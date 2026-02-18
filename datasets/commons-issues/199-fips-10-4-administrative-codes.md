---
number: 199
title: FIPS 10-4 Administrative Codes
state: closed
author: rufuspollock
created_at: "2016-10-01T15:25:54Z"
updated_at: "2018-01-18T13:18:05Z"
closed_at: "2018-01-18T13:18:05Z"
labels: ["Priority: ★★★", "Format: Tabular", "Difficulty: easy"]
assignees: [AcckiyGerman]
---

# FIPS 10-4 Administrative Codes

https://en.wikipedia.org/wiki/FIPS_10-4

## Comments

### zelima (2016-10-10T08:51:16Z)

This can be used as source: https://en.wikipedia.org/wiki/List_of_FIPS_region_codes
download link: http://efele.net/maps/fips-10/data/fips-414.txt
csv format:

```
country,region,code
ANTIGUA AND BARBUDA,,AC00
ANTIGUA AND BARBUDA,Barbuda dependency,AC01
ANTIGUA AND BARBUDA,Saint George parish,AC03
...
```

### AcckiyGerman (2017-12-21T11:59:25Z)

Sometimes there are more then 2 lvl (country, region) division in the source, especially for United Kingdom:
**Country, London borough, metropolitan district, unitary authority, county (not country!), city corporation, ...** and it does matter I think.

My suggestion is to keep the original table structure:
* put the code column at the first.
* extract the division name
```csv
code, division, name
US00, country, UNITED STATES
US01, state, Alabama
....
UP00, country, UKRAINE
UP01, province_oblast', Cherkas'ka Oblast'
UP02, province_oblast', Chernihivs'ka Oblast'
UP11, autonomous republic_avtonomna respublika, Krym Avtonomna Respublika
...
```

### zelima (2017-12-21T12:09:35Z)

@AcckiyGerman sounds great

### AcckiyGerman (2017-12-21T20:50:16Z)

https://github.com/datasets/administrative-codes-FIPS-10-4 
@zelima need a review

### AcckiyGerman (2017-12-21T21:19:38Z)

There is something wrong.
![pnf](https://user-images.githubusercontent.com/11707682/34275312-fea58c1c-e69c-11e7-970c-cc22719e2d9b.png)

### zelima (2017-12-22T06:15:43Z)

@AcckiyGerman simple URL would be more useful instead. And I see it's there now: http://datahub.io/AcckiyGerman/region-codes 
Overall looks great, good job! Re-review for future: Would be easier for me to review PR instead of already pushed commits, but anyway, here are the commits I commented on:
* https://github.com/datasets/administrative-codes-FIPS-10-4/commit/f2ea5fa9c224edf6f8dbeff775437fc2f869951b
* https://github.com/datasets/administrative-codes-FIPS-10-4/commit/ec4c737a427f91dd95bf083d3e5a42c5c8000241
* https://github.com/datasets/administrative-codes-FIPS-10-4/commit/f863f8cd928bb71d3efbdf80d915b9ebf2fc5504

### AcckiyGerman (2017-12-28T14:54:06Z)

@zelima the dataset is ready https://github.com/datasets/administrative-codes-FIPS-10-4
Please push it under the core user and close this issue.

### rufuspollock (2018-01-15T18:11:03Z)

@AcckiyGerman can you please take care of pushing under core user.

I would also suggest that this dataset should just be fips-10-4. (also please **always** use lower case in naming of dataset names -- and hence repos)

### AcckiyGerman (2018-01-18T10:17:11Z)

name is fixed. Publishing..

### AcckiyGerman (2018-01-18T13:18:05Z)

FIXED
* data found and processed
* dataset is now here: https://github.com/datasets/fips-10-4
* and published here: https://datahub.io/core/fips-10-4
* https://github.com/datasets/registry/blob/master/core-list.csv is updated
