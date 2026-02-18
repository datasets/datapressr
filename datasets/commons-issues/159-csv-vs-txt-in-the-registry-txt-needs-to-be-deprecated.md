---
number: 159
title: Csv vs txt in the registry. txt needs to be deprecated
state: closed
author: pdehaye
created_at: "2016-01-21T22:09:35Z"
updated_at: "2017-09-16T21:09:35Z"
closed_at: "2017-09-16T21:09:35Z"
labels: []
---

# Csv vs txt in the registry. txt needs to be deprecated

Question to @rgrp: when including a new dataset in core, I need to add it to core-list.txt, and apparently do something else. You mention a few times in the issues that it needs to be added to data.okfn.org too. I couldn't find where? Is this not automated? If not, I will go back and make sure both files are in sync.

## Comments

### pdehaye (2016-01-21T23:10:30Z)

Flaggin in @femtotrader as they might have some part of the answer: I see you changed the registry a while ago, and turned it into a datapackage. 
However it is not clear to me how the `core-list.txt` and the `core-list.csv` are meant to be kept in sync, or how it interacts with the automated scraping. I have been managing curator for a few weeks and have exclusively updated `core-list.txt` whenever I added a new dataset. This might need some fixing. Can you explain things informally here and then I ll repair my mistakes? Thanks

### rufuspollock (2016-01-26T12:28:16Z)

@pdehaye great question. We basically need to deprecate the txt and move to the csv. We need to check the code in data.okfn.org is updated for this e.g. https://github.com/okfn/data.okfn.org/blob/master/lib/config.js and consuming code in lib/model.js.

In terms of it going live. Once core-list is updated we just need to visit `http://data.okfn.org/admin/reload` to get site to reindex the package list.

### cmsdroff (2016-01-26T14:48:22Z)

Just a thought on this, could a phing script watch out for change on GitHub and run the refresh automatically?  We use team city to monitor our hit hub repos and 'on change' they run an update script.  Just a suggestion?

### tfmorris (2016-01-26T15:39:36Z)

WTF? OpenData is subject to some secret set of conditions from a "warrant house"?

### rufuspollock (2016-01-31T12:59:30Z)

@tfmorris sorry i don't get the context for your comment in this thread? Where's the reference for the "warrant house" that you mention?

### cmsdroff (2016-01-31T16:23:21Z)

@rgrp @tfmorris no need to follow up, I replied by email and our server adds a footer with company terms etc, logged in and cleaned up thread when I had access from desktop to avoid further upset

### femtotrader (2016-02-26T10:54:12Z)

see https://github.com/datasets/registry/issues/112
and https://github.com/datasets/registry/pull/115

my opinion is that data.okfn.org site should use a JavaScript DataPackage client
