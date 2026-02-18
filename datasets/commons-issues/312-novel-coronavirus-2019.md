---
number: 312
title: Novel Coronavirus 2019
state: open
author: nirabpudasaini
created_at: "2020-02-18T15:52:33Z"
updated_at: "2020-04-09T09:22:58Z"
labels: []
assignees: [rufuspollock]
---

# Novel Coronavirus 2019

The new strain of Coronovirus has had a worldwide effect. It has effected people from different countries. It would be great, for example, to have a *tidy* time series data tracking the number of people effected by the virus, how many deaths has the virus caused and the number of reported people who have recovered. 

HackMD for effort: https://hackmd.io/7x7ScfRTTJ6bx55qH0dxXA?both

## Tasks

* [x] Create a collections page **DONE 25 March https://datahub.io/collections/coronavirus**
* [x] Tidy dataset of cases, deaths etc (based on john hopkins data) - **DONE 7 March https://github.com/datasets/covid-19**
  * [ ] "Meta" dataset of other datasets out there e.g. believe there is one for france
  * [ ] "Meta" dataset of authoritative sources of data ...
* [ ] Dataset tracking confinements etc
* [ ] Dataset of ... 

### Collections page

**DONE: see https://datahub.io/collections/coronavirus/**

* [x] Draft some initial content
* [x] Boot the page in this repo
  * [x] Find an icon to use
  * [x] page url `coronavirus`
  * [x] add the content
    * [x] include link to datahub datasets
  * [x] submit the pull request

## Research

* Peter Corless has a very [informative blog](https://towardsdatascience.com/chasing-the-data-coronavirus-802d8a1c4e9a) on coronavirus data. 
* The most clean and useful data he links to in the blog is from Johns Hopkins CSSE
  * The data is compiled from various sources and updated daily in a [github repo.](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series) 
  * There is also a [map visualization](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html) published using the data.
  * The terms of use however states that the data " is provided to the public strictly for educational and academic research purposes".
  * For some reason they are adding each new observation into a column of the csv instead of the row.

## Comments

### rufuspollock (2020-03-05T17:24:21Z)

@nirabpudasaini did you do the wrangling here and push this to datahub.io? If so please update here ...

### EmmanuelAmodu (2020-03-05T21:33:36Z)

@rufuspollock would be a good solution https://github.com/EmmanuelAmodu/COVID-19-Datapackage.git. package url https://datahub.io/emmanuelamodu/covid-datapackage/v/4

### nirabpudasaini (2020-03-06T08:23:00Z)

@rufuspollock I have not worked on this yet. I can work on it this weekend and push.

### rufuspollock (2020-03-08T10:03:22Z)

@zelima @mpolidori can you update on status here now 😄 Dataset is packaged here I believe https://github.com/datasets/covid-19

### starsinmypockets (2020-03-22T17:56:51Z)

This is code for philly working with Penn Medicine:
https://penn-chime.phl.io/

And an "epidemic calculator" tool: http://gabgoh.github.io/COVID/

### rufuspollock (2020-03-25T12:07:36Z)

Have created a basic collections page https://datahub.io/collections/coronavirus

### rufuspollock (2020-04-09T09:22:58Z)

@starsinmypockets could you do a PR on https://github.com/datasets/awesome-data/blob/master/coronavirus.md to add any relevant datasets, modelling etc 😄
