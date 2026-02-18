---
number: 83
title: Top level domain names
state: closed
author: Ebnalblad
created_at: "2015-04-13T20:03:26Z"
updated_at: "2015-05-07T22:22:18Z"
closed_at: "2015-05-07T22:22:18Z"
labels: []
---

# Top level domain names

The data is available on : 
http://www.iana.org/domains/root/db
The database will have country code and generic.
Let know if you interested, so i can make the package.

## Comments

### rufuspollock (2015-04-13T20:09:23Z)

@Ebnalblad this seems great. Please dive in and start making a package - instructions at http://data.okfn.org/doc/core-data-curators

### Ebnalblad (2015-04-14T18:42:32Z)

I have packaged the database, let me know if there is something I need to change or in case you have any comments @sxren 
link :
https://github.com/Ebnalblad/top-level-domain-names

### Yannael (2015-04-19T07:09:17Z)

@Ebnalblad 
Very nice.
What kind of scripts have you used to retrieve the data, would it be possible to add this info to the repository?
See for example http://data.okfn.org/data/core/bond-yields-us-10y, with the section Preparation (and more info here http://data.okfn.org/doc/publish-faq about the 'ideal' README).
@sxren @rgrp

### rufuspollock (2015-04-19T08:38:28Z)

@Yannael great suggestion. At the very least a short "Preparation" section is useful. Note we have an FAQ which covers some of this in more detail: http://data.okfn.org/doc/publish-faq (we can add this to http://data.okfn.org/doc/core-data-curators)

### Ebnalblad (2015-04-20T15:35:37Z)

@Yannael I did not use any script i just copied the data from  http://www.iana.org/domains/root/db to Excel file then converted to csv and uploaded it. i do not know if this is going to work with other sites .

### bluechi (2015-04-20T19:22:10Z)

@Ebnalblad @Yannael I think that the idea is for you to mention what you did even if it is a simple matter of copying and pasting the data. 

I also noticed that your README file does not have any formatting. You can at least use ## to make your headings more noticeable.

### Yannael (2015-04-20T19:27:03Z)

@Ebnalblad This is all fine, but for the sake of reproducibility, it is important to specify as much as possible the steps you took to obtain the data. Someone looking at this dataset later may feel writing a script would be more efficient, and contribute this way.

So the best is to mention in the 'Preparation' section that data were manually copied and pasted, as well as any useful information you can add to this.

### Ebnalblad (2015-04-20T19:48:40Z)

@Yannael @bluechi  Done .

### Yannael (2015-04-21T18:03:12Z)

@Ebnalblad @bluechi @rgrp  Ok, looks good to me

### Yannael (2015-04-21T18:14:37Z)

@Ebnalblad NB: It would be good to add the 'sources' field in the dapackage.json

http://dataprotocols.org/data-packages/

So the 'source' appears on the viewer
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2FEbnalblad%2Ftop-level-domain-names

Such as in:
http://data.okfn.org/data/core/language-codes

Additionally you may add the 'contributors' and 'maintainers' fields if you wish to keep responsibility for the package.

### Ebnalblad (2015-04-21T19:13:22Z)

@Yannael i added "source' and maintainers' in the dapackage.json

### rufuspollock (2015-04-26T18:18:45Z)

@Yannael are you happy to review. It would be great to get this in.

### Yannael (2015-04-28T05:04:59Z)

@rgrp @Ebnalblad 
A couple more details:
- Can you adapt the README file to follow the guidelines at http://data.okfn.org/doc/publish-faq (Title should be removed, sections should start with level 2 heading (e.g., ##Data))
- Can you fix indentation in https://github.com/Ebnalblad/top-level-domain-names/blob/master/datapackage.json ("maintainers")

Once ready, can you drop in the links to the validation and view in here as comments as per http://data.okfn.org/doc/core-data-curators#3-quality-assurance  ?

Thanks!

### Ebnalblad (2015-05-04T20:45:43Z)

@Yannael what do you think now ?

### Yannael (2015-05-05T05:59:15Z)

@Ebnalblad  Nice!

It would be good to fix indentation in https://github.com/Ebnalblad/top-level-domain-names/blob/master/datapackage.json (so square and curly brackets are properly aligned). See for example http://data.okfn.org/data/core/co2-fossil-global/datapackage.json

Once ready, can you initiate a transfer request to github.com/datasets so we can add it to the core repository?

@rgrp Does @Ebnalblad need to be member of the datasets repository to do this request?

Thanks!

### rufuspollock (2015-05-05T09:09:22Z)

@Yannael - yes i think @Ebnalblad needs to be a member. Maybe better method is he makes you an admin of his repo and you then do the transfer.

### Ebnalblad (2015-05-05T18:11:08Z)

@Yannael i tried to fix json file and make "square and curly brackets are properly aligned"
@rgrp  do you mean transferring my repo to him, because i do not have organization account.
if it is not, then how i can make him admin ?

### Yannael (2015-05-05T23:03:36Z)

@rgrp @Ebnalblad Thanks. Yes, the easiest is that you transfer the repository to me (in settings), and I will then transfer it to the datasets repo.

### Ebnalblad (2015-05-07T19:56:54Z)

@Yannael done.

### Yannael (2015-05-07T20:49:53Z)

@Ebnalblad @rgrp 
So I moved it to the core repository, http://data.okfn.org/data/core/top-level-domain-names
Sorry I was a bit fussy about the 'alignment' in the JSON, we are trying to set some guidelines for 'well structured' data packages, especially in the core repository
Great job!

### rufuspollock (2015-05-07T22:22:10Z)

w00t!. Well done everyone and esp @Ebnalblad for his first core data package.

### rufuspollock (2015-05-07T22:22:18Z)

FIXED.
