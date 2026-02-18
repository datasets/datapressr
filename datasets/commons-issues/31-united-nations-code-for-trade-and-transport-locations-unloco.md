---
number: 31
title: United Nations Code for Trade and Transport Locations (UN/LOCODE)
state: closed
author: rufuspollock
created_at: "2013-09-25T20:14:16Z"
updated_at: "2015-02-18T05:46:40Z"
closed_at: "2015-02-18T05:46:40Z"
labels: ["Priority: ★★★"]
---

# United Nations Code for Trade and Transport Locations (UN/LOCODE)

http://www.unece.org/cefact/locode/service/location.html

## Comments

### rufuspollock (2014-08-03T09:07:02Z)

@jalbertbowden would you be interested in having a go in pulling this together?

### jalbertbowden (2014-08-05T20:13:56Z)

sure.....just the two values? code and country?
i guess .json and .csv?

### rufuspollock (2014-08-06T15:10:53Z)

CSV would be preferred (as per usual tabular data package). I'd expect all the columns in the underlying tables see e.g. http://www.unece.org/fileadmin/DAM/cefact/locode/af.htm

(Note you'll have to do some scraping here as they seem to have one page per country.

### jalbertbowden (2014-08-08T23:34:28Z)

ok.....should i make csv for each? or one big one?
nice speech today ;)

### rufuspollock (2014-08-09T14:52:12Z)

@jalbertbowden let's make one big csv if we can.

### jalbertbowden (2014-08-09T15:08:22Z)

roger that

### jalbertbowden (2014-08-10T19:35:51Z)

something like this? if you scroll all the way down you'll see another country....
https://gist.github.com/jalbertbowden/c4aa8f4b857cd760ff63

how do you feel about adding extra column for url?

### rufuspollock (2014-08-11T11:09:11Z)

looks good. what would url column be for (the source doc)?

### jalbertbowden (2014-08-11T13:20:17Z)

yeah but i dropped it. i'm pretty far along. i'll create the repo today

### rufuspollock (2014-08-11T13:27:10Z)

@jalbertbowden i think no url is fine - it will majorly increase csv size and is probably not stable so would leave out

### jalbertbowden (2014-08-12T01:49:32Z)

yo trying to finish up countries beginning with F, France is 10,000 lines long....
i've been using google spreadsheets, but it has crapped out everytime i try and add it...
i could use jedit, but it and notepad choke on huge files from past experiences....
so what tools would you recommend?
these are all on win7 which is my work station but i have ubuntu on laptop...

### rufuspollock (2014-08-12T09:55:30Z)

do you do any coding - we could do this with code (e.g. python etc)

### jalbertbowden (2014-08-12T14:41:21Z)

yeah. im not the best but i do

### rufuspollock (2014-08-12T15:21:23Z)

Go with whatever is your preferred scripting language :-)

### jalbertbowden (2014-08-12T16:11:21Z)

uh....i suck at all of them :)
reading https://docs.python.org/2/library/csv.html and http://www.pythonforbeginners.com/files/reading-and-writing-files-in-python

### sanh2o (2015-01-21T02:08:37Z)

Is this still open ? I can have a go at this .

### rufuspollock (2015-01-21T05:42:56Z)

@sanh2o this is indeed still open - please jump in (I believe @jalbertbowden has not had a chance to progress any further here).

### sxren (2015-01-22T06:31:36Z)

@sanh2o Just in case you missed it, there is also a CSV download for this dataset at http://www.unece.org/cefact/codesfortrade/codes_index.html.

### sanh2o (2015-01-22T17:04:28Z)

@sxren, Good find. I am at the halfway stage scraping this, nonetheless good exercise for myself. I will see about how to package this csv.

### jalbertbowden (2015-01-22T21:49:14Z)

guys....no excuses for being so behind, but my sincerest apologies....@sanh2o, are you good or do you want me to clean up my mess?

### sanh2o (2015-01-23T01:20:06Z)

I have created the data package in a folder with two csv files and one index file , for some reason i was unable to add license info in the json creator. It is good to go.

### rufuspollock (2015-01-24T18:26:53Z)

@sanh2o can you link your work and also can you link the validator and "preview" outputs with your data package from http://data.okfn.org/tools/validate and http://data.okfn.org/tools/view

@jalbertbowden can you review this once @sanh2o submits the links?

### jalbertbowden (2015-01-25T01:36:34Z)

sure thing

### rufuspollock (2015-02-08T13:06:56Z)

@sanh2o can you drop us the link of the data package you have prepped?

### sanh2o (2015-02-08T23:57:50Z)

Sorry for the delay.

https://github.com/sanh2o/UNLOCODE

The file and two index files are located here. One of the files contains description of columns which can be converted to json if needed. JSON creator not working for this csv file.

### sxren (2015-02-09T00:39:32Z)

@rgrp how does this relate to/differ from https://github.com/datasets/un-locode ?

### jalbertbowden (2015-02-09T00:52:39Z)

i'll take a gander here in a bit. thanks!

### rufuspollock (2015-02-09T08:45:56Z)

@sxren good question. I did not realize we already that much done. @sxren can you check out this vs @sanh2o and resolve and then we can close this item out.

### sxren (2015-02-09T10:35:56Z)

@sanh2o thank you very much for your work on this dataset. please hold off on doing any additional work. @jalbertbowden, please move on to the next item in your work queue. thank you.

### sxren (2015-02-09T11:37:58Z)

@sanh2o ok. i looked at https://github.com/datasets/un-locode. when that repo was committed last august, a link never made it into this issue. @rgrp as a preventative measure, i suggest creating a stub repo for each new issue before anyone begins work on it. even if it's it's an empty repo. what do you think?

back to @sanh2o: you have a description of the data source from the UN in your README.md. that would be a good addition to https://github.com/datasets/un-locode.

would you be up for:
- forking https://github.com/datasets/un-locode
- adding the paragraph that begins `The "United Nations Code for Trade and Transport Locations" is ...` to the `Data` section of the README.md
- making a pull request with your addition to the README.md

thank you very much, and i'm very sorry for not catching this the other day.

### sanh2o (2015-02-10T15:24:54Z)

@sxren , i will make the necessary changes

### sanh2o (2015-02-17T16:40:36Z)

@sxren, i have made the necessary changes.

### sxren (2015-02-18T05:46:39Z)

@sanh2o the readme was already updated. let's leave it as it is for now. closing this issue.
