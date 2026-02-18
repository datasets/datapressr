---
number: 284
title: Bibliographic data
state: open
author: rufuspollock
created_at: "2018-07-08T15:21:51Z"
updated_at: "2022-11-03T12:03:49Z"
labels: []
---

# Bibliographic data

**Awesome page in progress at: https://datahub.io/collections/bibliographic-data**

# What we Cover

Datasets we want to cover:

* Author metadata
* Article metadata
* Book metadata (bonus points if FRBR-like)

## Tasks

* [x] Stub page
* [ ] Embed the google docs spreadsheet overview - https://docs.google.com/spreadsheets/d/1Sx-MKTkAhpaB3VHiouYDgMQcH81mKwQtaK2-BXYbKkE/edit#gid=0
  * [ ] (Future) turn this into a CSV and show on page (?) then embed this as a mini data package
* [ ] Start adding sections for specific items with full description e.g. viaf, crossref (at some point these could move to datasets on datahub)

# State of play

I compiled a detailed spreadsheet (as of 2016) of the state of play here:

https://docs.google.com/spreadsheets/d/1Sx-MKTkAhpaB3VHiouYDgMQcH81mKwQtaK2-BXYbKkE/edit#gid=0

* CrossRef - has API but no official regular bulk dump - see https://github.com/CrossRef/rest-api-doc/issues/271
* OCLC: ???
* Book data: ...?

# Context

*These are the kind of questions / user stories I had*

* Could one build an "open" Google Scholar or an open "OCLC"
* If i wanted to build a "lookup" service for my reference manager what API could I use and what is the license on the data?
* Where can I find open (or just free) bibliography data
* Where can I find open (or just free) bibliography online services or APIs

User stories:

* I come across a book or article and i want to quickly get full biblio info for storing in a blog post or an article i am writing
* I come across a book or article title and want to look it up
* Ditto and i want to auto-save into my local bibliography

## Aim of research

- Identify existing databases or services providing substantial bibliographic data
- Can partition between books and papers as they are different
- Classify in key ways e.g. open or not etc

## Comments

### miku (2018-07-15T12:37:07Z)

> CrossRef - has API but no official regular bulk dump

[We](http://ub.uni-leipzig.de/) have been working with the [crossref API](https://github.com/CrossRef/rest-api-doc) (for a [search infrastructure project](https://finc.info)) since early 2015 and we found it to be excellent to work with concerning usability and documentation. We were interested in complete dumps as well, so we implemented a [monthly harvest](https://github.com/miku/siskin/blob/e8fb912a41830eecbfe177ddf149ea0dcd272514/siskin/sources/crossref.py#L92-L185) as part of our metadata gathering and processing infrastructure, which is based on [luigi](https://github.com/spotify/luigi).

The basic operation is as follows:

Use a filter (we used [deposit](https://github.com/CrossRef/rest-api-doc#filter-names), but should switch to `from-deposit-date` or similar) to request all items for the last month. Also, use the *cursor mechanism*, which is the way to extract a large number of documents fast (plug: [solrdump](https://github.com/ubleipzig/solrdump) is a generic fast SOLR document exporter).

You end up with some directory full of JSON files.

```
$ tree -sh 
...
├── [8.4G]  begin-2018-02-01-end-2018-03-01-filter-deposit.ldj
├── [7.5G]  begin-2018-03-01-end-2018-04-01-filter-deposit.ldj
├── [ 12G]  begin-2018-04-01-end-2018-05-01-filter-deposit.ldj
├── [9.4G]  begin-2018-05-01-end-2018-06-01-filter-deposit.ldj
└── [6.4G]  begin-2018-06-01-end-2018-07-01-filter-deposit.ldj
```

This is how the monthly harvest sizes developed over the years:

![](https://raw.githubusercontent.com/miku/siskin/master/docs/crossref/MonthlyDeposited-2.png)

Zoomed in a bit (from 2015):

![](https://raw.githubusercontent.com/miku/siskin/master/docs/crossref/MonthlyDeposited-3.png)


Now, seeing all these files as a single data set, there are quite some duplicates (redeposited files, through publisher updates or API changes). It would not be too complicated to run some additional data store, which could hold only the most recent record (by overwriting records via DOI).

We opted for another approach, which allows us to not have to maintain an external data store and still have only the latest version of each DOI at hand: We just iterate over all records and keep the last. This currently means iterating over 400G of JSON, but that's actually not *that* bad. After a few sketches, the functionality went into a custom command line tool, [span-crossref-snapshot](https://github.com/miku/span/blob/master/cmd/span-crossref-snapshot/main.go).

That tools is a bit ugly (implementation-wise), as it tries hard to be fast (parallel compression, advanced sort flags, custom fast [filter tool](https://github.com/miku/filterline) with awk fallback, and so on). It is quite fast and despite the awkward bits quite reliable. 

```
// Given a single file with crossref works API messages, create a potentially
// smaller file, which contains only the most recent version of each document.
//
// Works in a three-stage, two-pass fashion: (1) extract, (2) identify, (3) extract.
// Performance data point (30M compressed records, 11m33.871s):
//
// 2017/07/24 18:26:10 stage 1: 8m13.799431646s
// 2017/07/24 18:26:55 stage 2: 45.746997314s
// 2017/07/24 18:29:30 stage 3: 2m34.23537293s
```

In the end, we do have a file  `crossref.ldj.gz` which is about 40G in size and currently contains 97494426 records.

### anuveyatsu (2018-07-17T07:08:19Z)

I've created `bibliographic-data` page available at https://datahub.io/awesome/bibliographic-data with initial content about DBLP data.

### rufuspollock (2018-09-01T13:38:34Z)

@miku this is really awesome info - thank-you. Are you hosting the data anywhere - can you share it?

### miku (2018-09-06T10:34:35Z)

> Are you hosting the data anywhere - can you share it?

No, at the moment, we only use the crossref data for building an index for a couple of [institutions](https://finc.info/de/anwender).

### miku (2020-01-31T16:46:28Z)

FWIW: In addition to sources already listed in the [spreadsheet](https://docs.google.com/spreadsheets/d/1Sx-MKTkAhpaB3VHiouYDgMQcH81mKwQtaK2-BXYbKkE/edit#gid=0), a few more sources may be found here at [https://archive.org/details/ia_biblio_metadata](https://archive.org/details/ia_biblio_metadata).

### rufuspollock (2020-02-03T13:02:04Z)

@miku very useful - thank-you!

### miku (2022-11-03T12:03:49Z)

There's an upload of this dataset at: https://archive.org/details/crossref-2022-11-02 (139M docs).
