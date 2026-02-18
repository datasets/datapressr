---
number: 279
title: AirBnB data
state: open
author: rufuspollock
created_at: "2018-09-03T11:10:10Z"
updated_at: "2019-11-28T16:53:26Z"
labels: []
---

# AirBnB data

## InsideAirBnB - Murray Cox

Awesome site with a lot of data over the years.

http://insideairbnb.com/get-the-data.html

## Tom Slee Data

Tom did a great job here. He [stopped maintaining his AirBnB data in Sep 2017](http://tomslee.net/2017/10/airbnb-data-collection-announcement.html) but preserved an archive.

http://tomslee.net/airbnb-data-collection-get-the-data

TODO: data package and archive (its on s3) - also a good example would be useful in life as we'll have to crawl the page just to get the download links.

QU: not sure whether all this data rolled into InsideAirBnB?

## Comments

### gavram (2019-11-19T12:33:54Z)

After stopping to maintain his website, Tom Slee continued to publish data to Inside AirBnB http://insideairbnb.com/get-the-data.html. This data is available as of September 2019 for 101 cities. There are 13034 files with 124.89GB data, currently. Otherwise Tom's script on Github https://github.com/tomslee/airbnb-data-collection is not currently working due to changes in the structure of the AirBnB website
I did a Python script that downloads all the files from the Inside AirBnB site. The script creates a folder structure the same as on that site and downloads only files that are not already downloaded. https://gitlab.com/gavram/airbnb-data
