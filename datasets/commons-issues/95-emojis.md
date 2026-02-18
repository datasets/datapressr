---
number: 95
title: emojis
state: closed
author: rufuspollock
created_at: "2015-05-01T08:20:46Z"
updated_at: "2020-05-26T15:50:04Z"
closed_at: "2020-05-26T15:50:03Z"
labels: []
---

# emojis

emojis data in nice form

## Data

Emoji overview: http://unicode.org/emoji/charts-11.0/index.html

Actual data: http://unicode.org/Public/emoji/11.0/

Not sure of match of data to html page e.g. html page has a bunch of keywords raw data file does not.

Also here is a list of all emojis - see https://github.com/iamcal/emoji-data

## License

Material is open as per unicode license http://www.unicode.org/copyright.html#License

> Copyright © 1991-2017 Unicode, Inc. All rights reserved.
> Distributed under the Terms of Use in http://www.unicode.org/copyright.html.

> Permission is hereby granted, free of charge, to any person obtaining a copy of the Unicode data files and any associated documentation (the "Data Files") or Unicode software and any associated documentation (the "Software") to deal in the Data Files or Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sell copies of the Data Files or Software, and to permit persons to whom the Data Files or Software are furnished to do so, provided that either (a) this copyright and permission notice appear with all copies of the Data Files or Software, or (b) this copyright and permission notice appear in associated Documentation.

## Comments

### sabas (2016-05-25T14:13:21Z)

http://unicode.org/emoji/charts/full-emoji-list.html

### danfowler (2016-05-25T15:51:02Z)

😂

### gsilvapt (2016-05-25T19:05:06Z)

Creating this data package will be a huge task!

### saad-gh (2018-05-07T06:55:03Z)

@rufuspollock 
> Not sure of match of data to html page e.g. html page has a bunch of keywords raw data file does not.

We could add a column in our data set and include the html pages along side raw data scraping.

### saad-gh (2018-05-07T10:05:06Z)

