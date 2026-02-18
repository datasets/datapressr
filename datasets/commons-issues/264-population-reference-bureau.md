---
number: 264
title: Population Reference Bureau
state: open
author: rufuspollock
created_at: "2019-06-17T08:27:16Z"
updated_at: "2020-05-04T16:50:33Z"
labels: []
---

# Population Reference Bureau

http://prb.org - detailed demographic and health data for US and internationally.

TODO: work out if data open and where you can get in bulk.

## Comments

### sglavoie (2020-04-16T20:03:34Z)

On the page https://www.prb.org/international/ I extracted the URLs where data is available:

- https://datacenter.prb.org/download/international/indicator/population/csv
- https://datacenter.prb.org/download/international/indicator/population-2035/csv
- https://datacenter.prb.org/download/international/indicator/population-2050/csv
- https://datacenter.prb.org/download/international/indicator/births/csv
- https://datacenter.prb.org/download/international/indicator/deaths/csv
- https://datacenter.prb.org/download/international/indicator/rate-natural-increase/csv
- https://datacenter.prb.org/download/international/indicator/infant-mortality/csv
- https://datacenter.prb.org/download/international/indicator/fertility/csv
- https://datacenter.prb.org/download/international/indicator/gross-national-income/csv
- https://datacenter.prb.org/download/international/indicator/urban/csv
- https://datacenter.prb.org/download/international/indicator/fp-all/csv
- https://datacenter.prb.org/download/international/indicator/fp-total-modern/csv
- https://datacenter.prb.org/download/international/indicator/hiv-rate-male/csv
- https://datacenter.prb.org/download/international/indicator/hiv-rate-female/csv
- https://datacenter.prb.org/download/international/indicator/life-expectancy-birth-male/csv
- https://datacenter.prb.org/download/international/indicator/life-expectancy-birth-female/csv
- https://datacenter.prb.org/download/international/indicator/age15/csv
- https://datacenter.prb.org/download/international/indicator/age65/csv
- https://datacenter.prb.org/download/international/indicator/hh-size-av/csv
- https://datacenter.prb.org/download/international/indicator/hh-one-person/csv
- https://datacenter.prb.org/download/international/indicator/fp-unmet-total/csv
- https://datacenter.prb.org/download/international/indicator/fp-demand-satisfied-married/csv
- https://datacenter.prb.org/download/international/indicator/fp-demand-satisfied-15-24/csv

I believe that merging all those CSV files could make for an interesting and more complete dataset as the data is clean and up to date (2019).

The same can be done for a number of other indicators without requiring much change to the Python script linked below, namely the ones specific to the United States:

- https://www.prb.org/usdata/
    - https://datacenter.prb.org/download/usdata/indicator/population/csv
    - https://datacenter.prb.org/download/usdata/indicator/population-change/csv
    - https://datacenter.prb.org/download/usdata/indicator/births/csv
    - https://datacenter.prb.org/download/usdata/indicator/deaths/csv
    - https://datacenter.prb.org/download/usdata/indicator/fertility/csv
    - https://datacenter.prb.org/download/usdata/indicator/migration/csv
    - https://datacenter.prb.org/download/usdata/indicator/race-ethnicity/csv
    - https://datacenter.prb.org/download/usdata/indicator/age65/csv
    - https://datacenter.prb.org/download/usdata/indicator/age18/csv
    - https://datacenter.prb.org/download/usdata/indicator/elderly-support-ratio/csv
    - https://datacenter.prb.org/download/usdata/indicator/foreign-born/csv
    - https://datacenter.prb.org/download/usdata/indicator/bachelors-degree/csv
    - https://datacenter.prb.org/download/usdata/indicator/income/csv
    - https://datacenter.prb.org/download/usdata/indicator/poverty/csv
    - https://datacenter.prb.org/download/usdata/indicator/marriage-age-men/csv
    - https://datacenter.prb.org/download/usdata/indicator/marriage-age-women/csv
    - https://datacenter.prb.org/download/usdata/indicator/gini/csv
    - https://datacenter.prb.org/download/usdata/indicator/living-alone/csv


For now, I made a simple script in my spare time to download the data and trim the unneeded lines in the CSV files (headers) and it can be found here: https://github.com/sglavoie/awesome-data-prb

It's useful to quickly download and see the data but it is not processing it in any form as I couldn't find the license and know for sure that I should continue in that direction. I am leaving this comment as a reference for later in case it can speed things up if someone is going to poke at it.

### rufuspollock (2020-04-17T12:39:34Z)

@sglavoie have you found any info on the PRB's *licensing* of this data?

Also do you have any estimate on a) how big the data is b) how much time it would take to collect this?

### sglavoie (2020-04-17T14:27:40Z)

> licensing of this data

I am in the process of finding out and will let you know as soon as possible.

> a) how big the data is

In regards to the **international data**, this would be a very small dataset containing 21 CSV files, totalling 154.7 KiB (158,367 bytes). The CSV files on the page https://www.prb.org/international/ all feature five columns and 235 rows of useful data.

When it comes to the **US data**, this is a more sizeable dataset: 18 items, totalling 13.5 MiB (14,151,769 bytes). Each individual file has a very different amount of data. The smallest one is 3.4 KiB (3,526 bytes) and contains 5 columns X 105 rows. The largest one is 2.2 MiB (2,358,702 bytes) and contains 5 columns X 60,687 rows.

> b) how much time it would take to collect this?

I already stored all the data with minimal processing (only removing superfluous headers). Curating it should be quick as the data is already clean: it would only be a matter of knowing if each individual CSV file should be published as a separate dataset or if you think we could produce more insight by merging them together in a given way.

### rufuspollock (2020-04-17T14:31:07Z)

@sglavoie ok let's start curating this - you can do this as well as emojis 😄 (still check the license info though)

### sglavoie (2020-04-17T14:32:39Z)

Perfect! I'm on it! I couldn't get the line when I called earlier today, but I've sent them inquiries by other means and will call again until this matter is solved :smile:.

### sglavoie (2020-04-20T17:15:19Z)

# About the data

Done! It's available as CSV files with a validated `datapackage.json`. A [minimal repo is available here](https://github.com/sglavoie/population_reference_bureau) containing the script used to make this possible. (**Update:** The data is also now available in the repo.) ~~For convenience, I temporarily added the cleaned data to my Google Drive: it can be found at this link.~~

# About the license

Sorry, this is still messy. The following are literally **all** the 25 results that pop up on Google when searching for `site:prb.org "license"`. There is no clear information available on their website as far as I'm aware declaring how their public data can be reused. From files stored on their website, I was able to glean the following:

- Some PDFs are available and do not explicitly provide any kind of guidance regarding licenses. Some do provide contact information. Examples: [here](https://stage.prb.org/wp-content/uploads/2008/04/pheregionalprofiles_ncr.pdf), [this PDF](https://stage.prb.org/wp-content/uploads/2016/09/IransFamPlanProg_Eng.pdf), [this other PDF](https://stage.prb.org/wp-content/uploads/2018/05/Plan-National-de-De%CC%81veloppement-2016-2020.-Co%CC%82te-d%E2%80%99Ivoire.pdf), [again here](https://stage.prb.org/wp-content/uploads/2010/08/comparability-stem.pdf), [that PDF](https://stage.prb.org/wp-content/uploads/1999/05/ReportonAmericaTwoCenturies.pdf), [this other one](https://stage.prb.org/wp-content/uploads/2010/07/folbre_presentation.pdf), [this one](https://acsdatacommunity.prb.org/cfs-file/__key/widgetcontainerfiles/3fc3f82483d14ec485ef92e206116d49-s-AAAAAAAAAAAAAAAAAAAAAA-page-02015_5F00_acs_5F00_conference/Nesse_5F00_final_5F00_revised.pdf), [this](https://acsdatacommunity.prb.org/cfs-file/__key/widgetcontainerfiles/3fc3f82483d14ec485ef92e206116d49-s-AAAAAAAAAAAAAAAAAAAAAA-page-0conferences/Session-10-_2800_Pohnan_2900_.pdf), [this too](https://acsdatacommunity.prb.org/cfs-file/__key/widgetcontainerfiles/3fc3f82483d14ec485ef92e206116d49-s-AAAAAAAAAAAAAAAAAAAAAA-page-02014_5F00_acs_5F00_conference/gibson_5F00_handout1.pdf), [again](https://acsdatacommunity.prb.org/cfs-file/__key/widgetcontainerfiles/3fc3f82483d14ec485ef92e206116d49-s-AAAAAAAAAAAAAAAAAAAAAA-page-02014_5F00_acs_5F00_conference/gibson_5F00_handout2.pdf), [there](https://stage.prb.org/wp-content/uploads/2018/05/The-Health-Bill-2016.-Kenya.pdf), [that](https://stage.prb.org/wp-content/uploads/2018/05/Sindh-Health-Sector-Strategy-2012-2020.pdf), [this](https://stage.prb.org/wp-content/uploads/2018/05/National-Condom-Programming-Strategy-2013-2015.Uganda.pdf).

- Other PDFs [like this one](https://stage.prb.org/wp-content/uploads/2002/03/ChildrenAtRisk.pdf) can be found with the text:

  > Permission is granted as long as appropriate acknowledgment is given.

- In that same permissive category, PDFs [like this one](https://stage.prb.org/wp-content/uploads/2018/05/Kenya-Health-Policy-2012-2030.pdf) say:

  > Any part of this document may be freely reviewed, quoted, reproduced or translated in full or in part, provided the source is acknowledged.

- To reproduce published content such as [this PDF](https://stage.prb.org/wp-content/uploads/2010/01/60.2NewMarriages.pdf), [this other one](https://stage.prb.org/wp-content/uploads/2001/03/56.1NewPopPoliciesWomen_Eng.pdf), [that one](https://stage.prb.org/wp-content/uploads/1999/09/54.3AmerRacialEthnicMinor.pdf) or [this PDF](https://stage.prb.org/wp-content/uploads/1998/12/53.4InjuryViolence.pdf), PRB says the following:

> The suggested citation, if you quote from this publication, is **[...]** For permission to reproduce portions from the Population Bulletin, write to PRB, Attn: Permissions, or
permissions@prb.org.

- Still, other PDFs [like this one](https://stage.prb.org/wp-content/uploads/2012/06/family-planning-arab-countries.pdf), [that one](https://stage.prb.org/wp-content/uploads/2011/07/facts-of-life-youth-in-middle-east.pdf) or [this one](https://stage.prb.org/wp-content/uploads/2007/01/SNL_PNCBriefFinal.pdf) only say **All rights reserved**.

### rufuspollock (2020-04-20T18:22:01Z)

@sglavoie i would add the data to the repo rather than google drive. I also suggest naming the repo after the data package name.

Re the license i would not focus on the license for text publications - that is completely different. In general, data like this which is clearly factual, is like public domain (at least in US) so I think we can say that with suitable disclaimer that this is our opinion. You could also email them asking them to clarify the public domain status / licensing of their data.

### sglavoie (2020-04-20T18:52:38Z)

Thank you for your feedback!

- The data is now available in the same repo.
- The repo has been renamed (along with other references in the script) to adopt what I believe could be the data package name (please let me know if it should be modified).
- I was under the impression that files do not fall into the same category as content on web pages as you pointed out: still, I shared my findings (or lack thereof) to let you know what I was up to.
- I already emailed them about this, asking specifically about the public data that was curated. I will let you know about any future updates on that front. :thumbsup:

### rufuspollock (2020-04-29T13:04:57Z)

@sglavoie can we move this item to datasets github org now ...

### sglavoie (2020-04-29T13:20:48Z)

@rufuspollock, the script works really well from the testing I made. However, there are two possible issues I am aware of:

- The script relies on Pandas to perform some actions on the dataset (sorting, adding NA values, etc.). If this package shouldn't be used, I would have to rework one function in the script to use the standard library instead.
- The script also uses `Click` and is more a full-fledge CLI. I wasn't aware at the time that I should be keeping things as simple as possible (which I did with the emojis dataset) and this dataset requires some interaction from the user. This could also be reworked if needed. It works really well as it is, but it's one more dependency and requires a little modification to prevent asking the user for confirmation when executing the main command.

### rufuspollock (2020-04-29T14:35:05Z)

@sglavoie can you avoid pandas perchance? And use e.g. dataflows instead ...

Click is fine as a wrapper and is a lightweight dependency ...

### sglavoie (2020-04-30T00:12:09Z)

@rufuspollock, sure!

Click doesn't bother much from the user perspective either: I can just remove the need for user input from one place and it stays exactly the same. That will be quick!

As for Pandas, I can certainly make the necessary changes, it's only one function in the script. I was working on a high-priority project with a deadline for tomorrow and didn't have time to get back to this issue earlier, but I will keep it in mind and will execute the task as soon as you give me the green light :wink:.

### sglavoie (2020-05-03T00:01:28Z)

@rufuspollock, this should now be good to go! :slightly_smiling_face: 

* `Click` and `pandas` have been removed entirely.
* `pandas` has been replaced with `dataflows`.
* Packages are now being generated for each individual dataset: the directory structure is the same as the one that can be observed in other projects we are currently working on at Datopian.

The new version of this script is available in the same repo as before: https://github.com/sglavoie/population_reference_bureau

### rufuspollock (2020-05-04T11:13:07Z)

@sglavoie great - final point is that i would use - in repo names rather than _ (and in package name). And then can you move this over to datasets org here.

### sglavoie (2020-05-04T16:50:33Z)

@rufuspollock, I've made the necessary changes and updated the data to reflect those changes.

I cannot transfer ownership of the repo to the "datasets" organization (I would need to be a member to be allowed to do so) but I went ahead and transferred it to you with the best intention in mind. :crossed_fingers:
