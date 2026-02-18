---
number: 26
title: Airport Codes
state: closed
author: rufuspollock
created_at: "2013-08-11T16:10:28Z"
updated_at: "2015-05-30T07:09:08Z"
closed_at: "2015-05-30T07:09:08Z"
labels: ["Type: Reference", "Priority: ★★★"]
---

# Airport Codes

Does this merit being included as a reference dataset?

## Comments

### rossjones (2013-08-11T17:44:03Z)

Yes.

### sanh2o (2015-01-21T01:36:54Z)

A huge list exists on homepage of http://www.airportcodes.org/ but not sure if complete. Many such sites exist but most make you search for specific ones or lists are paginated. I cannot find an 'authentic' source for this.

### rufuspollock (2015-01-21T05:47:46Z)

@sanh2o great digging. Also worth looking at the list here http://datahub.io/dataset?q=airport as this contains some info on some of the main airport [open data](http://okfn.org/opendata/) options. I am happy for us to scrape / get a dump from another source (even if not the "horse's mouth") but would be good to go for open if we can.

I'd also vote for this as a simple high-priority one to do.

@sxren what do you reckon?

### sxren (2015-01-21T14:29:24Z)

@sanh2o @rgrp in addition to datahub, dbpedia has 8,000+ airport codes.[1](http://getthedata.org/questions/137/where-can-i-get-a-list-of-all-airports-codes-names-locations/) is wikipedia's license too restrictive? a sparql query + csv download would be a fast start. their csv downloads need a little cleaning. what fields would be good to start with—i.e., anything in addition to airport name and code? or what's an imagined use case?

### sxren (2015-01-21T14:39:29Z)

airports-stub.csv https://gist.github.com/sxren/a30da7c9fb16705232cd

### sxren (2015-01-21T15:15:22Z)

http://ourairports.com/data/ has ~45,000 rows of airports. public domain. csv. (via http://datahub.io/dataset/ourairports)

### sxren (2015-01-22T06:19:48Z)

It seems as though the (Major) Cities of the World dataset https://github.com/datasets/registry/issues/47, when complete, serve as a good starting point for this (airport code) dataset. Or how comprehensive should this be?

### sxren (2015-01-22T06:23:31Z)

Also, this dataset overlaps with https://github.com/datasets/registry/issues/31. There is an IATA column on, for example, http://www.unece.org/fileadmin/DAM/cefact/locode/af.htm.

### sanh2o (2015-01-22T17:06:21Z)

@sxren  Yes , it does overlap. Interesting but i think given their individual importance , we can have two separate packaged datasets

### rufuspollock (2015-01-25T13:52:11Z)

Just to clarify: who would like to own this data package?

### sxren (2015-01-25T15:22:39Z)

@sanh2o you're welcome to own this data package :)

### sanh2o (2015-01-26T14:10:55Z)

Ok , not a problem from my side. I can own and maintain this one.

### sanh2o (2015-02-02T04:18:03Z)

Should get this ready by tomorrow evening CST

### sanh2o (2015-02-03T02:03:21Z)

This is the first data package i have published on my repository. Critiques welcome. I have used the data suggested by @sxren with 45000 codes. The site license says it is public domain but does not specify a particular license. Should someone else check this before it is pushed to Core ?

https://github.com/sanh2o/Airportcodes

### rufuspollock (2015-02-03T10:13:23Z)

@sxren can you QA and check and then commence (if all good) moving this to github.com/datasets and adding to registry :-)

### sxren (2015-02-04T03:46:13Z)

@rgrp ok.

@sanh2o awesome! congrats! :)

using https://github.com/datasets/finance-vix as a reference:
1. README.md
- how would you feel about adding data, preparation, and license headers and content to your readme?
- for preparation, you could outline your process. then, if someone wanted to write a script to automate it, they'd have your process to guide them.
- for the licensing:

> This data is made available under the Public Domain Dedication and License v1.0 whose full text can be found at: http://www.opendatacommons.org/licenses/pddl/1.0/ - See more at: http://opendatacommons.org/licenses/pddl/#sthash.8tZljHxk.dpuf
1. airports.csv
   - please add a folder named data and move airports.csv into the data folder
   - what do you think of renaming this file airport-codes.csv?
   - are all the fields (columns) necessary for an airport codes dataset? what fields would you suggest dropping, if any?
2. airports.json
   - first, please rename airports.json to datapackage.json
   - how could it be made clearer that file's name should be datapackage.json?
   - have a look at the datapackage.json file at https://github.com/datasets/finance-vix/blob/master/datapackage.json and then have a go at getting your datapackage.json to pass [validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsanh2o%2FAirportcodes%2Fmaster%2Fdatapackage.json)

anything unclear?

### bluechi (2015-02-07T13:14:41Z)

@sanh2o tried simplifying your file a couple of days ago at the open data maker night, I removed all airports except the major ones and removed all the details except the name, iata code, and country code. Updated the JSON file accordingly.

### sxren (2015-02-07T22:27:45Z)

link to repo with cleaned file in previous comment for reference https://github.com/bluechi/Airportcodes

### sanh2o (2015-02-08T00:48:37Z)

@bluechi , @sxren , thanks for cleaning and updating the file, have a better understanding on the requirements now, @sxren , did you already move the cleaned file to core if updated or is something pending still ?

### sxren (2015-02-08T01:04:13Z)

@sanh2o see my comment—four comments up.

### rufuspollock (2015-02-08T11:44:17Z)

@sanh2o and @sxren re @bluechi commit you may want to check that is what you want - i imagine you want _all_ (registered) airports. Of course, you may also want a separate data file for "major" airports (perhaps international only or something).

### sanh2o (2015-02-08T23:59:46Z)

@sxren, i am working on expanding the README

### sxren (2015-02-15T14:27:06Z)

@sanh2o thanks for all your work on this, so far. is there anything i can do to help you move forward?

### sanh2o (2015-02-17T15:54:45Z)

@sxren, Sorry for the delay, i followed your instructions, updated README, repository structure and validated datapackage.json by comparing with the standard OKFN example you provided.

### sxren (2015-02-18T05:39:38Z)

@sanh2o awesome!

in your readme:
- [ ] add `##` before each second level header. for example, change `Data` to `## Data`.
- [ ] add square brackets around each link title and remove the space between the title and the link. for example, change `IATA (http://en.wikipedia.org/wiki/International_Air_Transport_Association_airport_code)` to `[IATA](http://en.wikipedia.org/wiki/International_Air_Transport_Association_airport_code)`.
- [ ] finalize your readme

in your datapackage.json:
-  [ ] change the `name` in the datapackage.json from `airport codes` to `airport-codes`.

in your project:
- [ ] change the name of your repo to `airport-codes`

getting close! thanks for persevering!

### sanh2o (2015-02-18T23:27:26Z)

Done !

### sxren (2015-02-19T00:32:31Z)

@sanh2o awesome! thank you! what happened to your list of airports?

### sanh2o (2015-02-22T02:04:31Z)

@sxren , not sure what you are referring to ? an index file ?

### sxren (2015-02-23T06:19:48Z)

@sanh2o the full-list csv has been replaced with a major airports list. would you be able to add the full list back and clean it so it has the same three columns as the major airports list currently in the repo? thank you.

### sanh2o (2015-02-25T17:49:26Z)

@sxren, thanks for noticing it, i merged a pull request and did not notice the change. I have the full list back along with reference file, updated readme and datapackage. Your guidance is much appreciated. I will ensure i prepare the next data repository with the best practices.

For the datapackage.json i have added all the attribute types as 'string', should this be changed for numeric types ?

### sxren (2015-02-26T07:39:35Z)

@sanh2o learning is fun. :) i'm learning, too.

data directory
- [ ] remove countries.csv
- [ ] remove regions.csv

airport-codes.csv
would you be up for cleaning this file? for example, removing some of the columns?

datapackage.json
- [ ] fix missing comma on line 88

if the id field is kept, it should probably be an integer http://dataprotocols.org/json-table-schema/#field-types it looks like an id field from a database dump. maybe not so useful for people working with the data. what do you think?

### sxren (2015-03-03T02:29:25Z)

@sanh2o any questions?

### sanh2o (2015-03-05T21:19:11Z)

Oh, i completed it. Should it be pushed to a different directory now. Made the recommended changes, but kept all the columns as i thought most of them were necessary. Felt the same about the other two support files, but we can ignore that for now.

### sxren (2015-03-05T23:29:26Z)

@sanh2o great! thanks for all your work on this. the datapackage.json does not validate. the format section of the readme should be updated. the csv file should be cleaned—for example, the id column should be removed. if you don't want to continue working on this, transfer the repository to me and i'll take it from here. if you do want to continue working on this, i'm happy to provide further guidance. again, thank you very much.

### sanh2o (2015-03-06T21:31:44Z)

So i have removed some of the columns that may seem unnecessary but given that this is airport data , a lot of other information is necessary (location, other codes, elevation , Geog indicators etc.). I am not sure why the datapackage.json does not validate (HTTP Error code 404), i have used the tool OKFN provides and saw that even the two examples (finance and s&p) datasets' datapackage.json is not validating and giving the same error.

### sxren (2015-03-06T22:44:36Z)

@sanh2o share a link that is giving you a 404.

### sxren (2015-03-15T22:09:28Z)

@sanh2o here's an example link to the finance-vix dataset validation page http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdatasets%2Ffinance-vix%2Fmaster%2Fdatapackage.json

does that help?

### sanh2o (2015-03-17T03:34:09Z)

I am using the direct link : https://github.com/sanh2o/airport-codes/blob/master/datapackage.json
After using the raw link as you mentioned i got the error 'invalid', string does not match the pattern. Sorry for the delay , i will ensure this package is done with this weekend.

### sanh2o (2015-04-03T16:23:07Z)

I have been away from a laptop for a while. I have tried to get this working with different combinations of type names but always get the same error.

[SCHEMA] String does not match pattern: ^([a-z0-9._-])+$

I think it is better i work on something afresh as i am not sure what is happening here. Feel free to fork and correct it if you want to. Thank you for your patience.

### rufuspollock (2015-04-04T12:49:06Z)

@sanh2o the answer there is simple - the `name` value in datapackage.json can't have spaces in it - just change "airport codes" to "airport-codes" and it should work.

### rufuspollock (2015-04-09T20:42:09Z)

@sanh2o how are you doing here? it would be great to finish and get this up :-)

### sanh2o (2015-04-12T16:22:59Z)

@rgrp Damn, thats a shame that i could not find it. Working now , ready to move ahead. I will ensure that i work productively for other datasets. Sorry was stuck on this one for so long.

### sanh2o (2015-04-14T20:53:26Z)

Validation:http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsanh2o%2Fairport-codes%2Fmaster%2Fdatapackage.json

View: https://raw.githubusercontent.com/sanh2o/airport-codes/master/data/airport-codes.csv

### sanh2o (2015-04-21T15:06:54Z)

@rgrp , Do you think this one is ready to go. It validates, should someone have another look at it before being incorporated ?

### rufuspollock (2015-04-21T21:06:55Z)

@sanh2o looks really good. Let's get this into core.

Viewer link is: http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsanh2o%2Fairport-codes%2Fmaster%2Fdatapackage.json

@sanh2o can you please initiate the transfer as per http://data.okfn.org/doc/core-data-curators#4-publishing

@yannael are you up for doing the official publishing as core as per http://data.okfn.org/doc/core-data-curators#4-publishing

### rufuspollock (2015-04-23T22:11:07Z)

@sanh2o how are you doing on the transfer - let us know if any problems.

### Yannael (2015-04-25T17:32:05Z)

@rgrp ok for learning here, I am not sure to understand what I should do exactly. 
Also, what is the difference between catalog and core list? 
Thanks

### sanh2o (2015-04-25T17:35:19Z)

@rgrp , I am unable to transfer to the organization, i think i tried the user request. Will figure out and do it in a few mins.

### rufuspollock (2015-04-26T09:47:15Z)

@Yannael difference between catalog and core list is catalog is all data packages we know about whilst core list is just those data package that are "core" data packages. I can walk you through what you need to do here and you can also find me on #okfn channel on freenode.

@sanh2o ok, np. Let us know how it goes. We'll definitely find a way to work this.

### sanh2o (2015-04-26T20:45:56Z)

@rgrp I have read through Github documentation and it seems that i need to have admin access to the organization ( github.com/datasets/  ?) to perform the transfer. I could not find the appropriate command or procedure to initiate a request which may be accepted by someone with admin rights within the organization. Neither OKFN's nor Github's official documentation were sufficient.

### rufuspollock (2015-04-26T21:36:14Z)

@sanh2o ok i've made you an admin of the datasets orgs temporarily. Please transfer over the repo. Then I can make you an admin of just that repo. Also if you could add pull requests for adding to the catalog and core list as per http://data.okfn.org/doc/core-data-curators#4-publishing that would be great.

### sanh2o (2015-04-27T03:32:32Z)

i am sorry ,still no success. It is asking me for a username only

### rufuspollock (2015-04-27T06:19:00Z)

@sanh2o just put datasets as the username :-) (that's how it works). If that still does not work just add me as an owner on your repo and I'll move it over.

### sanh2o (2015-04-27T18:00:06Z)

@rgrp , transferred to you. I think i was using the full URL instead of just the username (i.e. 'datasets') in previous instance so was stuck. Added to the lists as well.

### Yannael (2015-04-28T06:14:50Z)

@rgrp Ok I joined #okfn on freenode

### rufuspollock (2015-04-28T07:10:29Z)

@sanh2o i don't think the repo is transferred - it is still at https://github.com/sanh2o/airport-codes - do you want to add me or @Yannael as owners on that repo and we can transfer for you.

### sanh2o (2015-04-28T14:59:59Z)

@rgrp added you as collaborator.

I get the following message under settings (for the previous step): 'This repository is being transferred to @rgrp'

### Yannael (2015-04-29T04:58:23Z)

@sanh2o @rgrp 

I don't think I have the rights to transfer the repository. 

The sequence of steps to transfer it is:
- Go to the settings of the repository
- Select 'Transfer Ownership'
- In 'Type the name of the repository to confirm' -> Enter 'airport-codes', and in 'New owner's GitHub username' -> Enter 'datasets'. Validate the transfer
- Commit

Can you try this and let me know if you have issues?

### sanh2o (2015-04-29T16:03:13Z)

@rgrp  @Yannael  I aborted the previous transfer and succesfully transferred to datasets.

### rufuspollock (2015-04-29T16:04:30Z)

w00t! @Yannael are you happy to do the last stages of the process e.g. the catalog-list etc

### Yannael (2015-04-29T16:37:14Z)

@rgrp @sanh2o dataset added to catalog-list and core-list, and data page reloaded

### sanh2o (2015-04-30T16:00:34Z)

Great, happy that it is done. Will ensure future ones are faster.

### rufuspollock (2015-05-30T07:09:08Z)

FIXED! Well done @sanh2o and @Yannael