Example of a source other than the Raw data files.
- Fields `keywords` and `CLDR short name` vary depending upon location. [Here](http://unicode.org/cldr/charts/dev/annotations/index.html) one can find those variations

### saad-gh (2018-05-09T02:57:01Z)

@zelima 
### Why do we require normalization? 
- The datapackage that I am developing will produce [these](http://unicode.org/emoji/charts-11.0/index.html#chart_notation) charts.
- This would require normalization because a single chart has fields filled from different sources
   - For example [emoji list's](http://unicode.org/emoji/charts-11.0/emoji-list.html) fields:
      1. `Code` is getting data from [emoji data](https://unicode.org/Public/emoji/11.0/emoji-data.txt) and [emoji sequence](https://unicode.org/Public/emoji/11.0/emoji-sequences.txt)
      2. `CLDR` and `Other Keywords` is getting data from [annotations](https://unicode.org/repos/cldr/tags/latest/common/annotations/en.xml) and [derived annotations](https://unicode.org/repos/cldr/tags/latest/common/annotationsDerived/en.xml)

### Blockers
- No reliable source found for fields `date` and `sources` in charts [Emoji Versions](http://unicode.org/emoji/charts-11.0/emoji-versions.html) and [Emoji Versions & Sources](http://unicode.org/emoji/charts-11.0/emoji-versions-sources.html)
   - Reason: On both chart pages it is mentioned `While these charts use a particular version of the Unicode Emoji data files, the images and format may be updated at any time.`, I checked the [Unicode Emoji data files](https://unicode.org/Public/emoji/11.0) but could not find where I could query versions and sources.
   - I think we might find them some where in [CLDR (Unicode Common Locale Data Repository)](https://unicode.org/repos/cldr/)
- Not sure how the field proposal and showing samples of skin tones and designs of different vendors as seen in these charts: [Emoji Candidates](http://unicode.org/emoji/future/emoji-provisional.html) and [Full emoji list skin tones without](http://unicode.org/emoji/charts-11.0/full-emoji-list.html) ; would reflect in the data package.

### zelima (2018-05-09T04:42:59Z)

@saad-gh Ok so as I understood there are multiple different sources and you need to **join** them somehow. So take columns A,B,C from data X and take columns D,E,F from data Y and join them on let's say A column, is that correct?

Let's keep it simple/stupid - Why don't we start by just having data X as one resource and data Y as another resource? Let's see how it goes and later once we have them as resources we can create the third resource by joining them on column A. This way we will:

* avoid mongoDB or any other third party applications
* we have all kind of data, including original one if anybody needs
* Is simple and easily reusable (this dataset is not only for tech people who knows sql and stuff like that, indeed it's more for people who knows less about them)

As for your second blocker: If there's no reliable source for `date` or any other field - just ignore them and not include in dataset. (Why do we need date field in emojis dataset at all? :) )

### saad-gh (2018-05-15T06:20:49Z)

@Branko-Dj Please review if you find time
### User story - Standardization of scripts
**As a developer** I would like to implement an abstract class **in order to** speed up data packaging process and remove mundane development.

### Acceptance criteria
Not sure

### Tasks
Research on existing data packages to document the development of the abstract class.

### Analysis
- I tried following this approach in the [basic data package for emojis](https://github.com/saad-gh/emojis) 
- Developed a `wrapper.py` (abstract class) which could be used/developed further and implemented in `process.py` in other data packages
   - Basic operation: Downloading raw files and appending CSVs utilizing the meta data available in datapackage.json

### saad-gh (2018-05-15T06:49:31Z)

@Branko-Dj please review.
### User story - Data packaging from a sales perspective

**As a developer with a sales perspective** I would like to conduct a research **in order to** identify clients and their requirements before packaging data **so that** upon receiving data requests there is a high probability of finding most of the required data in an existing data set. 

### Tasks
- Conduct research of a data set's market value.
- Prioritize datasets in the registry based on market value.

### Branko-Dj (2018-05-15T09:10:41Z)

OK I will take a look

### sglavoie (2020-04-21T16:28:14Z)

@rufuspollock: Done. Do let me know if something needs to be modified and/or added.

- Repo: https://github.com/sglavoie/emojis
- Curated data available as a validated data package: https://github.com/sglavoie/emojis/tree/master/emojis
- 3,570 unique emojis from http://unicode.org/Public/emoji/11.0/ sorted by groups and subgroups.

It felt a bit like cheating, but I did it with Vim macros and regular expressions as it promised to be a mess to make a script to automate everything from scratch. In the end, that's what I thought would be the fastest way to reach the goal line and since every dataset comes in a different shape, it didn't make sense to me to spend much more time making a nice script to get the same outcome. :smile:

### rufuspollock (2020-04-21T21:02:44Z)

@sglavoie well done 👍👏 My initial question mark would be about the vim macros. The idea here for you is to get to practice (esp with the tools we use at @datopian) and for us to have a data package which has a repeatable, automated workflow to generate it so it can be automatically updated over time (new emojis will get released!).

@nirabpudasaini please could you review this based on the core data guidelines https://datahub.io/docs/core-data/curators-guide esp the quality review. If it looks good let's get the repo moved over to datasets here and published on core data. You can ping @zelima if you need guidance.

### sglavoie (2020-04-21T22:15:04Z)

Thank you for your feedback @rufuspollock: it makes a lot of sense! I wanted to get back to you with a (hopefully) clean dataset sooner rather than later, but I should have known better and should have imagined that this would need to be updated/maintained and not simply taken as an exercise. (I could update the dataset in a breeze if a couple of additional emojis decide to unite themselves to the existing data by showing a `diff` with the previous version and filtering out what's already there, but again that's cheating and not 100% repeatable even though Vim macros can be saved for later use, including the filtering part and the `diff` part with a one-liner Bash script... Although there is no point in arguing when I know you are right and there was a greater purpose behind it all :man_shrugging: :smile: .)

I will base my future efforts heavily on @nirabpudasaini's review and come up with a more maintainable solution using an appropriate approach. At the very least I can say that the data must have been parsed "_flawlessly_" and was neatly organized into groups/subgroups, so that can still be useful as a reference to compare it to the output of a Python script once it is built with the proper end goal in mind :+1:.

### nirabpudasaini (2020-04-22T08:17:40Z)

@sglavoie The datapackage descriptor and the csv table looks good 👍👏 . 
Few quick initial comments,  please add a README describing the dataset, the source of data, steps to run the scripts/generate the data and the dependencies to install so that someone else other than you can also update/generate the dataset. Also would be better to have all your scripts in one folder named scripts.

### sglavoie (2020-04-22T13:16:23Z)

Thank you @nirabpudasaini! I'm glad to know that at least the data is what's expected: that will help in testing out how the Python script should behave.

The current solution isn't easily reproducible: I misunderstood the requirements. I will rework the existing repo so that it can be fully automated and once it is clear how to run the script (stored under the directory `scripts`), I will make sure to add a README with all the details you are mentioning.

### rufuspollock (2020-04-22T14:12:09Z)

@sglavoie maybe do a plan of how you are going to do it in an issue in your repo and @nirabpudasaini can review before you do it. That can be most efficient and give you early feedback.

### sglavoie (2020-04-22T14:13:31Z)

Excellent, thank you @rufuspollock, I'm on it!

### sglavoie (2020-04-24T20:45:33Z)

- Repo: https://github.com/sglavoie/emojis

- 4,168 emojis as of v13.0 (latest version).

---

The dataset should now be curated exactly as it should! Minor modifications might be needed, including:

- Updating sections in the README file;
- Removing some columns from the CSV file (maybe the last one or at least renaming it?) → https://github.com/sglavoie/emojis/blob/master/data/emojis.csv;
- Changing the title in `datapackage.json` and maybe also renaming the repo unless it is moved somewhere else.  

Please let me know if something else needs to be done about it. :slightly_smiling_face:

### nirabpudasaini (2020-04-27T08:16:19Z)

@sglavoie The dataset looks good i have create a fork in the datasets organization 
@rufuspollock @zelima  The dataset is now packaged and available at https://github.com/datasets/emojis and ready to publish.

### rufuspollock (2020-04-27T14:21:47Z)

@nirabpudasaini can we move the repo rather than forking. That works better (datasets is the authoritative item). Easiest way is for @sglavoie to make you admin and then you can move it over.

Then to complete we want to publish to datahub.io/core (that requires having core api key) 😄

### rufuspollock (2020-04-27T14:22:39Z)

@sglavoie 👏

### sglavoie (2020-04-27T14:53:11Z)

Great, I'm glad it was alright! @nirabpudasaini, I've sent you an invitation to manage the repo :wink:.

> Repository transfer to nirabpudasaini requested

### nirabpudasaini (2020-04-27T15:26:14Z)

@rufuspollock  The repo is now moved and available at https://github.com/datasets/emojis

Should i publish this to core myself or should i ask someone to do this ?

### sglavoie (2020-05-26T15:50:03Z)

**FIXED**: Closing as this is now published and updated automatically.

* Publication: https://datahub.io/core/unicode-emojis
* Automation: https://github.com/datasets/emojis/actions

---

More than five years after opening the issue. :smile: :tada:
