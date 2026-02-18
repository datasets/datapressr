---
number: 210
title: The American Freshman
state: closed
author: rufuspollock
created_at: "2017-06-16T09:03:52Z"
updated_at: "2018-04-25T05:20:40Z"
closed_at: "2018-04-19T13:19:48Z"
labels: []
assignees: [Branko-Dj]
---

# The American Freshman

Want to extract table from p.24 onwards: https://www.heri.ucla.edu/monographs/TheAmericanFreshman2014.pdf

Ultimately would like time series of years (can't find on website but must be there).

Especially interested in p.44 and what freshmen think are important.

cf http://rufuspollock.com/2008/08/29/money-has-grown-in-importance-to-us-freshmen-since-the-60s/

## Comments

### Branko-Dj (2018-04-16T19:34:16Z)

I created a script that extracts tables on pages 23-46, 67-74 and 78. The script requires PyPDF2, tabula
and pandas modules as well as java. The script uses PyPDF2 module to read PDF file and split it into one page documents. Using tabula module, the script converts one page pdf documents that contain tables into csv files. Due to tables in pdf being not aligned horizontally and vertically, tabula has a problem in parsing a table with complete accuracy. Therefore some data wrangling is necessary. I have successfully parsed important tables except for "Table A1. 2014 CIRP Freshman Survey National Norms Sample and Population" on page 51 which comes out of tabula conversion very badly formatted. In my opinion, this table can't be parsed by this method and probably requires manual copy-paste wrangling.

I published a script in git repository https://github.com/Branko-Dj/the-american-freshman.

### zelima (2018-04-17T04:31:30Z)

@Branko-Dj Great work! Few comments to improve:

* Did you read about creating tabular Dataset https://datahub.io/docs/data-packages/publish-tabular
  * Eg: I don't see the datapackage.json in the repo.
* README says "script extracts tables on pages 23-46, 67-74 and 78. It requires PyPDF2", but the data seems to  be only for page 28 (in output folder https://github.com/Branko-Dj/the-american-freshman/blob/master/output/page_28.csv)
* README does not have instructions on how to run the script, what exactly should I install and how (Eg you are talking about Java and PYPDF2, also seems Pandas is required)
* README does say nothing about data itself. Eg what data is about, where it is coming from, what it is missing etc... 
* Ideal structure of dataset should look like this:
```
├── archive
│   ├── name-of-original-file.pdf
│   ├── name-of-another-original-file.pdf
│   └── ...
├── data
│   ├── name-of-your-first-resource.csv
│   ├── name-of-your-second-resource.csv
│   └── ...
├── datapackage.json
├── README.md
└── scripts
    ├── Makefile
    └── process.py
```

Note: By the resource, I mean normalized and tidy CSV file

* Also can we avoid installing third party packages as much as possible (let's use them if there really is no other way)
* Also `The American Frashman` probably is not the best name for dataset (nearly says nothing to me)

### Branko-Dj (2018-04-17T18:21:39Z)

@zelima Thank you for your feedback. I uploaded all csv files and a datapackage that I created. A few issues I am fixing at the moment:

1. Creating good instructions about running a script and necessary installations
2. Updating README file to provide better information about the data
3. Trying to figure out a way to simplify running the scripts, and to avoid installing third party packages

**The issue that I ran into**:
* datapackage-py won't parse csv files page_38 - page_43 when creating a datapackage. Because of this I had to use data-cli tool which encountered no problems to create datapackage.json. This seems to be due to some encoding error. 
>UnicodeDecodeError: 'charmap' codec can't decode byte 0x9d in position 344: character maps to \<undefined\>

### zelima (2018-04-18T05:00:50Z)

@Branko-Dj 
1. Good (but don't overthink)
2. Great
3. This is not a must if there's no other way let's keep them. (I would not spent more than 30-60 minutes on that)

re
> datapackage-py won't parse csv files page_38 - page_43 when creating a datapackage. Because of this I had to use data-cli tool which encountered no problems to create datapackage.json. This seems to be due to some encoding error.

Not sure why do you need `datapackage-py` here at all. Can you provide more info?

### Branko-Dj (2018-04-18T06:40:52Z)

>Not sure why do you need datapackage-py here at all. Can you provide more info?

In order to create a datapackage I wanted to use python module datapackage-py as it provides an ability to add description when creating a package. Here's a snippet of code:
```
csvPathList = list(map(lambda x: x.strip(), glob.glob('*.csv')))
csvPathList.sort()
for csvFilePath in csvPathList:
    package.infer(csvFilePath)
```
But it reports an error described above. It simply won't infer pages 38-43. So instead I created the datapackage.json using data-cli and added description afterwards using script modifyDatapackage.py which imports datapackage-py module. This solution works for all pages with no errors but I would like to be able to create a datapackage without the need to resort to data-cli. It seems to me that it would be simpler and a more elegant solution if the datapackage could be created using only one script and not needing to first create it with data-cli and then to use a modification script.

### zelima (2018-04-18T06:57:50Z)

@Branko-Dj you can add description manually if that's taking too much of your time. 

Note: You do not have to script everything (just the part that extracts data from PDF). You can create datapackage.json manually anytime. Those are just tools (datapackage-py, data-cli) that should help you with packaging stuff. If they are not helping you, better to ignore them I think.

### Branko-Dj (2018-04-18T22:14:41Z)

@zelima Ok here are the changes I made:

1. I changed the name of the repository. It is now more informative and it's link is https://github.com/Branko-Dj/cirp-survey-of-freshmen
2. I updated README.md file. I believe it now describes the data appopriately
3. I now have only one script called process.py which extracts data.
4. I changed the number of CSV files from 31 to 3 as I concatenated those CSVs that had the same names of columns. This will make things simpler
5. I also validated the package using data-cli.

I believe that this issue can be closed now.

### zelima (2018-04-19T04:28:53Z)

@Branko-Dj Excellent work! Few more details and we can transfer the ownership under datasets org.

* Think preparation is still missing installation part Eg:
```
pip install pandas
pip install other-third-party-lib
...
```
* Also which version python should I run 3, 2, both are fine?
* can we use \` \` where possible: Eg 
  * "Information obtained from the survey of freshmen about their opinions, politics, race, wealth, social status etc in file `freshmen_survey.csv`"
  * looks better than just "Information obtained from the survey of freshmen about their opinions, politics, race, wealth, social status etc in file freshmen_survey.csv"
* Title `"CRIP Freshmen Survey"` looks better than `"cirp-freshmen-survey"` (in datapackage.json)
* resource names and paths would be better with `-` instead of `_` - `freshmen-survey` instead of `freshmen_survey` https://github.com/Branko-Dj/cirp-survey-of-freshmen/blob/master/datapackage.json#L8

### Branko-Dj (2018-04-19T06:56:28Z)

@zelima  I updated everything. Is it good now? https://github.com/Branko-Dj/cirp-survey-of-freshmen

### Branko-Dj (2018-04-19T13:19:48Z)

FIXED, dataset is available on datahub https://github.com/datasets/cirp-survey-of-freshmen, also updated registry by adding into core-list.csv

### zelima (2018-04-25T05:20:40Z)

@Branko-Dj please include datahub links as well for future. 

Also available on datahub: https://datahub.io/core/cirp-survey-of-freshmen
