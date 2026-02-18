---
number: 280
title: nightlights.io - india electrication over 20y
state: open
author: rufuspollock
created_at: "2018-09-02T15:08:57Z"
updated_at: "2024-03-29T10:45:36Z"
labels: [hackathon]
---

# nightlights.io - india electrication over 20y

Awesome visualization and data project about electrication in India http://india.nightlights.io/

> The India Lights platform shows light output at night for 20 years for 600,000 villages across India. The Defense Meteorological Satellite Program (DMSP) has taken pictures of the Earth every night from 1993 to 2013. Researchers at the University of Michigan, in collaboration with the World Bank, used the DMSP images to extract the data you see on the India Lights platform. Each point you see on the map represents the light output of a specific village at a specific point in time. On the district level, the map also allows you to filter to view villages that have participated in India’s flagship electrification program (you can read more about it here). This tremendous trove of data can be used to look at changes in light output, which can be used to complement research about electrification in the country.

They provide an API: http://api.nightlights.io/

AFAICT there is no way to get the bulk data other than to generate yourself e.g. I looked here and then followed links

https://github.com/wbg-bigdata/nightlights-api

https://github.com/wbg-bigdata/nightlights-api/blob/develop/dbscripts/README.md

> The original data set comes in the form of nightly images from the DMSP satellites, available as TIF files from NOAA. This API is powered by monthly summaries of the light output of 600,000 villages, extracted from those TIFs. The pipeline for generating the summaries is documented here.

This issue https://github.com/wbg-bigdata/nightlights-api/issues/7 also suggests no bulk CSV or JSON.

![image](https://user-images.githubusercontent.com/180658/44957444-0d57f200-aed3-11e8-8fce-5cf3a498d791.png)
